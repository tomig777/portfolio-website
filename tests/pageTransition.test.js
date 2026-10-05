import test from 'node:test';
import assert from 'node:assert/strict';
import { createPageTransition, runRouteTransition } from '../src/utils/pageTransition.js';

function setup(t) {
  const nodes = new Set();
  const timers = new Map();
  let now = 0;
  let id = 0;
  const previous = { document: globalThis.document, window: globalThis.window };
  const document = {
    body: { appendChild(node) { node.isConnected = true; nodes.add(node); } },
    querySelector(selector) { return [...nodes].find(node => '.' + node.className === selector) || null; },
    createElement() {
      return {
        attributes: {}, isConnected: false,
        setAttribute(name, value) { this.attributes[name] = value; },
        remove() { this.isConnected = false; nodes.delete(this); },
      };
    },
  };
  globalThis.document = document;
  globalThis.window = {
    setTimeout(callback, delay) { timers.set(++id, { at: now + delay, callback }); return id; },
    clearTimeout(handle) { timers.delete(handle); },
  };
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  });
  return {
    nodes, timers,
    advance(time) {
      now = time;
      const due = [...timers.entries()].filter(([, timer]) => timer.at <= now).sort((a, b) => a[1].at - b[1].at);
      for (const [handle, timer] of due) {
        if (!timers.has(handle)) continue;
        timers.delete(handle);
        timer.callback();
      }
    },
  };
}

test('route transitions coalesce rapid navigation and commit the latest destination', t => {
  const env = setup(t);
  let actions = 0;
  assert.equal(runRouteTransition(() => { actions += 100; }), true);
  assert.equal(runRouteTransition(() => actions++), true);
  assert.equal(env.nodes.size, 1);
  assert.equal([...env.nodes][0].attributes['aria-hidden'], 'true');
  env.advance(759);
  assert.equal(actions, 0);
  env.advance(760);
  assert.equal(actions, 1);
  env.advance(1680);
  assert.equal(env.nodes.size, 0);
  assert.equal(env.timers.size, 0);
});

test('navigation after a commit is accepted before the previous curtain finishes', t => {
  const env = setup(t);
  const actions = [];
  const transition = createPageTransition();
  transition.run(() => actions.push('contact'));
  env.advance(760);
  assert.deepEqual(actions, ['contact']);
  assert.equal(transition.run(() => actions.push('about')), true);
  assert.equal(env.nodes.size, 2);
  env.advance(1520);
  assert.deepEqual(actions, ['contact', 'about']);
  env.advance(1680);
  assert.equal(env.nodes.size, 1, 'The older curtain removed the newer transition');
  env.advance(2440);
  assert.equal(env.nodes.size, 0);
  assert.equal(env.timers.size, 0);
});

test('cancel and disposal remove only owned curtains and cancel pending actions', t => {
  const env = setup(t);
  const transition = createPageTransition();
  const other = createPageTransition({ className: 'other-transition' });
  const actions = [];
  transition.run(() => actions.push('cancelled'));
  other.run(() => actions.push('other'));
  transition.cancel();
  assert.equal(env.nodes.size, 1);
  transition.run(() => actions.push('disposed'));
  transition.dispose();
  assert.equal(transition.run(() => actions.push('too-late')), false);
  env.advance(1680);
  assert.deepEqual(actions, ['other']);
  assert.equal(env.nodes.size, 0);
  assert.equal(env.timers.size, 0);
});

test('reduced motion commits immediately without a curtain or a timer', t => {
  const env = setup(t);
  globalThis.window.matchMedia = () => ({ matches: true });
  let actions = 0;
  assert.equal(runRouteTransition(() => actions++), true);
  assert.equal(actions, 1);
  assert.equal(env.nodes.size, 0);
  assert.equal(env.timers.size, 0);
});

test('switching to reduced motion cancels the older pending destination', t => {
  const env = setup(t);
  let reduced = false;
  globalThis.window.matchMedia = () => ({ matches: reduced });
  const transition = createPageTransition();
  const actions = [];
  transition.run(() => actions.push('old'));
  reduced = true;
  transition.run(() => actions.push('current'));
  env.advance(1680);
  assert.deepEqual(actions, ['current']);
  assert.equal(env.nodes.size, 0);
  assert.equal(env.timers.size, 0);
});

test('completed transitions allow subsequent navigation', t => {
  const env = setup(t);
  let actions = 0;
  runRouteTransition(() => actions++);
  env.advance(1680);
  assert.equal(runRouteTransition(() => actions++), true);
  env.advance(3360);
  assert.equal(actions, 2);
});

test('removed transition overlays must not leave a navigation callback behind', t => {
  const env = setup(t);
  let actions = 0;
  runRouteTransition(() => actions++);
  [...env.nodes][0].remove();
  env.advance(1680);
  assert.equal(actions, 0, 'A removed/aborted transition still navigated');
});

test('an aborted transition cannot fire during a subsequent navigation', t => {
  const env = setup(t);
  const actions = [];
  runRouteTransition(() => actions.push('aborted'));
  [...env.nodes][0].remove();
  runRouteTransition(() => actions.push('current'));
  env.advance(1680);
  assert.deepEqual(actions, ['current']);
  assert.equal(env.nodes.size, 0);
  assert.equal(env.timers.size, 0);
});
