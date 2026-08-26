import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
  /** Sizing/layout classes (e.g. width) — applied to the wrapper, never the <select>, so they can't lose to the select's own w-full. */
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, compact, children, ...props }, ref) => (
    <div className={cn("relative min-w-0", className)}>
      <select
        ref={ref}
        className={cn(
          "w-full min-w-0 appearance-none truncate rounded-lg border border-input bg-white pl-3 pr-8 text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-brand-700/40 focus:border-brand-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          compact ? "h-8 text-xs" : "h-10"
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
);
Select.displayName = "Select";
