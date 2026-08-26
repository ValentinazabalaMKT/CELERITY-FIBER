import { Router } from "express";
import { db } from "../db/index.js";
import type { WorkspaceSettings } from "../shared/types.js";

export const settingsRouter = Router();

settingsRouter.get("/", (_req, res) => {
  const row = db.prepare(`SELECT * FROM workspace_settings WHERE id = 1`).get() as WorkspaceSettings;
  res.json(row);
});

settingsRouter.patch("/", (req, res) => {
  const { workspaceName, workspaceSubtitle, defaultLanguage, defaultCalendarView, weekStartDay } =
    req.body as Partial<WorkspaceSettings>;

  db.prepare(
    `UPDATE workspace_settings SET
      workspaceName = COALESCE(?, workspaceName),
      workspaceSubtitle = COALESCE(?, workspaceSubtitle),
      defaultLanguage = COALESCE(?, defaultLanguage),
      defaultCalendarView = COALESCE(?, defaultCalendarView),
      weekStartDay = COALESCE(?, weekStartDay)
     WHERE id = 1`
  ).run(
    workspaceName?.trim() ?? null,
    workspaceSubtitle?.trim() ?? null,
    defaultLanguage ?? null,
    defaultCalendarView ?? null,
    typeof weekStartDay === "number" ? weekStartDay : null
  );

  const row = db.prepare(`SELECT * FROM workspace_settings WHERE id = 1`).get() as WorkspaceSettings;
  res.json(row);
});
