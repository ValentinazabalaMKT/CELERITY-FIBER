import { useAppData } from "../../context/AppDataContext";
import { useI18n } from "../../i18n/I18nProvider";
import { Select } from "../ui/Select";
import { PRIORITY_VALUES, STATUS_VALUES, type Priority, type Status } from "../../types";

interface CommonProps {
  taskId: string;
  onChange?: () => void;
}

export function StatusInlineSelect({ taskId, value, onChange }: CommonProps & { value: Status }) {
  const { updateTask } = useAppData();
  const { t } = useI18n();
  return (
    <Select
      compact
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        updateTask(taskId, { status: e.target.value as Status });
        onChange?.();
      }}
      aria-label={t("field.status")}
    >
      {STATUS_VALUES.map((s) => (
        <option key={s} value={s}>
          {t(`status.${s}`)}
        </option>
      ))}
    </Select>
  );
}

export function PriorityInlineSelect({ taskId, value, onChange }: CommonProps & { value: Priority }) {
  const { updateTask } = useAppData();
  const { t } = useI18n();
  return (
    <Select
      compact
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        updateTask(taskId, { priority: e.target.value as Priority });
        onChange?.();
      }}
      aria-label={t("field.priority")}
    >
      {PRIORITY_VALUES.map((p) => (
        <option key={p} value={p}>
          {t(`priority.${p}`)}
        </option>
      ))}
    </Select>
  );
}

export function OwnerInlineSelect({ taskId, value, onChange }: CommonProps & { value: string | null }) {
  const { teamMembers, updateTask } = useAppData();
  const { t } = useI18n();
  return (
    <Select
      compact
      value={value ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        updateTask(taskId, { ownerId: e.target.value || null });
        onChange?.();
      }}
      aria-label={t("field.owner")}
    >
      <option value="">{t("field.unassigned")}</option>
      {teamMembers
        .filter((m) => m.active)
        .map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
    </Select>
  );
}

export function TaskTypeInlineSelect({ taskId, value, onChange }: CommonProps & { value: string | null }) {
  const { taskTypes, updateTask } = useAppData();
  const { locale, t } = useI18n();
  return (
    <Select
      compact
      value={value ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        updateTask(taskId, { taskTypeId: e.target.value || null });
        onChange?.();
      }}
      aria-label={t("field.taskType")}
    >
      <option value="">{t("field.noType")}</option>
      {taskTypes
        .filter((tt) => tt.active)
        .map((tt) => (
          <option key={tt.id} value={tt.id}>
            {locale === "es" ? tt.nameEs : tt.nameEn}
          </option>
        ))}
    </Select>
  );
}
