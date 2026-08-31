"""
Loads and normalizes the three Minorca source files:
  - IT Users-Units Data Base.xlsx  (sheet "Minorca")
  - Customer_Address_List_JH_08282026.xlsx  (GLDS export, sheet "Report")
  - Copy of Customers vz-2026-08-28-11-41-43.xlsx  (Salesforce export)

All three files are read with the `calamine` engine (python-calamine), which
tolerates the non-standard OOXML attributes some export tools emit
(e.g. capitalized `WindowWidth`/`WindowHeight`, `firstPageNo`) that make
openpyxl raise TypeErrors. No source file is ever modified.
"""
import os
import re
from datetime import datetime

import pandas as pd

DOWNLOADS_DIR = os.path.expanduser("~/Downloads")

IT_FILENAME = "IT Users-Units Data Base.xlsx"
GLDS_FILENAME = "Customer_Address_List_JH_08282026.xlsx"
SF_FILENAME = "Copy of Customers vz-2026-08-28-11-41-43.xlsx"
PK_FILENAME = "Customer_Pk_08282026.xlsx"

IT_PATH = os.path.join(DOWNLOADS_DIR, IT_FILENAME)
GLDS_PATH = os.path.join(DOWNLOADS_DIR, GLDS_FILENAME)
SF_PATH = os.path.join(DOWNLOADS_DIR, SF_FILENAME)
PK_PATH = os.path.join(DOWNLOADS_DIR, PK_FILENAME)


class SourceFileMissing(Exception):
    pass


def _require(path, label):
    if not os.path.exists(path):
        raise SourceFileMissing(
            f"{label} not found at expected path: {path}. "
            f"Place the file in ~/Downloads with its original name."
        )


def file_meta(path):
    stat = os.stat(path)
    return {
        "path": path,
        "filename": os.path.basename(path),
        "modified": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
        "size_kb": round(stat.st_size / 1024, 1),
    }


# ---------------------------------------------------------------------------
# IT Users-Units Data Base -> "Minorca" sheet only
# ---------------------------------------------------------------------------
def load_it():
    _require(IT_PATH, "IT Users-Units Data Base")
    df = pd.read_excel(IT_PATH, sheet_name="Minorca", engine="calamine")
    df = df.rename(columns=lambda c: str(c).strip())
    return df, file_meta(IT_PATH)


# ---------------------------------------------------------------------------
# GLDS export: the "Report" sheet has merged header cells. When a header
# label's own column is entirely empty, the real data lives one (or more)
# columns to the right -- this reconstructs the intended header -> column
# mapping generically rather than hardcoding column positions.
# ---------------------------------------------------------------------------
def _flatten_merged_report_header(raw: pd.DataFrame) -> pd.DataFrame:
    header_row = raw.iloc[0]
    data = raw.iloc[1:].reset_index(drop=True)
    ncols = raw.shape[1]
    mapping = {}
    i = 0
    while i < ncols:
        label = header_row[i]
        if pd.notna(label):
            label = str(label).strip()
            data_col = i
            j = i
            col_data = data[j]
            while col_data.isna().all() and j + 1 < ncols:
                j += 1
                col_data = data[j]
                data_col = j
            if label not in mapping:
                mapping[label] = data_col
        i += 1
    return pd.DataFrame({label: data[col] for label, col in mapping.items()})


def load_glds():
    _require(GLDS_PATH, "GLDS Customer_Address_List")
    raw = pd.read_excel(GLDS_PATH, sheet_name="Report", engine="calamine", header=None)
    df = _flatten_merged_report_header(raw)
    # Drop fully-blank rows (can appear at the end of some report exports)
    df = df.dropna(how="all").reset_index(drop=True)
    return df, file_meta(GLDS_PATH)


# ---------------------------------------------------------------------------
# Salesforce export -- clean single header row, no quirks.
# ---------------------------------------------------------------------------
def load_salesforce():
    _require(SF_PATH, "Salesforce Customers export")
    df = pd.read_excel(SF_PATH, sheet_name=0, engine="calamine")
    df = df.rename(columns=lambda c: str(c).strip())
    df = df.dropna(how="all").reset_index(drop=True)
    return df, file_meta(SF_PATH)


# ---------------------------------------------------------------------------
# GLDS package/billing export (Customer_Pk) -- one row per billed line item
# (package, fee, add-on) per account. `SUBS` is the same bare account suffix
# used by GLDS `Account No.` (016-000684 -> 684) and Salesforce `GLDS Account
# Number`, so it joins on the account key already used elsewhere.
# ---------------------------------------------------------------------------
def load_pk():
    _require(PK_PATH, "Customer_Pk package export")
    df = pd.read_excel(PK_PATH, sheet_name="Report", engine="calamine")
    df = df.rename(columns=lambda c: str(c).strip())
    df = df.dropna(subset=["SUBS"]).reset_index(drop=True)
    return df, file_meta(PK_PATH)


# ---------------------------------------------------------------------------
# Normalization helpers (shared by reconcile.py)
# ---------------------------------------------------------------------------
_FLOAT_INT_RE = re.compile(r"^\d+\.0+$")


_LEADING_ZEROS_BEFORE_LETTER_RE = re.compile(r"^0+(?=[A-Za-z])")


def normalize_unit(value):
    """Canonicalize a unit number so '101', '101.0', ' 101 ', 101 (int) all
    collapse to the same key, WITHOUT merging genuinely different units.
    Purely-numeric unit numbers are canonicalized by stripping leading
    zeros / trailing '.0' (int round-trip). Named units (GYM, COMMON AREA,
    OFFICE, ...) are upper-cased and trimmed -- and, since GLDS pads its
    unit field with the same leading-zero convention it uses for numeric
    units (e.g. '000000GYM'), any leading zeros immediately before the
    letters are stripped too, so 'GYM' from Salesforce and '000000GYM'
    from GLDS collapse to the same key. A digit that isn't a zero-pad
    artifact (not immediately followed by a letter) is left alone."""
    if value is None:
        return None
    if isinstance(value, float) and pd.isna(value):
        return None
    s = str(value).strip()
    if s == "" or s.lower() == "nan":
        return None
    if _FLOAT_INT_RE.match(s):
        s = s.split(".")[0]
    # purely numeric (allow leading zeros) -> canonical int-string form
    if re.match(r"^\d+$", s):
        try:
            return str(int(s))
        except ValueError:
            return s.upper()
    s = _LEADING_ZEROS_BEFORE_LETTER_RE.sub("", s)
    return s.upper()


def normalize_account_from_glds(account_no):
    """GLDS 'Account No.' looks like '016-000684'. We take everything after
    the LAST '-' and preserve leading zeros (kept as a string, never cast
    to int for the final value)."""
    if account_no is None or (isinstance(account_no, float) and pd.isna(account_no)):
        return None
    s = str(account_no).strip()
    if s == "" or s.lower() == "nan":
        return None
    if "-" in s:
        s = s.rsplit("-", 1)[-1]
    return s.strip()


def normalize_account_from_salesforce(value, pad_width):
    """Salesforce 'GLDS Account Number' is often stored as a float/int
    (leading zeros already lost by Excel). We restore them by zero-padding
    to `pad_width` (learned at runtime from the GLDS data itself)."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)):
        try:
            s = str(int(value))
        except (ValueError, OverflowError):
            s = str(value).strip()
    else:
        s = str(value).strip()
        if s == "" or s.lower() == "nan":
            return None
        if _FLOAT_INT_RE.match(s):
            s = s.split(".")[0]
    digits = re.sub(r"\D", "", s)
    if digits == "":
        return None
    return digits.zfill(pad_width)


def detect_account_pad_width(glds_df, account_col="Account No."):
    """Look at the real GLDS Account No. suffix lengths and pick the most
    common one, defaulting to 6 if the data is empty/ambiguous."""
    suffixes = glds_df[account_col].dropna().astype(str).apply(
        lambda s: s.rsplit("-", 1)[-1].strip()
    )
    lengths = suffixes.str.len()
    if lengths.empty:
        return 6
    mode = lengths.mode()
    return int(mode.iloc[0]) if not mode.empty else 6
