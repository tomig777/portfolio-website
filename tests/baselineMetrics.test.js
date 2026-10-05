import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeFrameDeltas, summarizeResources } from '../scripts/baseline/metrics.mjs';
import { evaluateBrowserContracts } from '../scripts/baseline/browser-contracts.mjs';

test('frame summaries exclude invalid values and do not manufacture samples', () => {
  assert.equal(summarizeFrameDeltas([0, -1, NaN, Infinity]), null);
  assert.deepEqual(summarizeFrameDeltas([16, 16, 17, 80, 0]), {
    samples: 4, meanMs: 32.25, medianMs: 16, p95Ms: 80, maxMs: 80, gapsOver50Ms: 1,
  });
});

test('resource summaries retain zero/unknown transfer sizes and actual download order independence', () => {
  const report = summarizeResources([
    { name: 'a.js', initiatorType: 'script', duration: 1, transferSize: 0, encodedBodySize: 10, decodedBodySize: 20 },
    { name: 'b.js', initiatorType: 'script', duration: 2, transferSize: 50, encodedBodySize: 30, decodedBodySize: 40 },
  ]);
  assert.equal(report.reportedTransferBytes, 50);
  assert.equal(report.zeroOrUnavailableTransferCount, 1);
  assert.equal(report.largestObserved[0].url, 'b.js');
});

const capture = observation => ({ snapshots: [{ name: 'fixture', viewport: { width: 390, height: 844 }, observation }] });

test('browser scroll contract detects a clipped game action without a scrolling ancestor', () => {
  assert.equal(evaluateBrowserContracts(capture({ gameAction: { fullyInViewport: false, hasScrollableAncestor: false } }))[0].passed, false);
  assert.equal(evaluateBrowserContracts(capture({ gameAction: { fullyInViewport: false, hasScrollableAncestor: true } }))[0].passed, true);
  assert.equal(evaluateBrowserContracts(capture({ gameAction: { fullyInViewport: false, hasScrollableAncestor: true, withinHorizontalViewport: false } }))[0].passed, false);
});

test('race geometry contract distinguishes moving a car width from reaching the track finish', () => {
  const bad = evaluateBrowserContracts(capture({ finishedRace: { winnerFrontX: 160, finishLineX: 320, carFrontsX: [150, 160] } }));
  assert.equal(bad.find(result => result.id === 'B02').passed, false);
  assert.equal(bad.find(result => result.id === 'B03').passed, true);
  const good = evaluateBrowserContracts(capture({ finishedRace: { winnerFrontX: 321, finishLineX: 320, carFrontsX: [300, 321] } }));
  assert.ok(good.every(result => result.passed));
});

test('roulette contract checks orbit distance against actual wheel size', () => {
  assert.equal(evaluateBrowserContracts(capture({ roulette: { ballRadiusPx: 6, wheelRadiusPx: 150 } }))[0].passed, false);
  assert.equal(evaluateBrowserContracts(capture({ roulette: { ballRadiusPx: 125, wheelRadiusPx: 150 } }))[0].passed, true);
});

test('browser contracts distinguish real links and valid media from visual placeholders', () => {
  const results = evaluateBrowserContracts(capture({
    socialLinks: [{ anchor: false, href: null }], invalidVideoSources: 1,
    missingRoute: { headings: 0, visibleActions: 0 }, contactInputFontPx: [14.7, 14.7],
  }));
  assert.equal(results.length, 4);
  assert.ok(results.every(result => !result.passed));
});
