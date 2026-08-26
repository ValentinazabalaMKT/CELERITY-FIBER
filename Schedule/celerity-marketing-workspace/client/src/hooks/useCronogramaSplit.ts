import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import type { Task } from "../types";

/**
 * Subtasks (tasks with a parentTaskId) never appear as standalone rows anywhere
 * — Dashboard, Calendar, Tasks, Other Tasks, Evidencias. They only show up nested
 * inside their parent task's detail panel (expandable "Subtareas" section).
 */
export function useTopLevelTasks(): Task[] {
  const { tasks } = useAppData();
  return useMemo(() => tasks.filter((t) => !t.parentTaskId), [tasks]);
}

/**
 * The cronograma (Dashboard/Calendar/Tasks) shows only tasks whose Task Type is
 * flagged `showOnCronograma` — editable per-type from Settings → Task Types.
 * Everything else lives in Other Tasks. Reassigning a task's type moves it
 * between the two automatically.
 */
function useCronogramaTypeIds(): Set<string> {
  const { taskTypes } = useAppData();
  return useMemo(() => new Set(taskTypes.filter((t) => t.showOnCronograma).map((t) => t.id)), [taskTypes]);
}

export function useCronogramaTasks(): Task[] {
  const topLevelTasks = useTopLevelTasks();
  const cronogramaTypeIds = useCronogramaTypeIds();
  return useMemo(
    () => topLevelTasks.filter((t) => t.taskTypeId != null && cronogramaTypeIds.has(t.taskTypeId)),
    [topLevelTasks, cronogramaTypeIds]
  );
}

export function useOtherTasks(): Task[] {
  const topLevelTasks = useTopLevelTasks();
  const cronogramaTypeIds = useCronogramaTypeIds();
  return useMemo(
    () => topLevelTasks.filter((t) => !(t.taskTypeId != null && cronogramaTypeIds.has(t.taskTypeId))),
    [topLevelTasks, cronogramaTypeIds]
  );
}
