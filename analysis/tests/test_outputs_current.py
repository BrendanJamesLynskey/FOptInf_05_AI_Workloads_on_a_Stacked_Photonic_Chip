"""The committed outputs (analysis/out, js/fop05_data.js, js/tests/fixtures.json) match a fresh run."""
import json
import math
from pathlib import Path

import breakeven as B
import precision_needed as P

ROOT = Path(__file__).resolve().parents[2]


def close_tree(a, b, where=""):
    if isinstance(b, dict):
        assert set(a) == set(b), where
        for k in b:
            close_tree(a[k], b[k], f"{where}.{k}")
    elif isinstance(b, list):
        assert len(a) == len(b), where
        for i, (x, y) in enumerate(zip(a, b)):
            close_tree(x, y, f"{where}[{i}]")
    elif isinstance(b, float) and not isinstance(b, bool):
        assert math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-15), (where, a, b)
    else:
        assert a == b, (where, a, b)


def test_precision_output_current():
    close_tree(json.loads((ROOT / "analysis/out/precision_needed.json").read_text()), json.loads(json.dumps(P.compute())))


def test_breakeven_output_current():
    close_tree(json.loads((ROOT / "analysis/out/breakeven.json").read_text()), json.loads(json.dumps(B.compute())))


def test_deck_data_carries_the_outputs():
    s = (ROOT / "js/fop05_data.js").read_text()
    body = s[s.index("const D = ") + len("const D = "): s.index(";\nif (typeof module")]
    d = json.loads(body)
    close_tree(d["precision"], json.loads((ROOT / "analysis/out/precision_needed.json").read_text()))
    close_tree(d["breakeven"], json.loads((ROOT / "analysis/out/breakeven.json").read_text()))
