import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`mobile-login:${request.headers.get("x-forwarded-for") ?? "local"}`);
  if (!limited.ok) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429 });

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, email: true, name: true, role: true, passwordHash: true }
  });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
  return NextResponse.json({ user: safeUser, token: await createAuthToken({ userId: user.id, role: user.role }) });
}
