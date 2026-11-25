// experiments/kip35-zero-center-eb.mjs
// Standalone held-out experiment (Kip Job 35, Idea #1; Rule 21 compliant).
// Reads out/matches.json (or MATCHES=<path>); writes nothing to existing files.
// (Saved by HH, Nov 25, as Kip sent it via Sim; HH re-runs it before believing its numbers.)
//
// Compares:
//   BASELINE: today's model.mjs settings (lb=40, lp=600, ls=15, lc=60, half=14, teamHalf=0,
//             post-hoc evidK=1000, evidKp=300, uncentered b).
//   VARIANT:  Zero-centered Empirical-Bayes Ridge (no post-hoc evidK/evidKp double-shrinkage;
//             lb=100, lp=900, usage-weighted zero-centering of species effects b so unseen/new
//             Pokémon default to the field mean 0 instead of -meanX/6; train-only feature
//             selection & centering; bounded Newton calibration; clamped log-loss).
//
// Evaluation:
//   1. 4 strict 7-day walk-forward windows (each window trained ONLY on events < cut, calib
//      fitted ONLY on the newest 20% of training events, scored on events in [cut, cut+7d)).
//   2. Event-clustered 95% bootstrap CI on the paired log-loss difference (variant - baseline).
//   3. Reg M-D Day-1 / Week-1 stress test (first 7 events of the regulation).
//   4. Unseen-Pokémon bias check (score of a 6-mon team of brand-new species).
//
// Usage:
//   node experiments/kip35-zero-center-eb.mjs
//   MATCHES=out/matches.json ITERS=180 node experiments/kip35-zero-center-eb.mjs

import fs from 'node:fs';

const MATCHES_PATH = process.env.MATCHES || 'out/matches.json';
const ITERS = +(process.env.ITERS || 160);
const BOOT = +(process.env.BOOT || 1000);

const M = JSON.parse(fs.readFileSync(MATCHES_PATH, 'utf8'));
const teams = (M.teams || []).map(k => k.split('|'));
const evDates = (M.events || []).map(e => e[1]);
const G = (M.m || []).filter(g => g[2] !== 0.5 && g[0] !== g[1]);

const day = s => new Date(s + 'T00:00:00Z').getTime() / 864e5;
const sig = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
const logLossOne = (p, r) => {
  const q = Math.min(1 - 1e-12, Math.max(1e-12, p));
  return -(r * Math.log(q) + (1 - r) * Math.log(1 - q));
};

// Reconstruct protectLow from M.decks / M.feats (matching team-basics.mjs: >=16 moves listed, <=2 Protect-family users)
const PROT = new Set([
  'Protect', 'Detect', 'Spiky Shield', "King's Shield",
  'Baneful Bunker', 'Silk Trap', 'Burning Bulwark', 'Obstruct'
]);
const deckProtectLow = (M.decks || []).map(fs_ => {
  const bySp = new Map();
  let mvCount = 0;
  for (const fi of fs_) {
    const f = M.feats[fi];
    const idx = f.indexOf(':');
    if (idx > 0) {
      mvCount++;
      const sp = f.slice(0, idx);
      const mv = f.slice(idx + 1);
      if (!bySp.has(sp)) bySp.set(sp, []);
      bySp.get(sp).push(mv);
    }
  }
  if (mvCount < 16) return 0;
  let prot = 0;
  for (const mvs of bySp.values()) if (mvs.some(m => PROT.has(m))) prot++;
  return prot <= 2 ? 1 : 0;
});

function buildFeatures(games) {
  const monIx = new Map(), mons = [];
  teams.flat().forEach(n => { if (!monIx.has(n)) { monIx.set(n, mons.length); mons.push(n); } });

  const pc = new Map(), seenT = new Set();
  for (const g of games) {
    for (const t of [g[0], g[1]]) {
      if (seenT.has(t)) continue;
      seenT.add(t);
      const m = teams[t];
      for (let i = 0; i < m.length; i++) {
        for (let j = i + 1; j < m.length; j++) {
          const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i];
          pc.set(k, (pc.get(k) || 0) + 1);
        }
      }
    }
  }
  const pairIx = new Map([...pc].filter(([, n]) => n >= 30).map(([k], i) => [k, i]));
  const pairs = [...pairIx.keys()];
  const tf = teams.map(m => {
    const f = m.map(n => monIx.get(n));
    const p = [];
    for (let i = 0; i < m.length; i++) {
      for (let j = i + 1; j < m.length; j++) {
        const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i];
        const q = pairIx.get(k);
        if (q != null) p.push(q);
      }
    }
    return {f, p};
  });

  const cnt = new Map(), usedD = new Set();
  for (const g of games) { usedD.add(g[7]); usedD.add(g[8]); }
  for (const d of usedD) if (d != null && M.decks[d]) for (const fi of M.decks[d]) cnt.set(fi, (cnt.get(fi) || 0) + 1);
  const keep = new Map([...cnt].filter(([, n]) => n >= 40).map(([fi], i) => [fi, i]));
  const setNames = [...keep.keys()].map(fi => M.feats[fi]);
  const deckF = (M.decks || []).map(fs_ => fs_.map(fi => keep.get(fi)).filter(j => j != null));

  const featSp = setNames.map(f => f.split(/[@:#]/)[0]);
  const spFeats = new Map();
  const freq = new Float64Array(setNames.length);
  const spDecks = new Map(), fd = new Float64Array(setNames.length);
  for (const d of usedD) {
    if (d == null || !M.decks[d]) continue;
    for (const sp of new Set(M.decks[d].map(fi => M.feats[fi].split(/[@:#]/)[0]))) {
      spDecks.set(sp, (spDecks.get(sp) || 0) + 1);
    }
    for (const j of deckF[d]) fd[j]++;
  }
  setNames.forEach((f, j) => {
    freq[j] = fd[j] / (spDecks.get(featSp[j]) || 1);
    if (!spFeats.has(featSp[j])) spFeats.set(featSp[j], []);
    spFeats.get(featSp[j]).push(j);
  });

  return {mons, pairs, tf, setNames, deckF, spFeats, freq};
}

function fitModel(games, F, opt) {
  const {
    lb = 40, lp = 600, ls = 15, lc = 60, half = 14, teamHalf = 0,
    evidK = 1000, evidKp = 300, zeroCenter = false, iters = ITERS
  } = opt;
  const {mons, pairs, tf, setNames, deckF, spFeats, freq} = F;

  const b = new Float64Array(mons.length);
  const q = new Float64Array(pairs.length);
  const s = new Float64Array(M.players);
  const c = new Float64Array(setNames.length);
  const T = new Float64Array(2);
  const P = [b, q, s, c, T];
  const Mm = P.map(a => new Float64Array(a.length));
  const V = P.map(a => new Float64Array(a.length));
  const L = [lb, lp, ls, lc, 1];

  let last = -Infinity;
  for (const g of games) last = Math.max(last, day(evDates[g[3]]));
  const W = games.map(g => half ? Math.pow(0.5, (last - day(evDates[g[3]])) / half) : 1);
  const Wn = games.length / (W.reduce((a, x) => a + x, 0) || 1);
  const WT = teamHalf === half ? W : games.map(g => teamHalf ? Math.pow(0.5, (last - day(evDates[g[3]])) / teamHalf) : 1);
  const WTn = games.length / (WT.reduce((a, x) => a + x, 0) || 1);

  const dv = new Map();
  const deckVec = (t, d) => {
    if (d == null || !setNames.length) return [];
    const key = t + ',' + d;
    let v = dv.get(key);
    if (v) return v;
    v = [];
    const has = new Set(deckF[d]);
    for (const n of teams[t]) {
      for (const j of (spFeats.get(n) || [])) v.push([j, (has.has(j) ? 1 : 0) - freq[j]]);
    }
    dv.set(key, v);
    return v;
  };
  const tvCache = new Map();
  const teamVec = (t, d) => {
    const key = t + ',' + (d ?? -1);
    let v = tvCache.get(key);
    if (v) return v;
    v = [teams[t].some(n => /-Mega/.test(n)) ? 0 : 1, d != null ? deckProtectLow[d] : 0];
    tvCache.set(key, v);
    return v;
  };

  const x = (t, d) => {
    let v = 0;
    for (const j of tf[t].f) v += b[j];
    for (const j of tf[t].p) v += q[j];
    for (const [j, w] of deckVec(t, d)) v += c[j] * w;
    const tv = teamVec(t, d);
    v += T[0] * tv[0] + T[1] * tv[1];
    return v;
  };

  for (let it = 1; it <= iters; it++) {
    const Gr = P.map(a => new Float64Array(a.length));
    for (let gi = 0; gi < games.length; gi++) {
      const [A, B, r, , pa, pb, , dA, dB] = games[gi];
      const eta = x(A, dA) - x(B, dB) + s[pa] - s[pb];
      const e0 = sig(eta) - r;
      const d = e0 * W[gi] * Wn;
      const dT = e0 * WT[gi] * WTn;
      for (const j of tf[A].f) Gr[0][j] += d;
      for (const j of tf[B].f) Gr[0][j] -= d;
      for (const j of tf[A].p) Gr[1][j] += d;
      for (const j of tf[B].p) Gr[1][j] -= d;
      Gr[2][pa] += d;
      Gr[2][pb] -= d;
      for (const [j, w] of deckVec(A, dA)) Gr[3][j] += d * w;
      for (const [j, w] of deckVec(B, dB)) Gr[3][j] -= d * w;
      const ta = teamVec(A, dA), tb = teamVec(B, dB);
      Gr[4][0] += dT * (ta[0] - tb[0]);
      Gr[4][1] += dT * (ta[1] - tb[1]);
    }
    const c1 = 1 - 0.9 ** it, c2 = 1 - 0.999 ** it;
    for (let k = 0; k < P.length; k++) {
      const a = P[k], g = Gr[k], m = Mm[k], v = V[k];
      for (let j = 0; j < a.length; j++) {
        const gg = g[j] + 2 * L[k] * a[j];
        m[j] = 0.9 * m[j] + 0.1 * gg;
        v[j] = 0.999 * v[j] + 0.001 * gg * gg;
        a[j] -= 0.03 * (m[j] / c1) / (Math.sqrt(v[j] / c2) + 1e-8);
      }
    }
  }

  const nb = new Float64Array(mons.length), nq = new Float64Array(pairs.length);
  for (const [A, B] of games) {
    for (const t of [A, B]) {
      for (const j of tf[t].f) nb[j]++;
      for (const j of tf[t].p) nq[j]++;
    }
  }
  if (evidK > 0) for (let j = 0; j < b.length; j++) b[j] *= nb[j] / (nb[j] + evidK);
  if (evidKp > 0) for (let j = 0; j < q.length; j++) q[j] *= nq[j] / (nq[j] + evidKp);

  if (zeroCenter) {
    let sw = 0, sb = 0;
    for (let j = 0; j < b.length; j++) { sw += nb[j]; sb += nb[j] * b[j]; }
    const mu = sb / (sw || 1);
    for (let j = 0; j < b.length; j++) if (nb[j] > 0) b[j] -= mu;
  }

  return {b, q, s, c, T, x, nb};
}

function fitCalib(model, games) {
  let w = 1;
  for (let k = 0; k < 30; k++) {
    let g = 0, h = 0;
    for (const [A, B, r, , , , , dA, dB] of games) {
      const e = model.x(A, dA) - model.x(B, dB);
      const p = sig(w * e);
      g += (p - r) * e;
      h += p * (1 - p) * e * e;
    }
    const step = Math.max(-0.5, Math.min(0.5, g / (h + 1e-6)));
    w = Math.max(0.1, Math.min(2.5, w - step));
  }
  return w;
}

function clusterBootstrapCI(evDiffs, B = BOOT, seed = 42) {
  const keys = [...evDiffs.keys()];
  let st = seed >>> 0;
  const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; };
  const samples = [];
  for (let b = 0; b < B; b++) {
    let sum = 0, n = 0;
    for (let i = 0; i < keys.length; i++) {
      const arr = evDiffs.get(keys[Math.floor(rnd() * keys.length)]);
      for (let j = 0; j < arr.length; j++) { sum += arr[j]; n++; }
    }
    samples.push(sum / n);
  }
  samples.sort((a, b) => a - b);
  return [samples[Math.floor(0.025 * B)], samples[Math.floor(0.975 * B)]];
}

// 1. 4-week strict walk-forward
const cuts = [
  ['2026-10-28', '2026-11-04'],
  ['2026-11-04', '2026-11-11'],
  ['2026-11-11', '2026-11-18'],
  ['2026-11-18', '2026-11-26']
];

const BASE_OPT = {lb: 40, lp: 600, ls: 15, lc: 60, half: 14, teamHalf: 0, evidK: 1000, evidKp: 300, zeroCenter: false};
const VAR_OPT  = {lb: 100, lp: 900, ls: 15, lc: 60, half: 14, teamHalf: 0, evidK: 0, evidKp: 0, zeroCenter: true};

let baseLL = 0, varLL = 0, baseAcc = 0, varAcc = 0, totalN = 0;
const evDiffs = new Map();
let lastBaseStats = null, lastVarStats = null;

console.log(`=== kip35-zero-center-eb (ITERS=${ITERS}, matches=${G.length}, updated=${M.updated}) ===`);
for (const [cFrom, cTo] of cuts) {
  const train = G.filter(g => evDates[g[3]] < cFrom);
  const test = G.filter(g => evDates[g[3]] >= cFrom && evDates[g[3]] < cTo);
  if (!train.length || !test.length) continue;

  const trEvs = [...new Set(train.map(g => g[3]))].sort((a, b) => evDates[a].localeCompare(evDates[b]) || a - b);
  const valSet = new Set(trEvs.slice(Math.floor(trEvs.length * 0.8)));
  const trFit = train.filter(g => !valSet.has(g[3]));
  const trVal = train.filter(g => valSet.has(g[3]));

  const F = buildFeatures(train);
  const cBase = fitCalib(fitModel(trFit, F, BASE_OPT), trVal);
  const cVar  = fitCalib(fitModel(trFit, F, VAR_OPT), trVal);
  const mBase = fitModel(train, F, BASE_OPT);
  const mVar  = fitModel(train, F, VAR_OPT);

  let wB = 0, wV = 0, aB = 0, aV = 0;
  for (const [A, B, r, ev, , , , dA, dB] of test) {
    const pB = sig(cBase * (mBase.x(A, dA) - mBase.x(B, dB)));
    const pV = sig(cVar * (mVar.x(A, dA) - mVar.x(B, dB)));
    const lB = logLossOne(pB, r), lV = logLossOne(pV, r);
    wB += lB; wV += lV;
    aB += (pB > 0.5) === (r === 1) ? 1 : 0;
    aV += (pV > 0.5) === (r === 1) ? 1 : 0;
    const ek = cFrom + ':' + ev;
    if (!evDiffs.has(ek)) evDiffs.set(ek, []);
    evDiffs.get(ek).push(lV - lB);
  }
  baseLL += wB; varLL += wV; baseAcc += aB; varAcc += aV; totalN += test.length;
  console.log(
    `  ${cFrom}..${cTo} (${String(test.length).padStart(4)}g): ` +
    `base ll=${(wB / test.length).toFixed(5)} acc=${(100 * aB / test.length).toFixed(2)}% (cal=${cBase.toFixed(3)}) | ` +
    `var ll=${(wV / test.length).toFixed(5)} acc=${(100 * aV / test.length).toFixed(2)}% (cal=${cVar.toFixed(3)}) | ` +
    `delta=${((wV - wB) / test.length).toFixed(5)}`
  );

  // Save final window's unseen-Pokémon Strength Score bias
  const meanOf = m => train.reduce((a, [A, B, , , , , , dA, dB]) => a + m.x(A, dA) + m.x(B, dB), 0) / (2 * train.length);
  const ssUnseen = (m, cal) => {
    const mx = meanOf(m);
    const p = sig(cal * (0 - mx));
    return {mx, ss: Math.max(0, Math.min(100, 80 + 122 * (p - 0.5)))};
  };
  lastBaseStats = ssUnseen(mBase, cBase);
  lastVarStats = ssUnseen(mVar, cVar);
}

const delta = (varLL - baseLL) / totalN;
const [ciLo, ciHi] = clusterBootstrapCI(evDiffs);
const verdict = ciHi < 0 ? 'KEEP (95% CI strictly better)' : ciLo > 0 ? 'REJECT (95% CI strictly worse)' : 'INCONCLUSIVE (95% CI crosses 0)';

console.log('\n--- Pooled 4-Week Walk-Forward Result ---');
console.log(`  Games: ${totalN} across ${evDiffs.size} tournament events`);
console.log(`  Baseline: ll=${(baseLL / totalN).toFixed(5)}, acc=${(100 * baseAcc / totalN).toFixed(2)}%`);
console.log(`  Variant:  ll=${(varLL / totalN).toFixed(5)}, acc=${(100 * varAcc / totalN).toFixed(2)}%`);
console.log(`  Delta (var - base): ${delta.toFixed(5)}  [95% event-clustered CI: ${ciLo.toFixed(5)} to ${ciHi.toFixed(5)}]`);
console.log(`  Rule 21 verdict: ${verdict}`);
console.log(`  Unseen 6-mon team Strength Score (should be ~80): baseline=${lastBaseStats.ss.toFixed(1)} (meanX=${lastBaseStats.mx.toFixed(4)}) vs variant=${lastVarStats.ss.toFixed(1)} (meanX=${lastVarStats.mx.toFixed(4)})`);

// 2. Reg M-D Week-1 cold-start stress test (first 7 events)
const allOrd = [...evDates.keys()].sort((a, b) => evDates[a].localeCompare(evDates[b]) || a - b);
const earlyEvs = allOrd.slice(0, 7);
const eTrSet = new Set(earlyEvs.slice(0, 5)), eTeSet = new Set(earlyEvs.slice(5, 7));
const eTr = G.filter(g => eTrSet.has(g[3])), eTe = G.filter(g => eTeSet.has(g[3]));
const Fe = buildFeatures(eTr);
const mbE = fitModel(eTr, Fe, BASE_OPT), mvE = fitModel(eTr, Fe, VAR_OPT);
let ebLL = 0, evLL = 0, ebA = 0, evA = 0;
for (const [A, B, r, , , , , dA, dB] of eTe) {
  const pB = sig(mbE.x(A, dA) - mbE.x(B, dB));
  const pV = sig(mvE.x(A, dA) - mvE.x(B, dB));
  ebLL += logLossOne(pB, r); evLL += logLossOne(pV, r);
  ebA += (pB > 0.5) === (r === 1) ? 1 : 0; evA += (pV > 0.5) === (r === 1) ? 1 : 0;
}
console.log(`\n--- Cold-Start / Reg M-D Week-1 Stress Test (${eTr.length} train -> ${eTe.length} test games) ---`);
console.log(`  Baseline (evidK=1000): ll=${(ebLL / eTe.length).toFixed(5)}, acc=${(100 * ebA / eTe.length).toFixed(2)}%, max|b|=${Math.max(...Array.from(mbE.b, Math.abs)).toFixed(4)}`);
console.log(`  Variant  (EB Ridge):   ll=${(evLL / eTe.length).toFixed(5)}, acc=${(100 * evA / eTe.length).toFixed(2)}%, max|b|=${Math.max(...Array.from(mvE.b, Math.abs)).toFixed(4)}`);
