import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3DarkTheme, IconButton } from 'react-native-paper';
import { CoursesProvider } from '../contexts/CoursesContext';
import { ProgressProvider } from '../contexts/ProgressContext';

// Custom dark theme based on Material Design 3
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    primaryContainer: '#3700B3',
    secondary: '#03DAC6',
    secondaryContainer: '#018786',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    error: '#CF6679',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#B3B3B3',
    onError: '#000000',
    outline: '#444444',
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#232323',
      level3: '#282828',
      level4: '#2D2D2D',
      level5: '#323232',
    },
  },
  roundness: 12,
};

function SettingsButton() {
  const router = useRouter();
  return (
    <IconButton
      icon="cog-outline"
      iconColor={darkTheme.colors.primary}
      size={24}
      onPress={() => router.push('/settings')}
      style={{ margin: 0 }}
    />
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={darkTheme}>
      <SafeAreaProvider>
        <CoursesProvider>
          <ProgressProvider>
            <View style={styles.container}>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: darkTheme.colors.background,
                  },
                  headerTintColor: darkTheme.colors.onBackground,
                  headerTitleStyle: {
                    fontWeight: '600',
                  },
                  contentStyle: {
                    backgroundColor: darkTheme.colors.background,
                  },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    title: 'My Courses',
                    headerRight: () => <SettingsButton />,
                  }}
                />
                <Stack.Screen
                  name="course/[id]"
                  options={{
                    title: 'Course',
                  }}
                />
                <Stack.Screen
                  name="player/[videoId]"
                  options={{
                    title: '',
                    headerShown: false,
                    presentation: 'fullScreenModal',
                  }}
                />
                <Stack.Screen
                  name="settings"
                  options={{
                    title: 'Settings',
                    presentation: 'modal',
                  }}
                />
              </Stack>
            </View>
          </ProgressProvider>
        </CoursesProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
