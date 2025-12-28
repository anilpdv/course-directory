import React, { useState, useMemo } from 'react';
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
import { TagEditor } from './TagEditor';

interface TagSelectorProps {
  courseId: string;
  courseName: string;
  visible: boolean;
  onDismiss: () => void;
}

export function TagSelector({
  courseId,
  courseName,
  visible,
  onDismiss,
}: TagSelectorProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, assignTag, unassignTag, createTag, getTagsForCourse } = useTags();
  const [editorVisible, setEditorVisible] = useState(false);

  const assignedTagIds = useMemo(() => {
    return state.courseTags[courseId] || [];
  }, [state.courseTags, courseId]);

  const handleToggleTag = async (tagId: string) => {
    if (assignedTagIds.includes(tagId)) {
      await unassignTag(courseId, tagId);
    } else {
      await assignTag(courseId, tagId);
    }
  };

  const handleCreateTag = async (name: string, color: string) => {
    const newTag = await createTag(name, color);
    // Automatically assign the new tag to this course
    await assignTag(courseId, newTag.id);
  };

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
          <View style={styles.headerText}>
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              Manage Tags
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={1}
            >
              {courseName}
            </Text>
          </View>
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
              Create your first tag to organize courses
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
              TAP TO TOGGLE
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
                    selected={assignedTagIds.includes(tag.id)}
                    onPress={() => handleToggleTag(tag.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </Surface>
        )}

        <View style={styles.footer}>
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => setEditorVisible(true)}
            style={styles.createButton}
          >
            Create New Tag
          </Button>
          <Button mode="contained" onPress={onDismiss}>
            Done
          </Button>
        </View>

        <TagEditor
          visible={editorVisible}
          onDismiss={() => setEditorVisible(false)}
          onSave={handleCreateTag}
          existingNames={state.tags.map((t) => t.name)}
        />
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
    alignItems: 'flex-start',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  createButton: {
    flex: 1,
  },
});
