import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, ProgressBar, Icon, IconButton, useTheme } from 'react-native-paper';
import { Video } from '@shared/types';
import { useProgress } from '@shared/contexts/ProgressContext';
import { formatTime } from '@shared/utils/formatters';
import { spacing, borderRadius, progressBarHeights } from '@shared/theme';

interface VideoItemProps {
  video: Video;
  onPress: () => void;
}

function VideoItemComponent({ video, onPress }: VideoItemProps) {
  const theme = useTheme();
  const { getVideoProgress } = useProgress();
  const progress = getVideoProgress(video.id);
  const isComplete = progress?.isComplete || false;
  const hasProgress = progress && progress.lastPosition > 0;

  return (
    <Pressable onPress={onPress}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
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

          <View style={styles.contentContainer}>
            <Text
              variant="bodyMedium"
              numberOfLines={2}
              style={[
                styles.title,
                { color: isComplete ? theme.colors.onSurfaceVariant : theme.colors.onSurface },
              ]}
            >
              {video.name}
            </Text>
            {hasProgress && !isComplete && (
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
            )}
          </View>

          <IconButton
            icon="play"
            mode="contained"
            size={20}
            onPress={onPress}
            style={styles.playButton}
          />
        </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  leftContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
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
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  progressBar: {
    height: progressBarHeights.thin,
    borderRadius: borderRadius.sm,
    width: '60%',
  },
  playButton: {
    margin: 0,
  },
});

// Memoize to prevent unnecessary re-renders
export const VideoItem = memo(VideoItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.video.id === nextProps.video.id &&
    prevProps.onPress === nextProps.onPress
  );
});
