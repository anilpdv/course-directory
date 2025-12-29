import React, { useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Video, VideoProgress } from '@shared/types';
import { CurrentVideoInfo } from './CurrentVideoInfo';
import { PlaylistItem } from './PlaylistItem';

// Height of each playlist item for getItemLayout optimization
const ITEM_HEIGHT = 72; // container padding (24) + content (~48)
const HEADER_HEIGHT = 40; // "Up Next" header

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

  // Memoized render function for each item
  const renderItem = useCallback(
    ({ item, index }: { item: Video; index: number }) => (
      <PlaylistItem
        video={item}
        index={index}
        isCurrentVideo={item.id === currentVideoId}
        progress={getVideoProgress(item.id)}
        onSelect={onVideoSelect}
      />
    ),
    [currentVideoId, getVideoProgress, onVideoSelect]
  );

  // Stable key extractor
  const keyExtractor = useCallback((item: Video) => item.id, []);

  // Optimize scroll performance with known item heights
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index + HEADER_HEIGHT,
      index,
    }),
    []
  );

  // Calculate initial scroll position to show current video
  const initialScrollIndex = useMemo(() => {
    const idx = videos.findIndex(v => v.id === currentVideoId);
    // Show 2 videos before current if possible
    return Math.max(0, idx - 2);
  }, [videos, currentVideoId]);

  // List header component
  const ListHeader = useMemo(
    () => (
      <Text
        variant="titleSmall"
        style={[styles.header, { color: theme.colors.onSurfaceVariant }]}
      >
        Up Next
      </Text>
    ),
    [theme.colors.onSurfaceVariant]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CurrentVideoInfo
        videoName={videoName}
        currentIndex={currentIndex}
        totalVideos={videos.length}
      />

      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialScrollIndex={videos.length > 0 ? initialScrollIndex : undefined}
        ListHeaderComponent={ListHeader}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        // Performance optimizations
        windowSize={5}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        initialNumToRender={15}
      />
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
