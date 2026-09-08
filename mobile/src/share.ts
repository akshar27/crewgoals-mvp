import { Share } from "react-native";
import { apiBase } from "./api";

/** Web pages live at the same origin as the API. */
function webUrl(path: string) {
  return `${apiBase()}${path}`;
}

type ShareableGroup = { id: string; title: string; neighborhood: string; city: string; goal?: { name: string } };
type ShareableEvent = { id: string; title: string; group?: { title?: string } | null };

export function shareGroup(group: ShareableGroup) {
  const what = group.goal?.name ? `${group.goal.name} crew` : "crew";
  return Share.share({
    message: `${group.title} — a ${what} in ${group.neighborhood}, ${group.city} on CrewGoals. ${webUrl(
      `/groups/${group.id}`
    )}`,
  });
}

export function shareEvent(event: ShareableEvent) {
  const withGroup = event.group?.title ? ` with ${event.group.title}` : "";
  return Share.share({
    message: `${event.title}${withGroup} on CrewGoals — ${webUrl(`/events/${event.id}`)}`,
  });
}

export function shareApp() {
  return Share.share({
    message: `Find your crew, build your goal. Small local groups matched by goal, level, schedule, and vibe — CrewGoals: ${webUrl(
      "/"
    )}`,
  });
}
