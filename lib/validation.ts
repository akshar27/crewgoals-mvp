import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(100)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(100)
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(2).max(80),
  ageRange: z.string().min(1).max(40),
  city: z.string().trim().min(2).max(80),
  neighborhood: z.string().trim().min(2).max(80),
  goals: z.array(z.string()).min(1),
  activities: z.array(z.string()).min(1),
  currentLevel: z.string().min(1),
  targetGoal: z.string().min(1).max(80),
  availability: z.array(z.string()).min(1),
  preferredGroupSize: z.coerce.number().int().min(3).max(20),
  vibe: z.string().min(1).max(80),
  comfortPreference: z.string().min(1).max(80),
  phone: z.string().trim().max(30).optional(),
  bio: z.string().trim().max(500).optional()
});

export const groupSchema = z.object({
  title: z.string().trim().min(3).max(120),
  goalId: z.string().min(1),
  activityId: z.string().min(1),
  city: z.string().trim().min(2).max(80),
  neighborhood: z.string().trim().min(2).max(80),
  level: z.string().min(1),
  ageRange: z.string().min(1),
  vibe: z.string().min(1),
  maxMembers: z.coerce.number().int().min(3).max(50),
  schedule: z.string().min(1).max(120),
  description: z.string().trim().min(10).max(1000),
  status: z.enum(["OPEN", "FULL", "CLOSED", "COMPLETED"]).default("OPEN")
});

export const eventSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().trim().min(3).max(120),
  locationName: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(200),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  description: z.string().trim().min(10).max(1000),
  hostName: z.string().trim().min(2).max(80),
  status: z.enum(["UPCOMING", "COMPLETED", "CANCELLED"]).default("UPCOMING")
});

export const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comfortScore: z.coerce.number().int().min(1).max(5),
  groupMatchScore: z.coerce.number().int().min(1).max(5),
  wouldAttendAgain: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]),
  comment: z.string().trim().max(1000).optional(),
  wouldInviteFriend: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")])
});

export function formValues(formData: FormData, multiKeys: string[] = []) {
  const values: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (const [key, value] of formData.entries()) values[key] = value;
  for (const key of multiKeys) values[key] = formData.getAll(key);
  return values;
}

export function cleanText(input: string | null | undefined) {
  return (input ?? "").replace(/[<>]/g, "").trim();
}
