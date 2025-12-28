import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { colors } from '@shared/theme/colors';

interface PlaybackRateChipProps {
  rate: number;
  onPress: () => void;
}

export function PlaybackRateChip({ rate, onPress }: PlaybackRateChipProps) {
  return (
    <Chip
      mode="flat"
      compact
      onPress={onPress}
      style={styles.chip}
      textStyle={styles.text}
    >
      {rate}x
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.controlButton,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
