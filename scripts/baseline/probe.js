// Only the loopback baseline server injects this probe. It is not imported by
// the application, included in dist, or shipped by the deployment workflow.
import { summarizeFrameDeltas, summarizeResources } from './metrics.mjs';

const supported = PerformanceObserver.supportedEntryTypes || [];
const observers = [];
const frameSamples = [];
const longTasks = [];
let lastFrame = null;
let frameId = null;
let cls = 0;
let largestContentfulPaint = null;
const initialPath = location.pathname + location.search;

function observe(type, consume) {
  if (!supported.includes(type)) return;
  const observer = new PerformanceObserver(list => list.getEntries().forEach(consume));
  observer.observe({ type, buffered: true });
  observers.push(observer);
}

observe('longtask', entry => {
  longTasks.push({ startTimeMs: entry.startTime, durationMs: entry.duration });
});
observe('layout-shift', entry => {
  if (!entry.hadRecentInput) cls += entry.value;
});
observe('largest-contentful-paint', entry => {
  largestContentfulPaint = {
    timeMs: entry.startTime,
    size: entry.size,
    element: entry.element?.tagName || null,
  };
});

function frame(now) {
  if (document.visibilityState === 'hidden') {
    lastFrame = null;
    frameId = null;
    return;
  }
  if (lastFrame !== null) frameSamples.push({ time: now, delta: now - lastFrame });
  lastFrame = now;
  while (frameSamples.length && frameSamples[0].time < now - 8000) frameSamples.shift();
  frameId = requestAnimationFrame(frame);
}

function syncVisibility() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  frameId = null;
  lastFrame = null;
  if (document.visibilityState !== 'hidden') frameId = requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', syncVisibility);
syncVisibility();

const output = document.createElement('output');
output.id = 'portfolio-baseline-metrics';
output.hidden = true;
output.setAttribute('aria-hidden', 'true');
document.body.appendChild(output);

function publish() {
  const now = performance.now();
  const navigation = performance.getEntriesByType('navigation')[0];
  const recentLongTasks = longTasks.filter(task => task.startTimeMs >= now - 8000);
  output.textContent = JSON.stringify({
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    initialPath,
    currentPath: location.pathname + location.search,
    elapsedMs: Math.round(now),
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    environment: {
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemoryGiB: navigator.deviceMemory || null,
      visibility: document.visibilityState,
    },
    navigation: navigation ? {
      type: navigation.type,
      domContentLoadedMs: navigation.domContentLoadedEventEnd,
      loadEventMs: navigation.loadEventEnd,
      responseEndMs: navigation.responseEnd,
    } : null,
    largestContentfulPaint,
    cls: Math.round(cls * 100000) / 100000,
    longTasks: supported.includes('longtask') ? {
      count: longTasks.length,
      totalDurationMs: Math.round(longTasks.reduce((sum, task) => sum + task.durationMs, 0)),
      recent8sCount: recentLongTasks.length,
      worst: [...longTasks].sort((a, b) => b.durationMs - a.durationMs).slice(0, 10),
    } : null,
    recent8sRafCadence: summarizeFrameDeltas(frameSamples.filter(sample => sample.time >= now - 8000).map(sample => sample.delta)),
    resources: summarizeResources(performance.getEntriesByType('resource').filter(entry => !entry.name.includes('/__baseline__/'))),
    notes: [
      'Loopback production build with a test-only passive probe; no CPU or network throttling.',
      'rAF cadence is a main-thread scheduling proxy, not measured GPU/rendered FPS.',
      'Zero transfer size can indicate a cache hit or restricted timing information.',
      'Probe module requests are excluded from the resource totals.',
      'Navigation, LCP and CLS belong to the initial document, not each subsequently opened overlay.',
      'The probe adds a rAF callback and publishes this hidden output once per second.',
    ],
  });
}
publish();
const timer = setInterval(publish, 1000);
window.addEventListener('pagehide', () => {
  clearInterval(timer);
  if (frameId !== null) cancelAnimationFrame(frameId);
  document.removeEventListener('visibilitychange', syncVisibility);
  observers.forEach(observer => observer.disconnect());
}, { once: true });
