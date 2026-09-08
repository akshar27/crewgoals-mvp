import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText, reportSchema } from "@/lib/validation";
import { reportHasTarget } from "@/services/safety-rules";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = reportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Reason is required." }, { status: 400 });
  if (!reportHasTarget(parsed.data)) {
    return NextResponse.json({ error: "Report a user, group, or event." }, { status: 400 });
  }

  const report = await prisma.safetyReport.create({
    data: {
      reporterId: user.id,
      reportedUserId: parsed.data.reportedUserId || undefined,
      groupId: parsed.data.groupId || undefined,
      eventId: parsed.data.eventId || undefined,
      reason: cleanText(parsed.data.reason),
      details: cleanText(parsed.data.details)
    }
  });

  return NextResponse.json({ report });
}
