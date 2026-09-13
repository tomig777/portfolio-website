// Suspend callbacks completely in background tabs, retaining the rendered frame.
// Keep the remainder when limiting FPS so 60 Hz displays don't accidentally
// halve a 60 FPS animation because a frame arrived a fraction early.
export function createAnimationLoop(render, { maxFps = 60, active = true } = {}) {
  let frame = null;
  let enabled = active;
  let disposed = false;
  let lastRender = null;
  const interval = 1000 / Math.max(1, maxFps);

  function tick(now) {
    frame = null;
    if (disposed || !enabled || document.visibilityState === 'hidden') return;
    const elapsed = lastRender === null ? interval : now - lastRender;
    if (elapsed >= interval - 0.5) {
      lastRender = now - (elapsed >= interval ? elapsed % interval : 0);
      render(now);
    }
    if (!disposed && enabled) frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastRender = null;
    if (!disposed && enabled && document.visibilityState !== 'hidden') {
      frame = requestAnimationFrame(tick);
    }
  }

  document.addEventListener('visibilitychange', sync);
  sync();
  return {
    setActive(value) {
      if (enabled === value) return;
      enabled = value;
      sync();
    },
    dispose() {
      disposed = true;
      sync();
      document.removeEventListener('visibilitychange', sync);
    }
  };
}
