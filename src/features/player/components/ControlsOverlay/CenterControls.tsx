import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlayPauseButton, SeekBackwardButton, SeekForwardButton } from '../PlayerControls';

interface CenterControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  size?: 'normal' | 'large';
}

export function CenterControls({
  isPlaying,
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  size = 'large',
}: CenterControlsProps) {
  const gap = size === 'large' ? 32 : 24;

  return (
    <View style={[styles.container, { gap }]}>
      <SeekBackwardButton onPress={onSeekBackward} size={size} />
      <PlayPauseButton isPlaying={isPlaying} onPress={onPlayPause} size={size} />
      <SeekForwardButton onPress={onSeekForward} size={size} />
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
