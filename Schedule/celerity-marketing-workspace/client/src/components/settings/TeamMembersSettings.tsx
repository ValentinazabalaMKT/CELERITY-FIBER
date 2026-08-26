import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { useI18n } from "../../i18n/I18nProvider";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Input } from "../ui/Input";
import type { TeamMember } from "../../types";

export function TeamMembersSettings() {
  const { teamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = useAppData();
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", role: "", initials: "" });
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);

  const handleAdd = async () => {
    if (!draft.name.trim() || !draft.role.trim()) return;
    const initials = draft.initials.trim() || draft.name.trim().slice(0, 2).toUpperCase();
    await createTeamMember({ name: draft.name.trim(), role: draft.role.trim(), initials });
    setDraft({ name: "", role: "", initials: "" });
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">{t("settings.team.name")}</th>
              <th className="px-4 py-3">{t("settings.team.role")}</th>
              <th className="px-4 py-3 w-24">{t("settings.team.initials")}</th>
              <th className="px-4 py-3 w-24">{t("settings.team.active")}</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={member.initials} size="xs" />
                    <Input
                      defaultValue={member.name}
                      onBlur={(e) => e.target.value.trim() && e.target.value !== member.name && updateTeamMember(member.id, { name: e.target.value.trim() })}
                      className="h-8 border-transparent bg-transparent px-1 hover:border-input focus:border-brand-700 focus:bg-white"
                    />
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <Input
                    defaultValue={member.role}
                    onBlur={(e) => e.target.value.trim() && e.target.value !== member.role && updateTeamMember(member.id, { role: e.target.value.trim() })}
                    className="h-8 border-transparent bg-transparent px-1 hover:border-input focus:border-brand-700 focus:bg-white"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <Input
                    defaultValue={member.initials}
                    maxLength={3}
                    onBlur={(e) =>
                      e.target.value.trim() &&
                      e.target.value.toUpperCase() !== member.initials &&
                      updateTeamMember(member.id, { initials: e.target.value.trim().toUpperCase() })
                    }
                    className="h-8 w-16 border-transparent bg-transparent px-1 text-center hover:border-input focus:border-brand-700 focus:bg-white"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={member.active}
                    onChange={(e) => updateTeamMember(member.id, { active: e.target.checked })}
                    className="h-4 w-4 rounded border-input text-brand-700 focus:ring-brand-700/40"
                    aria-label={t("settings.team.active")}
                  />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setPendingDelete(member)}
                    aria-label={t("action.delete")}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {adding && (
              <tr className="border-b border-border bg-surface/50">
                <td className="px-4 py-2.5">
                  <Input
                    autoFocus
                    placeholder={t("settings.team.name")}
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="h-8"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <Input
                    placeholder={t("settings.team.role")}
                    value={draft.role}
                    onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                    className="h-8"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <Input
                    placeholder="AB"
                    maxLength={3}
                    value={draft.initials}
                    onChange={(e) => setDraft((d) => ({ ...d, initials: e.target.value }))}
                    className="h-8 w-16 text-center"
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
          <Plus className="h-3.5 w-3.5" /> {t("settings.team.add")}
        </Button>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={t("action.delete")}
        body={t("tasks.deleteConfirm.body")}
        confirmLabel={t("action.delete")}
        onConfirm={() => pendingDelete && deleteTeamMember(pendingDelete.id)}
      />
    </div>
  );
}
