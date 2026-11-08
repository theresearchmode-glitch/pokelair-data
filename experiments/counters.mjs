// Matchups learned from real games (Nov 8, step c: "a sharper matchup check"). Our matchup check today is our own reading of
// the top 30 threats (speed, damage, answers); on the scoreboard it barely predicts results. This tests a different one:
// learn from the games themselves which Pokémon do well against which (a team with Archaludon vs a team with Farigiraf),
// on top of the team grade, and see if it picks later winners better.
//   P(A wins) = σ( calib·(xA − xB) + sA − sB + Σ_{a∈A, b∈B} c[a][b] ),  c[a][b] = −c[b][a], ridge-shrunk toward 0
// Only Pokémon on 1%+ of teams get their own matchup numbers. The shrink is chosen on one half of the later games and scored
// on the other (both ways round). Usage: BOARD_MT=… BOARD_CUT=.6 MATCHES=… node experiments/counters.mjs
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches.json', 'utf8')), MT = JSON.parse(fs.readFileSync(process.env.BOARD_MT || OUT + 'model_train.json', 'utf8'));
const CUTF = +(process.env.BOARD_CUT || .8), teams = M.teams.map(k => k.split('|')), calib = MT.calib, sig = z => 1 / (1 + Math.exp(-z));
const spF = new Map(); for (const f of Object.keys(MT.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
const xOf = (t, d) => { const m = teams[t]; let v = 0; for (const n of m) v += MT.mons[n] || 0;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MT.pairs || {})[k] || 0; }
  if (d == null || !M.decks[d]) return v; const has = new Set(M.decks[d].map(f => M.feats[f]));
  for (const n of m) { let u = 0; for (const f of spF.get(n) || []) u += MT.sets[f] * ((has.has(f) ? 1 : 0) - ((MT.setFreq || {})[f] || 0)); const r = (MT.setRange || {})[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; } return v; };
const ev = M.events, ord = [...ev.keys()].sort((a, b) => ev[a][1] < ev[b][1] ? -1 : 1), lo = Math.floor(ord.length * CUTF), futOrd = ord.slice(lo), futE = new Set(futOrd);
const half = new Map(futOrd.map((e, i) => [e, i < futOrd.length / 2 ? 'A' : 'B']));
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6), past = G.filter(g => !futE.has(g[3])), fut = G.filter(g => futE.has(g[3]));
// Pokémon with their own matchup numbers: 1%+ of past teams
const use = new Map(); const seenT = new Set(); for (const g of past) for (const t of [g[0], g[1]]) if (!seenT.has(t)) { seenT.add(t); }
const cntT = new Map(); for (const g of past) for (const t of [g[0], g[1]]) for (const n of teams[t]) cntT.set(n, (cntT.get(n) || 0) + 1);
const tot = past.length * 2, sp = [...cntT].filter(([, c]) => c / tot >= .01).map(([n]) => n), ix = new Map(sp.map((n, i) => [n, i])), K = sp.length;
const idx = t => teams[t].map(n => ix.get(n)).filter(i => i != null);
const pastX = past.map(g => calib * (xOf(g[0], g[7]) - xOf(g[1], g[8])));
// player skill (fixed for the fit, as six.mjs fits it), so a strong player's wins don't read as a counter
function fitSkill(iters = 200, sigS = .6) { const s = new Float64Array(M.players), m1 = new Float64Array(M.players), v1 = new Float64Array(M.players), gs = new Float64Array(M.players);
  for (let it = 1; it <= iters; it++) { gs.fill(0); past.forEach((g, i) => { const e = (g[2] === 1 ? 1 : 0) - sig(pastX[i] + s[g[4]] - s[g[5]]); gs[g[4]] += e; gs[g[5]] -= e; });
    for (let j = 0; j < s.length; j++) { const gr = gs[j] - s[j] / (sigS * sigS); m1[j] = .9 * m1[j] + .1 * gr; v1[j] = .999 * v1[j] + .001 * gr * gr; s[j] += .05 * (m1[j] / (1 - .9 ** it)) / (Math.sqrt(v1[j] / (1 - .999 ** it)) + 1e-8); } } return s; }
process.stdout.write('player skill…\r'); const S = fitSkill();
function fitC(lam, iters = 250) { const C = new Float64Array(K * K), m1 = new Float64Array(K * K), v1 = new Float64Array(K * K), gC = new Float64Array(K * K);
  const PI = past.map(g => [idx(g[0]), idx(g[1])]);
  for (let it = 1; it <= iters; it++) { gC.fill(0);
    past.forEach((g, i) => { const [A, B] = PI[i]; let z = pastX[i] + S[g[4]] - S[g[5]]; for (const a of A) for (const b of B) z += C[a * K + b];
      const e = (g[2] === 1 ? 1 : 0) - sig(z); for (const a of A) for (const b of B) { gC[a * K + b] += e; gC[b * K + a] -= e; } });
    for (let a = 0; a < K; a++) for (let b = a + 1; b < K; b++) { const j = a * K + b, gr = (gC[j] - gC[b * K + a]) / 2 - C[j] * lam; m1[j] = .9 * m1[j] + .1 * gr; v1[j] = .999 * v1[j] + .001 * gr * gr;
      C[j] += .02 * (m1[j] / (1 - .9 ** it)) / (Math.sqrt(v1[j] / (1 - .999 ** it)) + 1e-8); C[b * K + a] = -C[j]; } }
  return C; }
const futX = fut.map(g => calib * (xOf(g[0], g[7]) - xOf(g[1], g[8])));
const score = (C, h, withSkill) => { let ll = 0, n = 0, r = 0, d = 0; fut.forEach((g, i) => { if (h && half.get(g[3]) !== h) return; let z = futX[i] + (withSkill ? S[g[4]] - S[g[5]] : 0);
    if (C) for (const a of idx(g[0])) for (const b of idx(g[1])) z += C[a * K + b]; const p = Math.min(1 - 1e-9, Math.max(1e-9, sig(z))), y = g[2] === 1;
    ll -= y ? Math.log(p) : Math.log(1 - p); n++; if (Math.abs(z) > 1e-12) { d++; if ((z > 0) === y) r++; } }); return {ll: +(ll / n).toFixed(4), pick: +(r / d * 100).toFixed(2), n}; };
console.log(`cut ${ev[ord[lo]][1]} · ${K} Pokémon with their own matchup numbers · past games ${past.length} · later ${fut.length}`);
const base = {A: score(null, 'A'), B: score(null, 'B'), all: score(null)}; console.log(`team grade alone: pick ${base.all.pick}% · ll ${base.all.ll}  (A ${base.A.ll} / B ${base.B.ll})`);
const res = {base, lam: {}};
// the grade compares a team with the whole field, not one opponent: its learned matchups averaged over how often each Pokémon
// shows up on past teams. Does that version (what the page would add to the grade) pick winners better too?
const u = new Float64Array(K); for (const [n, c] of cntT) if (ix.has(n)) u[ix.get(n)] = c / tot;
const fieldOf = (C, t) => { let v = 0; for (const a of idx(t)) for (let b = 0; b < K; b++) v += u[b] * C[a * K + b]; return v; };
const scoreField = (C, h) => { let ll = 0, n = 0, r = 0, d = 0; fut.forEach((g, i) => { if (h && half.get(g[3]) !== h) return; const z = futX[i] + fieldOf(C, g[0]) - fieldOf(C, g[1]);
    const p = Math.min(1 - 1e-9, Math.max(1e-9, sig(z))), y = g[2] === 1; ll -= y ? Math.log(p) : Math.log(1 - p); n++; if (Math.abs(z) > 1e-12) { d++; if ((z > 0) === y) r++; } }); return {ll: +(ll / n).toFixed(4), pick: +(r / d * 100).toFixed(2)}; };
for (const lam of (process.env.LAMS || '30,100,300,1000').split(',').map(Number)) { process.stdout.write(`fitting λ ${lam}…\r`); const C = fitC(lam), r = {A: score(C, 'A'), B: score(C, 'B'), all: score(C)}; res.lam[lam] = r;
  console.log(`+ learned matchups (shrink ${lam}): pick ${r.all.pick}% · ll ${r.all.ll}  (A ${r.A.ll} / B ${r.B.ll})`);
  const f = {A: scoreField(C, 'A'), B: scoreField(C, 'B'), all: scoreField(C)}; r.field = f; console.log(`  as a grade (vs the average field): pick ${f.all.pick}% · ll ${f.all.ll}  (A ${f.A.ll} / B ${f.B.ll})`);
  if (lam === +(process.env.SHOW || 0)) { const top = []; for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) if (C[a * K + b] > 0) top.push([sp[a], sp[b], C[a * K + b]]); top.sort((x, y) => y[2] - x[2]); console.log(top.slice(0, 12).map(([a, b, v]) => `${a} > ${b} ${(sig(v) * 100 - 50).toFixed(1)}pt`).join(' · ')); } }
for (const [fh, th] of [['A', 'B'], ['B', 'A']]) { const best = Object.entries(res.lam).sort((x, y) => x[1][fh].ll - y[1][fh].ll)[0]; console.log(`shrink chosen on half ${fh}: ${best[0]} → half ${th}: ll ${best[1][th].ll} vs team grade alone ${base[th].ll}`); }
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1));
