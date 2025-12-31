import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';

interface ProgressCircleProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  showPercent?: boolean;
}

export function ProgressCircle({
  percent,
  size = 48,
  strokeWidth = 4,
  showPercent = true,
}: ProgressCircleProps) {
  const progress = Math.min(Math.max(percent, 0), 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.surfaceVariant,
          },
        ]}
      />
      {/* Progress arc */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: progress >= 100 ? colors.success : colors.progressFill,
            borderLeftColor: 'transparent',
            borderBottomColor: progress >= 50 ? (progress >= 100 ? colors.success : colors.progressFill) : 'transparent',
            transform: [{ rotate: `${(progress / 100) * 360 - 90}deg` }],
          },
        ]}
      />
      {showPercent && (
        <Text style={styles.percentText}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
}

export function SimpleProgressBar({
  percent,
  height = 4,
}: {
  percent: number;
  height?: number;
}) {
  const progress = Math.min(Math.max(percent, 0), 100);

  return (
    <View style={[styles.barContainer, { height }]}>
      <View
        style={[
          styles.barFill,
          {
            width: `${progress}%`,
            backgroundColor: progress >= 100 ? colors.success : colors.progressFill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  percentText: {
    color: colors.onBackground,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  barContainer: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
