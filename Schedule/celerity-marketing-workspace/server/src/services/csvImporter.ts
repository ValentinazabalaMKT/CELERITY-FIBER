import { parse } from "csv-parse/sync";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import iconv from "iconv-lite";
import { db } from "../db/index.js";
import { SEED_IDS } from "../db/seed.js";
import type { Priority } from "../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ImportSummary {
  fileName: string | null;
  imported: number;
  updated: number;
  skippedManuallyEdited: number;
  skippedUnchanged: number;
  totalRows: number;
}

/** Looks for the onboarding CSV near the project root, tolerant of the exact file name. */
export function locateCsvFile(): string | null {
  const candidateDirs = [
    path.resolve(__dirname, "../../../"), // Schedule/celerity-marketing-workspace -> Schedule
    path.resolve(__dirname, "../../../../"), // -> CELERYFIBER
  ];
  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir);
    const match = entries.find(
      (name) => name.toLowerCase().endsWith(".csv") && name.toLowerCase().includes("cronograma")
    );
    if (match) return path.join(dir, match);
  }
  return null;
}

interface ParsedSchedule {
  isOnDemand: boolean;
  frequency: "weekly" | "monthly" | null;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
}

const WEEKDAY_MAP: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  "miércoles": 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  "sábado": 6,
};

function dayFromMonthlyPattern(text: string): number | null {
  const m = text.match(/(\d{1,2})\s*(?:-\s*\d{1,2})?\s*de\s*cada\s*mes/i);
  return m ? parseInt(m[1], 10) : null;
}

function anyDayNumber(text: string): number | null {
  const m = text.match(/\b(\d{1,2})\b/);
  return m ? parseInt(m[1], 10) : null;
}

function parseSchedule(fechaRealizacion: string, fechaMaxima: string): ParsedSchedule {
  const combined = `${fechaRealizacion} ${fechaMaxima}`.toLowerCase();

  if (/segun solicitud|según solicitud/.test(combined)) {
    return { isOnDemand: true, frequency: null, dayOfMonth: null, dayOfWeek: null };
  }

  const isWeekly = /semanalmente/i.test(combined);
  const isMonthly =
    !isWeekly && (/mensualmente/i.test(combined) || /de\s*cada\s*mes/i.test(combined));

  if (isWeekly) {
    let dayOfWeek = 5; // default Friday when no weekday is explicit in the source text
    for (const [name, idx] of Object.entries(WEEKDAY_MAP)) {
      if (combined.includes(name)) {
        dayOfWeek = idx;
        break;
      }
    }
    return { isOnDemand: false, frequency: "weekly", dayOfMonth: null, dayOfWeek };
  }

  if (isMonthly) {
    let day = dayFromMonthlyPattern(fechaMaxima) ?? dayFromMonthlyPattern(fechaRealizacion);
    if (day == null) {
      day = anyDayNumber(fechaMaxima) ?? anyDayNumber(fechaRealizacion);
    }
    if (day == null) {
      if (/fin(al)?\s*(de|del)?\s*mes|finalizar el mes/.test(combined)) day = 28;
      else day = 1;
    }
    day = Math.min(Math.max(day, 1), 31);
    return { isOnDemand: false, frequency: "monthly", dayOfMonth: day, dayOfWeek: null };
  }

  return { isOnDemand: true, frequency: null, dayOfMonth: null, dayOfWeek: null };
}

function mapPriority(nivelImportancia: string): Priority {
  const v = nivelImportancia.toLowerCase();
  if (v.includes("critico") || v.includes("crítico")) return "urgent";
  if (v.includes("alto")) return "high";
  if (v.includes("intermedio")) return "medium";
  if (v.includes("bajo")) return "low";
  return "medium";
}

type TaskTypeKey = keyof typeof SEED_IDS.taskTypes;

function classifyTaskType(title: string, description: string, isOnDemand: boolean): TaskTypeKey {
  const text = `${title} ${description}`.toLowerCase();
  if (/(reunion|reunión|meeting)/.test(text)) return "meeting";
  if (/(campaña|campana|campaign|mailchimp)/.test(text)) return "campaign";
  if (/blog/.test(text)) return "content";
  if (/(reporte|report|dashboard|\bdash\b|ranking)/.test(text)) return "recurringReport";
  if (isOnDemand) return "oneTimeTask";
  return "administrative";
}

function buildNotes(fields: {
  fechaRealizacion: string;
  fechaMaxima: string;
  antiguoEncargado: string;
  ubicacion: string;
  comentarioAdic: string;
  notasCol: string;
  video: string;
  manual: string;
}): string {
  const lines: string[] = [];
  const freq =
    fields.fechaRealizacion || fields.fechaMaxima
      ? `Programación original (CSV): Realización — ${fields.fechaRealizacion || "N/A"} · Fecha máxima — ${
          fields.fechaMaxima || "N/A"
        }`
      : "";
  if (freq) lines.push(freq);
  if (fields.antiguoEncargado.trim()) lines.push(`Encargado anterior (histórico): ${fields.antiguoEncargado.trim()}`);
  if (fields.ubicacion.trim()) lines.push(`Ubicación: ${fields.ubicacion.trim()}`);
  if (fields.comentarioAdic.trim()) lines.push(`Comentario adicional: ${fields.comentarioAdic.trim()}`);
  if (fields.notasCol.trim()) lines.push(`Referencia interna (CSV): ${fields.notasCol.trim()}`);
  if (/^si$/i.test(fields.video.trim())) lines.push("Video disponible: Sí");
  if (/^si$/i.test(fields.manual.trim())) lines.push("Manual disponible: Sí");
  return lines.join("\n");
}

function isDiscontinued(text: string): boolean {
  return /ya no se hace/i.test(text);
}

function hashRow(row: Record<string, string>): string {
  const raw = JSON.stringify(row);
  return crypto.createHash("sha1").update(raw).digest("hex");
}

interface CsvRow {
  "#": string;
  ACTIVIDAD: string;
  DESCRIPCION: string;
  "FECHA REALIZACION": string;
  "FECHA MAXIMA": string;
  "ANTIGUO ENCARGADO": string;
  "NIVEL IMPORTANCIA": string;
  VIDEO: string;
  MANUAL: string;
  "Ubicación": string;
  "Comentario Adic": string;
  Notas: string;
}

export function runCsvImport(): ImportSummary {
  const filePath = locateCsvFile();
  if (!filePath) {
    return { fileName: null, imported: 0, updated: 0, skippedManuallyEdited: 0, skippedUnchanged: 0, totalRows: 0 };
  }

  const raw = fs.readFileSync(filePath);
  const text = iconv.decode(raw, "win1252");
  const records = parse(text, {
    columns: (header: string[]) => header.map((h) => h.trim()),
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as CsvRow[];

  const now = new Date().toISOString();
  let currentCategoryId: string = SEED_IDS.categories.generalOperations;

  const findExisting = db.prepare(
    `SELECT id, sourceRowHash, manuallyEditedAt FROM tasks WHERE source = 'csv-import' AND title = ? AND active = 1`
  );
  const insertTask = db.prepare(`
    INSERT INTO tasks (
      id, title, description, startDate, dueDate, ownerId, status, priority,
      categoryId, taskTypeId, isRecurring, recurrenceFrequency, recurrenceInterval,
      recurrenceDayOfWeek, recurrenceDayOfMonth, recurrenceStartDate, recurrenceEndDate,
      notes, source, sourceRowHash, manuallyEditedAt, active, createdAt, updatedAt
    ) VALUES (
      @id, @title, @description, @startDate, @dueDate, @ownerId, @status, @priority,
      @categoryId, @taskTypeId, @isRecurring, @recurrenceFrequency, @recurrenceInterval,
      @recurrenceDayOfWeek, @recurrenceDayOfMonth, @recurrenceStartDate, @recurrenceEndDate,
      @notes, 'csv-import', @sourceRowHash, NULL, 1, @createdAt, @updatedAt
    )
  `);
  const updateTask = db.prepare(`
    UPDATE tasks SET
      description = @description, dueDate = @dueDate, priority = @priority,
      categoryId = @categoryId, taskTypeId = @taskTypeId, isRecurring = @isRecurring,
      recurrenceFrequency = @recurrenceFrequency, recurrenceInterval = @recurrenceInterval,
      recurrenceDayOfWeek = @recurrenceDayOfWeek, recurrenceDayOfMonth = @recurrenceDayOfMonth,
      recurrenceStartDate = @recurrenceStartDate, recurrenceEndDate = @recurrenceEndDate,
      notes = @notes, sourceRowHash = @sourceRowHash, updatedAt = @updatedAt,
      status = CASE WHEN @forceBlocked = 1 THEN 'blocked' ELSE status END
    WHERE id = @id
  `);

  let imported = 0;
  let updated = 0;
  let skippedManuallyEdited = 0;
  let skippedUnchanged = 0;
  let totalRows = 0;

  // Anchor recurring tasks at the start of the current month, never earlier — the
  // workspace should never surface "past month" noise for a cronograma that only
  // started being tracked here today.
  const importDate = new Date();
  const anchorMonthStart = `${importDate.getFullYear()}-${String(importDate.getMonth() + 1).padStart(2, "0")}-01`;
  const anchorMonthPrefix = anchorMonthStart.slice(0, 7); // "yyyy-MM"

  const tx = db.transaction((rows: CsvRow[]) => {
    for (const row of rows) {
      const idCell = (row["#"] || "").trim();
      const activity = (row["ACTIVIDAD"] || "").trim();

      if (idCell.toUpperCase() === "MARKETING REPORTS" && !activity) {
        currentCategoryId = SEED_IDS.categories.marketingReports;
        continue;
      }
      if (!activity) continue; // skip any other blank/divider rows

      totalRows++;

      const description = (row["DESCRIPCION"] || "").trim();
      const fechaRealizacion = (row["FECHA REALIZACION"] || "").trim();
      const fechaMaxima = (row["FECHA MAXIMA"] || "").trim();
      const antiguoEncargado = row["ANTIGUO ENCARGADO"] || "";
      const nivelImportancia = row["NIVEL IMPORTANCIA"] || "";
      const video = row["VIDEO"] || "";
      const manual = row["MANUAL"] || "";
      const ubicacion = row["Ubicación"] || "";
      const comentarioAdic = row["Comentario Adic"] || "";
      const notasCol = row["Notas"] || "";

      const schedule = parseSchedule(fechaRealizacion, fechaMaxima);
      const priority = mapPriority(nivelImportancia);
      const typeKey = classifyTaskType(activity, description, schedule.isOnDemand);
      const taskTypeId = SEED_IDS.taskTypes[typeKey];
      const notes = buildNotes({
        fechaRealizacion,
        fechaMaxima,
        antiguoEncargado,
        ubicacion,
        comentarioAdic,
        notasCol,
        video,
        manual,
      });
      const discontinued = isDiscontinued(`${fechaMaxima} ${comentarioAdic}`);

      let dueDate: string | null = null;
      let isRecurring = false;
      let recurrenceFrequency: string | null = null;
      let recurrenceDayOfWeek: number | null = null;
      let recurrenceDayOfMonth: number | null = null;
      let recurrenceStartDate: string | null = null;

      if (!schedule.isOnDemand && schedule.frequency === "monthly" && schedule.dayOfMonth) {
        isRecurring = true;
        recurrenceFrequency = "monthly";
        recurrenceDayOfMonth = schedule.dayOfMonth;
        recurrenceStartDate = anchorMonthStart;
        const day = Math.min(schedule.dayOfMonth, 28).toString().padStart(2, "0");
        dueDate = `${anchorMonthPrefix}-${day}`;
      } else if (!schedule.isOnDemand && schedule.frequency === "weekly" && schedule.dayOfWeek != null) {
        isRecurring = true;
        recurrenceFrequency = "weekly";
        recurrenceDayOfWeek = schedule.dayOfWeek;
        recurrenceStartDate = anchorMonthStart;
        dueDate = recurrenceStartDate;
      }

      const rowHash = hashRow(row as unknown as Record<string, string>);
      const existing = findExisting.get(activity) as
        | { id: string; sourceRowHash: string | null; manuallyEditedAt: string | null }
        | undefined;

      if (!existing) {
        insertTask.run({
          id: crypto.randomUUID(),
          title: activity,
          description,
          startDate: null,
          dueDate,
          ownerId: SEED_IDS.owners.valentina,
          status: discontinued ? "blocked" : "pending",
          priority,
          categoryId: currentCategoryId,
          taskTypeId,
          isRecurring: isRecurring ? 1 : 0,
          recurrenceFrequency,
          recurrenceInterval: 1,
          recurrenceDayOfWeek,
          recurrenceDayOfMonth,
          recurrenceStartDate,
          recurrenceEndDate: null,
          notes,
          sourceRowHash: rowHash,
          createdAt: now,
          updatedAt: now,
        });
        imported++;
        continue;
      }

      if (existing.sourceRowHash === rowHash) {
        skippedUnchanged++;
        continue;
      }
      if (existing.manuallyEditedAt) {
        skippedManuallyEdited++;
        continue;
      }

      updateTask.run({
        id: existing.id,
        description,
        dueDate,
        priority,
        categoryId: currentCategoryId,
        taskTypeId,
        isRecurring: isRecurring ? 1 : 0,
        recurrenceFrequency,
        recurrenceInterval: 1,
        recurrenceDayOfWeek,
        recurrenceDayOfMonth,
        recurrenceStartDate,
        recurrenceEndDate: null,
        notes,
        sourceRowHash: rowHash,
        updatedAt: now,
        forceBlocked: discontinued ? 1 : 0,
      });
      updated++;
    }
  });

  tx(records);

  db.prepare(
    `INSERT INTO import_log (id, fileName, importedAt, rowsImported, rowsSkipped) VALUES (?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), path.basename(filePath), now, imported + updated, skippedManuallyEdited + skippedUnchanged);

  return {
    fileName: path.basename(filePath),
    imported,
    updated,
    skippedManuallyEdited,
    skippedUnchanged,
    totalRows,
  };
}

export function hasImportedBefore(): boolean {
  const row = db.prepare("SELECT COUNT(*) as c FROM import_log").get() as { c: number };
  return row.c > 0;
}
