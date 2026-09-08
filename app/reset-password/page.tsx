import Link from "next/link";
import { PageShell, Panel } from "@/components/ui";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <PageShell>
      <Panel className="mx-auto max-w-md">
        <h1 className="text-2xl font-black">Choose new password</h1>
        <p className="mt-2 text-sm text-stone-600">Use at least 8 characters.</p>
        <form action="/api/auth/reset-password" method="post" className="mt-6 grid gap-3">
          <input type="hidden" name="token" value={token} />
          <input name="password" type="password" placeholder="New password" required minLength={8} />
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-moss">Update password</button>
        </form>
        <Link className="mt-4 inline-block text-sm font-semibold text-moss" href="/login">Back to login</Link>
      </Panel>
    </PageShell>
  );
}
