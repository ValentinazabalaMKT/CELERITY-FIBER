import { AlertTriangle, CalendarClock, CheckCircle2, CircleDot, ListChecks, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MonthProgress } from "../components/dashboard/MonthProgress";
import { StatCard } from "../components/dashboard/StatCard";
import { TeamWorkload } from "../components/dashboard/TeamWorkload";
import { ThisWeek } from "../components/dashboard/ThisWeek";
import { UpcomingDeadlines } from "../components/dashboard/UpcomingDeadlines";
import { useAppData } from "../context/AppDataContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useI18n } from "../i18n/I18nProvider";

export function DashboardPage() {
  const { t } = useI18n();
  const { settings } = useAppData();
  const navigate = useNavigate();
  const stats = useDashboardStats(settings?.weekStartDay ?? 1);

  const goTasks = (state: Record<string, unknown>) => navigate("/tasks", { state });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={ListChecks}
          label={t("dashboard.totalTasks")}
          value={stats.totalTasks}
          accent="#582C83"
          onClick={() => goTasks({})}
        />
        <StatCard
          icon={CircleDot}
          label={t("dashboard.pending")}
          value={stats.pending}
          accent="#8D6E97"
          onClick={() => goTasks({ status: "pending" })}
        />
        <StatCard
          icon={Loader}
          label={t("dashboard.inProgress")}
          value={stats.inProgress}
          accent="#0087AD"
          onClick={() => goTasks({ status: "in_progress" })}
        />
        <StatCard
          icon={CheckCircle2}
          label={t("dashboard.completed")}
          value={stats.completed}
          accent="#1E8A5F"
          onClick={() => goTasks({ status: "completed" })}
        />
        <StatCard
          icon={CalendarClock}
          label={t("dashboard.dueThisWeek")}
          value={stats.dueThisWeekCount}
          accent="#D97706"
          onClick={() => navigate("/calendar")}
        />
        <StatCard
          icon={AlertTriangle}
          label={t("dashboard.overdue")}
          value={stats.overdueCount}
          accent="#B23A3A"
          onClick={() => goTasks({ overdue: true })}
        />
      </div>

      <MonthProgress total={stats.monthTotal} completed={stats.monthCompleted} monthDate={stats.monthDate} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingDeadlines occurrences={stats.upcomingDeadlines} />
        </div>
        <TeamWorkload />
      </div>

      <ThisWeek occurrences={stats.thisWeekOccurrences} />
    </div>
  );
}
