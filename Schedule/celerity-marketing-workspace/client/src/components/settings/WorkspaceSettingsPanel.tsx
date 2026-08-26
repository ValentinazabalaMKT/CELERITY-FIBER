import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { useI18n } from "../../i18n/I18nProvider";
import { Button } from "../ui/Button";
import { Card, CardBody } from "../ui/Card";
import { FormField } from "../ui/Input";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import type { CalendarView, Language } from "../../types";

export function WorkspaceSettingsPanel() {
  const { settings, updateSettings } = useAppData();
  const { t } = useI18n();

  const [name, setName] = useState(settings?.workspaceName ?? "");
  const [subtitle, setSubtitle] = useState(settings?.workspaceSubtitle ?? "");
  const [defaultLanguage, setDefaultLanguage] = useState<Language>(settings?.defaultLanguage ?? "en");
  const [defaultView, setDefaultView] = useState<CalendarView>(settings?.defaultCalendarView ?? "month");
  const [weekStart, setWeekStart] = useState<0 | 1>(settings?.weekStartDay ?? 1);

  useEffect(() => {
    if (!settings) return;
    setName(settings.workspaceName);
    setSubtitle(settings.workspaceSubtitle);
    setDefaultLanguage(settings.defaultLanguage);
    setDefaultView(settings.defaultCalendarView);
    setWeekStart(settings.weekStartDay);
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      workspaceName: name.trim() || undefined,
      workspaceSubtitle: subtitle.trim() || undefined,
      defaultLanguage,
      defaultCalendarView: defaultView,
      weekStartDay: weekStart,
    });
  };

  return (
    <Card>
      <CardBody className="space-y-5 pt-5">
        <FormField label={t("settings.workspace.name")}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t("settings.workspace.subtitle")}>
          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label={t("settings.workspace.defaultLanguage")}>
            <Select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value as Language)}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </FormField>
          <FormField label={t("settings.workspace.defaultView")}>
            <Select value={defaultView} onChange={(e) => setDefaultView(e.target.value as CalendarView)}>
              <option value="week">{t("calendar.week")}</option>
              <option value="month">{t("calendar.month")}</option>
              <option value="year">{t("calendar.year")}</option>
            </Select>
          </FormField>
          <FormField label={t("settings.workspace.weekStart")}>
            <Select value={weekStart} onChange={(e) => setWeekStart(Number(e.target.value) as 0 | 1)}>
              <option value={1}>{t("settings.workspace.monday")}</option>
              <option value={0}>{t("settings.workspace.sunday")}</option>
            </Select>
          </FormField>
        </div>
        <div className="flex justify-end border-t border-border pt-4">
          <Button onClick={handleSave}>{t("action.save")}</Button>
        </div>
      </CardBody>
    </Card>
  );
}
