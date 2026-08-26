import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useSearch } from "../../context/SearchContext";
import { useTaskUI } from "../../context/TaskUIContext";
import { useI18n } from "../../i18n/I18nProvider";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { SEED_OWNER_IDS } from "../../constants";
import type { Language } from "../../types";

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const { settings, teamMembers } = useAppData();
  const { openNewTask } = useTaskUI();
  const { globalSearch, setGlobalSearch } = useSearch();
  const navigate = useNavigate();
  const primaryUser = teamMembers.find((m) => m.id === SEED_OWNER_IDS.valentina) ?? teamMembers[0];

  const langOption = (code: Language, label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLocale(code)}
      aria-pressed={locale === code}
      className={cn(
        "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
        locale === code ? "bg-brand-700 text-white" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6">
      <div className="hidden min-w-0 items-center gap-3 lg:flex">
        <img src="/celerity-logo.png" alt="Celerity Fiber" className="h-6 w-auto shrink-0" />
        <span className="h-7 w-px shrink-0 bg-border" aria-hidden="true" />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {settings?.workspaceName ?? t("app.name")}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {settings?.workspaceSubtitle ?? t("app.tagline")}
          </span>
        </div>
      </div>

      <div className="relative ml-0 max-w-md flex-1 lg:ml-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            if (e.target.value.trim()) navigate("/tasks");
          }}
          placeholder={t("header.search")}
          aria-label={t("header.search")}
          className="h-10 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-700/40 focus:border-brand-700"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5" role="group" aria-label={t("header.language")}>
          {langOption("en", "EN")}
          {langOption("es", "ES")}
        </div>

        <Button onClick={() => openNewTask()} size="sm">
          <span className="text-base leading-none">+</span> {t("header.newTask")}
        </Button>

        {primaryUser && <Avatar initials={primaryUser.initials} size="sm" />}
      </div>
    </header>
  );
}
