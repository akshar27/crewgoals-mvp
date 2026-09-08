import { LoginForm } from "@/components/auth-forms";
import { PageShell, Panel } from "@/components/ui";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { reset } = await searchParams;
  return (
    <PageShell>
      <Panel className="mx-auto max-w-md">
        <h1 className="text-2xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-stone-600">Log in to manage your groups, events, and feedback.</p>
        {reset === "sent" ? <p className="mt-4 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-moss">If that email exists, a reset link has been sent.</p> : null}
        {reset === "updated" ? <p className="mt-4 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-moss">Password updated. You can log in now.</p> : null}
        <div className="mt-6">
          <LoginForm />
        </div>
      </Panel>
    </PageShell>
  );
}
