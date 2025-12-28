import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, ProgressBar, Icon, IconButton, useTheme } from 'react-native-paper';
import { Video } from '../types';
import { useProgress } from '../contexts/ProgressContext';

interface VideoItemProps {
  video: Video;
  onPress: () => void;
}

export function VideoItem({ video, onPress }: VideoItemProps) {
  const theme = useTheme();
  const { getVideoProgress } = useProgress();
  const progress = getVideoProgress(video.id);
  const isComplete = progress?.isComplete || false;
  const hasProgress = progress && progress.lastPosition > 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <List.Item
      title={video.name}
      titleNumberOfLines={2}
      titleStyle={[
        styles.title,
        { color: isComplete ? theme.colors.onSurfaceVariant : theme.colors.onSurface },
      ]}
      description={
        hasProgress && !isComplete ? (
          <View style={styles.resumeInfo}>
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
              Resume at {formatTime(progress.lastPosition)}
            </Text>
            <ProgressBar
              progress={(progress.percentComplete || 0) / 100}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>
        ) : null
      }
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      left={() => (
        <View style={styles.leftContainer}>
          {isComplete ? (
            <View style={[styles.completeBadge, { backgroundColor: theme.colors.primary }]}>
              <Icon source="check" size={16} color={theme.colors.onPrimary} />
            </View>
          ) : hasProgress ? (
            <View style={[styles.statusIndicator, { borderColor: theme.colors.primary }]} />
          ) : (
            <View style={[styles.statusIndicator, { borderColor: theme.colors.onSurfaceVariant }]} />
          )}
        </View>
      )}
      right={() => (
        <IconButton
          icon="play"
          mode="contained"
          size={20}
          onPress={onPress}
          style={styles.playButton}
        />
      )}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  title: {
    fontSize: 15,
  },
  leftContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  completeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeInfo: {
    marginTop: 4,
    gap: 4,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    width: '60%',
  },
  playButton: {
    margin: 0,
  },
});
