import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Badge, PageShell, Panel, SubmitButton } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { notifyUser } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function updateAttendance(formData: FormData) {
  "use server";
  await requireAdmin();
  const eventId = String(formData.get("eventId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!eventId || !userId || !["ATTENDED", "NO_SHOW"].includes(status)) redirect("/admin/events?error=invalid");

  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { group: true } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!event || !user) redirect("/admin/events?error=invalid");

  await prisma.$transaction([
    prisma.eventAttendance.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, status: status as "ATTENDED" | "NO_SHOW" },
      update: { status: status as "ATTENDED" | "NO_SHOW" }
    }),
    prisma.groupMember.updateMany({
      where: { userId, groupId: event.groupId },
      data: { status: status as "ATTENDED" | "NO_SHOW" }
    })
  ]);

  if (status === "ATTENDED") {
    await notifyUser({
      userId,
      type: "ATTENDANCE_MARKED",
      title: "Attendance marked",
      body: `You were marked attended for ${event.title}.`,
      data: { eventId, groupId: event.groupId }
    });
    await sendEmail({
      userId,
      to: user.email,
      subject: "Your CrewGoals attendance was marked",
      body: `You were marked attended for ${event.title}. If the event is completed, open CrewGoals to submit feedback.`
    });
  }

  revalidatePath(`/admin/events/${eventId}/attendance`);
}

export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      group: {
        include: {
          members: {
            where: { status: { in: ["APPROVED", "JOINED", "ATTENDED", "NO_SHOW"] } },
            include: { user: { include: { attendance: { where: { eventId: id } } } } },
            orderBy: { user: { name: "asc" } }
          }
        }
      }
    }
  });
  if (!event) redirect("/admin/events");

  return (
    <PageShell>
      <h1 className="text-3xl font-black">Attendance</h1>
      <p className="mt-2 text-stone-600">{event.title} · {event.group.title}</p>
      <div className="mt-6 space-y-3">
        {event.group.members.map((membership) => {
          const current = membership.user.attendance[0]?.status ?? membership.status;
          return (
            <Panel key={membership.id}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="mr-auto">
                  <h2 className="font-bold">{membership.user.name}</h2>
                  <p className="text-sm text-stone-600">{membership.user.email}</p>
                </div>
                <Badge>{current.toLowerCase()}</Badge>
                <form action={updateAttendance} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="userId" value={membership.userId} />
                  <select name="status" defaultValue={current === "NO_SHOW" ? "NO_SHOW" : "ATTENDED"}>
                    <option>ATTENDED</option>
                    <option>NO_SHOW</option>
                  </select>
                  <SubmitButton>Save</SubmitButton>
                </form>
              </div>
            </Panel>
          );
        })}
      </div>
    </PageShell>
  );
}
