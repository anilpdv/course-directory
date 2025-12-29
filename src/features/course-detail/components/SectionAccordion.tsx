import React, { useState, memo } from 'react';
import { View, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';
import { Section, Video } from '@shared/types';
import { useProgress } from '@shared/contexts/ProgressContext';
import { VideoItem } from './VideoItem';
import { spacing, borderRadius } from '@shared/theme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SectionAccordionProps {
  section: Section;
  onVideoPress: (video: Video) => void;
  defaultExpanded?: boolean;
}

function SectionAccordionComponent({
  section,
  onVideoPress,
  defaultExpanded = false,
}: SectionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const theme = useTheme();
  const { getSectionProgress } = useProgress();
  const progress = getSectionProgress(section);
  const isComplete = progress.percent >= 100;

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Pressable onPress={handlePress}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon source="folder-outline" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text
              variant="titleMedium"
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {section.name}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {progress.completed}/{progress.total} completed
            </Text>
          </View>
          <View style={styles.rightContainer}>
            {isComplete ? (
              <View style={[styles.completeBadge, { backgroundColor: theme.colors.primary }]}>
                <Icon source="check" size={16} color={theme.colors.onPrimary} />
              </View>
            ) : (
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {Math.round(progress.percent)}%
              </Text>
            )}
            <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
              <Icon source="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
            </View>
          </View>
        </View>
      </Pressable>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.colors.primary, width: `${progress.percent}%` },
            ]}
          />
        </View>
      </View>

      {/* Videos List */}
      {isExpanded && (
        <View style={[styles.videosList, { borderTopColor: theme.colors.outline }]}>
          {section.videos.map((video) => (
            <VideoItem
              key={video.id}
              video={video}
              onPress={() => onVideoPress(video)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Memoize to prevent unnecessary re-renders
export const SectionAccordion = memo(SectionAccordionComponent, (prevProps, nextProps) => {
  return (
    prevProps.section.id === nextProps.section.id &&
    prevProps.section.videos.length === nextProps.section.videos.length &&
    prevProps.defaultExpanded === nextProps.defaultExpanded &&
    prevProps.onVideoPress === nextProps.onVideoPress
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  completeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 4,
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
  videosList: {
    borderTopWidth: 1,
  },
});
