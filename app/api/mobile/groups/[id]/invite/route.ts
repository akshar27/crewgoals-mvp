import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) return NextResponse.json({ error: "Friend email is required." }, { status: 400 });

  const [group, friend] = await Promise.all([
    prisma.group.findUnique({ where: { id } }),
    prisma.user.findUnique({ where: { email } })
  ]);

  if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });
  if (!friend) return NextResponse.json({ error: "That person does not have a CrewGoals account yet." }, { status: 404 });
  if (friend.id === user.id) return NextResponse.json({ error: "Invite someone other than yourself." }, { status: 400 });

  await notifyUser({
    userId: friend.id,
    type: "FRIEND_INVITE",
    title: `${user.name} invited you to a group`,
    body: `Check out ${group.title}.`,
    data: { groupId: group.id, invitedByUserId: user.id }
  });

  return NextResponse.json({ ok: true });
}
