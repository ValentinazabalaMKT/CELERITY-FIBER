import { useI18n } from "../../i18n/I18nProvider";
import { formatMonthFull } from "../../utils/dates";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function MonthProgress({ total, completed, monthDate }: { total: number; completed: number; monthDate: Date }) {
  const { t, locale } = useI18n();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const monthLabel = formatMonthFull(monthDate, locale);

  return (
    <Card>
      <CardHeader>
        <h3 className="font-display text-sm font-semibold text-foreground">
          {monthLabel} {t("dashboard.monthProgress")}
        </h3>
        <span className="text-sm font-semibold text-brand-700">{pct}%</span>
      </CardHeader>
      <CardBody>
        <p className="mb-3 text-sm text-muted-foreground">
          {completed} / {total} {t("dashboard.tasksCompleted")}
        </p>
        <ProgressBar value={pct} colorClassName="bg-brand-700" />
      </CardBody>
    </Card>
  );
}
