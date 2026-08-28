# Minorca Data Reconciliation

Local dashboard that cross-checks the Minorca property across three sources:

- **IT Users-Units Data Base.xlsx** (sheet `Minorca` only) — devices currently powered on.
- **Customer_Address_List_JH_08282026.xlsx** (GLDS billing export, sheet `Report`).
- **Copy of Customers vz-2026-08-28-11-41-43.xlsx** (Salesforce export).

All three files are expected in `~/Downloads` with their original names. No source file is ever modified.

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
- GLDS `Account No.` (`016-000684`) is compared against Salesforce `GLDS Account Number` (stored as a bare int, e.g. `684`) by taking the suffix after the last `-` and zero-padding Salesforce's number to the same width, learned at runtime from the real GLDS data (defaults to 6 digits). Leading zeros are never dropped.
- The join is a conceptual **full outer join**: a unit shows up in the grid the moment it exists in *any* of the three sources. Records with no unit number at all (17 IT devices, 371 GLDS accounts) are reported separately rather than force-fit into the grid.
- Duplicates (same unit appearing more than once in a source) are **never silently collapsed** — every row is kept in the detail panel, and the record is flagged `Overall Status = DUPLICATE` so it's never mistaken for a clean match.
- **Speed/package**: only the IT file has a comparable field (`Speed`, e.g. `1000Mbps` or `Down: 250Mbps - Up: 100Mbps`). Neither the GLDS export nor the Salesforce export contains a speed/package/plan column — this was confirmed by inspecting both files' actual headers, not assumed. The dashboard shows IT Speed for reference and marks the cross-source comparison as `N/A — no comparable field`, rather than inventing an equivalence.
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
