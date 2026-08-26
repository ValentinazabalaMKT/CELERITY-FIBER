import { useI18n } from "../../i18n/I18nProvider";
import { cn } from "../../utils/cn";
import type { TranslationKey } from "../../i18n/en";

export interface CategoryFilterOption {
  id: string;
  labelKey: TranslationKey;
}

export function CalendarCategoryFilter({
  options,
  activeIds,
  onToggle,
  onClear,
}: {
  options: CategoryFilterOption[];
  activeIds: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("calendar.filter.label")}
      </span>
      {options.map((opt) => {
        const active = activeIds.has(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {t(opt.labelKey)}
          </button>
        );
      })}
      {activeIds.size > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
        >
          {t("action.clearFilters")}
        </button>
      )}
    </div>
  );
}
