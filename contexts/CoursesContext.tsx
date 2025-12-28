import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { Course, CoursesState, CoursesAction } from '../types';
import { fileSystemService } from '../services/fileSystemService';

interface ExtendedCoursesState extends CoursesState {
  coursesPath: string | null;
  hasSelectedFolder: boolean;
}

const initialState: ExtendedCoursesState = {
  courses: [],
  isLoading: false,
  error: null,
  coursesPath: null,
  hasSelectedFolder: false,
};

type ExtendedCoursesAction =
  | CoursesAction
  | { type: 'SET_COURSES_PATH'; payload: string | null };

function coursesReducer(state: ExtendedCoursesState, action: ExtendedCoursesAction): ExtendedCoursesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_COURSES':
      return { ...state, courses: action.payload, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_COURSES_PATH':
      return {
        ...state,
        coursesPath: action.payload,
        hasSelectedFolder: action.payload !== null,
      };
    default:
      return state;
  }
}

interface CoursesContextType {
  state: ExtendedCoursesState;
  scanCourses: () => Promise<void>;
  getCourse: (id: string) => Course | undefined;
  pickCoursesFolder: () => Promise<boolean>;
  clearCoursesFolder: () => Promise<void>;
  loadCoursesPath: () => Promise<void>;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(coursesReducer, initialState);

  // Load saved courses path on mount
  const loadCoursesPath = useCallback(async () => {
    const path = await fileSystemService.getCoursesPath();
    dispatch({ type: 'SET_COURSES_PATH', payload: path });
  }, []);

  useEffect(() => {
    loadCoursesPath();
  }, [loadCoursesPath]);

  const scanCourses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const courses = await fileSystemService.scanCourses();
      dispatch({ type: 'SET_COURSES', payload: courses });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to scan courses',
      });
    }
  }, []);

  const getCourse = useCallback(
    (id: string) => {
      return state.courses.find((course) => course.id === id);
    },
    [state.courses]
  );

  const pickCoursesFolder = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const path = await fileSystemService.pickCoursesFolder();
      if (path) {
        dispatch({ type: 'SET_COURSES_PATH', payload: path });
        // Scan courses after selecting folder
        const courses = await fileSystemService.scanCourses();
        dispatch({ type: 'SET_COURSES', payload: courses });
        return true;
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to pick folder',
      });
      return false;
    }
  }, []);

  const clearCoursesFolder = useCallback(async () => {
    await fileSystemService.clearCoursesPath();
    dispatch({ type: 'SET_COURSES_PATH', payload: null });
    dispatch({ type: 'SET_COURSES', payload: [] });
  }, []);

  return (
    <CoursesContext.Provider
      value={{
        state,
        scanCourses,
        getCourse,
        pickCoursesFolder,
        clearCoursesFolder,
        loadCoursesPath,
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
