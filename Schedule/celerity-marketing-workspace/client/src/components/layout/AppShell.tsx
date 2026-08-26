import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useI18n } from "../../i18n/I18nProvider";
import { Toaster } from "../ui/Toaster";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { TaskFormModal } from "../tasks/TaskFormModal";
import { TaskDetailPanel } from "../tasks/TaskDetailPanel";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { loading, error } = useAppData();
  const { t } = useI18n();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface text-foreground">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("state.loading")}
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-sm text-destructive">{t("state.error")}</div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <TaskFormModal />
      <TaskDetailPanel />
      <Toaster />
    </div>
  );
}
