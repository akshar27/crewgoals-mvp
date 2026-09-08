import { CalendarCheck, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import { ButtonLink, PageShell, Panel } from "@/components/ui";
import { ShareButton } from "@/components/share-button";
import { SITE_DESCRIPTION, siteUrl } from "@/lib/site";

export default function HomePage() {
  return (
    <PageShell>
      <section className="grid items-center gap-10 py-8 md:grid-cols-[1.05fr_0.95fr] md:py-16">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-clay">Beginner Run Crew in San Francisco</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight text-ink sm:text-6xl">
            Find your crew. Build your goal.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
            Join small local groups for running, gym, hiking, and outdoor activities matched by your goal, level, location, schedule, and vibe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/signup">Join a group</ButtonLink>
            <ButtonLink href="/groups">Browse groups</ButtonLink>
            <ShareButton url={siteUrl("/")} title="CrewGoals" text={SITE_DESCRIPTION} label="Tell a friend" />
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="rounded-md bg-mint p-5">
            <p className="font-bold text-moss">Saturday, 9:00 AM</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Beginner 5K Run Crew</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">
              A small group for new runners building consistency without turning fitness into a second job.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat icon={<UsersRound size={18} />} label="Small groups" value="6-10 people" />
            <Stat icon={<MapPin size={18} />} label="Local" value="SF neighborhoods" />
            <Stat icon={<CalendarCheck size={18} />} label="Recurring" value="Simple schedule" />
            <Stat icon={<ShieldCheck size={18} />} label="Vibe-matched" value="Beginner-friendly" />
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {["Tell us your goal and schedule.", "See groups that actually fit.", "Join, attend, and give feedback."].map((item) => (
          <Panel key={item}>
            <p className="text-lg font-bold">{item}</p>
          </Panel>
        ))}
      </section>
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-stone-200 p-3">
      <div className="text-moss">{icon}</div>
      <p className="mt-2 font-bold">{label}</p>
      <p className="text-stone-600">{value}</p>
    </div>
  );
}
