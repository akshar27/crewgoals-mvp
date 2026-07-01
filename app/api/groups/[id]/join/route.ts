import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRequestToJoin, isDuplicateJoin } from "@/services/group-rules";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const result = await prisma.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { id },
      include: { _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } } }
    });
    if (!group) return { ok: false, message: "Group not found." };
    const existing = await tx.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId: id } } });
    if (isDuplicateJoin(existing)) return { ok: false, message: "You already have a request for this group." };
    if (!canRequestToJoin({ status: group.status, maxMembers: group.maxMembers, memberCount: group._count.members })) {
      return { ok: false, message: "This group is not currently accepting new members." };
    }
    await tx.groupMember.create({ data: { userId: user.id, groupId: id, status: "REQUESTED" } });
    return { ok: true };
  });

  if (!result.ok) return NextResponse.redirect(new URL(`/groups/${id}?error=${encodeURIComponent(result.message ?? "Unable to join group.")}`, _request.url));
  return NextResponse.redirect(new URL(`/groups/${id}`, _request.url));
}
