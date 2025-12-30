import { useState, useMemo, useCallback } from 'react';
import { Course } from '@shared/types';
import { useDebouncedValue } from '@shared/hooks/useDebounce';
import { SearchResult } from '../types';

const DEBOUNCE_DELAY = 300;

export function useSearch(courses: Course[]) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_DELAY);

  const isSearching = query.length > 0;
  const hasQuery = debouncedQuery.length > 0;

  // Search across all courses, sections, and videos
  const results = useMemo((): SearchResult[] => {
    if (!hasQuery || courses.length === 0) {
      return [];
    }

    const searchTerm = debouncedQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    courses.forEach((course) => {
      // Match course name
      const courseNameLower = course.name.toLowerCase();
      const courseMatchIndex = courseNameLower.indexOf(searchTerm);
      if (courseMatchIndex !== -1) {
        searchResults.push({
          type: 'course',
          id: course.id,
          name: course.name,
          course,
          matchStart: courseMatchIndex,
          matchEnd: courseMatchIndex + searchTerm.length,
        });
      }

      // Match sections and videos
      course.sections.forEach((section) => {
        // Match section name
        const sectionNameLower = section.name.toLowerCase();
        const sectionMatchIndex = sectionNameLower.indexOf(searchTerm);
        if (sectionMatchIndex !== -1) {
          searchResults.push({
            type: 'section',
            id: section.id,
            name: section.name,
            course,
            section,
            matchStart: sectionMatchIndex,
            matchEnd: sectionMatchIndex + searchTerm.length,
          });
        }

        // Match videos
        section.videos.forEach((video) => {
          const videoNameLower = video.name.toLowerCase();
          const videoMatchIndex = videoNameLower.indexOf(searchTerm);
          if (videoMatchIndex !== -1) {
            searchResults.push({
              type: 'video',
              id: video.id,
              name: video.name,
              course,
              section,
              video,
              matchStart: videoMatchIndex,
              matchEnd: videoMatchIndex + searchTerm.length,
            });
          }
        });
      });
    });

    // Sort: courses first, then sections, then videos
    // Within each type, sort alphabetically
    searchResults.sort((a, b) => {
      const typeOrder = { course: 0, section: 1, video: 2 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.name.localeCompare(b.name);
    });

    return searchResults;
  }, [debouncedQuery, courses, hasQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasResults: results.length > 0,
    clearSearch,
  };
}
