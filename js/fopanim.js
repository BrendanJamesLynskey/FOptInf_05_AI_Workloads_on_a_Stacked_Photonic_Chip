// Copied from FOptInf 01 (reference/FOptInf_01.html): the series' stepped-animation controller and helpers. One fix:
// the scrub bar's value is read before pause() re-renders it (in deck 01 the re-render reset it, so scrubbing did nothing).
// FOptInf 01: one stepped-animation controller for every mechanism in the deck, plus small drawing helpers.
// A figure supplies steps (a count), draw(step, frac) and caption(step); the controller adds play/pause, step back and
// forward, a scrub bar, speed, reset, keyboard control (space, arrows), an aria-live caption, pauses off-screen and never
// auto-plays under prefers-reduced-motion. window.fopAnims[id] exposes each controller to browser_check.js.
(function () {
    'use strict';
    const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.fopAnims = {};
    window.FopAnim = function (id, opts) {
        const root = document.getElementById(id);
        let steps = opts.steps; const stepMs = opts.stepMs || 1400;
        const bar = document.createElement('div');
        bar.className = 'anim-controls';
        bar.innerHTML = `<button type="button" class="btn secondary" data-a="reset" aria-label="Reset">&#8634; Reset</button>`
            + `<button type="button" class="btn secondary" data-a="back" aria-label="Step back">&#9664; Step</button>`
            + `<button type="button" class="btn" data-a="play" aria-label="Play">&#9654; Play</button>`
            + `<button type="button" class="btn secondary" data-a="fwd" aria-label="Step forward">Step &#9654;</button>`
            + `<input type="range" min="0" max="${steps - 1}" value="0" aria-label="Step">`
            + `<select aria-label="Speed"><option value="0.25">0.25&times;</option><option value="0.5">0.5&times;</option><option value="1" selected>1&times;</option><option value="2">2&times;</option><option value="4">4&times;</option></select>`
            + `<span class="anim-count"></span>`;
        const cap = document.createElement('p');
        cap.className = 'anim-caption'; cap.setAttribute('aria-live', 'polite');
        root.appendChild(bar); root.appendChild(cap);
        root.tabIndex = 0; root.classList.add('anim');
        const $ = s => bar.querySelector(s), scrub = $('input'), speed = $('select'), playBtn = $('[data-a="play"]');
        const st = { step: 0, frac: 1, playing: false, visible: false, userPaused: reduced(), last: 0, raf: 0 };
        function render() {
            opts.draw(st.step, st.frac);
            scrub.value = st.step;
            $('.anim-count').textContent = `${st.step + 1} / ${steps}`;
            const c = opts.caption(st.step);
            if (cap.textContent !== c) cap.textContent = c;
        }
        function go(s, animate) {
            st.step = (s + steps) % steps; st.frac = animate ? 0 : 1; render();
        }
        function tick(ts) {
            if (!st.playing) return;
            const dt = st.last ? ts - st.last : 0; st.last = ts;
            st.frac = Math.min(1, st.frac + dt * Number(speed.value) / (stepMs * 0.6));
            if (st.frac >= 1) {
                st.hold = (st.hold || 0) + dt * Number(speed.value);
                if (st.hold > stepMs * 0.4) { st.hold = 0; go(st.step + 1, true); }
            }
            opts.draw(st.step, st.frac);
            st.raf = requestAnimationFrame(tick);
        }
        function play() {
            if (st.playing) return;
            st.playing = true; st.last = 0; playBtn.innerHTML = '&#10074;&#10074; Pause'; playBtn.setAttribute('aria-label', 'Pause');
            st.raf = requestAnimationFrame(tick);
        }
        function pause() {
            st.playing = false; cancelAnimationFrame(st.raf); st.frac = 1; render();
            playBtn.innerHTML = '&#9654; Play'; playBtn.setAttribute('aria-label', 'Play');
        }
        bar.addEventListener('click', e => {
            const a = e.target.closest('button'); if (!a) return;
            const k = a.dataset.a;
            if (k === 'play') { if (st.playing) { st.userPaused = true; pause(); } else { st.userPaused = false; play(); } }
            else { st.userPaused = true; pause(); go(k === 'reset' ? 0 : st.step + (k === 'fwd' ? 1 : -1), false); }
        });
        scrub.addEventListener('input', () => { const v = Number(scrub.value); st.userPaused = true; pause(); go(v, false); });   // read before pause() re-renders
        root.addEventListener('keydown', e => {
            if (e.target.closest('select, input')) return;
            if (e.key === ' ') { e.preventDefault(); bar.querySelector('[data-a="play"]').click(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); $('[data-a="fwd"]').click(); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); $('[data-a="back"]').click(); }
        });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(es => es.forEach(en => {
                st.visible = en.isIntersecting;
                if (st.visible && !st.userPaused && !reduced()) play(); else if (!st.visible && st.playing) pause();
            }), { threshold: 0.3 }).observe(root);
        }
        render();
        const api = {
            get step() { return st.step; }, get playing() { return st.playing; }, get steps() { return steps; },
            // a parameter changed the model: new step count, restart from step 0 (keeps playing if it was)
            restart(n) { steps = n; scrub.max = n - 1; go(0, st.playing); },
            caption: () => cap.textContent, set(s) { st.userPaused = true; pause(); go(s, false); return api; },
            play() { st.userPaused = false; play(); }, pause() { st.userPaused = true; pause(); }, redraw: render,
        };
        window.fopAnims[id] = api;
        return api;
    };

    // the deck's colours, read from its CSS variables so canvas and SVG match the theme
    window.fopColor = function (name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#efe8dc';
    };
    // size a canvas's backing store to its CSS box (sharp on phones and retina), return context and CSS size
    window.fopCanvas = function (cv, aspect) {
        const w = Math.max(240, cv.clientWidth || cv.parentElement.clientWidth || 600), h = Math.round(w * aspect);
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
        cv.style.height = h + 'px';
        const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
        return { g, w, h };
    };
    // the numbers in a results table already on the slide (built from results.md), for charts that cannot drift from it
    window.fopTable = function (table) {
        const rows = [...table.querySelectorAll('tr')].map(r => [...r.children].map(c => c.textContent.trim()));
        return { head: rows[0], rows: rows.slice(1) };
    };
    window.fopNum = s => Number(String(s).replace(/,/g, ''));
})();

