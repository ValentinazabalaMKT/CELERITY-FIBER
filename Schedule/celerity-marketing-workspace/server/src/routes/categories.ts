import { Router } from "express";
import crypto from "node:crypto";
import { db } from "../db/index.js";
import type { Category } from "../shared/types.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", (_req, res) => {
  const rows = db.prepare(`SELECT * FROM categories ORDER BY sortOrder ASC, createdAt ASC`).all() as Category[];
  res.json(rows.map((r) => ({ ...r, active: !!r.active })));
});

categoriesRouter.post("/", (req, res) => {
  const { nameEn, nameEs } = req.body as Partial<Category>;
  if (!nameEn?.trim() || !nameEs?.trim()) {
    return res.status(400).json({ error: "nameEn and nameEs are required" });
  }
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const maxSort = db.prepare(`SELECT COALESCE(MAX(sortOrder), -1) as m FROM categories`).get() as { m: number };
  db.prepare(
    `INSERT INTO categories (id, nameEn, nameEs, active, sortOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, 1, ?, ?, ?)`
  ).run(id, nameEn.trim(), nameEs.trim(), maxSort.m + 1, now, now);
  const row = db.prepare(`SELECT * FROM categories WHERE id = ?`).get(id) as Category;
  res.status(201).json({ ...row, active: !!row.active });
});

categoriesRouter.patch("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare(`SELECT * FROM categories WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: "Category not found" });

  const { nameEn, nameEs, active } = req.body as Partial<Category>;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE categories SET
      nameEn = COALESCE(?, nameEn),
      nameEs = COALESCE(?, nameEs),
      active = COALESCE(?, active),
      updatedAt = ?
     WHERE id = ?`
  ).run(
    nameEn?.trim() ?? null,
    nameEs?.trim() ?? null,
    typeof active === "boolean" ? (active ? 1 : 0) : null,
    now,
    id
  );
  const row = db.prepare(`SELECT * FROM categories WHERE id = ?`).get(id) as Category;
  res.json({ ...row, active: !!row.active });
});

categoriesRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  const inUse = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE categoryId = ? AND active = 1`).get(id) as {
    c: number;
  };
  if (inUse.c > 0) {
    return res.status(409).json({ error: "Cannot delete a category in use. Deactivate instead." });
  }
  const result = db.prepare(`DELETE FROM categories WHERE id = ?`).run(id);
  if (result.changes === 0) return res.status(404).json({ error: "Category not found" });
  res.status(204).send();
});
