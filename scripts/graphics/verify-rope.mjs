import assert from 'node:assert/strict';
import { MeshLineGeometry } from 'meshline';
import { Vector3 } from 'three';
import { updateLanyardGeometry } from '../../src/utils/lanyardGeometry.js';

const points = Array.from({ length: 33 }, (_, index) => new Vector3(index, 0, 0));
const vectorInput = new MeshLineGeometry();
const capturedErrors = [];
const originalError = console.error;
console.error = message => capturedErrors.push(String(message));
try {
  vectorInput.setPoints(points);
} finally {
  console.error = originalError;
}
const interoperabilityProbe = {
  input: 'ES-module Three.Vector3[] passed to the installed MeshLine Node entry',
  finite: vectorInput.getAttribute('position').array.every(Number.isFinite),
  vertexCount: vectorInput.getAttribute('position').count,
  boundsErrors: capturedErrors.length,
  browserRootCauseConfirmed: false,
};
vectorInput.dispose();

const optimized = new MeshLineGeometry();
const reference = new MeshLineGeometry();
const numeric = new Float32Array(99);
updateLanyardGeometry(optimized, points);
const arrays = Object.fromEntries(Object.entries(optimized.attributes).map(([name, attribute]) => [name, attribute.array]));
const attributes = ['position', 'previous', 'next', 'side', 'width', 'uv', 'counters'];
for (let frame = 0; frame < 500; frame++) {
  points.forEach((point, index) => point.set(Math.sin(frame + index), Math.cos(frame / 10 + index), index / 4));
  if (frame % 2 === 0) points[32].copy(points[0]);
  points.forEach((point, index) => numeric.set([point.x, point.y, point.z], index * 3));
  reference.setPoints(numeric);
  updateLanyardGeometry(optimized, points);
  for (const name of attributes) {
    assert.deepEqual(optimized.getAttribute(name).array, reference.getAttribute(name).array);
    assert.equal(optimized.getAttribute(name).array, arrays[name]);
    assert.ok(optimized.getAttribute(name).array.every(Number.isFinite));
  }
  assert.deepEqual(optimized.index.array, reference.index.array);
  assert.deepEqual(optimized.boundingBox, reference.boundingBox);
  assert.deepEqual(optimized.boundingSphere, reference.boundingSphere);
  assert.ok(Number.isFinite(optimized.boundingSphere.radius));
}
optimized.dispose();
reference.dispose();
console.log(JSON.stringify({ interoperabilityProbe, numericBufferRegression: {
  comparisons: 500, attributes, finite: true, boundsMatch: true, stableArrays: true,
}}, null, 2));
