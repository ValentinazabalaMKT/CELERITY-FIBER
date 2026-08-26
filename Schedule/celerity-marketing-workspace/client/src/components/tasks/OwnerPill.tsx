import { useI18n } from "../../i18n/I18nProvider";
import { Avatar } from "../ui/Avatar";
import type { TeamMember } from "../../types";
import { cn } from "../../utils/cn";

export function OwnerPill({ owner, className, size = "xs" }: { owner: TeamMember | undefined; className?: string; size?: "xs" | "sm" }) {
  const { t } = useI18n();
  if (!owner) {
    return <span className={cn("text-xs text-muted-foreground", className)}>{t("field.unassigned")}</span>;
  }
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <Avatar initials={owner.initials} size={size} />
      <span className="min-w-0 truncate text-sm text-foreground">{owner.name}</span>
    </span>
  );
}
