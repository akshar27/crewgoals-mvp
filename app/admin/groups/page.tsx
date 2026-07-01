import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PageShell, Panel, SubmitButton, Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText, formValues, groupSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type GroupFormValue = {
  id: string;
  title: string;
  goalId: string;
  activityId: string;
  city: string;
  neighborhood: string;
  level: string;
  ageRange: string;
  vibe: string;
  maxMembers: number;
  schedule: string;
  description: string;
  status: string;
};

async function saveGoal(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = cleanText(String(formData.get("name") ?? ""));
  if (name.length < 2) return;
  if (id) await prisma.goal.update({ where: { id }, data: { name } });
  else await prisma.goal.create({ data: { name } });
  revalidatePath("/admin/groups");
}

async function deleteGoal(formData: FormData) {
  "use server";
  await requireAdmin();
  await prisma.goal.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/groups");
}

async function saveActivity(formData: FormData) {
  "use server";
  await requireAdmin();
  const name = cleanText(String(formData.get("name") ?? ""));
  if (name.length >= 2) await prisma.activity.upsert({ where: { name }, update: {}, create: { name } });
  revalidatePath("/admin/groups");
}

async function saveGroup(formData: FormData) {
  "use server";
  await requireAdmin();
  const parsed = groupSchema.safeParse(formValues(formData));
  if (!parsed.success) redirect("/admin/groups?error=invalid");
  const id = String(formData.get("id") ?? "");
  const data = { ...parsed.data, description: cleanText(parsed.data.description) };
  if (id) await prisma.group.update({ where: { id }, data });
  else await prisma.group.create({ data });
  revalidatePath("/admin/groups");
}

async function deleteGroup(formData: FormData) {
  "use server";
  await requireAdmin();
  await prisma.group.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/groups");
}

export default async function AdminGroupsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const [groups, goals, activities] = await Promise.all([
    prisma.group.findMany({ include: { goal: true, activity: true, _count: { select: { members: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.goal.findMany({ orderBy: { name: "asc" } }),
    prisma.activity.findMany({ orderBy: { name: "asc" } })
  ]);
  return (
    <PageShell>
      <h1 className="text-3xl font-black">Manage groups</h1>
      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Group details were invalid.</p> : null}
      <section className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <h2 className="text-xl font-bold">Goals</h2>
          <form action={saveGoal} className="mt-4 flex gap-2"><input name="name" placeholder="new goal" /><SubmitButton>Add</SubmitButton></form>
          <div className="mt-4 space-y-2">
            {goals.map((goal) => (
              <div key={goal.id} className="flex gap-2">
                <form action={saveGoal} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={goal.id} />
                  <input name="name" defaultValue={goal.name} />
                  <SubmitButton>Rename</SubmitButton>
                </form>
                <form action={deleteGoal}>
                  <input type="hidden" name="id" value={goal.id} />
                  <button className="rounded-md px-3 py-2 text-sm font-semibold text-red-700">Delete</button>
                </form>
              </div>
            ))}
          </div>
          <h2 className="mt-6 text-xl font-bold">Activities</h2>
          <form action={saveActivity} className="mt-4 flex gap-2"><input name="name" placeholder="new activity" /><SubmitButton>Add</SubmitButton></form>
        </Panel>
        <Panel>
          <h2 className="text-xl font-bold">Create group</h2>
          <GroupForm goals={goals} activities={activities} />
        </Panel>
      </section>
      <section className="mt-8 space-y-4">
        {groups.map((group) => (
          <Panel key={group.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-lg font-bold">{group.title}</h2><p className="text-sm text-stone-600">{group.neighborhood} · {group.goal.name} · {group.activity.name}</p></div>
              <Badge>{group._count.members}/{group.maxMembers}</Badge>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-moss">Edit group</summary>
              <GroupForm group={group} goals={goals} activities={activities} />
            </details>
            <form action={deleteGroup} className="mt-3"><input type="hidden" name="id" value={group.id} /><button className="text-sm font-semibold text-red-700">Delete group</button></form>
          </Panel>
        ))}
      </section>
    </PageShell>
  );
}

function GroupForm({ group, goals, activities }: { group?: GroupFormValue; goals: { id: string; name: string }[]; activities: { id: string; name: string }[] }) {
  return (
    <form action={saveGroup} className="mt-4 grid gap-3 md:grid-cols-2">
      {group ? <input type="hidden" name="id" value={group.id} /> : null}
      <input name="title" placeholder="Title" defaultValue={group?.title ?? ""} />
      <select name="goalId" defaultValue={group?.goalId ?? goals[0]?.id}>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.name}</option>)}</select>
      <select name="activityId" defaultValue={group?.activityId ?? activities[0]?.id}>{activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.name}</option>)}</select>
      <input name="city" placeholder="City" defaultValue={group?.city ?? "San Francisco"} />
      <input name="neighborhood" placeholder="Neighborhood" defaultValue={group?.neighborhood ?? ""} />
      <select name="level" defaultValue={group?.level ?? "beginner"}>{["beginner", "casual", "intermediate", "advanced"].map((x) => <option key={x}>{x}</option>)}</select>
      <input name="ageRange" placeholder="Age range" defaultValue={group?.ageRange ?? "25-44"} />
      <select name="vibe" defaultValue={group?.vibe ?? "beginner-friendly"}>{["social/casual", "serious/accountability", "beginner-friendly", "mixed"].map((x) => <option key={x}>{x}</option>)}</select>
      <input name="maxMembers" type="number" min="3" max="50" defaultValue={group?.maxMembers ?? 10} />
      <input name="schedule" placeholder="Schedule" defaultValue={group?.schedule ?? "Saturday morning"} />
      <select name="status" defaultValue={group?.status ?? "OPEN"}>{["OPEN", "FULL", "CLOSED", "COMPLETED"].map((x) => <option key={x}>{x}</option>)}</select>
      <textarea className="md:col-span-2" name="description" rows={3} placeholder="Description" defaultValue={group?.description ?? ""} />
      <div className="md:col-span-2"><SubmitButton>{group ? "Save group" : "Create group"}</SubmitButton></div>
    </form>
  );
}
