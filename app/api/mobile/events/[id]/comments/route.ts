import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const comments = await prisma.eventComment.findMany({
    where: { eventId: id },
    include: { user: { select: { id: true, name: true, preference: { select: { photoUrl: true } } } } },
    orderBy: { createdAt: "asc" },
    take: 100
  });
  return NextResponse.json({ comments }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = commentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Comment is required." }, { status: 400 });

  const event = await prisma.event.findUnique({ where: { id }, select: { groupId: true } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const membership = await prisma.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId: event.groupId } } });
  if (!membership || !["APPROVED", "JOINED", "ATTENDED"].includes(membership.status)) {
    return NextResponse.json({ error: "Join this group before commenting." }, { status: 403 });
  }

  const comment = await prisma.eventComment.create({
    data: { eventId: id, userId: user.id, body: parsed.data.body },
    include: { user: { select: { id: true, name: true, preference: { select: { photoUrl: true } } } } }
  });
  return NextResponse.json({ comment });
}
