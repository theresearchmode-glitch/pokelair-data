// Ratings, tested fairly. Every ingredient of a Pokémon's rating that comes from Limitless games (win rate, how often
// it's picked, the win model's strength) is rebuilt from OLDER games only; the weights are fitted on the next slice of
// events; the result is scored on the NEWEST 20% of events, which nothing here has seen. The page's current ratings are
// scored on the same games as a baseline (they were built with those games in them, so the comparison favours them).
// A rating "predicts" a game through its team: the side whose six add up to more rating should win.
// Usage: node experiments/rating-fit.mjs <components.json from the page>   (writes out/rating_fit.json)
import fs from 'node:fs';
const strip = s => s.replace(/^﻿/, '');
const C = JSON.parse(strip(fs.readFileSync(process.argv[2], 'utf8'))), M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8')), SPL = JSON.parse(fs.readFileSync('out/model_splits.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
// same split as model.mjs: last 20% of events (by date) are the test; the last 15% of the rest validate
const evD = M.events.map(e => e[1]), order = [...evD.keys()].sort((a, b) => evD[a] < evD[b] ? -1 : 1), TF = +(process.env.TEST_FROM || .8), TT = +(process.env.TEST_TO || 1), cut = new Set(order.slice(Math.floor(order.length * TF), Math.floor(order.length * TT))), before = new Set(order.slice(0, Math.floor(order.length * TF)));
const train = G.filter(g => before.has(g[3])), test = G.filter(g => cut.has(g[3]));
const trEv = [...new Set(train.map(g => g[3]))].sort((a, b) => evD[a] < evD[b] ? -1 : 1), vcut = new Set(trEv.slice(Math.floor(trEv.length * .85)));
const fitPart = train.filter(g => !vcut.has(g[3])), val = train.filter(g => vcut.has(g[3]));
// Limitless-derived numbers from a set of games, defined like the page's tournament source: [% of teams, win %, games]
function tour(games) { const ent = new Map(), w = new Map(), n = new Map();
  for (const [A, B, r, ev, pa, pb] of games) for (const [t, p, won] of [[A, pa, r], [B, pb, 1 - r]]) { ent.set(ev + '|' + p, t); for (const m of teams[t]) { n.set(m, (n.get(m) || 0) + 1); w.set(m, (w.get(m) || 0) + won); } }
  const cnt = new Map(); for (const t of ent.values()) for (const m of teams[t]) cnt.set(m, (cnt.get(m) || 0) + 1);
  const E = ent.size, out = {}; for (const [m, k] of n) out[m] = [100 * (cnt.get(m) || 0) / E, 100 * (w.get(m) || 0) / k, k]; return out; }
const NAMES = Object.keys(C);
// one feature row per Pokémon; z-scored over the roster so the weights are comparable
const FEATS = ['model', 'wr', 'pick', 'official', 'smogon', 'prd', 'ingame', 'power', 'typing', 'tools'];
function features(T, mons) { const wm = (() => { let a = 0, b = 0; for (const k in T) { a += T[k][1] * T[k][2]; b += T[k][2]; } return a / b; })();
  const raw = NAMES.map(n => { const c = C[n], t = T[n], o = c.off;
    return [mons[n] ?? null,
      t ? ((t[1] - wm) / 100) * t[2] / (t[2] + 600) : null,
      t ? Math.log10(Math.max(.03, t[0])) : Math.log10(.03),
      o ? ((o[1] - 50) / 100) * o[2] / (o[2] + 400) : null,
      c.smogon != null ? Math.log10(Math.max(.05, c.smogon)) : Math.log10(.05),
      c.prd != null ? Math.log10(Math.max(.03, c.prd)) : Math.log10(.03),
      c.ingame != null ? -Math.log10(c.ingame) : -Math.log10(400),
      c.power, c.typing, c.tools]; });
  const st = FEATS.map((_, j) => { const v = raw.map(r => r[j]).filter(x => x != null), m = v.reduce((a, x) => a + x, 0) / v.length, s = Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / v.length) || 1; return {m, s}; });
  const F = new Map(NAMES.map((n, i) => [n, raw[i].map((x, j) => x == null ? 0 : (x - st[j].m) / st[j].s)])); return {F, st}; }
// game rows: each side's summed features; label = side A won
const rows = (games, F) => games.map(([A, B, r]) => { const d = new Float64Array(FEATS.length); for (const m of teams[A]) { const f = F.get(m); if (f) f.forEach((x, j) => d[j] += x); } for (const m of teams[B]) { const f = F.get(m); if (f) f.forEach((x, j) => d[j] -= x); } return {d, r}; });
function logit(R, cols, lam = 2) { const k = cols.length, w = new Float64Array(k);
  for (let it = 0; it < 60; it++) { const g = new Float64Array(k), H = Array.from({length: k}, () => new Float64Array(k));
    for (const {d, r} of R) { let e = 0; cols.forEach((c, i) => e += w[i] * d[c]); const p = 1 / (1 + Math.exp(-e)), q = p * (1 - p);
      cols.forEach((c, i) => { g[i] += (p - r) * d[c]; for (let j = 0; j < k; j++) H[i][j] += q * d[c] * d[cols[j]]; }); }
    for (let i = 0; i < k; i++) { g[i] += lam * w[i]; H[i][i] += lam; }
    // solve H x = g (Gaussian elimination)
    const A = H.map((row, i) => [...row, g[i]]); for (let i = 0; i < k; i++) { let p = i; for (let j = i + 1; j < k; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j; [A[i], A[p]] = [A[p], A[i]];
      for (let j = i + 1; j < k; j++) { const f = A[j][i] / A[i][i]; for (let c = i; c <= k; c++) A[j][c] -= f * A[i][c]; } }
    const x = new Float64Array(k); for (let i = k - 1; i >= 0; i--) { let s = A[i][k]; for (let j = i + 1; j < k; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    let ch = 0; for (let i = 0; i < k; i++) { w[i] -= x[i]; ch += Math.abs(x[i]); } if (ch < 1e-9) break; }
  return w; }
const score = (R, cols, w) => { let ll = 0, acc = 0; for (const {d, r} of R) { let e = 0; cols.forEach((c, i) => e += w[i] * d[c]); const p = 1 / (1 + Math.exp(-e)); ll -= r * Math.log(p) + (1 - r) * Math.log(1 - p); acc += (p > .5) === (r === 1) ? 1 : 0; } return {logloss: +(ll / R.length).toFixed(5), acc: +(acc / R.length).toFixed(4)}; };
// features built from older games: fitPart (to fit weights on the validation games), train (to score the test games)
const fV = features(tour(fitPart), SPL.fitPart), fT = features(tour(train), SPL.train);
const RV = rows(val, fV.F), RT = rows(test, fT.F);
// the page's current ratings, as one feature (scale fitted on validation games too)
const cur = new Map(NAMES.map(n => [n, [(C[n].total - 50) / 20]])), RcV = rows(val, cur), RcT = rows(test, cur);
const res = {}; const all = FEATS.map((_, j) => j);
res.current_page_ratings = score(RcT, [0], logit(RcV, [0]));
const sets = {model_only: [0], results_only: [1, 2], model_and_results: [0, 1, 2], everything: all, everything_but_stats: [0, 1, 2, 3, 4, 5, 6],
  model_wr_ladder: [0, 1, 4, 5], model_wr_ladder_official: [0, 1, 3, 4, 5], model_wr_smogon: [0, 1, 4], model_wr_allpop: [0, 1, 2, 4, 5, 6]};
const W = {}; for (const [k, cols] of Object.entries(sets)) { const w = logit(RV, cols); W[k] = Object.fromEntries(cols.map((c, i) => [FEATS[c], +w[i].toFixed(4)])); res[k] = score(RT, cols, w); }
// how much seeing the test games is worth: the same recipes built from ALL games (as the page's ratings are)
{ const fA = features(tour(G), JSON.parse(fs.readFileSync(process.env.MODEL_ALL || 'out/model.json', 'utf8')).mons), RA = rows(test, fA.F);
  for (const k of ['model_only', 'everything_but_stats', 'everything']) { const cols = sets[k], w = cols.map(c => W[k][FEATS[c]]); res[k + '_with_test_games_leaked'] = score(RA, cols, w); } }
// the page's current formula re-run on training games only (experiments/rating-clean.mjs): CLEAN=path[,path2]
for (const f of (process.env.CLEAN || '').split(',').filter(Boolean)) { const R = JSON.parse(strip(fs.readFileSync(f, 'utf8'))), m = new Map(Object.entries(R).map(([n, v]) => [n, [(v.total - 50) / 20]]));
  res['current_formula_clean' + (f.includes('adj') ? '_keeping_adj' : '')] = score(rows(test, m), [0], logit(rows(val, m), [0])); }
res.coin_flip = {logloss: .69315, acc: .5};
console.log(JSON.stringify({games: {fit: fitPart.length, validate: val.length, test: test.length}, test: res, weights: W}, null, 1));
fs.writeFileSync('out/rating_fit.json', JSON.stringify({updated: new Date().toISOString(), feats: FEATS, test: res, weights: W, scaling: fT.st}, null, 1));
