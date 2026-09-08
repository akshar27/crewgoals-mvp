import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { isSingleUseTokenUsable } from "@/services/tokens";

const RESET_TTL_MS = 1000 * 60 * 60;

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt }
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password?token=${token}`;
  await sendEmail({
    userId: user.id,
    to: user.email,
    subject: "Reset your CrewGoals password",
    body: `Open this link within 1 hour to reset your password: ${resetUrl}`
  });
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || !isSingleUseTokenUsable(record)) return false;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(password, 12) }
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() }
    })
  ]);

  return true;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
