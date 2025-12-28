import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Tag, TagsState, TagsAction } from '../types';
import { storageService } from '../services/storageService';
import { tagColors } from '../theme/colors';

const initialState: TagsState = {
  tags: [],
  courseTags: {},
  isLoaded: false,
};

function tagsReducer(state: TagsState, action: TagsAction): TagsState {
  switch (action.type) {
    case 'LOAD_TAGS':
      return {
        tags: action.payload.tags,
        courseTags: action.payload.courseTags,
        isLoaded: true,
      };
    case 'ADD_TAG':
      return {
        ...state,
        tags: [...state.tags, action.payload],
      };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TAG':
      // Also remove from all course mappings
      const filteredCourseTags = Object.fromEntries(
        Object.entries(state.courseTags).map(([courseId, tagIds]) => [
          courseId,
          tagIds.filter((id) => id !== action.payload),
        ])
      );
      return {
        ...state,
        tags: state.tags.filter((t) => t.id !== action.payload),
        courseTags: filteredCourseTags,
      };
    case 'ASSIGN_TAG':
      const currentTags = state.courseTags[action.payload.courseId] || [];
      if (currentTags.includes(action.payload.tagId)) return state;
      return {
        ...state,
        courseTags: {
          ...state.courseTags,
          [action.payload.courseId]: [...currentTags, action.payload.tagId],
        },
      };
    case 'UNASSIGN_TAG':
      return {
        ...state,
        courseTags: {
          ...state.courseTags,
          [action.payload.courseId]: (
            state.courseTags[action.payload.courseId] || []
          ).filter((id) => id !== action.payload.tagId),
        },
      };
    case 'SET_COURSE_TAGS':
      return {
        ...state,
        courseTags: {
          ...state.courseTags,
          [action.payload.courseId]: action.payload.tagIds,
        },
      };
    default:
      return state;
  }
}

// Simple hash function for generating tag IDs
function generateTagId(name: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `tag_${timestamp}_${random}`;
}

interface TagsContextType {
  state: TagsState;
  // Tag CRUD
  createTag: (name: string, color: string) => Promise<Tag>;
  updateTag: (tag: Tag) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  // Course-tag operations
  assignTag: (courseId: string, tagId: string) => Promise<void>;
  unassignTag: (courseId: string, tagId: string) => Promise<void>;
  setCourseTags: (courseId: string, tagIds: string[]) => Promise<void>;
  // Queries
  getTagsForCourse: (courseId: string) => Tag[];
  getCoursesForTag: (tagId: string) => string[];
  getTagById: (tagId: string) => Tag | undefined;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export function TagsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tagsReducer, initialState);

  // Load tags from storage on mount
  useEffect(() => {
    const loadTags = async () => {
      const [tags, courseTags] = await Promise.all([
        storageService.getTags(),
        storageService.getCourseTags(),
      ]);
      dispatch({ type: 'LOAD_TAGS', payload: { tags, courseTags } });
    };
    loadTags();
  }, []);

  // Save tags to storage whenever they change
  useEffect(() => {
    if (state.isLoaded) {
      storageService.saveTags(state.tags);
    }
  }, [state.tags, state.isLoaded]);

  // Save course-tag mappings whenever they change
  useEffect(() => {
    if (state.isLoaded) {
      storageService.saveCourseTags(state.courseTags);
    }
  }, [state.courseTags, state.isLoaded]);

  const createTag = useCallback(
    async (name: string, color: string): Promise<Tag> => {
      const tag: Tag = {
        id: generateTagId(name),
        name: name.trim(),
        color: color || tagColors[0],
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_TAG', payload: tag });
      return tag;
    },
    []
  );

  const updateTag = useCallback(async (tag: Tag): Promise<void> => {
    dispatch({ type: 'UPDATE_TAG', payload: tag });
  }, []);

  const deleteTag = useCallback(async (tagId: string): Promise<void> => {
    dispatch({ type: 'DELETE_TAG', payload: tagId });
  }, []);

  const assignTag = useCallback(
    async (courseId: string, tagId: string): Promise<void> => {
      dispatch({ type: 'ASSIGN_TAG', payload: { courseId, tagId } });
    },
    []
  );

  const unassignTag = useCallback(
    async (courseId: string, tagId: string): Promise<void> => {
      dispatch({ type: 'UNASSIGN_TAG', payload: { courseId, tagId } });
    },
    []
  );

  const setCourseTags = useCallback(
    async (courseId: string, tagIds: string[]): Promise<void> => {
      dispatch({ type: 'SET_COURSE_TAGS', payload: { courseId, tagIds } });
    },
    []
  );

  const getTagsForCourse = useCallback(
    (courseId: string): Tag[] => {
      const tagIds = state.courseTags[courseId] || [];
      return tagIds
        .map((id) => state.tags.find((t) => t.id === id))
        .filter((t): t is Tag => t !== undefined);
    },
    [state.tags, state.courseTags]
  );

  const getCoursesForTag = useCallback(
    (tagId: string): string[] => {
      return Object.entries(state.courseTags)
        .filter(([_, tagIds]) => tagIds.includes(tagId))
        .map(([courseId]) => courseId);
    },
    [state.courseTags]
  );

  const getTagById = useCallback(
    (tagId: string): Tag | undefined => {
      return state.tags.find((t) => t.id === tagId);
    },
    [state.tags]
  );

  return (
    <TagsContext.Provider
      value={{
        state,
        createTag,
        updateTag,
        deleteTag,
        assignTag,
        unassignTag,
        setCourseTags,
        getTagsForCourse,
        getCoursesForTag,
        getTagById,
      }}
    >
      {children}
    </TagsContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
}
