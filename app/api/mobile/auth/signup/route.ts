import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`mobile-signup:${request.headers.get("x-forwarded-for") ?? "local"}`);
  if (!limited.ok) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429 });

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check your signup details and try again." }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    },
    select: { id: true, email: true, name: true, role: true }
  });

  return NextResponse.json({ user, token: await createAuthToken({ userId: user.id, role: user.role }) });
}
