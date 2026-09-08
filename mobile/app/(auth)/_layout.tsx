import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { Splash } from "../../src/components/ui";

export default function AuthLayout() {
  const { user, initializing } = useAuth();
  if (initializing) return <Splash />;
  if (user) return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
