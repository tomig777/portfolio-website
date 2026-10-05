// Read-only DOM observation, usable through the browser tool's evaluate API.
// This function neither dispatches events nor changes application state.
export function observeBaseline(kind = 'layout') {
  const metricNode = document.getElementById('portfolio-baseline-metrics');
  const metrics = metricNode?.textContent ? JSON.parse(metricNode.textContent) : null;
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const rect = element => element?.getBoundingClientRect().toJSON() || null;
  const scrolling = document.querySelector('.wt-scroll-container') || document.scrollingElement;
  const observation = {};
  const action = document.querySelector('.game-primary-button');
  if (action) {
    const bounds = action.getBoundingClientRect();
    let node = action.parentElement;
    let hasScrollableAncestor = false;
    const ancestors = [];
    while (node) {
      const style = getComputedStyle(node);
      hasScrollableAncestor ||= /^(auto|scroll)$/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
      ancestors.push({ tag: node.tagName, className: node.className, clientHeight: node.clientHeight, scrollHeight: node.scrollHeight, overflowY: style.overflowY });
      node = node.parentElement;
    }
    observation.gameAction = {
      text: action.textContent,
      fullyInViewport: bounds.top >= 0 && bounds.bottom <= height && bounds.left >= 0 && bounds.right <= width,
      withinHorizontalViewport: bounds.left >= 0 && bounds.right <= width,
      hasScrollableAncestor,
      rect: bounds.toJSON(), ancestors,
    };
  }
  const wheel = document.querySelector('.roulette-wheel');
  const ball = document.querySelector('.roulette-ball');
  if (wheel && ball) {
    const wheelBounds = wheel.getBoundingClientRect();
    const ballBounds = ball.getBoundingClientRect();
    observation.roulette = {
      // A rotated square DOM box has a larger axis-aligned bounding rectangle;
      // use the actual circular wheel diameter for orbit comparisons.
      wheelRadiusPx: wheel.offsetWidth / 2,
      ballRadiusPx: Math.hypot(
        ballBounds.left + ballBounds.width / 2 - wheelBounds.left - wheelBounds.width / 2,
        ballBounds.top + ballBounds.height / 2 - wheelBounds.top - wheelBounds.height / 2,
      ),
      wheel: rect(wheel), ball: rect(ball),
    };
  }
  if (kind === 'race-finished') {
    const cars = [...document.querySelectorAll('.racing-car')];
    const result = document.querySelector('.game-result')?.textContent || '';
    const winner = cars.find(car => result.includes(car.querySelector('.racing-car__name')?.textContent + ' takes the flag'));
    const finish = document.querySelector('.race-finish');
    if (winner && finish) observation.finishedRace = {
      winner: winner.querySelector('.racing-car__name').textContent,
      winnerFrontX: winner.getBoundingClientRect().right,
      finishLineX: finish.getBoundingClientRect().left,
      carFrontsX: cars.map(car => car.getBoundingClientRect().right),
      carTransforms: cars.map(car => getComputedStyle(car).transform), result,
    };
  }
  if (kind === 'contact') observation.contactInputFontPx = [...document.querySelectorAll('input:not([type="hidden"]),textarea')]
    .filter(element => element.getBoundingClientRect().width > 0).map(element => +getComputedStyle(element).fontSize.replace('px', ''));
  if (kind === 'menu') observation.socialLinks = [...document.querySelectorAll('.menu-drop__socials-list > *')]
    .map(element => ({ text: element.textContent, anchor: element.tagName === 'A', href: element.getAttribute('href') }));
  if (kind === 'case-study') observation.invalidVideoSources = [...document.querySelectorAll('.wt-case-study-page video source')]
    .filter(element => !element.getAttribute('src')).length;
  if (kind === 'missing-route') observation.missingRoute = {
    headings: document.querySelectorAll('#root h1,#root h2').length,
    visibleActions: [...document.querySelectorAll('#root a,#root button')].filter(element => {
      const bounds = element.getBoundingClientRect();
      return bounds.width > 0 && bounds.height > 0;
    }).length,
    rootText: document.getElementById('root')?.textContent?.trim() || '',
  };
  return {
    url: document.URL, title: document.title,
    viewport: { width, height, dpr: metrics?.viewport.dpr || null },
    layout: {
      scrollOwner: scrolling?.className || scrolling?.tagName,
      scrollHeight: scrolling?.scrollHeight || 0, clientHeight: scrolling?.clientHeight || 0,
      scrollTop: scrolling?.scrollTop || 0, scrollViewportRatio: scrolling?.scrollHeight / height,
      documentScrollWidth: document.documentElement.scrollWidth,
      mobileClass: Boolean(document.querySelector('.wt-mobile-preview')),
      header: rect(document.querySelector('header')),
      canvases: [...document.querySelectorAll('canvas')].map(element => ({ backingWidth: element.width, backingHeight: element.height, rect: rect(element) })),
    },
    observation, metrics,
  };
}
