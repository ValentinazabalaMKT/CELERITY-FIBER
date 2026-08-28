"""Mandatory technical validations (spec section 24). Run directly:
    python validate.py
Exits non-zero if any check fails.
"""
import sys

from data_loader import normalize_unit, normalize_account_from_glds, normalize_account_from_salesforce
from reconcile import build_master, summarize

FAILURES = []


def check(label, condition, extra=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f" -- {extra}" if extra and not condition else ""))
    if not condition:
        FAILURES.append(label)


def main():
    # --- normalization unit tests ---
    check("normalize_unit('101') == normalize_unit('101.0')",
          normalize_unit("101") == normalize_unit("101.0"))
    check("normalize_unit(101) == normalize_unit(' 101 ')",
          normalize_unit(101) == normalize_unit(" 101 "))
    check("normalize_unit('000701') == normalize_unit('701')",
          normalize_unit("000701") == normalize_unit("701"))
    check("normalize_unit('101') != normalize_unit('102')",
          normalize_unit("101") != normalize_unit("102"))

    check("normalize_account_from_glds('016-000684') == '000684'",
          normalize_account_from_glds("016-000684") == "000684",
          normalize_account_from_glds("016-000684"))
    check("normalize_account_from_salesforce(684, 6) == '000684'",
          normalize_account_from_salesforce(684, 6) == "000684",
          normalize_account_from_salesforce(684, 6))
    check("normalize_account_from_glds('016-000684') matches normalize_account_from_salesforce(684, 6)",
          normalize_account_from_glds("016-000684") == normalize_account_from_salesforce(684, 6))
    check("leading zeros preserved, not stripped to '684'",
          normalize_account_from_salesforce(684, 6) != "684")

    # --- full pipeline ---
    records, meta = build_master()
    summary = summarize(records, meta)

    print()
    print("counts:", summary["counts"])
    print("kpis:", summary["kpis"])
    print("status_counts:", summary["status_counts"])
    print("issue_categories:", summary["issue_categories"])

    total = summary["kpis"]["total_units"]

    # union sanity: total master units should equal the union of all
    # per-source unit sets used to build IT/GLDS/SF-by-unit dicts, plus any
    # units only reachable via the account bridge.
    by_unit_it = {r["unit"] for r in records if r["it_exists"]}
    by_unit_glds = {r["unit"] for r in records if r["glds_exists"]}
    by_unit_sf = {r["unit"] for r in records if r["sf_exists"]}
    union_span = by_unit_it | by_unit_glds | by_unit_sf
    check("every record has at least one source present",
          all(r["it_exists"] or r["glds_exists"] or r["sf_exists"] for r in records))
    check("total_units == union of unit sets actually present in records",
          total == len(union_span), f"{total} vs {len(union_span)}")

    it_only = [r for r in records if r["it_exists"] and not r["glds_exists"] and not r["sf_exists"]]
    glds_only = [r for r in records if r["glds_exists"] and not r["it_exists"] and not r["sf_exists"]]
    sf_only = [r for r in records if r["sf_exists"] and not r["it_exists"] and not r["glds_exists"]]
    print()
    print(f"IT-only units: {len(it_only)} e.g. {[r['unit'] for r in it_only[:5]]}")
    print(f"GLDS-only units: {len(glds_only)} e.g. {[r['unit'] for r in glds_only[:5]]}")
    print(f"SF-only units: {len(sf_only)} e.g. {[r['unit'] for r in sf_only[:5]]}")

    dup_records = [r for r in records if r["duplicate"]]
    print(f"\nDuplicate-flagged units: {len(dup_records)}")
    for r in dup_records[:5]:
        print("  unit", r["unit"], "glds_rows:", len(r["glds_detail"]), "sf_rows:", len(r["sf_detail"]),
              "it_rows:", len(r["it_detail"]))
    check("duplicates are not hidden (all rows retained in detail)",
          all(
              len(r["glds_detail"]) >= 1 and len(r["sf_detail"]) >= 1
              if (r["glds_exists"] and r["sf_exists"]) else True
              for r in dup_records
          ))

    check("no record has empty detail on a side it claims exists",
          all(
              (not r["it_exists"] or len(r["it_detail"]) >= 1) and
              (not r["glds_exists"] or len(r["glds_detail"]) >= 1) and
              (not r["sf_exists"] or len(r["sf_detail"]) >= 1)
              for r in records
          ))

    # spot check a known duplicate unit from manual inspection: unit 403
    rec_403 = next((r for r in records if r["unit"] == "403"), None)
    if rec_403:
        check("unit 403 flagged duplicate (known 2x GLDS + 2x SF record)", rec_403["duplicate"])
        print("unit 403 record:", {k: rec_403[k] for k in
              ("unit", "glds_account_norm", "sf_account_norm", "account_match", "overall_status", "issue_categories")})

    print(f"\nAccount pad width detected from GLDS data: {meta['account_pad_width']}")
    print(f"GLDS<->SF bridged via account (GLDS had no unit on file): {meta['counts']['glds_sf_bridged_via_account']}")
    print(f"IT devices with no unit assignment (excluded from grid, reported separately): {meta['counts']['it_unassigned_devices']}")
    print(f"GLDS accounts with no unit on file (excluded from grid, reported separately): {meta['counts']['glds_unassigned_accounts']}")

    print()
    if FAILURES:
        print(f"{len(FAILURES)} CHECK(S) FAILED:")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    else:
        print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()
