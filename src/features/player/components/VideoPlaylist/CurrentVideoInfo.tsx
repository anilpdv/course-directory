import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

interface CurrentVideoInfoProps {
  videoName: string;
  currentIndex: number;
  totalVideos: number;
}

export function CurrentVideoInfo({ videoName, currentIndex, totalVideos }: CurrentVideoInfoProps) {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <Text
        variant="titleMedium"
        style={{ color: theme.colors.onSurface }}
        numberOfLines={2}
      >
        {videoName}
      </Text>
      <Text
        variant="bodySmall"
        style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
      >
        {currentIndex + 1} of {totalVideos} videos
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
  },
});
