import { useEffect, useState } from "react";
import { Alert, Text } from "react-native";
import type { Preference } from "../../src/api";
import {
  ChoiceGroup,
  Input,
  NumberChoice,
  PrimaryButton,
  ScreenScroll,
  SecondaryButton,
  SingleChoice,
  Splash,
} from "../../src/components/ui";
import { useAuth } from "../../src/hooks/useAuth";
import { useSaveProfile } from "../../src/hooks/mutations";
import { useProfile } from "../../src/hooks/queries";
import {
  AGE_RANGES,
  ACTIVITIES,
  AVAILABILITY,
  COMFORT_PREFERENCES,
  GOALS,
  GROUP_SIZES,
  LEVELS,
  TARGET_GOALS,
  VIBES,
  defaultPreference,
  normalizePreference,
  validateProfile,
} from "../../src/preference";
import { styles } from "../../src/theme";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data, isLoading } = useProfile();
  const save = useSaveProfile();
  const [form, setForm] = useState<Preference>(defaultPreference(user?.name ?? ""));

  useEffect(() => {
    if (data) setForm(normalizePreference({ ...(data.preference ?? {}), name: data.user.name }));
  }, [data]);

  function patch(next: Partial<Preference>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function submit() {
    const normalized = normalizePreference({ ...form, name: form.name || user?.name });
    const missing = validateProfile(normalized);
    if (missing.length) {
      Alert.alert("Complete required fields", missing.join("\n"));
      return;
    }
    save.mutate(normalized, {
      onSuccess: () => Alert.alert("Saved", "Your matching profile is updated."),
      onError: (error) => Alert.alert("Unable to save", error instanceof Error ? error.message : "Try again."),
    });
  }

  if (isLoading) return <Splash />;

  return (
    <ScreenScroll>
      <Text style={styles.title}>Matching profile</Text>
      <Text style={styles.requiredNote}>Fields marked * are required.</Text>

      <Input label="Name" required value={form.name ?? ""} onChangeText={(v) => patch({ name: v })} />
      <SingleChoice label="Age range" required options={AGE_RANGES} value={form.ageRange} onChange={(v) => patch({ ageRange: v })} />
      <Input label="City" required value={form.city} onChangeText={(v) => patch({ city: v })} />
      <Input label="Neighborhood" required value={form.neighborhood} onChangeText={(v) => patch({ neighborhood: v })} />
      <Input label="Profile photo URL" value={form.photoUrl ?? ""} onChangeText={(v) => patch({ photoUrl: v })} />
      <ChoiceGroup label="Goals" required helper="Choose at least one." options={GOALS} selected={form.goals} onChange={(v) => patch({ goals: v })} />
      <ChoiceGroup label="Activities" required helper="Choose at least one." options={ACTIVITIES} selected={form.activities} onChange={(v) => patch({ activities: v })} />
      <ChoiceGroup label="Availability" required helper="Choose at least one." options={AVAILABILITY} selected={form.availability} onChange={(v) => patch({ availability: v })} />
      <SingleChoice label="Current level" required options={LEVELS} value={form.currentLevel} onChange={(v) => patch({ currentLevel: v })} />
      <SingleChoice label="Target goal" required options={TARGET_GOALS} value={form.targetGoal} onChange={(v) => patch({ targetGoal: v })} />
      <SingleChoice label="Vibe" required options={VIBES} value={form.vibe} onChange={(v) => patch({ vibe: v })} />
      <SingleChoice label="Comfort preference" required options={COMFORT_PREFERENCES} value={form.comfortPreference} onChange={(v) => patch({ comfortPreference: v })} />
      <NumberChoice label="Preferred group size" required options={GROUP_SIZES} value={form.preferredGroupSize} onChange={(v) => patch({ preferredGroupSize: v })} />
      <Input label="Bio" value={form.bio ?? ""} onChangeText={(v) => patch({ bio: v })} multiline />

      <PrimaryButton label={save.isPending ? "Saving..." : "Save profile"} onPress={submit} disabled={save.isPending} />
      <SecondaryButton label="Sign out" onPress={signOut} />
    </ScreenScroll>
  );
}
