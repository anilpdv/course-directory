import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { spacing, borderRadius, shadows } from '@shared/theme';

interface CourseCardSkeletonProps {
  isTablet?: boolean;
}

function CourseCardSkeletonComponent({ isTablet }: CourseCardSkeletonProps) {
  const theme = useTheme();
  const skeletonColor = theme.colors.surfaceVariant;

  return (
    <View
      style={[
        styles.card,
        isTablet && styles.cardTablet,
        { backgroundColor: theme.colors.surface },
        shadows.sm,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconSkeleton, { backgroundColor: skeletonColor }]} />
          <View style={styles.titleContainer}>
            <View style={[styles.titleSkeleton, { backgroundColor: skeletonColor }]} />
            <View style={[styles.subtitleSkeleton, { backgroundColor: skeletonColor }]} />
          </View>
        </View>
        <View style={styles.progressSection}>
          <View style={[styles.progressBarSkeleton, { backgroundColor: skeletonColor }]} />
          <View style={[styles.progressTextSkeleton, { backgroundColor: skeletonColor }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  cardTablet: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconSkeleton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
  },
  titleContainer: {
    flex: 1,
    marginLeft: spacing.sm + 4,
  },
  titleSkeleton: {
    width: '70%',
    height: 18,
    borderRadius: borderRadius.sm,
  },
  subtitleSkeleton: {
    width: '40%',
    height: 14,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressBarSkeleton: {
    width: '100%',
    height: 6,
    borderRadius: borderRadius.sm,
  },
  progressTextSkeleton: {
    width: '30%',
    height: 12,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs + 2,
  },
});

export const CourseCardSkeleton = memo(CourseCardSkeletonComponent);
