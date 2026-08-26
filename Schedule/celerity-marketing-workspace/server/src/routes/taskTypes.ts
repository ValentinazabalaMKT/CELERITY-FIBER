import { Router } from "express";
import crypto from "node:crypto";
import { db } from "../db/index.js";
import type { TaskType } from "../shared/types.js";

export const taskTypesRouter = Router();

function serialize(row: TaskType): TaskType {
  return { ...row, active: !!row.active, showOnCronograma: !!row.showOnCronograma };
}

taskTypesRouter.get("/", (_req, res) => {
  const rows = db.prepare(`SELECT * FROM task_types ORDER BY sortOrder ASC, createdAt ASC`).all() as TaskType[];
  res.json(rows.map(serialize));
});

taskTypesRouter.post("/", (req, res) => {
  const { nameEn, nameEs, icon, color, showOnCronograma } = req.body as Partial<TaskType>;
  if (!nameEn?.trim() || !nameEs?.trim() || !icon?.trim()) {
    return res.status(400).json({ error: "nameEn, nameEs and icon are required" });
  }
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const maxSort = db.prepare(`SELECT COALESCE(MAX(sortOrder), -1) as m FROM task_types`).get() as { m: number };
  db.prepare(
    `INSERT INTO task_types (id, nameEn, nameEs, icon, color, active, showOnCronograma, sortOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`
  ).run(id, nameEn.trim(), nameEs.trim(), icon.trim(), color ?? null, showOnCronograma ? 1 : 0, maxSort.m + 1, now, now);
  const row = db.prepare(`SELECT * FROM task_types WHERE id = ?`).get(id) as TaskType;
  res.status(201).json(serialize(row));
});

taskTypesRouter.patch("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare(`SELECT * FROM task_types WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: "Task type not found" });

  const { nameEn, nameEs, icon, color, active, showOnCronograma } = req.body as Partial<TaskType>;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE task_types SET
      nameEn = COALESCE(?, nameEn),
      nameEs = COALESCE(?, nameEs),
      icon = COALESCE(?, icon),
      color = COALESCE(?, color),
      active = COALESCE(?, active),
      showOnCronograma = COALESCE(?, showOnCronograma),
      updatedAt = ?
     WHERE id = ?`
  ).run(
    nameEn?.trim() ?? null,
    nameEs?.trim() ?? null,
    icon?.trim() ?? null,
    color ?? null,
    typeof active === "boolean" ? (active ? 1 : 0) : null,
    typeof showOnCronograma === "boolean" ? (showOnCronograma ? 1 : 0) : null,
    now,
    id
  );
  const row = db.prepare(`SELECT * FROM task_types WHERE id = ?`).get(id) as TaskType;
  res.json(serialize(row));
});

taskTypesRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  const inUse = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE taskTypeId = ? AND active = 1`).get(id) as {
    c: number;
  };
  if (inUse.c > 0) {
    return res.status(409).json({ error: "Cannot delete a task type in use. Deactivate instead." });
  }
  const result = db.prepare(`DELETE FROM task_types WHERE id = ?`).run(id);
  if (result.changes === 0) return res.status(404).json({ error: "Task type not found" });
  res.status(204).send();
});
