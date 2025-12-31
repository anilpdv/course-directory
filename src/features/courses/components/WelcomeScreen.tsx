import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Icon, useTheme } from 'react-native-paper';
import { colors } from '@shared/theme';

interface WelcomeScreenProps {
  onAddSingleCourse: () => void;
  onAddMultipleCourses: () => void;
  isLoading: boolean;
}

export const WelcomeScreen = memo(function WelcomeScreen({
  onAddSingleCourse,
  onAddMultipleCourses,
  isLoading,
}: WelcomeScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <View style={styles.content}>
        <Icon source="book-open-page-variant" size={80} color={colors.iconDefault} />
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Welcome to CourseViewer
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Add your video courses to get started.
        </Text>

        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={onAddSingleCourse}
            loading={isLoading}
            disabled={isLoading}
            icon="folder-plus"
            style={styles.button}
          >
            Add Course
          </Button>
          <Button
            mode="outlined"
            onPress={onAddMultipleCourses}
            loading={isLoading}
            disabled={isLoading}
            icon="folder-multiple"
            style={styles.button}
          >
            Add Multiple
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
  },
});
