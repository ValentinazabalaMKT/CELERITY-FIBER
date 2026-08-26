import { CalendarClock } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { useLookups } from "../../hooks/useLookups";
import { useTaskUI } from "../../context/TaskUIContext";
import { computeUrgency } from "../../shared/taskLogic";
import { formatDate } from "../../utils/dates";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { OwnerPill } from "../tasks/OwnerPill";
import { UrgencyBadge } from "../tasks/UrgencyBadge";
import type { TaskOccurrence } from "../../types";

export function UpcomingDeadlines({ occurrences }: { occurrences: TaskOccurrence[] }) {
  const { t, locale } = useI18n();
  const { ownerById } = useLookups();
  const { openDetail } = useTaskUI();

  return (
    <Card>
      <CardHeader>
        <h3 className="font-display text-sm font-semibold text-foreground">{t("dashboard.upcomingDeadlines")}</h3>
      </CardHeader>
      <CardBody>
        {occurrences.length === 0 ? (
          <EmptyState icon={CalendarClock} title={t("dashboard.noUpcoming")} />
        ) : (
          <ul className="divide-y divide-border">
            {occurrences.map((occ) => (
              <li key={occ.occurrenceId}>
                <button
                  type="button"
                  onClick={() => openDetail(occ.task, occ.date)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 rounded-lg px-2 -mx-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{occ.task.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatDate(occ.date, locale)}</span>
                      <OwnerPill owner={occ.task.ownerId ? ownerById.get(occ.task.ownerId) : undefined} />
                    </div>
                  </div>
                  <UrgencyBadge urgency={computeUrgency(occ.date, occ.status)} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
