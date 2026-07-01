import { describe, expect, it } from "vitest";
import { canSubmitFeedback } from "@/services/feedback-rules";

describe("feedback eligibility", () => {
  it("allows attended members to review completed events", () => {
    expect(canSubmitFeedback({ status: "ATTENDED", groupId: "g1" }, { groupId: "g1", status: "COMPLETED" })).toBe(true);
  });

  it("blocks people who did not attend", () => {
    expect(canSubmitFeedback({ status: "JOINED", groupId: "g1" }, { groupId: "g1", status: "COMPLETED" })).toBe(false);
  });

  it("blocks completed feedback for the wrong group", () => {
    expect(canSubmitFeedback({ status: "ATTENDED", groupId: "g2" }, { groupId: "g1", status: "COMPLETED" })).toBe(false);
  });
});
