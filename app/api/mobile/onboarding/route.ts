import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText, onboardingSchema } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = onboardingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".") || "profile"}: ${issue.message}`);
    return NextResponse.json({ error: details.join("\n") || "Please complete the required fields.", details }, { status: 400 });
  }

  const { name, ...preferenceInput } = parsed.data;
  const preferenceData = {
    ...preferenceInput,
    phone: cleanText(preferenceInput.phone),
    bio: cleanText(preferenceInput.bio)
  };

  const [updatedUser, preference] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name }, select: { id: true, email: true, name: true, role: true } }),
    prisma.userPreference.upsert({
      where: { userId: user.id },
      update: preferenceData,
      create: { ...preferenceData, userId: user.id }
    })
  ]);

  return NextResponse.json({ user: updatedUser, preference });
}
