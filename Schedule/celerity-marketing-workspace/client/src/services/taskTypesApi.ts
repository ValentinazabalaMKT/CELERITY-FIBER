import { api } from "./api";
import type { TaskType } from "../types";

export interface TaskTypeDraft {
  nameEn: string;
  nameEs: string;
  icon: string;
  color?: string | null;
  active?: boolean;
  showOnCronograma?: boolean;
}

export const taskTypesApi = {
  list: () => api.get<TaskType[]>("/task-types"),
  create: (draft: TaskTypeDraft) => api.post<TaskType>("/task-types", draft),
  update: (id: string, patch: Partial<TaskTypeDraft>) => api.patch<TaskType>(`/task-types/${id}`, patch),
  remove: (id: string) => api.delete<void>(`/task-types/${id}`),
};
