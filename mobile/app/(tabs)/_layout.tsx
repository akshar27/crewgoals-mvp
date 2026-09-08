import { Redirect, Tabs } from "expo-router";
import { Splash } from "../../src/components/ui";
import { useAuth } from "../../src/hooks/useAuth";
import { usePushRegistration } from "../../src/hooks/usePushNotifications";
import { colors } from "../../src/theme";

export default function TabsLayout() {
  const { user, initializing } = useAuth();
  usePushRegistration(Boolean(user));

  if (initializing) return <Splash />;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.moss,
        tabBarStyle: { borderTopColor: colors.sand, backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.ink, fontWeight: "900" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="groups" options={{ title: "Groups" }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
