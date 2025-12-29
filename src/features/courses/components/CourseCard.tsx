import React, { useState, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Icon, useTheme, Menu, IconButton } from 'react-native-paper';
import { Course } from '@shared/types';
import { useProgress } from '@shared/contexts/ProgressContext';
import { useTags } from '@shared/contexts/TagsContext';
import { TagChip, TagSelector } from '@features/tags';
import { spacing, borderRadius, shadows } from '@shared/theme';
import { withCount } from '@shared/utils';

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
  onRemove?: (courseId: string) => void;
  isTablet?: boolean;
  cardWidth?: number;
  index?: number;
}

function CourseCardComponent({ course, onPress, onRemove, isTablet, cardWidth, index = 0 }: CourseCardProps) {
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
        style={[
          styles.card,
          isTablet && styles.cardTablet,
          cardWidth !== undefined && { width: cardWidth },
          { backgroundColor: theme.colors.surface },
          shadows.md,
        ]}
        onPress={() => onPress(course)}
        mode="elevated"
      >
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Icon
                source={course.icon || 'book-open-variant'}
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
                  {withCount(course.sections.length, 'section')}
                </Text>
                <Text style={[styles.dot, { color: theme.colors.onSurfaceVariant }]}>
                  •
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {withCount(course.totalVideos, 'video')}
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
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: theme.colors.primary, width: `${progress.percent}%` },
                ]}
              />
            </View>
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
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  cardTablet: {
    marginHorizontal: spacing.sm,
  },
  content: {
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dot: {
    marginHorizontal: spacing.xs + 2,
  },
  completeBadge: {
    marginLeft: spacing.sm,
  },
  completeText: {
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    marginTop: spacing.xs + 2,
  },
  menuButton: {
    margin: -spacing.xs,
  },
});

// Memoize to prevent unnecessary re-renders in FlatList
export const CourseCard = memo(CourseCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.course.totalVideos === nextProps.course.totalVideos &&
    prevProps.course.sections.length === nextProps.course.sections.length &&
    prevProps.isTablet === nextProps.isTablet &&
    prevProps.cardWidth === nextProps.cardWidth &&
    prevProps.index === nextProps.index &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onRemove === nextProps.onRemove
  );
});
