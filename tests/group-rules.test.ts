import { describe, expect, it } from "vitest";
import { canRequestToJoin, isDuplicateJoin } from "@/services/group-rules";

describe("group rules", () => {
  it("prevents joining a full group", () => {
    expect(canRequestToJoin({ status: "OPEN", maxMembers: 6, memberCount: 6 })).toBe(false);
  });

  it("prevents joining a closed group", () => {
    expect(canRequestToJoin({ status: "CLOSED", maxMembers: 6, memberCount: 2 })).toBe(false);
  });

  it("flags duplicate join requests", () => {
    expect(isDuplicateJoin({ id: "membership" })).toBe(true);
    expect(isDuplicateJoin(null)).toBe(false);
  });
});
