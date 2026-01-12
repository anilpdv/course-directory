import { useState, useEffect, useCallback } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

interface UseOrientationModeOptions {
  onResetControls?: () => void;
  initialFullscreen?: boolean;
}

export function useOrientationMode({ onResetControls, initialFullscreen = false }: UseOrientationModeOptions = {}) {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);

  // Setup orientation on mount based on initialFullscreen state
  useEffect(() => {
    const setup = async () => {
      if (initialFullscreen) {
        // Restore fullscreen mode - lock to landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        // Normal mode - unlock orientation and check current state
        await ScreenOrientation.unlockAsync();
        const orientation = await ScreenOrientation.getOrientationAsync();
        if (
          orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
        ) {
          setIsFullscreen(true);
        }
      }
    };
    setup();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [initialFullscreen]);

  // Listen to device orientation changes
  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      const orientation = event.orientationInfo.orientation;

      // Landscape orientations -> fullscreen
      if (
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      ) {
        setIsFullscreen(true);
      }
      // Portrait orientations -> portrait mode with list
      else if (
        orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
        orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
      ) {
        setIsFullscreen(false);
      }
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsFullscreen(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsFullscreen(true);
    }
    onResetControls?.();
  }, [isFullscreen, onResetControls]);

  return {
    isFullscreen,
    toggleFullscreen,
  };
}
