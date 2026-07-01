import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText, feedbackSchema } from "@/lib/validation";
import { canSubmitFeedback } from "@/services/feedback-rules";

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await requireUser();
  const { eventId } = await params;
  const formData = await request.formData();
  const parsed = feedbackSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return NextResponse.redirect(new URL(`/feedback/${eventId}?error=invalid`, request.url));
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.redirect(new URL("/dashboard", request.url));
  const membership = await prisma.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId: event.groupId } } });
  if (!canSubmitFeedback(membership, event)) return NextResponse.redirect(new URL(`/events/${eventId}`, request.url));

  await prisma.feedback.upsert({
    where: { userId_eventId: { userId: user.id, eventId } },
    update: { ...parsed.data, comment: cleanText(parsed.data.comment) },
    create: { ...parsed.data, comment: cleanText(parsed.data.comment), userId: user.id, eventId }
  });
  return NextResponse.redirect(new URL(`/events/${eventId}`, request.url));
}
