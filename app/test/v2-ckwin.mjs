// My Team's "recent winners" numbers come from the daily data job when its stamps match (code review B-C1, Nov 16):
//   1. the page's own pass gives some numbers (the reference)
//   2. with those numbers stored in the events document (stamped with today's events, model and Mega setting), the page takes them
//      at once (no 120-team pass) and they are the same numbers
//   3. a stamp that doesn't match (another Mega setting) makes the page work them out itself, as before
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-ckwin.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
let ref = null; for (let i = 0; i < 120 && !ref; i++) { ref = await p.evaluate(() => window.__ev(`(() => { if (!ckWin.rates || ckWin.busy) { try { ckWinRefresh(); } catch (e) {} return null; } return JSON.stringify({rates: ckWin.rates, two: ckWin.two, wmed: ckWin.wmed, wq75: ckWin.wq75, se2med: ckWin.se2med}); })()`)); if (!ref) await p.waitForTimeout(500); }
ok(!!ref, 'the page worked out its own numbers (reference)');
const r = await p.evaluate(ref => window.__ev(`(() => { const E = META.events, v = JSON.parse(${JSON.stringify(ref)});
  E.ckwin = {ev: E.updated, n: E.events.length, model: META.model.updated, mega: megaGoal(), v};
  try { localStorage.removeItem('np.ckwin'); } catch (e) {} ckWin = {}; metaVersion++; META_AT = 0;
  const t0 = performance.now(); ckWinRefresh(); const ms = performance.now() - t0, a = {took: !!ckWin.rates && !ckWin.busy, same: JSON.stringify({rates: ckWin.rates, two: ckWin.two, wmed: ckWin.wmed, wq75: ckWin.wq75, se2med: ckWin.se2med}) === JSON.stringify(v), ms: Math.round(ms)};
  E.ckwin.mega = (megaGoal() + 1) % 3; try { localStorage.removeItem('np.ckwin'); } catch (e) {} ckWin = {}; metaVersion++; ckWinRefresh(); a.own = !!ckWin.busy; return a; })()`), ref);
ok(r.took && r.same, `matching stamps: the stored numbers are used at once and are the same (${r.ms} ms)`);
ok(r.own, 'a stamp that does not match: the page works the numbers out itself');
const cl = await p.evaluate(() => window.__ev(`(() => { const raw = {updated: 'x', source: 's', dict: [], events: []}; const good = {ev: 'a', n: 1, model: 'm', mega: 2, v: {rates: {speed: [1, 2]}, two: 1, wmed: 80, wq75: 85, se2med: .5}};
  const one = ev => ({updated: 'u', source: 's', dict: ['Garchomp'], events: [{id: 'e', name: 'n', date: '2026-01-01', top: [['P0000000001', 1, '7-0', [[0], [0], [0], [0], [0], [0]]]]}], ckwin: ev});
  const a = cleanEvents(one(good)), b2 = cleanEvents(one({ev: 'a', v: {rates: {speed: 'bad'}}}));
  return {kept: !!(a && a.ckwin && a.ckwin.v.rates.speed[1] === 2), dropped: !!(b2 && !b2.ckwin), events: !!a}; })()`));
ok(cl.events && cl.kept && cl.dropped, `the data cleaner keeps well-formed daily numbers and drops malformed ones (${JSON.stringify(cl)})`);
await b.close();
console.log(`v2-ckwin: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
