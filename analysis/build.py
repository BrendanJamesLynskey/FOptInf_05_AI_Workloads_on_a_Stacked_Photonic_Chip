#!/usr/bin/env python3
"""Run the analysis and write everything the deck reads.

  analysis/out/precision_needed.json, analysis/out/breakeven.json   the computed results
  analysis/out/results.md                                           the same, as tables
  js/fop05_data.js                                                  data/ subset + results, for the deck
  js/tests/fixtures.json                                            cases the JS models must reproduce

Run from anywhere: python3 analysis/build.py
"""

from __future__ import annotations

import json
from dataclasses import asdict, replace
from pathlib import Path

import breakeven as B
import plms_data as D
import precision_needed as P

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = HERE / "out"


def g4(x: float) -> str:
    """The deck's number format: 4 significant figures, Python's %g rules (mirrored in JS)."""
    return f"{x:.4g}"


def e12_compact(wl: str) -> list:
    rows = D.table("e12_scale_throughput", f"grid_{wl}")["rows"]
    return [[r["units"], r["wavelengths"], r["baud_GBd"], r["conv_pJ_bit"], r["width"], r["vs_logic"],
             r["vs_silicon"], r["binding"], r["feasible"], r["optical_fraction"],
             None if r["time_s"] == "inf" else r["time_s"] * 1e3, r["static_W"]] for r in rows]


def figs(name: str, ids=None) -> dict:
    return {f["id"]: {"title": f["title"], "x": f["x"], "y": f["y"], "annotations": f["annotations"],
                      "series": [{"name": s["name"], "x": s["x"], "y": s["y"]} for s in f["series"]]}
            for f in D.experiment(name)["figures"] if ids is None or f["id"] in ids}


def deck_data(prec: dict, be: dict) -> dict:
    sr = D.series_results()
    return {
        "simulator": D.SIMULATOR,
        "e12": {"grid": {wl: e12_compact(wl) for wl in ("sparse16", "full14")},
                "gridKeys": ["U", "W", "B", "E_conv", "width", "vs_logic", "vs_silicon", "binding", "feasible",
                             "optical_fraction", "time_ms", "static_W"],
                "figures": figs("e12_scale_throughput"),
                "sources": D.experiment("e12_scale_throughput")["sources"]},
        "e13": {"figures": figs("e13_energy"), "sources": D.experiment("e13_energy")["sources"]},
        "e14": {"figures": figs("e14_laser_thermal"), "sources": D.experiment("e14_laser_thermal")["sources"],
                "temperature_map": D.table("e14_laser_thermal", "temperature_map")},
        "e15": {"figures": figs("e15_calibration_scaling"), "sources": D.experiment("e15_calibration_scaling")["sources"]},
        "e16": {"figures": figs("e16_approximate"), "sources": D.experiment("e16_approximate")["sources"]},
        "precision": prec,
        "breakeven": be,
        "series": {"headline": sr["headline"], "prefill_lm_last": sr["prefill_lm_last"],
                   "prefill_2048": {k: v["2048"] for k, v in sr["prefill"].items()},
                   "precision_targets": sr["precision"]["targets"], "enob_needed": sr["precision"]["enob_needed"]},
        "assumptions": D.assumptions(),
        "pPi": B.P_PI_MW,
    }


def fixtures(prec: dict, be: dict) -> dict:
    c = B.Chip()
    cases = {"exact": [], "approx": [], "breakeven": [], "digital": [], "g4": [], "precision": [], "e12": [], "e16": []}
    for E in (0.05, 0.5, 2.0):
        for w in (28, 59):
            for U, W, F in ((64, 4, 20), (4, 1, 26), (1024, 8, 16)):
                cc = replace(c, E_conv=E, width=w, U=U, W=W, fanout=F)
                cases["exact"].append({"chip": asdict(cc), "out": B.exact_transform(cc)})
    for S in range(1, 7):
        for bits in (4, 8, 12):
            for p in (10.0, 0.001, 30.0):
                for F, mW in ((20, 100.0), (92, 10 ** 2.7)):
                    cc = replace(c, p_pi_mW=p, fanout=F, laser_mW=mW)
                    cases["approx"].append({"chip": asdict(cc), "S": S, "bits": bits, "out": B.approx_stage(cc, S, bits)})
                    for dig in (0.2141, 0.7188):
                        cases["breakeven"].append({"chip": asdict(cc), "S": S, "bits": bits, "digital": dig,
                                                   "out": B.breakeven_E_conv(cc, S, dig, bits)})
    for b in (2.74, 3.0, 3.198, 4, 8, 16):
        cases["digital"].append({"bits": b, "out": B.digital_butterfly(c, b)})
    for x in (0, 1, 6.929, 0.2141, 1.408e13, 4.617e11, -0.1406, 0.00012345, 12345.6, 99999.5, 0.5, 1e-5, 485.87):
        cases["g4"].append({"x": x, "out": g4(x)})
    cr = prec["reference"]["crest"]
    for k, v in prec["formats"].items():
        cases["precision"].append({"format": k, "rel": v["rel_rms"], "crest": cr, "enob": v["enob_needed"], "snr_bits": v["snr_bits"]})
    for wl in ("sparse16", "full14"):
        for g in D.table("e12_scale_throughput", f"grid_{wl}")["rows"][::97]:
            cases["e12"].append({"wl": wl, "key": [g["units"], g["wavelengths"], g["baud_GBd"], g["conv_pJ_bit"], g["width"]],
                                 "vs_logic": g["vs_logic"], "vs_silicon": g["vs_silicon"], "feasible": g["feasible"]})
    for S in range(1, 7):
        for e in (4, 6, 8, 10, 12, 16):
            cases["e16"].append({"S": S, "enob": e, "bits": B.e16_bits(S, e)})
    import numpy as np
    cases["fp4_grid"] = sorted(set(float(v) for v in np.abs(P.fp4_e2m1_scaled(np.linspace(-7, 7, 2801)))))
    cases["explorers"] = explorer_fixtures(prec, be)
    return cases


def explorer_fixtures(prec: dict, be: dict) -> list:
    """Explorer states and the readouts the page must show (browser_check.js sets the inputs)."""
    out = []
    # slide 03: the compute-bound grid
    for wl, U, W, Bd, E, w in (("sparse16", 16, 8, 112, 0.05, 59), ("full14", 4, 1, 112, 0.05, 59), ("sparse16", 64, 4, 112, 0.5, 59),
                               ("full14", 256, 2, 14, 1, 28)):
        g = [g for g in D.table("e12_scale_throughput", f"grid_{wl}")["rows"] if g["units"] == U and g["wavelengths"] == W
             and g["baud_GBd"] == Bd and g["conv_pJ_bit"] == E and g["width"] == w][0]
        out.append({"id": "mw", "inputs": {"mw-wl": wl, "mw-u": str(U), "mw-w": str(W), "mw-b": str(Bd), "mw-e": str(E), "mw-width": str(w)},
                    "readouts": {"mw-logic": g4(g["vs_logic"]) if g["feasible"] else "over cap",
                                 "mw-silicon": g4(g["vs_silicon"]) if g["feasible"] else "over cap"}})
    # slide 05: S x ENOB
    for S, e in ((1, 8), (6, 8), (6, 16), (3, 4)):
        bits = B.e16_bits(S, e)
        out.append({"id": "pa", "inputs": {"pa-s": str(S), "pa-enob": str(e)},
                    "readouts": {"pa-bits": g4(bits), "pa-enob-series": g4(P.series_enob_from_snr_bits(bits, prec["reference"]["crest"]))}})
    # slide 08: what-if
    c = B.Chip()
    for S, bits, tech, E, F in ((6, 8, "thermo 10 mW/π", 0.5, 20), (6, 8, "mems", 0.05, 20), (1, 8, "thermo 10 mW/π", 0.5, 20), (6, 8, "nv", 0.01, 92)):
        mW = 100.0 if F == 20 else 10 ** 2.7
        cc = replace(c, p_pi_mW=B.P_PI_MW[tech], E_conv=E, fanout=F, laser_mW=mW)
        a = B.approx_stage(cc, S, bits)
        eff = B.e16_bits(S, bits)
        dig = B.digital_butterfly(c, eff)
        be_e = B.breakeven_E_conv(cc, S, dig, bits)
        out.append({"id": "be", "inputs": {"be-s": str(S), "be-bits": str(bits), "be-tech": tech, "be-e": str(E),
                                           "be-laser": "20" if F == 20 else "27"},
                    "readouts": {"be-photonic": g4(a["total"]), "be-digital": g4(dig), "be-ratio": g4(a["total"] / dig),
                                 "be-need": "never (static alone exceeds digital)" if be_e is None else g4(be_e)}})
    return out


def results_md(prec: dict, be: dict) -> str:
    L = []
    w = L.append
    w("# FOptInf 05 analysis results\n")
    w(f"Generated by `analysis/build.py` from the vendored inputs (simulator plms {D.SIMULATOR['version']} at "
      f"{D.SIMULATOR['commit']}; the series' flop_share.py results). Every computed number on the slides is here.\n")
    w("## 1. Precision needed (precision_needed.py)\n")
    w(f"Reference signal: the series' length-{prec['reference']['length']} causal FFT convolution, crest "
      f"{prec['reference']['crest']:.4g}. ENOB = log2(crest x 2 / (sqrt(12) x rel)); e16 bits = (-20 log10 rel - 1.76)/6.02. "
      f"The two measures differ by {prec['crest_offset_bits']:.3g} bits here.\n")
    w("| Format | Scaling | Bits/value | Rounding error (rel RMS) | ENOB needed (series rule) | Effective bits (e16 measure) |")
    w("|---|---|---|---|---|---|")
    for k, v in prec["formats"].items():
        w(f"| {k} | {v['description']} | {v['bits_per_value']:g} | {v['rel_rms']:.3g} | {v['enob_needed']:.2f} | {v['snr_bits']:.2f} |")
    w("\nThe series' values reproduced: " + ", ".join(f"{k} {prec['formats'][k]['enob_needed']:.1f}" for k in P.SERIES_FORMATS) + ".\n")
    w("## 2. Energy (breakeven.py)\n")
    ex = be["exact"]
    w(f"Exact mode at the defaults: {g4(ex['chip']['total'])} pJ per 59-bit 4-point transform against {g4(ex['asic'])} pJ "
      f"(ASIC); break-even E_conv {g4(ex['breakeven_E_conv'])} pJ/bit.\n")
    w("| S | photonic pJ/butterfly-stage | static part | throughput /s | effective bits | digital matched pJ | ratio |")
    w("|---|---|---|---|---|---|---|")
    for S, a in be["approx"].items():
        w(f"| {S} | {g4(a['total'])} | {g4(a['static'])} | {g4(a['throughput'])} | {g4(a['bits'])} | {g4(a['digital_matched'])} | {g4(a['total'] / a['digital_matched'])} |")
    w(f"\nDigital 8-bit complex butterfly: {g4(be['digital_8bit'])} pJ.\n")
    w("Static pJ per butterfly-stage (laser + phase shifters, S = 6) by phase-shifter technology:\n")
    w("| technology | pJ |")
    w("|---|---|")
    for k, v in be["static_by_technology"].items():
        w(f"| {k} | {g4(v)} |")
    w("\nLaser pJ per butterfly-stage by laser power (fan-out at 6 dB margin from e14, 4 λ, 112 GBd):\n")
    w("| laser dBm | pJ |")
    w("|---|---|")
    for k, v in be["laser_by_power_dBm"].items():
        w(f"| {k:g} | {g4(v)} |")
    cd = be["conditions"]
    w("\nConditions for S = 6 to match the matched-precision digital butterfly "
      f"({g4(cd['target_pJ'])} pJ):\n")
    w(f"* wall-plug efficiency needed with free heaters and free conversions: {g4(cd['wall_plug_needed_free_heaters_free_conv'])} (default 0.15)")
    w(f"* E_conv needed with free heaters and a lossless laser (wall plug 1): {g4(cd['E_conv_needed_free_heaters_wall_plug_1'])} pJ/bit (default 0.5)")
    w(f"* E_conv needed against the 8-bit digital butterfly with MEMS phase shifters: {g4(cd['E_conv_needed_vs_8bit_mems'])} pJ/bit")
    w(f"* at the defaults: {'never' if cd['E_conv_needed_vs_matched_default'] is None else g4(cd['E_conv_needed_vs_matched_default'])}")
    w(f"\nApproximate-mode throughput at S = 6 over the exact-mode rate: {g4(be['throughput_vs_exact'])}x.\n")
    return "\n".join(L) + "\n"


def main() -> None:
    OUT.mkdir(exist_ok=True)
    prec, be = P.compute(), B.compute()
    (OUT / "precision_needed.json").write_text(json.dumps(prec, indent=1) + "\n")
    (OUT / "breakeven.json").write_text(json.dumps(be, indent=1) + "\n")
    (OUT / "results.md").write_text(results_md(prec, be))
    js = ROOT / "js"
    (js / "tests").mkdir(parents=True, exist_ok=True)
    body = json.dumps(deck_data(prec, be), separators=(",", ":"))
    (js / "fop05_data.js").write_text(
        "// Generated by analysis/build.py from data/ (read-only) and analysis/ results. Do not edit.\n"
        "(function (root) { const D = " + body + ";\n"
        "if (typeof module !== 'undefined' && module.exports) module.exports = D; else root.FOP05_DATA = D; })"
        "(typeof window !== 'undefined' ? window : globalThis);\n")
    (js / "tests" / "fixtures.json").write_text(json.dumps(fixtures(prec, be), indent=0) + "\n")
    print("wrote", OUT / "results.md", js / "fop05_data.js", js / "tests" / "fixtures.json")


if __name__ == "__main__":
    main()
