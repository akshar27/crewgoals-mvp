type GroupCapacity = {
  status: string;
  maxMembers: number;
  memberCount: number;
};

export function canRequestToJoin(group: GroupCapacity) {
  return group.status === "OPEN" && group.memberCount < group.maxMembers;
}

export function isDuplicateJoin(existing: unknown) {
  return Boolean(existing);
}
