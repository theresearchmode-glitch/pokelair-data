// Word-list check on the BUILT new site (Sim, Nov 12): the new site may never say "Ready for ..." or "N% ready" (the word list's
// name for that idea is Matchups; its levels are Beats it / Handles it). The shared logic still writes those words for today's site
// and the new site rewrites them (V2.wl), so this check catches any place the rewrite misses. The approved band word
// "Tournament ready" doesn't match either pattern.
// It opens every built page with the daily data fed in (as the live page gets it), opens every fold, each Matchups view, every "?"
// bubble and the sheets, and reads the visible text plus aria-label and title attributes. Exit 1 if anything is found.
// Usage: node app/build.mjs --v2 && node experiments/v2-words.mjs [page.html]   (default app/dist/v2.html)
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path'; import fs from 'node:fs'; import {createRequire} from 'node:module';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), require = createRequire(import.meta.url);
let pw; try { pw = require(path.join(ROOT, 'node_modules/playwright')); } catch (e) { pw = require('playwright'); }
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const file = process.argv[2] || path.join(ROOT, 'app/dist/v2.html');
const BAD = [/ready for/i, /\d+\s*%\s*ready/i];
const b = await pw.chromium.launch(), found = new Map(); let reads = 0;
const grab = async (p, where) => { reads++; const t = await p.evaluate(() => { const parts = [document.body.innerText];
    for (const e of document.querySelectorAll('[aria-label],[title]')) parts.push(e.getAttribute('aria-label') || '', e.getAttribute('title') || '');
    return parts.join('\n'); });
  for (const line of t.split('\n')) if (BAD.some(r => r.test(line))) { const k = line.trim().slice(0, 120); if (!found.has(k)) found.set(k, where); } };
const open = async (view, w) => { const p = await b.newPage({viewport: {width: w, height: 900}});
  await p.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto(pathToFileURL(path.resolve(file)).href + '#' + view); await p.waitForTimeout(2500);
  await p.waitForFunction(() => !document.querySelector('.sg2-wait,.cx2-busy'), null, {timeout: 90000}).catch(() => {}); await p.waitForTimeout(600); return p; };
const openAll = p => p.evaluate(() => document.querySelectorAll('#main details').forEach(d => { d.open = true; }));
const tap = (p, sel) => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getClientRects().length); if (e) { e.click(); return true; } return false; }, sel);
for (const w of [390, 1440]) {
  // My Team: everything open, each "?" bubble, each Matchups view, the threat sheet, Why this score, All Suggestions, More, Team Sheet
  let p = await open('team', w); await openAll(p); await grab(p, `team ${w}`);
  const tips = await p.evaluate(() => document.querySelectorAll('[data-v2tip]').length);
  for (let i = 0; i < tips; i++) { await p.evaluate(i => { const t = document.querySelectorAll('[data-v2tip]')[i]; t.scrollIntoView({block: 'center'}); t.click(); }, i); await p.waitForTimeout(250); await grab(p, `team ${w} "?" bubble ${i + 1}`); await p.keyboard.press('Escape'); }
  for (const v of ['Stand-outs', 'Top 10', 'Top 12 grid', 'All 30']) { await p.evaluate(v => { const e = [...document.querySelectorAll('#tm-mu button')].find(x => x.textContent.trim().endsWith(v)); if (e) e.click(); }, v); await p.waitForTimeout(700); await openAll(p); await grab(p, `team ${w} Matchups "${v}"`); }
  for (const [sel, name] of [['#main [data-muthr]', 'threat sheet'], ['[data-v2why]', 'Why this score'], ['[data-v2sgall]', 'All Suggestions'], ['[data-v2more]', 'More'], ['[data-v2sheetopen]', 'Team Sheet']]) {
    if (await tap(p, sel)) { await p.waitForTimeout(900); await p.evaluate(() => document.querySelectorAll('.np-sheet details').forEach(d => { d.open = true; })); await grab(p, `team ${w} ${name}`); await p.keyboard.press('Escape'); await p.waitForTimeout(300); } }
  await p.close();
  for (const v of ['team-empty', 'box', 'compare', 'sheet']) { p = await open(v, w); await openAll(p); await grab(p, `${v} ${w}`); await p.close(); }
}
await b.close();
for (const [k, where] of found) console.log(`  FOUND "${k}"  (${where})`);
console.log(`v2 words: ${reads} screens read; ${found.size} place${found.size === 1 ? '' : 's'} with "Ready for" or "% ready"${found.size ? '' : ' (none)'}`);
process.exit(found.size ? 1 : 0);
