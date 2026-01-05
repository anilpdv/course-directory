import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlayPauseButton, SeekBackwardButton, SeekForwardButton, NextVideoButton, PreviousVideoButton } from '../PlayerControls';

interface CenterControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onPreviousVideo?: () => void;
  hasPreviousVideo?: boolean;
  onNextVideo?: () => void;
  hasNextVideo?: boolean;
  size?: 'normal' | 'large';
}

export function CenterControls({
  isPlaying,
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  onPreviousVideo,
  hasPreviousVideo = false,
  onNextVideo,
  hasNextVideo = false,
  size = 'large',
}: CenterControlsProps) {
  const gap = size === 'large' ? 32 : 24;

  return (
    <View style={[styles.container, { gap }]}>
      {onPreviousVideo && (
        <PreviousVideoButton onPress={onPreviousVideo} disabled={!hasPreviousVideo} size={size} />
      )}
      <SeekBackwardButton onPress={onSeekBackward} size={size} />
      <PlayPauseButton isPlaying={isPlaying} onPress={onPlayPause} size={size} />
      <SeekForwardButton onPress={onSeekForward} size={size} />
      {onNextVideo && (
        <NextVideoButton onPress={onNextVideo} disabled={!hasNextVideo} size={size} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
