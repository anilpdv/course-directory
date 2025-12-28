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

// Course context state
export interface CoursesState {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  coursesPath: string | null;
  hasSelectedFolder: boolean;
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
  | { type: 'SET_COURSES_PATH'; payload: string | null };

export type ProgressAction =
  | { type: 'LOAD_PROGRESS'; payload: ProgressData }
  | { type: 'UPDATE_VIDEO_PROGRESS'; payload: VideoProgress }
  | { type: 'CLEAR_PROGRESS' };
