import { Check, Lock } from "lucide-react";
import type { Plan } from "@/types";
import { cn, formatCurrency, formatSpeed } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PlanCard({
  plan,
  onSelect,
}: {
  plan: Plan;
  onSelect?: (plan: Plan) => void;
}) {
  const disabled = !plan.availableAtProperty;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(plan)}
      className={cn(
        "flex w-full flex-col gap-3 rounded-2xl border p-5 text-left transition-all",
        plan.isCurrent
          ? "border-brand-700 bg-brand-50/60"
          : disabled
            ? "cursor-not-allowed border-border bg-surface-alt opacity-60"
            : "border-border bg-card hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-foreground">{plan.name}</p>
          <p className="text-xs text-muted-foreground">{formatSpeed(plan.downloadMbps)} symmetrical</p>
        </div>
        {plan.isCurrent && <Badge variant="brand">Current Plan</Badge>}
        {disabled && (
          <Badge variant="neutral" className="gap-1">
            <Lock className="size-3" /> Unavailable
          </Badge>
        )}
      </div>

      <p className="text-2xl font-extrabold text-foreground">
        {formatCurrency(plan.priceMonthly)}
        <span className="text-sm font-medium text-muted-foreground">/mo</span>
      </p>

      <ul className="space-y-1.5">
        {plan.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="size-3.5 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>

      {disabled ? (
        <p className="text-xs text-muted-foreground">Not available at your property yet.</p>
      ) : !plan.isCurrent ? (
        <p className="text-xs font-semibold text-brand-700">Compare & upgrade →</p>
      ) : null}
    </button>
  );
}
