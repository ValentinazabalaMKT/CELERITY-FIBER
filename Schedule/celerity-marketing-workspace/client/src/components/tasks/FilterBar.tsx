import { X } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { useI18n } from "../../i18n/I18nProvider";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { PRIORITY_VALUES, STATUS_VALUES, type TaskFilters } from "../../types";

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (patch: Partial<TaskFilters>) => void;
  onClear: () => void;
  monthOptions: { value: string; label: string }[];
}

export function FilterBar({ filters, onChange, onClear, monthOptions }: FilterBarProps) {
  const { teamMembers, categories, taskTypes } = useAppData();
  const { t, locale } = useI18n();

  const cronogramaTypes = taskTypes.filter((tt) => tt.showOnCronograma);

  const hasActiveFilters =
    filters.month || filters.ownerId || filters.status || filters.priority || filters.categoryId || filters.taskTypeId;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        compact
        value={filters.month ?? ""}
        onChange={(e) => onChange({ month: e.target.value || null })}
        aria-label={t("tasks.filter.month")}
        className="w-36"
      >
        <option value="">{t("tasks.filter.allMonths")}</option>
        {monthOptions.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </Select>

      <Select
        compact
        value={filters.ownerId ?? ""}
        onChange={(e) => onChange({ ownerId: e.target.value || null })}
        aria-label={t("tasks.filter.owner")}
        className="w-44"
      >
        <option value="">{t("tasks.filter.owner")}: {t("tasks.filter.all")}</option>
        {teamMembers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </Select>

      <Select
        compact
        value={filters.status ?? ""}
        onChange={(e) => onChange({ status: e.target.value || null })}
        aria-label={t("tasks.filter.status")}
        className="w-40"
      >
        <option value="">{t("tasks.filter.status")}: {t("tasks.filter.all")}</option>
        {STATUS_VALUES.map((s) => (
          <option key={s} value={s}>
            {t(`status.${s}`)}
          </option>
        ))}
      </Select>

      <Select
        compact
        value={filters.priority ?? ""}
        onChange={(e) => onChange({ priority: e.target.value || null })}
        aria-label={t("tasks.filter.priority")}
        className="w-40"
      >
        <option value="">{t("tasks.filter.priority")}: {t("tasks.filter.all")}</option>
        {PRIORITY_VALUES.map((p) => (
          <option key={p} value={p}>
            {t(`priority.${p}`)}
          </option>
        ))}
      </Select>

      <Select
        compact
        value={filters.categoryId ?? ""}
        onChange={(e) => onChange({ categoryId: e.target.value || null })}
        aria-label={t("tasks.filter.category")}
        className="w-48"
      >
        <option value="">{t("tasks.filter.category")}: {t("tasks.filter.all")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {locale === "es" ? c.nameEs : c.nameEn}
          </option>
        ))}
      </Select>

      {cronogramaTypes.length > 1 && (
        <Select
          compact
          value={filters.taskTypeId ?? ""}
          onChange={(e) => onChange({ taskTypeId: e.target.value || null })}
          aria-label={t("tasks.filter.type")}
          className="w-48"
        >
          <option value="">{t("tasks.filter.type")}: {t("tasks.filter.all")}</option>
          {cronogramaTypes.map((tt) => (
            <option key={tt.id} value={tt.id}>
              {locale === "es" ? tt.nameEs : tt.nameEn}
            </option>
          ))}
        </Select>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-3.5 w-3.5" /> {t("action.clearFilters")}
        </Button>
      )}
    </div>
  );
}
