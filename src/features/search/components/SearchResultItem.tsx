import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';
import { spacing, borderRadius, colors } from '@shared/theme';
import { SearchResult } from '../types';
import { HighlightedText } from './HighlightedText';

interface SearchResultItemProps {
  result: SearchResult;
  onPress: (result: SearchResult) => void;
}

const ICONS: Record<string, string> = {
  course: 'book-open-variant',
  section: 'folder',
  video: 'play-circle',
};

const LABELS: Record<string, string> = {
  course: 'Course',
  section: 'Section',
  video: 'Video',
};

function SearchResultItemComponent({ result, onPress }: SearchResultItemProps) {
  const theme = useTheme();

  const breadcrumb = result.type === 'video'
    ? `${result.course.name} › ${result.section?.name}`
    : result.type === 'section'
    ? result.course.name
    : null;

  return (
    <Pressable
      onPress={() => onPress(result)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? theme.colors.surfaceVariant : 'transparent' },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Icon source={ICONS[result.type]} size={24} color={colors.iconDefault} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <HighlightedText
            text={result.name}
            matchStart={result.matchStart}
            matchEnd={result.matchEnd}
            variant="bodyMedium"
            numberOfLines={2}
          />
        </View>
        {breadcrumb && (
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {breadcrumb}
          </Text>
        )}
        <Text
          variant="labelSmall"
          style={[styles.typeLabel, { color: colors.iconDefault }]}
        >
          {LABELS[result.type]}
        </Text>
      </View>
      <Icon source="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xs,
  },
  typeLabel: {
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
    fontWeight: '600',
  },
});

export const SearchResultItem = memo(SearchResultItemComponent);
