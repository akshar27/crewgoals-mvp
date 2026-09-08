/**
 * Client-side mirrors of the server's group-member access rules
 * (see backend `services/member-access.ts`). Used to hide actions the API
 * would reject anyway — the server is still the source of truth.
 */
export const ACTIVE_MEMBER_STATUSES = ["APPROVED", "JOINED", "ATTENDED"];

export function isActiveMember(status: string | null | undefined): boolean {
  return !!status && ACTIVE_MEMBER_STATUSES.includes(status);
}
