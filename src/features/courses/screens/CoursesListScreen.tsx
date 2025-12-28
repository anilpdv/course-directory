import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  ActivityIndicator,
  Surface,
  Icon,
  useTheme,
  FAB,
} from 'react-native-paper';
import { useCourses } from '@shared/contexts/CoursesContext';
import { Course } from '@shared/types';
import { CourseCard } from '../components/CourseCard';
import { EmptyCoursesView } from '../components/EmptyCoursesView';

export function CoursesListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { state, scanCourses, addCourses, removeCourse } = useCourses();
  const { courses, isLoading, error, hasCourses } = state;

  useEffect(() => {
    if (hasCourses) {
      scanCourses();
    }
  }, [hasCourses, scanCourses]);

  const handleCoursePress = useCallback(
    (course: Course) => {
      router.push(`/course/${course.id}`);
    },
    [router]
  );

  const handleAddCourse = useCallback(async () => {
    const result = await addCourses();
    if (result.added > 0) {
      Alert.alert(
        'Courses Added',
        `Added ${result.added} course${result.added !== 1 ? 's' : ''}.${
          result.duplicates > 0 ? ` ${result.duplicates} duplicate${result.duplicates !== 1 ? 's' : ''} skipped.` : ''
        }`
      );
    } else if (result.duplicates > 0) {
      Alert.alert('Already Added', 'These courses are already in your library.');
    }
  }, [addCourses]);

  const renderCourse = useCallback(
    ({ item }: { item: Course }) => (
      <CourseCard
        course={item}
        onPress={() => handleCoursePress(item)}
        onRemove={removeCourse}
      />
    ),
    [handleCoursePress, removeCourse]
  );

  // Welcome screen - no courses added
  if (!hasCourses) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <View style={styles.welcomeContainer}>
          <Icon source="book-open-page-variant" size={80} color={theme.colors.primary} />
          <Text
            variant="headlineMedium"
            style={[styles.welcomeTitle, { color: theme.colors.onBackground }]}
          >
            Welcome to CourseViewer
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.welcomeText, { color: theme.colors.onSurfaceVariant }]}
          >
            Add your video courses to get started.
          </Text>

          <Button
            mode="contained"
            onPress={handleAddCourse}
            loading={isLoading}
            disabled={isLoading}
            icon="folder-plus"
            style={styles.selectFolderButton}
            contentStyle={styles.selectFolderContent}
            labelStyle={styles.selectFolderLabel}
          >
            Add Course
          </Button>

          <Text
            variant="bodySmall"
            style={[styles.hintText, { color: theme.colors.onSurfaceVariant }]}
          >
            Select a course folder or a folder{'\n'}
            containing multiple courses.
          </Text>

          <Surface style={[styles.structureExample, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Text
              variant="labelMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
            >
              Expected structure:
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.structureCode, { color: theme.colors.onSurface }]}
            >
              Course Folder/{'\n'}
              ├── 01 - Section/{'\n'}
              │   └── video.mp4{'\n'}
              └── 02 - Section/{'\n'}
                  └── video.mp4
            </Text>
          </Surface>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <View style={styles.errorContainer}>
          <Icon source="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text
            variant="bodyLarge"
            style={[styles.errorText, { color: theme.colors.error }]}
          >
            {error}
          </Text>
          <Button mode="contained" onPress={scanCourses} icon="refresh">
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {courses.length} course{courses.length !== 1 ? 's' : ''} in your library
      </Text>
    </View>
  );

  // Main list view
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      {isLoading && courses.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            variant="bodyLarge"
            style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
          >
            Scanning for courses...
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={courses}
            keyExtractor={(item) => item.id}
            renderItem={renderCourse}
            ListHeaderComponent={courses.length > 0 ? renderHeader : null}
            ListEmptyComponent={
              <EmptyCoursesView onRescan={scanCourses} onAddCourse={handleAddCourse} />
            }
            contentContainerStyle={[
              styles.listContent,
              courses.length === 0 && styles.listContentEmpty,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={scanCourses}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
          />
          {courses.length > 0 && (
            <FAB
              icon="plus"
              label="Add Course"
              style={[styles.fab, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddCourse}
              color={theme.colors.onPrimary}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeTitle: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 32,
  },
  selectFolderButton: {
    marginBottom: 24,
    borderRadius: 12,
  },
  selectFolderContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectFolderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  hintText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  structureExample: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  structureCode: {
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 80,
  },
  listContentEmpty: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    elevation: 4,
  },
});
