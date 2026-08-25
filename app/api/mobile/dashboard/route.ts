import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recommendGroups } from "@/services/matching";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [preference, groups, memberships, events, unreadNotifications] = await Promise.all([
    prisma.userPreference.findUnique({ where: { userId: user.id } }),
    prisma.group.findMany({
      include: {
        goal: true,
        activity: true,
        _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } }
      }
    }),
    prisma.groupMember.findMany({ where: { userId: user.id }, include: { group: { include: { goal: true, activity: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.event.findMany({
      where: { group: { members: { some: { userId: user.id, status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } },
      include: { group: true },
      orderBy: { startTime: "asc" },
      take: 8
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } })
  ]);

  const recommendedGroups = recommendGroups(preference, groups.map((group) => ({ ...group, memberCount: group._count.members }))).slice(0, 8);
  return NextResponse.json({ user, preference, recommendedGroups, memberships, events, unreadNotifications }, { headers: { "Cache-Control": "no-store" } });
}
