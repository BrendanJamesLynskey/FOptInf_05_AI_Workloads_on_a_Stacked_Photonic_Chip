# Fourier Optics for Inference 05: AI workloads on a stacked photonic chip

The fifth deck in the series *Fourier Optics for Inference*. Open `index.html` in a browser: one self-contained page
plus local `js/` and `fonts/`, with no external requests.

## What it asks, and what it answers

**Which AI workloads could the future dense, 3D-stacked photonic chip run well, and under what conditions?** The chip
is the future system the developer of a photonic link module (arXiv:2608.21536) has described in public: a photonic
layer of 4-point optical transform units stacked on its logic, with an exact mode (integers, for FHE and PQC) and an
approximate mode (a few effective bits, for FFT- and AI-style work). Each unit's transform is a passive diffractive slab,
as the module paper (§II, "passive diffractive device") and its patent EP4677399A1 ("a slab waveguide") describe; the
simulator models it so from plms 0.5.0 (earlier versions modelled an MZI mesh).

With the simulator's illustrative parameters, the answer is: **none of the screened workloads pays**, and the slab does
not change that (slide 01b).

- **Does a slab change the verdict? No** (plms 0.5.0, slide 01b). Exact mode still loses to the all-digital ASIC on
  energy (498.9 against 32.35 pJ per 59-bit 4-point transform; floor with free light and crossings 43.78 pJ, unchanged)
  and speed (ceiling 1.1×, equal silicon 0.9163×, unchanged). The slab's 1.977 dB insertion loss cuts the module's
  margin at −5 dBm LO from 10.43 to 7.196 dB and one laser's fan-out from U × W = 20 to 12 (4 λ, 6 dB). Fewer heaters
  help drift (availability 0.6917 against the mesh's 0.605). Approximate mode: 2.74 → 2.746 bits at S = 1, but fully
  chained 3.198 → 1.872.
- **Native size N** (slide 16b). Beyond 4 points the outputs of a DFT of bits are not integers (15, 375, 234,375 and
  91,552,734,375 levels at N = 8, 16, 32, 64), so no N > 4 keeps exact mode, and the bootstrap bound falls from 1.1× to
  0.4204× at N = 64. A larger slab helps approximate mode only: fully chained, 3.092 bits at N = 64, still under the
  v0.4 mesh's 3.198.

- **Memory wall.** With today's HBM the chip and an all-digital ASIC take the same time (1×). When compute binds,
  exact arithmetic caps the gain near 1.1×, and the same silicon spent on logic is faster (0.9163×).
- **Precision.** On the 4-point slab approximate mode keeps 2.746 effective bits at S = 1, 2.758 at S = 2 (its best)
  and 1.872 at S = 6. By the series' rule, FP4 E2M1 needs 4.20 ENOB and INT4 3.80 (both computed here for the first
  time; BF16, INT8 and FP8 E4M3 reproduce the series' 10.3, 8.0 and 6.3 exactly). In the simulator's own measure
  FP4-class formats need 2.79–3.13 bits, just above the chain's best, and FP8 (4.97) and BF16 (8.96) are far out.
- **Energy.** 7.15 pJ per butterfly-stage against 0.0707 pJ for a digital butterfly of matched precision; the
  laser alone (0.5385 pJ) exceeds it, so no conversion energy rescues it at the defaults.
- **Screen.** Fourier mixing (FNet 0.09%, Hyena 0.20% of prefill FLOPs) is too small a share; block-circulant weights
  (84.54%) are the only large share but need FP4-level tolerance and the energy conditions of slide 16; the FP4 MAC
  is a projection whose analogue-ness is unknown; KV and training traffic belong to a link, not the chip; exact-mode
  NTTs (the developer's stated first market) show no modelled gain either.
- **Wavelengths sharing a slab** (experiment 17; notes on slides 05, 09 and 16). A slab's phases scale with
  wavelength, so one shared slab gives each channel off the centre a slightly wrong transform: at 16 × 200 GHz around
  1310 nm the worst channel is 0.04079 off DFT4, most of it the slab's own residual at the centre (0.02756). Exact mode
  barely notices (0.0342 dB of margin); the 5 µm rings' FSR (14.01 nm, 8 channels at 200 GHz) binds first. Approximate
  mode: at 4 λ 2.714 and 1.862 bits at S = 1 and 6 (2.746 and 1.872 alone), and 1.551 at S = 6 for the worst of 32. The
  LO paths must match to 0.08156 µm or be trimmed per channel; a slab per wavelength removes the wavelength term (not
  the residual) at 4 λ and U = 64 for 64 mm² and 66.56 W of heaters against 25.6 mm² and 32 W. See the explainer's
  [wavelengths chapter](https://photonic-link-module-explained.vercel.app/chapters/wavelengths/).

## Inputs and provenance

| Path | What it is |
|---|---|
| `data/plms_v0_5/` | The photonic link module simulator's results, **plms 0.5.0 at commit d46a388** (OFT = a passive diffractive slab): `results_extract.md` (the viability verdict "Does a slab change the viability of the future system?", the v0.4 → v0.5 table, sections 7 and 12–19, and the future-chip, wavelength-dependence and slab assumptions with their tags) and the web JSON of e7 and e12–e19. Vendored, read-only; SHA-256 sums in `data/SHA256SUMS`, values checked against the report by `analysis/tests/test_data.py`. It replaces the earlier `plms_v0_3/` (e3054d1) and `plms_v0_4/` (fe2ee0a) data, which modelled an MZI mesh (in git history). |
| `data/foptinf_analysis/` | The series' FLOP-share analysis (`flop_share.py`, `results.md/json`): Amdahl shares and the ENOB rule. |
| `reference/` | Earlier decks (style, the series' precision treatment, CiT_01's five tests) and the visual standard. |
| `sources/quotes.md` | Every page opened for this deck, with the exact quotes used, and the pages that could not be opened. |

The explainer site https://photonic-link-module-explained.vercel.app/ (its Part II chapters, and the
[wavelengths chapter](https://photonic-link-module-explained.vercel.app/chapters/wavelengths/) for experiment 17) presents the
simulator's results in full; the deck links to it instead of re-explaining the simulator.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The deck (22 slides, `id="slide-00"` … `slide-19`, with `slide-01b` and `slide-16b` added for plms 0.5.0; ids are never renumbered), head, CSS, contents and footer as deck 01. |
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
