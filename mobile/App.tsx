import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {
  api,
  clearToken,
  EventItem,
  getToken,
  Group,
  login,
  Preference,
  signup,
  User
} from "./src/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

type Screen = "dashboard" | "groups" | "alerts" | "profile";
type DashboardData = {
  user: User;
  preference: Preference | null;
  recommendedGroups: Group[];
  memberships: { id: string; status: string; group: Group }[];
  events: EventItem[];
  unreadNotifications: number;
};
type GroupDetailData = {
  group: Group & { events: EventItem[] };
  membership: { id: string; status: string } | null;
};
type EventDetailData = {
  event: EventItem & { group: { id: string; title: string } };
  membership: { id: string; status: string } | null;
  canSubmitFeedback: boolean;
};
type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: { groupId?: string; eventId?: string } | null;
  readAt: string | null;
  createdAt: string;
};

const goals = ["become runner", "gym consistency", "weekend hiking", "make friends", "explore city"];
const activities = ["running", "gym", "hiking", "outdoor sports", "dining", "exploring"];
const availability = ["weekday morning", "weekday evening", "Saturday morning", "Sunday morning"];
const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55+"];
const levels = ["beginner", "casual", "intermediate", "advanced"];
const targetGoals = ["complete 5K", "build habit", "meet people", "lose weight", "stay active"];
const vibes = ["social/casual", "serious/accountability", "beginner-friendly", "mixed"];
const comfortPreferences = ["mixed group", "same-gender group", "beginner-only"];
const groupSizes = [4, 6, 8, 10, 12, 16];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const body = await api<{ user: User }>("/api/mobile/me");
      setUser(body.user);
    } catch {
      await clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!user) return;
    void registerForPushNotifications().catch((error) => {
      console.log("Push registration skipped", error);
    });
  }, [user]);

  if (loading) return <Splash />;
  if (!user) return <AuthScreen onAuthed={setUser} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>CrewGoals</Text>
          <Text style={styles.muted}>Find your crew. Build your goal.</Text>
        </View>
        <Pressable
          style={styles.ghostButton}
          onPress={async () => {
            await clearToken();
            setUser(null);
          }}
        >
          <Text style={styles.ghostText}>Logout</Text>
        </Pressable>
      </View>
      {selectedEventId ? (
        <EventDetailScreen eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
      ) : selectedGroupId ? (
        <GroupDetailScreen groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} onOpenEvent={setSelectedEventId} />
      ) : (
        <>
          <View style={styles.tabs}>
            {(["dashboard", "groups", "alerts", "profile"] as Screen[]).map((item) => (
              <Pressable key={item} style={[styles.tab, screen === item && styles.tabActive]} onPress={() => setScreen(item)}>
                <Text style={[styles.tabText, screen === item && styles.tabTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          {screen === "dashboard" ? <DashboardScreen onOpenGroup={setSelectedGroupId} onOpenEvent={setSelectedEventId} /> : null}
          {screen === "groups" ? <GroupsScreen onOpenGroup={setSelectedGroupId} /> : null}
          {screen === "alerts" ? <NotificationsScreen onOpenGroup={setSelectedGroupId} onOpenEvent={setSelectedEventId} /> : null}
          {screen === "profile" ? <ProfileScreen user={user} onSaved={setUser} /> : null}
        </>
      )}
    </SafeAreaView>
  );
}

async function registerForPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "CrewGoals",
      importance: Notifications.AndroidImportance.MAX
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const finalStatus = current.status === "granted" ? current.status : (await Notifications.requestPermissionsAsync()).status;
  if (finalStatus !== "granted") return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
  await api("/api/mobile/notifications/register", {
    method: "POST",
    body: JSON.stringify({ token, platform: Platform.OS })
  });
}

function Splash() {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <ActivityIndicator color="#426653" />
      <Text style={styles.muted}>Loading CrewGoals...</Text>
    </SafeAreaView>
  );
}

function AuthScreen({ onAuthed }: { onAuthed: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("maya@example.com");
  const [password, setPassword] = useState("RunnerPass123!");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const nextUser = mode === "login" ? await login(email, password) : await signup(name, email, password);
      onAuthed(nextUser);
    } catch (error) {
      Alert.alert("Unable to continue", error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.authWrap}>
          <Text style={styles.hero}>Find your crew. Build your goal.</Text>
          <Text style={styles.heroSub}>Small local groups matched by goal, level, schedule, location, and vibe.</Text>
          <View style={styles.card}>
            <View style={styles.segment}>
              <Pressable style={[styles.segmentButton, mode === "login" && styles.segmentActive]} onPress={() => setMode("login")}>
                <Text style={styles.segmentText}>Login</Text>
              </Pressable>
              <Pressable style={[styles.segmentButton, mode === "signup" && styles.segmentActive]} onPress={() => setMode("signup")}>
                <Text style={styles.segmentText}>Signup</Text>
              </Pressable>
            </View>
            {mode === "signup" ? <Input label="Name" value={name} onChangeText={setName} /> : null}
            <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Pressable style={styles.primaryButton} onPress={submit} disabled={busy}>
              <Text style={styles.primaryText}>{busy ? "Working..." : mode === "login" ? "Log in" : "Create account"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DashboardScreen({ onOpenGroup, onOpenEvent }: { onOpenGroup: (groupId: string) => void; onOpenEvent: (eventId: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const body = await api<DashboardData>("/api/mobile/dashboard");
    setData(body);
  }, []);

  useEffect(() => {
    void load().catch((error) => Alert.alert("Dashboard error", error.message));
  }, [load]);

  if (!data) return <Splash />;

  return (
    <ScrollView
      style={styles.body}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load().finally(() => setRefreshing(false)); }} />}
    >
      <Text style={styles.title}>Hi, {data.user.name.split(" ")[0]}</Text>
      <Text style={styles.muted}>{data.preference ? `${data.preference.neighborhood}, ${data.preference.city} · ${data.preference.currentLevel}` : "Complete your profile to improve matches."}</Text>
      {data.unreadNotifications > 0 ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{data.unreadNotifications} unread alert{data.unreadNotifications === 1 ? "" : "s"}</Text>
          <Text style={styles.muted}>Open the alerts tab to see approvals, reminders, invites, and event updates.</Text>
        </View>
      ) : null}
      <Section title="Recommended groups">
        {data.recommendedGroups.map((group) => <GroupCard key={group.id} group={group} onJoined={load} onOpen={onOpenGroup} />)}
      </Section>
      <Section title="Upcoming events">
        {data.events.length ? data.events.map((event) => <EventCard key={event.id} event={event} onOpen={onOpenEvent} />) : <Text style={styles.empty}>Join a group to see upcoming events.</Text>}
      </Section>
      <Section title="Your memberships">
        {data.memberships.length ? data.memberships.map((membership) => (
          <View key={membership.id} style={styles.card}>
            <Text style={styles.cardTitle}>{membership.group.title}</Text>
            <Text style={styles.muted}>{membership.status.toLowerCase()} · {membership.group.schedule}</Text>
            <Pressable style={styles.secondaryButton} onPress={() => onOpenGroup(membership.group.id)}>
              <Text style={styles.secondaryText}>View details</Text>
            </Pressable>
          </View>
        )) : <Text style={styles.empty}>No memberships yet.</Text>}
      </Section>
    </ScrollView>
  );
}

function NotificationsScreen({ onOpenGroup, onOpenEvent }: { onOpenGroup: (groupId: string) => void; onOpenEvent: (eventId: string) => void }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const body = await api<{ notifications: NotificationItem[] }>("/api/mobile/notifications");
    setNotifications(body.notifications);
  }, []);

  useEffect(() => {
    void load().catch((error) => Alert.alert("Alerts error", error.message));
  }, [load]);

  async function markAllRead() {
    await api("/api/mobile/notifications", { method: "PATCH", body: JSON.stringify({}) });
    await load();
  }

  async function openNotification(notification: NotificationItem) {
    await api("/api/mobile/notifications", { method: "PATCH", body: JSON.stringify({ id: notification.id }) });
    const groupId = notification.data?.groupId;
    const eventId = notification.data?.eventId;
    if (eventId) onOpenEvent(eventId);
    else if (groupId) onOpenGroup(groupId);
    else await load();
  }

  return (
    <ScrollView
      style={styles.body}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load().finally(() => setRefreshing(false)); }} />}
    >
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.muted}>Approvals, reminders, event updates, and invites.</Text>
        </View>
        <Pressable style={styles.secondaryButton} onPress={markAllRead}>
          <Text style={styles.secondaryText}>Read all</Text>
        </Pressable>
      </View>
      {notifications.length ? notifications.map((item) => (
        <Pressable key={item.id} style={[styles.card, !item.readAt && styles.unreadCard]} onPress={() => void openNotification(item)}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!item.readAt ? <Text style={styles.status}>new</Text> : null}
          </View>
          <Text style={styles.description}>{item.body}</Text>
          <Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text>
        </Pressable>
      )) : <Text style={styles.empty}>No alerts yet.</Text>}
    </ScrollView>
  );
}

function GroupsScreen({ onOpenGroup }: { onOpenGroup: (groupId: string) => void }) {
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    const body = await api<{ groups: Group[] }>("/api/mobile/groups");
    setGroupsList(body.groups);
  }, []);

  useEffect(() => {
    void load().catch((error) => Alert.alert("Groups error", error.message));
  }, [load]);

  return (
    <ScrollView
      style={styles.body}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load().finally(() => setRefreshing(false)); }} />}
    >
      <Text style={styles.title}>Local groups</Text>
      <Text style={styles.muted}>Browse small crews and request to join when one fits.</Text>
      {groupsList.map((group) => <GroupCard key={group.id} group={group} onJoined={load} onOpen={onOpenGroup} />)}
    </ScrollView>
  );
}

function GroupDetailScreen({ groupId, onBack, onOpenEvent }: { groupId: string; onBack: () => void; onOpenEvent: (eventId: string) => void }) {
  const [data, setData] = useState<GroupDetailData | null>(null);
  const [busy, setBusy] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const body = await api<GroupDetailData>(`/api/mobile/groups/${groupId}`);
    setData(body);
  }, [groupId]);

  useEffect(() => {
    void load().catch((error) => Alert.alert("Group error", error.message));
  }, [load]);

  async function join() {
    setBusy(true);
    try {
      await api(`/api/mobile/groups/${groupId}/join`, { method: "POST" });
      Alert.alert("Request sent", "An admin can approve your group request.");
      await load();
    } catch (error) {
      Alert.alert("Unable to join", error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function inviteFriend() {
    setInviteBusy(true);
    try {
      await api(`/api/mobile/groups/${groupId}/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail })
      });
      setInviteEmail("");
      Alert.alert("Invite sent", "Your friend will see it in CrewGoals alerts.");
    } catch (error) {
      Alert.alert("Unable to invite", error instanceof Error ? error.message : "Try again.");
    } finally {
      setInviteBusy(false);
    }
  }

  if (!data) return <Splash />;

  const { group, membership } = data;
  const memberCount = group._count?.members ?? 0;
  const events = group.events ?? [];

  return (
    <ScrollView
      style={styles.body}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load().finally(() => setRefreshing(false)); }} />}
    >
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>{group.title}</Text>
      <Text style={styles.muted}>{group.neighborhood}, {group.city}</Text>
      <View style={styles.chips}>
        <Text style={styles.chip}>{group.status.toLowerCase()}</Text>
        <Text style={styles.chip}>{memberCount}/{group.maxMembers} members</Text>
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
          <Pressable style={styles.primaryButton} onPress={join} disabled={busy || group.status !== "OPEN"}>
            <Text style={styles.primaryText}>{busy ? "Sending request..." : group.status === "OPEN" ? "Request to join" : "Group closed"}</Text>
          </Pressable>
        )}
      </View>

      {membership && ["APPROVED", "JOINED", "ATTENDED"].includes(membership.status) ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Invite a friend</Text>
          <Text style={styles.description}>Send an in-app invite to someone who already has a CrewGoals account.</Text>
          <Input label="Friend email" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" />
          <Pressable style={styles.primaryButton} onPress={inviteFriend} disabled={inviteBusy || !inviteEmail.trim()}>
            <Text style={styles.primaryText}>{inviteBusy ? "Sending invite..." : "Send invite"}</Text>
          </Pressable>
        </View>
      ) : null}

      <Section title="Upcoming events">
        {events.length ? events.map((event) => <EventCard key={event.id} event={{ ...event, group: { id: group.id, title: group.title } }} onOpen={onOpenEvent} />) : <Text style={styles.empty}>No events scheduled yet.</Text>}
      </Section>
    </ScrollView>
  );
}

function EventDetailScreen({ eventId, onBack }: { eventId: string; onBack: () => void }) {
  const [data, setData] = useState<EventDetailData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState("5");
  const [comfortScore, setComfortScore] = useState("5");
  const [groupMatchScore, setGroupMatchScore] = useState("5");
  const [wouldAttendAgain, setWouldAttendAgain] = useState(true);
  const [wouldInviteFriend, setWouldInviteFriend] = useState(true);
  const [comment, setComment] = useState("");

  const load = useCallback(async () => {
    const body = await api<EventDetailData>(`/api/mobile/events/${eventId}`);
    setData(body);
  }, [eventId]);

  useEffect(() => {
    void load().catch((error) => Alert.alert("Event error", error.message));
  }, [load]);

  async function submitFeedback() {
    setBusy(true);
    try {
      await api(`/api/mobile/feedback/${eventId}`, {
        method: "POST",
        body: JSON.stringify({
          rating: Number(rating),
          comfortScore: Number(comfortScore),
          groupMatchScore: Number(groupMatchScore),
          wouldAttendAgain,
          wouldInviteFriend,
          comment
        })
      });
      Alert.alert("Feedback submitted", "Thanks for helping improve group fit.");
      await load();
    } catch (error) {
      Alert.alert("Unable to submit feedback", error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <Splash />;

  const { event, membership, canSubmitFeedback } = data;

  return (
    <ScrollView
      style={styles.body}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load().finally(() => setRefreshing(false)); }} />}
    >
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.muted}>{event.group.title}</Text>

      <View style={styles.card}>
        <View style={styles.chips}>
          <Text style={styles.chip}>{event.status.toLowerCase()}</Text>
          {membership ? <Text style={styles.chip}>Your status: {membership.status.toLowerCase()}</Text> : null}
        </View>
        <Text style={styles.description}>{event.description}</Text>
        <View style={styles.detailGrid}>
          <DetailItem label="Location" value={event.locationName} />
          <DetailItem label="Address" value={event.address} />
          <DetailItem label="Starts" value={new Date(event.startTime).toLocaleString()} />
          <DetailItem label="Ends" value={new Date(event.endTime).toLocaleString()} />
          <DetailItem label="Host" value={event.hostName} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Feedback</Text>
        {canSubmitFeedback ? (
          <>
            <Text style={styles.description}>Tell us how the event felt so future matches get better.</Text>
            <ScoreInput label="Overall rating" value={rating} onChangeText={setRating} />
            <ScoreInput label="Comfort score" value={comfortScore} onChangeText={setComfortScore} />
            <ScoreInput label="Group match score" value={groupMatchScore} onChangeText={setGroupMatchScore} />
            <ToggleChoice label="Would attend again" value={wouldAttendAgain} onChange={setWouldAttendAgain} />
            <ToggleChoice label="Would invite a friend" value={wouldInviteFriend} onChange={setWouldInviteFriend} />
            <Input label="Comment" value={comment} onChangeText={setComment} multiline />
            <Pressable style={styles.primaryButton} onPress={submitFeedback} disabled={busy}>
              <Text style={styles.primaryText}>{busy ? "Submitting..." : "Submit feedback"}</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.description}>
            Feedback unlocks after an admin marks you as attended and marks this event as completed.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function ProfileScreen({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
  const [form, setForm] = useState<Preference>(defaultPreference(user.name));
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api<{ user: User; preference: Preference | null }>("/api/mobile/me").then((body) => {
      setForm(normalizePreference({ ...(body.preference ?? {}), name: body.user.name }));
      setLoaded(true);
    });
  }, []);

  async function save() {
    const normalized = normalizePreference({ ...form, name: form.name || user.name });
    const missing = validateProfile(normalized);
    if (missing.length) {
      Alert.alert("Complete required fields", missing.join("\n"));
      return;
    }

    setBusy(true);
    try {
      const body = await api<{ user: User; preference: Preference }>("/api/mobile/onboarding", {
        method: "PUT",
        body: JSON.stringify(normalized)
      });
      setForm(normalizePreference({ ...body.preference, name: body.user.name }));
      onSaved(body.user);
      Alert.alert("Saved", "Your matching profile is updated.");
    } catch (error) {
      Alert.alert("Unable to save", error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <Splash />;

  return (
    <ScrollView style={styles.body}>
      <Text style={styles.title}>Matching profile</Text>
      <Text style={styles.requiredNote}>Fields marked * are required.</Text>
      <Input label="Name" required value={form.name ?? ""} onChangeText={(value) => setForm((current) => ({ ...current, name: value }))} />
      <SingleChoice label="Age range" required options={ageRanges} value={form.ageRange} onChange={(value) => setForm((current) => ({ ...current, ageRange: value }))} />
      <Input label="City" required value={form.city} onChangeText={(value) => setForm((current) => ({ ...current, city: value }))} />
      <Input label="Neighborhood" required value={form.neighborhood} onChangeText={(value) => setForm((current) => ({ ...current, neighborhood: value }))} />
      <ChoiceGroup label="Goals" required helper="Choose at least one." options={goals} selected={form.goals} onChange={(values) => setForm((current) => ({ ...current, goals: values }))} />
      <ChoiceGroup label="Activities" required helper="Choose at least one." options={activities} selected={form.activities} onChange={(values) => setForm((current) => ({ ...current, activities: values }))} />
      <ChoiceGroup label="Availability" required helper="Choose at least one." options={availability} selected={form.availability} onChange={(values) => setForm((current) => ({ ...current, availability: values }))} />
      <SingleChoice label="Current level" required options={levels} value={form.currentLevel} onChange={(value) => setForm((current) => ({ ...current, currentLevel: value }))} />
      <SingleChoice label="Target goal" required options={targetGoals} value={form.targetGoal} onChange={(value) => setForm((current) => ({ ...current, targetGoal: value }))} />
      <SingleChoice label="Vibe" required options={vibes} value={form.vibe} onChange={(value) => setForm((current) => ({ ...current, vibe: value }))} />
      <SingleChoice label="Comfort preference" required options={comfortPreferences} value={form.comfortPreference} onChange={(value) => setForm((current) => ({ ...current, comfortPreference: value }))} />
      <NumberChoice label="Preferred group size" required options={groupSizes} value={form.preferredGroupSize} onChange={(value) => setForm((current) => ({ ...current, preferredGroupSize: value }))} />
      <Input label="Bio" value={form.bio ?? ""} onChangeText={(value) => setForm((current) => ({ ...current, bio: value }))} multiline />
      <Pressable style={styles.primaryButton} onPress={save} disabled={busy}>
        <Text style={styles.primaryText}>{busy ? "Saving..." : "Save profile"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function defaultPreference(name: string): Preference {
  return {
    name,
    ageRange: "25-34",
    city: "San Francisco",
    neighborhood: "Inner Richmond",
    goals: ["become runner"],
    activities: ["running"],
    currentLevel: "beginner",
    targetGoal: "complete 5K",
    availability: ["Saturday morning"],
    preferredGroupSize: 8,
    vibe: "beginner-friendly",
    comfortPreference: "mixed group",
    phone: "",
    bio: ""
  };
}

function normalizePreference(input: Partial<Preference>): Preference {
  const defaults = defaultPreference(input.name ?? "");
  return {
    ...defaults,
    ...input,
    name: input.name ?? defaults.name,
    ageRange: input.ageRange || defaults.ageRange,
    city: input.city || defaults.city,
    neighborhood: input.neighborhood || defaults.neighborhood,
    goals: Array.isArray(input.goals) && input.goals.length ? input.goals : defaults.goals,
    activities: Array.isArray(input.activities) && input.activities.length ? input.activities : defaults.activities,
    currentLevel: input.currentLevel || defaults.currentLevel,
    targetGoal: input.targetGoal || defaults.targetGoal,
    availability: Array.isArray(input.availability) && input.availability.length ? input.availability : defaults.availability,
    preferredGroupSize: Number.isInteger(input.preferredGroupSize) ? input.preferredGroupSize as number : defaults.preferredGroupSize,
    vibe: input.vibe || defaults.vibe,
    comfortPreference: input.comfortPreference || defaults.comfortPreference,
    phone: input.phone ?? "",
    bio: input.bio ?? ""
  };
}

function validateProfile(form: Preference) {
  const missing: string[] = [];
  if (!(form.name ?? "").trim()) missing.push("Name is required.");
  if (!form.city.trim()) missing.push("City is required.");
  if (!form.neighborhood.trim()) missing.push("Neighborhood is required.");
  if (!form.goals.length) missing.push("Choose at least one goal.");
  if (!form.activities.length) missing.push("Choose at least one activity.");
  if (!form.availability.length) missing.push("Choose at least one availability option.");
  if (!form.currentLevel.trim()) missing.push("Current level is required.");
  if (!form.targetGoal.trim()) missing.push("Target goal is required.");
  if (!form.vibe.trim()) missing.push("Vibe is required.");
  if (!form.comfortPreference.trim()) missing.push("Comfort preference is required.");
  if (!Number.isInteger(form.preferredGroupSize) || form.preferredGroupSize < 3 || form.preferredGroupSize > 20) {
    missing.push("Preferred group size must be between 3 and 20.");
  }
  return missing;
}

function GroupCard({ group, onJoined, onOpen }: { group: Group; onJoined: () => Promise<void>; onOpen: (groupId: string) => void }) {
  const [busy, setBusy] = useState(false);
  const chips = useMemo(() => [group.goal.name, group.activity.name, group.level, group.vibe, group.schedule], [group]);

  async function join() {
    setBusy(true);
    try {
      await api(`/api/mobile/groups/${group.id}/join`, { method: "POST" });
      Alert.alert("Request sent", "An admin can approve your group request.");
      await onJoined();
    } catch (error) {
      Alert.alert("Unable to join", error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{group.title}</Text>
        <Text style={styles.status}>{group.status.toLowerCase()}</Text>
      </View>
      <Text style={styles.muted}>{group.neighborhood}, {group.city}</Text>
      <Text style={styles.description}>{group.description}</Text>
      <View style={styles.chips}>{chips.map((chip) => <Text key={chip} style={styles.chip}>{chip}</Text>)}</View>
      <View style={styles.rowBetween}>
        <Text style={styles.muted}>{group._count?.members ?? 0}/{group.maxMembers} members{typeof group.score === "number" ? ` · score ${group.score}` : ""}</Text>
        <Pressable style={styles.secondaryButton} onPress={() => onOpen(group.id)}>
          <Text style={styles.secondaryText}>Details</Text>
        </Pressable>
        <Pressable style={styles.smallButton} onPress={join} disabled={busy || group.status !== "OPEN"}>
          <Text style={styles.smallButtonText}>{busy ? "..." : "Join"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EventCard({ event, onOpen }: { event: EventItem; onOpen: (eventId: string) => void }) {
  return (
    <Pressable style={styles.card} onPress={() => onOpen(event.id)}>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.muted}>{event.group?.title}</Text>
      <Text style={styles.description}>{event.locationName} · {new Date(event.startTime).toLocaleString()}</Text>
      <Text style={styles.linkText}>View event</Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ScoreInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.scoreRow}>
        {["1", "2", "3", "4", "5"].map((score) => (
          <Pressable key={score} style={[styles.scoreButton, value === score && styles.scoreButtonActive]} onPress={() => onChangeText(score)}>
            <Text style={[styles.scoreText, value === score && styles.scoreTextActive]}>{score}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ToggleChoice({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segment}>
        <Pressable style={[styles.segmentButton, value && styles.segmentActive]} onPress={() => onChange(true)}>
          <Text style={styles.segmentText}>Yes</Text>
        </Pressable>
        <Pressable style={[styles.segmentButton, !value && styles.segmentActive]} onPress={() => onChange(false)}>
          <Text style={styles.segmentText}>No</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Input(props: { label: string; value: string; onChangeText: (value: string) => void; secureTextEntry?: boolean; autoCapitalize?: "none"; keyboardType?: "email-address"; multiline?: boolean; required?: boolean }) {
  const [showSecret, setShowSecret] = useState(false);
  const hasVisibilityToggle = Boolean(props.secureTextEntry);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}{props.required ? " *" : ""}</Text>
      <View style={hasVisibilityToggle ? styles.inputWrap : undefined}>
        <TextInput
          style={[styles.input, hasVisibilityToggle && styles.inputWithButton, props.multiline && styles.textarea]}
          value={props.value}
          onChangeText={props.onChangeText}
          secureTextEntry={props.secureTextEntry && !showSecret}
          autoCapitalize={props.autoCapitalize}
          keyboardType={props.keyboardType}
          multiline={props.multiline}
        />
        {hasVisibilityToggle ? (
          <Pressable accessibilityRole="button" accessibilityLabel={showSecret ? "Hide password" : "Show password"} style={styles.visibilityButton} onPress={() => setShowSecret((current) => !current)}>
            <Text style={styles.visibilityText}>{showSecret ? "Hide" : "Show"}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ChoiceGroup({ label, options, selected, onChange, required, helper }: { label: string; options: string[]; selected: string[]; onChange: (values: string[]) => void; required?: boolean; helper?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
      <View style={styles.chips}>
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <Pressable
              key={option}
              style={[styles.choice, active && styles.choiceActive]}
              onPress={() => onChange(active ? selected.filter((item) => item !== option) : [...selected, option])}
            >
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SingleChoice({ label, options, value, onChange, required }: { label: string; options: string[]; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable key={option} style={[styles.choice, active && styles.choiceActive]} onPress={() => onChange(option)}>
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function NumberChoice({ label, options, value, onChange, required }: { label: string; options: number[]; value: number; onChange: (value: number) => void; required?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable key={option} style={[styles.choice, active && styles.choiceActive]} onPress={() => onChange(option)}>
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8f7f0" },
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 22, fontWeight: "900", color: "#17211d" },
  muted: { color: "#6c6259", fontSize: 13, lineHeight: 19 },
  body: { flex: 1, paddingHorizontal: 20 },
  tabs: { marginHorizontal: 20, flexDirection: "row", backgroundColor: "#ebe7dc", borderRadius: 8, padding: 3 },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 6 },
  tabActive: { backgroundColor: "#17211d" },
  tabText: { color: "#426653", fontWeight: "700", textTransform: "capitalize" },
  tabTextActive: { color: "#fff" },
  authWrap: { padding: 20, paddingTop: 64 },
  hero: { fontSize: 42, lineHeight: 46, fontWeight: "900", color: "#17211d" },
  heroSub: { marginTop: 12, marginBottom: 24, fontSize: 16, lineHeight: 24, color: "#6c6259" },
  title: { fontSize: 28, fontWeight: "900", color: "#17211d", marginTop: 20 },
  requiredNote: { color: "#6c6259", fontSize: 13, marginTop: 8 },
  notice: { backgroundColor: "#dff4e9", borderColor: "#b7dfc8", borderWidth: 1, borderRadius: 8, padding: 14, marginTop: 16 },
  noticeTitle: { color: "#17211d", fontSize: 15, fontWeight: "900" },
  card: { backgroundColor: "#fff", borderColor: "#e5e0d6", borderWidth: 1, borderRadius: 8, padding: 16, marginTop: 12 },
  unreadCard: { borderColor: "#426653", borderWidth: 2 },
  cardTitle: { color: "#17211d", fontSize: 17, fontWeight: "800", flexShrink: 1 },
  description: { color: "#4f4943", marginTop: 8, lineHeight: 20 },
  section: { marginTop: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#17211d", marginBottom: 2 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  backButton: { alignSelf: "flex-start", marginTop: 18, borderRadius: 8, backgroundColor: "#ebe7dc", paddingHorizontal: 12, paddingVertical: 8 },
  backText: { color: "#426653", fontWeight: "900" },
  status: { backgroundColor: "#dff4e9", color: "#426653", fontWeight: "800", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, overflow: "hidden" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { backgroundColor: "#dff4e9", color: "#426653", fontWeight: "700", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: "hidden", fontSize: 12 },
  primaryButton: { backgroundColor: "#17211d", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  primaryText: { color: "#fff", fontWeight: "900" },
  smallButton: { backgroundColor: "#17211d", borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14 },
  smallButtonText: { color: "#fff", fontWeight: "800" },
  secondaryButton: { backgroundColor: "#dff4e9", borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14, marginTop: 12 },
  secondaryText: { color: "#426653", fontWeight: "900" },
  linkText: { color: "#426653", fontWeight: "900", marginTop: 10 },
  ghostButton: { paddingVertical: 8, paddingHorizontal: 10 },
  ghostText: { color: "#426653", fontWeight: "800" },
  segment: { flexDirection: "row", backgroundColor: "#ebe7dc", borderRadius: 8, padding: 3, marginBottom: 12 },
  segmentButton: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 6 },
  segmentActive: { backgroundColor: "#dff4e9" },
  segmentText: { fontWeight: "900", color: "#17211d" },
  field: { marginTop: 12 },
  label: { color: "#17211d", fontWeight: "800", marginBottom: 6 },
  helperText: { color: "#6c6259", fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: "#fff", borderColor: "#d7d0c4", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, color: "#17211d" },
  inputWrap: { position: "relative" },
  inputWithButton: { paddingRight: 72 },
  visibilityButton: { position: "absolute", right: 8, top: 7, bottom: 7, justifyContent: "center", paddingHorizontal: 10, borderRadius: 6, backgroundColor: "#dff4e9" },
  visibilityText: { color: "#426653", fontWeight: "900", fontSize: 12 },
  textarea: { minHeight: 90, textAlignVertical: "top" },
  detailGrid: { marginTop: 16, gap: 10 },
  detailItem: { borderTopColor: "#ebe7dc", borderTopWidth: 1, paddingTop: 10 },
  detailLabel: { color: "#6c6259", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  detailValue: { color: "#17211d", fontSize: 15, fontWeight: "800", marginTop: 3 },
  scoreRow: { flexDirection: "row", gap: 8 },
  scoreButton: { flex: 1, alignItems: "center", borderColor: "#d7d0c4", borderWidth: 1, borderRadius: 8, paddingVertical: 10, backgroundColor: "#fff" },
  scoreButtonActive: { backgroundColor: "#17211d", borderColor: "#17211d" },
  scoreText: { color: "#426653", fontWeight: "900" },
  scoreTextActive: { color: "#fff" },
  statusBox: { marginTop: 16, borderRadius: 8, backgroundColor: "#f8f7f0", padding: 12 },
  statusTitle: { color: "#17211d", fontWeight: "900" },
  choice: { borderColor: "#d7d0c4", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: "#fff" },
  choiceActive: { backgroundColor: "#17211d", borderColor: "#17211d" },
  choiceText: { color: "#426653", fontWeight: "800" },
  choiceTextActive: { color: "#fff" },
  empty: { color: "#6c6259", marginTop: 12 }
});
