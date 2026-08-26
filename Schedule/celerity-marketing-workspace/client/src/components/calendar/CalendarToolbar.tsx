import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import type { CalendarView } from "../../types";

interface CalendarToolbarProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  label: string;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
}

const VIEWS: CalendarView[] = ["week", "month", "year"];

export function CalendarToolbar({ view, onViewChange, label, onPrevious, onToday, onNext }: CalendarToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold capitalize text-foreground">{label}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <Button variant="ghost" size="icon" onClick={onPrevious} aria-label={t("calendar.previous")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday}>
            {t("calendar.today")}
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext} aria-label={t("calendar.next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-1" role="group" aria-label="Calendar view">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              aria-pressed={view === v}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === v ? "bg-brand-700 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(`calendar.${v}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
