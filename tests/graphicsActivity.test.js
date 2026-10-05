import test from 'node:test';
import assert from 'node:assert/strict';
import { isGraphicsVisible, observeGraphicsActivity } from '../src/utils/graphicsActivity.js';

function environment() {
  const frames = new Map();
  let frameId = 0;
  const observers = [];
  const mutations = [];
  const win = new EventTarget();
  Object.assign(win, {
    innerWidth: 390, innerHeight: 844,
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
    getComputedStyle(node) { return { display: 'block', visibility: 'visible', opacity: '1', ...node.style }; },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(node) { this.node = node; }
      disconnect() { this.disconnected = true; }
    },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.nodes = []; mutations.push(this); }
      observe(node) { this.nodes.push(node); }
      disconnect() { this.disconnected = true; }
    },
  });
  const doc = new EventTarget();
  Object.assign(doc, { defaultView: win, visibilityState: 'visible' });
  const parent = { style: {}, parentElement: null };
  const element = {
    ownerDocument: doc, dataset: {}, style: {}, isConnected: true, parentElement: parent,
    rect: { left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844 },
    getBoundingClientRect() { return this.rect; },
  };
  return {
    win, doc, element, parent, frames, observers, mutations,
    flush() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); },
  };
}

test('graphics visibility includes opacity/display of ancestors and viewport bounds', () => {
  const { element, parent, win } = environment();
  assert.equal(isGraphicsVisible(element, win), true);
  parent.style.opacity = '0';
  assert.equal(isGraphicsVisible(element, win), false);
  parent.style = { display: 'none' };
  assert.equal(isGraphicsVisible(element, win), false);
  parent.style = { visibility: 'hidden' };
  assert.equal(isGraphicsVisible(element, win), false);
  parent.style = {};
  element.rect.top = 844;
  assert.equal(isGraphicsVisible(element, win), false);
  element.rect.top = 0;
  element.rect.width = 0;
  assert.equal(isGraphicsVisible(element, win), false);
});

test('activity coalesces mutations, pauses without polling, and retains one subscription', () => {
  const env = environment();
  const changes = [];
  const controller = observeGraphicsActivity(env.element, next => changes.push(next));
  assert.deepEqual(changes, [true]);
  assert.equal(env.frames.size, 0);
  assert.equal(env.mutations[0].nodes.length, 2);
  env.parent.style.opacity = '0';
  for (let index = 0; index < 20; index++) env.mutations[0].callback();
  assert.equal(env.frames.size, 1);
  env.flush();
  assert.deepEqual(changes, [true, false]);
  assert.equal(env.element.dataset.graphicsState, 'paused');
  assert.equal(env.frames.size, 0);
  env.parent.style.opacity = '0.01';
  env.mutations[0].callback();
  env.flush();
  assert.deepEqual(changes, [true, false, true]);
  controller.dispose();
  assert.equal(env.observers[0].disconnected, true);
  assert.equal(env.mutations[0].disconnected, true);
  assert.equal(env.element.dataset.graphicsState, undefined);
});

test('intersection, explicit pause and hidden tabs all suspend activity and resume safely', () => {
  const env = environment();
  const changes = [];
  const controller = observeGraphicsActivity(env.element, next => changes.push(next), { active: false });
  assert.deepEqual(changes, [false]);
  controller.setActive(true);
  env.observers[0].callback([{ isIntersecting: false }]);
  env.flush();
  assert.deepEqual(changes, [false, true, false]);
  env.observers[0].callback([{ isIntersecting: true }]);
  env.doc.visibilityState = 'hidden';
  env.doc.dispatchEvent(new Event('visibilitychange'));
  env.flush();
  assert.equal(changes.at(-1), false);
  env.doc.visibilityState = 'visible';
  env.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(changes.at(-1), true);
  controller.dispose();
  env.doc.dispatchEvent(new Event('scroll'));
  env.win.dispatchEvent(new Event('resize'));
  env.doc.dispatchEvent(new Event('visibilitychange'));
  controller.setActive(true);
  assert.equal(env.frames.size, 0);
});

test('disposing with pending work cancels it and a detached canvas stays paused', () => {
  const env = environment();
  env.element.isConnected = false;
  const changes = [];
  const controller = observeGraphicsActivity(env.element, next => changes.push(next));
  assert.deepEqual(changes, [false]);
  env.mutations[0].callback();
  controller.dispose();
  env.flush();
  assert.deepEqual(changes, [false]);
});
