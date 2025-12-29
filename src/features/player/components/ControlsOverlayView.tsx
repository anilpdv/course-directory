import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Video } from '@shared/types';
import { TopBar, CenterControls, BottomBar } from './ControlsOverlay';
import { NextVideoOverlay } from './NextVideoOverlay';
import { colors } from '@shared/theme/colors';

interface ControlsOverlayViewProps {
  // Display
  videoName: string;
  isFullscreen: boolean;
  insets: EdgeInsets;
  // Playback state
  isPlaying: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
  progressPercent: number;
  // Auto-play state
  showNextVideoOverlay: boolean;
  countdown: number;
  nextVideo: Video | null;
  // Handlers
  onClose: () => void;
  onPlayPause: () => void;
  onPlaybackRateChange: () => void;
  onSeek: (progress: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onToggleFullscreen: () => void;
  onPlayNext: () => void;
  onCancelAutoPlay: () => void;
}

export const ControlsOverlayView = memo(function ControlsOverlayView({
  videoName,
  isFullscreen,
  insets,
  isPlaying,
  playbackRate,
  currentTime,
  duration,
  progressPercent,
  showNextVideoOverlay,
  countdown,
  nextVideo,
  onClose,
  onPlayPause,
  onPlaybackRateChange,
  onSeek,
  onSeekStart,
  onSeekEnd,
  onSeekBackward,
  onSeekForward,
  onToggleFullscreen,
  onPlayNext,
  onCancelAutoPlay,
}: ControlsOverlayViewProps) {
  return (
    <>
      <View style={styles.overlay}>
        <TopBar
          videoName={videoName}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
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
          size={isFullscreen ? 'large' : 'normal'}
        />

        <BottomBar
          currentTime={currentTime}
          duration={duration}
          progress={progressPercent}
          insets={insets}
          isFullscreen={isFullscreen}
          onSeek={onSeek}
          onSeekStart={onSeekStart}
          onSeekEnd={onSeekEnd}
        />
      </View>

      {showNextVideoOverlay && nextVideo && (
        <NextVideoOverlay
          countdown={countdown}
          insets={insets}
          isFullscreen={isFullscreen}
          onPlayNext={onPlayNext}
          onCancel={onCancelAutoPlay}
        />
      )}
    </>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.controlsOverlay,
    justifyContent: 'space-between',
  },
});
