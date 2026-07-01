import { describe, expect, it } from "vitest";
import { recommendGroups, scoreGroup } from "@/services/matching";

const preference = {
  goals: ["become runner"],
  activities: ["running"],
  city: "San Francisco",
  neighborhood: "Inner Richmond",
  currentLevel: "beginner",
  availability: ["Saturday morning"],
  vibe: "beginner-friendly"
};

describe("matching logic", () => {
  it("scores groups by goal, activity, location, level, schedule, and vibe", () => {
    const score = scoreGroup(preference, {
      id: "g1",
      status: "OPEN",
      memberCount: 2,
      maxMembers: 10,
      city: "San Francisco",
      neighborhood: "Inner Richmond",
      level: "beginner",
      schedule: "Saturday morning",
      vibe: "beginner-friendly",
      goal: { name: "become runner" },
      activity: { name: "running" }
    });
    expect(score).toBe(105);
  });

  it("returns the strongest recommendations first", () => {
    const recommended = recommendGroups(preference, [
      {
        id: "weak",
        status: "OPEN",
        memberCount: 1,
        maxMembers: 10,
        city: "Oakland",
        neighborhood: "Temescal",
        level: "casual",
        schedule: "Sunday morning",
        vibe: "mixed",
        goal: { name: "weekend hiking" },
        activity: { name: "hiking" }
      },
      {
        id: "strong",
        status: "OPEN",
        memberCount: 1,
        maxMembers: 10,
        city: "San Francisco",
        neighborhood: "Inner Richmond",
        level: "beginner",
        schedule: "Saturday morning",
        vibe: "beginner-friendly",
        goal: { name: "become runner" },
        activity: { name: "running" }
      }
    ]);
    expect(recommended[0].id).toBe("strong");
  });
});
