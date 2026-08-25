import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PageShell, Panel, SubmitButton, Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const memberStatuses = ["REQUESTED", "APPROVED", "JOINED", "ATTENDED", "NO_SHOW", "REJECTED"] as const;
type MemberStatus = (typeof memberStatuses)[number];

function isMemberStatus(value: string): value is MemberStatus {
  return memberStatuses.includes(value as MemberStatus);
}

async function updateStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const membershipId = String(formData.get("membershipId") ?? "");
  const nextStatus = String(formData.get("status") ?? "");
  if (!membershipId || !isMemberStatus(nextStatus)) {
    redirect("/admin/users?error=invalid-status");
  }

  const membership = await prisma.groupMember.update({
    where: { id: membershipId },
    data: { status: nextStatus },
    include: { group: true, user: true }
  });

  if (nextStatus === "APPROVED") {
    await notifyUser({
      userId: membership.userId,
      type: "GROUP_APPROVED",
      title: "Group request approved",
      body: `You're approved for ${membership.group.title}.`,
      data: { groupId: membership.groupId }
    });
  }

  if (nextStatus === "ATTENDED") {
    await notifyUser({
      userId: membership.userId,
      type: "ATTENDANCE_MARKED",
      title: "Attendance marked",
      body: `You were marked attended for ${membership.group.title}. Feedback may be available after the event is completed.`,
      data: { groupId: membership.groupId }
    });
  }

  revalidatePath("/admin/users");
  redirect(`/admin/users?updated=${nextStatus.toLowerCase()}`);
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  await requireAdmin();
  const { updated, error } = await searchParams;
  const users = await prisma.user.findMany({
    include: { preference: true, memberships: { include: { group: true }, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" }
  });
  const pendingCount = users.reduce((count, user) => count + user.memberships.filter((membership) => membership.status === "REQUESTED").length, 0);

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Users and join requests</h1>
          <p className="mt-2 text-sm text-stone-600">{pendingCount} request{pendingCount === 1 ? "" : "s"} waiting for review.</p>
        </div>
        <Badge>{users.length} users</Badge>
      </div>
      {updated ? <p className="mt-4 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-moss">Membership status updated to {updated}.</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">Could not update that request. Please try again.</p> : null}
      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <Panel key={user.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{user.name}</h2>
                <p className="text-sm text-stone-600">{user.email} · {user.role}</p>
                {user.preference ? <p className="mt-2 text-sm text-stone-600">{user.preference.neighborhood}, {user.preference.city} · {user.preference.currentLevel} · {user.preference.vibe}</p> : null}
              </div>
              <Badge>{user.memberships.length} groups</Badge>
            </div>
            <div className="mt-4 grid gap-2">
              {user.memberships.map((membership) => (
                <div key={membership.id} className="rounded-md bg-stone-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-auto text-sm font-semibold">{membership.group.title}</span>
                    <Badge>{membership.status.toLowerCase()}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {membership.status === "REQUESTED" ? (
                      <>
                        <QuickStatusButton membershipId={membership.id} status="APPROVED">Approve</QuickStatusButton>
                        <QuickStatusButton membershipId={membership.id} status="REJECTED">Reject</QuickStatusButton>
                      </>
                    ) : null}
                    <form action={updateStatus} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="membershipId" value={membership.id} />
                      <select className="max-w-44" name="status" defaultValue={membership.status}>
                        {memberStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                      <SubmitButton>Update</SubmitButton>
                    </form>
                  </div>
                </div>
              ))}
              {user.memberships.length === 0 ? <p className="text-sm text-stone-600">No group requests yet.</p> : null}
            </div>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}

function QuickStatusButton({ membershipId, status, children }: { membershipId: string; status: MemberStatus; children: React.ReactNode }) {
  return (
    <form action={updateStatus}>
      <input type="hidden" name="membershipId" value={membershipId} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-moss">{children}</button>
    </form>
  );
}
