const scopeStacks = new WeakMap();
const isolatedElements = new WeakMap();
const TAB_STOP_SELECTOR = 'a[href],button,input:not([type="hidden"]),select,textarea,iframe,[tabindex],[contenteditable="true"]';

export function getFocusTrapTarget(activeElement, stops, backwards = false) {
  if (!stops.length) return null;
  if (!stops.includes(activeElement)) return backwards ? stops.at(-1) : stops[0];
  if (backwards && activeElement === stops[0]) return stops.at(-1);
  if (!backwards && activeElement === stops.at(-1)) return stops[0];
  return undefined;
}

export function isolateElements(elements) {
  const targets = [...new Set(elements)].filter(Boolean);
  for (const element of targets) {
    let record = isolatedElements.get(element);
    if (!record) {
      record = { count: 0, inert: element.inert, ariaHidden: element.getAttribute('aria-hidden') };
      isolatedElements.set(element, record);
    }
    record.count += 1;
    element.inert = true;
    element.setAttribute('aria-hidden', 'true');
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const element of targets) {
      const record = isolatedElements.get(element);
      if (--record.count) continue;
      element.inert = record.inert;
      if (record.ariaHidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', record.ariaHidden);
      isolatedElements.delete(element);
    }
  };
}

function backgroundSiblings(root) {
  const siblings = [];
  let branch = root;
  while (branch.parentElement && branch !== root.ownerDocument.body) {
    siblings.push(...[...branch.parentElement.children].filter(element => element !== branch && !['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName)));
    branch = branch.parentElement;
  }
  return siblings;
}

function focus(element) {
  if (element?.isConnected) element.focus({ preventScroll: true });
}

export function createFocusScope(root, { initialFocus, fallbackFocus, onEscape, trap = true, isolate = true, restoreFocus = true } = {}) {
  const document = root.ownerDocument;
  const previousFocus = document.activeElement;
  const previousTabIndex = root.getAttribute('tabindex');
  if (previousTabIndex === null) root.setAttribute('tabindex', '-1');
  const stack = scopeStacks.get(document) || [];
  scopeStacks.set(document, stack);
  const scope = {};
  stack.push(scope);
  const isTopScope = () => stack.at(-1) === scope;
  const stops = () => [...root.querySelectorAll(TAB_STOP_SELECTOR)].filter(element =>
    !element.disabled && element.tabIndex >= 0 && !element.closest('[inert],[hidden],[aria-hidden="true"]')
    && element.getClientRects().length > 0 && document.defaultView.getComputedStyle(element).visibility !== 'hidden');
  const initial = initialFocus === 'root' ? root : typeof initialFocus === 'string' ? root.querySelector(initialFocus) : initialFocus;
  // Move focus before hiding the background, so aria-hidden never contains
  // the currently focused opener. preventScroll preserves the reading position.
  focus(initial || stops()[0] || root);
  const releaseBackground = isolate ? isolateElements(backgroundSiblings(root)) : () => {};

  const onKeyDown = event => {
    if (!isTopScope()) return;
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      event.stopPropagation();
      onEscape(event);
    } else if (event.key === 'Tab' && trap) {
      const target = getFocusTrapTarget(document.activeElement, stops(), event.shiftKey);
      if (target !== undefined) {
        event.preventDefault();
        focus(target || root);
      }
    }
  };
  const onFocusIn = event => {
    if (trap && isTopScope() && !root.contains(event.target)) focus(stops()[0] || root);
  };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('focusin', onFocusIn);
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    const wasTopScope = isTopScope();
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('focusin', onFocusIn);
    stack.splice(stack.indexOf(scope), 1);
    releaseBackground();
    if (previousTabIndex === null) root.removeAttribute('tabindex');
    if (restoreFocus && wasTopScope) {
      const parentScope = stack.at(-1);
      const available = element => element?.isConnected && element !== document.body && !element.closest('[inert],[hidden],[aria-hidden="true"]');
      const restore = () => {
        // Another dialog may have opened before React finishes cleanup. Never
        // pull focus out of a newer scope while restoring the old one.
        if (stack.at(-1) !== parentScope) return true;
        const fallback = typeof fallbackFocus === 'string' ? document.querySelector(fallbackFocus) : fallbackFocus;
        const target = available(previousFocus) ? previousFocus : available(fallback) ? fallback : null;
        focus(target);
        return Boolean(target);
      };
      // A separate page effect can still own background isolation until the
      // remainder of this React cleanup batch runs. Recheck after that batch.
      if (!restore()) queueMicrotask(restore);
    }
  };
}
