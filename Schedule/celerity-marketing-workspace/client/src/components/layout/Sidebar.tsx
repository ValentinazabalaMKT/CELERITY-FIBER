import { NavLink } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Inbox, LayoutDashboard, ListChecks, Paperclip, Settings, Users } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { useI18n } from "../../i18n/I18nProvider";
import { formatMonthYear } from "../../utils/dates";
import { Avatar } from "../ui/Avatar";
import { cn } from "../../utils/cn";
import { SEED_OWNER_IDS } from "../../constants";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const NAV_ITEMS = [
  { to: "/dashboard", key: "nav.dashboard" as const, icon: LayoutDashboard },
  { to: "/calendar", key: "nav.calendar" as const, icon: CalendarDays },
  { to: "/tasks", key: "nav.tasks" as const, icon: ListChecks },
  { to: "/other-tasks", key: "nav.otherTasks" as const, icon: Inbox },
  { to: "/evidence", key: "nav.evidence" as const, icon: Paperclip },
  { to: "/team", key: "nav.team" as const, icon: Users },
  { to: "/settings", key: "nav.settings" as const, icon: Settings },
];

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const { t, locale } = useI18n();
  const { teamMembers } = useAppData();
  const primaryUser = teamMembers.find((m) => m.id === SEED_OWNER_IDS.valentina) ?? teamMembers[0];

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-white/10 bg-[#241236] text-white transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/favicon.png" alt="Celerity Fiber" className="h-9 w-9 shrink-0 rounded-full" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold tracking-wide">CELERITY</p>
            <p className="truncate text-[11px] text-white/50">{t("nav.workspace")}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
              )
            }
            title={collapsed ? t(item.key) : undefined}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{t(item.key)}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{t("nav.currentMonth")}</p>
          <p className="text-sm font-medium text-white/90">{formatMonthYear(new Date(), locale)}</p>
        </div>
      )}

      <div className="border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          className="mb-2 flex w-full items-center justify-center rounded-lg py-1.5 text-white/50 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {primaryUser && (
          <div className={cn("flex items-center gap-2.5 rounded-lg px-2 py-2", !collapsed && "hover:bg-white/5")}>
            <Avatar initials={primaryUser.initials} size="sm" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{primaryUser.name}</p>
                <p className="truncate text-xs text-white/50">{primaryUser.role}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
