import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { useTaskUI } from "../../context/TaskUIContext";
import { useI18n } from "../../i18n/I18nProvider";
import { useLookups } from "../../hooks/useLookups";
import { computeUrgency } from "../../shared/taskLogic";
import { formatDate } from "../../utils/dates";
import { EmptyState } from "../ui/EmptyState";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ListChecks } from "lucide-react";
import { OwnerInlineSelect, PriorityInlineSelect, StatusInlineSelect, TaskTypeInlineSelect } from "./InlineEditSelects";
import { UrgencyBadge } from "./UrgencyBadge";
import type { Task } from "../../types";

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const { t, locale } = useI18n();
  const { categoryById } = useLookups();
  const { openDetail } = useTaskUI();
  const { deleteTask } = useAppData();
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return <EmptyState icon={ListChecks} title={t("tasks.empty.title")} body={t("tasks.empty.body")} />;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">{t("tasks.table.task")}</th>
              <th className="px-4 py-3">{t("tasks.table.dueDate")}</th>
              <th className="px-4 py-3">{t("tasks.table.owner")}</th>
              <th className="px-4 py-3">{t("tasks.table.status")}</th>
              <th className="px-4 py-3">{t("tasks.table.priority")}</th>
              <th className="px-4 py-3">{t("tasks.table.category")}</th>
              <th className="px-4 py-3">{t("tasks.table.type")}</th>
              <th className="px-4 py-3 text-right">{t("tasks.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const category = task.categoryId ? categoryById.get(task.categoryId) : undefined;
              const urgency = task.dueDate ? computeUrgency(task.dueDate, task.status) : null;

              return (
                <tr
                  key={task.id}
                  onClick={() => openDetail(task)}
                  className="cursor-pointer border-b border-border last:border-b-0 transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="max-w-[260px]">
                      <p className="truncate font-medium text-foreground">{task.title}</p>
                      {task.isRecurring && task.recurrence && (
                        <p className="truncate text-xs text-muted-foreground">{t(`frequency.${task.recurrence.frequency}`)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-foreground">
                        {task.dueDate ? formatDate(task.dueDate, locale) : t("field.onDemand")}
                      </span>
                      <UrgencyBadge urgency={urgency} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <OwnerInlineSelect taskId={task.id} value={task.ownerId} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusInlineSelect taskId={task.id} value={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityInlineSelect taskId={task.id} value={task.priority} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category ? (locale === "es" ? category.nameEs : category.nameEn) : t("field.noCategory")}
                  </td>
                  <td className="px-4 py-3">
                    <TaskTypeInlineSelect taskId={task.id} value={task.taskTypeId} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(task);
                      }}
                      aria-label={t("action.delete")}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={t("tasks.deleteConfirm.title")}
        body={t("tasks.deleteConfirm.body")}
        confirmLabel={t("action.delete")}
        onConfirm={() => {
          if (pendingDelete) deleteTask(pendingDelete.id);
        }}
      />
    </>
  );
}
