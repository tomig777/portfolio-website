import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextTrackIndex, finiteMediaTime } from '../src/utils/musicPlayback.js';

test('sequential playback wraps in both directions and handles one track', () => {
  assert.equal(getNextTrackIndex(0, 6, 1, false), 1);
  assert.equal(getNextTrackIndex(5, 6, 1, false), 0);
  assert.equal(getNextTrackIndex(0, 6, -1, false), 5);
  assert.equal(getNextTrackIndex(0, 1, 1, true), 0);
});

test('shuffle can select every other track without ever repeating the current song', () => {
  for (let current = 0; current < 6; current++) {
    const selected = Array.from({ length: 5 }, (_, choice) => getNextTrackIndex(current, 6, 1, true, () => (choice + .1) / 5));
    assert.equal(new Set(selected).size, 5);
    assert.ok(selected.every(index => index >= 0 && index < 6 && index !== current));
  }
});

test('unknown or invalid media durations cannot create an infinite progress value', () => {
  assert.equal(finiteMediaTime(Infinity), 0);
  assert.equal(finiteMediaTime(NaN), 0);
  assert.equal(finiteMediaTime(-1), 0);
  assert.equal(finiteMediaTime(184.25), 184.25);
});
