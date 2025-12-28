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

  // Ref to prevent double-triggering of "Up Next" overlay
  const showNextVideoOverlayRef = useRef(false);

  const existingProgress = getVideoProgress(params.videoId);
  // If video is complete, start from beginning; otherwise resume from last position
  const initialPosition = existingProgress?.isComplete ? 0 : (existingProgress?.lastPosition || 0);

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

  // Debug logging
  console.log('[DEBUG] VideoPlayerScreen rendered');
  console.log('[DEBUG] Params:', JSON.stringify(params));
  console.log('[DEBUG] nextVideo:', nextVideo ? nextVideo.name : 'null');

  // Keep ref in sync with state to prevent double-triggering
  useEffect(() => {
    showNextVideoOverlayRef.current = showNextVideoOverlay;
  }, [showNextVideoOverlay]);

  const player = useVideoPlayer(params.videoPath, (player) => {
    player.loop = false;
    player.playbackRate = PLAYBACK_RATES[playbackRateIndex];
    player.staysActiveInBackground = true;
    player.showNowPlayingNotification = true;
    player.audioMixingMode = 'doNotMix';

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

  // Track isPlaying state
  useEffect(() => {
    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  // Backup: Use playingChange with 99% threshold check (workaround for playToEnd issues)
  useEffect(() => {
    console.log('[DEBUG] Setting up playingChange backup listener');

    const subscription = player.addListener('playingChange', ({ isPlaying }) => {
      const currentTimeVal = player.currentTime;
      const durationVal = player.duration;

      console.log(`[DEBUG] playingChange: isPlaying=${isPlaying}, time=${currentTimeVal?.toFixed(1)}, duration=${durationVal?.toFixed(1)}`);

      // Check if video finished (at 99% or more)
      if (!isPlaying && durationVal > 0 && currentTimeVal >= durationVal * 0.99) {
        console.log('[DEBUG] Video finished (99% threshold reached)');

        const course = getCourse(params.courseId);
        if (!course) return;
        const section = course.sections.find(s => s.id === params.sectionId);
        if (!section) return;
        const currentIndex = section.videos.findIndex(v => v.id === params.videoId);

        if (currentIndex >= 0 && currentIndex < section.videos.length - 1 && !showNextVideoOverlayRef.current) {
          console.log('[DEBUG] *** SHOWING UP NEXT BUTTON (from playingChange 99%) ***');
          setShowNextVideoOverlay(true);
          setCountdown(5);
        }
      }
    });

    return () => {
      console.log('[DEBUG] Cleaning up playingChange backup listener');
      subscription.remove();
    };
  }, [player, getCourse, params.courseId, params.sectionId, params.videoId]);

  // Primary: Trigger "Up Next" when video reaches end
  useEffect(() => {
    console.log('[DEBUG] Setting up playToEnd listener');

    const subscription = player.addListener('playToEnd', () => {
      console.log('[DEBUG] *** playToEnd EVENT FIRED ***');

      // Recalculate if there's a next video
      const course = getCourse(params.courseId);
      if (!course) {
        console.log('[DEBUG] playToEnd: Course NOT found!');
        return;
      }

      const section = course.sections.find(s => s.id === params.sectionId);
      if (!section) {
        console.log('[DEBUG] playToEnd: Section NOT found!');
        return;
      }

      const currentIndex = section.videos.findIndex(v => v.id === params.videoId);
      console.log(`[DEBUG] playToEnd: currentIndex=${currentIndex}, totalVideos=${section.videos.length}`);

      if (currentIndex >= 0 && currentIndex < section.videos.length - 1 && !showNextVideoOverlayRef.current) {
        console.log('[DEBUG] *** SHOWING UP NEXT BUTTON (from playToEnd) ***');
        setShowNextVideoOverlay(true);
        setCountdown(5);
      }
    });

    return () => {
      console.log('[DEBUG] Cleaning up playToEnd listener');
      subscription.remove();
    };
  }, [player, getCourse, params.courseId, params.sectionId, params.videoId]);

  // Track time and trigger "Up Next" when 5 seconds remaining
  useEffect(() => {
    console.log('[DEBUG] Setting up time tracking interval');

    const interval = setInterval(() => {
      const currentTimeVal = player.currentTime;
      const durationVal = player.duration;

      if (currentTimeVal !== undefined) {
        setCurrentTime(currentTimeVal);
      }
      if (durationVal !== undefined && durationVal > 0) {
        setDuration(durationVal);

        const timeRemaining = durationVal - currentTimeVal;

        // Debug: Log time info when close to end
        if (timeRemaining <= 10 && timeRemaining > 0) {
          console.log(`[DEBUG] Time remaining: ${timeRemaining.toFixed(1)}s, Duration: ${durationVal.toFixed(1)}s`);
        }

        // Recalculate if there's a next video
        const course = getCourse(params.courseId);
        if (!course) {
          console.log('[DEBUG] Course NOT found! courseId:', params.courseId);
          return;
        }
        const section = course.sections.find(s => s.id === params.sectionId);
        if (!section) {
          console.log('[DEBUG] Section NOT found! sectionId:', params.sectionId);
          return;
        }
        const currentIndex = section.videos.findIndex(v => v.id === params.videoId);
        const hasNextVideo = currentIndex >= 0 && currentIndex < section.videos.length - 1;

        if (timeRemaining <= 10 && timeRemaining > 0) {
          console.log(`[DEBUG] Current index: ${currentIndex}, Total videos: ${section.videos.length}, Has next: ${hasNextVideo}`);
        }

        // Show "Up Next" button when 5 seconds or less remaining
        if (timeRemaining <= 5 && timeRemaining > 0 && hasNextVideo && !showNextVideoOverlayRef.current) {
          console.log('[DEBUG] *** SHOWING UP NEXT BUTTON (time-based) ***');
          setShowNextVideoOverlay(true);
          setCountdown(Math.ceil(timeRemaining));
        }
      }
    }, 250);

    return () => {
      console.log('[DEBUG] Cleaning up time tracking interval');
      clearInterval(interval);
    };
  }, [player, getCourse, params.courseId, params.sectionId, params.videoId]);

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


  // Countdown timer for auto-play
  useEffect(() => {
    if (showNextVideoOverlay) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [showNextVideoOverlay]);

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
          allowsPictureInPicture={false}
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

      {/* Up Next Button */}
      {showNextVideoOverlay && nextVideo && (
        <View style={styles.nextVideoButton}>
          <Button
            mode="contained"
            onPress={playNextVideo}
            icon="skip-next"
            contentStyle={styles.nextButtonContent}
          >
            Next ({countdown}s)
          </Button>
          <IconButton
            icon="close"
            size={20}
            iconColor="#FFFFFF"
            onPress={cancelAutoPlay}
            style={styles.cancelIconButton}
          />
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
  nextVideoButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonContent: {
    paddingHorizontal: 8,
  },
  cancelIconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: 0,
  },
});
