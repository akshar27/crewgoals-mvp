import { describe, expect, it } from "vitest";
import { canBlockUser, reportHasTarget } from "@/services/safety-rules";

describe("canBlockUser", () => {
  it("allows blocking another user", () => {
    expect(canBlockUser("me", "someone-else")).toBe(true);
  });

  it("rejects blocking yourself", () => {
    expect(canBlockUser("me", "me")).toBe(false);
  });

  it("rejects a missing or non-string target", () => {
    expect(canBlockUser("me", "")).toBe(false);
    expect(canBlockUser("me", null)).toBe(false);
    expect(canBlockUser("me", undefined)).toBe(false);
    expect(canBlockUser("me", 123)).toBe(false);
  });
});

describe("reportHasTarget", () => {
  it("requires at least one of user / group / event", () => {
    expect(reportHasTarget({})).toBe(false);
    expect(reportHasTarget({ reportedUserId: "", groupId: null, eventId: undefined })).toBe(false);
  });

  it("accepts any single target", () => {
    expect(reportHasTarget({ reportedUserId: "u1" })).toBe(true);
    expect(reportHasTarget({ groupId: "g1" })).toBe(true);
    expect(reportHasTarget({ eventId: "e1" })).toBe(true);
  });
});
