/**
 * Bookmark Resolver Module
 * Resolves iOS security-scoped bookmarks to restore access to directories after app restart
 */

import { Platform } from 'react-native';

// Only import the native module on iOS
let BookmarkResolver: {
  resolveBookmark: (bookmark: string) => Promise<boolean>;
  stopAccessing: (uri: string) => Promise<void>;
  stopAccessingAll: () => Promise<void>;
} | null = null;

if (Platform.OS === 'ios') {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    BookmarkResolver = requireNativeModule('BookmarkResolver');
  } catch (error) {
    console.warn('[BookmarkResolver] Failed to load native module:', error);
  }
}

/**
 * Resolve an iOS security-scoped bookmark and start accessing the resource
 * Must be called before accessing a directory that was picked with requestLongTermAccess
 *
 * @param bookmark - The base64-encoded bookmark string from pickDirectory
 * @returns true if access was granted, false otherwise
 */
export async function resolveBookmark(bookmark: string): Promise<boolean> {
  // On non-iOS platforms, just return true (no bookmark resolution needed)
  if (Platform.OS !== 'ios' || !BookmarkResolver) {
    return true;
  }

  try {
    const success = await BookmarkResolver.resolveBookmark(bookmark);
    return success;
  } catch (error) {
    console.error('[BookmarkResolver] Error resolving bookmark:', error);
    return false;
  }
}

/**
 * Stop accessing a security-scoped resource
 * Call this when you no longer need access (e.g., when removing a course)
 *
 * @param uri - The URI of the resource to stop accessing
 */
export async function stopAccessing(uri: string): Promise<void> {
  if (Platform.OS !== 'ios' || !BookmarkResolver) {
    return;
  }

  try {
    await BookmarkResolver.stopAccessing(uri);
  } catch (error) {
    console.warn('[BookmarkResolver] Error stopping access:', error);
  }
}

/**
 * Stop accessing all security-scoped resources
 * Useful for cleanup on app shutdown or when clearing all courses
 */
export async function stopAccessingAll(): Promise<void> {
  if (Platform.OS !== 'ios' || !BookmarkResolver) {
    return;
  }

  try {
    await BookmarkResolver.stopAccessingAll();
  } catch (error) {
    console.warn('[BookmarkResolver] Error stopping all access:', error);
  }
}
