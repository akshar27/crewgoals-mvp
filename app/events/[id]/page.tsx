import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ButtonLink, PageShell, Panel } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const event = await prisma.event.findUnique({
    where: { id },
    include: { group: { include: { members: user ? { where: { userId: user.id } } : false } } }
  });
  if (!event) notFound();
  const membership = user ? event.group.members[0] : null;
  const eligible = membership?.status === "ATTENDED" && event.status === "COMPLETED";

  return (
    <PageShell>
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{event.title}</h1>
            <p className="mt-2 text-stone-600">{event.description}</p>
          </div>
          <Badge>{event.status.toLowerCase()}</Badge>
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <Detail label="Group" value={event.group.title} />
          <Detail label="Host" value={event.hostName} />
          <Detail label="Location" value={`${event.locationName}, ${event.address}`} />
          <Detail label="Time" value={`${event.startTime.toLocaleString()} - ${event.endTime.toLocaleString()}`} />
        </dl>
        <div className="mt-6">
          {eligible ? <ButtonLink href={`/feedback/${event.id}`}>Submit feedback</ButtonLink> : <Link className="font-semibold text-moss" href={`/groups/${event.groupId}`}>View group</Link>}
        </div>
      </Panel>
    </PageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-semibold">{label}</dt><dd className="text-stone-600">{value}</dd></div>;
}
