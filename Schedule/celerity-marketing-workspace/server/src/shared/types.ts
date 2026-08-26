// Shared domain types for Celerity Marketing Workspace.
// NOTE: kept in sync manually with server/src/shared/types.ts (see comment there).

export type Status = "pending" | "in_progress" | "completed" | "blocked";

export type Priority = "low" | "medium" | "high" | "urgent";

export type Frequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";

export type Language = "en" | "es";

export type CalendarView = "week" | "month" | "year";

export type TaskSource = "manual" | "csv-import";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskType {
  id: string;
  nameEn: string;
  nameEs: string;
  icon: string;
  color: string | null;
  active: boolean;
  /** Whether tasks of this type appear in the cronograma (Dashboard/Calendar/Tasks), vs. Other Tasks. */
  showOnCronograma: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameEs: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceRule {
  frequency: Frequency;
  interval: number;
  dayOfWeek: number | null; // 0=Sunday..6=Saturday, used for weekly/biweekly
  dayOfMonth: number | null; // 1-31, used for monthly/quarterly/yearly
  startDate: string; // ISO yyyy-MM-dd, anchor for expansion
  endDate: string | null;
}

export interface OccurrenceOverride {
  date: string; // ISO yyyy-MM-dd
  status: Status;
  completedAt: string | null;
}

/** A supporting file (screenshot, proof of submission, etc.) attached to a task. */
export interface Evidence {
  id: string;
  taskId: string;
  filename: string;
  mimeType: string;
  dataBase64: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  /** Parent task id, if this task is a subtask. Subtasks never appear as standalone rows in the cronograma/calendar/tables — only nested inside their parent's detail view. */
  parentTaskId: string | null;
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string | null;
  ownerId: string | null;
  status: Status;
  priority: Priority;
  categoryId: string | null;
  taskTypeId: string | null;
  isRecurring: boolean;
  recurrence: RecurrenceRule | null;
  notes: string;
  source: TaskSource;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  occurrenceOverrides: OccurrenceOverride[];
  /** Count of attached evidence files. Fetch GET /tasks/:id/evidence for the actual files. */
  evidenceCount: number;
}

export interface TaskOccurrence {
  occurrenceId: string;
  taskId: string;
  date: string;
  status: Status;
  isOverride: boolean;
  task: Task;
}

export interface WorkspaceSettings {
  workspaceName: string;
  workspaceSubtitle: string;
  defaultLanguage: Language;
  defaultCalendarView: CalendarView;
  weekStartDay: 0 | 1;
}

export type Urgency = "overdue" | "due_today" | "due_soon" | null;

export const STATUS_VALUES: Status[] = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
];

export const PRIORITY_VALUES: Priority[] = ["low", "medium", "high", "urgent"];

export const FREQUENCY_VALUES: Frequency[] = [
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom",
];
