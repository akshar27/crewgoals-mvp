import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRequestToJoin, isDuplicateJoin } from "@/services/group-rules";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const result = await prisma.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { id },
      include: { _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } } }
    });
    if (!group) return { ok: false, error: "Group not found." };
    const existing = await tx.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId: id } } });
    if (isDuplicateJoin(existing)) return { ok: false, error: "You already requested this group." };
    if (!canRequestToJoin({ status: group.status, maxMembers: group.maxMembers, memberCount: group._count.members })) {
      return { ok: false, error: "This group is not accepting new members." };
    }
    return { ok: true, membership: await tx.groupMember.create({ data: { userId: user.id, groupId: id, status: "REQUESTED" } }) };
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ membership: result.membership });
}
