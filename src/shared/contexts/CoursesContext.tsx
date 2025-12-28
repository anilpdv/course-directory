import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
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

interface CoursesContextType {
  state: CoursesState;
  scanCourses: () => Promise<void>;
  getCourse: (id: string) => Course | undefined;
  addCourses: () => Promise<{ added: number; duplicates: number }>;
  removeCourse: (courseId: string) => Promise<void>;
  loadStoredCourses: () => Promise<void>;
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

  useEffect(() => {
    loadStoredCourses();
  }, [loadStoredCourses]);

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

  // Add courses - opens picker, analyzes folder, adds courses with duplicate detection
  const addCourses = useCallback(async (): Promise<{ added: number; duplicates: number }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const folderPath = await fileSystemService.pickFolder();
      if (!folderPath) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { added: 0, duplicates: 0 };
      }

      const analysis = await fileSystemService.analyzeFolder(folderPath);

      // Filter out duplicates (by ID/path)
      const existingIds = new Set(state.storedCourses.map(c => c.id));
      const newCourses = analysis.courses.filter(c => !existingIds.has(c.id));
      const duplicatesCount = analysis.courses.length - newCourses.length;

      if (newCourses.length > 0) {
        // Add to stored courses
        const allStored = [...state.storedCourses, ...newCourses];
        await fileSystemService.saveStoredCourses(allStored);
        dispatch({ type: 'ADD_STORED_COURSES', payload: newCourses });

        // Scan the newly added courses
        const scannedNew = await fileSystemService.scanAllCourses(newCourses);
        const allCourses = [...state.courses, ...scannedNew];
        dispatch({ type: 'SET_COURSES', payload: allCourses });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      return { added: newCourses.length, duplicates: duplicatesCount };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to add courses',
      });
      return { added: 0, duplicates: 0 };
    }
  }, [state.storedCourses, state.courses]);

  // Remove a single course
  const removeCourse = useCallback(async (courseId: string) => {
    const filtered = state.storedCourses.filter(c => c.id !== courseId);
    await fileSystemService.saveStoredCourses(filtered);
    dispatch({ type: 'REMOVE_STORED_COURSE', payload: courseId });
  }, [state.storedCourses]);

  return (
    <CoursesContext.Provider
      value={{
        state,
        scanCourses,
        getCourse,
        addCourses,
        removeCourse,
        loadStoredCourses,
      }}
    >
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
