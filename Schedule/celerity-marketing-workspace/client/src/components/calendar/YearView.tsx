import { useMemo } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { formatDayNumber, formatMonthFull, getMonthGrid, isSameMonth, isToday, toIso } from "../../utils/dates";
import { cn } from "../../utils/cn";
import type { TaskOccurrence } from "../../types";

function MiniMonth({
  monthDate,
  weekStartsOn,
  occurrences,
  onSelect,
}: {
  monthDate: Date;
  weekStartsOn: 0 | 1;
  occurrences: TaskOccurrence[];
  onSelect: () => void;
}) {
  const { locale } = useI18n();
  const grid = useMemo(() => getMonthGrid(monthDate, weekStartsOn), [monthDate, weekStartsOn]);
  const dateSet = useMemo(() => new Set(occurrences.map((o) => o.date)), [occurrences]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-shadow hover:shadow-popover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold capitalize text-foreground">{formatMonthFull(monthDate, locale)}</h3>
        {occurrences.length > 0 && (
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            {occurrences.length}
          </span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-[2px]">
        {grid.flat().map((day) => {
          const iso = toIso(day);
          const inMonth = isSameMonth(day, monthDate);
          const has = dateSet.has(iso);
          const today = isToday(day);
          return (
            <div
              key={iso}
              className={cn(
                "flex h-5 items-center justify-center rounded text-[9px]",
                !inMonth && "text-muted-foreground/30",
                inMonth && !has && "text-muted-foreground/70",
                has && "bg-brand-100 font-semibold text-brand-800",
                today && "ring-1 ring-teal-500"
              )}
            >
              {formatDayNumber(day)}
            </div>
          );
        })}
      </div>
    </button>
  );
}

export function YearView({
  year,
  weekStartsOn,
  occurrencesByMonth,
  onSelectMonth,
}: {
  year: number;
  weekStartsOn: 0 | 1;
  occurrencesByMonth: TaskOccurrence[][];
  onSelectMonth: (monthIndex: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }, (_, i) => (
        <MiniMonth
          key={i}
          monthDate={new Date(year, i, 1)}
          weekStartsOn={weekStartsOn}
          occurrences={occurrencesByMonth[i] ?? []}
          onSelect={() => onSelectMonth(i)}
        />
      ))}
    </div>
  );
}
