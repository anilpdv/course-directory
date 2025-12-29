// Subject-themed icons for courses (Material Design Icons)
export const COURSE_ICONS = [
  'code-tags',
  'palette',
  'music',
  'calculator',
  'flask',
  'translate',
  'camera',
  'chart-line',
  'database',
  'web',
  'cellphone',
  'brain',
  'security',
  'cloud',
  'gamepad-variant',
  'server',
  'brush',
  'finance',
  'book-education',
  'lightbulb',
] as const;

export type CourseIcon = (typeof COURSE_ICONS)[number];

export function getRandomCourseIcon(): CourseIcon {
  const randomIndex = Math.floor(Math.random() * COURSE_ICONS.length);
  return COURSE_ICONS[randomIndex];
}
