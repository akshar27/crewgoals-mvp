import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const groups = await prisma.group.findMany({
    include: {
      goal: true,
      activity: true,
      _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ groups }, { headers: { "Cache-Control": "no-store" } });
}
