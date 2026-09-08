import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, PageShell, Panel, SubmitButton } from "@/components/ui";
import { ShareButton } from "@/components/share-button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const group = await prisma.group.findUnique({
    where: { id },
    include: { goal: true },
  });
  if (!group) return { title: "Group not found" };

  const description = `${group.description} · ${group.neighborhood}, ${group.city} · ${group.goal.name} · ${group.level}`;
  return {
    title: group.title,
    description,
    alternates: { canonical: siteUrl(`/groups/${group.id}`) },
    openGraph: { title: group.title, description, url: siteUrl(`/groups/${group.id}`) },
  };
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      goal: true,
      activity: true,
      events: { orderBy: { startTime: "asc" } },
      _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } } } },
      members: user ? { where: { userId: user.id } } : false
    }
  });
  if (!group) notFound();
  const membership = user ? group.members[0] : null;

  return (
    <PageShell>
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{group.title}</h1>
            <p className="mt-1 text-sm text-stone-500">{group.neighborhood}, {group.city}</p>
            <p className="mt-2 text-stone-600">{group.description}</p>
          </div>
          <Badge>{group.status.toLowerCase()}</Badge>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {[group.goal.name, group.activity.name, group.level, group.vibe, group.schedule, `${group._count.members}/${group.maxMembers} members`].map((item) => <Badge key={item}>{item}</Badge>)}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {user ? (
            membership ? <p className="font-semibold text-moss">Your status: {membership.status.toLowerCase()}</p> : (
              <form action={`/api/groups/${group.id}/join`} method="post">
                <SubmitButton>Request to join</SubmitButton>
              </form>
            )
          ) : <Link className="font-semibold text-moss" href="/signup">Create an account to join</Link>}
          <ShareButton
            url={siteUrl(`/groups/${group.id}`)}
            title={`${group.title} — CrewGoals`}
            text={`${group.title}, a ${group.goal.name} crew in ${group.neighborhood}. Join me on CrewGoals.`}
            label="Share group"
          />
        </div>
      </Panel>
      <section className="mt-8">
        <h2 className="text-xl font-bold">Events</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {group.events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft hover:bg-mint">
              <h3 className="font-bold">{event.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{event.locationName} · {event.startTime.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
