import { File, Directory } from 'expo-file-system/next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, Section, Video, VideoFormat, StoredCourse } from '../types';

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
        return parsed.courses || [];
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

  // Analyze a folder to determine if it contains single or multiple courses
  async analyzeFolder(folderPath: string): Promise<{
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
          }]
        };
      }

      // Check subdirectories
      const contents = folder.list();
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
            });
          }
        }
      }

      if (potentialCourses.length > 0) {
        return { type: 'multiple', courses: potentialCourses };
      }

      // Check if folder has section subdirectories (folders with videos) - treat as single course
      for (const item of contents) {
        const itemName = this.getItemName(item);
        const subDir = new Directory(folder, itemName);
        if (subDir.exists) {
          const hasVideos = await this.hasVideosInFolder(subDir);
          if (hasVideos) {
            return {
              type: 'single',
              courses: [{
                id: this.generateId(folderPath),
                name: this.cleanName(this.extractFolderName(folderPath)),
                folderPath: folderPath,
                addedAt: Date.now(),
              }]
            };
          }
        }
      }

      return { type: 'single', courses: [] };
    } catch (error) {
      console.error('Error analyzing folder:', error);
      return { type: 'single', courses: [] };
    }
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

  // Scan a single course from its stored reference
  async scanSingleCourse(storedCourse: StoredCourse): Promise<Course | null> {
    try {
      const courseDir = new Directory(storedCourse.folderPath);
      if (!courseDir.exists) {
        return null;
      }

      const course = await this.scanCourseDirectory(courseDir, storedCourse.name);
      // Use stored ID for consistency
      course.id = storedCourse.id;
      course.name = storedCourse.name;
      return course;
    } catch (error) {
      console.error(`Error scanning course ${storedCourse.name}:`, error);
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

    const contents = courseDir.list();
    const sortedContents = contents.sort((a, b) =>
      this.extractOrder(this.getItemName(a)) - this.extractOrder(this.getItemName(b))
    );

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
      const sortedContents = contents.sort((a, b) =>
        this.extractOrder(this.getItemName(a)) - this.extractOrder(this.getItemName(b))
      );

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

  private extractOrder(name: string): number {
    const match = name.match(/^[\[\(]?(\d+)[\]\)]?[\s._-]*/);
    return match ? parseInt(match[1], 10) : Infinity;
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
