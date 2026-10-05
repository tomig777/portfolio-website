export const ROULETTE_NUMBERS = Object.freeze([0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]);
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const getRouletteColor = number => number === 0 ? 'green' : RED_NUMBERS.has(number) ? 'red' : 'black';

export function randomIndex(length, cryptoSource = globalThis.crypto, random = Math.random) {
  if (!Number.isInteger(length) || length < 1 || length > 0x100000000) throw new RangeError('Invalid choice count');
  if (cryptoSource?.getRandomValues) {
    // Discard the incomplete bucket instead of favouring low indices with modulo.
    const limit = Math.floor(0x100000000 / length) * length;
    const value = new Uint32Array(1);
    do { cryptoSource.getRandomValues(value); } while (value[0] >= limit);
    return value[0] % length;
  }
  return Math.floor(random() * length);
}

const normalizeDegrees = value => ((value % 360) + 360) % 360;

export function getRouletteRotation(currentRotation, resultIndex) {
  const sector = 360 / ROULETTE_NUMBERS.length;
  const centre = (resultIndex + .5) * sector;
  const next = currentRotation + 1440;
  return next + normalizeDegrees(-next - centre);
}

export function resolveRouletteBet(winningNumber, { mode, number, amount }) {
  const color = getRouletteColor(winningNumber);
  const won = mode === 'number' ? winningNumber === number : color === mode;
  const multiplier = mode === 'number' || mode === 'green' ? 36 : 2;
  return { number: winningNumber, color, won, payout: won ? amount * multiplier : 0 };
}

export function getRaceTravelDistance(finishLineX, startLeftX, carWidth) {
  if (![finishLineX, startLeftX, carWidth].every(Number.isFinite)) return 0;
  return Math.max(0, finishLineX - startLeftX - carWidth);
}

export function createRacePositions(winnerIndex, carCount, random = Math.random) {
  return Array.from({ length: carCount }, (_, index) => index === winnerIndex ? 1 : .78 + random() * .19);
}
