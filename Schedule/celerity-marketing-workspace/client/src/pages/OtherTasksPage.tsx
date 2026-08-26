import { useMemo, useState } from "react";
import { TaskTable } from "../components/tasks/TaskTable";
import { useAppData } from "../context/AppDataContext";
import { useSearch } from "../context/SearchContext";
import { useOtherTasks } from "../hooks/useCronogramaSplit";
import { useI18n } from "../i18n/I18nProvider";
import { Select } from "../components/ui/Select";

export function OtherTasksPage() {
  const { t, locale } = useI18n();
  const { taskTypes } = useAppData();
  const { globalSearch } = useSearch();
  const [typeFilter, setTypeFilter] = useState("");

  const otherTasks = useOtherTasks();

  const visibleTasks = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    return otherTasks.filter((task) => {
      if (typeFilter && task.taskTypeId !== typeFilter) return false;
      if (query) {
        const haystack = `${task.title} ${task.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [otherTasks, typeFilter, globalSearch]);

  const otherTaskTypes = taskTypes.filter((tt) => otherTasks.some((task) => task.taskTypeId === tt.id));

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("otherTasks.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("otherTasks.subtitle")}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {visibleTasks.length} {t("tasks.resultsCount")}
        </p>
      </div>

      {otherTaskTypes.length > 1 && (
        <Select compact value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label={t("tasks.filter.type")} className="w-56">
          <option value="">{t("tasks.filter.type")}: {t("tasks.filter.all")}</option>
          {otherTaskTypes.map((tt) => (
            <option key={tt.id} value={tt.id}>
              {locale === "es" ? tt.nameEs : tt.nameEn}
            </option>
          ))}
        </Select>
      )}

      <TaskTable tasks={visibleTasks} />
    </div>
  );
}
