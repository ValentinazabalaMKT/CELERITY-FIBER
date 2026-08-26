import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { categoriesApi, type CategoryDraft } from "../services/categoriesApi";
import { evidenceApi, type EvidenceDraft } from "../services/evidenceApi";
import { importApi, type ImportSummary } from "../services/importApi";
import { settingsApi } from "../services/settingsApi";
import { taskTypesApi, type TaskTypeDraft } from "../services/taskTypesApi";
import { tasksApi, type TaskDraft } from "../services/tasksApi";
import { teamApi, type TeamMemberDraft } from "../services/teamApi";
import type { Category, Evidence, Status, Task, TaskType, TeamMember, WorkspaceSettings } from "../types";
import { useToast } from "./ToastContext";
import { useI18n } from "../i18n/I18nProvider";

interface AppDataContextValue {
  loading: boolean;
  error: string | null;
  tasks: Task[];
  teamMembers: TeamMember[];
  taskTypes: TaskType[];
  categories: Category[];
  settings: WorkspaceSettings | null;

  createTask: (draft: TaskDraft) => Promise<Task>;
  updateTask: (id: string, patch: Partial<TaskDraft>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setOccurrenceStatus: (taskId: string, date: string, status: Status) => Promise<Task>;

  listEvidence: (taskId: string) => Promise<Evidence[]>;
  uploadEvidence: (taskId: string, draft: EvidenceDraft) => Promise<Evidence>;
  deleteEvidence: (taskId: string, evidenceId: string) => Promise<void>;

  createTeamMember: (draft: TeamMemberDraft) => Promise<TeamMember>;
  updateTeamMember: (id: string, patch: Partial<TeamMemberDraft>) => Promise<TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;

  createTaskType: (draft: TaskTypeDraft) => Promise<TaskType>;
  updateTaskType: (id: string, patch: Partial<TaskTypeDraft>) => Promise<TaskType>;
  deleteTaskType: (id: string) => Promise<void>;

  createCategory: (draft: CategoryDraft) => Promise<Category>;
  updateCategory: (id: string, patch: Partial<CategoryDraft>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  updateSettings: (patch: Partial<WorkspaceSettings>) => Promise<WorkspaceSettings>;
  reimportCsv: () => Promise<ImportSummary>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const { t, setLocale } = useI18n();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [hasSyncedLocale, setHasSyncedLocale] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t1, tm, tt, c, s] = await Promise.all([
        tasksApi.list(),
        teamApi.list(),
        taskTypesApi.list(),
        categoriesApi.list(),
        settingsApi.get(),
      ]);
      setTasks(t1);
      setTeamMembers(tm);
      setTaskTypes(tt);
      setCategories(c);
      setSettings(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspace data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Apply workspace default language once, unless the user already picked one explicitly.
  useEffect(() => {
    if (settings && !hasSyncedLocale) {
      if (!localStorage.getItem("celerity.locale")) {
        setLocale(settings.defaultLanguage);
      }
      setHasSyncedLocale(true);
    }
  }, [settings, hasSyncedLocale, setLocale]);

  const handleError = useCallback(
    (err: unknown) => {
      const message = err instanceof Error ? err.message : t("toast.error");
      showToast(message, "error");
      throw err;
    },
    [showToast, t]
  );

  // --- Tasks -----------------------------------------------------------
  const createTask = useCallback(
    async (draft: TaskDraft) => {
      try {
        const task = await tasksApi.create(draft);
        setTasks((prev) => [...prev, task]);
        showToast(t("toast.taskCreated"));
        return task;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<TaskDraft>) => {
      try {
        const task = await tasksApi.update(id, patch);
        setTasks((prev) => prev.map((tk) => (tk.id === id ? task : tk)));
        showToast(t("toast.taskUpdated"));
        return task;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await tasksApi.remove(id);
        setTasks((prev) => prev.filter((tk) => tk.id !== id));
        showToast(t("toast.taskDeleted"));
      } catch (err) {
        handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const setOccurrenceStatus = useCallback(
    async (taskId: string, date: string, status: Status) => {
      try {
        const task = await tasksApi.setOccurrenceStatus(taskId, date, status);
        setTasks((prev) => prev.map((tk) => (tk.id === taskId ? task : tk)));
        showToast(t("toast.taskUpdated"));
        return task;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  // --- Evidence ----------------------------------------------------------
  const listEvidence = useCallback(
    async (taskId: string) => {
      try {
        return await evidenceApi.list(taskId);
      } catch (err) {
        return handleError(err);
      }
    },
    [handleError]
  );

  const uploadEvidence = useCallback(
    async (taskId: string, draft: EvidenceDraft) => {
      try {
        const evidence = await evidenceApi.upload(taskId, draft);
        setTasks((prev) => prev.map((tk) => (tk.id === taskId ? { ...tk, evidenceCount: tk.evidenceCount + 1 } : tk)));
        showToast(t("toast.evidenceUploaded"));
        return evidence;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const deleteEvidence = useCallback(
    async (taskId: string, evidenceId: string) => {
      try {
        await evidenceApi.remove(taskId, evidenceId);
        setTasks((prev) =>
          prev.map((tk) => (tk.id === taskId ? { ...tk, evidenceCount: Math.max(0, tk.evidenceCount - 1) } : tk))
        );
        showToast(t("toast.evidenceDeleted"));
      } catch (err) {
        handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  // --- Team members ------------------------------------------------------
  const createTeamMember = useCallback(
    async (draft: TeamMemberDraft) => {
      try {
        const member = await teamApi.create(draft);
        setTeamMembers((prev) => [...prev, member]);
        showToast(t("toast.memberSaved"));
        return member;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const updateTeamMember = useCallback(
    async (id: string, patch: Partial<TeamMemberDraft>) => {
      try {
        const member = await teamApi.update(id, patch);
        setTeamMembers((prev) => prev.map((m) => (m.id === id ? member : m)));
        showToast(t("toast.memberSaved"));
        return member;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const deleteTeamMember = useCallback(
    async (id: string) => {
      try {
        await teamApi.remove(id);
        setTeamMembers((prev) => prev.filter((m) => m.id !== id));
        showToast(t("toast.memberSaved"));
      } catch (err) {
        handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  // --- Task types ----------------------------------------------------
  const createTaskType = useCallback(
    async (draft: TaskTypeDraft) => {
      try {
        const type = await taskTypesApi.create(draft);
        setTaskTypes((prev) => [...prev, type]);
        showToast(t("toast.typeSaved"));
        return type;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const updateTaskType = useCallback(
    async (id: string, patch: Partial<TaskTypeDraft>) => {
      try {
        const type = await taskTypesApi.update(id, patch);
        setTaskTypes((prev) => prev.map((tt) => (tt.id === id ? type : tt)));
        showToast(t("toast.typeSaved"));
        return type;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const deleteTaskType = useCallback(
    async (id: string) => {
      try {
        await taskTypesApi.remove(id);
        setTaskTypes((prev) => prev.filter((tt) => tt.id !== id));
        showToast(t("toast.typeSaved"));
      } catch (err) {
        handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  // --- Categories ------------------------------------------------------
  const createCategory = useCallback(
    async (draft: CategoryDraft) => {
      try {
        const category = await categoriesApi.create(draft);
        setCategories((prev) => [...prev, category]);
        showToast(t("toast.categorySaved"));
        return category;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const updateCategory = useCallback(
    async (id: string, patch: Partial<CategoryDraft>) => {
      try {
        const category = await categoriesApi.update(id, patch);
        setCategories((prev) => prev.map((c) => (c.id === id ? category : c)));
        showToast(t("toast.categorySaved"));
        return category;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await categoriesApi.remove(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast(t("toast.categorySaved"));
      } catch (err) {
        handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  // --- Settings ----------------------------------------------------------
  const updateSettings = useCallback(
    async (patch: Partial<WorkspaceSettings>) => {
      try {
        const next = await settingsApi.update(patch);
        setSettings(next);
        showToast(t("toast.settingsSaved"));
        return next;
      } catch (err) {
        return handleError(err);
      }
    },
    [showToast, t, handleError]
  );

  // --- CSV -----------------------------------------------------------
  const reimportCsv = useCallback(async () => {
    try {
      const summary = await importApi.runCsvImport();
      await loadAll();
      showToast(t("toast.csvImported"));
      return summary;
    } catch (err) {
      return handleError(err);
    }
  }, [loadAll, showToast, t, handleError]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      loading,
      error,
      tasks,
      teamMembers,
      taskTypes,
      categories,
      settings,
      createTask,
      updateTask,
      deleteTask,
      setOccurrenceStatus,
      listEvidence,
      uploadEvidence,
      deleteEvidence,
      createTeamMember,
      updateTeamMember,
      deleteTeamMember,
      createTaskType,
      updateTaskType,
      deleteTaskType,
      createCategory,
      updateCategory,
      deleteCategory,
      updateSettings,
      reimportCsv,
    }),
    [
      loading,
      error,
      tasks,
      teamMembers,
      taskTypes,
      categories,
      settings,
      createTask,
      updateTask,
      deleteTask,
      setOccurrenceStatus,
      listEvidence,
      uploadEvidence,
      deleteEvidence,
      createTeamMember,
      updateTeamMember,
      deleteTeamMember,
      createTaskType,
      updateTaskType,
      deleteTaskType,
      createCategory,
      updateCategory,
      deleteCategory,
      updateSettings,
      reimportCsv,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
