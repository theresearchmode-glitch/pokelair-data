// Team strength model trained on real games (step 2): every pairing where both teams are known.
// P(A beats B) = σ( skillA − skillB + x(A) − x(B) ),  x(team) = Σ mon strength + Σ pair synergy (pairs seen on 30+ teams).
// Player skill is fitted alongside, so a strong player's wins don't inflate their Pokémon. Ridge-shrunk, fitted with Adam.
// Tested on held-out recent events before anything ships: writes out/model.json with the numbers and the test scores.
import fs from 'node:fs';
const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
const monIx = new Map(), mons = [];
teams.flat().forEach(n => { if (!monIx.has(n)) { monIx.set(n, mons.length); mons.push(n); } });
// pair features: pairs on 30+ distinct teams in games
const pc = new Map(); const seen = new Set();
for (const g of G) for (const t of [g[0], g[1]]) { if (seen.has(t)) continue; seen.add(t); const m = teams[t];
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] + '|' + m[j]; pc.set(k, (pc.get(k) || 0) + 1); } }
const pairIx = new Map([...pc].filter(([, n]) => n >= 30).map(([k], i) => [k, i])), pairs = [...pairIx.keys()];
const feats = teams.map(m => { const f = m.map(n => monIx.get(n)); const p = [];
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const q = pairIx.get(m[i] + '|' + m[j]); if (q != null) p.push(q); } return {f, p}; });
const nP = M.players;
// time split: last 20% of events (by date) held out
const evDates = M.events.map(e => e[1]); const order = [...evDates.keys()].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1);
const cut = new Set(order.slice(Math.floor(order.length * .8)));
const train = G.filter(g => !cut.has(g[3])), test = G.filter(g => cut.has(g[3]));
function fit(games, opt) { const {useSkill = true, usePairs = true, iters = 250, lb = 4, lp = 15, ls = 1.5} = opt || {};
  const b = new Float64Array(mons.length), q = new Float64Array(pairs.length), s = new Float64Array(nP);
  const P = [b, q, s], Mm = P.map(a => new Float64Array(a.length)), V = P.map(a => new Float64Array(a.length)), L = [lb, lp, ls];
  const x = t => { let v = 0; for (const j of feats[t].f) v += b[j]; if (usePairs) for (const j of feats[t].p) v += q[j]; return v; };
  for (let it = 1; it <= iters; it++) { const Gr = P.map(a => new Float64Array(a.length));
    for (const [A, B, r, , pa, pb] of games) { const eta = x(A) - x(B) + (useSkill ? s[pa] - s[pb] : 0); const d = 1 / (1 + Math.exp(-eta)) - r;
      for (const j of feats[A].f) Gr[0][j] += d; for (const j of feats[B].f) Gr[0][j] -= d;
      if (usePairs) { for (const j of feats[A].p) Gr[1][j] += d; for (const j of feats[B].p) Gr[1][j] -= d; }
      if (useSkill) { Gr[2][pa] += d; Gr[2][pb] -= d; } }
    const c1 = 1 - .9 ** it, c2 = 1 - .999 ** it;
    for (let k = 0; k < 3; k++) { const a = P[k], g = Gr[k], m = Mm[k], v = V[k];
      for (let j = 0; j < a.length; j++) { const gg = g[j] + 2 * L[k] * a[j]; m[j] = .9 * m[j] + .1 * gg; v[j] = .999 * v[j] + .001 * gg * gg; a[j] -= .03 * (m[j] / c1) / (Math.sqrt(v[j] / c2) + 1e-8); } } }
  return {b, q, s, x, useSkill}; }
function score(model, games, skillToo) { let ll = 0, acc = 0;
  for (const [A, B, r, , pa, pb] of games) { const eta = model.x(A) - model.x(B) + (skillToo ? model.s[pa] - model.s[pb] : 0); const p = 1 / (1 + Math.exp(-eta));
    ll -= r * Math.log(p) + (1 - r) * Math.log(1 - p); acc += (p > .5) === (r === 1) ? 1 : 0; }
  return {logloss: +(ll / games.length).toFixed(4), acc: +(acc / games.length).toFixed(4), n: games.length}; }
// mons-only win-rate baseline, like the old score: each Pokémon's raw team win rate
function rawBaseline(games) { const w = new Float64Array(mons.length), g = new Float64Array(mons.length);
  for (const [A, B, r] of games) { for (const j of feats[A].f) { w[j] += r; g[j]++; } for (const j of feats[B].f) { w[j] += 1 - r; g[j]++; } }
  const lg = j => Math.log((w[j] + 10) / (g[j] - w[j] + 10)); return {x: t => feats[t].f.reduce((a, j) => a + lg(j), 0) / 2, s: new Float64Array(nP)}; }
const t0 = Date.now();
// pick the shrinkage on a validation slice (the latest 15% of training events), never on the test events
const trEv = [...new Set(train.map(g => g[3]))].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1), vcut = new Set(trEv.slice(Math.floor(trEv.length * .85)));
const fitPart = train.filter(g => !vcut.has(g[3])), val = train.filter(g => vcut.has(g[3]));
let bestL = null; for (const k of [1, 3, 10, 30, 100]) { const m = fit(fitPart, {lb: 4 * k, lp: 15 * k, ls: 1.5 * k}); const sc = score(m, val, false).logloss; console.log('shrink', k, sc); if (!bestL || sc < bestL.sc) bestL = {k, sc}; }
const K = bestL.k, LAM = {lb: 4 * K, lp: 15 * K, ls: 1.5 * K};
const full = fit(train, LAM), noSkill = fit(train, {...LAM, useSkill: false}), noPairs = fit(train, {...LAM, usePairs: false}), raw = rawBaseline(train);
const ev = {train_games: train.length, test_games: test.length, test_events: cut.size,
  model_teams_only: score(full, test, false), model_with_known_players: score(full, test, true),
  without_player_skill: score(noSkill, test, false), without_pairs: score(noPairs, test, false), raw_win_rates: score(raw, test, false), coin_flip: {logloss: .6931, acc: .5}};
console.log('held-out test', JSON.stringify(ev));
// ship only if it beats the raw win-rate score on held-out games; then refit on everything
const ships = ev.model_teams_only.logloss < ev.raw_win_rates.logloss;
const F = ships ? fit(G, LAM) : null;
const meanX = F ? teams.reduce((a, t, i) => a + F.x(i), 0) / teams.length : 0;
const out = {updated: new Date().toISOString(), ships, shrink: K, eval: ev, games: G.length, events: M.events.length,
  note: 'x(team) = sum of mons + sum of pairs; P(A beats B) = 1/(1+exp(-(x(A)-x(B)))). Player skill removed. meanX = average tournament team.',
  meanX: +meanX.toFixed(4),
  mons: F ? Object.fromEntries(mons.map((n, j) => [n, +F.b[j].toFixed(4)])) : {},
  pairs: F ? Object.fromEntries(pairs.map((k, j) => [k, +F.q[j].toFixed(4)]).filter(([, v]) => Math.abs(v) >= .005)) : {}};
fs.writeFileSync('out/model.json', JSON.stringify(out));
console.log(`model: ${ships ? 'ships' : 'NOT shipped (no better than raw win rates)'}, ${mons.length} Pokémon, ${pairs.length} pairs, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
