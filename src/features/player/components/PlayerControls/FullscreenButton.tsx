import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors } from '@shared/theme/colors';

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onPress: () => void;
}

export function FullscreenButton({ isFullscreen, onPress }: FullscreenButtonProps) {
  return (
    <IconButton
      icon={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
      iconColor="#FFFFFF"
      size={24}
      onPress={onPress}
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.controlButton,
  },
});
