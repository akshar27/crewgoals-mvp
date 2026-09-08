import { isActiveMember } from "../src/rules";

describe("isActiveMember", () => {
  it("is true for accepted member statuses", () => {
    expect(isActiveMember("APPROVED")).toBe(true);
    expect(isActiveMember("JOINED")).toBe(true);
    expect(isActiveMember("ATTENDED")).toBe(true);
  });

  it("is false for pending / absent statuses", () => {
    expect(isActiveMember("REQUESTED")).toBe(false);
    expect(isActiveMember("NO_SHOW")).toBe(false);
    expect(isActiveMember(null)).toBe(false);
    expect(isActiveMember(undefined)).toBe(false);
  });
});
