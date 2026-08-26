import { useMemo } from "react";
import { Paperclip } from "lucide-react";
import { TaskTable } from "../components/tasks/TaskTable";
import { useSearch } from "../context/SearchContext";
import { useTopLevelTasks } from "../hooks/useCronogramaSplit";
import { useI18n } from "../i18n/I18nProvider";
import { EmptyState } from "../components/ui/EmptyState";

export function EvidenciasPage() {
  const { t } = useI18n();
  const topLevelTasks = useTopLevelTasks();
  const { globalSearch } = useSearch();

  const tasksWithEvidence = useMemo(() => topLevelTasks.filter((task) => task.evidenceCount > 0), [topLevelTasks]);

  const visibleTasks = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    if (!query) return tasksWithEvidence;
    return tasksWithEvidence.filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(query));
  }, [tasksWithEvidence, globalSearch]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("evidence.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("evidence.subtitle")}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {visibleTasks.length} {t("tasks.resultsCount")}
        </p>
      </div>

      {tasksWithEvidence.length === 0 ? (
        <EmptyState icon={Paperclip} title={t("evidence.empty.title")} body={t("evidence.empty.body")} />
      ) : (
        <TaskTable tasks={visibleTasks} />
      )}
    </div>
  );
}
