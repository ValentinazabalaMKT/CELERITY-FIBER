import { AlertOctagon } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import type { Priority } from "../../types";
import { cn } from "../../utils/cn";

const DOT_COLORS: Record<Exclude<Priority, "urgent">, string> = {
  low: "#6B7280",
  medium: "#0087AD",
  high: "#D97706",
};

/**
 * Urgent is deliberately treated differently from the other three priorities:
 * a solid red badge, not a subtle dot, so it can never be missed at a glance.
 */
export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const { t } = useI18n();

  if (priority === "urgent") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-red-600 bg-red-600 px-2 py-0.5 text-xs font-bold leading-none text-white",
          className
        )}
      >
        <AlertOctagon className="h-3 w-3" aria-hidden="true" />
        {t("priority.urgent")}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-foreground", className)}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: DOT_COLORS[priority] }} aria-hidden="true" />
      {t(`priority.${priority}`)}
    </span>
  );
}
