import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useI18n } from "../i18n/I18nProvider";
import { Avatar } from "../components/ui/Avatar";
import { Card, CardBody } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";

export function TeamPage() {
  const { t } = useI18n();
  const { teamMembers, tasks } = useAppData();
  const navigate = useNavigate();

  const activeMembers = teamMembers.filter((m) => m.active);
  const maxActive = Math.max(
    1,
    ...activeMembers.map((m) => tasks.filter((tk) => tk.ownerId === m.id && tk.status !== "completed").length)
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{t("team.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("team.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {activeMembers.map((member) => {
          const memberTasks = tasks.filter((tk) => tk.ownerId === member.id);
          const activeCount = memberTasks.filter((tk) => tk.status !== "completed").length;
          const completedCount = memberTasks.filter((tk) => tk.status === "completed").length;

          return (
            <Card key={member.id} interactive onClick={() => navigate("/tasks", { state: { ownerId: member.id } })}>
              <CardBody className="pt-5">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar initials={member.initials} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-foreground">{member.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>

                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {activeCount} {t("team.activeTasks")}
                  </span>
                  <span className="text-xs text-muted-foreground">{completedCount} ✓</span>
                </div>
                <ProgressBar value={(activeCount / maxActive) * 100} colorClassName="bg-brand-700" />

                <p className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-700">
                  {t("team.viewTasks")} <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
