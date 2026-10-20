#!/usr/bin/env node
// Browser check for the deck (playwright, chromium), at 1280 and 390 px, light and dark colour schemes:
//   - no page errors, no console errors, no request leaves the page's own files, no horizontal overflow;
//   - every animation steps forward, back and resets, and plays; under prefers-reduced-motion none moves on its own;
//   - every explorer's readouts match the Python fixtures (js/tests/fixtures.json, written by analysis/build.py);
//   - screenshots of every slide at 390 px into artifacts/.
// Run: node tools/browser_check.js   (needs playwright; set PW_CHROMIUM to a chromium binary to skip the download)
'use strict';
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const FIX = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'tests', 'fixtures.json'), 'utf8'));
const ART = path.join(ROOT, 'artifacts');
const fails = [];
const fail = (where, msg) => { fails.push(`${where}: ${msg}`); console.log(`  FAIL ${msg}`); };

async function open(browser, width, scheme, reduced) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: reduced ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    page.on('request', r => { if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) errors.push(`external request: ${r.url()}`); });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    return { ctx, page, errors };
}

async function setInput(page, id, value) {
    await page.evaluate(([id, value]) => {
        const el = document.getElementById(id); el.value = value;
        el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    }, [id, value]);
}

async function run() {
    const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
    fs.mkdirSync(ART, { recursive: true });
    for (const width of [1280, 390]) {
        for (const scheme of ['light', 'dark']) {
            const where = `${width}px ${scheme}`;
            console.log(where);
            const { ctx, page, errors } = await open(browser, width, scheme, false);
            // scroll through every slide so lazy figures draw and animations start
            const slides = await page.$$eval('section.slide', s => s.map(x => x.id));
            for (const id of slides) { await page.evaluate(i => document.getElementById(i).scrollIntoView(), id); await page.waitForTimeout(120); }
            const over = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth,
                wide: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(e).position !== 'fixed').slice(0, 5).map(e => `${e.tagName}#${e.id}.${e.className}`) }));
            if (over.sw > over.iw) fail(where, `horizontal overflow ${over.sw} > ${over.iw}: ${over.wide.join(', ')}`);
            // every table cell is on screen at 390 px (cards below 700 px), not hidden inside a scroll box
            if (width === 390) {
                const off = await page.evaluate(() => [...document.querySelectorAll('section.slide td, section.slide th')]
                    .filter(c => c.getClientRects().length && getComputedStyle(c).display !== 'none' && c.closest('tr') && getComputedStyle(c.closest('tr')).display !== 'none')
                    .filter(c => { const r = c.getBoundingClientRect(); return r.left < -1 || r.right > window.innerWidth + 1; })
                    .map(c => `${c.closest('section').id}: ${c.textContent.trim().slice(0, 30)}`));
                if (off.length) fail(where, `${off.length} table cell(s) outside the viewport: ${off.slice(0, 5).join(' | ')}`);
            }
            // animations: step, back, reset, play
            const anims = await page.evaluate(() => Object.keys(window.fopAnims));
            const WANT = ['anim-system', 'anim-fft', 'anim-energy', 'anim-cal', 'anim-amdahl'];
            WANT.forEach(id => { if (!anims.includes(id)) fail(where, `missing animation ${id}`); });
            for (const id of anims) {
                const r = await page.evaluate(async id => {
                    const A = window.fopAnims[id], root = document.getElementById(id), click = a => root.querySelector(`[data-a="${a}"]`).click();
                    click('reset'); const s0 = A.step; click('fwd'); const s1 = A.step; const c1 = A.caption(); click('fwd'); click('back'); const s2 = A.step;
                    click('reset'); const s3 = A.step; A.play(); await new Promise(r => setTimeout(r, 2600)); const s4 = A.step, playing = A.playing; A.pause();
                    const scrub = root.querySelector('input[type="range"]'); scrub.value = String(A.steps - 1); scrub.dispatchEvent(new Event('input')); const s5 = A.step;
                    const live = root.querySelector('.anim-caption').getAttribute('aria-live');
                    return { s0, s1, s2, s3, s4, s5, steps: A.steps, playing, c1, live };
                }, id);
                if (!(r.s0 === 0 && r.s1 === 1 && r.s2 === 1 && r.s3 === 0 && r.s5 === r.steps - 1)) fail(where, `${id} stepping ${JSON.stringify(r)}`);
                if (!(r.playing && r.s4 > 0)) fail(where, `${id} did not play (${JSON.stringify(r)})`);
                if (r.live !== 'polite' || !r.c1) fail(where, `${id} caption`);
            }
            // explorers against the Python fixtures
            for (const ex of FIX.explorers) {
                for (const [id, v] of Object.entries(ex.inputs)) await setInput(page, id, v);
                for (const [id, want] of Object.entries(ex.readouts)) {
                    const got = (await page.textContent('#' + id)).trim();
                    if (got !== want) fail(where, `${ex.id} ${JSON.stringify(ex.inputs)}: #${id} shows ${got}, Python ${want}`);
                }
            }
            // a model-state frame check: the FFT animation's crossings at S = 6, last stage
            await setInput(page, 'fft-mode', 'approx'); await setInput(page, 'fft-s', '6');
            const fft = await page.evaluate(() => { window.fopAnims['anim-fft'].set(5); return window.fopFig.fft; });
            if (fft.conversions !== 2 || fft.blocks !== 1) fail(where, `fft frame ${JSON.stringify(fft)}`);
            if (errors.length) fail(where, errors.join(' | '));
            if (width === 390 && scheme === 'dark') {
                for (const id of slides) {
                    const el = await page.$('#' + id);
                    await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
                    await el.screenshot({ path: path.join(ART, `${id}-390.png`) });
                }
            }
            await ctx.close();
        }
    }
    // reduced motion: nothing plays by itself
    for (const width of [1280, 390]) {
        const where = `${width}px reduced-motion`;
        console.log(where);
        const { ctx, page, errors } = await open(browser, width, 'dark', true);
        const slides = await page.$$eval('section.slide', s => s.map(x => x.id));
        for (const id of slides) { await page.evaluate(i => document.getElementById(i).scrollIntoView(), id); await page.waitForTimeout(150); }
        await page.waitForTimeout(1500);
        const st = await page.evaluate(() => Object.entries(window.fopAnims).map(([id, a]) => [id, a.step, a.playing]));
        st.forEach(([id, step, playing]) => { if (playing || step !== 0) fail(where, `${id} moved (step ${step}, playing ${playing})`); });
        if (errors.length) fail(where, errors.join(' | '));
        await ctx.close();
    }
    await browser.close();
    console.log(fails.length ? `\n${fails.length} failure(s)` : '\nbrowser check: all passed');
    process.exit(fails.length ? 1 : 0);
}
run().catch(e => { console.error(e); process.exit(2); });
