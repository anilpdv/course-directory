/**
 * Course scanning utilities for reading course content from file system
 * Extracted from fileSystemService for better maintainability
 */

import { File, Directory } from 'expo-file-system/next';
import { Course, Section, Video, VideoFormat, StoredCourse } from '../types';
import { getRandomCourseIcon } from '../utils/courseIcons';
import { createContentSorter } from '../utils/sortingUtils';

// Supported video extensions
const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v'];

/**
 * Utility functions interface - passed from main service
 */
export interface CourseScannerUtils {
  generateId: (path: string) => string;
  cleanName: (name: string) => string;
  extractFolderName: (uri: string) => string;
  getItemName: (item: File | Directory) => string;
  cleanVideoName: (fileName: string) => string;
}

/**
 * Check if a filename is a video file
 */
function isVideoFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? SUPPORTED_VIDEO_EXTENSIONS.includes(extension) : false;
}

/**
 * Get video format from filename
 */
function getVideoFormat(fileName: string): VideoFormat {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'mp4') return 'mp4';
  if (extension === 'mov') return 'mov';
  if (extension === 'm4v') return 'm4v';
  return 'other';
}

/**
 * Scan videos in a folder
 */
async function scanVideosInFolder(
  folder: Directory,
  sectionId: string,
  courseId: string,
  utils: CourseScannerUtils
): Promise<Video[]> {
  const videos: Video[] = [];

  try {
    const contents = folder.list();
    const sorter = createContentSorter(utils.getItemName);
    const sortedContents = contents.sort(sorter);

    let videoOrder = 0;
    for (const item of sortedContents) {
      const fileName = utils.getItemName(item);
      if (isVideoFile(fileName)) {
        const videoFile = new File(folder, fileName);

        if (videoFile.exists) {
          videos.push({
            id: utils.generateId(videoFile.uri),
            name: utils.cleanVideoName(decodeURIComponent(fileName)),
            fileName: decodeURIComponent(fileName),
            filePath: videoFile.uri,
            format: getVideoFormat(fileName),
            size: videoFile.size || 0,
            order: videoOrder,
            sectionId,
            courseId,
          });
          videoOrder++;
        }
      }
    }
  } catch (error) {
    console.error('Error scanning videos:', error);
  }

  return videos;
}

/**
 * Scan a section folder
 */
async function scanSection(
  sectionDir: Directory,
  sectionName: string,
  courseId: string,
  order: number,
  utils: CourseScannerUtils
): Promise<Section> {
  const sectionId = utils.generateId(sectionDir.uri);
  const videos = await scanVideosInFolder(sectionDir, sectionId, courseId, utils);

  return {
    id: sectionId,
    name: utils.cleanName(utils.extractFolderName(sectionDir.uri)),
    folderPath: sectionDir.uri,
    order,
    courseId,
    videos,
  };
}

/**
 * Scan a course directory and return the course structure
 */
async function scanCourseDirectory(
  courseDir: Directory,
  courseName: string,
  utils: CourseScannerUtils
): Promise<Course> {
  const sections: Section[] = [];
  let totalVideos = 0;

  // Handle permission errors gracefully - folder access may be revoked
  let contents: (File | Directory)[];
  try {
    contents = courseDir.list();
  } catch (error) {
    console.warn(`Permission denied for course "${courseName}" - folder may need to be re-added`);
    // Return empty course - will be filtered out by scanAllCourses
    return {
      id: utils.generateId(courseDir.uri),
      name: courseName,
      folderPath: courseDir.uri,
      sections: [],
      totalVideos: 0,
      icon: getRandomCourseIcon(),
    };
  }

  const sorter = createContentSorter(utils.getItemName);
  const sortedContents = contents.sort(sorter);

  let sectionOrder = 0;
  for (const item of sortedContents) {
    const itemName = utils.getItemName(item);
    const itemDir = new Directory(courseDir, itemName);

    if (itemDir.exists) {
      try {
        const section = await scanSection(itemDir, itemName, utils.generateId(courseDir.uri), sectionOrder, utils);
        if (section.videos.length > 0) {
          sections.push(section);
          totalVideos += section.videos.length;
          sectionOrder++;
        }
      } catch (e) {
        // Skip inaccessible folders
      }
    }
  }

  // If no sections found, check for videos directly in course folder
  if (sections.length === 0) {
    const flatCourseId = utils.generateId(courseDir.uri);
    const flatSectionId = utils.generateId(`${courseDir.uri}/main`);
    const directVideos = await scanVideosInFolder(courseDir, flatSectionId, flatCourseId, utils);
    if (directVideos.length > 0) {
      sections.push({
        id: flatSectionId,
        name: 'Videos',
        folderPath: courseDir.uri,
        order: 0,
        courseId: flatCourseId,
        videos: directVideos,
      });
      totalVideos = directVideos.length;
    }
  }

  return {
    id: utils.generateId(courseDir.uri),
    name: utils.cleanName(utils.extractFolderName(courseDir.uri)),
    folderPath: courseDir.uri,
    sections,
    totalVideos,
    icon: getRandomCourseIcon(),
  };
}

/**
 * Scan a single course from its stored reference
 */
export async function scanSingleCourse(
  storedCourse: StoredCourse,
  utils: CourseScannerUtils
): Promise<Course | null> {
  try {
    const courseDir = new Directory(storedCourse.folderPath);
    if (!courseDir.exists) {
      console.warn(`Course folder not found: "${storedCourse.name}" - it may have been moved or deleted`);
      return null;
    }

    const course = await scanCourseDirectory(courseDir, storedCourse.name, utils);

    // If course has no videos, it likely had a permission error
    if (course.totalVideos === 0) {
      return null;
    }

    // Use stored ID and icon for consistency
    course.id = storedCourse.id;
    course.name = storedCourse.name;
    course.icon = storedCourse.icon;
    return course;
  } catch (error) {
    // Handle permission errors gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('permission')) {
      console.warn(`Permission denied for "${storedCourse.name}" - folder may need to be re-added`);
    } else {
      console.error(`Error scanning course "${storedCourse.name}":`, error);
    }
    return null;
  }
}

/**
 * Scan all stored courses
 */
export async function scanAllCourses(
  storedCourses: StoredCourse[],
  utils: CourseScannerUtils
): Promise<Course[]> {
  const courses: Course[] = [];

  for (const stored of storedCourses) {
    const course = await scanSingleCourse(stored, utils);
    if (course && course.totalVideos > 0) {
      courses.push(course);
    }
  }

  return courses;
}
