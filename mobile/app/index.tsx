import { Redirect } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { Splash } from "../src/components/ui";

export default function Index() {
  const { user, initializing } = useAuth();
  if (initializing) return <Splash />;
  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}
