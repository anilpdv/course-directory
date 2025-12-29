import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors, buttonSizes, iconSizes } from '@shared/theme';

interface SeekButtonsProps {
  onSeekBackward: () => void;
  onSeekForward: () => void;
  size?: 'normal' | 'large';
}

export function SeekButtons({ onSeekBackward, onSeekForward, size = 'large' }: SeekButtonsProps) {
  const iconSize = size === 'large' ? iconSizes.xl : 28;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <>
      <Pressable
        style={buttonStyle}
        onPress={onSeekBackward}
        accessibilityLabel="Rewind 10 seconds"
        accessibilityRole="button"
      >
        <IconButton icon="rewind-10" iconColor={colors.playerIcon} size={iconSize} />
      </Pressable>
      <Pressable
        style={buttonStyle}
        onPress={onSeekForward}
        accessibilityLabel="Forward 10 seconds"
        accessibilityRole="button"
      >
        <IconButton icon="fast-forward-10" iconColor={colors.playerIcon} size={iconSize} />
      </Pressable>
    </>
  );
}

export function SeekBackwardButton({
  onPress,
  size = 'large',
}: {
  onPress: () => void;
  size?: 'normal' | 'large';
}) {
  const iconSize = size === 'large' ? iconSizes.xl : 28;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <Pressable
      style={buttonStyle}
      onPress={onPress}
      accessibilityLabel="Rewind 10 seconds"
      accessibilityRole="button"
    >
      <IconButton icon="rewind-10" iconColor={colors.playerIcon} size={iconSize} />
    </Pressable>
  );
}

export function SeekForwardButton({
  onPress,
  size = 'large',
}: {
  onPress: () => void;
  size?: 'normal' | 'large';
}) {
  const iconSize = size === 'large' ? iconSizes.xl : 28;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <Pressable
      style={buttonStyle}
      onPress={onPress}
      accessibilityLabel="Forward 10 seconds"
      accessibilityRole="button"
    >
      <IconButton icon="fast-forward-10" iconColor={colors.playerIcon} size={iconSize} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  largeButton: {
    width: buttonSizes.normal.width,
    height: buttonSizes.normal.height,
    borderRadius: buttonSizes.normal.borderRadius,
    backgroundColor: colors.seekButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  normalButton: {
    width: buttonSizes.small.width,
    height: buttonSizes.small.height,
    borderRadius: buttonSizes.small.borderRadius,
    backgroundColor: colors.seekButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
