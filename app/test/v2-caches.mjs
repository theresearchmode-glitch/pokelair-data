// Caches must follow nature and stat points (code review A2-I4 + A1-I2, Nov 17). On the sample six, change every Pokémon's
// spread, then compare each cache with a fresh computation:
//   gradeTeam (the suggestion cards' "from" number and the planner's baseline) vs CH.gradeOf on the same six
//   V2.trRows (Test Run verdicts) vs the same rows computed with an empty cache
// Exit 1 on any difference.   PAGE=app/dist/v2.html node app/test/v2-caches.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
const r = await p.evaluate(() => window.__ev(`(() => {
  const fresh = ms => { const a = typeof assignItems === 'function' ? assignItems(ms) : ms; const G = CH.gradeOf(THR.teamReport(a), proChecks(a, true), a); return G ? G.s : null; };
  const rows = ms => (V2.trRows(ms) || []).map(x => x ? x.e : null).join(',');
  let ms = members(); if (ms.length < 6) return {skip: 'sample six not loaded (' + ms.length + ')'};
  const g0 = gradeTeam(ms), r0 = rows(ms);
  S.slots.forEach(s => { if (s && s.n) s.sp = {doubles: {nat: 'Bold', v: [32, 0, 32, 0, 2, 0]}}; });
  ms = members(); const g1 = gradeTeam(ms), f1 = fresh(ms), r1 = rows(ms); V2.trCache = {key: null, rows: null}; const rf = rows(ms);
  return {g0, g1, f1, gradeOK: g1 === f1, rowsChanged: r0 !== rf, rowsOK: r1 === rf}; })()`));
await b.close();
if (r.skip) { console.log('v2-caches: skipped,', r.skip); process.exit(1); }
console.log(`v2-caches: grade before ${r.g0}, cached after ${r.g1}, fresh after ${r.f1} -> ${r.gradeOK ? 'ok' : 'STALE'}; Test Run rows ${r.rowsOK ? 'ok' : 'STALE'} (spread change ${r.rowsChanged ? 'did' : 'did not'} change them)`);
process.exit(r.gradeOK && r.rowsOK ? 0 : 1);
