<!-- Extract of Photonic_Link_Module_Sim results/results.md at fe2ee0a (plms 0.4.0): section 17 + wavelength-dependence assumptions. Sections 7 and 12-16 and the e7/e12-e16 web JSON are unchanged from v0.3 apart from config hash and schema version, so data/plms_v0_3/ stays as vendored. Do not edit; regenerate from the simulator. -->

## 17. Future chip: wavelength-dependent transform error

**Headline.** One shared mesh for 16 channels at 200 GHz around 1310 nm (plan span 18.32 nm, edge δ = 0.006555) leaves the worst channel 0.01558 off DFT4 (normalised Frobenius; centre 0.01554, least squares no better: mean 0.008288 vs 0.008288). Exact mode hardly notices: it costs 0.04545 dB, and the worst channel keeps the 6 dB design margin (from a 10 dB reference) out to ±81.72 nm (largest swept plan inside the O-band 4 × 20 nm, 80 nm), so 5 µm rings bind first (FSR 14.01 nm: at most 8 swept channels at 200 GHz, 9.159 nm). Compute is where it shows: per stage the wavelength error passes the 0.01 rad random phase error beyond ±5.525 nm (10.65 channels at 200 GHz), over a whole chained FFT from 8 channels (S = 1); precision-limited (60 dB SNR, 16-bit converters) the worst of 32 channels keeps 2.901 effective bits against 5.055 (S = 6); at the design SNR with 8-bit converters the worst of 32 keeps 2.558 bits at S = 6 (v0.3, one channel: 3.198), and at 4 λ 2.731 and 3.19 at S = 1 and 6 (v0.3 2.74 and 3.198). One laser still feeds U × W = 20 at 4 λ and 6 dB (v0.3: 20); a mesh per wavelength removes the error but at 4 λ and U = 64 takes 64 mm² and 66.56 W of heaters against 25.6 mm² and 32 W shared. The signal/LO path is the tighter tolerance: an unmatched 1 mm path rotates the edge channel of 16 × 200 GHz by 122.6 rad, and keeping that rotation to the 0.01 rad per-stage phase error needs the paths matched to 0.08156 µm, or the LO trimmed per channel; such a per-channel output trim cuts the worst error at 16 × 200 GHz from 0.01558 to 0.01102.

Model (`plms.wdm`): channel i sits at δ_i = (i − (W−1)/2) Δλ/λ0, Δλ = λ0² Δf / c. Each nominal mesh phase φ0 (the MZI internal π/2, the −π/2 twiddle on b1) is 0.5 heater-set, scaling as φ0 (1 − δ), and the rest designed in, scaling as φ0 (1 − (n_g/n_eff) δ) with n_g/n_eff = 1.7: a combined slope of 1.35. Calibration corrections are heater-set. Error = ‖U(λ) − DFT4‖_F / ‖DFT4‖_F; worst output = max_k Σ_n |U − DFT4|_kn for unit-magnitude inputs (full scale 2). Margin: the noise headroom to the SER target on the worst output (as e2/e14) through v0.3's stacked receiver at 112 GBd, at a reference receiver (p_max 223.6 µW, LO 561.7 µW per pair) where the ideal transform has 10 dB; a channel keeps the design margin if it still has 6 dB. The reference receiver is fixed, so this limit is the transform error's alone; how the laser's power, shared over W channels, couples in is covered by the restatement of e14 below. Ring FSR = λ0²/(n_g 2πR) = 14.01 nm at R = 5 µm; a plan fits if W·Δλ ≤ FSR. Plans wider than the 100 nm O-band are outside the first-order model's comfort zone and are flagged.

Check against the brief's first-order estimate: 16 × 200 GHz spans 18.32 nm (edge δ = 0.006555); a designed phase of π errs by 0.03501 rad at the band edge. The mesh's own nominal phases are π/2, and part heater-set, so its errors are smaller.

Worst channel per plan (centre / least-squares calibration):

| grid | W | span [nm] | edge δ | ring fits | in band | error centre | error LSQ | mean centre | mean LSQ | worst output LSQ | margin centre [dB] | margin LSQ [dB] | SER LSQ (worst) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 100 GHz | 1 | 0.5724 | 0 | yes | yes | 0 | 0 | 0 | 0 | 0 | 10 | 10 | 1.729e-48 |
| 100 GHz | 2 | 1.145 | 2.185e-4 | yes | yes | 5.18e-4 | 5.181e-4 | 5.18e-4 | 5.18e-4 | 0.001119 | 10 | 10 | 1.744e-48 |
| 100 GHz | 4 | 2.29 | 6.555e-4 | yes | yes | 0.001554 | 0.001555 | 0.001036 | 0.001036 | 0.003357 | 10 | 10 | 1.874e-48 |
| 100 GHz | 8 | 4.579 | 0.001529 | yes | yes | 0.003626 | 0.003628 | 0.002072 | 0.002072 | 0.007835 | 9.998 | 9.998 | 2.623e-48 |
| 100 GHz | 16 | 9.159 | 0.003277 | yes | yes | 0.00777 | 0.00778 | 0.004144 | 0.004144 | 0.0168 | 9.989 | 9.989 | 8.548e-48 |
| 100 GHz | 32 | 18.32 | 0.006773 | **no** | yes | 0.01606 | 0.0161 | 0.008288 | 0.008288 | 0.03476 | 9.952 | 9.952 | 1.761e-46 |
| 200 GHz | 1 | 1.145 | 0 | yes | yes | 0 | 0 | 0 | 0 | 0 | 10 | 10 | 1.729e-48 |
| 200 GHz | 2 | 2.29 | 4.37e-4 | yes | yes | 0.001036 | 0.001036 | 0.001036 | 0.001036 | 0.002238 | 10 | 10 | 1.792e-48 |
| 200 GHz | 4 | 4.579 | 0.001311 | yes | yes | 0.003108 | 0.00311 | 0.002072 | 0.002072 | 0.006716 | 9.998 | 9.998 | 2.361e-48 |
| 200 GHz | 8 | 9.159 | 0.003059 | yes | yes | 0.007252 | 0.007261 | 0.004144 | 0.004144 | 0.01568 | 9.99 | 9.99 | 7.21e-48 |
| 200 GHz | 16 | 18.32 | 0.006555 | **no** | yes | 0.01554 | 0.01558 | 0.008288 | 0.008288 | 0.03364 | 9.955 | 9.955 | 1.448e-46 |
| 200 GHz | 32 | 36.64 | 0.01355 | **no** | yes | 0.03211 | 0.03227 | 0.01658 | 0.01657 | 0.06967 | 9.814 | 9.813 | 9.25e-44 |
| 400 GHz | 1 | 2.29 | 0 | yes | yes | 0 | 0 | 0 | 0 | 0 | 10 | 10 | 1.729e-48 |
| 400 GHz | 2 | 4.579 | 8.739e-4 | yes | yes | 0.002072 | 0.002074 | 0.002072 | 0.002072 | 0.004478 | 9.999 | 9.999 | 1.993e-48 |
| 400 GHz | 4 | 9.159 | 0.002622 | yes | yes | 0.006216 | 0.006225 | 0.004144 | 0.004144 | 0.01344 | 9.993 | 9.993 | 5.206e-48 |
| 400 GHz | 8 | 18.32 | 0.006118 | **no** | yes | 0.0145 | 0.01454 | 0.008288 | 0.008288 | 0.0314 | 9.961 | 9.96 | 9.798e-47 |
| 400 GHz | 16 | 36.64 | 0.01311 | **no** | yes | 0.03108 | 0.03123 | 0.01658 | 0.01657 | 0.06743 | 9.826 | 9.824 | 6.15e-44 |
| 400 GHz | 32 | 73.27 | 0.02709 | **no** | yes | 0.06421 | 0.06481 | 0.03315 | 0.03314 | 0.1399 | 9.338 | 9.327 | 4.838e-38 |
| 800 GHz | 1 | 4.579 | 0 | yes | yes | 0 | 0 | 0 | 0 | 0 | 10 | 10 | 1.729e-48 |
| 800 GHz | 2 | 9.159 | 0.001748 | yes | yes | 0.004144 | 0.004151 | 0.004144 | 0.004144 | 0.008964 | 9.997 | 9.997 | 2.953e-48 |
| 800 GHz | 4 | 18.32 | 0.005244 | **no** | yes | 0.01243 | 0.01247 | 0.008288 | 0.008288 | 0.02692 | 9.971 | 9.971 | 4.521e-47 |
| 800 GHz | 8 | 36.64 | 0.01224 | **no** | yes | 0.02901 | 0.02916 | 0.01658 | 0.01657 | 0.06296 | 9.847 | 9.846 | 2.725e-44 |
| 800 GHz | 16 | 73.27 | 0.02622 | **no** | yes | 0.06214 | 0.06274 | 0.03315 | 0.03314 | 0.1355 | 9.375 | 9.364 | 2.058e-38 |
| 800 GHz | 32 | 146.5 | 0.05418 | **no** | **no** | 0.1283 | 0.1306 | 0.06625 | 0.06618 | 0.2819 | 7.263 | 7.161 | 5.65e-24 |
| 20 nm | 1 | 20 | 0 | yes | yes | 0 | 0 | 0 | 0 | 0 | 10 | 10 | 1.729e-48 |
| 20 nm | 2 | 40 | 0.007634 | **no** | yes | 0.0181 | 0.01823 | 0.0181 | 0.0181 | 0.03937 | 9.939 | 9.938 | 3.973e-46 |
| 20 nm | 4 | 80 | 0.0229 | **no** | yes | 0.05428 | 0.05495 | 0.03619 | 0.03618 | 0.1187 | 9.509 | 9.498 | 8.439e-40 |
| 20 nm | 8 | 160 | 0.05344 | **no** | **no** | 0.1265 | 0.1292 | 0.07232 | 0.07224 | 0.2789 | 7.368 | 7.246 | 2.074e-24 |
| 20 nm | 16 | 320 | 0.1145 | **no** | **no** | 0.2696 | 0.2799 | 0.1442 | 0.1435 | 0.6031 | −∞ | −∞ | 0.09283 |
| 20 nm | 32 | 640 | 0.2366 | **no** | **no** | 0.5448 | 0.5784 | 0.2851 | 0.2812 | 1.238 | −∞ | −∞ | 0.4366 |

Per channel, 16 × 200 GHz (does not fit one ring FSR):

| offset [nm] | error centre | error LSQ | worst output LSQ | margin LSQ [dB] | SER LSQ |
|---|---|---|---|---|---|
| -8.586 | 0.01554 | 0.0155 | 0.03347 | 9.955 | 1.406e-46 |
| -7.442 | 0.01347 | 0.01343 | 0.029 | 9.966 | 6.461e-47 |
| -6.297 | 0.0114 | 0.01136 | 0.02452 | 9.976 | 3.006e-47 |
| -5.152 | 0.009324 | 0.009285 | 0.02005 | 9.984 | 1.431e-47 |
| -4.007 | 0.007252 | 0.007213 | 0.01558 | 9.99 | 7.099e-48 |
| -2.862 | 0.00518 | 0.005141 | 0.0111 | 9.995 | 3.807e-48 |
| -1.717 | 0.003108 | 0.003069 | 0.006628 | 9.998 | 2.342e-48 |
| -0.5724 | 0.001036 | 9.975e-4 | 0.002154 | 10 | 1.788e-48 |
| 0.5724 | 0.001036 | 0.001074 | 0.00232 | 10 | 1.797e-48 |
| 1.717 | 0.003108 | 0.003146 | 0.006794 | 9.998 | 2.377e-48 |
| 2.862 | 0.00518 | 0.005218 | 0.01127 | 9.995 | 3.888e-48 |
| 4.007 | 0.007252 | 0.00729 | 0.01574 | 9.99 | 7.278e-48 |
| 5.152 | 0.009324 | 0.009362 | 0.02022 | 9.983 | 1.47e-47 |
| 6.297 | 0.0114 | 0.01143 | 0.02469 | 9.975 | 3.092e-47 |
| 7.442 | 0.01347 | 0.01351 | 0.02916 | 9.966 | 6.649e-47 |
| 8.586 | 0.01554 | 0.01558 | 0.03364 | 9.955 | 1.448e-46 |

Least squares over the channels barely moves the heaters (largest correction 3.442e-5 rad here): on a grid symmetric about λ0 the first-order errors cancel in the mean, so the centre setting is already the least-squares optimum to first order. The error is a deterministic tilt across the band that one set of heaters cannot remove.

Exact mode, largest swept W inside the O-band whose worst channel keeps 6 dB (continuous limit, centre calibration: channels within ±81.72 nm, edge δ = 0.06238):

| grid, calibration | max W | span [nm] | ring fits | max W that also fits the ring | span [nm] |
|---|---|---|---|---|---|
| 100 GHz, centre | 32 | 18.32 | **no** | 16 | 9.159 |
| 100 GHz, least squares | 32 | 18.32 | **no** | 16 | 9.159 |
| 200 GHz, centre | 32 | 36.64 | **no** | 8 | 9.159 |
| 200 GHz, least squares | 32 | 36.64 | **no** | 8 | 9.159 |
| 400 GHz, centre | 32 | 73.27 | **no** | 4 | 9.159 |
| 400 GHz, least squares | 32 | 73.27 | **no** | 4 | 9.159 |
| 800 GHz, centre | 16 | 73.27 | **no** | 2 | 9.159 |
| 800 GHz, least squares | 16 | 73.27 | **no** | 2 | 9.159 |
| 20 nm, centre | 4 | 80 | **no** | 1 | 20 |
| 20 nm, least squares | 4 | 80 | **no** | 1 | 20 |

Approximate mode: effective bits of the worst channel after S chained stages (4,096-point FFT, 8-bit converters, design SNR 27.47 dB, e16's random draws so only the wavelength term differs; the 4-point kernel and the optical twiddles inside a chained block carry the channel's error, the twiddle at each conversion is digital):

| grid | S | W = 1 | W = 2 | W = 4 | W = 8 | W = 16 | W = 32 |
|---|---|---|---|---|---|---|---|
| 100 GHz | 1 | 2.74 | 2.739 | 2.737 | 2.729 | 2.684 | 2.529 |
| 100 GHz | 2 | 3.061 | 3.061 | 3.06 | 3.047 | 3.001 | 2.832 |
| 100 GHz | 4 | 3.167 | 3.165 | 3.16 | 3.15 | 3.102 | 2.927 |
| 100 GHz | 6 | 3.198 | 3.198 | 3.196 | 3.187 | 3.146 | 2.983 |
| 200 GHz | 1 | 2.74 | 2.74 | 2.731 | 2.689 | 2.541 | 2.123 |
| 200 GHz | 2 | 3.061 | 3.06 | 3.051 | 3.01 | 2.844 | 2.399 |
| 200 GHz | 4 | 3.167 | 3.164 | 3.152 | 3.11 | 2.941 | 2.492 |
| 200 GHz | 6 | 3.198 | 3.198 | 3.19 | 3.152 | 2.996 | 2.558 |
| 400 GHz | 1 | 2.74 | 2.735 | 2.704 | 2.562 | 2.149 | 1.397 |
| 400 GHz | 2 | 3.061 | 3.058 | 3.024 | 2.87 | 2.426 | 1.656 |
| 400 GHz | 4 | 3.167 | 3.159 | 3.122 | 2.965 | 2.519 | 1.744 |
| 400 GHz | 6 | 3.198 | 3.195 | 3.166 | 3.019 | 2.586 | 1.813 |
| 800 GHz | 1 | 2.74 | 2.725 | 2.606 | 2.202 | 1.435 | 0.4979 |
| 800 GHz | 2 | 3.061 | 3.044 | 2.914 | 2.483 | 1.695 | 0.7439 |
| 800 GHz | 4 | 3.167 | 3.146 | 3.013 | 2.575 | 1.784 | 0.8333 |
| 800 GHz | 6 | 3.198 | 3.184 | 3.064 | 2.641 | 1.854 | 0.9002 |
| 20 nm | 1 | 2.74 | 2.479 | 1.59 | 0.5113 | -0.4686 | -1.044 |
| 20 nm | 2 | 3.061 | 2.779 | 1.852 | 0.7572 | -0.2381 | -0.8733 |
| 20 nm | 4 | 3.167 | 2.873 | 1.94 | 0.8462 | -0.1506 | -0.8037 |
| 20 nm | 6 | 3.198 | 2.931 | 2.011 | 0.9136 | -0.0879 | -0.7519 |

Which error dominates, precision-limited (60 dB SNR, 16-bit converters, 200 GHz grid, worst channel): the wavelength error equals the 0.01 rad per-stage random phase error when the edge channel sits ±5.525 nm from λ0 (edge δ = 0.004218).

| W | S | random only | wavelength only | both |
|---|---|---|---|---|
| 1 | 1 | 5.026 | 7.28 | 5.026 |
| 1 | 2 | 5.025 | 7.29 | 5.025 |
| 1 | 4 | 5.018 | 7.097 | 5.018 |
| 1 | 6 | 5.04 | 8.67 | 5.04 |
| 2 | 1 | 5.013 | 6.738 | 4.994 |
| 2 | 2 | 5.034 | 7.037 | 5.02 |
| 2 | 4 | 5.044 | 7.329 | 5.029 |
| 2 | 6 | 5.053 | 7.526 | 5.038 |
| 4 | 1 | 5.001 | 5.744 | 4.807 |
| 4 | 2 | 5.019 | 6.025 | 4.892 |
| 4 | 4 | 5.032 | 6.077 | 4.905 |
| 4 | 6 | 5.06 | 6.265 | 4.947 |
| 8 | 1 | 5.048 | 4.656 | 4.33 |
| 8 | 2 | 5.009 | 4.889 | 4.476 |
| 8 | 4 | 5 | 4.949 | 4.502 |
| 8 | 6 | 5.046 | 5.07 | 4.575 |
| 16 | 1 | 4.983 | 3.561 | 3.476 |
| 16 | 2 | 5.002 | 3.799 | 3.691 |
| 16 | 4 | 5.041 | 3.905 | 3.774 |
| 16 | 6 | 5.066 | 3.971 | 3.82 |
| 32 | 1 | 5.005 | 2.515 | 2.493 |
| 32 | 2 | 5.004 | 2.775 | 2.743 |
| 32 | 4 | 5.045 | 2.859 | 2.828 |
| 32 | 6 | 5.055 | 2.934 | 2.901 |

Over a whole FFT the wavelength error is coherent (the same at every stage, and the optical twiddles err too), so it overtakes the random error at fewer channels than the per-stage comparison suggests. First swept W at which the wavelength error alone costs more bits than the random one: S = 1: 8, S = 2: 8, S = 4: 8, S = 6: 16.
v0.3 restated with the new term (200 GHz grid, least squares calibration, worst two channels, 20 dBm laser, 112 GBd):

| W | margin [dB] | v0.3 max U | v0.3 max U×W | max U | max U×W | ring fits |
|---|---|---|---|---|---|---|
| 1 | 6 | 26 | 26 | 26 | 26 | yes |
| 1 | 10 | 12 | 12 | 12 | 12 | yes |
| 4 | 6 | 5 | 20 | 5 | 20 | yes |
| 4 | 10 | 2 | 8 | 2 | 8 | yes |
| 8 | 6 | 2 | 16 | 2 | 16 | yes |
| 8 | 10 | 1 | 8 | 1 | 8 | yes |

| S | e16 (v0.3) effective bits | worst of 4 channels |
|---|---|---|
| 1 | 2.74 | 2.731 |
| 2 | 3.061 | 3.051 |
| 4 | 3.167 | 3.152 |
| 6 | 3.198 | 3.19 |

A mesh per wavelength (W demultiplexed meshes, each calibrated for its own channel: zero wavelength error) against one shared mesh, U = 64:

| W | shared area [mm²] | per-λ area [mm²] | shared heaters [W] | per-λ heaters [W] | per-λ worst error |
|---|---|---|---|---|---|
| 1 | 16 | 16 | 16.64 | 16.64 | 0 |
| 2 | 19.2 | 32 | 21.76 | 33.28 | 0 |
| 4 | 25.6 | 64 | 32 | 66.56 | 0 |
| 8 | 38.4 | 128 | 52.48 | 133.1 | 0 |
| 16 | 64 | 256 | 93.44 | 266.2 | 0 |
| 32 | 115.2 | 512 | 175.4 | 532.5 | 0 |

Sensitivity at 16 × 200 GHz (least squares calibration); coupler drift is off in the default config and reported here separately:

| parameter | value | worst error | worst margin [dB] |
|---|---|---|---|
| `wdm.ng_over_neff` | 1 | 0.01154 | 9.975 |
| `wdm.ng_over_neff` | 1.3 | 0.01327 | 9.967 |
| `wdm.ng_over_neff` | 1.7 | 0.01558 | 9.955 |
| `wdm.ng_over_neff` | 2 | 0.01731 | 9.944 |
| `wdm.ng_over_neff` | 2.2 | 0.01846 | 9.937 |
| `wdm.heater_phase_fraction` | 0 | 0.01962 | 9.928 |
| `wdm.heater_phase_fraction` | 0.25 | 0.0176 | 9.942 |
| `wdm.heater_phase_fraction` | 0.5 | 0.01558 | 9.955 |
| `wdm.heater_phase_fraction` | 0.75 | 0.01356 | 9.965 |
| `wdm.heater_phase_fraction` | 1 | 0.01154 | 9.975 |
| `wdm.coupler_dkappa_per_pct` | 0 | 0.01558 | 9.955 |
| `wdm.coupler_dkappa_per_pct` | 0.1 | 0.06403 | 9.877 |
| `wdm.coupler_dkappa_per_pct` | 0.2 | 0.1288 | 9.035 |
| `wdm.coupler_dkappa_per_pct` | 0.3 | 0.1944 | 6.372 |
| `wdm.path_mismatch_um` | 0 | 0.01558 | 9.955 |
| `wdm.path_mismatch_um` | 1 | 0.09743 | 9.46 |
| `wdm.path_mismatch_um` | 10 | 0.8238 | −∞ |
| `wdm.path_mismatch_um` | 100 | 1.384 | −∞ |

| ring radius [µm] | FSR [nm] | max W at 100 GHz | max W at 200 GHz | max W at 400 GHz | max W at 800 GHz | max W at 20 nm |
|---|---|---|---|---|---|---|
| 3 | 23.34 | 32 | 16 | 8 | 4 | 1 |
| 5 | 14.01 | 16 | 8 | 4 | 2 | 1 |
| 10 | 7.003 | 8 | 4 | 2 | 1 | 1 |
| 20 | 3.502 | 4 | 2 | 1 | 1 | 1 |

Linearity: doubling a small δ multiplies the error by 2 (designed) and 2 (heater-set); the slope ratio designed / heater-set is 1.7 against n_g/n_eff = 1.7.

Signal/LO path: the self-homodyne LO travels a different path from the signal, and its phase scales with wavelength too. An unmatched 1 mm path (v0.1's phase-noise figure) rotates the edge channel of 16 × 200 GHz by 122.6 rad. The rotation equals the 0.01 rad per-stage random phase error at a mismatch of 0.08156 µm, so the LO path must be matched to that level or the LO phase trimmed per channel. The model assumes one or the other and does not apply the rotation.

Per-channel output-phase trim (`wdm.output_trim`, off in the default config and in every table above): a diagonal phase per output port per channel, which per-channel LOs after the demux filters can set. It acts only where a receiver reads the mesh, so in approximate mode it corrects the last stage of each chained block and not the stages inside it. The heaters keep the same calibration; the trim is applied on top (200 GHz grid, least squares calibration, worst channel; same random draws as above):

| W | trim | worst error | mean error | worst margin [dB] | bits S = 1 | bits S = 2 | bits S = 4 | bits S = 6 | precise bits S = 1 | precise bits S = 2 | precise bits S = 4 | precise bits S = 6 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 16 | off | 0.01558 | 0.008288 | 9.955 | 2.541 | 2.844 | 2.941 | 2.996 | 3.476 | 3.691 | 3.774 | 3.82 |
| 16 | on | 0.01102 | 0.00586 | 9.957 | 2.704 | 2.968 | 3.029 | 3.041 | 4.455 | 4.188 | 4.099 | 3.979 |
| 32 | off | 0.03227 | 0.01657 | 9.813 | 2.123 | 2.399 | 2.492 | 2.558 | 2.493 | 2.743 | 2.828 | 2.901 |
| 32 | on | 0.02282 | 0.01172 | 9.824 | 2.598 | 2.719 | 2.715 | 2.67 | 3.73 | 3.354 | 3.221 | 3.09 |

Ring spectra, thermo-optic dispersion, polarisation and crosstalk between channels are not modelled.

Figure: `figures/e17_wavelength_error.png`; data: `web/e17_wavelength_error.json`.

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

