import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import type { Category, TaskType, TeamMember } from "../types";

export interface Lookups {
  ownerById: Map<string, TeamMember>;
  taskTypeById: Map<string, TaskType>;
  categoryById: Map<string, Category>;
}

export function useLookups(): Lookups {
  const { teamMembers, taskTypes, categories } = useAppData();

  return useMemo(
    () => ({
      ownerById: new Map(teamMembers.map((m) => [m.id, m])),
      taskTypeById: new Map(taskTypes.map((t) => [t.id, t])),
      categoryById: new Map(categories.map((c) => [c.id, c])),
    }),
    [teamMembers, taskTypes, categories]
  );
}
