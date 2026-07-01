import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`signup:${request.headers.get("x-forwarded-for") ?? "local"}`);
  if (!limited.ok) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429 });

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check your signup details and try again." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    }
  });
  await createSession({ userId: user.id, role: user.role });
  return NextResponse.json({ redirectTo: "/onboarding" });
}
