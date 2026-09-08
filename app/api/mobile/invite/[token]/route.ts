import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSingleUseTokenUsable } from "@/services/tokens";

export const dynamic = "force-dynamic";

/** Resolve a group invite link so the mobile app can show the group and offer to join. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const user = await getMobileUser(request);
  const { token } = await params;

  const invite = await prisma.inviteLink.findUnique({
    where: { token },
    include: {
      group: {
        include: {
          goal: true,
          activity: true,
          _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } },
          members: user ? { where: { userId: user.id } } : false,
        },
      },
      createdBy: { select: { name: true } },
    },
  });

  if (!invite || !isSingleUseTokenUsable(invite)) {
    return NextResponse.json({ error: "This invite link is no longer valid." }, { status: 404 });
  }

  const { members, ...group } = invite.group;
  return NextResponse.json(
    {
      invitedBy: invite.createdBy.name,
      group,
      membership: user && Array.isArray(members) ? members[0] ?? null : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
