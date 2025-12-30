import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { Course, CoursesState, CoursesAction, StoredCourse } from '../types';
import { fileSystemService } from '../services/fileSystemService';

const initialState: CoursesState = {
  courses: [],
  storedCourses: [],
  isLoading: false,
  error: null,
  hasCourses: false,
};

function coursesReducer(state: CoursesState, action: CoursesAction): CoursesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_COURSES':
      return { ...state, courses: action.payload, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_STORED_COURSES':
      return {
        ...state,
        storedCourses: action.payload,
        hasCourses: action.payload.length > 0,
      };
    case 'ADD_STORED_COURSES':
      const newStored = [...state.storedCourses, ...action.payload];
      return {
        ...state,
        storedCourses: newStored,
        hasCourses: true,
      };
    case 'REMOVE_STORED_COURSE':
      const filtered = state.storedCourses.filter(c => c.id !== action.payload);
      return {
        ...state,
        storedCourses: filtered,
        courses: state.courses.filter(c => c.id !== action.payload),
        hasCourses: filtered.length > 0,
      };
    default:
      return state;
  }
}

// Result type for addCourses with detailed feedback
interface AddCoursesResult {
  added: number;
  duplicates: number;
  cancelled: boolean;
  noCoursesFound: boolean;
  error: string | null;
}

// Result type for removeCourse
interface RemoveCourseResult {
  success: boolean;
  error: string | null;
}

interface CoursesContextType {
  state: CoursesState;
  scanCourses: () => Promise<void>;
  getCourse: (id: string) => Course | undefined;
  addSingleCourse: () => Promise<AddCoursesResult>;
  addMultipleCourses: () => Promise<AddCoursesResult>;
  removeCourse: (courseId: string) => Promise<RemoveCourseResult>;
  loadStoredCourses: () => Promise<void>;
  clearAllCourses: () => Promise<void>;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(coursesReducer, initialState);

  // Load stored courses on app start (with migration from old format)
  const loadStoredCourses = useCallback(async () => {
    let stored = await fileSystemService.getStoredCourses();

    // Migration from old single-path format
    if (stored.length === 0) {
      stored = await fileSystemService.migrateFromSinglePath();
    }

    dispatch({ type: 'SET_STORED_COURSES', payload: stored });
  }, []);

  // Load on mount with cleanup
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      let stored = await fileSystemService.getStoredCourses();
      if (stored.length === 0) {
        stored = await fileSystemService.migrateFromSinglePath();
      }
      if (isMounted) {
        dispatch({ type: 'SET_STORED_COURSES', payload: stored });
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Scan all stored courses
  const scanCourses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const courses = await fileSystemService.scanAllCourses(state.storedCourses);
      dispatch({ type: 'SET_COURSES', payload: courses });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to scan courses',
      });
    }
  }, [state.storedCourses]);

  const getCourse = useCallback(
    (id: string) => {
      return state.courses.find((course) => course.id === id);
    },
    [state.courses]
  );

  // Helper to process and save new courses (filters duplicates, saves, scans)
  const processNewCourses = useCallback(
    async (newCourses: StoredCourse[]): Promise<{ added: number; duplicates: number }> => {
      const existingIds = new Set(state.storedCourses.map((c) => c.id));
      const uniqueCourses = newCourses.filter((c) => !existingIds.has(c.id));
      const duplicatesCount = newCourses.length - uniqueCourses.length;

      if (uniqueCourses.length > 0) {
        const allStored = [...state.storedCourses, ...uniqueCourses];
        await fileSystemService.saveStoredCourses(allStored);
        dispatch({ type: 'ADD_STORED_COURSES', payload: uniqueCourses });

        const scannedNew = await fileSystemService.scanAllCourses(uniqueCourses);
        const allCourses = [...state.courses, ...scannedNew];
        dispatch({ type: 'SET_COURSES', payload: allCourses });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      return { added: uniqueCourses.length, duplicates: duplicatesCount };
    },
    [state.storedCourses, state.courses]
  );

  // Add a single course - opens picker, treats selected folder as ONE course
  const addSingleCourse = useCallback(async (): Promise<AddCoursesResult> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const pickResult = await fileSystemService.pickFolder();
      if (!pickResult) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { added: 0, duplicates: 0, cancelled: true, noCoursesFound: false, error: null };
      }

      // Pass the iOS bookmark for persistent access
      const course = await fileSystemService.analyzeSingleCourse(pickResult.uri, pickResult.iosBookmark);
      if (!course) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { added: 0, duplicates: 0, cancelled: false, noCoursesFound: true, error: null };
      }

      const result = await processNewCourses([course]);
      return { ...result, cancelled: false, noCoursesFound: false, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add course';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { added: 0, duplicates: 0, cancelled: false, noCoursesFound: false, error: errorMessage };
    }
  }, [processNewCourses]);

  // Add multiple courses - opens picker, auto-detects courses in folder
  const addMultipleCourses = useCallback(async (): Promise<AddCoursesResult> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const pickResult = await fileSystemService.pickFolder();
      if (!pickResult) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { added: 0, duplicates: 0, cancelled: true, noCoursesFound: false, error: null };
      }

      // Pass the iOS bookmark for persistent access to all courses in the folder
      const analysis = await fileSystemService.analyzeMultipleCourses(pickResult.uri, pickResult.iosBookmark);
      if (analysis.courses.length === 0) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { added: 0, duplicates: 0, cancelled: false, noCoursesFound: true, error: null };
      }

      const result = await processNewCourses(analysis.courses);
      return { ...result, cancelled: false, noCoursesFound: false, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add courses';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { added: 0, duplicates: 0, cancelled: false, noCoursesFound: false, error: errorMessage };
    }
  }, [processNewCourses]);

  // Remove a single course
  const removeCourse = useCallback(async (courseId: string): Promise<RemoveCourseResult> => {
    try {
      // Find the course to release its folder access
      const courseToRemove = state.storedCourses.find(c => c.id === courseId);

      // Release folder access on Android (SAF cleanup)
      if (courseToRemove) {
        await fileSystemService.releaseFolderAccess(courseToRemove.folderPath);
      }

      const filtered = state.storedCourses.filter(c => c.id !== courseId);
      await fileSystemService.saveStoredCourses(filtered);
      dispatch({ type: 'REMOVE_STORED_COURSE', payload: courseId });
      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove course';
      return { success: false, error: errorMessage };
    }
  }, [state.storedCourses]);

  // Clear all courses
  const clearAllCourses = useCallback(async (): Promise<void> => {
    await fileSystemService.clearCoursesData();
    dispatch({ type: 'SET_STORED_COURSES', payload: [] });
    dispatch({ type: 'SET_COURSES', payload: [] });
  }, []);

  // Memoize context value to prevent unnecessary re-renders in consumers
  const contextValue = useMemo(
    () => ({
      state,
      scanCourses,
      getCourse,
      addSingleCourse,
      addMultipleCourses,
      removeCourse,
      loadStoredCourses,
      clearAllCourses,
    }),
    [state, scanCourses, getCourse, addSingleCourse, addMultipleCourses, removeCourse, loadStoredCourses, clearAllCourses]
  );

  return (
    <CoursesContext.Provider value={contextValue}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
}
