import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStatistics } from '../contexts/StatisticsContext';
import { StatCard } from '../components/StatCard';
import { StreakDisplay } from '../components/StreakDisplay';
import { WeeklyChart } from '../components/WeeklyChart';
import { spacing } from '@shared/theme';

function formatWatchTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}

export function StatisticsScreen() {
  const theme = useTheme();
  const { state, getWeeklyStats } = useStatistics();
  const { data } = state;

  const weeklyStats = getWeeklyStats();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Display */}
        <StreakDisplay
          currentStreak={data.currentStreak}
          longestStreak={data.longestStreak}
        />

        {/* Weekly Chart */}
        <WeeklyChart weeklyStats={weeklyStats} />

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            All Time
          </Text>

          <StatCard
            title="Total Watch Time"
            value={formatWatchTime(data.totalWatchTimeSeconds)}
            icon="clock-outline"
            subtitle="Keep learning!"
          />

          <StatCard
            title="Videos Completed"
            value={data.totalVideosCompleted.toString()}
            icon="play-circle-outline"
            subtitle="Great progress!"
            color={theme.colors.tertiary}
          />

          <StatCard
            title="Courses Completed"
            value={data.totalCoursesCompleted.toString()}
            icon="school-outline"
            subtitle="Courses at 100%"
            color={theme.colors.secondary}
          />
        </View>

        {/* Tips */}
        <View style={[styles.tipsSection, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            💡 Tip
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }}>
            Watch at least one video per day to build your learning streak!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  statsSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipsSection: {
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
