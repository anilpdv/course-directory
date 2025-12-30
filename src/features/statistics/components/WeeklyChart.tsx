import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { DailyStats } from '@shared/types';
import { spacing, borderRadius, shadows } from '@shared/theme';

interface WeeklyChartProps {
  weeklyStats: DailyStats[];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function WeeklyChartComponent({ weeklyStats }: WeeklyChartProps) {
  const theme = useTheme();

  // Find the max value for scaling
  const maxSeconds = Math.max(...weeklyStats.map((s) => s.watchTimeSeconds), 60);

  // Get day of week labels
  const getDayLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    return DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1];
  };

  // Check if date is today
  const isToday = (dateStr: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]} elevation={1}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        This Week
      </Text>
      <View style={styles.chartContainer}>
        {weeklyStats.map((stat, index) => {
          const barHeight = maxSeconds > 0 ? (stat.watchTimeSeconds / maxSeconds) * 100 : 0;
          const dayLabel = getDayLabel(stat.date);
          const today = isToday(stat.date);

          return (
            <View key={stat.date} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(barHeight, 2)}%`,
                      backgroundColor: today ? theme.colors.primary : theme.colors.primaryContainer,
                    },
                  ]}
                />
              </View>
              <Text
                variant="labelSmall"
                style={{
                  color: today ? theme.colors.primary : theme.colors.onSurfaceVariant,
                  fontWeight: today ? '600' : '400',
                }}
              >
                {dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.totalRow}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Total this week
        </Text>
        <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
          {formatMinutes(weeklyStats.reduce((sum, s) => sum + s.watchTimeSeconds, 0))}
        </Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: spacing.md,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bar: {
    width: '70%',
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
});

export const WeeklyChart = memo(WeeklyChartComponent);
