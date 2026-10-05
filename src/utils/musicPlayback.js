export function getNextTrackIndex(currentIndex, trackCount, direction = 1, shuffle = false, random = Math.random) {
  if (trackCount <= 1) return 0;
  if (shuffle) {
    // Pick directly from the other tracks: no retry loop and no immediate repeat.
    const choice = Math.floor(random() * (trackCount - 1));
    return choice >= currentIndex ? choice + 1 : choice;
  }
  return ((currentIndex + direction) % trackCount + trackCount) % trackCount;
}

export function finiteMediaTime(value) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}
