# AGENTS.md � Celerity Fiber workspace

This workspace holds **brand, messaging, and go-to-market context** for **Celerity Fiber** ([celerityfiber.com](https://www.celerityfiber.com/)).

## Before any communication / strategy / copy work

1. Read `docs/brand/BRAND-CONTEXT.md`
2. Check facts in `docs/brand/FACT-SHEET.md` (confirmed vs **[PENDIENTE]**)
3. Tailor by audience with `docs/brand/AUDIENCE-MESSAGING.md`
4. Follow `docs/brand/COPY-GUIDELINES.md`
5. For sales/strategy only (not public copy), check `docs/brand/COMPETITIVE-CONTEXT.md`

Cursor rules in `.cursor/rules/` reinforce the same standards automatically.

## Raw onboarding sources

`files_source_celerity/` holds the original onboarding decks (Company Overview, Benchmark, Buyer Persona, Marketing & Sales Communication). Their content has been distilled into `docs/brand/` � prefer the `docs/brand/` files for day-to-day work and treat the decks as the underlying source of truth when something needs re-checking.

## Positioning in one line

A South Florida�focused boutique fiber ISP that helps properties, developers, and communities deploy better fiber solutions with white-glove service large national providers rarely match � competing on **fiber + tailored solutions + service**, not Mbps or price alone.

## Do not invent

Plans, prices, contract length, SLAs, coverage for a specific city/property, equipment inclusions, or uptime guarantees beyond what is confirmed in the Fact Sheet (and validated for legal use).

## Site reference

Primary public source: https://www.celerityfiber.com/

## Repo sync policy

This folder is versioned at `https://github.com/ValentinazabalaMKT/CELERITY-FIBER` (private repo, `main` branch). **The repo is the source of truth.**

Whenever a new file is created or an existing one is updated locally, commit and push it to `origin/main` before considering the task done — do not leave local-only changes.

Exceptions (not pushed, see `.gitignore`):
- `node_modules/`, `.DS_Store`, Excel lock files (`~$*`), SQLite `-wal`/`-shm` files, and the Schedule app's local `celerity.db`
- `files_source_celerity/2.Celerity Fiber Company Overview (Editable).pptx` (105MB, over GitHub's 100MB push limit) — lives instead as a GitHub Release asset under tag `source-assets-v1`, with a `.LEEME.md` pointer left in its original folder
