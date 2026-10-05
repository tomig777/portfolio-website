import test from 'node:test';
import assert from 'node:assert/strict';
import { createVideoCrossfade } from '../src/utils/videoCrossfade.js';

function setup(t, visibility = 'visible') {
  const originals = Object.fromEntries(['document', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, globalThis[key]]));
  const pending = new Map();
  let id = 0;
  const document = new EventTarget();
  document.visibilityState = visibility;
  globalThis.document = document;
  globalThis.requestAnimationFrame = callback => { pending.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = handle => pending.delete(handle);
  t.after(() => {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  });
  const video = () => ({
    style: {}, paused: true, duration: 10, currentTime: 0, ended: false, plays: 0,
    play() { this.paused = false; this.plays++; return Promise.resolve(); },
    pause() { this.paused = true; }
  });
  return {
    current: video(), next: video(), pending,
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

test('a crossfade starts once and owns only one frame callback', t => {
  const env = setup(t);
  let writes = 0;
  env.next.style = new Proxy({}, { set(target, key, value) { if (key === 'opacity' && value === 1) writes++; target[key] = value; return true; } });
  const dispose = createVideoCrossfade(env.current, env.next, () => {});
  env.frame(0);
  assert.equal(env.next.plays, 0);
  env.current.currentTime = 7;
  for (let i = 1; i <= 60; i++) env.frame(i * 34);
  assert.equal(env.next.plays, 1);
  assert.equal(writes, 1);
  assert.equal(env.pending.size, 1);
  dispose();
});

test('completion fires once and cancels monitoring', t => {
  const env = setup(t);
  let completions = 0;
  const dispose = createVideoCrossfade(env.current, env.next, () => completions++);
  env.current.currentTime = 9.95;
  env.frame(0);
  env.frame(34);
  env.visibility('hidden');
  env.visibility('visible');
  assert.equal(completions, 1);
  assert.equal(env.pending.size, 0);
  dispose();
});

test('hidden crossfades pause both videos and resume without restarting the fade', t => {
  const env = setup(t);
  const dispose = createVideoCrossfade(env.current, env.next, () => {});
  env.current.currentTime = 8;
  env.frame(0);
  env.next.currentTime = 1;
  env.visibility('hidden');
  assert.equal(env.current.paused, true);
  assert.equal(env.next.paused, true);
  assert.equal(env.pending.size, 0);
  env.visibility('visible');
  assert.equal(env.current.paused, false);
  assert.equal(env.next.paused, false);
  assert.equal(env.next.currentTime, 1);
  assert.equal(env.pending.size, 1);
  dispose();
});

test('disposal pauses playback and cannot schedule orphan callbacks', t => {
  const env = setup(t);
  const dispose = createVideoCrossfade(env.current, env.next, () => assert.fail('Disposed loop completed'));
  env.current.currentTime = 8;
  env.frame(0);
  dispose();
  env.visibility('hidden');
  env.visibility('visible');
  env.frame(34);
  assert.equal(env.pending.size, 0);
  assert.equal(env.current.paused, true);
  assert.equal(env.next.paused, true);
});

test('a hidden initial mount waits, resets the next video, and ignores missing metadata', t => {
  const env = setup(t, 'hidden');
  env.next.currentTime = 6;
  env.current.duration = NaN;
  const dispose = createVideoCrossfade(env.current, env.next, () => assert.fail('Missing duration completed'));
  assert.equal(env.current.plays, 0);
  assert.equal(env.next.currentTime, 0);
  assert.equal(env.pending.size, 0);
  env.visibility('visible');
  env.frame(0);
  assert.equal(env.current.plays, 1);
  assert.equal(env.next.plays, 0);
  dispose();
});
