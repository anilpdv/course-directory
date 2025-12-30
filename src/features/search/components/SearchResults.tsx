import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';
import { spacing } from '@shared/theme';
import { SearchResult } from '../types';
import { SearchResultItem } from './SearchResultItem';
import { RecentSearches } from './RecentSearches';

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  hasQuery: boolean;
  recentSearches: string[];
  onSelectRecentSearch: (term: string) => void;
  onRemoveRecentSearch: (term: string) => void;
  onClearRecentSearches: () => void;
  onResultSelect: (result: SearchResult) => void;
}

function SearchResultsComponent({
  results,
  isSearching,
  hasQuery,
  recentSearches,
  onSelectRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
  onResultSelect,
}: SearchResultsProps) {
  const theme = useTheme();

  // Show recent searches when not searching
  if (!isSearching) {
    return (
      <RecentSearches
        searches={recentSearches}
        onSelect={onSelectRecentSearch}
        onRemove={onRemoveRecentSearch}
        onClearAll={onClearRecentSearches}
      />
    );
  }

  // No results found
  if (hasQuery && results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon source="magnify-close" size={48} color={theme.colors.onSurfaceVariant} />
        <Text
          variant="bodyLarge"
          style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
        >
          No results found
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Try a different search term
        </Text>
      </View>
    );
  }

  // Show results - use ScrollView to avoid nested FlatList issues
  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.resultsHeader}>
        <Text
          variant="labelLarge"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </Text>
      </View>
      {results.map((item) => (
        <SearchResultItem
          key={`${item.type}-${item.id}`}
          result={item}
          onPress={onResultSelect}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
});

export const SearchResults = memo(SearchResultsComponent);
