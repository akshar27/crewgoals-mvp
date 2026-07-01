type Preference = {
  goals: string[];
  activities: string[];
  city: string;
  neighborhood: string;
  currentLevel: string;
  availability: string[];
  vibe: string;
};

type GroupLike = {
  id: string;
  status: string;
  memberCount?: number;
  maxMembers: number;
  city: string;
  neighborhood: string;
  level: string;
  schedule: string;
  vibe: string;
  goal?: { name: string };
  activity?: { name: string };
};

export function scoreGroup(preference: Preference, group: GroupLike) {
  let score = 0;
  if (group.status !== "OPEN") score -= 100;
  if ((group.memberCount ?? 0) >= group.maxMembers) score -= 50;
  if (group.goal?.name && preference.goals.includes(group.goal.name)) score += 25;
  if (group.activity?.name && preference.activities.includes(group.activity.name)) score += 20;
  if (preference.city.toLowerCase() === group.city.toLowerCase()) score += 15;
  if (preference.neighborhood.toLowerCase() === group.neighborhood.toLowerCase()) score += 10;
  if (preference.currentLevel === group.level) score += 15;
  if (preference.availability.some((slot) => group.schedule.toLowerCase().includes(slot.toLowerCase()))) score += 10;
  if (preference.vibe === group.vibe) score += 10;
  return score;
}

export function recommendGroups<T extends GroupLike>(preference: Preference | null, groups: T[]) {
  if (!preference) return groups.filter((group) => group.status === "OPEN");
  return groups
    .map((group) => ({ group, score: scoreGroup(preference, group) }))
    .filter(({ score }) => score > -50)
    .sort((a, b) => b.score - a.score)
    .map(({ group, score }) => ({ ...group, score }));
}
