import { useQuery } from "@tanstack/react-query";
import { api, type DashboardData, type EventDetailData, type GroupDetailData, type Group, type Membership, type NotificationItem, type Preference, type User } from "../api";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  profile: ["profile"] as const,
  notifications: ["notifications"] as const,
  groups: (city?: string, neighborhood?: string) => ["groups", city ?? "", neighborhood ?? ""] as const,
  group: (id: string) => ["group", id] as const,
  event: (id: string) => ["event", id] as const,
  invite: (token: string) => ["invite", token] as const,
};

export type InviteData = {
  invitedBy: string;
  group: Group;
  membership: Membership | null;
};

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api<DashboardData>("/api/mobile/dashboard"),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api<{ user: User; preference: Preference | null }>("/api/mobile/me"),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api<{ notifications: NotificationItem[] }>("/api/mobile/notifications"),
  });
}

export function useGroups(city: string, neighborhood: string) {
  return useQuery({
    queryKey: queryKeys.groups(city.trim(), neighborhood.trim()),
    queryFn: () => {
      const params = new URLSearchParams();
      if (city.trim()) params.set("city", city.trim());
      if (neighborhood.trim()) params.set("neighborhood", neighborhood.trim());
      const qs = params.toString();
      return api<{ groups: Group[] }>(`/api/mobile/groups${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: queryKeys.group(id),
    queryFn: () => api<GroupDetailData>(`/api/mobile/groups/${id}`),
    enabled: Boolean(id),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => api<EventDetailData>(`/api/mobile/events/${id}`),
    enabled: Boolean(id),
  });
}

export function useInvite(token: string) {
  return useQuery({
    queryKey: queryKeys.invite(token),
    queryFn: () => api<InviteData>(`/api/mobile/invite/${token}`),
    enabled: Boolean(token),
    retry: false,
  });
}
