/**
 * File System Service
 * Main facade for file system operations, delegating to specialized modules
 */

import { File, Directory } from 'expo-file-system/next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, StoredCourse } from '../types';
import { getRandomCourseIcon } from '../utils/courseIcons';
import {
  analyzeSingleCourse as analyzeFolder,
  analyzeMultipleCourses as analyzeFolders,
  FolderAnalyzerUtils,
} from './folderAnalyzer';
import { scanSingleCourse as scanCourse, scanAllCourses as scanCourses, CourseScannerUtils } from './courseScanner';

const COURSES_DATA_KEY = '@courseviewer/courses_data';
const OLD_COURSES_PATH_KEY = '@courseviewer/courses_path'; // For migration

class FileSystemService {
  // Shared utility methods used by analyzer and scanner modules
  private utils: FolderAnalyzerUtils & CourseScannerUtils;

  constructor() {
    this.utils = {
      generateId: this.generateId.bind(this),
      cleanName: this.cleanName.bind(this),
      extractFolderName: this.extractFolderName.bind(this),
      getItemName: this.getItemName.bind(this),
      cleanVideoName: this.cleanVideoName.bind(this),
    };
  }

  // === Folder Picker ===

  async pickFolder(): Promise<string | null> {
    try {
      const directory = await Directory.pickDirectoryAsync();
      return directory ? directory.uri : null;
    } catch (error) {
      console.error('Error picking folder:', error);
      return null;
    }
  }

  // === Storage Operations ===

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

  async saveStoredCourses(courses: StoredCourse[]): Promise<void> {
    try {
      await AsyncStorage.setItem(COURSES_DATA_KEY, JSON.stringify({ courses }));
    } catch (error) {
      console.error('Error saving stored courses:', error);
    }
  }

  async clearCoursesData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(COURSES_DATA_KEY);
    } catch (error) {
      console.error('Error clearing courses data:', error);
    }
  }

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

  // === Folder Analysis (delegated to folderAnalyzer) ===

  async analyzeSingleCourse(folderPath: string): Promise<StoredCourse | null> {
    return analyzeFolder(folderPath, this.utils);
  }

  async analyzeMultipleCourses(
    folderPath: string
  ): Promise<{ type: 'single' | 'multiple'; courses: StoredCourse[] }> {
    return analyzeFolders(folderPath, this.utils);
  }

  // Alias for backward compatibility (migration)
  async analyzeFolder(
    folderPath: string
  ): Promise<{ type: 'single' | 'multiple'; courses: StoredCourse[] }> {
    return this.analyzeMultipleCourses(folderPath);
  }

  // === Course Scanning (delegated to courseScanner) ===

  async scanSingleCourse(storedCourse: StoredCourse): Promise<Course | null> {
    return scanCourse(storedCourse, this.utils);
  }

  async scanAllCourses(storedCourses: StoredCourse[]): Promise<Course[]> {
    return scanCourses(storedCourses, this.utils);
  }

  // === Private Utility Methods ===

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
