import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, Loader2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface StateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface-alt px-6 py-12 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mx-auto max-w-xs text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  icon: Icon = AlertTriangle,
  title = "Something went wrong",
  description = "Please try again in a moment.",
  action,
  className,
}: Partial<StateProps>) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger-bg bg-danger-bg/40 px-6 py-12 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mx-auto max-w-xs text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function OfflineState({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={WifiOff}
      title="You're offline"
      description="Check your connection — we'll reconnect automatically."
      className={className}
    />
  );
}

export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground", className)}>
      <Loader2 className="size-6 animate-spin text-brand-700" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
