export { formatTime } from '@shared/utils/formatters';

/**
 * Calculate seek position clamped between 0 and duration
 */
export function clampSeekPosition(currentTime: number, seekAmount: number, duration: number): number {
  return Math.max(0, Math.min(currentTime + seekAmount, duration));
}

/**
 * Calculate progress percentage from position and duration
 */
export function calculateProgress(currentTime: number, duration: number): number {
  return duration > 0 ? currentTime / duration : 0;
}

/**
 * Calculate seek time from touch position on progress bar
 */
export function calculateSeekTime(touchX: number, barWidth: number, duration: number): number {
  if (barWidth <= 0 || duration <= 0) return 0;
  const seekPercent = Math.max(0, Math.min(touchX / barWidth, 1));
  return seekPercent * duration;
}
