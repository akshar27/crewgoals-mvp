import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText, feedbackSchema } from "@/lib/validation";
import { canSubmitFeedback } from "@/services/feedback-rules";

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { eventId } = await params;
  const parsed = feedbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  const membership = await prisma.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId: event.groupId } } });
  if (!canSubmitFeedback(membership, event)) return NextResponse.json({ error: "Feedback is only available after attending a completed event." }, { status: 403 });

  const feedback = await prisma.feedback.upsert({
    where: { userId_eventId: { userId: user.id, eventId } },
    update: { ...parsed.data, comment: cleanText(parsed.data.comment) },
    create: { ...parsed.data, comment: cleanText(parsed.data.comment), userId: user.id, eventId }
  });
  return NextResponse.json({ feedback });
}
