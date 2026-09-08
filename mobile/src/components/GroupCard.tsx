import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import type { Group } from "../api";
import { useJoinGroup } from "../hooks/mutations";
import { styles } from "../theme";

export function GroupCard({ group }: { group: Group }) {
  const join = useJoinGroup(group.id);
  const chips = useMemo(
    () => [group.goal.name, group.activity.name, group.level, group.vibe, group.schedule],
    [group]
  );

  function requestToJoin() {
    join.mutate(undefined, {
      onSuccess: () => Alert.alert("Request sent", "An admin can approve your group request."),
      onError: (error) => Alert.alert("Unable to join", error instanceof Error ? error.message : "Try again."),
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{group.title}</Text>
        <Text style={styles.status}>{group.status.toLowerCase()}</Text>
      </View>
      <Text style={styles.muted}>
        {group.neighborhood}, {group.city}
      </Text>
      <Text style={styles.description}>{group.description}</Text>
      <View style={styles.chips}>
        {chips.map((chip) => (
          <Text key={chip} style={styles.chip}>
            {chip}
          </Text>
        ))}
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.muted}>
          {group._count?.members ?? 0}/{group.maxMembers} members
          {typeof group.score === "number" ? ` · score ${group.score}` : ""}
        </Text>
        <Pressable style={styles.secondaryButton} onPress={() => router.push(`/groups/${group.id}`)}>
          <Text style={styles.secondaryText}>Details</Text>
        </Pressable>
        <Pressable
          style={[styles.smallButton, (join.isPending || group.status !== "OPEN") && { opacity: 0.5 }]}
          onPress={requestToJoin}
          disabled={join.isPending || group.status !== "OPEN"}
        >
          <Text style={styles.smallButtonText}>{join.isPending ? "..." : "Join"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
