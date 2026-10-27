// Team strength model trained on real games: every pairing where both teams are known.
// P(A beats B) = σ( skillA − skillB + x(A) − x(B) ),
// x(team) = Σ mon strength + Σ pair synergy (pairs on 30+ teams) + Σ set features (items and moves seen on 40+ teams).
// Player skill is fitted alongside, so a strong player's wins don't inflate their Pokémon. Ridge-shrunk, fitted with Adam.
// Tested on held-out recent events before anything ships: set features are kept only if they beat the species-only model,
// and the model ships only if it beats raw win rates. Writes out/model.json with the numbers and the test scores.
// v2 (Oct 26): set features are centered within each species (has feature − how often that species' decks have it), so a
// Pokémon's strength lives in one shrunk number and sets only say how a build differs from the usual one. Before this, a
// rarely used Pokémon with one fixed set could pile up credit across 5 set features (Mega Camerupt rated as the best
// Pokémon in the game). Also ships the held-out calibration slope and the spread of real teams, so the page can score a
// team against real tournament teams instead of a fixed range that any odd team could max out.
import fs from 'node:fs'; import {pilotTest} from './pilot.mjs';
const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
const monIx = new Map(), mons = [];
teams.flat().forEach(n => { if (!monIx.has(n)) { monIx.set(n, mons.length); mons.push(n); } });
// pair features: pairs on 30+ distinct teams in games
const pc = new Map(), seen = new Set();
for (const g of G) for (const t of [g[0], g[1]]) { if (seen.has(t)) continue; seen.add(t); const m = teams[t];
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] + '|' + m[j]; pc.set(k, (pc.get(k) || 0) + 1); } }
const pairIx = new Map([...pc].filter(([, n]) => n >= 30).map(([k], i) => [k, i])), pairs = [...pairIx.keys()];
const tf = teams.map(m => { const f = m.map(n => monIx.get(n)), p = [];
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const q = pairIx.get(m[i] + '|' + m[j]); if (q != null) p.push(q); } return {f, p}; });
// set features (older matches.json has none): items and moves seen on 40+ distinct decks in games
const hasSets = Array.isArray(M.decks) && G.length && G[0].length >= 9;
let setNames = [], deckF = [];
if (hasSets) { const cnt = new Map(), used = new Set(); for (const g of G) { used.add(g[7]); used.add(g[8]); }
  for (const d of used) for (const f of M.decks[d]) cnt.set(f, (cnt.get(f) || 0) + 1);
  const keep = new Map([...cnt].filter(([, n]) => n >= 40).map(([f], i) => [f, i])); setNames = [...keep.keys()].map(f => M.feats[f]);
  deckF = M.decks.map(fs_ => fs_.map(f => keep.get(f)).filter(j => j != null)); }
// centering: how often each kept feature appears among decks that carry its species
const featSp = setNames.map(f => f.split(/[@:]/)[0]), spFeats = new Map(), freq = new Float64Array(setNames.length);
if (hasSets) { const spDecks = new Map(), fd = new Float64Array(setNames.length), used = new Set(); for (const g of G) { used.add(g[7]); used.add(g[8]); }
  for (const d of used) { for (const sp of new Set(M.decks[d].map(f => M.feats[f].split(/[@:]/)[0]))) spDecks.set(sp, (spDecks.get(sp) || 0) + 1); for (const j of deckF[d]) fd[j]++; }
  setNames.forEach((f, j) => { freq[j] = fd[j] / (spDecks.get(featSp[j]) || 1); if (!spFeats.has(featSp[j])) spFeats.set(featSp[j], []); spFeats.get(featSp[j]).push(j); }); }
const nP = M.players;
// time split: last 20% of events (by date) held out
const evDates = M.events.map(e => e[1]); const order = [...evDates.keys()].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1);
// TEST_FROM / TEST_TO (experiments only): hold out an earlier slice instead, training only on events before it
const TF = +(process.env.TEST_FROM || .8), TT = +(process.env.TEST_TO || 1), lo = Math.floor(order.length * TF), hi = Math.floor(order.length * TT);
const cut = new Set(order.slice(lo, hi)), before = new Set(order.slice(0, lo));
const train = G.filter(g => before.has(g[3])), test = G.filter(g => cut.has(g[3]));
// v3 (Oct 27): recent games count more. A game's weight halves every `half` days before the newest game in the fit
// (0 = all games equal); the half-life is picked on the validation slice. Tested on held-out events: recency plus
// set features called 56.0% of games vs 54.9%, beat 50% in 56 of 66 events vs 52, and lowered calibrated log-loss.
const day = s => new Date(s + 'T00:00:00Z').getTime() / 864e5;
// v5 (Oct 27): evidence shrink. After fitting, each Pokémon's effect is scaled by n/(n+1000) and each pair's by
// n/(n+300), n = its team appearances in the games fitted, so a Pokémon a few strong players brought can't carry a team
// on a big number from a small sample. Tested on held-out events (TRAIN_ONLY + experiments/ts-audit.mjs, Oct 27):
// log-loss 0.6828 vs 0.6830 without it, the same separation of top-8 teams from the rest (AUC 0.60), and a six of rare
// high-number Pokémon (Annihilape, Kommo-o, Scrafty, Mega Venusaur, Hydreigon, Mega Charizard Y) fell from 68 to 28.
// EVID_K / EVID_KP env vars override (0 = off).
const EVID_K = +(process.env.EVID_K ?? 1000), EVID_KP = +(process.env.EVID_KP ?? 300);
function fit(games, opt) { const {useSkill = true, usePairs = true, useSets = false, iters = 250, lb = 4, lp = 15, ls = 1.5, lc = 40, half = 0} = opt || {};
  const b = new Float64Array(mons.length), q = new Float64Array(pairs.length), s = new Float64Array(nP), c = new Float64Array(setNames.length);
  const P = [b, q, s, c], Mm = P.map(a => new Float64Array(a.length)), V = P.map(a => new Float64Array(a.length)), L = [lb, lp, ls, lc];
  // weights are scaled to average 1, so the shrinkage means the same thing with or without recency
  let last = -Infinity; for (const g of games) last = Math.max(last, day(evDates[g[3]]));
  const W = games.map(g => half ? Math.pow(.5, (last - day(evDates[g[3]])) / half) : 1), Wn = games.length / (W.reduce((a, x) => a + x, 0) || 1);
  // a deck's set features as [feature, value]: 1 − freq when the deck has it, −freq when the species is there without it
  const dv = new Map(), deckVec = (t, d) => { if (!useSets || d == null) return []; const key = t * 100000 + d; let v = dv.get(key); if (v) return v; v = []; const has = new Set(deckF[d]);
    for (const n of teams[t]) for (const j of (spFeats.get(n) || [])) v.push([j, (has.has(j) ? 1 : 0) - freq[j]]); dv.set(key, v); return v; };
  const x = (t, d) => { let v = 0; for (const j of tf[t].f) v += b[j]; if (usePairs) for (const j of tf[t].p) v += q[j]; for (const [j, w] of deckVec(t, d)) v += c[j] * w; return v; };
  for (let it = 1; it <= iters; it++) { const Gr = P.map(a => new Float64Array(a.length));
    for (let gi = 0; gi < games.length; gi++) { const [A, B, r, , pa, pb, , dA, dB] = games[gi]; const eta = x(A, dA) - x(B, dB) + (useSkill ? s[pa] - s[pb] : 0), d = (1 / (1 + Math.exp(-eta)) - r) * W[gi] * Wn;
      for (const j of tf[A].f) Gr[0][j] += d; for (const j of tf[B].f) Gr[0][j] -= d;
      if (usePairs) { for (const j of tf[A].p) Gr[1][j] += d; for (const j of tf[B].p) Gr[1][j] -= d; }
      if (useSkill) { Gr[2][pa] += d; Gr[2][pb] -= d; }
      for (const [j, w] of deckVec(A, dA)) Gr[3][j] += d * w; for (const [j, w] of deckVec(B, dB)) Gr[3][j] -= d * w; }
    const c1 = 1 - .9 ** it, c2 = 1 - .999 ** it;
    for (let k = 0; k < 4; k++) { const a = P[k], g = Gr[k], m = Mm[k], v = V[k];
      for (let j = 0; j < a.length; j++) { const gg = g[j] + 2 * L[k] * a[j]; m[j] = .9 * m[j] + .1 * gg; v[j] = .999 * v[j] + .001 * gg * gg; a[j] -= .03 * (m[j] / c1) / (Math.sqrt(v[j] / c2) + 1e-8); } } }
  // evidence shrink: each Pokémon's / pair's effect scaled by n/(n+K), n = its team appearances in the games fitted
  if (EVID_K > 0 || EVID_KP > 0) { const nb = new Float64Array(mons.length), nq = new Float64Array(pairs.length);
    for (const [A, B] of games) for (const t of [A, B]) { for (const j of tf[t].f) nb[j]++; for (const j of tf[t].p) nq[j]++; }
    if (EVID_K > 0) for (let j = 0; j < b.length; j++) b[j] *= nb[j] / (nb[j] + EVID_K);
    if (EVID_KP > 0) for (let j = 0; j < q.length; j++) q[j] *= nq[j] / (nq[j] + EVID_KP); }
  return {b, q, s, c, x, useSets}; }
function score(model, games, skillToo) { let ll = 0, acc = 0;
  for (const [A, B, r, , pa, pb, , dA, dB] of games) { const eta = model.x(A, dA) - model.x(B, dB) + (skillToo ? model.s[pa] - model.s[pb] : 0), p = 1 / (1 + Math.exp(-eta));
    ll -= r * Math.log(p) + (1 - r) * Math.log(1 - p); acc += (p > .5) === (r === 1) ? 1 : 0; }
  return {logloss: +(ll / games.length).toFixed(4), acc: +(acc / games.length).toFixed(4), n: games.length}; }
// baseline like the old score: each Pokémon's raw team win rate
function rawBaseline(games) { const w = new Float64Array(mons.length), g = new Float64Array(mons.length);
  for (const [A, B, r] of games) { for (const j of tf[A].f) { w[j] += r; g[j]++; } for (const j of tf[B].f) { w[j] += 1 - r; g[j]++; } }
  const lg = j => Math.log((w[j] + 10) / (g[j] - w[j] + 10)); return {x: t => tf[t].f.reduce((a, j) => a + lg(j), 0) / 2, s: new Float64Array(nP)}; }
const t0 = Date.now();
// pick the shrinkage on a validation slice (the latest 15% of training events), never on the test events
const trEv = [...new Set(train.map(g => g[3]))].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1), vcut = new Set(trEv.slice(Math.floor(trEv.length * .85)));
const fitPart = train.filter(g => !vcut.has(g[3])), val = train.filter(g => vcut.has(g[3]));
// FAST=K,HALF,SKILL,SETS (experiments): skip the validation grid and use these settings
const FAST = process.env.FAST ? process.env.FAST.split(',').map(Number) : null;
let bestL = FAST ? {k: FAST[0], sc: 0} : null; if (!FAST) for (const k of [1, 3, 10, 30, 100]) { const m = fit(fitPart, {lb: 4 * k, lp: 15 * k, ls: 1.5 * k}); const sc = score(m, val, false).logloss; console.log('shrink', k, sc); if (!bestL || sc < bestL.sc) bestL = {k, sc}; }
// recency half-life, picked on the validation slice (0 = no recency, kept if nothing beats it)
let bestH = {half: FAST ? FAST[1] : 0, sc: bestL.sc}; if (!FAST) for (const half of [14, 21, 30]) { const m = fit(fitPart, {lb: 4 * bestL.k, lp: 15 * bestL.k, ls: 1.5 * bestL.k, half}); const sc = score(m, val, false).logloss; console.log('recency half-life', half, sc); if (sc < bestH.sc) bestH = {half, sc}; }
// v4 (Oct 27): how much of a result to put down to the player rather than the team, picked on the validation slice.
// Fitting player skill stops a top player's wins inflating their Pokémon, but strong players also pick strong teams, so
// separating them too hard throws away real signal. 0 = no player term at all. The full adjustment stays unless another
// setting is clearly better (by 0.002 log-loss): tested Oct 27, a 10x lighter one gained only 0.0009 (noise) while letting
// rare Pokémon that strong players brought rate higher (an odd six rose from below 90 to 92), so it was not shipped.
let bestS = {sm: FAST ? FAST[2] : 1, sc: bestH.sc}; if (!FAST) for (const sm of [.3, 3, 10, 0]) { const m = fit(fitPart, {lb: 4 * bestL.k, lp: 15 * bestL.k, ls: 1.5 * bestL.k * sm, useSkill: sm > 0, half: bestH.half}); const sc = score(m, val, false).logloss; console.log('player-skill shrink', sm, sc); if (sc < bestH.sc - .002 && sc < bestS.sc) bestS = {sm, sc}; }
const K = bestL.k, HALF = bestH.half, LAM = {lb: 4 * K, lp: 15 * K, ls: 1.5 * K * (bestS.sm || 1), useSkill: bestS.sm > 0, half: HALF};
bestH.sc = bestS.sc;
let LC = FAST && FAST[3] ? {lc: FAST[3], sc: 0} : null; if (!FAST && hasSets && setNames.length) for (const lc of [20, 60, 200]) { const m = fit(fitPart, {...LAM, useSets: true, lc}); const sc = score(m, val, false).logloss; console.log('sets shrink', lc, sc); if (sc < bestH.sc && (!LC || sc < LC.sc)) LC = {lc, sc}; }
const species = FAST && LC ? null : fit(train, LAM), withSets = LC ? fit(train, {...LAM, useSets: true, lc: LC.lc}) : null;
// calibrated log-loss: the page always stretches or shrinks the model's edges by the held-out calibration slope, so
// whether set features help is judged on the odds the page will actually show
const calibOf = (model, games) => { const pts = games.map(([A, B, r, , , , , dA, dB]) => [model.x(A, dA) - model.x(B, dB), r]); let w = 1;
  for (let k = 0; k < 30; k++) { let g = 0, h = 0; for (const [e, r] of pts) { const p = 1 / (1 + Math.exp(-w * e)); g += (p - r) * e; h += p * (1 - p) * e * e; } w -= g / (h || 1); }
  const ll = pts.reduce((a, [e, r]) => { const p = 1 / (1 + Math.exp(-w * e)); return a - (r * Math.log(p) + (1 - r) * Math.log(1 - p)); }, 0) / (pts.length || 1); return {w, ll: +ll.toFixed(5)}; };
// EXPORT_SPLITS=1: also save Pokémon strengths fitted only on older data (the validation-fit part, and all training events),
// so the ratings can be tested on events nothing in them has seen (experiments/rating-fit.mjs)
if (process.env.EXPORT_SPLITS === '1') { const fp = fit(fitPart, LAM), mm = m => Object.fromEntries(mons.map((n, j) => [n, +m.b[j].toFixed(4)]));
  fs.writeFileSync('out/model_splits.json', JSON.stringify({fitPart: mm(fp), train: mm(species)})); console.log('wrote out/model_splits.json'); }
const evS = species ? score(species, test, false) : null, evW = withSets ? score(withSets, test, false) : null, cS = species ? calibOf(species, test) : {ll: 9}, cW = withSets ? calibOf(withSets, test) : null;
const useSets = !!(cW && cW.ll < cS.ll), full = useSets ? withSets : species;
const noSkill = FAST ? full : fit(train, {...LAM, useSkill: false, useSets, lc: LC ? LC.lc : 40}), noPairs = FAST ? full : fit(train, {...LAM, usePairs: false, useSets, lc: LC ? LC.lc : 40}), raw = rawBaseline(train);
// how many held-out events the model calls better than a coin flip (so one big event can't carry the result)
const evWins = (() => { const by = new Map(); for (const g of test) { const p = 1 / (1 + Math.exp(-(full.x(g[0], g[7]) - full.x(g[1], g[8])))); const e = by.get(g[3]) || [0, 0]; e[0] += (p > .5) === (g[2] === 1) ? 1 : 0; e[1]++; by.set(g[3], e); }
  const v = [...by.values()]; return {beat_coin_flip: v.filter(([a, n]) => a / n > .5).length, events: v.length}; })();
const ev = {train_games: train.length, test_games: test.length, test_events: cut.size, recency_half_life_days: HALF || null, player_skill_shrink: bestS.sm,
  calibrated_logloss: {species_only: species ? cS.ll : null, with_sets: cW ? cW.ll : null}, events_beating_coin_flip: evWins,
  model_teams_only: score(full, test, false), species_only: evS, with_sets: evW, model_with_known_players: score(full, test, true),
  without_player_skill: score(noSkill, test, false), without_pairs: score(noPairs, test, false), raw_win_rates: score(raw, test, false), coin_flip: {logloss: .6931, acc: .5}};
console.log('held-out test', JSON.stringify(ev));
// ship only if it beats the raw win-rate score on held-out games; then refit on everything
const ships = ev.model_teams_only.logloss < ev.raw_win_rates.logloss;
// TRAIN_ONLY=1 (experiments): fit the shipped-style model on the training events only and write out/model_train.json,
// so Team Scores can be checked on held-out events the model never saw
const TRAIN_ONLY = process.env.TRAIN_ONLY === '1', GF = TRAIN_ONLY ? train : G;
const F = ships ? fit(GF, {...LAM, useSets, lc: LC ? LC.lc : 40}) : null;
if (F && TRAIN_ONLY) { ev.train_only_fit = {...score(F, test, false), calib: +calibOf(F, test).w.toFixed(3), calib_ll: calibOf(F, test).ll}; console.log('train-only fit on held-out', JSON.stringify(ev.train_only_fit)); }
let meanX = 0; if (F) { let n = 0; for (const [A, B, , , , , , dA, dB] of GF) { meanX += F.x(A, dA) + F.x(B, dB); n += 2; } meanX /= n; }
// calibration on the held-out events: how far the train-only model's edges should be stretched or shrunk (1 = right as is)
const calib = (() => { const pts = test.map(([A, B, r, , , , , dA, dB]) => [full.x(A, dA) - full.x(B, dB), r]); let w = 1;
  for (let k = 0; k < 30; k++) { let g = 0, h = 0; for (const [e, r] of pts) { const p = 1 / (1 + Math.exp(-w * e)); g += (p - r) * e; h += p * (1 - p) * e * e; } w -= g / (h || 1); } return w; })();
// how far a build can move a Pokémon. Down: to the 10th percentile of its real decks. Up: only as far as the best build that
// real players actually run (a build on 20+ decks, or 5% of them); hand-picking the four moves with the biggest numbers
// can't beat that. The page clamps every build to this range, and the real-team spread below uses the same clamp.
const setRange = (() => { if (!F || !useSets) return {}; const vals = new Map(), sig = new Map(), seenTD = new Set();
  for (const [A, B, , , , , , dA, dB] of GF) for (const [t, d] of [[A, dA], [B, dB]]) { const k = t + ',' + d; if (seenTD.has(k) || d == null) continue; seenTD.add(k); const has = new Set(deckF[d]);
    for (const n of teams[t]) { const fj = spFeats.get(n) || []; let v = 0; for (const j of fj) v += F.c[j] * ((has.has(j) ? 1 : 0) - freq[j]);
      if (!vals.has(n)) { vals.set(n, []); sig.set(n, new Map()); } vals.get(n).push(v); const key = fj.filter(j => has.has(j)).join(','); const g = sig.get(n).get(key) || {c: 0, v}; g.c++; sig.get(n).set(key, g); } }
  const out = {}; for (const [n, a] of vals) { if (!spFeats.has(n)) continue; a.sort((x, y) => x - y); const builds = [...sig.get(n).values()], need = Math.max(20, .05 * a.length);
    const common = builds.filter(b => b.c >= need); const top = (common.length ? common : [builds.sort((x, y) => y.c - x.c)[0]]).reduce((m, b) => Math.max(m, b.v), -1e9);
    const lo = a.length >= 10 ? a[Math.floor(.1 * (a.length - 1))] : Math.min(0, top); out[n] = [+Math.min(lo, top).toFixed(4), +top.toFixed(4)]; } return out; })();
// tested pairs: two Pokémon brought together on 15+ distinct tournament teams. A team whose pairs are mostly untested gets
// its above-average edge cut: the model knows each Pokémon's results, but not how an untried mix plays together.
// (Only upside is cut; a weak team is not pulled up.)
// Credit = 0.5 + 0.5 × min(1, tested pairs / 6); a quarter of real teams have fewer than 6, most have 10+.
const SUP_K = 6, tested = new Set(), teamSup = new Map();
{ const pcAll = new Map(); for (const m of new Set(GF.flatMap(g => [g[0], g[1]]))) { const t = teams[m]; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = t[i] < t[j] ? t[i] + '|' + t[j] : t[j] + '|' + t[i]; pcAll.set(k, (pcAll.get(k) || 0) + 1); } }
  for (const [k, n] of pcAll) if (n >= 15) tested.add(k); }
const supOf = t => { if (teamSup.has(t)) return teamSup.get(t); const m = teams[t]; let k = 0; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (tested.has(m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i])) k++; teamSup.set(t, k); return k; };
const credit = t => .5 + .5 * Math.min(1, supOf(t) / SUP_K);
// a team's x the way the page computes it: species + pairs + each member's set effect clamped to its real range
const xClamp = (t, d) => { let v = 0; for (const j of tf[t].f) v += F.b[j]; for (const j of tf[t].p) v += F.q[j]; if (!useSets || d == null) return v; const has = new Set(deckF[d]);
  for (const n of teams[t]) { let u = 0; for (const j of (spFeats.get(n) || [])) u += F.c[j] * ((has.has(j) ? 1 : 0) - freq[j]); const r = setRange[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; } return v; };
// the average tournament team, measured the same way
if (F) { let n = 0; meanX = 0; for (const [A, B, , , , , , dA, dB] of GF) { meanX += xClamp(A, dA) + xClamp(B, dB); n += 2; } meanX /= n; }
// the spread of real teams: x for each distinct team + set played in the last 45 days, as 101 percentile points
const dist = (() => { if (!F) return null; const last = GF.reduce((a, g) => evDates[g[3]] > a ? evDates[g[3]] : a, ''), since = new Date(new Date(last).getTime() - 45 * 864e5).toISOString().slice(0, 10);
  const seenTD = new Set(), xs = []; for (const [A, B, , ev, , , , dA, dB] of GF) { if (evDates[ev] < since) continue; for (const [t, d] of [[A, dA], [B, dB]]) { const k = t + ',' + d; if (seenTD.has(k)) continue; seenTD.add(k); { const dv = xClamp(t, d) - meanX; xs.push(meanX + (dv > 0 ? dv * credit(t) : dv)); } } }
  xs.sort((a, b) => a - b); return {since, n: xs.length, q: Array.from({length: 101}, (_, i) => +xs[Math.round(i / 100 * (xs.length - 1))].toFixed(4))}; })();
const out = {updated: new Date().toISOString(), ships, shrink: K, setShrink: useSets ? LC.lc : null, eval: ev, games: G.length, events: M.events.length,
  note: 'x(team) = sum of mons + sum of pairs + sum over each member\'s set features of coef * (has − setFreq) ("Mon@Item", "Mon:Move"); P(A beats B) = 1/(1+exp(-calib*(x(A)-x(B)))). Player skill removed. meanX = average tournament team; dist = percentiles of x over real teams in the last 45 days.',
  meanX: +meanX.toFixed(4), v: 3, half: HALF || null, center: !!useSets, calib: +calib.toFixed(3), dist, setRange, supK: SUP_K, tested: [...tested].sort(),
  setFreq: F && useSets ? Object.fromEntries(setNames.map((k, j) => [k, +freq[j].toFixed(3)])) : {},
  mons: F ? Object.fromEntries(mons.map((n, j) => [n, +F.b[j].toFixed(4)])) : {},
  pairs: F ? Object.fromEntries(pairs.map((k, j) => [k, +F.q[j].toFixed(4)]).filter(([, v]) => Math.abs(v) >= .005)) : {},
  sets: F && useSets ? Object.fromEntries(setNames.map((k, j) => [k, +F.c[j].toFixed(4)])) : {},
  // the "same players without it" test for each Pokémon (pilot.mjs): [games with, win % with, games without, win % without, players]
  pilot: TRAIN_ONLY ? {} : pilotTest(M)};
fs.writeFileSync(TRAIN_ONLY ? 'out/model_train.json' : 'out/model.json', JSON.stringify(out));
console.log(`calibration slope ${calib.toFixed(3)} · real-team spread p50 ${dist && dist.q[50]} p99 ${dist && dist.q[99]}`);
console.log(`model: ${ships ? 'ships' : 'NOT shipped (no better than raw win rates)'}, ${mons.length} Pokémon, ${pairs.length} pairs, ${useSets ? Object.keys(out.sets).length + ' set features' : 'no set features (they did not help)'}, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
