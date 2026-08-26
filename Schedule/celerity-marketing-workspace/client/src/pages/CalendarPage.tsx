import { useMemo, useState } from "react";
import { addDays, addMonths, addWeeks, addYears, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { CalendarCategoryFilter, type CategoryFilterOption } from "../components/calendar/CalendarCategoryFilter";
import { CalendarToolbar } from "../components/calendar/CalendarToolbar";
import { MonthView } from "../components/calendar/MonthView";
import { WeekView } from "../components/calendar/WeekView";
import { YearView } from "../components/calendar/YearView";
import { useAppData } from "../context/AppDataContext";
import { useOccurrences } from "../hooks/useOccurrences";
import { useI18n } from "../i18n/I18nProvider";
import { formatMonthYear } from "../utils/dates";
import type { CalendarView } from "../types";

export function CalendarPage() {
  const { locale } = useI18n();
  const { settings, categories } = useAppData();
  const weekStartsOn: 0 | 1 = settings?.weekStartDay ?? 1;

  const [view, setView] = useState<CalendarView>(settings?.defaultCalendarView ?? "month");
  const [anchorDate, setAnchorDate] = useState(new Date());

  const filterOptions = useMemo<CategoryFilterOption[]>(() => {
    const options: CategoryFilterOption[] = [];
    const bizJournal = categories.find((c) => c.nameEn === "The Business Journals");
    if (bizJournal) options.push({ id: bizJournal.id, labelKey: "calendar.filter.businessJournal" });
    const officeReports = categories.find((c) => c.nameEn === "General Operations Reports");
    if (officeReports) options.push({ id: officeReports.id, labelKey: "calendar.filter.officeReports" });
    return options;
  }, [categories]);

  const [activeCategoryIds, setActiveCategoryIds] = useState<Set<string>>(new Set());
  const toggleCategory = (id: string) => {
    setActiveCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearCategoryFilters = () => setActiveCategoryIds(new Set());

  const range = useMemo(() => {
    if (view === "week") {
      return { start: startOfWeek(anchorDate, { weekStartsOn }), end: endOfWeek(anchorDate, { weekStartsOn }) };
    }
    if (view === "year") {
      return { start: new Date(anchorDate.getFullYear(), 0, 1), end: new Date(anchorDate.getFullYear(), 11, 31) };
    }
    // month view grid extends into adjacent months
    const gridStart = startOfWeek(startOfMonth(anchorDate), { weekStartsOn });
    const gridEnd = endOfWeek(endOfMonth(anchorDate), { weekStartsOn });
    return { start: gridStart, end: gridEnd };
  }, [view, anchorDate, weekStartsOn]);

  const allOccurrences = useOccurrences(range.start, range.end);
  const occurrences = useMemo(() => {
    if (activeCategoryIds.size === 0) return allOccurrences;
    return allOccurrences.filter((o) => o.task.categoryId && activeCategoryIds.has(o.task.categoryId));
  }, [allOccurrences, activeCategoryIds]);

  const occurrencesByMonth = useMemo(() => {
    const buckets: (typeof occurrences)[] = Array.from({ length: 12 }, () => []);
    for (const occ of occurrences) {
      const month = Number(occ.date.slice(5, 7)) - 1;
      buckets[month].push(occ);
    }
    return buckets;
  }, [occurrences]);

  const goPrevious = () => {
    if (view === "week") setAnchorDate((d) => addWeeks(d, -1));
    else if (view === "year") setAnchorDate((d) => addYears(d, -1));
    else setAnchorDate((d) => subMonths(d, 1));
  };
  const goNext = () => {
    if (view === "week") setAnchorDate((d) => addWeeks(d, 1));
    else if (view === "year") setAnchorDate((d) => addYears(d, 1));
    else setAnchorDate((d) => addMonths(d, 1));
  };
  const goToday = () => setAnchorDate(new Date());

  const label = useMemo(() => {
    if (view === "year") return format(anchorDate, "yyyy");
    if (view === "month") return formatMonthYear(anchorDate, locale);
    const weekStart = startOfWeek(anchorDate, { weekStartsOn });
    const weekEnd = endOfWeek(anchorDate, { weekStartsOn });
    const startLabel = format(weekStart, "MMM d");
    const endLabel = format(weekEnd, "MMM d, yyyy");
    return `${startLabel} – ${endLabel}`;
  }, [view, anchorDate, weekStartsOn, locale]);

  return (
    <div className="flex h-full flex-col gap-5 px-6 py-6">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        label={label}
        onPrevious={goPrevious}
        onToday={goToday}
        onNext={goNext}
      />

      {filterOptions.length > 0 && (
        <CalendarCategoryFilter
          options={filterOptions}
          activeIds={activeCategoryIds}
          onToggle={toggleCategory}
          onClear={clearCategoryFilters}
        />
      )}

      {view === "month" && (
        <MonthView
          monthDate={anchorDate}
          weekStartsOn={weekStartsOn}
          occurrences={occurrences}
          onOverflowClick={(iso) => {
            setAnchorDate(new Date(`${iso}T00:00:00`));
            setView("week");
          }}
        />
      )}

      {view === "week" && <WeekView anchorDate={anchorDate} weekStartsOn={weekStartsOn} occurrences={occurrences} />}

      {view === "year" && (
        <div className="flex-1 overflow-y-auto pb-4">
          <YearView
            year={anchorDate.getFullYear()}
            weekStartsOn={weekStartsOn}
            occurrencesByMonth={occurrencesByMonth}
            onSelectMonth={(monthIndex) => {
              setAnchorDate(new Date(anchorDate.getFullYear(), monthIndex, 1));
              setView("month");
            }}
          />
        </div>
      )}
    </div>
  );
}
