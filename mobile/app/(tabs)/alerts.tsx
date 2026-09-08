import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ScreenScroll, SecondaryButton, Splash } from "../../src/components/ui";
import { useMarkNotificationsRead } from "../../src/hooks/mutations";
import { useNotifications } from "../../src/hooks/queries";
import { styles } from "../../src/theme";
import type { NotificationItem } from "../../src/api";

export default function AlertsScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationsRead();

  function openNotification(item: NotificationItem) {
    markRead.mutate(item.id);
    if (item.data?.eventId) router.push(`/events/${item.data.eventId}`);
    else if (item.data?.groupId) router.push(`/groups/${item.data.groupId}`);
  }

  return (
    <ScreenScroll onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.muted}>Approvals, reminders, event updates, and invites.</Text>
        </View>
        <SecondaryButton label="Read all" onPress={() => markRead.mutate(undefined)} />
      </View>

      {isLoading ? (
        <Splash label="Loading alerts..." />
      ) : isError ? (
        <Text style={styles.errorText}>{error instanceof Error ? error.message : "Could not load alerts."}</Text>
      ) : data && data.notifications.length ? (
        data.notifications.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.card, !item.readAt && styles.unreadCard]}
            onPress={() => openNotification(item)}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!item.readAt ? <Text style={styles.status}>new</Text> : null}
            </View>
            <Text style={styles.description}>{item.body}</Text>
            <Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.empty}>No alerts yet.</Text>
      )}
    </ScreenScroll>
  );
}
