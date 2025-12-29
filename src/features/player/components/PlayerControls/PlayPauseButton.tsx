import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { colors } from '@shared/theme';

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onPress: () => void;
  size?: 'normal' | 'large';
}

export function PlayPauseButton({ isPlaying, onPress, size = 'large' }: PlayPauseButtonProps) {
  const theme = useTheme();
  const iconSize = size === 'large' ? 48 : 40;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <IconButton
      icon={isPlaying ? 'pause' : 'play'}
      iconColor={colors.playerIcon}
      size={iconSize}
      onPress={onPress}
      style={[buttonStyle, { backgroundColor: theme.colors.primary }]}
    />
  );
}

const styles = StyleSheet.create({
  largeButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  normalButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
