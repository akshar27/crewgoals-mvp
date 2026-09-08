/**
 * Group-member statuses that grant access to member-only surfaces
 * (event comments, creating invite links). REQUESTED is pending; the rest
 * mean the person is or has been an accepted member.
 */
export const ACTIVE_MEMBER_STATUSES = ["APPROVED", "JOINED", "ATTENDED"] as const;

export function isActiveMember(status: string | null | undefined): boolean {
  return !!status && (ACTIVE_MEMBER_STATUSES as readonly string[]).includes(status);
}
