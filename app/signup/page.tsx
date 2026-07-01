import { SignupForm } from "@/components/auth-forms";
import { PageShell, Panel } from "@/components/ui";

export default function SignupPage() {
  return (
    <PageShell>
      <Panel className="mx-auto max-w-md">
        <h1 className="text-2xl font-black">Join a group</h1>
        <p className="mt-2 text-sm text-stone-600">Create your account, then tell us what kind of crew fits you.</p>
        <div className="mt-6">
          <SignupForm />
        </div>
      </Panel>
    </PageShell>
  );
}
