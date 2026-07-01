import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "crewgoals_session";

type SessionPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const token = await createAuthToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function createAuthToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, secretKey());
    return verified.payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifyAuthToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, secretKey());
    return verified.payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getMobileUser(request: NextRequest) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return null;
  const session = await verifyAuthToken(token);
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true }
  });
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export function canAccessAdmin(role: string | null | undefined) {
  return role === "ADMIN";
}
