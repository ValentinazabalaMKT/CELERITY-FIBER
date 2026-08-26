import { useI18n } from "../../i18n/I18nProvider";
import type { Urgency } from "../../types";
import { cn } from "../../utils/cn";

const STYLES: Record<NonNullable<Urgency>, string> = {
  overdue: "bg-red-600 text-white border-red-600",
  due_today: "bg-amber-50 text-amber-700 border-amber-200",
  due_soon: "bg-brand-50 text-brand-700 border-brand-200",
};

export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  const { t } = useI18n();
  if (!urgency) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none",
        STYLES[urgency],
        className
      )}
    >
      {t(`urgency.${urgency}`)}
    </span>
  );
}
