import { Router } from "express";
import crypto from "node:crypto";
import { db } from "../db/index.js";
import type { TeamMember } from "../shared/types.js";

export const teamMembersRouter = Router();

teamMembersRouter.get("/", (_req, res) => {
  const rows = db
    .prepare(`SELECT * FROM team_members ORDER BY sortOrder ASC, createdAt ASC`)
    .all() as TeamMember[];
  res.json(rows.map((r) => ({ ...r, active: !!r.active })));
});

teamMembersRouter.post("/", (req, res) => {
  const { name, role, initials } = req.body as Partial<TeamMember>;
  if (!name?.trim() || !role?.trim() || !initials?.trim()) {
    return res.status(400).json({ error: "name, role and initials are required" });
  }
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const maxSort = db.prepare(`SELECT COALESCE(MAX(sortOrder), -1) as m FROM team_members`).get() as {
    m: number;
  };
  db.prepare(
    `INSERT INTO team_members (id, name, role, initials, active, sortOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 1, ?, ?, ?)`
  ).run(id, name.trim(), role.trim(), initials.trim().toUpperCase().slice(0, 3), maxSort.m + 1, now, now);
  const row = db.prepare(`SELECT * FROM team_members WHERE id = ?`).get(id) as TeamMember;
  res.status(201).json({ ...row, active: !!row.active });
});

teamMembersRouter.patch("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare(`SELECT * FROM team_members WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: "Team member not found" });

  const { name, role, initials, active } = req.body as Partial<TeamMember>;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE team_members SET
      name = COALESCE(?, name),
      role = COALESCE(?, role),
      initials = COALESCE(?, initials),
      active = COALESCE(?, active),
      updatedAt = ?
     WHERE id = ?`
  ).run(
    name?.trim() ?? null,
    role?.trim() ?? null,
    initials?.trim().toUpperCase().slice(0, 3) ?? null,
    typeof active === "boolean" ? (active ? 1 : 0) : null,
    now,
    id
  );
  const row = db.prepare(`SELECT * FROM team_members WHERE id = ?`).get(id) as TeamMember;
  res.json({ ...row, active: !!row.active });
});

teamMembersRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  const inUse = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE ownerId = ? AND active = 1`).get(id) as {
    c: number;
  };
  if (inUse.c > 0) {
    return res.status(409).json({ error: "Cannot delete a team member with assigned tasks. Deactivate instead." });
  }
  const result = db.prepare(`DELETE FROM team_members WHERE id = ?`).run(id);
  if (result.changes === 0) return res.status(404).json({ error: "Team member not found" });
  res.status(204).send();
});
