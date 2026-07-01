import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canSubmitFeedback } from "@/services/feedback-rules";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, include: { group: true } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  const membership = user ? await prisma.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId: event.groupId } } }) : null;
  return NextResponse.json({ event, membership, canSubmitFeedback: canSubmitFeedback(membership, event) }, { headers: { "Cache-Control": "no-store" } });
}
