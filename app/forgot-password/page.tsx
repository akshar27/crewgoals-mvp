import Link from "next/link";
import { PageShell, Panel } from "@/components/ui";

export default function ForgotPasswordPage() {
  return (
    <PageShell>
      <Panel className="mx-auto max-w-md">
        <h1 className="text-2xl font-black">Reset password</h1>
        <p className="mt-2 text-sm text-stone-600">Enter your email and we will send a reset link if the account exists.</p>
        <form action="/api/auth/forgot-password" method="post" className="mt-6 grid gap-3">
          <input name="email" type="email" placeholder="Email" required />
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-moss">Send reset link</button>
        </form>
        <Link className="mt-4 inline-block text-sm font-semibold text-moss" href="/login">Back to login</Link>
      </Panel>
    </PageShell>
  );
}
