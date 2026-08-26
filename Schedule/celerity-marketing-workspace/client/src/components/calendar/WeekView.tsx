import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { useTaskUI } from "../../context/TaskUIContext";
import { useLookups } from "../../hooks/useLookups";
import { computeUrgency } from "../../shared/taskLogic";
import { formatDayNumber, formatWeekdayShort, getWeekDays, isToday, toIso } from "../../utils/dates";
import { cn } from "../../utils/cn";
import { OwnerPill } from "../tasks/OwnerPill";
import { StatusBadge } from "../tasks/StatusBadge";
import { TaskTypeBadge } from "../tasks/TaskTypeBadge";
import { UrgencyBadge } from "../tasks/UrgencyBadge";
import type { TaskOccurrence } from "../../types";

export function WeekView({
  anchorDate,
  weekStartsOn,
  occurrences,
}: {
  anchorDate: Date;
  weekStartsOn: 0 | 1;
  occurrences: TaskOccurrence[];
}) {
  const { t, locale } = useI18n();
  const { openDetail, openNewTask } = useTaskUI();
  const { ownerById, taskTypeById } = useLookups();

  const days = useMemo(() => getWeekDays(anchorDate, weekStartsOn), [anchorDate, weekStartsOn]);

  const byDate = useMemo(() => {
    const map = new Map<string, TaskOccurrence[]>();
    for (const occ of occurrences) {
      const list = map.get(occ.date) ?? [];
      list.push(occ);
      map.set(occ.date, list);
    }
    return map;
  }, [occurrences]);

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-7">
      {days.map((day) => {
        const iso = toIso(day);
        const dayOccurrences = (byDate.get(iso) ?? []).sort((a, b) => a.task.priority.localeCompare(b.task.priority));
        const today = isToday(day);

        return (
          <div
            key={iso}
            className={cn(
              "flex flex-col rounded-2xl border bg-card shadow-soft",
              today ? "border-teal-300 ring-1 ring-teal-200" : "border-border"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between rounded-t-2xl border-b border-border px-3 py-2.5",
                today && "bg-teal-50"
              )}
            >
              <div>
                <p className={cn("text-xs font-semibold uppercase tracking-wide", today ? "text-teal-700" : "text-muted-foreground")}>
                  {formatWeekdayShort(day, locale)}
                </p>
                <p className={cn("font-display text-lg font-bold", today ? "text-teal-700" : "text-foreground")}>
                  {formatDayNumber(day)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openNewTask(iso)}
                aria-label={t("header.newTask")}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-2.5">
              {dayOccurrences.length === 0 ? (
                <p className="px-1 py-3 text-center text-xs text-muted-foreground">{t("calendar.noEvents")}</p>
              ) : (
                dayOccurrences.map((occ) => {
                  const owner = occ.task.ownerId ? ownerById.get(occ.task.ownerId) : undefined;
                  const taskType = occ.task.taskTypeId ? taskTypeById.get(occ.task.taskTypeId) : undefined;
                  const urgency = computeUrgency(occ.date, occ.status);
                  return (
                    <button
                      type="button"
                      key={occ.occurrenceId}
                      onClick={() => openDetail(occ.task, occ.date)}
                      className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-border p-2.5 text-left transition-shadow hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
                    >
                      <p className="text-sm font-medium leading-snug text-foreground">{occ.task.title}</p>
                      <TaskTypeBadge taskType={taskType} />
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <OwnerPill owner={owner} className="min-w-0 flex-1" />
                        <span className="shrink-0">
                          <StatusBadge status={occ.status} />
                        </span>
                      </div>
                      {urgency && <UrgencyBadge urgency={urgency} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
