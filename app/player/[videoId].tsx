import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, GestureResponderEvent, LayoutChangeEvent, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, IconButton, Chip, Button, useTheme, Surface, Icon } from 'react-native-paper';
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
  const insets = useSafeAreaInsets();
  const { updateVideoProgress, getVideoProgress } = useProgress();
  const { getCourse } = useCourses();

  const [isFullscreen, setIsFullscreen] = useState(false);
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
  const showNextVideoOverlayRef = useRef(false);

  const existingProgress = getVideoProgress(params.videoId);
  const initialPosition = existingProgress?.isComplete ? 0 : (existingProgress?.lastPosition || 0);

  // Get section videos for the list
  const getSectionVideos = useCallback((): Video[] => {
    const course = getCourse(params.courseId);
    if (!course) return [];
    const section = course.sections.find(s => s.id === params.sectionId);
    return section?.videos || [];
  }, [getCourse, params.courseId, params.sectionId]);

  const sectionVideos = getSectionVideos();

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

  // Start in portrait mode, unlock orientation
  useEffect(() => {
    const setup = async () => {
      await ScreenOrientation.unlockAsync();
    };
    setup();

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

  // Backup: Use playingChange with 99% threshold check
  useEffect(() => {
    const subscription = player.addListener('playingChange', ({ isPlaying }) => {
      const currentTimeVal = player.currentTime;
      const durationVal = player.duration;

      if (!isPlaying && durationVal > 0 && currentTimeVal >= durationVal * 0.99) {
        const course = getCourse(params.courseId);
        if (!course) return;
        const section = course.sections.find(s => s.id === params.sectionId);
        if (!section) return;
        const currentIndex = section.videos.findIndex(v => v.id === params.videoId);

        if (currentIndex >= 0 && currentIndex < section.videos.length - 1 && !showNextVideoOverlayRef.current) {
          setShowNextVideoOverlay(true);
          setCountdown(5);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, getCourse, params.courseId, params.sectionId, params.videoId]);

  // Primary: Trigger "Up Next" when video reaches end
  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      const course = getCourse(params.courseId);
      if (!course) return;

      const section = course.sections.find(s => s.id === params.sectionId);
      if (!section) return;

      const currentIndex = section.videos.findIndex(v => v.id === params.videoId);

      if (currentIndex >= 0 && currentIndex < section.videos.length - 1 && !showNextVideoOverlayRef.current) {
        setShowNextVideoOverlay(true);
        setCountdown(5);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, getCourse, params.courseId, params.sectionId, params.videoId]);

  // Track time and trigger "Up Next" when 5 seconds remaining
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTimeVal = player.currentTime;
      const durationVal = player.duration;

      if (currentTimeVal !== undefined) {
        setCurrentTime(currentTimeVal);
      }
      if (durationVal !== undefined && durationVal > 0) {
        setDuration(durationVal);

        const timeRemaining = durationVal - currentTimeVal;

        const course = getCourse(params.courseId);
        if (!course) return;
        const section = course.sections.find(s => s.id === params.sectionId);
        if (!section) return;
        const currentIndex = section.videos.findIndex(v => v.id === params.videoId);
        const hasNextVideo = currentIndex >= 0 && currentIndex < section.videos.length - 1;

        if (timeRemaining <= 5 && timeRemaining > 0 && hasNextVideo && !showNextVideoOverlayRef.current) {
          setShowNextVideoOverlay(true);
          setCountdown(Math.ceil(timeRemaining));
        }
      }
    }, 250);

    return () => {
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

    if (duration > 0) {
      updateVideoProgress(params.videoId, duration, duration);
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

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

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsFullscreen(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsFullscreen(true);
    }
    resetHideControlsTimeout();
  };

  const handleVideoSelect = (video: Video) => {
    if (video.id === params.videoId) return;

    if (duration > 0 && currentTime > 0) {
      updateVideoProgress(params.videoId, currentTime, duration);
    }

    router.replace({
      pathname: '/player/[videoId]',
      params: {
        videoId: video.id,
        videoPath: video.filePath,
        videoName: video.name,
        courseId: params.courseId,
        sectionId: params.sectionId,
      },
    });
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

  // Fullscreen (Landscape) Layout
  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <TouchableOpacity
          style={styles.playerContainer}
          activeOpacity={1}
          onPress={resetHideControlsTimeout}
        >
          <VideoView
            player={player}
            style={styles.fullscreenVideo}
            contentFit="contain"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        </TouchableOpacity>

        {isControlsVisible && (
          <View style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={[styles.topBar, { paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }]}>
              <IconButton
                icon="close"
                iconColor="#FFFFFF"
                size={24}
                onPress={handleClose}
                style={styles.controlButton}
              />
              <Text
                variant="titleMedium"
                style={styles.videoTitle}
                numberOfLines={1}
              >
                {params.videoName}
              </Text>
              <View style={styles.topBarRight}>
                <Chip
                  mode="flat"
                  compact
                  onPress={handlePlaybackRateChange}
                  style={styles.speedChip}
                  textStyle={styles.speedChipText}
                >
                  {PLAYBACK_RATES[playbackRateIndex]}x
                </Chip>
                <IconButton
                  icon="fullscreen-exit"
                  iconColor="#FFFFFF"
                  size={24}
                  onPress={toggleFullscreen}
                  style={styles.controlButton}
                />
              </View>
            </View>

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
            <View style={[styles.bottomBar, { paddingLeft: insets.left + 24, paddingRight: insets.right + 24 }]}>
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
            </View>
          </View>
        )}

        {/* Up Next Button */}
        {showNextVideoOverlay && nextVideo && (
          <View style={[styles.nextVideoButton, { right: insets.right + 24 }]}>
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

  // Portrait Layout
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Video Container at Top */}
      <View style={[styles.portraitVideoContainer, { marginTop: insets.top }]}>
        <TouchableOpacity
          style={styles.videoTouchable}
          activeOpacity={1}
          onPress={resetHideControlsTimeout}
        >
          <VideoView
            player={player}
            style={styles.portraitVideo}
            contentFit="contain"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        </TouchableOpacity>

        {/* Portrait Controls Overlay */}
        {isControlsVisible && (
          <View style={styles.portraitControlsOverlay}>
            {/* Top Bar */}
            <View style={styles.portraitTopBar}>
              <IconButton
                icon="close"
                iconColor="#FFFFFF"
                size={24}
                onPress={handleClose}
                style={styles.controlButton}
              />
              <View style={styles.portraitTopBarRight}>
                <Chip
                  mode="flat"
                  compact
                  onPress={handlePlaybackRateChange}
                  style={styles.speedChip}
                  textStyle={styles.speedChipText}
                >
                  {PLAYBACK_RATES[playbackRateIndex]}x
                </Chip>
                <IconButton
                  icon="fullscreen"
                  iconColor="#FFFFFF"
                  size={24}
                  onPress={toggleFullscreen}
                  style={styles.controlButton}
                />
              </View>
            </View>

            {/* Center Controls */}
            <View style={styles.portraitCenterControls}>
              <Pressable
                style={styles.portraitSeekButton}
                onPress={() => handleSeek(-10)}
              >
                <IconButton
                  icon="rewind-10"
                  iconColor="#FFFFFF"
                  size={28}
                />
              </Pressable>

              <IconButton
                icon={isPlaying ? 'pause' : 'play'}
                iconColor="#FFFFFF"
                size={40}
                onPress={handlePlayPause}
                style={[styles.portraitPlayPauseButton, { backgroundColor: theme.colors.primary }]}
              />

              <Pressable
                style={styles.portraitSeekButton}
                onPress={() => handleSeek(10)}
              >
                <IconButton
                  icon="fast-forward-10"
                  iconColor="#FFFFFF"
                  size={28}
                />
              </Pressable>
            </View>

            {/* Bottom Bar */}
            <View style={styles.portraitBottomBar}>
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
                <Text variant="labelSmall" style={styles.timeText}>
                  {formatTime(currentTime)}
                </Text>
                <Text variant="labelSmall" style={styles.timeText}>
                  {formatTime(duration)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Up Next Button (Portrait) */}
        {showNextVideoOverlay && nextVideo && (
          <View style={styles.portraitNextVideoButton}>
            <Button
              mode="contained"
              onPress={playNextVideo}
              icon="skip-next"
              compact
            >
              Next ({countdown}s)
            </Button>
            <IconButton
              icon="close"
              size={18}
              iconColor="#FFFFFF"
              onPress={cancelAutoPlay}
              style={styles.cancelIconButton}
            />
          </View>
        )}
      </View>

      {/* Video Info & List Below */}
      <View style={[styles.videoListContainer, { backgroundColor: theme.colors.background }]}>
        {/* Current Video Info */}
        <Surface style={[styles.currentVideoInfo, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }} numberOfLines={2}>
            {params.videoName}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {sectionVideos.findIndex(v => v.id === params.videoId) + 1} of {sectionVideos.length} videos
          </Text>
        </Surface>

        {/* Video List */}
        <ScrollView
          style={styles.videoList}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        >
          <Text variant="titleSmall" style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant }]}>
            Up Next
          </Text>
          {sectionVideos.map((video, index) => {
            const videoProgress = getVideoProgress(video.id);
            const isCurrentVideo = video.id === params.videoId;
            const isComplete = videoProgress?.isComplete || false;

            return (
              <Pressable
                key={video.id}
                onPress={() => handleVideoSelect(video)}
                style={[
                  styles.videoListItem,
                  { backgroundColor: isCurrentVideo ? theme.colors.primaryContainer : theme.colors.surface },
                ]}
              >
                <View style={styles.videoListItemLeft}>
                  {isComplete ? (
                    <View style={[styles.completeBadge, { backgroundColor: theme.colors.primary }]}>
                      <Icon source="check" size={14} color={theme.colors.onPrimary} />
                    </View>
                  ) : isCurrentVideo ? (
                    <View style={[styles.playingIndicator, { backgroundColor: theme.colors.primary }]}>
                      <Icon source="play" size={14} color={theme.colors.onPrimary} />
                    </View>
                  ) : (
                    <Text variant="bodySmall" style={[styles.videoNumber, { color: theme.colors.onSurfaceVariant }]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <View style={styles.videoListItemContent}>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: isCurrentVideo ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                      fontWeight: isCurrentVideo ? '600' : '400',
                    }}
                    numberOfLines={2}
                  >
                    {video.name}
                  </Text>
                  {videoProgress && !isComplete && videoProgress.lastPosition > 0 && (
                    <View style={styles.videoProgressContainer}>
                      <View style={[styles.videoProgressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <View
                          style={[
                            styles.videoProgressFill,
                            {
                              width: `${videoProgress.percentComplete}%`,
                              backgroundColor: theme.colors.primary,
                            }
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
                {!isCurrentVideo && (
                  <IconButton
                    icon="play-circle-outline"
                    size={24}
                    iconColor={theme.colors.primary}
                    onPress={() => handleVideoSelect(video)}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
  },

  // Portrait Video Container
  portraitVideoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoTouchable: {
    flex: 1,
  },
  portraitVideo: {
    flex: 1,
  },

  // Portrait Controls
  portraitControlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
  },
  portraitTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  portraitTopBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portraitCenterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  portraitSeekButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portraitPlayPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  portraitBottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  portraitNextVideoButton: {
    position: 'absolute',
    bottom: 50,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Video List
  videoListContainer: {
    flex: 1,
  },
  currentVideoInfo: {
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
  },
  videoList: {
    flex: 1,
    marginTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '600',
  },
  videoListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  videoListItemLeft: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoNumber: {
    fontWeight: '500',
  },
  completeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoListItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  videoProgressContainer: {
    marginTop: 6,
  },
  videoProgressBar: {
    height: 3,
    borderRadius: 1.5,
    width: '60%',
  },
  videoProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  // Fullscreen Mode
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerContainer: {
    flex: 1,
  },
  fullscreenVideo: {
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
    paddingTop: 16,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
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
