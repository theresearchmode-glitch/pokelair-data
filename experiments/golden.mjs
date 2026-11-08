// Known-answer teams (Nov 8, foundation plan Phase 0). Cases with an obvious right answer that the grade, Fix it and
// Build for Me must always get right. Runs the built page (app/dist/page.html) with today's data.
//   1. top-cut teams      recent Limitless top-4 teams (32+ player events) grade B or better (70+): at least 75% of them
//   2. broken team        six of the weakest Pokémon in the roster grade F (under 10)
//   (letters as the site gives them, CH.grade: A 90+, B 70+, C 30+, D 10+, F under 10, i.e. the rank among real teams)
//   3. illegal items      two members holding the same item: flagged as not legal
//   4. no worse ideas     for strong (A) real teams, no suggestion leads to a lower grade
//   5. Build for Me       whole roster, 0 / 1 / 2 Megas: the first team is within 3 points of the best real team possible
//                         under the same limit (the best-graded exact six with 30+ games or 3+ players)
// Usage: node experiments/golden.mjs [out.json]     (exit code 1 if a case fails; build the page first)
import fs from 'node:fs'; import {createRequire} from 'node:module'; import {offFormat} from '../formats.mjs';
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
// GOLDEN_CPU=4: slow the processor 4x (roughly a phone) so the Build for Me times read like phone times
if (+process.env.GOLDEN_CPU > 1) { const cdp = await pg.context().newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate: +process.env.GOLDEN_CPU}); }
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
  R.build.push({...await run(`(()=>{ S.megaGoal = ${k}; S.maxMega = Math.max(1, ${k}); ui.abSrc = 'all'; ui.abLock = null;
    const T0 = performance.now(), res = buildBest(), buildMs = performance.now() - T0, mk = ns => ns.map(n => abMember(byName.get(n))), gr = ns => { try { return gradeTeam(mk(ns)); } catch (e) { return null; } };
    const teams = (res.teams || []).map(t => ({mons: t.mons.map(m => m.n), g: gr(t.mons.map(m => m.n))}));
    let best = null; const seen = new Set();
    for (const [names, n, wr, g] of [...(RES.proven || []), ...(RES.records || [])]) { const key = names.slice().sort().join('|'); if (seen.has(key)) continue; seen.add(key);
      if (!(n >= 3 || (g != null && g >= 30))) continue; const ps = names.map(x => byName.get(x)); if (ps.some(p => !p || isExcl(p))) continue; if (ps.filter(p => p.m).length !== ${k}) continue;
      const v = gr(names); if (v != null && (!best || v > best.g)) best = {mons: names, g: v}; }
    return JSON.stringify({megas: ${k}, teams, best, ms: buildMs}); })()`)});
}
// 6: "Build around a Pokémon" for ten picks (2 Megas allowed): the first team must hold the Pokémon and be within 3 of the best real
// team that ran it (or grade B if no real team did)
R.around = await run(`(()=>{ const out = []; const mk = ns => ns.map(n => abMember(byName.get(n))), gr = ns => { try { return gradeTeam(mk(ns)); } catch (e) { return null; } };
  for (const L of ['Rillaboom','Sneasler','Incineroar','Kingambit','Gholdengo','Sinistcha','Volcarona','Dragonite-Mega','Torkoal','Arcanine-Hisui']) { if (!byName.get(L)) continue;
    S.megaGoal = 2; S.maxMega = 2; ui.abSrc = 'all'; ui.abLock = L; const T0 = performance.now(); let res = null; try { res = buildBest(); } catch (e) {} const ms = performance.now() - T0;
    const t = res && res.teams && res.teams[0] ? res.teams[0].mons.map(m => m.n) : null;
    let best = null; const seen = new Set(); for (const [names, n, wr, g] of [...(RES.proven || []), ...(RES.records || [])]) { const key = names.slice().sort().join('|'); if (seen.has(key)) continue; seen.add(key);
      if (!(n >= 3 || (g != null && g >= 30)) || !names.includes(L)) continue; const ps = names.map(x => byName.get(x)); if (ps.some(p => !p || isExcl(p)) || ps.filter(p => p.m).length > 2) continue; const v = gr(names); if (v != null && (!best || v > best.g)) best = {mons: names, g: v}; }
    out.push({lock: L, team: t, g: t ? gr(t) : null, has: !!(t && t.includes(L)), best, ms}); }
  ui.abLock = null; return JSON.stringify(out); })()`);
// 7: sample boxes (40 Pokémon each, drawn with a fixed seed from the 100 most used): within 3 of the best real team inside the box
R.boxes = await run(`(()=>{ const out = []; let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const mk = ns => ns.map(n => abMember(byName.get(n))), gr = ns => { try { return gradeTeam(mk(ns)); } catch (e) { return null; } };
  const top = ((META.doubles_tour && META.doubles_tour.top) || []).concat((META.doubles_tour && META.doubles_tour.more) || []).map(r => byName.get(r.n)).filter(Boolean).slice(0, 100);
  const keep = S.box.slice();
  for (let k = 0; k < 3; k++) { const pick = top.slice().sort(() => rnd() - .5).slice(0, 40); S.box = [...new Set(pick.map(p => ownKey(p)))]; S.megaGoal = 1; S.maxMega = 1; ui.abSrc = 'box'; ui.abLock = null;
    const T0 = performance.now(); let res = null; try { res = buildBest(); } catch (e) {} const ms = performance.now() - T0; const t = res && res.teams && res.teams[0] ? res.teams[0].mons.map(m => m.n) : null;
    let best = null; const seen = new Set(); for (const [names, n, wr, g] of [...(RES.proven || []), ...(RES.records || [])]) { const key = names.slice().sort().join('|'); if (seen.has(key)) continue; seen.add(key);
      if (!(n >= 3 || (g != null && g >= 30))) continue; const ps = names.map(x => byName.get(x)); if (ps.some(p => !p || !inBox(p) || isExcl(p)) || ps.filter(p => p.m).length !== 1) continue; const v = gr(names); if (v != null && (!best || v > best.g)) best = {mons: names, g: v}; }
    out.push({box: k + 1, team: t, g: t ? gr(t) : null, inBox: t ? t.every(n => inBox(byName.get(n))) : false, best, ms}); }
  S.box = keep; ui.abSrc = 'all'; return JSON.stringify(out); })()`);
// 8: Apply gives exactly what the card promised: load real mid-grade teams, read the first suggestion card's promised grade, tap Apply,
// read the grade My Team then shows (both as the page prints them)
R.apply = [];
{ const M = JSON.parse(fs.readFileSync(OUT + 'matches.json', 'utf8')), cnt = new Map(); for (const g of M.m) for (const t of [g[0], g[1]]) cnt.set(t, (cnt.get(t) || 0) + 1);
  const pool = [...cnt].sort((a, b) => b[1] - a[1]).map(([t]) => M.teams[t].split('|')).filter(t => t.length === 6).slice(0, 120);
  for (const ns of pool) { if (R.apply.length >= 6) break;
    const r = await run(`(()=>{ if (${JSON.stringify(ns)}.some(n => !byName.get(n))) return JSON.stringify(null); S.format = 'doubles'; S.slots = normSlots(${JSON.stringify(ns)}.map(n => ({n, a: null, lock: false}))); const g = gradeTeam(members());
      if (g == null || g < 30 || g > 85) return JSON.stringify(null); setView('coverage'); render(); return JSON.stringify({g}); })()`);
    if (!r) continue; await pg.waitForTimeout(3500);
    const card = await pg.evaluate(() => { const c = document.querySelector('#sugs .plan'); if (!c) return null; const m = c.innerText.replace(/\s+/g, ' ').match(/→ (Top \d+%|Bottom \d+%)/); return m ? m[1] : null; });
    if (!card) continue;
    await pg.evaluate(() => { const b = document.querySelector('#sugs .plan [data-plan="0"]'); if (b) b.click(); }); await pg.waitForTimeout(2500);
    const after = await run(`(()=>{ const ms = members(), g = gradeTeam(ms); return JSON.stringify(g == null ? null : CH.rankShort(g)); })()`);
    R.apply.push({mons: ns, before: r.g, promised: card, after}); } }
await b.close(); fs.unlinkSync(page);
// ---- verdicts
const C = [], add = (name, pass, detail) => C.push({name, pass, detail});
R.top = R.top.filter(t => !offFormat(t.ev)); // themed cups (MonoRegion…) are left out of the data, so out of this check too
{ const n = R.top.length, good = R.top.filter(t => t.g >= 70).length, med = R.top.map(t => t.g).sort((a, c) => a - c)[n >> 1];
  add('top-cut teams grade B or better (75%+ of them)', n >= 10 && good / n >= .75, `${good} of ${n} graded 70+ (${Math.round(good / n * 100)}%), median ${med}; lowest: ${R.top.slice().sort((a, c) => a.g - c.g).slice(0, 3).map(t => `${t.g} (${t.mons.join(', ')})`).join(' · ')}`); }
add('six of the weakest Pokémon grade F', R.weak.g != null && R.weak.g < 10, `${R.weak.g} (${R.weak.mons.join(', ')})`);
add('two of the same item reads as not legal', R.illegal.flagged, `${R.illegal.clause} item clash${R.illegal.clause === 1 ? '' : 'es'} found`);
{ const s = R.sugg.filter(x => !x.err), worse = s.reduce((a, x) => a + x.worse, 0), tot = s.reduce((a, x) => a + x.n, 0);
  add('no suggestion lowers the grade of a strong (A) team', s.length > 0 && worse === 0, `${s.length} A teams, ${tot} suggestions (${s.reduce((a, x) => a + x.main, 0)} shown first), ${worse} would lower the grade (${s.reduce((a, x) => a + x.worseMain, 0)} of those shown first)${R.sugg.some(x => x.err) ? ' · errors: ' + R.sugg.filter(x => x.err).map(x => x.err).join('; ') : ''}`); }
for (const B of R.build) { const top = B.teams[0], gap = top && B.best ? B.best.g - top.g : null;
  add(`Build for Me, whole roster, ${B.megas} Mega${B.megas === 1 ? '' : 's'}: ${B.best ? 'within 3 of the best real team' : 'no real team to compare, so the first team must grade B (70+)'}`, B.best ? gap != null && gap <= 3 : !!top && top.g >= 70, `built ${B.teams.map(t => t.g).join(' / ')} · best real team ${B.best ? B.best.g : '—'}${gap != null ? ` · gap ${gap.toFixed(1)}` : ''} · ${(B.ms / 1000).toFixed(1)} s`); }
{ const A = R.around, bad = A.filter(a => !a.has || a.g == null || (a.best ? a.g < a.best.g - 3 : a.g < 70));
  add('Build around a Pokémon (10 picks): holds it, within 3 of the best real team with it', A.length >= 8 && !bad.length, A.map(a => `${a.lock} ${a.g == null ? '—' : a.g.toFixed(0)}${a.best ? '/' + a.best.g.toFixed(0) : ''}${a.has ? '' : ' (missing!)'}`).join(' · ') + ` · slowest ${(Math.max(...A.map(a => a.ms)) / 1000).toFixed(1)} s`); }
{ const B = R.boxes, bad = B.filter(b => !b.inBox || b.g == null || (b.best && b.g < b.best.g - 3));
  add('Build for Me from a 40-Pokémon box (3 boxes): only box Pokémon, within 3 of the best real team in the box', B.length === 3 && !bad.length, B.map(b => `box ${b.box}: ${b.g == null ? '—' : b.g.toFixed(0)}${b.best ? ' vs best real ' + b.best.g.toFixed(0) : ' (no real team fits)'}${b.inBox ? '' : ' OUTSIDE BOX'}`).join(' · ')); }
{ const A = R.apply, bad = A.filter(a => a.promised !== a.after);
  add('Apply gives exactly the grade the suggestion card promised', A.length >= 4 && !bad.length, A.map(a => `${a.promised} → ${a.after}`).join(' · ')); }
if (errs.length) add('no page errors', false, errs.slice(0, 3).join(' | '));
for (const c of C) console.log(`${c.pass ? '  ok  ' : '  FAIL'} ${c.name}\n         ${c.detail}`);
console.log(`\n${C.filter(c => c.pass).length} of ${C.length} known-answer cases pass`);
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({cases: C, raw: R}, null, 1));
process.exitCode = C.every(c => c.pass) ? 0 : 1;
