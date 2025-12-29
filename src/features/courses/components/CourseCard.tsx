import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, Chip, Icon, useTheme, Menu, IconButton } from 'react-native-paper';
import { Course } from '@shared/types';
import { useProgress } from '@shared/contexts/ProgressContext';
import { useTags } from '@shared/contexts/TagsContext';
import { TagChip, TagSelector } from '@features/tags';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  onRemove?: (courseId: string) => void;
  isTablet?: boolean;
}

export function CourseCard({ course, onPress, onRemove, isTablet }: CourseCardProps) {
  const theme = useTheme();
  const { getCourseProgress } = useProgress();
  const { getTagsForCourse } = useTags();
  const [tagSelectorVisible, setTagSelectorVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuKey, setMenuKey] = useState(0);

  const progress = getCourseProgress(course);
  const isComplete = progress.percent >= 100;
  const courseTags = getTagsForCourse(course.id);

  return (
    <>
    <Card
      style={[styles.card, isTablet && styles.cardTablet, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
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
            {courseTags.length > 0 && (
              <View style={styles.tagsRow}>
                {courseTags.slice(0, 3).map((tag) => (
                  <TagChip key={tag.id} tag={tag} size="small" />
                ))}
                {courseTags.length > 3 && (
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    +{courseTags.length - 3}
                  </Text>
                )}
              </View>
            )}
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
          <Menu
            key={menuKey}
            visible={menuVisible}
            onDismiss={() => {
              setMenuVisible(false);
              setMenuKey(k => k + 1);
            }}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={(e) => {
                  e.stopPropagation();
                  setMenuVisible(true);
                }}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                style={styles.menuButton}
              />
            }
          >
            <Menu.Item
              leadingIcon="tag-multiple"
              onPress={() => {
                setMenuVisible(false);
                setMenuKey(k => k + 1);
                setTagSelectorVisible(true);
              }}
              title="Manage Tags"
            />
            {onRemove && (
              <Menu.Item
                leadingIcon="delete"
                onPress={() => {
                  setMenuVisible(false);
                  setMenuKey(k => k + 1);
                  onRemove(course.id);
                }}
                title="Remove Course"
              />
            )}
          </Menu>
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
    </Card>

    <TagSelector
      courseId={course.id}
      courseName={course.name}
      visible={tagSelectorVisible}
      onDismiss={() => setTagSelectorVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
  },
  cardTablet: {
    flex: 1,
    marginHorizontal: 8,
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
    flexWrap: 'wrap',
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
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
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
  menuButton: {
    margin: -4,
  },
});
