export type User = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

export type Group = {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  level: string;
  ageRange: string;
  vibe: string;
  maxMembers: number;
  schedule: string;
  description: string;
  status: string;
  score?: number;
  goal: { name: string };
  activity: { name: string };
  _count?: { members: number };
};

export type EventItem = {
  id: string;
  groupId: string;
  title: string;
  locationName: string;
  address: string;
  startTime: string;
  endTime: string;
  description: string;
  hostName: string;
  status: string;
  group?: { id: string; title: string };
};

export type Preference = {
  name?: string;
  ageRange: string;
  city: string;
  neighborhood: string;
  goals: string[];
  activities: string[];
  currentLevel: string;
  targetGoal: string;
  availability: string[];
  preferredGroupSize: number;
  vibe: string;
  comfortPreference: string;
  photoUrl?: string;
  phone?: string;
  bio?: string;
};

export type Membership = { id: string; status: string };

export type DashboardData = {
  user: User;
  preference: Preference | null;
  recommendedGroups: Group[];
  memberships: { id: string; status: string; group: Group }[];
  events: EventItem[];
  unreadNotifications: number;
};

export type GroupDetailData = {
  group: Group & { events: EventItem[] };
  membership: Membership | null;
};

export type EventComment = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string; preference?: { photoUrl?: string | null } | null };
};

export type EventDetailData = {
  event: EventItem & {
    group: { id: string; title: string };
    comments: EventComment[];
  };
  membership: Membership | null;
  attendance: { id: string; status: string } | null;
  canSubmitFeedback: boolean;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: { groupId?: string; eventId?: string } | null;
  readAt: string | null;
  createdAt: string;
};
