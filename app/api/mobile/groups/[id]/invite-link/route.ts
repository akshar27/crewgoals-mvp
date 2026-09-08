import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const membership = await prisma.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId: id } } });
  if (!membership || !["APPROVED", "JOINED", "ATTENDED"].includes(membership.status)) {
    return NextResponse.json({ error: "Join this group before creating invite links." }, { status: 403 });
  }

  const invite = await prisma.inviteLink.create({
    data: {
      groupId: id,
      createdById: user.id,
      token: crypto.randomBytes(12).toString("hex"),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.json({ url: `${baseUrl.replace(/\/+$/, "")}/invite/${invite.token}` });
}
