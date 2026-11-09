// d5-sugg, why do suggestions over-promise for grade 60-85? (Nov 9) Step 1: how much real win chance does the grade itself
// PROMISE for each Suggestion 1? The grade is a 0-100 rank among teams, so "+19 grade points" may mean a small change in
// expected win rate. For each starting team in a sugg-real.mjs run (rows file), rebuild the starting six and Suggestion 1's
// six on the built page, read the grade's expected win rate vs today's tournament teams (CH.gradeOf .e) for both, and compare
// the promised change with the real one (closest real teams, from the rows file). Check: the rebuilt suggestion's grade must
// match the grade the run recorded (else the rebuild is wrong and the row is dropped).
// Usage: node experiments/sugg-why.mjs <rows.json from sugg-real.mjs>
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const R = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = ROOT + `app/why-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const G = async names => JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{try{S.slots=${JSON.stringify(names)}.map(n=>({n,a:null,lock:false}));fixSlots();const ms=members();if(ms.length!==6)return 'null';
  const m2=assignItems(ms),G=CH.gradeOf(THR.teamReport(m2),proChecks(m2,true),m2);return JSON.stringify(G?{s:G.s,e:G.e,v:G.v,e0:G.e0,eMu:G.eMu}:null)}catch(e){return JSON.stringify({err:String(e).slice(0,80)})}})()`));
const out = [];
try { for (const [k, r] of R.entries()) { if (r.err || !r.before || r.before.ng < 30) continue; const s = r.sugg.find(x => x.rank === 1); if (!s || s.after.ng < 30) continue;
    let names = r.names.slice(), ok = true; for (const c of s.ch) { const [o, n] = c.split(' -> '); const i = names.indexOf(o); if (o === '(empty)' || i < 0) { ok = false; break; } names[i] = n; }
    if (!ok) continue; const g0 = await G(r.names), g1 = await G(names); if (!g0 || !g1 || g0.err || g1.err) continue;
    out.push({gBase: r.gBase, gS: s.g, s0: g0.s, s1: g1.s, e0: g0.e, e1: g1.e, x0: g0.e0, x1: g1.e0, m0: g0.eMu, m1: g1.eMu, real: (s.after.wr - r.before.wr) * 100, nch: s.ch.length});
    if ((k + 1) % 50 === 0) console.error(`${k + 1}/${R.length}`); } }
finally { await b.close(); fs.unlinkSync(page); }
const match = out.filter(o => Math.abs(o.s1 - o.gS) <= 1 && Math.abs(o.s0 - o.gBase) <= 1);
console.log(`${out.length} rows rebuilt, ${match.length} match the run's grades (within 1 point); using those`);
const band = g => g < 60 ? 'under 60' : g < 85 ? '60-85' : '85+';
const boot = d => { let s = 11; const ms = []; for (let i = 0; i < 2000; i++) { let t = 0; for (let j = 0; j < d.length; j++) { s = (s * 16807) % 2147483647; t += d[s % d.length]; } ms.push(t / d.length); } ms.sort((a, b) => a - b); return [d.reduce((a, x) => a + x, 0) / d.length, ms[50], ms[1949]]; };
for (const B of ['under 60', '60-85', '85+', 'all']) { const S = match.filter(o => B === 'all' || band(o.gBase) === B); if (S.length < 5) { console.log(`${B}: ${S.length} teams (too few)`); continue; }
  const pr = S.map(o => o.e1 - o.e0), re = S.map(o => o.real), gap = S.map(o => o.real - (o.e1 - o.e0)), [pm] = boot(pr), [rm, rl, rh] = boot(re), [gm, gl, gh] = boot(gap);
  const gs = S.map(o => o.s1 - o.s0).sort((a, b) => a - b);
  { const md = f => boot(S.map(f))[0].toFixed(1); console.log(`  ${B} promised, by part: Pokémon and pairs +${md(o => o.x1 - o.x0)} · matchups +${md(o => (o.m1 - o.x1) - (o.m0 - o.x0))} · own record +${md(o => (o.e1 - o.m1) - (o.e0 - o.m0))}`); }
  console.log(`${B}: ${S.length} teams · grade shown +${gs[gs.length >> 1].toFixed(1)} (median) · grade PROMISES ${pm >= 0 ? '+' : ''}${pm.toFixed(1)} win-chance points · real ${rm >= 0 ? '+' : ''}${rm.toFixed(1)} (${rl.toFixed(1)} to ${rh.toFixed(1)}) · real minus promised ${gm >= 0 ? '+' : ''}${gm.toFixed(1)} (${gl.toFixed(1)} to ${gh.toFixed(1)})`); }
fs.writeFileSync('/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/notes/why.json', JSON.stringify(match));
