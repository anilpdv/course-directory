import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { VideoPlayer } from 'expo-video';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Video, VideoProgress } from '@shared/types';
import { VideoContainer } from '../components/VideoContainer';
import { TopBar, CenterControls, BottomBar } from '../components/ControlsOverlay';
import { NextVideoOverlay } from '../components/NextVideoOverlay';
import { VideoPlaylist } from '../components/VideoPlaylist';
import { colors } from '@shared/theme/colors';

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Video Container */}
      <View style={[styles.videoContainer, { marginTop: insets.top }]}>
        <VideoContainer player={player} isFullscreen={false} onPress={onToggleControls} />

        {/* Controls Overlay */}
        {isControlsVisible && (
          <View style={styles.controlsOverlay}>
            <TopBar
              videoName={videoName}
              playbackRate={playbackRate}
              isFullscreen={false}
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
              size="normal"
            />

            <BottomBar
              currentTime={currentTime}
              duration={duration}
              progress={progressPercent}
              insets={insets}
              isFullscreen={false}
              onSeek={onSeek}
              onSeekStart={onSeekStart}
              onSeekEnd={onSeekEnd}
            />
          </View>
        )}

        {/* Next Video Overlay */}
        {showNextVideoOverlay && nextVideo && (
          <NextVideoOverlay
            countdown={countdown}
            insets={insets}
            isFullscreen={false}
            onPlayNext={onPlayNext}
            onCancel={onCancelAutoPlay}
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
    aspectRatio: 16 / 9,
    backgroundColor: colors.playerBackground,
    position: 'relative',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.controlsOverlay,
    justifyContent: 'space-between',
  },
});
