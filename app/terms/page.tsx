import { PageShell, Panel } from "@/components/ui";

export default function TermsPage() {
  return (
    <PageShell>
      <Panel>
        <h1 className="text-3xl font-black">Terms of Use</h1>
        <div className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
          <p>CrewGoals helps people discover and join small goal-based groups. Users are responsible for their own conduct and for choosing safe public meeting locations.</p>
          <p>Do not harass, threaten, impersonate, spam, or use the app for unsafe activity. We may remove content, block access, or review reports when safety concerns are raised.</p>
          <p>Events and groups may change or be cancelled. CrewGoals is provided as an MVP for testing and feedback.</p>
        </div>
      </Panel>
    </PageShell>
  );
}
