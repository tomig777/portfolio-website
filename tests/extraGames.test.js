import test from 'node:test';
import assert from 'node:assert/strict';
import { ROULETTE_NUMBERS, randomIndex, getRouletteColor, getRouletteRotation, resolveRouletteBet, getRaceTravelDistance, createRacePositions } from '../src/utils/extraGames.js';

test('roulette contains every number once with the correct colour totals', () => {
  assert.equal(new Set(ROULETTE_NUMBERS).size, 37);
  assert.deepEqual([...ROULETTE_NUMBERS].sort((a, b) => a - b), Array.from({ length: 37 }, (_, i) => i));
  assert.equal(ROULETTE_NUMBERS.filter(number => getRouletteColor(number) === 'red').length, 18);
  assert.equal(ROULETTE_NUMBERS.filter(number => getRouletteColor(number) === 'black').length, 18);
  assert.equal(getRouletteColor(0), 'green');
});

test('random choices reject the biased crypto remainder and retain a fallback', () => {
  let calls = 0;
  const crypto = { getRandomValues(array) { array[0] = calls++ === 0 ? 0xffffffff : 36; } };
  assert.equal(randomIndex(37, crypto), 36);
  assert.equal(calls, 2);
  assert.equal(randomIndex(5, null, () => 0), 0);
  assert.equal(randomIndex(5, null, () => .999), 4);
  assert.throws(() => randomIndex(0), RangeError);
});

test('every roulette result finishes beneath the ball after repeated rotations', () => {
  const sector = 360 / ROULETTE_NUMBERS.length;
  for (const previous of [0, 1712.5, 9207, -360]) {
    for (let index = 0; index < ROULETTE_NUMBERS.length; index++) {
      const rotation = getRouletteRotation(previous, index);
      const alignment = ((rotation + (index + .5) * sector) % 360 + 360) % 360;
      assert.ok(alignment < 1e-8 || 360 - alignment < 1e-8);
      assert.ok(rotation >= previous + 1440);
    }
  }
});

test('roulette settles the captured bet with matching green, number and colour payouts', () => {
  assert.deepEqual(resolveRouletteBet(0, { mode: 'green', number: 17, amount: 25 }), { number: 0, color: 'green', won: true, payout: 900 });
  assert.equal(resolveRouletteBet(17, { mode: 'number', number: 17, amount: 10 }).payout, 360);
  assert.equal(resolveRouletteBet(3, { mode: 'red', number: 17, amount: 25 }).payout, 50);
  assert.equal(resolveRouletteBet(0, { mode: 'red', number: 17, amount: 25 }).payout, 0);
  assert.equal(resolveRouletteBet(12, { mode: 'number', number: 17, amount: 25 }).payout, 0);
});

test('race travel uses the finish-line geometry, not a percentage of the car width', () => {
  const distance = getRaceTravelDistance(326, 122, 55);
  assert.equal(distance, 149);
  assert.equal(122 + distance + 55, 326);
  assert.equal(getRaceTravelDistance(90, 122, 55), 0);
  assert.equal(getRaceTravelDistance(NaN, 122, 55), 0);
});

test('every possible race winner reaches the flag while the other cars stay behind it', () => {
  for (let winner = 0; winner < 5; winner++) {
    const positions = createRacePositions(winner, 5, () => .999);
    assert.equal(positions[winner], 1);
    assert.equal(positions.indexOf(Math.max(...positions)), winner);
    assert.ok(positions.every((position, i) => i === winner || position < 1));
  }
});
