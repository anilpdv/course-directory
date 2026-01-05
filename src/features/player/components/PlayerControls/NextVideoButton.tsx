import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors, buttonSizes, iconSizes } from '@shared/theme';

interface NextVideoButtonProps {
  onPress: () => void;
  disabled?: boolean;
  size?: 'normal' | 'large';
}

export function NextVideoButton({
  onPress,
  disabled = false,
  size = 'large',
}: NextVideoButtonProps) {
  const iconSize = size === 'large' ? iconSizes.xl : 28;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <Pressable
      style={[buttonStyle, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="Next video"
      accessibilityRole="button"
    >
      <IconButton
        icon="skip-next"
        iconColor={colors.playerIcon}
        size={iconSize}
        style={disabled ? styles.disabledIcon : undefined}
      />
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
  disabled: {
    opacity: 0.4,
  },
  disabledIcon: {
    opacity: 0.6,
  },
});
