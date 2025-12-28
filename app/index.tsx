import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  ActivityIndicator,
  Surface,
  Icon,
  useTheme,
} from 'react-native-paper';
import { useCourses } from '../contexts/CoursesContext';
import { CourseCard } from '../components/CourseCard';
import { Course } from '../types';

export default function CoursesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { state, scanCourses, pickCoursesFolder } = useCourses();
  const { courses, isLoading, error, hasSelectedFolder } = state;

  useEffect(() => {
    if (hasSelectedFolder) {
      scanCourses();
    }
  }, [hasSelectedFolder, scanCourses]);

  const handleCoursePress = useCallback(
    (course: Course) => {
      router.push(`/course/${course.id}`);
    },
    [router]
  );

  const handleSelectFolder = useCallback(async () => {
    await pickCoursesFolder();
  }, [pickCoursesFolder]);

  const renderCourse = useCallback(
    ({ item }: { item: Course }) => (
      <CourseCard course={item} onPress={() => handleCoursePress(item)} />
    ),
    [handleCoursePress]
  );

  // Show folder selection screen if no folder selected
  if (!hasSelectedFolder) {
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
            Select a folder containing your video courses to get started.
          </Text>

          <Button
            mode="contained"
            onPress={handleSelectFolder}
            loading={isLoading}
            disabled={isLoading}
            icon="folder-open"
            style={styles.selectFolderButton}
            contentStyle={styles.selectFolderContent}
            labelStyle={styles.selectFolderLabel}
          >
            Select Courses Folder
          </Button>

          <Text
            variant="bodySmall"
            style={[styles.hintText, { color: theme.colors.onSurfaceVariant }]}
          >
            Your folder should contain course subfolders,{'\n'}
            each with section folders containing videos.
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
              Selected Folder/{'\n'}
              ├── Course Name/{'\n'}
              │   ├── 01 - Section/{'\n'}
              │   │   └── video.mp4{'\n'}
              │   └── 02 - Section/{'\n'}
              │       └── video.mp4
            </Text>
          </Surface>
        </View>
      </SafeAreaView>
    );
  }

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Icon source="folder-open-outline" size={64} color={theme.colors.onSurfaceVariant} />
        <Text
          variant="titleLarge"
          style={[styles.emptyTitle, { color: theme.colors.onBackground }]}
        >
          No Courses Found
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
        >
          No video courses were found in the selected folder.
        </Text>
        <Button
          mode="contained"
          onPress={scanCourses}
          icon="refresh"
          style={styles.actionButton}
        >
          Rescan Folder
        </Button>
        <Button
          mode="outlined"
          onPress={handleSelectFolder}
          icon="folder-swap"
          style={styles.actionButton}
        >
          Change Folder
        </Button>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {courses.length} course{courses.length !== 1 ? 's' : ''} found
      </Text>
      <Button
        mode="text"
        compact
        onPress={handleSelectFolder}
        labelStyle={{ fontSize: 14 }}
      >
        Change Folder
      </Button>
    </View>
  );

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
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourse}
          ListHeaderComponent={courses.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmpty}
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
    paddingVertical: 8,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
    minWidth: 180,
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
});
