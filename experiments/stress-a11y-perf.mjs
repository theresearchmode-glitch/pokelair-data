// Stress test: accessibility basics and performance.
//   a11y: every visible control has a name; keyboard focus is visible; Tab reaches the main actions; text contrast (light + dark)
//   perf: first render, time to open each heavy view on a full team, long tasks over 200 ms, memory after 1,000 view switches
// Usage: node experiments/stress-a11y-perf.mjs [--switches N]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'stress-ap.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const si = process.argv.indexOf('--switches'), SWITCHES = si > 0 ? +process.argv[si + 1] : 1000;
const VIEWS = ['home', 'build', 'auto', 'teams', 'matchup', 'coverage', 'types', 'ratings', 'meta', 'top', 'cores', 'events', 'sets', 'box', 'speed', 'calc', 'gauntlet', 'arch'];
const TEAM = `Raichu @ Raichunite X\nAbility: Lightning Rod\nJolly Nature\n- Fake Out\n- Protect\n- Volt Tackle\n- Volt Switch\n\nSneasler @ Psychic Seed\nAbility: Unburden\nAdamant Nature\n- Close Combat\n- Dire Claw\n- Protect\n- Fake Out\n\nPrimarina @ Leftovers\nAbility: Liquid Voice\nModest Nature\n- Hyper Voice\n- Protect\n- Moonblast\n- Calm Mind\n\nCharizard @ Charizardite Y\nAbility: Blaze\nTimid Nature\n- Heat Wave\n- Protect\n- Weather Ball\n- Solar Beam\n\nFarigiraf @ Sitrus Berry\nAbility: Armor Tail\nBold Nature\n- Trick Room\n- Helping Hand\n- Psychic\n- Thunderbolt\n\nHydreigon @ Choice Scarf\nAbility: Levitate\nModest Nature\n- Dark Pulse\n- Draco Meteor\n- Earth Power\n- Snarl`;
const initDb = D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null};
  window.__long = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__long.push({d: Math.round(e.duration), t: Math.round(e.startTime), v: window.__curView || ''}); }).observe({type: 'longtask', buffered: true}); } catch (e) {} };
const out = {a11y: {}, perf: {}}, problems = [];
const b = await chromium.launch({args: ['--enable-precise-memory-info', '--js-flags=--expose-gc']});

// ---------- a11y ----------
for (const scheme of ['light', 'dark']) for (const [w, h] of [[375, 812], [1366, 900]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, colorScheme: scheme, isMobile: w < 700, hasTouch: w < 700}), pg = await ctx.newPage();
  await pg.addInitScript(initDb, D); await pg.goto('file://' + page); await pg.waitForTimeout(2200);
  await pg.evaluate(t => window.__ev(`(()=>{const u=parsePaste(${JSON.stringify(t)});S.slots=normSlots(u.slots);fixSlots();render()})()`), TEAM);
  const tag = `${scheme}/${w}`, unnamed = new Map(), lowC = new Map();
  for (const v of VIEWS) { await pg.evaluate(v => window.__ev(`setView('${v}');window.scrollTo(0,0)`), v); await pg.waitForTimeout(v === 'gauntlet' || v === 'auto' ? 2500 : 500);
    const r = await pg.evaluate(() => {
      const vis = e => e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden';
      const nameOf = e => { const l = e.getAttribute('aria-label') || e.getAttribute('title') || (e.getAttribute('aria-labelledby') && (document.getElementById(e.getAttribute('aria-labelledby')) || {}).textContent) || '';
        if (l.trim()) return l; if (e.labels && e.labels.length) return [...e.labels].map(x => x.textContent).join(' '); const t = (e.innerText || e.textContent || '').trim(); if (t) return t;
        const img = e.querySelector('img[alt]'); if (img && img.alt.trim()) return img.alt; return e.getAttribute('placeholder') || ''; };
      const noName = [...document.querySelectorAll('button, [role=button], a[href], input:not([type=hidden]), select, textarea, summary')].filter(e => vis(e) && !nameOf(e).trim()).map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''));
      // contrast
      const rgb = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; };
      const lum = c => { const f = x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
      const bgOf = e => { let n = e; while (n) { const cs = getComputedStyle(n); if (cs.backgroundImage && cs.backgroundImage !== 'none' && n !== document.body && n !== document.documentElement) return null; const c = rgb(cs.backgroundColor); if (c && c.a > .9) return c; n = n.parentElement; } return rgb(getComputedStyle(document.body).backgroundColor) || {r: 255, g: 255, b: 255}; };
      const low = []; const w = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT); let n, k = 0;
      while ((n = w.nextNode()) && k < 1500) { const e = n.parentElement; if (!e || !n.textContent.trim() || !vis(e)) continue; k++; const cs = getComputedStyle(e); const fg = rgb(cs.color), bg = bgOf(e); if (!fg || !bg || fg.a < .5 || +cs.opacity < .99) continue;
        const L1 = lum(fg), L2 = lum(bg), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05), big = parseFloat(cs.fontSize) >= 18.6 || (parseFloat(cs.fontSize) >= 14 && +cs.fontWeight >= 700);
        if (cr < (big ? 3 : 4.5) && !e.closest('[disabled], .disabled, [aria-disabled=true]')) low.push(`${cr.toFixed(2)} "${n.textContent.trim().slice(0, 30)}" (${e.tagName.toLowerCase()}.${(e.className || '').toString().split(' ')[0]})`); }
      return {noName, low}; });
    for (const x of r.noName) unnamed.set(x, (unnamed.get(x) || '') + (unnamed.has(x) ? '' : v));
    for (const x of r.low) { const key = x.replace(/^[\d.]+ /, '').replace(/"[^"]*"/, '').trim(); if (!lowC.has(key)) lowC.set(key, v + ' ' + x); } }
  // keyboard: Tab from the top, record what gets focus and whether focus is visible
  await pg.evaluate(() => window.__ev(`setView('home');window.scrollTo(0,0)`)); await pg.waitForTimeout(400); await pg.evaluate(() => document.activeElement && document.activeElement.blur());
  const reached = [], invisible = new Set();
  for (let i = 0; i < 60; i++) { await pg.keyboard.press('Tab'); const f = await pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e);
      const shows = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
      return {t: (e.getAttribute('aria-label') || e.innerText || e.value || e.tagName).trim().slice(0, 30), shows, id: e.tagName.toLowerCase() + '.' + ((e.className || '').toString().split(' ')[0])}; });
    if (!f) continue; reached.push(f.t); if (!f.shows) invisible.add(f.id + ' "' + f.t + '"'); }
  const must = ['Home', 'Team', 'Build', 'Matchup', 'Meta'], miss = must.filter(m => !reached.some(r => r.toLowerCase().startsWith(m.toLowerCase())));
  out.a11y[tag] = {unnamed: [...unnamed].map(([k, v]) => `${k} (${v})`), lowContrast: [...lowC.values()].slice(0, 25), lowContrastCount: lowC.size, focusInvisible: [...invisible].slice(0, 20), tabReached: reached.length, mainNavMissed: miss};
  await ctx.close(); }

// ---------- perf ----------
{ const ctx = await b.newContext({viewport: {width: 1366, height: 900}}), pg = await ctx.newPage(); await pg.addInitScript(initDb, D);
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Performance.enable');
  const t0 = Date.now(); await pg.goto('file://' + page);
  await pg.waitForFunction(() => document.querySelector('main') && document.querySelector('main').innerText.length > 300, null, {timeout: 20000}); out.perf.firstRenderMs = Date.now() - t0;
  await pg.waitForFunction(() => { try { return window.__ev('!!META.results && !!META.model'); } catch (e) { return false; } }, null, {timeout: 20000}).catch(() => {}); await pg.waitForTimeout(800); out.perf.withDataMs = Date.now() - t0;
  await pg.evaluate(t => window.__ev(`(()=>{const u=parsePaste(${JSON.stringify(t)});S.slots=normSlots(u.slots);fixSlots();planCache={key:null,plans:[]};render()})()`), TEAM); await pg.waitForTimeout(500);
  const open = {};
  for (const v of VIEWS) { const r = await pg.evaluate(v => { window.__curView = v; const t = performance.now(); window.__ev(`setView('${v}')`); const sync = performance.now() - t; return new Promise(res => requestAnimationFrame(() => setTimeout(() => res({sync: Math.round(sync), paint: Math.round(performance.now() - t)}), 0))); }, v);
    open[v] = r; await pg.waitForTimeout(v === 'gauntlet' || v === 'auto' ? 3000 : 300); }
  // second visit (warm caches)
  const warm = {}; for (const v of ['build', 'matchup', 'calc', 'speed', 'gauntlet', 'ratings']) { warm[v] = await pg.evaluate(v => { window.__curView = v + '(warm)'; const t = performance.now(); window.__ev(`setView('${v}')`); return Math.round(performance.now() - t); }, v); await pg.waitForTimeout(200); }
  out.perf.openMs = open; out.perf.warmMs = warm;
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); await pg.waitForTimeout(300); return Math.round((await pg.evaluate(() => performance.memory.usedJSHeapSize)) / 1048576); };
  const m0 = await heap(), t1 = Date.now();
  for (let i = 0; i < SWITCHES; i++) { await pg.evaluate(v => { window.__curView = v; window.__ev(`setView('${v}')`); }, VIEWS[i % VIEWS.length]); if (i % 100 === 0) await pg.waitForTimeout(50); }
  await pg.waitForTimeout(3000); const m1 = await heap();
  const dom = await pg.evaluate(() => document.getElementsByTagName('*').length), lst = await cdp.send('Performance.getMetrics');
  const met = Object.fromEntries(lst.metrics.map(x => [x.name, x.value]));
  out.perf.memory = {startMB: m0, after1000SwitchesMB: m1, switches: SWITCHES, switchSec: Math.round((Date.now() - t1) / 1000), domNodes: dom, jsEventListeners: met.JSEventListeners, documents: met.Documents};
  const long = await pg.evaluate(() => window.__long);
  const byV = {}; for (const l of long.filter(l => l.d > 200)) { byV[l.v || 'load'] = byV[l.v || 'load'] || []; byV[l.v || 'load'].push(l.d); }
  out.perf.longTasksOver200 = Object.fromEntries(Object.entries(byV).map(([k, v]) => [k, {count: v.length, max: Math.max(...v)}]));
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);
console.log(JSON.stringify(out, null, 1));
