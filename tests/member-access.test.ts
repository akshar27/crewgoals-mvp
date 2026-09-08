import { describe, expect, it } from "vitest";
import { isActiveMember } from "@/services/member-access";

describe("isActiveMember", () => {
  it("grants access to approved / joined / attended members", () => {
    expect(isActiveMember("APPROVED")).toBe(true);
    expect(isActiveMember("JOINED")).toBe(true);
    expect(isActiveMember("ATTENDED")).toBe(true);
  });

  it("denies pending requests and non-members", () => {
    expect(isActiveMember("REQUESTED")).toBe(false);
    expect(isActiveMember("NO_SHOW")).toBe(false);
    expect(isActiveMember(null)).toBe(false);
    expect(isActiveMember(undefined)).toBe(false);
    expect(isActiveMember("")).toBe(false);
  });
});
