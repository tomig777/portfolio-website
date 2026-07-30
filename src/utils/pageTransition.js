const TRANSITION_ACTION_DELAY = 760;
const TRANSITION_DURATION = 1680;

export function runRouteTransition(action) {
  if (document.querySelector('.site-route-transition')) return false;

  const overlay = document.createElement('div');
  overlay.className = 'site-route-transition';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  window.setTimeout(() => {
    if (action) action();
  }, TRANSITION_ACTION_DELAY);

  window.setTimeout(() => {
    overlay.remove();
  }, TRANSITION_DURATION);

  return true;
}
