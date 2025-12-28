import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  List,
  Button,
  Divider,
  Icon,
  useTheme,
} from 'react-native-paper';
import { useCourses } from '@shared/contexts/CoursesContext';
import { useProgress } from '@shared/contexts/ProgressContext';

export function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { state, addCourses, scanCourses } = useCourses();
  const { clearAllProgress, state: progressState } = useProgress();
  const [isClearing, setIsClearing] = useState(false);

  const { courses } = state;
  const progressCount = Object.keys(progressState.data.videos).length;

  const handleAddCourse = async () => {
    const result = await addCourses();

    // User cancelled - no alert needed
    if (result.cancelled) {
      return;
    }

    // Error occurred
    if (result.error) {
      Alert.alert('Error', result.error);
      return;
    }

    // No courses found in folder
    if (result.noCoursesFound) {
      Alert.alert(
        'No Courses Found',
        'No video courses were found in this folder. Make sure the folder contains video files (MP4, MOV, M4V).'
      );
      return;
    }

    // All duplicates
    if (result.added === 0 && result.duplicates > 0) {
      Alert.alert('Already Added', 'These courses are already in your library.');
      return;
    }

    // Success - courses added
    if (result.added > 0) {
      Alert.alert(
        'Courses Added',
        `Added ${result.added} course${result.added !== 1 ? 's' : ''}.${
          result.duplicates > 0 ? ` ${result.duplicates} duplicate${result.duplicates !== 1 ? 's' : ''} skipped.` : ''
        }`
      );
    }
  };

  const handleClearProgress = () => {
    Alert.alert(
      'Clear All Progress',
      'Are you sure you want to clear all watch progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            await clearAllProgress();
            setIsClearing(false);
            Alert.alert('Done', 'All progress has been cleared.');
          },
        },
      ]
    );
  };

  const handleRescan = async () => {
    await scanCourses();
    Alert.alert('Done', 'Courses have been rescanned.');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Courses Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Courses
          </Text>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <List.Item
              title="Your Library"
              description={`${courses.length} course${courses.length !== 1 ? 's' : ''} in your library`}
              left={() => (
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon source="book-multiple" size={22} color={theme.colors.primary} />
                </View>
              )}
              titleStyle={{ color: theme.colors.onSurface, fontWeight: '600', fontSize: 16 }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
            />
            <View style={styles.buttonRow}>
              <Button mode="contained" onPress={handleAddCourse} style={styles.actionButton}>
                Add Course
              </Button>
              <Button mode="outlined" onPress={handleRescan} style={styles.actionButton}>
                Rescan
              </Button>
            </View>
          </Surface>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Data Management
          </Text>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <List.Item
              title="Watch Progress"
              description={`${progressCount} video${progressCount !== 1 ? 's' : ''} tracked`}
              left={() => (
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon source="chart-line" size={22} color={theme.colors.primary} />
                </View>
              )}
              titleStyle={{ color: theme.colors.onSurface, fontWeight: '500' }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
            <View style={styles.buttonRowEnd}>
              <Button
                mode="contained"
                onPress={handleClearProgress}
                disabled={isClearing || progressCount === 0}
                loading={isClearing}
                buttonColor={theme.colors.error}
              >
                Clear Progress
              </Button>
            </View>
          </Surface>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            About
          </Text>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <List.Item
              title="CourseViewer"
              description="Offline video course player with progress tracking"
              left={() => (
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon source="play-circle" size={22} color={theme.colors.primary} />
                </View>
              )}
              right={() => (
                <View style={[styles.versionBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    v1.0.0
                  </Text>
                </View>
              )}
              titleStyle={{ color: theme.colors.onSurface, fontWeight: '500' }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
          </Surface>
        </View>

        {/* Supported Formats Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Supported Formats
          </Text>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <List.Item
              title="Video Files"
              description="MP4, MOV, M4V"
              left={() => (
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon source="file-video" size={22} color={theme.colors.primary} />
                </View>
              )}
              titleStyle={{ color: theme.colors.onSurface, fontWeight: '500' }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            />
            <Divider style={{ marginHorizontal: 16 }} />
            <View style={styles.formatHint}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                For other formats (MKV, AVI), convert to MP4 using HandBrake or FFmpeg.
              </Text>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  buttonRowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    minWidth: 100,
  },
  formatHint: {
    padding: 16,
  },
});
