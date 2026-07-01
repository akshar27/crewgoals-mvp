type Membership = {
  status: string;
  groupId: string;
};

type EventLike = {
  groupId: string;
  status: string;
};

export function canSubmitFeedback(membership: Membership | null, event: EventLike) {
  return Boolean(membership && membership.groupId === event.groupId && membership.status === "ATTENDED" && event.status === "COMPLETED");
}
