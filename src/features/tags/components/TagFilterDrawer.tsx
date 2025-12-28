import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  useTheme,
  Surface,
} from 'react-native-paper';
import { useTags } from '@shared/contexts/TagsContext';
import { spacing } from '@shared/theme';
import { TagChip } from './TagChip';

interface TagFilterDrawerProps {
  visible: boolean;
  onDismiss: () => void;
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onClearFilters: () => void;
}

export function TagFilterDrawer({
  visible,
  onDismiss,
  selectedTagIds,
  onToggleTag,
  onClearFilters,
}: TagFilterDrawerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state } = useTags();

  const hasActiveFilters = selectedTagIds.length > 0;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          marginTop: -insets.top,
          marginBottom: -insets.bottom,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        contentContainerStyle={[
          styles.modal,
          {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Filter by Tags
          </Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        {state.tags.length === 0 ? (
          <Surface
            style={[styles.tagsSection, { backgroundColor: theme.colors.surfaceVariant }]}
            elevation={0}
          >
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
            >
              No tags created yet
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
                marginTop: spacing.xs,
              }}
            >
              Create tags in Settings to filter courses
            </Text>
          </Surface>
        ) : (
          <Surface
            style={[styles.tagsSection, { backgroundColor: theme.colors.surfaceVariant }]}
            elevation={0}
          >
            <Text
              variant="labelMedium"
              style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              TAP TO SELECT
            </Text>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.tagsContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.tagsGrid}>
                {state.tags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    tag={tag}
                    selected={selectedTagIds.includes(tag.id)}
                    onPress={() => onToggleTag(tag.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </Surface>
        )}

        <View style={styles.footer}>
          {hasActiveFilters && (
            <Button
              mode="outlined"
              onPress={onClearFilters}
              style={styles.clearButton}
            >
              Clear
            </Button>
          )}
          <Button mode="contained" onPress={onDismiss}>
            Done
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: spacing.md,
    borderRadius: 20,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  tagsSection: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'center',
  },
  scrollView: {
    maxHeight: 200,
  },
  tagsContainer: {
    paddingTop: spacing.xs,
  },
  sectionLabel: {
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  clearButton: {
    flex: 1,
  },
});
