import { api } from "./api";
import type { WorkspaceSettings } from "../types";

export const settingsApi = {
  get: () => api.get<WorkspaceSettings>("/settings"),
  update: (patch: Partial<WorkspaceSettings>) => api.patch<WorkspaceSettings>("/settings", patch),
};
