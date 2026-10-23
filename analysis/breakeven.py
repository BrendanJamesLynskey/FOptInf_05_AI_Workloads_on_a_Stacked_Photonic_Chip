#!/usr/bin/env python3
"""Energy per useful operation on the stacked chip, and when approximate mode would break even.

A closed-form restatement of the simulator's energy accounting (plms 0.5.0, slab OFT, results_extract.md
sections 13, 14 and 16), built only from the parameters in its future-chip assumptions table.
The tests check that, at the defaults, it reproduces every published energy figure:

  exact mode, per 59-bit 4-point transform (section 13)
    rate        = U W B eta / w                       (U W B eta symbol slots/s, w bit planes each)
    laser       = n_lasers x P_laser / wall_plug / rate,  n_lasers = ceil(U W / F)
    heaters     = U (18 + 8 W) x P_pi / rate           (mean phase pi per heater)
    conversions = 4 w (1 + out_bits) x E_conv          (708 crossings at w = 59)
    recombine   = 4 w x E_recombine
    logic       = 4 modmul + 4 modadd                  (the optics remove only the 8 modadds)
    ASIC        = 4 modmul + 8 modadd
    modmul = 3 x mul(w), modadd = 2 x add(w); mul(b) = 3.1 pJ (b/32)^2 s, add(b) = 0.1 pJ (b/32) s

  approximate mode, per butterfly-stage, S radix-4 stages chained optically (section 16)
    rate        = U W B eta                            (one butterfly-stage per symbol slot)
    crossings   = 8 b_c E_conv / S                     (32 pJ at S = 1, b_c = 8, 0.5 pJ/bit)
    (on the slab, chaining costs bits instead of saving them: e16 has 1.872 bits at S = 6, 2.746 at S = 1)
    twiddles    = 3 x (4 mul(b_c) + 2 add(b_c)) / S    (digital, at chain boundaries)
    laser, heaters as above, per butterfly-stage
    throughput  = min(rate, (P_cap - P_static) / (crossings + twiddles))
    digital     = 12 mul(b) + 22 add(b), b = ceil(effective bits) (0.7188 pJ at b = 8)

The approximate-mode crossing and twiddle formulas are this deck's reconstruction: they reproduce
the simulator's table to its printed precision, but the simulator's split of the 8 b_c converted
bits (which values cross, in which direction) is not stated in the extract.

numpy-free (stdlib only). Writes analysis/out/breakeven.json.
"""

from __future__ import annotations

import json
import math
from dataclasses import asdict, dataclass, replace
from pathlib import Path

import plms_data as D

OUT = Path(__file__).resolve().parent / "out"

# phase-shifter technologies swept in e14 (assumptions table: thermal.*)
P_PI_MW = {"thermo 2 mW/π": 2.0, "thermo 10 mW/π": D.default_value("thermal.p_pi_mW"),
           "thermo 30 mW/π": 30.0, "mems": D.default_value("thermal.mems_p_pi_mW"),
           "nv": D.default_value("thermal.nv_p_pi_mW")}


def laser_fanout_6dB(W: int, B: float) -> int:
    """Largest U x W one 20 dBm laser feeds at the 6 dB margin (e14 table)."""
    t = D.find_table("14.", "margin [dB]")
    for r in t["rows"]:
        if D.num(r[0]) == 6 and D.num(r[1]) == W and D.num(r[2]) == B:
            return int(D.num(r[4]))
    raise KeyError((W, B))


@dataclass(frozen=True)
class Chip:
    U: int = int(D.default_value("future.units"))
    W: int = int(D.default_value("future.wavelengths"))
    B_GBd: float = D.default_value("future.baud_GBd")
    eta: float = D.default_value("future.slot_efficiency")
    heaters_unit: int = int(D.default_value("future.heaters_per_unit"))
    heaters_wl: int = int(D.default_value("future.heaters_per_wavelength"))
    p_pi_mW: float = D.default_value("thermal.p_pi_mW")
    laser_mW: float = 10 ** (D.default_value("laser.power_dBm") / 10)
    wall_plug: float = D.default_value("laser.wall_plug")
    fanout: int = laser_fanout_6dB(int(D.default_value("future.wavelengths")), D.default_value("future.baud_GBd"))
    # U x W per laser at 6 dB, 4 λ, 112 GBd (e14): 12 on the slab (the v0.4 mesh, lossless: 20)
    E_conv: float = D.default_value("future.conv_pJ_bit")
    out_bits: int = int(D.default_value("future.out_bits_per_plane"))
    E_recombine: float = D.default_value("future.recombine_pJ_plane")
    width: int = int(D.default_value("fhe.residue_bits"))
    pJ_add32: float = D.default_value("asic.pJ_add32")
    pJ_mul32: float = D.default_value("asic.pJ_mul32")
    node: float = D.default_value("asic.node_scale")
    modmul_muls: int = int(D.default_value("asic.modmul_muls"))
    modadd_adds: int = int(D.default_value("asic.modadd_adds"))
    power_cap_W: float = D.default_value("future.power_cap_W")

    # ── digital energies ──
    def mul(self, b: float) -> float:
        return self.pJ_mul32 * (b / 32) ** 2 * self.node

    def add(self, b: float) -> float:
        return self.pJ_add32 * (b / 32) * self.node

    def modmul(self) -> float:
        return self.modmul_muls * self.mul(self.width)

    def modadd(self) -> float:
        return self.modadd_adds * self.add(self.width)

    # ── static power ──
    def n_lasers(self) -> int:
        return math.ceil(self.U * self.W / self.fanout)

    def laser_W(self) -> float:
        return self.n_lasers() * self.laser_mW * 1e-3 / self.wall_plug

    def heaters_W(self) -> float:
        return self.U * (self.heaters_unit + self.heaters_wl * self.W) * self.p_pi_mW * 1e-3

    def static_W(self) -> float:
        return self.laser_W() + self.heaters_W()

    def slots_per_s(self) -> float:
        return self.U * self.W * self.B_GBd * 1e9 * self.eta


def exact_transform(c: Chip) -> dict:
    """pJ per full-width 4-point transform in exact mode, and the ASIC's (section 13)."""
    rate = c.slots_per_s() / c.width
    crossings = 4 * c.width * (1 + c.out_bits)
    e = {"laser": c.laser_W() / rate * 1e12, "phase_shifters": c.heaters_W() / rate * 1e12,
         "conversions": crossings * c.E_conv, "recombination": 4 * c.width * c.E_recombine,
         "logic": 4 * c.modmul() + 4 * c.modadd()}
    e["total"] = sum(e.values())
    asic = 4 * c.modmul() + 8 * c.modadd()
    fixed = e["total"] - e["conversions"]
    return {"chip": e, "asic": asic, "rate_per_s": rate, "crossings": crossings, "n_lasers": c.n_lasers(),
            "breakeven_E_conv": (asic - fixed) / crossings,
            "free_light_and_crossings": e["recombination"] + e["logic"]}


def digital_butterfly(c: Chip, bits: float) -> float:
    """A digital complex radix-4 butterfly (12 multiplies, 22 adds) at ceil(bits) bits."""
    b = math.ceil(bits - 1e-9)
    return 12 * c.mul(b) + 22 * c.add(b)


def approx_stage(c: Chip, S: int, conv_bits: int = 8) -> dict:
    """pJ per butterfly-stage in approximate mode with S stages chained optically (section 16)."""
    rate = c.slots_per_s()
    crossings = 8 * conv_bits * c.E_conv / S
    twiddles = 3 * (4 * c.mul(conv_bits) + 2 * c.add(conv_bits)) / S
    laser = c.laser_W() / rate * 1e12
    heaters = c.heaters_W() / rate * 1e12
    dyn = crossings + twiddles
    power_limited = (c.power_cap_W - c.static_W()) / (dyn * 1e-12)
    thr = min(rate, power_limited)
    return {"crossings": crossings, "twiddles": twiddles, "laser": laser, "phase_shifters": heaters,
            "total": dyn + laser + heaters, "static": laser + heaters, "throughput": thr,
            "limit": "power" if power_limited < rate else "optics"}


def breakeven_E_conv(c: Chip, S: int, digital_pJ: float, conv_bits: int = 8) -> float | None:
    """Largest E_conv (pJ/bit) at which approximate mode matches digital_pJ per butterfly-stage;
    None if the static terms alone (laser + heaters) already exceed it: no E_conv pays."""
    a = approx_stage(replace(c, E_conv=0.0), S, conv_bits)
    room = digital_pJ - a["total"]
    return None if room <= 0 else room * S / (8 * conv_bits)


def e16_bits(S: int, enob: int) -> float:
    """Effective bits from the simulator's S x converter-ENOB grid (e16)."""
    s = D.series("e16_approximate", "bits_vs_enob", f"S = {S}")
    return s["y"][s["x"].index(float(enob))]


def compute() -> dict:
    c = Chip()
    ex = exact_transform(c)
    ap = {S: approx_stage(c, S) for S in range(1, 7)}
    bits = {S: e16_bits(S, 8) for S in range(1, 7)}
    dig8 = digital_butterfly(c, 8)
    matched = {S: digital_butterfly(c, bits[S]) for S in range(1, 7)}
    # what each technology and fan-out leaves: static pJ per butterfly-stage at the defaults
    static = {k: approx_stage(replace(c, p_pi_mW=v), 6)["static"] for k, v in P_PI_MW.items()}
    # laser pJ per butterfly-stage for each laser power in e14 (6 dB margin), at 4 λ, 112 GBd
    lasers = {}
    for r in D.find_table("14.", "laser [dBm]")["rows"]:
        dbm, uw = D.num(r[0]), D.num(r[1])
        if uw and uw >= 1:
            lasers[dbm] = approx_stage(replace(c, laser_mW=10 ** (dbm / 10), fanout=int(uw)), 6)["laser"]
    # the conditions under which S = 6 would match the matched-precision digital butterfly
    target = matched[6]
    no_heat = replace(c, p_pi_mW=0.0)
    laser_only = approx_stage(replace(no_heat, E_conv=0.0), 6)
    # None where no wall-plug efficiency suffices: the boundary twiddles alone exceed the target (the slab, v0.5)
    room = target - laser_only["twiddles"]
    need_wall_plug = c.wall_plug * laser_only["laser"] / room if room > 0 else None
    cond = {
        "target_pJ": target,
        "laser_pJ_default": ap[6]["laser"],
        "heaters_pJ_default": ap[6]["phase_shifters"],
        "twiddles_pJ": ap[6]["twiddles"],
        "wall_plug_needed_free_heaters_free_conv": need_wall_plug,
        "E_conv_needed_free_heaters_wall_plug_1": breakeven_E_conv(replace(no_heat, wall_plug=1.0), 6, target),
        "E_conv_needed_free_heaters_wall_plug_1_vs_8bit": breakeven_E_conv(replace(no_heat, wall_plug=1.0), 6, dig8),
        "E_conv_needed_vs_8bit_mems": breakeven_E_conv(replace(c, p_pi_mW=P_PI_MW["mems"]), 6, dig8),
        "E_conv_needed_vs_matched_default": breakeven_E_conv(c, 6, target),
    }
    return {"chip": asdict(c), "exact": ex,
            "approx": {str(S): {**ap[S], "bits": bits[S], "digital_matched": matched[S]} for S in ap},
            "digital_8bit": dig8, "static_by_technology": static, "laser_by_power_dBm": lasers,
            "conditions": cond, "throughput_vs_exact": ap[6]["throughput"] / ex["rate_per_s"]}


def main() -> None:
    OUT.mkdir(exist_ok=True)
    res = compute()
    (OUT / "breakeven.json").write_text(json.dumps(res, indent=1, default=str) + "\n")
    ex = res["exact"]
    print(f"exact: chip {ex['chip']['total']:.4g} pJ, ASIC {ex['asic']:.4g}, break-even E_conv {ex['breakeven_E_conv']:.4g}")
    for S, a in res["approx"].items():
        print(f"S={S}: {a['total']:.4g} pJ ({a['limit']}, {a['throughput']:.4g}/s), bits {a['bits']:.4g}, digital {a['digital_matched']:.4g}")
    print("static by technology", {k: round(v, 4) for k, v in res["static_by_technology"].items()})
    print("laser by power", {k: round(v, 4) for k, v in res["laser_by_power_dBm"].items()})
    print("conditions", res["conditions"])


if __name__ == "__main__":
    main()
