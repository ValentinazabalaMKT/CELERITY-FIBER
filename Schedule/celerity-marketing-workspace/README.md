# Celerity Marketing Workspace

Internal marketing calendar and task-management tool for the Celerity Fiber Marketing team. Runs entirely locally — no external services, no cloud database.

## Run it

From this folder:

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

- Frontend: Vite + React + TypeScript + Tailwind, on port `3000`.
- Backend API: Node + Express + SQLite (`better-sqlite3`), on port `4000` (proxied under `/api` by Vite).
- The database file lives at `server/data/celerity.db` and persists between restarts.

On first run, the server automatically imports `../CRONOGRAMA REPORTES(Cronograma de Actividades).csv` (the onboarding cronograma) into the database, assigning every imported task to **Valentina Zabala**. Re-running the app never re-imports or duplicates that data — use **Settings → Data / CSV Import** to pull in updates from a refreshed CSV later; manually edited tasks are never silently overwritten.

## Project structure

```
client/          React app (components/, pages/, hooks/, services/, i18n/, shared/, context/)
server/          Express API (routes/, services/, db/, shared/)
server/data/     SQLite database file (gitignored)
```

`shared/types.ts` and `shared/recurrence.ts`/`taskLogic.ts` are intentionally duplicated between `client/src/shared` and `server/src/shared` — they're small, pure, dependency-light modules kept in sync manually to avoid cross-package build complexity for a two-package local app.

## What it does

The cronograma (Dashboard, Calendar, Tasks) is scoped to **Recurring Report** tasks only — that's the priority. Everything else (meetings, campaigns, content, one-off requests) lives in a separate **Other Tasks** page, out of the main flow. Reassigning a task's Task Type moves it between the two automatically.

- **Dashboard** — at-a-glance stats (total/pending/in-progress/completed/due this week/overdue), month progress, upcoming deadlines, this week, team workload — reports only. Every card is clickable and jumps into a filtered Tasks view.
- **Calendar** — Week / Month / Year views, always starting at today and never showing past months. Click-to-create and click-to-view-detail. Recurring reports are expanded into real occurrences on the fly (no duplicated rows in the database).
- **Tasks** — filterable, searchable table of report tasks with inline status/owner/priority/type editing, full create/edit/delete. Priority **Urgent** and date **Overdue** are both shown as a solid red badge so they can't be missed.
- **Other Tasks** — everything that isn't a recurring report, kept out of the main cronograma but still fully manageable.
- **Team** — the three seeded members (Valentina Zabala, Juan José Flores, Sofía Nader), each linking into their filtered task list.
- **Settings** — no-code administration: team members, task types, categories, workspace name/subtitle/default language/default calendar view/week start, and CSV re-import. Nothing meant to change day-to-day is hardcoded.
- **EN / ES** — full bilingual UI, switchable instantly from the header, no reload.
- **Branding** — real Celerity Fiber logo/favicon (`client/public/`), pulled from celerityfiber.com.

## Recurrence model

Recurring tasks (e.g. "Reporte Milton — due the 25th of every month") are stored once as a template with a recurrence rule. Concrete calendar occurrences are computed in memory for whatever date range is on screen. Marking one month's instance complete stores a lightweight per-date override — it never creates a duplicate task row and never affects other months.
