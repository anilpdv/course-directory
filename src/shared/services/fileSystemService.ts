import { File, Directory } from 'expo-file-system/next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, Section, Video, VideoFormat, StoredCourse } from '../types';
import { getRandomCourseIcon } from '../utils/courseIcons';

const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v'];
const COURSES_DATA_KEY = '@courseviewer/courses_data';
const OLD_COURSES_PATH_KEY = '@courseviewer/courses_path'; // For migration

class FileSystemService {
  // Pick a folder (no persistence, just returns the path)
  async pickFolder(): Promise<string | null> {
    try {
      const directory = await Directory.pickDirectoryAsync();
      return directory ? directory.uri : null;
    } catch (error) {
      console.error('Error picking folder:', error);
      return null;
    }
  }

  // Get stored courses from AsyncStorage
  async getStoredCourses(): Promise<StoredCourse[]> {
    try {
      const data = await AsyncStorage.getItem(COURSES_DATA_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const courses: StoredCourse[] = parsed.courses || [];

        // Migrate existing courses without icons
        let needsSave = false;
        for (const course of courses) {
          if (!course.icon) {
            course.icon = getRandomCourseIcon();
            needsSave = true;
          }
        }

        if (needsSave) {
          await this.saveStoredCourses(courses);
        }

        return courses;
      }
      return [];
    } catch (error) {
      console.error('Error loading stored courses:', error);
      return [];
    }
  }

  // Save stored courses to AsyncStorage
  async saveStoredCourses(courses: StoredCourse[]): Promise<void> {
    try {
      await AsyncStorage.setItem(COURSES_DATA_KEY, JSON.stringify({ courses }));
    } catch (error) {
      console.error('Error saving stored courses:', error);
    }
  }

  // Clear all courses data from AsyncStorage
  async clearCoursesData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(COURSES_DATA_KEY);
    } catch (error) {
      console.error('Error clearing courses data:', error);
    }
  }

  // Migration from old single-path format
  async migrateFromSinglePath(): Promise<StoredCourse[]> {
    try {
      const oldPath = await AsyncStorage.getItem(OLD_COURSES_PATH_KEY);
      if (oldPath) {
        const analysis = await this.analyzeFolder(oldPath);
        if (analysis.courses.length > 0) {
          await this.saveStoredCourses(analysis.courses);
          await AsyncStorage.removeItem(OLD_COURSES_PATH_KEY);
          return analysis.courses;
        }
      }
      return [];
    } catch (error) {
      console.error('Error migrating from old format:', error);
      return [];
    }
  }

  // Analyze a folder as a SINGLE course (user explicitly chose "Add Course")
  // Always treats the selected folder as one course, regardless of structure
  async analyzeSingleCourse(folderPath: string): Promise<StoredCourse | null> {
    try {
      const folder = new Directory(folderPath);
      if (!folder.exists) {
        return null;
      }

      // Check if folder has any video content (directly or in subfolders)
      const hasContent = await this.hasCourseContent(folder);
      if (!hasContent) {
        return null;
      }

      return {
        id: this.generateId(folderPath),
        name: this.cleanName(this.extractFolderName(folderPath)),
        folderPath: folderPath,
        addedAt: Date.now(),
        icon: getRandomCourseIcon(),
      };
    } catch (error) {
      console.error('Error analyzing single course:', error);
      return null;
    }
  }

  // Analyze a folder to determine if it contains single or multiple courses
  // Used for "Add Multiple Courses" - auto-detects structure
  async analyzeMultipleCourses(folderPath: string): Promise<{
    type: 'single' | 'multiple';
    courses: StoredCourse[];
  }> {
    try {
      const folder = new Directory(folderPath);
      if (!folder.exists) {
        return { type: 'single', courses: [] };
      }

      // Check if folder itself has videos (single course with flat structure)
      const directVideos = await this.hasVideosInFolder(folder);
      if (directVideos) {
        return {
          type: 'single',
          courses: [{
            id: this.generateId(folderPath),
            name: this.cleanName(this.extractFolderName(folderPath)),
            folderPath: folderPath,
            addedAt: Date.now(),
            icon: getRandomCourseIcon(),
          }]
        };
      }

      // Check subdirectories
      const contents = folder.list();

      // First, check if ALL subfolders are "section folders" (have videos directly, no deeper nesting)
      // This means the selected folder is a single course with sections
      let allAreSections = true;
      let hasAnySections = false;

      for (const item of contents) {
        const itemName = this.getItemName(item);
        const subDir = new Directory(folder, itemName);

        if (subDir.exists) {
          const isSection = await this.isSectionFolder(subDir);
          const hasContent = await this.hasCourseContent(subDir);

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
          courses: [{
            id: this.generateId(folderPath),
            name: this.cleanName(this.extractFolderName(folderPath)),
            folderPath: folderPath,
            addedAt: Date.now(),
            icon: getRandomCourseIcon(),
          }]
        };
      }

      // Otherwise, treat each subfolder with course content as a separate course
      const potentialCourses: StoredCourse[] = [];
      for (const item of contents) {
        const itemName = this.getItemName(item);
        const subDir = new Directory(folder, itemName);

        if (subDir.exists) {
          const hasContent = await this.hasCourseContent(subDir);
          if (hasContent) {
            potentialCourses.push({
              id: this.generateId(subDir.uri),
              name: this.cleanName(this.extractFolderName(subDir.uri)),
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

  // Keep analyzeFolder as an alias for backward compatibility (migration)
  async analyzeFolder(folderPath: string): Promise<{
    type: 'single' | 'multiple';
    courses: StoredCourse[];
  }> {
    return this.analyzeMultipleCourses(folderPath);
  }

  // Check if a folder has videos directly in it
  private async hasVideosInFolder(folder: Directory): Promise<boolean> {
    try {
      const contents = folder.list();
      return contents.some(item => this.isVideoFile(this.getItemName(item)));
    } catch {
      return false;
    }
  }

  // Check if a folder is a course (has videos at any level)
  private async hasCourseContent(folder: Directory): Promise<boolean> {
    try {
      // Check direct videos
      if (await this.hasVideosInFolder(folder)) return true;

      // Check subdirectories (sections)
      const contents = folder.list();
      for (const item of contents) {
        const itemName = this.getItemName(item);
        const subDir = new Directory(folder, itemName);
        if (subDir.exists && await this.hasVideosInFolder(subDir)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  // Check if a folder is a "section" (has videos directly but no nested course structures)
  private async isSectionFolder(folder: Directory): Promise<boolean> {
    try {
      const hasDirectVideos = await this.hasVideosInFolder(folder);
      if (!hasDirectVideos) return false;

      // Check if any subfolder has videos (which would make this a course, not a section)
      const contents = folder.list();
      for (const item of contents) {
        const itemName = this.getItemName(item);
        const subDir = new Directory(folder, itemName);
        if (subDir.exists && await this.hasVideosInFolder(subDir)) {
          return false; // Has nested videos, so this is a course structure, not a section
        }
      }
      return true; // Has direct videos only, no nested videos - it's a section
    } catch {
      return false;
    }
  }

  // Check if a folder has course structure (subfolders with videos)
  private async hasCourseStructure(folder: Directory): Promise<boolean> {
    try {
      const contents = folder.list();
      for (const item of contents) {
        const itemName = this.getItemName(item);
        const subDir = new Directory(folder, itemName);
        if (subDir.exists && await this.hasCourseContent(subDir)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  // Scan a single course from its stored reference
  async scanSingleCourse(storedCourse: StoredCourse): Promise<Course | null> {
    try {
      const courseDir = new Directory(storedCourse.folderPath);
      if (!courseDir.exists) {
        console.warn(`Course folder not found: "${storedCourse.name}" - it may have been moved or deleted`);
        return null;
      }

      const course = await this.scanCourseDirectory(courseDir, storedCourse.name);

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

  // Scan all stored courses
  async scanAllCourses(storedCourses: StoredCourse[]): Promise<Course[]> {
    const courses: Course[] = [];

    for (const stored of storedCourses) {
      const course = await this.scanSingleCourse(stored);
      if (course && course.totalVideos > 0) {
        courses.push(course);
      }
    }

    return courses;
  }

  private getItemName(item: File | Directory): string {
    if ('name' in item && typeof item.name === 'string') {
      return item.name;
    }
    const uri = item.uri;
    const lastSlash = uri.lastIndexOf('/');
    return lastSlash >= 0 ? uri.substring(lastSlash + 1) : uri;
  }

  private extractFolderName(uri: string): string {
    const decoded = decodeURIComponent(uri);
    const cleanPath = decoded.replace(/^file:\/\//, '').replace(/\/+$/, '');
    const parts = cleanPath.split('/');
    const name = parts[parts.length - 1];

    if (name.includes('.') && name.split('.').length > 2) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        if (!part.includes('.') || part.split('.').length <= 2) {
          if (part && part !== 'File Provider Storage' && !part.match(/^[A-F0-9-]{36}$/i)) {
            return part;
          }
        }
      }
    }

    return name || 'Videos';
  }

  private async scanCourseDirectory(courseDir: Directory, courseName: string): Promise<Course> {
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
        id: this.generateId(courseDir.uri),
        name: courseName,
        folderPath: courseDir.uri,
        sections: [],
        totalVideos: 0,
        icon: getRandomCourseIcon(),
      };
    }

    const sortedContents = contents.sort((a, b) => {
      const orderA = this.extractOrder(this.getItemName(a));
      const orderB = this.extractOrder(this.getItemName(b));

      // Primary sort by number
      if (orderA.primary !== orderB.primary) {
        return orderA.primary - orderB.primary;
      }

      // Secondary sort alphabetically (for equal numbers or no numbers)
      return orderA.secondary.localeCompare(orderB.secondary, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });

    let sectionOrder = 0;
    for (const item of sortedContents) {
      const itemName = this.getItemName(item);
      const itemDir = new Directory(courseDir, itemName);

      if (itemDir.exists) {
        try {
          const section = await this.scanSection(
            itemDir,
            itemName,
            this.generateId(courseDir.uri),
            sectionOrder
          );
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

    if (sections.length === 0) {
      const flatCourseId = this.generateId(courseDir.uri);
      const flatSectionId = this.generateId(`${courseDir.uri}/main`);
      const directVideos = await this.scanVideosInFolder(
        courseDir,
        flatSectionId,
        flatCourseId
      );
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
      id: this.generateId(courseDir.uri),
      name: this.cleanName(this.extractFolderName(courseDir.uri)),
      folderPath: courseDir.uri,
      sections,
      totalVideos,
      icon: getRandomCourseIcon(),
    };
  }

  private async scanSection(
    sectionDir: Directory,
    sectionName: string,
    courseId: string,
    order: number
  ): Promise<Section> {
    const sectionId = this.generateId(sectionDir.uri);
    const videos = await this.scanVideosInFolder(sectionDir, sectionId, courseId);

    return {
      id: sectionId,
      name: this.cleanName(this.extractFolderName(sectionDir.uri)),
      folderPath: sectionDir.uri,
      order,
      courseId,
      videos,
    };
  }

  private async scanVideosInFolder(
    folder: Directory,
    sectionId: string,
    courseId: string
  ): Promise<Video[]> {
    const videos: Video[] = [];

    try {
      const contents = folder.list();
      const sortedContents = contents.sort((a, b) => {
        const orderA = this.extractOrder(this.getItemName(a));
        const orderB = this.extractOrder(this.getItemName(b));

        // Primary sort by number
        if (orderA.primary !== orderB.primary) {
          return orderA.primary - orderB.primary;
        }

        // Secondary sort alphabetically (for equal numbers or no numbers)
        return orderA.secondary.localeCompare(orderB.secondary, undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      });

      let videoOrder = 0;
      for (const item of sortedContents) {
        const fileName = this.getItemName(item);
        if (this.isVideoFile(fileName)) {
          const videoFile = new File(folder, fileName);

          if (videoFile.exists) {
            videos.push({
              id: this.generateId(videoFile.uri),
              name: this.cleanVideoName(decodeURIComponent(fileName)),
              fileName: decodeURIComponent(fileName),
              filePath: videoFile.uri,
              format: this.getVideoFormat(fileName),
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

  private isVideoFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? SUPPORTED_VIDEO_EXTENSIONS.includes(extension) : false;
  }

  private getVideoFormat(fileName: string): VideoFormat {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'mp4') return 'mp4';
    if (extension === 'mov') return 'mov';
    if (extension === 'm4v') return 'm4v';
    return 'other';
  }

  private extractOrder(name: string): { primary: number; secondary: string } {
    // Try multiple patterns in order of priority

    // Pattern 1: Number at start (with optional brackets)
    // Matches: "01 Video", "[01] Video", "(01) Video", "01. Video", "01_Video"
    let match = name.match(/^[\[\(]?(\d+)[\]\)]?[\s._-]*/);
    if (match) {
      return { primary: parseInt(match[1], 10), secondary: name };
    }

    // Pattern 2: "Lesson/Chapter/Part X" format
    // Matches: "Lesson 01", "Chapter 1", "Part 05"
    match = name.match(/^(?:lesson|chapter|part|section|module|unit|video|lecture)\s*(\d+)/i);
    if (match) {
      return { primary: parseInt(match[1], 10), secondary: name };
    }

    // Pattern 3: Any number in the filename (first occurrence)
    // Matches: "Video 01", "My Video 1", etc.
    match = name.match(/(\d+)/);
    if (match) {
      return { primary: parseInt(match[1], 10), secondary: name };
    }

    // No number found - sort alphabetically at the end
    return { primary: Infinity, secondary: name };
  }

  private cleanName(name: string): string {
    return name
      .replace(/^[\[\(]?\d+[\]\)]?[\s._-]+/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
  }

  private cleanVideoName(fileName: string): string {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    return this.cleanName(nameWithoutExt);
  }

  private generateId(path: string): string {
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      const char = path.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

export const fileSystemService = new FileSystemService();
