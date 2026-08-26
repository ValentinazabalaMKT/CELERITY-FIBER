import { cn } from "../../utils/cn";

const PALETTE = ["#582C83", "#0087AD", "#8D6E97", "#472369", "#046f90", "#663690"];

function colorForInitials(initials: string): string {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) hash = (hash * 31 + initials.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

interface AvatarProps {
  initials: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({ initials, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: colorForInitials(initials) }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
