import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, LayoutChangeEvent, GestureResponderEvent } from 'react-native';
import { useTheme } from 'react-native-paper';
import { colors } from '@shared/theme/colors';

interface ProgressBarProps {
  progress: number; // 0-1
  onSeek: (progress: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
}

export function ProgressBar({ progress, onSeek, onSeekStart, onSeekEnd }: ProgressBarProps) {
  const theme = useTheme();
  const [barWidth, setBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  }, []);

  const handleSeek = useCallback(
    (event: GestureResponderEvent) => {
      if (barWidth > 0) {
        const touchX = event.nativeEvent.locationX;
        const seekProgress = Math.max(0, Math.min(touchX / barWidth, 1));
        onSeek(seekProgress);
      }
    },
    [barWidth, onSeek]
  );

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
    onSeekStart?.();
  }, [onSeekStart]);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
    onSeekEnd?.();
  }, [onSeekEnd]);

  const handleMove = useCallback(
    (event: GestureResponderEvent) => {
      if (isSeeking && barWidth > 0) {
        const touchX = event.nativeEvent.locationX;
        const seekProgress = Math.max(0, Math.min(touchX / barWidth, 1));
        onSeek(seekProgress);
      }
    },
    [isSeeking, barWidth, onSeek]
  );

  const progressPercent = Math.min(progress * 100, 100);

  return (
    <Pressable
      style={styles.touchArea}
      onLayout={handleLayout}
      onPress={handleSeek}
      onPressIn={handleSeekStart}
      onPressOut={handleSeekEnd}
      onMoveShouldSetResponder={() => true}
      onResponderMove={handleMove}
      onResponderRelease={handleSeekEnd}
    >
      <View style={styles.container}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${progressPercent}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.thumb,
            {
              left: `${progressPercent}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    paddingVertical: 12,
    marginBottom: 4,
  },
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    top: -5,
  },
});
