#!/usr/bin/env python3
"""Every number on the slides is found in data/, in analysis/ outputs, or in a quote file.

Reads the visible text of index.html (scripts and styles removed; numbers that the page computes at run time come
from the tested JS models and are not in the HTML). Each number is accepted if it appears

  - as written in data/plms_v0_5/results_extract.md, data/foptinf_analysis/results.md or sources/quotes.md;
  - as a value in data/*.json or analysis/out/*.json, rounded to the number of significant figures or decimal
    places the slide uses (a slide may round 3.198 to 3.2, never invent 3.3);
  - in tools/number_exemptions.json, each with its reason (slide numbers, small counts, years, identifiers).

Identifiers are skipped: digits that are part of a word or a name (FP8, E4M3, Llama-3-8B, CiT_03, arXiv:2608.21536).
Exit status 1 lists every number that has no source.
"""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SOURCES = [ROOT / "data/plms_v0_5/results_extract.md",
                ROOT / "data/foptinf_analysis/results.md",
                ROOT / "sources/quotes.md", ROOT / "analysis/out/results.md"]
JSON_SOURCES = sorted((ROOT / "data").rglob("*.json")) + sorted((ROOT / "analysis/out").glob("*.json"))
NUM = re.compile(r"(?<![\w.:/-])[-−]?\d[\d,]*(?:\.\d+)?(?:e[-+]?\d+)?(?![\w])")


def visible_text(path: Path) -> list[tuple[str, str]]:
    """(slide id, text) for each slide and the hero/footer, tags stripped."""
    s = path.read_text()
    s = re.sub(r"<script.*?</script>|<style.*?</style>", " ", s, flags=re.S)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    parts = re.split(r'(<section class="slide" id="slide-\d+[a-z]?">)', s)
    out = [("hero", parts[0])]
    for i in range(1, len(parts), 2):
        sid = re.search(r'id="(slide-\d+[a-z]?)"', parts[i]).group(1)
        out.append((sid, parts[i + 1]))
    clean = []
    for sid, t in out:
        t = re.sub(r'(href|src|class|id|viewBox|d|x|y|width|height|rx|ry|cx|cy|r|style|data-n|for|min|max|step|value|aria-label|title)="[^"]*"', " ", t)
        t = re.sub(r"<[^>]+>", " ", t)
        clean.append((sid, html.unescape(t)))
    return clean


def norm(tok: str) -> str:
    t = tok.replace("−", "-").replace(",", "")
    try:
        v = float(t)
    except ValueError:
        return t
    return repr(v)


def variants(v: float) -> set[str]:
    out = set()
    for n in range(1, 7):
        out.add(norm(f"{v:.{n}g}"))
    for d in range(0, 5):
        out.add(norm(f"{v:.{d}f}"))
    out.add(norm(repr(v)))
    return out


def walk(o, acc: set):
    if isinstance(o, bool) or o is None:
        return
    if isinstance(o, (int, float)):
        acc |= variants(float(o))
        if 0 < abs(o) < 1:                              # shares are shown as percentages
            acc |= variants(float(o) * 100)
    elif isinstance(o, dict):
        for k, v in o.items():
            walk(v, acc)
            try:
                acc |= variants(float(k))
            except ValueError:
                pass
    elif isinstance(o, list):
        for v in o:
            walk(v, acc)
    elif isinstance(o, str):
        for m in NUM.finditer(o):
            acc.add(norm(m.group(0)))


def corpus() -> set[str]:
    acc: set[str] = set()
    for p in TEXT_SOURCES:
        for m in re.finditer(r"[-−]?\d[\d,]*(?:\.\d+)?(?:e[-+]?\d+)?", p.read_text()):
            acc.add(norm(m.group(0)))
    for p in JSON_SOURCES:
        walk(json.loads(p.read_text()), acc)
    return acc


def main() -> int:
    ex = json.loads((ROOT / "tools/number_exemptions.json").read_text())
    exempt = {norm(k) for k in ex["numbers"]}
    small = ex["small_integers_up_to"]
    acc = corpus()
    missing = []
    count = 0
    for sid, text in visible_text(ROOT / "index.html"):
        for m in NUM.finditer(text):
            tok = m.group(0)
            n = norm(tok)
            count += 1
            try:
                v = float(n)
            except ValueError:
                continue
            if v.is_integer() and 0 <= v <= small:
                continue
            if n in exempt or n in acc:
                continue
            ctx = text[max(0, m.start() - 40): m.end() + 30].replace("\n", " ")
            missing.append(f"{sid}: {tok}   …{' '.join(ctx.split())}…")
    if missing:
        print(f"{len(missing)} number(s) with no source:")
        print("\n".join(missing))
        return 1
    print(f"check_numbers: {count} numbers on the slides, all sourced "
          f"({len(exempt)} listed exemptions, integers up to {small} exempt)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
