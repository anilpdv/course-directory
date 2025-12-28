import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { AppProviders } from '../src/providers/AppProviders';
import { colors } from '../src/shared/theme/colors';

function SettingsButton() {
  const router = useRouter();
  return (
    <IconButton
      icon="cog-outline"
      iconColor={colors.primary}
      size={24}
      onPress={() => router.push('/settings')}
      style={{ margin: 0 }}
    />
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.onBackground,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: colors.background,
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
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
