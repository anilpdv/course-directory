import { useState, useRef, useCallback, useEffect } from 'react';
import { CONTROLS_HIDE_DELAY } from '../constants';

interface UseControlsVisibilityOptions {
  isPlaying: boolean;
}

export function useControlsVisibility({ isPlaying }: UseControlsVisibilityOptions) {
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use ref to capture latest isPlaying value for stable callback
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Stable callback - no dependency on isPlaying, uses ref instead
  const resetHideControlsTimeout = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    setIsControlsVisible(true);
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlayingRef.current) {
        setIsControlsVisible(false);
      }
    }, CONTROLS_HIDE_DELAY);
  }, []); // Empty deps - stable function reference

  // Initialize controls visibility timeout
  useEffect(() => {
    resetHideControlsTimeout();
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [resetHideControlsTimeout]);

  const startSeeking = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const stopSeeking = useCallback(() => {
    setIsSeeking(false);
  }, []);

  return {
    isControlsVisible,
    isSeeking,
    resetHideControlsTimeout,
    startSeeking,
    stopSeeking,
  };
}
