import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, Panel, ButtonLink } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await prisma.inviteLink.findUnique({
    where: { token },
    include: { group: { include: { goal: true, activity: true } }, createdBy: true }
  });
  if (!invite || invite.usedAt || (invite.expiresAt && invite.expiresAt < new Date())) notFound();

  return (
    <PageShell>
      <Panel className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold text-moss">{invite.createdBy.name} invited you</p>
        <h1 className="mt-2 text-3xl font-black">{invite.group.title}</h1>
        <p className="mt-3 text-stone-600">{invite.group.description}</p>
        <p className="mt-3 text-sm text-stone-600">{invite.group.neighborhood}, {invite.group.city} · {invite.group.goal.name} · {invite.group.activity.name}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href={`/groups/${invite.group.id}`}>View group</ButtonLink>
          <Link className="inline-flex items-center justify-center rounded-md bg-mint px-4 py-2 text-sm font-semibold text-moss" href="/signup">Create account</Link>
        </div>
      </Panel>
    </PageShell>
  );
}
