import { CalendarDays } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { useTaskUI } from "../../context/TaskUIContext";
import { useLookups } from "../../hooks/useLookups";
import { formatDate, isToday, parseISO } from "../../utils/dates";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { StatusBadge } from "../tasks/StatusBadge";
import { OwnerPill } from "../tasks/OwnerPill";
import { cn } from "../../utils/cn";
import type { TaskOccurrence } from "../../types";

export function ThisWeek({ occurrences }: { occurrences: TaskOccurrence[] }) {
  const { t, locale } = useI18n();
  const { openDetail } = useTaskUI();
  const { ownerById } = useLookups();

  return (
    <Card>
      <CardHeader>
        <h3 className="font-display text-sm font-semibold text-foreground">{t("dashboard.thisWeek")}</h3>
      </CardHeader>
      <CardBody>
        {occurrences.length === 0 ? (
          <EmptyState icon={CalendarDays} title={t("dashboard.noThisWeek")} />
        ) : (
          <ul className="space-y-1">
            {occurrences.map((occ) => {
              const today = isToday(parseISO(occ.date));
              return (
                <li key={occ.occurrenceId}>
                  <button
                    type="button"
                    onClick={() => openDetail(occ.task, occ.date)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40",
                      today && "bg-teal-50/60"
                    )}
                  >
                    <span
                      className={cn(
                        "w-14 shrink-0 text-xs font-semibold",
                        today ? "text-teal-700" : "text-muted-foreground"
                      )}
                    >
                      {formatDate(occ.date, locale, "weekday").split(",")[0]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{occ.task.title}</span>
                    <OwnerPill owner={occ.task.ownerId ? ownerById.get(occ.task.ownerId) : undefined} />
                    <StatusBadge status={occ.status} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
