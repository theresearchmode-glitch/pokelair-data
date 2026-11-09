// The exact-site scoreboard (Nov 8, foundation plan Phase 1). board.mjs re-creates the grade outside the page; this one asks
// the built page itself (app/dist/page.html), so what is scored is exactly what My Team shows: the six's real sets (items,
// Abilities, moves from its team sheet), the caution for untried pairs, the matchup part (readiness against the top threats,
// from damage calcs) and the six's own record. Everything is learned only from games before the scored ones:
//   model  out/model_dev_site.json = model.mjs TEST_DATE=2026-10-27 TRAIN_ONLY=1, then six.mjs and ctr.mjs on
//          out/matches_train.json (games before Oct 27), calib .872 as shipped
//   games  tournament games from BOARD_DATE (default 2026-10-27) in MATCHES (default out/matches_dev.json: no sealed games)
// For every scored game it records each side's parts, then scores versions of the grade built from them:
//   site       x (Pokémon + pairs + sets, untried-pair caution) + matchups + own record   (= CH.strengthOf y)
//   −matchups, −own record, −caution, and both off; a matchup weight sweep; and the learned real-results matchups
//   (model.ctr) two ways: against this opponent (for one game) and against the field (for a grade).
// Reports pick %, log-loss, calibration and letters, overall and on games between NEW mixes (sixes with no record from
// earlier games), and writes per-game win chances for experiments/compare.mjs.
// Usage: node experiments/site-board.mjs [pred.json] [summary.json]      (build the page first: node app/build.mjs)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches_dev.json', 'utf8')), MF = process.env.SB_MODEL || OUT + 'model_dev_site.json', MD = JSON.parse(fs.readFileSync(MF, 'utf8'));
const FROM = process.env.BOARD_DATE || '2026-10-27', SL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from;
const teams = M.teams.map(k => k.split('|')), isSD = i => String(M.events[i][0]).startsWith('sd-');
const UNTIL = process.env.BOARD_UNTIL || '9999'; // BOARD_UNTIL=YYYY-MM-DD: score only games before it (a separate earlier slice)
const futE = new Set(M.events.map((e, i) => [e, i]).filter(([e, i]) => e[1] >= FROM && e[1] < UNTIL && !isSD(i)).map(([, i]) => i));
{ const n = [...futE].filter(i => M.events[i][1] >= SL).length; if (n && process.env.SEALED !== '1') { console.error(`refusing: ${n} sealed events in the scored set (use out/matches_dev.json, or SEALED=1 for an end-of-phase check)`); process.exit(2); } }
const G = M.m.filter(g => futE.has(g[3]) && g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6);
// each (team, deck) once: names plus the sets on its sheet
const keyOf = (t, d) => t + ':' + (d ?? '-'), need = new Map();
for (const g of G) for (const [t, d] of [[g[0], g[7]], [g[1], g[8]]]) { const k = keyOf(t, d); if (need.has(k)) continue;
  const fs_ = d != null && M.decks[d] ? M.decks[d].map(f => M.feats[f]) : [], set = {};
  for (const n of teams[t]) set[n] = {it: null, ab: null, mv: []};
  for (const f of fs_) { const m = f.match(/^(.*?)([@#:])(.*)$/); if (!m || !set[m[1]]) continue; if (m[2] === '@') set[m[1]].it = m[3]; else if (m[2] === '#') set[m[1]].ab = m[3]; else set[m[1]].mv.push(m[3]); }
  need.set(k, {k, ns: teams[t], set}); }
// each species' most common COMPLETE set (item + Ability + its moves, as one build) on team sheets before the scored games
const COMMON = (() => { const trainE = new Set(M.events.map((e, i) => [e, i]).filter(([e]) => e[1] < FROM).map(([, i]) => i)), cnt = new Map(), seenD = new Set();
  for (const g of M.m) { if (!trainE.has(g[3])) continue; for (const [t, d] of [[g[0], g[7]], [g[1], g[8]]]) { if (d == null || !M.decks[d] || seenD.has(t + ':' + d)) continue; seenD.add(t + ':' + d);
    const per = {}; for (const f of M.decks[d].map(f => M.feats[f])) { const m = f.match(/^(.*?)([@#:])(.*)$/); if (!m) continue; (per[m[1]] = per[m[1]] || []).push(m[2] + m[3]); }
    for (const [sp, fs] of Object.entries(per)) { const k = fs.sort().join('~'); if (!cnt.has(sp)) cnt.set(sp, new Map()); const c = cnt.get(sp); c.set(k, (c.get(k) || 0) + 1); } } }
  const out = {}; for (const [sp, c] of cnt) { const [k] = [...c].sort((a, b) => b[1] - a[1])[0]; const o = {it: null, ab: null, mv: []}; for (const f of k.split('~')) { if (f[0] === '@') o.it = f.slice(1); else if (f[0] === '#') o.ab = f.slice(1); else o.mv.push(f.slice(1)); } out[sp] = o; } return out; })();
// ---- the page
const L = rd('limitless.json');
const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': MD, 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = ROOT + `app/sb-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(process.env.SB_PAGE || ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const P = {}, list = [...need.values()], t0 = Date.now();
for (let i = 0; i < list.length; i += 60) { const ch = list.slice(i, i + 60);
  const r = await pg.evaluate(([ch, COMMON]) => window.__ev(`(()=>{ const COMMON = ${JSON.stringify(COMMON)}; const out = {}; const M = META.model, mx = M.meanX || 0;
    for (const T of ${JSON.stringify(ch)}) { try { const ps = T.ns.map(n => byName.get(n)); if (ps.some(p => !p)) { out[T.k] = {miss: 1}; continue; }
      const ms = ps.map(p => { const s = T.set[p.n] || {}, m = abMember(p), mv = (s.mv || []).map(x => mvByName.get(x)).filter(Boolean);
        return {...m, ...(s.it && !p.m ? {item: s.it, heldItem: s.it} : {}), ...(s.ab ? {ability: s.ab, abChosen: true} : {}), ...(mv.length ? {moves: mv, _mv: mv, custom: true} : {})}; });
      const xs = strengthX(T.ns, ms), k = testedPairs(T.ns), cr = k == null || !M.supK ? 1 : .75 + .25 * Math.min(1, k / M.supK);
      const RD = THR.teamReport(ms), six = CH.sixOf(ms), st = CH.strengthOf(ms, RD ? RD.score : null);
      const cms = ps.map(p => { const s = COMMON[p.n], m = abMember(p); if (!s) return m; const mv = (s.mv || []).map(x => mvByName.get(x)).filter(Boolean); return {...m, ...(s.it && !p.m ? {item: s.it, heldItem: s.it} : {}), ...(s.ab ? {ability: s.ab, abChosen: true} : {}), ...(mv.length ? {moves: mv, _mv: mv, custom: true} : {})}; }), xc = strengthX(T.ns, cms).x0, RDc = THR.teamReport(cms);
      const dms = ps.map(p => abMember(p)); SET_UNKNOWN_AVG = false; const xd = strengthX(T.ns, dms).x0; SET_UNKNOWN_AVG = true; const xn = teamX(T.ns, null), RDd = THR.teamReport(dms);
      out[T.k] = {x0: xs.x0, xd, xn, xc, readyC: RDc ? RDc.score : null, readyD: RDd ? RDd.score : null, sd: CH.sdOf(ms), sure: (CH.sureOf(ms, six) || {}).w || null, cr, ready: RD ? RD.score : null, six: six ? six.d : 0, sixG: six ? six.g : 0, y: st ? st.y : null, pct: st ? st.pct : null, mx}; } catch (e) { out[T.k] = {err: String(e.message).slice(0, 80)}; } }
    return JSON.stringify(out); })()`), [ch, COMMON]);
  Object.assign(P, JSON.parse(r)); if (i % 1200 === 0) process.stdout.write(`  ${Object.keys(P).length} / ${list.length} teams · ${Math.round((Date.now() - t0) / 1000)}s\r`);
}
await b.close(); fs.unlinkSync(page);
const bad = Object.values(P).filter(p => p.err || p.miss || p.y == null).length;
console.log(`\n${list.length} team sheets graded by the page (${bad} could not be graded${errs.length ? '; page errors: ' + errs.slice(0, 2).join(' | ') : ''})`);
// ---- learned matchups (model.ctr), outside the page with the page's own formula
const C = MD.ctr, cix = new Map((C ? C.sp : []).map((n, i) => [n, i])), K = C ? C.sp.length : 0;
const cv = (a, c) => { const i = cix.get(a), j = cix.get(c); if (i == null || j == null || i === j) return 0; const lo = Math.min(i, j), hi = Math.max(i, j), k = lo * K - lo * (lo + 1) / 2 + (hi - lo - 1), v = (C.v[k] || 0) / 1000; return i < j ? v : -v; };
const mt = (A, B) => { let s = 0; for (const a of A) for (const c of B) s += cv(a, c); return s; };
// field average from training games only: expected learned matchup against a typical opponent (6 Pokémon by usage share)
const trainE = new Set(M.events.map((e, i) => [e, i]).filter(([e]) => e[1] < FROM).map(([, i]) => i)), use = new Map(); let nt = 0;
for (const g of M.m) if (trainE.has(g[3])) for (const t of [g[0], g[1]]) { nt++; for (const n of teams[t]) use.set(n, (use.get(n) || 0) + 1); }
const fieldMt = A => { let s = 0; for (const [n, c] of use) { const u = c / nt; for (const a of A) s += u * cv(a, n); } return s; };
// ---- versions (strength in the model's units; each side's y; the page uses calib on differences)
const adj = (p, useCr) => p.mx + ((p.x0 - p.mx) > 0 ? (p.x0 - p.mx) * (useCr ? p.cr : 1) : (p.x0 - p.mx)), MU = (p, k) => p.ready == null ? 0 : k * (p.ready - 79);
const V = {
  'site today (sets + caution + matchups .003 + own record)': p => adj(p, 1) + MU(p, .003) + p.six,
  '− matchups': p => adj(p, 1) + p.six,
  '− own record': p => adj(p, 1) + MU(p, .003),
  '− caution for untried pairs': p => adj(p, 0) + MU(p, .003) + p.six,
  '− matchups − own record': p => adj(p, 1),
  // Strength Score (Nov 9): matchup weight measured on real games (experiments/strength-fit.mjs, 1.05 points per 10 ÷ 27.39)
  'Strength Score (matchups .0038)': p => adj(p, 1) + MU(p, .0038) + p.six,
  'matchups ×2 (.006)': p => adj(p, 1) + MU(p, .006) + p.six,
  'matchups ×4 (.012)': p => adj(p, 1) + MU(p, .012) + p.six,
  'learned matchups vs the field, in place of calc matchups': (p, ns) => adj(p, 1) + p.six + fieldMt(ns) / MD.calib,
  // a team typed in without its sets (how most people use My Team): the page fills in default sets today
  'no sheet: default sets (as the page does today)': p => adj({...p, x0: p.xd}, 1) + MU({...p, ready: p.readyD}, .003) + p.six,
  'no sheet: unknown set counts as an average build': p => adj({...p, x0: p.xn}, 1) + MU({...p, ready: p.readyD}, .003) + p.six,
  'no sheet: each Pokémon\'s most common complete set': p => adj({...p, x0: p.xc}, 1) + MU({...p, ready: p.readyC}, .003) + p.six,
};
const both = []; for (const g of G) { const A = P[keyOf(g[0], g[7])], B = P[keyOf(g[1], g[8])]; if (!A || !B || A.y == null || B.y == null) continue; both.push({g, A, B}); }
const calib = MD.calib, sig = z => 1 / (1 + Math.exp(-z));
function score(f, extra) { const d = both.map(({g, A, B}) => [calib * (f(A, teams[g[0]]) - f(B, teams[g[1]])) + (extra ? extra(g) : 0), g[2] === 1 ? 1 : 0, g]);
  const ll = s => d.reduce((a, [x, y]) => { const p = Math.min(1 - 1e-9, Math.max(1e-9, sig(s * x))); return a - (y ? Math.log(p) : Math.log(1 - p)); }, 0) / d.length;
  let lo = 0, hi = 5; for (let i = 0; i < 60; i++) { const a = lo + (hi - lo) / 3, c = hi - (hi - lo) / 3; if (ll(a) < ll(c)) hi = c; else lo = a; } const s = (lo + hi) / 2;
  const pick = (S) => { let r = 0, n = 0; for (const [x, y] of S) { if (!x) continue; n++; if ((x > 0) === (y === 1)) r++; } return n ? r / n * 100 : null; };
  const nw = d.filter(([, , g]) => { const A = P[keyOf(g[0], g[7])], B = P[keyOf(g[1], g[8])]; return !A.sixG && !B.sixG; });
  const bands = [[.5, .55], [.55, .6], [.6, .65], [.65, 1.01]].map(([a, c]) => ({a, c, n: 0, p: 0, w: 0}));
  for (const [x, y] of d) { if (!x) continue; const p = sig(s * Math.abs(x)), won = (x > 0) === (y === 1) ? 1 : 0, B = bands.find(B => p >= B.a && p < B.c); B.n++; B.p += p; B.w += won; }
  const cal = bands.filter(B => B.n >= 30), gap = cal.reduce((a, c) => a + Math.abs(c.p / c.n - c.w / c.n) * 100 * c.n, 0) / Math.max(1, cal.reduce((a, c) => a + c.n, 0));
  return {d, s, ll: ll(s), pick: pick(d), newN: nw.length, newPick: pick(nw), gap, cal: cal.map(c => `said ${(c.p / c.n * 100).toFixed(1)}% → won ${(c.w / c.n * 100).toFixed(1)}% (${c.n})`).join(' · ')}; }
// letters: the page's own 0-100 rank (site version) for sides with 5+ scored games, against their later win rate
const site0 = score(V[Object.keys(V)[0]]);
const lettersOf = LMIN => (() => { const T = new Map(); both.forEach(({g, A, B}, i) => { const pa = sig(site0.s * site0.d[i][0]); for (const [k, p, w, e] of [[keyOf(g[0], g[7]), A, g[2] === 1, pa], [keyOf(g[1], g[8]), B, g[2] !== 1, 1 - pa]]) { const o = T.get(k) || {p, n: 0, w: 0, e: 0}; o.n++; o.w += w ? 1 : 0; o.e += e; T.set(k, o); } });
  // LETTER_BANDS=fine (Nov 9, Sim: plus/minus letters): the proposed split, to check each step really wins more than the one below
  const L = process.env.LETTER_BANDS === 'fine' ? {'A+': [97, 101], A: [93, 97], 'A-': [90, 93], 'B+': [85, 90], B: [78, 85], 'B-': [70, 78], 'C+': [55, 70], C: [40, 55], 'C-': [30, 40], D: [10, 30], F: [0, 10]} : {A: [90, 101], B: [70, 90], C: [30, 70], D: [10, 30], F: [0, 10]}, out = {}; for (const [l, [a, c]] of Object.entries(L)) { const s = [...T.values()].filter(o => o.n >= LMIN && o.p.pct >= a && o.p.pct < c), n = s.reduce((x, o) => x + o.n, 0), w = s.reduce((x, o) => x + o.w, 0); const e = s.reduce((x, o) => x + o.e, 0), se = n ? Math.sqrt(.25 / n) * 196 : 0; out[l] = n ? `won ${(w / n * 100).toFixed(1)}% vs expected ${(e / n * 100).toFixed(1)}% (±${se.toFixed(1)}, ${s.length} teams, ${n} games)` : '—'; } return out; })();
const letters = lettersOf(5), lettersAll = lettersOf(1);
const res = {from: FROM, games: both.length, rows: {}}, pred = {cutDate: FROM, ev: both.map(x => x.g[3]), y: both.map(x => x.g[2] === 1 ? 1 : 0), ta: both.map(x => x.g[0]), tb: both.map(x => x.g[1]), rows: {}};
console.log(`${both.length} later games (from ${FROM}); ${score(V[Object.keys(V)[0]]).newN} of them between two new mixes (no record from earlier games)\n`);
const run = (k, f, extra) => { const S = score(f, extra); res.rows[k] = {pick: +S.pick.toFixed(2), ll: +S.ll.toFixed(5), gap: +S.gap.toFixed(2), newPick: S.newPick == null ? null : +S.newPick.toFixed(2), scale: +S.s.toFixed(3)};
  pred.rows[k] = S.d.map(([x]) => +sig(S.s * x).toFixed(5));
  console.log(`${k}\n  pick ${S.pick.toFixed(2)}% · ll ${S.ll.toFixed(5)} · calibration gap ${S.gap.toFixed(1)} pts · new mixes ${S.newPick == null ? '—' : S.newPick.toFixed(1) + '%'} · edge scale ${S.s.toFixed(2)}\n  ${S.cal}`); };
for (const [k, f] of Object.entries(V)) run(k, f);
run('site + learned matchups against this opponent (one game, not a grade)', V[Object.keys(V)[0]], g => mt(teams[g[0]], teams[g[1]]));
// how sure (Phase 1, thin data): games by the LESS sure side's word; within each group, the edge scale that fits best
// (1 = the grade's edges are right; under 1 = they should be held back more for teams like these) and the pick rate
{ const S0 = site0, grp = new Map(); both.forEach(({A, B}, i) => { const r = {High: 2, Medium: 1, Low: 0}, w = [A.sure, B.sure].filter(Boolean).sort((a, c) => r[a] - r[c])[0] || 'none'; if (!grp.has(w)) grp.set(w, []); grp.get(w).push(S0.d[i]); });
  console.log('\nhow sure (the less sure side of each game):');
  for (const [w, d] of grp) { const ll = s => d.reduce((a, [x, y]) => { const p = Math.min(1 - 1e-9, Math.max(1e-9, sig(s * x))); return a - (y ? Math.log(p) : Math.log(1 - p)); }, 0) / d.length;
    let lo = 0, hi = 5; for (let i = 0; i < 60; i++) { const a = lo + (hi - lo) / 3, c = hi - (hi - lo) / 3; if (ll(a) < ll(c)) hi = c; else lo = a; }
    let r = 0, n = 0; for (const [x, y] of d) { if (!x) continue; n++; if ((x > 0) === (y === 1)) r++; }
    console.log(`  ${w}: ${d.length} games · picks ${(r / n * 100).toFixed(1)}% · best edge scale ${((lo + hi) / 2 / S0.s).toFixed(2)} of the overall`); } }
console.log(`\nletters (site today), every side and game (fair: no selection on how far a team got):\n  ${Object.entries(lettersAll).map(([l, v]) => `${l} ${v}`).join('\n  ')}`);
console.log(`letters, sides with 5+ later games only (favours teams that kept winning):\n  ${Object.entries(letters).map(([l, v]) => `${l} ${v}`).join('\n  ')}`);
res.letters = letters; res.lettersAll = lettersAll;
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(pred));
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(res, null, 1));
