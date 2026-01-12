import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { VideoPlayer } from 'expo-video';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Video } from '@shared/types';
import { VideoContainer } from '../components/VideoContainer';
import { ControlsOverlayView } from '../components/ControlsOverlayView';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { colors } from '@shared/theme/colors';

interface FullscreenLayoutProps {
  player: VideoPlayer;
  videoName: string;
  insets: EdgeInsets;
  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
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
  previousVideo: Video | null;
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
  onNextVideo?: () => void;
  onPreviousVideo?: () => void;
}

export function FullscreenLayout({
  player,
  videoName,
  insets,
  isPlaying,
  isLoading,
  playbackRate,
  currentTime,
  duration,
  progressPercent,
  isControlsVisible,
  showNextVideoOverlay,
  countdown,
  nextVideo,
  previousVideo,
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
  onNextVideo,
  onPreviousVideo,
}: FullscreenLayoutProps) {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <VideoContainer player={player} isFullscreen onPress={onToggleControls} />

      {isLoading && <LoadingOverlay />}

      {isControlsVisible && (
        <ControlsOverlayView
          videoName={videoName}
          isFullscreen
          insets={insets}
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          currentTime={currentTime}
          duration={duration}
          progressPercent={progressPercent}
          showNextVideoOverlay={showNextVideoOverlay}
          countdown={countdown}
          nextVideo={nextVideo}
          previousVideo={previousVideo}
          onClose={onClose}
          onPlayPause={onPlayPause}
          onPlaybackRateChange={onPlaybackRateChange}
          onSeek={onSeek}
          onSeekStart={onSeekStart}
          onSeekEnd={onSeekEnd}
          onSeekBackward={onSeekBackward}
          onSeekForward={onSeekForward}
          onToggleFullscreen={onToggleFullscreen}
          onPlayNext={onPlayNext}
          onCancelAutoPlay={onCancelAutoPlay}
          onNextVideo={onNextVideo}
          onPreviousVideo={onPreviousVideo}
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
});
