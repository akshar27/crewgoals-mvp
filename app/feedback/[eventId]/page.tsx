import { redirect } from "next/navigation";
import { PageShell, Panel, SubmitButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canSubmitFeedback } from "@/services/feedback-rules";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: { params: Promise<{ eventId: string }> }) {
  const user = await requireUser();
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { group: true } });
  if (!event) redirect("/dashboard");
  const membership = await prisma.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId: event.groupId } } });
  if (!canSubmitFeedback(membership, event)) redirect(`/events/${event.id}`);
  const existing = await prisma.feedback.findUnique({ where: { userId_eventId: { userId: user.id, eventId } } });

  return (
    <PageShell>
      <Panel className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-black">Feedback for {event.title}</h1>
        <p className="mt-2 text-sm text-stone-600">Your response helps admins improve group fit and comfort.</p>
        {existing ? <p className="mt-4 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-moss">You already submitted feedback for this event.</p> : (
          <form action={`/api/feedback/${event.id}`} method="post" className="mt-6 grid gap-4">
            <Score name="rating" label="Overall rating" />
            <Score name="comfortScore" label="Comfort score" />
            <Score name="groupMatchScore" label="Group match score" />
            <Field label="Would attend again"><select name="wouldAttendAgain"><option value="true">yes</option><option value="false">no</option></select></Field>
            <Field label="Would invite a friend"><select name="wouldInviteFriend"><option value="true">yes</option><option value="false">no</option></select></Field>
            <Field label="Comment"><textarea name="comment" rows={4} /></Field>
            <SubmitButton>Submit feedback</SubmitButton>
          </form>
        )}
      </Panel>
    </PageShell>
  );
}

function Score({ name, label }: { name: string; label: string }) {
  return <Field label={label}><input name={name} type="number" min="1" max="5" defaultValue="5" /></Field>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label>{label}</label>{children}</div>;
}
