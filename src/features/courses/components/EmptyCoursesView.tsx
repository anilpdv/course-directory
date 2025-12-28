import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon, useTheme } from 'react-native-paper';

interface EmptyCoursesViewProps {
  onRescan: () => void;
  onAddCourse: () => void;
}

export function EmptyCoursesView({ onRescan, onAddCourse }: EmptyCoursesViewProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon source="folder-open-outline" size={64} color={theme.colors.onSurfaceVariant} />
      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onBackground }]}
      >
        No Courses Found
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.text, { color: theme.colors.onSurfaceVariant }]}
      >
        No video courses were found. Try rescanning or add more courses.
      </Text>
      <Button
        mode="contained"
        onPress={onRescan}
        icon="refresh"
        style={styles.button}
      >
        Rescan
      </Button>
      <Button
        mode="outlined"
        onPress={onAddCourse}
        icon="folder-plus"
        style={styles.button}
      >
        Add Course
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  text: {
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
    minWidth: 180,
  },
});
