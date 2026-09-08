import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const blockedUserId = typeof body?.blockedUserId === "string" ? body.blockedUserId : "";
  if (!blockedUserId || blockedUserId === user.id) return NextResponse.json({ error: "Invalid user." }, { status: 400 });

  const block = await prisma.userBlock.upsert({
    where: { blockerId_blockedUserId: { blockerId: user.id, blockedUserId } },
    create: { blockerId: user.id, blockedUserId },
    update: {}
  });

  return NextResponse.json({ block });
}
