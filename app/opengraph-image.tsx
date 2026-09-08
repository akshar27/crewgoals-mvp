import { ogCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "CrewGoals — small local groups matched by goal, level, schedule, and vibe";
export const runtime = "nodejs";

export default function OpengraphImage() {
  return ogCard({
    eyebrow: "Beginner Run Crew · San Francisco",
    title: "Small local groups, matched to your goal",
    chips: ["running", "gym", "hiking", "beginner-friendly"],
  });
}
