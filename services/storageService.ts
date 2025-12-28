import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressData, AppSettings } from '../types';

const KEYS = {
  PROGRESS: '@courseviewer/progress',
  SETTINGS: '@courseviewer/settings',
  LAST_PLAYED: '@courseviewer/last_played',
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
}

export const storageService = new StorageService();
