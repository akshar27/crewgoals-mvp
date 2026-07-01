import { redirect } from "next/navigation";
import { PageShell, Panel, SubmitButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText, formValues, onboardingSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const goals = ["become runner", "gym consistency", "weekend hiking", "make friends", "explore city"];
const activities = ["running", "gym", "hiking", "outdoor sports", "dining", "exploring"];
const levels = ["beginner", "casual", "intermediate", "advanced"];
const availability = ["weekday morning", "weekday evening", "Saturday morning", "Sunday morning"];
const vibes = ["social/casual", "serious/accountability", "beginner-friendly", "mixed"];

async function saveOnboarding(formData: FormData) {
  "use server";
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(formValues(formData, ["goals", "activities", "availability"]));
  if (!parsed.success) redirect("/onboarding?error=invalid");

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } }),
    prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        ...parsed.data,
        phone: cleanText(parsed.data.phone),
        bio: cleanText(parsed.data.bio)
      },
      create: {
        ...parsed.data,
        userId: user.id,
        phone: cleanText(parsed.data.phone),
        bio: cleanText(parsed.data.bio)
      }
    })
  ]);
  redirect("/dashboard");
}

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const { error } = await searchParams;
  const preference = await prisma.userPreference.findUnique({ where: { userId: user.id } });

  return (
    <PageShell>
      <Panel className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black">Build your matching profile</h1>
        <p className="mt-2 text-sm text-stone-600">Your preferences power recommended groups and help admins keep groups small, local, and useful.</p>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Please complete the required fields.</p> : null}
        <form action={saveOnboarding} className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Name"><input name="name" defaultValue={user.name} required /></Field>
          <Field label="Age range"><select name="ageRange" defaultValue={preference?.ageRange ?? "25-34"}>{["18-24", "25-34", "35-44", "45-54", "55+"].map(option)}</select></Field>
          <Field label="City"><input name="city" defaultValue={preference?.city ?? "San Francisco"} required /></Field>
          <Field label="Neighborhood"><input name="neighborhood" defaultValue={preference?.neighborhood ?? ""} required /></Field>
          <CheckGroup label="Goals" name="goals" options={goals} selected={preference?.goals ?? []} />
          <CheckGroup label="Preferred activities" name="activities" options={activities} selected={preference?.activities ?? []} />
          <Field label="Current level"><select name="currentLevel" defaultValue={preference?.currentLevel ?? "beginner"}>{levels.map(option)}</select></Field>
          <Field label="Target goal"><select name="targetGoal" defaultValue={preference?.targetGoal ?? "complete 5K"}>{["complete 5K", "build habit", "meet people", "lose weight", "stay active"].map(option)}</select></Field>
          <CheckGroup label="Availability" name="availability" options={availability} selected={preference?.availability ?? []} />
          <Field label="Preferred group size"><input name="preferredGroupSize" type="number" min="3" max="20" defaultValue={preference?.preferredGroupSize ?? 8} /></Field>
          <Field label="Vibe"><select name="vibe" defaultValue={preference?.vibe ?? "beginner-friendly"}>{vibes.map(option)}</select></Field>
          <Field label="Comfort preference"><select name="comfortPreference" defaultValue={preference?.comfortPreference ?? "mixed group"}>{["mixed group", "same-gender group", "beginner-only"].map(option)}</select></Field>
          <Field label="Phone optional"><input name="phone" defaultValue={preference?.phone ?? ""} /></Field>
          <Field label="Short bio optional"><textarea name="bio" rows={4} defaultValue={preference?.bio ?? ""} /></Field>
          <div className="md:col-span-2">
            <SubmitButton>Save and see matches</SubmitButton>
          </div>
        </form>
      </Panel>
    </PageShell>
  );
}

function option(value: string) {
  return <option key={value} value={value}>{value}</option>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label>{label}</label>{children}</div>;
}

function CheckGroup({ label, name, options, selected }: { label: string; name: string; options: string[]; selected: string[] }) {
  return (
    <fieldset className="space-y-2 md:col-span-2">
      <legend className="text-sm font-medium text-ink">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((item) => (
          <label key={item} className="flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
            <input className="h-4 w-4" type="checkbox" name={name} value={item} defaultChecked={selected.includes(item)} /> {item}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
