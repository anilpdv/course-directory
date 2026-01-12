import { useState, useEffect } from 'react';
import { useVideoPlayer as useExpoVideoPlayer } from 'expo-video';
import { PLAYBACK_RATES } from '../constants';

interface UsePlayerInitOptions {
  videoPath: string;
  initialPosition: number;
  playbackRateIndex: number;
}

export function usePlayerInit({
  videoPath,
  initialPosition,
  playbackRateIndex,
}: UsePlayerInitOptions) {
  const [isLoading, setIsLoading] = useState(true);

  const player = useExpoVideoPlayer(videoPath, (player) => {
    player.loop = false;
    player.playbackRate = PLAYBACK_RATES[playbackRateIndex];
    player.staysActiveInBackground = true;
    player.showNowPlayingNotification = true;
    player.audioMixingMode = 'doNotMix';

    if (initialPosition > 0) {
      setTimeout(() => {
        player.currentTime = initialPosition;
      }, 500);
    }

    player.play();
  });

  // Track loading state - hide overlay when video starts playing
  useEffect(() => {
    const subscription = player.addListener('playingChange', (event) => {
      if (event.isPlaying) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  return { player, isLoading };
}
