import { useI18n } from "../../i18n/I18nProvider";
import { resolveIcon } from "../../utils/iconRegistry";
import type { TaskType } from "../../types";
import { cn } from "../../utils/cn";

export function TaskTypeBadge({ taskType, className }: { taskType: TaskType | undefined; className?: string }) {
  const { locale, t } = useI18n();
  if (!taskType) {
    return <span className={cn("text-xs text-muted-foreground", className)}>{t("field.noType")}</span>;
  }
  const Icon = resolveIcon(taskType.icon);
  const label = locale === "es" ? taskType.nameEs : taskType.nameEn;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-foreground", className)}>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" style={{ color: taskType.color ?? undefined }} />
      {label}
    </span>
  );
}
