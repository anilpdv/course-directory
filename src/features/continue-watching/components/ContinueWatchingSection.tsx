import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Course } from '@shared/types';
import { spacing } from '@shared/theme';
import { useContinueWatching, ContinueWatchingItem } from '../hooks/useContinueWatching';
import { ContinueWatchingCard } from './ContinueWatchingCard';

interface ContinueWatchingSectionProps {
  courses: Course[];
}

export function ContinueWatchingSection({ courses }: ContinueWatchingSectionProps) {
  const theme = useTheme();
  const router = useRouter();
  const continueWatchingItems = useContinueWatching(courses, 10);

  const handlePress = useCallback(
    (item: ContinueWatchingItem) => {
      router.push({
        pathname: '/player/[videoId]',
        params: {
          videoId: item.video.id,
          courseId: item.course.id,
          sectionId: item.section.id,
          videoPath: item.video.filePath,
          videoName: item.video.name,
        },
      });
    },
    [router]
  );

  // Don't render if no in-progress videos
  if (continueWatchingItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Continue Watching
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {continueWatchingItems.map((item) => (
          <ContinueWatchingCard
            key={item.video.id}
            item={item}
            onPress={handlePress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
});
