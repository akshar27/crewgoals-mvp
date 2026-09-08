import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import { api } from "../api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "CrewGoals",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const finalStatus =
    current.status === "granted" ? current.status : (await Notifications.requestPermissionsAsync()).status;
  if (finalStatus !== "granted") return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
  await api("/api/mobile/notifications/register", {
    method: "POST",
    body: JSON.stringify({ token, platform: Platform.OS }),
  });
}

/** Registers the device for push once the user is signed in. Failures are non-fatal. */
export function usePushRegistration(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    registerForPushNotifications().catch((error) => {
      console.log("Push registration skipped", error);
    });
  }, [enabled]);
}
