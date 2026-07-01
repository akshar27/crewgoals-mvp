import { MapPin, UsersRound } from "lucide-react";
import { Badge, ButtonLink, Panel } from "@/components/ui";

type GroupCardProps = {
  group: {
    id: string;
    title: string;
    city: string;
    neighborhood: string;
    level: string;
    vibe: string;
    schedule: string;
    maxMembers: number;
    status: string;
    score?: number;
    goal: { name: string };
    activity: { name: string };
    _count?: { members: number };
  };
};

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">{group.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
            <MapPin size={15} /> {group.neighborhood}, {group.city}
          </p>
        </div>
        <Badge>{group.status.toLowerCase()}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Badge>{group.goal.name}</Badge>
        <Badge>{group.activity.name}</Badge>
        <Badge>{group.level}</Badge>
        <Badge>{group.vibe}</Badge>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1 text-sm text-stone-600">
          <UsersRound size={16} /> {group._count?.members ?? 0}/{group.maxMembers} members
        </p>
        <ButtonLink href={`/groups/${group.id}`}>View group</ButtonLink>
      </div>
      {typeof group.score === "number" ? <p className="mt-3 text-xs font-semibold text-clay">Match score {group.score}</p> : null}
    </Panel>
  );
}
