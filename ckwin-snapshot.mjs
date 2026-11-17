// The checklist's "recent winners" numbers, worked out once a day here instead of on every visitor's phone (code review B-C1,
// Nov 16: My Team kept a mid-range phone busy for about 15 s on the first visit, mostly this job: about 120 full team checks).
// Runs the page's own ckWinRefresh (06-helpers.js) on today's data, at the default settings, and stores the result in
// out/events.json as `ckwin`, stamped with the events' and the model's dates and the Mega setting it was made for. The page uses
// it only when all three match today's documents and the visitor's setting; otherwise it works the numbers out itself, as before.
// Needs Playwright (installed by the op.gg step); if it's missing the step just skips (the page then computes as before).
import fs from 'node:fs'; import {execFileSync} from 'node:child_process';
import {perfDoc} from './app/data-docs.mjs';
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
let chromium; try { ({chromium} = await import('playwright')); } catch (e) { console.log('ckwin snapshot: playwright not installed, skipped'); process.exit(0); }
const E = rd('events.json'), M = rd('model.json'); if (!E || !M) { console.log('ckwin snapshot: no events or model, skipped'); process.exit(0); }
delete E.ckwin; // never feed yesterday's numbers back in
execFileSync('node', ['app/build.mjs'], {stdio: 'ignore'});
const page = 'app/dist/snapshot-ckwin.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync('app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const L = rd('limitless.json'), D = {'meta/results': L && L.results, 'meta/perf': perfDoc(L, rd('perf.json')), 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': M, 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': E};
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})})} : null}; }, D);
await pg.goto('file://' + process.cwd() + '/' + page); await pg.waitForTimeout(4000);
let r = null;
for (let i = 0; i < 240 && !r; i++) { r = await pg.evaluate(() => window.__ev(`(() => { if (!ckWin.rates) { try { ckWinRefresh(); } catch (e) {} return null; }
  return {v: {rates: ckWin.rates, two: ckWin.two, wmed: ckWin.wmed, wq75: ckWin.wq75, se2med: ckWin.se2med}, mega: megaGoal(), ok: modelOK(), ev: META.events.updated, n: META.events.events.length, model: META.model.updated}; })()`)); /* the stamps as the page reads them (its events list is the cleaned one) */ if (!r) await pg.waitForTimeout(500); }
await b.close(); fs.unlinkSync(page);
if (!r || !r.ok) { console.log('ckwin snapshot: the page did not finish (or the model is not usable), skipped: the page will compute as before'); process.exit(0); }
E.ckwin = {ev: r.ev, n: r.n, model: r.model, mega: r.mega, v: r.v};
fs.writeFileSync('out/events.json', JSON.stringify(E));
console.log(`ckwin snapshot: ${Object.keys(r.v.rates).length} checks over today's winners saved in out/events.json (events ${E.updated}, model ${M.updated})`);
