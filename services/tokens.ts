type SingleUseToken = {
  usedAt: Date | null;
  expiresAt: Date | null;
};

/**
 * A single-use, time-limited token (password reset, group invite link) is
 * usable only if it exists, has not been consumed, and has not expired.
 */
export function isSingleUseTokenUsable(
  token: SingleUseToken | null | undefined,
  now: Date = new Date()
): boolean {
  if (!token) return false;
  if (token.usedAt) return false;
  if (token.expiresAt && token.expiresAt.getTime() <= now.getTime()) return false;
  return true;
}
