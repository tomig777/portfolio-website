import test from 'node:test';
import assert from 'node:assert/strict';
import { createScrollIntent, getScrollExperience, setScrollPosition } from '../src/utils/scrollExperience.js';

test('phone scrolling is native with modestly shorter pins and quicker animation follow-through', () => {
  const desktop = getScrollExperience();
  const phone = getScrollExperience({ compact: true });
  assert.equal(desktop.nativeScroll, false);
  assert.equal(phone.nativeScroll, true);
  assert.equal(desktop.workScrollPercent, 542);
  assert.equal(phone.workScrollPercent, 522);
  assert.equal(desktop.contactScrollPercent, 1120);
  assert.equal(phone.contactScrollPercent, 980);
  assert.ok(phone.workScrub < desktop.workScrub);
  assert.ok(phone.contactScrub < desktop.contactScrub);
  assert.equal(getScrollExperience({ projectCount: 1 }).workScrollPercent, 360);
});

test('reduced motion uses native scrolling without animation catch-up smoothing', () => {
  const settings = getScrollExperience({ reducedMotion: true, bubbleContact: false });
  assert.equal(settings.nativeScroll, true);
  assert.equal(settings.workScrub, true);
  assert.equal(settings.contactScrub, true);
  assert.equal(settings.contactScrollPercent, 820);
});

test('scroll restoration clamps invalid and out-of-range positions', () => {
  const container = { scrollHeight: 1400, clientHeight: 600, scrollTop: 0 };
  assert.equal(setScrollPosition(container, null, 500), 500);
  assert.equal(container.scrollTop, 500);
  assert.equal(setScrollPosition(container, null, Infinity), 0);
  assert.equal(setScrollPosition(container, null, -100), 0);
  assert.equal(setScrollPosition(container, null, 2000), 800);
  assert.equal(container.scrollTop, 800);
  assert.equal(setScrollPosition(null, null, 10), 0);
});

test('desktop restoration uses the single smooth-scroll owner and cancels inertia', () => {
  const calls = [];
  const container = { scrollHeight: 1400, clientHeight: 600, scrollTop: 123 };
  const smoothScroll = { scrollTo(...args) { calls.push(args); } };
  setScrollPosition(container, smoothScroll, 500);
  assert.deepEqual(calls, [[500, { immediate: true, force: true }]]);
  assert.equal(container.scrollTop, 123, 'Do not also write the native position');
});

test('home scrolling is smooth unless reduced motion asks for an immediate move', () => {
  const calls = [];
  const container = { scrollHeight: 1400, clientHeight: 600, scrollTop: 500, scrollTo(value) { calls.push(value); } };
  setScrollPosition(container, null, 0, { immediate: false });
  assert.deepEqual(calls, [{ top: 0, behavior: 'smooth' }]);
  setScrollPosition(container, null, 0, { immediate: false, reducedMotion: true });
  assert.equal(container.scrollTop, 0);
  assert.equal(calls.length, 1);
});

test('a responsive scroll-owner rebuild preserves an unfinished Home destination', () => {
  const intent = createScrollIntent();
  intent.begin(0);
  intent.observe(2346);
  assert.equal(intent.resolve(2346), 0);
  intent.observe(0);
  assert.equal(intent.resolve(800), 800, 'A completed navigation does not pin future resizes to Home');
});

test('a new user gesture cancels navigation intent before restoring the reading position', () => {
  const intent = createScrollIntent();
  intent.begin(0);
  intent.cancel();
  assert.equal(intent.resolve(1200), 1200);
});

test('scroll intent rejects non-finite destinations and tolerates fractional completion', () => {
  const intent = createScrollIntent();
  intent.begin(Infinity);
  assert.equal(intent.resolve(500), 500);
  intent.begin(-30);
  assert.equal(intent.resolve(500), 0);
  intent.observe(0.5);
  assert.equal(intent.resolve(500), 500);
});
