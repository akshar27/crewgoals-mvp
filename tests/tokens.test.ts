import { describe, expect, it } from "vitest";
import { isSingleUseTokenUsable } from "@/services/tokens";

const now = new Date("2026-01-01T12:00:00Z");
const future = new Date("2026-01-01T13:00:00Z");
const past = new Date("2026-01-01T11:00:00Z");

describe("isSingleUseTokenUsable", () => {
  it("accepts a fresh, unexpired token", () => {
    expect(isSingleUseTokenUsable({ usedAt: null, expiresAt: future }, now)).toBe(true);
  });

  it("rejects a missing token", () => {
    expect(isSingleUseTokenUsable(null, now)).toBe(false);
    expect(isSingleUseTokenUsable(undefined, now)).toBe(false);
  });

  it("rejects a consumed token", () => {
    expect(isSingleUseTokenUsable({ usedAt: past, expiresAt: future }, now)).toBe(false);
  });

  it("rejects an expired token", () => {
    expect(isSingleUseTokenUsable({ usedAt: null, expiresAt: past }, now)).toBe(false);
  });

  it("rejects a token expiring exactly now", () => {
    expect(isSingleUseTokenUsable({ usedAt: null, expiresAt: now }, now)).toBe(false);
  });

  it("treats a null expiry as non-expiring (invite links)", () => {
    expect(isSingleUseTokenUsable({ usedAt: null, expiresAt: null }, now)).toBe(true);
  });
});
