/**
 * Returns singular or plural form based on count
 * @example pluralize(1, 'course') → 'course'
 * @example pluralize(5, 'course') → 'courses'
 * @example pluralize(0, 'video', 'videos') → 'videos'
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Returns count with pluralized word
 * @example withCount(5, 'course') → '5 courses'
 * @example withCount(1, 'video') → '1 video'
 */
export function withCount(
  count: number,
  singular: string,
  plural?: string
): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}
