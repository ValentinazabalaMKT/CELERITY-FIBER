import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "celerity.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      initials TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS task_types (
      id TEXT PRIMARY KEY,
      nameEn TEXT NOT NULL,
      nameEs TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      showOnCronograma INTEGER NOT NULL DEFAULT 0,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      nameEn TEXT NOT NULL,
      nameEs TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      parentTaskId TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      startDate TEXT,
      dueDate TEXT,
      ownerId TEXT REFERENCES team_members(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      categoryId TEXT REFERENCES categories(id) ON DELETE SET NULL,
      taskTypeId TEXT REFERENCES task_types(id) ON DELETE SET NULL,
      isRecurring INTEGER NOT NULL DEFAULT 0,
      recurrenceFrequency TEXT,
      recurrenceInterval INTEGER,
      recurrenceDayOfWeek INTEGER,
      recurrenceDayOfMonth INTEGER,
      recurrenceStartDate TEXT,
      recurrenceEndDate TEXT,
      notes TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'manual',
      sourceRowHash TEXT,
      manuallyEditedAt TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS task_occurrence_overrides (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      occurrenceDate TEXT NOT NULL,
      status TEXT NOT NULL,
      completedAt TEXT,
      UNIQUE(taskId, occurrenceDate)
    );

    CREATE TABLE IF NOT EXISTS workspace_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      workspaceName TEXT NOT NULL DEFAULT 'Celerity Marketing Workspace',
      workspaceSubtitle TEXT NOT NULL DEFAULT 'Marketing Operations & Planning',
      defaultLanguage TEXT NOT NULL DEFAULT 'es',
      defaultCalendarView TEXT NOT NULL DEFAULT 'month',
      weekStartDay INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS import_log (
      id TEXT PRIMARY KEY,
      fileName TEXT,
      importedAt TEXT NOT NULL,
      rowsImported INTEGER NOT NULL,
      rowsSkipped INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS task_evidence (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      dataBase64 TEXT NOT NULL,
      uploadedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(ownerId);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_duedate ON tasks(dueDate);
    CREATE INDEX IF NOT EXISTS idx_overrides_task ON task_occurrence_overrides(taskId);
    CREATE INDEX IF NOT EXISTS idx_evidence_task ON task_evidence(taskId);
  `);

  addColumnIfMissing("task_types", "showOnCronograma", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing("tasks", "parentTaskId", "TEXT");
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parentTaskId);`);

  // Databases created before this flag existed relied on a hardcoded "Recurring
  // Report" rule for cronograma visibility — preserve that behavior on upgrade.
  db.prepare(
    `UPDATE task_types SET showOnCronograma = 1 WHERE nameEn = 'Recurring Report' AND showOnCronograma = 0`
  ).run();
}

function addColumnIfMissing(table: string, column: string, definition: string): void {
  const existing = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!existing.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
