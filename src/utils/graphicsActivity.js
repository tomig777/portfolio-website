// Observe visibility changes instead of polling layout from every render loop.
// Include ancestors: GSAP fades/hides scene wrappers, not just the canvas.
export function isGraphicsVisible(element, win = window) {
  if (!element.isConnected) return false;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;
  if (rect.bottom <= 0 || rect.top >= win.innerHeight || rect.right <= 0 || rect.left >= win.innerWidth) return false;
  for (let node = element; node; node = node.parentElement) {
    const style = win.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse'
      || Number(style.opacity) === 0) return false;
  }
  return true;
}

export function observeGraphicsActivity(element, onChange, { active = true } = {}) {
  const doc = element.ownerDocument;
  const win = doc.defaultView;
  let enabled = active;
  let intersecting = true;
  let current;
  let frame = null;
  let disposed = false;

  const update = () => {
    if (disposed) return;
    const next = enabled && intersecting && doc.visibilityState !== 'hidden' && isGraphicsVisible(element, win);
    element.dataset.graphicsState = next ? 'running' : 'paused';
    if (next !== current) {
      current = next;
      onChange(next);
    }
  };
  const schedule = () => {
    if (!disposed && frame === null) frame = win.requestAnimationFrame(() => {
      frame = null;
      update();
    });
  };
  const intersection = new win.IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting;
    schedule();
  });
  intersection.observe(element);
  const mutations = new win.MutationObserver(schedule);
  for (let node = element; node; node = node.parentElement) {
    mutations.observe(node, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
  }
  win.addEventListener('resize', schedule, { passive: true });
  doc.addEventListener('scroll', schedule, { passive: true, capture: true });
  doc.addEventListener('visibilitychange', update);
  update();

  return {
    setActive(value) {
      enabled = Boolean(value);
      if (frame !== null) win.cancelAnimationFrame(frame);
      frame = null;
      update();
    },
    dispose() {
      disposed = true;
      if (frame !== null) win.cancelAnimationFrame(frame);
      intersection.disconnect();
      mutations.disconnect();
      win.removeEventListener('resize', schedule);
      doc.removeEventListener('scroll', schedule, true);
      doc.removeEventListener('visibilitychange', update);
      delete element.dataset.graphicsState;
    },
  };
}
