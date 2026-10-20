# Visual and animation standard for the "*-explained" site family (owner request, 2026-10-05)

The owner: "I'm a great believer in visualisation for comprehension. If possible, include animation." Every
brief from 17 on (and any later polish of the existing three sites) follows this file.

## 1. Every concept gets a picture; most get a moving one

- **Every chapter opens with a hero visual** that shows the chapter's main mechanism before any prose. The reader
  should get the idea from the picture alone.
- **Each mechanism gets a stepped animation:** a tile moving through memory, a systolic wavefront, bits being
  rounded, a butterfly stage. Use animation where something happens over time or in order. Use a static diagram
  where the structure is the point.
- **Show the maths next to the picture:** the KaTeX equation sits beside the visual, and the term being animated
  is highlighted in the equation at the same moment (the same colour, linked by hover).

## 2. Animations are driven by the verified model, not drawn by hand

- Each animation renders a **sequence of states computed by the tested model** (the TS port that matches the Python
  reference). A frame is a pure function `frame(state, t)`, so it is reproducible and testable. Nothing is a
  hand-keyframed illustration of what should happen.
- Unit-test the state sequence. For example: the systolic animation's cycle 17 shows exactly the partial sums the
  Python reference gives at cycle 17.
- **Controls on every animation:** play/pause, step forward and back, a scrub bar (cycle or step counter), speed
  (0.25×–4×), and reset. Arrow keys and space work when it has focus. Parameters (matrix size, tile size, bit
  width…) re-run the model and restart the animation.
- **A caption for each step:** a short live line ("cycle 17: PE(2,3) receives a₂₁ from the left and b₁₃ from
  above") that also goes to an `aria-live` region, so screen-reader users follow it too.

## 3. Craft

- **Libraries:** SVG with D3 for diagrams up to a few thousand elements; Canvas 2D (or WebGL only if really needed)
  for larger grids such as 128×128 arrays and memory heat maps. Use `requestAnimationFrame` driven by an explicit
  clock, never CSS-only timelines that the model can't drive. No heavy animation frameworks unless one is
  justified in the README.
- **Colour:**
  - one colour-blind-safe palette shared across the family, the same in light and dark mode;
  - a consistent visual language: one colour per memory level (registers, shared/SRAM, L2, HBM/DRAM), used on
    every site;
  - "active" is a highlight, "done" is muted, "stalled" uses a warning hue plus a pattern, never colour alone.
- **Respect `prefers-reduced-motion`:** start paused, step only, no auto-play.
- **Performance:**
  - lazy-load heavy visuals, and pause animations that are off-screen (IntersectionObserver);
  - Lighthouse performance stays ≥ 0.9;
  - 60 fps target on a mid-range laptop; degrade gracefully on phones (fewer elements, the same story).
- **Phone layout:** at 390 px, visuals stack above controls and nothing overflows. Touch targets are at least 44 px.

## 4. Verification (in each report)

- e2e: every animation plays, steps, scrubs and resets with 0 console errors, in light and dark mode, at 1280 and
  390 px.
- Frame tests: for at least 3 key frames per animation, check the model state against the Python reference.
- Screenshots of a mid-animation frame for each animation, read by the executor. Keep a short GIF or WebM of the
  hero animations for the README, recorded with puppeteer (a heavy job, memory-capped).
- Reduced-motion e2e: with reduced motion on, nothing auto-plays.

## 5. The family switch grows to six

"Decoder · Inference · Architectures · Kernels · Numerics · Silicon". At 390 px six items won't fit in one row,
so the first brief that adds a site redesigns `SiteSwitch.tsx`: a compact dropdown on phones and the full row on
desktop, with one byte-identical file on every site. Each new site's B part updates the switch on all the others
by PR, merging only when every check is green.
