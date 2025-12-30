import { Video, Section, Course } from '@shared/types';

export type SearchResultType = 'course' | 'section' | 'video';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  name: string;
  // Parent info for navigation
  course: Course;
  section?: Section;
  video?: Video;
  // Match info for highlighting
  matchStart: number;
  matchEnd: number;
}

export interface SearchState {
  query: string;
  isSearching: boolean;
  results: SearchResult[];
}
