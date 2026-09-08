import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Share, Text, View } from "react-native";
import { EventCard } from "../../src/components/EventCard";
import { DetailItem, Input, PrimaryButton, ScreenScroll, SecondaryButton, Section, Splash } from "../../src/components/ui";
import { useCreateInviteLink, useInviteFriend, useJoinGroup } from "../../src/hooks/mutations";
import { useGroup } from "../../src/hooks/queries";
import { isActiveMember } from "../../src/rules";
import { shareGroup } from "../../src/share";
import { styles } from "../../src/theme";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = id ?? "";
  const { data, isLoading, isError, error, refetch, isRefetching } = useGroup(groupId);
  const join = useJoinGroup(groupId);
  const inviteFriend = useInviteFriend(groupId);
  const createLink = useCreateInviteLink(groupId);
  const [inviteEmail, setInviteEmail] = useState("");

  if (isLoading) return <Splash />;
  if (isError || !data) {
    return (
      <ScreenScroll onRefresh={refetch} refreshing={isRefetching}>
        <Text style={styles.errorText}>{error instanceof Error ? error.message : "Could not load this group."}</Text>
      </ScreenScroll>
    );
  }

  const { group, membership } = data;
  const memberCount = group._count?.members ?? 0;
  const events = group.events ?? [];
  const canInvite = isActiveMember(membership?.status);

  function requestToJoin() {
    join.mutate(undefined, {
      onSuccess: () => Alert.alert("Request sent", "An admin can approve your group request."),
      onError: (e) => Alert.alert("Unable to join", e instanceof Error ? e.message : "Try again."),
    });
  }

  function sendInvite() {
    inviteFriend.mutate(inviteEmail.trim(), {
      onSuccess: () => {
        setInviteEmail("");
        Alert.alert("Invite sent", "Your friend will see it in CrewGoals alerts.");
      },
      onError: (e) => Alert.alert("Unable to invite", e instanceof Error ? e.message : "Try again."),
    });
  }

  function shareLink() {
    createLink.mutate(undefined, {
      onSuccess: (result) => Share.share({ message: `Join me on CrewGoals: ${result.url}` }),
      onError: (e) => Alert.alert("Unable to create link", e instanceof Error ? e.message : "Try again."),
    });
  }

  return (
    <>
      <Stack.Screen options={{ title: group.title }} />
      <ScreenScroll onRefresh={refetch} refreshing={isRefetching}>
        <Text style={styles.title}>{group.title}</Text>
        <Text style={styles.muted}>
          {group.neighborhood}, {group.city}
        </Text>
        <View style={styles.chips}>
          <Text style={styles.chip}>{group.status.toLowerCase()}</Text>
          <Text style={styles.chip}>
            {memberCount}/{group.maxMembers} members
          </Text>
          {membership ? <Text style={styles.chip}>Your status: {membership.status.toLowerCase()}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About this group</Text>
          <Text style={styles.description}>{group.description}</Text>
          <View style={styles.detailGrid}>
            <DetailItem label="Goal" value={group.goal.name} />
            <DetailItem label="Activity" value={group.activity.name} />
            <DetailItem label="Level" value={group.level} />
            <DetailItem label="Vibe" value={group.vibe} />
            <DetailItem label="Schedule" value={group.schedule} />
            <DetailItem label="Age range" value={group.ageRange} />
          </View>
          {membership ? (
            <View style={styles.statusBox}>
              <Text style={styles.statusTitle}>Membership</Text>
              <Text style={styles.description}>
                {membership.status === "REQUESTED"
                  ? "Your request is waiting for admin approval."
                  : `You are marked as ${membership.status.toLowerCase()} for this group.`}
              </Text>
            </View>
          ) : (
            <PrimaryButton
              label={join.isPending ? "Sending request..." : group.status === "OPEN" ? "Request to join" : "Group closed"}
              onPress={requestToJoin}
              disabled={join.isPending || group.status !== "OPEN"}
            />
          )}
          <SecondaryButton label="Share group" onPress={() => shareGroup(group)} />
        </View>

        {canInvite ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Invite a friend</Text>
            <Text style={styles.description}>Send an in-app invite to someone who already has a CrewGoals account.</Text>
            <Input label="Friend email" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" />
            <PrimaryButton
              label={inviteFriend.isPending ? "Sending invite..." : "Send invite"}
              onPress={sendInvite}
              disabled={inviteFriend.isPending || !inviteEmail.trim()}
            />
            <SecondaryButton
              label={createLink.isPending ? "Creating link..." : "Share invite link"}
              onPress={shareLink}
              disabled={createLink.isPending}
            />
          </View>
        ) : null}

        <Section title="Upcoming events">
          {events.length ? (
            events.map((event) => (
              <EventCard key={event.id} event={{ ...event, group: { id: group.id, title: group.title } }} />
            ))
          ) : (
            <Text style={styles.empty}>No events scheduled yet.</Text>
          )}
        </Section>
      </ScreenScroll>
    </>
  );
}
