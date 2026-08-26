import { useMemo } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { useTaskUI } from "../../context/TaskUIContext";
import { formatDayNumber, formatWeekdayShort, getMonthGrid, isSameMonth, isToday, toIso } from "../../utils/dates";
import { cn } from "../../utils/cn";
import { EventPill } from "./EventPill";
import type { TaskOccurrence } from "../../types";

const MAX_VISIBLE = 3;

export function MonthView({
  monthDate,
  weekStartsOn,
  occurrences,
  onOverflowClick,
}: {
  monthDate: Date;
  weekStartsOn: 0 | 1;
  occurrences: TaskOccurrence[];
  onOverflowClick: (dateIso: string) => void;
}) {
  const { t, locale } = useI18n();
  const { openDetail, openNewTask } = useTaskUI();

  const grid = useMemo(() => getMonthGrid(monthDate, weekStartsOn), [monthDate, weekStartsOn]);
  const weekdayHeaders = grid[0];

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
    <div className="flex flex-1 flex-col overflow-y-auto rounded-2xl border border-border bg-card shadow-soft">
      <div className="grid grid-cols-7 border-b border-border bg-surface">
        {weekdayHeaders.map((d) => (
          <div key={d.toISOString()} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {formatWeekdayShort(d, locale)}
          </div>
        ))}
      </div>
      <div className="grid auto-rows-[minmax(104px,auto)]">
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((day) => {
              const iso = toIso(day);
              const dayOccurrences = byDate.get(iso) ?? [];
              const visible = dayOccurrences.slice(0, MAX_VISIBLE);
              const overflow = dayOccurrences.length - visible.length;
              const inMonth = isSameMonth(day, monthDate);
              const today = isToday(day);

              return (
                <div
                  key={iso}
                  role="button"
                  tabIndex={0}
                  onClick={() => openNewTask(iso)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openNewTask(iso);
                    }
                  }}
                  className={cn(
                    "flex min-h-[104px] cursor-pointer flex-col gap-1 border-r border-border p-1.5 text-left last:border-r-0 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-700/40",
                    !inMonth && "bg-surface/60"
                  )}
                  title={t("calendar.clickToCreate")}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                      today ? "bg-brand-700 text-white" : inMonth ? "text-foreground" : "text-muted-foreground/50"
                    )}
                  >
                    {formatDayNumber(day)}
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    {visible.map((occ) => (
                      <EventPill key={occ.occurrenceId} occurrence={occ} onClick={() => openDetail(occ.task, occ.date)} />
                    ))}
                    {overflow > 0 && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOverflowClick(iso);
                        }}
                        className="px-1.5 text-[11px] font-medium text-brand-700 hover:underline"
                      >
                        +{overflow} {t("calendar.more")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
