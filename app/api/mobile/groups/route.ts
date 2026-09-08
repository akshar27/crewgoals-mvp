import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();
  const neighborhood = request.nextUrl.searchParams.get("neighborhood")?.trim();
  const groups = await prisma.group.findMany({
    where: {
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(neighborhood ? { neighborhood: { contains: neighborhood, mode: "insensitive" } } : {})
    },
    include: {
      goal: true,
      activity: true,
      _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ groups }, { headers: { "Cache-Control": "no-store" } });
}
