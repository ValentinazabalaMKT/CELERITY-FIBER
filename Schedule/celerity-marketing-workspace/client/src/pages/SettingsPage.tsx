import { useState } from "react";
import { CategoriesSettings } from "../components/settings/CategoriesSettings";
import { DataImportSettings } from "../components/settings/DataImportSettings";
import { TaskTypesSettings } from "../components/settings/TaskTypesSettings";
import { TeamMembersSettings } from "../components/settings/TeamMembersSettings";
import { WorkspaceSettingsPanel } from "../components/settings/WorkspaceSettingsPanel";
import { useI18n } from "../i18n/I18nProvider";
import type { TranslationKey } from "../i18n/en";
import { cn } from "../utils/cn";

type SettingsTab = "team" | "taskTypes" | "categories" | "workspace" | "data";

const TABS: { key: SettingsTab; labelKey: TranslationKey }[] = [
  { key: "team", labelKey: "settings.nav.team" },
  { key: "taskTypes", labelKey: "settings.nav.taskTypes" },
  { key: "categories", labelKey: "settings.nav.categories" },
  { key: "workspace", labelKey: "settings.nav.workspace" },
  { key: "data", labelKey: "settings.nav.data" },
];

export function SettingsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<SettingsTab>("team");

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-52 lg:flex-col lg:overflow-visible" aria-label="Settings sections">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-current={tab === item.key}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                tab === item.key ? "bg-brand-700 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === "team" && <TeamMembersSettings />}
          {tab === "taskTypes" && <TaskTypesSettings />}
          {tab === "categories" && <CategoriesSettings />}
          {tab === "workspace" && <WorkspaceSettingsPanel />}
          {tab === "data" && <DataImportSettings />}
        </div>
      </div>
    </div>
  );
}
