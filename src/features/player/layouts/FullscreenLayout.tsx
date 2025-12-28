import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { VideoPlayer } from 'expo-video';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Video } from '@shared/types';
import { VideoContainer } from '../components/VideoContainer';
import { TopBar, CenterControls, BottomBar } from '../components/ControlsOverlay';
import { NextVideoOverlay } from '../components/NextVideoOverlay';
import { colors } from '@shared/theme/colors';
import { SEEK_AMOUNT } from '../constants';

interface FullscreenLayoutProps {
  player: VideoPlayer;
  videoName: string;
  insets: EdgeInsets;
  // Playback state
  isPlaying: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
  progressPercent: number;
  // Controls state
  isControlsVisible: boolean;
  // Auto-play state
  showNextVideoOverlay: boolean;
  countdown: number;
  nextVideo: Video | null;
  // Handlers
  onToggleControls: () => void;
  onPlayPause: () => void;
  onPlaybackRateChange: () => void;
  onSeek: (progress: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onPlayNext: () => void;
  onCancelAutoPlay: () => void;
}

export function FullscreenLayout({
  player,
  videoName,
  insets,
  isPlaying,
  playbackRate,
  currentTime,
  duration,
  progressPercent,
  isControlsVisible,
  showNextVideoOverlay,
  countdown,
  nextVideo,
  onToggleControls,
  onPlayPause,
  onPlaybackRateChange,
  onSeek,
  onSeekStart,
  onSeekEnd,
  onSeekBackward,
  onSeekForward,
  onToggleFullscreen,
  onClose,
  onPlayNext,
  onCancelAutoPlay,
}: FullscreenLayoutProps) {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <VideoContainer player={player} isFullscreen onPress={onToggleControls} />

      {isControlsVisible && (
        <View style={styles.controlsOverlay}>
          <TopBar
            videoName={videoName}
            playbackRate={playbackRate}
            isFullscreen
            insets={insets}
            onClose={onClose}
            onPlaybackRateChange={onPlaybackRateChange}
            onToggleFullscreen={onToggleFullscreen}
          />

          <CenterControls
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onSeekBackward={onSeekBackward}
            onSeekForward={onSeekForward}
            size="large"
          />

          <BottomBar
            currentTime={currentTime}
            duration={duration}
            progress={progressPercent}
            insets={insets}
            isFullscreen
            onSeek={onSeek}
            onSeekStart={onSeekStart}
            onSeekEnd={onSeekEnd}
          />
        </View>
      )}

      {showNextVideoOverlay && nextVideo && (
        <NextVideoOverlay
          countdown={countdown}
          insets={insets}
          isFullscreen
          onPlayNext={onPlayNext}
          onCancel={onCancelAutoPlay}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.playerBackground,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.controlsOverlay,
    justifyContent: 'space-between',
  },
});
