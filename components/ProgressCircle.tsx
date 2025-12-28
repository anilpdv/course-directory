import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../constants/theme';

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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
      {/* Progress arc (using a simple filled view for now) */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: progress >= 100 ? colors.success : colors.primary,
            borderLeftColor: 'transparent',
            borderBottomColor: progress >= 50 ? (progress >= 100 ? colors.success : colors.primary) : 'transparent',
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

// Simpler progress indicator
export function ProgressBar({
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
            backgroundColor: progress >= 100 ? colors.success : colors.primary,
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
    color: colors.textPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
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
