import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Task } from "../types";

interface TaskUIContextValue {
  isFormOpen: boolean;
  editingTask: Task | null;
  prefillDate: string | null;
  openNewTask: (prefillDate?: string) => void;
  openEditTask: (task: Task) => void;
  closeForm: () => void;

  detailTask: Task | null;
  detailOccurrenceDate: string | null;
  openDetail: (task: Task, occurrenceDate?: string) => void;
  closeDetail: () => void;
}

const TaskUIContext = createContext<TaskUIContextValue | null>(null);

export function TaskUIProvider({ children }: { children: ReactNode }) {
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | null>(null);

  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOccurrenceDate, setDetailOccurrenceDate] = useState<string | null>(null);

  const value = useMemo<TaskUIContextValue>(
    () => ({
      isFormOpen,
      editingTask,
      prefillDate,
      openNewTask: (date) => {
        setEditingTask(null);
        setPrefillDate(date ?? null);
        setFormOpen(true);
      },
      openEditTask: (task) => {
        setEditingTask(task);
        setPrefillDate(null);
        setFormOpen(true);
        setDetailTask(null);
      },
      closeForm: () => {
        setFormOpen(false);
        setEditingTask(null);
        setPrefillDate(null);
      },
      detailTask,
      detailOccurrenceDate,
      openDetail: (task, occurrenceDate) => {
        setDetailTask(task);
        setDetailOccurrenceDate(occurrenceDate ?? task.dueDate);
      },
      closeDetail: () => {
        setDetailTask(null);
        setDetailOccurrenceDate(null);
      },
    }),
    [isFormOpen, editingTask, prefillDate, detailTask, detailOccurrenceDate]
  );

  return <TaskUIContext.Provider value={value}>{children}</TaskUIContext.Provider>;
}

export function useTaskUI(): TaskUIContextValue {
  const ctx = useContext(TaskUIContext);
  if (!ctx) throw new Error("useTaskUI must be used within TaskUIProvider");
  return ctx;
}
