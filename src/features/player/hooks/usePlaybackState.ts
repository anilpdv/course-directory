import { useState, useEffect, useCallback } from 'react';
import { VideoPlayer } from 'expo-video';
import { PLAYBACK_RATES } from '../constants';

interface UsePlaybackStateOptions {
  player: VideoPlayer;
  onResetControls?: () => void;
}

export function usePlaybackState({ player, onResetControls }: UsePlaybackStateOptions) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRateIndex, setPlaybackRateIndex] = useState(2); // Default to 1.0x

  // Track isPlaying state from player events
  useEffect(() => {
    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    onResetControls?.();
  }, [isPlaying, player, onResetControls]);

  const handlePlaybackRateChange = useCallback(() => {
    const newIndex = (playbackRateIndex + 1) % PLAYBACK_RATES.length;
    setPlaybackRateIndex(newIndex);
    player.playbackRate = PLAYBACK_RATES[newIndex];
    onResetControls?.();
  }, [playbackRateIndex, player, onResetControls]);

  const currentRate = PLAYBACK_RATES[playbackRateIndex];

  return {
    isPlaying,
    playbackRateIndex,
    currentRate,
    handlePlayPause,
    handlePlaybackRateChange,
  };
}
