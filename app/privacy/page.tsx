import { PageShell, Panel } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <PageShell>
      <Panel>
        <h1 className="text-3xl font-black">Privacy Policy</h1>
        <div className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
          <p>CrewGoals collects account, profile, group, event, attendance, feedback, notification, and safety report information to operate the app and improve matching.</p>
          <p>We use contact details to authenticate accounts, send app updates, password resets, reminders, and important safety messages.</p>
          <p>We do not sell personal information. Access is limited to app operations, support, safety, analytics, and legal requirements.</p>
          <p>Users can request account support or deletion by contacting the CrewGoals admin team.</p>
        </div>
      </Panel>
    </PageShell>
  );
}
