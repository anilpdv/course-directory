import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Icon, useTheme, Surface } from 'react-native-paper';
import { spacing, borderRadius, shadows, colors } from '@shared/theme';
import { formatTime, formatRelativeTime } from '@shared/utils';
import { ContinueWatchingItem } from '../hooks/useContinueWatching';

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem;
  onPress: (item: ContinueWatchingItem) => void;
}

function ContinueWatchingCardComponent({ item, onPress }: ContinueWatchingCardProps) {
  const theme = useTheme();
  const { video, course, progress } = item;

  const progressPercent = Math.min(progress.percentComplete, 100);
  const resumeTime = formatTime(progress.lastPosition);
  const totalTime = formatTime(progress.duration);
  const watchedAgo = formatRelativeTime(progress.lastWatchedAt);

  return (
    <Pressable onPress={() => onPress(item)}>
      <Surface
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
          shadows.sm,
        ]}
        elevation={1}
      >
        {/* Video thumbnail placeholder */}
        <View style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Icon source="play-circle" size={32} color={colors.iconDefault} />
          <View style={[styles.durationBadge, { backgroundColor: theme.colors.surface }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>
              {resumeTime}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            variant="labelLarge"
            numberOfLines={1}
            style={[styles.videoName, { color: theme.colors.onSurface }]}
          >
            {video.name}
          </Text>
          <Text
            variant="labelSmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {course.name}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.progressFill, width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text
              variant="labelSmall"
              style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}
            >
              {Math.round(progressPercent)}% • {watchedAgo}
            </Text>
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  thumbnail: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  content: {
    padding: spacing.sm,
    minHeight: 100,  // Minimum height to fit all content
  },
  videoName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    marginTop: spacing.xs,
  },
});

export const ContinueWatchingCard = memo(ContinueWatchingCardComponent);
