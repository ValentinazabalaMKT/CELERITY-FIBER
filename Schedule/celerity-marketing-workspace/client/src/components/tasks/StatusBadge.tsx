import { useI18n } from "../../i18n/I18nProvider";
import { Badge } from "../ui/Badge";
import type { Status } from "../../types";

const STYLES: Record<Status, string> = {
  pending: "bg-[#8D6E97]/10 text-[#6b5474] border-[#8D6E97]/25",
  in_progress: "bg-teal-50 text-teal-700 border-teal-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
};

const DOTS: Record<Status, string> = {
  pending: "#8D6E97",
  in_progress: "#0087AD",
  completed: "#1E8A5F",
  blocked: "#B23A3A",
};

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useI18n();
  return (
    <Badge className={STYLES[status]} dotColor={DOTS[status]}>
      {t(`status.${status}`)}
    </Badge>
  );
}
