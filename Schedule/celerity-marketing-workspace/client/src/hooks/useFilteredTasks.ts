import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useLookups } from "./useLookups";
import type { Task, TaskFilters } from "../types";

function matchesMonth(task: Task, month: string | null): boolean {
  if (!month) return true;
  if (task.isRecurring) return true; // recurring tasks can occur in any month; keep visible
  if (!task.dueDate) return false;
  return task.dueDate.startsWith(month);
}

/** Filters a task list against TaskFilters. Defaults to all workspace tasks; pass `scope` to filter a subset instead. */
export function useFilteredTasks(filters: TaskFilters, scope?: Task[]): Task[] {
  const { tasks: allTasks } = useAppData();
  const tasks = scope ?? allTasks;
  const { ownerById, taskTypeById, categoryById } = useLookups();

  return useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
      if (filters.ownerId && task.ownerId !== filters.ownerId) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.categoryId && task.categoryId !== filters.categoryId) return false;
      if (filters.taskTypeId && task.taskTypeId !== filters.taskTypeId) return false;
      if (!matchesMonth(task, filters.month)) return false;

      if (query) {
        const owner = task.ownerId ? ownerById.get(task.ownerId) : undefined;
        const type = task.taskTypeId ? taskTypeById.get(task.taskTypeId) : undefined;
        const category = task.categoryId ? categoryById.get(task.categoryId) : undefined;
        const haystack = [
          task.title,
          task.description,
          owner?.name,
          type?.nameEn,
          type?.nameEs,
          category?.nameEn,
          category?.nameEs,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [tasks, filters, ownerById, taskTypeById, categoryById]);
}
