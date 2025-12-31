import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  ProgressBar,
  ActivityIndicator,
  Chip,
  Icon,
  useTheme,
} from 'react-native-paper';
import { useCourses } from '@shared/contexts/CoursesContext';
import { useProgress } from '@shared/contexts/ProgressContext';
import { Video } from '@shared/types';
import { withCount } from '@shared/utils';
import { SectionAccordion } from '../components/SectionAccordion';
import { colors } from '@shared/theme';

export function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { getCourse, state } = useCourses();
  const { getCourseProgress } = useProgress();

  const course = getCourse(id);
  const progress = course ? getCourseProgress(course) : null;
  const isComplete = progress && progress.percent >= 100;

  const handleVideoPress = useCallback(
    (video: Video) => {
      router.push({
        pathname: '/player/[videoId]',
        params: {
          videoId: video.id,
          videoPath: video.filePath,
          videoName: video.name,
          courseId: id,
          sectionId: video.sectionId,
        },
      });
    },
    [router, id]
  );

  if (state.isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <View style={styles.errorContainer}>
          <Icon source="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text variant="bodyLarge" style={{ color: theme.colors.error, marginTop: 16 }}>
            Course not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: course.name,
          headerBackTitle: 'Courses',
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Course Header */}
          <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.headerTop}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon
                  source="book-open-variant"
                  size={40}
                  color={theme.colors.primary}
                />
              </View>
              {isComplete && (
                <Chip
                  mode="flat"
                  compact
                  style={[styles.completeBadge, { backgroundColor: colors.complete }]}
                  textStyle={[styles.completeText, { color: theme.colors.onPrimary }]}
                >
                  Complete
                </Chip>
              )}
            </View>

            <Text
              variant="headlineSmall"
              style={[styles.courseName, { color: theme.colors.onSurface }]}
            >
              {course.name}
            </Text>

            <View style={styles.statsRow}>
              <Chip
                compact
                mode="outlined"
                icon="folder-outline"
                style={styles.statChip}
                textStyle={{ fontSize: 12 }}
              >
                {withCount(course.sections.length, 'section')}
              </Chip>
              <Chip
                compact
                mode="outlined"
                icon="play-circle-outline"
                style={styles.statChip}
                textStyle={{ fontSize: 12 }}
              >
                {withCount(course.totalVideos, 'video')}
              </Chip>
            </View>

            {/* Overall Progress */}
            {progress && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Overall Progress
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.onSurface, fontWeight: '600' }}
                  >
                    {Math.round(progress.percent)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={progress.percent / 100}
                  color={colors.progressFill}
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={[styles.progressDetail, { color: theme.colors.onSurfaceVariant }]}>
                  {progress.completed} of {progress.total} videos completed
                </Text>
              </View>
            )}
          </Surface>

          {/* Sections */}
          <View style={styles.sectionsContainer}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Sections
            </Text>
            {course.sections.map((section, index) => (
              <SectionAccordion
                key={section.id}
                section={section}
                onVideoPress={handleVideoPress}
                defaultExpanded={index === 0}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBadge: {},
  completeText: {
    fontSize: 12,
  },
  courseName: {
    fontWeight: '700',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statChip: {
    alignItems: 'center',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressDetail: {
    marginTop: 8,
  },
  sectionsContainer: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },
});
