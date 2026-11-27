// Test Run's rows are worked out ahead while the visitor is on another page (code review B-I5, Nov 17), and they are exactly the
// rows a fresh computation gives. Opens Battle with the sample six, waits while idle, then checks:
//   - every top team's row was worked out ahead
//   - opening Test Run then draws much faster than a cold draw
//   - the rows match a fresh computation (same teams, same order, same verdicts)
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-trwarm.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#battle'); await p.waitForTimeout(20000); /* on a Battle page, one tap from Test Run */
const r = await p.evaluate(() => window.__ev(`(() => {
  const T = gauntletTeams(), W = V2.trWarmC, done = W ? W.done.size : 0;
  const t0 = performance.now(); location.hash = '#gauntlet'; V2.draw(); const warm = performance.now() - t0;
  const sig = rows => rows.map(x => x.ix + ':' + x.e + ':' + x.un.join('.')).join('|'), a = sig(V2.trCache.rows || []);
  V2.trCache = {key: null, rows: null}; V2.trWarmC = null; const t1 = performance.now(); const fresh = V2.trRows(members()); const cold = performance.now() - t1;
  return {n: T.length, done, warm: Math.round(warm), cold: Math.round(cold), same: a === sig(fresh), rows: fresh.length}; })()`));
ok(r.done === r.n, `all ${r.n} top teams worked out ahead while idle (${r.done})`);
ok(r.warm < r.cold / 2, `Test Run opens faster after (${r.warm} ms vs ${r.cold} ms for the rows alone, cold)`);
ok(r.same && r.rows > 0, `the rows match a fresh computation (${r.rows} rows)`);
await b.close();
console.log(`v2-trwarm: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
