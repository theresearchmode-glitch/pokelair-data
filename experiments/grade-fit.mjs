// Grade accuracy step 2, Lite (Nov 7, Sim): set the grade's 4 dials from real results instead of by hand.
// The dials: how much readiness counts (a), points off per missed check (m), how much team strength counts (b), and how fast a
// team's real record takes over (K: weight g/(g+K)), plus the fewest real games before the record counts (n0).
// Honest set-up, the same as experiments/grade-check.mjs: every part is graded from the past only (before the 80% cut). The later
// games are split by date into two halves: dials are chosen on one half and scored on the other, both ways round, so the numbers
// reported are never on games the dials were chosen on. Readiness off-weight keeps its average, so grades stay on the same scale.
// Usage: GRADE_CHECK_COMP=parts.json node experiments/grade-check.mjs   then   node experiments/grade-fit.mjs parts.json
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(OUT + 'matches.json', 'utf8')), comp = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ev = M.events, ord = [...ev.keys()].sort((a, b) => ev[a][1] < ev[b][1] ? -1 : 1), lo = Math.floor(ord.length * .8);
const futOrd = ord.slice(lo), half = new Map(futOrd.map((e, i) => [e, i < futOrd.length / 2 ? 'A' : 'B'])), cutB = ev[futOrd[Math.ceil(futOrd.length / 2)]][1];
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]), past = new Map(), fut = {A: new Map(), B: new Map()}, games = {A: [], B: []};
for (const g of G) { const h = half.get(g[3]); for (const [t, w] of [[g[0], g[2] === 1 ? 1 : 0], [g[1], g[2] === 1 ? 0 : 1]]) { const S = h ? fut[h] : past, o = S.get(t) || {g: 0, w: 0}; o.g++; o.w += w; S.set(t, o); }
  if (h && comp[g[0]] && comp[g[1]]) games[h].push(g); }
const teams = Object.keys(comp), Rbar = teams.reduce((s, t) => s + comp[t].ready, 0) / teams.length;
const clamp = v => Math.min(100, Math.max(0, v)), rs = wr => clamp(70 + (wr - .5) * 200);
const grade = (t, d) => { const c = comp[t], raw = d.a * c.ready + (1 - d.a) * Rbar - d.m * c.miss + d.b * c.mp, p = past.get(t);
  if (!p || p.g < d.n0 || !isFinite(d.K)) return clamp(raw); const w = p.g / (p.g + d.K); return clamp((1 - w) * raw + w * rs(p.w / p.g)); };
// how well a set of dials does on some games: log-loss with its best scale, and how often the higher grade won
const sig = x => 1 / (1 + Math.exp(-x));
function score(d, gs, beta) { const diffs = gs.map(g => [grade(g[0], d) - grade(g[1], d), g[2] === 1 ? 1 : 0]);
  const ll = b => diffs.reduce((s, [x, y]) => { const p = Math.min(1 - 1e-9, Math.max(1e-9, sig(b * x))); return s - (y ? Math.log(p) : Math.log(1 - p)); }, 0) / diffs.length;
  if (beta == null) { let l = 0, h = .2; for (let i = 0; i < 40; i++) { const a = l + (h - l) / 3, c = h - (h - l) / 3; if (ll(a) < ll(c)) h = c; else l = a; } beta = (l + h) / 2; }
  let right = 0, n = 0; for (const [x, y] of diffs) { if (Math.abs(x) < 1e-9) continue; n++; if ((x > 0) === (y === 1)) right++; }
  return {ll: ll(beta), beta, acc: right / n * 100, decided: n}; }
function teamCorr(d, F) { const T = [...F].filter(([t, o]) => o.g >= 10 && comp[t]), xs = T.map(([t]) => grade(t, d)), ys = T.map(([, o]) => o.w / o.g), ws = T.map(([, o]) => o.g);
  const W = ws.reduce((a, b) => a + b, 0), mx = xs.reduce((a, x, i) => a + x * ws[i], 0) / W, my = ys.reduce((a, y, i) => a + y * ws[i], 0) / W; let sxy = 0, sxx = 0, syy = 0;
  xs.forEach((x, i) => { sxy += ws[i] * (x - mx) * (ys[i] - my); sxx += ws[i] * (x - mx) ** 2; syy += ws[i] * (ys[i] - my) ** 2; }); return {r: sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0, n: T.length}; }
const NOW = {a: 1, m: 6, b: 1, K: 100, n0: 30}, grid = [];
for (const a of [0, .25, .5, .75, 1, 1.5]) for (const m of [0, 1, 2, 4, 6, 9]) for (const b of [0, .5, 1, 1.5, 2, 3, 4]) for (const K of [10, 25, 50, 100, 200, 400, Infinity]) for (const n0 of [5, 10, 20, 30]) grid.push({a, m, b, K, n0});
const best = gs => { let top = null; for (const d of grid) { const s = score(d, gs); if (!top || s.ll < top.s.ll) top = {d, s}; } return top; };
const fmt = d => `readiness ×${d.a}, −${d.m} per missed check, strength ×${d.b}, record K=${d.K}, from ${d.n0} games`;
const res = {cutB, games: {A: games.A.length, B: games.B.length}, now: NOW, folds: {}};
console.log(`later games: half A ${games.A.length} (before ${cutB}), half B ${games.B.length} · ${grid.length} dial settings tried\n`);
for (const [fit, test] of [['A', 'B'], ['B', 'A']]) {
  const top = best(games[fit]), nowFit = score(NOW, games[fit]), nowT = score(NOW, games[test], nowFit.beta), newT = score(top.d, games[test], top.s.beta);
  res.folds[fit + '→' + test] = {dials: top.d, now: {acc: nowT.acc, ll: nowT.ll, corr: teamCorr(NOW, fut[test]).r}, fitted: {acc: newT.acc, ll: newT.ll, corr: teamCorr(top.d, fut[test]).r}};
  console.log(`chosen on half ${fit}: ${fmt(top.d)}`);
  console.log(`  scored on half ${test}: higher grade won ${nowT.acc.toFixed(1)}% now → ${newT.acc.toFixed(1)}% with these dials · log-loss ${nowT.ll.toFixed(4)} → ${newT.ll.toFixed(4)} (lower is better; coin flip .6931)`);
  console.log(`  teams with 10+ games in half ${test}: r ${teamCorr(NOW, fut[test]).r.toFixed(2)} now → ${teamCorr(top.d, fut[test]).r.toFixed(2)}\n`); }
const all = [...games.A, ...games.B], topAll = best(all); res.allDials = topAll.d;
// how much each dial matters: best log-loss on all later games with that dial held at today's value
console.log(`chosen on all later games: ${fmt(topAll.d)}  (log-loss ${topAll.s.ll.toFixed(4)}; today's dials ${score(NOW, all).ll.toFixed(4)})`);
for (const k of ['a', 'm', 'b', 'K', 'n0']) { let top = null; for (const d of grid) if (d[k] === NOW[k]) { const s = score(d, all); if (!top || s.ll < top.ll) top = s; } console.log(`  keeping only ${k} at today's value: log-loss ${top.ll.toFixed(4)}`); }
if (process.env.GRADE_FIT_OUT) fs.writeFileSync(process.env.GRADE_FIT_OUT, JSON.stringify(res, null, 1));
