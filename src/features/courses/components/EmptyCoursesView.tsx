import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon, useTheme } from 'react-native-paper';
import { spacing } from '@shared/theme';

interface EmptyCoursesViewProps {
  onRescan: () => void;
  onAddCourse: () => void;
  onAddMultipleCourses: () => void;
}

function EmptyCoursesViewComponent({ onRescan, onAddCourse, onAddMultipleCourses }: EmptyCoursesViewProps) {
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
      <Button
        mode="outlined"
        onPress={onAddMultipleCourses}
        icon="folder-multiple"
        style={styles.button}
      >
        Add Multiple Courses
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    marginBottom: spacing.sm + 4,
    minWidth: 180,
  },
});

// Memoize to prevent unnecessary re-renders
export const EmptyCoursesView = memo(EmptyCoursesViewComponent);
