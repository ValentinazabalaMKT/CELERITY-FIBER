import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { useI18n } from "../../i18n/I18nProvider";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ICON_NAMES, resolveIcon } from "../../utils/iconRegistry";
import type { TaskType } from "../../types";

export function TaskTypesSettings() {
  const { taskTypes, createTaskType, updateTaskType, deleteTaskType } = useAppData();
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ nameEn: "", nameEs: "", icon: ICON_NAMES[0], showOnCronograma: false });
  const [pendingDelete, setPendingDelete] = useState<TaskType | null>(null);

  const handleAdd = async () => {
    if (!draft.nameEn.trim() || !draft.nameEs.trim()) return;
    await createTaskType({
      nameEn: draft.nameEn.trim(),
      nameEs: draft.nameEs.trim(),
      icon: draft.icon,
      showOnCronograma: draft.showOnCronograma,
    });
    setDraft({ nameEn: "", nameEs: "", icon: ICON_NAMES[0], showOnCronograma: false });
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 w-16">{t("settings.taskTypes.icon")}</th>
              <th className="px-4 py-3">{t("settings.taskTypes.nameEn")}</th>
              <th className="px-4 py-3">{t("settings.taskTypes.nameEs")}</th>
              <th className="px-4 py-3 w-28">{t("settings.taskTypes.showOnCronograma")}</th>
              <th className="px-4 py-3 w-24">{t("settings.team.active")}</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {taskTypes.map((tt) => {
              const Icon = resolveIcon(tt.icon);
              return (
                <tr key={tt.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5">
                    <Select compact value={tt.icon} onChange={(e) => updateTaskType(tt.id, { icon: e.target.value })} className="w-20">
                      {ICON_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" style={{ color: tt.color ?? undefined }} />
                      <Input
                        defaultValue={tt.nameEn}
                        onBlur={(e) => e.target.value.trim() && e.target.value !== tt.nameEn && updateTaskType(tt.id, { nameEn: e.target.value.trim() })}
                        className="h-8 border-transparent bg-transparent px-1 hover:border-input focus:border-brand-700 focus:bg-white"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      defaultValue={tt.nameEs}
                      onBlur={(e) => e.target.value.trim() && e.target.value !== tt.nameEs && updateTaskType(tt.id, { nameEs: e.target.value.trim() })}
                      className="h-8 border-transparent bg-transparent px-1 hover:border-input focus:border-brand-700 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={tt.showOnCronograma}
                      onChange={(e) => updateTaskType(tt.id, { showOnCronograma: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-brand-700 focus:ring-brand-700/40"
                      aria-label={t("settings.taskTypes.showOnCronograma")}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={tt.active}
                      onChange={(e) => updateTaskType(tt.id, { active: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-brand-700 focus:ring-brand-700/40"
                      aria-label={t("settings.team.active")}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setPendingDelete(tt)}
                      aria-label={t("action.delete")}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {adding && (
              <tr className="border-b border-border bg-surface/50">
                <td className="px-4 py-2.5">
                  <Select compact value={draft.icon} onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value }))} className="w-20">
                    {ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-2.5">
                  <Input
                    autoFocus
                    placeholder={t("settings.taskTypes.nameEn")}
                    value={draft.nameEn}
                    onChange={(e) => setDraft((d) => ({ ...d, nameEn: e.target.value }))}
                    className="h-8"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <Input
                    placeholder={t("settings.taskTypes.nameEs")}
                    value={draft.nameEs}
                    onChange={(e) => setDraft((d) => ({ ...d, nameEs: e.target.value }))}
                    className="h-8"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={draft.showOnCronograma}
                    onChange={(e) => setDraft((d) => ({ ...d, showOnCronograma: e.target.checked }))}
                    className="h-4 w-4 rounded border-input text-brand-700 focus:ring-brand-700/40"
                    aria-label={t("settings.taskTypes.showOnCronograma")}
                  />
                </td>
                <td className="px-4 py-2.5" colSpan={2}>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAdd}>
                      {t("action.add")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                      {t("action.cancel")}
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!adding && (
        <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" /> {t("settings.taskTypes.add")}
        </Button>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={t("action.delete")}
        body={t("tasks.deleteConfirm.body")}
        confirmLabel={t("action.delete")}
        onConfirm={() => pendingDelete && deleteTaskType(pendingDelete.id)}
      />
    </div>
  );
}
