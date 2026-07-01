import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { GroupCard } from "@/components/group-card";
import { Badge, ButtonLink, PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recommendGroups } from "@/services/matching";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [preference, groups, memberships, events] = await Promise.all([
    prisma.userPreference.findUnique({ where: { userId: user.id } }),
    prisma.group.findMany({ include: { goal: true, activity: true, _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } } } }),
    prisma.groupMember.findMany({ where: { userId: user.id }, include: { group: { include: { goal: true, activity: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.event.findMany({
      where: { group: { members: { some: { userId: user.id, status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } },
      include: { group: true },
      orderBy: { startTime: "asc" },
      take: 6
    })
  ]);
  const recommendations = recommendGroups(preference, groups.map((group) => ({ ...group, memberCount: group._count.members }))).slice(0, 4);

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Your crew dashboard</h1>
          <p className="mt-2 text-stone-600">Matches, joined groups, and upcoming events in one place.</p>
        </div>
        <ButtonLink href="/onboarding">{preference ? "Edit preferences" : "Complete onboarding"}</ButtonLink>
      </div>
      <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel>
          <h2 className="text-xl font-bold">Profile preferences</h2>
          {preference ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {[preference.city, preference.neighborhood, preference.currentLevel, preference.vibe, ...preference.goals, ...preference.activities].map((item) => <Badge key={item}>{item}</Badge>)}
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone-600">Finish onboarding to unlock better group recommendations.</p>
          )}
        </Panel>
        <Panel>
          <h2 className="text-xl font-bold">Upcoming events</h2>
          <div className="mt-4 space-y-3">
            {events.length ? events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="flex items-center justify-between rounded-md border border-stone-200 p-3 hover:bg-mint">
                <span><strong>{event.title}</strong><br /><span className="text-sm text-stone-600">{event.group.title}</span></span>
                <span className="flex items-center gap-1 text-sm"><CalendarDays size={15} /> {event.startTime.toLocaleDateString()}</span>
              </Link>
            )) : <p className="text-sm text-stone-600">Join a group to see upcoming events.</p>}
          </div>
        </Panel>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-bold">Recommended groups</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {recommendations.map((group) => <GroupCard key={group.id} group={group} />)}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-bold">Joined and requested groups</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {memberships.length ? memberships.map((membership) => (
            <Panel key={membership.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{membership.group.title}</h3>
                  <p className="text-sm text-stone-600">{membership.group.neighborhood} · {membership.group.schedule}</p>
                </div>
                <Badge>{membership.status.toLowerCase()}</Badge>
              </div>
            </Panel>
          )) : <p className="text-sm text-stone-600">No memberships yet.</p>}
        </div>
      </section>
    </PageShell>
  );
}
