import React, { useState } from 'react';
import { View, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { List, Text, ProgressBar, Icon, useTheme } from 'react-native-paper';
import { Section, Video } from '@shared/types';
import { useProgress } from '@shared/contexts/ProgressContext';
import { VideoItem } from './VideoItem';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SectionAccordionProps {
  section: Section;
  onVideoPress: (video: Video) => void;
  defaultExpanded?: boolean;
}

export function SectionAccordion({
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
      <List.Accordion
        title={section.name}
        description={`${progress.completed}/${progress.total} completed`}
        expanded={isExpanded}
        onPress={handlePress}
        titleStyle={[styles.title, { color: theme.colors.onSurface }]}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        style={[styles.accordion, { backgroundColor: theme.colors.surface }]}
        left={(props) => (
          <Icon
            {...props}
            source="folder-outline"
            size={24}
            color={theme.colors.primary}
          />
        )}
        right={() => (
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
            <Icon
              source={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        )}
      >
        <View />
      </List.Accordion>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <ProgressBar
          progress={progress.percent / 100}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
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

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  accordion: {
    paddingVertical: 4,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  videosList: {
    borderTopWidth: 1,
  },
});
