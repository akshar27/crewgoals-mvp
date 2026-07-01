import { PageShell, Panel, Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const feedback = await prisma.feedback.findMany({
    include: { user: true, event: { include: { group: true } } },
    orderBy: { createdAt: "desc" }
  });
  return (
    <PageShell>
      <h1 className="text-3xl font-black">Feedback</h1>
      <div className="mt-6 space-y-4">
        {feedback.length ? feedback.map((item) => (
          <Panel key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{item.event.title}</h2>
                <p className="text-sm text-stone-600">{item.user.name} · {item.event.group.title}</p>
              </div>
              <Badge>{item.rating}/5 overall</Badge>
            </div>
            <p className="mt-3 text-sm text-stone-700">{item.comment || "No comment"}</p>
            <p className="mt-3 text-xs text-stone-600">Comfort {item.comfortScore}/5 · Match {item.groupMatchScore}/5 · Attend again {item.wouldAttendAgain ? "yes" : "no"} · Invite friend {item.wouldInviteFriend ? "yes" : "no"}</p>
          </Panel>
        )) : <p className="text-sm text-stone-600">No feedback yet.</p>}
      </div>
    </PageShell>
  );
}
