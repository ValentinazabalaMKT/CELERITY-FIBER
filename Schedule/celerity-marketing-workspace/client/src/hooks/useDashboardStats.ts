import { useMemo } from "react";
import { addDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { expandTasksToOccurrences } from "../shared/taskLogic";
import { useCronogramaTasks } from "./useCronogramaSplit";
import type { Task, TaskOccurrence } from "../types";

export interface DashboardStats {
  totalTasks: number;
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
  dueThisWeekCount: number;
  overdueCount: number;
  upcomingDeadlines: TaskOccurrence[];
  thisWeekOccurrences: TaskOccurrence[];
  overdueOccurrences: TaskOccurrence[];
  monthTotal: number;
  monthCompleted: number;
  monthDate: Date;
}

const ISO = "yyyy-MM-dd";

export function useDashboardStats(weekStartsOn: 0 | 1 = 1): DashboardStats {
  const cronogramaTasks = useCronogramaTasks();

  return useMemo(() => {
    const now = new Date();
    const todayIso = format(now, ISO);

    const totalTasks = cronogramaTasks.length;
    const pending = cronogramaTasks.filter((t: Task) => t.status === "pending").length;
    const inProgress = cronogramaTasks.filter((t: Task) => t.status === "in_progress").length;
    const completed = cronogramaTasks.filter((t: Task) => t.status === "completed").length;
    const blocked = cronogramaTasks.filter((t: Task) => t.status === "blocked").length;

    const weekStart = startOfWeek(now, { weekStartsOn });
    const weekEnd = endOfWeek(now, { weekStartsOn });
    const thisWeekOccurrences = expandTasksToOccurrences(cronogramaTasks, weekStart, weekEnd);

    // Never look earlier than the start of the current month — the cronograma
    // only ever surfaces this month forward, never past months.
    const monthStart = startOfMonth(now);
    const overdueOccurrences = expandTasksToOccurrences(cronogramaTasks, monthStart, now).filter(
      (o) => o.status !== "completed" && o.status !== "blocked" && o.date < todayIso
    );

    const upcomingWindowEnd = addDays(now, 30);
    const upcomingDeadlines = expandTasksToOccurrences(cronogramaTasks, now, upcomingWindowEnd)
      .filter((o) => o.status !== "completed" && o.status !== "blocked")
      .slice(0, 8);

    const dueThisWeekCount = thisWeekOccurrences.filter(
      (o) => o.status !== "completed" && o.date >= todayIso
    ).length;

    const monthEnd = endOfMonth(now);
    const monthOccurrences = expandTasksToOccurrences(cronogramaTasks, monthStart, monthEnd);
    const monthTotal = monthOccurrences.length;
    const monthCompleted = monthOccurrences.filter((o) => o.status === "completed").length;

    return {
      totalTasks,
      pending,
      inProgress,
      completed,
      blocked,
      dueThisWeekCount,
      overdueCount: overdueOccurrences.length,
      upcomingDeadlines,
      thisWeekOccurrences,
      overdueOccurrences,
      monthTotal,
      monthCompleted,
      monthDate: now,
    };
  }, [cronogramaTasks, weekStartsOn]);
}
