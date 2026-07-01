import { GroupCard } from "@/components/group-card";
import { PageShell } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await prisma.group.findMany({
    include: { goal: true, activity: true, _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } } },
    orderBy: { createdAt: "desc" }
  });
  return (
    <PageShell>
      <h1 className="text-3xl font-black">Local groups</h1>
      <p className="mt-2 text-stone-600">Small recurring crews for goals, accountability, and local connection.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {groups.map((group) => <GroupCard key={group.id} group={group} />)}
      </div>
    </PageShell>
  );
}
