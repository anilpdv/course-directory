import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon, Surface, useTheme } from 'react-native-paper';
import { spacing, borderRadius, shadows } from '@shared/theme';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

function StreakDisplayComponent({ currentStreak, longestStreak }: StreakDisplayProps) {
  const theme = useTheme();
  const hasStreak = currentStreak > 0;

  return (
    <Surface
      style={[
        styles.card,
        { backgroundColor: hasStreak ? theme.colors.primaryContainer : theme.colors.surface },
        shadows.sm,
      ]}
      elevation={1}
    >
      <View style={styles.flameContainer}>
        <Icon
          source="fire"
          size={48}
          color={hasStreak ? theme.colors.error : theme.colors.onSurfaceVariant}
        />
      </View>
      <View style={styles.content}>
        <Text
          variant="displaySmall"
          style={[
            styles.streakValue,
            { color: hasStreak ? theme.colors.onPrimaryContainer : theme.colors.onSurface },
          ]}
        >
          {currentStreak}
        </Text>
        <Text
          variant="titleMedium"
          style={{
            color: hasStreak ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
          }}
        >
          {currentStreak === 1 ? 'day streak' : 'days streak'}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: hasStreak ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant, marginTop: spacing.xs }}
        >
          Longest: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
        </Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  flameContainer: {
    marginRight: spacing.lg,
  },
  content: {
    flex: 1,
  },
  streakValue: {
    fontWeight: '800',
  },
});

export const StreakDisplay = memo(StreakDisplayComponent);
