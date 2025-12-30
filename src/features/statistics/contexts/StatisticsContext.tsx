import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { StatisticsData, StatisticsState, StatisticsAction, DailyStats } from '@shared/types';
import { storageService } from '@shared/services/storageService';
import { useDebouncedSave } from '@shared/hooks/useDebouncedSave';

const DEFAULT_STATISTICS: StatisticsData = {
  totalWatchTimeSeconds: 0,
  totalVideosCompleted: 0,
  totalCoursesCompleted: 0,
  dailyStats: {},
  currentStreak: 0,
  longestStreak: 0,
  lastWatchDate: null,
};

const initialState: StatisticsState = {
  data: DEFAULT_STATISTICS,
  isLoaded: false,
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function calculateStreak(dailyStats: Record<string, DailyStats>, today: string): number {
  let streak = 0;
  const currentDate = new Date(today);

  // Check if there's activity today
  const todayStats = dailyStats[today];
  if (!todayStats || todayStats.watchTimeSeconds === 0) {
    // Check yesterday instead
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count consecutive days
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const stats = dailyStats[dateStr];

    if (stats && stats.watchTimeSeconds > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function statisticsReducer(state: StatisticsState, action: StatisticsAction): StatisticsState {
  switch (action.type) {
    case 'LOAD_STATISTICS':
      return { data: action.payload, isLoaded: true };

    case 'UPDATE_WATCH_TIME': {
      const { seconds, date } = action.payload;
      const existingDayStats = state.data.dailyStats[date] || {
        date,
        watchTimeSeconds: 0,
        videosCompleted: 0,
      };

      const newDailyStats = {
        ...state.data.dailyStats,
        [date]: {
          ...existingDayStats,
          watchTimeSeconds: existingDayStats.watchTimeSeconds + seconds,
        },
      };

      const currentStreak = calculateStreak(newDailyStats, getToday());
      const longestStreak = Math.max(state.data.longestStreak, currentStreak);

      return {
        ...state,
        data: {
          ...state.data,
          totalWatchTimeSeconds: state.data.totalWatchTimeSeconds + seconds,
          dailyStats: newDailyStats,
          currentStreak,
          longestStreak,
          lastWatchDate: date,
        },
      };
    }

    case 'INCREMENT_VIDEOS_COMPLETED': {
      const { date } = action.payload;
      const existingDayStats = state.data.dailyStats[date] || {
        date,
        watchTimeSeconds: 0,
        videosCompleted: 0,
      };

      return {
        ...state,
        data: {
          ...state.data,
          totalVideosCompleted: state.data.totalVideosCompleted + 1,
          dailyStats: {
            ...state.data.dailyStats,
            [date]: {
              ...existingDayStats,
              videosCompleted: existingDayStats.videosCompleted + 1,
            },
          },
        },
      };
    }

    case 'UPDATE_COURSES_COMPLETED':
      return {
        ...state,
        data: {
          ...state.data,
          totalCoursesCompleted: action.payload,
        },
      };

    case 'CLEAR_STATISTICS':
      return { data: DEFAULT_STATISTICS, isLoaded: true };

    default:
      return state;
  }
}

interface StatisticsContextType {
  state: StatisticsState;
  addWatchTime: (seconds: number) => void;
  incrementVideosCompleted: () => void;
  updateCoursesCompleted: (count: number) => void;
  clearStatistics: () => Promise<void>;
  getWeeklyStats: () => DailyStats[];
  getMonthlyStats: () => DailyStats[];
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export function StatisticsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(statisticsReducer, initialState);

  // Ref to track current state for unmount save (avoids stale closure)
  const stateRef = useRef(state);
  stateRef.current = state; // Direct assignment - no useEffect needed

  // Load statistics from storage on mount
  useEffect(() => {
    let isMounted = true;
    const loadStatistics = async () => {
      const statistics = await storageService.getStatistics();
      if (isMounted) {
        dispatch({ type: 'LOAD_STATISTICS', payload: statistics });
      }
    };
    loadStatistics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoized save function for debounced hook
  const saveStatistics = useCallback(
    (data: StatisticsData) => storageService.saveStatistics(data),
    []
  );

  // Debounced save (5 second delay)
  useDebouncedSave(state.data, saveStatistics, 5000, state.isLoaded);

  // Save immediately on unmount (using ref to avoid stale closure)
  useEffect(() => {
    return () => {
      if (stateRef.current.isLoaded) {
        storageService.saveStatistics(stateRef.current.data);
      }
    };
  }, []);

  const addWatchTime = useCallback((seconds: number) => {
    dispatch({ type: 'UPDATE_WATCH_TIME', payload: { seconds, date: getToday() } });
  }, []);

  const incrementVideosCompleted = useCallback(() => {
    dispatch({ type: 'INCREMENT_VIDEOS_COMPLETED', payload: { date: getToday() } });
  }, []);

  const updateCoursesCompleted = useCallback((count: number) => {
    dispatch({ type: 'UPDATE_COURSES_COMPLETED', payload: count });
  }, []);

  const clearStatistics = useCallback(async () => {
    dispatch({ type: 'CLEAR_STATISTICS' });
    await storageService.clearStatistics();
  }, []);

  // Get stats for the last 7 days
  const getWeeklyStats = useCallback((): DailyStats[] => {
    const stats: DailyStats[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      stats.push(
        state.data.dailyStats[dateStr] || {
          date: dateStr,
          watchTimeSeconds: 0,
          videosCompleted: 0,
        }
      );
    }

    return stats;
  }, [state.data.dailyStats]);

  // Get stats for the last 30 days
  const getMonthlyStats = useCallback((): DailyStats[] => {
    const stats: DailyStats[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      stats.push(
        state.data.dailyStats[dateStr] || {
          date: dateStr,
          watchTimeSeconds: 0,
          videosCompleted: 0,
        }
      );
    }

    return stats;
  }, [state.data.dailyStats]);

  const contextValue = useMemo(
    () => ({
      state,
      addWatchTime,
      incrementVideosCompleted,
      updateCoursesCompleted,
      clearStatistics,
      getWeeklyStats,
      getMonthlyStats,
    }),
    [
      state,
      addWatchTime,
      incrementVideosCompleted,
      updateCoursesCompleted,
      clearStatistics,
      getWeeklyStats,
      getMonthlyStats,
    ]
  );

  return (
    <StatisticsContext.Provider value={contextValue}>
      {children}
    </StatisticsContext.Provider>
  );
}

export function useStatistics() {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
}
