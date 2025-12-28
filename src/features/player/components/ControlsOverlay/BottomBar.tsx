import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { ProgressBar, TimeDisplay } from '../ProgressBar';

interface BottomBarProps {
  currentTime: number;
  duration: number;
  progress: number;
  insets: EdgeInsets;
  isFullscreen: boolean;
  onSeek: (progress: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
}

export function BottomBar({
  currentTime,
  duration,
  progress,
  insets,
  isFullscreen,
  onSeek,
  onSeekStart,
  onSeekEnd,
}: BottomBarProps) {
  const paddingLeft = isFullscreen ? insets.left + 24 : 16;
  const paddingRight = isFullscreen ? insets.right + 24 : 16;
  const timeVariant = isFullscreen ? 'labelMedium' : 'labelSmall';

  return (
    <View style={[styles.container, { paddingLeft, paddingRight }]}>
      <ProgressBar
        progress={progress}
        onSeek={onSeek}
        onSeekStart={onSeekStart}
        onSeekEnd={onSeekEnd}
      />
      <TimeDisplay currentTime={currentTime} duration={duration} variant={timeVariant} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
});
