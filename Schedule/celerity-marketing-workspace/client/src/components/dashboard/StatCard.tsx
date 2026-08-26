import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  accent?: string;
  onClick?: () => void;
}

export function StatCard({ icon: Icon, label, value, accent = "#582C83", onClick }: StatCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-shadow",
        onClick && "cursor-pointer hover:shadow-popover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}14` }}>
          <Icon className="h-4 w-4" style={{ color: accent }} aria-hidden="true" />
        </div>
      </div>
      <span className="font-display text-3xl font-bold text-foreground">{value}</span>
    </Comp>
  );
}
