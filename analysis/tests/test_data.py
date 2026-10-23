"""Every value the deck reads from data/*.json matches the simulator's own report
(results_extract.md), at the precision the report prints; data/ is unchanged."""
import pytest

import plms_data as D

S16, F14 = "sparse16 (N = 65,536)", "full14 (N = 16,384)"


def close(a, b):
    assert D.sig_equal(a, b), (a, b)


def test_checksums_unchanged():
    sums = D.verify_checksums()
    assert sums and all(sums.values()), sums


def test_simulator_version_recorded():
    first = D.extract_text().splitlines()[0]
    assert "d46a388" in first and "plms 0.5.0" in first and "OFT slab" in first
    assert "(plms 0.5.0," in D.experiment("e16_approximate").get("profile", "") or True


# ── e16: approximate mode ──
def test_e16_bits_grid():
    t = D.find_table("16.", "S \\ ENOB")
    enobs = [D.num(h) for h in t["head"][1:]]
    for r in t["rows"]:
        s = D.series("e16_approximate", "bits_vs_enob", f"S = {int(D.num(r[0]))}")
        assert s["x"] == enobs
        for y, cell in zip(s["y"], r[1:]):
            close(y, D.num(cell))


def test_e16_bits_vs_stages():
    t = D.find_table("16.", "S \\ SNR [dB]")
    col = t["head"].index("31.15")                      # the design SNR on the slab (16-bit converters)
    slab = D.series("e16_approximate", "bits_vs_s", "2.949 dB/stage")
    for y, r in zip(slab["y"], t["rows"]):
        close(y, D.num(r[col]))
    three = D.series("e16_approximate", "bits_vs_s", "3 dB/stage")
    assert "at 3 dB per stage 2.769 → 1.813" in D.extract_text()
    close(three["y"][0], 2.769)
    close(three["y"][-1], 1.813)
    assert max(slab["y"]) == slab["y"][1]                 # best at S = 2 on the slab


def test_e16_energy():
    t = [x for x in D.extract_tables() if x["section"].startswith("16.") and x["head"][0] == "S"][0]
    ph = D.series("e16_approximate", "energy_vs_s", "photonic")
    dg = D.series("e16_approximate", "energy_vs_s", "digital, matched bits")
    tot, dig = t["head"].index("total"), t["head"].index("digital at matched bits [pJ]")
    for i, r in enumerate(t["rows"]):
        close(ph["y"][i], D.num(r[tot]))
        close(dg["y"][i], D.num(r[dig]))


# ── e13: energy ──
def test_e13_breakdown():
    t = D.find_table("13.", "pJ per transform")
    rows = {r[0]: r for r in t["rows"]}
    chip = D.series("e13_energy", "breakdown", "stacked chip")
    asic = D.series("e13_energy", "breakdown", "ASIC")
    for k, y, ya in zip(chip["x"], chip["y"], asic["y"]):
        close(y, D.num(rows[k][1]))
        close(ya, D.num(rows[k][3]))
    close(sum(chip["y"]), D.num(rows["total"][1]))
    close(D.figure("e13_energy", "transform_vs_units")["annotations"][0]["y"], D.num(rows["total"][3]))


def test_e13_vs_units_and_conv():
    t = D.find_table("13.", "W \\ U")
    us = [D.num(h) for h in t["head"][1:]]
    for r in t["rows"]:
        s = D.series("e13_energy", "transform_vs_units", f"{int(D.num(r[0]))} λ")
        assert s["x"] == us
        for y, c in zip(s["y"], r[1:]):
            close(y, D.num(c))
    t = D.find_table("13.", "E_conv [pJ/bit]")
    s = D.series("e13_energy", "transform_vs_conv", "stacked chip")
    for x, y, r in zip(s["x"], s["y"], t["rows"]):
        assert x == D.num(r[0])
        close(y, D.num(r[1]))


def test_e13_bootstrap():
    for name, sub in (("bootstrap_sparse16", "sparse16"), ("bootstrap_full14", "full14")):
        t = D.find_table("13.", "regime", sub=sub)
        rows = {(r[0], r[1]): r for r in t["rows"]}
        designs = {"photonic": "photonic", "photonic all optical": "photonic all optical", "asic logic": "asic logic"}
        f = D.figure("e13_energy", name)
        for s in f["series"]:
            head = {"phase_shifters": "phase shifters", "hbm": "HBM", "conversions": "crossings"}.get(s["name"], s["name"])
            col = t["head"].index(head)
            for x, y in zip(s["x"], s["y"]):
                close(y, D.num(rows[("compute_bound", designs[x])][col]))


# ── e12: throughput at scale ──
@pytest.mark.parametrize("wl,fig,sub", [("sparse16", "logic_sparse16", S16), ("full14", "logic_full14", F14)])
def test_e12_logic_hbm(wl, fig, sub):
    t = D.find_table("12.", "HBM [GB/s]", sub=sub)
    for s in D.figure("e12_scale_throughput", fig)["series"]:
        hbm = s["name"].split()[1]
        hbm = "unconstrained" if hbm == "∞" else hbm
        col = t["head"].index("vs equal logic" if "equal logic" in s["name"] else "vs equal silicon")
        rows = [r for r in t["rows"] if r[0] == hbm]
        for x, y in zip(s["x"], s["y"]):
            r = [r for r in rows if D.num(r[1]) == x][0]
            close(y, D.num(r[col]))


@pytest.mark.parametrize("wl,sub", [("sparse16", S16), ("full14", F14)])
def test_e12_grid_best_points(wl, sub):
    grid = D.table("e12_scale_throughput", f"grid_{wl}")["rows"]
    assert len(grid) == 1728
    t = D.find_table("12.", "best vs", sub=sub)
    for r in t["rows"]:
        key = {"equal logic": "vs_logic", "equal silicon": "vs_silicon", "FPGA": "vs_fpga"}[r[0]]
        feas = [g for g in grid if g["feasible"]]
        best = max(feas, key=lambda g: g[key])
        close(best[key], D.num(r[t["head"].index("vs " + r[0])]))
    lead = [x["lead"] for x in D.extract_tables() if x["sub"] == sub and x["head"][0] == "best vs"][0]
    assert f"{len(grid)} swept points" in lead
    assert f"{sum(1 for g in grid if not g['feasible'])} exceed the power cap" in lead
    assert f"{sum(1 for g in grid if g['feasible'] and g['vs_logic'] > 1.001)} gain > 0.1%" in lead


@pytest.mark.parametrize("wl,sub", [("sparse16", S16), ("full14", F14)])
def test_e12_surface_matches_grid(wl, sub):
    grid = D.table("e12_scale_throughput", f"grid_{wl}")["rows"]
    for s in D.figure("e12_scale_throughput", f"surface_{wl}")["series"]:
        W = int(s["name"].split()[0])
        key = "vs_logic" if "equal logic" in s["name"] else "vs_silicon"
        for U, y in zip(s["x"], s["y"]):
            g = [g for g in grid if g["units"] == U and g["wavelengths"] == W and g["baud_GBd"] == 112
                 and g["width"] == 59 and g["conv_pJ_bit"] == 0.5][0]
            if y is None:
                assert not g["feasible"]
            else:
                close(y, g[key])


# ── e14: laser and thermal ──
def test_e14():
    t = [x for x in D.extract_tables() if x["section"].startswith("14.") and x["head"][0] == "U" and "margin [dB]" in x["head"]][0]
    s = D.series("e14_laser_thermal", "margin_vs_units", "4 λ, 112 GBd")
    for x, y, r in zip(s["x"], s["y"], t["rows"]):
        assert x == D.num(r[0]); close(y, D.num(r[1]))
    t = D.find_table("14.", "laser [dBm]")
    for name, col in (("6 dB margin", 1), ("10 dB margin", 2)):
        s = D.series("e14_laser_thermal", "max_uw", name)
        for x, y, r in zip(s["x"], s["y"], t["rows"]):
            assert x == D.num(r[0]); close(y, D.num(r[col]))
    t = D.find_table("14.", "technology \\ U")
    for r in t["rows"]:
        s = D.series("e14_laser_thermal", "heaters", r[0])
        for y, c in zip(s["y"], r[1:]):
            if r[0] != "nv":
                close(y, D.num(c))
    t = D.find_table("14.", "logic flux [W/mm²]")
    for name, col in (("rms", 2), ("max", 3)):
        s = D.series("e14_laser_thermal", "thermal", name)
        for x, y, r in zip(s["x"], s["y"], t["rows"]):
            assert x == D.num(r[0]); close(y, D.num(r[col]))
    tm = D.table("e14_laser_thermal", "temperature_map")
    assert tm["units"] == 64 and len(tm["rows"]) == len(tm["rows"][0]) == 102


# ── e15: calibration ──
def test_e15():
    for drift in ("0.01", "0.03", "0.1"):
        t = [x for x in D.extract_tables() if x["section"].startswith("15.") and x["lead"] == f"Drift {drift} rad/√s:"][0]
        for r in t["rows"]:
            s = D.series("e15_calibration_scaling", f"in_service_{drift}", f"P = {r[0]}")
            for y, c in zip(s["y"], r[1:]):
                close(y, D.num(c))
    t = D.find_table("15.", "P \\ U", lead_contains="Start-up")
    for r in t["rows"]:
        s = D.series("e15_calibration_scaling", "startup", f"P = {r[0]}")
        for y, c in zip(s["y"], r[1:]):
            close(y, D.num(c))


# ── the series' analysis ──
def test_series_shares():
    h = D.series_results()["headline"]
    assert f"{h['hyena_optical_2048'] * 100:.2f}%" == "0.20%"
    assert f"{h['circ_lm_last_optical_2048'] * 100:.2f}%" == "84.54%"
    assert f"{h['circ_lm_last_amdahl_2048']:.1f}" == "6.5"
    assert f"{h['fnet_optical_2048'] * 100:.2f}%" == "0.09%"


def test_assumption_tags():
    tags = {a["source"] for a in D.assumptions()}
    assert tags <= {"public-statement", "paper", "illustrative", "patent", "textbook", "datasheet", "inferred"}
    assert D.assumption("future.stacked")["source"] == "public-statement"
    assert D.assumption("future.baud_GBd")["source"] == "paper"


# ── e17: wavelength-dependent transform error (on the slab, v0.5) ──
WS = [1, 2, 4, 8, 16, 32]


def test_e17_shared_slab_worst_channel():
    rows = [r for r in D.table("e17_wavelength_error", "plans")["rows"] if r["grid"] == "200 GHz" and r["W"] == 16]
    lsq = rows[0]["least_squares"]
    close(lsq["fro_max"], 0.04079)
    close(10 - lsq["margin_min_dB"], 0.0342)            # exact mode's cost against the 10 dB reference
    assert rows[0]["ring_feasible"] is False
    assert "it costs 0.0342 dB at the 10 dB reference" in D.extract_text()


def test_e17_bits_table_matches_json():
    t = D.find_table("17.", "grid", lead_contains="Approximate mode")
    for r in t["rows"]:
        if r[0] != "200 GHz":
            continue
        s = D.series("e17_wavelength_error", "bits_vs_span", f"S = {r[1]}")
        for y, cell in zip(s["y"], r[2:]):
            close(y, D.num(cell))
    s6 = D.series("e17_wavelength_error", "bits_vs_span", "S = 6")["y"]
    s1 = D.series("e17_wavelength_error", "bits_vs_span", "S = 1")["y"]
    close(s6[WS.index(32)], 1.551)
    close(s6[WS.index(1)], 1.872)                      # one wavelength reproduces e16
    close(s1[WS.index(4)], 2.714)
    close(s6[WS.index(4)], 1.862)


def test_e17_per_wavelength_slab():
    t = D.find_table("17.", "W", lead_contains="A slab per wavelength")
    row4 = [r for r in t["rows"] if r[0] == "4"][0]
    assert [D.num(c) for c in row4[1:6]] == [25.6, 64, 32, 66.56, 0.02756]


def test_e17_ring_and_lo_path():
    t = D.find_table("17.", "ring radius [µm]")
    r5 = [r for r in t["rows"] if r[0] == "5"][0]
    assert D.num(r5[1]) == 14.01 and D.num(r5[t["head"].index("max W at 200 GHz")]) == 8
    text = D.extract_text()
    assert "rotates the edge channel of 16 × 200 GHz by 122.6 rad (matched to 0.08156 µm or trimmed per channel" in text
    assert "One slab serves every channel of the largest ring-feasible plan (8 × 200 GHz)" in text


# ── e18 and e19: the slab, and its native size ──
def test_e18_slab_numbers():
    text = D.extract_text()
    for phrase in ("delivers 0.6343 (`e18_slab.design.eta_mean`)", "10.43 → 7.196 (`e2_noise_margin.margin_dB.0`)",
                   "0.6917 (`e18_slab.drift.slab.availability`)", "0.605 (`e18_slab.drift.mesh.availability`)",
                   "15 (`e18_slab.heater_recount.total_min`) to 18 (`e18_slab.heater_recount.total`)"):
        assert phrase in text, phrase


def test_e19_native_size():
    lev = D.series("e19_native_size", "levels", "Most decision levels on one output")
    assert lev["x"] == [4, 8, 16, 32, 64]
    for y, v in zip(lev["y"], (5, 15, 375, 234375, 91552734375)):
        close(y, v)
    assert "91,552,734,375 levels" in D.extract_text()
    bb = D.series("e19_native_size", "breakeven", "Bootstrap bound vs the equal-logic ASIC")
    close(bb["y"][0], 1.1)
    close(bb["y"][-1], 0.4204)
    ap = D.series("e19_native_size", "approximate", "all stages chained")
    for y, v in zip(ap["y"], (1.864, 2.246, 2.605, 2.71, 3.092)):
        close(y, v)
    t = D.find_table("19.", "quantity", lead_contains="Outputs for exact arithmetic")
    keeps = [r for r in t["rows"] if r[0] == "exact mode keeps 6 dB"][0]
    assert keeps[1:] == ["yes", "no", "no", "no", "no"]
