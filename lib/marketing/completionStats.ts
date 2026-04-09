export const LIVE_COMPLETED_COUNT = 1_049_165;
export const LIVE_COMPLETED_COUNT_TICK_MS = 1_000;
export const LIVE_COMPLETED_COUNT_MIN_INCREMENT = 1;
export const LIVE_COMPLETED_COUNT_MAX_INCREMENT = 4;

export function getRandomLiveCompletedCountIncrement(randomValue = Math.random()): number {
  const clamped = Math.min(0.999999, Math.max(0, randomValue));
  const span = LIVE_COMPLETED_COUNT_MAX_INCREMENT - LIVE_COMPLETED_COUNT_MIN_INCREMENT + 1;
  return LIVE_COMPLETED_COUNT_MIN_INCREMENT + Math.floor(clamped * span);
}
