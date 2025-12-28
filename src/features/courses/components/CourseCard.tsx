import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Text, ProgressBar, Chip, Icon, useTheme } from 'react-native-paper';
import { Course } from '@shared/types';
import { useProgress } from '@shared/contexts/ProgressContext';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  onRemove?: (courseId: string) => void;
}

export function CourseCard({ course, onPress, onRemove }: CourseCardProps) {
  const theme = useTheme();
  const { getCourseProgress } = useProgress();
  const progress = getCourseProgress(course);
  const isComplete = progress.percent >= 100;

  const handleLongPress = useCallback(() => {
    if (onRemove) {
      Alert.alert(
        'Remove Course',
        `Remove "${course.name}" from your library? This won't delete the video files.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => onRemove(course.id),
          },
        ]
      );
    }
  }, [course, onRemove]);

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      onLongPress={onRemove ? handleLongPress : undefined}
      mode="elevated"
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Icon
              source="book-open-variant"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text
              variant="titleMedium"
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {course.name}
            </Text>
            <View style={styles.statsRow}>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {course.sections.length} section{course.sections.length !== 1 ? 's' : ''}
              </Text>
              <Text style={[styles.dot, { color: theme.colors.onSurfaceVariant }]}>
                •
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {course.totalVideos} video{course.totalVideos !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          {isComplete && (
            <Chip
              mode="flat"
              compact
              style={[styles.completeBadge, { backgroundColor: theme.colors.primary }]}
              textStyle={[styles.completeText, { color: theme.colors.onPrimary }]}
            >
              Complete
            </Chip>
          )}
        </View>

        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress.percent / 100}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text
            variant="labelSmall"
            style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}
          >
            {progress.completed}/{progress.total} completed
          </Text>
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Icon source="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
  },
  content: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    marginHorizontal: 6,
  },
  completeBadge: {
    marginLeft: 8,
  },
  completeText: {
    fontSize: 11,
  },
  progressSection: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    marginTop: 6,
  },
  actions: {
    justifyContent: 'flex-end',
    paddingTop: 0,
  },
});
