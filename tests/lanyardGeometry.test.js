import test from 'node:test';
import assert from 'node:assert/strict';
import { isFinitePoint, lanyardLerpAlpha, updateLanyardGeometry } from '../src/utils/lanyardGeometry.js';

const point = (x, y = 0, z = 0) => ({ x, y, z });
function geometry(count) {
  const attributes = Object.fromEntries(['position', 'previous', 'next'].map(name => [name, {
    count: count * 2, array: new Float32Array(count * 6), needsUpdate: false,
  }]));
  return {
    attributes, bounds: 0, initializations: 0,
    getAttribute(name) { return attributes[name]; },
    setPoints(points) { this.initializations++; this.initialPoints = points; },
    computeBoundingBox() { this.bounds++; },
    computeBoundingSphere() { this.bounds++; },
  };
}

test('normal lanyard smoothing is unchanged while long/non-finite deltas cannot overshoot', () => {
  assert.equal(lanyardLerpAlpha(1 / 60, 0.5), (1 / 60) * 25);
  for (const delta of [0.5, 60, 3600, Number.MAX_VALUE]) {
    assert.equal(lanyardLerpAlpha(delta, 1), 1);
  }
  for (const delta of [NaN, Infinity, -1, 0]) assert.equal(lanyardLerpAlpha(delta, 1), 0);
  assert.equal(lanyardLerpAlpha(60, NaN), 1);
  let value = 0;
  for (let frame = 0; frame < 10000; frame++) {
    const target = Math.sin(frame);
    value += (target - value) * lanyardLerpAlpha(frame % 5 === 0 ? 3600 : 1 / 60, Math.abs(target - value));
    assert.ok(Number.isFinite(value));
    assert.ok(Math.abs(value) <= 1);
  }
});

test('rope updates reuse arrays and preserve duplicated vertices and open endpoints', () => {
  const rope = geometry(3);
  const points = [point(1, 2, 3), point(4, 5, 6), point(7, 8, 9)];
  const array = rope.attributes.position.array;
  assert.equal(updateLanyardGeometry(rope, points), true);
  assert.deepEqual([...array], [1, 2, 3, 1, 2, 3, 4, 5, 6, 4, 5, 6, 7, 8, 9, 7, 8, 9]);
  assert.deepEqual([...rope.attributes.previous.array], [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 4, 5, 6, 4, 5, 6]);
  assert.deepEqual([...rope.attributes.next.array], [4, 5, 6, 4, 5, 6, 7, 8, 9, 7, 8, 9, 7, 8, 9, 7, 8, 9]);
  assert.equal(updateLanyardGeometry(rope, points), false);
  assert.equal(rope.bounds, 2);
  points[1].x = 0.1;
  assert.equal(updateLanyardGeometry(rope, points), true);
  assert.equal(updateLanyardGeometry(rope, points), false);
  assert.equal(rope.attributes.position.array, array);
  assert.equal(rope.initializations, 0);
});

test('closed ropes wrap endpoints and invalid/overflowing samples never reach Three buffers', () => {
  const rope = geometry(4);
  assert.equal(updateLanyardGeometry(rope, [point(1), point(2), point(3), point(1)]), true);
  assert.equal(rope.attributes.previous.array[0], 3);
  assert.equal(rope.attributes.next.array[18], 2);
  const previous = [...rope.attributes.position.array];
  for (const invalid of [NaN, Infinity, 1e300]) {
    assert.equal(isFinitePoint(point(invalid)), false);
    assert.equal(updateLanyardGeometry(rope, [point(1), point(invalid), point(3), point(1)]), false);
    assert.deepEqual([...rope.attributes.position.array], previous);
  }
});

test('a changed sample count delegates initial allocation to MeshLine', () => {
  const rope = geometry(0);
  assert.equal(updateLanyardGeometry(rope, [point(1), point(2)]), true);
  assert.equal(rope.initializations, 1);
  assert.ok(rope.initialPoints instanceof Float32Array);
  assert.deepEqual([...rope.initialPoints], [1, 0, 0, 2, 0, 0]);
});

test('endpoint closure uses the numeric buffer precision', () => {
  const rope = geometry(4);
  updateLanyardGeometry(rope, [point(1), point(2), point(3), point(1 + 1e-9)]);
  assert.equal(rope.attributes.previous.array[0], 3);
  assert.equal(rope.attributes.next.array[18], 2);
});
