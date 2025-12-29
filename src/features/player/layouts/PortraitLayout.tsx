import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { VideoPlayer } from 'expo-video';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Video, VideoProgress } from '@shared/types';
import { VideoContainer } from '../components/VideoContainer';
import { ControlsOverlayView } from '../components/ControlsOverlayView';
import { VideoPlaylist } from '../components/VideoPlaylist';
import { colors, aspectRatios } from '@shared/theme';
import { useDeviceType } from '@shared/hooks/useDeviceType';

interface PortraitLayoutProps {
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
  // Video list
  sectionVideos: Video[];
  currentVideoId: string;
  currentVideoIndex: number;
  getVideoProgress: (videoId: string) => VideoProgress | undefined;
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
  onVideoSelect: (video: Video) => void;
}

export function PortraitLayout({
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
  sectionVideos,
  currentVideoId,
  currentVideoIndex,
  getVideoProgress,
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
  onVideoSelect,
}: PortraitLayoutProps) {
  const theme = useTheme();
  const { isTablet } = useDeviceType();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Video Container */}
      <View
        style={[
          styles.videoContainer,
          isTablet ? styles.videoContainerTablet : styles.videoContainerPhone,
          { marginTop: insets.top },
        ]}>
        <VideoContainer player={player} isFullscreen={false} onPress={onToggleControls} />

        {isControlsVisible && (
          <ControlsOverlayView
            videoName={videoName}
            isFullscreen={false}
            insets={insets}
            isPlaying={isPlaying}
            playbackRate={playbackRate}
            currentTime={currentTime}
            duration={duration}
            progressPercent={progressPercent}
            showNextVideoOverlay={showNextVideoOverlay}
            countdown={countdown}
            nextVideo={nextVideo}
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
          />
        )}
      </View>

      {/* Video Playlist */}
      <VideoPlaylist
        videoName={videoName}
        videos={sectionVideos}
        currentVideoId={currentVideoId}
        currentIndex={currentVideoIndex}
        insets={insets}
        getVideoProgress={getVideoProgress}
        onVideoSelect={onVideoSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: colors.playerBackground,
    position: 'relative',
  },
  videoContainerPhone: {
    aspectRatio: aspectRatios.standard,
  },
  videoContainerTablet: {
    aspectRatio: aspectRatios.tablet,
  },
});
