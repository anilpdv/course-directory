import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors } from '@shared/theme/colors';

interface SeekButtonsProps {
  onSeekBackward: () => void;
  onSeekForward: () => void;
  size?: 'normal' | 'large';
}

export function SeekButtons({ onSeekBackward, onSeekForward, size = 'large' }: SeekButtonsProps) {
  const iconSize = size === 'large' ? 32 : 28;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <>
      <Pressable style={buttonStyle} onPress={onSeekBackward}>
        <IconButton icon="rewind-10" iconColor="#FFFFFF" size={iconSize} />
      </Pressable>
      <Pressable style={buttonStyle} onPress={onSeekForward}>
        <IconButton icon="fast-forward-10" iconColor="#FFFFFF" size={iconSize} />
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
  const iconSize = size === 'large' ? 32 : 28;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <Pressable style={buttonStyle} onPress={onPress}>
      <IconButton icon="rewind-10" iconColor="#FFFFFF" size={iconSize} />
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
  const iconSize = size === 'large' ? 32 : 28;
  const buttonStyle = size === 'large' ? styles.largeButton : styles.normalButton;

  return (
    <Pressable style={buttonStyle} onPress={onPress}>
      <IconButton icon="fast-forward-10" iconColor="#FFFFFF" size={iconSize} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  largeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.seekButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  normalButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.seekButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
