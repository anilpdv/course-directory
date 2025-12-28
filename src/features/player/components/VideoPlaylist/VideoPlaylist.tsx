import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Video, VideoProgress } from '@shared/types';
import { CurrentVideoInfo } from './CurrentVideoInfo';
import { PlaylistItem } from './PlaylistItem';

interface VideoPlaylistProps {
  videoName: string;
  videos: Video[];
  currentVideoId: string;
  currentIndex: number;
  insets: EdgeInsets;
  getVideoProgress: (videoId: string) => VideoProgress | undefined;
  onVideoSelect: (video: Video) => void;
}

export function VideoPlaylist({
  videoName,
  videos,
  currentVideoId,
  currentIndex,
  insets,
  getVideoProgress,
  onVideoSelect,
}: VideoPlaylistProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CurrentVideoInfo
        videoName={videoName}
        currentIndex={currentIndex}
        totalVideos={videos.length}
      />

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        <Text
          variant="titleSmall"
          style={[styles.header, { color: theme.colors.onSurfaceVariant }]}
        >
          Up Next
        </Text>
        {videos.map((video, index) => (
          <PlaylistItem
            key={video.id}
            video={video}
            index={index}
            isCurrentVideo={video.id === currentVideoId}
            progress={getVideoProgress(video.id)}
            onSelect={onVideoSelect}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '600',
  },
});
