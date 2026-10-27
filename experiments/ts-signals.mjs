// Which team-strength signal best tells top finishers from the rest, on events nothing in it has seen?
// Every signal is built only from Limitless events BEFORE the events it is tested on (standings come from each event's
// game records; top cut = the top 8, or fewer for small events, as Limitless cuts). Tested on:
//  - Limitless held-out: the latest 20% of events (the model's own test split), top 8 vs the rest
//  - RK9 official regionals (top 64 team sheets): top 8 vs 9-64, evidence rebuilt from events before each regional
// Signals: (a) team average / min / top-4 average of the v3 rating score, (b) top-cut lift of the team's pairs and
// trios, (c) similarity to earlier top-cut teams, (d) the shrunk win model (train-only fit), (e) a blend fitted on an
// inner split of the training events. Plus player Elo, to see how much of top cut is the player.
// Usage: node experiments/ts-signals.mjs [modelTrain.json]
import fs from 'node:fs';
const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8')), OFF = JSON.parse(fs.readFileSync('out/official.json', 'utf8'));
const MOD = JSON.parse(fs.readFileSync(process.argv[2] || 'out/model_train_H_k1000_kp300.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), feats = M.feats, evDate = M.events.map(e => e[1]), evPlayers = M.events.map(e => e[2] || 0);
const cutSize = p => p < 16 ? 2 : p < 32 ? 4 : p < 96 ? 8 : p < 192 ? 16 : 32;
const order = [...evDate.keys()].sort((a, b) => evDate[a] < evDate[b] ? -1 : 1), CUT = Math.floor(order.length * .8);
const testEv = new Set(order.slice(CUT)), cutDate = evDate[order[CUT]];
// standings per event from its games: each player's team, deck, wins, games; place by wins then win rate
const ST = new Map();
for (const g of M.m) { const [A, B, r, ev, pa, pb, , dA, dB] = g; if (r === .5) continue; let E = ST.get(ev); if (!E) ST.set(ev, E = new Map());
  for (const [p, t, d, w] of [[pa, A, dA, r], [pb, B, dB, 1 - r]]) { let s = E.get(p); if (!s) E.set(p, s = {p, t, d, w: 0, n: 0}); s.w += w; s.n++; } }
const EVS = [...ST].map(([ev, E]) => { const st = [...E.values()].filter(s => s.n >= 3).sort((a, b) => b.w - a.w || b.w / b.n - a.w / a.n); st.forEach((s, i) => s.place = i + 1);
  const P = Math.max(evPlayers[ev] || 0, st.length); return {ev, d: evDate[ev], P, cut: cutSize(P), st}; }).filter(E => E.st.length >= 8);
// ---- evidence from events dated before `before` (strictly) ----
const key2 = (a, b) => a < b ? a + '|' + b : b + '|' + a, key3 = ns => ns.slice().sort().join('|');
function evidence(before, after = '') { const use = EVS.filter(E => E.d < before && E.d >= after), asOf = use.reduce((a, E) => E.d > a ? E.d : a, '');
  const mon = new Map(), pr = new Map(), tr = new Map(), pool = []; let F = 0, T = 0, W = 0, GM = 0;
  const g = (m, k) => { let o = m.get(k); if (!o) m.set(k, o = {f: 0, t: 0, ex: 0, w: 0, gm: 0}); return o; };
  for (const E of use) { const rw = Math.pow(.5, Math.max(0, (new Date(asOf) - new Date(E.d)) / 864e5) / 21), sw = Math.log2(Math.max(8, E.P) / 4), top = E.st.filter(s => s.place <= E.cut);
    const n = E.st.length, frac = top.length / n;
    for (const s of E.st) { const ms = teams[s.t], isTop = s.place <= E.cut; F += rw; W += rw * s.w; GM += rw * s.n; if (isTop) T += rw * sw;
      const subs = [[mon, ms.map(x => x)], [pr, []], [tr, []]];
      for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { subs[1][1].push(key2(ms[i], ms[j])); for (let k = j + 1; k < 6; k++) subs[2][1].push(key3([ms[i], ms[j], ms[k]])); }
      for (const [m, ks] of subs) for (const k of ks) { const o = g(m, k); o.f += rw; o.w += rw * s.w; o.gm += rw * s.n; o.ex += rw * sw * frac; if (isTop) o.t += rw * sw; }
      pool.push({ms: new Set(ms), top: isTop ? 1 : 0, w: rw}); } }
  return {mon, pr, tr, pool, F, T, base: GM ? W / GM : .5, n: use.length}; }
// ---- signals for one team (array of 6 names) given evidence X ----
// v3 rating score (13-rating.js on fix/ratings): ln(top-cut share) + 0.5 ln(usage) + ln(conversion, 6 of prior) + 8 x shrunk win-rate edge
function v3(X, n) { const o = X.mon.get(n) || {f: 0, t: 0, ex: 0, w: 0, gm: 0}; const top = (o.t + .05) / (X.T || 1), lift = (o.t + 6) / (o.ex + 6);
  const edge = (o.gm ? o.w / o.gm - X.base : 0) * o.gm / (o.gm + 1500); return Math.log(top) + .5 * Math.log((o.f + .05) / X.F) + Math.log(lift) + 8 * edge; }
function signals(X, ms) { const s = ms.map(n => v3(X, n)).sort((a, b) => b - a), avg = s.reduce((a, x) => a + x, 0) / 6;
  let pl = 0, tl = 0; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const o = X.pr.get(key2(ms[i], ms[j])); pl += o ? Math.log((o.t + 3) / (o.ex + 3)) : 0;
    for (let k = j + 1; k < 6; k++) { const q = X.tr.get(key3([ms[i], ms[j], ms[k]])); tl += q ? Math.log((q.t + 3) / (q.ex + 3)) : 0; } }
  // similarity: kernel estimate of top-cut odds among earlier teams, weighted by shared Pokémon (exp(1.2 * shared))
  let num = 0, den = 0; const S = new Set(ms); for (const t of X.pool) { let sh = 0; for (const n of S) if (t.ms.has(n)) sh++; if (sh < 3) continue; const k = t.w * Math.exp(1.2 * sh); num += k * t.top; den += k; }
  const base = X.T && X.F ? .1 : .1, nn = Math.log((num + 2 * base) / (den + 2));
  return {v3avg: avg, v3min: s[5], v3top4: (s[0] + s[1] + s[2] + s[3]) / 4, pairs: pl / 15, trios: tl / 20, core: pl / 15 + tl / 20, nn}; }
// ---- the win model (d): x the way model.mjs computes it, with each member's set clamped to its real range ----
const spF = new Map(); for (const k of Object.keys(MOD.sets || {})) { const sp = k.split(/[@:]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(k); }
function modelX(ms, fs_) { let x = 0; for (const n of ms) x += MOD.mons[n] || 0; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) x += MOD.pairs[key2(ms[i], ms[j])] || 0;
  if (fs_ && MOD.center) for (const n of ms) { let u = 0; for (const k of spF.get(n) || []) u += MOD.sets[k] * ((fs_.has(k) ? 1 : 0) - (MOD.setFreq[k] || 0)); const r = MOD.setRange[n]; x += r ? Math.max(r[0], Math.min(r[1], u)) : u; } return x; }
const deckFS = d => d == null ? null : new Set((M.decks[d] || []).map(f => feats[f]));
// ---- Elo from every game before a date ----
const GS = M.m.filter(g => g[2] !== .5).map(g => ({pa: g[4], pb: g[5], r: g[2], d: evDate[g[3]], rd: g[6] || 0})).sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.rd - b.rd);
function eloBefore(date) { const e = new Map(), get = p => e.get(p) ?? 1500; for (const x of GS) { if (x.d >= date) break; const a = get(x.pa), b = get(x.pb), ex = 1 / (1 + Math.pow(10, (b - a) / 400)); e.set(x.pa, a + 24 * (x.r - ex)); e.set(x.pb, b - 24 * (x.r - ex)); } return p => get(p); }
// ---- metrics ----
const auc = (pos, neg) => { const a = pos.map(v => [v, 1]).concat(neg.map(v => [v, 0])).sort((x, y) => x[0] - y[0]); let r = 0, np = 0, i = 0; while (i < a.length) { let j = i; while (j < a.length && a[j][0] === a[i][0]) j++; const avg = (i + j + 1) / 2; for (let k = i; k < j; k++) if (a[k][1]) { r += avg; np++; } i = j; } const nn = a.length - np; return np && nn ? +((r - np * (np + 1) / 2) / (np * nn)).toFixed(3) : null; };
const pctOf = (all, v) => { let lo = 0; for (const x of all) if (x < v) lo++; return Math.round(100 * lo / all.length); };
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
// ---- inner split for the blend: evidence before the last 20% of training events, targets in that 20% ----
const trainEvs = order.slice(0, CUT), innerCut = evDate[trainEvs[Math.floor(trainEvs.length * .8)]];
const XI = evidence(innerCut), inner = [];
for (const E of EVS) if (E.d >= innerCut && E.d < cutDate) for (const s of E.st) inner.push({y: s.place <= 8 ? 1 : 0, f: signals(XI, teams[s.t]), mx: modelX(teams[s.t], deckFS(s.d))});
const NAMES = ['v3avg', 'v3min', 'v3top4', 'pairs', 'trios', 'core', 'nn', 'model'];
const fv = r => NAMES.map(k => k === 'model' ? r.mx : r.f[k]);
// standardize on inner, logistic regression (gradient descent, small ridge) on the chosen features
const zs = NAMES.map((_, j) => { const v = inner.map(r => fv(r)[j]), m = v.reduce((a, x) => a + x, 0) / v.length, sd = Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / v.length) || 1; return [m, sd]; });
function fitLR(cols) { const w = new Array(cols.length + 1).fill(0); for (let it = 0; it < 3000; it++) { const gr = new Array(w.length).fill(0);
    for (const r of inner) { const v = fv(r), z = cols.map(j => (v[j] - zs[j][0]) / zs[j][1]); let e = w[0]; z.forEach((x, i) => e += w[i + 1] * x); const d = 1 / (1 + Math.exp(-e)) - r.y; gr[0] += d; z.forEach((x, i) => gr[i + 1] += d * x); }
    for (let i = 0; i < w.length; i++) w[i] -= .5 * (gr[i] / inner.length + (i ? .01 * w[i] : 0)); } return w; }
const innerAUC = Object.fromEntries(NAMES.map((k, j) => [k, auc(inner.filter(r => r.y).map(r => fv(r)[j]), inner.filter(r => !r.y).map(r => fv(r)[j]))]));
const best = NAMES.filter(k => innerAUC[k] >= .52), cols = best.map(k => NAMES.indexOf(k)), W = fitLR(cols);
const blend = v => { let e = W[0]; cols.forEach((j, i) => e += W[i + 1] * (v[j] - zs[j][0]) / zs[j][1]); return e; };
// ---- held-out Limitless ----
const XH = evidence(cutDate), eloH = eloBefore(cutDate), rows = [];
for (const E of EVS) if (testEv.has(E.ev)) for (const s of E.st) { const ms = teams[s.t], f = signals(XH, ms), mx = modelX(ms, deckFS(s.d)), v = [...NAMES.map(k => k === 'model' ? mx : f[k])];
  rows.push({ev: E.ev, place: s.place, f: Object.fromEntries(NAMES.map((k, j) => [k, v[j]])), blend: blend(v), elo: eloH(s.p), t: s.t, d: s.d, p: s.p}); }
const SIG = [...NAMES, 'blend', 'elo'], val = (r, k) => k === 'blend' ? r.blend : k === 'elo' ? r.elo : r.f[k];
function report(R, top, rest, tag) { const out = {}; for (const k of SIG) { const all = R.map(r => val(r, k)), P = r => pctOf(all, val(r, k));
    const byEv = new Map(); for (const r of R) { if (!byEv.has(r.ev)) byEv.set(r.ev, []); byEv.get(r.ev).push(r); }
    let ab = 0, nr = 0; for (const [, E] of byEv) { const w = E.find(r => r.place === 1); if (!w) continue; for (const r of E.filter(rest)) { nr++; if (val(r, k) > val(w, k)) ab++; } }
    out[k] = {auc: auc(R.filter(top).map(r => val(r, k)), R.filter(rest).map(r => val(r, k))), win: med(R.filter(r => r.place === 1).map(P)), top8: med(R.filter(top).map(P)), field: med(R.filter(rest).map(P)), aboveWinner: nr ? +(ab / nr).toFixed(3) : null}; }
  return out; }
const LIM = report(rows, r => r.place <= 8, r => r.place > 8, 'lim');
// game-level: P(A beats B) = sigmoid(b * (sA - sB)), b fitted on inner-window games, scored on held-out games
const teamSig = new Map(); for (const r of rows) teamSig.set(r.ev + '|' + r.p, r);
const games = M.m.filter(g => g[2] !== .5 && testEv.has(g[3])).map(g => [teamSig.get(g[3] + '|' + g[4]), teamSig.get(g[3] + '|' + g[5]), g[2]]).filter(x => x[0] && x[1]);
const innerByKey = new Map(); for (const E of EVS) if (E.d >= innerCut && E.d < cutDate) for (const s of E.st) innerByKey.set(E.ev + '|' + s.p, {f: signals(XI, teams[s.t]), mx: modelX(teams[s.t], deckFS(s.d))});
const eloI = eloBefore(innerCut), igames = M.m.filter(g => g[2] !== .5 && evDate[g[3]] >= innerCut && evDate[g[3]] < cutDate).map(g => [innerByKey.get(g[3] + '|' + g[4]), innerByKey.get(g[3] + '|' + g[5]), g[2], g[4], g[5]]).filter(x => x[0] && x[1]);
const ival = (o, k, p) => k === 'model' ? o.mx : k === 'blend' ? blend(NAMES.map(n => n === 'model' ? o.mx : o.f[n])) : k === 'elo' ? eloI(p) : o.f[k];
const GAME = {}; for (const k of SIG) { const di = igames.map(([a, b, r, pa, pb]) => [ival(a, k, pa) - ival(b, k, pb), r]); let bb = 0; for (let it = 0; it < 60; it++) { let g = 0, h = 0; for (const [d, r] of di) { const p = 1 / (1 + Math.exp(-bb * d)); g += (p - r) * d; h += p * (1 - p) * d * d; } bb -= g / (h || 1); }
  let ll = 0, ac = 0; for (const [a, b, r] of games) { const d = val(a, k) - val(b, k), p = Math.min(1 - 1e-6, Math.max(1e-6, 1 / (1 + Math.exp(-bb * d)))); ll -= r * Math.log(p) + (1 - r) * Math.log(1 - p); ac += (p > .5) === (r === 1) ? 1 : (p === .5 ? .5 : 0); }
  GAME[k] = {logloss: +(ll / games.length).toFixed(4), acc: +(ac / games.length).toFixed(4)}; }
// ---- RK9 regionals: evidence and Elo from Limitless events before each regional ----
const rk = [];
for (const e of OFF.events) { const X = evidence(e.date); for (const t of e.teams) { const ms = t.mons.map(m => m.n); if (ms.length !== 6) continue; const f = signals(X, ms);
    const fs_ = new Set(t.mons.flatMap(m => [m.n + '@' + m.i, ...(m.mv || []).map(v => m.n + ':' + v)])), mx = modelX(ms, fs_), v = NAMES.map(k => k === 'model' ? mx : f[k]);
    rk.push({ev: e.name, place: t.st, f: Object.fromEntries(NAMES.map((k, j) => [k, v[j]])), blend: blend(v), elo: null}); } }
const RK = report(rk, r => r.place <= 8, r => r.place > 8, 'rk9');
// ---- skill: how much of held-out top 8 is the player (Elo before the event) vs the team ----
const both = (k) => { // logistic on [elo, team signal] fit on inner, AUC on held-out
  const tr = []; for (const E of EVS) if (E.d >= innerCut && E.d < cutDate) for (const s of E.st) { const o = innerByKey.get(E.ev + '|' + s.p); if (o) tr.push([eloI(s.p), ival(o, k, s.p), s.place <= 8 ? 1 : 0]); }
  const m0 = tr.reduce((a, r) => a + r[0], 0) / tr.length, s0 = Math.sqrt(tr.reduce((a, r) => a + (r[0] - m0) ** 2, 0) / tr.length) || 1, m1 = tr.reduce((a, r) => a + r[1], 0) / tr.length, s1 = Math.sqrt(tr.reduce((a, r) => a + (r[1] - m1) ** 2, 0) / tr.length) || 1;
  const w = [0, 0, 0]; for (let it = 0; it < 3000; it++) { const g = [0, 0, 0]; for (const [a, b, y] of tr) { const za = (a - m0) / s0, zb = (b - m1) / s1, d = 1 / (1 + Math.exp(-(w[0] + w[1] * za + w[2] * zb))) - y; g[0] += d; g[1] += d * za; g[2] += d * zb; } for (let i = 0; i < 3; i++) w[i] -= .5 * g[i] / tr.length; }
  const sc = r => w[1] * (r.elo - m0) / s0 + w[2] * (val(r, k) - m1) / s1; return {w_elo: +w[1].toFixed(3), w_team: +w[2].toFixed(3), auc: auc(rows.filter(r => r.place <= 8).map(sc), rows.filter(r => r.place > 8).map(sc))}; };
const SKILL = {elo_alone: LIM.elo.auc, elo_plus_model: both('model'), elo_plus_blend: both('blend'), elo_plus_core: both('core')};
console.log(JSON.stringify({cutDate, innerCut, heldoutTeams: rows.length, heldoutEvents: new Set(rows.map(r => r.ev)).size, rk9Teams: rk.length, innerAUC, blendFeatures: best, blendWeights: W.map(x => +x.toFixed(3)), LIM, RK, GAME, SKILL}, null, 1));
fs.writeFileSync('out/ts_signals.json', JSON.stringify({LIM, RK, GAME, SKILL, innerAUC, best, W, zs, cols}));
