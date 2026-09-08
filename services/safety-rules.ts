export function canBlockUser(blockerId: string, targetUserId: unknown): targetUserId is string {
  return (
    typeof targetUserId === "string" &&
    targetUserId.length > 0 &&
    targetUserId !== blockerId
  );
}

type ReportTargets = {
  reportedUserId?: string | null;
  groupId?: string | null;
  eventId?: string | null;
};

/** A safety report must point at least at a user, a group, or an event. */
export function reportHasTarget(targets: ReportTargets): boolean {
  return Boolean(targets.reportedUserId || targets.groupId || targets.eventId);
}
