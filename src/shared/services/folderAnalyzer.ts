/**
 * Folder analysis utilities for detecting course structures
 * Extracted from fileSystemService for better maintainability
 */

import { File, Directory } from 'expo-file-system/next';
import { StoredCourse } from '../types';
import { getRandomCourseIcon } from '../utils/courseIcons';

// Supported video extensions
const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v'];

/**
 * Utility functions interface - passed from main service
 */
export interface FolderAnalyzerUtils {
  generateId: (path: string) => string;
  cleanName: (name: string) => string;
  extractFolderName: (uri: string) => string;
  getItemName: (item: File | Directory) => string;
}

/**
 * Check if a filename is a video file
 */
function isVideoFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? SUPPORTED_VIDEO_EXTENSIONS.includes(extension) : false;
}

/**
 * Check if a folder has videos directly in it
 */
export async function hasVideosInFolder(
  folder: Directory,
  getItemName: (item: File | Directory) => string
): Promise<boolean> {
  try {
    const contents = folder.list();
    return contents.some((item) => isVideoFile(getItemName(item)));
  } catch {
    return false;
  }
}

/**
 * Check if a folder is a course (has videos at any level)
 */
export async function hasCourseContent(
  folder: Directory,
  getItemName: (item: File | Directory) => string
): Promise<boolean> {
  try {
    // Check direct videos
    if (await hasVideosInFolder(folder, getItemName)) return true;

    // Check subdirectories (sections)
    const contents = folder.list();
    for (const item of contents) {
      const itemName = getItemName(item);
      const subDir = new Directory(folder, itemName);
      if (subDir.exists && (await hasVideosInFolder(subDir, getItemName))) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if a folder is a "section" (has videos directly but no nested course structures)
 */
export async function isSectionFolder(
  folder: Directory,
  getItemName: (item: File | Directory) => string
): Promise<boolean> {
  try {
    const hasDirectVideos = await hasVideosInFolder(folder, getItemName);
    if (!hasDirectVideos) return false;

    // Check if any subfolder has videos (which would make this a course, not a section)
    const contents = folder.list();
    for (const item of contents) {
      const itemName = getItemName(item);
      const subDir = new Directory(folder, itemName);
      if (subDir.exists && (await hasVideosInFolder(subDir, getItemName))) {
        return false; // Has nested videos, so this is a course structure, not a section
      }
    }
    return true; // Has direct videos only, no nested videos - it's a section
  } catch {
    return false;
  }
}

/**
 * Analyze a folder as a SINGLE course (user explicitly chose "Add Course")
 * Always treats the selected folder as one course, regardless of structure
 */
export async function analyzeSingleCourse(
  folderPath: string,
  utils: FolderAnalyzerUtils
): Promise<StoredCourse | null> {
  try {
    const folder = new Directory(folderPath);
    if (!folder.exists) {
      return null;
    }

    // Check if folder has any video content (directly or in subfolders)
    const hasContent = await hasCourseContent(folder, utils.getItemName);
    if (!hasContent) {
      return null;
    }

    return {
      id: utils.generateId(folderPath),
      name: utils.cleanName(utils.extractFolderName(folderPath)),
      folderPath: folderPath,
      addedAt: Date.now(),
      icon: getRandomCourseIcon(),
    };
  } catch (error) {
    console.error('Error analyzing single course:', error);
    return null;
  }
}

/**
 * Analyze a folder to determine if it contains single or multiple courses
 * Used for "Add Multiple Courses" - auto-detects structure
 */
export async function analyzeMultipleCourses(
  folderPath: string,
  utils: FolderAnalyzerUtils
): Promise<{ type: 'single' | 'multiple'; courses: StoredCourse[] }> {
  try {
    const folder = new Directory(folderPath);
    if (!folder.exists) {
      return { type: 'single', courses: [] };
    }

    // Check if folder itself has videos (single course with flat structure)
    const directVideos = await hasVideosInFolder(folder, utils.getItemName);
    if (directVideos) {
      return {
        type: 'single',
        courses: [
          {
            id: utils.generateId(folderPath),
            name: utils.cleanName(utils.extractFolderName(folderPath)),
            folderPath: folderPath,
            addedAt: Date.now(),
            icon: getRandomCourseIcon(),
          },
        ],
      };
    }

    // Check subdirectories
    const contents = folder.list();

    // First, check if ALL subfolders are "section folders" (have videos directly, no deeper nesting)
    // This means the selected folder is a single course with sections
    let allAreSections = true;
    let hasAnySections = false;

    for (const item of contents) {
      const itemName = utils.getItemName(item);
      const subDir = new Directory(folder, itemName);

      if (subDir.exists) {
        const isSection = await isSectionFolder(subDir, utils.getItemName);
        const hasContent = await hasCourseContent(subDir, utils.getItemName);

        if (hasContent) {
          hasAnySections = true;
          if (!isSection) {
            // This subfolder has nested course structure, not just videos
            allAreSections = false;
          }
        }
      }
    }

    // If all content-containing subfolders are sections, treat as single course
    if (hasAnySections && allAreSections) {
      return {
        type: 'single',
        courses: [
          {
            id: utils.generateId(folderPath),
            name: utils.cleanName(utils.extractFolderName(folderPath)),
            folderPath: folderPath,
            addedAt: Date.now(),
            icon: getRandomCourseIcon(),
          },
        ],
      };
    }

    // Otherwise, treat each subfolder with course content as a separate course
    const potentialCourses: StoredCourse[] = [];
    for (const item of contents) {
      const itemName = utils.getItemName(item);
      const subDir = new Directory(folder, itemName);

      if (subDir.exists) {
        const hasContent = await hasCourseContent(subDir, utils.getItemName);
        if (hasContent) {
          potentialCourses.push({
            id: utils.generateId(subDir.uri),
            name: utils.cleanName(utils.extractFolderName(subDir.uri)),
            folderPath: subDir.uri,
            addedAt: Date.now(),
            icon: getRandomCourseIcon(),
          });
        }
      }
    }

    if (potentialCourses.length > 0) {
      return { type: 'multiple', courses: potentialCourses };
    }

    return { type: 'single', courses: [] };
  } catch (error) {
    console.error('Error analyzing folder:', error);
    return { type: 'single', courses: [] };
  }
}
