/**
 * Folder Picker Service
 * Handles platform-specific folder selection with persistent access (iOS bookmarks)
 */

import { Platform } from 'react-native';
import { Directory } from 'expo-file-system/next';
import {
  pickDirectory,
  releaseLongTermAccess,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';

/**
 * Result from picking a folder
 */
export interface FolderPickResult {
  uri: string;
  iosBookmark?: string;
  bookmarkStatus: 'success' | 'error' | 'not_applicable';
}

class FolderPickerService {
  /**
   * Pick a folder with long-term access (iOS bookmark)
   * On iOS, creates a security-scoped bookmark for persistent access
   * On Android, uses SAF which handles persistence automatically
   */
  async pickFolder(): Promise<FolderPickResult | null> {
    try {
      if (Platform.OS === 'ios') {
        return await this.pickFolderIOS();
      } else if (Platform.OS === 'android') {
        return await this.pickFolderAndroid();
      }
      // Fallback for other platforms (e.g., web during development)
      return await this.pickFolderFallback();
    } catch (error) {
      // User cancelled
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return null;
      }
      console.error('Error picking folder:', error);
      return null;
    }
  }

  /**
   * iOS: Use @react-native-documents/picker with bookmark
   */
  private async pickFolderIOS(): Promise<FolderPickResult | null> {
    const result = await pickDirectory({
      requestLongTermAccess: true,
    });

    if (!result) {
      return null;
    }

    // Check if bookmark was successfully created
    if (result.bookmarkStatus === 'success') {
      return {
        uri: result.uri,
        iosBookmark: result.bookmark,
        bookmarkStatus: 'success',
      };
    } else {
      // Bookmark creation failed but we still have the URI for this session
      console.warn('iOS bookmark creation failed:', 'bookmarkError' in result ? result.bookmarkError : 'Unknown error');
      return {
        uri: result.uri,
        bookmarkStatus: 'error',
      };
    }
  }

  /**
   * Android: Use @react-native-documents/picker (SAF handles persistence)
   */
  private async pickFolderAndroid(): Promise<FolderPickResult | null> {
    const result = await pickDirectory({
      requestLongTermAccess: true,
    });

    if (!result) {
      return null;
    }

    return {
      uri: result.uri,
      bookmarkStatus: 'not_applicable',
    };
  }

  /**
   * Fallback: Use expo-file-system Directory picker (for development/web)
   */
  private async pickFolderFallback(): Promise<FolderPickResult | null> {
    try {
      const directory = await Directory.pickDirectoryAsync();
      if (!directory) return null;

      return {
        uri: directory.uri,
        bookmarkStatus: 'not_applicable',
      };
    } catch (error) {
      console.error('Fallback picker error:', error);
      return null;
    }
  }

  /**
   * Release long-term access when removing a course
   * Only needed on Android (SAF cleanup)
   */
  async releaseFolderAccess(uri: string): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await releaseLongTermAccess([uri]);
      } catch (error) {
        console.warn('Failed to release folder access:', error);
      }
    }
  }
}

export const folderPickerService = new FolderPickerService();
