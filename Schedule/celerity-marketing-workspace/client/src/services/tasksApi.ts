import { api } from "./api";
import type { RecurrenceRule, Status, Task } from "../types";

export interface TaskDraft {
  parentTaskId?: string | null;
  title: string;
  description?: string;
  startDate?: string | null;
  dueDate?: string | null;
  ownerId?: string | null;
  status?: Status;
  priority?: Task["priority"];
  categoryId?: string | null;
  taskTypeId?: string | null;
  isRecurring?: boolean;
  recurrence?: RecurrenceRule | null;
  notes?: string;
}

export const tasksApi = {
  list: () => api.get<Task[]>("/tasks"),
  create: (draft: TaskDraft) => api.post<Task>("/tasks", draft),
  update: (id: string, patch: Partial<TaskDraft>) => api.patch<Task>(`/tasks/${id}`, patch),
  remove: (id: string) => api.delete<void>(`/tasks/${id}`),
  setOccurrenceStatus: (taskId: string, date: string, status: Status) =>
    api.patch<Task>(`/tasks/${taskId}/occurrences/${date}`, { status }),
};
