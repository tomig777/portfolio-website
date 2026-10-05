// The screen-to-fluid mapping is fixed until resize; don't recompute it for
// every glyph on every frame. Coordinates match the previous drawing loop.
export function createAsciiGrid(width, height, fluidSize) {
  const fontSize = Math.max(10, Math.min(14, Math.floor(width / 120)));
  const cellW = fontSize * 0.6;
  const cellH = fontSize;
  const cols = Math.floor(width / cellW);
  const rows = Math.floor(height / cellH);
  const indices = new Uint32Array(cols * rows);
  const x = new Float64Array(cols);
  const y = new Float64Array(rows);
  for (let column = 0; column < cols; column++) x[column] = column * cellW;
  for (let row = 0; row < rows; row++) {
    y[row] = row * cellH;
    const fy = Math.floor((row / rows) * (fluidSize - 2) + 1);
    for (let column = 0; column < cols; column++) {
      const fx = Math.floor((column / cols) * (fluidSize - 2) + 1);
      indices[row * cols + column] = fx + fy * fluidSize;
    }
  }
  return { cols, rows, cellW, cellH, fontSize, indices, x, y };
}
