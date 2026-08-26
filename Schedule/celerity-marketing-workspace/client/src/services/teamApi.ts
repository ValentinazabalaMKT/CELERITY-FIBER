import { api } from "./api";
import type { TeamMember } from "../types";

export interface TeamMemberDraft {
  name: string;
  role: string;
  initials: string;
  active?: boolean;
}

export const teamApi = {
  list: () => api.get<TeamMember[]>("/team-members"),
  create: (draft: TeamMemberDraft) => api.post<TeamMember>("/team-members", draft),
  update: (id: string, patch: Partial<TeamMemberDraft>) => api.patch<TeamMember>(`/team-members/${id}`, patch),
  remove: (id: string) => api.delete<void>(`/team-members/${id}`),
};
