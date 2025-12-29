/**
 * Course alert utilities
 * Extracted from CoursesListScreen and SettingsScreen to eliminate duplication
 */

import { Alert } from 'react-native';

export interface AddCoursesResult {
  added: number;
  duplicates: number;
  cancelled: boolean;
  noCoursesFound: boolean;
  error: string | null;
}

/**
 * Handle result from adding a single course
 * Shows appropriate alert based on the result
 */
export function handleSingleCourseResult(result: AddCoursesResult): void {
  if (result.cancelled) return;

  if (result.error) {
    Alert.alert('Error', result.error);
    return;
  }

  if (result.noCoursesFound) {
    Alert.alert(
      'No Course Found',
      'No video content was found in this folder. Make sure the folder contains video files (MP4, MOV, M4V).'
    );
    return;
  }

  if (result.added === 0 && result.duplicates > 0) {
    Alert.alert('Already Added', 'This course is already in your library.');
    return;
  }

  if (result.added > 0) {
    Alert.alert('Course Added', 'The course has been added to your library.');
  }
}

/**
 * Handle result from adding multiple courses
 * Shows appropriate alert based on the result
 */
export function handleMultipleCoursesResult(result: AddCoursesResult): void {
  if (result.cancelled) return;

  if (result.error) {
    Alert.alert('Error', result.error);
    return;
  }

  if (result.noCoursesFound) {
    Alert.alert(
      'No Courses Found',
      'No video courses were found in this folder. Make sure the folder contains video files (MP4, MOV, M4V).'
    );
    return;
  }

  if (result.added === 0 && result.duplicates > 0) {
    Alert.alert('Already Added', 'These courses are already in your library.');
    return;
  }

  if (result.added > 0) {
    const courseText = result.added !== 1 ? 'courses' : 'course';
    const duplicateText = result.duplicates > 0
      ? ` ${result.duplicates} duplicate${result.duplicates !== 1 ? 's' : ''} skipped.`
      : '';
    Alert.alert('Courses Added', `Added ${result.added} ${courseText}.${duplicateText}`);
  }
}
