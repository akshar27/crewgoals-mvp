import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`forgot-password:${request.headers.get("x-forwarded-for") ?? "local"}`);
  if (!limited.ok) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429 });

  const parsed = forgotPasswordSchema.safeParse(await requestBody(request));
  if (parsed.success) await requestPasswordReset(parsed.data.email);

  if (request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  }
  return NextResponse.redirect(new URL("/login?reset=sent", request.url), 303);
}

async function requestBody(request: NextRequest) {
  if (request.headers.get("content-type")?.includes("application/json")) return request.json().catch(() => null);
  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}
