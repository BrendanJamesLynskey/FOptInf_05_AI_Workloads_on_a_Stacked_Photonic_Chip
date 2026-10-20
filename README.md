# Fourier Optics for Inference 05: AI workloads on a stacked photonic chip

The fifth deck in the series *Fourier Optics for Inference*. Open `index.html` in a browser: one self-contained page
plus local `js/` and `fonts/`, with no external requests.

## What it asks, and what it answers

**Which AI workloads could the future dense, 3D-stacked photonic chip run well, and under what conditions?** The chip
is the future system the developer of a photonic link module (arXiv:2608.21536) has described in public: a photonic
layer of 4-point optical transform units stacked on its logic, with an exact mode (integers, for FHE and PQC) and an
approximate mode (a few effective bits, for FFT- and AI-style work).

With the simulator's illustrative parameters, the answer is: **none of the screened workloads pays.**

- **Memory wall.** With today's HBM the chip and an all-digital ASIC take the same time (1×). When compute binds,
  exact arithmetic caps the gain near 1.1×, and the same silicon spent on logic is faster (0.9163×).
- **Precision.** Approximate mode keeps 2.74 effective bits at S = 1 and 3.198 at S = 6. By the series' rule, FP4
  E2M1 needs 4.20 ENOB and INT4 3.80 (both computed here for the first time; BF16, INT8 and FP8 E4M3 reproduce the
  series' 10.3, 8.0 and 6.3 exactly). In the simulator's own measure FP4-class formats need 2.79–3.13 bits, so the
  chain is on the scale of FP4 and well short of FP8 (4.97) and BF16 (8.96).
- **Energy.** 6.929 pJ per butterfly-stage against 0.2141 pJ for a digital butterfly of matched precision; the
  laser alone (0.3182 pJ) exceeds it, so no conversion energy rescues it at the defaults.
- **Screen.** Fourier mixing (FNet 0.09%, Hyena 0.20% of prefill FLOPs) is too small a share; block-circulant weights
  (84.54%) are the only large share but need FP4-level tolerance and the energy conditions of slide 16; the FP4 MAC
  is a projection whose analogue-ness is unknown; KV and training traffic belong to a link, not the chip; exact-mode
  NTTs (the developer's stated first market) show no modelled gain either.

## Inputs and provenance

| Path | What it is |
|---|---|
| `data/plms_v0_3/` | The photonic link module simulator's results, **plms 0.3.0 at commit e3054d1**: `results_extract.md` (sections 7 and 12–16, and the future-chip assumptions with their tags) and the experiments' web JSON. Vendored, read-only; SHA-256 sums in `data/SHA256SUMS`, checked by the tests. |
| `data/foptinf_analysis/` | The series' FLOP-share analysis (`flop_share.py`, `results.md/json`): Amdahl shares and the ENOB rule. |
| `reference/` | Earlier decks (style, the series' precision treatment, CiT_01's five tests) and the visual standard. |
| `sources/quotes.md` | Every page opened for this deck, with the exact quotes used, and the pages that could not be opened. |

The explainer site https://photonic-link-module-explained.vercel.app/ (Part II, chapters 12–17) presents the
simulator's results in full; the deck links to it instead of re-explaining the simulator.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The deck (20 slides, `id="slide-00"` … `slide-19`), head, CSS, contents and footer as deck 01. |
| `analysis/plms_data.py` | Read-only loader for `data/`: checksums, JSON, and a parser for `results_extract.md`'s tables. |
| `analysis/precision_needed.py` | ENOB each format needs (FP4 E2M1, MXFP4, NVFP4, INT4, FP8 E4M3/E5M2, INT8, BF16) by the series' rule, on the series' own signal replayed from its seed. |
| `analysis/breakeven.py` | The simulator's energy accounting in closed form; reproduces sections 13 and 16 exactly; break-even conditions. |
| `analysis/build.py` | Runs both, writes `analysis/out/` (JSON and `results.md`), `js/fop05_data.js` and `js/tests/fixtures.json`. |
| `analysis/tests/` | pytest: data matches `results_extract.md`; the series' ENOBs are reproduced; the energy model matches; outputs are current. |
| `js/fop05_models.js` | The JS ports of the formulas used live, and the animations' step sequences. |
| `js/fop05_figures.js` | Every figure, explorer and animation, drawn from the models. |
| `js/fopanim.js` | The series' stepped-animation controller, copied from deck 01 (one fix: the scrub bar now scrubs). |
| `js/tests/models.test.js` | node tests: the JS models agree with the Python fixtures. |
| `tools/check_numbers.py` | Every number on the slides is in `data/`, `analysis/out/` or a quote file (exemptions in `tools/number_exemptions.json`). |
| `tools/check_names.py` | Hashed check that the repository names no company other than cited sources' authors and institutions. |
| `tools/browser_check.js` | Playwright at 1280 and 390 px, light and dark: no errors, no overflow, animations step and stay still under reduced motion, explorer readouts equal the Python fixtures; screenshots of every slide at 390 px into `artifacts/`. |

## Rebuild and check

```sh
pip install -r requirements.txt        # numpy, pytest (Python 3.12)
python3 analysis/build.py              # regenerate analysis/out, js/fop05_data.js, js/tests/fixtures.json
python3 -m pytest -q analysis/tests
node --test js/tests/models.test.js
python3 tools/check_numbers.py
python3 tools/check_names.py
npm install && node tools/browser_check.js   # or PW_CHROMIUM=/path/to/chrome with a global playwright
```

Everything runs in well under a minute except the browser check (about two minutes). The GitHub Actions workflow
(`.github/workflows/checks.yml`) runs pytest, the node tests, the number check and the naming check.

## Licences

The deck is CC BY 4.0 and the code MIT, matching the series (`LICENSE`). The fonts are under the SIL Open Font
License 1.1 (`fonts/LICENSE.md`). `data/` and `reference/` are vendored from the series and the simulator.
