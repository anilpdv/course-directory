import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressData, AppSettings, Tag } from '../types';

const KEYS = {
  PROGRESS: '@courseviewer/progress',
  SETTINGS: '@courseviewer/settings',
  LAST_PLAYED: '@courseviewer/last_played',
  TAGS: '@courseviewer/tags',
  COURSE_TAGS: '@courseviewer/course_tags',
};

const DEFAULT_SETTINGS: AppSettings = {
  completionThreshold: 0.9,
  autoPlayNext: true,
  defaultPlaybackRate: 1.0,
};

const DEFAULT_PROGRESS: ProgressData = {
  videos: {},
};

class StorageService {
  async getProgress(): Promise<ProgressData> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROGRESS);
      return data ? JSON.parse(data) : DEFAULT_PROGRESS;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return DEFAULT_PROGRESS;
    }
  }

  async saveProgress(progress: ProgressData): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async setLastPlayed(videoId: string, position: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        KEYS.LAST_PLAYED,
        JSON.stringify({ videoId, position, timestamp: Date.now() })
      );
    } catch (error) {
      console.error('Failed to save last played:', error);
    }
  }

  async getLastPlayed(): Promise<{ videoId: string; position: number } | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.LAST_PLAYED);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get last played:', error);
      return null;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEYS.PROGRESS, KEYS.SETTINGS, KEYS.LAST_PLAYED]);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  // Tag storage methods
  async getTags(): Promise<Tag[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TAGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load tags:', error);
      return [];
    }
  }

  async saveTags(tags: Tag[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TAGS, JSON.stringify(tags));
    } catch (error) {
      console.error('Failed to save tags:', error);
    }
  }

  async getCourseTags(): Promise<Record<string, string[]>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.COURSE_TAGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load course tags:', error);
      return {};
    }
  }

  async saveCourseTags(courseTags: Record<string, string[]>): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.COURSE_TAGS, JSON.stringify(courseTags));
    } catch (error) {
      console.error('Failed to save course tags:', error);
    }
  }

  async clearTagsData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEYS.TAGS, KEYS.COURSE_TAGS]);
    } catch (error) {
      console.error('Failed to clear tags data:', error);
    }
  }
}

export const storageService = new StorageService();
