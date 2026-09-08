import { Stack, router, useLocalSearchParams } from "expo-router";
import { Alert, Text, View } from "react-native";
import { PrimaryButton, ScreenScroll, SecondaryButton, Splash } from "../../src/components/ui";
import { useAuth } from "../../src/hooks/useAuth";
import { useJoinGroup } from "../../src/hooks/mutations";
import { useInvite } from "../../src/hooks/queries";
import { styles } from "../../src/theme";

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { user, initializing } = useAuth();
  const invite = useInvite(user ? (token ?? "") : "");
  const groupId = invite.data?.group.id ?? "";
  const join = useJoinGroup(groupId);

  if (initializing) return <Splash />;

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ title: "Group invite" }} />
        <ScreenScroll>
          <Text style={styles.title}>You&apos;re invited to a CrewGoals crew</Text>
          <Text style={styles.description}>Sign in or create an account to see the group and request to join.</Text>
          <PrimaryButton label="Sign in" onPress={() => router.push("/(auth)/login")} />
        </ScreenScroll>
      </>
    );
  }

  if (invite.isLoading) return <Splash />;

  if (invite.isError || !invite.data) {
    return (
      <>
        <Stack.Screen options={{ title: "Group invite" }} />
        <ScreenScroll>
          <Text style={styles.errorText}>
            {invite.error instanceof Error ? invite.error.message : "This invite link is no longer valid."}
          </Text>
          <SecondaryButton label="Go to dashboard" onPress={() => router.replace("/(tabs)")} />
        </ScreenScroll>
      </>
    );
  }

  const { invitedBy, group, membership } = invite.data;

  function requestToJoin() {
    join.mutate(undefined, {
      onSuccess: () => {
        Alert.alert("Request sent", "An admin can approve your group request.", [
          { text: "OK", onPress: () => router.replace(`/groups/${group.id}`) },
        ]);
      },
      onError: (e) => Alert.alert("Unable to join", e instanceof Error ? e.message : "Try again."),
    });
  }

  return (
    <>
      <Stack.Screen options={{ title: "Group invite" }} />
      <ScreenScroll>
        <Text style={styles.muted}>{invitedBy} invited you</Text>
        <Text style={styles.title}>{group.title}</Text>
        <Text style={styles.description}>{group.description}</Text>
        <View style={styles.chips}>
          <Text style={styles.chip}>{group.neighborhood}, {group.city}</Text>
          <Text style={styles.chip}>{group.goal.name}</Text>
          <Text style={styles.chip}>{group.activity.name}</Text>
        </View>

        <View style={styles.card}>
          {membership ? (
            <Text style={styles.description}>
              You&apos;re already {membership.status.toLowerCase()} for this group.
            </Text>
          ) : (
            <PrimaryButton
              label={join.isPending ? "Sending request..." : group.status === "OPEN" ? "Request to join" : "Group closed"}
              onPress={requestToJoin}
              disabled={join.isPending || group.status !== "OPEN"}
            />
          )}
          <SecondaryButton label="View full group" onPress={() => router.replace(`/groups/${group.id}`)} />
        </View>
      </ScreenScroll>
    </>
  );
}
