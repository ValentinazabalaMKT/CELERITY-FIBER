import { api } from "./api";
import type { Category } from "../types";

export interface CategoryDraft {
  nameEn: string;
  nameEs: string;
  active?: boolean;
}

export const categoriesApi = {
  list: () => api.get<Category[]>("/categories"),
  create: (draft: CategoryDraft) => api.post<Category>("/categories", draft),
  update: (id: string, patch: Partial<CategoryDraft>) => api.patch<Category>(`/categories/${id}`, patch),
  remove: (id: string) => api.delete<void>(`/categories/${id}`),
};
