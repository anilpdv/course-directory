import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useDeviceType } from '@shared/hooks';
import {
  Modal,
  Portal,
  Text,
  Button,
  List,
  IconButton,
  useTheme,
  Surface,
} from 'react-native-paper';
import { Tag } from '@shared/types';
import { useTags } from '@shared/contexts/TagsContext';
import { spacing } from '@shared/theme';
import { withCount } from '@shared/utils';
import { TagEditor } from './TagEditor';

interface TagListProps {
  visible: boolean;
  onDismiss: () => void;
}

export function TagList({ visible, onDismiss }: TagListProps) {
  const theme = useTheme();
  const { isTablet } = useDeviceType();
  const { state, createTag, updateTag, deleteTag, getCoursesForTag } = useTags();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);

  const handleCreateTag = () => {
    setEditingTag(undefined);
    setEditorVisible(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditorVisible(true);
  };

  const handleDeleteTag = (tag: Tag) => {
    const courseCount = getCoursesForTag(tag.id).length;
    const message =
      courseCount > 0
        ? `This tag is used by ${withCount(courseCount, 'course')}. Are you sure you want to delete it?`
        : 'Are you sure you want to delete this tag?';

    Alert.alert('Delete Tag', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTag(tag.id),
      },
    ]);
  };

  const handleSaveTag = async (name: string, color: string) => {
    if (editingTag) {
      await updateTag({ ...editingTag, name, color });
    } else {
      await createTag(name, color);
    }
  };

  const renderTag = ({ item: tag }: { item: Tag }) => {
    const courseCount = getCoursesForTag(tag.id).length;

    return (
      <List.Item
        title={tag.name}
        description={withCount(courseCount, 'course')}
        left={() => (
          <View
            style={[styles.colorIndicator, { backgroundColor: tag.color }]}
          />
        )}
        right={() => (
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => handleEditTag(tag)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => handleDeleteTag(tag)}
            />
          </View>
        )}
        onPress={() => handleEditTag(tag)}
        titleStyle={{ color: theme.colors.onSurface, fontWeight: '500' }}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        style={styles.listItem}
      />
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text
        variant="bodyLarge"
        style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
      >
        No tags yet
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.onSurfaceVariant,
          textAlign: 'center',
          marginTop: spacing.xs,
        }}
      >
        Create tags to organize your courses
      </Text>
    </View>
  );

  return (
    <Portal>
      {visible && <View style={styles.backdrop} />}
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          isTablet && styles.modalTablet,
          {
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Manage Tags
          </Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <Surface
          style={[styles.listContainer, { backgroundColor: theme.colors.background }]}
          elevation={0}
        >
          <FlatList
            data={state.tags}
            keyExtractor={(item) => item.id}
            renderItem={renderTag}
            ListEmptyComponent={EmptyState}
            contentContainerStyle={
              state.tags.length === 0 ? styles.emptyContainer : undefined
            }
          />
        </Surface>

        <Button
          mode="contained"
          icon="plus"
          onPress={handleCreateTag}
          style={styles.createButton}
        >
          Create New Tag
        </Button>
      </Modal>

      <TagEditor
        tag={editingTag}
        visible={editorVisible}
        onDismiss={() => setEditorVisible(false)}
        onSave={handleSaveTag}
        existingNames={state.tags.map((t) => t.name)}
      />
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modal: {
    margin: spacing.md,
    borderRadius: 16,
    maxHeight: '100%',
    width: '90%',
    alignSelf: 'center',
  },
  modalTablet: {
    width: 700,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingTop: spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  listContainer: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 12,
    maxHeight: 400,
    minHeight: 150,
  },
  listItem: {
    paddingVertical: spacing.xs,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: spacing.md,
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  createButton: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
});
