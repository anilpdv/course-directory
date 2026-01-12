import { Video } from '@shared/types';

export interface VideoPlayerParams {
  videoId: string;
  videoPath: string;
  videoName: string;
  courseId: string;
  sectionId: string;
  isFullscreen?: string; // "true" or "false" (route params are strings)
}

export interface PlaybackState {
  isPlaying: boolean;
  playbackRateIndex: number;
  currentRate: number;
}

export interface ProgressState {
  currentTime: number;
  duration: number;
  progressPercent: number;
}

export interface ControlsState {
  isVisible: boolean;
  isSeeking: boolean;
}

export interface OrientationState {
  isFullscreen: boolean;
}

export interface AutoPlayState {
  showNextVideoOverlay: boolean;
  countdown: number;
  nextVideo: Video | null;
}

export interface VideoNavigationState {
  sectionVideos: Video[];
  currentVideoIndex: number;
}
