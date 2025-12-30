import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppProviders } from "../src/providers/AppProviders";
import { colors } from "../src/shared/theme/colors";

function SettingsButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      hitSlop={8}
      style={{ marginLeft: 4 }}
    >
      <MaterialCommunityIcons
        name="cog-outline"
        size={28}
        color={colors.primary}
      />
    </Pressable>
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
              fontWeight: "600",
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "My Courses",
              headerBlurEffect: "none",
              headerRight: () => <SettingsButton />,
            }}
          />
          <Stack.Screen
            name="course/[id]"
            options={{
              title: "Course",
            }}
          />
          <Stack.Screen
            name="player/[videoId]"
            options={{
              title: "",
              headerShown: false,
              presentation: "fullScreenModal",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
            }}
          />
          <Stack.Screen
            name="statistics"
            options={{
              title: "Learning Statistics",
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
