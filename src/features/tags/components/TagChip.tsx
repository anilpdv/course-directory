import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Chip } from 'react-native-paper';
import { Tag } from '@shared/types';

interface TagChipProps {
  tag: Tag;
  onPress?: () => void;
  onClose?: () => void;
  selected?: boolean;
  size?: 'small' | 'medium';
}

export function TagChip({
  tag,
  onPress,
  onClose,
  selected = false,
  size = 'medium',
}: TagChipProps) {
  const isSmall = size === 'small';

  // For small size, use custom View + Text for full control (Chip clips text)
  if (isSmall) {
    const content = (
      <View
        style={[
          styles.smallTag,
          {
            backgroundColor: selected ? tag.color : `${tag.color}25`,
            borderColor: tag.color,
            borderWidth: selected ? 2 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.smallTagText,
            { color: selected ? '#FFFFFF' : tag.color },
          ]}
        >
          {tag.name}
        </Text>
      </View>
    );

    if (onPress) {
      return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
    }
    return content;
  }

  // For medium size, use Chip component
  return (
    <Chip
      mode="flat"
      selected={selected}
      showSelectedCheck={selected}
      onPress={onPress}
      onClose={onClose}
      closeIcon={onClose ? 'close' : undefined}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? tag.color : `${tag.color}25`,
          borderColor: tag.color,
          borderWidth: selected ? 2 : 1,
        },
      ]}
      textStyle={[
        styles.text,
        {
          color: selected ? '#FFFFFF' : tag.color,
        },
      ]}
    >
      {tag.name}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  smallTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  smallTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
