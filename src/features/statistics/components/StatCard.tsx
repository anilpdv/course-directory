import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon, Surface, useTheme } from 'react-native-paper';
import { spacing, borderRadius, shadows } from '@shared/theme';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  subtitle?: string;
  color?: string;
}

function StatCardComponent({ title, value, icon, subtitle, color }: StatCardProps) {
  const theme = useTheme();
  const iconColor = color || theme.colors.primary;

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]} elevation={1}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Icon source={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {title}
        </Text>
        <Text variant="headlineMedium" style={[styles.value, { color: theme.colors.onSurface }]}>
          {value}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  value: {
    fontWeight: '700',
    marginVertical: 2,
  },
});

export const StatCard = memo(StatCardComponent);
