import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { EdgeInsets } from 'react-native-safe-area-context';

interface NextVideoOverlayProps {
  countdown: number;
  insets: EdgeInsets;
  isFullscreen: boolean;
  onPlayNext: () => void;
  onCancel: () => void;
}

export function NextVideoOverlay({
  countdown,
  insets,
  isFullscreen,
  onPlayNext,
  onCancel,
}: NextVideoOverlayProps) {
  const positionStyle = isFullscreen
    ? { right: insets.right + 24, bottom: 100 }
    : { right: 16, bottom: 50 };

  return (
    <View style={[styles.container, positionStyle]}>
      <Button
        mode="contained"
        onPress={onPlayNext}
        icon="skip-next"
        contentStyle={isFullscreen ? styles.buttonContent : undefined}
        compact={!isFullscreen}
      >
        Next ({countdown}s)
      </Button>
      <IconButton
        icon="close"
        size={isFullscreen ? 20 : 18}
        iconColor="#FFFFFF"
        onPress={onCancel}
        style={styles.cancelButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonContent: {
    paddingHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: 0,
  },
});
