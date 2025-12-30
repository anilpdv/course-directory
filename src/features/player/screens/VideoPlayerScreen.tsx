import React, { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProgress } from '@shared/contexts/ProgressContext';
import { useStatistics } from '@features/statistics';
import { VideoPlayerParams } from '../types';
import { SEEK_AMOUNT } from '../constants';

// Hooks
import { usePlayerInit } from '../hooks/usePlayerInit';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useOrientationMode } from '../hooks/useOrientationMode';
import { useAutoPlayNext } from '../hooks/useAutoPlayNext';
import { useVideoNavigation } from '../hooks/useVideoNavigation';
import { useCallbackWithReset } from '../hooks/useCallbackWithReset';

// Layouts
import { FullscreenLayout } from '../layouts/FullscreenLayout';
import { PortraitLayout } from '../layouts/PortraitLayout';

export function VideoPlayerScreen() {
  const params = useLocalSearchParams() as unknown as VideoPlayerParams;
  const insets = useSafeAreaInsets();
  const { updateVideoProgress, getVideoProgress } = useProgress();
  const { addWatchTime } = useStatistics();

  // Keep screen awake during playback
  useKeepAwake();

  // Get initial position from saved progress
  const existingProgress = getVideoProgress(params.videoId);
  const initialPosition = existingProgress?.isComplete ? 0 : (existingProgress?.lastPosition || 0);

  // Initialize player
  const player = usePlayerInit({
    videoPath: params.videoPath,
    initialPosition,
    playbackRateIndex: 2, // Default to 1.0x
  });

  // Playback state (play/pause, rate)
  const {
    isPlaying,
    playbackRateIndex,
    currentRate,
    handlePlayPause,
    handlePlaybackRateChange,
  } = usePlaybackState({
    player,
    onResetControls: undefined, // Will be set after controls visibility hook
  });

  // Progress tracking (time, duration, save)
  const {
    currentTime,
    duration,
    progressPercent,
    setCurrentTime,
  } = useProgressTracking({
    player,
    videoId: params.videoId,
    updateVideoProgress,
    onWatchTimeUpdate: addWatchTime,
    isPlaying,
  });

  // Controls visibility (auto-hide)
  const {
    isControlsVisible,
    isSeeking,
    resetHideControlsTimeout,
    startSeeking,
    stopSeeking,
  } = useControlsVisibility({ isPlaying });

  // Orientation mode (fullscreen toggle)
  const { isFullscreen, toggleFullscreen } = useOrientationMode({
    onResetControls: resetHideControlsTimeout,
  });

  // Video navigation (section videos, select video, close)
  const {
    sectionVideos,
    currentVideoIndex,
    nextVideo,
    handleVideoSelect,
    handleClose,
  } = useVideoNavigation({
    videoId: params.videoId,
    courseId: params.courseId,
    sectionId: params.sectionId,
    currentTime,
    duration,
    updateVideoProgress,
  });

  // Auto-play next video
  const {
    showNextVideoOverlay,
    countdown,
    playNextVideo,
    cancelAutoPlay,
  } = useAutoPlayNext({
    player,
    videoId: params.videoId,
    courseId: params.courseId,
    sectionId: params.sectionId,
    nextVideo,
    duration,
    updateVideoProgress,
  });

  // Seek handlers
  const handleSeek = useCallback((progress: number) => {
    const seekTime = progress * duration;
    setCurrentTime(seekTime);
    resetHideControlsTimeout();
  }, [duration, setCurrentTime, resetHideControlsTimeout]);

  const handleSeekBackward = useCallback(() => {
    const newTime = Math.max(0, currentTime - SEEK_AMOUNT);
    setCurrentTime(newTime);
    resetHideControlsTimeout();
  }, [currentTime, setCurrentTime, resetHideControlsTimeout]);

  const handleSeekForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + SEEK_AMOUNT);
    setCurrentTime(newTime);
    resetHideControlsTimeout();
  }, [currentTime, duration, setCurrentTime, resetHideControlsTimeout]);

  // Wrap handlers to reset controls timeout
  const wrappedPlayPause = useCallbackWithReset(handlePlayPause, resetHideControlsTimeout, []);
  const wrappedPlaybackRateChange = useCallbackWithReset(handlePlaybackRateChange, resetHideControlsTimeout, []);
  const wrappedToggleFullscreen = useCallbackWithReset(toggleFullscreen, resetHideControlsTimeout, []);

  // Common props for both layouts
  const commonProps = {
    player,
    videoName: params.videoName,
    insets,
    isPlaying,
    playbackRate: currentRate,
    currentTime,
    duration,
    progressPercent,
    isControlsVisible,
    showNextVideoOverlay,
    countdown,
    nextVideo,
    onToggleControls: resetHideControlsTimeout,
    onPlayPause: wrappedPlayPause,
    onPlaybackRateChange: wrappedPlaybackRateChange,
    onSeek: handleSeek,
    onSeekStart: startSeeking,
    onSeekEnd: stopSeeking,
    onSeekBackward: handleSeekBackward,
    onSeekForward: handleSeekForward,
    onToggleFullscreen: wrappedToggleFullscreen,
    onClose: handleClose,
    onPlayNext: playNextVideo,
    onCancelAutoPlay: cancelAutoPlay,
  };

  if (isFullscreen) {
    return <FullscreenLayout {...commonProps} />;
  }

  return (
    <PortraitLayout
      {...commonProps}
      sectionVideos={sectionVideos}
      currentVideoId={params.videoId}
      currentVideoIndex={currentVideoIndex}
      getVideoProgress={getVideoProgress}
      onVideoSelect={handleVideoSelect}
    />
  );
}
