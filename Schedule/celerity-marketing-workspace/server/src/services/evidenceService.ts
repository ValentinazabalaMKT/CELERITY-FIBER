import crypto from "node:crypto";
import { db } from "../db/index.js";
import type { Evidence } from "../shared/types.js";

interface EvidenceRow {
  id: string;
  taskId: string;
  filename: string;
  mimeType: string;
  dataBase64: string;
  uploadedAt: string;
}

function rowToEvidence(row: EvidenceRow): Evidence {
  return { ...row };
}

export function getEvidenceForTask(taskId: string): Evidence[] {
  const rows = db
    .prepare(`SELECT * FROM task_evidence WHERE taskId = ? ORDER BY uploadedAt ASC`)
    .all(taskId) as EvidenceRow[];
  return rows.map(rowToEvidence);
}

export function addEvidence(
  taskId: string,
  filename: string,
  mimeType: string,
  dataBase64: string
): Evidence {
  const id = crypto.randomUUID();
  const uploadedAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO task_evidence (id, taskId, filename, mimeType, dataBase64, uploadedAt) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, taskId, filename, mimeType, dataBase64, uploadedAt);
  return { id, taskId, filename, mimeType, dataBase64, uploadedAt };
}

export function deleteEvidence(taskId: string, evidenceId: string): boolean {
  const result = db
    .prepare(`DELETE FROM task_evidence WHERE id = ? AND taskId = ?`)
    .run(evidenceId, taskId);
  return result.changes > 0;
}
