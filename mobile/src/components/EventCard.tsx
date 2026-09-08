import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import type { EventItem } from "../api";
import { styles } from "../theme";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/events/${event.id}`)}>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.muted}>{event.group?.title}</Text>
      <Text style={styles.description}>
        {event.locationName} · {new Date(event.startTime).toLocaleString()}
      </Text>
      <Text style={styles.linkText}>View event</Text>
    </Pressable>
  );
}
