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
import { useCourses } from '../contexts/CoursesContext';
import { useProgress } from '../contexts/ProgressContext';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { state, pickCoursesFolder, clearCoursesFolder, scanCourses } = useCourses();
  const { clearAllProgress, state: progressState } = useProgress();
  const [isClearing, setIsClearing] = useState(false);

  const { coursesPath, courses } = state;
  const progressCount = Object.keys(progressState.data.videos).length;

  const getFolderName = (path: string | null) => {
    if (!path) return 'Not selected';
    // Decode URI and extract meaningful folder name
    const decoded = decodeURIComponent(path);
    const cleanPath = decoded.replace(/^file:\/\//, '').replace(/\/+$/, '');
    const parts = cleanPath.split('/');

    // Find a meaningful name (skip system paths)
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      // Skip system-looking names and UUIDs
      if (part &&
          !part.match(/^[A-F0-9-]{36}$/i) &&
          !part.includes('Containers') &&
          !part.includes('AppGroup') &&
          part !== 'File Provider Storage' &&
          part !== 'Shared') {
        return part;
      }
    }
    return parts[parts.length - 1] || 'Selected Folder';
  };

  const handleChangeFolder = async () => {
    await pickCoursesFolder();
  };

  const handleClearFolder = () => {
    Alert.alert(
      'Clear Courses Folder',
      'This will remove the selected folder. You will need to select a new folder to view courses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCoursesFolder();
            router.back();
          },
        },
      ]
    );
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
        {/* Courses Folder Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Courses Folder
          </Text>
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <List.Item
              title={coursesPath ? getFolderName(coursesPath) : 'No Folder Selected'}
              description={coursesPath ? 'Tap Change to select a different folder' : 'Tap Change to select your courses folder'}
              left={(props) => (
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon source="folder" size={22} color={theme.colors.primary} />
                </View>
              )}
              titleStyle={{ color: theme.colors.onSurface, fontWeight: '600', fontSize: 16 }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
            />
            <View style={styles.buttonRow}>
              <Button mode="contained" onPress={handleChangeFolder} style={styles.actionButton}>
                Change
              </Button>
              {coursesPath && (
                <Button
                  mode="contained"
                  onPress={handleClearFolder}
                  buttonColor={theme.colors.error}
                  style={styles.actionButton}
                >
                  Clear
                </Button>
              )}
            </View>
          </Surface>

          {coursesPath && (
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <List.Item
                title="Rescan Courses"
                description={`Found ${courses.length} course${courses.length !== 1 ? 's' : ''}`}
                left={(props) => (
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Icon source="refresh" size={22} color={theme.colors.primary} />
                  </View>
                )}
                right={(props) => (
                  <Icon {...props} source="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                )}
                onPress={handleRescan}
                titleStyle={{ color: theme.colors.onSurface, fontWeight: '500' }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              />
            </Surface>
          )}
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
              left={(props) => (
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
              left={(props) => (
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
              left={(props) => (
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
