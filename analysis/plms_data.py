"""Read-only loader for the vendored inputs in ``data/``.

``data/`` is never edited. This module checks its SHA-256 sums, loads the simulator's web JSON
(plms 0.3.0 at e3054d1) and parses the tables of ``results_extract.md`` so that tests can check
that every value the deck reads from the JSON matches the simulator's own report.
"""

from __future__ import annotations

import hashlib
import json
import re
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
PLMS = DATA / "plms_v0_3"
SERIES = DATA / "foptinf_analysis"

SIMULATOR = {"package": "plms", "version": "0.3.0", "commit": "e3054d1"}


def verify_checksums() -> dict[str, bool]:
    """Every file listed in data/SHA256SUMS, mapped to whether its hash still matches."""
    out = {}
    for line in (DATA / "SHA256SUMS").read_text().splitlines():
        if not line.strip():
            continue
        digest, rel = line.split(maxsplit=1)
        path = ROOT / rel.strip()
        if not str(path).startswith(str(DATA)):
            continue                        # reference/ files are listed too; they are not data
        out[rel.strip()] = hashlib.sha256(path.read_bytes()).hexdigest() == digest
    return out


@lru_cache(maxsize=None)
def experiment(name: str) -> dict:
    """One experiment's web JSON, e.g. experiment('e16_approximate')."""
    return json.loads((PLMS / f"{name}.json").read_text())


def figure(name: str, fig_id: str) -> dict:
    for f in experiment(name)["figures"]:
        if f["id"] == fig_id:
            return f
    raise KeyError((name, fig_id))


def series(name: str, fig_id: str, series_name: str) -> dict:
    for s in figure(name, fig_id)["series"]:
        if s["name"] == series_name:
            return s
    raise KeyError((name, fig_id, series_name))


def table(name: str, table_id: str):
    for t in experiment(name)["tables"]:
        if t["id"] == table_id:
            return t
    raise KeyError((name, table_id))


@lru_cache(maxsize=None)
def series_results() -> dict:
    """The series' analysis results (FOptInf flop_share.py), vendored."""
    return json.loads((SERIES / "results.json").read_text())


# ───────────────────────────────────────────── results_extract.md ──
def num(cell: str) -> float | None:
    """A results.md cell as a number: '1,024' -> 1024, '1.695e-4' -> 0.0001695, '—' -> None."""
    c = cell.strip().replace(",", "").replace("×", "")
    try:
        return float(c)
    except ValueError:
        return None


@lru_cache(maxsize=None)
def extract_text() -> str:
    return (PLMS / "results_extract.md").read_text()


@lru_cache(maxsize=None)
def extract_tables() -> list[dict]:
    """Every markdown table in results_extract.md, with the section (##), subsection (###) and the
    nearest preceding prose line, so a table can be found by what it is about."""
    out, sec, sub, lead = [], "", "", ""
    lines = extract_text().splitlines()
    i = 0
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("## "):
            sec, sub = ln[3:].strip(), ""
        elif ln.startswith("### "):
            sub = ln[4:].strip()
        elif ln.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[-| ]+\|$", lines[i + 1]):
            head = [c.strip() for c in ln.strip("|").split("|")]
            rows = []
            i += 2
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([c.strip() for c in lines[i].strip("|").split("|")])
                i += 1
            out.append({"section": sec, "sub": sub, "lead": lead, "head": head, "rows": rows})
            continue
        elif ln.strip():
            lead = ln.strip()
        i += 1
    return out


def find_table(section_prefix: str, head0: str, sub: str = "", lead_contains: str = "") -> dict:
    """The first table in a section whose first header cell is head0 (and optional filters)."""
    for t in extract_tables():
        if (t["section"].startswith(section_prefix) and t["head"][0] == head0
                and (not sub or t["sub"] == sub) and lead_contains in t["lead"]):
            return t
    raise KeyError((section_prefix, head0, sub, lead_contains))


@lru_cache(maxsize=None)
def assumptions() -> list[dict]:
    """The simulator's future-chip assumptions table: parameter, default, source tag, sweep, meaning."""
    t = find_table("Future-chip assumptions", "parameter")
    return [{"parameter": r[0].strip("`"), "default": r[1], "source": r[2], "swept": r[3], "meaning": r[4]}
            for r in t["rows"]]


def assumption(parameter: str) -> dict:
    for a in assumptions():
        if a["parameter"] == parameter:
            return a
    raise KeyError(parameter)


def default_value(parameter: str) -> float:
    """The numeric part of an assumption's default ('0.5 pJ/bit' -> 0.5, '1.8e-4 1/K' -> 1.8e-4)."""
    m = re.match(r"^\s*([-+]?\d[\d.,]*(?:e[-+]?\d+)?)", assumption(parameter)["default"])
    if not m:
        raise ValueError(parameter)
    return float(m.group(1).replace(",", ""))


def sig_equal(a: float, b: float, digits: int = 4) -> bool:
    """Equal at the precision results.md prints (4 significant figures)."""
    if a == b:
        return True
    if a == 0 or b == 0:
        return abs(a - b) < 10 ** -digits
    if float(f"{a:.{digits}g}") == float(f"{b:.{digits}g}"):
        return True
    # a value printed from a tie (0.20625 -> 0.2062) can round either way: allow half a unit
    import math
    unit = 10 ** (math.floor(math.log10(abs(b))) - digits + 1)
    return abs(a - b) <= 0.5001 * unit
