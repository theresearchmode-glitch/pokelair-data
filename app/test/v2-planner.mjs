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
await p.evaluate(() => window.__ev(`(() => { S.slots[3] = {n: 'Flapple', a: null, lock: false}; S.slots[4] = {n: 'Dragapult', a: null, lock: false}; S.slots[5] = {n: 'Snorlax', a: null, lock: false}; render(); })()`));
await p.waitForFunction(() => window.__ev && window.__ev('!!(V2.plan && V2.plan.plans && V2.plan.plans.length)'), null, {timeout: 60000});
const r3 = await p.evaluate(() => window.__ev(`(() => { const ms = members(), plans = V2.plan.plans;
  const X = V2.sgX(ms); let n = 0, ready = 0; for (const [k, pl] of plans.entries()) { const r = planWhy(pl, k, X, false); n++; if (r.lines.some(l => /Ready for top threats: \\d+\\/\\d+ → \\d+\\/\\d+/.test(l))) ready++; }
  const shown = V2.wl('Ready for top threats: 27/30 → 28/30'); return {n, ready, shown}; })()`));
ok(r3.n > 0 && r3.ready > 0, `FP-3: the Why? lists say how many top threats each plan handles (${r3.ready} of ${r3.n} plans)`);
ok(/^Beats or handles 27 → 28 of the top 30 threats$/.test(r3.shown), `FP-3: in the word list's words ("${r3.shown}")`);
const r1 = await p.evaluate(() => window.__ev(`(() => { const keep = JSON.stringify(S.slots), plans = V2.plan.plans; let n = 0, same = 0, worst = 0;
  for (const pl of [...plans, ...(plans.more || [])].filter(pl => pl.ch.length === 1).slice(0, 6)) { S.slots = JSON.parse(keep); applyPlan(pl); const a = gradeTeam(members());
    S.slots = JSON.parse(keep); applyQuick(pl); const b = gradeTeam(members()); n++; if (a === b) same++; worst = Math.max(worst, Math.abs(a - b)); }
  S.slots = JSON.parse(keep); render(); return {n, same, worst}; })()`));
ok(r1.n > 0 && r1.same === r1.n, `FP-1: Quick add and Apply give the same swap the same Strength Score (${r1.same} of ${r1.n}; largest gap ${r1.worst})`);
const r4 = await p.evaluate(() => window.__ev(`(() => { const keep = JSON.stringify(S.slots), plans = V2.plan.plans, pl = [...plans, ...(plans.more || [])].find(x => x.ch.some(c => c.out));
  if (!pl) return {skip: 1}; applyPlan(pl); render(); const after = swOutNow(), kept = !!(after && after.size);
  const i = S.slots.findIndex((x, j) => x.n && j !== pl.ch[0].slot); S.slots[i].it = {doubles: 'Leftovers'}; const cleared = !swOutNow();
  S.slots = JSON.parse(keep); ui.swOut = null; render(); return {kept, cleared}; })()`));
ok(r4.kept && r4.cleared, `FP-4: "just swapped out" stays after Apply and clears after an item edit (${JSON.stringify(r4)})`);
/* FP-2: a two-Mega team (Mega Charizard Y and Mega Gyarados, two Megas allowed): Why? compares the same team with each plan */
await p.evaluate(() => window.__ev(`(() => { S.megaGoal = 2; S.slots[5] = {n: 'Gyarados-Mega', a: null, lock: false}; V2.plan = {key: null, plans: null, job: null}; render(); })()`));
await p.waitForFunction(() => window.__ev('!!(V2.plan && V2.plan.plans)'), null, {timeout: 60000});
const r2 = await p.evaluate(() => window.__ev(`(() => { const ms = members(), plans = V2.plan.plans, X = V2.sgX(ms), list = [...plans, ...(plans.more || [])].slice(0, 6); let bad = 0, n = 0;
  for (const [k, pl] of list.entries()) { const r = planWhy(pl, k, X, false), fix = (r.lines.find(l => /^<b>Fixes the /.test(l) || /Fixes the .* weakness/.test(l)) || '');
    const raw = new Set(plans.baseA.rows.filter((t, j) => t.w > t.r && !(pl.st.a.rows[j].w > pl.st.a.rows[j].r)).map(t => t.atk)); n++;
    const said = ((r.lines.find(l => /Fixes the .* weakness/.test(l)) || '').match(/Fixes the (.*?) weakness/) || [, ''])[1].split(', ').filter(Boolean);
    const resRaw = new Set(plans.baseA.rows.filter((t, j) => t.r === 0 && pl.st.a.rows[j].r > 0).map(t => t.atk));
    const saidRes = ((r.lines.find(l => /Adds a resist to /.test(l)) || '').match(/Adds a resist to (.*)/) || [, ''])[1].split(', ').filter(Boolean);
    if (said.some(t => !raw.has(t)) || saidRes.some(t => !resRaw.has(t))) bad++; }
  return {n, bad, megas: ms.filter(m => m.p.m).length}; })()`));
ok(r2.n > 0 && r2.megas === 2 && r2.bad === 0, `FP-2: on a two-Mega team, Why? never claims a fixed weakness the swap didn't fix (${JSON.stringify(r2)})`);
await b.close();
console.log(`v2-planner: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
