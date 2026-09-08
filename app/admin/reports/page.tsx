import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Badge, PageShell, Panel, SubmitButton } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statuses = ["OPEN", "REVIEWED", "RESOLVED"] as const;

async function updateReport(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !statuses.includes(status as (typeof statuses)[number])) redirect("/admin/reports?error=invalid");
  await prisma.safetyReport.update({ where: { id }, data: { status: status as (typeof statuses)[number] } });
  revalidatePath("/admin/reports");
}

export default async function AdminReportsPage() {
  await requireAdmin();
  const reports = await prisma.safetyReport.findMany({
    include: {
      reporter: { select: { name: true, email: true } },
      reportedUser: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <PageShell>
      <h1 className="text-3xl font-black">Safety reports</h1>
      <div className="mt-6 space-y-4">
        {reports.map((report) => (
          <Panel key={report.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{report.reason}</h2>
                <p className="text-sm text-stone-600">From {report.reporter.name} ({report.reporter.email})</p>
                {report.reportedUser ? <p className="text-sm text-stone-600">About {report.reportedUser.name} ({report.reportedUser.email})</p> : null}
                {report.details ? <p className="mt-3 text-sm text-stone-700">{report.details}</p> : null}
              </div>
              <Badge>{report.status.toLowerCase()}</Badge>
            </div>
            <form action={updateReport} className="mt-4 flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={report.id} />
              <select name="status" defaultValue={report.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
              <SubmitButton>Update</SubmitButton>
            </form>
          </Panel>
        ))}
        {reports.length === 0 ? <p className="text-sm text-stone-600">No reports yet.</p> : null}
      </div>
    </PageShell>
  );
}
