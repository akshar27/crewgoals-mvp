import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PageShell, Panel, SubmitButton, Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText, eventSchema, formValues } from "@/lib/validation";

export const dynamic = "force-dynamic";

type EventFormValue = {
  id: string;
  groupId: string;
  title: string;
  locationName: string;
  address: string;
  startTime: Date;
  endTime: Date;
  description: string;
  hostName: string;
  status: string;
};

async function saveEvent(formData: FormData) {
  "use server";
  await requireAdmin();
  const parsed = eventSchema.safeParse(formValues(formData));
  if (!parsed.success || parsed.data.endTime <= parsed.data.startTime) redirect("/admin/events?error=invalid");
  const id = String(formData.get("id") ?? "");
  const data = { ...parsed.data, description: cleanText(parsed.data.description) };
  if (id) await prisma.event.update({ where: { id }, data });
  else await prisma.event.create({ data });
  revalidatePath("/admin/events");
}

async function deleteEvent(formData: FormData) {
  "use server";
  await requireAdmin();
  await prisma.event.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/events");
}

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const [events, groups] = await Promise.all([
    prisma.event.findMany({ include: { group: true }, orderBy: { startTime: "desc" } }),
    prisma.group.findMany({ orderBy: { title: "asc" } })
  ]);
  return (
    <PageShell>
      <h1 className="text-3xl font-black">Manage events</h1>
      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Event details were invalid.</p> : null}
      <Panel className="mt-6">
        <h2 className="text-xl font-bold">Create event</h2>
        <EventForm groups={groups} />
      </Panel>
      <section className="mt-8 space-y-4">
        {events.map((event) => (
          <Panel key={event.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-lg font-bold">{event.title}</h2><p className="text-sm text-stone-600">{event.group.title} · {event.startTime.toLocaleString()}</p></div>
              <Badge>{event.status.toLowerCase()}</Badge>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-moss">Edit event</summary>
              <EventForm event={event} groups={groups} />
            </details>
            <form action={deleteEvent} className="mt-3"><input type="hidden" name="id" value={event.id} /><button className="text-sm font-semibold text-red-700">Delete event</button></form>
          </Panel>
        ))}
      </section>
    </PageShell>
  );
}

function toLocalValue(date?: Date) {
  if (!date) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function EventForm({ event, groups }: { event?: EventFormValue; groups: { id: string; title: string }[] }) {
  return (
    <form action={saveEvent} className="mt-4 grid gap-3 md:grid-cols-2">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <select name="groupId" defaultValue={event?.groupId ?? groups[0]?.id}>{groups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select>
      <input name="title" placeholder="Title" defaultValue={event?.title ?? ""} />
      <input name="locationName" placeholder="Location name" defaultValue={event?.locationName ?? ""} />
      <input name="address" placeholder="Address" defaultValue={event?.address ?? ""} />
      <input name="startTime" type="datetime-local" defaultValue={toLocalValue(event?.startTime)} />
      <input name="endTime" type="datetime-local" defaultValue={toLocalValue(event?.endTime)} />
      <input name="hostName" placeholder="Host name" defaultValue={event?.hostName ?? ""} />
      <select name="status" defaultValue={event?.status ?? "UPCOMING"}>{["UPCOMING", "COMPLETED", "CANCELLED"].map((x) => <option key={x}>{x}</option>)}</select>
      <textarea className="md:col-span-2" name="description" rows={3} placeholder="Description" defaultValue={event?.description ?? ""} />
      <div className="md:col-span-2"><SubmitButton>{event ? "Save event" : "Create event"}</SubmitButton></div>
    </form>
  );
}
