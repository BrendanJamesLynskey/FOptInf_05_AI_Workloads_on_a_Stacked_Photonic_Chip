"""The closed-form energy model reproduces every energy the simulator publishes (sections 13, 16)."""
from dataclasses import replace

import pytest

import breakeven as B
import plms_data as D


def close(a, b):
    assert D.sig_equal(a, b), (a, b)


@pytest.fixture(scope="module")
def res():
    return B.compute()


def test_exact_mode_breakdown(res):
    chip = D.series("e13_energy", "breakdown", "stacked chip")
    for k, y in zip(chip["x"], chip["y"]):
        close(res["exact"]["chip"][k], y)
    close(res["exact"]["chip"]["total"], 485.9)
    close(res["exact"]["asic"], D.series("e13_energy", "breakdown", "ASIC")["y"][-1])
    assert res["exact"]["crossings"] == 708
    assert res["exact"]["n_lasers"] == 13
    close(res["exact"]["rate_per_s"], 4.617e11)


def test_exact_breakeven_is_negative(res):
    """'break-even would need E_conv <= -0.1406 pJ/bit'; 'free light and crossings leave 43.78 pJ'."""
    close(res["exact"]["breakeven_E_conv"], -0.1406)
    close(res["exact"]["free_light_and_crossings"], 43.78)


def test_exact_vs_conv_and_width():
    c = B.Chip()
    s = D.series("e13_energy", "transform_vs_conv", "stacked chip")
    for x, y in zip(s["x"], s["y"]):
        close(B.exact_transform(replace(c, E_conv=x))["chip"]["total"], y)
    t = D.find_table("13.", "width")
    for r in t["rows"]:
        e = B.exact_transform(replace(c, width=int(D.num(r[0]))))
        close(e["chip"]["total"], D.num(r[1]))
        close(e["asic"], D.num(r[2]))


def test_exact_vs_units():
    c = B.Chip()
    for W in (1, 4, 8):          # e14 lists the fan-out for 1, 4 and 8 wavelengths
        s = D.series("e13_energy", "transform_vs_units", f"{W} λ")
        F = B.laser_fanout_6dB(W, 112.0)
        for U, y in zip(s["x"], s["y"]):
            close(B.exact_transform(replace(c, U=int(U), W=W, fanout=F))["chip"]["total"], y)


def test_approximate_mode_table():
    t = [x for x in D.extract_tables() if x["section"].startswith("16.") and x["head"][0] == "S"][0]
    h = t["head"]
    c = B.Chip()
    for r in t["rows"]:
        S = int(D.num(r[0]))
        a = B.approx_stage(c, S)
        close(a["crossings"], D.num(r[h.index("crossings")]))
        close(a["twiddles"], D.num(r[h.index("boundary twiddles")]))
        close(a["laser"], D.num(r[h.index("laser")]))
        close(a["phase_shifters"], D.num(r[h.index("phase shifters")]))
        close(a["total"], D.num(r[h.index("total")]))
        close(a["throughput"], D.num(r[h.index("butterfly-stages/s")]))
        assert a["limit"] == r[h.index("limit")]
        bits = B.e16_bits(S, 8)
        close(bits, D.num(r[h.index("effective bits")]))
        close(B.digital_butterfly(c, bits), D.num(r[h.index("digital at matched bits [pJ]")]))


def test_digital_8bit_and_ratios(res):
    close(res["digital_8bit"], 0.7188)
    close(res["approx"]["1"]["total"] / res["approx"]["6"]["total"], 4.923)
    close(res["throughput_vs_exact"], 59)


def test_breakeven_formula_consistent():
    c = B.Chip(p_pi_mW=0.0, wall_plug=1.0)
    for S in (6,):
        e = B.breakeven_E_conv(c, S, 0.2141)
        assert e is not None and e > 0
        close(B.approx_stage(replace(c, E_conv=e), S)["total"], 0.2141)


def test_never_pays_at_defaults(res):
    """Laser plus heaters per butterfly-stage exceed the matched-precision digital butterfly."""
    assert res["conditions"]["E_conv_needed_vs_matched_default"] is None
    assert res["static_by_technology"]["mems"] > res["approx"]["6"]["digital_matched"]
    assert all(v > res["approx"]["6"]["digital_matched"] for v in res["laser_by_power_dBm"].values())
