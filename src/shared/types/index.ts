// Video file information
export interface Video {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  format: VideoFormat;
  size: number;
  order: number;
  sectionId: string;
  courseId: string;
}

export type VideoFormat = 'mp4' | 'mov' | 'm4v' | 'other';

// Section (folder containing videos)
export interface Section {
  id: string;
  name: string;
  folderPath: string;
  order: number;
  courseId: string;
  videos: Video[];
}

// Course (top-level folder)
export interface Course {
  id: string;
  name: string;
  folderPath: string;
  sections: Section[];
  totalVideos: number;
  icon: string;
}

// Video progress tracking
export interface VideoProgress {
  videoId: string;
  lastPosition: number;
  duration: number;
  percentComplete: number;
  isComplete: boolean;
  lastWatchedAt: number;
}

// All progress data
export interface ProgressData {
  videos: Record<string, VideoProgress>;
}

// App settings
export interface AppSettings {
  completionThreshold: number;
  autoPlayNext: boolean;
  defaultPlaybackRate: number;
}

// Stored course reference (persisted to AsyncStorage)
export interface StoredCourse {
  id: string;
  name: string;
  folderPath: string;
  addedAt: number;
  icon: string;
  // iOS security-scoped bookmark for persistent folder access
  iosBookmark?: string;
  // Bookmark health status
  bookmarkStatus?: 'valid' | 'expired' | 'missing';
}

// Course context state
export interface CoursesState {
  courses: Course[];
  storedCourses: StoredCourse[];
  isLoading: boolean;
  error: string | null;
  hasCourses: boolean;
}

// Progress context state
export interface ProgressState {
  data: ProgressData;
  isLoaded: boolean;
}

// Context action types
export type CoursesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STORED_COURSES'; payload: StoredCourse[] }
  | { type: 'ADD_STORED_COURSES'; payload: StoredCourse[] }
  | { type: 'REMOVE_STORED_COURSE'; payload: string };

export type ProgressAction =
  | { type: 'LOAD_PROGRESS'; payload: ProgressData }
  | { type: 'UPDATE_VIDEO_PROGRESS'; payload: VideoProgress }
  | { type: 'CLEAR_PROGRESS' };

// Tag definition
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

// Tags state for context
export interface TagsState {
  tags: Tag[];
  courseTags: Record<string, string[]>; // courseId -> tagId[]
  isLoaded: boolean;
}

// Tags actions
export type TagsAction =
  | { type: 'LOAD_TAGS'; payload: { tags: Tag[]; courseTags: Record<string, string[]> } }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'ASSIGN_TAG'; payload: { courseId: string; tagId: string } }
  | { type: 'UNASSIGN_TAG'; payload: { courseId: string; tagId: string } }
  | { type: 'SET_COURSE_TAGS'; payload: { courseId: string; tagIds: string[] } }
  | { type: 'CLEAR_ALL_TAGS' };

// Filter state
export interface TagFilter {
  selectedTagIds: string[];
  filterMode: 'any' | 'all';
}

// Learning Statistics
export interface DailyStats {
  date: string; // YYYY-MM-DD
  watchTimeSeconds: number;
  videosCompleted: number;
}

export interface StatisticsData {
  totalWatchTimeSeconds: number;
  totalVideosCompleted: number;
  totalCoursesCompleted: number;
  dailyStats: Record<string, DailyStats>; // date -> stats
  currentStreak: number;
  longestStreak: number;
  lastWatchDate: string | null;
}

export interface StatisticsState {
  data: StatisticsData;
  isLoaded: boolean;
}

export type StatisticsAction =
  | { type: 'LOAD_STATISTICS'; payload: StatisticsData }
  | { type: 'UPDATE_WATCH_TIME'; payload: { seconds: number; date: string } }
  | { type: 'INCREMENT_VIDEOS_COMPLETED'; payload: { date: string } }
  | { type: 'UPDATE_COURSES_COMPLETED'; payload: number }
  | { type: 'CLEAR_STATISTICS' };

// Result type for error handling
export { Result, success, failure } from './result';
