import { api } from "./api";
import type { Evidence } from "../types";

export interface EvidenceDraft {
  filename: string;
  mimeType: string;
  dataBase64: string;
}

export const evidenceApi = {
  list: (taskId: string) => api.get<Evidence[]>(`/tasks/${taskId}/evidence`),
  upload: (taskId: string, draft: EvidenceDraft) => api.post<Evidence>(`/tasks/${taskId}/evidence`, draft),
  remove: (taskId: string, evidenceId: string) => api.delete<void>(`/tasks/${taskId}/evidence/${evidenceId}`),
};

/** Reads a File as a base64 data payload (without the `data:mime;base64,` prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
