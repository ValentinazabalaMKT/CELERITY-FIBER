import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { migrate } from "./db/index.js";
import { seed } from "./db/seed.js";
import { categoriesRouter } from "./routes/categories.js";
import { importRouter } from "./routes/importCsv.js";
import { settingsRouter } from "./routes/settings.js";
import { taskTypesRouter } from "./routes/taskTypes.js";
import { tasksRouter } from "./routes/tasks.js";
import { teamMembersRouter } from "./routes/teamMembers.js";
import { hasImportedBefore, runCsvImport } from "./services/csvImporter.js";

migrate();
seed();

if (!hasImportedBefore()) {
  const summary = runCsvImport();
  if (summary.fileName) {
    console.log(
      `[csv-import] Imported ${summary.imported} tasks from "${summary.fileName}" (updated ${summary.updated}, skipped ${
        summary.skippedManuallyEdited + summary.skippedUnchanged
      }).`
    );
  } else {
    console.warn("[csv-import] No cronograma CSV file was found near the project on startup.");
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/team-members", teamMembersRouter);
app.use("/api/task-types", taskTypesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/import", importRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[server error]", err);
  const message = err instanceof Error ? err.message : "Unexpected server error";
  res.status(500).json({ error: message });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Celerity Marketing Workspace API listening on http://localhost:${PORT}`);
});
