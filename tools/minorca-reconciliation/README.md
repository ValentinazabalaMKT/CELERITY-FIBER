# Minorca Data Reconciliation

Local dashboard that cross-checks the Minorca property across four sources:

- **IT Users-Units Data Base.xlsx** (sheet `Minorca` only) — devices currently powered on.
- **Customer_Address_List_JH_08282026.xlsx** (GLDS billing export, sheet `Report`).
- **Copy of Customers vz-2026-08-28-11-41-43.xlsx** (Salesforce export).
- **Customer_Pk_08282026.xlsx** (GLDS billed-package export, sheet `Report`) — one row per billed line item (internet package, fee, or add-on) per account. Used only to source the `PKNAME` package/speed comparison described below; it has no unit number of its own and is joined onto the master record by account number (`SUBS`), the same key already used for GLDS/Salesforce.

All four files are expected in `~/Downloads` with their original names. No source file is ever modified.

## Run it

```
cd tools/minorca-reconciliation
.venv/bin/python backend/app.py
```

The app prints the local URL it bound to (it auto-picks a free port starting at 8901).

To (re)validate the reconciliation logic against the real files:

```
cd backend && ../.venv/bin/python validate.py
```

## How matching works (short version)

- Unit numbers are normalized (`101`, `101.0`, `" 101 "`, `000101` all collapse to `101`) so Excel formatting never causes a false "missing" record.
- Named units (`GYM`, `OFFICE`, `COMMON AREA`, ...) get the same leading-zero-pad stripping as numeric units, since GLDS's export pads them the same way (`000000GYM` -> `GYM`). GLDS's unit field also has a fixed max width (empirically 16 characters) that silently truncates longer names — confirmed on real data as `000000COMMON ARE` (missing the final "A") vs Salesforce's untruncated `COMMON AREA`. A conservative prefix bridge merges a truncated GLDS named unit onto the matching Salesforce unit only when it's an unambiguous prefix of exactly one non-numeric Salesforce unit, within a few characters of it — never guessed across genuinely different names.
- GLDS `Account No.` (`016-000684`) is compared against Salesforce `GLDS Account Number` (stored as a bare int, e.g. `684`) by taking the suffix after the last `-` and zero-padding Salesforce's number to the same width, learned at runtime from the real GLDS data (defaults to 6 digits). Leading zeros are never dropped.
- The join is a conceptual **full outer join**: a unit shows up in the grid the moment it exists in *any* of the three sources. Records with no unit number at all (17 IT devices, 371 GLDS accounts) are reported separately rather than force-fit into the grid.
- Duplicates (same unit appearing more than once in a source) are **never silently collapsed** — every row is always kept in the detail panel, regardless of the rest of this rule. Whether a duplicate also raises an `Overall Status = DUPLICATE` issue needing review depends on the pattern: having one Active record and one Inactive/Disconnected/Other record in GLDS or Salesforce is a normal "old record closed out, new record activated" history and is **not** flagged by itself — but only when that pattern is clean (exactly one Active row, not zero or two+) on *both* GLDS and Salesforce for that unit, *and* the Active account number agrees between them (`Account Match = MATCH`). If either side has zero or multiple Active rows, or the two platforms disagree on which account is the active one, it's still flagged for review. IT duplicates (two physical devices on one unit) are always flagged — a unit isn't expected to have service history the way a billing/CRM record does.
- **Speed/package**: the GLDS and Salesforce customer exports still have no speed/package/plan column (confirmed by inspecting both files' actual headers). The GLDS *billed-package* export (`Customer_Pk`, sheet `Report`) does — its `PKNAME` field (e.g. `700 Mbps Platinum internet`, `1Gb`, `Ultimate 250Mbps x 100Mbps`) is parsed into a down/up Mbps value and compared against IT's `Speed`. Non-internet billing lines (`Admin Fee`, `Physical Bill Fee`, DVR add-ons, protection plans, membership fees) don't contain a speed value and are excluded from the comparison automatically — they fail the speed regex, not a hardcoded denylist. `Customer_Pk` has no unit number, so the join happens by account number (`SUBS`, same bare suffix as GLDS `Account No.` / Salesforce `GLDS Account Number`) against whichever of GLDS/Salesforce already resolved the unit. When both an IT speed and a billed package are found for a unit, `Speed Match` is `MATCH`/`MISMATCH`; otherwise it's `N/A` (no billed package on file, or no active IT device). A mismatch raises a `Speed/package mismatch` issue (severity `WARNING`).
- GLDS status codes (`ACT`, `INA`, `DTV`, `HDC`, `COL`, `DNU`, `BLK`, `WRO`) are bucketed into Active/Inactive/Disconnected/Pending/Other; the raw code is always kept alongside for audit.

## Dashboard features

- **Language toggle (EN / ES)** in the top bar. Translates the whole UI — KPIs, category names, status badges, filters, table headers, detail panel — without re-fetching data. The choice is remembered in the browser (`localStorage`) across reloads.
- **Multi-select inconsistency categories**: each card in "Inconsistency Summary" has a checkbox and can be combined with others (OR logic). As soon as one or more categories are checked, a compact table appears right below the cards showing the matching records (Unit, IT Device, GLDS/SF Status, Overall Status, Issue) — no need to scroll to the main table. Clicking a row opens the same unit detail panel. "Clear selection" resets it.
- The full "Reconciliation Detail" table further down keeps its own independent filters (search, Overall Status, Issue Category, IT Device, GLDS/Salesforce Status, Account Match) for deeper drill-down.

## Project layout

```
tools/minorca-reconciliation/
  backend/
    app.py          Flask app + REST endpoints (/api/data, /api/refresh, /api/export/all, /api/export/issues)
    data_loader.py   Reads the 3 xlsx files, normalization helpers
    reconcile.py     Matching/business-rule engine, builds the master record list
    validate.py      Mandatory technical checks (run after any logic change)
  frontend/
    index.html, style.css, app.js   Static dashboard (vanilla JS, no build step, i18n built in)
  requirements.txt
  .venv/            Local virtualenv (not committed — see requirements.txt to recreate)
```
