import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { EdgeInsets, SafeAreaView } from "react-native-safe-area-context";
import { PlaybackRateChip, FullscreenButton } from "../PlayerControls";
import { colors, iconSizes, fontWeights } from "@shared/theme";

interface TopBarProps {
  videoName: string;
  playbackRate: number;
  isFullscreen: boolean;
  insets: EdgeInsets;
  onClose: () => void;
  onPlaybackRateChange: () => void;
  onToggleFullscreen: () => void;
}

export function TopBar({
  videoName,
  playbackRate,
  isFullscreen,
  insets,
  onClose,
  onPlaybackRateChange,
  onToggleFullscreen,
}: TopBarProps) {
  const paddingLeft = isFullscreen ? insets.left + 16 : 8;
  const paddingRight = isFullscreen ? insets.right + 16 : 8;

  const content = (
    <View style={[styles.container, { paddingLeft, paddingRight }]}>
      <IconButton
        icon="close"
        iconColor={colors.playerIcon}
        size={iconSizes.lg}
        onPress={onClose}
        style={styles.closeButton}
      />
      {isFullscreen && (
        <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
          {videoName}
        </Text>
      )}
      <View style={styles.rightControls}>
        <PlaybackRateChip rate={playbackRate} onPress={onPlaybackRateChange} />
        <FullscreenButton
          isFullscreen={isFullscreen}
          onPress={onToggleFullscreen}
        />
      </View>
    </View>
  );

  // Only apply SafeAreaView in fullscreen mode
  // Portrait mode already has safe area handled by video container's marginTop
  if (isFullscreen) {
    return <SafeAreaView edges={['top']}>{content}</SafeAreaView>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  closeButton: {
    backgroundColor: colors.controlButton,
  },
  title: {
    flex: 1,
    color: colors.playerText,
    textAlign: "center",
    marginHorizontal: 16,
    fontWeight: fontWeights.semibold,
  },
  rightControls: {
    flexDirection: "row",
    alignItems: "center",
  },
});
