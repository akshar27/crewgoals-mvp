import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const preference = await prisma.userPreference.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ user, preference }, { headers: { "Cache-Control": "no-store" } });
}
