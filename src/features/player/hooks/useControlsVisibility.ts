import { useState, useRef, useCallback, useEffect } from 'react';
import { CONTROLS_HIDE_DELAY } from '../constants';

interface UseControlsVisibilityOptions {
  isPlaying: boolean;
}

export function useControlsVisibility({ isPlaying }: UseControlsVisibilityOptions) {
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideControlsTimeout = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    setIsControlsVisible(true);
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false);
      }
    }, CONTROLS_HIDE_DELAY);
  }, [isPlaying]);

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
