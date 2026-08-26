import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FilterBar } from "../components/tasks/FilterBar";
import { TaskTable } from "../components/tasks/TaskTable";
import { useSearch } from "../context/SearchContext";
import { useCronogramaTasks } from "../hooks/useCronogramaSplit";
import { useFilteredTasks } from "../hooks/useFilteredTasks";
import { useI18n } from "../i18n/I18nProvider";
import { formatMonthFull } from "../utils/dates";
import { EMPTY_FILTERS, type TaskFilters } from "../types";
import { expandTasksToOccurrences } from "../shared/taskLogic";
import { startOfMonth } from "date-fns";

interface LocationFilterState {
  status?: string;
  ownerId?: string;
  overdue?: boolean;
}

export function TasksPage() {
  const { t, locale } = useI18n();
  const { globalSearch } = useSearch();
  const location = useLocation();

  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [overdueOnly, setOverdueOnly] = useState(false);

  useEffect(() => {
    const state = location.state as LocationFilterState | null;
    if (!state) return;
    setFilters((prev) => ({
      ...prev,
      status: state.status ?? prev.status,
      ownerId: state.ownerId ?? prev.ownerId,
    }));
    setOverdueOnly(!!state.overdue);
    // Clear the router state so a later back-navigation doesn't reapply it.
    window.history.replaceState({}, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveFilters = useMemo(() => ({ ...filters, search: globalSearch }), [filters, globalSearch]);
  // Tasks (the cronograma) only shows tasks whose type is flagged showOnCronograma — everything else lives in Other Tasks.
  const cronogramaTasks = useCronogramaTasks();
  const filteredTasks = useFilteredTasks(effectiveFilters, cronogramaTasks);

  const overdueTaskIds = useMemo(() => {
    if (!overdueOnly) return null;
    const monthStart = startOfMonth(new Date());
    const occ = expandTasksToOccurrences(cronogramaTasks, monthStart, new Date());
    return new Set(occ.filter((o) => o.status !== "completed" && o.status !== "blocked").map((o) => o.taskId));
  }, [overdueOnly, cronogramaTasks]);

  const visibleTasks = overdueTaskIds ? filteredTasks.filter((tk) => overdueTaskIds.has(tk.id)) : filteredTasks;

  const monthOptions = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    return Array.from({ length: 12 - currentMonthIndex }, (_, i) => {
      const monthIndex = currentMonthIndex + i;
      const date = new Date(year, monthIndex, 1);
      const value = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
      return { value, label: formatMonthFull(date, locale) };
    });
  }, [locale]);

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setOverdueOnly(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("tasks.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("tasks.subtitle")}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {visibleTasks.length} {t("tasks.resultsCount")}
        </p>
      </div>

      <FilterBar
        filters={filters}
        onChange={(patch) => {
          setFilters((prev) => ({ ...prev, ...patch }));
          setOverdueOnly(false);
        }}
        onClear={handleClear}
        monthOptions={monthOptions}
      />

      <TaskTable tasks={visibleTasks} />
    </div>
  );
}
