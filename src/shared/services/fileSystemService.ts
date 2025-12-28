import { File, Directory } from 'expo-file-system/next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, Section, Video, VideoFormat } from '../types';

const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v'];
const COURSES_PATH_KEY = '@courseviewer/courses_path';

class FileSystemService {
  private cachedCoursesPath: string | null = null;

  async getCoursesPath(): Promise<string | null> {
    if (this.cachedCoursesPath) {
      return this.cachedCoursesPath;
    }
    const path = await AsyncStorage.getItem(COURSES_PATH_KEY);
    this.cachedCoursesPath = path;
    return path;
  }

  async setCoursesPath(path: string): Promise<void> {
    await AsyncStorage.setItem(COURSES_PATH_KEY, path);
    this.cachedCoursesPath = path;
  }

  async clearCoursesPath(): Promise<void> {
    await AsyncStorage.removeItem(COURSES_PATH_KEY);
    this.cachedCoursesPath = null;
  }

  async pickCoursesFolder(): Promise<string | null> {
    try {
      const directory = await Directory.pickDirectoryAsync();

      if (directory) {
        const dirPath = directory.uri;
        await this.setCoursesPath(dirPath);
        return dirPath;
      }
      return null;
    } catch (error) {
      console.error('Error picking folder:', error);
      return null;
    }
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

  async scanCourses(): Promise<Course[]> {
    const coursesPath = await this.getCoursesPath();

    if (!coursesPath) {
      return [];
    }

    const courses: Course[] = [];

    try {
      const coursesDir = new Directory(coursesPath);

      if (!coursesDir.exists) {
        return courses;
      }

      const courseId = this.generateId(coursesDir.uri);
      const mainSectionId = this.generateId(`${coursesDir.uri}/main`);
      const directVideos = await this.scanVideosInFolder(
        coursesDir,
        mainSectionId,
        courseId
      );

      if (directVideos.length > 0) {
        const folderName = this.extractFolderName(coursesDir.uri);
        courses.push({
          id: this.generateId(coursesDir.uri),
          name: this.cleanName(decodeURIComponent(folderName)),
          folderPath: coursesDir.uri,
          sections: [{
            id: this.generateId(`${coursesDir.uri}/main`),
            name: 'Videos',
            folderPath: coursesDir.uri,
            order: 0,
            courseId: this.generateId(coursesDir.uri),
            videos: directVideos,
          }],
          totalVideos: directVideos.length,
        });
        return courses;
      }

      const contents = coursesDir.list();
      const sortedContents = contents.sort((a, b) =>
        this.getItemName(a).localeCompare(this.getItemName(b))
      );

      for (const item of sortedContents) {
        const courseName = this.getItemName(item);
        const courseDir = new Directory(coursesDir, courseName);

        if (courseDir.exists) {
          try {
            const course = await this.scanCourse(courseDir, courseName);
            if (course.sections.length > 0 || course.totalVideos > 0) {
              courses.push(course);
            }
          } catch (e) {
            console.log(`Skipping folder: ${courseName}`);
          }
        }
      }
    } catch (error) {
      console.error('Error scanning courses:', error);
    }

    return courses;
  }

  private async scanCourse(courseDir: Directory, courseName: string): Promise<Course> {
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
