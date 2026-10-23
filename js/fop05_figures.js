// FOptInf 05: draws every figure, explorer and animation from the models in fop05_models.js (window.FOP05) and the
// simulator's data in fop05_data.js (window.FOP05_DATA). Colours come from the deck's CSS variables. window.fopFig
// exposes checkable state to tools/browser_check.js.
(function () {
    'use strict';
    const M = window.FOP05, D = window.FOP05_DATA, $ = id => document.getElementById(id);
    const V = { text: '--text-primary', sec: '--text-secondary', acc: '--accent', border: '--border', card: '--bg-card', code: '--bg-code',
                teal: '--c-teal', amber: '--c-amber', orange: '--c-orange', blue: '--c-blue', violet: '--c-violet' };
    const col = k => window.fopColor(V[k]);
    const SVGNS = 'http://www.w3.org/2000/svg';
    const redraws = [];
    window.fopFig = {};
    const PAL = ['teal', 'amber', 'blue', 'violet', 'orange', 'acc'];
    function font(g, w, k) { const px = Math.max(10, Math.min(13, w / 58)) * (k || 1); g.font = `${px}px "Geist Mono", monospace`; return px; }
    function txt(g, s, x, y, c, align) { g.fillStyle = c; g.textAlign = align || 'left'; g.fillText(s, x, y); g.textAlign = 'left'; }
    function line(g, pts, c, w, dash) { g.strokeStyle = c; g.lineWidth = w || 1; g.setLineDash(dash || []); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.setLineDash([]); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; }
    function svgEl(parent, tag, attrs, text) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text !== undefined) e.textContent = text; parent.appendChild(e); return e; }
    const narrowOf = cv => (cv.clientWidth || cv.parentElement.clientWidth || 600) < 560;
    const g4 = M.g4;
    // a diagonal hatch, so "stalled" or "out of service" is never colour alone
    function hatch(g, x, y, w, h, c) {
        g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = c; g.lineWidth = 1;
        for (let k = -h; k < w; k += 6) { g.beginPath(); g.moveTo(x + k, y + h); g.lineTo(x + k + h, y); g.stroke(); }
        g.restore();
    }

    // ── one line-chart helper for every chart: axes, log or linear, null gaps, reference lines, a marker, a legend ──
    function chart(cv, o) {
        const narrow = narrowOf(cv), { g, w, h } = window.fopCanvas(cv, narrow ? (o.aspectN || 0.9) : (o.aspect || 0.62)), px = font(g, w, 0.9);
        const S = o.series.filter(s => s.y.some(v => v !== null && v !== undefined));
        const xs = [].concat(...S.map(s => s.x)), ys = [].concat(...S.map(s => s.y)).filter(v => v !== null && (!o.ylog || v > 0));
        (o.hlines || []).forEach(l => ys.push(l.y));
        let x0 = o.xmin ?? Math.min(...xs), x1 = o.xmax ?? Math.max(...xs), y0 = o.ymin ?? Math.min(...ys), y1 = o.ymax ?? Math.max(...ys);
        if (!o.ylog && o.ymin === undefined) { const pad = (y1 - y0) * 0.08 || Math.abs(y1) * 0.1 || 1; y0 -= pad; y1 += pad; }
        if (o.ylog) { y0 = 10 ** Math.floor(Math.log10(y0)); y1 = 10 ** Math.ceil(Math.log10(y1)); }
        const legendRows = narrow ? Math.ceil(S.length / 2) : Math.ceil(S.length / 3);
        const L = narrow ? 44 : 52, R = 10, T = 8 + (o.legend === false ? 0 : legendRows * (px + 5)), B = 2.6 * px + 8;
        const fx = v => o.xlog ? Math.log10(v) : v, fy = v => o.ylog ? Math.log10(v) : v;
        const X = v => L + (fx(v) - fx(x0)) / ((fx(x1) - fx(x0)) || 1) * (w - L - R);
        const Y = v => h - B - (fy(v) - fy(y0)) / ((fy(y1) - fy(y0)) || 1) * (h - T - B);
        g.strokeStyle = col('border'); g.lineWidth = 1; g.strokeRect(L, T, w - L - R, h - T - B);
        // ticks
        const yt = o.ylog ? (() => { const t = []; for (let e = Math.log10(y0); e <= Math.log10(y1) + 1e-9; e++) t.push(10 ** e); return t; })()
                          : (() => { const n = 4, t = []; for (let i = 0; i <= n; i++) t.push(y0 + (y1 - y0) * i / n); return t; })();
        yt.forEach(v => { line(g, [[L, Y(v)], [w - R, Y(v)]], col('border'), 0.5); txt(g, g4(Number(v.toPrecision(3))), L - 4, Y(v) + px * 0.35, col('sec'), 'right'); });
        const xt = o.xticks || [...new Set(xs)].sort((a, b) => a - b);
        const every = Math.max(1, Math.ceil(xt.length * 6 * px / (w - L - R)));
        xt.forEach((v, i) => { if (i % every === 0) txt(g, o.xfmt ? o.xfmt(v) : g4(v), X(v), h - B + px + 4, col('sec'), 'center'); });
        txt(g, o.xlabel || '', (L + w - R) / 2, h - 4, col('sec'), 'center');
        if (o.ylabel) { g.save(); g.translate(10, (T + h - B) / 2); g.rotate(-Math.PI / 2); txt(g, o.ylabel, 0, 0, col('sec'), 'center'); g.restore(); }
        (o.hlines || []).forEach(l => { line(g, [[L, Y(l.y)], [w - R, Y(l.y)]], col(l.color || 'sec'), 1.2, [5, 4]); txt(g, l.label, w - R - 4, Y(l.y) - 4, col(l.color || 'sec'), 'right'); });
        (o.vlines || []).forEach(l => { line(g, [[X(l.x), T], [X(l.x), h - B]], col(l.color || 'sec'), 1.2, [5, 4]); txt(g, l.label, X(l.x) + 3, T + px + 2, col(l.color || 'sec')); });
        S.forEach((s, i) => {
            const c = col(s.color || PAL[i % PAL.length]);
            g.strokeStyle = c; g.lineWidth = s.width || 2; g.setLineDash(s.dash || []); g.beginPath();
            let on = false;
            s.x.forEach((xv, k) => { const yv = s.y[k]; if (yv === null || yv === undefined || (o.ylog && yv <= 0)) { on = false; return; } const p = [X(xv), Y(yv)]; if (on) g.lineTo(...p); else g.moveTo(...p); on = true; });
            g.stroke(); g.setLineDash([]);
            s.x.forEach((xv, k) => { const yv = s.y[k]; if (yv === null || (o.ylog && yv <= 0)) return; g.fillStyle = c; g.beginPath(); g.arc(X(xv), Y(yv), s.dot || 2.5, 0, 2 * Math.PI); g.fill(); });
            if (o.legend !== false) {
                const per = narrow ? 2 : 3, cw = (w - L - R) / per, lx = L + (i % per) * cw, ly = 6 + Math.floor(i / per) * (px + 5) + px;
                line(g, [[lx, ly - px * 0.35], [lx + 16, ly - px * 0.35]], c, 2.5, s.dash); txt(g, s.name, lx + 20, ly, col('text'));
            }
        });
        if (o.marker) { const [mx, my] = [X(o.marker.x), Y(o.marker.y)]; g.strokeStyle = col('acc'); g.lineWidth = 2.5; g.beginPath(); g.arc(mx, my, 7, 0, 2 * Math.PI); g.stroke(); }
        return { X, Y, g, w, h, px };
    }

    // ── assumptions table (slide 19), from the simulator's own table ──
    if ($('tbl-assume')) {
        const t = $('tbl-assume'), tagClass = { paper: 'paper', 'public-statement': 'web', patent: 'patent', illustrative: 'inference', inferred: 'inference', textbook: 'derived', datasheet: 'derived' };
        D.assumptions.forEach(a => { const tr = document.createElement('tr'); tr.innerHTML = `<td data-label="Parameter"><code>${a.parameter}</code></td><td data-label="Default">${a.default}</td><td data-label="Tag"><span class="src-tag ${tagClass[a.source] || ''}">${a.source}</span></td>`; t.appendChild(tr); });
    }

    // ── slide 02: the two layers, one value's path ──
    if ($('anim-system')) {
        const LAY = {
            wide: { hbm: [530, 196, 100, 70], logic: [20, 190, 490, 82], bond: [20, 150, 490, 32], photonic: [20, 40, 490, 102], laser: [530, 50, 100, 60],
                    units: i => [210 + i * 74, 70, 60, 50] },
            narrow: { laser: [10, 6, 300, 48], photonic: [10, 66, 300, 120], bond: [10, 196, 300, 44], logic: [10, 250, 300, 120], hbm: [10, 382, 300, 60],
                      units: i => [26 + i * 72, 104, 56, 46] },
        };
        const AT = ['hbm', 'logic', 'bond', 'photonic', 'unit', 'unit', 'bond', 'logic'];
        let mode = $('sys-mode').value, path = M.systemPath(mode);
        function build(svg, lay) {
            svg.innerHTML = '';
            const box = (k, label, sub) => { const [x, y, w, h] = lay[k]; const r = svgEl(svg, 'rect', { x, y, width: w, height: h, rx: 6, class: 's-box', 'data-k': k });
                svgEl(svg, 'text', { x: x + 8, y: y + 18, class: 's-t' }, label); if (sub) svgEl(svg, 'text', { x: x + 8, y: y + 34, class: 's-d' }, sub); return r; };
            box('laser', 'laser', 'split');
            { const [lx, ly, lw, lh] = lay.laser, [px0, py0, pw] = lay.photonic; svgEl(svg, 'path', { d: lay === LAY.wide ? `M${lx} ${ly + lh / 2} H${px0 + pw}` : `M${lx + 150} ${ly + lh} V${py0}`, class: 's-line', 'stroke-dasharray': '4 3' }); }
            box('photonic', 'photonic layer', 'U units × W λ');
            box('bond', 'bond: drivers up, TIAs down', '');
            box('logic', 'logic layer', 'decide · recombine · reduce');
            box('hbm', 'HBM', '');
            for (let i = 0; i < 4; i++) { const [x, y, w, h] = lay.units(i); svgEl(svg, 'rect', { x, y, width: w, height: h, rx: 4, class: 's-acc', 'data-k': 'unit' }); svgEl(svg, 'text', { x: x + 6, y: y + h / 2 + 5, class: 's-d' }, mode === 'exact' ? '4-pt' : 'stage'); }
            svgEl(svg, 'circle', { r: 7, class: 'sys-dot', fill: col('acc') });
        }
        const svgs = [[$('svg-system'), LAY.wide], [$('svg-system-n'), LAY.narrow]];
        const centre = (lay, k, i) => { const r = k === 'unit' ? lay.units(i) : lay[k]; return [r[0] + r[2] / 2, r[1] + r[3] - 10]; };
        function draw(step, frac) {
            svgs.forEach(([svg, lay]) => {
                if (!svg.firstChild) build(svg, lay);
                const k = AT[step];
                svg.querySelectorAll('rect').forEach(r => { const on = r.dataset.k === k || (k === 'photonic' && r.dataset.k === 'laser');
                    r.setAttribute('stroke', on ? col('acc') : ''); r.setAttribute('stroke-width', on ? 3 : 1.2); });
                const prev = centre(lay, AT[Math.max(0, step - 1)], 0), cur = centre(lay, k, step === 5 && mode === 'approx' ? 3 : step === 5 ? 1 : 0), t = ease(frac);
                const dot = svg.querySelector('.sys-dot'); dot.setAttribute('cx', lerp(prev[0], cur[0], t)); dot.setAttribute('cy', lerp(prev[1], cur[1], t));
            });
            window.fopFig.system = { mode, step, at: AT[step] };
        }
        const A = window.FopAnim('anim-system', { steps: path.length, draw, stepMs: 1800, caption: s => `Step ${s + 1} of ${path.length} (${mode}): ${path[s].text}.` });
        $('sys-mode').addEventListener('change', () => { mode = $('sys-mode').value; path = M.systemPath(mode); svgs.forEach(([s]) => { s.innerHTML = ''; }); A.restart(path.length); });
        redraws.push(A.redraw);
    }

    // ── slide 03: the memory wall explorer ──
    if ($('exp-mw')) {
        const ids = ['mw-wl', 'mw-hbm', 'mw-u', 'mw-w', 'mw-b', 'mw-e', 'mw-width'];
        function update() {
            const wl = $('mw-wl').value, hbm = $('mw-hbm').value, U = +$('mw-u').value, W = +$('mw-w').value, B = +$('mw-b').value, E = +$('mw-e').value, wd = +$('mw-width').value;
            const fig = D.e12.figures[`logic_${wl}`], hb = hbm === '∞' ? '∞' : hbm;
            chart($('cv-mw-logic'), { xlog: true, xlabel: 'logic area [mm²]', ylabel: 'speed-up', ymin: 0, ymax: 1.2,
                series: fig.series.filter(s => s.name.startsWith(`HBM ${hb} GB/s`)).map((s, i) => ({ name: s.name.replace(`HBM ${hb} GB/s, `, ''), x: s.x, y: s.y, color: i ? 'amber' : 'teal' })),
                hlines: [{ y: 1, label: 'break-even' }] });
            const rows = D.e12.grid[wl], key = D.e12.gridKeys;
            const pick = (u, k) => { const r = M.e12Row(D, wl, u, W, B, E, wd); return r && r.feasible ? r[k] : null; };
            const us = [4, 16, 64, 256, 1024, 4096];
            const r = M.e12Row(D, wl, U, W, B, E, wd);
            chart($('cv-mw-u'), { xlog: true, xlabel: 'units U', ylabel: 'speed-up', ymin: 0, ymax: 1.2,
                series: [{ name: 'vs equal logic', x: us, y: us.map(u => pick(u, 'vs_logic')), color: 'teal' }, { name: 'vs equal silicon', x: us, y: us.map(u => pick(u, 'vs_silicon')), color: 'amber' }],
                hlines: [{ y: 1, label: 'break-even' }], marker: r && r.feasible ? { x: U, y: r.vs_logic } : null });
            $('mw-logic').textContent = r.feasible ? g4(r.vs_logic) : 'over cap';
            $('mw-silicon').textContent = r.feasible ? g4(r.vs_silicon) : 'over cap';
            $('mw-binding').textContent = r.binding;
            $('mw-optical').textContent = `${g4(r.optical_fraction * 100)}%`;
            window.fopFig.mw = { wl, U, W, B, E, width: wd, row: r, n: rows.length, keys: key.length };
        }
        ids.forEach(i => $(i).addEventListener('change', update));
        update(); redraws.push(update);
    }

    // ── slide 04: the FFT's 6 stages, conversions on or off ──
    if ($('anim-fft')) {
        let mode = $('fft-mode').value, S = +$('fft-s').value, chain = M.fftChain(mode, S);
        const st = () => mode === 'exact' ? null : M.approxStage(M.chip(), S, 8);
        function draw(step, frac) {
            const cv = $('cv-fft'), narrow = narrowOf(cv), { g, w, h } = window.fopCanvas(cv, narrow ? 0.8 : 0.42), px = font(g, w);
            const n = 6, top = 2 * px + 10, colW = (w - 20) / n, laneL = top + 4, laneH = narrow ? h * 0.32 : h * 0.34, laneE = laneL + laneH + (narrow ? 3 * px : 2.5 * px);
            g.fillStyle = 'rgba(151,205,198,0.10)'; g.fillRect(10, laneL, w - 20, laneH);
            txt(g, 'light', 14, laneL + px + 2, col('teal')); txt(g, 'electronics', 14, laneE + px + 2, col('sec'));
            // blocks of chained stages
            const blocks = {}; chain.forEach(c => { (blocks[c.block] = blocks[c.block] || []).push(c.stage); });
            Object.values(blocks).forEach(b => { const x = 10 + b[0] * colW + 3, ww = b.length * colW - 6; g.strokeStyle = col('teal'); g.lineWidth = 1.5; g.strokeRect(x, laneL + 2 * px + 4, ww, laneH - 2 * px - 10); });
            chain.forEach((c, k) => {
                const x = 10 + k * colW + colW / 2, active = k === step, done = k < step;
                g.globalAlpha = k > step ? 0.35 : 1;
                g.fillStyle = col('code'); g.fillRect(x - colW * 0.32, laneL + laneH / 2 - px, colW * 0.64, 2.4 * px);
                g.strokeStyle = active ? col('acc') : done ? col('sec') : col('border'); g.lineWidth = active ? 3 : 1.2; g.strokeRect(x - colW * 0.32, laneL + laneH / 2 - px, colW * 0.64, 2.4 * px);
                txt(g, narrow ? `S${k + 1}` : `stage ${k + 1}`, x, laneL + laneH / 2 + px * 0.5, active ? col('acc') : col('text'), 'center');
                const dmd = (yy, label) => { const r = px * 0.7; g.fillStyle = col('amber'); g.beginPath(); g.moveTo(x, yy - r); g.lineTo(x + r, yy); g.lineTo(x, yy + r); g.lineTo(x - r, yy); g.closePath(); g.fill(); txt(g, label, x + r + 3, yy + px * 0.35, col('amber')); };
                if (c.start) dmd(laneL + laneH + 1.2 * px, mode === 'exact' ? 'in ×59' : 'DAC');
                if (c.end) { line(g, [[x + colW * 0.25, laneL + laneH], [x + colW * 0.25, laneE]], col('amber'), 1.5, [3, 3]); dmd(laneE + 2.2 * px, mode === 'exact' ? 'out ×59' : 'ADC'); }
                if (mode === 'exact' || c.end) { g.fillStyle = col('code'); g.fillRect(x - colW * 0.32, laneE + 3.2 * px, colW * 0.64, 1.8 * px); txt(g, mode === 'exact' ? 'reduce' : 'rescale', x, laneE + 4.5 * px, col('sec'), 'center'); }
                g.globalAlpha = 1;
            });
            // the moving value through the active stage
            const x = 10 + step * colW + colW * (0.15 + 0.7 * ease(frac));
            g.fillStyle = col('acc'); g.beginPath(); g.arc(x, laneL + laneH / 2 - 1.8 * px, 5, 0, 2 * Math.PI); g.fill();
            const c = chain[step];
            txt(g, `crossings on one value's path so far: ${c.conversions}${mode === 'exact' ? ' (each 59 bit planes)' : ''}`, 10, px + 4, col('amber'));
            const a = st();
            txt(g, a ? `S = ${S}: ${g4(a.total)} pJ per butterfly-stage, ${g4(a.throughput)} /s` : `exact: 708 crossings per 4-point transform`, 10, h - 6, col('sec'));
            window.fopFig.fft = { mode, S, step, conversions: c.conversions, blocks: Object.keys(blocks).length, pJ: a ? a.total : null };
        }
        const caption = s => { const c = chain[s];
            if (mode === 'exact') return `Stage ${s + 1} of 6, exact: every operand enters as 59 bit planes, is transformed, decided, recombined and reduced mod p before the twiddle multiply. Crossings so far on one value's path: ${c.conversions}.`;
            return `Stage ${s + 1} of 6, chain of ${S}: ${c.start ? 'a DAC writes the operand onto light; ' : 'the light goes straight on; '}${c.end ? 'the ADC reads it out, and the logic rescales and applies the boundary twiddles. ' : 'no conversion here. '}Crossings so far: ${c.conversions}.`; };
        const A = window.FopAnim('anim-fft', { steps: 6, draw, caption, stepMs: 1600 });
        const rerun = () => { mode = $('fft-mode').value; S = +$('fft-s').value; $('fft-s').disabled = mode === 'exact'; chain = M.fftChain(mode, S); A.restart(6); };
        $('fft-mode').addEventListener('change', rerun); $('fft-s').addEventListener('change', rerun);
        redraws.push(A.redraw);
    }

    // ── slide 05: precision available ──
    if ($('exp-pa')) {
        const crest = D.precision.reference.crest;
        function update() {
            const S = +$('pa-s').value, e = +$('pa-enob').value; $('pa-s-val').textContent = S;
            const f = D.e16.figures.bits_vs_enob, bits = M.e16Bits(D, S, e);
            chart($('cv-pa-enob'), { xlabel: 'converter ENOB [bits]', ylabel: 'effective bits', ymin: 0, ymax: 3.5,
                series: f.series.map((s, i) => ({ name: s.name, x: s.x, y: s.y, color: PAL[i], width: s.name === `S = ${S}` ? 3.5 : 1.3 })), marker: { x: e, y: bits } });
            const fs = D.e16.figures.bits_vs_s;
            chart($('cv-pa-s'), { xlabel: 'chained stages S', ylabel: 'effective bits', ymin: 0, ymax: 3.5,
                series: fs.series.map((s, i) => ({ name: s.name, x: s.x, y: s.y, color: i ? 'orange' : 'teal' })) });
            $('pa-bits').textContent = g4(bits);
            $('pa-enob-series').textContent = g4(M.seriesEnobFromSnrBits(bits, crest));
            window.fopFig.pa = { S, enob: e, bits };
        }
        $('pa-s').addEventListener('input', update); $('pa-enob').addEventListener('change', update);
        update(); redraws.push(update);
    }

    // ── slide 06: needed against available ──
    if ($('exp-need')) {
        const crest = D.precision.reference.crest, F = D.precision.formats;
        const order = ['BF16', 'INT8', 'FP8 E4M3', 'FP8 E5M2', 'NVFP4', 'INT4 g32', 'FP4 E2M1', 'MXFP4', 'INT4'];
        function update() {
            const m = $('need-measure').value, cv = $('cv-need'), narrow = narrowOf(cv);
            const { g, w, h } = window.fopCanvas(cv, narrow ? 1.15 : 0.55), px = font(g, w, 0.95);
            const val = k => m === 'snr' ? F[k].snr_bits : F[k].enob_needed;
            const toM = b => m === 'snr' ? b : M.seriesEnobFromSnrBits(b, crest);
            const n64 = D.e19.figures.approximate.series.find(s => s.name === 'all stages chained');
            const avail = [['S = 2 (best)', M.e16Bits(D, 2, 8), 'teal'], ['S = 6', M.e16Bits(D, 6, 8), 'acc'],
                           ['N = 64, chained', n64.y[n64.x.indexOf(64)], 'orange']];
            const L = narrow ? 76 : 96, R = 14, T = 3 * px, rowH = (h - T - 3 * px) / order.length, xmax = 11;
            const X = v => L + v / xmax * (w - L - R);
            for (let v = 0; v <= xmax; v += narrow ? 2 : 1) { line(g, [[X(v), T], [X(v), h - 3 * px]], col('border'), 0.5); txt(g, String(v), X(v), h - 1.6 * px, col('sec'), 'center'); }
            txt(g, m === 'snr' ? 'effective bits, (SNR − 1.76)/6.02' : 'ENOB, the series\' rule', (L + w) / 2, h - 2, col('sec'), 'center');
            order.forEach((k, i) => {
                const y = T + i * rowH, v = val(k), low = /4/.test(k) && !/FP8/.test(k);
                g.fillStyle = low ? col('violet') : col('blue'); g.globalAlpha = 0.85; g.fillRect(L, y + rowH * 0.2, X(v) - L, rowH * 0.6); g.globalAlpha = 1;
                txt(g, k, L - 6, y + rowH * 0.5 + px * 0.35, col('text'), 'right');
                txt(g, v.toFixed(2), X(v) + 4, y + rowH * 0.5 + px * 0.35, col('sec'));
            });
            avail.forEach(([name, b, c], i) => { const x = X(toM(b)); line(g, [[x, T - 4], [x, h - 3 * px]], col(c), 2.5, i === 2 ? [6, 4] : []); txt(g, `${name}: ${toM(b).toFixed(2)}`, narrow ? 4 : L + i * (w - L) / 3, px + 2 + (narrow ? i * 0 : 0), col(c)); });
            if (narrow) { /* labels collide on phones: stack them */ g.clearRect(0, 0, w, T - 4); avail.forEach(([name, b, c], i) => txt(g, `${name}: ${toM(b).toFixed(2)}`, 4 + i * (w / 3), px + 2, col(c))); }
            window.fopFig.need = { measure: m, fp4: val('FP4 E2M1'), int4: val('INT4'), available: avail.map(a => toM(a[1])) };
        }
        $('need-measure').addEventListener('change', update);
        update(); redraws.push(update);
    }

    // ── slide 07: the energy stack, one component per step ──
    if ($('anim-energy')) {
        let which = $('en-mode').value, stack = M.energyStack(D.breakeven, which);
        const CC = ['amber', 'orange', 'blue', 'violet', 'teal'];
        function draw(step, frac) {
            const cv = $('cv-energy'), narrow = narrowOf(cv), { g, w, h } = window.fopCanvas(cv, narrow ? 1.1 : 0.48), px = font(g, w);
            const parts = stack.parts, total = parts.reduce((a, p) => a + p[1], 0), ymax = total * 1.08;
            const T = 2 * px, B = 4.2 * px, Hh = h - T - B, Y = v => T + Hh - v / ymax * Hh;
            const bw = narrow ? w * 0.22 : w * 0.16, xp = narrow ? w * 0.04 : w * 0.18, xd = xp + bw + (narrow ? w * 0.05 : w * 0.08);
            let acc = 0, lastY = Infinity;
            parts.forEach(([name, v], i) => {
                if (i > step) return;
                const t = i === step ? ease(frac) : 1, y1 = Y(acc), y2 = Y(acc + v * t);
                g.fillStyle = col(CC[i]); g.fillRect(xp, y2, bw, y1 - y2);
                if (i < step || frac >= 1) {   // labels beside the digital bar, pushed apart so small parts stay legible
                    const ly = Math.min(Y(acc + v / 2) + px * 0.35, lastY - px - 3); lastY = ly;
                    line(g, [[xp + bw + 2, Y(acc + v / 2)], [xd + bw + 4, ly - px * 0.35]], col(CC[i]), 0.8);
                    txt(g, `${name} ${g4(v)}`, xd + bw + 8, ly, col(CC[i]));
                }
                acc += v * t;
            });
            g.fillStyle = col('acc'); const yd = Y(stack.digital); g.fillRect(xd, yd, bw, Y(0) - yd);
            if (stack.digital8) { g.strokeStyle = col('acc'); g.lineWidth = 1.5; g.setLineDash([4, 3]); const y8 = Y(stack.digital8); g.strokeRect(xd, y8, bw, Y(0) - y8); g.setLineDash([]); }
            txt(g, `chip ${g4(acc)} pJ`, xp + bw / 2, T - 4 > Y(acc) - 6 ? T : Y(acc) - 6, col('text'), 'center');
            txt(g, `${stack.digitalName} ${g4(stack.digital)}`, xd, Y(0) + px + 4, col('acc'));
            if (stack.digital8) txt(g, `8-bit ${g4(stack.digital8)}`, xd + bw / 2, Y(stack.digital8) - 4 - 1.3 * px, col('acc'), 'center');
            line(g, [[xp - 10, Y(0)], [w - 10, Y(0)]], col('border'), 1);
            txt(g, which === 'exact' ? 'pJ per 59-bit 4-point transform' : 'pJ per butterfly-stage, S = 6', 10, h - 6, col('sec'));
            window.fopFig.energy = { which, step, shown: acc, total, digital: stack.digital };
        }
        const caption = s => { const p = stack.parts[s], sum = stack.parts.slice(0, s + 1).reduce((a, q) => a + q[1], 0);
            return `Component ${s + 1} of ${stack.parts.length}: ${p[0]}, ${g4(p[1])} pJ. Running total ${g4(sum)} pJ against ${g4(stack.digital)} pJ for the ${stack.digitalName} design.`; };
        const A = window.FopAnim('anim-energy', { steps: stack.parts.length, draw, caption, stepMs: 1500 });
        $('en-mode').addEventListener('change', () => { which = $('en-mode').value; stack = M.energyStack(D.breakeven, which); A.restart(stack.parts.length); });
        redraws.push(A.redraw);
    }

    // ── slide 08: the what-if explorer ──
    if ($('exp-be')) {
        Object.keys(D.pPi).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = k; if (k === 'thermo 10 mW/π') o.selected = true; $('be-tech').appendChild(o); });
        D.e14.figures.max_uw.series[0].x.forEach((dbm, i) => { const uw = D.e14.figures.max_uw.series[0].y[i]; if (uw < 1) return;
            const o = document.createElement('option'); o.value = String(dbm); o.textContent = `${dbm} dBm, ${uw} per laser`; if (dbm === 20) o.selected = true; $('be-laser').appendChild(o); });
        function update() {
            const S = +$('be-s').value, bits = +$('be-bits').value, tech = $('be-tech').value, E = +$('be-e').value, dbm = +$('be-laser').value;
            $('be-s-val').textContent = S;
            const s0 = D.e14.figures.max_uw.series[0], F = s0.y[s0.x.indexOf(dbm)];
            const c = M.chip({ p_pi_mW: D.pPi[tech], E_conv: E, fanout: F, laser_mW: 10 ** (dbm / 10) });
            const a = M.approxStage(c, S, bits), eff = M.e16Bits(D, S, bits), dig = M.digitalButterfly(M.chip(), eff), need = M.breakevenEconv(c, S, dig, bits);
            $('be-photonic').textContent = g4(a.total); $('be-digital').textContent = g4(dig); $('be-ratio').textContent = g4(a.total / dig);
            $('be-need').textContent = need === null ? 'never (static alone exceeds digital)' : g4(need);
            // the bar: terms on a log axis, so the digital figure stays visible
            const cv = $('cv-be'), narrow = narrowOf(cv), { g, w, h } = window.fopCanvas(cv, narrow ? 0.8 : 0.34), px = font(g, w);
            const terms = [['crossings', a.crossings, 'blue'], ['twiddles', a.twiddles, 'violet'], ['laser', a.laser, 'amber'], ['phase shifters', a.phase_shifters, 'orange']];
            const lo = 1e-4, hi = 100, L = g.measureText('phase shifters·').width + 14, R = 12, rowH = (h - 3 * px) / (terms.length + 2);
            const X = v => L + (Math.log10(Math.max(v, lo)) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) * (w - L - R);
            for (let e = -4; e <= 2; e++) { line(g, [[X(10 ** e), 4], [X(10 ** e), h - 2.4 * px]], col('border'), 0.5); txt(g, g4(10 ** e), X(10 ** e), h - 1.2 * px, col('sec'), 'center'); }
            [...terms, ['photonic total', a.total, 'text'], ['digital matched', dig, 'acc']].forEach(([n, v, cc], i) => {
                const y = 4 + i * rowH; g.fillStyle = col(cc); g.globalAlpha = 0.85; g.fillRect(L, y + rowH * 0.2, Math.max(1, X(v) - L), rowH * 0.6); g.globalAlpha = 1;
                txt(g, n, L - 6, y + rowH * 0.55 + px * 0.3, col('text'), 'right'); txt(g, g4(v), Math.min(X(v) + 4, w - R - 6 * px), y + rowH * 0.55 + px * 0.3, col('sec'));
            });
            line(g, [[X(dig), 4], [X(dig), h - 2.4 * px]], col('acc'), 1.5, [5, 4]);
            window.fopFig.be = { S, bits, tech, E, dbm, photonic: a.total, digital: dig, need };
        }
        ['be-s'].forEach(i => $(i).addEventListener('input', update));
        ['be-bits', 'be-tech', 'be-e', 'be-laser'].forEach(i => $(i).addEventListener('change', update));
        update(); redraws.push(update);
    }

    // ── slide 09: laser margin and heater power ──
    if ($('cv-margin')) {
        const f = D.e14.figures.margin_vs_units;
        const draw = () => {
            chart($('cv-margin'), { xlog: true, xlabel: 'units U on one laser', ylabel: 'margin [dB]', series: f.series.map(s => ({ name: s.name, x: s.x, y: s.y, color: 'teal' })),
                hlines: f.annotations.map((a, i) => ({ y: a.y, label: a.label, color: i ? 'orange' : 'amber' })) });
            const hf = D.e14.figures.heaters;
            chart($('cv-heaters'), { xlog: true, ylog: true, xlabel: 'units U', ylabel: 'hold power [W]', series: hf.series.filter(s => s.name !== 'nv').map((s, i) => ({ name: s.name, x: s.x, y: s.y, color: PAL[i] })),
                hlines: [{ y: hf.annotations[0].y, label: hf.annotations[0].label, color: 'orange' }] });
            window.fopFig.limits = { margin: f.series[0].y.slice() };
        };
        draw(); redraws.push(draw);
    }

    // ── slide 10: temperature map, and calibration through U ──
    if ($('cv-tmap')) {
        const tm = D.e14.temperature_map, n = tm.rows.length;
        const draw = () => {
            const cv = $('cv-tmap'), { g, w, h } = window.fopCanvas(cv, 1.0), px = font(g, w);
            let lo = Infinity, hi = -Infinity; tm.rows.forEach(r => r.forEach(v => { lo = Math.min(lo, v); hi = Math.max(hi, v); }));
            const off = document.createElement('canvas'); off.width = n; off.height = n;
            const og = off.getContext('2d'), im = og.createImageData(n, n);
            const c0 = [35, 30, 26], c1 = [151, 205, 198], c2 = [227, 177, 116], c3 = [222, 128, 90];
            tm.rows.forEach((r, y) => r.forEach((v, x) => { const t = (v - lo) / ((hi - lo) || 1), seg = t < 0.5 ? [c0, c1, t / 0.5] : t < 0.8 ? [c1, c2, (t - 0.5) / 0.3] : [c2, c3, (t - 0.8) / 0.2];
                const i = 4 * (y * n + x); for (let k = 0; k < 3; k++) im.data[i + k] = seg[0][k] + seg[2] * (seg[1][k] - seg[0][k]); im.data[i + 3] = 255; }));
            og.putImageData(im, 0, 0); g.imageSmoothingEnabled = false;
            const size = Math.min(w, h) - 3 * px; g.drawImage(off, (w - size) / 2, 0, size, size);
            txt(g, `map values ${g4(lo)} to ${g4(hi)} K, ${g4(n * tm.cell_mm)} mm square`, w / 2, h - 6, col('sec'), 'center');
            window.fopFig.tmap = { n, lo, hi };
        };
        draw(); redraws.push(draw);
    }
    if ($('anim-cal')) {
        const US = D.e15.figures['in_service_0.01'].series[0].x;
        const frac = (drift, P, i) => D.e15.figures[`in_service_${drift}`].series.find(s => s.name === `P = ${P}`).y[i];
        const start = (P, i) => D.e15.figures.startup.series.find(s => s.name === `P = ${P}`).y[i];
        function draw(step, f) {
            const drift = $('cal-drift').value, P = $('cal-p').value, cv = $('cv-cal'), { g, w, h } = window.fopCanvas(cv, 1.0), px = font(g, w);
            const fr = frac(drift, P, step), cells = 64, side = Math.floor((Math.min(w, h - 5 * px)) / 8), on = Math.round(fr * cells * ease(Math.max(f, 0.001)) + fr * cells * (1 - ease(Math.max(f, 0.001))));
            const x0 = (w - side * 8) / 2;
            for (let i = 0; i < cells; i++) { const x = x0 + (i % 8) * side, y = 2 * px + Math.floor(i / 8) * side;
                if (i < on) { g.fillStyle = col('teal'); g.fillRect(x + 1, y + 1, side - 2, side - 2); } else { g.strokeStyle = col('orange'); g.strokeRect(x + 1, y + 1, side - 2, side - 2); hatch(g, x + 1, y + 1, side - 2, side - 2, col('orange')); } }
            txt(g, `U = ${US[step].toLocaleString('en-GB')}: ${g4(fr)} in service`, w / 2, px + 2, fr >= 0.9 ? col('acc') : col('orange'), 'center');
            txt(g, `start-up calibration ${g4(start(P, step))} s`, w / 2, h - 6, col('sec'), 'center');
            window.fopFig.cal = { drift, P, step, U: US[step], fraction: fr };
        }
        const caption = s => { const drift = $('cal-drift').value, P = $('cal-p').value, fr = frac(drift, P, s);
            return `U = ${US[s].toLocaleString('en-GB')} units, drift ${drift} rad/√s, ${P} calibrated at once: ${g4(fr)} of units in service${fr < 0.9 ? ', below 0.9: calibration-limited' : ''}; start-up takes ${g4(start(P, s))} s.`; };
        const A = window.FopAnim('anim-cal', { steps: US.length, draw, caption, stepMs: 1500 });
        ['cal-drift', 'cal-p'].forEach(i => $(i).addEventListener('change', () => A.restart(US.length)));
        redraws.push(A.redraw);
    }

    // ── slide 13: Amdahl, one variant per step ──
    if ($('anim-amdahl')) {
        const P = D.series.prefill_2048, LL = D.series.prefill_lm_last;
        const V = [['Transformer (Llama-3-8B)', P.transformer.optical], ['FNet-shaped (non-causal)', P.fnet.optical], ['Hyena (order 2)', P.hyena.optical],
                   ['Hybrid 1:3 attention:Hyena', P.hybrid.optical], ['Block-circulant, LM head every token', P.hyena_circ.optical],
                   ['Block-circulant, LM head last token', LL.hyena_circ['2048'].optical]];
        function draw(step, frac) {
            const cv = $('cv-amdahl'), narrow = narrowOf(cv), { g, w, h } = window.fopCanvas(cv, narrow ? 1.05 : 0.45), px = font(g, w);
            const L = narrow ? 8 : w * 0.34, top = narrow ? 4 : 6, rowH = (h - 2 * px - top) / V.length, bw = narrow ? w - 16 : w - L - 90;
            V.forEach(([name, s], i) => {
                const y = top + i * rowH, act = i === step, t = i < step ? 1 : i === step ? ease(frac) : 0;
                g.globalAlpha = i > step ? 0.35 : 1;
                const bx = narrow ? 8 : L, by = narrow ? y + px + 4 : y + rowH * 0.2, bh = narrow ? rowH - px - 10 : rowH * 0.6;
                g.fillStyle = col('code'); g.fillRect(bx, by, bw, bh);
                g.fillStyle = act ? col('acc') : col('teal'); g.fillRect(bx, by, bw * s * t, bh);
                txt(g, name, narrow ? 8 : L - 8, narrow ? y + px : y + rowH * 0.5 + px * 0.35, act ? col('acc') : col('text'), narrow ? 'left' : 'right');
                txt(g, `${(s * 100).toFixed(2)}% · ${M.amdahl(s).toFixed(3)}×`, narrow ? w - 8 : bx + bw + 6, narrow ? y + px : by + bh * 0.5 + px * 0.35, col('sec'), narrow ? 'right' : 'left');
                g.globalAlpha = 1;
            });
            txt(g, narrow ? 'transform share · Amdahl bound' : 'share of prefill FLOPs that is transform work · Amdahl bound', 8, h - 4, col('sec'));
            window.fopFig.amdahl = { step, share: V[step][1], bound: M.amdahl(V[step][1]) };
        }
        const caption = s => `${V[s][0]}: ${(V[s][1] * 100).toFixed(2)}% of prefill FLOPs at 2,048 tokens is transform work, so making it free speeds prefill by at most ${M.amdahl(V[s][1]).toFixed(3)}×.`;
        const A = window.FopAnim('anim-amdahl', { steps: V.length, draw, caption, stepMs: 1800 });
        redraws.push(A.redraw);
    }

    // ── slide 14: the FP4 E2M1 grid ──
    if ($('svg-fp4')) {
        const svg = $('svg-fp4'), X = v => 40 + v / 6 * 560;
        svgEl(svg, 'path', { d: 'M40 70 H600', class: 's-line' });
        M.FP4_GRID.forEach(v => { svgEl(svg, 'circle', { cx: X(v), cy: 70, r: 7, fill: col('violet') }); svgEl(svg, 'text', { x: X(v), y: 52, class: 's-t', 'text-anchor': 'middle' }, String(v)); });
        svgEl(svg, 'text', { x: 40, y: 22, class: 's-a' }, 'FP4 E2M1 magnitudes (sign bit separate)');
        for (let i = 0; i < 16; i++) svgEl(svg, 'rect', { x: 40 + i * 30, y: 110, width: 26, height: 26, rx: 3, class: 's-box' });
        svgEl(svg, 'rect', { x: 530, y: 110, width: 70, height: 26, rx: 3, class: 's-acc' });
        svgEl(svg, 'text', { x: 538, y: 128, class: 's-d' }, 'E4M3');
        svgEl(svg, 'text', { x: 40, y: 158, class: 's-d' }, '16 FP4 values share one scale (NVFP4)');
        window.fopFig.fp4 = { grid: M.FP4_GRID.slice() };
    }

    // ── slide 16b: native size N (e19) ──
    if ($('cv-n-levels')) {
        const f = D.e19.figures, mesh = D.e19.mesh_v04_chained;
        const draw = () => {
            const lv = f.levels.series[0];
            chart($('cv-n-levels'), { xlog: true, ylog: true, xlabel: 'native size N', ylabel: 'levels on one output', legend: false,
                series: [{ name: 'levels', x: lv.x, y: lv.y, color: 'orange' }], xfmt: v => String(v) });
            const ap = f.approximate.series;
            chart($('cv-n-bits'), { xlog: true, xlabel: 'native size N', ylabel: 'effective bits', ymin: 0, ymax: 3.5, xfmt: v => String(v),
                series: ap.map((s, i) => ({ name: s.name, x: s.x, y: s.y, color: i ? 'acc' : 'teal' })),
                hlines: [{ y: mesh, label: `v0.4 mesh, chained ${g4(mesh)}`, color: 'orange' }] });
            const bb = f.breakeven.series[0];
            window.fopFig.native = { levels: lv.y.slice(), chained: ap[1].y.slice(), bound: bb.y.slice() };
        };
        draw(); redraws.push(draw);
    }

    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => redraws.forEach(f => f()), 150); });
})();
