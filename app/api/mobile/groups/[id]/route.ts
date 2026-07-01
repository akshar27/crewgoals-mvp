import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  const { id } = await params;
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      goal: true,
      activity: true,
      events: { orderBy: { startTime: "asc" } },
      _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } },
      members: user ? { where: { userId: user.id } } : false
    }
  });
  if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });
  return NextResponse.json({ group, membership: user ? group.members[0] ?? null : null }, { headers: { "Cache-Control": "no-store" } });
}
