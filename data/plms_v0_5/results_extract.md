<!-- Extract of Photonic_Link_Module_Sim results/results.md at d46a388 (plms 0.5.0, OFT slab): the viability verdict, the v0.4 → v0.5 table, sections 7 and 12-19, and the future-chip, wavelength-dependence and slab assumptions. Do not edit; regenerate from the simulator. -->

## Does a slab change the viability of the future system?

**Verdict.** No. On a slab the future chip's exact (FHE) mode still loses to the all-digital ASIC on energy (498.9 against 32.35 pJ per 59-bit 4-point transform) and a larger native slab does not rescue it; the slab's insertion loss shrinks the laser budget (20 → 12 units × wavelengths per laser at 6 dB); only approximate mode gains, and only from a larger native slab (1.864 → 3.092 effective bits with every stage of a 4,096-point FFT chained, from N = 4 to N = 64), and even a 64-point slab does not reach the v0.4 mesh fully chained (3.198 (`e16_approximate.eff_bits_at_converter_bits.-1`) in v0.4); at S = 1 the v0.4 mesh kept 2.74 (`e16_approximate.eff_bits_at_converter_bits.1`) in v0.4 and the 4-point slab 2.746 (`e16_approximate.eff_bits_at_converter_bits.1`).

What did not change, and why:

- **The exact-mode energy floor.** With free light and free crossings a 4-point transform still costs 43.78 (`e13_energy.floor_without_light_and_crossings_pJ`) pJ against 32.35 (`e13_energy.transform_pJ.asic`) in the ASIC (v0.4: 43.78): the optics replace only the modular adds, and that does not depend on what computes the transform.
- **The exact-mode speed ceiling.** At e12's best point (unconstrained HBM, 10 mm² of logic) the most any optics can give the bootstrap is 1.1 (`e12_scale_throughput.logs.sparse16.compute_bound.ceiling_exact.59`)× (v0.4 1.1×) over the equal-logic ASIC, and the equal-silicon ASIC stays ahead: best 0.9163 (`e12_scale_throughput.logs.sparse16.compute_bound.best_vs_silicon.vs_silicon`)×.
- **The FPGA module's bootstrap and what binds it** (experiments 7-9, 11): unchanged; they model timing, memory and the port, not the transform.
- **The phase-shifter count of the future chip.** `future.heaters_per_unit` = 18 never contained mesh heaters (all sit outside the transform, paper Fig. 1d as quoted in the brief); the recount finds 15 (`e18_slab.heater_recount.total_min`) to 18 (`e18_slab.heater_recount.total`) on the module (18 with both LO MZI arms heated and both forward-LO shifters), so the chip's hold power is unchanged: 0.5 (`e14_laser_thermal.heater_W_per_unit`) W per unit.
- **A larger native slab for exact arithmetic.** Beyond 4 points the outputs of a DFT of bits are not integers: N = 8: 15 levels, gap 0.1213 (`e19_native_size.rows.8.min_gap`), N = 16: 375 levels, gap 0.006272 (`e19_native_size.rows.16.min_gap`), N = 32: 234,375 levels, gap 3.11e-7 (`e19_native_size.rows.32.min_gap`), N = 64: 91,552,734,375 levels, gap 4.447e-10 (`e19_native_size.rows.64.min_gap`); none keeps the design margin at the 4-point unit's reference power, and the bootstrap bound against the equal-logic ASIC falls from 1.1 (`e19_native_size.rows.4.ntt.4096.bootstrap_bound`)× to 0.4204 (`e19_native_size.rows.64.ntt.4096.bootstrap_bound`)× at N = 64 even with free light and power, because mapping the outputs to Z_p costs up to 651 (`e19_native_size.rows.64.recovery.muls`) constant multiplies per transform (a naive count, an upper bound). Joint or lattice decoding across the Galois-conjugate outputs could recover the integers at a good SNR, but it is itself an N/2-point linear inverse in logic; any recovery costs O(N log N), so the direction stands. WO2026057669A1 could not be read here; the plain mixed-radix decomposition is what is modelled.

What moved, by how much and why:

- **Insertion loss.** The default slab (design A: wide output ports, its input envelope cancelled by unequal splitter ratios) delivers 0.6343 (`e18_slab.design.eta_mean`) of its input power to the 4 outputs (1.977 (`e18_slab.design.il_dB`) dB, 0.5 dB of it assumed excess loss); design B (narrow outputs, no pre-compensation) 0.4399 (`e18_slab.designs.B.eta`) (3.567 (`e18_slab.designs.B.il_dB`) dB); the mesh was lossless. It flows into every margin: the module's at −5 dBm LO, output 1, 10.43 → 7.196 (`e2_noise_margin.margin_dB.0`) dB; the LO it needs for SER 1e-6 on output 1, -17.08 → -13.79 (`e2_noise_margin.lo_required_dBm.0`) dBm.
- **Laser fan-out.** One 20 dBm laser feeds U × W = 20 → 12 (`e14_laser_thermal.max_units_per_laser.6dB_4wl_112GBd.max_uw`) at 4 λ and 6 dB (design B: 8 (`e18_slab.designs.B.max_uw_per_laser_6dB`)); the laser's share of a transform's energy goes 18.77 → 31.77 (`e13_energy.transform_pJ.photonic.laser`) pJ and the total 485.9 → 498.9 (`e13_energy.transform_pJ.photonic.total`) pJ (ASIC 32.35); per bootstrap (sparse16) the chip uses 2.92 → 3.203 (`e13_energy.bootstrap_ratio_to_asic.sparse16.default`)× the ASIC's energy.
- **Calibration residual.** The chip's knobs (input and LO phases, digital gains) cannot correct an input envelope; design A cancels it at design time, B keeps it: 0.02756 (`e18_slab.design.calibrated_fro`) (A) and 0.0519 (`e18_slab.designs.B.calibrated_fro`) (B) normalised Frobenius from DFT4 after the matrix fit; 0.0566 (`e18_slab.design.truth_table_max_dev`) step (A) after a continuous truth-table calibration of the 13 data-path shifters, 0.06229 (`e18_slab.calibration.dac_median_max_dev`) median with 12-bit DACs (the mesh's residual was 0). Coherent stray light keeps exact mode at the SER target up to -15 (`e18_slab.stray_limit_target_dB`) dB.
- **Drift.** Fewer heaters help: at 0.1 rad/√s per heater the slab's 13 keep availability 0.6917 (`e18_slab.drift.slab.availability`) at equal received power and 0.6783 (`e18_slab.designs.A.drift_availability.equal_laser_power`) at equal laser power, against 0.605 (`e18_slab.drift.mesh.availability`) for the mesh's 17. At the stacked chip's 112 GBd (e15, equal received power), with a controller serving 4 units, the first swept U at which fewer than 0.9 of units stay in service (v0.4 → v0.5) is beyond the sweep → 16,384 (`e15_calibration_scaling.calibration_limited_from_units.[0.01_4]`) at 0.01 rad/√s; at v0.1's lane power, which does not re-budget the slab's loss, the error floor alone is 1.299e-4 (`e15_calibration_scaling.slab.zero_drift_wer.slab_v01_power`) (a sensitivity, not a slab result).
- **Approximate mode.** Each chained stage now costs the slab's loss (2.949 (`e16_approximate.stage_loss_dB`) dB against v0.3's 1 dB) and its residual (0.02756 (`e16_approximate.slab.kernel_fro`)): with 8-bit converters a 4,096-point FFT keeps 2.74 → 2.746 (`e16_approximate.eff_bits_at_converter_bits.1`) effective bits at S = 1 (design B: 2.417 (`e18_slab.designs.B.bits_S1`), same FFT and random stream). A larger native slab helps here: chained through every stage, N = 4: 1.864, N = 8: 2.246, N = 16: 2.605, N = 32: 2.71, N = 64: 3.092 (`e19_native_size.rows.N.approx.bits_all`), with fewer crossings per butterfly-stage, but fully chained the v0.4 mesh kept 3.198 (`e16_approximate.eff_bits_at_converter_bits.-1`) in v0.4, which no slab size reaches (the 4-point slab: 3.198 → 1.872 (`e16_approximate.eff_bits_at_converter_bits.-1`)).
- **Wavelength.** One shared slab's worst channel at 16 × 200 GHz is 0.01558 → 0.04079 (`e17_wavelength_error.plans.[200 GHz x16].least_squares.fro_max`) off DFT4, but most of that is the slab's own residual at λ0 (0.02756 (`e17_wavelength_error.lambda0_fro`)); the wavelength term itself is 0.0231 (`e17_wavelength_error.plans.[200 GHz x16].least_squares.increment_max`), and the 5 µm rings still bind first. It grows with the native size: N = 4: 0.04077, N = 8: 0.05133, N = 16: 0.08559, N = 32: 0.1522, N = 64: 0.287 (`e19_native_size.rows.N.wdm_worst_fro.16x200GHz`).

The planner's hypotheses, tested:

- 'The exact-mode verdict probably holds': holds.
- 'Slab loss makes margins, laser fan-out and approximate mode worse': margins and laser fan-out holds; approximate mode fully chained holds (3.198 → 1.872 (`e16_approximate.eff_bits_at_converter_bits.-1`) effective bits: every chained stage adds the slab's loss and residual), at S = 1 it does not hold (2.74 → 2.746 (`e16_approximate.eff_bits_at_converter_bits.1`): fewer units share each laser, so each receiver's design SNR rises, 27.47 → 31.15 (`e16_approximate.design_snr_dB`) dB).
- 'Fewer internal heaters make drift and hold power better': drift holds at equal received power; hold power does not move, because the future chip's count never included mesh heaters.
- 'A larger native transform is the one lever that could move the verdict': it does not move the exact-mode verdict and does help approximate mode.

## v0.4 (mesh) → v0.5 (slab)

Each headline's numbers against v0.4's (`results/v0_4/`, which the code reproduces byte for byte under `oft.kind = mesh`), with the result key each number comes from:

| # | experiment | v0.4 (mesh) → v0.5 (slab) |
|---|---|---|
| 1 | Worked example and output alphabet | 239.7 → 158.4 (`e1_worked_example.worked_example.currents_uA.0`); 0 → -2.617 (`e1_worked_example.worked_example.currents_uA.1`); 36.56 → 33.26 (`e1_worked_example.worked_example.currents_uA.2`); -36.56 → -23.66 (`e1_worked_example.worked_example.currents_uA.3`); 36.53 → 35.26 (`e1_worked_example.worked_example.available_snr_dB`); 10.7 → 9.433 (`e1_worked_example.worked_example.margin_dB`); 10.03 → 7.046 (`e1_worked_example.worked_example.output1_margin_top_dB`); 1.178 → 1.66 (`e1_worked_example.worked_example.sigma_out1_top_uA`) |
| 2 | Noise margin vs LO power | 10.43 → 7.196 (`e2_noise_margin.margin_dB.0`); 10.74 → 9.489 (`e2_noise_margin.margin_dB.1`); 10.78 → 9.16 (`e2_noise_margin.margin_dB.2`); 10.74 → 7.249 (`e2_noise_margin.margin_dB.3`); -17.08 → -13.79 (`e2_noise_margin.lo_required_dBm.0`); -17.58 → -16.29 (`e2_noise_margin.lo_required_dBm.1`); -17.63 → -15.95 (`e2_noise_margin.lo_required_dBm.2`); -17.58 → -13.92 (`e2_noise_margin.lo_required_dBm.3`) |
| 3 | Calibration error: input vs LO phase | 21.24 → 16.32 (`e3_calibration_error.tolerance_deg.[input lane 1]`); 28.31 → 16.69 (`e3_calibration_error.tolerance_deg.[LO output 1]`); 18.59 → 17.32 (`e3_calibration_error.tolerance_deg.[LO output 2]`); 18.39 → 15.7 (`e3_calibration_error.tolerance_deg.[LO all outputs]`) |
| 4 | Saturation knee and pedestal tracking | the headline's numbers are unchanged; other results moved (see its section) |
| 5 | Lane skew and channel bandwidth | 0.464 → 0.4688 (`e5_skew.eye_steps.[0.5].0`); 0.9575 → 0.8724 (`e5_skew.eye_steps.[0.75].0`); 0.3928 → 0.3978 (`e5_skew.eye_at_10ps.[0.5]`); 0.9155 → 0.8707 (`e5_skew.eye_at_10ps.[0.75]`); 0.2449 → 0.205 (`e5_skew.skew_tolerance_ui.[0.5]`); 0.4023 → 0.3735 (`e5_skew.skew_tolerance_ui.[0.75]`) |
| 6 | Drift, tracking and availability | 0.01 → 0.03 (`e6_drift.max_drift_for_999.100000`) |
| 7 | Throughput, latency, energy and break-even | unchanged (does not depend on the OFT) |
| 8 | Data statistics and DC balance | unchanged (does not depend on the OFT) |
| 9 | OpenFHE bootstrap on the module | unchanged (does not depend on the OFT) |
| 10 | Monte Carlo speed: Python vs Rust | the headline's numbers are unchanged; other results moved (see its section) |
| 11 | What binds: memory, compute, port | unchanged (does not depend on the OFT) |
| 12 | Future chip: throughput and break-even at scale | the headline's numbers are unchanged; other results moved (see its section) |
| 13 | Future chip: energy per useful operation | 485.9 → 498.9 (`e13_energy.transform_pJ.photonic.total`); 18.77 → 31.77 (`e13_energy.transform_pJ.photonic.laser`); -0.1406 → -0.1589 (`e13_energy.breakeven_conv_pJ_bit`); 3.277 → 3.594 (`e13_energy.bootstrap.sparse16.default.photonic.total_J`); 2.92 → 3.203 (`e13_energy.bootstrap_ratio_to_asic.sparse16.default`); 1.87 → 1.95 (`e13_energy.bootstrap_ratio_all_optical_compute_bound.sparse16`) |
| 14 | Future chip: laser and thermal limits | 20 → 12 (`e14_laser_thermal.max_units_per_laser.6dB_4wl_112GBd.max_uw`); 26 → 17 (`e14_laser_thermal.max_units_per_laser.6dB_1wl_112GBd.max_uw`); 8 → 4 (`e14_laser_thermal.max_units_per_laser.10dB_4wl_112GBd.max_uw`); 12 → 8 (`e14_laser_thermal.max_units_per_laser.10dB_1wl_112GBd.max_uw`); 0.05947 → 0.05888 (`e14_laser_thermal.activity_step_by_units.64.max_err_rad`) |
| 15 | Future chip: calibration scaling | 0.6483 → 0.7219 (`e15_calibration_scaling.v01_reduction.availability_v01`); beyond the sweep → 16,384 (`e15_calibration_scaling.calibration_limited_from_units.[0.01_4]`); 0.0625 → 0 (`e15_calibration_scaling.storm_fraction_hot`) |
| 16 | Future chip: approximate mode | 27.47 → 31.15 (`e16_approximate.design_snr_dB`); 1 → 2.949 (`e16_approximate.stage_loss_dB`); 2.74 → 2.746 (`e16_approximate.eff_bits_at_converter_bits.1`); 3.198 → 1.872 (`e16_approximate.eff_bits_at_converter_bits.-1`); 2.445 → 2.769 (`e16_approximate.eff_bits_high_loss.eff_bits.0`); 1.268 → 1.813 (`e16_approximate.eff_bits_high_loss.eff_bits.-1`); 34.11 → 34.33 (`e16_approximate.energy_pJ_per_butterfly_stage.1.total`); 6.929 → 7.15 (`e16_approximate.energy_pJ_per_butterfly_stage.-1.total`) |
| 17 | Future chip: wavelength-dependent transform error | 0.01558 → 0.04079 (`e17_wavelength_error.plans.[200 GHz x16].least_squares.fro_max`); 0.01554 → 0.04077 (`e17_wavelength_error.plans.[200 GHz x16].centre.fro_max`); 9.955 → 9.966 (`e17_wavelength_error.plans.[200 GHz x16].least_squares.margin_min_dB`); 81.72 → 39.9 (`e17_wavelength_error.edge_limit_margin.nm`); 5.525 → 3.716 (`e17_wavelength_error.approx.edge_equal_random.nm`); 2.731 → 2.714 (`e17_wavelength_error.restate_e16.1.worst_channel`); 3.19 → 1.862 (`e17_wavelength_error.restate_e16.-1.worst_channel`); 0.01102 → 0.03824 (`e17_wavelength_error.output_trim.rows.16.on.fro_max`) |
| 18 | Slab OFT: physics, calibration and heaters | new in v0.5 |
| 19 | Native transform size: N-point slab units | new in v0.5 |

## 7. Throughput, latency, energy and break-even

**Headline.** At 14 GBd one wavelength delivers 7.988e8 full-width 4-point transforms/s at 17 bits (= 1.997 FPGA butterfly units); the Amdahl bound for removing only the 8 adds is 1.667× (r=3) to 1.2× (r=10); with bit-plane recombination at 0.25 add/plane the equal-area hybrid is 0.6829× one butterfly unit (break-even needs ≤ 0.05882 add/plane); energy per transform 35779 pJ vs 56 pJ FPGA-only.

One symbol slot carries one 4-bit plane, so a w-bit 4-point transform takes w passes. FPGA cost is counted in modular-add equivalents: a radix-4 butterfly is 3 twiddle + 1 ω multiplies (r adds each) + 8 adds. The hybrid keeps the multiplies and adds 4 adds (j→ω combine, reductions) plus 4·w·(recombine cost) for shift-and-add.

Raw optical-core rate (4-point transforms/s, framing included) and FPGA butterfly-unit equivalent at 400 MHz:

| width [bits] | 14GBd x1 | 14GBd x4 | 56GBd x1 | 56GBd x4 | 112GBd x1 | 112GBd x4 |
|---|---|---|---|---|---|---|
| 8 | 1.698e9 | 6.79e9 | 6.79e9 | 2.716e10 | 1.358e10 | 5.432e10 |
| 16 | 8.488e8 | 3.395e9 | 3.395e9 | 1.358e10 | 6.79e9 | 2.716e10 |
| 17 | 7.988e8 | 3.195e9 | 3.195e9 | 1.278e10 | 6.391e9 | 2.556e10 |
| 24 | 5.658e8 | 2.263e9 | 2.263e9 | 9.053e9 | 4.527e9 | 1.811e10 |
| 32 | 4.244e8 | 1.698e9 | 1.698e9 | 6.79e9 | 3.395e9 | 1.358e10 |
| 40 | 3.395e8 | 1.358e9 | 1.358e9 | 5.432e9 | 2.716e9 | 1.086e10 |
| 48 | 2.829e8 | 1.132e9 | 1.132e9 | 4.527e9 | 2.263e9 | 9.053e9 |
| 55 | 2.469e8 | 9.876e8 | 9.876e8 | 3.951e9 | 1.975e9 | 7.901e9 |

| width [bits] | 14GBd x1 [units] | 14GBd x4 [units] | 56GBd x1 [units] | 56GBd x4 [units] | 112GBd x1 [units] | 112GBd x4 [units] |
|---|---|---|---|---|---|---|
| 8 | 4.244 | 16.98 | 16.98 | 67.9 | 33.95 | 135.8 |
| 16 | 2.122 | 8.488 | 8.488 | 33.95 | 16.98 | 67.9 |
| 17 | 1.997 | 7.988 | 7.988 | 31.95 | 15.98 | 63.91 |
| 24 | 1.415 | 5.658 | 5.658 | 22.63 | 11.32 | 45.27 |
| 32 | 1.061 | 4.244 | 4.244 | 16.98 | 8.488 | 33.95 |
| 40 | 0.8488 | 3.395 | 3.395 | 13.58 | 6.79 | 27.16 |
| 48 | 0.7073 | 2.829 | 2.829 | 11.32 | 5.658 | 22.63 |
| 55 | 0.6173 | 2.469 | 2.469 | 9.876 | 4.938 | 19.75 |

FPGA logic the hybrid needs just to post-process at the optical rate (in butterfly units of logic):

| width [bits] | 14GBd x1 | 14GBd x4 | 56GBd x1 | 56GBd x4 | 112GBd x1 | 112GBd x4 |
|---|---|---|---|---|---|---|
| 8 | 4.85 | 19.4 | 19.4 | 77.6 | 38.8 | 155.2 |
| 16 | 3.031 | 12.12 | 12.12 | 48.5 | 24.25 | 97 |
| 17 | 2.924 | 11.7 | 11.7 | 46.79 | 23.39 | 93.58 |
| 24 | 2.425 | 9.7 | 9.7 | 38.8 | 19.4 | 77.6 |
| 32 | 2.122 | 8.488 | 8.488 | 33.95 | 16.98 | 67.9 |
| 40 | 1.94 | 7.76 | 7.76 | 31.04 | 15.52 | 62.08 |
| 48 | 1.819 | 7.275 | 7.275 | 29.1 | 14.55 | 58.2 |
| 55 | 1.742 | 6.966 | 6.966 | 27.87 | 13.93 | 55.73 |

Speed-up at equal FPGA logic, optical side unconstrained:

| r (mul/add) | Amdahl bound | w=17, recombine 0 | w=17, recombine 0.25 | w=32, recombine 0 | w=32, recombine 0.25 |
|---|---|---|---|---|---|
| 3 | 1.667 | 1.25 | 0.6061 | 1.25 | 0.4167 |
| 4 | 1.5 | 1.2 | 0.6486 | 1.2 | 0.4615 |
| 5 | 1.4 | 1.167 | 0.6829 | 1.167 | 0.5 |
| 6 | 1.333 | 1.143 | 0.7111 | 1.143 | 0.5333 |
| 7 | 1.286 | 1.125 | 0.7347 | 1.125 | 0.5625 |
| 8 | 1.25 | 1.111 | 0.7547 | 1.111 | 0.5882 |
| 9 | 1.222 | 1.1 | 0.7719 | 1.1 | 0.6111 |
| 10 | 1.2 | 1.091 | 0.7869 | 1.091 | 0.6316 |

Default hybrid (14 GBd, 1 wavelength, k = 1, r = 5): 2.732e8 transforms/s, limited by the fpga side; FPGA-only k = 1: 4e8 transforms/s.

NTT latency at 17 bits (SimPy, µs):

| N | hybrid 14 GBd k=1 | hybrid 112 GBd ×4 k=64 | FPGA k=1 | FPGA k=4 |
|---|---|---|---|---|
| 256 | 2.258 | 1.055 | 0.84 | 0.36 |
| 4,096 | 25.79 | 2.077 | 15.66 | 4.14 |
| 65,536 | 484.2 | 9.798 | 328.1 | 82.32 |

Back-to-back 4096-point NTTs (hybrid default, SimPy): 38769 NTT/s.

Energy per full-width transform (pJ):

| design | static | link | FPGA | total |
|---|---|---|---|---|
| hybrid default | 35509 | 187.7 | 82 | 35779 |
| hybrid best case (112 GBd ×4, no recombine cost, FPGA not limiting) | 379.5 | 187.7 | 48 | 615.1 |
| FPGA only | 0 | 0 | 56 | 56 |

FPGA-only energy per transform for 0.5 / 2 / 10 pJ per modular add: 14 / 56 / 280 pJ.

Per 65,536-point NTT: hybrid default 0.00469 J, best case 8.063e-5 J, FPGA only 7.34e-6 J.

Figure: `figures/e7_throughput.png`; data: `web/e7_throughput.json`.

## 12. Future chip: throughput and break-even at scale

**Headline.** At the default design (U = 64, 4 λ, 112 GBd, 100 mm² of logic, v0.2 HBM) the stacked chip bootstraps in 52.97 ms (sparse16) and 70.51 ms (full14), the same as the equal-logic ASIC (1×, 1×; HBM binds; FPGA 87.44 and 95.59 ms); with unconstrained HBM and 10 mm² of logic the best swept point gains 1.099× and 1.071× over the equal-logic ASIC (exact-mode ceiling 1.1× and 1.073× at 59 bits; NTT-free ceiling 2.754× and 1.901×) but at best 0.9163× and 0.9152× of the equal-silicon ASIC: break-even with it needs ≤ 0.06563 and 0.05625 mm² of photonics per unit (modelled 0.4).

Analytic (fluid) per-kernel timing as in experiment 9, on the stacked chip: resources are HBM, logic (butterfly units × 1.5 GHz), photonic symbol slots (U × W × B × 0.95), dynamic power (logic + crossings + recombination against a 500 W cap less the laser and phase-shifter power) and PCIe. Each NTT kernel sends the share of its butterflies through the optics that minimises its time (the logic does the rest whole); 'all optical' sends every butterfly, as v0.2 did. Exact arithmetic: each radix-4 stage is decided, recombined and reduced mod p before its twiddle multiply, so the optics remove only the 8 modular adds per butterfly (4 j→ω/reduction adds and all 4 multiplies stay in logic). Ceilings are against the equal-logic ASIC: 'NTT-free' if NTTs cost no compute at all, 'exact' if the optics were infinitely fast and free (post-processing remains). All chip and ASIC parameters are illustrative.

### sparse16 (N = 65,536)

Default design, v0.2 memory system:

| design | bootstrap [ms] | binding |
|---|---|---|
| FPGA (v0.2, 64 units) | 87.44 | — |
| ASIC, equal logic | 52.97 | hbm |
| ASIC, equal silicon | 52.97 | — |
| stacked chip, optimal split | 52.97 | hbm |
| stacked chip, all optical | 52.99 | hbm |

Optical share of butterflies 0; static power 46.67 W (22 lasers); ceilings: NTT-free 1×, exact 1×.

Logic area × HBM bandwidth (default photonics): speed-up of the chip over each ASIC.

| HBM [GB/s] | logic [mm²] | vs equal logic | vs equal silicon | NTT-free ceiling | exact ceiling | ASIC binds |
|---|---|---|---|---|---|---|
| 819 | 5 | 1.049 | 0.8775 | 1.149 | 1.049 | hbm |
| 819 | 10 | 1 | 1 | 1 | 1 | hbm |
| 819 | 20 | 1 | 1 | 1 | 1 | hbm |
| 819 | 50 | 1 | 1 | 1 | 1 | hbm |
| 819 | 100 | 1 | 1 | 1 | 1 | hbm |
| 819 | 200 | 1 | 1 | 1 | 1 | hbm |
| 3276 | 5 | 1.09 | 0.4278 | 1.967 | 1.09 | logic |
| 3276 | 10 | 1.069 | 0.6452 | 1.466 | 1.07 | logic |
| 3276 | 20 | 1.046 | 0.8831 | 1.141 | 1.047 | hbm |
| 3276 | 50 | 1 | 1 | 1 | 1 | hbm |
| 3276 | 100 | 1 | 1 | 1 | 1 | hbm |
| 3276 | 200 | 1 | 1 | 1 | 1 | hbm |
| unconstrained | 5 | 1.102 | 0.197 | 2.858 | 1.102 | logic |
| unconstrained | 10 | 1.099 | 0.3376 | 2.754 | 1.1 | logic |
| unconstrained | 20 | 1.094 | 0.5259 | 2.574 | 1.096 | logic |
| unconstrained | 50 | 1.064 | 0.7665 | 2.205 | 1.085 | logic |
| unconstrained | 100 | 1.023 | 0.8755 | 1.864 | 1.072 | logic |
| unconstrained | 200 | 1.001 | 0.9394 | 1.549 | 1.054 | logic |

Compute-bound regime (10 mm² = 66 butterfly units of logic, unconstrained HBM), 1728 swept points, 1272 gain > 0.1% over the equal-logic ASIC, 432 exceed the power cap:

| best vs | U | W | B [GBd] | width | E_conv [pJ/bit] | vs equal logic | vs equal silicon | vs FPGA | binding |
|---|---|---|---|---|---|---|---|---|---|
| equal logic | 16 | 8 | 112 | 59 | 0.05 | 1.099 | 0.5795 | 5.909 | logic |
| equal silicon | 4 | 1 | 112 | 28 | 0.05 | 1.012 | 0.9163 | 4.309 | logic |
| FPGA | 16 | 8 | 112 | 59 | 0.05 | 1.099 | 0.5795 | 5.909 | logic |

| width | ASIC equal logic [ms] | FPGA [ms] | NTT-free ceiling | exact ceiling |
|---|---|---|---|---|
| 28 | 39.18 | 166.8 | 2.259 | 1.087 |
| 36 | 28.84 | 154.2 | 2.43 | 1.092 |
| 44 | 22.73 | 122.4 | 2.571 | 1.096 |
| 59 | 16.26 | 87.44 | 2.754 | 1.1 |

Break-even surface at 59 bits: smallest U that gains over the equal-logic ASIC ('—' = none), and the best ratio to each ASIC.

| B [GBd] | W | E_conv [pJ/bit] | min U to gain | max vs logic | max vs silicon | largest U within the power cap |
|---|---|---|---|---|---|---|
| 14 | 1 | 0.05 | 16 | 1.099 | 0.9079 | 1,024 |
| 14 | 1 | 0.1 | 16 | 1.099 | 0.9079 | 1,024 |
| 14 | 1 | 0.25 | 16 | 1.099 | 0.9079 | 1,024 |
| 14 | 1 | 0.5 | 16 | 1.099 | 0.9079 | 1,024 |
| 14 | 1 | 1 | 16 | 1.099 | 0.9079 | 1,024 |
| 14 | 1 | 2 | 16 | 1.099 | 0.9079 | 1,024 |
| 14 | 2 | 0.05 | 16 | 1.099 | 0.8969 | 1,024 |
| 14 | 2 | 0.1 | 16 | 1.099 | 0.8969 | 1,024 |
| 14 | 2 | 0.25 | 16 | 1.099 | 0.8969 | 1,024 |
| 14 | 2 | 0.5 | 16 | 1.099 | 0.8969 | 1,024 |
| 14 | 2 | 1 | 16 | 1.099 | 0.8969 | 1,024 |
| 14 | 2 | 2 | 16 | 1.099 | 0.8969 | 1,024 |
| 14 | 4 | 0.05 | 4 | 1.099 | 0.8649 | 256 |
| 14 | 4 | 0.1 | 4 | 1.099 | 0.8649 | 256 |
| 14 | 4 | 0.25 | 4 | 1.099 | 0.8649 | 256 |
| 14 | 4 | 0.5 | 4 | 1.099 | 0.8649 | 256 |
| 14 | 4 | 1 | 4 | 1.099 | 0.8649 | 256 |
| 14 | 4 | 2 | 4 | 1.099 | 0.8649 | 256 |
| 14 | 8 | 0.05 | 4 | 1.099 | 0.8173 | 256 |
| 14 | 8 | 0.1 | 4 | 1.099 | 0.8173 | 256 |
| 14 | 8 | 0.25 | 4 | 1.099 | 0.8173 | 256 |
| 14 | 8 | 0.5 | 4 | 1.099 | 0.8173 | 256 |
| 14 | 8 | 1 | 4 | 1.099 | 0.8173 | 256 |
| 14 | 8 | 2 | 4 | 1.099 | 0.8173 | 256 |
| 56 | 1 | 0.05 | 4 | 1.099 | 0.9101 | 1,024 |
| 56 | 1 | 0.1 | 4 | 1.099 | 0.9101 | 1,024 |
| 56 | 1 | 0.25 | 4 | 1.099 | 0.9101 | 1,024 |
| 56 | 1 | 0.5 | 4 | 1.099 | 0.9101 | 1,024 |
| 56 | 1 | 1 | 4 | 1.099 | 0.9101 | 1,024 |
| 56 | 1 | 2 | 4 | 1.099 | 0.9101 | 1,024 |
| 56 | 2 | 0.05 | 4 | 1.099 | 0.9013 | 1,024 |
| 56 | 2 | 0.1 | 4 | 1.099 | 0.9013 | 1,024 |
| 56 | 2 | 0.25 | 4 | 1.099 | 0.9013 | 1,024 |
| 56 | 2 | 0.5 | 4 | 1.099 | 0.9013 | 1,024 |
| 56 | 2 | 1 | 4 | 1.099 | 0.9013 | 1,024 |
| 56 | 2 | 2 | 4 | 1.099 | 0.9013 | 1,024 |
| 56 | 4 | 0.05 | 4 | 1.099 | 0.8734 | 256 |
| 56 | 4 | 0.1 | 4 | 1.099 | 0.8734 | 256 |
| 56 | 4 | 0.25 | 4 | 1.099 | 0.8734 | 256 |
| 56 | 4 | 0.5 | 4 | 1.099 | 0.8734 | 256 |
| 56 | 4 | 1 | 4 | 1.099 | 0.8734 | 256 |
| 56 | 4 | 2 | 4 | 1.099 | 0.8734 | 256 |
| 56 | 8 | 0.05 | 4 | 1.099 | 0.8331 | 256 |
| 56 | 8 | 0.1 | 4 | 1.099 | 0.8331 | 256 |
| 56 | 8 | 0.25 | 4 | 1.099 | 0.8331 | 256 |
| 56 | 8 | 0.5 | 4 | 1.099 | 0.8331 | 256 |
| 56 | 8 | 1 | 4 | 1.099 | 0.8331 | 256 |
| 56 | 8 | 2 | 4 | 1.099 | 0.8331 | 256 |
| 112 | 1 | 0.05 | 4 | 1.099 | 0.9131 | 1,024 |
| 112 | 1 | 0.1 | 4 | 1.099 | 0.9131 | 1,024 |
| 112 | 1 | 0.25 | 4 | 1.099 | 0.9131 | 1,024 |
| 112 | 1 | 0.5 | 4 | 1.099 | 0.9131 | 1,024 |
| 112 | 1 | 1 | 4 | 1.099 | 0.9131 | 1,024 |
| 112 | 1 | 2 | 4 | 1.099 | 0.9131 | 1,024 |
| 112 | 2 | 0.05 | 4 | 1.099 | 0.9072 | 1,024 |
| 112 | 2 | 0.1 | 4 | 1.099 | 0.9072 | 1,024 |
| 112 | 2 | 0.25 | 4 | 1.099 | 0.9072 | 1,024 |
| 112 | 2 | 0.5 | 4 | 1.099 | 0.9072 | 1,024 |
| 112 | 2 | 1 | 4 | 1.099 | 0.9072 | 1,024 |
| 112 | 2 | 2 | 4 | 1.099 | 0.9072 | 1,024 |
| 112 | 4 | 0.05 | 4 | 1.099 | 0.8846 | 256 |
| 112 | 4 | 0.1 | 4 | 1.099 | 0.8846 | 256 |
| 112 | 4 | 0.25 | 4 | 1.099 | 0.8846 | 256 |
| 112 | 4 | 0.5 | 4 | 1.099 | 0.8846 | 256 |
| 112 | 4 | 1 | 4 | 1.099 | 0.8846 | 256 |
| 112 | 4 | 2 | 4 | 1.099 | 0.8846 | 256 |
| 112 | 8 | 0.05 | 4 | 1.099 | 0.8537 | 256 |
| 112 | 8 | 0.1 | 4 | 1.099 | 0.8537 | 256 |
| 112 | 8 | 0.25 | 4 | 1.099 | 0.8537 | 256 |
| 112 | 8 | 0.5 | 4 | 1.099 | 0.8537 | 256 |
| 112 | 8 | 1 | 4 | 1.099 | 0.8537 | 256 |
| 112 | 8 | 2 | 4 | 1.099 | 0.8537 | 256 |

### full14 (N = 16,384)

Default design, v0.2 memory system:

| design | bootstrap [ms] | binding |
|---|---|---|
| FPGA (v0.2, 64 units) | 95.59 | — |
| ASIC, equal logic | 70.51 | hbm |
| ASIC, equal silicon | 70.51 | — |
| stacked chip, optimal split | 70.51 | hbm |
| stacked chip, all optical | 70.53 | hbm |

Optical share of butterflies 0; static power 46.67 W (22 lasers); ceilings: NTT-free 1×, exact 1×.

Logic area × HBM bandwidth (default photonics): speed-up of the chip over each ASIC.

| HBM [GB/s] | logic [mm²] | vs equal logic | vs equal silicon | NTT-free ceiling | exact ceiling | ASIC binds |
|---|---|---|---|---|---|---|
| 819 | 5 | 1.026 | 0.9284 | 1.058 | 1.026 | hbm |
| 819 | 10 | 1 | 0.9912 | 1 | 1 | hbm |
| 819 | 20 | 1 | 1 | 1 | 1 | hbm |
| 819 | 50 | 1 | 1 | 1 | 1 | hbm |
| 819 | 100 | 1 | 1 | 1 | 1 | hbm |
| 819 | 200 | 1 | 1 | 1 | 1 | hbm |
| 3276 | 5 | 1.06 | 0.5749 | 1.492 | 1.06 | logic |
| 3276 | 10 | 1.04 | 0.7771 | 1.221 | 1.041 | hbm |
| 3276 | 20 | 1.024 | 0.9364 | 1.054 | 1.025 | hbm |
| 3276 | 50 | 1 | 0.9979 | 1 | 1 | hbm |
| 3276 | 100 | 1 | 1 | 1 | 1 | hbm |
| 3276 | 200 | 1 | 1 | 1 | 1 | hbm |
| unconstrained | 5 | 1.075 | 0.2141 | 1.981 | 1.076 | logic |
| unconstrained | 10 | 1.071 | 0.3641 | 1.901 | 1.073 | logic |
| unconstrained | 20 | 1.063 | 0.5597 | 1.772 | 1.067 | logic |
| unconstrained | 50 | 1.036 | 0.7981 | 1.54 | 1.053 | logic |
| unconstrained | 100 | 1.007 | 0.9012 | 1.359 | 1.04 | logic |
| unconstrained | 200 | 0.993 | 0.954 | 1.213 | 1.026 | logic |

Compute-bound regime (10 mm² = 66 butterfly units of logic, unconstrained HBM), 1728 swept points, 1236 gain > 0.1% over the equal-logic ASIC, 432 exceed the power cap:

| best vs | U | W | B [GBd] | width | E_conv [pJ/bit] | vs equal logic | vs equal silicon | vs FPGA | binding |
|---|---|---|---|---|---|---|---|---|---|
| equal logic | 16 | 8 | 112 | 59 | 0.05 | 1.071 | 0.5886 | 6.99 | logic |
| equal silicon | 4 | 1 | 112 | 59 | 0.05 | 1.003 | 0.9152 | 6.549 | logic |
| FPGA | 16 | 8 | 112 | 59 | 0.05 | 1.071 | 0.5886 | 6.99 | logic |

| width | ASIC equal logic [ms] | FPGA [ms] | NTT-free ceiling | exact ceiling |
|---|---|---|---|---|
| 28 | 35.16 | 162.1 | 1.712 | 1.063 |
| 36 | 25.8 | 166 | 1.788 | 1.067 |
| 44 | 20.35 | 132.1 | 1.842 | 1.07 |
| 59 | 14.64 | 95.59 | 1.901 | 1.073 |

Break-even surface at 59 bits: smallest U that gains over the equal-logic ASIC ('—' = none), and the best ratio to each ASIC.

| B [GBd] | W | E_conv [pJ/bit] | min U to gain | max vs logic | max vs silicon | largest U within the power cap |
|---|---|---|---|---|---|---|
| 14 | 1 | 0.05 | 64 | 1.071 | 0.9113 | 1,024 |
| 14 | 1 | 0.1 | 64 | 1.071 | 0.9113 | 1,024 |
| 14 | 1 | 0.25 | 64 | 1.071 | 0.9113 | 1,024 |
| 14 | 1 | 0.5 | 64 | 1.071 | 0.9113 | 1,024 |
| 14 | 1 | 1 | 64 | 1.071 | 0.9113 | 1,024 |
| 14 | 1 | 2 | 64 | 1.071 | 0.9113 | 1,024 |
| 14 | 2 | 0.05 | 16 | 1.071 | 0.9007 | 1,024 |
| 14 | 2 | 0.1 | 16 | 1.071 | 0.9007 | 1,024 |
| 14 | 2 | 0.25 | 16 | 1.071 | 0.9007 | 1,024 |
| 14 | 2 | 0.5 | 16 | 1.071 | 0.9007 | 1,024 |
| 14 | 2 | 1 | 16 | 1.071 | 0.9007 | 1,024 |
| 14 | 2 | 2 | 16 | 1.071 | 0.9007 | 1,024 |
| 14 | 4 | 0.05 | 16 | 1.071 | 0.87 | 256 |
| 14 | 4 | 0.1 | 16 | 1.071 | 0.87 | 256 |
| 14 | 4 | 0.25 | 16 | 1.071 | 0.87 | 256 |
| 14 | 4 | 0.5 | 16 | 1.071 | 0.87 | 256 |
| 14 | 4 | 1 | 16 | 1.071 | 0.87 | 256 |
| 14 | 4 | 2 | 16 | 1.071 | 0.87 | 256 |
| 14 | 8 | 0.05 | 4 | 1.071 | 0.8242 | 256 |
| 14 | 8 | 0.1 | 4 | 1.071 | 0.8242 | 256 |
| 14 | 8 | 0.25 | 4 | 1.071 | 0.8242 | 256 |
| 14 | 8 | 0.5 | 4 | 1.071 | 0.8242 | 256 |
| 14 | 8 | 1 | 4 | 1.071 | 0.8242 | 256 |
| 14 | 8 | 2 | 4 | 1.071 | 0.8242 | 256 |
| 56 | 1 | 0.05 | 16 | 1.071 | 0.913 | 1,024 |
| 56 | 1 | 0.1 | 16 | 1.071 | 0.913 | 1,024 |
| 56 | 1 | 0.25 | 16 | 1.071 | 0.913 | 1,024 |
| 56 | 1 | 0.5 | 16 | 1.071 | 0.913 | 1,024 |
| 56 | 1 | 1 | 16 | 1.071 | 0.913 | 1,024 |
| 56 | 1 | 2 | 16 | 1.071 | 0.913 | 1,024 |
| 56 | 2 | 0.05 | 4 | 1.071 | 0.904 | 1,024 |
| 56 | 2 | 0.1 | 4 | 1.071 | 0.904 | 1,024 |
| 56 | 2 | 0.25 | 4 | 1.071 | 0.904 | 1,024 |
| 56 | 2 | 0.5 | 4 | 1.071 | 0.904 | 1,024 |
| 56 | 2 | 1 | 4 | 1.071 | 0.904 | 1,024 |
| 56 | 2 | 2 | 4 | 1.071 | 0.904 | 1,024 |
| 56 | 4 | 0.05 | 4 | 1.071 | 0.8764 | 256 |
| 56 | 4 | 0.1 | 4 | 1.071 | 0.8764 | 256 |
| 56 | 4 | 0.25 | 4 | 1.071 | 0.8764 | 256 |
| 56 | 4 | 0.5 | 4 | 1.071 | 0.8764 | 256 |
| 56 | 4 | 1 | 4 | 1.071 | 0.8764 | 256 |
| 56 | 4 | 2 | 4 | 1.071 | 0.8764 | 256 |
| 56 | 8 | 0.05 | 4 | 1.071 | 0.836 | 256 |
| 56 | 8 | 0.1 | 4 | 1.071 | 0.836 | 256 |
| 56 | 8 | 0.25 | 4 | 1.071 | 0.836 | 256 |
| 56 | 8 | 0.5 | 4 | 1.071 | 0.836 | 256 |
| 56 | 8 | 1 | 4 | 1.071 | 0.836 | 256 |
| 56 | 8 | 2 | 4 | 1.071 | 0.836 | 256 |
| 112 | 1 | 0.05 | 4 | 1.071 | 0.9152 | 1,024 |
| 112 | 1 | 0.1 | 4 | 1.071 | 0.9152 | 1,024 |
| 112 | 1 | 0.25 | 4 | 1.071 | 0.9152 | 1,024 |
| 112 | 1 | 0.5 | 4 | 1.071 | 0.9152 | 1,024 |
| 112 | 1 | 1 | 4 | 1.071 | 0.9152 | 1,024 |
| 112 | 1 | 2 | 4 | 1.071 | 0.9152 | 1,024 |
| 112 | 2 | 0.05 | 4 | 1.071 | 0.9084 | 1,024 |
| 112 | 2 | 0.1 | 4 | 1.071 | 0.9084 | 1,024 |
| 112 | 2 | 0.25 | 4 | 1.071 | 0.9084 | 1,024 |
| 112 | 2 | 0.5 | 4 | 1.071 | 0.9084 | 1,024 |
| 112 | 2 | 1 | 4 | 1.071 | 0.9084 | 1,024 |
| 112 | 2 | 2 | 4 | 1.071 | 0.9084 | 1,024 |
| 112 | 4 | 0.05 | 4 | 1.071 | 0.8846 | 256 |
| 112 | 4 | 0.1 | 4 | 1.071 | 0.8846 | 256 |
| 112 | 4 | 0.25 | 4 | 1.071 | 0.8846 | 256 |
| 112 | 4 | 0.5 | 4 | 1.071 | 0.8846 | 256 |
| 112 | 4 | 1 | 4 | 1.071 | 0.8846 | 256 |
| 112 | 4 | 2 | 4 | 1.071 | 0.8846 | 256 |
| 112 | 8 | 0.05 | 4 | 1.071 | 0.8512 | 256 |
| 112 | 8 | 0.1 | 4 | 1.071 | 0.8512 | 256 |
| 112 | 8 | 0.25 | 4 | 1.071 | 0.8512 | 256 |
| 112 | 8 | 0.5 | 4 | 1.071 | 0.8512 | 256 |
| 112 | 8 | 1 | 4 | 1.071 | 0.8512 | 256 |
| 112 | 8 | 2 | 4 | 1.071 | 0.8512 | 256 |


Figure: `figures/e12_scale_throughput.png`; data: `web/e12_scale_throughput.json`.

## 13. Future chip: energy per useful operation

**Headline.** A full-width (59-bit) 4-point transform costs 498.9 pJ on the stacked chip (U = 64, 4 λ, 112 GBd, E_conv 0.5 pJ/bit: crossings 354, phase shifters 69.31, laser 31.77, logic 31.98) against 32.35 pJ in the ASIC; the optics save only the modular adds, so even free light and crossings leave 43.78 pJ and break-even would need E_conv ≤ -0.1589 pJ/bit (none ≥ 0 exists); per bootstrap (sparse16) the chip uses 3.594 J vs 1.122 J for the ASIC (3.203×, HBM traffic 1.07 J of it) and 1.95× with every NTT through the optics (compute-bound).

Per transform the photonic chip runs at full utilisation, so its laser and phase-shifter power are charged to U × W × B / w transforms per second (4.617e11/s at the defaults, 22 lasers for the 6 dB design margin). A transform needs 708 crossings (4 × 59 bits in, 4 × 59 × 2 decision bits out). Digital energies at 59 bits: modular add 0.09219 pJ, modular multiply 7.904 pJ (Horowitz's 45 nm figures × 0.25).

| pJ per transform | stacked chip (thermo-optic) | stacked chip (MEMS) | ASIC |
|---|---|---|---|
| laser | 31.77 | 31.77 | 0 |
| phase_shifters | 69.31 | 0.006931 | 0 |
| conversions | 354 | 354 | 0 |
| recombination | 11.8 | 11.8 | 0 |
| logic | 31.98 | 31.98 | 32.35 |
| total | 498.9 | 429.6 | 32.35 |

Transform energy vs U (pJ, at the default E_conv):

| W \ U | 4 | 16 | 64 | 256 | 1024 | 4096 |
|---|---|---|---|---|---|---|
| 1 | 634.4 | 565.1 | 565.1 | 565.1 | 564 | 563.7 |
| 2 | 538.3 | 526.7 | 523.8 | 523.1 | 522.9 | 522.9 |
| 4 | 513.3 | 501.8 | 498.9 | 498.1 | 498 | 497.9 |
| 8 | 500.8 | 500.8 | 500.8 | 500.8 | 500.8 | 500.8 |

Transform energy vs E_conv and width:

| E_conv [pJ/bit] | stacked chip [pJ] |
|---|---|
| 0.05 | 180.3 |
| 0.1 | 215.7 |
| 0.25 | 321.9 |
| 0.5 | 498.9 |
| 1 | 852.9 |
| 2 | 1561 |

| width | stacked chip [pJ] | ASIC [pJ] |
|---|---|---|
| 28 | 228.9 | 7.47 |
| 36 | 296.9 | 12.22 |
| 44 | 366 | 18.13 |
| 59 | 498.9 | 32.35 |

Per bootstrap (J): default regime = v0.2 memory and 100 mm² of logic; compute-bound = unconstrained HBM and 10 mm² of logic. 'optimal' is experiment 12's split, which sends nothing through the optics when HBM binds, but the laser and phase shifters stay on.

### sparse16

| regime | design | time [ms] | logic | crossings | recombination | laser | phase shifters | HBM | total |
|---|---|---|---|---|---|---|---|---|---|
| default | photonic | 52.97 | 0.05252 | 0 | 0 | 0.777 | 1.695 | 1.07 | 3.594 |
| default | photonic all optical | 52.99 | 0.05214 | 0.3634 | 0.01211 | 0.7772 | 1.696 | 1.07 | 3.97 |
| default | photonic mems | 52.97 | 0.05252 | 0 | 0 | 0.777 | 1.695e-4 | 1.07 | 1.899 |
| default | asic logic | 52.97 | 0.05252 | 0 | 0 | 0 | 0 | 1.07 | 1.122 |
| default | asic silicon | 52.97 | 0.05252 | 0 | 0 | 0 | 0 | 1.07 | 1.122 |
| compute_bound | photonic | 14.8 | 0.05214 | 0.3634 | 0.01211 | 0.217 | 0.4735 | 1.07 | 2.188 |
| compute_bound | photonic all optical | 14.8 | 0.05214 | 0.3634 | 0.01211 | 0.217 | 0.4735 | 1.07 | 2.188 |
| compute_bound | photonic mems | 14.8 | 0.05214 | 0.3634 | 0.01211 | 0.217 | 4.735e-5 | 1.07 | 1.714 |
| compute_bound | asic logic | 16.26 | 0.05252 | 0 | 0 | 0 | 0 | 1.07 | 1.122 |
| compute_bound | asic silicon | 4.996 | 0.05252 | 0 | 0 | 0 | 0 | 1.07 | 1.122 |

### full14

| regime | design | time [ms] | logic | crossings | recombination | laser | phase shifters | HBM | total |
|---|---|---|---|---|---|---|---|---|---|
| default | photonic | 70.51 | 0.04594 | 0 | 0 | 1.034 | 2.256 | 1.416 | 4.752 |
| default | photonic all optical | 70.53 | 0.04568 | 0.2434 | 0.008115 | 1.034 | 2.257 | 1.416 | 5.005 |
| default | photonic mems | 70.51 | 0.04594 | 0 | 0 | 1.034 | 2.256e-4 | 1.416 | 2.496 |
| default | asic logic | 70.51 | 0.04594 | 0 | 0 | 0 | 0 | 1.416 | 1.462 |
| default | asic silicon | 70.51 | 0.04594 | 0 | 0 | 0 | 0 | 1.416 | 1.462 |
| compute_bound | photonic | 13.67 | 0.04568 | 0.2434 | 0.008115 | 0.2006 | 0.4376 | 1.416 | 2.351 |
| compute_bound | photonic all optical | 13.67 | 0.04568 | 0.2434 | 0.008115 | 0.2006 | 0.4376 | 1.416 | 2.351 |
| compute_bound | photonic mems | 13.67 | 0.04568 | 0.2434 | 0.008115 | 0.2006 | 4.376e-5 | 1.416 | 1.914 |
| compute_bound | asic logic | 14.64 | 0.04594 | 0 | 0 | 0 | 0 | 1.416 | 1.462 |
| compute_bound | asic silicon | 4.979 | 0.04594 | 0 | 0 | 0 | 0 | 1.416 | 1.462 |

Where photonics wins and loses: the optics replace the cheapest part of a butterfly (modular adds, a few % of its energy, against multiplies that scale with width squared) and pay for it per bit plane in crossings and bit-serial recombination, plus static laser and phase-shifter power. In exact mode it loses on energy at every swept point; experiment 16 looks at approximate mode, where an operand is one symbol.

Figure: `figures/e13_energy.png`; data: `web/e13_energy.json`.

## 14. Future chip: laser and thermal limits

**Headline.** One 20 dBm laser feeds at most U × W = 12 (4 λ) or 17 (1 λ) at a 6 dB margin and 4 or 8 at 10 dB, at 112 GBd with a 30 fF receiver (R_T ≤ 863.1 Ω, 1.422 µA rms; 4.495 at 300 fF); thermo-optic phase shifters at 10 mW/π hold 0.5 W per unit (1.25 W/mm²), so they alone reach the 500 W cap at U = 1000; an idle-to-busy step of the logic (0.5 W/mm²) spans 3.192 K across U = 64 and moves heater phases by up to 0.05888 rad, pushing 0 of units past the error target (first at 2 W/mm²).

Laser path: coupler, WDM (W > 1), a binary splitter tree with excess loss per stage, propagation across the photonic layer, modulator insertion loss; the signal/LO split is optimised per point. Margin = how far every noise term can grow before the worst output reaches the SER target (as in experiment 2), with the TIA noise from the transimpedance limit R_T ≤ A·f_A / (2π C_T f_3dB²).

| B [GBd] | R_T stacked [Ω] | noise stacked [µA] | R_T packaged [Ω] | noise packaged [µA] | deserialise to 28 GHz logic |
|---|---|---|---|---|---|
| 14 | 55239 | 0.06283 | 5524 | 0.1987 | 1 |
| 56 | 3452 | 0.5026 | 345.2 | 1.589 | 2 |
| 112 | 863.1 | 1.422 | 86.31 | 4.495 | 4 |

| U | margin [dB] | signal share | p_max [µW] | LO per pair [µW] |
|---|---|---|---|---|
| 1 | 12.38 | 0.6225 | 713.9 | 1088 |
| 2 | 8.897 | 0.6225 | 346.8 | 528.3 |
| 4 | 5.026 | 0.5622 | 151.7 | 296.8 |
| 8 | 0.6595 | 0.5622 | 73.24 | 143.3 |
| 16 | -4.323 | 0.5622 | 35.18 | 68.83 |
| 32 | -9.884 | 0.5 | 14.93 | 37.49 |
| 64 | -15.89 | 0.5 | 7.048 | 17.7 |

Largest U × W per 20 dBm laser:

| margin [dB] | W | B [GBd] | max U | max U × W |
|---|---|---|---|---|
| 6 | 1 | 14 | 156 | 156 |
| 6 | 1 | 56 | 38 | 38 |
| 6 | 1 | 112 | 17 | 17 |
| 6 | 4 | 14 | 31 | 124 |
| 6 | 4 | 56 | 7 | 28 |
| 6 | 4 | 112 | 3 | 12 |
| 6 | 8 | 14 | 16 | 128 |
| 6 | 8 | 56 | 3 | 24 |
| 6 | 8 | 112 | 1 | 8 |
| 10 | 1 | 14 | 69 | 69 |
| 10 | 1 | 56 | 17 | 17 |
| 10 | 1 | 112 | 8 | 8 |
| 10 | 4 | 14 | 13 | 52 |
| 10 | 4 | 56 | 3 | 12 |
| 10 | 4 | 112 | 1 | 4 |
| 10 | 8 | 14 | 6 | 48 |
| 10 | 8 | 56 | 1 | 8 |
| 10 | 8 | 112 | 0 | 0 |

| laser [dBm] | max U×W at 6 dB | max U×W at 10 dB |
|---|---|---|
| 13 | 0 | 0 |
| 17 | 4 | 0 |
| 20 | 12 | 4 |
| 23 | 24 | 12 |
| 27 | 60 | 28 |

Phase-shifter hold power (W) vs U, 50 per unit at 4 λ (mean phase π each):

| technology \ U | 4 | 16 | 64 | 256 | 1024 | 4096 |
|---|---|---|---|---|---|---|
| thermo 2 mW/π | 0.4 | 1.6 | 6.4 | 25.6 | 102.4 | 409.6 |
| thermo 10 mW/π | 2 | 8 | 32 | 128 | 512 | 2048 |
| thermo 30 mW/π | 6 | 24 | 96 | 384 | 1536 | 6144 |
| mems | 2e-4 | 8e-4 | 0.0032 | 0.0128 | 0.0512 | 0.2048 |
| nv | 0 | 0 | 0 | 0 | 0 | 0 |

Idle → busy step of the stacked logic (0.08633 rad/K per heater, unit common mode removed):

| U | layer side [mm] | ΔT range [K] | rms phase error [rad] | max [rad] | units past target |
|---|---|---|---|---|---|
| 16 | 2.53 | 3.322 | 0.01081 | 0.04024 | 0 |
| 64 | 5.06 | 3.192 | 0.01318 | 0.05888 | 0 |
| 256 | 10.12 | 3.255 | 0.01234 | 0.07391 | 0 |
| 1024 | 20.24 | 4.481 | 0.01306 | 0.07482 | 0 |
| 4096 | 40.48 | 4.239 | 0.01236 | 0.07489 | 0 |

| logic flux [W/mm²] | ΔT range [K] | rms phase error [rad] | max [rad] | units past target |
|---|---|---|---|---|
| 0.1 | 0.5691 | 0.003182 | 0.01247 | 0 |
| 0.25 | 1.423 | 0.007956 | 0.03117 | 0 |
| 0.5 | 2.846 | 0.01591 | 0.06234 | 0 |
| 1 | 5.691 | 0.03182 | 0.1247 | 0 |
| 2 | 11.38 | 0.06364 | 0.2494 | 0.03125 |
| 4 | 22.76 | 0.1273 | 0.4988 | 0.4531 |

Thermal crosstalk: residual of an ordered calibration that ignores it (Gauss-Seidel on (I + K) h = θ; v0.1's joint refinement would remove it at the cost of more evaluations):

| k_nn | rms after 1 sweep [rad] | units past target | rms after 3 [rad] | units past target | spectral radius of K |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |
| 0.05 | 0.02009 | 0 | 1.118e-4 | 0 | 0.2364 |
| 0.1 | 0.03709 | 0 | 6.221e-4 | 0 | 0.4728 |
| 0.2 | 0.07175 | 0.1406 | 0.004281 | 0 | 0.9456 |
| 0.3 | 0.1015 | 0.3438 | 0.01375 | 0 | 1.418 |

Figure: `figures/e14_laser_thermal.png`; data: `web/e14_laser_thermal.json`.

## 15. Future chip: calibration scaling

**Headline.** With per-unit tracking and recalibration from v0.1 (which the model reproduces exactly at U = 1: availability 0.7219 vs 0.7219 at 0.1 rad/√s and a 100,000-frame pilot), a controller serving 4 units at once keeps ≥ 0.9 of units in service up to U = 4,096 at 0.01 rad/√s, U = 1,024 at 0.03 rad/√s, U = 256 at 0.1 rad/√s of per-heater drift; start-up calibration takes 4096 s for U = 16,384; logic-heat storms (hot logic at 2 W/mm² hits 0 of units every 10 s) cost at most 2.421e-4 of in-service fraction (0.007641 → 0.007399 at U = 256, P = 1); this is at equal received power (the slab's lanes raised by its 1.977 dB insertion loss); at v0.1's lane power, sized for a lossless transform, the slab's error floor at 112 GBd is 1.299e-4 with no drift and the limits fall to U = 1,024 at 0.01 rad/√s, U = 256 at 0.03 rad/√s, U = 64 at 0.1 rad/√s (a sensitivity, not a slab result).

On the slab (v0.5) this loop runs the v0.1 receiver at 112 GBd, sized for a lossless transform. The tables are at equal received power: each lane raised by the slab's 1.977 dB insertion loss (to 68.73 µW), where the error floor with no drift is 1.45e-6 (the lossless mesh at v0.1's power: 1.832e-8; target 1e-6). As a sensitivity, at v0.1's lane power the floor is 1.299e-4: marker frames fail and units recalibrate whatever the drift, so the in-service fraction collapses for that reason, not the heaters'. In service at v0.1's lane power, P = 4:

| drift [rad/√s] | U = 1 | U = 4 | U = 16 | U = 64 | U = 256 | U = 1,024 | U = 4,096 | U = 16,384 |
|---|---|---|---|---|---|---|---|---|
| 0.01 | 1 | 1 | 1 | 0.9983 | 0.9983 | 1 | 0.1455 | 0.01807 |
| 0.03 | 0.9983 | 0.9983 | 0.9967 | 0.9983 | 0.9967 | 0.7773 | 0.01098 | 0.001298 |
| 0.1 | 0.995 | 0.995 | 0.9983 | 0.995 | 0.3594 | 0.003418 | 6.975e-4 | 1.478e-4 |

Recalibration takes 1 s (v0.1's illustrative figure for thermo-optic heaters; MEMS 0.75 s and non-volatile 50.5 s, scaled by settle + dwell per evaluation). Each unit gets P/U of the pilot updates; logic heat adds 0.005 rad/√s per heater. Failure rates come from 600 s of the v0.1 loop per point ('0' = none seen).

| drift [rad/√s] | dilution ⌈U/P⌉ | recalibrations | λ [1/s] |
|---|---|---|---|
| 0.01 | 1 | 0 | 0 |
| 0.01 | 4 | 0 | 0 |
| 0.01 | 16 | 0 | 0 |
| 0.01 | 64 | 0 | 0 |
| 0.01 | 256 | 0 | 0 |
| 0.01 | 1,024 | 0 | 0 |
| 0.01 | 4,096 | 1 | 0.001669 |
| 0.01 | 16,384 | 9 | 0.01523 |
| 0.03 | 1 | 0 | 0 |
| 0.03 | 4 | 0 | 0 |
| 0.03 | 16 | 0 | 0 |
| 0.03 | 64 | 0 | 0 |
| 0.03 | 256 | 0 | 0 |
| 0.03 | 1,024 | 3 | 0.005025 |
| 0.03 | 4,096 | 49 | 0.08893 |
| 0.03 | 16,384 | 71 | 0.1342 |
| 0.1 | 1 | 0 | 0 |
| 0.1 | 4 | 0 | 0 |
| 0.1 | 16 | 0 | 0 |
| 0.1 | 64 | 0 | 0 |
| 0.1 | 256 | 21 | 0.5316 |
| 0.1 | 1,024 | 33 | 1.222 |
| 0.1 | 4,096 | 36 | 1.469 |
| 0.1 | 16,384 | 36 | 1.469 |

Fraction of units in service (M/M/P//U):

Drift 0.01 rad/√s:

| P \ U | 1 | 4 | 16 | 64 | 256 | 1,024 | 4,096 | 16,384 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0.1462 | 0.004008 |
| 4 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0.1462 |
| 16 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 64 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

Drift 0.03 rad/√s:

| P \ U | 1 | 4 | 16 | 64 | 256 | 1,024 | 4,096 | 16,384 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | 1 | 0.1943 | 0.002745 | 4.548e-4 |
| 4 | 1 | 1 | 1 | 1 | 1 | 1 | 0.1943 | 0.002745 |
| 16 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0.1943 |
| 64 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

Drift 0.1 rad/√s:

| P \ U | 1 | 4 | 16 | 64 | 256 | 1,024 | 4,096 | 16,384 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | 0.007347 | 7.99e-4 | 1.662e-4 | 4.154e-5 |
| 4 | 1 | 1 | 1 | 1 | 1 | 0.007347 | 7.99e-4 | 1.662e-4 |
| 16 | 1 | 1 | 1 | 1 | 1 | 1 | 0.007347 | 7.99e-4 |
| 64 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0.007347 |

Smallest swept U with less than 0.9 of units in service ('—' = none):

| drift [rad/√s] | P = 1 | P = 4 | P = 16 | P = 64 |
|---|---|---|---|---|
| 0.01 | 4,096 | 16,384 | — | — |
| 0.03 | 1,024 | 4,096 | 16,384 | — |
| 0.1 | 256 | 1,024 | 4,096 | 16,384 |

Start-up calibration time [s]:

| P \ U | 1 | 4 | 16 | 64 | 256 | 1,024 | 4,096 | 16,384 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 4 | 16 | 64 | 256 | 1024 | 4096 | 16384 |
| 4 | 1 | 1 | 4 | 16 | 64 | 256 | 1024 | 4096 |
| 16 | 1 | 1 | 1 | 4 | 16 | 64 | 256 | 1024 |
| 64 | 1 | 1 | 1 | 1 | 4 | 16 | 64 | 256 |

SimPy fleet (fixed recalibration time) against the queueing result, and with logic-heat storms, at 0.1 rad/√s:

| U | P | λ [1/s] | analytic | SimPy fixed | SimPy + storms | storms | max queue |
|---|---|---|---|---|---|---|---|
| 4 | 1 | 0 | 1 | 1 | 1 | 0 | 0 |
| 4 | 64 | 0 | 1 | 1 | 1 | 0 | 0 |
| 16 | 1 | 0 | 1 | 1 | 1 | 0 | 0 |
| 16 | 64 | 0 | 1 | 1 | 1 | 0 | 0 |
| 64 | 1 | 0 | 1 | 1 | 1 | 0 | 0 |
| 64 | 64 | 0 | 1 | 1 | 1 | 0 | 0 |
| 256 | 1 | 0.5316 | 0.007347 | 0.007641 | 0.007399 | 0 | 256 |
| 256 | 64 | 0 | 1 | 1 | 1 | 0 | 0 |
| 1,024 | 1 | 1.222 | 7.99e-4 | 7.985e-4 | 7.858e-4 | 0 | 1,024 |
| 1,024 | 64 | 0 | 1 | 1 | 1 | 0 | 0 |
| 4,096 | 1 | 1.469 | 1.662e-4 | 1.676e-4 | 1.689e-4 | 0 | 4,096 |
| 4,096 | 64 | 0 | 1 | 1 | 1 | 0 | 0 |
| 16,384 | 1 | 1.469 | 4.154e-5 | 4.156e-5 | 4.171e-5 | 0 | 16,384 |
| 16,384 | 64 | 0.5316 | 0.007347 | 0.00733 | 0.007299 | 0 | 16,252 |

Figure: `figures/e15_calibration_scaling.png`; data: `web/e15_calibration_scaling.json`.

## 16. Future chip: approximate mode

**Headline.** Chaining S of the 6 radix-4 stages of a 4,096-point FFT optically, with 8-bit converters at the design SNR (31.15 dB per level step) and 2.949 dB per stage (the slab), the output keeps 2.746 effective bits at S = 1 and 1.872 at S = 6 (each chained slab's loss and residual cost more than the conversions saved; at 3 dB per stage 2.769 → 1.813); energy per butterfly-stage falls from 34.33 to 7.15 pJ (4.802×) and throughput rises 1.96× (power-limited at S = 1), 59× the exact-mode rate, but a digital butterfly at matched precision costs 0.0707 pJ.

Monte Carlo: 4 complex Gaussian vectors per point against a float64 radix-4 FFT (validated against numpy's to 1.933e-13). Each chained block: DAC (ENOB bits, ±4 rms) → S unitary stages with loss and 0.01 rad rms phase error per waveguide → receiver noise at the design SNR less the block's loss → ADC → digital rescale. Effective bits = (SNR − 1.76)/6.02 of the whole FFT's relative error. The design SNR is one level step over σ at the receiver when one laser feeds as many units as the 6 dB margin allows.

| S \ ENOB | 4 | 6 | 8 | 10 | 12 | 16 |
|---|---|---|---|---|---|---|
| 1 | 0.8751 | 2.405 | 2.746 | 2.77 | 2.776 | 2.783 |
| 2 | 1.325 | 2.547 | 2.758 | 2.775 | 2.786 | 2.79 |
| 3 | 1.501 | 2.491 | 2.63 | 2.645 | 2.651 | 2.656 |
| 4 | 1.471 | 2.413 | 2.536 | 2.545 | 2.539 | 2.534 |
| 5 | 1.345 | 2.156 | 2.244 | 2.238 | 2.245 | 2.248 |
| 6 | 1.406 | 1.818 | 1.872 | 1.862 | 1.865 | 1.871 |

Effective bits vs receiver SNR (16-bit converters):

| S \ SNR [dB] | 20 | 30 | 31.15 | 40 |
|---|---|---|---|---|
| 1 | 1.191 | 2.643 | 2.776 | 3.354 |
| 2 | 1.207 | 2.659 | 2.778 | 3.351 |
| 3 | 1.007 | 2.506 | 2.64 | 3.313 |
| 4 | 0.8762 | 2.39 | 2.549 | 3.275 |
| 5 | 0.512 | 2.084 | 2.248 | 3.163 |
| 6 | 0.09212 | 1.687 | 1.869 | 2.96 |

Energy (pJ per butterfly-stage, 8-bit converters, U = 64, 4 λ, 112 GBd) and throughput:

| S | crossings | boundary twiddles | laser | phase shifters | total | energy gain | butterfly-stages/s | limit | throughput gain | effective bits | digital at matched bits [pJ] |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 32 | 0.6188 | 0.5385 | 1.175 | 34.33 | 1 | 1.39e13 | power | 1 | 2.746 | 0.1333 |
| 2 | 16 | 0.3094 | 0.5385 | 1.175 | 18.02 | 1.905 | 2.724e13 | optics | 1.96 | 2.758 | 0.1333 |
| 3 | 10.67 | 0.2062 | 0.5385 | 1.175 | 12.59 | 2.728 | 2.724e13 | optics | 1.96 | 2.63 | 0.1333 |
| 4 | 8 | 0.1547 | 0.5385 | 1.175 | 9.868 | 3.479 | 2.724e13 | optics | 1.96 | 2.536 | 0.1333 |
| 5 | 6.4 | 0.1237 | 0.5385 | 1.175 | 8.237 | 4.168 | 2.724e13 | optics | 1.96 | 2.244 | 0.1333 |
| 6 | 5.333 | 0.1031 | 0.5385 | 1.175 | 7.15 | 4.802 | 2.724e13 | optics | 1.96 | 1.872 | 0.0707 |

On the slab (v0.5) every chained stage is the calibrated slab: its insertion loss 2.949 dB per stage (v0.3 assumed 1 dB) and its residual after the chip's knobs (0.02756 normalised Frobenius from DFT4, the same on every stage). Effective bits with 8-bit converters at the slab's loss and at v0.3's two losses, same kernel:

| S | 2.949 dB (slab) | 1 dB | 3 dB |
|---|---|---|---|
| 1 | 2.746 | 2.93 | 2.745 |
| 2 | 2.758 | 3.09 | 2.746 |
| 3 | 2.63 | 3.142 | 2.62 |
| 4 | 2.536 | 3.145 | 2.524 |
| 5 | 2.244 | 3.129 | 2.218 |
| 6 | 1.872 | 3.148 | 1.818 |

For reference, exact mode delivers 4.617e11 full-width (59-bit) butterflies/s on the same units: approximate mode carries one operand per symbol instead of one bit plane. The digital 8-bit complex butterfly costs 0.7188 pJ (12 multiplies, 22 adds). The best precision here is at S = 2.

Figure: `figures/e16_approximate.png`; data: `web/e16_approximate.json`.

## 17. Future chip: wavelength-dependent transform error

**Headline.** One shared slab for 16 channels at 200 GHz around 1310 nm (span 18.32 nm) leaves the worst channel 0.04079 off DFT4 (normalised Frobenius) against 0.02756 at λ0, where the slab's input envelope already sits; the wavelength term adds at most 0.0231 (least squares 0.03069 mean vs centre 0.03069). Exact mode: it costs 0.0342 dB at the 10 dB reference, and the worst channel keeps 6 dB out to ±39.9 nm (largest swept plan in the O-band 4 × 20 nm), so 5 µm rings (FSR 14.01 nm, 8 channels at 200 GHz) bind first, as on the mesh. Per stage the wavelength term passes the 0.01 rad random phase error beyond ±3.716 nm (7.491 channels at 200 GHz). Approximate mode at the design SNR, 8-bit converters and the slab's 2.949 dB per stage: the worst of 32 channels keeps 1.551 bits at S = 6 against 1.872 for one channel, and at 4 λ 2.714 and 1.862 at S = 1 and 6 (one channel 2.746 and 1.872). One laser feeds U × W = 12 at 4 λ and 6 dB with the wavelength term (12 with every channel at λ0). One slab serves every channel of the largest ring-feasible plan (8 × 200 GHz); the slab's own residual at λ0 is larger than the wavelength term.

Model (`plms.slab`, v0.5): the transform of channel i is the slab's T(λ_i) from its physics; β = 2π n_s/(λR) scales as n_s(λ)/λ, i.e. 1 − (n_g/n_s) δ with n_g/n_s = 1.3, so every phase of the Fourier kernel scales and the focal pattern moves along the fixed output ports. The 4 input and 4 LO phase shifters are shared (heater-set, scaling as 1 − δ); each channel's receivers have their own digital gain per output. v0.4's version of this experiment ran on the stand-in mesh and fitted its 8 in-mesh heaters, which a slab does not have. The λ0 channel is 0.02756 off DFT4 already (the input envelope); the 'wavelength term' is ‖U_eff(λ) − U_eff(λ0)‖/‖DFT4‖. Margins through v0.3's receiver at 112 GBd at a reference power (p_max 441.5 µW, LO 672.6 µW) where the λ0 channel of this slab has 10 dB.

Worst channel per plan:

| grid | W | span [nm] | ring fits | in band | error centre | error LSQ | wavelength term LSQ | margin centre [dB] | margin LSQ [dB] | SER LSQ (worst) |
|---|---|---|---|---|---|---|---|---|---|---|
| 100 GHz | 1 | 0.5724 | yes | yes | 0.02756 | 0.02756 | 3.635e-7 | 10 | 10 | 3.167e-47 |
| 100 GHz | 2 | 1.145 | yes | yes | 0.02779 | 0.02779 | 7.696e-4 | 10 | 10 | 3.188e-47 |
| 100 GHz | 4 | 2.29 | yes | yes | 0.02832 | 0.02832 | 0.002309 | 9.999 | 9.999 | 3.264e-47 |
| 100 GHz | 8 | 4.579 | yes | yes | 0.02959 | 0.02959 | 0.005387 | 9.997 | 9.997 | 3.566e-47 |
| 100 GHz | 16 | 9.159 | yes | yes | 0.03284 | 0.03284 | 0.01155 | 9.99 | 9.99 | 4.997e-47 |
| 100 GHz | 32 | 18.32 | **no** | yes | 0.04135 | 0.04138 | 0.02388 | 9.963 | 9.964 | 1.817e-46 |
| 200 GHz | 1 | 1.145 | yes | yes | 0.02756 | 0.02756 | 3.635e-7 | 10 | 10 | 3.167e-47 |
| 200 GHz | 2 | 2.29 | yes | yes | 0.02805 | 0.02805 | 0.001539 | 10 | 10 | 3.22e-47 |
| 200 GHz | 4 | 4.579 | yes | yes | 0.02924 | 0.02924 | 0.004617 | 9.998 | 9.998 | 3.47e-47 |
| 200 GHz | 8 | 9.159 | yes | yes | 0.03239 | 0.03239 | 0.01078 | 9.991 | 9.991 | 4.736e-47 |
| 200 GHz | 16 | 18.32 | **no** | yes | 0.04077 | 0.04079 | 0.0231 | 9.966 | 9.966 | 1.637e-46 |
| 200 GHz | 32 | 36.64 | **no** | yes | 0.06147 | 0.06158 | 0.04778 | 9.607 | 9.603 | 1.579e-39 |
| 400 GHz | 1 | 2.29 | yes | yes | 0.02756 | 0.02756 | 3.635e-7 | 10 | 10 | 3.167e-47 |
| 400 GHz | 2 | 4.579 | yes | yes | 0.02861 | 0.02861 | 0.003078 | 9.999 | 9.999 | 3.32e-47 |
| 400 GHz | 4 | 9.159 | yes | yes | 0.03152 | 0.03152 | 0.009235 | 9.993 | 9.993 | 4.295e-47 |
| 400 GHz | 8 | 18.32 | **no** | yes | 0.03961 | 0.03963 | 0.02156 | 9.97 | 9.97 | 1.341e-46 |
| 400 GHz | 16 | 36.64 | **no** | yes | 0.0601 | 0.0602 | 0.04623 | 9.678 | 9.674 | 3.464e-40 |
| 400 GHz | 32 | 73.27 | **no** | yes | 0.1056 | 0.1061 | 0.09559 | 6.871 | 6.844 | 8.218e-22 |
| 800 GHz | 1 | 4.579 | yes | yes | 0.02756 | 0.02756 | 3.635e-7 | 10 | 10 | 3.167e-47 |
| 800 GHz | 2 | 9.159 | yes | yes | 0.02994 | 0.02994 | 0.006159 | 9.997 | 9.997 | 3.676e-47 |
| 800 GHz | 4 | 18.32 | **no** | yes | 0.03738 | 0.03739 | 0.01847 | 9.977 | 9.978 | 9.348e-47 |
| 800 GHz | 8 | 36.64 | **no** | yes | 0.05738 | 0.05748 | 0.04313 | 9.817 | 9.813 | 1.604e-41 |
| 800 GHz | 16 | 73.27 | **no** | yes | 0.1027 | 0.1032 | 0.09247 | 7.083 | 7.056 | 8.843e-23 |
| 800 GHz | 32 | 146.5 | **no** | **no** | 0.1949 | 0.1969 | 0.1905 | -6.577 | -7.098 | 0.002089 |
| 20 nm | 1 | 20 | yes | yes | 0.02756 | 0.02756 | 3.635e-7 | 10 | 10 | 3.167e-47 |
| 20 nm | 2 | 40 | **no** | yes | 0.04372 | 0.0438 | 0.02693 | 9.954 | 9.954 | 2.787e-46 |
| 20 nm | 4 | 80 | **no** | yes | 0.09178 | 0.09233 | 0.08057 | 7.836 | 7.809 | 1.193e-26 |
| 20 nm | 8 | 160 | **no** | **no** | 0.1925 | 0.1948 | 0.1875 | -5.724 | -6.279 | 0.001372 |
| 20 nm | 16 | 320 | **no** | **no** | 0.3959 | 0.3867 | 0.3917 | −∞ | −∞ | 0.5118 |
| 20 nm | 32 | 640 | **no** | **no** | 0.7268 | 0.7079 | 0.7098 | −∞ | −∞ | 0.9368 |

Exact mode, largest swept W inside the O-band whose worst channel keeps 6 dB (continuous limit, centre calibration: ±39.9 nm):

| grid, calibration | max W | span [nm] | max W that fits the ring | span [nm] |
|---|---|---|---|---|
| 100 GHz, centre | 32 | 18.32 | 16 | 9.159 |
| 100 GHz, least squares | 32 | 18.32 | 16 | 9.159 |
| 200 GHz, centre | 32 | 36.64 | 8 | 9.159 |
| 200 GHz, least squares | 32 | 36.64 | 8 | 9.159 |
| 400 GHz, centre | 32 | 73.27 | 4 | 9.159 |
| 400 GHz, least squares | 32 | 73.27 | 4 | 9.159 |
| 800 GHz, centre | 16 | 73.27 | 2 | 9.159 |
| 800 GHz, least squares | 16 | 73.27 | 2 | 9.159 |
| 20 nm, centre | 4 | 80 | 1 | 20 |
| 20 nm, least squares | 4 | 80 | 1 | 20 |

Approximate mode, worst channel (4,096-point FFT, 8-bit converters, design SNR 31.15 dB, 2.949 dB per chained slab):

| grid | S | W = 1 | W = 2 | W = 4 | W = 8 | W = 16 | W = 32 |
|---|---|---|---|---|---|---|---|
| 100 GHz | 1 | 2.746 | 2.741 | 2.733 | 2.71 | 2.657 | 2.504 |
| 100 GHz | 2 | 2.758 | 2.754 | 2.742 | 2.717 | 2.653 | 2.474 |
| 100 GHz | 4 | 2.536 | 2.532 | 2.525 | 2.507 | 2.452 | 2.301 |
| 100 GHz | 6 | 1.872 | 1.871 | 1.868 | 1.86 | 1.837 | 1.762 |
| 200 GHz | 1 | 2.746 | 2.737 | 2.714 | 2.662 | 2.515 | 2.157 |
| 200 GHz | 2 | 2.758 | 2.747 | 2.724 | 2.662 | 2.486 | 2.07 |
| 200 GHz | 4 | 2.536 | 2.53 | 2.512 | 2.46 | 2.311 | 1.938 |
| 200 GHz | 6 | 1.872 | 1.87 | 1.862 | 1.84 | 1.768 | 1.551 |
| 400 GHz | 1 | 2.746 | 2.727 | 2.679 | 2.536 | 2.18 | 1.546 |
| 400 GHz | 2 | 2.758 | 2.737 | 2.681 | 2.511 | 2.095 | 1.402 |
| 400 GHz | 4 | 2.536 | 2.52 | 2.475 | 2.333 | 1.962 | 1.303 |
| 400 GHz | 6 | 1.872 | 1.866 | 1.847 | 1.779 | 1.567 | 1.082 |
| 800 GHz | 1 | 2.746 | 2.704 | 2.575 | 2.224 | 1.579 | 0.7729 |
| 800 GHz | 2 | 2.758 | 2.711 | 2.559 | 2.147 | 1.437 | 0.6058 |
| 800 GHz | 4 | 2.536 | 2.502 | 2.373 | 2.008 | 1.338 | 0.525 |
| 800 GHz | 6 | 1.872 | 1.858 | 1.799 | 1.597 | 1.11 | 0.3974 |
| 20 nm | 1 | 2.746 | 2.461 | 1.715 | 0.7868 | 0.02906 | -0.282 |
| 20 nm | 2 | 2.758 | 2.422 | 1.58 | 0.6198 | -0.1057 | -0.2944 |
| 20 nm | 4 | 2.536 | 2.255 | 1.476 | 0.5382 | -0.1656 | -0.3054 |
| 20 nm | 6 | 1.872 | 1.739 | 1.22 | 0.4102 | -0.2461 | -0.3406 |

Precision-limited (60 dB SNR, 16-bit converters): the slab at λ0 against the worst channel. The λ0 residual sets the ceiling; the wavelength term costs little on top of it.

| W | S | λ0 slab only | worst channel |
|---|---|---|---|
| 1 | 1 | 3.495 | 3.495 |
| 1 | 2 | 3.505 | 3.505 |
| 1 | 4 | 3.502 | 3.502 |
| 1 | 6 | 3.506 | 3.506 |
| 2 | 1 | 3.506 | 3.483 |
| 2 | 2 | 3.505 | 3.482 |
| 2 | 4 | 3.505 | 3.482 |
| 2 | 6 | 3.497 | 3.474 |
| 4 | 1 | 3.494 | 3.42 |
| 4 | 2 | 3.499 | 3.417 |
| 4 | 4 | 3.511 | 3.425 |
| 4 | 6 | 3.499 | 3.412 |
| 8 | 1 | 3.513 | 3.302 |
| 8 | 2 | 3.5 | 3.261 |
| 8 | 4 | 3.508 | 3.26 |
| 8 | 6 | 3.493 | 3.232 |
| 16 | 1 | 3.494 | 2.974 |
| 16 | 2 | 3.502 | 2.91 |
| 16 | 4 | 3.499 | 2.869 |
| 16 | 6 | 3.5 | 2.841 |
| 32 | 1 | 3.499 | 2.402 |
| 32 | 2 | 3.513 | 2.277 |
| 32 | 4 | 3.505 | 2.228 |
| 32 | 6 | 3.495 | 2.156 |

Laser fan-out restated (200 GHz grid, worst two channels):

| W | margin [dB] | max U, channels at λ0 | max U×W at λ0 | max U | max U×W | ring fits |
|---|---|---|---|---|---|---|
| 1 | 6 | 17 | 17 | 17 | 17 | yes |
| 1 | 10 | 8 | 8 | 8 | 8 | yes |
| 4 | 6 | 3 | 12 | 3 | 12 | yes |
| 4 | 10 | 1 | 4 | 1 | 4 | yes |
| 8 | 6 | 1 | 8 | 1 | 8 | yes |
| 8 | 10 | 0 | 0 | 0 | 0 | yes |

| S | one channel | worst of 4 channels |
|---|---|---|
| 1 | 2.746 | 2.714 |
| 2 | 2.758 | 2.724 |
| 4 | 2.536 | 2.512 |
| 6 | 1.872 | 1.862 |

A slab per wavelength (each designed for its own channel) has no wavelength term but keeps the λ0 residual, at W× the units:

| W | shared area [mm²] | per-λ area [mm²] | shared heaters [W] | per-λ heaters [W] | per-λ error |
|---|---|---|---|---|---|
| 1 | 16 | 16 | 16.64 | 16.64 | 0.02756 |
| 2 | 19.2 | 32 | 21.76 | 33.28 | 0.02756 |
| 4 | 25.6 | 64 | 32 | 66.56 | 0.02756 |
| 8 | 38.4 | 128 | 52.48 | 133.1 | 0.02756 |
| 16 | 64 | 256 | 93.44 | 266.2 | 0.02756 |
| 32 | 115.2 | 512 | 175.4 | 532.5 | 0.02756 |

Sensitivity to the slab's dispersion at 16 × 200 GHz:

| n_g/n_s | worst error | wavelength term | worst margin [dB] |
|---|---|---|---|
| 1 | 0.03844 | 0.02079 | 9.974 |
| 1.3 | 0.04079 | 0.0231 | 9.966 |
| 1.6 | 0.04332 | 0.02573 | 9.957 |
| 2 | 0.04692 | 0.02956 | 9.943 |

| ring radius [µm] | FSR [nm] | max W at 100 GHz | max W at 200 GHz | max W at 400 GHz | max W at 800 GHz | max W at 20 nm |
|---|---|---|---|---|---|---|
| 3 | 23.34 | 32 | 16 | 8 | 4 | 1 |
| 5 | 14.01 | 16 | 8 | 4 | 2 | 1 |
| 10 | 7.003 | 8 | 4 | 2 | 1 | 1 |
| 20 | 3.502 | 4 | 2 | 1 | 1 | 1 |

Linearity: doubling a small δ multiplies the wavelength term by 2. Signal/LO path: as v0.4, an unmatched 1 mm path rotates the edge channel of 16 × 200 GHz by 122.6 rad (matched to 0.08156 µm or trimmed per channel; not applied). The slab adds no path of its own beyond that: its length R is common to every port.

Per-channel output-phase trim (a per-channel LO phase per output; off by default):

| W | trim | worst error | mean error | worst margin [dB] | bits S = 1 | bits S = 2 | bits S = 4 | bits S = 6 |
|---|---|---|---|---|---|---|---|---|
| 16 | off | 0.04079 | 0.03069 | 9.966 | 2.515 | 2.486 | 2.311 | 1.768 |
| 16 | on | 0.03824 | 0.02948 | 9.978 | 2.566 | 2.522 | 2.33 | 1.773 |
| 32 | off | 0.06158 | 0.03826 | 9.603 | 2.157 | 2.07 | 1.938 | 1.551 |
| 32 | on | 0.05414 | 0.03457 | 9.921 | 2.298 | 2.158 | 1.988 | 1.568 |

Not modelled: the port modes' change with wavelength, stray-light phases that change with wavelength (held fixed), ring spectra, polarisation and crosstalk between channels.

Figure: `figures/e17_wavelength_error.png`; data: `web/e17_wavelength_error.json`.

## 18. Slab OFT: physics, calibration and heaters

**Headline.** At 4 points the slab (R = 33.91 µm, p = q = 2 µm, n_s = 2.85) meets the DFT condition to 1.271e-15 (the point-port rule leaves 0.0484) and fits its 4 outputs in one grating order, but delivers only 0.6343 of the input power to them (1.977 dB with 0.5 dB excess) in the default design A, whose wide output ports (fill 0.45) make a 2.228 dB input envelope that unequal splitter ratios cancel at design time; the knobs then leave 0.02756 (normalised Frobenius) after the matrix fit and 0.0566 step after a continuous truth-table calibration of the 13 data-path shifters (0.06229 median with v0.1's 12-bit DACs). The module's margin at its −5 dBm LO falls from 10.43 dB (lossless mesh) to 7.196 dB in design A (design B, narrow outputs and no pre-compensation: 5.895 dB at 3.567 dB loss); one laser feeds U × W = 12 at 6 dB (B 8, mesh 20). Exact mode keeps the SER target up to -15 dB of coherent stray light (-20 dB for a 6 dB margin). Calibration passes from 16 of 16 random starts. The module has 15–18 phase shifters by recount (16 at most on the data path, none inside the OFT); at 0.1 rad/√s per heater the slab's 13 keep availability 0.6917 at equal received power and 0.6783 at equal laser power, against 0.605 for the mesh's 17.

Model (`plms.slab`; derivation in docs/architecture.md, validation tagged `textbook-derivation`): confocal arcs of radius R, Gaussian port modes, the paraxial Fourier kernel and a closed-form overlap; the DFT condition β κ p q = 2π/N with β = 2π n_s/(λR) and κ = 1/(1 + β² w_in² w_out²/4). Every geometric value is illustrative.

| quantity | value |
|---|---|
| radius R (Gaussian rule) [µm] | 33.91 |
| radius R (point-port rule) [µm] | 34.81 |
| κ | 0.974 |
| deviation from DFT4 at the design point, best diagonals | 1.271e-15 |
| same with the point-port rule | 0.0484 |
| grating-order period λR/(n_s p) [µm] | 7.792 |
| effective period (/κ) [µm] | 8 |
| 4 outputs span N q [µm] | 8 |
| fits one order | yes |
| efficiency into the 4 outputs (mean, excess incl.) | 0.6343 |
| insertion loss [dB] | 1.977 |
| power in neither signal nor dummy ports | 0.2938 |
| input envelope max/min [dB] | 2.228 |
| output envelope max/min [dB] | 2.228 |
| chip (fab + stray): best diagonals of any kind | 0.02639 |
| chip: with the chip's knobs (matrix fit) | 0.02756 |
| chip: worst output, unit inputs | 0.06049 |
| truth-table residual after calibration [steps] | 0.0566 |
| word error at −5 dBm LO | 1.928e-27 |
| module margin, slab / ideal ½·DFT [dB] | 7.196 / 10.43 |

Port design: input mode width (fill_in = waist/pitch) sets how much of each input's far field lands on the outputs (efficiency) and the output envelope, which the digital gains correct at a noise cost; output mode width sets the input envelope, which no knob corrects (ideal geometry, no excess loss):

| fill_in | fill_out | efficiency | insertion loss [dB] | input envelope [dB] | output envelope [dB] | residual (Frobenius) | worst output |
|---|---|---|---|---|---|---|---|
| 0.15 | 0.15 | 0.132 | 9.294 | 0.2412 | 0.2412 | 0.01388 | 0.02776 |
| 0.15 | 0.25 | 0.2073 | 7.333 | 0.6703 | 0.2413 | 0.03854 | 0.07702 |
| 0.15 | 0.35 | 0.2662 | 6.248 | 1.315 | 0.2415 | 0.07533 | 0.1502 |
| 0.15 | 0.45 | 0.3055 | 5.65 | 2.176 | 0.2418 | 0.1237 | 0.2454 |
| 0.25 | 0.15 | 0.2073 | 7.333 | 0.2413 | 0.6703 | 0.01389 | 0.02778 |
| 0.25 | 0.25 | 0.3256 | 5.373 | 0.6714 | 0.6714 | 0.0386 | 0.07714 |
| 0.25 | 0.35 | 0.4178 | 4.29 | 1.319 | 0.6729 | 0.07556 | 0.1507 |
| 0.25 | 0.45 | 0.4789 | 3.698 | 2.187 | 0.675 | 0.1243 | 0.2466 |
| 0.35 | 0.15 | 0.2668 | 6.238 | 0.2415 | 1.315 | 0.0139 | 0.0278 |
| 0.35 | 0.25 | 0.4188 | 4.28 | 0.6729 | 1.319 | 0.03869 | 0.07732 |
| 0.35 | 0.35 | 0.5367 | 3.203 | 1.325 | 1.325 | 0.07591 | 0.1514 |
| 0.35 | 0.45 | 0.6138 | 2.62 | 2.204 | 1.333 | 0.1252 | 0.2485 |
| 0.45 | 0.15 | 0.309 | 5.6 | 0.2418 | 2.176 | 0.01392 | 0.02783 |
| 0.45 | 0.25 | 0.4846 | 3.646 | 0.675 | 2.187 | 0.03881 | 0.07756 |
| 0.45 | 0.35 | 0.6198 | 2.578 | 1.333 | 2.204 | 0.07638 | 0.1523 |
| 0.45 | 0.45 | 0.7062 | 2.011 | 2.228 | 2.228 | 0.1265 | 0.251 |

The lowest residual in the grid is at fill_in 0.15, fill_out 0.15 (0.01388, 9.294 dB). Dummy output ports (into the neighbouring grating orders, to light sinks) catch light that would otherwise scatter; they do not change the signal ports:

| dummies per side | signal efficiency | dummy capture | uncaptured |
|---|---|---|---|
| 0 | 0.7062 | 0 | 0.2938 |
| 1 | 0.7062 | 0.09375 | 0.2 |
| 2 | 0.7062 | 0.1138 | 0.1799 |
| 4 | 0.7062 | 0.1166 | 0.1771 |

Two port designs. A (the default): wide output ports (fill_out 0.45) and the input envelope pre-compensated at design time by unequal splitter ratios ahead of the MZMs (`oft.precomp`, illustrative: a lossless redistribution of the lanes' power, set from the nominal geometry; between chained approximate-mode stages it is an attenuator per input, whose loss is counted). B: narrow output ports (fill_out 0.25) and no pre-compensation, so the envelope stays as residual. Exact-mode energy does not depend on the choice. Drift: 0.1 rad/√s per heater, 100,000-frame pilot, 14 GBd, at equal received power (lanes raised by the insertion loss) and at equal laser power (v0.1's lane power). Effective bits: e16's FFT and random stream at each design's own design SNR and stage loss, so design A's are e16's headline numbers; the mesh's are v0.4's e16 (`e16_approximate.eff_bits_at_converter_bits.1` and `.-1` in `results/v0_4/`):

| quantity | design A (default) | design B | mesh (v0.4) |
|---|---|---|---|
| efficiency into the 4 outputs | 0.6343 | 0.4399 | 1 |
| insertion loss [dB] | 1.977 | 3.567 | 0 |
| residual after the matrix fit (Frobenius) | 0.02756 | 0.0519 | 0 |
| truth-table residual [steps] | 0.0566 | 0.05592 | 0 |
| module margin at −5 dBm LO [dB] | 7.196 | 5.895 | 10.43 |
| U × W per laser at 6 dB | 12 | 8 | 20 |
| approximate-mode stage loss [dB] | 2.949 | 3.567 | 1 |
| effective bits, S = 1 (4,096-point FFT) | 2.746 | 2.417 | 2.74 |
| effective bits, S = 6 (all stages chained) | 1.872 | 1.551 | 3.198 |
| drift availability, equal received power | 0.6917 | 0.685 | 0.605 |
| drift availability, equal laser power | 0.6783 | 0.6417 | 0.605 |

Paraxial against exact path lengths (numerical overlap with the exact arc-to-arc distance, 1/√d amplitude and obliquity), ideal geometry:

| N | paraxial: deviation | exact: deviation | exact: with knobs | ‖T_exact − T_paraxial‖/‖T‖ | efficiency paraxial | efficiency exact |
|---|---|---|---|---|---|---|
| 4 | 1.257e-15 | 0.005143 | 0.126 | 0.004874 | 0.7151 | 0.7149 |
| 16 | 8.788e-14 | 0.02387 | 0.1405 | 0.01922 | 0.7102 | 0.7099 |

Stray light (`oft.stray_dB`, coherent, a fixed random phase per path), calibrated; approximate mode as e16 (4,096-point FFT, 8-bit converters, the slab's loss per stage, e16's random stream, so the default level's row is e16's run):

| stray [dB] | residual [steps] | word error (−5 dBm LO) | margin [dB] | Frobenius | bits S = 1 | bits S = 6 |
|---|---|---|---|---|---|---|
| -60 | 0.003923 | 2.329e-28 | 7.167 | 0.01583 | 2.905 | 1.918 |
| -50 | 0.008085 | 2.433e-28 | 7.174 | 0.01587 | 2.903 | 1.917 |
| -40 | 0.02292 | 2.48e-28 | 7.193 | 0.01706 | 2.891 | 1.913 |
| -35 | 0.03987 | 3.39e-28 | 7.207 | 0.01998 | 2.854 | 1.904 |
| -30 | 0.0566 | 1.928e-27 | 7.196 | 0.02756 | 2.746 | 1.872 |
| -25 | 0.1216 | 1.134e-26 | 7.142 | 0.04384 | 2.474 | 1.78 |
| -20 | 0.1914 | 1.708e-20 | 6.373 | 0.07479 | 1.98 | 1.548 |
| -15 | 0.3329 | 3.675e-8 | 1.3 | 0.1299 | 1.328 | 1.119 |
| -10 | 0.5676 | 0.1171 | −∞ | 0.2225 | 0.6536 | 0.5634 |

Fabrication error (8 chips per point), normalised Frobenius distance from DFT4 with the nominal design's knob settings (uncalibrated) and with each chip's own (calibrated):

| σ_x [µm] | uncal. mean | uncal. max | cal. mean | cal. max |
|---|---|---|---|---|
| 0 | 1.284e-15 | 1.284e-15 | 1.284e-15 | 1.284e-15 |
| 0.01 | 0.012 | 0.0158 | 0.009488 | 0.01487 |
| 0.02 | 0.024 | 0.03162 | 0.01896 | 0.02971 |
| 0.05 | 0.05999 | 0.0791 | 0.04722 | 0.07392 |
| 0.1 | 0.1198 | 0.158 | 0.09372 | 0.1461 |

| σ_w [µm] | uncal. mean | uncal. max | cal. mean | cal. max |
|---|---|---|---|---|
| 0 | 1.284e-15 | 1.284e-15 | 1.284e-15 | 1.284e-15 |
| 0.01 | 0.004122 | 0.005339 | 0.003276 | 0.004047 |
| 0.02 | 0.008227 | 0.01064 | 0.006564 | 0.008077 |
| 0.05 | 0.02048 | 0.02634 | 0.01653 | 0.0202 |
| 0.1 | 0.04097 | 0.05199 | 0.03363 | 0.04112 |

| σ_n (relative) | uncal. mean | uncal. max | cal. mean | cal. max |
|---|---|---|---|---|
| 0 | 1.284e-15 | 1.284e-15 | 1.284e-15 | 1.284e-15 |
| 5e-4 | 5.809e-4 | 0.001082 | 5.74e-4 | 0.00107 |
| 0.001 | 0.001162 | 0.002164 | 0.001148 | 0.002139 |
| 0.002 | 0.002323 | 0.004327 | 0.002296 | 0.004277 |
| 0.005 | 0.005809 | 0.01081 | 0.00574 | 0.01069 |

v0.1's ordered calibration (coarse and fine scans, joint refinement, 12-bit DACs) with only the slab's knobs (in0, in1, in2, in3, lo0, lo1, lo2, lo3, lo_mzi, bias0, bias1, bias2, bias3); unknown heater offsets of 0.3 rad rms; pass = every output within half a step. The matrix fit alone (input and LO phases, gains) leaves 0.06231 step; the truth table over all 13 shifters (the MZM biases act as a coarse amplitude knob per lane) leaves 0.0566 with continuous phases (the state every other experiment uses; slightly optimistic) and a median of 0.06229 once the phases are quantised to the 12-bit DACs, as below:

| start | max deviation [steps] | passed | evaluations |
|---|---|---|---|
| mid-scale | 0.06961 | yes | 5,081 |
| random codes | 0.0696 | yes | 4,963 |
| mid-scale | 0.05669 | yes | 4,940 |
| random codes | 0.06229 | yes | 5,034 |
| mid-scale | 0.06212 | yes | 4,846 |
| random codes | 0.05834 | yes | 5,062 |
| mid-scale | 0.06391 | yes | 4,823 |
| random codes | 0.05711 | yes | 4,918 |
| mid-scale | 0.05737 | yes | 4,823 |
| random codes | 0.05678 | yes | 4,846 |
| mid-scale | 0.05688 | yes | 5,012 |
| random codes | 0.07275 | yes | 4,867 |
| mid-scale | 0.06396 | yes | 4,845 |
| random codes | 0.06968 | yes | 4,917 |
| mid-scale | 0.06969 | yes | 4,915 |
| random codes | 0.05683 | yes | 4,967 |

Phase-shifter recount (paper §II and Fig. 1d as quoted in the brief, which this work could not open; none sits inside the OFT). `heater.n_heaters` = 17 and `future.heaters_per_unit` = 18 are now tagged `inferred`: the text gives the groups, not the total.

| group | count | tag | source | on the data path | modelled as |
|---|---|---|---|---|---|
| input phase shifters (one after each MZM) | 4 | paper | paper §II, as quoted in the brief: a phase shifter after each MZM | yes | in0..in3 |
| monitor / perturbation shifters | 2 | paper | paper §II, as quoted in the brief: two on monitor channels | no | no (off the data path) |
| LO intensity MZI | 1–2 | paper | paper §II, as quoted in the brief: a slow MZI on the LO; 1 heater, or 2 if both arms are heated (push-pull) | yes | lo_mzi (one) |
| LO phase shifters | 4 | paper | paper §II, as quoted in the brief: four LO phase shifters | yes | lo0..lo3 |
| MZM quadrature-bias heaters | 4 | inferred | paper Fig. 1d, as quoted in the brief (not stated in the text) | yes | bias0..bias3 |
| forward-LO shifters | 0–2 | inferred | paper Fig. 1d, as quoted in the brief: possibly (not stated in the text) | yes | no (role not given) |

Total 15–18: `future.heaters_per_unit` = 18 is the upper end (a heater on each arm of the LO MZI and both forward-LO shifters) and `heater.n_heaters` = 17 one below it; v0.1-v0.4 modelled 17 of which 8 (cA, cB, m0, m1, m2, m3, cC, cD) belonged to the stand-in mesh. `future.heaters_per_unit` counts shifters outside the transform either way, so the future-chip hold power does not depend on the mesh.

Drift like for like (0.1 rad/√s per heater, 100,000-frame pilot, 600 s, 14 GBd; the slab's lanes raised by its insertion loss so the same power reaches the receivers):

| OFT | heaters drifting | availability | recalibrations | mean word error |
|---|---|---|---|---|
| mesh | 17 | 0.605 | 237 | 0.04092 |
| slab | 13 | 0.6917 | 185 | 0.01478 |

Temperature: the slab's phases scale with n_s, so dn/dT = 1.8e-4 /K gives a relative scale error of 6.316e-5 per kelvin, 2.232e-4 rad per kelvin at the DFT4 corner phase; the 0.01 rad per-stage budget is reached after 44.8 K.

Figure: `figures/e18_slab.png`; data: `web/e18_slab.json`.

## 19. Native transform size: N-point slab units

**Headline.** A larger native slab does not rescue exact mode: beyond 4 points an output of a DFT of bits takes values that are not integers (15 levels at N = 8, 91,552,734,375 at N = 64, gaps down to 4.447e-10 of a level step), so no N > 4 keeps the design margin at the 4-point unit's 10 dB reference power (N = 4: 10 dB), and mapping the outputs to Z_p costs up to 651 constant multiplies per 64-point transform (a naive count; joint decoding across the Galois-conjugate outputs is itself an N/2-point linear inverse in logic, O(N log N) at best); with free light and free crossings a 4096-point NTT still costs 43.78 pJ per radix-4 equivalent at the best N (4; 122.8 at N = 64) against 32.35 in the ASIC, and the bootstrap bound against the equal-logic ASIC is 1.1× at N = 4 and 0.4204× at N = 64. What the size does buy: 2 stages instead of 6 for a 4096-point FFT and 3× the radix-4 work per lane-symbol; the slab's efficiency hardly changes (0.6343 at 4 points, 0.622 at 64). In approximate mode a 4,096-point FFT chained through all its stages keeps 1.864 effective bits at N = 4 and 3.092 at N = 64 (best N = 64, 3.092), with crossings per butterfly-stage falling from 32 to 5.333 pJ.

The margin here is analytic (level step, smallest gap less the residual, Gaussian noise with signal shot noise) and uses the matrix fit of the chip's knobs; for N = 4 it is more cautious than the analogue chain of e14, which also refines the MZM biases on the truth table, so the fan-out column is for comparing sizes.

Equal lanes: U_N = 256 / N units (64 four-point units today), 4 λ, 112 GBd, 59-bit residues. Every N uses the default slab design (pitches, fills, excess loss, stray light and fabrication error) with R from the DFT condition. All illustrative.

The slab at each N:

| quantity | N = 4 | N = 8 | N = 16 | N = 32 | N = 64 |
|---|---|---|---|---|---|
| radius R [µm] | 33.91 | 69.18 | 139 | 278.4 | 556.9 |
| efficiency into the N outputs | 0.6343 | 0.6208 | 0.6219 | 0.6216 | 0.622 |
| insertion loss [dB] | 1.977 | 2.07 | 2.063 | 2.065 | 2.062 |
| input envelope [dB] | 2.289 | 3.249 | 3.831 | 4.15 | 4.235 |
| deviation, best diagonals | 0.02639 | 0.02842 | 0.03213 | 0.0342 | 0.03411 |
| residual with the chip's knobs (Frobenius) | 0.02756 | 0.02978 | 0.03339 | 0.0345 | 0.03429 |
| residual on decided outputs [steps] | 0.06231 | 0.1565 | 0.2624 | 1.217 | 2.614 |
| unit photonic area [mm²] | 0.2 | 0.4013 | 0.8063 | 1.626 | 3.307 |
| of which slab [mm²] | 4.069e-4 | 0.00166 | 0.006673 | 0.02672 | 0.1069 |
| phase shifters per unit | 18 | 30 | 54 | 102 | 198 |
| phase shifters on the chip | 1,152 | 960 | 864 | 816 | 792 |

Outputs for exact arithmetic (bits in; one quadrature per output; levels = distinct values; gap = smallest distance between two of them, in integer level steps). For N > 4 the coefficients cos(2πj/N) are irrational and independent, so distinct bit patterns rarely coincide: the decision must resolve every value. Gaps marked * are averages (an upper bound on the minimum) where the count is too large to enumerate:

| quantity | N = 4 | N = 8 | N = 16 | N = 32 | N = 64 |
|---|---|---|---|---|---|
| most levels on one output | 5 | 15 | 375 | 234,375 | 91,552,734,375 |
| decision bits (worst / mean) | 3 / 2.5 | 4 / 3.75 | 9 / 7.125 | 18 / 13.69 | 37 / 27.78 |
| smallest gap [steps] | 1 | 0.1213 | 0.006272 | 3.11e-7 | 4.447e-10* |
| SNR penalty of the gap [dB] | 0 | 18.32 | 44.05 | 130.1 | 187 |
| Z_p mapping: constant multiplies / adds | 1 / 4 | 7 / 12 | 35 / 44 | 155 / 172 | 651 / 684 |
| margin at the reference power [dB] (N = 4 set to 10) | 10 | −∞ | −∞ | −∞ | −∞ |
| exact mode keeps 6 dB | yes | no | no | no | no |
| lanes × λ one laser feeds at the design margin | 32 | 0 | 0 | 0 | 0 |
| lasers for the chip | 32 | ∞ | ∞ | ∞ | ∞ |

Exact 4,096-point NTT (59-bit, plain mixed radix), per radix-4 butterfly equivalent; logic 10 mm² (66 butterfly units) as e12's best point; bootstrap bound by Amdahl with the NTT share 0.6368 of the equal-logic ASIC there (sparse16), taking the NTT speed-up as if light and power were free (an upper bound; at N = 4 it is e12's exact-mode ceiling). The laser count follows each N's own margin (∞ when one laser cannot feed one unit, which makes the all-in figures ∞ or 0):

| quantity | N = 4 | N = 8 | N = 16 | N = 32 | N = 64 |
|---|---|---|---|---|---|
| stages (radices) | 6 (4·4·4·4·4·4) | 4 (8·8·8·8) | 3 (16·16·16) | 3 (32·32·4) | 2 (64·64) |
| crossing bits per transform | 4.35e6 | 4.592e6 | 5.891e6 | 8.066e6 | 1.391e7 |
| chip, all in [pJ] | 468.9 | ∞ | ∞ | ∞ | ∞ |
| free light [pJ] | 397.8 | 418.8 | 535.2 | 729.5 | 1255 |
| free light and crossings [pJ] | 43.78 | 45.12 | 55.8 | 73.14 | 122.8 |
| ASIC [pJ] | 32.35 | 32.35 | 32.35 | 32.35 | 32.35 |
| NTT speed-up vs equal-logic ASIC | 1.167 | 0 | 0 | 0 | 0 |
| NTT speed-up vs equal-silicon ASIC | 0.5099 | 0 | 0 | 0 | 0 |
| chip bound by | logic | power | power | power | power |
| same, if light and power were free: vs equal logic | 1.167 | 1.024 | 0.7619 | 0.5609 | 0.3159 |
| same, vs equal silicon | 0.5099 | 0.4477 | 0.3308 | 0.2436 | 0.1354 |
| bootstrap bound vs equal-logic ASIC (free power) | 1.1 | 1.015 | 0.834 | 0.6673 | 0.4204 |

Exact 65,536-point NTT (59-bit, plain mixed radix), per radix-4 butterfly equivalent; logic 10 mm² (66 butterfly units) as e12's best point; bootstrap bound by Amdahl with the NTT share 0.6368 of the equal-logic ASIC there (sparse16), taking the NTT speed-up as if light and power were free (an upper bound; at N = 4 it is e12's exact-mode ceiling). The laser count follows each N's own margin (∞ when one laser cannot feed one unit, which makes the all-in figures ∞ or 0):

| quantity | N = 4 | N = 8 | N = 16 | N = 32 | N = 64 |
|---|---|---|---|---|---|
| stages (radices) | 8 (4·4·4·4·4·4·4·4) | 6 (8·8·8·8·8·2) | 4 (16·16·16·16) | 4 (32·32·32·2) | 3 (64·64·16) |
| crossing bits per transform | 9.28e7 | 1.034e8 | 1.257e8 | 1.82e8 | 2.612e8 |
| chip, all in [pJ] | 468.9 | ∞ | ∞ | ∞ | ∞ |
| free light [pJ] | 397.8 | 440.4 | 535.2 | 771.7 | 1103 |
| free light and crossings [pJ] | 43.78 | 45.8 | 55.8 | 77.58 | 106.1 |
| ASIC [pJ] | 32.35 | 32.35 | 32.35 | 32.35 | 32.35 |
| NTT speed-up vs equal-logic ASIC | 1.167 | 0 | 0 | 0 | 0 |
| NTT speed-up vs equal-silicon ASIC | 0.5099 | 0 | 0 | 0 | 0 |
| chip bound by | logic | power | power | power | power |
| same, if light and power were free: vs equal logic | 1.167 | 1.023 | 0.7619 | 0.5243 | 0.3701 |
| same, vs equal silicon | 0.5099 | 0.4471 | 0.3308 | 0.2276 | 0.1586 |
| bootstrap bound vs equal-logic ASIC (free power) | 1.1 | 1.014 | 0.834 | 0.6338 | 0.4799 |

Approximate mode: a 4,096-point FFT on N-point slabs (8-bit converters, design SNR 31.15 dB, each stage the calibrated slab of its radix with its loss, 0.01 rad per stage); crossings in pJ per radix-4 butterfly-stage:

| quantity | N = 4 | N = 8 | N = 16 | N = 32 | N = 64 |
|---|---|---|---|---|---|
| radices | 4·4·4·4·4·4 | 8·8·8·8 | 16·16·16 | 32·32·4 | 64·64 |
| effective bits, S = 1 | 2.748 | 2.914 | 3.028 | 3.053 | 3.255 |
| effective bits, all stages chained | 1.864 | 2.246 | 2.605 | 2.71 | 3.092 |
| crossings, S = 1 [pJ] | 32 | 21.33 | 16 | 16 | 10.67 |
| crossings, all chained [pJ] | 5.333 | 5.333 | 5.333 | 5.333 | 5.333 |
| radix-4 butterflies per s (exact, equal lanes) | 4.617e11 | 6.925e11 | 9.233e11 | 1.154e12 | 1.385e12 |

WDM: worst channel's distance from DFT_N on one shared slab (centre calibration; the λ0 row is the slab's own residual):

| quantity | N = 4 | N = 8 | N = 16 | N = 32 | N = 64 |
|---|---|---|---|---|---|
| λ0 | 0.02756 | 0.02978 | 0.03339 | 0.0345 | 0.03429 |
| 4x200GHz | 0.02924 | 0.03163 | 0.03873 | 0.04908 | 0.07218 |
| 16x200GHz | 0.04077 | 0.05133 | 0.08559 | 0.1522 | 0.287 |

Not modelled: WO2026057669A1's own decomposition (not reachable here), any encoding that keeps N > 4 outputs integer (e.g. sparse inputs that use the slab as several 4-point transforms), and mutual coupling between closely spaced ports.

Figure: `figures/e19_native_size.png`; data: `web/e19_native_size.json`.

## Future-chip assumptions

Every parameter of the v0.3 future chip, its source tag and where it is swept. `public-statement` is what the developer has said in public about its next system; `illustrative` values are engineering inferences, not measurements.

| parameter | default | source | swept | meaning |
|---|---|---|---|---|
| `future.stacked` | yes | public-statement | 30 fF (stacked) vs 300 fF (packaged) receiver, e14 | photonic layer 3D-stacked on the logic (hybrid bonding), no package port between optics and logic |
| `future.units` | 64 | illustrative | 4–4,096 (e12, e13), 1–16,384 (e15) | U: 4-point optical transform units |
| `future.wavelengths` | 4 | illustrative | 1–8 (e12, e13, e14) | W: wavelengths sharing each unit's mesh |
| `future.baud_GBd` | 112 GBd | paper | 14–112 (e12, e14) | section V projection: 112 GBd PIC |
| `future.frontend_logic_GHz` | 28 GHz | paper | fixed | section V: 28 GHz logic; clocks the per-unit decision and bit-serial accumulators |
| `future.slot_efficiency` | 0.95 | illustrative | fixed | useful fraction of symbol slots (pipeline bubbles) |
| `future.heaters_per_unit` | 18 | inferred | fixed | phase shifters per 4-point unit today (paper Fig. 1d as quoted in the brief: 4 input, 2 monitor, 4 LO, 1-2 LO MZI, 4 MZM quadrature, 0-2 forward-LO = 15-18; 18 is the upper end, both LO MZI arms heated); all outside the OFT |
| `future.heaters_per_wavelength` | 8 | illustrative | fixed | extra tuners per unit per wavelength (4 modulator rings + 4 demux filters) |
| `future.conv_pJ_bit` | 0.5 pJ/bit | illustrative | 0.05–2 (e12, e13) | E_conv: one optical-electrical crossing, either direction |
| `future.conv_latency_ns` | 1 ns | illustrative | fixed | latency of one crossing |
| `future.out_bits_per_plane` | 2 bits | illustrative | fixed | decision bits per output per bit plane (PAM4 as today) |
| `future.recombine_pJ_plane` | 0.05 pJ | illustrative | fixed | bit-serial shift-add per output per plane |
| `future.mode` | exact | illustrative | fixed | exact (FHE) or approximate (FFT/AI) |
| `future.chain_stages` | 1 | illustrative | 1–6 (e16) | S: radix-4 stages chained optically (approximate mode only) |
| `future.stage_loss_dB` | 1 dB | illustrative | default and 3 (e16); on a slab the slab's insertion loss, with both alongside | optical loss per chained stage |
| `future.stage_phase_rms_rad` | 0.01 rad | illustrative | fixed | residual phase error per waveguide per chained stage |
| `future.unit_area_mm2` | 0.2 mm2 | illustrative | fixed | photonic area per unit |
| `future.wavelength_area_mm2` | 0.05 mm2 | illustrative | fixed | extra photonic area per unit per wavelength |
| `future.logic_area_mm2` | 100 mm2 | illustrative | 5–200 (e12); 10 in the compute-bound regime | stacked logic for modular arithmetic (twiddles, reduction, non-NTT kernels) |
| `future.power_cap_W` | 500 W | illustrative | fixed | chip power envelope (laser at the wall, heaters, conversions, logic) |
| `future.c_t_fF` | 30 fF | illustrative | vs future.c_t_pluggable_fF (e14) | receiver input capacitance, hybrid-bonded (tens of fF) |
| `future.c_t_pluggable_fF` | 300 fF | illustrative | fixed | receiver input capacitance, packaged (hundreds of fF) |
| `future.tia_gbw_THz` | 1 THz | illustrative | fixed | TIA amplifier gain-bandwidth A f_A |
| `future.tia_bw_ratio` | 0.7 x baud | illustrative | fixed | TIA 3 dB bandwidth |
| `future.tia_excess_noise` | 2 | illustrative | fixed | TIA noise power over the R_T thermal noise |
| `laser.power_dBm` | 20 dBm | illustrative | 13–27 (e14) | one external fibre-fed laser (all its wavelengths) |
| `laser.wall_plug` | 0.15 | illustrative | fixed | laser wall-plug efficiency |
| `laser.coupler_dB` | 1.5 dB | illustrative | fixed | fibre-to-chip coupler loss |
| `laser.split_excess_dB` | 0.1 dB | illustrative | fixed | excess loss per 1x2 splitter |
| `laser.prop_dB_cm` | 1 dB/cm | illustrative | fixed | waveguide propagation loss |
| `laser.mzm_il_dB` | 4 dB | illustrative | fixed | modulator insertion loss |
| `laser.wdm_dB` | 1.5 dB | illustrative | fixed | WDM mux + demux loss when W > 1 |
| `laser.margin_dB` | 6 dB | illustrative | 6 and 10 (e14) | design margin the laser must hold |
| `thermal.p_pi_mW` | 10 mW | illustrative | 2–30, MEMS and non-volatile (e14) | thermo-optic heater power per pi; silicon heaters are reported at about 2-30 mW (e.g. Harris et al., Opt. Express 22, 10487, 2014) |
| `thermal.settle_us` | 10 us | illustrative | fixed | thermo-optic settle time |
| `thermal.mems_p_pi_mW` | 0.001 mW | illustrative | fixed | MEMS phase shifter hold power |
| `thermal.mems_settle_us` | 5 us | illustrative | fixed | MEMS settle time |
| `thermal.nv_p_pi_mW` | 0 mW | illustrative | fixed | non-volatile trim hold power |
| `thermal.nv_settle_us` | 1000 us | illustrative | fixed | non-volatile write-and-verify time |
| `thermal.cal_dwell_us` | 10 us | illustrative | fixed | measurement dwell per calibration evaluation |
| `thermal.crosstalk_nn` | 0.1 | illustrative | 0–0.3 (e14) | thermal crosstalk to the nearest heater (phase ratio) |
| `thermal.crosstalk_length_um` | 30 um | illustrative | fixed | crosstalk decay length |
| `thermal.heater_pitch_um` | 50 um | illustrative | fixed | heater spacing |
| `thermal.dn_dT` | 1.8e-4 1/K | textbook | fixed | silicon thermo-optic coefficient |
| `thermal.wavelength_um` | 1.31 um | illustrative | fixed | optical wavelength |
| `thermal.heated_length_um` | 100 um | illustrative | fixed | phase-sensitive arm length |
| `thermal.logic_W_mm2` | 0.5 W/mm2 | illustrative | 0.1–4 (e14); 2 for storms (e15) | stacked logic heat flux, busy |
| `thermal.hotspot_W_mm2` | 2 W/mm2 | illustrative | fixed | heat flux of logic hot spots |
| `thermal.hotspot_fraction` | 0.1 | illustrative | fixed | share of the area in hot spots |
| `thermal.r_th_K_mm2_W` | 5 K mm2/W | illustrative | fixed | stack thermal resistance |
| `thermal.spread_mm` | 0.5 mm | illustrative | fixed | lateral heat-spreading length |
| `thermal.activity_interval_s` | 10 s | illustrative | fixed | mean time between busy/idle changes of the logic |
| `thermal.logic_drift_rad_sqrt_s` | 0.005 rad/sqrt(s) | illustrative | fixed | extra per-heater random walk from logic heat |
| `thermal.cal_parallelism` | 4 | illustrative | 1–64 (e15) | units the shared calibration controller serves at once |
| `asic.clock_GHz` | 1.5 GHz | illustrative | fixed | modular-arithmetic logic clock (both the all-digital ASIC and the stacked logic layer) |
| `asic.bfly_area_mm2` | 0.15 mm2 | illustrative | sets the equal-silicon ASIC; break-even area reported (e12) | radix-4 modular butterfly unit, 59-bit, same node |
| `asic.pJ_add32` | 0.1 pJ | textbook | fixed | 32-bit integer add, 45 nm (Horowitz 2014) |
| `asic.pJ_mul32` | 3.1 pJ | textbook | fixed | 32-bit integer multiply, 45 nm (Horowitz 2014) |
| `asic.node_scale` | 0.25 | illustrative | fixed | energy scaling 45 nm -> target node |
| `asic.modmul_muls` | 3 | illustrative | fixed | full multiplies per modular multiply (Barrett/Montgomery) |
| `asic.modadd_adds` | 2 | illustrative | fixed | adds per modular add (add + correct) |
| `asic.hbm_pJ_bit` | 3.9 pJ/bit | illustrative | fixed | HBM access energy (HBM2e class) |
| `control.drift_rad_sqrt_s` | 0.01 rad/sqrt(s) | illustrative | 0.01–0.1 (e15) | per-heater random walk |
| `fhe.residue_bits` | 59 bits | illustrative | 28–59 (e12, e13) | limb prime width; 59 as recorded (q_bits=59), swept 28-59 |
| `memory.hbm_GBps` | 819 GB/s | datasheet | 819–3276 and unconstrained (e12) | Alveo V80 HBM2e, AMD DS1013 v1.0 Table 1 |

## Wavelength-dependence assumptions

Every parameter of the v0.4 wavelength-dependence model (experiment 17), its source tag and where it is swept.

| parameter | default | source | swept | meaning |
|---|---|---|---|---|
| `wdm.lambda0_nm` | 1310 nm | illustrative | fixed | centre wavelength lambda0, O-band (the CW-WDM MSA defines O-band grids; its numbers are not used here) |
| `wdm.spacing_GHz` | 200 GHz | illustrative | 100–800 and a 20 nm grid, W = 1–32 (e17) | channel spacing of the default plan (W = future.wavelengths) |
| `wdm.band_nm` | 100 nm | textbook | fixed | O-band width (1260-1360 nm); wider plans are flagged |
| `wdm.ng_over_neff` | 1.7 | illustrative | 1–2.2 (e17) | n_g / n_eff of the mesh waveguides: a designed phase scales as phi0 (1 - (n_g/n_eff) delta) |
| `wdm.heater_phase_fraction` | 0.5 | illustrative | 0–1 (e17) | share of each nominal mesh phase that is heater-set and scales as phi0 (1 - delta); thermo-optic dispersion ignored |
| `wdm.path_mismatch_um` | 0 um | illustrative | 0–100 (e17) | extra length of the two lines that cross between the mesh stages (a1, b0) |
| `wdm.coupler_dkappa_per_pct` | 0 | illustrative | 0–0.3 (e17, reported separately) | fractional change of each directional coupler's power coupling per 1 % of delta |
| `wdm.ring_radius_um` | 5 um | illustrative | 3–20 (e17) | modulator and demux ring radius; FSR = lambda0^2 / (n_g 2 pi R) with n_g = receiver.group_index |
| `wdm.calibration` | least_squares | illustrative | centre and least_squares (e17) | shared-mesh heater calibration: centre or least_squares over the W channels |
| `wdm.output_trim` | no | illustrative | off and on at 16 and 32 channels on the default grid (e17) | per-channel output-phase trim (a diagonal phase per output port, set by per-channel LOs after the demux filters); off by default |
| `wdm.ref_margin_dB` | 10 dB | illustrative | fixed | ideal-transform margin of the reference receiver for the exact-mode span limit (about v0.1's worked example) |

## Slab assumptions

Every parameter of the v0.5 slab model (experiments 18 and 19), its source tag and where it is swept.

| parameter | default | source | swept | meaning |
|---|---|---|---|---|
| `oft.kind` | slab | paper | slab (default) and mesh (byte-identical v0.4, tested) | slab: a passive diffractive slab (paper section II, 'passive diffractive device'; EP4677399A1, a slab waveguide with input and output port arcs; both as quoted in the brief, not opened here); mesh: the MZI stand-in of v0.1-v0.4, kept as an alternative |
| `oft.fab_error_rms` | 0 | illustrative | fixed | mesh only: Hermitian generator scale for U error |
| `oft.n_slab` | 2.85 | illustrative | fixed; N = 4–64 sets R (e19) | slab effective index n_s near 1310 nm (a thin silicon slab) |
| `oft.ng_over_ns` | 1.3 | illustrative | 1–2 (e17) | slab group / effective index: the slab's phases scale as 1 - (n_g/n_s) delta with wavelength |
| `oft.pitch_in_um` | 2 um | illustrative | fixed | input port pitch p along the arc |
| `oft.pitch_out_um` | 2 um | illustrative | fixed | output port pitch q along the arc |
| `oft.fill_in` | 0.45 | illustrative | 0.15–0.45 (e18) | input port mode waist / pitch (Gaussian 1/e field half-width); wide inputs keep the far field on the output ports (efficiency) |
| `oft.fill_out` | 0.45 | illustrative | 0.15–0.45 (e18) | output port mode waist / pitch (a wider or tapered port raises it); wide outputs capture more of each focus but make the input envelope that oft.precomp cancels |
| `oft.precomp` | yes | illustrative | fixed | input envelope pre-compensated at design time by unequal splitter ratios ahead of the MZMs (lossless; an attenuator per input between chained stages); off: the envelope is a residual |
| `oft.dummies` | 0 | illustrative | 0–4 per side (e18) | dummy output ports per side, at the same pitch, routed to light sinks |
| `oft.excess_dB` | 0.5 dB | illustrative | fixed | slab excess loss beyond the mode overlap (scatter, propagation) |
| `oft.stray_dB` | -30 dB | illustrative | -60–-10 (e18) | stray light re-entering the output ports coherently, relative to the signal, with a fixed random phase per path |
| `oft.sigma_x_um` | 0.01 um | illustrative | 0–0.1 (e18), 0–0.05 (e3) | port position error (rms, per port) |
| `oft.sigma_w_um` | 0.01 um | illustrative | 0–0.1 (e18), 0–0.05 (e3) | port width error (rms, per port), taken as the mode-waist error |
| `oft.sigma_n_rel` | 5e-4 | illustrative | 0–0.005 (e18) | slab index error (rms, relative): a global phase-scale error |
| `oft.design_rule` | gaussian | illustrative | gaussian and point (e18) | DFT condition: gaussian (beta kappa p q = 2 pi / N, kappa for the finite port modes) or point (p q n_s / (lambda R) = 1 / N) |
| `oft.method` | paraxial | illustrative | paraxial and exact (e18) | paraxial (Gaussian overlap, closed form) or exact (exact path lengths, numerical) |
| `heater.n_heaters` | 17 | inferred | recounted (e18) | thermo-optic phase shifters, from the paper's Fig. 1d as quoted in the brief: 4 after the MZMs, 2 monitor/perturbation, 4 LO, 1-2 on the LO intensity MZI, 4 MZM quadrature, 0-2 forward-LO (15-18); none inside the OFT |
| `future.heaters_per_unit` | 18 | inferred | recounted (e18) | phase shifters per 4-point unit today (paper Fig. 1d as quoted in the brief: 4 input, 2 monitor, 4 LO, 1-2 LO MZI, 4 MZM quadrature, 0-2 forward-LO = 15-18; 18 is the upper end, both LO MZI arms heated); all outside the OFT |
