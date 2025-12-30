import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip, IconButton, Icon, useTheme } from 'react-native-paper';
import { spacing } from '@shared/theme';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
  onClearAll: () => void;
}

function RecentSearchesComponent({
  searches,
  onSelect,
  onRemove,
  onClearAll,
}: RecentSearchesProps) {
  const theme = useTheme();

  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Icon
            source="clock-outline"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            variant="labelLarge"
            style={[styles.headerText, { color: theme.colors.onSurfaceVariant }]}
          >
            Recent Searches
          </Text>
        </View>
        <IconButton
          icon="delete-sweep"
          size={20}
          onPress={onClearAll}
          iconColor={theme.colors.onSurfaceVariant}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {searches.map((term) => (
          <Chip
            key={term}
            mode="outlined"
            onPress={() => onSelect(term)}
            onClose={() => onRemove(term)}
            closeIcon="close"
            style={styles.chip}
            textStyle={{ color: theme.colors.onSurface }}
          >
            {term}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerText: {
    marginLeft: spacing.xs,
  },
  chipsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  chip: {
    marginRight: spacing.xs,
  },
});

export const RecentSearches = memo(RecentSearchesComponent);
