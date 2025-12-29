import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { VideoPlayer } from 'expo-video';
import { Video } from '@shared/types';
import { AUTO_PLAY_COUNTDOWN } from '../constants';

interface UseAutoPlayNextOptions {
  player: VideoPlayer;
  videoId: string;
  courseId: string;
  sectionId: string;
  nextVideo: Video | null;
  duration: number;
  updateVideoProgress: (videoId: string, position: number, duration: number) => void;
}

export function useAutoPlayNext({
  player,
  videoId,
  courseId,
  sectionId,
  nextVideo,
  duration,
  updateVideoProgress,
}: UseAutoPlayNextOptions) {
  const router = useRouter();
  const [showNextVideoOverlay, setShowNextVideoOverlay] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_PLAY_COUNTDOWN);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const showNextVideoOverlayRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    showNextVideoOverlayRef.current = showNextVideoOverlay;
  }, [showNextVideoOverlay]);

  // Trigger "Up Next" overlay when video reaches end
  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      if (nextVideo && !showNextVideoOverlayRef.current) {
        setShowNextVideoOverlay(true);
        setCountdown(AUTO_PLAY_COUNTDOWN);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, nextVideo]);

  // Countdown timer for auto-play
  useEffect(() => {
    if (showNextVideoOverlay) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [showNextVideoOverlay]);

  const playNextVideo = useCallback(() => {
    if (!nextVideo) return;

    // Mark current video as complete
    if (duration > 0) {
      updateVideoProgress(videoId, duration, duration);
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    router.replace({
      pathname: '/player/[videoId]',
      params: {
        videoId: nextVideo.id,
        videoPath: nextVideo.filePath,
        videoName: nextVideo.name,
        courseId,
        sectionId,
      },
    });
  }, [nextVideo, duration, updateVideoProgress, videoId, courseId, sectionId, router]);

  const cancelAutoPlay = useCallback(() => {
    setShowNextVideoOverlay(false);
    setCountdown(AUTO_PLAY_COUNTDOWN);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  }, []);

  // Auto-play when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && showNextVideoOverlay && nextVideo) {
      playNextVideo();
    }
  }, [countdown, showNextVideoOverlay, nextVideo, playNextVideo]);

  return {
    showNextVideoOverlay,
    countdown,
    playNextVideo,
    cancelAutoPlay,
  };
}
