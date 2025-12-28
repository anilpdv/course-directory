import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useKeepAwake } from 'expo-keep-awake';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Chip, Button, useTheme } from 'react-native-paper';
import { useProgress } from '../../contexts/ProgressContext';
import { useCourses } from '../../contexts/CoursesContext';
import { Video } from '../../types';

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const SAVE_INTERVAL = 5000;
const AUTO_PLAY_COUNTDOWN = 5;

export default function VideoPlayerScreen() {
  const params = useLocalSearchParams<{
    videoId: string;
    videoPath: string;
    videoName: string;
    courseId: string;
    sectionId: string;
  }>();
  const router = useRouter();
  const theme = useTheme();
  const { updateVideoProgress, getVideoProgress } = useProgress();
  const { getCourse } = useCourses();

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRateIndex, setPlaybackRateIndex] = useState(2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showNextVideoOverlay, setShowNextVideoOverlay] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_PLAY_COUNTDOWN);

  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<View>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const existingProgress = getVideoProgress(params.videoId);
  const initialPosition = existingProgress?.lastPosition || 0;

  // Find next video in the section
  const getNextVideo = useCallback((): Video | null => {
    const course = getCourse(params.courseId);
    if (!course) return null;

    const section = course.sections.find(s => s.id === params.sectionId);
    if (!section) return null;

    const currentIndex = section.videos.findIndex(v => v.id === params.videoId);
    if (currentIndex === -1 || currentIndex >= section.videos.length - 1) {
      return null;
    }

    return section.videos[currentIndex + 1];
  }, [getCourse, params.courseId, params.sectionId, params.videoId]);

  const nextVideo = getNextVideo();

  const player = useVideoPlayer(params.videoPath, (player) => {
    player.loop = false;
    player.playbackRate = PLAYBACK_RATES[playbackRateIndex];

    if (initialPosition > 0) {
      setTimeout(() => {
        player.currentTime = initialPosition;
      }, 500);
    }

    player.play();
  });

  useKeepAwake();

  useEffect(() => {
    const setupOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    setupOrientation();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player.currentTime !== undefined) {
        setCurrentTime(player.currentTime);
      }
      if (player.duration !== undefined && player.duration > 0) {
        setDuration(player.duration);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    progressSaveIntervalRef.current = setInterval(() => {
      if (duration > 0 && currentTime > 0) {
        updateVideoProgress(params.videoId, currentTime, duration);
      }
    }, SAVE_INTERVAL);

    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
    };
  }, [params.videoId, currentTime, duration, updateVideoProgress]);

  useEffect(() => {
    return () => {
      if (duration > 0 && currentTime > 0) {
        updateVideoProgress(params.videoId, currentTime, duration);
      }
    };
  }, [params.videoId, currentTime, duration, updateVideoProgress]);

  // Detect video end and show next video overlay
  useEffect(() => {
    if (duration > 0 && currentTime >= duration - 0.5 && nextVideo && !showNextVideoOverlay) {
      setShowNextVideoOverlay(true);
      setCountdown(AUTO_PLAY_COUNTDOWN);
      player.pause();
    }
  }, [currentTime, duration, nextVideo, showNextVideoOverlay, player]);

  // Countdown timer for auto-play
  useEffect(() => {
    if (showNextVideoOverlay && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [showNextVideoOverlay, countdown]);

  // Auto-play when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && showNextVideoOverlay && nextVideo) {
      playNextVideo();
    }
  }, [countdown, showNextVideoOverlay, nextVideo]);

  const playNextVideo = useCallback(() => {
    if (!nextVideo) return;

    // Save progress for current video
    if (duration > 0) {
      updateVideoProgress(params.videoId, duration, duration);
    }

    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Navigate to next video
    router.replace({
      pathname: '/player/[videoId]',
      params: {
        videoId: nextVideo.id,
        videoPath: nextVideo.filePath,
        videoName: nextVideo.name,
        courseId: params.courseId,
        sectionId: params.sectionId,
      },
    });
  }, [nextVideo, duration, updateVideoProgress, params, router]);

  const cancelAutoPlay = useCallback(() => {
    setShowNextVideoOverlay(false);
    setCountdown(AUTO_PLAY_COUNTDOWN);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  }, []);

  const resetHideControlsTimeout = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    setIsControlsVisible(true);
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    resetHideControlsTimeout();
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [resetHideControlsTimeout]);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    resetHideControlsTimeout();
  };

  const handleSeek = (seconds: number) => {
    const newTime = Math.max(0, Math.min(player.currentTime + seconds, duration));
    player.currentTime = newTime;
    resetHideControlsTimeout();
  };

  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  };

  const handleProgressBarSeek = (event: GestureResponderEvent) => {
    if (progressBarWidth > 0 && duration > 0) {
      const touchX = event.nativeEvent.locationX;
      const seekPercent = Math.max(0, Math.min(touchX / progressBarWidth, 1));
      const seekTime = seekPercent * duration;
      player.currentTime = seekTime;
      setCurrentTime(seekTime);
      resetHideControlsTimeout();
    }
  };

  const handleProgressBarMove = (event: GestureResponderEvent) => {
    if (isSeeking && progressBarWidth > 0 && duration > 0) {
      const touchX = event.nativeEvent.locationX;
      const seekPercent = Math.max(0, Math.min(touchX / progressBarWidth, 1));
      const seekTime = seekPercent * duration;
      player.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handlePlaybackRateChange = () => {
    const newIndex = (playbackRateIndex + 1) % PLAYBACK_RATES.length;
    setPlaybackRateIndex(newIndex);
    player.playbackRate = PLAYBACK_RATES[newIndex];
    resetHideControlsTimeout();
  };

  const handleClose = () => {
    if (duration > 0 && currentTime > 0) {
      updateVideoProgress(params.videoId, currentTime, duration);
    }
    router.back();
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playerContainer}
        activeOpacity={1}
        onPress={resetHideControlsTimeout}
      >
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
        />
      </TouchableOpacity>

      {isControlsVisible && (
        <View style={styles.controlsOverlay}>
          {/* Top Bar */}
          <SafeAreaView edges={['top']} style={styles.topBar}>
            <IconButton
              icon="close"
              iconColor="#FFFFFF"
              size={24}
              onPress={handleClose}
              style={styles.closeButton}
            />
            <Text
              variant="titleMedium"
              style={styles.videoTitle}
              numberOfLines={1}
            >
              {params.videoName}
            </Text>
            <Chip
              mode="flat"
              compact
              onPress={handlePlaybackRateChange}
              style={styles.speedChip}
              textStyle={styles.speedChipText}
            >
              {PLAYBACK_RATES[playbackRateIndex]}x
            </Chip>
          </SafeAreaView>

          {/* Center Controls */}
          <View style={styles.centerControls}>
            <Pressable
              style={styles.seekButton}
              onPress={() => handleSeek(-10)}
            >
              <IconButton
                icon="rewind-10"
                iconColor="#FFFFFF"
                size={32}
              />
            </Pressable>

            <IconButton
              icon={isPlaying ? 'pause' : 'play'}
              iconColor="#FFFFFF"
              size={48}
              onPress={handlePlayPause}
              style={[styles.playPauseButton, { backgroundColor: theme.colors.primary }]}
            />

            <Pressable
              style={styles.seekButton}
              onPress={() => handleSeek(10)}
            >
              <IconButton
                icon="fast-forward-10"
                iconColor="#FFFFFF"
                size={32}
              />
            </Pressable>
          </View>

          {/* Bottom Bar */}
          <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
            <Pressable
              style={styles.progressTouchArea}
              onLayout={handleProgressBarLayout}
              onPress={handleProgressBarSeek}
              onPressIn={() => setIsSeeking(true)}
              onPressOut={() => setIsSeeking(false)}
              onMoveShouldSetResponder={() => true}
              onResponderMove={handleProgressBarMove}
              onResponderRelease={() => setIsSeeking(false)}
            >
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progressPercent * 100}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
                {/* Thumb indicator */}
                <View
                  style={[
                    styles.progressThumb,
                    {
                      left: `${progressPercent * 100}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
            </Pressable>

            <View style={styles.timeContainer}>
              <Text variant="labelMedium" style={styles.timeText}>
                {formatTime(currentTime)}
              </Text>
              <Text variant="labelMedium" style={styles.timeText}>
                {formatTime(duration)}
              </Text>
            </View>
          </SafeAreaView>
        </View>
      )}

      {/* Up Next Overlay */}
      {showNextVideoOverlay && nextVideo && (
        <View style={styles.nextVideoOverlay}>
          <View style={styles.nextVideoCard}>
            <Text variant="labelLarge" style={styles.upNextLabel}>
              Up Next in {countdown}s
            </Text>
            <Text variant="titleMedium" style={styles.nextVideoTitle} numberOfLines={2}>
              {nextVideo.name}
            </Text>
            <View style={styles.nextVideoButtons}>
              <Button
                mode="contained"
                onPress={playNextVideo}
                icon="play"
                style={styles.playNowButton}
              >
                Play Now
              </Button>
              <Button
                mode="outlined"
                onPress={cancelAutoPlay}
                textColor="#FFFFFF"
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoTitle: {
    flex: 1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
    fontWeight: '600',
  },
  speedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  speedChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  seekButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressTouchArea: {
    paddingVertical: 12,
    marginBottom: 4,
  },
  progressBarContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    top: -5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#FFFFFF',
  },
  nextVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextVideoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '80%',
  },
  upNextLabel: {
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  nextVideoTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
  },
  nextVideoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playNowButton: {
    minWidth: 120,
  },
  cancelButton: {
    minWidth: 100,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
