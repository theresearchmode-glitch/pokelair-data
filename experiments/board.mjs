// The grade scoreboard (Nov 8, Sim: "I NEED our grading and recommendation system to be actually top notch").
// One place that says how good the grade and the suggestions really are, so every later change has to beat it.
// Honest set-up (as grade-check.mjs / grade-v2.mjs): events are split by date; everything is learned from the first 80%
// (out/model_train.json is trained on those only; each six's own record and player skill are fitted on those games only),
// and scored on the later 20%, which nothing has seen.
// What it measures, for each version of the grade:
//   1. pick    in each later game, does the higher-graded six win (%)
//   2. ll      log-loss of the win chance (lower is better; a coin flip is .6931)
//   3. calib   does "65% to win" really win about 65%: predicted vs actual in five bands, and the average gap (pts)
//   4. letters later win rate of teams by letter (A top 10% … F bottom 10% of graded later teams): A should win most
//   5. swaps   the suggestion test: a player changes one Pokémon between two events (5 of 6 the same, the second event later).
//              Does the grade's change say which way their results moved? (% right on the swaps it calls by 1+ pt, and r)
// Usage: node experiments/board.mjs [out.json]      (read-only)
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches.json', 'utf8')), MT = JSON.parse(fs.readFileSync(process.env.BOARD_MT || OUT + 'model_train.json', 'utf8'));
// BOARD_MT=file BOARD_CUT=.6 : score a model trained on the first 60% instead (more later games and swaps to test on)
const CUTF = +(process.env.BOARD_CUT || .8);
const teams = M.teams.map(k => k.split('|')), calib = MT.calib, sig = z => 1 / (1 + Math.exp(-z));
// ---- team strength as the page computes it: species + pairs (+ each member's set, centered and clamped, when the deck is known)
const spF = new Map(); for (const f of Object.keys(MT.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
const pairX = t => { const m = teams[t]; let v = 0; for (const n of m) v += MT.mons[n] || 0;
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MT.pairs || {})[k] || 0; } return v; };
const setX = (t, d, noClamp, RG) => { if (d == null || !M.decks || !M.decks[d]) return 0; const has = new Set(M.decks[d].map(f => M.feats[f])); let v = 0;
  for (const n of teams[t]) { let u = 0; for (const f of spF.get(n) || []) u += MT.sets[f] * ((has.has(f) ? 1 : 0) - ((MT.setFreq || {})[f] || 0)); const r = noClamp ? null : (RG || MT.setRange || {})[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; }
  return v; };
// ---- the date split
const ev = M.events, ord = [...ev.keys()].sort((a, b) => ev[a][1] < ev[b][1] ? -1 : 1), lo = Math.floor(ord.length * CUTF), futE = new Set(ord.slice(lo)), cutDate = ev[ord[lo]][1];
const evRank = new Map(ord.map((e, i) => [e, i]));
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6), past = G.filter(g => !futE.has(g[3])), fut = G.filter(g => futE.has(g[3]));
// ---- each six's own record and each player's skill, fitted on past games only (as six.mjs does on all games)
function fitSix(xf, tau = .35, sigS = .6, iters = 300) {
  const X = past.map(g => [xf(g[0], g[7]), xf(g[1], g[8])]), s = new Float64Array(M.players), dl = new Float64Array(M.teams.length);
  const ms = new Float64Array(M.players), vs = new Float64Array(M.players), md = new Float64Array(M.teams.length), vd = new Float64Array(M.teams.length), gs = new Float64Array(M.players), gd = new Float64Array(M.teams.length), lr = .05, b1 = .9, b2 = .999;
  for (let it = 1; it <= iters; it++) { gs.fill(0); gd.fill(0);
    past.forEach((g, i) => { const e = (g[2] === 1 ? 1 : 0) - sig(calib * (X[i][0] + dl[g[0]] - X[i][1] - dl[g[1]]) + s[g[4]] - s[g[5]]); gs[g[4]] += e; gs[g[5]] -= e; gd[g[0]] += calib * e; gd[g[1]] -= calib * e; });
    for (let j = 0; j < s.length; j++) { const gr = gs[j] - s[j] / (sigS * sigS); ms[j] = b1 * ms[j] + (1 - b1) * gr; vs[j] = b2 * vs[j] + (1 - b2) * gr * gr; s[j] += lr * (ms[j] / (1 - b1 ** it)) / (Math.sqrt(vs[j] / (1 - b2 ** it)) + 1e-8); }
    for (let j = 0; j < dl.length; j++) { const gr = gd[j] - dl[j] / (tau * tau); md[j] = b1 * md[j] + (1 - b1) * gr; vd[j] = b2 * vd[j] + (1 - b2) * gr * gr; dl[j] += lr * (md[j] / (1 - b1 ** it)) / (Math.sqrt(vd[j] / (1 - b2 ** it)) + 1e-8); } }
  // the page keys a six's record by its six Pokémon (any order), so the same six under another team id shares it
  const per = new Map(); past.forEach(g => { for (const t of [g[0], g[1]]) { const k = teams[t].slice().sort().join('|'), o = per.get(k) || {g: 0, d: 0}; o.g++; o.d += dl[t]; per.set(k, o); } });
  const f = t => { const o = per.get(teams[t].slice().sort().join('|')); return o && o.g >= 10 ? o.d / o.g : 0; }; f.s = s; return f; }
// ---- the versions of the grade being compared
const V = {};
V['Pokémon + pairs only (no sets)'] = (t, d) => pairX(t);
V['+ the most common sets only'] = (t, d) => pairX(t);            // centered sets: the usual set adds 0, so this equals the line above
V['+ its own sets (items, moves)'] = (t, d) => pairX(t) + setX(t, d);
V['+ its own sets, no cap on how much a set can count'] = (t, d) => pairX(t) + setX(t, d, true);
// (a) where should the cap sit? Ranges built from past decks only: each species' build values and how many decks ran each build
{ const vals = new Map(), seen = new Set(); for (const g of past) for (const [t, d] of [[g[0], g[7]], [g[1], g[8]]]) { if (d == null || !M.decks[d] || seen.has(t + ',' + d)) continue; seen.add(t + ',' + d);
    const has = new Set(M.decks[d].map(f => M.feats[f])); for (const n of teams[t]) { let u = 0; const key = []; for (const f of spF.get(n) || []) { u += MT.sets[f] * ((has.has(f) ? 1 : 0) - ((MT.setFreq || {})[f] || 0)); if (has.has(f)) key.push(f); }
      if (!vals.has(n)) vals.set(n, {a: [], b: new Map()}); const o = vals.get(n); o.a.push(u); const k = key.join(','), b = o.b.get(k) || {c: 0, v: u}; b.c++; o.b.set(k, b); } }
  const mk = (loF, minC) => { const R = {}; for (const [n, o] of vals) { const a = o.a.slice().sort((x, y) => x - y), bs = [...o.b.values()].filter(b => b.c >= minC);
      const top = bs.length ? Math.max(...bs.map(b => b.v)) : Math.max(...a), lo = loF == null ? a[0] : a[Math.floor(loF * (a.length - 1))]; R[n] = [Math.min(lo, top), top]; } return R; };
  const RG = {'floor: lowest real build · ceiling: best build on 20+ decks': mk(null, 20), 'floor: 10th pct · ceiling: best build on 5+ decks': mk(.1, 5),
    'floor: lowest real build · ceiling: best build on 5+ decks': mk(null, 5), 'floor: lowest real build · ceiling: best build on 2+ decks': mk(null, 2)};
  for (const [k, R] of Object.entries(RG)) V['+ own sets, cap ' + k] = (t, d) => pairX(t) + setX(t, d, false, R); }
process.stdout.write('fitting each six\'s own record on past games…\r');
const dlS = fitSix((t, d) => pairX(t) + setX(t, d));
V['+ own sets + this six\'s own record  [site today, minus matchups]'] = (t, d) => pairX(t) + setX(t, d) + dlS(t);
// ---- scoring
const games = fut, scale = f => { const d = games.map(g => [f(g[0], g[7]) - f(g[1], g[8]), g[2] === 1 ? 1 : 0]);
  const ll = b => d.reduce((a, [x, y]) => { const p = Math.min(1 - 1e-9, Math.max(1e-9, sig(b * x))); return a - (y ? Math.log(p) : Math.log(1 - p)); }, 0) / d.length;
  let l = 0, h = 20; for (let i = 0; i < 60; i++) { const a = l + (h - l) / 3, c = h - (h - l) / 3; if (ll(a) < ll(c)) h = c; else l = a; } const b = (l + h) / 2; return {d, b, ll: ll(b)}; };
function board(f) { const {d, b, ll} = scale(f);
  let r = 0, n = 0; for (const [x, y] of d) { if (Math.abs(x) < 1e-12) continue; n++; if ((x > 0) === (y === 1)) r++; }
  // calibration: the favourite's chance, in bands
  const bands = [[.5, .55], [.55, .6], [.6, .65], [.65, .7], [.7, 1.01]].map(([a, c]) => ({a, c, n: 0, p: 0, w: 0}));
  for (const [x, y] of d) { if (!x) continue; const p = sig(b * Math.abs(x)), won = (x > 0) === (y === 1) ? 1 : 0, B = bands.find(B => p >= B.a && p < B.c); if (B) { B.n++; B.p += p; B.w += won; } }
  const cal = bands.filter(B => B.n >= 30).map(B => ({band: `${Math.round(B.a * 100)}–${Math.min(100, Math.round(B.c * 100))}%`, n: B.n, said: +(B.p / B.n * 100).toFixed(1), won: +(B.w / B.n * 100).toFixed(1)}));
  const gap = cal.reduce((a, c) => a + c.n * Math.abs(c.said - c.won), 0) / Math.max(1, cal.reduce((a, c) => a + c.n, 0));
  // letters: later teams with 5+ later games, graded by rank among them, against their later win rate
  const T = new Map(); for (const g of games) for (const [t, dk, w] of [[g[0], g[7], g[2] === 1], [g[1], g[8], g[2] !== 1]]) { const o = T.get(t) || {g: 0, w: 0, d: dk}; o.g++; o.w += w ? 1 : 0; T.set(t, o); }
  const R = [...T].filter(([, o]) => o.g >= 5).map(([t, o]) => ({v: f(t, o.d), g: o.g, w: o.w})).sort((a, c) => a.v - c.v), L = {A: [.9, 1.01], B: [.7, .9], C: [.3, .7], D: [.1, .3], F: [0, .1]}, letters = {};
  R.forEach((o, i) => { o.q = i / R.length; }); for (const [k, [a, c]] of Object.entries(L)) { const s = R.filter(o => o.q >= a && o.q < c), gg = s.reduce((x, o) => x + o.g, 0), ww = s.reduce((x, o) => x + o.w, 0); letters[k] = {teams: s.length, won: +(ww / gg * 100).toFixed(1)}; }
  return {pick: +(r / n * 100).toFixed(2), ll: +ll.toFixed(4), calGap: +gap.toFixed(1), cal, letters, n}; }
// ---- the suggestion test: one-Pokémon swaps by the same player, the second team played in the later events
function swaps(f) { const byP = new Map(); // player → [{t, e, dk, g, w}] per (team, event)
  const add = (p, t, e, dk, w) => { const k = p + ':' + t + ':' + e; let o = byP.get(k); if (!o) { o = {p, t, e, dk, g: 0, w: 0}; byP.set(k, o); } o.g++; o.w += w; };
  for (const g of G) { add(g[4], g[0], g[3], g[7], g[2] === 1 ? 1 : 0); add(g[5], g[1], g[3], g[8], g[2] === 1 ? 0 : 1); }
  const per = new Map(); for (const o of byP.values()) { if (!per.has(o.p)) per.set(o.p, []); per.get(o.p).push(o); }
  const out = []; for (const L of per.values()) { L.sort((a, c) => evRank.get(a.e) - evRank.get(c.e));
    for (let i = 1; i < L.length; i++) { const b2 = L[i], a1 = L[i - 1]; if (!futE.has(b2.e) || b2.g < 4 || a1.g < 4 || a1.t === b2.t) continue;
      const A = new Set(teams[a1.t]), same = teams[b2.t].filter(n => A.has(n)).length; if (same !== 5) continue;
      out.push({pred: f(b2.t, b2.dk) - f(a1.t, a1.dk), real: b2.w / b2.g - a1.w / a1.g, g: Math.min(a1.g, b2.g)}); } }
  return out; }
function swapScore(f, b) { const S = swaps(f); if (!S.length) return {n: 0};
  const pts = x => x * b * 25;   // the grade change, roughly in rating points around the middle (σ slope ¼ × 100)
  const called = S.filter(s => Math.abs(pts(s.pred)) >= 1 && s.real !== 0), right = called.filter(s => (s.pred > 0) === (s.real > 0)).length;
  const mx = S.reduce((a, s) => a + s.pred, 0) / S.length, my = S.reduce((a, s) => a + s.real, 0) / S.length; let sxy = 0, sxx = 0, syy = 0;
  for (const s of S) { sxy += (s.pred - mx) * (s.real - my); sxx += (s.pred - mx) ** 2; syy += (s.real - my) ** 2; }
  return {n: S.length, called: called.length, right: +(right / Math.max(1, called.length) * 100).toFixed(1), r: +(sxy / Math.sqrt(sxx * syy)).toFixed(3)}; }
// ---- run
console.log(`cut ${cutDate} · past games ${past.length} · later games ${fut.length} (${futE.size} events)`);
const res = {cutDate, past: past.length, later: fut.length, rows: {}};
for (const [k, f] of Object.entries(V)) { const B = board(f), sw = swapScore(f, scale(f).b); res.rows[k] = {...B, swaps: sw};
  console.log(`\n${k}\n  pick ${B.pick}% · ll ${B.ll} · calibration gap ${B.calGap} pts · later win rate by letter: ${Object.entries(B.letters).map(([l, o]) => `${l} ${o.won}%`).join(', ')}`);
  console.log(`  calibration: ${B.cal.map(c => `said ${c.said}% → won ${c.won}% (${c.n})`).join(' · ')}`);
  console.log(`  swaps: ${sw.n} one-Pokémon changes; on the ${sw.called} the grade calls by 1+ pt it gets the direction right ${sw.right}% · r ${sw.r}`); }
// context: how much of who wins is the player, and how much the team (skill fitted on past games; new players count as average)
{ const sk = dlS.s, best = V['+ own sets + this six\'s own record  [site today, minus matchups]'], pk = f => { let r = 0, n = 0; for (const g of fut) { const x = f(g); if (Math.abs(x) < 1e-12) continue; n++; if ((x > 0) === (g[2] === 1)) r++; } return +(r / n * 100).toFixed(2); };
  res.player = pk(g => sk[g[4]] - sk[g[5]]); res.both = pk(g => calib * (best(g[0], g[7]) - best(g[1], g[8])) + sk[g[4]] - sk[g[5]]);
  console.log(`\ncontext: the better player (by past results) won ${res.player}% of later games; team grade + player together ${res.both}%`); }
if (process.env.BOARD_SWAPS) fs.writeFileSync(process.env.BOARD_SWAPS, JSON.stringify(Object.fromEntries(Object.entries(V).map(([k, f]) => [k, swaps(f).map(o => ({...o, pred: o.pred * scale(f).b}))]))));
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1));
