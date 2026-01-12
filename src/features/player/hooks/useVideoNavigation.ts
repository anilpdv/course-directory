import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Video } from '@shared/types';
import { useCourses } from '@shared/contexts/CoursesContext';

interface UseVideoNavigationOptions {
  videoId: string;
  courseId: string;
  sectionId: string;
  currentTime: number;
  duration: number;
  updateVideoProgress: (videoId: string, position: number, duration: number) => void;
  isFullscreen: boolean;
}

export function useVideoNavigation({
  videoId,
  courseId,
  sectionId,
  currentTime,
  duration,
  updateVideoProgress,
  isFullscreen,
}: UseVideoNavigationOptions) {
  const router = useRouter();
  const { getCourse } = useCourses();

  const sectionVideos = useMemo((): Video[] => {
    const course = getCourse(courseId);
    if (!course) return [];
    const section = course.sections.find((s) => s.id === sectionId);
    return section?.videos || [];
  }, [getCourse, courseId, sectionId]);

  const currentVideoIndex = useMemo(() => {
    return sectionVideos.findIndex((v) => v.id === videoId);
  }, [sectionVideos, videoId]);

  const nextVideo = useMemo((): Video | null => {
    if (currentVideoIndex === -1 || currentVideoIndex >= sectionVideos.length - 1) {
      return null;
    }
    return sectionVideos[currentVideoIndex + 1];
  }, [sectionVideos, currentVideoIndex]);

  const previousVideo = useMemo((): Video | null => {
    if (currentVideoIndex <= 0) {
      return null;
    }
    return sectionVideos[currentVideoIndex - 1];
  }, [sectionVideos, currentVideoIndex]);

  const handleVideoSelect = useCallback(
    (video: Video) => {
      if (video.id === videoId) return;

      // Save current progress before switching
      if (duration > 0 && currentTime > 0) {
        updateVideoProgress(videoId, currentTime, duration);
      }

      router.replace({
        pathname: '/player/[videoId]',
        params: {
          videoId: video.id,
          videoPath: video.filePath,
          videoName: video.name,
          courseId,
          sectionId,
          isFullscreen: String(isFullscreen),
        },
      });
    },
    [videoId, duration, currentTime, updateVideoProgress, router, courseId, sectionId, isFullscreen]
  );

  const handleClose = useCallback(() => {
    // Save progress before closing
    if (duration > 0 && currentTime > 0) {
      updateVideoProgress(videoId, currentTime, duration);
    }
    router.back();
  }, [duration, currentTime, updateVideoProgress, videoId, router]);

  return {
    sectionVideos,
    currentVideoIndex,
    nextVideo,
    previousVideo,
    handleVideoSelect,
    handleClose,
  };
}
