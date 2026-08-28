import io
import os
import socket
from datetime import datetime

import pandas as pd
from flask import Flask, jsonify, request, send_file, send_from_directory

from reconcile import build_master, summarize
from data_loader import SourceFileMissing

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")

app = Flask(__name__, static_folder=None)

_cache = {"records": None, "meta": None, "summary": None, "generated_at": None, "error": None}


def _load(force=False):
    if _cache["records"] is not None and not force:
        return
    try:
        records, meta = build_master()
        summary = summarize(records, meta)
        _cache.update({
            "records": records,
            "meta": meta,
            "summary": summary,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "error": None,
        })
    except SourceFileMissing as e:
        _cache.update({"records": [], "meta": {}, "summary": {}, "generated_at": None, "error": str(e)})


@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)


@app.route("/api/data")
def api_data():
    _load()
    if _cache["error"]:
        return jsonify({"error": _cache["error"]}), 500
    return jsonify({
        "summary": _cache["summary"],
        "records": _cache["records"],
        "unassigned": {
            "it": _cache["meta"]["it_unassigned"],
            "glds": _cache["meta"]["glds_unassigned"],
        },
        "generated_at": _cache["generated_at"],
    })


@app.route("/api/refresh", methods=["POST"])
def api_refresh():
    _load(force=True)
    if _cache["error"]:
        return jsonify({"error": _cache["error"]}), 500
    return jsonify({"ok": True, "generated_at": _cache["generated_at"]})


def _records_to_dataframe(records):
    rows = []
    for r in records:
        rows.append({
            "Unit": r["unit"],
            "IT Device": "ON" if r["it_exists"] else "OFF",
            "IT Speed": r["it_speed"] or "",
            "IT Unit (raw)": r["it_unit_raw"] or "",
            "GLDS Account": r["glds_account_full"] or "",
            "GLDS Account (normalized)": r["glds_account_norm"] or "",
            "GLDS Status": r["glds_status_raw"] or "",
            "GLDS Status (classified)": r["glds_status_class"] or "",
            "GLDS Unit (raw)": r["glds_unit_raw"] or "",
            "SF Account (GLDS Account Number)": r["sf_account_raw"] or "",
            "SF Account (normalized)": r["sf_account_norm"] or "",
            "SF Status": r["sf_status_raw"] or "",
            "SF Status (classified)": r["sf_status_class"] or "",
            "SF Unit (raw)": r["sf_unit_raw"] or "",
            "Unit Match (GLDS<->SF)": r["unit_match_glds_sf"],
            "Account Match (GLDS<->SF)": r["account_match"],
            "Duplicate": "Yes" if r["duplicate"] else "No",
            "Overall Status": r["overall_status"],
            "Issue Categories": "; ".join(r["issue_categories"]),
            "Issue Details": " | ".join(i["description"] for i in r["issues"]),
        })
    return pd.DataFrame(rows)


@app.route("/api/export/all")
def export_all():
    _load()
    df = _records_to_dataframe(_cache["records"])
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Minorca Reconciliation", index=False)
    buf.seek(0)
    return send_file(buf, as_attachment=True,
                      download_name="Minorca_Reconciliation_All.xlsx",
                      mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@app.route("/api/export/issues")
def export_issues():
    _load()
    issues = [r for r in _cache["records"] if r["overall_status"] != "OK"]
    df = _records_to_dataframe(issues)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Minorca Issues", index=False)
    buf.seek(0)
    return send_file(buf, as_attachment=True,
                      download_name="Minorca_Reconciliation_Issues.xlsx",
                      mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


def find_free_port(preferred=8901, attempts=50):
    for port in range(preferred, preferred + attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


if __name__ == "__main__":
    _load()
    port = find_free_port()
    print(f"\n{'=' * 60}")
    print(f"Minorca Data Reconciliation running at: http://127.0.0.1:{port}")
    print(f"{'=' * 60}\n")
    app.run(host="127.0.0.1", port=port, debug=False)
