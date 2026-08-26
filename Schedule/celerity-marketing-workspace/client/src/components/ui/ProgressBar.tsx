import { cn } from "../../utils/cn";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  colorClassName?: string;
}

export function ProgressBar({ value, className, colorClassName = "bg-teal-600" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300", colorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
