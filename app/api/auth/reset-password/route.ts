import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`reset-password:${request.headers.get("x-forwarded-for") ?? "local"}`);
  if (!limited.ok) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429 });

  const parsed = resetPasswordSchema.safeParse(await requestBody(request));
  if (!parsed.success) return NextResponse.json({ error: "Reset link or password is invalid." }, { status: 400 });

  const ok = await resetPassword(parsed.data.token, parsed.data.password);
  if (!ok) return NextResponse.json({ error: "Reset link is expired or invalid." }, { status: 400 });

  if (request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ message: "Password updated. You can log in now." });
  }
  return NextResponse.redirect(new URL("/login?reset=updated", request.url), 303);
}

async function requestBody(request: NextRequest) {
  if (request.headers.get("content-type")?.includes("application/json")) return request.json().catch(() => null);
  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}
