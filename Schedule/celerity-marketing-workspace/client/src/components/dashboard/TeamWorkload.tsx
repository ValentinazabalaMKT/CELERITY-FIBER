import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useCronogramaTasks } from "../../hooks/useCronogramaSplit";
import { useI18n } from "../../i18n/I18nProvider";
import { Avatar } from "../ui/Avatar";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function TeamWorkload() {
  const { teamMembers } = useAppData();
  const cronogramaTasks = useCronogramaTasks();
  const { t } = useI18n();
  const navigate = useNavigate();

  const activeMembers = teamMembers.filter((m) => m.active);
  const counts = activeMembers.map((m) => ({
    member: m,
    count: cronogramaTasks.filter((tk) => tk.ownerId === m.id && (tk.status === "pending" || tk.status === "in_progress")).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <Card>
      <CardHeader>
        <h3 className="font-display text-sm font-semibold text-foreground">{t("dashboard.teamWorkload")}</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        {counts.map(({ member, count }) => (
          <button
            key={member.id}
            type="button"
            onClick={() => navigate("/tasks", { state: { ownerId: member.id } })}
            className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
          >
            <Avatar initials={member.initials} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="truncate text-sm font-medium text-foreground">{member.name}</span>
                <span className="text-xs text-muted-foreground">
                  {count} {t("dashboard.activeTasks")}
                </span>
              </div>
              <ProgressBar value={(count / max) * 100} colorClassName="bg-brand-700" />
            </div>
          </button>
        ))}
      </CardBody>
    </Card>
  );
}
