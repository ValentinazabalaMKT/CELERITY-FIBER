import { db } from "./index.js";

// Fixed, stable IDs for seed data so the CSV importer and app code can
// reference them predictably (user-created records later get random UUIDs).
export const SEED_IDS = {
  owners: {
    valentina: "tm_valentina_zavala",
    juanJose: "tm_juan_jose_flores",
    sofia: "tm_sofia_nader",
  },
  taskTypes: {
    event: "tt_event",
    recurringReport: "tt_recurring_report",
    oneTimeTask: "tt_one_time_task",
    campaign: "tt_campaign",
    content: "tt_content",
    meeting: "tt_meeting",
    administrative: "tt_administrative",
    other: "tt_other",
    creativeDue: "tt_creative_due",
    list: "tt_list",
    focusSection: "tt_focus_section",
    specialSection: "tt_special_section",
    invoiceDue: "tt_invoice_due",
    businessJournalEvent: "tt_business_journal_event",
    bookOfLists: "tt_book_of_lists",
  },
  categories: {
    generalOperations: "cat_general_operations",
    marketingReports: "cat_marketing_reports",
    businessJournals: "cat_business_journals",
  },
} as const;

export function seed(): void {
  const now = new Date().toISOString();

  const memberCount = db.prepare("SELECT COUNT(*) as c FROM team_members").get() as { c: number };
  if (memberCount.c === 0) {
    const insert = db.prepare(
      `INSERT INTO team_members (id, name, role, initials, active, sortOrder, createdAt, updatedAt)
       VALUES (@id, @name, @role, @initials, 1, @sortOrder, @now, @now)`
    );
    const members = [
      { id: SEED_IDS.owners.valentina, name: "Valentina Zabala", role: "Marketing Analyst", initials: "VZ", sortOrder: 0 },
      { id: SEED_IDS.owners.juanJose, name: "Juan José Flores", role: "Marketing Director", initials: "JJ", sortOrder: 1 },
      { id: SEED_IDS.owners.sofia, name: "Sofía Nader", role: "Graphic Designer", initials: "SN", sortOrder: 2 },
    ];
    const tx = db.transaction((rows: typeof members) => {
      for (const row of rows) insert.run({ ...row, now });
    });
    tx(members);
  }

  const typeCount = db.prepare("SELECT COUNT(*) as c FROM task_types").get() as { c: number };
  if (typeCount.c === 0) {
    const insert = db.prepare(
      `INSERT INTO task_types (id, nameEn, nameEs, icon, color, active, showOnCronograma, sortOrder, createdAt, updatedAt)
       VALUES (@id, @nameEn, @nameEs, @icon, @color, 1, @showOnCronograma, @sortOrder, @now, @now)`
    );
    const types = [
      { id: SEED_IDS.taskTypes.event, nameEn: "Event", nameEs: "Evento", icon: "Calendar", color: "#582C83", showOnCronograma: 0, sortOrder: 0 },
      { id: SEED_IDS.taskTypes.recurringReport, nameEn: "Recurring Report", nameEs: "Reporte recurrente", icon: "Repeat", color: "#0087AD", showOnCronograma: 1, sortOrder: 1 },
      { id: SEED_IDS.taskTypes.oneTimeTask, nameEn: "One-Time Task", nameEs: "Tarea única", icon: "ListChecks", color: "#6B7280", showOnCronograma: 0, sortOrder: 2 },
      { id: SEED_IDS.taskTypes.campaign, nameEn: "Campaign", nameEs: "Campaña", icon: "Megaphone", color: "#D97706", showOnCronograma: 0, sortOrder: 3 },
      { id: SEED_IDS.taskTypes.content, nameEn: "Content", nameEs: "Contenido", icon: "FileText", color: "#1E8A5F", showOnCronograma: 0, sortOrder: 4 },
      { id: SEED_IDS.taskTypes.meeting, nameEn: "Meeting", nameEs: "Reunión", icon: "Users", color: "#582C83", showOnCronograma: 0, sortOrder: 5 },
      { id: SEED_IDS.taskTypes.administrative, nameEn: "Administrative", nameEs: "Administrativo", icon: "ClipboardList", color: "#8D6E97", showOnCronograma: 0, sortOrder: 6 },
      { id: SEED_IDS.taskTypes.other, nameEn: "Other", nameEs: "Otro", icon: "MoreHorizontal", color: "#6B7280", showOnCronograma: 0, sortOrder: 7 },
      // The Business Journals (AdBookPortal) campaign activity types — mirror the
      // client dashboard's own legend so they're instantly recognizable.
      { id: SEED_IDS.taskTypes.creativeDue, nameEn: "Creative Due", nameEs: "Entrega de Creativos", icon: "FileText", color: "#E07A4F", showOnCronograma: 1, sortOrder: 8 },
      { id: SEED_IDS.taskTypes.list, nameEn: "List", nameEs: "Listado", icon: "ListChecks", color: "#3D8BB0", showOnCronograma: 1, sortOrder: 9 },
      { id: SEED_IDS.taskTypes.focusSection, nameEn: "Focus Section", nameEs: "Sección Temática", icon: "BarChart3", color: "#5C7A99", showOnCronograma: 1, sortOrder: 10 },
      { id: SEED_IDS.taskTypes.specialSection, nameEn: "Special Section", nameEs: "Sección Especial", icon: "Tag", color: "#3A3A45", showOnCronograma: 1, sortOrder: 11 },
      { id: SEED_IDS.taskTypes.invoiceDue, nameEn: "Invoice Due", nameEs: "Factura por Pagar", icon: "ClipboardList", color: "#2E9E5B", showOnCronograma: 1, sortOrder: 12 },
      { id: SEED_IDS.taskTypes.businessJournalEvent, nameEn: "Business Journal Event", nameEs: "Evento Business Journal", icon: "Calendar", color: "#A67C1E", showOnCronograma: 1, sortOrder: 13 },
      { id: SEED_IDS.taskTypes.bookOfLists, nameEn: "Book of Lists", nameEs: "Book of Lists", icon: "FileText", color: "#9CA3AF", showOnCronograma: 1, sortOrder: 14 },
    ];
    const tx = db.transaction((rows: typeof types) => {
      for (const row of rows) insert.run({ ...row, now });
    });
    tx(types);
  }

  const categoryCount = db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };
  if (categoryCount.c === 0) {
    const insert = db.prepare(
      `INSERT INTO categories (id, nameEn, nameEs, active, sortOrder, createdAt, updatedAt)
       VALUES (@id, @nameEn, @nameEs, 1, @sortOrder, @now, @now)`
    );
    const categories = [
      { id: SEED_IDS.categories.generalOperations, nameEn: "General Operations Reports", nameEs: "Reportes Operativos Generales", sortOrder: 0 },
      { id: SEED_IDS.categories.marketingReports, nameEn: "Marketing Reports", nameEs: "Reportes de Marketing", sortOrder: 1 },
      { id: SEED_IDS.categories.businessJournals, nameEn: "The Business Journals", nameEs: "The Business Journals", sortOrder: 2 },
    ];
    const tx = db.transaction((rows: typeof categories) => {
      for (const row of rows) insert.run({ ...row, now });
    });
    tx(categories);
  }

  const settingsCount = db.prepare("SELECT COUNT(*) as c FROM workspace_settings").get() as { c: number };
  if (settingsCount.c === 0) {
    db.prepare(
      `INSERT INTO workspace_settings (id, workspaceName, workspaceSubtitle, defaultLanguage, defaultCalendarView, weekStartDay)
       VALUES (1, 'Celerity Marketing Workspace', 'Marketing Operations & Planning', 'es', 'month', 1)`
    ).run();
  }
}
