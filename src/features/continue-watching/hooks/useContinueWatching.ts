import { useMemo } from 'react';
import { Course, Video, Section, VideoProgress } from '@shared/types';
import { useProgress } from '@shared/contexts/ProgressContext';

export interface ContinueWatchingItem {
  video: Video;
  section: Section;
  course: Course;
  progress: VideoProgress;
}

/**
 * Hook to get a list of in-progress videos sorted by most recently watched.
 * Returns videos that have been started but not completed (0 < progress < 90%).
 */
export function useContinueWatching(courses: Course[], limit = 10): ContinueWatchingItem[] {
  const { state, getVideoProgress } = useProgress();

  return useMemo(() => {
    if (!state.isLoaded || courses.length === 0) {
      return [];
    }

    const inProgressItems: ContinueWatchingItem[] = [];

    // Build a map of videoId -> { video, section, course } for quick lookup
    const videoMap = new Map<string, { video: Video; section: Section; course: Course }>();

    courses.forEach((course) => {
      course.sections.forEach((section) => {
        section.videos.forEach((video) => {
          videoMap.set(video.id, { video, section, course });
        });
      });
    });

    // Find all in-progress videos
    Object.values(state.data.videos).forEach((progress) => {
      // Skip completed videos (90%+) or videos with no progress
      if (progress.isComplete || progress.percentComplete <= 0) {
        return;
      }

      const videoInfo = videoMap.get(progress.videoId);
      if (videoInfo) {
        inProgressItems.push({
          ...videoInfo,
          progress,
        });
      }
    });

    // Sort by most recently watched
    inProgressItems.sort((a, b) => b.progress.lastWatchedAt - a.progress.lastWatchedAt);

    // Return limited items
    return inProgressItems.slice(0, limit);
  }, [state.data.videos, state.isLoaded, courses, limit]);
}
