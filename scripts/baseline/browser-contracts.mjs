// Contracts consume measurements from actual browser DOM snapshots. They do
// not drive a browser, mutate the site, or infer CSS layout from source strings.
export function evaluateBrowserContracts(capture) {
  const checks = [];
  const add = (id, title, passed, actual) => checks.push({ id, title, passed: Boolean(passed), actual });
  for (const snapshot of capture.snapshots || []) {
    const observation = snapshot.observation || {};
    const suffix = `${snapshot.name} (${snapshot.viewport.width}x${snapshot.viewport.height})`;
    if (observation.gameAction) {
      const action = observation.gameAction;
      add('B01', `Game action is visible or reachable by scrolling: ${suffix}`,
        action.withinHorizontalViewport !== false && (action.fullyInViewport || action.hasScrollableAncestor), action);
    }
    if (observation.finishedRace) {
      const race = observation.finishedRace;
      add('B02', `Winning car reaches the finish line: ${suffix}`,
        race.winnerFrontX >= race.finishLineX - 2, race);
      add('B03', `Declared winner is the furthest car forward: ${suffix}`,
        race.winnerFrontX >= Math.max(...race.carFrontsX) - .5, race);
    }
    if (observation.roulette) {
      const roulette = observation.roulette;
      add('B04', `Roulette ball follows the outer wheel track: ${suffix}`,
        roulette.ballRadiusPx >= roulette.wheelRadiusPx * .6 && roulette.ballRadiusPx <= roulette.wheelRadiusPx * 1.05,
        roulette);
    }
    if (observation.contactInputFontPx?.length) {
      add('B05', `Phone contact inputs are at least 16px: ${suffix}`,
        Math.min(...observation.contactInputFontPx) >= 16, observation.contactInputFontPx);
    }
    if (observation.socialLinks) {
      add('B06', `Menu social labels are usable links: ${suffix}`,
        observation.socialLinks.every(link => link.anchor && /^https?:\/\//.test(link.href || '')),
        observation.socialLinks);
    }
    if (observation.invalidVideoSources !== undefined) {
      add('B07', `Case-study media has no empty video sources: ${suffix}`,
        observation.invalidVideoSources === 0, observation.invalidVideoSources);
    }
    if (observation.missingRoute) {
      add('B09', `Unknown route offers recovery content: ${suffix}`,
        observation.missingRoute.headings > 0 || observation.missingRoute.visibleActions > 0,
        observation.missingRoute);
    }
  }
  return checks;
}
