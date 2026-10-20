# Build brief: FOptInf 05, AI workloads on a stacked photonic chip

One interactive deck, the fifth in the series *Fourier Optics for Inference*. It asks: **which AI workloads could
the future dense, 3D-stacked photonic chip run well, and under what conditions?**

The series so far, and the simulator results that came after it, answer two narrower questions:

- what a Fourier-optical engine costs in general (decks 01–03);
- what today's pluggable photonic link module does (deck 04, and the simulator).

No deck yet covers the future system. Work on a branch, open one PR, and do not merge. The repo is private until the
owner publishes it.

## 0. Ground rules (all of them apply)

- **Naming.** Never name the module's developer, anywhere: not in the slides, code, comments, commit messages or
  PR text. Say "a photonic link module (arXiv:2608.21536)" and "the future system its developer has described in
  public". Before opening the PR, run a check that the repo contains no company names other than those of cited
  papers' authors and institutions; the planner runs a hashed check afterwards.
- **Every number has a source.** A number shown must do one of three things:
  - appear in `data/` (vendored, read-only; checksums in `data/SHA256SUMS`);
  - be computed by `analysis/` code with tests;
  - be quoted from a cited source you actually opened.

  Tag each assumption `paper`, `public-statement`, `modelled` (from the simulator data) or `illustrative`, as the
  simulator does. Never invent results, and never edit `data/`.
- **Precision of language.** Exact mode decodes to exact integers (NTT, FHE). Approximate mode keeps a few
  effective bits (FFT- and AI-style work). FP4 MAC is "a projection for a future chip, not a measurement" (the
  paper §V). The analogue-ness of that FP4 MAC is unknown; say so.
- **Visual first.** Graphics and model-driven animation wherever a mechanism or a trade-off is shown (see
  `reference/visual_standard.md`):
  - animations are stepped (play, pause, step, scrub, speed, reset), captioned, aria-live, and static under
    `prefers-reduced-motion`;
  - frames are computed by tested JS models, not hand-drawn.
- **Style.** Match deck 01 exactly: copy the head, CSS, slide structure, contents list, `FopAnim` controller and
  footer from `reference/FOptInf_01.html`. Use the same palette and fonts, and `id="slide-NN"` anchors. Keep it
  one self-contained `index.html` plus local `js/`, with no external requests.
- **Phones.** At 390 px there is no horizontal scroll. Wide SVGs get a portrait twin, or are split into
  `.fig-row` cells. Canvases switch to a taller aspect when narrow.
- **Machine limits** (the planner's PC runs the checks): there are no heavy jobs, and tests finish in under a minute.

## 1. Inputs (read first)

| Path | What it is |
|---|---|
| `data/plms_v0_3/results_extract.md` | The simulator's results: §7 (today's module: throughput, energy, break-even) and §12–16 (the future chip), plus every future-chip assumption with its tag and swept range |
| `data/plms_v0_3/e7_*.json`, `e12_*.json` … `e16_*.json` | The same experiments' data, as served by the explainer site |
| `data/foptinf_analysis/` | The series' analysis (`flop_share.py`, `results.md/json`, tests): Amdahl FLOP shares (Hyena, FNet, block-circulant) and the ENOB needed to match BF16, INT8 and FP8 |
| `reference/FOptInf_01.html`, `reference/FOptInf_02.html` | Style, plus the series' precision and conversion-energy treatment (slides 15–22 of 01, slide 10 of 02) |
| `reference/CiT_01.html` | The five tests for compute in transit (slide 10) and the low-bit candidates; reuse the tests as the workload screen |
| `reference/visual_standard.md` | The animation and graphics standard |

The explainer site https://photonic-link-module-explained.vercel.app/ (Part II, chapters 12–17) presents the same
results; link to it rather than re-explaining the simulator.

## 2. The deck (about 20 slides; ids `slide-00` …)

1. **Title and the question.** One line on what changed since decks 01–04: a simulator now models the stacked chip.
2. **The system.** What it is, with each item tagged:
   - a photonic layer stacked on its logic: U units, each a 4-point optical transform, at baud B with W wavelengths;
   - drivers, TIAs, decisions and reduction in the logic underneath;
   - an external laser, split on-chip;
   - thermo-optic phase shifters.

   Show a diagram of the two layers, with a toggle between exact mode and approximate mode.
3. **The memory wall.** From §12:
   - with today's HBM, the chip and an all-digital ASIC take the same time (1×);
   - when compute binds, exact arithmetic caps the gain near 1.1×;
   - the same silicon spent on logic is faster (0.9163×).

   Make this an interactive plot from `e12` (sweep U, W, B, HBM).
4. **Exact vs approximate.** Why exact mode converts at every stage, and approximate mode chains S stages
   optically. Animate a 4,096-point FFT's 6 radix-4 stages with conversions on or off.
5. **Precision available.** From §16: 2.74 effective bits at S = 1 and 3.198 at S = 6, with 8-bit converters; the
   1 dB and 3 dB per-stage loss cases; the ceiling with better converters. Build a slider explorer over the `e16`
   grid (S × converter ENOB).
6. **Precision needed.** Compute, in `analysis/precision_needed.py` with tests, the ENOB each format needs:
   - FP4 E2M1, INT4, FP8 E4M3 and E5M2, INT8, BF16;
   - with the **same rule** the series already uses (`data/foptinf_analysis`: it gives BF16 10.3, INT8 8.0 and
     FP8 6.3);
   - check that it reproduces those three values before trusting the new ones.

   FP4 has never been computed in the series. Plot "needed" against "available" as one chart.
7. **Energy at matched precision.** From §13 and §16:
   - exact mode: 485.9 against 32.35 pJ per 4-point transform, with crossings at 354 pJ;
   - approximate mode: 6.929 pJ per butterfly-stage against 0.7188 pJ for a digital 8-bit complex butterfly, and
     0.2141 pJ at matched precision;
   - throughput 59× the exact-mode rate.

   Draw a stacked energy bar (laser at the wall, conversions, heaters, logic, memory) with the digital bar beside it.
8. **What breaks even.** The conditions under which approximate mode would win on energy per useful operation:
   conversion pJ/bit, chained stages, laser fan-out and static power. Give the formula beside a small what-if
   explorer, computed in `analysis/` from the data's parameters. State plainly where it never pays.
9. **Physical limits.** From §14 and §15:
   - one 20 dBm laser feeds about 20 unit-wavelengths at a 6 dB margin;
   - heater power against U, and the temperature map from the stacked logic;
   - calibration time and availability against U.

   One slide, or two if needed.
10. **The workload screen.** Run each candidate through the CiT_01 five tests, plus precision (slide 6) and
    energy (slide 8). Present it as one table, with a verdict per row and its reason. The candidates:
    - **Fourier-mixing layers (FNet, Hyena) and block-circulant weights**, using the Amdahl shares from
      `data/foptinf_analysis`: Hyena 0.20 %; circulant 84.5 % with the LM head on the last token only;
    - **block-scaled FP4 MAC**, the paper §V projection: what precision it would need, and whether the
      approximate mode's bits could serve it (likely not, as an analogue chain; say what is unknown);
    - **low-bit KV-cache ranking or compression** (e.g. PRISM, KIVI, KVQuant): ranking may need only 4–6 bits,
      per CiT_03, which is cited in `reference/CiT_01.html`'s companions;
    - **training traffic:** 2-bit deltas (e.g. MuLoCo), and DeMo's fixed band, a negative result in CiT_04;
    - **FHE and PQC NTTs:** exact mode, for contrast (the developer's stated first market).

    Cite each method's paper (a page you opened). Where a number is yours, say so.
11. **What would have to be true.** Three or four conditions, each with its number, for an AI workload to pay on
    this chip, and which of them the public roadmap addresses.
12. **Takeaways, open questions and sources.** Include questions for the developer (e.g. the native precision of
    the FP4 MAC, the HBM generation, the conversion energy per crossing).

## 3. Code, tests and checks

- `analysis/` (Python 3.12, numpy only): `precision_needed.py`, `breakeven.py` and any loader of `data/`. Put the
  pytest tests in `analysis/tests/`, including that the series' BF16, INT8 and FP8 ENOBs are reproduced and that
  every value read from `data/` matches `results_extract.md`.
- `js/`: the slide models and animations. Port any `analysis/` formula used live to JS, and test that the two
  agree (node test, fixtures generated by Python).
- `tools/check_numbers.py`: every number on the slides is found in `data/`, `analysis/` outputs or a listed quote
  file. The PR lists any exemptions.
- `tools/browser_check.js` (puppeteer or playwright), at 1280 and 390, light and dark:
  - no page errors and no horizontal overflow;
  - animations step, and stay still under reduced motion;
  - every explorer's readouts match the Python fixtures.

  Take screenshots of every slide at 390 into `artifacts/`.
- A GitHub Actions workflow runs pytest, the node tests and the number check.
- README: what the deck asks and answers, the inputs and their provenance (simulator at e3054d1, plms 0.3.0), how
  to rebuild and check, and the licences: deck CC BY 4.0 and code MIT, matching the series.

## 4. Done

Open a PR. Its description lists:

- each slide's headline;
- the computed FP4 and INT4 ENOB requirements;
- the workload screen's verdicts;
- every assumption, with its tag;
- the number-check exemptions;
- what you could not source;
- open questions.

Do not merge, publish or enable Pages. After merge the planner does the follow-ups (FOptInf hub, CiT hub,
cross-links, the portfolio entry) and the owner publishes the repo.
