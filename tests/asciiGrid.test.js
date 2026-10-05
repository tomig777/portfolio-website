import test from 'node:test';
import assert from 'node:assert/strict';
import { createAsciiGrid } from '../src/utils/asciiGrid.js';

for (const [width, height] of [[320, 568], [390, 844], [844, 390], [768, 1024], [1440, 900], [3840, 2160]]) {
  test(`cached ASCII sampling matches the former loop at ${width}x${height}`, () => {
    const grid = createAsciiGrid(width, height, 128);
    for (let row = 0; row < grid.rows; row++) {
      assert.equal(grid.y[row], row * grid.cellH);
      for (let column = 0; column < grid.cols; column++) {
        const fx = Math.floor((column / grid.cols) * 126 + 1);
        const fy = Math.floor((row / grid.rows) * 126 + 1);
        assert.equal(grid.indices[row * grid.cols + column], fx + fy * 128);
        assert.equal(grid.x[column], column * grid.cellW);
      }
    }
  });
}
