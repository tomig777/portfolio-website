import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnimationLoop } from '../src/utils/animationLoop.js';

function setup(t, initialVisibility = 'visible') {
  const pending = new Map();
  let id = 0;
  const document = new EventTarget();
  document.visibilityState = initialVisibility;
  const listeners = new Set();
  const add = document.addEventListener.bind(document);
  const remove = document.removeEventListener.bind(document);
  document.addEventListener = (type, callback, options) => {
    if (type === 'visibilitychange') listeners.add(callback);
    add(type, callback, options);
  };
  document.removeEventListener = (type, callback, options) => {
    if (type === 'visibilitychange') listeners.delete(callback);
    remove(type, callback, options);
  };
  const originals = Object.fromEntries(['document', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, globalThis[key]]));
  globalThis.document = document;
  globalThis.requestAnimationFrame = callback => { pending.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = handle => pending.delete(handle);
  t.after(() => {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  });
  return {
    pending, listeners,
    frame(now) {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach(callback => callback(now));
    },
    visibility(value) {
      document.visibilityState = value;
      document.dispatchEvent(new Event('visibilitychange'));
    }
  };
}

test('inactive effects schedule no frames and resume exactly once', t => {
  const env = setup(t);
  let renders = 0;
  const loop = createAnimationLoop(() => renders++, { active: false });
  assert.equal(env.pending.size, 0);
  loop.setActive(true);
  loop.setActive(true);
  assert.equal(env.pending.size, 1);
  env.frame(0);
  assert.equal(renders, 1);
  loop.setActive(false);
  assert.equal(env.pending.size, 0);
  loop.dispose();
});

test('hidden tabs cancel work and disposal prevents restarting', t => {
  const env = setup(t);
  const loop = createAnimationLoop(() => {});
  env.visibility('hidden');
  assert.equal(env.pending.size, 0);
  env.visibility('visible');
  assert.equal(env.pending.size, 1);
  loop.dispose();
  env.visibility('hidden');
  env.visibility('visible');
  loop.setActive(true);
  assert.equal(env.pending.size, 0);
});

for (const maxFps of [30, 60]) {
  test(`${maxFps} FPS retains cadence with fractional display timestamps`, t => {
    const env = setup(t);
    let renders = 0;
    const loop = createAnimationLoop(() => renders++, { maxFps });
    for (let i = 0; i < 120; i++) env.frame(i * 16.666);
    assert.ok(Math.abs(renders - maxFps * 2) <= 1, `${renders} frames`);
    loop.dispose();
  });
}

test('a callback can stop its own loop without leaving a queued frame', t => {
  const env = setup(t);
  const loop = createAnimationLoop(() => loop.setActive(false));
  env.frame(0);
  assert.equal(env.pending.size, 0);
  loop.dispose();
});

test('effects created in a hidden tab do not start until it becomes visible', t => {
  const env = setup(t, 'hidden');
  let renders = 0;
  const loop = createAnimationLoop(() => renders++);
  assert.equal(env.pending.size, 0);
  env.visibility('visible');
  env.frame(10000);
  assert.equal(renders, 1);
  loop.dispose();
});

test('repeated visibility events leave one frame and disposal removes the listener', t => {
  const env = setup(t);
  const loop = createAnimationLoop(() => {});
  assert.equal(env.listeners.size, 1);
  for (let index = 0; index < 5; index++) env.visibility('visible');
  assert.equal(env.pending.size, 1);
  loop.dispose();
  loop.dispose();
  assert.equal(env.pending.size, 0);
  assert.equal(env.listeners.size, 0);
});

test('disposing during a render leaves no frame or visibility subscription', t => {
  const env = setup(t);
  const loop = createAnimationLoop(() => loop.dispose());
  env.frame(0);
  assert.equal(env.pending.size, 0);
  assert.equal(env.listeners.size, 0);
});

test('changing the FPS limit preserves one loop and handles desktop/phone resizing', t => {
  const env = setup(t);
  let renders = 0;
  const loop = createAnimationLoop(() => renders++);
  for (let i = 0; i < 60; i++) env.frame(i * 16.666);
  assert.equal(renders, 60);
  loop.setMaxFps(30);
  for (let i = 60; i < 120; i++) env.frame(i * 16.666);
  assert.ok(Math.abs(renders - 90) <= 1);
  assert.equal(env.pending.size, 1);
  loop.setActive(false);
  loop.setMaxFps(60);
  assert.equal(env.pending.size, 0);
  loop.dispose();
});
