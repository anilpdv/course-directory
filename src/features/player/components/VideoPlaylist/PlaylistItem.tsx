import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, IconButton, Icon, useTheme } from 'react-native-paper';
import { Video, VideoProgress } from '@shared/types';

interface PlaylistItemProps {
  video: Video;
  index: number;
  isCurrentVideo: boolean;
  progress?: VideoProgress;
  onSelect: (video: Video) => void;
}

function PlaylistItemComponent({
  video,
  index,
  isCurrentVideo,
  progress,
  onSelect,
}: PlaylistItemProps) {
  const theme = useTheme();
  const isComplete = progress?.isComplete || false;

  return (
    <Pressable
      onPress={() => onSelect(video)}
      style={[
        styles.container,
        { backgroundColor: isCurrentVideo ? theme.colors.primaryContainer : theme.colors.surface },
      ]}
    >
      <View style={styles.leftSection}>
        {isComplete ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Icon source="check" size={14} color={theme.colors.onPrimary} />
          </View>
        ) : isCurrentVideo ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Icon source="play" size={14} color={theme.colors.onPrimary} />
          </View>
        ) : (
          <Text
            variant="bodySmall"
            style={[styles.number, { color: theme.colors.onSurfaceVariant }]}
          >
            {index + 1}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <Text
          variant="bodyMedium"
          style={{
            color: isCurrentVideo ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
            fontWeight: isCurrentVideo ? '600' : '400',
          }}
          numberOfLines={2}
        >
          {video.name}
        </Text>
        {progress && !isComplete && progress.lastPosition > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress.percentComplete}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      {!isCurrentVideo && (
        <IconButton
          icon="play-circle-outline"
          size={24}
          iconColor={theme.colors.primary}
          onPress={() => onSelect(video)}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  leftSection: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontWeight: '500',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  progressContainer: {
    marginTop: 6,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    width: '60%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});

// Memoize with custom comparison to prevent unnecessary re-renders
export const PlaylistItem = memo(PlaylistItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.video.id === nextProps.video.id &&
    prevProps.index === nextProps.index &&
    prevProps.isCurrentVideo === nextProps.isCurrentVideo &&
    prevProps.progress?.percentComplete === nextProps.progress?.percentComplete &&
    prevProps.progress?.isComplete === nextProps.progress?.isComplete &&
    prevProps.onSelect === nextProps.onSelect
  );
});
