/**
 * Sorting utilities for course content
 * Extracted from fileSystemService for reusability
 */

export interface OrderResult {
  primary: number;
  secondary: string;
}

/**
 * Extract sorting order from a filename/folder name
 * Handles multiple numbering patterns:
 * - "01 Video", "[01] Video", "(01) Video", "01. Video", "01_Video"
 * - "Lesson 01", "Chapter 1", "Part 05"
 * - Any number in the filename
 */
export function extractOrder(name: string): OrderResult {
  // Pattern 1: Number at start (with optional brackets)
  let match = name.match(/^[\[\(]?(\d+)[\]\)]?[\s._-]*/);
  if (match) {
    return { primary: parseInt(match[1], 10), secondary: name };
  }

  // Pattern 2: "Lesson/Chapter/Part X" format
  match = name.match(/^(?:lesson|chapter|part|section|module|unit|video|lecture)\s*(\d+)/i);
  if (match) {
    return { primary: parseInt(match[1], 10), secondary: name };
  }

  // Pattern 3: Any number in the filename (first occurrence)
  match = name.match(/(\d+)/);
  if (match) {
    return { primary: parseInt(match[1], 10), secondary: name };
  }

  // No number found - sort alphabetically at the end
  return { primary: Infinity, secondary: name };
}

/**
 * Create a sorter function for content items
 * @param getItemName - Function to extract name from item
 * @returns Comparator function for sorting
 */
export function createContentSorter<T>(getItemName: (item: T) => string) {
  return (a: T, b: T): number => {
    const orderA = extractOrder(getItemName(a));
    const orderB = extractOrder(getItemName(b));

    // Primary sort by number
    if (orderA.primary !== orderB.primary) {
      return orderA.primary - orderB.primary;
    }

    // Secondary sort alphabetically (for equal numbers or no numbers)
    return orderA.secondary.localeCompare(orderB.secondary, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  };
}
