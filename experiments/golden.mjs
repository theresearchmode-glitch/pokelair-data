// Known-answer teams (Nov 8, foundation plan Phase 0). Cases with an obvious right answer that the grade, Fix it and
// Build for Me must always get right. Runs the built page (app/dist/page.html) with today's data.
//   1. top-cut teams      recent Limitless top-4 teams (32+ player events) grade B or better (80+): at least 75% of them
//   2. broken team        six of the weakest Pokémon in the roster grade F (under 60)
//   3. illegal items      two members holding the same item: flagged as not legal
//   4. no worse ideas     for strong (A) real teams, no suggestion leads to a lower grade
//   5. Build for Me       whole roster, 0 / 1 / 2 Megas: the first team is within 3 points of the best real team possible
//                         under the same limit (the best-graded exact six with 30+ games or 3+ players)
// Usage: node experiments/golden.mjs [out.json]     (exit code 1 if a case fails; build the page first)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': process.env.GOLDEN_MODEL ? JSON.parse(fs.readFileSync(process.env.GOLDEN_MODEL, 'utf8')) : rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/history': rd('history.json')};
const page = ROOT + `app/golden-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage(), errs = [];
pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const run = code => pg.evaluate(c => window.__ev(c), code).then(s => JSON.parse(s));
const R = {};
// 1 + 3 + 2: grade checks
Object.assign(R, await run(`(()=>{ const mk = ns => ns.map(n => abMember(byName.get(n))), g = ns => { try { return gradeTeam(mk(ns)); } catch (e) { return null; } };
  const tops = ((META.teams && META.teams.teams) || []).filter(t => t.section !== 'Official events' && t.mons && t.mons.length === 6 && t.mons.every(n => byName.get(n)));
  const tg = tops.map(t => ({mons: t.mons, g: g(t.mons), ev: t.event, rec: t.record})).filter(x => x.g != null);
  // the weakest six: lowest viability, no Megas, one per species
  const seen = new Set(), weak = ROSTER.filter(p => !p.m && !isExcl(p)).sort((a, b) => viability(a) - viability(b)).filter(p => !seen.has(p.b) && seen.add(p.b)).slice(0, 6).map(p => p.n);
  // illegal: a strong six with two Sitrus Berries
  const ill = mk(['Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott']); ill[0] = {...ill[0], item: 'Sitrus Berry', heldItem: 'Sitrus Berry'}; ill[1] = {...ill[1], item: 'Sitrus Berry', heldItem: 'Sitrus Berry'};
  const clause = itemClause(ill), RD = THR.teamReport(ill), G = CH.gradeOf(RD, proChecks(ill, true), ill);
  return JSON.stringify({top: tg, weak: {mons: weak, g: g(weak)}, illegal: {clause: clause.length, flagged: !!(G && G.illegal) || clause.length > 0}}); })()`));
// 4: suggestions on strong real teams
R.sugg = await run(`(()=>{ const out = []; const A = ${JSON.stringify(R.top.filter(t => t.g >= 90).slice(0, 8).map(t => t.mons))};
  for (const ns of A) { try { S.format = 'doubles'; S.slots = normSlots(ns.map(n => ({n, a: null, lock: false}))); const ms = members(), base = gradeTeam(ms);
    const plans = planFixes(ms, [...byName.values()], true) || [], all = [...plans, ...(plans.more || [])];
    const gs = all.map(pl => planGrade(pl)).filter(x => x != null), gm = [...plans].map(pl => planGrade(pl)).filter(x => x != null);
    out.push({mons: ns, base, n: all.length, main: plans.length, worse: gs.filter(x => x < base - .5).length, worseMain: gm.filter(x => x < base - .5).length, grades: gs.slice(0, 6), why: [...plans].slice(0, 3).map(pl => ({g: planGrade(pl), fix: !!(pl.gap && pl.gap.fix && pl.gap.fix.length), ch: (pl.ch || []).map(c => (c.out && c.out.p ? c.out.p.n : '?') + '→' + (c.in && c.in.p ? c.in.p.n : (c.p ? c.p.n : '?')))}))}); } catch (e) { out.push({mons: ns, err: e.message}); } }
  return JSON.stringify(out); })()`);
// 5: Build for Me against the best real team under the same Mega limit
R.build = [];
for (const k of [0, 1, 2]) {
  const t0 = Date.now();
  R.build.push({...await run(`(()=>{ S.megaGoal = ${k}; S.maxMega = Math.max(1, ${k}); ui.abSrc = 'all'; ui.abLock = null;
    const res = buildBest(), mk = ns => ns.map(n => abMember(byName.get(n))), gr = ns => { try { return gradeTeam(mk(ns)); } catch (e) { return null; } };
    const teams = (res.teams || []).map(t => ({mons: t.mons.map(m => m.n), g: gr(t.mons.map(m => m.n))}));
    let best = null; const seen = new Set();
    for (const [names, n, wr, g] of [...(RES.proven || []), ...(RES.records || [])]) { const key = names.slice().sort().join('|'); if (seen.has(key)) continue; seen.add(key);
      if (!(n >= 3 || (g != null && g >= 30))) continue; const ps = names.map(x => byName.get(x)); if (ps.some(p => !p || isExcl(p))) continue; if (ps.filter(p => p.m).length !== ${k}) continue;
      const v = gr(names); if (v != null && (!best || v > best.g)) best = {mons: names, g: v}; }
    return JSON.stringify({megas: ${k}, teams, best}); })()`), ms: Date.now() - t0});
}
await b.close(); fs.unlinkSync(page);
// ---- verdicts
const C = [], add = (name, pass, detail) => C.push({name, pass, detail});
{ const n = R.top.length, good = R.top.filter(t => t.g >= 80).length, med = R.top.map(t => t.g).sort((a, c) => a - c)[n >> 1];
  add('top-cut teams grade B or better (75%+ of them)', n >= 10 && good / n >= .75, `${good} of ${n} graded 80+ (${Math.round(good / n * 100)}%), median ${med}; lowest: ${R.top.slice().sort((a, c) => a.g - c.g).slice(0, 3).map(t => `${t.g} (${t.mons.join(', ')})`).join(' · ')}`); }
add('six of the weakest Pokémon grade F', R.weak.g != null && R.weak.g < 60, `${R.weak.g} (${R.weak.mons.join(', ')})`);
add('two of the same item reads as not legal', R.illegal.flagged, `${R.illegal.clause} item clash${R.illegal.clause === 1 ? '' : 'es'} found`);
{ const s = R.sugg.filter(x => !x.err), worse = s.reduce((a, x) => a + x.worse, 0), tot = s.reduce((a, x) => a + x.n, 0);
  add('no suggestion lowers the grade of a strong (A) team', s.length > 0 && worse === 0, `${s.length} A teams, ${tot} suggestions (${s.reduce((a, x) => a + x.main, 0)} shown first), ${worse} would lower the grade (${s.reduce((a, x) => a + x.worseMain, 0)} of those shown first)${R.sugg.some(x => x.err) ? ' · errors: ' + R.sugg.filter(x => x.err).map(x => x.err).join('; ') : ''}`); }
for (const B of R.build) { const top = B.teams[0], gap = top && B.best ? B.best.g - top.g : null;
  add(`Build for Me, whole roster, ${B.megas} Mega${B.megas === 1 ? '' : 's'}: ${B.best ? 'within 3 of the best real team' : 'no real team to compare, so the first team must grade B (80+)'}`, B.best ? gap != null && gap <= 3 : !!top && top.g >= 80, `built ${B.teams.map(t => t.g).join(' / ')} · best real team ${B.best ? B.best.g : '—'}${gap != null ? ` · gap ${gap.toFixed(1)}` : ''} · ${(B.ms / 1000).toFixed(1)} s`); }
if (errs.length) add('no page errors', false, errs.slice(0, 3).join(' | '));
for (const c of C) console.log(`${c.pass ? '  ok  ' : '  FAIL'} ${c.name}\n         ${c.detail}`);
console.log(`\n${C.filter(c => c.pass).length} of ${C.length} known-answer cases pass`);
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({cases: C, raw: R}, null, 1));
process.exitCode = C.every(c => c.pass) ? 0 : 1;
