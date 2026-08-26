import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, ListTree, Paperclip, Repeat, Trash2, Upload } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { useTaskUI } from "../../context/TaskUIContext";
import { useI18n } from "../../i18n/I18nProvider";
import { useLookups } from "../../hooks/useLookups";
import { computeUrgency, resolveOccurrenceStatus } from "../../shared/taskLogic";
import { formatDate } from "../../utils/dates";
import { fileToBase64 } from "../../services/evidenceApi";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Select } from "../ui/Select";
import { Sheet } from "../ui/Sheet";
import { OwnerPill } from "./OwnerPill";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { TaskTypeBadge } from "./TaskTypeBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { STATUS_VALUES, type Evidence, type Status } from "../../types";

export function TaskDetailPanel() {
  const { detailTask, detailOccurrenceDate, closeDetail, openEditTask, openDetail } = useTaskUI();
  const { tasks, deleteTask, setOccurrenceStatus, updateTask, listEvidence, uploadEvidence, deleteEvidence } =
    useAppData();
  const { ownerById, taskTypeById, categoryById } = useLookups();
  const { t, locale } = useI18n();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pendingDeleteEvidence, setPendingDeleteEvidence] = useState<Evidence | null>(null);
  const [subtasksExpanded, setSubtasksExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!detailTask) return;
    let cancelled = false;
    listEvidence(detailTask.id).then((list) => {
      if (!cancelled) setEvidence(list);
    });
    return () => {
      cancelled = true;
    };
  }, [detailTask, listEvidence]);

  if (!detailTask) return null;

  const task = detailTask;
  const occurrenceDate = detailOccurrenceDate ?? task.dueDate;
  const resolved = occurrenceDate ? resolveOccurrenceStatus(task, occurrenceDate) : null;
  const effectiveStatus: Status = resolved?.status ?? task.status;
  const urgency = occurrenceDate ? computeUrgency(occurrenceDate, effectiveStatus) : null;

  const owner = task.ownerId ? ownerById.get(task.ownerId) : undefined;
  const taskType = task.taskTypeId ? taskTypeById.get(task.taskTypeId) : undefined;
  const category = task.categoryId ? categoryById.get(task.categoryId) : undefined;

  const subtasks = tasks.filter((tk) => tk.parentTaskId === task.id);
  const assigneeIds = Array.from(
    new Set([task.ownerId, ...subtasks.map((s) => s.ownerId)].filter((id): id is string => !!id))
  );
  const assignees = assigneeIds.map((id) => ownerById.get(id)).filter((m): m is NonNullable<typeof m> => !!m);

  const handleStatusChange = (status: Status) => {
    if (task.isRecurring && occurrenceDate) {
      setOccurrenceStatus(task.id, occurrenceDate, status);
    } else {
      updateTask(task.id, { status });
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const dataBase64 = await fileToBase64(file);
        const created = await uploadEvidence(task.id, {
          filename: file.name,
          mimeType: file.type || "image/png",
          dataBase64,
        });
        setEvidence((prev) => [...prev, created]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmDeleteEvidence = async () => {
    if (!pendingDeleteEvidence) return;
    await deleteEvidence(task.id, pendingDeleteEvidence.id);
    setEvidence((prev) => prev.filter((ev) => ev.id !== pendingDeleteEvidence.id));
    setPendingDeleteEvidence(null);
  };

  return (
    <>
      <Sheet open={!!detailTask} onClose={closeDetail}>
        <div className="flex-1 px-6 pb-6 pt-14">
          <div className="mb-4 flex items-center gap-2">
            <TaskTypeBadge taskType={taskType} />
            {urgency && <UrgencyBadge urgency={urgency} />}
          </div>
          <h2 className="font-display text-xl font-bold leading-snug text-foreground">{task.title}</h2>

          <div className="mt-6 grid grid-cols-2 gap-5">
            <DetailField label={t("detail.status")}>
              <Select
                compact
                value={effectiveStatus}
                onChange={(e) => handleStatusChange(e.target.value as Status)}
                aria-label={t("detail.status")}
              >
                {STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}`)}
                  </option>
                ))}
              </Select>
            </DetailField>
            <DetailField label={t("detail.priority")}>
              <PriorityBadge priority={task.priority} />
            </DetailField>

            <DetailField label={t("detail.owner")}>
              <OwnerPill owner={owner} />
              {owner && <p className="mt-0.5 text-xs text-muted-foreground">{owner.role}</p>}
            </DetailField>
            <DetailField label={t("detail.dueDate")}>
              <span className="text-sm text-foreground">
                {occurrenceDate ? formatDate(occurrenceDate, locale, "long") : t("field.onDemand")}
              </span>
            </DetailField>

            <DetailField label={t("detail.category")}>
              <span className="text-sm text-foreground">
                {category ? (locale === "es" ? category.nameEs : category.nameEn) : t("field.noCategory")}
              </span>
            </DetailField>
            <DetailField label={t("detail.taskType")}>
              <TaskTypeBadge taskType={taskType} />
            </DetailField>
          </div>

          {assignees.length > 1 && (
            <div className="mt-5">
              <DetailField label={t("detail.assignees")}>
                <div className="flex flex-wrap gap-3">
                  {assignees.map((member) => (
                    <OwnerPill key={member.id} owner={member} />
                  ))}
                </div>
              </DetailField>
            </div>
          )}

          {subtasks.length > 0 && (
            <div className="mt-5 rounded-lg border border-border bg-surface">
              <button
                type="button"
                onClick={() => setSubtasksExpanded((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left"
              >
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <ListTree className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("detail.subtasks")} ({subtasks.length})
                </span>
                {subtasksExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
              {subtasksExpanded && (
                <div className="divide-y divide-border border-t border-border">
                  {subtasks.map((sub) => {
                    const subOwner = sub.ownerId ? ownerById.get(sub.ownerId) : undefined;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => openDetail(sub)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{sub.title}</p>
                          {subOwner && <p className="truncate text-xs text-muted-foreground">{subOwner.name}</p>}
                        </div>
                        <StatusBadge status={sub.status} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {task.isRecurring && task.recurrence && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
              <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
              {t(`frequency.${task.recurrence.frequency}`)}
              {task.recurrence.dayOfMonth ? ` · ${t("field.dayOfMonth")} ${task.recurrence.dayOfMonth}` : ""}
            </div>
          )}

          <div className="mt-6">
            <DetailField label={t("detail.description")}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {task.description || t("detail.noDescription")}
              </p>
            </DetailField>
          </div>

          <div className="mt-6">
            <DetailField label={t("detail.notes")}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {task.notes || t("detail.noNotes")}
              </p>
            </DetailField>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("detail.evidence")}
                {evidence.length > 0 && (
                  <span className="ml-1.5 normal-case text-muted-foreground/80">
                    ({evidence.length} {t("evidence.fileCountLabel")})
                  </span>
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading ? t("detail.evidence.uploading") : t("detail.evidence.upload")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </div>

            {evidence.length === 0 ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                {t("detail.evidence.empty")}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {evidence.map((ev) => (
                  <div key={ev.id} className="group relative overflow-hidden rounded-lg border border-border bg-surface">
                    <a
                      href={`data:${ev.mimeType};base64,${ev.dataBase64}`}
                      target="_blank"
                      rel="noreferrer"
                      title={ev.filename}
                    >
                      <img
                        src={`data:${ev.mimeType};base64,${ev.dataBase64}`}
                        alt={ev.filename}
                        className="h-24 w-full object-cover"
                      />
                    </a>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteEvidence(ev)}
                      aria-label={t("action.delete")}
                      className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {t(`detail.source.${task.source}`)}
          </div>

          <div className="mt-8 flex items-center gap-2 border-t border-border pt-5">
            <Button onClick={() => openEditTask(task)} className="flex-1">
              {t("action.editTask")}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setConfirmDelete(true)} aria-label={t("action.delete")}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t("tasks.deleteConfirm.title")}
        body={t("tasks.deleteConfirm.body")}
        confirmLabel={t("action.delete")}
        onConfirm={() => {
          deleteTask(task.id);
          closeDetail();
        }}
      />

      <ConfirmDialog
        open={!!pendingDeleteEvidence}
        onClose={() => setPendingDeleteEvidence(null)}
        title={t("detail.evidence.deleteConfirm.title")}
        body={t("detail.evidence.deleteConfirm.body")}
        confirmLabel={t("action.delete")}
        onConfirm={handleConfirmDeleteEvidence}
      />
    </>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
