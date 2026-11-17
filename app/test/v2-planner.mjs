// Suggestion planner checks from the Nov 16 review of 29-fix-planner.js (FP-1..FP-4), on the sample six:
//   FP-3 the Why? list says how many top threats a plan handles, before -> after, in the word list's words
// (more checks are added as each finding is fixed). Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-planner.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2000);
/* a weaker six than the sample (Flapple and Dragapult in), so the planner has improving plans to explain */
await p.evaluate(() => window.__ev(`(() => { S.slots[4] = {n: 'Flapple', a: null, lock: false}; S.slots[5] = {n: 'Dragapult', a: null, lock: false}; render(); })()`));
await p.waitForFunction(() => window.__ev && window.__ev('!!(V2.plan && V2.plan.plans && V2.plan.plans.length)'), null, {timeout: 60000});
const r3 = await p.evaluate(() => window.__ev(`(() => { const ms = members(), plans = V2.plan.plans;
  const X = V2.sgX(ms); let n = 0, ready = 0; for (const [k, pl] of plans.entries()) { const r = planWhy(pl, k, X, false); n++; if (r.lines.some(l => /Ready for top threats: \\d+\\/\\d+ → \\d+\\/\\d+/.test(l))) ready++; }
  const shown = V2.wl('Ready for top threats: 27/30 → 28/30'); return {n, ready, shown}; })()`));
ok(r3.n > 0 && r3.ready > 0, `FP-3: the Why? lists say how many top threats each plan handles (${r3.ready} of ${r3.n} plans)`);
ok(/^Beats or handles 27 → 28 of the top 30 threats$/.test(r3.shown), `FP-3: in the word list's words ("${r3.shown}")`);
await b.close();
console.log(`v2-planner: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
