import React, { useEffect, useCallback, useState, useMemo } from 'react';
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
  IconButton,
  Badge,
} from 'react-native-paper';
import { useCourses } from '@shared/contexts/CoursesContext';
import { Course } from '@shared/types';
import { CourseCard } from '../components/CourseCard';
import { EmptyCoursesView } from '../components/EmptyCoursesView';
import { TagFilterDrawer, useTagFilter } from '@features/tags';

export function CoursesListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { state, scanCourses, addCourses, removeCourse } = useCourses();
  const { courses, isLoading, error, hasCourses } = state;
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  const {
    selectedTagIds,
    filterMode,
    toggleTag,
    setFilterMode,
    clearFilters,
    filterCourses,
    hasActiveFilters,
    matchingCount,
  } = useTagFilter();

  const filteredCourses = useMemo(() => {
    return filterCourses(courses);
  }, [courses, filterCourses]);

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
  }, [addCourses]);

  const handleRemoveCourse = useCallback(async (courseId: string) => {
    const result = await removeCourse(courseId);
    if (!result.success && result.error) {
      Alert.alert('Error', result.error);
    }
  }, [removeCourse]);

  const renderCourse = useCallback(
    ({ item }: { item: Course }) => (
      <CourseCard
        course={item}
        onPress={() => handleCoursePress(item)}
        onRemove={handleRemoveCourse}
      />
    ),
    [handleCoursePress, handleRemoveCourse]
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
        {hasActiveFilters
          ? `${filteredCourses.length} of ${courses.length} courses`
          : `${courses.length} course${courses.length !== 1 ? 's' : ''} in your library`}
      </Text>
      <View style={styles.filterButtonContainer}>
        <IconButton
          icon="filter-variant"
          size={24}
          onPress={() => setFilterDrawerVisible(true)}
          iconColor={hasActiveFilters ? theme.colors.primary : theme.colors.onSurfaceVariant}
        />
        {hasActiveFilters && (
          <Badge
            size={16}
            style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}
          >
            {selectedTagIds.length}
          </Badge>
        )}
      </View>
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
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            renderItem={renderCourse}
            ListHeaderComponent={courses.length > 0 ? renderHeader : null}
            ListEmptyComponent={
              hasActiveFilters ? (
                <View style={styles.noResultsContainer}>
                  <Icon source="filter-off" size={48} color={theme.colors.onSurfaceVariant} />
                  <Text
                    variant="bodyLarge"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}
                  >
                    No courses match your filters
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={clearFilters}
                    style={{ marginTop: 16 }}
                  >
                    Clear Filters
                  </Button>
                </View>
              ) : (
                <EmptyCoursesView onRescan={scanCourses} onAddCourse={handleAddCourse} />
              )
            }
            contentContainerStyle={[
              styles.listContent,
              filteredCourses.length === 0 && styles.listContentEmpty,
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

          <TagFilterDrawer
            visible={filterDrawerVisible}
            onDismiss={() => setFilterDrawerVisible(false)}
            selectedTagIds={selectedTagIds}
            onToggleTag={toggleTag}
            onClearFilters={clearFilters}
          />
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
    paddingVertical: 4,
  },
  filterButtonContainer: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
