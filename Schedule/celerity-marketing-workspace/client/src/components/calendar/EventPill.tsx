import { useLookups } from "../../hooks/useLookups";
import { resolveIcon } from "../../utils/iconRegistry";
import { cn } from "../../utils/cn";
import type { TaskOccurrence } from "../../types";

const STATUS_DOT: Record<string, string> = {
  pending: "#8D6E97",
  in_progress: "#0087AD",
  completed: "#1E8A5F",
  blocked: "#B23A3A",
};

export function EventPill({ occurrence, onClick }: { occurrence: TaskOccurrence; onClick: () => void }) {
  const { taskTypeById } = useLookups();
  const taskType = occurrence.task.taskTypeId ? taskTypeById.get(occurrence.task.taskTypeId) : undefined;
  const Icon = resolveIcon(taskType?.icon);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex w-full min-w-0 items-center gap-1.5 rounded-md border bg-white px-1.5 py-1 text-left text-[11px] font-medium leading-tight text-foreground",
        "hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40",
        occurrence.status === "completed" && "opacity-60 line-through"
      )}
      style={{ borderColor: `${STATUS_DOT[occurrence.status]}40`, borderLeftWidth: 3, borderLeftColor: STATUS_DOT[occurrence.status] }}
    >
      <Icon className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{occurrence.task.title}</span>
    </button>
  );
}
