import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { VideoView, VideoPlayer } from 'expo-video';

interface VideoContainerProps {
  player: VideoPlayer;
  isFullscreen: boolean;
  onPress: () => void;
}

export function VideoContainer({ player, isFullscreen, onPress }: VideoContainerProps) {
  return (
    <TouchableOpacity
      style={isFullscreen ? styles.fullscreenContainer : styles.portraitContainer}
      activeOpacity={1}
      onPress={onPress}
    >
      <VideoView
        player={player}
        style={isFullscreen ? styles.fullscreenVideo : styles.portraitVideo}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
  },
  portraitContainer: {
    flex: 1,
  },
  fullscreenVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  portraitVideo: {
    flex: 1,
  },
});
