// Readability check: every visible piece of text on the main views, in light and dark, against its real background.
// Flags text below the WCAG AA contrast ratio (4.5:1, or 3:1 for large text), grouped by element class.
// Usage: node experiments/contrast.mjs [views] [width]
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const views = (process.argv[2] || 'home,build,auto,coverage,matchup,ratings,meta,top,events,calc,speed,gauntlet,teams').split(','), W = +(process.argv[3] || 1280);
const page = APP + 'contrast.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8'));
const b = await chromium.launch(), all = {};
for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({viewport: {width: W, height: 900}, colorScheme: scheme}), pg = await ctx.newPage();
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000);
  for (const v of views) {
    await pg.evaluate(v => { const x = document.querySelector(`.sidenav [data-view="${v}"]`) || document.querySelector(`[data-view="${v}"]`); if (x) x.click(); }, v);
    if (v === 'auto') { await pg.evaluate(() => { const x = document.getElementById('abBtn'); if (x) x.click(); }); await pg.waitForTimeout(5000); }
    await pg.waitForTimeout(v === 'gauntlet' || v === 'coverage' ? 2500 : 600);
    const res = await pg.evaluate(() => {
      const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; };
      const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
      const blend = (top, bot) => ({r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1});
      // the solid colour behind an element (stops, uncertain, at gradients and images)
      const bgOf = el => { const layers = []; let e = el, unsure = false;
        while (e && e.nodeType === 1) { const s = getComputedStyle(e); if (s.backgroundImage && s.backgroundImage !== 'none') unsure = true; const c = parse(s.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } e = e.parentElement; }
        let bg = {r: 255, g: 255, b: 255, a: 1}; if (!layers.length || layers[layers.length - 1].a < 1) { const bc = parse(getComputedStyle(document.body).backgroundColor); if (bc && bc.a > 0) bg = bc; }
        for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg); return {bg, unsure}; };
      const out = [], seen = new Set(), pane = document.querySelector('.view:not([hidden])') || document.body;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) { if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
        if (!(pane.contains(el) || el.closest('header,.tabs'))) continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; const s = getComputedStyle(el); if (s.visibility === 'hidden' || +s.opacity === 0) continue;
        let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= +getComputedStyle(e).opacity;
        const fg0 = parse(s.color); if (!fg0) continue; const {bg, unsure} = bgOf(el); const fg = blend({...fg0, a: fg0.a * op}, bg);
        const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
        const size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700, large = size >= 24 || (size >= 18.66 && bold), need = large ? 3 : 4.5;
        if (ratio < need) out.push({cls: (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase()) + (el.parentElement && el.parentElement.className && typeof el.parentElement.className === 'string' ? ' < .' + el.parentElement.className.trim().split(/\s+/)[0] : ''), text: n.textContent.trim().slice(0, 40), ratio: +ratio.toFixed(2), need, size, unsure}); }
      return out; });
    for (const x of res) { const k = scheme + ' ' + x.cls; const g = all[k] || (all[k] = {n: 0, views: new Set(), ex: x.text, worst: x.ratio, need: x.need, size: x.size, unsure: x.unsure}); g.n++; g.views.add(v); g.worst = Math.min(g.worst, x.ratio); }
  }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);
const rows = Object.entries(all).filter(([, g]) => !g.unsure).sort((a, b) => b[1].n - a[1].n);
console.log(`${rows.length} element types below the readability standard (solid backgrounds only; ${Object.values(all).filter(g => g.unsure).length} more over gradients/images not judged)`);
for (const [k, g] of rows.slice(0, 60)) console.log(`${g.n.toString().padStart(4)}  ${g.worst.toFixed(2)}/${g.need}  ${g.size}px  ${k}  "${g.ex}"  [${[...g.views].join(',')}]`);
