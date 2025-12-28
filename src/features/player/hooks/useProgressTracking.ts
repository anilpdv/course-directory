import { useState, useEffect, useRef, useCallback } from 'react';
import { VideoPlayer } from 'expo-video';
import { SAVE_INTERVAL, TIME_UPDATE_INTERVAL } from '../constants';

interface UseProgressTrackingOptions {
  player: VideoPlayer;
  videoId: string;
  updateVideoProgress: (videoId: string, position: number, duration: number) => void;
}

export function useProgressTracking({
  player,
  videoId,
  updateVideoProgress,
}: UseProgressTrackingOptions) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    currentTimeRef.current = currentTime;
    durationRef.current = duration;
  }, [currentTime, duration]);

  // Track time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTimeVal = player.currentTime;
      const durationVal = player.duration;

      if (currentTimeVal !== undefined) {
        setCurrentTime(currentTimeVal);
      }
      if (durationVal !== undefined && durationVal > 0) {
        setDuration(durationVal);
      }
    }, TIME_UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [player]);

  // Save progress periodically
  useEffect(() => {
    progressSaveIntervalRef.current = setInterval(() => {
      if (durationRef.current > 0 && currentTimeRef.current > 0) {
        updateVideoProgress(videoId, currentTimeRef.current, durationRef.current);
      }
    }, SAVE_INTERVAL);

    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
    };
  }, [videoId, updateVideoProgress]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (durationRef.current > 0 && currentTimeRef.current > 0) {
        updateVideoProgress(videoId, currentTimeRef.current, durationRef.current);
      }
    };
  }, [videoId, updateVideoProgress]);

  const setCurrentTimeManually = useCallback((time: number) => {
    setCurrentTime(time);
    player.currentTime = time;
  }, [player]);

  const progressPercent = duration > 0 ? currentTime / duration : 0;

  return {
    currentTime,
    duration,
    progressPercent,
    setCurrentTime: setCurrentTimeManually,
  };
}
