// C12 use test (Sim's rule C12, Nov 12): on the built new site, at 390 and 1440: tab through the whole page (every stop visible,
// none hidden), open and close every sheet on My Team (by its own button, then Escape), one change + Undo, reload keeps the team,
// My Box add / remove / Undo / sort / reload; zero console errors. Prints one line per check and a summary.
// Usage: node app/build.mjs --v2 && node experiments/v2-use.mjs [page.html]
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path'; import fs from 'node:fs'; import {createRequire} from 'node:module';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), require = createRequire(import.meta.url);
let pw; try { pw = require(path.join(ROOT, 'node_modules/playwright')); } catch (e) { pw = require('playwright'); }
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/history': rd('history.json'), 'meta/weekly': rd('weekly.json'), 'meta/track': rd('track.json'), 'meta/practice': rd('practice.json'), 'meta/calendar': rd('calendar.json')} /* same 13 docs as the behaviour harness (outside sweep, Nov 12) */;
const file = process.argv[2] || path.join(ROOT, 'app/dist/v2.html'), out = []; let fails = 0;
const say = (ok, w, t) => { if (!ok) fails++; out.push(`${ok ? 'ok  ' : 'FAIL'} ${String(w).padStart(4)}  ${t}`); };
const b = await pw.chromium.launch();
for (const w of [390, 1440]) {
  const ctx = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 900}, isMobile: w < 700, hasTouch: w < 700});
  await ctx.addInitScript(D => { window.__PL_TEST = true; const store = {}; window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: !!store[q], data: () => store[q]}), set: async (v) => { store[q] = v; }, update: async () => {}})} : null}; }, D);
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FILE|Not allowed to load/.test(m.text())) errs.push(m.text()); });
  await p.goto(pathToFileURL(file).href + '#team'); await p.waitForTimeout(5000);
  // 1. tab through the page: every stop is visible and not inside something hidden
  const stops = []; for (let i = 0; i < 400; i++) { await p.keyboard.press('Tab'); const s = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const r = e.getBoundingClientRect(); return {t: (e.getAttribute('aria-label') || e.innerText || e.tagName).trim().slice(0, 30), vis: r.width > 0 && r.height > 0 && !e.closest('[hidden],[inert]') && getComputedStyle(e).visibility !== 'hidden', foot: !!e.closest('footer')}; }); if (!s) break; stops.push(s); if (s.foot && stops.filter(x => x.foot).length > 3) break; }
  const bad = stops.filter(s => !s.vis); say(stops.length > 20 && !bad.length, w, `Tab through My Team: ${stops.length} stops, ${bad.length} hidden${bad.length ? ' (' + bad.slice(0, 3).map(s => s.t).join(', ') + ')' : ''}`);
  // 2. every sheet opens from its control and closes with Escape, focus returns to the page
  const sheets = [['Why this score?', () => [...document.querySelectorAll('button,a')].find(x => /Why this score/.test(x.innerText))], ['Game Plan', () => document.querySelector('[data-v2gplan]')], ['Team Sheet', () => document.querySelector('[data-v2sheetopen]')], ['Edit Set', () => [...document.querySelectorAll('button')].find(x => /^Edit Set$/.test(x.innerText.trim()))], ['Saved Teams', () => document.querySelector('[data-v2saved]')], ['Share', () => document.querySelector('[data-v2share]')], ['More', () => document.querySelector('[data-v2more]')], ['Search', () => document.querySelector('[data-v2search]')]];
  for (const [name, find] of sheets) { const ok = await p.evaluate(f => { const e = (0, eval)('(' + f + ')')(); if (!e) return false; e.scrollIntoView({block: 'center'}); e.click(); return true; }, find.toString());
    await p.waitForTimeout(700); const open = await p.evaluate(() => !!document.querySelector('.np-sheet')); await p.keyboard.press('Escape'); await p.waitForTimeout(500); const closed = await p.evaluate(() => !document.querySelector('.np-sheet'));
    say(ok && open && closed, w, `${name}: ${ok ? '' : 'no control; '}${open ? 'opens' : 'did not open'}, ${closed ? 'Escape closes' : 'Escape did not close'}`); }
  // Export and Full Tables from inside other places
  await p.evaluate(() => window.__ev('V2.openExport()')); await p.waitForTimeout(500); const ex = await p.evaluate(() => (document.querySelector('[data-expout]') || {}).value || ''); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  say(/ @ /.test(ex) && /Level: 50/.test(ex), w, `Export to Showdown: text ${ex.length} chars`);
  await p.evaluate(() => { const d = document.querySelector('[data-v2fix]'); if (d) d.open = true; }); await p.waitForTimeout(500); const tt = await p.evaluate(() => { const b = document.querySelector('[data-v2tytables]'); if (!b) return false; b.click(); return true; }); await p.waitForTimeout(600);
  const tables = await p.evaluate(() => document.querySelectorAll('.np-sheet table').length); await p.keyboard.press('Escape'); await p.waitForTimeout(400); say(tt && tables === 2, w, `Types -> Full Tables: ${tables} tables`);
  // 3. one change + Undo
  const before = await p.evaluate(() => window.__ev('members().map(m=>m.p.n).join()')); await p.evaluate(() => { const r = document.querySelector('[data-v2rm]'); if (r) r.click(); }); await p.waitForTimeout(800);
  const mid = await p.evaluate(() => window.__ev('members().length')); await p.evaluate(() => { const u = document.querySelector('#toastUndo,[data-undo]'); if (u) u.click(); }); await p.waitForTimeout(900);
  const after = await p.evaluate(() => window.__ev('members().map(m=>m.p.n).join()')); say(mid === 5 && after === before, w, `Remove then Undo: 6 -> ${mid} -> ${after === before ? 'same six back' : 'NOT the same six'}`);
  // 4. reload keeps the team
  await p.reload(); await p.waitForTimeout(5000); const re = await p.evaluate(() => window.__ev('members().map(m=>m.p.n).join()')); say(re === before, w, `Reload keeps the team (${re.split(',').length} Pokémon)`);
  // 5. My Box: add, remove, Undo, sort, reload
  await p.goto(pathToFileURL(file).href + '#box'); await p.waitForTimeout(3000); const n0 = await p.evaluate(() => window.__ev('S.box.length'));
  await p.evaluate(() => { const n = window.__ev("ROSTER.find(q=>!q.m&&!S.box.includes(q.n)).n"), x = document.createElement('button'); x.type = 'button'; x.dataset.bxaddn = n; document.body.appendChild(x); x.click(); x.remove(); }); await p.evaluate(() => { const s = document.querySelector('.np-sheet'); if (s) document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); }); await p.waitForTimeout(600); const n1 = await p.evaluate(() => window.__ev('S.box.length'));
  const rmOk = await p.evaluate(() => { const r = document.querySelector('[data-bxrm]'); if (!r) return false; r.click(); return true; }); await p.waitForTimeout(600); const n2 = await p.evaluate(() => window.__ev('S.box.length'));
  await p.evaluate(() => { const u = document.querySelector('[data-bxundo]'); if (u) u.click(); }); await p.waitForTimeout(600); const n3 = await p.evaluate(() => window.__ev('S.box.length'));
  say(n1 === n0 + 1 && rmOk && n2 === n1 - 1 && n3 === n1, w, `My Box: add ${n0}->${n1}, remove ->${n2}, Undo ->${n3}`);
  const sorted = await p.evaluate(() => { const b = document.querySelector('[data-v2slide="box-sort"] [data-v="rating"]'); if (!b) return false; b.click(); return true; }); await p.waitForTimeout(600); await p.reload(); await p.waitForTimeout(3500);
  const so = await p.evaluate(() => (document.querySelector('[data-v2slide="box-sort"] [aria-pressed="true"]') || {}).innerText || ''); say(sorted && /Rating/.test(so), w, `My Box sort Rating remembered after reload (${so.trim()})`);
  say(!errs.length, w, `console / page errors: ${errs.length}${errs.length ? ' (' + errs.slice(0, 2).join(' | ').slice(0, 160) + ')' : ''}`);
  await ctx.close(); }
await b.close(); console.log(out.join('\n')); console.log(`\nv2 use test: ${out.length - fails} ok, ${fails} FAIL`); process.exit(fails ? 1 : 0);
