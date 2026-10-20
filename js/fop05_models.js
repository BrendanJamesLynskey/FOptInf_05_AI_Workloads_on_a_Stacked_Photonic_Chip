// FOptInf 05: the deck's models, pure functions. Ports of analysis/breakeven.py and the measures in
// analysis/precision_needed.py, plus lookups into the simulator's data (js/fop05_data.js) and the step
// sequences the animations draw. js/tests/models.test.js checks every function against Python fixtures.
(function (root) {
    'use strict';

    // ── number format: 4 significant figures with Python's %g rules (analysis/build.py g4) ──
    function g4(x) {
        if (x === 0) return '0';
        if (!isFinite(x)) return String(x);
        let e = Math.floor(Math.log10(Math.abs(x)));
        const m = Number(x.toPrecision(4));
        e = Math.floor(Math.log10(Math.abs(m)));                 // rounding can carry (99999.5 -> 1e5)
        if (e < -4 || e >= 4) {
            let [mant, ex] = m.toExponential(3).split('e');
            mant = mant.replace(/\.?0+$/, '');
            const n = Number(ex);
            return `${mant}e${n < 0 ? '-' : '+'}${String(Math.abs(n)).padStart(2, '0')}`;
        }
        return m.toFixed(Math.max(0, 3 - e)).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    }

    // ── the chip (analysis/breakeven.py Chip; defaults from the simulator's assumptions table) ──
    const CHIP = {
        U: 64, W: 4, B_GBd: 112, eta: 0.95, heaters_unit: 18, heaters_wl: 8, p_pi_mW: 10, laser_mW: 100,
        wall_plug: 0.15, fanout: 20, E_conv: 0.5, out_bits: 2, E_recombine: 0.05, width: 59,
        pJ_add32: 0.1, pJ_mul32: 3.1, node: 0.25, modmul_muls: 3, modadd_adds: 2, power_cap_W: 500,
    };
    const chip = o => Object.assign({}, CHIP, o || {});
    const mul = (c, b) => c.pJ_mul32 * (b / 32) ** 2 * c.node;
    const add = (c, b) => c.pJ_add32 * (b / 32) * c.node;
    const nLasers = c => Math.ceil(c.U * c.W / c.fanout);
    const laserW = c => nLasers(c) * c.laser_mW * 1e-3 / c.wall_plug;
    const heatersW = c => c.U * (c.heaters_unit + c.heaters_wl * c.W) * c.p_pi_mW * 1e-3;
    const staticW = c => laserW(c) + heatersW(c);
    const slots = c => c.U * c.W * c.B_GBd * 1e9 * c.eta;

    function exactTransform(c) {
        const rate = slots(c) / c.width, crossings = 4 * c.width * (1 + c.out_bits);
        const modmul = c.modmul_muls * mul(c, c.width), modadd = c.modadd_adds * add(c, c.width);
        const e = { laser: laserW(c) / rate * 1e12, phase_shifters: heatersW(c) / rate * 1e12,
                    conversions: crossings * c.E_conv, recombination: 4 * c.width * c.E_recombine, logic: 4 * modmul + 4 * modadd };
        e.total = e.laser + e.phase_shifters + e.conversions + e.recombination + e.logic;
        const asic = 4 * modmul + 8 * modadd;
        return { chip: e, asic, rate_per_s: rate, crossings, n_lasers: nLasers(c),
                 breakeven_E_conv: (asic - (e.total - e.conversions)) / crossings,
                 free_light_and_crossings: e.recombination + e.logic };
    }

    function digitalButterfly(c, bits) {
        const b = Math.ceil(bits - 1e-9);
        return 12 * mul(c, b) + 22 * add(c, b);
    }

    function approxStage(c, S, convBits) {
        const bc = convBits || 8, rate = slots(c);
        const crossings = 8 * bc * c.E_conv / S, twiddles = 3 * (4 * mul(c, bc) + 2 * add(c, bc)) / S;
        const laser = laserW(c) / rate * 1e12, heaters = heatersW(c) / rate * 1e12, dyn = crossings + twiddles;
        const pl = (c.power_cap_W - staticW(c)) / (dyn * 1e-12);
        return { crossings, twiddles, laser, phase_shifters: heaters, total: dyn + laser + heaters, static: laser + heaters,
                 throughput: Math.min(rate, pl), limit: pl < rate ? 'power' : 'optics' };
    }

    function breakevenEconv(c, S, digital, convBits) {
        const bc = convBits || 8, a = approxStage(Object.assign({}, c, { E_conv: 0 }), S, bc), room = digital - a.total;
        return room <= 0 ? null : room * S / (8 * bc);
    }

    // ── the precision measures (analysis/precision_needed.py) ──
    const enobNeeded = (rel, crest) => Math.log2(crest * 2 / (Math.sqrt(12) * rel));
    const snrBits = rel => (-20 * Math.log10(rel) - 1.76) / 6.02;
    const relFromSnrBits = b => 10 ** (-(b * 6.02 + 1.76) / 20);
    const seriesEnobFromSnrBits = (b, crest) => enobNeeded(relFromSnrBits(b), crest);

    // ── lookups into the simulator's data ──
    function e12Row(D, wl, U, W, B, E, width) {
        const r = D.e12.grid[wl].find(g => g[0] === U && g[1] === W && g[2] === B && g[3] === E && g[4] === width);
        if (!r) return null;
        const o = {}; D.e12.gridKeys.forEach((k, i) => { o[k] = r[i]; }); return o;
    }
    function e16Bits(D, S, enob) {
        const s = D.e16.figures.bits_vs_enob.series.find(x => x.name === `S = ${S}`);
        return s.y[s.x.indexOf(enob)];
    }
    const series = (fig, name) => fig.series.find(s => s.name === name);

    // ── animation step sequences ──
    // slide 04: a 4,096-point FFT's 6 radix-4 stages; in exact mode every stage is decided and converted,
    // in approximate mode S stages chain optically between conversions (blocks of S; the last may be shorter).
    function fftChain(mode, S) {
        const stages = 6, steps = [];
        let conv = 0, blocks = 0;
        const span = mode === 'exact' ? 1 : S;
        for (let k = 0; k < stages; k++) {
            const start = k % span === 0, end = (k + 1) % span === 0 || k === stages - 1;
            if (start) { conv += 1; blocks += 1; }               // a DAC crossing into the light
            if (end) conv += 1;                                   // an ADC crossing out
            steps.push({ stage: k, start, end, block: blocks - 1, conversions: conv,
                         planes: mode === 'exact' ? 59 : 1 });
        }
        return steps;
    }
    // slide 02: one value's path through the two layers, per mode
    function systemPath(mode) {
        const P = [
            ['logic', 'HBM → logic: operands fetched by the stacked logic layer'],
            ['logic', mode === 'exact' ? 'split into 4-bit planes, one symbol slot each (59 bits → 59 passes)' : 'one operand per symbol: the value itself drives the modulator'],
            ['bond', 'up through the bond: a driver crossing (E_conv per bit)'],
            ['photonic', 'modulators write the 4 inputs onto light from the split external laser'],
            ['photonic', 'the 4-point optical transform: one pass, no arithmetic'],
            ['photonic', mode === 'exact' ? 'detected after one radix-4 stage' : 'chained: the light goes on through up to S stages'],
            ['bond', 'down through the bond: TIA and decision (2 bits per output per plane)'],
            ['logic', mode === 'exact' ? 'recombine planes, reduce mod p, twiddle multiply: exact integers' : 'rescale; twiddles at block edges: a few effective bits'],
        ];
        return P.map(([layer, text], i) => ({ i, layer, text }));
    }
    // slide 07: the energy stack, built one component at a time
    function energyStack(be, which) {
        if (which === 'exact') {
            const e = be.exact.chip;
            return { parts: [['laser', e.laser], ['phase shifters', e.phase_shifters], ['conversions', e.conversions],
                             ['recombination', e.recombination], ['logic', e.logic]], digital: be.exact.asic, digitalName: 'ASIC, 59-bit' };
        }
        const a = be.approx['6'];
        return { parts: [['laser', a.laser], ['phase shifters', a.phase_shifters], ['conversions', a.crossings],
                         ['boundary twiddles', a.twiddles]], digital: a.digital_matched, digitalName: 'digital, matched bits',
                 digital8: be.digital_8bit };
    }
    const amdahl = share => 1 / (1 - share);
    // FP4 E2M1 magnitudes (analysis/precision_needed.py fp4_e2m1_scaled; checked against Python's grid)
    const FP4_GRID = [0, 0.5, 1, 1.5, 2, 3, 4, 6];

    const API = { g4, CHIP, chip, mul, add, nLasers, laserW, heatersW, staticW, slots, exactTransform, digitalButterfly,
                  approxStage, breakevenEconv, enobNeeded, snrBits, relFromSnrBits, seriesEnobFromSnrBits, e12Row, e16Bits,
                  series, fftChain, systemPath, energyStack, amdahl, FP4_GRID };
    if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.FOP05 = API;
})(typeof window !== 'undefined' ? window : globalThis);
