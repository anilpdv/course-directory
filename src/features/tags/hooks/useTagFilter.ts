import { useState, useCallback, useMemo } from 'react';
import { Course } from '@shared/types';
import { useTags } from '@shared/contexts/TagsContext';

interface UseTagFilterReturn {
  selectedTagIds: string[];
  filterMode: 'any' | 'all';
  setSelectedTagIds: (ids: string[]) => void;
  setFilterMode: (mode: 'any' | 'all') => void;
  toggleTag: (tagId: string) => void;
  clearFilters: () => void;
  filterCourses: (courses: Course[]) => Course[];
  hasActiveFilters: boolean;
  matchingCount: (courses: Course[]) => number;
}

export function useTagFilter(): UseTagFilterReturn {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'any' | 'all'>('any');
  const { state } = useTags();

  const hasActiveFilters = selectedTagIds.length > 0;

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      return [...prev, tagId];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedTagIds([]);
  }, []);

  const filterCourses = useCallback(
    (courses: Course[]): Course[] => {
      if (selectedTagIds.length === 0) {
        return courses;
      }

      return courses.filter((course) => {
        const courseTagIds = state.courseTags[course.id] || [];

        if (filterMode === 'any') {
          // Match if course has ANY of the selected tags
          return selectedTagIds.some((tagId) => courseTagIds.includes(tagId));
        } else {
          // Match if course has ALL of the selected tags
          return selectedTagIds.every((tagId) => courseTagIds.includes(tagId));
        }
      });
    },
    [selectedTagIds, filterMode, state.courseTags]
  );

  const matchingCount = useCallback(
    (courses: Course[]): number => {
      return filterCourses(courses).length;
    },
    [filterCourses]
  );

  return {
    selectedTagIds,
    filterMode,
    setSelectedTagIds,
    setFilterMode,
    toggleTag,
    clearFilters,
    filterCourses,
    hasActiveFilters,
    matchingCount,
  };
}
