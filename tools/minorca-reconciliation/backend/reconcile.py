"""
Core reconciliation engine for the Minorca IT vs GLDS vs Salesforce audit.

Design notes (see project README for the full business-rule writeup):

- This performs a conceptual FULL OUTER JOIN across the three sources keyed
  primarily by normalized Unit Number, with a secondary Account Number key
  used to cross-validate GLDS <-> Salesforce and to catch mismatches that a
  unit-only join would hide (Cases G/H in the spec).
- Duplicates are never silently collapsed. When a unit has more than one
  row in a source, ALL rows are kept and shown in the detail panel; a
  single "primary" row (the one whose status looks most current: Active >
  Pending > Other > Inactive/Disconnected) is used only to drive the
  status-consistency checks, and the record is always flagged as
  `duplicate=True` / Overall Status = DUPLICATE regardless of what that
  primary-based analysis concludes, so nothing is hidden behind a
  possibly-wrong pick.
- Records that exist in a source but have no unit number at all (17 IT
  rows with no assigned unit; 371 GLDS rows with no address on file) are
  NOT force-fit into the unit-keyed master table with a fake key. They are
  reported separately (`it_unassigned`, `glds_unassigned`) so nothing
  "disappears" (per the spec's explicit anti-silent-drop requirement) while
  keeping the main grid meaningful (one row per real physical unit).
"""
from collections import defaultdict
import re

import pandas as pd

from data_loader import (
    load_it,
    load_glds,
    load_salesforce,
    normalize_unit,
    normalize_account_from_glds,
    normalize_account_from_salesforce,
    detect_account_pad_width,
)

# ---------------------------------------------------------------------------
# Status classification
# ---------------------------------------------------------------------------
# GLDS uses short internal billing codes. These are inferred from the codes
# actually present in the file (ACT, INA, DTV, HDC, COL, DNU, BLK, WRO) --
# the raw code is ALWAYS preserved alongside the classification so this
# heuristic can be audited/corrected without touching the underlying data.
GLDS_STATUS_MAP = {
    "ACT": "Active",
    "INA": "Inactive",
    "DTV": "Disconnected",
    "HDC": "Pending",
    "COL": "Other",   # Collections
    "DNU": "Other",   # Do Not Use
    "BLK": "Other",   # Blocked
    "WRO": "Other",   # Write-off
}


def classify_glds_status(raw):
    if raw is None or (isinstance(raw, float) and pd.isna(raw)):
        return None, None
    raw_s = str(raw).strip()
    if raw_s == "":
        return None, None
    return GLDS_STATUS_MAP.get(raw_s.upper(), "Other"), raw_s


def classify_sf_status(raw):
    if raw is None or (isinstance(raw, float) and pd.isna(raw)):
        return None, None
    raw_s = str(raw).strip()
    if raw_s == "":
        return None, None
    low = raw_s.lower()
    if low == "active":
        cls = "Active"
    elif low == "inactive":
        cls = "Inactive"
    elif "cancel" in low:
        cls = "Cancelled"
    elif "disconnect" in low:
        cls = "Disconnected"
    elif "pend" in low or "hold" in low:
        cls = "Pending"
    else:
        cls = "Other"
    return cls, raw_s


ACTIVE_SET = {"Active"}
PENDING_SET = {"Pending"}
NEGATIVE_SET = {"Inactive", "Disconnected", "Cancelled", "Other"}

STATUS_PRECEDENCE = {"Active": 0, "Pending": 1, "Other": 2, "Cancelled": 3,
                      "Disconnected": 3, "Inactive": 4, None: 5}

SEVERITY_RANK = {"DUPLICATE": 4, "CRITICAL": 3, "NOT FOUND": 2, "WARNING": 1, "OK": 0}


# ---------------------------------------------------------------------------
# Speed parsing (IT only -- GLDS and Salesforce have no comparable column,
# confirmed by inspecting both files' real headers; see README).
# ---------------------------------------------------------------------------
_SPEED_SIMPLE_RE = re.compile(r"^\s*(\d+(?:\.\d+)?)\s*mbps\s*$", re.IGNORECASE)
_SPEED_DOWN_UP_RE = re.compile(
    r"down[:\s]*([\d.]+)\s*mbps.*?up[:\s]*([\d.]+)\s*mbps", re.IGNORECASE
)


def parse_speed(raw):
    if raw is None or (isinstance(raw, float) and pd.isna(raw)):
        return {"raw": None, "down": None, "up": None, "label": None}
    raw_s = str(raw).strip()
    m = _SPEED_SIMPLE_RE.match(raw_s)
    if m:
        down = float(m.group(1))
        return {"raw": raw_s, "down": down, "up": down, "label": f"{int(down)} Mbps"}
    m = _SPEED_DOWN_UP_RE.search(raw_s)
    if m:
        down, up = float(m.group(1)), float(m.group(2))
        return {"raw": raw_s, "down": down, "up": up,
                "label": f"{int(down)}/{int(up)} Mbps"}
    return {"raw": raw_s, "down": None, "up": None, "label": raw_s}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def pick_primary(rows):
    """Among duplicate rows for the same key, pick the one whose status
    looks most "current" (Active first). Used only to drive the
    status-consistency checks -- ALL rows remain visible in the detail
    panel regardless of this pick."""
    if not rows:
        return None
    return sorted(rows, key=lambda r: STATUS_PRECEDENCE.get(r.get("status_class"), 5))[0]


def _safe(v):
    if v is None:
        return None
    if isinstance(v, float) and pd.isna(v):
        return None
    return v


def build_master():
    it_df, it_meta = load_it()
    glds_df, glds_meta = load_glds()
    sf_df, sf_meta = load_salesforce()

    pad_width = detect_account_pad_width(glds_df, "Account No.")

    # ---- IT rows ----
    it_rows_all = []
    it_unassigned = []
    for _, r in it_df.iterrows():
        unit_norm = normalize_unit(r.get("Unit Number"))
        speed = parse_speed(r.get("Speed"))
        row = {
            "unit_norm": unit_norm,
            "unit_raw": _safe(r.get("Unit Number")),
            "unit_label": _safe(r.get("Unit")),
            "speed": speed,
            "mac_onu": _safe(r.get("MAC ONU")),
            "serial": _safe(r.get("Serial")),
            "olt": _safe(r.get("OLT")),
            "provider": _safe(r.get("Provider")),
            "owner": _safe(r.get("Owner")),
            "franchise": _safe(r.get("Franchise")),
        }
        if unit_norm is None:
            it_unassigned.append(row)
        else:
            it_rows_all.append(row)

    IT_by_unit = defaultdict(list)
    for row in it_rows_all:
        IT_by_unit[row["unit_norm"]].append(row)

    # ---- GLDS rows ----
    glds_rows_all = []
    glds_unassigned = []
    for _, r in glds_df.iterrows():
        unit_norm = normalize_unit(r.get("NUMERIC_UNITNUMBER"))
        acct_norm = normalize_account_from_glds(r.get("Account No."))
        status_class, status_raw = classify_glds_status(r.get("Status"))
        row = {
            "unit_norm": unit_norm,
            "unit_raw": _safe(r.get("NUMERIC_UNITNUMBER")),
            "acct_norm": acct_norm,
            "acct_raw": _safe(r.get("Account No.")),
            "status_class": status_class,
            "status_raw": status_raw,
            "name": _safe(r.get("Name")),
            "contact": _safe(r.get("Contact Method")),
            "address": _safe(r.get("ADDR1")),
            "city": _safe(r.get("CITY")),
        }
        if unit_norm is None:
            glds_unassigned.append(row)
        else:
            glds_rows_all.append(row)

    GLDS_by_unit = defaultdict(list)
    GLDS_by_acct = defaultdict(list)
    for row in glds_rows_all:
        GLDS_by_unit[row["unit_norm"]].append(row)
    for row in glds_rows_all + glds_unassigned:
        if row["acct_norm"]:
            GLDS_by_acct[row["acct_norm"]].append(row)

    # ---- Salesforce rows ----
    sf_rows_all = []
    for _, r in sf_df.iterrows():
        unit_norm = normalize_unit(r.get("Unit Number"))
        acct_norm = normalize_account_from_salesforce(r.get("GLDS Account Number"), pad_width)
        status_class, status_raw = classify_sf_status(r.get("Status"))
        row = {
            "unit_norm": unit_norm,
            "unit_raw": _safe(r.get("Unit Number")),
            "acct_norm": acct_norm,
            "acct_raw": _safe(r.get("GLDS Account Number")),
            "status_class": status_class,
            "status_raw": status_raw,
            "name": _safe(r.get("Name")),
            "unit_code": _safe(r.get("Unit Code")),
            "account_name": _safe(r.get("Account Name")),
            "building_code": _safe(r.get("Building: Building Code")),
        }
        sf_rows_all.append(row)
        # SF unit numbers are always present in this dataset, but guard anyway.

    SF_by_unit = defaultdict(list)
    SF_by_acct = defaultdict(list)
    for row in sf_rows_all:
        if row["unit_norm"]:
            SF_by_unit[row["unit_norm"]].append(row)
        if row["acct_norm"]:
            SF_by_acct[row["acct_norm"]].append(row)

    # ---- Bridge: GLDS rows with NO unit number but whose account number
    # is found in Salesforce -> attach to SF's unit so the pairing isn't lost.
    bridged_glds_by_unit = defaultdict(list)
    bridged_count = 0
    for row in glds_unassigned:
        if row["acct_norm"] and row["acct_norm"] in SF_by_acct:
            for sf_row in SF_by_acct[row["acct_norm"]]:
                if sf_row["unit_norm"]:
                    bridged = dict(row)
                    bridged["bridged_via_account"] = True
                    bridged_glds_by_unit[sf_row["unit_norm"]].append(bridged)
                    bridged_count += 1

    master_units = set(IT_by_unit) | set(GLDS_by_unit) | set(SF_by_unit) | set(bridged_glds_by_unit)

    records = []
    for unit in master_units:
        it_rows = IT_by_unit.get(unit, [])
        glds_rows = GLDS_by_unit.get(unit, []) + bridged_glds_by_unit.get(unit, [])
        sf_rows = SF_by_unit.get(unit, [])

        it_primary = pick_primary(it_rows)
        glds_primary = pick_primary(glds_rows)
        sf_primary = pick_primary(sf_rows)

        it_exists = it_primary is not None
        glds_exists = glds_primary is not None
        sf_exists = sf_primary is not None

        duplicate = len(it_rows) > 1 or len(glds_rows) > 1 or len(sf_rows) > 1

        glds_acct = glds_primary["acct_norm"] if glds_exists else None
        sf_acct = sf_primary["acct_norm"] if sf_exists else None

        if glds_acct and sf_acct:
            account_match = "MATCH" if glds_acct == sf_acct else "MISMATCH"
        elif glds_acct or sf_acct:
            account_match = "N/A"
        else:
            account_match = "N/A"

        unit_match_glds_sf = "MATCH" if (glds_exists and sf_exists) else "N/A"

        issues = []  # list of {category, severity, description}

        glds_status_class = glds_primary["status_class"] if glds_exists else None
        sf_status_class = sf_primary["status_class"] if sf_exists else None

        # Case C
        if it_exists and glds_exists and glds_status_class in NEGATIVE_SET:
            issues.append({
                "category": "Device ON but GLDS inactive",
                "severity": "CRITICAL",
                "description": (
                    f"Unit {unit}: an active device was found in the Minorca IT "
                    f"equipment database, but GLDS shows this account as "
                    f"'{glds_primary['status_raw']}' ({glds_status_class})."
                ),
            })
        elif it_exists and glds_exists and glds_status_class in PENDING_SET:
            issues.append({
                "category": "Device ON but GLDS pending",
                "severity": "WARNING",
                "description": (
                    f"Unit {unit}: device is active in IT while GLDS shows a "
                    f"pending status ('{glds_primary['status_raw']}')."
                ),
            })

        # Case D
        if it_exists and sf_exists and sf_status_class in NEGATIVE_SET:
            issues.append({
                "category": "Device ON but Salesforce inactive",
                "severity": "CRITICAL",
                "description": (
                    f"Unit {unit}: an active device was found in the Minorca IT "
                    f"equipment database, but Salesforce shows this customer as "
                    f"'{sf_primary['status_raw']}' ({sf_status_class})."
                ),
            })
        elif it_exists and sf_exists and sf_status_class in PENDING_SET:
            issues.append({
                "category": "Device ON but Salesforce pending",
                "severity": "WARNING",
                "description": (
                    f"Unit {unit}: device is active in IT while Salesforce shows a "
                    f"pending status ('{sf_primary['status_raw']}')."
                ),
            })

        # Case B (billing/CRM says active, but no device on)
        if not it_exists and (
            (glds_exists and glds_status_class in ACTIVE_SET)
            or (sf_exists and sf_status_class in ACTIVE_SET)
        ):
            active_in = []
            if glds_exists and glds_status_class in ACTIVE_SET:
                active_in.append("GLDS")
            if sf_exists and sf_status_class in ACTIVE_SET:
                active_in.append("Salesforce")
            issues.append({
                "category": "Active but device OFF",
                "severity": "CRITICAL",
                "description": (
                    f"Unit {unit} appears as an Active customer in "
                    f"{' and '.join(active_in)}, but no active device was found "
                    f"in the Minorca IT equipment database."
                ),
            })

        # Case E / F -- IT device on, entirely missing elsewhere
        if it_exists and not glds_exists:
            issues.append({
                "category": "Missing in GLDS",
                "severity": "CRITICAL",
                "description": f"Unit {unit}: active device in IT, but no matching record exists in GLDS.",
            })
        if it_exists and not sf_exists:
            issues.append({
                "category": "Missing in Salesforce",
                "severity": "CRITICAL",
                "description": f"Unit {unit}: active device in IT, but no matching record exists in Salesforce.",
            })

        # Case I (generalized) -- exists in exactly one source, IT device off
        sources_present = [n for n, e in (("IT", it_exists), ("GLDS", glds_exists), ("Salesforce", sf_exists)) if e]
        if not it_exists and len(sources_present) == 1:
            only = sources_present[0]
            issues.append({
                "category": f"Only in {only}",
                "severity": "NOT FOUND",
                "description": f"Unit {unit} exists only in {only}; no matching record found in the other two sources.",
            })

        # Case H -- same unit, account numbers disagree
        if account_match == "MISMATCH":
            issues.append({
                "category": "Account Number mismatch",
                "severity": "CRITICAL",
                "description": (
                    f"Unit {unit}: GLDS account '{glds_acct}' does not match "
                    f"Salesforce GLDS Account Number '{sf_acct}' for the same unit."
                ),
            })

        # Case G -- account matches, but that account points to a different
        # unit somewhere in the other source.
        if glds_acct and glds_acct in SF_by_acct:
            conflicting_units = {r["unit_norm"] for r in SF_by_acct[glds_acct] if r["unit_norm"] and r["unit_norm"] != unit}
            if conflicting_units:
                issues.append({
                    "category": "Account associated with different unit",
                    "severity": "CRITICAL",
                    "description": (
                        f"GLDS account '{glds_acct}' (unit {unit}) is associated in "
                        f"Salesforce with a different unit: {', '.join(sorted(conflicting_units))}."
                    ),
                })
        if sf_acct and sf_acct in GLDS_by_acct:
            conflicting_units = {r["unit_norm"] for r in GLDS_by_acct[sf_acct] if r["unit_norm"] and r["unit_norm"] != unit}
            if conflicting_units:
                issues.append({
                    "category": "Account associated with different unit",
                    "severity": "CRITICAL",
                    "description": (
                        f"Salesforce GLDS Account Number '{sf_acct}' (unit {unit}) is "
                        f"associated in GLDS with a different unit: {', '.join(sorted(conflicting_units))}."
                    ),
                })

        if duplicate:
            issues.append({
                "category": "Duplicate records",
                "severity": "DUPLICATE",
                "description": (
                    f"Unit {unit} has multiple rows in "
                    + ", ".join(
                        f"{n} ({c})" for n, c in
                        (("IT", len(it_rows)), ("GLDS", len(glds_rows)), ("Salesforce", len(sf_rows)))
                        if c > 1
                    )
                    + " -- the match shown uses the most-current-looking record; review all rows before acting."
                ),
            })

        if issues:
            overall_status = max(issues, key=lambda i: SEVERITY_RANK[i["severity"]])["severity"]
        else:
            overall_status = "OK"

        issue_categories = sorted({i["category"] for i in issues})

        record = {
            "unit": unit,
            "it_exists": it_exists,
            "glds_exists": glds_exists,
            "sf_exists": sf_exists,
            "it_unit_raw": it_primary["unit_raw"] if it_exists else None,
            "glds_unit_raw": glds_primary["unit_raw"] if glds_exists else None,
            "sf_unit_raw": sf_primary["unit_raw"] if sf_exists else None,
            "it_speed": it_primary["speed"]["label"] if it_exists else None,
            "it_speed_raw": it_primary["speed"]["raw"] if it_exists else None,
            "glds_account_full": glds_primary["acct_raw"] if glds_exists else None,
            "glds_account_norm": glds_acct,
            "sf_account_raw": sf_primary["acct_raw"] if sf_exists else None,
            "sf_account_norm": sf_acct,
            "glds_status_class": glds_status_class,
            "glds_status_raw": glds_primary["status_raw"] if glds_exists else None,
            "sf_status_class": sf_status_class,
            "sf_status_raw": sf_primary["status_raw"] if sf_exists else None,
            "speed_match": "N/A - No comparable field in GLDS/Salesforce",
            "unit_match_glds_sf": unit_match_glds_sf,
            "account_match": account_match,
            "duplicate": duplicate,
            "overall_status": overall_status,
            "issue_categories": issue_categories,
            "issues": issues,
            "it_detail": [
                {"unit_raw": r["unit_raw"], "speed": r["speed"]["label"], "speed_raw": r["speed"]["raw"],
                 "mac_onu": r["mac_onu"], "serial": r["serial"], "olt": r["olt"], "provider": r["provider"],
                 "owner": r["owner"]}
                for r in it_rows
            ],
            "glds_detail": [
                {"account": r["acct_raw"], "account_norm": r["acct_norm"], "status_raw": r["status_raw"],
                 "status_class": r["status_class"], "name": r["name"], "address": r["address"],
                 "city": r["city"], "bridged_via_account": r.get("bridged_via_account", False)}
                for r in glds_rows
            ],
            "sf_detail": [
                {"account": r["acct_raw"], "account_norm": r["acct_norm"], "status_raw": r["status_raw"],
                 "status_class": r["status_class"], "name": r["name"], "unit_code": r["unit_code"],
                 "building_code": r["building_code"]}
                for r in sf_rows
            ],
        }
        records.append(record)

    records.sort(key=lambda r: (r["unit"].zfill(10) if r["unit"].isdigit() else r["unit"]))

    meta = {
        "sources": {"it": it_meta, "glds": glds_meta, "salesforce": sf_meta},
        "counts": {
            "it_rows": int(len(it_df)),
            "glds_rows": int(len(glds_df)),
            "sf_rows": int(len(sf_df)),
            "it_units": len(it_rows_all),
            "it_unassigned_devices": len(it_unassigned),
            "glds_units": len(glds_rows_all),
            "glds_unassigned_accounts": len(glds_unassigned),
            "sf_units": len(sf_rows_all),
            "glds_sf_bridged_via_account": bridged_count,
        },
        "account_pad_width": pad_width,
        "it_unassigned": it_unassigned,
        "glds_unassigned": glds_unassigned,
    }
    return records, meta


def summarize(records, meta):
    total_units = len(records)
    it_on = sum(1 for r in records if r["it_exists"])
    glds_active = sum(1 for r in records if r["glds_status_class"] == "Active")
    sf_active = sum(1 for r in records if r["sf_status_class"] == "Active")
    fully_matched = sum(1 for r in records if r["overall_status"] == "OK")
    issues_found = total_units - fully_matched

    status_counts = defaultdict(int)
    for r in records:
        status_counts[r["overall_status"]] += 1

    category_counts = defaultdict(int)
    for r in records:
        for c in r["issue_categories"]:
            category_counts[c] += 1

    # Presence matrix: (IT on/off, GLDS status class or Missing, SF status class or Missing) -> count
    matrix = defaultdict(int)
    for r in records:
        key = (
            "ON" if r["it_exists"] else "OFF",
            r["glds_status_class"] or "Missing",
            r["sf_status_class"] or "Missing",
        )
        matrix[key] += 1
    matrix_rows = [
        {"it": k[0], "glds": k[1], "salesforce": k[2], "count": v}
        for k, v in sorted(matrix.items(), key=lambda kv: -kv[1])
    ]

    pct_ok = round((fully_matched / total_units) * 100, 1) if total_units else 0.0

    return {
        "kpis": {
            "total_units": total_units,
            "it_devices_on": it_on,
            "glds_active": glds_active,
            "sf_active": sf_active,
            "fully_matched": fully_matched,
            "issues_found": issues_found,
        },
        "status_counts": dict(status_counts),
        "issue_categories": dict(sorted(category_counts.items(), key=lambda kv: -kv[1])),
        "presence_matrix": matrix_rows,
        "data_quality": {
            "pct_reconciled": pct_ok,
            "records_requiring_review": issues_found,
        },
        "counts": meta["counts"],
        "sources": meta["sources"],
        "account_pad_width": meta["account_pad_width"],
    }
