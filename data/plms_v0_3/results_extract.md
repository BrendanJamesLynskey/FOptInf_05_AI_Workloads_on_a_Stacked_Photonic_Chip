<!-- Extract of Photonic_Link_Module_Sim results/results.md at e3054d1 (plms 0.3.0): section 7 and sections 12-16 + future-chip assumptions. Do not edit; regenerate from the simulator. -->

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

Optical share of butterflies 0; static power 40.67 W (13 lasers); ceilings: NTT-free 1×, exact 1×.

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

Optical share of butterflies 0; static power 40.67 W (13 lasers); ceilings: NTT-free 1×, exact 1×.

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

**Headline.** A full-width (59-bit) 4-point transform costs 485.9 pJ on the stacked chip (U = 64, 4 λ, 112 GBd, E_conv 0.5 pJ/bit: crossings 354, phase shifters 69.31, laser 18.77, logic 31.98) against 32.35 pJ in the ASIC; the optics save only the modular adds, so even free light and crossings leave 43.78 pJ and break-even would need E_conv ≤ -0.1406 pJ/bit (none ≥ 0 exists); per bootstrap (sparse16) the chip uses 3.277 J vs 1.122 J for the ASIC (2.92×, HBM traffic 1.07 J of it) and 1.87× with every NTT through the optics (compute-bound).

Per transform the photonic chip runs at full utilisation, so its laser and phase-shifter power are charged to U × W × B / w transforms per second (4.617e11/s at the defaults, 13 lasers for the 6 dB design margin). A transform needs 708 crossings (4 × 59 bits in, 4 × 59 × 2 decision bits out). Digital energies at 59 bits: modular add 0.09219 pJ, modular multiply 7.904 pJ (Horowitz's 45 nm figures × 0.25).

| pJ per transform | stacked chip (thermo-optic) | stacked chip (MEMS) | ASIC |
|---|---|---|---|
| laser | 18.77 | 18.77 | 0 |
| phase_shifters | 69.31 | 0.006931 | 0 |
| conversions | 354 | 354 | 0 |
| recombination | 11.8 | 11.8 | 0 |
| logic | 31.98 | 31.98 | 32.35 |
| total | 485.9 | 416.6 | 32.35 |

Transform energy vs U (pJ, at the default E_conv):

| W \ U | 4 | 16 | 64 | 256 | 1024 | 4096 |
|---|---|---|---|---|---|---|
| 1 | 634.4 | 565.1 | 559.3 | 556.4 | 556.4 | 556.2 |
| 2 | 538.3 | 515.2 | 515.2 | 513 | 512.6 | 512.6 |
| 4 | 490.2 | 490.2 | 485.9 | 485.9 | 485.6 | 485.6 |
| 8 | 477.7 | 477.7 | 477.7 | 477.7 | 477.7 | 477.7 |

Transform energy vs E_conv and width:

| E_conv [pJ/bit] | stacked chip [pJ] |
|---|---|
| 0.05 | 167.3 |
| 0.1 | 202.7 |
| 0.25 | 308.9 |
| 0.5 | 485.9 |
| 1 | 839.9 |
| 2 | 1548 |

| width | stacked chip [pJ] | ASIC [pJ] |
|---|---|---|
| 28 | 222.7 | 7.47 |
| 36 | 288.9 | 12.22 |
| 44 | 356.3 | 18.13 |
| 59 | 485.9 | 32.35 |

Per bootstrap (J): default regime = v0.2 memory and 100 mm² of logic; compute-bound = unconstrained HBM and 10 mm² of logic. 'optimal' is experiment 12's split, which sends nothing through the optics when HBM binds, but the laser and phase shifters stay on.

### sparse16

| regime | design | time [ms] | logic | crossings | recombination | laser | phase shifters | HBM | total |
|---|---|---|---|---|---|---|---|---|---|
| default | photonic | 52.97 | 0.05252 | 0 | 0 | 0.4591 | 1.695 | 1.07 | 3.277 |
| default | photonic all optical | 52.99 | 0.05214 | 0.3634 | 0.01211 | 0.4592 | 1.696 | 1.07 | 3.652 |
| default | photonic mems | 52.97 | 0.05252 | 0 | 0 | 0.4591 | 1.695e-4 | 1.07 | 1.581 |
| default | asic logic | 52.97 | 0.05252 | 0 | 0 | 0 | 0 | 1.07 | 1.122 |
| default | asic silicon | 52.97 | 0.05252 | 0 | 0 | 0 | 0 | 1.07 | 1.122 |
| compute_bound | photonic | 14.8 | 0.05214 | 0.3634 | 0.01211 | 0.1282 | 0.4735 | 1.07 | 2.099 |
| compute_bound | photonic all optical | 14.8 | 0.05214 | 0.3634 | 0.01211 | 0.1282 | 0.4735 | 1.07 | 2.099 |
| compute_bound | photonic mems | 14.8 | 0.05214 | 0.3634 | 0.01211 | 0.1282 | 4.735e-5 | 1.07 | 1.626 |
| compute_bound | asic logic | 16.26 | 0.05252 | 0 | 0 | 0 | 0 | 1.07 | 1.122 |
| compute_bound | asic silicon | 4.996 | 0.05252 | 0 | 0 | 0 | 0 | 1.07 | 1.122 |

### full14

| regime | design | time [ms] | logic | crossings | recombination | laser | phase shifters | HBM | total |
|---|---|---|---|---|---|---|---|---|---|
| default | photonic | 70.51 | 0.04594 | 0 | 0 | 0.6111 | 2.256 | 1.416 | 4.329 |
| default | photonic all optical | 70.53 | 0.04568 | 0.2434 | 0.008115 | 0.6113 | 2.257 | 1.416 | 4.581 |
| default | photonic mems | 70.51 | 0.04594 | 0 | 0 | 0.6111 | 2.256e-4 | 1.416 | 2.073 |
| default | asic logic | 70.51 | 0.04594 | 0 | 0 | 0 | 0 | 1.416 | 1.462 |
| default | asic silicon | 70.51 | 0.04594 | 0 | 0 | 0 | 0 | 1.416 | 1.462 |
| compute_bound | photonic | 13.67 | 0.04568 | 0.2434 | 0.008115 | 0.1185 | 0.4376 | 1.416 | 2.269 |
| compute_bound | photonic all optical | 13.67 | 0.04568 | 0.2434 | 0.008115 | 0.1185 | 0.4376 | 1.416 | 2.269 |
| compute_bound | photonic mems | 13.67 | 0.04568 | 0.2434 | 0.008115 | 0.1185 | 4.376e-5 | 1.416 | 1.832 |
| compute_bound | asic logic | 14.64 | 0.04594 | 0 | 0 | 0 | 0 | 1.416 | 1.462 |
| compute_bound | asic silicon | 4.979 | 0.04594 | 0 | 0 | 0 | 0 | 1.416 | 1.462 |

Where photonics wins and loses: the optics replace the cheapest part of a butterfly (modular adds, a few % of its energy, against multiplies that scale with width squared) and pay for it per bit plane in crossings and bit-serial recombination, plus static laser and phase-shifter power. In exact mode it loses on energy at every swept point; experiment 16 looks at approximate mode, where an operand is one symbol.

Figure: `figures/e13_energy.png`; data: `web/e13_energy.json`.

## 14. Future chip: laser and thermal limits

**Headline.** One 20 dBm laser feeds at most U × W = 20 (4 λ) or 26 (1 λ) at a 6 dB margin and 8 or 12 at 10 dB, at 112 GBd with a 30 fF receiver (R_T ≤ 863.1 Ω, 1.422 µA rms; 4.495 at 300 fF); thermo-optic phase shifters at 10 mW/π hold 0.5 W per unit (1.25 W/mm²), so they alone reach the 500 W cap at U = 1000; an idle-to-busy step of the logic (0.5 W/mm²) spans 3.192 K across U = 64 and moves heater phases by up to 0.05947 rad, pushing 0 of units past the error target (first at 2 W/mm²).

Laser path: coupler, WDM (W > 1), a binary splitter tree with excess loss per stage, propagation across the photonic layer, modulator insertion loss; the signal/LO split is optimised per point. Margin = how far every noise term can grow before the worst output reaches the SER target (as in experiment 2), with the TIA noise from the transimpedance limit R_T ≤ A·f_A / (2π C_T f_3dB²).

| B [GBd] | R_T stacked [Ω] | noise stacked [µA] | R_T packaged [Ω] | noise packaged [µA] | deserialise to 28 GHz logic |
|---|---|---|---|---|---|
| 14 | 55239 | 0.06283 | 5524 | 0.1987 | 1 |
| 56 | 3452 | 0.5026 | 345.2 | 1.589 | 2 |
| 112 | 863.1 | 1.422 | 86.31 | 4.495 | 4 |

| U | margin [dB] | signal share | p_max [µW] | LO per pair [µW] |
|---|---|---|---|---|
| 1 | 14.37 | 0.5 | 573.5 | 1441 |
| 2 | 11.06 | 0.5 | 278.5 | 699.6 |
| 4 | 7.425 | 0.5 | 134.9 | 339 |
| 8 | 3.323 | 0.5 | 65.14 | 163.6 |
| 16 | -1.379 | 0.5 | 31.29 | 78.6 |
| 32 | -6.715 | 0.5 | 14.93 | 37.49 |
| 64 | -12.6 | 0.5 | 7.048 | 17.7 |

Largest U × W per 20 dBm laser:

| margin [dB] | W | B [GBd] | max U | max U × W |
|---|---|---|---|---|
| 6 | 1 | 14 | 233 | 233 |
| 6 | 1 | 56 | 57 | 57 |
| 6 | 1 | 112 | 26 | 26 |
| 6 | 4 | 14 | 46 | 184 |
| 6 | 4 | 56 | 11 | 44 |
| 6 | 4 | 112 | 5 | 20 |
| 6 | 8 | 14 | 24 | 192 |
| 6 | 8 | 56 | 5 | 40 |
| 6 | 8 | 112 | 2 | 16 |
| 10 | 1 | 14 | 104 | 104 |
| 10 | 1 | 56 | 26 | 26 |
| 10 | 1 | 112 | 12 | 12 |
| 10 | 4 | 14 | 20 | 80 |
| 10 | 4 | 56 | 5 | 20 |
| 10 | 4 | 112 | 2 | 8 |
| 10 | 8 | 14 | 10 | 80 |
| 10 | 8 | 56 | 2 | 16 |
| 10 | 8 | 112 | 1 | 8 |

| laser [dBm] | max U×W at 6 dB | max U×W at 10 dB |
|---|---|---|
| 13 | 4 | 0 |
| 17 | 8 | 4 |
| 20 | 20 | 8 |
| 23 | 36 | 16 |
| 27 | 92 | 44 |

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
| 16 | 2.53 | 3.322 | 0.01338 | 0.04872 | 0 |
| 64 | 5.06 | 3.192 | 0.01407 | 0.05947 | 0 |
| 256 | 10.12 | 3.255 | 0.01337 | 0.07563 | 0 |
| 1024 | 20.24 | 4.481 | 0.01431 | 0.08558 | 0 |
| 4096 | 40.48 | 4.239 | 0.01359 | 0.08143 | 0 |

| logic flux [W/mm²] | ΔT range [K] | rms phase error [rad] | max [rad] | units past target |
|---|---|---|---|---|
| 0.1 | 0.5691 | 0.003411 | 0.01214 | 0 |
| 0.25 | 1.423 | 0.008528 | 0.03034 | 0 |
| 0.5 | 2.846 | 0.01706 | 0.06068 | 0 |
| 1 | 5.691 | 0.03411 | 0.1214 | 0 |
| 2 | 11.38 | 0.06823 | 0.2427 | 0.09375 |
| 4 | 22.76 | 0.1365 | 0.4854 | 0.625 |

Thermal crosstalk: residual of an ordered calibration that ignores it (Gauss-Seidel on (I + K) h = θ; v0.1's joint refinement would remove it at the cost of more evaluations):

| k_nn | rms after 1 sweep [rad] | units past target | rms after 3 [rad] | units past target | spectral radius of K |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |
| 0.05 | 0.02041 | 0 | 1.468e-4 | 0 | 0.2646 |
| 0.1 | 0.03818 | 0 | 8.615e-4 | 0 | 0.5291 |
| 0.2 | 0.07598 | 0.1719 | 0.005727 | 0 | 1.058 |
| 0.3 | 0.1008 | 0.4688 | 0.01543 | 0 | 1.587 |

Figure: `figures/e14_laser_thermal.png`; data: `web/e14_laser_thermal.json`.

## 15. Future chip: calibration scaling

**Headline.** With per-unit tracking and recalibration from v0.1 (which the model reproduces exactly at U = 1: availability 0.6483 vs 0.6483 at 0.1 rad/√s and a 100,000-frame pilot), a controller serving 4 units at once keeps ≥ 0.9 of units in service up to U = 16,384+ at 0.01 rad/√s, U = 1,024 at 0.03 rad/√s, U = 256 at 0.1 rad/√s of per-heater drift; start-up calibration takes 4096 s for U = 16,384; logic-heat storms (hot logic at 2 W/mm² hits 0.0625 of units every 10 s) cost at most 0.099 of in-service fraction (0.9821 → 0.8831 at U = 64, P = 1).

Recalibration takes 1 s (v0.1's illustrative figure for thermo-optic heaters; MEMS 0.75 s and non-volatile 50.5 s, scaled by settle + dwell per evaluation). Each unit gets P/U of the pilot updates; logic heat adds 0.005 rad/√s per heater. Failure rates come from 600 s of the v0.1 loop per point ('0' = none seen).

| drift [rad/√s] | dilution ⌈U/P⌉ | recalibrations | λ [1/s] |
|---|---|---|---|
| 0.01 | 1 | 0 | 0 |
| 0.01 | 4 | 0 | 0 |
| 0.01 | 16 | 0 | 0 |
| 0.01 | 64 | 0 | 0 |
| 0.01 | 256 | 0 | 0 |
| 0.01 | 1,024 | 0 | 0 |
| 0.01 | 4,096 | 0 | 0 |
| 0.01 | 16,384 | 7 | 0.0118 |
| 0.03 | 1 | 0 | 0 |
| 0.03 | 4 | 0 | 0 |
| 0.03 | 16 | 0 | 0 |
| 0.03 | 64 | 0 | 0 |
| 0.03 | 256 | 0 | 0 |
| 0.03 | 1,024 | 22 | 0.03806 |
| 0.03 | 4,096 | 47 | 0.08499 |
| 0.03 | 16,384 | 64 | 0.1194 |
| 0.1 | 1 | 0 | 0 |
| 0.1 | 4 | 0 | 0 |
| 0.1 | 16 | 0 | 0 |
| 0.1 | 64 | 6 | 0.0101 |
| 0.1 | 256 | 23 | 0.6216 |
| 0.1 | 1,024 | 34 | 1.283 |
| 0.1 | 4,096 | 33 | 1.222 |
| 0.1 | 16,384 | 34 | 1.283 |

Fraction of units in service (M/M/P//U):

Drift 0.01 rad/√s:

| P \ U | 1 | 4 | 16 | 64 | 256 | 1,024 | 4,096 | 16,384 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0.005171 |
| 4 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 16 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 64 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

Drift 0.03 rad/√s:

| P \ U | 1 | 4 | 16 | 64 | 256 | 1,024 | 4,096 | 16,384 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | 1 | 0.02566 | 0.002873 | 5.112e-4 |
| 4 | 1 | 1 | 1 | 1 | 1 | 1 | 0.02566 | 0.002873 |
| 16 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0.02566 |
| 64 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

Drift 0.1 rad/√s:

| P \ U | 1 | 4 | 16 | 64 | 256 | 1,024 | 4,096 | 16,384 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 0.975 | 0.006284 | 7.611e-4 | 1.998e-4 | 4.757e-5 |
| 4 | 1 | 1 | 1 | 1 | 0.9878 | 0.006284 | 7.611e-4 | 1.998e-4 |
| 16 | 1 | 1 | 1 | 1 | 1 | 0.9899 | 0.006284 | 7.611e-4 |
| 64 | 1 | 1 | 1 | 1 | 1 | 1 | 0.99 | 0.006284 |

Smallest swept U with less than 0.9 of units in service ('—' = none):

| drift [rad/√s] | P = 1 | P = 4 | P = 16 | P = 64 |
|---|---|---|---|---|
| 0.01 | 16,384 | — | — | — |
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
| 4 | 1 | 0 | 1 | 1 | 0.9933 | 9,729 | 3 |
| 4 | 64 | 0 | 1 | 1 | 0.9936 | 10,041 | 1 |
| 16 | 1 | 0 | 1 | 1 | 0.9904 | 10,087 | 8 |
| 16 | 64 | 0 | 1 | 1 | 0.9939 | 9,830 | 1 |
| 64 | 1 | 0.0101 | 0.975 | 0.9821 | 0.8831 | 9,598 | 33 |
| 64 | 64 | 0 | 1 | 1 | 0.9938 | 9,992 | 1 |
| 256 | 1 | 0.6216 | 0.006284 | 0.006533 | 0.00638 | 110 | 256 |
| 256 | 64 | 0 | 1 | 1 | 0.9938 | 6,289 | 1 |
| 1,024 | 1 | 1.283 | 7.611e-4 | 7.606e-4 | 7.525e-4 | 545 | 1,024 |
| 1,024 | 64 | 0 | 1 | 1 | 0.993 | 1,585 | 144 |
| 4,096 | 1 | 1.222 | 1.998e-4 | 2.015e-4 | 2.02e-4 | 2,042 | 4,096 |
| 4,096 | 64 | 0.0101 | 0.99 | 0.99 | 0.9134 | 146 | 1,383 |
| 16,384 | 1 | 1.283 | 4.757e-5 | 4.76e-5 | 4.739e-5 | 8,182 | 16,384 |
| 16,384 | 64 | 0.6216 | 0.006284 | 0.006269 | 0.006178 | 129 | 16,273 |

Figure: `figures/e15_calibration_scaling.png`; data: `web/e15_calibration_scaling.json`.

## 16. Future chip: approximate mode

**Headline.** Chaining S of the 6 radix-4 stages of a 4,096-point FFT optically, with 8-bit converters at the design SNR (27.47 dB per level step) and 1 dB per stage, the output keeps 2.74 effective bits at S = 1 and 3.198 at S = 6 (fewer conversions add less noise; at 3 dB per stage 2.445 → 1.268); energy per butterfly-stage falls from 34.11 to 6.929 pJ (4.923×) and throughput rises 1.934× (power-limited at S = 1), 59× the exact-mode rate, but a digital butterfly at matched precision costs 0.2141 pJ.

Monte Carlo: 4 complex Gaussian vectors per point against a float64 radix-4 FFT (validated against numpy's to 1.933e-13). Each chained block: DAC (ENOB bits, ±4 rms) → S unitary stages with loss and 0.01 rad rms phase error per waveguide → receiver noise at the design SNR less the block's loss → ADC → digital rescale. Effective bits = (SNR − 1.76)/6.02 of the whole FFT's relative error. The design SNR is one level step over σ at the receiver when one laser feeds as many units as the 6 dB margin allows.

| S \ ENOB | 4 | 6 | 8 | 10 | 12 | 16 |
|---|---|---|---|---|---|---|
| 1 | 0.8688 | 2.406 | 2.74 | 2.777 | 2.774 | 2.78 |
| 2 | 1.362 | 2.762 | 3.061 | 3.092 | 3.098 | 3.099 |
| 3 | 1.588 | 2.918 | 3.187 | 3.208 | 3.204 | 3.215 |
| 4 | 1.582 | 2.897 | 3.167 | 3.199 | 3.185 | 3.18 |
| 5 | 1.518 | 2.881 | 3.125 | 3.138 | 3.149 | 3.135 |
| 6 | 1.858 | 2.999 | 3.198 | 3.219 | 3.21 | 3.22 |

Effective bits vs receiver SNR (16-bit converters):

| S \ SNR [dB] | 20 | 27.47 | 30 | 40 |
|---|---|---|---|---|
| 1 | 1.556 | 2.767 | 3.169 | 4.456 |
| 2 | 1.884 | 3.091 | 3.478 | 4.638 |
| 3 | 2.009 | 3.212 | 3.591 | 4.671 |
| 4 | 2.001 | 3.199 | 3.579 | 4.672 |
| 5 | 1.94 | 3.146 | 3.538 | 4.657 |
| 6 | 2.023 | 3.22 | 3.603 | 4.691 |

Energy (pJ per butterfly-stage, 8-bit converters, U = 64, 4 λ, 112 GBd) and throughput:

| S | crossings | boundary twiddles | laser | phase shifters | total | energy gain | butterfly-stages/s | limit | throughput gain | effective bits | digital at matched bits [pJ] |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 32 | 0.6188 | 0.3182 | 1.175 | 34.11 | 1 | 1.408e13 | power | 1 | 2.74 | 0.1333 |
| 2 | 16 | 0.3094 | 0.3182 | 1.175 | 17.8 | 1.916 | 2.724e13 | optics | 1.934 | 3.061 | 0.2141 |
| 3 | 10.67 | 0.2062 | 0.3182 | 1.175 | 12.37 | 2.759 | 2.724e13 | optics | 1.934 | 3.187 | 0.2141 |
| 4 | 8 | 0.1547 | 0.3182 | 1.175 | 9.648 | 3.536 | 2.724e13 | optics | 1.934 | 3.167 | 0.2141 |
| 5 | 6.4 | 0.1237 | 0.3182 | 1.175 | 8.017 | 4.255 | 2.724e13 | optics | 1.934 | 3.125 | 0.2141 |
| 6 | 5.333 | 0.1031 | 0.3182 | 1.175 | 6.929 | 4.923 | 2.724e13 | optics | 1.934 | 3.198 | 0.2141 |

For reference, exact mode delivers 4.617e11 full-width (59-bit) butterflies/s on the same units: approximate mode carries one operand per symbol instead of one bit plane. The digital 8-bit complex butterfly costs 0.7188 pJ (12 multiplies, 22 adds). The best precision here is at S = 6.

Figure: `figures/e16_approximate.png`; data: `web/e16_approximate.json`.

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
| `future.heaters_per_unit` | 18 | patent | fixed | phase shifters per 4-point unit today |
| `future.heaters_per_wavelength` | 8 | illustrative | fixed | extra tuners per unit per wavelength (4 modulator rings + 4 demux filters) |
| `future.conv_pJ_bit` | 0.5 pJ/bit | illustrative | 0.05–2 (e12, e13) | E_conv: one optical-electrical crossing, either direction |
| `future.conv_latency_ns` | 1 ns | illustrative | fixed | latency of one crossing |
| `future.out_bits_per_plane` | 2 bits | illustrative | fixed | decision bits per output per bit plane (PAM4 as today) |
| `future.recombine_pJ_plane` | 0.05 pJ | illustrative | fixed | bit-serial shift-add per output per plane |
| `future.mode` | exact | illustrative | fixed | exact (FHE) or approximate (FFT/AI) |
| `future.chain_stages` | 1 | illustrative | 1–6 (e16) | S: radix-4 stages chained optically (approximate mode only) |
| `future.stage_loss_dB` | 1 dB | illustrative | default and 3 (e16) | optical loss per chained stage |
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

