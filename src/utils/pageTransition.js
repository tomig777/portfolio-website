export const TRANSITION_ACTION_DELAY = 760;
export const TRANSITION_DURATION = 1680;

const routeTransitions = new WeakMap();

export function prefersReducedMotion(host = window) {
  return Boolean(host.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

// Before the curtain covers the page, the latest destination wins. After a
// commit, a new curtain enters while the old one finishes leaving. Neither
// case drops a user's navigation request.
export function createPageTransition({ className = 'wt-case-transition', document: doc = document, window: host = window } = {}) {
  const records = new Set();
  let current = null;
  let disposed = false;

  function remove(record) {
    host.clearTimeout(record.actionTimer);
    host.clearTimeout(record.doneTimer);
    record.overlay.remove();
    records.delete(record);
    if (current === record) current = null;
  }

  function cancel() {
    for (const record of [...records]) remove(record);
  }

  function run(action) {
    if (disposed) return false;
    // An externally removed/aborted overlay must never commit later.
    for (const record of [...records]) {
      if (!record.overlay.isConnected) remove(record);
    }
    if (prefersReducedMotion(host)) {
      cancel();
      if (typeof action === 'function') action();
      return true;
    }
    if (current && !current.committed) {
      current.action = action;
      return true;
    }

    const overlay = doc.createElement('div');
    overlay.className = className;
    overlay.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(overlay);
    const record = { overlay, action, committed: false, actionTimer: null, doneTimer: null };
    records.add(record);
    current = record;
    record.actionTimer = host.setTimeout(() => {
      if (!overlay.isConnected || disposed) {
        remove(record);
        return;
      }
      record.committed = true;
      const commit = record.action;
      record.action = null;
      if (typeof commit === 'function') commit();
    }, TRANSITION_ACTION_DELAY);
    record.doneTimer = host.setTimeout(() => remove(record), TRANSITION_DURATION);
    return true;
  }

  return { run, cancel, dispose() { disposed = true; cancel(); } };
}

export function runRouteTransition(action) {
  let transition = routeTransitions.get(document);
  if (!transition) {
    transition = createPageTransition({ className: 'site-route-transition' });
    routeTransitions.set(document, transition);
  }
  return transition.run(action);
}
