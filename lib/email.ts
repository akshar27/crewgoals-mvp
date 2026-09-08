import { prisma } from "@/lib/prisma";

type SendEmailInput = {
  userId?: string;
  to: string;
  subject: string;
  body: string;
};

export async function sendEmail(input: SendEmailInput) {
  const log = await prisma.emailLog.create({
    data: {
      userId: input.userId,
      to: input.to,
      subject: input.subject,
      body: input.body,
      status: "QUEUED"
    }
  });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "CrewGoals <onboarding@resend.dev>";
  if (!apiKey) {
    console.log("Email queued", { to: input.to, subject: input.subject, body: input.body });
    return log;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        text: input.body
      })
    });

    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: response.ok ? "SENT" : `FAILED_${response.status}` }
    });
  } catch (error) {
    console.error("Email send failed", error);
    await prisma.emailLog.update({ where: { id: log.id }, data: { status: "FAILED" } });
  }

  return log;
}
