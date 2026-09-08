import { ogCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { prisma } from "@/lib/prisma";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "CrewGoals group";
export const runtime = "nodejs";

export default async function GroupOpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      goal: true,
      activity: true,
      _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } },
    },
  });

  if (!group) {
    return ogCard({ eyebrow: "CrewGoals", title: "Group not found" });
  }

  return ogCard({
    eyebrow: `${group.neighborhood}, ${group.city}`,
    title: group.title,
    chips: [
      group.goal.name,
      group.activity.name,
      group.level,
      `${group._count.members}/${group.maxMembers} members`,
    ],
  });
}
