export const isFinitePoint = point => point != null
  && Number.isFinite(Math.fround(point.x)) && Number.isFinite(Math.fround(point.y)) && Number.isFinite(Math.fround(point.z));

export function lanyardLerpAlpha(delta, distance, minSpeed = 0, maxSpeed = 50) {
  if (!Number.isFinite(delta) || delta <= 0) return 0;
  const clampedDistance = Number.isFinite(distance) ? Math.max(0.1, Math.min(1, distance)) : 1;
  return Math.max(0, Math.min(1, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))));
}

// MeshLine's setPoints rebuilds all buffers, even UVs/indices, on every call.
// With a fixed sample count, only these three position attributes can change.
export function updateLanyardGeometry(geometry, points) {
  if (points.length < 2 || !points.every(isFinitePoint)) return false;
  const count = points.length;
  let position = geometry.getAttribute('position');
  if (!position || position.count !== count * 2) {
    // A numeric buffer also avoids MeshLine's cross-module Vector3 instanceof
    // check, which can otherwise put object values into a Float32Array.
    const numericPoints = new Float32Array(count * 3);
    for (let index = 0; index < count; index++) {
      numericPoints[index * 3] = points[index].x;
      numericPoints[index * 3 + 1] = points[index].y;
      numericPoints[index * 3 + 2] = points[index].z;
    }
    geometry.setPoints(numericPoints);
    return true;
  }
  const previous = geometry.getAttribute('previous');
  const next = geometry.getAttribute('next');
  let changed = false;
  for (let index = 0; index < count; index++) {
    const point = points[index];
    const offset = index * 6;
    if (position.array[offset] !== Math.fround(point.x)
      || position.array[offset + 1] !== Math.fround(point.y)
      || position.array[offset + 2] !== Math.fround(point.z)) {
      changed = true;
      break;
    }
  }
  if (!changed) return false;
  const first = points[0];
  const last = points[count - 1];
  const closed = Math.fround(first.x) === Math.fround(last.x)
    && Math.fround(first.y) === Math.fround(last.y) && Math.fround(first.z) === Math.fround(last.z);
  for (let index = 0; index < count; index++) {
    const point = points[index];
    const before = index === 0 ? (closed ? points[count - 2] : first) : points[index - 1];
    const after = index === count - 1 ? (closed ? points[1] : last) : points[index + 1];
    const offset = index * 6;
    for (let duplicate = 0; duplicate < 2; duplicate++) {
      const start = offset + duplicate * 3;
      position.array[start] = point.x;
      position.array[start + 1] = point.y;
      position.array[start + 2] = point.z;
      previous.array[start] = before.x;
      previous.array[start + 1] = before.y;
      previous.array[start + 2] = before.z;
      next.array[start] = after.x;
      next.array[start + 1] = after.y;
      next.array[start + 2] = after.z;
    }
  }
  position.needsUpdate = previous.needsUpdate = next.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return true;
}
