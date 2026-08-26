// Pure helpers that turn a Task template into concrete calendar occurrences,
// and classify due-date urgency. Shared between client and server.
// NOTE: kept in sync manually with server/src/shared/taskLogic.ts.

import { addDays, format, parseISO, startOfDay } from "date-fns";
import { expandOccurrences } from "./recurrence";
import type { Status, Task, TaskOccurrence, Urgency } from "./types";

const ISO = "yyyy-MM-dd";

export interface ExpandedOccurrence {
  date: string;
  status: Status;
  isOverride: boolean;
}

/** Resolves the effective status for one occurrence date, applying overrides. */
export function resolveOccurrenceStatus(task: Task, date: string): ExpandedOccurrence {
  const override = task.occurrenceOverrides.find((o) => o.date === date);
  if (override) {
    return { date, status: override.status, isOverride: true };
  }
  return { date, status: task.status, isOverride: false };
}

/**
 * Returns every concrete occurrence of a task within [rangeStart, rangeEnd].
 * Non-recurring tasks yield at most one occurrence (their dueDate, if set and in range).
 */
export function getTaskOccurrencesInRange(
  task: Task,
  rangeStart: Date,
  rangeEnd: Date
): ExpandedOccurrence[] {
  if (!task.active) return [];

  if (task.isRecurring && task.recurrence) {
    const dates = expandOccurrences(task.recurrence, rangeStart, rangeEnd);
    return dates.map((date) => resolveOccurrenceStatus(task, date));
  }

  if (!task.dueDate) return [];
  const due = parseISO(task.dueDate);
  if (due < startOfDay(rangeStart) || due > rangeEnd) return [];
  return [{ date: task.dueDate, status: task.status, isOverride: false }];
}

export function expandTasksToOccurrences(
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date
): TaskOccurrence[] {
  const out: TaskOccurrence[] = [];
  for (const task of tasks) {
    const occs = getTaskOccurrencesInRange(task, rangeStart, rangeEnd);
    for (const occ of occs) {
      out.push({
        occurrenceId: `${task.id}::${occ.date}`,
        taskId: task.id,
        date: occ.date,
        status: occ.status,
        isOverride: occ.isOverride,
        task,
      });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** Classifies urgency of a date relative to "today", ignoring completed/blocked tasks. */
export function computeUrgency(dateIso: string, status: Status, today: Date = new Date()): Urgency {
  if (status === "completed") return null;
  const todayIso = format(startOfDay(today), ISO);
  const soonIso = format(addDays(startOfDay(today), 3), ISO);
  if (dateIso < todayIso) return "overdue";
  if (dateIso === todayIso) return "due_today";
  if (dateIso <= soonIso) return "due_soon";
  return null;
}
