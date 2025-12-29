import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { colors, buttonSizes, iconSizes } from '@shared/theme';

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onPress: () => void;
  size?: 'normal' | 'large';
}

export function PlayPauseButton({ isPlaying, onPress, size = 'large' }: PlayPauseButtonProps) {
  const theme = useTheme();
  const iconSize = size === 'large' ? iconSizes.xxl : 40;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <IconButton
      icon={isPlaying ? 'pause' : 'play'}
      iconColor={colors.playerIcon}
      size={iconSize}
      onPress={onPress}
      style={[buttonStyle, { backgroundColor: theme.colors.primary }]}
      accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      accessibilityRole="button"
    />
  );
}

const styles = StyleSheet.create({
  largeButton: {
    width: buttonSizes.large.width,
    height: buttonSizes.large.height,
    borderRadius: buttonSizes.large.borderRadius,
  },
  normalButton: {
    width: buttonSizes.normal.width,
    height: buttonSizes.normal.height,
    borderRadius: buttonSizes.normal.borderRadius,
  },
});
