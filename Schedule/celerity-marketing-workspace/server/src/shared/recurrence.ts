// Pure recurrence-expansion engine for Celerity Marketing Workspace.
// NOTE: kept in sync manually with server/src/shared/recurrence.ts (see comment there).
//
// Strategy: recurring tasks are stored ONCE as a template (title, owner, rule...).
// Concrete calendar occurrences are computed on demand for a given date range,
// never materialized as duplicate rows. Per-occurrence status changes (e.g. marking
// the August instance "completed") are stored separately as lightweight overrides
// keyed by (taskId, date) so future occurrences are unaffected.

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  getDaysInMonth,
  isAfter,
  isBefore,
  parseISO,
  startOfMonth,
} from "date-fns";
import type { RecurrenceRule } from "./types";

const MAX_ITERATIONS = 500;
const ISO = "yyyy-MM-dd";

function setDayClamped(date: Date, day: number): Date {
  const daysInMonth = getDaysInMonth(date);
  const clamped = Math.min(Math.max(day, 1), daysInMonth);
  const d = new Date(date.getFullYear(), date.getMonth(), clamped);
  return d;
}

function alignToWeekday(date: Date, dayOfWeek: number): Date {
  const current = date.getDay();
  const diff = (dayOfWeek - current + 7) % 7;
  return addDays(date, diff);
}

/**
 * Expands a recurrence rule into concrete ISO date strings that fall within
 * [rangeStart, rangeEnd] (inclusive). Bounded to avoid runaway loops on bad rules.
 */
export function expandOccurrences(
  rule: RecurrenceRule,
  rangeStart: Date,
  rangeEnd: Date
): string[] {
  const results: string[] = [];
  if (isAfter(rangeStart, rangeEnd)) return results;

  const anchor = parseISO(rule.startDate);
  const hardEnd = rule.endDate ? parseISO(rule.endDate) : null;
  const effectiveEnd = hardEnd && isBefore(hardEnd, rangeEnd) ? hardEnd : rangeEnd;
  if (isAfter(anchor, effectiveEnd)) return results;

  let cursor: Date;
  let iterations = 0;

  const push = (d: Date) => {
    if (!isBefore(d, rangeStart) && !isAfter(d, effectiveEnd)) {
      results.push(format(d, ISO));
    }
  };

  switch (rule.frequency) {
    case "weekly":
    case "biweekly": {
      const step = rule.frequency === "biweekly" ? 2 : Math.max(1, rule.interval || 1);
      const dow = rule.dayOfWeek ?? anchor.getDay();
      cursor = alignToWeekday(anchor, dow);
      while (isBefore(cursor, rangeStart) && iterations < MAX_ITERATIONS) {
        cursor = addWeeks(cursor, step);
        iterations++;
      }
      while (!isAfter(cursor, effectiveEnd) && iterations < MAX_ITERATIONS) {
        push(cursor);
        cursor = addWeeks(cursor, step);
        iterations++;
      }
      break;
    }
    case "monthly":
    case "quarterly": {
      const step = rule.frequency === "quarterly" ? 3 : Math.max(1, rule.interval || 1);
      const day = rule.dayOfMonth ?? anchor.getDate();
      cursor = setDayClamped(startOfMonth(anchor), day);
      while (isBefore(cursor, rangeStart) && iterations < MAX_ITERATIONS) {
        cursor = setDayClamped(addMonths(cursor, step), day);
        iterations++;
      }
      while (!isAfter(cursor, effectiveEnd) && iterations < MAX_ITERATIONS) {
        push(cursor);
        cursor = setDayClamped(addMonths(cursor, step), day);
        iterations++;
      }
      break;
    }
    case "yearly": {
      const step = Math.max(1, rule.interval || 1);
      const day = rule.dayOfMonth ?? anchor.getDate();
      const month = anchor.getMonth();
      cursor = setDayClamped(new Date(anchor.getFullYear(), month, 1), day);
      while (isBefore(cursor, rangeStart) && iterations < MAX_ITERATIONS) {
        cursor = setDayClamped(addYears(cursor, step), day);
        iterations++;
      }
      while (!isAfter(cursor, effectiveEnd) && iterations < MAX_ITERATIONS) {
        push(cursor);
        cursor = setDayClamped(addYears(cursor, step), day);
        iterations++;
      }
      break;
    }
    case "custom":
    default: {
      const step = Math.max(1, rule.interval || 1);
      cursor = anchor;
      while (isBefore(cursor, rangeStart) && iterations < MAX_ITERATIONS) {
        cursor = addDays(cursor, step);
        iterations++;
      }
      while (!isAfter(cursor, effectiveEnd) && iterations < MAX_ITERATIONS) {
        push(cursor);
        cursor = addDays(cursor, step);
        iterations++;
      }
      break;
    }
  }

  return results;
}

/** Returns the next single occurrence on/after `from` (inclusive), or null. */
export function nextOccurrence(rule: RecurrenceRule, from: Date): string | null {
  const horizon = addYears(from, 2);
  const occ = expandOccurrences(rule, from, horizon);
  return occ.length > 0 ? occ[0] : null;
}
