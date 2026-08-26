export * from "../shared/types";
export type { ExpandedOccurrence } from "../shared/taskLogic";

export interface TaskFilters {
  month: string | null; // "yyyy-MM" or null for all
  ownerId: string | null;
  status: string | null;
  priority: string | null;
  categoryId: string | null;
  taskTypeId: string | null;
  search: string;
}

export const EMPTY_FILTERS: TaskFilters = {
  month: null,
  ownerId: null,
  status: null,
  priority: null,
  categoryId: null,
  taskTypeId: null,
  search: "",
};

export interface ToastMessage {
  id: string;
  kind: "success" | "error" | "info";
  text: string;
}
