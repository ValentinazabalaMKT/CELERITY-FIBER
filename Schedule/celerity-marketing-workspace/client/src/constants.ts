// Mirrors server/src/db/seed.ts SEED_IDS.owners — stable IDs for the three
// seeded team members so the client can default new tasks to Valentina, etc.
export const SEED_OWNER_IDS = {
  valentina: "tm_valentina_zavala",
  juanJose: "tm_juan_jose_flores",
  sofia: "tm_sofia_nader",
} as const;

// Mirrors server/src/db/seed.ts SEED_IDS.taskTypes — used to identify "Recurring
// Report" tasks specifically, since the cronograma (Dashboard/Calendar/Tasks) is
// scoped to reports only. Everything else lives in Other Tasks.
export const SEED_TASK_TYPE_IDS = {
  event: "tt_event",
  recurringReport: "tt_recurring_report",
  oneTimeTask: "tt_one_time_task",
  campaign: "tt_campaign",
  content: "tt_content",
  meeting: "tt_meeting",
  administrative: "tt_administrative",
  other: "tt_other",
} as const;
