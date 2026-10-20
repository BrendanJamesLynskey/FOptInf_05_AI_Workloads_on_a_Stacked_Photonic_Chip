// node --test js/tests: the JS models must reproduce analysis/ (fixtures written by analysis/build.py).
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const M = require('../fop05_models.js');
const D = require('../fop05_data.js');
const F = require(path.join(__dirname, 'fixtures.json'));

const rel = (a, b) => (a === b) || Math.abs(a - b) <= 1e-12 * Math.max(Math.abs(a), Math.abs(b));
function deepClose(js, py, where) {
    for (const k of Object.keys(py)) {
        if (typeof py[k] === 'number') assert.ok(rel(js[k], py[k]), `${where}.${k}: ${js[k]} vs ${py[k]}`);
        else if (py[k] && typeof py[k] === 'object') deepClose(js[k], py[k], `${where}.${k}`);
        else assert.strictEqual(js[k], py[k], `${where}.${k}`);
    }
}

test('chip defaults equal the Python dataclass', () => {
    const py = F.exact[0].chip, js = M.chip({ E_conv: 0.05, width: 28 });
    for (const k of Object.keys(M.CHIP)) if (!['E_conv', 'width'].includes(k)) assert.strictEqual(js[k], D.breakeven.chip[k], k);
    assert.strictEqual(Object.keys(py).length, Object.keys(M.CHIP).length);
});

test('exact mode', () => F.exact.forEach((c, i) => deepClose(M.exactTransform(c.chip), c.out, `exact[${i}]`)));
test('approximate mode', () => F.approx.forEach((c, i) => deepClose(M.approxStage(c.chip, c.S, c.bits), c.out, `approx[${i}]`)));
test('break-even E_conv', () => F.breakeven.forEach((c, i) => {
    const js = M.breakevenEconv(c.chip, c.S, c.digital, c.bits);
    if (c.out === null) assert.strictEqual(js, null, `be[${i}]`); else assert.ok(rel(js, c.out), `be[${i}] ${js} vs ${c.out}`);
}));
test('digital butterfly', () => F.digital.forEach(c => assert.ok(rel(M.digitalButterfly(M.chip(), c.bits), c.out))));
test('g4 formats like Python %.4g', () => F.g4.forEach(c => assert.strictEqual(M.g4(c.x), c.out, String(c.x))));
test('precision measures', () => F.precision.forEach(c => {
    assert.ok(Math.abs(M.enobNeeded(c.rel, c.crest) - c.enob) < 1e-12, c.format);
    assert.ok(Math.abs(M.snrBits(c.rel) - c.snr_bits) < 1e-12, c.format);
    assert.ok(Math.abs(M.snrBits(M.relFromSnrBits(c.snr_bits)) - c.snr_bits) < 1e-12);
}));
test('e12 grid lookup', () => F.e12.forEach(c => {
    const r = M.e12Row(D, c.wl, ...c.key);
    assert.ok(r); assert.strictEqual(r.vs_logic, c.vs_logic); assert.strictEqual(r.vs_silicon, c.vs_silicon); assert.strictEqual(r.feasible, c.feasible);
}));
test('e16 lookup', () => F.e16.forEach(c => assert.strictEqual(M.e16Bits(D, c.S, c.enob), c.bits)));

test('fft chain: conversions per butterfly path (key frames)', () => {
    const ex = M.fftChain('exact', 1);
    assert.strictEqual(ex.length, 6); assert.strictEqual(ex[5].conversions, 12); assert.strictEqual(ex[2].conversions, 6);
    assert.ok(ex.every(s => s.planes === 59));
    const s6 = M.fftChain('approx', 6);
    assert.strictEqual(s6[0].conversions, 1); assert.strictEqual(s6[4].conversions, 1); assert.strictEqual(s6[5].conversions, 2);
    const s4 = M.fftChain('approx', 4);
    assert.deepStrictEqual(s4.map(s => s.conversions), [1, 1, 1, 2, 3, 4]);
    assert.deepStrictEqual(M.fftChain('approx', 2).map(s => s.block), [0, 0, 1, 1, 2, 2]);
});
test('energy stack sums to the published totals', () => {
    const ex = M.energyStack(D.breakeven, 'exact'), ap = M.energyStack(D.breakeven, 'approx');
    assert.strictEqual(M.g4(ex.parts.reduce((a, p) => a + p[1], 0)), '485.9');
    assert.strictEqual(M.g4(ap.parts.reduce((a, p) => a + p[1], 0)), '6.929');
    assert.strictEqual(M.g4(ex.digital), '32.35'); assert.strictEqual(M.g4(ap.digital), '0.2141');
});
test('system path has the same steps in both modes', () => {
    assert.strictEqual(M.systemPath('exact').length, M.systemPath('approx').length);
});
test('amdahl', () => assert.strictEqual(M.amdahl(D.series.headline.circ_lm_last_optical_2048).toFixed(1), '6.5'));
test('FP4 grid equals Python', () => assert.deepStrictEqual(M.FP4_GRID, F.fp4_grid));
