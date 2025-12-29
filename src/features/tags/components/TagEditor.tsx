import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useDeviceType } from '@shared/hooks';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  useTheme,
  Surface,
} from 'react-native-paper';
import { Tag } from '@shared/types';
import { tagColors } from '@shared/theme/colors';
import { spacing } from '@shared/theme';

interface TagEditorProps {
  tag?: Tag;
  visible: boolean;
  onDismiss: () => void;
  onSave: (name: string, color: string) => void;
  existingNames?: string[];
}

export function TagEditor({
  tag,
  visible,
  onDismiss,
  onSave,
  existingNames = [],
}: TagEditorProps) {
  const theme = useTheme();
  const { isTablet } = useDeviceType();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(tagColors[0]);
  const [error, setError] = useState('');

  const isEditing = !!tag;

  useEffect(() => {
    if (visible) {
      if (tag) {
        setName(tag.name);
        setSelectedColor(tag.color);
      } else {
        setName('');
        setSelectedColor(tagColors[0]);
      }
      setError('');
    }
  }, [visible, tag]);

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Tag name cannot be empty');
      return;
    }

    // Check for duplicates (excluding current tag if editing)
    const isDuplicate = existingNames.some(
      (n) =>
        n.toLowerCase() === trimmedName.toLowerCase() &&
        (!tag || n.toLowerCase() !== tag.name.toLowerCase())
    );

    if (isDuplicate) {
      setError('A tag with this name already exists');
      return;
    }

    onSave(trimmedName, selectedColor);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          isTablet && styles.modalTablet,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {isEditing ? 'Edit Tag' : 'Create Tag'}
        </Text>

        <TextInput
          label="Tag Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError('');
          }}
          mode="outlined"
          style={styles.input}
          error={!!error}
          autoFocus
          maxLength={30}
        />
        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        ) : null}

        <Text
          variant="labelLarge"
          style={[styles.colorLabel, { color: theme.colors.onSurfaceVariant }]}
        >
          Color
        </Text>

        <View style={styles.colorGrid}>
          {tagColors.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                selectedColor === color && styles.colorSwatchSelected,
                selectedColor === color && {
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              {selectedColor === color && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.previewContainer}>
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Preview:
          </Text>
          <Surface
            style={[
              styles.previewTag,
              { backgroundColor: selectedColor, borderColor: selectedColor },
            ]}
            elevation={1}
          >
            <Text
              style={[
                styles.previewText,
                {
                  color: isLightColor(selectedColor) ? '#000000' : '#FFFFFF',
                },
              ]}
            >
              {name.trim() || 'Tag Name'}
            </Text>
          </Surface>
        </View>

        <View style={styles.actions}>
          <Button mode="text" onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            disabled={!name.trim()}
          >
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

const styles = StyleSheet.create({
  modal: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    width: '90%',
    alignSelf: 'center',
  },
  modalTablet: {
    width: 400,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.xs,
  },
  error: {
    fontSize: 12,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  colorLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  previewTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  previewText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  button: {
    minWidth: 80,
  },
});
