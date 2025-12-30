import { useState, useEffect, useRef, useCallback } from 'react';
import { VideoPlayer } from 'expo-video';
import { SAVE_INTERVAL, TIME_UPDATE_INTERVAL } from '../constants';

const STATS_UPDATE_INTERVAL = 10000; // Update stats every 10 seconds

interface UseProgressTrackingOptions {
  player: VideoPlayer;
  videoId: string;
  updateVideoProgress: (videoId: string, position: number, duration: number) => void;
  onWatchTimeUpdate?: (seconds: number) => void;
  isPlaying: boolean;
}

export function useProgressTracking({
  player,
  videoId,
  updateVideoProgress,
  onWatchTimeUpdate,
  isPlaying,
}: UseProgressTrackingOptions) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statsUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const lastStatsUpdateTimeRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);

  // Keep refs in sync
  currentTimeRef.current = currentTime;
  durationRef.current = duration;
  isPlayingRef.current = isPlaying;

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

  // Track watch time for statistics
  useEffect(() => {
    if (!onWatchTimeUpdate) return;

    // Initialize last update time
    lastStatsUpdateTimeRef.current = Date.now();

    statsUpdateIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastStatsUpdateTimeRef.current) / 1000;

      // Only count if video is playing
      if (isPlayingRef.current && elapsed > 0) {
        onWatchTimeUpdate(Math.round(elapsed));
      }

      lastStatsUpdateTimeRef.current = now;
    }, STATS_UPDATE_INTERVAL);

    return () => {
      if (statsUpdateIntervalRef.current) {
        clearInterval(statsUpdateIntervalRef.current);
      }
      // Final update on unmount
      const elapsed = (Date.now() - lastStatsUpdateTimeRef.current) / 1000;
      if (isPlayingRef.current && elapsed > 0) {
        onWatchTimeUpdate(Math.round(elapsed));
      }
    };
  }, [onWatchTimeUpdate]);

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
