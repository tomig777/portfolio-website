// Test-only environment controls. The loopback preview injects this before
// the app only with ?qaEnvironment=1. It is never imported into production.
const nativeMatchMedia = window.matchMedia.bind(window);
let reducedMotion = nativeMatchMedia('(prefers-reduced-motion: reduce)').matches;
const motionQueries = new Set();
window.matchMedia = query => {
  if (!/^\(prefers-reduced-motion:\s*(reduce|no-preference)\)$/.test(query)) return nativeMatchMedia(query);
  const result = new EventTarget();
  Object.defineProperties(result, {
    media: { value: query },
    matches: { get: () => query.includes('no-preference') ? !reducedMotion : reducedMotion },
  });
  result.addListener = callback => result.addEventListener('change', callback);
  result.removeListener = callback => result.removeEventListener('change', callback);
  motionQueries.add(result);
  return result;
};

const visibilityDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
const hiddenDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
let simulateHidden = false;
Object.defineProperties(document, {
  visibilityState: { configurable: true, get: () => simulateHidden ? 'hidden' : visibilityDescriptor.get.call(document) },
  hidden: { configurable: true, get: () => simulateHidden || hiddenDescriptor.get.call(document) },
});

document.addEventListener('DOMContentLoaded', () => {
  const panel = document.createElement('aside');
  panel.setAttribute('aria-label', 'Test-only environment controls');
  panel.style.cssText = 'position:fixed;bottom:4px;right:4px;z-index:2147483647;display:flex;gap:4px;padding:4px;background:#222;border:1px solid #888;font:12px sans-serif;color:white;';
  const motion = document.createElement('button');
  motion.type = 'button';
  motion.textContent = 'Toggle reduced motion for QA';
  motion.setAttribute('aria-pressed', String(reducedMotion));
  motion.addEventListener('click', () => {
    reducedMotion = !reducedMotion;
    motion.setAttribute('aria-pressed', String(reducedMotion));
    for (const query of motionQueries) {
      const event = new Event('change');
      Object.defineProperties(event, { matches: { value: query.matches }, media: { value: query.media } });
      query.dispatchEvent(event);
    }
  });
  const visibility = document.createElement('button');
  visibility.type = 'button';
  visibility.textContent = 'Pause document effects for QA';
  visibility.addEventListener('click', () => {
    simulateHidden = !simulateHidden;
    visibility.textContent = simulateHidden ? 'Resume document effects for QA' : 'Pause document effects for QA';
    document.dispatchEvent(new Event('visibilitychange'));
  });
  panel.append(motion, visibility);
  document.body.append(panel);
}, { once: true });
