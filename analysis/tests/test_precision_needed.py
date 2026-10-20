"""The precision rule reproduces the series before any new format is trusted."""
import math

import numpy as np
import pytest

import plms_data as D
import precision_needed as P


@pytest.fixture(scope="module")
def res():
    return P.compute()


def test_reproduces_the_series_exactly(res):
    """Same signal, same rounding, same rule: the series' BF16, INT8 and FP8 E4M3 values."""
    series = D.series_results()["precision"]
    assert math.isclose(res["reference"]["crest"], series["crest_4096"], rel_tol=1e-12)
    for k in P.SERIES_FORMATS:
        assert math.isclose(res["formats"][k]["rel_rms"], series["targets"][k], rel_tol=1e-12)
        assert math.isclose(res["formats"][k]["enob_needed"], series["enob_needed"][k], rel_tol=1e-12)
        assert round(res["formats"][k]["enob_needed"], 1) == P.SERIES_ENOB[k]


def test_rule_round_trip():
    c = 3.6
    for e in (2.0, 4.5, 10.3):
        assert math.isclose(P.enob_needed(P.rule_rel(e, c), c), e)
        assert math.isclose(P.snr_bits(P.rel_from_snr_bits(e)), e)


def test_measures_differ_by_the_crest_term(res):
    """series ENOB - e16 bits is the same constant for every format: log2(2 crest/sqrt12) + 1.76/6.02
    against the exact log2(10) x 20/6.02 scaling; checked numerically."""
    off = [v["enob_needed"] - v["snr_bits"] for v in res["formats"].values()]
    # not exactly constant because 6.02 != 20 log10 2; spread stays below 0.01 bits over this range
    assert max(off) - min(off) < 0.01
    assert 1.3 < res["crest_offset_bits"] < 1.4


def test_fp4_e2m1_grid():
    y = P.fp4_e2m1_scaled(np.linspace(-7, 7, 2801))
    assert set(np.unique(np.abs(y))) == {0.0, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0}


def test_int4_levels():
    x = np.linspace(-1, 1, 1001)
    q = P.int4(x) * 7
    assert set(np.round(np.unique(q), 9)) == set(float(v) for v in range(-7, 8))


def test_fp8_e5m2_grid():
    y = P.minifloat(np.array([1.0, 1.1, 1.2, 1.3, 1.4, 57344.0, 1e6]), 2, -14, 57344.0)
    assert list(y) == [1.0, 1.0, 1.25, 1.25, 1.5, 57344.0, 57344.0]


def test_minifloat_matches_series_e4m3():
    rng = np.random.default_rng(1)
    x = rng.standard_normal(4096)
    s = 448.0 / np.max(np.abs(x))
    assert np.array_equal(P.minifloat(x * s, 3, -6, 448.0) / s, P.fp8_e4m3(x))


def test_mx_block_scale_is_power_of_two():
    rng = np.random.default_rng(2)
    x = rng.standard_normal(256) * 10
    b = P.blocks(x, 32)
    amax = np.max(np.abs(b), axis=1)
    X = 2.0 ** (np.floor(np.log2(amax)) - 2)
    q = P.mxfp4(x).reshape(-1, 32) / X[:, None]
    assert np.all(np.isin(np.abs(q), [0, 0.5, 1, 1.5, 2, 3, 4, 6]))


def test_ordering(res):
    f = res["formats"]
    order = ["BF16", "INT8", "FP8 E4M3", "FP8 E5M2"]
    assert all(f[a]["enob_needed"] > f[b]["enob_needed"] for a, b in zip(order, order[1:]))
    for k in ("INT4", "INT4 g32", "FP4 E2M1", "MXFP4", "NVFP4"):
        assert 3.5 < f[k]["enob_needed"] < 5.0
    assert f["NVFP4"]["rel_rms"] < f["FP4 E2M1"]["rel_rms"]
    assert f["INT4 g32"]["rel_rms"] < f["INT4"]["rel_rms"]
