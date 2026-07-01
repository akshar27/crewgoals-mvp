import { LoginForm } from "@/components/auth-forms";
import { PageShell, Panel } from "@/components/ui";

export default function LoginPage() {
  return (
    <PageShell>
      <Panel className="mx-auto max-w-md">
        <h1 className="text-2xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-stone-600">Log in to manage your groups, events, and feedback.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </Panel>
    </PageShell>
  );
}
