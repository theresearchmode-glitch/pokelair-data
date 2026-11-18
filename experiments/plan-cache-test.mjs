// Suggestions must not depend on what was planned before (behaviour review C4, Nov 18). abY (the grade's fast strength, used by the
// suggestions planner and Build for Me) kept its answers in a memo keyed by the six names only, while the answer depends on each
// member's set (item, Ability, moves: setOne, teamBasicsOf, CH.sixOf). So the same team with the same sets got different
// suggestions after the popular sets had been planned first.
// This test plans one team with its own sets (A: Protect, Detect, Fake Out, Tailwind and Trick Room taken out) and with the popular
// sets (B), each on a freshly loaded page, then on one page in the order A, B, A, B and on another in B, A, B, A, and checks every
// step equals its fresh answer.
// It also checks abY itself: the two set choices change the team basics (Protect, Fake Out), so abY must differ between them.
// It could fail, and did on the code before the fix (names-only key): every step after the first on a page got the first step's
// abY and different suggestions (4 of 8 steps wrong in each order).
// Uses the built page (run app/build.mjs first). Usage: node experiments/plan-cache-test.mjs
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = APP + 'plan-cache-test.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); }, errs = [];
async function fresh() { const ctx = await b.newContext({viewport: {width: 1280, height: 900}}), pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000); return {pg, ctx}; }
const TEAM = ['Incineroar', 'Garchomp', 'Sneasler', 'Kingambit', 'Basculegion', 'Sinistcha'];
// plan the team with sets A (custom, no Protect family / Fake Out / Tailwind / Trick Room) or B (popular sets); returns the shown
// suggestions (who comes in for whom, and the grade each would give), abY of the team itself and its team basics
const plan = (pg, which) => pg.evaluate(([team, which]) => window.__ev(`(()=>{const team=${JSON.stringify(team)},which='${which}';
  const DROP=new Set(['Protect','Detect','Spiky Shield',"King's Shield",'Baneful Bunker','Silk Trap','Burning Bulwark','Obstruct','Fake Out','Tailwind','Trick Room']);
  S.slots=team.map(n=>{const s={n,a:null,lock:false};if(which==='A'){const p=byName.get(n);s.mv={[S.format]:popularMoves(p).map(m=>m.name).filter(x=>!DROP.has(x)).slice(0,4)}}return s});
  fixSlots();planCache={key:null,plans:[]};const ms=members(),plans=planFixes(ms,suggestPool(),true)||[];
  return {plans:[...plans,...(plans.more||[])].map(pl=>pl.ch.map(x=>x.c.p.d+(x.out?' for '+x.out.d:'')).join(' + ')+' ('+(pl._g==null?'-':pl._g.toFixed(3))+')'),
    y:abY(ms),basics:JSON.stringify(teamBasicsOf(ms.map(m=>m.p.n),ms)),moves:ms.map(m=>m.p.n+': '+m.moves.map(x=>x.name).join('/')).join('; ')}})()`), [TEAM, which]);
const ref = {};
for (const w of ['A', 'B']) { const {pg, ctx} = await fresh(); ref[w] = await plan(pg, w); await ctx.close();
  console.log(`fresh page, sets ${w}: ${ref[w].plans.join(' | ')}\n  abY ${ref[w].y}, basics ${ref[w].basics}\n  ${ref[w].moves}`); }
ok(ref.A.plans.length > 0 && ref.B.plans.length > 0, 'both set choices get suggestions on a fresh page');
ok(ref.A.basics !== ref.B.basics, `the two set choices differ in the team basics (A ${ref.A.basics}, B ${ref.B.basics}), so the test can tell them apart`);
ok(ref.A.y !== ref.B.y, `fresh pages: abY differs between the two set choices (A ${ref.A.y}, B ${ref.B.y})`);
// Both orders, each on its own page. The old cache kept the FIRST answer for the six names, so in A, B, A, B the B steps went wrong,
// and in B, A, B, A the A steps did (including the last A, which must equal a fresh plan of the team with sets A).
for (const order of [['A', 'B', 'A', 'B'], ['B', 'A', 'B', 'A']]) { const {pg, ctx} = await fresh(); let i = 0; console.log('one page, order ' + order.join(', '));
  for (const w of order) { const r = await plan(pg, w); i++;
    ok(JSON.stringify(r.plans) === JSON.stringify(ref[w].plans), `one page, step ${i} (sets ${w}): the same suggestions as a fresh page${JSON.stringify(r.plans) === JSON.stringify(ref[w].plans) ? '' : ` (got ${r.plans.join(' | ')})`}`);
    ok(r.y === ref[w].y, `one page, step ${i} (sets ${w}): abY ${r.y} equals the fresh page's ${ref[w].y}`); }
  await ctx.close(); }
ok(!errs.length, 'no page errors ' + errs.join(' | '));
await b.close(); fs.unlinkSync(page); console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED'); process.exit(fails.length ? 1 : 0);
