// DOM-only evidence: no event injection or access to private animation state.
export function observeScrollExperience() {
  const container = document.querySelector('.wt-scroll-container');
  const rect = element => element?.getBoundingClientRect().toJSON() || null;
  const sections = ['.hero-section', '.wt-projects-section', '.wt-blur-section', '.wt-bubble-final-scene'];
  return {
    viewport: { width: innerWidth, height: innerHeight },
    container: container ? {
      mode: container.dataset.scrollMode,
      locked: container.dataset.scrollLocked,
      scrollTop: container.scrollTop,
      maximum: container.scrollHeight - container.clientHeight,
      clientHeight: container.clientHeight,
      scrollHeight: container.scrollHeight,
      overflowY: getComputedStyle(container).overflowY,
      lenis: container.classList.contains('lenis'),
      rect: rect(container),
    } : null,
    documentScroll: { top: document.scrollingElement.scrollTop, maximum: document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight },
    pinSpacers: [...document.querySelectorAll('.pin-spacer')].map(element => ({
      height: element.offsetHeight,
      child: element.firstElementChild?.className,
      rect: rect(element),
    })),
    sections: sections.map(selector => {
      const element = document.querySelector(selector);
      if (!element) return { selector, present: false };
      const style = getComputedStyle(element);
      return { selector, present: true, rect: rect(element), visibility: style.visibility, opacity: style.opacity };
    }),
    page: document.querySelector('.wt-nav-page')?.getAttribute('aria-label') || null,
    caseStudy: document.querySelector('.wt-case-study-page')?.querySelector('h1')?.textContent || null,
    gallery: Boolean(document.querySelector('.playground-overlay')),
    menu: Boolean(document.querySelector('.menu-drop')),
    curtains: [...document.querySelectorAll('.wt-case-transition,.site-route-transition')].map(element => ({
      className: element.className,
      transform: getComputedStyle(element).transform,
    })),
    focus: { tag: document.activeElement?.tagName, label: document.activeElement?.getAttribute('aria-label'), text: document.activeElement?.textContent?.slice(0, 80) },
  };
}
