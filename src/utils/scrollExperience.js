export function getScrollExperience({ compact = false, reducedMotion = false, projectCount = 4, bubbleContact = true } = {}) {
  return {
    nativeScroll: compact || reducedMotion,
    // Retain the choreography without trailing touch input by a full second.
    workScrub: reducedMotion ? true : compact ? 0.28 : 0.65,
    contactScrub: reducedMotion ? true : compact ? 0.18 : 0.4,
    workScrollPercent: Math.max(360, projectCount * (compact ? 150 : 165) - (compact ? 78 : 118)),
    contactScrollPercent: bubbleContact ? (compact ? 980 : 1120) : (compact ? 740 : 820),
  };
}

export function setScrollPosition(container, smoothScroll, top, { immediate = true, reducedMotion = false } = {}) {
  if (!container) return 0;
  const maximum = Math.max(0, container.scrollHeight - container.clientHeight);
  const position = Math.min(maximum, Math.max(0, Number.isFinite(top) ? top : 0));
  if (smoothScroll) {
    smoothScroll.scrollTo(position, { immediate: immediate || reducedMotion, force: true });
  } else if (immediate || reducedMotion) {
    container.scrollTop = position;
  } else {
    container.scrollTo({ top: position, behavior: 'smooth' });
  }
  return position;
}

// A responsive rebuild replaces the scroll owner. Preserve an unfinished
// navigation destination, not its intermediate animation position. Explicit
// user input cancels the intent so a later resize cannot undo that input.
export function createScrollIntent() {
  let target = null;
  return {
    begin(top) { target = Number.isFinite(top) ? Math.max(0, top) : null; },
    cancel() { target = null; },
    observe(top) {
      if (target !== null && Number.isFinite(top) && Math.abs(top - target) <= 1) target = null;
    },
    resolve(fallback) { return target ?? fallback; },
  };
}
