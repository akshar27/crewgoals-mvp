import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Preference, type User } from "../api";
import { queryKeys } from "./queries";

export function useJoinGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api(`/api/mobile/groups/${groupId}/join`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (preference: Preference) =>
      api<{ user: User; preference: Preference }>("/api/mobile/onboarding", {
        method: "PUT",
        body: JSON.stringify(preference),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

type FeedbackInput = {
  rating: number;
  comfortScore: number;
  groupMatchScore: number;
  wouldAttendAgain: boolean;
  wouldInviteFriend: boolean;
  comment: string;
};

export function useSubmitFeedback(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FeedbackInput) =>
      api(`/api/mobile/feedback/${eventId}`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}

export function usePostComment(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api(`/api/mobile/events/${eventId}/comments`, { method: "POST", body: JSON.stringify({ body }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}

type ReportInput = { eventId?: string; groupId?: string; reportedUserId?: string; reason: string; details?: string };

export function useReport() {
  return useMutation({
    mutationFn: (input: ReportInput) =>
      api("/api/mobile/safety/report", { method: "POST", body: JSON.stringify(input) }),
  });
}

export function useBlockUser() {
  return useMutation({
    mutationFn: (blockedUserId: string) =>
      api("/api/mobile/safety/block", { method: "POST", body: JSON.stringify({ blockedUserId }) }),
  });
}

export function useInviteFriend(groupId: string) {
  return useMutation({
    mutationFn: (email: string) =>
      api(`/api/mobile/groups/${groupId}/invite`, { method: "POST", body: JSON.stringify({ email }) }),
  });
}

export function useCreateInviteLink(groupId: string) {
  return useMutation({
    mutationFn: () =>
      api<{ url: string }>(`/api/mobile/groups/${groupId}/invite-link`, { method: "POST" }),
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) =>
      api("/api/mobile/notifications", { method: "PATCH", body: JSON.stringify(id ? { id } : {}) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
