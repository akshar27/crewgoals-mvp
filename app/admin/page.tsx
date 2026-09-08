import { BarChart3, CalendarDays, MessageSquareText, UsersRound } from "lucide-react";
import { ButtonLink, PageShell, Panel } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const [users, completedProfiles, weeklyUsers, groups, events, requests, approvals, attended, feedback, reports] = await Promise.all([
    prisma.user.count(),
    prisma.userPreference.count(),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.group.count(),
    prisma.event.count(),
    prisma.groupMember.count({ where: { status: "REQUESTED" } }),
    prisma.groupMember.count({ where: { status: { in: ["APPROVED", "JOINED", "ATTENDED"] } } }),
    prisma.groupMember.count({ where: { status: "ATTENDED" } }),
    prisma.feedback.aggregate({ _avg: { rating: true, comfortScore: true, groupMatchScore: true } }),
    prisma.safetyReport.count({ where: { status: "OPEN" } })
  ]);
  const metrics = [
    ["Total users", users, <UsersRound key="u" size={20} />],
    ["Completed profiles", completedProfiles, <UsersRound key="p" size={20} />],
    ["New users this week", weeklyUsers, <UsersRound key="w" size={20} />],
    ["Total groups", groups, <BarChart3 key="g" size={20} />],
    ["Total events", events, <CalendarDays key="e" size={20} />],
    ["Join requests", requests, <UsersRound key="r" size={20} />],
    ["Approved members", approvals, <UsersRound key="ap" size={20} />],
    ["Attendance count", attended, <CalendarDays key="a" size={20} />],
    ["Feedback rating", feedback._avg.rating?.toFixed(1) ?? "n/a", <MessageSquareText key="f" size={20} />],
    ["Comfort score", feedback._avg.comfortScore?.toFixed(1) ?? "n/a", <MessageSquareText key="c" size={20} />],
    ["Match score", feedback._avg.groupMatchScore?.toFixed(1) ?? "n/a", <MessageSquareText key="m" size={20} />],
    ["Open reports", reports, <MessageSquareText key="s" size={20} />]
  ];
  return (
    <PageShell>
      <h1 className="text-3xl font-black">Admin dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, value, icon]) => (
          <Panel key={String(label)}>
            <div className="text-moss">{icon}</div>
            <p className="mt-3 text-sm text-stone-600">{label}</p>
            <p className="text-3xl font-black">{value}</p>
          </Panel>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/admin/users">Users</ButtonLink>
        <ButtonLink href="/admin/groups">Groups</ButtonLink>
        <ButtonLink href="/admin/events">Events</ButtonLink>
        <ButtonLink href="/admin/reports">Reports</ButtonLink>
        <ButtonLink href="/admin/feedback">Feedback</ButtonLink>
      </div>
    </PageShell>
  );
}
