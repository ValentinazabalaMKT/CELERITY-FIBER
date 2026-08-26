import { api } from "./api";

export interface ImportSummary {
  fileName: string | null;
  imported: number;
  updated: number;
  skippedManuallyEdited: number;
  skippedUnchanged: number;
  totalRows: number;
}

export const importApi = {
  runCsvImport: () => api.post<ImportSummary>("/import/csv"),
};
