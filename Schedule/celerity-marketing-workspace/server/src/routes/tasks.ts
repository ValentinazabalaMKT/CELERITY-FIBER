import { Router } from "express";
import crypto from "node:crypto";
import { db } from "../db/index.js";
import { getAllTasks, getTaskById } from "../services/taskSerializer.js";
import { addEvidence, deleteEvidence, getEvidenceForTask } from "../services/evidenceService.js";
import { PRIORITY_VALUES, STATUS_VALUES, type RecurrenceRule } from "../shared/types.js";

export const tasksRouter = Router();

tasksRouter.get("/", (_req, res) => {
  res.json(getAllTasks());
});

interface TaskInput {
  parentTaskId?: string | null;
  title?: string;
  description?: string;
  startDate?: string | null;
  dueDate?: string | null;
  ownerId?: string | null;
  status?: string;
  priority?: string;
  categoryId?: string | null;
  taskTypeId?: string | null;
  isRecurring?: boolean;
  recurrence?: RecurrenceRule | null;
  notes?: string;
}

function validateEnum(field: string, value: unknown, allowed: readonly string[]): string | null {
  if (value === undefined) return null;
  if (typeof value !== "string" || !allowed.includes(value)) {
    return `Invalid ${field}: ${String(value)}`;
  }
  return null;
}

tasksRouter.post("/", (req, res) => {
  const body = req.body as TaskInput;
  if (!body.title?.trim()) return res.status(400).json({ error: "title is required" });

  const statusErr = validateEnum("status", body.status, STATUS_VALUES);
  if (statusErr) return res.status(400).json({ error: statusErr });
  const priorityErr = validateEnum("priority", body.priority, PRIORITY_VALUES);
  if (priorityErr) return res.status(400).json({ error: priorityErr });

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const recurrence = body.isRecurring ? body.recurrence ?? null : null;

  if (body.parentTaskId && !getTaskById(body.parentTaskId)) {
    return res.status(400).json({ error: "parentTaskId does not reference an existing task" });
  }

  db.prepare(
    `INSERT INTO tasks (
      id, parentTaskId, title, description, startDate, dueDate, ownerId, status, priority,
      categoryId, taskTypeId, isRecurring, recurrenceFrequency, recurrenceInterval,
      recurrenceDayOfWeek, recurrenceDayOfMonth, recurrenceStartDate, recurrenceEndDate,
      notes, source, sourceRowHash, manuallyEditedAt, active, createdAt, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, 'manual', NULL, NULL, 1, ?, ?
    )`
  ).run(
    id,
    body.parentTaskId ?? null,
    body.title.trim(),
    body.description?.trim() ?? "",
    body.startDate ?? null,
    body.dueDate ?? null,
    body.ownerId ?? null,
    body.status ?? "pending",
    body.priority ?? "medium",
    body.categoryId ?? null,
    body.taskTypeId ?? null,
    recurrence ? 1 : 0,
    recurrence?.frequency ?? null,
    recurrence?.interval ?? null,
    recurrence?.dayOfWeek ?? null,
    recurrence?.dayOfMonth ?? null,
    recurrence?.startDate ?? null,
    recurrence?.endDate ?? null,
    body.notes?.trim() ?? "",
    now,
    now
  );

  res.status(201).json(getTaskById(id));
});

tasksRouter.patch("/:id", (req, res) => {
  const { id } = req.params;
  const existing = getTaskById(id);
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const body = req.body as TaskInput;
  const statusErr = validateEnum("status", body.status, STATUS_VALUES);
  if (statusErr) return res.status(400).json({ error: statusErr });
  const priorityErr = validateEnum("priority", body.priority, PRIORITY_VALUES);
  if (priorityErr) return res.status(400).json({ error: priorityErr });

  const now = new Date().toISOString();
  const nextIsRecurring = body.isRecurring ?? existing.isRecurring;
  const recurrence = nextIsRecurring ? body.recurrence ?? existing.recurrence : null;

  if (body.parentTaskId !== undefined && body.parentTaskId === id) {
    return res.status(400).json({ error: "A task cannot be its own parent" });
  }

  db.prepare(
    `UPDATE tasks SET
      parentTaskId = ?, title = ?, description = ?, startDate = ?, dueDate = ?, ownerId = ?,
      status = ?, priority = ?, categoryId = ?, taskTypeId = ?,
      isRecurring = ?, recurrenceFrequency = ?, recurrenceInterval = ?,
      recurrenceDayOfWeek = ?, recurrenceDayOfMonth = ?, recurrenceStartDate = ?, recurrenceEndDate = ?,
      notes = ?, manuallyEditedAt = ?, updatedAt = ?
     WHERE id = ?`
  ).run(
    body.parentTaskId !== undefined ? body.parentTaskId : existing.parentTaskId,
    body.title?.trim() ?? existing.title,
    body.description !== undefined ? body.description.trim() : existing.description,
    body.startDate !== undefined ? body.startDate : existing.startDate,
    body.dueDate !== undefined ? body.dueDate : existing.dueDate,
    body.ownerId !== undefined ? body.ownerId : existing.ownerId,
    body.status ?? existing.status,
    body.priority ?? existing.priority,
    body.categoryId !== undefined ? body.categoryId : existing.categoryId,
    body.taskTypeId !== undefined ? body.taskTypeId : existing.taskTypeId,
    nextIsRecurring ? 1 : 0,
    recurrence?.frequency ?? null,
    recurrence?.interval ?? null,
    recurrence?.dayOfWeek ?? null,
    recurrence?.dayOfMonth ?? null,
    recurrence?.startDate ?? null,
    recurrence?.endDate ?? null,
    body.notes !== undefined ? body.notes.trim() : existing.notes,
    now,
    now,
    id
  );

  res.json(getTaskById(id));
});

tasksRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  const existing = getTaskById(id);
  if (!existing) return res.status(404).json({ error: "Task not found" });
  const now = new Date().toISOString();
  db.prepare(`UPDATE tasks SET active = 0, updatedAt = ? WHERE id = ?`).run(now, id);
  res.status(204).send();
});

interface OccurrenceInput {
  date?: string;
  status?: string;
}

tasksRouter.patch("/:id/occurrences/:date", (req, res) => {
  const { id, date } = req.params;
  const task = getTaskById(id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const body = req.body as OccurrenceInput;
  const statusErr = validateEnum("status", body.status, STATUS_VALUES);
  if (statusErr) return res.status(400).json({ error: statusErr });
  if (!body.status) return res.status(400).json({ error: "status is required" });

  const completedAt = body.status === "completed" ? new Date().toISOString() : null;

  db.prepare(
    `INSERT INTO task_occurrence_overrides (id, taskId, occurrenceDate, status, completedAt)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(taskId, occurrenceDate) DO UPDATE SET status = excluded.status, completedAt = excluded.completedAt`
  ).run(crypto.randomUUID(), id, date, body.status, completedAt);

  res.json(getTaskById(id));
});

interface EvidenceInput {
  filename?: string;
  mimeType?: string;
  dataBase64?: string;
}

const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024; // 8MB per file, generous for screenshots

tasksRouter.get("/:id/evidence", (req, res) => {
  const { id } = req.params;
  if (!getTaskById(id)) return res.status(404).json({ error: "Task not found" });
  res.json(getEvidenceForTask(id));
});

tasksRouter.post("/:id/evidence", (req, res) => {
  const { id } = req.params;
  if (!getTaskById(id)) return res.status(404).json({ error: "Task not found" });

  const body = req.body as EvidenceInput;
  if (!body.filename?.trim()) return res.status(400).json({ error: "filename is required" });
  if (!body.mimeType?.trim() || !body.mimeType.startsWith("image/")) {
    return res.status(400).json({ error: "mimeType must be an image/* type" });
  }
  if (!body.dataBase64?.trim()) return res.status(400).json({ error: "dataBase64 is required" });

  const approxBytes = (body.dataBase64.length * 3) / 4;
  if (approxBytes > MAX_EVIDENCE_BYTES) {
    return res.status(400).json({ error: "Evidence file too large (max 8MB)" });
  }

  const evidence = addEvidence(id, body.filename.trim(), body.mimeType.trim(), body.dataBase64);
  res.status(201).json(evidence);
});

tasksRouter.delete("/:id/evidence/:evidenceId", (req, res) => {
  const { id, evidenceId } = req.params;
  if (!getTaskById(id)) return res.status(404).json({ error: "Task not found" });
  const removed = deleteEvidence(id, evidenceId);
  if (!removed) return res.status(404).json({ error: "Evidence not found" });
  res.status(204).send();
});
