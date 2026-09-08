import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { EventCard } from "../../src/components/EventCard";
import { GroupCard } from "../../src/components/GroupCard";
import { ScreenScroll, Section, Splash } from "../../src/components/ui";
import { useDashboard } from "../../src/hooks/queries";
import { styles } from "../../src/theme";

export default function DashboardScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useDashboard();

  if (isLoading) return <Splash />;
  if (isError || !data) {
    return (
      <ScreenScroll onRefresh={refetch} refreshing={isRefetching}>
        <Text style={styles.errorText}>{error instanceof Error ? error.message : "Could not load your dashboard."}</Text>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll onRefresh={refetch} refreshing={isRefetching}>
      <Text style={styles.title}>Hi, {data.user.name.split(" ")[0]}</Text>
      <Text style={styles.muted}>
        {data.preference
          ? `${data.preference.neighborhood}, ${data.preference.city} · ${data.preference.currentLevel}`
          : "Complete your profile to improve matches."}
      </Text>

      {data.unreadNotifications > 0 ? (
        <Pressable style={styles.notice} onPress={() => router.push("/(tabs)/alerts")}>
          <Text style={styles.noticeTitle}>
            {data.unreadNotifications} unread alert{data.unreadNotifications === 1 ? "" : "s"}
          </Text>
          <Text style={styles.muted}>Open the alerts tab to see approvals, reminders, invites, and event updates.</Text>
        </Pressable>
      ) : null}

      <Section title="Recommended groups">
        {data.recommendedGroups.length ? (
          data.recommendedGroups.map((group) => <GroupCard key={group.id} group={group} />)
        ) : (
          <Text style={styles.empty}>No recommendations yet — finish your profile.</Text>
        )}
      </Section>

      <Section title="Upcoming events">
        {data.events.length ? (
          data.events.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <Text style={styles.empty}>Join a group to see upcoming events.</Text>
        )}
      </Section>

      <Section title="Your memberships">
        {data.memberships.length ? (
          data.memberships.map((membership) => (
            <View key={membership.id} style={styles.card}>
              <Text style={styles.cardTitle}>{membership.group.title}</Text>
              <Text style={styles.muted}>
                {membership.status.toLowerCase()} · {membership.group.schedule}
              </Text>
              <Pressable style={styles.secondaryButton} onPress={() => router.push(`/groups/${membership.group.id}`)}>
                <Text style={styles.secondaryText}>View details</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No memberships yet.</Text>
        )}
      </Section>
    </ScreenScroll>
  );
}
