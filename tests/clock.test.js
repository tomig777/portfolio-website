import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBudapestClock } from '../src/utils/clock.js';

test('the menu clock uses Budapest summer time with padded fields', () => {
  assert.equal(formatBudapestClock(new Date('2026-07-01T00:02:03Z')), '02:02:03 (GMT+2)');
});

test('the menu clock uses Budapest winter time instead of a fixed GMT+2 label', () => {
  assert.equal(formatBudapestClock(new Date('2026-01-01T00:02:03Z')), '01:02:03 (GMT+1)');
  assert.equal(formatBudapestClock(new Date('2026-12-31T23:00:00Z')), '00:00:00 (GMT+1)');
});
