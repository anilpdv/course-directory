import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { ProgressData, ProgressState, ProgressAction, VideoProgress, Course, Section } from '../types';
import { storageService } from '../services/storageService';

const COMPLETION_THRESHOLD = 0.9; // 90%

const initialState: ProgressState = {
  data: { videos: {} },
  isLoaded: false,
};

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'LOAD_PROGRESS':
      return { data: action.payload, isLoaded: true };
    case 'UPDATE_VIDEO_PROGRESS':
      return {
        ...state,
        data: {
          ...state.data,
          videos: {
            ...state.data.videos,
            [action.payload.videoId]: action.payload,
          },
        },
      };
    case 'CLEAR_PROGRESS':
      return { data: { videos: {} }, isLoaded: true };
    default:
      return state;
  }
}

interface ProgressContextType {
  state: ProgressState;
  updateVideoProgress: (
    videoId: string,
    currentTime: number,
    duration: number
  ) => void;
  getVideoProgress: (videoId: string) => VideoProgress | undefined;
  getSectionProgress: (section: Section) => { completed: number; total: number; percent: number };
  getCourseProgress: (course: Course) => { completed: number; total: number; percent: number };
  clearAllProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  // Use ref to access latest videos state without creating dependency
  const videosRef = useRef(state.data.videos);
  useEffect(() => {
    videosRef.current = state.data.videos;
  }, [state.data.videos]);

  // Load progress from storage on mount
  useEffect(() => {
    const loadProgress = async () => {
      const progress = await storageService.getProgress();
      dispatch({ type: 'LOAD_PROGRESS', payload: progress });
    };
    loadProgress();
  }, []);

  // Save progress to storage whenever it changes (with debouncing potential)
  useEffect(() => {
    if (state.isLoaded) {
      storageService.saveProgress(state.data);
    }
  }, [state.data, state.isLoaded]);

  const updateVideoProgress = useCallback(
    (videoId: string, currentTime: number, duration: number) => {
      const existingProgress = videosRef.current[videoId];
      const maxPosition = Math.max(existingProgress?.lastPosition || 0, currentTime);
      const percentComplete = duration > 0 ? (maxPosition / duration) * 100 : 0;
      const isComplete = percentComplete >= COMPLETION_THRESHOLD * 100;

      const progress: VideoProgress = {
        videoId,
        lastPosition: currentTime,
        duration,
        percentComplete: Math.min(percentComplete, 100),
        isComplete,
        lastWatchedAt: Date.now(),
      };

      dispatch({ type: 'UPDATE_VIDEO_PROGRESS', payload: progress });
    },
    []
  );

  const getVideoProgress = useCallback(
    (videoId: string) => {
      return state.data.videos[videoId];
    },
    [state.data.videos]
  );

  const getSectionProgress = useCallback(
    (section: Section) => {
      const total = section.videos.length;
      let completed = 0;

      section.videos.forEach((video) => {
        const progress = state.data.videos[video.id];
        if (progress?.isComplete) {
          completed++;
        }
      });

      return {
        completed,
        total,
        percent: total > 0 ? (completed / total) * 100 : 0,
      };
    },
    [state.data.videos]
  );

  const getCourseProgress = useCallback(
    (course: Course) => {
      let completed = 0;
      let total = 0;

      course.sections.forEach((section) => {
        section.videos.forEach((video) => {
          total++;
          const progress = state.data.videos[video.id];
          if (progress?.isComplete) {
            completed++;
          }
        });
      });

      return {
        completed,
        total,
        percent: total > 0 ? (completed / total) * 100 : 0,
      };
    },
    [state.data.videos]
  );

  const clearAllProgress = useCallback(async () => {
    dispatch({ type: 'CLEAR_PROGRESS' });
    await storageService.clearAll();
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        state,
        updateVideoProgress,
        getVideoProgress,
        getSectionProgress,
        getCourseProgress,
        clearAllProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
