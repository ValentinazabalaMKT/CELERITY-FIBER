import { db } from "../db/index.js";
import type { Frequency, OccurrenceOverride, Priority, Status, Task } from "../shared/types.js";

export interface TaskRow {
  id: string;
  parentTaskId: string | null;
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string | null;
  ownerId: string | null;
  status: Status;
  priority: Priority;
  categoryId: string | null;
  taskTypeId: string | null;
  isRecurring: number;
  recurrenceFrequency: string | null;
  recurrenceInterval: number | null;
  recurrenceDayOfWeek: number | null;
  recurrenceDayOfMonth: number | null;
  recurrenceStartDate: string | null;
  recurrenceEndDate: string | null;
  notes: string;
  source: "manual" | "csv-import";
  sourceRowHash: string | null;
  manuallyEditedAt: string | null;
  active: number;
  createdAt: string;
  updatedAt: string;
}

interface OverrideRow {
  taskId: string;
  occurrenceDate: string;
  status: Status;
  completedAt: string | null;
}

function rowToTask(row: TaskRow, overrides: OccurrenceOverride[], evidenceCount = 0): Task {
  return {
    id: row.id,
    parentTaskId: row.parentTaskId,
    title: row.title,
    description: row.description,
    startDate: row.startDate,
    dueDate: row.dueDate,
    ownerId: row.ownerId,
    status: row.status,
    priority: row.priority,
    categoryId: row.categoryId,
    taskTypeId: row.taskTypeId,
    isRecurring: !!row.isRecurring,
    recurrence:
      row.isRecurring && row.recurrenceFrequency && row.recurrenceStartDate
        ? {
            frequency: row.recurrenceFrequency as Frequency,
            interval: row.recurrenceInterval ?? 1,
            dayOfWeek: row.recurrenceDayOfWeek,
            dayOfMonth: row.recurrenceDayOfMonth,
            startDate: row.recurrenceStartDate,
            endDate: row.recurrenceEndDate,
          }
        : null,
    notes: row.notes,
    source: row.source,
    active: !!row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    occurrenceOverrides: overrides,
    evidenceCount,
  };
}

export function getAllTasks(): Task[] {
  const taskRows = db
    .prepare(`SELECT * FROM tasks WHERE active = 1 ORDER BY dueDate IS NULL, dueDate ASC, createdAt ASC`)
    .all() as TaskRow[];
  const overrideRows = db.prepare(`SELECT * FROM task_occurrence_overrides`).all() as OverrideRow[];
  const evidenceCountRows = db
    .prepare(`SELECT taskId, COUNT(*) as c FROM task_evidence GROUP BY taskId`)
    .all() as { taskId: string; c: number }[];

  const overridesByTask = new Map<string, OccurrenceOverride[]>();
  for (const o of overrideRows) {
    const list = overridesByTask.get(o.taskId) ?? [];
    list.push({ date: o.occurrenceDate, status: o.status, completedAt: o.completedAt });
    overridesByTask.set(o.taskId, list);
  }
  const evidenceCountByTask = new Map<string, number>(evidenceCountRows.map((r) => [r.taskId, r.c]));

  return taskRows.map((row) => rowToTask(row, overridesByTask.get(row.id) ?? [], evidenceCountByTask.get(row.id) ?? 0));
}

export function getTaskById(id: string): Task | null {
  const row = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id) as TaskRow | undefined;
  if (!row) return null;
  const overrides = db
    .prepare(`SELECT * FROM task_occurrence_overrides WHERE taskId = ?`)
    .all(id) as OverrideRow[];
  const evidenceCount = (
    db.prepare(`SELECT COUNT(*) as c FROM task_evidence WHERE taskId = ?`).get(id) as { c: number }
  ).c;
  return rowToTask(
    row,
    overrides.map((o) => ({ date: o.occurrenceDate, status: o.status, completedAt: o.completedAt })),
    evidenceCount
  );
}
