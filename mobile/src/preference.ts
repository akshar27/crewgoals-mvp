import type { Preference } from "./api";

export const GOALS = ["become runner", "gym consistency", "weekend hiking", "make friends", "explore city"];
export const ACTIVITIES = ["running", "gym", "hiking", "outdoor sports", "dining", "exploring"];
export const AVAILABILITY = ["weekday morning", "weekday evening", "Saturday morning", "Sunday morning"];
export const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];
export const LEVELS = ["beginner", "casual", "intermediate", "advanced"];
export const TARGET_GOALS = ["complete 5K", "build habit", "meet people", "lose weight", "stay active"];
export const VIBES = ["social/casual", "serious/accountability", "beginner-friendly", "mixed"];
export const COMFORT_PREFERENCES = ["mixed group", "same-gender group", "beginner-only"];
export const GROUP_SIZES = [4, 6, 8, 10, 12, 16];

export function defaultPreference(name: string): Preference {
  return {
    name,
    ageRange: "25-34",
    city: "San Francisco",
    neighborhood: "Inner Richmond",
    goals: ["become runner"],
    activities: ["running"],
    currentLevel: "beginner",
    targetGoal: "complete 5K",
    availability: ["Saturday morning"],
    preferredGroupSize: 8,
    vibe: "beginner-friendly",
    comfortPreference: "mixed group",
    photoUrl: "",
    phone: "",
    bio: "",
  };
}

export function normalizePreference(input: Partial<Preference>): Preference {
  const defaults = defaultPreference(input.name ?? "");
  return {
    ...defaults,
    ...input,
    name: input.name ?? defaults.name,
    ageRange: input.ageRange || defaults.ageRange,
    city: input.city || defaults.city,
    neighborhood: input.neighborhood || defaults.neighborhood,
    goals: Array.isArray(input.goals) && input.goals.length ? input.goals : defaults.goals,
    activities: Array.isArray(input.activities) && input.activities.length ? input.activities : defaults.activities,
    currentLevel: input.currentLevel || defaults.currentLevel,
    targetGoal: input.targetGoal || defaults.targetGoal,
    availability: Array.isArray(input.availability) && input.availability.length ? input.availability : defaults.availability,
    preferredGroupSize: Number.isInteger(input.preferredGroupSize) ? (input.preferredGroupSize as number) : defaults.preferredGroupSize,
    vibe: input.vibe || defaults.vibe,
    comfortPreference: input.comfortPreference || defaults.comfortPreference,
    photoUrl: input.photoUrl ?? "",
    phone: input.phone ?? "",
    bio: input.bio ?? "",
  };
}

export function validateProfile(form: Preference): string[] {
  const missing: string[] = [];
  if (!(form.name ?? "").trim()) missing.push("Name is required.");
  if (!form.city.trim()) missing.push("City is required.");
  if (!form.neighborhood.trim()) missing.push("Neighborhood is required.");
  if (!form.goals.length) missing.push("Choose at least one goal.");
  if (!form.activities.length) missing.push("Choose at least one activity.");
  if (!form.availability.length) missing.push("Choose at least one availability option.");
  if (!form.currentLevel.trim()) missing.push("Current level is required.");
  if (!form.targetGoal.trim()) missing.push("Target goal is required.");
  if (!form.vibe.trim()) missing.push("Vibe is required.");
  if (!form.comfortPreference.trim()) missing.push("Comfort preference is required.");
  if (!Number.isInteger(form.preferredGroupSize) || form.preferredGroupSize < 3 || form.preferredGroupSize > 20) {
    missing.push("Preferred group size must be between 3 and 20.");
  }
  return missing;
}
