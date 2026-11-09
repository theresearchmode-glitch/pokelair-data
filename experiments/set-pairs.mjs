// Phase 3 (Nov 9): can the grade's SET preferences be trusted for item / move suggestions? Like swap-pairs.mjs, but the pairs are the
// SAME six played with two sheets that differ by a small set change (one item or a move or two). Each (six, sheet) is measured on
// LATER games with player skill and opponent strength taken out (both from earlier games only). Does the grade's set part (model.sets,
// trained on earlier games only) say which sheet did better?
// Usage: BOARD_MT=<model trained before BOARD_DATE> BOARD_DATE=2026-10-27 MATCHES=out/matches_dev.json node experiments/set-pairs.mjs [minGames=6] [maxDiff=2]
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches_dev.json', 'utf8')), MT = JSON.parse(fs.readFileSync(process.env.BOARD_MT, 'utf8'));
const FROM = process.env.BOARD_DATE || '2026-10-27', MING = +(process.argv[2] || 6), MAXD = +(process.argv[3] || 2), teams = M.teams.map(k => k.split('|')), calib = MT.calib || .872, sig = z => 1 / (1 + Math.exp(-z));
{ const SL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from; if (M.events.some(e => e[1] >= SL && !String(e[0]).startsWith('sd-')) && process.env.SEALED !== '1') { console.error('refusing: sealed events present'); process.exit(2); } }
const xMon = m => { let v = 0; for (const n of m) v += MT.mons[n] || 0; for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MT.pairs || {})[k] || 0; } return v; };
const deckF = d => d == null || !M.decks[d] ? null : M.decks[d].map(i => M.feats[i]);
const xSet = fs_ => { let v = 0; for (const f of fs_) v += MT.sets[f] || 0; return v; }; // differences between two sheets of the same six: the setFreq centring cancels
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6), past = G.filter(g => M.events[g[3]][1] < FROM), fut = G.filter(g => M.events[g[3]][1] >= FROM);
const S = new Float64Array(M.players); { const X = past.map(g => calib * (xMon(teams[g[0]]) - xMon(teams[g[1]]))), m1 = new Float64Array(M.players), v1 = new Float64Array(M.players), gs = new Float64Array(M.players);
  for (let it = 1; it <= 200; it++) { gs.fill(0); past.forEach((g, i) => { const e = (g[2] === 1 ? 1 : 0) - sig(X[i] + S[g[4]] - S[g[5]]); gs[g[4]] += e; gs[g[5]] -= e; });
    for (let j = 0; j < S.length; j++) { const gr = gs[j] - S[j] / .36; m1[j] = .9 * m1[j] + .1 * gr; v1[j] = .999 * v1[j] + .001 * gr * gr; S[j] += .05 * (m1[j] / (1 - .9 ** it)) / (Math.sqrt(v1[j] / (1 - .999 ** it)) + 1e-8); } } }
const xBar = (() => { let s = 0, n = 0; for (const g of past) { s += xMon(teams[g[0]]) + xMon(teams[g[1]]); n += 2; } return s / n; })();
// later results per (six, exact sheet)
const per = new Map(); for (const g of fut) for (const [a, b, pa, pb, d, y] of [[g[0], g[1], g[4], g[5], g[7], g[2] === 1 ? 1 : 0], [g[1], g[0], g[5], g[4], g[8], g[2] === 1 ? 0 : 1]]) {
  const f = deckF(d); if (!f) continue; const k = teams[a].slice().sort().join('|') + '#' + f.slice().sort().join('~'), p = sig(calib * (xBar - xMon(teams[b])) + S[pa] - S[pb]);
  const o = per.get(k) || {n: 0, r: 0, six: teams[a].slice().sort().join('|'), f: new Set(f)}; o.n++; o.r += y - p; per.set(k, o); }
const units = [...per.values()].filter(o => o.n >= MING).map(o => ({...o, r: o.r / o.n, x: xSet([...o.f])}));
const bySix = new Map(); for (const u of units) { if (!bySix.has(u.six)) bySix.set(u.six, []); bySix.get(u.six).push(u); }
let agree = 0, called = 0, pairs = 0, sxy = 0, sxx = 0, syy = 0; const kinds = {item: [0, 0], move: [0, 0]};
for (const us of bySix.values()) for (let a = 0; a < us.length; a++) for (let b = a + 1; b < us.length; b++) { const A = us[a], B = us[b];
  const onlyA = [...A.f].filter(x => !B.f.has(x)), onlyB = [...B.f].filter(x => !A.f.has(x)); if (!onlyA.length || onlyA.length > MAXD || onlyB.length > MAXD) continue; pairs++;
  const dp = A.x - B.x, dr = A.r - B.r, w = 1 / (1 / A.n + 1 / B.n); sxy += w * dp * dr; sxx += w * dp * dp; syy += w * dr * dr;
  if (Math.abs(calib * dp) >= .02) { called++; const ok = (dp > 0) === (dr > 0); if (ok) agree++; const kd = [...onlyA, ...onlyB].some(x => x.includes('@')) ? 'item' : 'move'; kinds[kd][0] += ok ? 1 : 0; kinds[kd][1]++; } }
console.log(`${units.length} (six, sheet) units with ${MING}+ later games · ${pairs} pairs of the same six whose sheets differ by up to ${MAXD} set choices`);
const p = agree / Math.max(1, called), se = Math.sqrt(p * (1 - p) / Math.max(1, called));
console.log(`grade sees a real difference on ${called}: picks the sheet that did better ${(100 * p).toFixed(1)}% (±${(196 * se).toFixed(1)}, optimistic) · item changes ${kinds.item[0]}/${kinds.item[1]} · move changes ${kinds.move[0]}/${kinds.move[1]}`);
console.log(`weighted correlation (grade's set difference vs real difference): ${(sxy / Math.sqrt(sxx * syy)).toFixed(3)}`);
