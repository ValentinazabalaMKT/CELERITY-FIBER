import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { useTaskUI } from "../../context/TaskUIContext";
import { useI18n } from "../../i18n/I18nProvider";
import { SEED_OWNER_IDS } from "../../constants";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { FormField } from "../ui/Input";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import {
  FREQUENCY_VALUES,
  PRIORITY_VALUES,
  STATUS_VALUES,
  type Frequency,
  type Priority,
  type RecurrenceRule,
  type Status,
} from "../../types";

const WEEKDAYS: { value: number; short: string }[] = [
  { value: 0, short: "Sun" },
  { value: 1, short: "Mon" },
  { value: 2, short: "Tue" },
  { value: 3, short: "Wed" },
  { value: 4, short: "Thu" },
  { value: 5, short: "Fri" },
  { value: 6, short: "Sat" },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TaskFormModal() {
  const { isFormOpen, editingTask, prefillDate, closeForm } = useTaskUI();
  const { tasks, teamMembers, taskTypes, categories, createTask, updateTask } = useAppData();
  const { t, locale } = useI18n();

  const isEdit = !!editingTask;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [ownerId, setOwnerId] = useState<string>(SEED_OWNER_IDS.valentina);
  const [parentTaskId, setParentTaskId] = useState<string>("");
  const [status, setStatus] = useState<Status>("pending");
  const [priority, setPriority] = useState<Priority>("medium");
  const [categoryId, setCategoryId] = useState<string>("");
  const [taskTypeId, setTaskTypeId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [dayOfWeek, setDayOfWeek] = useState(5);
  const [recurrenceStart, setRecurrenceStart] = useState(todayIso());
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isFormOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setStartDate(editingTask.startDate ?? "");
      setDueDate(editingTask.dueDate ?? "");
      setOwnerId(editingTask.ownerId ?? "");
      setParentTaskId(editingTask.parentTaskId ?? "");
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setCategoryId(editingTask.categoryId ?? "");
      setTaskTypeId(editingTask.taskTypeId ?? "");
      setNotes(editingTask.notes);
      setIsRecurring(editingTask.isRecurring);
      if (editingTask.recurrence) {
        setFrequency(editingTask.recurrence.frequency);
        setDayOfMonth(editingTask.recurrence.dayOfMonth ?? 1);
        setDayOfWeek(editingTask.recurrence.dayOfWeek ?? 5);
        setRecurrenceStart(editingTask.recurrence.startDate);
        setRecurrenceEnd(editingTask.recurrence.endDate ?? "");
      }
    } else {
      setTitle("");
      setDescription("");
      setStartDate("");
      setDueDate(prefillDate ?? "");
      setOwnerId(SEED_OWNER_IDS.valentina);
      setParentTaskId("");
      setStatus("pending");
      setPriority("medium");
      setCategoryId("");
      setTaskTypeId("");
      setNotes("");
      setIsRecurring(false);
      setFrequency("monthly");
      setDayOfMonth(1);
      setDayOfWeek(5);
      setRecurrenceStart(prefillDate || todayIso());
      setRecurrenceEnd("");
    }
    setTitleError(false);
  }, [isFormOpen, editingTask, prefillDate]);

  if (!isFormOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setSaving(true);
    const recurrence: RecurrenceRule | null = isRecurring
      ? {
          frequency,
          interval: 1,
          dayOfWeek: frequency === "weekly" || frequency === "biweekly" ? dayOfWeek : null,
          dayOfMonth: frequency === "monthly" || frequency === "quarterly" || frequency === "yearly" ? dayOfMonth : null,
          startDate: recurrenceStart || todayIso(),
          endDate: recurrenceEnd || null,
        }
      : null;

    const draft = {
      title: title.trim(),
      description: description.trim(),
      startDate: startDate || null,
      dueDate: dueDate || null,
      ownerId: ownerId || null,
      parentTaskId: parentTaskId || null,
      status,
      priority,
      categoryId: categoryId || null,
      taskTypeId: taskTypeId || null,
      isRecurring,
      recurrence,
      notes: notes.trim(),
    };

    try {
      if (isEdit && editingTask) {
        await updateTask(editingTask.id, draft);
      } else {
        await createTask(draft);
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={isFormOpen}
      onClose={closeForm}
      title={isEdit ? t("form.editTask.title") : t("form.newTask.title")}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={closeForm}>
            {t("action.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {isEdit ? t("action.save") : t("action.create")}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <FormField label={t("field.title")}>
          <Input
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError(false);
            }}
            placeholder={t("form.titlePlaceholder")}
            aria-invalid={titleError}
          />
          {titleError && <p className="mt-1 text-xs text-destructive">{t("form.validation.titleRequired")}</p>}
        </FormField>

        <FormField label={t("field.description")}>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("form.descriptionPlaceholder")}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={t("field.owner")}>
            <Select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">{t("field.unassigned")}</option>
              {teamMembers
                .filter((m) => m.active)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </Select>
          </FormField>
          <FormField label={t("field.taskType")}>
            <Select value={taskTypeId} onChange={(e) => setTaskTypeId(e.target.value)}>
              <option value="">{t("field.noType")}</option>
              {taskTypes
                .filter((tt) => tt.active)
                .map((tt) => (
                  <option key={tt.id} value={tt.id}>
                    {locale === "es" ? tt.nameEs : tt.nameEn}
                  </option>
                ))}
            </Select>
          </FormField>
        </div>

        <FormField label={t("field.parentTask")}>
          <Select value={parentTaskId} onChange={(e) => setParentTaskId(e.target.value)}>
            <option value="">{t("field.noParentTask")}</option>
            {tasks
              .filter((tk) => !tk.parentTaskId && tk.id !== editingTask?.id)
              .map((tk) => (
                <option key={tk.id} value={tk.id}>
                  {tk.title}
                </option>
              ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={t("field.startDate")}>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormField>
          <FormField label={t("field.dueDate")}>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isRecurring} />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label={t("field.status")}>
            <Select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t("field.priority")}>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITY_VALUES.map((p) => (
                <option key={p} value={p}>
                  {t(`priority.${p}`)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t("field.category")}>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">{t("field.noCategory")}</option>
              {categories
                .filter((c) => c.active)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === "es" ? c.nameEs : c.nameEn}
                  </option>
                ))}
            </Select>
          </FormField>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-input text-brand-700 focus:ring-brand-700/40"
            />
            {t("field.isRecurring")}
          </label>

          {isRecurring && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField label={t("field.frequency")}>
                <Select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
                  {FREQUENCY_VALUES.map((f) => (
                    <option key={f} value={f}>
                      {t(`frequency.${f}`)}
                    </option>
                  ))}
                </Select>
              </FormField>

              {(frequency === "weekly" || frequency === "biweekly") && (
                <FormField label={t("field.dayOfWeek")}>
                  <Select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
                    {WEEKDAYS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.short}
                      </option>
                    ))}
                  </Select>
                </FormField>
              )}

              {(frequency === "monthly" || frequency === "quarterly" || frequency === "yearly") && (
                <FormField label={t("field.dayOfMonth")}>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(Number(e.target.value))}
                  />
                </FormField>
              )}

              <FormField label={t("field.recurrenceStart")}>
                <Input type="date" value={recurrenceStart} onChange={(e) => setRecurrenceStart(e.target.value)} />
              </FormField>
              <FormField label={t("field.recurrenceEnd")}>
                <Input type="date" value={recurrenceEnd} onChange={(e) => setRecurrenceEnd(e.target.value)} />
              </FormField>
            </div>
          )}
        </div>

        <FormField label={t("field.notes")}>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("form.notesPlaceholder")} />
        </FormField>
      </div>
    </Dialog>
  );
}
