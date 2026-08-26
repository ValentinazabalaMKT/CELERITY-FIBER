import { Router } from "express";
import { runCsvImport } from "../services/csvImporter.js";

export const importRouter = Router();

importRouter.post("/csv", (_req, res) => {
  const summary = runCsvImport();
  if (!summary.fileName) {
    return res.status(404).json({ error: "No cronograma CSV file found near the project." });
  }
  res.json(summary);
});
