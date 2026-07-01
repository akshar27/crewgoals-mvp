import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertGroup(data: {
  title: string;
  goalId: string;
  activityId: string;
  city: string;
  neighborhood: string;
  level: string;
  ageRange: string;
  vibe: string;
  maxMembers: number;
  schedule: string;
  description: string;
}) {
  const existing = await prisma.group.findFirst({ where: { title: data.title } });
  if (existing) return prisma.group.update({ where: { id: existing.id }, data });
  return prisma.group.create({ data });
}

async function upsertEvent(data: {
  groupId: string;
  title: string;
  locationName: string;
  address: string;
  startTime: Date;
  endTime: Date;
  description: string;
  hostName: string;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
}) {
  const existing = await prisma.event.findFirst({ where: { groupId: data.groupId, title: data.title } });
  if (existing) return prisma.event.update({ where: { id: existing.id }, data });
  return prisma.event.create({ data });
}

async function main() {
  const [becomeRunner, gymConsistency, weekendHiking, makeFriends] = await Promise.all(
    ["become runner", "gym consistency", "weekend hiking", "make friends", "explore city"].map((name) =>
      prisma.goal.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const [running, gym, hiking] = await Promise.all(
    ["running", "gym", "hiking", "outdoor sports", "dining", "exploring"].map((name) =>
      prisma.activity.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 12);
  const samplePasswordHash = await bcrypt.hash("RunnerPass123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@crewgoals.local" },
    update: {
      name: "CrewGoals Admin",
      role: "ADMIN",
      passwordHash: adminPasswordHash
    },
    create: {
      email: "admin@crewgoals.local",
      name: "CrewGoals Admin",
      role: "ADMIN",
      passwordHash: adminPasswordHash
    }
  });

  const maya = await prisma.user.upsert({
    where: { email: "maya@example.com" },
    update: {},
    create: {
      email: "maya@example.com",
      name: "Maya Patel",
      passwordHash: samplePasswordHash,
      preference: {
        create: {
          ageRange: "25-34",
          city: "San Francisco",
          neighborhood: "Inner Richmond",
          goals: ["become runner", "make friends"],
          activities: ["running", "hiking"],
          currentLevel: "beginner",
          targetGoal: "complete 5K",
          availability: ["Saturday morning", "weekday evening"],
          preferredGroupSize: 8,
          vibe: "beginner-friendly",
          comfortPreference: "mixed group",
          bio: "New to running and hoping to build a weekend routine."
        }
      }
    }
  });

  const groups = await Promise.all([
    upsertGroup({
        title: "Beginner 5K Run Crew - SF",
        goalId: becomeRunner.id,
        activityId: running.id,
        city: "San Francisco",
        neighborhood: "Inner Richmond",
        level: "beginner",
        ageRange: "25-44",
        vibe: "beginner-friendly",
        maxMembers: 10,
        schedule: "Saturday morning",
        description: "A small beginner crew building toward a relaxed first 5K together."
    }),
    upsertGroup({
        title: "Saturday Golden Gate Park Run",
        goalId: makeFriends.id,
        activityId: running.id,
        city: "San Francisco",
        neighborhood: "Golden Gate Park",
        level: "casual",
        ageRange: "21-39",
        vibe: "social/casual",
        maxMembers: 12,
        schedule: "Saturday morning",
        description: "Easy social runs through the park with coffee nearby afterward."
    }),
    upsertGroup({
        title: "Weekend Hiking Crew",
        goalId: weekendHiking.id,
        activityId: hiking.id,
        city: "San Francisco",
        neighborhood: "Mission",
        level: "casual",
        ageRange: "25-45",
        vibe: "mixed",
        maxMembers: 8,
        schedule: "Sunday morning",
        description: "Local trail days and short Bay Area hikes for people who want more fresh air."
    }),
    upsertGroup({
        title: "Gym Consistency Crew",
        goalId: gymConsistency.id,
        activityId: gym.id,
        city: "San Francisco",
        neighborhood: "SoMa",
        level: "beginner",
        ageRange: "25-44",
        vibe: "serious/accountability",
        maxMembers: 6,
        schedule: "weekday evening",
        description: "Simple accountability sessions for people restarting a gym routine."
    })
  ]);

  await Promise.all([
    upsertEvent({
        groupId: groups[0].id,
        title: "First Easy Run and Warmup",
        locationName: "Arguello Gate",
        address: "Arguello Blvd & Fulton St, San Francisco, CA",
        startTime: new Date("2026-07-11T16:00:00.000Z"),
        endTime: new Date("2026-07-11T17:15:00.000Z"),
        description: "Walk-jog intervals, introductions, and a shared plan for week one.",
        hostName: "Jordan",
        status: "UPCOMING"
    }),
    upsertEvent({
        groupId: groups[1].id,
        title: "Golden Gate Park Coffee Run",
        locationName: "Conservatory of Flowers",
        address: "100 John F Kennedy Dr, San Francisco, CA",
        startTime: new Date("2026-07-18T16:00:00.000Z"),
        endTime: new Date("2026-07-18T17:30:00.000Z"),
        description: "Conversational pace run with an optional coffee stop.",
        hostName: "Alex",
        status: "UPCOMING"
    })
  ]);

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: maya.id, groupId: groups[0].id } },
    update: { status: "JOINED" },
    create: { userId: maya.id, groupId: groups[0].id, status: "JOINED" }
  });

  console.log({ admin: admin.email, password: "AdminPass123!", sampleUser: "maya@example.com", samplePassword: "RunnerPass123!" });
}

main().finally(async () => {
  await prisma.$disconnect();
});
