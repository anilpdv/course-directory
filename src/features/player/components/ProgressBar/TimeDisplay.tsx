import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { formatTime } from '../../utils';
import { colors } from '@shared/theme';

interface TimeDisplayProps {
  currentTime: number;
  duration: number;
  variant?: 'labelSmall' | 'labelMedium';
}

export function TimeDisplay({ currentTime, duration, variant = 'labelMedium' }: TimeDisplayProps) {
  return (
    <View style={styles.container}>
      <Text variant={variant} style={styles.text}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  text: {
    color: colors.playerText,
  },
});
