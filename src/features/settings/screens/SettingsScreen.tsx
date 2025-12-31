import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, List, Button, Divider, Icon, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCourses } from '@shared/contexts/CoursesContext';
import { useProgress } from '@shared/contexts/ProgressContext';
import { useTags } from '@shared/contexts/TagsContext';
import { useStatistics } from '@features/statistics';
import { handleSingleCourseResult, handleMultipleCoursesResult, withCount } from '@shared/utils';
import { TagList } from '@features/tags';
import { spacing, borderRadius, shadows, colors } from '@shared/theme';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
        {title}
      </Text>
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]} elevation={0}>
        {children}
      </Surface>
    </View>
  );
}

export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { state, addSingleCourse, addMultipleCourses, scanCourses, clearAllCourses } = useCourses();
  const { clearAllProgress, state: progressState } = useProgress();
  const { state: tagsState, clearAllTags } = useTags();
  const { state: statisticsState } = useStatistics();
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tagListVisible, setTagListVisible] = useState(false);

  const { courses } = state;
  const progressCount = Object.keys(progressState.data.videos).length;
  const tagCount = tagsState.tags.length;
  const totalWatchMinutes = Math.round(statisticsState.data.totalWatchTimeSeconds / 60);

  const handleAddSingleCourse = async () => {
    const result = await addSingleCourse();
    handleSingleCourseResult(result);
  };

  const handleAddMultipleCourses = async () => {
    const result = await addMultipleCourses();
    handleMultipleCoursesResult(result);
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

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all courses, progress, tags, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            await clearAllProgress();
            await clearAllTags();
            await clearAllCourses();
            setIsDeleting(false);
            Alert.alert('Done', 'All data has been deleted.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Courses Section */}
        <SettingsSection title="Courses">
          <List.Item
            title="Your Library"
            description={`${withCount(courses.length, 'course')} in your library`}
            left={() => (
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon source="book-multiple" size={22} color={colors.iconDefault} />
              </View>
            )}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600', fontSize: 16 }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
          />
          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={handleAddSingleCourse} style={styles.actionButton}>
              Add Course
            </Button>
            <Button mode="outlined" onPress={handleAddMultipleCourses} style={styles.actionButton}>
              Add Multiple
            </Button>
            <Button mode="outlined" onPress={handleRescan} style={styles.actionButton}>
              Rescan
            </Button>
          </View>
        </SettingsSection>

        {/* Tags Section */}
        <SettingsSection title="Tags">
          <List.Item
            title="Manage Tags"
            description={`${withCount(tagCount, 'tag')} created`}
            left={() => (
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon source="tag-multiple" size={22} color={colors.iconDefault} />
              </View>
            )}
            right={() => <Icon source="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
            onPress={() => setTagListVisible(true)}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600', fontSize: 16 }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
          />
        </SettingsSection>

        {/* Statistics Section */}
        <SettingsSection title="Statistics">
          <List.Item
            title="Learning Statistics"
            description={`${totalWatchMinutes} min watched • ${statisticsState.data.currentStreak} day streak`}
            left={() => (
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon source="chart-bar" size={22} color={colors.iconDefault} />
              </View>
            )}
            right={() => <Icon source="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
            onPress={() => router.push('/statistics')}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600', fontSize: 16 }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
          />
        </SettingsSection>

        {/* Data Management Section */}
        <SettingsSection title="Data Management">
          <List.Item
            title="Watch Progress"
            description={`${withCount(progressCount, 'video')} tracked`}
            left={() => (
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon source="chart-line" size={22} color={colors.iconDefault} />
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
          <Divider style={{ marginHorizontal: spacing.md }} />
          <List.Item
            title="All App Data"
            description="Courses, tags, progress, and settings"
            left={() => (
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon source="database-remove" size={22} color={theme.colors.error} />
              </View>
            )}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: '500' }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <View style={styles.buttonRowEnd}>
            <Button
              mode="contained"
              onPress={handleDeleteAllData}
              disabled={isDeleting}
              loading={isDeleting}
              buttonColor={theme.colors.error}
            >
              Delete All Data
            </Button>
          </View>
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <List.Item
            title="CourseViewer"
            description="Offline video course player with progress tracking"
            left={() => (
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon source="play-circle" size={22} color={colors.iconDefault} />
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
        </SettingsSection>

        {/* Supported Formats Section */}
        <SettingsSection title="Supported Formats">
          <List.Item
            title="Video Files"
            description="MP4, MOV, M4V"
            left={() => (
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon source="file-video" size={22} color={colors.iconDefault} />
              </View>
            )}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: '500' }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <Divider style={{ marginHorizontal: spacing.md }} />
          <View style={styles.formatHint}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              For other formats (MKV, AVI), convert to MP4 using HandBrake or FFmpeg.
            </Text>
          </View>
        </SettingsSection>
      </ScrollView>

      <TagList
        visible={tagListVisible}
        onDismiss={() => setTagListVisible(false)}
      />
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
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    marginBottom: spacing.sm + 4,
    marginLeft: spacing.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm + 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: spacing.sm,
  },
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  buttonRowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  actionButton: {
    minWidth: 90,
  },
  formatHint: {
    padding: spacing.md,
  },
});
