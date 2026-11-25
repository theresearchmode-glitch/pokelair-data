// Strength Score v3 Experiment Lab (Job 15, Parts B, C, D).
// Node 22+, zero external packages, zero network. Read-only: never modifies model.mjs or out/model.json.
//
// Usage:
//   node experiments/v3-lab.mjs [options]
//   --matches=out/matches.json     Path to matches.json (default: out/matches.json)
//   --settings=model-settings.json Path to locked settings (default: model-settings.json)
//   --weeks=8                      Walk-forward window count, 7-day cuts (default: 8)
//   --ideas=all                    Comma list: fm,matchup,glicko,no-evid-hier,mega-cap,combo,matchup-d2,matchup-d4,matchup-d8,combo-d2,combo-d4,combo-d8
//   --sensitivity                  Shortcut: run matchup & combo across d=2,4,8 (+ no-evid-hier)
//   --boots=200                    Tournament-clustered bootstrap resamples for 95% CIs (default: 200)
//   --iters=250                    Adam iterations per fit (matches model.mjs default 250)
//   --md-sim                       Run Part D M-D day-one small-data regulation-change simulation
//   --verify-baseline              Spawn model.mjs on the same 80/20 split and fail if any metric differs > 1e-4
//   --json=out/v3-lab.json         Optional JSON output path
//
// CLAUDE.md Rule 21:
//   - Every idea trains strictly on games <= cut date and is scored ONLY on games > cut date.
//   - All feature vocabularies (pairIx, set keep, set freq) are built strictly inside each cut's train set (zero leakage).
//   - Paired 95% bootstrap CIs (resampled by tournament) compare each idea against today's model on the EXACT same games.
//   - Flags "unknown" whenever test games < 500.
//   - Single games first; Best-of-3 evaluated strictly separately if matches.json distinguishes games from sets.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {deckBasics} from '../team-basics.mjs';

const arg = (k, d) => {
  const a = process.argv.find(x => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const MATCHES_PATH = arg('matches', process.env.MATCHES || 'out/matches.json');
const SETTINGS_PATH = arg('settings', 'model-settings.json');
const WEEKS = Math.max(1, Number(arg('weeks', '8')) || 8);
const BOOTS = Math.max(20, Number(arg('boots', '200')) || 200);
const ITERS = Math.max(20, Number(arg('iters', process.env.ITERS || '250')) || 250);
const RUN_MD_SIM = process.argv.includes('--md-sim');
const VERIFY_BASELINE = process.argv.includes('--verify-baseline');
const SENSITIVITY = process.argv.includes('--sensitivity');
const ROUND3 = process.argv.includes('--round3');
const FALSIFY_ALL = process.argv.includes('--falsify-all');
const FALSIFY_SHUFFLE = FALSIFY_ALL || process.argv.includes('--falsify-shuffle');
const FALSIFY_REVERSE = FALSIFY_ALL || process.argv.includes('--falsify-reverse');
const FALSIFY_LOEO = FALSIFY_ALL || process.argv.includes('--falsify-loeo');
// --falsify-pair=CHALLENGER,REFERENCE : which two variant ids the falsification suite compares (default combo,baseline).
const [FALSIFY_CHAL, FALSIFY_REF] = (() => {
  const raw = arg('falsify-pair', 'combo,baseline').split(',').map(s => s.trim()).filter(Boolean);
  if (raw.length !== 2 || raw[0] === raw[1]) throw new Error(`--falsify-pair needs two different ids, got "${raw.join(',')}"`);
  return raw;
})();
const JSON_OUT = arg('json', '');
const CORE_IDEAS = ['fm', 'matchup', 'glicko', 'no-evid-hier', 'mega-cap', 'combo'];
const SENS_IDEAS = ['matchup-d2', 'matchup-d4', 'matchup-d8', 'no-evid-hier', 'combo-d2', 'combo-d4', 'combo-d8'];
const ROUND3_IDEAS = ['combo', 'combo-skillhalf', 'combo-archetype', 'combo-hier-sets', 'combo-seg-cal'];
const ALL_IDEAS = [...new Set([...CORE_IDEAS, ...SENS_IDEAS, ...ROUND3_IDEAS])];
const IDEAS = (() => {
  if (ROUND3) return ROUND3_IDEAS;
  if (SENSITIVITY) return SENS_IDEAS;
  const raw = arg('ideas', 'all');
  if (raw === 'none' || raw === '') return [];
  if (raw === 'all') return CORE_IDEAS;
  return raw.split(',').map(s => s.trim()).filter(s => ALL_IDEAS.includes(s));
})();

const sig = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
const dayNum = s => new Date(s + 'T00:00:00Z').getTime() / 864e5;
const addDays = (d, n) => {
  const t = new Date(d + 'T00:00:00Z');
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

// Deterministic PRNG (Mulberry32) so bootstrap intervals and FM/Blade-Chest inits are 100% reproducible.
function makeRng(seed = 1337) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// 1. DATA LOADER & FEATURE EXTRACTOR (STRICTLY TRAIN-ONLY PER CUT)
// ============================================================================
function loadData(matchesPath, settingsPath) {
  const M = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
  let S = {};
  try { S = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) {}
  const teams = M.teams.map(k => k.split('|'));
  const evDates = M.events.map(e => e[1]);
  const isSD = i => String((M.events[i] || [''])[0]).startsWith('sd-');
  const G = M.m.filter(g => g[2] !== 0.5 && g[0] !== g[1]);
  const hasSets = Array.isArray(M.decks) && G.length > 0 && G[0].length >= 9;
  const deckTF = hasSets ? M.decks.map(fs_ => deckBasics((fs_ || []).map(f => M.feats[f]))) : [];
  const megaCounts = teams.map(m => m.filter(n => /-Mega/.test(n)).length);

  // Event player counts for robustness splits (<64 vs 64+ players): use M.events[i][2] if numeric > 0, else distinct players in G.
  const evPlayerSets = new Map();
  for (const g of G) {
    let ps = evPlayerSets.get(g[3]); if (!ps) evPlayerSets.set(g[3], ps = new Set());
    ps.add(g[4]); ps.add(g[5]);
  }
  const evPlayers = M.events.map((e, i) => (typeof e[2] === 'number' && e[2] > 0) ? e[2] : (evPlayerSets.get(i)?.size || 0));

  // Detect whether matches.json distinguishes Bo3 sets from Bo1 games (Rule 21).
  const bo3Info = detectBo3(M, G);
  return {M, S, teams, evDates, evPlayers, isSD, G, hasSets, deckTF, megaCounts, bo3Info};
}

function detectBo3(M, G) {
  // Check for explicit bo3/format metadata on events or games, or duplicate (event, round, unordered players) rows.
  const hasEventFormat = M.events.some(e => e.length >= 4 && /bo3|best.?of.?3/i.test(String(e[3])));
  const hasGameFlag = G.some(g => g.length >= 10 && g[9] != null);
  const seen = new Map();
  let dupRounds = 0;
  for (const g of G) {
    const a = Math.min(g[4], g[5]), b = Math.max(g[4], g[5]);
    const k = `${g[3]}:${g[6]}:${a}:${b}`;
    const c = (seen.get(k) || 0) + 1;
    seen.set(k, c);
    if (c === 2) dupRounds++;
  }
  return {
    available: hasEventFormat || hasGameFlag || dupRounds >= 50,
    hasEventFormat,
    hasGameFlag,
    dupRounds,
  };
}

// Build train-only vocabularies (monIx, pairIx >= 30 teams, set keep >= 40 decks, set freq) to prevent future leakage.
function buildContext(data, trainGames, opts = {}) {
  const {M, teams, deckTF, megaCounts, hasSets} = data;
  const monIx = new Map(), mons = [];
  for (const m of teams) for (const n of m) if (!monIx.has(n)) { monIx.set(n, mons.length); mons.push(n); }

  const pc = new Map(), seenT = new Set();
  for (const g of trainGames) for (const t of [g[0], g[1]]) {
    if (seenT.has(t)) continue; seenT.add(t);
    const m = teams[t];
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
      const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i];
      pc.set(k, (pc.get(k) || 0) + 1);
    }
  }
  const minPairs = opts.minPairs ?? 30;
  const pairIx = new Map([...pc].filter(([, n]) => n >= minPairs).map(([k], i) => [k, i]));
  const pairs = [...pairIx.keys()];

  const tf = teams.map(m => {
    const f = m.map(n => monIx.get(n)), p = [];
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
      const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i];
      const q = pairIx.get(k); if (q != null) p.push(q);
    }
    return {f, p};
  });

  let setNames = [], deckF = [];
  const featSp = [], spFeats = new Map();
  let freq = new Float64Array(0);
  if (hasSets) {
    const cnt = new Map(), used = new Set();
    for (const g of trainGames) { if (g[7] != null) used.add(g[7]); if (g[8] != null) used.add(g[8]); }
    const minDecks = opts.minDecks ?? 40;
    for (const d of used) if (M.decks[d]) for (const f of M.decks[d]) cnt.set(f, (cnt.get(f) || 0) + 1);
    const keep = new Map([...cnt].filter(([, n]) => n >= minDecks).map(([f], i) => [f, i]));
    setNames = [...keep.keys()].map(f => M.feats[f]);
    deckF = M.decks.map(fs_ => (fs_ || []).map(f => keep.get(f)).filter(j => j != null));
    freq = new Float64Array(setNames.length);
    const spDecks = new Map(), fd = new Float64Array(setNames.length);
    if (opts.recencySetFreq) {
      let lastD = -Infinity;
      for (const g of trainGames) lastD = Math.max(lastD, dayNum(data.evDates[g[3]]));
      const half = data.S.half ?? 14;
      const deckW = new Map();
      for (const g of trainGames) {
        const w = half ? Math.pow(0.5, (lastD - dayNum(data.evDates[g[3]])) / half) : 1;
        if (g[7] != null) deckW.set(g[7], (deckW.get(g[7]) || 0) + w);
        if (g[8] != null) deckW.set(g[8], (deckW.get(g[8]) || 0) + w);
      }
      for (const d of used) {
        if (!M.decks[d]) continue;
        const w = deckW.get(d) || 1;
        for (const sp of new Set(M.decks[d].map(f => M.feats[f].split(/[@:#]/)[0]))) spDecks.set(sp, (spDecks.get(sp) || 0) + w);
        for (const j of deckF[d]) fd[j] += w;
      }
    } else {
      for (const d of used) {
        if (!M.decks[d]) continue;
        for (const sp of new Set(M.decks[d].map(f => M.feats[f].split(/[@:#]/)[0]))) spDecks.set(sp, (spDecks.get(sp) || 0) + 1);
        for (const j of deckF[d]) fd[j]++;
      }
    }
    const spCounts = [...spDecks.values()].sort((a, b) => a - b);
    const medSp = spCounts.length ? spCounts[Math.floor(spCounts.length / 2)] : 1;
    setNames.forEach((f, j) => {
      const sp = f.split(/[@:#]/)[0];
      featSp.push(sp);
      freq[j] = fd[j] / (spDecks.get(sp) || 1);
      if (!spFeats.has(sp)) spFeats.set(sp, []);
      spFeats.get(sp).push(j);
    });
    var featLcMult = Float64Array.from(featSp, sp => {
      const ratio = Math.sqrt(medSp / Math.max(1, spDecks.get(sp) || 1));
      return Math.max(0.5, Math.min(2.5, ratio));
    });
  }
  // Archetype / speed-control 6-dim vector per deck (TR, TW, Sun, Rain, Sand, Snow) from M.feats (zero leakage)
  const ARCH_DIM = 6;
  const deckArch = hasSets ? M.decks.map(fs_ => {
    const v = new Float64Array(ARCH_DIM);
    if (!fs_) return v;
    for (const f of fs_) {
      const s = M.feats[f] || '';
      if (/:Trick Room$/i.test(s)) v[0] = 1;
      else if (/:Tailwind$/i.test(s)) v[1] = 1;
      else if (/#(Drought|Mega Sol)$|:Sunny Day$/i.test(s)) v[2] = 1;
      else if (/#Drizzle$|:Rain Dance$/i.test(s)) v[3] = 1;
      else if (/#Sand Stream$|:Sandstorm$/i.test(s)) v[4] = 1;
      else if (/#Snow Warning$|:Snowscape$/i.test(s)) v[5] = 1;
    }
    return v;
  }) : [];

  const teamFeatNames = opts.teamFeats || ['noMega', 'protectLow'];
  const tvCache = new Map();
  const teamVec = (t, d) => {
    if (!teamFeatNames.length) return [];
    const key = t * 100000 + (d ?? 99999);
    let v = tvCache.get(key); if (v) return v;
    v = teamFeatNames.map(k => {
      if (k === 'noMega') return megaCounts[t] === 0 ? 1 : 0;
      if (k === 'multiMega') return Math.max(0, megaCounts[t] - 1);
      return (d != null && deckTF[d]) ? (deckTF[d][k] || 0) : 0;
    });
    tvCache.set(key, v);
    return v;
  };

  return {monIx, mons, pairIx, pairs, tf, setNames, deckF, featSp, spFeats, freq, featLcMult: typeof featLcMult !== 'undefined' ? featLcMult : null, deckArch, ARCH_DIM, teamFeatNames, teamVec, nP: M.players};
}

// ============================================================================
// 2. TODAY'S MODEL (EXACT COPY OF model.mjs fit() + calibOf() LOGIC)
//    Copied rather than imported because model.mjs executes top-level I/O on import.
// ============================================================================
function fitBaseline(data, ctx, games, opt = {}) {
  const {evDates, teams} = data;
  const {mons, pairs, tf, setNames, deckF, spFeats, freq, teamFeatNames, teamVec, nP} = ctx;
  const K = opt.shrink ?? data.S.shrink ?? 3;
  const half = opt.half ?? data.S.half ?? 14;
  const teamHalf = opt.teamHalf ?? (data.S.teamHalf != null ? data.S.teamHalf : half);
  const skillHalf = opt.skillHalf ?? half;
  const hierSets = !!opt.hierSets;
  const skillMult = opt.skill ?? data.S.skill ?? 1;
  const useSkill = opt.useSkill ?? (skillMult > 0);
  const usePairs = opt.usePairs ?? true;
  const useSets = opt.useSets ?? !!(data.hasSets && setNames.length && (opt.sets ?? data.S.sets ?? 60) > 0);
  const pairShrink = opt.pairShrink ?? data.S.pairShrink ?? 4;
  const lb = opt.lb ?? (4 * K);
  const lp = opt.lp ?? (15 * K * pairShrink);
  const ls = opt.ls ?? (1.5 * K * (skillMult || 1));
  const lc = opt.lc ?? (opt.sets ?? data.S.sets ?? 60);
  const evidK = opt.evidK ?? 1000;
  const evidKp = opt.evidKp ?? 300;
  const iters = opt.iters ?? ITERS;
  const priorB = opt.priorB || null;       // L2-SP prior vector for Part D (M-D day one)
  const priorLam = opt.priorLam || 0;      // L2-SP strength
  const skillOffset = opt.skillOffset || null; // Pre-match Glicko-2 offset array per game (Idea 3)

  const b = new Float64Array(mons.length);
  const q = new Float64Array(pairs.length);
  const s = new Float64Array(nP);
  const c = new Float64Array(setNames.length);
  const T = new Float64Array(teamFeatNames.length);
  const P = [b, q, s, c, T];
  const Mm = P.map(a => new Float64Array(a.length));
  const V = P.map(a => new Float64Array(a.length));
  const L = [lb, lp, ls, lc, 1];

  let last = -Infinity;
  for (const g of games) last = Math.max(last, dayNum(evDates[g[3]]));
  const W = games.map(g => half ? Math.pow(0.5, (last - dayNum(evDates[g[3]])) / half) : 1);
  const Wn = games.length / (W.reduce((a, x) => a + x, 0) || 1);
  const WT = teamHalf === half ? W : games.map(g => teamHalf ? Math.pow(0.5, (last - dayNum(evDates[g[3]])) / teamHalf) : 1);
  const WTn = games.length / (WT.reduce((a, x) => a + x, 0) || 1);
  const WS = skillHalf === half ? W : games.map(g => skillHalf ? Math.pow(0.5, (last - dayNum(evDates[g[3]])) / skillHalf) : 1);
  const WSn = games.length / (WS.reduce((a, x) => a + x, 0) || 1);

  const dv = new Map();
  const deckVec = (t, d) => {
    if (!useSets || d == null || !deckF[d]) return [];
    const key = t * 100000 + d;
    let v = dv.get(key); if (v) return v;
    v = [];
    const has = new Set(deckF[d]);
    for (const n of teams[t]) for (const j of (spFeats.get(n) || [])) v.push([j, (has.has(j) ? 1 : 0) - freq[j]]);
    dv.set(key, v);
    return v;
  };

  const x = (t, d) => {
    let v = 0;
    for (const j of tf[t].f) v += b[j];
    if (usePairs) for (const j of tf[t].p) v += q[j];
    for (const [j, w] of deckVec(t, d)) v += c[j] * w;
    const tv = teamVec(t, d);
    for (let k = 0; k < tv.length; k++) v += T[k] * tv[k];
    return v;
  };

  for (let it = 1; it <= iters; it++) {
    const Gr = P.map(a => new Float64Array(a.length));
    for (let gi = 0; gi < games.length; gi++) {
      const [A, B, r, , pa, pb, , dA, dB] = games[gi];
      const sk = (useSkill ? s[pa] - s[pb] : 0) + (skillOffset ? skillOffset[gi] : 0);
      const eta = x(A, dA) - x(B, dB) + sk;
      const e0 = sig(eta) - r;
      const d = e0 * W[gi] * Wn, dT = e0 * WT[gi] * WTn, dS = e0 * WS[gi] * WSn;
      for (const j of tf[A].f) Gr[0][j] += d;
      for (const j of tf[B].f) Gr[0][j] -= d;
      if (usePairs) {
        for (const j of tf[A].p) Gr[1][j] += d;
        for (const j of tf[B].p) Gr[1][j] -= d;
      }
      if (useSkill) { Gr[2][pa] += dS; Gr[2][pb] -= dS; }
      for (const [j, w] of deckVec(A, dA)) Gr[3][j] += d * w;
      for (const [j, w] of deckVec(B, dB)) Gr[3][j] -= d * w;
      if (teamFeatNames.length) {
        const ta = teamVec(A, dA), tb = teamVec(B, dB);
        for (let k = 0; k < ta.length; k++) Gr[4][k] += dT * (ta[k] - tb[k]);
      }
    }
    const c1 = 1 - 0.9 ** it, c2 = 1 - 0.999 ** it;
    for (let k = 0; k < P.length; k++) {
      const a = P[k], g = Gr[k], m = Mm[k], v = V[k];
      for (let j = 0; j < a.length; j++) {
        let reg = 2 * L[k] * (k === 3 && hierSets && ctx.featLcMult ? ctx.featLcMult[j] : 1) * a[j];
        if (k === 0 && priorB && priorLam > 0) reg = 2 * L[k] * a[j] + 2 * priorLam * (a[j] - (priorB[j] || 0));
        const gg = g[j] + reg;
        m[j] = 0.9 * m[j] + 0.1 * gg;
        v[j] = 0.999 * v[j] + 0.001 * gg * gg;
        a[j] -= 0.03 * (m[j] / c1) / (Math.sqrt(v[j] / c2) + 1e-8);
      }
    }
  }

  if (evidK > 0 || evidKp > 0) {
    const nb = new Float64Array(mons.length), nq = new Float64Array(pairs.length);
    for (const [A, B] of games) for (const t of [A, B]) {
      for (const j of tf[t].f) nb[j]++;
      for (const j of tf[t].p) nq[j]++;
    }
    if (evidK > 0) for (let j = 0; j < b.length; j++) b[j] *= nb[j] / (nb[j] + evidK);
    if (evidKp > 0) for (let j = 0; j < q.length; j++) q[j] *= nq[j] / (nq[j] + evidKp);
  }

  return {
    b, q, s, c, T, x,
    predictLogit: (A, B, dA, dB) => x(A, dA) - x(B, dB),
  };
}

// Calibration slope (identical Newton loop to model.mjs:139-142).
function fitCalib(model, games) {
  const pts = games.map(([A, B, r, , , , , dA, dB]) => [model.predictLogit(A, B, dA, dB), r]);
  let w = 1;
  for (let k = 0; k < 30; k++) {
    let g = 0, h = 0;
    for (const [e, r] of pts) {
      const p = sig(w * e);
      g += (p - r) * e;
      h += p * (1 - p) * e * e;
    }
    w -= g / (h || 1);
    if (!Number.isFinite(w) || Math.abs(w) > 20) { w = 1; break; }
  }
  return Math.max(0.05, Math.min(10, w));
}

// Regularized segment calibration (shrunk toward global slope w0) strictly inside innerCal (zero leakage).
function fitSegCalib(model, calGames, innerTeamCnt, evPlayers, w0, lamSeg = 15) {
  const segOf = g => {
    const big = (evPlayers[g[3]] || 0) >= 64 ? 1 : 0;
    const com = innerTeamCnt[g[0]] >= 30 && innerTeamCnt[g[1]] >= 30 ? 1 : 0;
    return com * 2 + big; // 0=rare_small, 1=rare_big, 2=common_small, 3=common_big
  };
  const buckets = [[], [], [], []];
  for (const g of calGames) buckets[segOf(g)].push([model.predictLogit(g[0], g[1], g[7], g[8]), g[2] === 1 ? 1 : 0]);
  const slopes = [w0, w0, w0, w0];
  for (let b = 0; b < 4; b++) {
    const pts = buckets[b];
    if (pts.length < 30) continue;
    let w = w0;
    for (let k = 0; k < 25; k++) {
      let gr = 2 * lamSeg * (w - w0), h = 2 * lamSeg;
      for (const [e, r] of pts) { const p = sig(w * e); gr += (p - r) * e; h += p * (1 - p) * e * e; }
      w -= gr / (h || 1);
      if (!Number.isFinite(w) || Math.abs(w) > 20) { w = w0; break; }
    }
    slopes[b] = Math.max(0.05, Math.min(10, w));
  }
  return slopes;
}

// Fit model + calibration strictly inside trainGames (last 20% of train events for calib, matching production).
function fitWithCalib(data, trainGames, fitFn, ctxOpts = {}, {segCal = false} = {}) {
  const ctx = buildContext(data, trainGames, ctxOpts);
  const trEv = [...new Set(trainGames.map(g => g[3]))].filter(i => !data.isSD(i)).sort((a, b) => data.evDates[a] < data.evDates[b] ? -1 : 1);
  const splitAt = Math.max(1, Math.floor(trEv.length * 0.8));
  const calEv = new Set(trEv.slice(splitAt));
  const innerTrain = trainGames.filter(g => !calEv.has(g[3]));
  const innerCal = trainGames.filter(g => calEv.has(g[3]));
  const calModel = innerTrain.length >= 100 && innerCal.length >= 50 ? fitFn(data, ctx, innerTrain) : null;
  const calib = calModel ? fitCalib(calModel, innerCal) : 1;
  let segSlopes = null;
  const fullTeamCnt = new Int32Array(data.M.teams.length);
  for (const g of trainGames) { fullTeamCnt[g[0]]++; fullTeamCnt[g[1]]++; }
  if (segCal && calModel) {
    const innerTeamCnt = new Int32Array(data.M.teams.length);
    for (const g of innerTrain) { innerTeamCnt[g[0]]++; innerTeamCnt[g[1]]++; }
    segSlopes = fitSegCalib(calModel, innerCal, innerTeamCnt, data.evPlayers, calib);
  }
  const full = fitFn(data, ctx, trainGames);
  return {
    model: full,
    calib,
    segSlopes,
    predictProb: g => {
      const logit = full.predictLogit(g[0], g[1], g[7], g[8]);
      if (!segSlopes) return sig(calib * logit);
      const big = (data.evPlayers[g[3]] || 0) >= 64 ? 1 : 0;
      const com = fullTeamCnt[g[0]] >= 30 && fullTeamCnt[g[1]] >= 30 ? 1 : 0;
      return sig(segSlopes[com * 2 + big] * logit);
    },
  };
}

// ============================================================================
// 3. PART C: TOP 5 CODEABLE IDEAS (EACH SELF-CONTAINED, ZERO CHANGE TO model.mjs)
// ============================================================================

// IDEA 1 (--idea=fm): Low-Rank Factorization Machine for Pokémon Pairs (Rendle 2010).
// Replaces sparse one-hot pairs q with rank-D embeddings V[mon][d]: pair_sum = 0.5 * sum_d ((sum v)^2 - sum v^2).
function fitFM(data, ctx, games, D = 4, lfm = 25) {
  const {evDates, teams} = data;
  const {mons, tf, setNames, deckF, spFeats, freq, teamFeatNames, teamVec, nP} = ctx;
  const K = data.S.shrink ?? 3, half = data.S.half ?? 14, teamHalf = data.S.teamHalf ?? half;
  const useSets = !!(data.hasSets && setNames.length && (data.S.sets ?? 60) > 0);
  const lb = 4 * K, ls = 1.5 * K * (data.S.skill ?? 1), lc = data.S.sets ?? 60;
  const rng = makeRng(42);
  const b = new Float64Array(mons.length), s = new Float64Array(nP), c = new Float64Array(setNames.length), T = new Float64Array(teamFeatNames.length);
  const Fm = new Float64Array(mons.length * D);
  for (let i = 0; i < Fm.length; i++) Fm[i] = (rng() - 0.5) * 0.04;
  const P = [b, Fm, s, c, T], Mm = P.map(a => new Float64Array(a.length)), Vv = P.map(a => new Float64Array(a.length)), L = [lb, lfm, ls, lc, 1];

  let last = -Infinity; for (const g of games) last = Math.max(last, dayNum(evDates[g[3]]));
  const W = games.map(g => half ? Math.pow(0.5, (last - dayNum(evDates[g[3]])) / half) : 1);
  const Wn = games.length / (W.reduce((a, x) => a + x, 0) || 1);
  const WT = teamHalf === half ? W : games.map(g => teamHalf ? Math.pow(0.5, (last - dayNum(evDates[g[3]])) / teamHalf) : 1);
  const WTn = games.length / (WT.reduce((a, x) => a + x, 0) || 1);

  const dv = new Map();
  const deckVec = (t, d) => {
    if (!useSets || d == null || !deckF[d]) return [];
    const key = t * 100000 + d; let v = dv.get(key); if (v) return v;
    v = []; const has = new Set(deckF[d]);
    for (const n of teams[t]) for (const j of (spFeats.get(n) || [])) v.push([j, (has.has(j) ? 1 : 0) - freq[j]]);
    dv.set(key, v); return v;
  };
  const fmScore = t => {
    let total = 0; const fs = tf[t].f;
    for (let d = 0; d < D; d++) {
      let sum = 0, sq = 0;
      for (const j of fs) { const v = Fm[j * D + d]; sum += v; sq += v * v; }
      total += 0.5 * (sum * sum - sq);
    }
    return total;
  };
  const x = (t, d) => {
    let v = fmScore(t);
    for (const j of tf[t].f) v += b[j];
    for (const [j, w] of deckVec(t, d)) v += c[j] * w;
    const tv = teamVec(t, d); for (let k = 0; k < tv.length; k++) v += T[k] * tv[k];
    return v;
  };

  for (let it = 1; it <= ITERS; it++) {
    const Gr = P.map(a => new Float64Array(a.length));
    for (let gi = 0; gi < games.length; gi++) {
      const [A, B, r, , pa, pb, , dA, dB] = games[gi];
      const eta = x(A, dA) - x(B, dB) + s[pa] - s[pb], e0 = sig(eta) - r;
      const d = e0 * W[gi] * Wn, dT = e0 * WT[gi] * WTn;
      for (const j of tf[A].f) Gr[0][j] += d;
      for (const j of tf[B].f) Gr[0][j] -= d;
      for (let f = 0; f < D; f++) {
        let sumA = 0, sumB = 0;
        for (const j of tf[A].f) sumA += Fm[j * D + f];
        for (const j of tf[B].f) sumB += Fm[j * D + f];
        for (const j of tf[A].f) Gr[1][j * D + f] += d * (sumA - Fm[j * D + f]);
        for (const j of tf[B].f) Gr[1][j * D + f] -= d * (sumB - Fm[j * D + f]);
      }
      Gr[2][pa] += d; Gr[2][pb] -= d;
      for (const [j, w] of deckVec(A, dA)) Gr[3][j] += d * w;
      for (const [j, w] of deckVec(B, dB)) Gr[3][j] -= d * w;
      const ta = teamVec(A, dA), tb = teamVec(B, dB);
      for (let k = 0; k < ta.length; k++) Gr[4][k] += dT * (ta[k] - tb[k]);
    }
    const c1 = 1 - 0.9 ** it, c2 = 1 - 0.999 ** it;
    for (let k = 0; k < P.length; k++) {
      const a = P[k], g = Gr[k], m = Mm[k], v = Vv[k];
      for (let j = 0; j < a.length; j++) {
        const gg = g[j] + 2 * L[k] * a[j];
        m[j] = 0.9 * m[j] + 0.1 * gg; v[j] = 0.999 * v[j] + 0.001 * gg * gg;
        a[j] -= 0.03 * (m[j] / c1) / (Math.sqrt(v[j] / c2) + 1e-8);
      }
    }
  }
  const nb = new Float64Array(mons.length);
  for (const [A, B] of games) for (const t of [A, B]) for (const j of tf[t].f) nb[j]++;
  for (let j = 0; j < b.length; j++) b[j] *= nb[j] / (nb[j] + 1000);
  return {b, Fm, s, c, T, x, predictLogit: (A, B, dA, dB) => x(A, dA) - x(B, dB)};
}

// IDEA 2 (--ideas=matchup, matchup-d2/d4/d8) & COMBO (--ideas=combo, combo-d2/d4/d8):
// Blade-Chest Intransitive Team-vs-Team Matchup Term (Chen & Joachims 2016): u(A).v(B) - u(B).v(A).
function fitBladeChestOn(base, data, ctx, games, D = 4, lbc = 15) {
  const {evDates} = data;
  const {mons, tf} = ctx;
  const half = data.S.half ?? 14;
  const rng = makeRng(99);
  const U = new Float64Array(mons.length * D), Vc = new Float64Array(mons.length * D);
  for (let i = 0; i < U.length; i++) { U[i] = (rng() - 0.5) * 0.03; Vc[i] = (rng() - 0.5) * 0.03; }
  const P = [U, Vc], Mm = P.map(a => new Float64Array(a.length)), Vv = P.map(a => new Float64Array(a.length));

  let last = -Infinity; for (const g of games) last = Math.max(last, dayNum(evDates[g[3]]));
  const W = games.map(g => half ? Math.pow(0.5, (last - dayNum(evDates[g[3]])) / half) : 1);
  const Wn = games.length / (W.reduce((a, x) => a + x, 0) || 1);
  const baseEta = games.map(([A, B, , , pa, pb, , dA, dB]) => base.predictLogit(A, B, dA, dB) + base.s[pa] - base.s[pb]);

  const bcDot = (A, B) => {
    let val = 0;
    for (let d = 0; d < D; d++) {
      let uA = 0, vA = 0, uB = 0, vB = 0;
      for (const j of tf[A].f) { uA += U[j * D + d]; vA += Vc[j * D + d]; }
      for (const j of tf[B].f) { uB += U[j * D + d]; vB += Vc[j * D + d]; }
      val += (uA * vB - uB * vA) / 6;
    }
    return val;
  };

  const bcIters = Math.min(150, ITERS);
  for (let it = 1; it <= bcIters; it++) {
    const gU = new Float64Array(U.length), gV = new Float64Array(Vc.length);
    for (let gi = 0; gi < games.length; gi++) {
      const [A, B, r] = games[gi];
      const e0 = sig(baseEta[gi] + bcDot(A, B)) - r, dW = (e0 * W[gi] * Wn) / 6;
      for (let d = 0; d < D; d++) {
        let uA = 0, vA = 0, uB = 0, vB = 0;
        for (const j of tf[A].f) { uA += U[j * D + d]; vA += Vc[j * D + d]; }
        for (const j of tf[B].f) { uB += U[j * D + d]; vB += Vc[j * D + d]; }
        for (const j of tf[A].f) { gU[j * D + d] += dW * vB; gV[j * D + d] -= dW * uB; }
        for (const j of tf[B].f) { gU[j * D + d] -= dW * vA; gV[j * D + d] += dW * uA; }
      }
    }
    const c1 = 1 - 0.9 ** it, c2 = 1 - 0.999 ** it;
    for (const [k, gr] of [[0, gU], [1, gV]]) {
      const a = P[k], m = Mm[k], v = Vv[k];
      for (let j = 0; j < a.length; j++) {
        const gg = gr[j] + 2 * lbc * a[j];
        m[j] = 0.9 * m[j] + 0.1 * gg; v[j] = 0.999 * v[j] + 0.001 * gg * gg;
        a[j] -= 0.02 * (m[j] / c1) / (Math.sqrt(v[j] / c2) + 1e-8);
      }
    }
  }
  return {
    ...base, U, Vc,
    predictLogit: (A, B, dA, dB) => base.predictLogit(A, B, dA, dB) + bcDot(A, B),
  };
}

function fitMatchup(data, ctx, games, D = 4, lbc = 15) {
  return fitBladeChestOn(fitBaseline(data, ctx, games), data, ctx, games, D, lbc);
}

// Combined winner candidate: clean ridge + fixed six delta (no-evid-hier) + Blade-Chest rank-D matchup term.
function fitCombo(data, ctx, games, D = 4, lbc = 15, baseOpt = {}) {
  return fitBladeChestOn(fitNoEvidHier(data, ctx, games, baseOpt), data, ctx, games, D, lbc);
}

// ROUND 3 IDEA 1 (--ideas=combo-skillhalf): Decoupled player-skill half-life (60d vs 14d meta half-life) on top of combo.
function fitComboSkillHalf(data, ctx, games) {
  return fitCombo(data, ctx, games, 4, 15, {skillHalf: 60});
}

// ROUND 3 IDEA 2 (--ideas=combo-archetype): Explicit antisymmetric archetype/speed-control matchup matrix on top of combo.
function fitComboArchetype(data, ctx, games, lArch = 20) {
  const base = fitCombo(data, ctx, games, 4, 15);
  const {deckArch, ARCH_DIM} = ctx;
  if (!deckArch || !deckArch.length) return base;
  const K = ARCH_DIM;
  // Upper-triangular antisymmetric matrix W (15 free parameters for K=6)
  const pairs = [];
  for (let i = 0; i < K; i++) for (let j = i + 1; j < K; j++) pairs.push([i, j]);
  const w = new Float64Array(pairs.length), mw = new Float64Array(pairs.length), vw = new Float64Array(pairs.length);
  const half = data.S.half ?? 14;
  let last = -Infinity; for (const g of games) last = Math.max(last, dayNum(data.evDates[g[3]]));
  const Wt = games.map(g => half ? Math.pow(0.5, (last - dayNum(data.evDates[g[3]])) / half) : 1);
  const Wn = games.length / (Wt.reduce((a, x) => a + x, 0) || 1);
  const baseEta = games.map(([A, B, , , pa, pb, , dA, dB]) => base.predictLogit(A, B, dA, dB) + base.s[pa] - base.s[pb]);
  const archDot = (dA, dB) => {
    if (dA == null || dB == null || !deckArch[dA] || !deckArch[dB]) return 0;
    const a = deckArch[dA], b = deckArch[dB];
    let val = 0;
    for (let p = 0; p < pairs.length; p++) {
      const [i, j] = pairs[p];
      val += w[p] * (a[i] * b[j] - a[j] * b[i]);
    }
    return val;
  };
  for (let it = 1; it <= Math.min(100, ITERS); it++) {
    const gr = new Float64Array(pairs.length);
    for (let gi = 0; gi < games.length; gi++) {
      const [, , r, , , , , dA, dB] = games[gi];
      if (dA == null || dB == null || !deckArch[dA] || !deckArch[dB]) continue;
      const e = (sig(baseEta[gi] + archDot(dA, dB)) - r) * Wt[gi] * Wn;
      const a = deckArch[dA], b = deckArch[dB];
      for (let p = 0; p < pairs.length; p++) {
        const [i, j] = pairs[p];
        const diff = a[i] * b[j] - a[j] * b[i];
        if (diff) gr[p] += e * diff;
      }
    }
    const c1 = 1 - 0.9 ** it, c2 = 1 - 0.999 ** it;
    for (let p = 0; p < pairs.length; p++) {
      const gg = gr[p] + 2 * lArch * w[p];
      mw[p] = 0.9 * mw[p] + 0.1 * gg; vw[p] = 0.999 * vw[p] + 0.001 * gg * gg;
      w[p] -= 0.02 * (mw[p] / c1) / (Math.sqrt(vw[p] / c2) + 1e-8);
    }
  }
  return {...base, wArch: w, predictLogit: (A, B, dA, dB) => base.predictLogit(A, B, dA, dB) + archDot(dA, dB)};
}

// ROUND 3 IDEA 3 (--ideas=combo-hier-sets): Recency-weighted set centering + species-volume hierarchical set shrinkage on top of combo.
function fitComboHierSets(data, ctx, games) {
  return fitCombo(data, ctx, games, 4, 15, {hierSets: true});
}

// IDEA 3 (--idea=glicko): Strictly Causal Pre-Match Glicko-2 Player Skill Offset (Glickman 2013).
// Computes chronological player skill (mu, phi) BEFORE each game with RD inflation over inactive days,
// then fits team strength with that dynamic skill offset + lightly shrunk residual player skill.
function computeCausalGlickoOffsets(data, games) {
  const {evDates, M} = data;
  const order = games.map((g, i) => ({g, i, d: dayNum(evDates[g[3]])})).sort((a, b) => a.d - b.d || a.g[6] - b.g[6]);
  const mu = new Float64Array(M.players);
  const phi = new Float64Array(M.players).fill(1.2); // initial RD in logit-like scale
  const lastDay = new Float64Array(M.players).fill(-1e9);
  const offsets = new Float64Array(games.length);
  const cDrift = 0.045; // RD inflation per sqrt(day) of inactivity

  for (const {g, i, d} of order) {
    const [, , r, , pa, pb] = g;
    for (const p of [pa, pb]) {
      if (lastDay[p] > -1e8 && d > lastDay[p]) {
        phi[p] = Math.min(1.5, Math.hypot(phi[p], cDrift * Math.sqrt(d - lastDay[p])));
      }
    }
    // Pre-match skill difference (strictly causal: uses ONLY prior games)
    offsets[i] = 0.5 * (mu[pa] - mu[pb]);

    // Glicko-style Bayesian update after observing result r
    const gPhi = ph => 1 / Math.sqrt(1 + (3 * ph * ph) / (Math.PI * Math.PI));
    const gB = gPhi(phi[pb]), gA = gPhi(phi[pa]);
    const eA = sig(gB * (mu[pa] - mu[pb]));
    const eB = 1 - eA;
    const vA = 1 / Math.max(1e-6, gB * gB * eA * (1 - eA));
    const vB = 1 / Math.max(1e-6, gA * gA * eB * (1 - eB));
    const phiA2 = 1 / (1 / (phi[pa] * phi[pa]) + 1 / vA);
    const phiB2 = 1 / (1 / (phi[pb] * phi[pb]) + 1 / vB);
    mu[pa] += phiA2 * gB * (r - eA);
    mu[pb] += phiB2 * gA * ((1 - r) - eB);
    phi[pa] = Math.sqrt(phiA2);
    phi[pb] = Math.sqrt(phiB2);
    lastDay[pa] = d;
    lastDay[pb] = d;
  }
  return offsets;
}

function fitGlicko(data, ctx, games) {
  const offsets = computeCausalGlickoOffsets(data, games);
  // With causal dynamic skill already explaining drift, use stronger ridge on residual static skill.
  return fitBaseline(data, ctx, games, {skillOffset: offsets, ls: (1.5 * (data.S.shrink ?? 3)) * 3});
}

// IDEA 4 (--idea=no-evid-hier): Remove Post-Hoc EVID_K Double Shrinkage + Recency-Aligned Team-Aware Six Deviation.
// Replaces post-hoc b *= n/(n+1000) with clean in-objective ridge (lb * 2.5, lp * 2, evidK=0, evidKp=0),
// and adds a recency-weighted, team-basics-aware exact-six residual delta (fixing six.mjs Part E #2).
function fitNoEvidHier(data, ctx, games, baseOpt = {}) {
  const K = data.S.shrink ?? 3;
  const base = fitBaseline(data, ctx, games, {
    lb: 4 * K * 2.5,
    lp: 15 * K * (data.S.pairShrink ?? 4) * 1.5,
    evidK: 0,
    evidKp: 0,
    ...baseOpt,
  });
  // Recency-weighted exact-six deviation delta (tau = 0.1) with FULL base.x (including team basics!).
  const {evDates, M} = data;
  const half = data.S.half ?? 14;
  let last = -Infinity; for (const g of games) last = Math.max(last, dayNum(evDates[g[3]]));
  const W = games.map(g => half ? Math.pow(0.5, (last - dayNum(evDates[g[3]])) / half) : 1);
  const Wn = games.length / (W.reduce((a, x) => a + x, 0) || 1);
  const dl = new Float64Array(M.teams.length), md = new Float64Array(M.teams.length), vd = new Float64Array(M.teams.length);
  const tau2 = 0.1 * 0.1;
  const baseX = games.map(g => [base.x(g[0], g[7]), base.x(g[1], g[8])]);
  for (let it = 1; it <= 120; it++) {
    const gd = new Float64Array(M.teams.length);
    for (let i = 0; i < games.length; i++) {
      const g = games[i];
      const eta = baseX[i][0] + dl[g[0]] - baseX[i][1] - dl[g[1]] + base.s[g[4]] - base.s[g[5]];
      const e = (sig(eta) - g[2]) * W[i] * Wn;
      gd[g[0]] += e; gd[g[1]] -= e;
    }
    const c1 = 1 - 0.9 ** it, c2 = 1 - 0.999 ** it;
    for (let j = 0; j < dl.length; j++) {
      if (!gd[j] && !dl[j]) continue;
      const gr = gd[j] + dl[j] / tau2;
      md[j] = 0.9 * md[j] + 0.1 * gr; vd[j] = 0.999 * vd[j] + 0.001 * gr * gr;
      dl[j] -= 0.04 * (md[j] / c1) / (Math.sqrt(vd[j] / c2) + 1e-8);
    }
  }
  const ng = new Int32Array(M.teams.length);
  for (const g of games) { ng[g[0]]++; ng[g[1]]++; }
  for (let j = 0; j < dl.length; j++) if (ng[j] < 10) dl[j] = 0;
  return {
    ...base, dl,
    predictLogit: (A, B, dA, dB) => (base.x(A, dA) + dl[A]) - (base.x(B, dB) + dl[B]),
  };
}

// IDEA 5 (--idea=mega-cap): Champions Rule 1-Mega-Per-Battle Diminishing Returns (multiMega team feature).
function fitMegaCap(data, ctx, games) {
  return fitBaseline(data, ctx, games);
}

// ============================================================================
// 4. METRICS & TOURNAMENT-CLUSTERED PAIRED 95% BOOTSTRAP CI
// ============================================================================
function metricsOf(probs, ys) {
  const n = probs.length;
  if (!n) return {n: 0, acc: NaN, ll: NaN, brier: NaN, calSlope: NaN, unknown: true};
  let acc = 0, ll = 0, brier = 0;
  const logits = [];
  for (let i = 0; i < n; i++) {
    const p = Math.min(1 - 1e-9, Math.max(1e-9, probs[i])), y = ys[i];
    if ((p > 0.5) === (y === 1)) acc++;
    ll -= y ? Math.log(p) : Math.log(1 - p);
    brier += (p - y) * (p - y);
    logits.push([Math.log(p / (1 - p)), y]);
  }
  // Calibration slope via Newton on log-odds
  let w = 1;
  for (let k = 0; k < 25; k++) {
    let g = 0, h = 0;
    for (const [e, y] of logits) { const q = sig(w * e); g += (q - y) * e; h += q * (1 - q) * e * e; }
    w -= g / (h || 1);
    if (!Number.isFinite(w) || Math.abs(w) > 20) { w = 1; break; }
  }
  return {n, acc: acc / n, ll: ll / n, brier: brier / n, calSlope: w, unknown: n < 500};
}

// Tournament-clustered bootstrap: resamples whole events (preserving within-tournament correlation).
function bootstrapCI(probs, ys, evs, baseProbs = null, boots = BOOTS) {
  const byEv = new Map();
  for (let i = 0; i < probs.length; i++) {
    let a = byEv.get(evs[i]); if (!a) byEv.set(evs[i], a = []);
    a.push(i);
  }
  const evList = [...byEv.values()];
  if (evList.length < 2) return null;
  const rng = makeRng(20261125);
  const accs = [], lls = [], briers = [], dAcc = [], dLl = [], dBrier = [];

  for (let b = 0; b < boots; b++) {
    let n = 0, a1 = 0, l1 = 0, br1 = 0, a0 = 0, l0 = 0, br0 = 0;
    for (let k = 0; k < evList.length; k++) {
      const idxs = evList[Math.floor(rng() * evList.length)];
      for (const i of idxs) {
        const y = ys[i], p = Math.min(1 - 1e-9, Math.max(1e-9, probs[i]));
        n++;
        if ((p > 0.5) === (y === 1)) a1++;
        l1 -= y ? Math.log(p) : Math.log(1 - p);
        br1 += (p - y) * (p - y);
        if (baseProbs) {
          const p0 = Math.min(1 - 1e-9, Math.max(1e-9, baseProbs[i]));
          if ((p0 > 0.5) === (y === 1)) a0++;
          l0 -= y ? Math.log(p0) : Math.log(1 - p0);
          br0 += (p0 - y) * (p0 - y);
        }
      }
    }
    accs.push(a1 / n); lls.push(l1 / n); briers.push(br1 / n);
    if (baseProbs) { dAcc.push((a1 - a0) / n); dLl.push((l1 - l0) / n); dBrier.push((br1 - br0) / n); }
  }
  const pct = arr => {
    arr.sort((x, y) => x - y);
    return [arr[Math.floor(0.025 * arr.length)], arr[Math.floor(0.975 * arr.length)]];
  };
  return {
    accCI: pct(accs), llCI: pct(lls), brierCI: pct(briers),
    dAccCI: baseProbs ? pct(dAcc) : null,
    dLlCI: baseProbs ? pct(dLl) : null,
    dBrierCI: baseProbs ? pct(dBrier) : null,
  };
}

// ============================================================================
// 5. WALK-FORWARD RUNNER (PART B + PART C)
// ============================================================================
function buildVariants(ideas) {
  const IDEAS = ideas;
  return [
    {id: 'baseline', label: "Today's model (model.mjs)", fn: (d, c, gs) => fitBaseline(d, c, gs), ctxOpts: {}},
    ...(IDEAS.includes('fm') ? [{id: 'fm', label: 'C1: Factorization Machine pairs (d=4)', fn: (d, c, gs) => fitFM(d, c, gs), ctxOpts: {}}] : []),
    ...(IDEAS.includes('matchup') ? [{id: 'matchup', label: 'C2: Blade-Chest matchup term (d=4)', fn: (d, c, gs) => fitMatchup(d, c, gs, 4), ctxOpts: {}}] : []),
    ...(IDEAS.includes('matchup-d2') ? [{id: 'matchup-d2', label: 'C2: Blade-Chest matchup term (d=2)', fn: (d, c, gs) => fitMatchup(d, c, gs, 2), ctxOpts: {}}] : []),
    ...(IDEAS.includes('matchup-d4') ? [{id: 'matchup-d4', label: 'C2: Blade-Chest matchup term (d=4)', fn: (d, c, gs) => fitMatchup(d, c, gs, 4), ctxOpts: {}}] : []),
    ...(IDEAS.includes('matchup-d8') ? [{id: 'matchup-d8', label: 'C2: Blade-Chest matchup term (d=8)', fn: (d, c, gs) => fitMatchup(d, c, gs, 8), ctxOpts: {}}] : []),
    ...(IDEAS.includes('glicko') ? [{id: 'glicko', label: 'C3: Causal Glicko-2 player skill', fn: (d, c, gs) => fitGlicko(d, c, gs), ctxOpts: {}}] : []),
    ...(IDEAS.includes('no-evid-hier') ? [{id: 'no-evid-hier', label: 'C4: Clean ridge + fixed six delta', fn: (d, c, gs) => fitNoEvidHier(d, c, gs), ctxOpts: {}}] : []),
    ...(IDEAS.includes('mega-cap') ? [{id: 'mega-cap', label: 'C5: Mega diminishing returns', fn: (d, c, gs) => fitMegaCap(d, c, gs), ctxOpts: {teamFeats: ['noMega', 'protectLow', 'multiMega']}}] : []),
    ...(IDEAS.includes('combo') ? [{id: 'combo', label: 'COMBO: no-evid-hier + Blade-Chest (d=4)', fn: (d, c, gs) => fitCombo(d, c, gs, 4), ctxOpts: {}}] : []),
    ...(IDEAS.includes('combo-d2') ? [{id: 'combo-d2', label: 'COMBO: no-evid-hier + Blade-Chest (d=2)', fn: (d, c, gs) => fitCombo(d, c, gs, 2), ctxOpts: {}}] : []),
    ...(IDEAS.includes('combo-d4') ? [{id: 'combo-d4', label: 'COMBO: no-evid-hier + Blade-Chest (d=4)', fn: (d, c, gs) => fitCombo(d, c, gs, 4), ctxOpts: {}}] : []),
    ...(IDEAS.includes('combo-d8') ? [{id: 'combo-d8', label: 'COMBO: no-evid-hier + Blade-Chest (d=8)', fn: (d, c, gs) => fitCombo(d, c, gs, 8), ctxOpts: {}}] : []),
    ...(IDEAS.includes('combo-skillhalf') ? [{id: 'combo-skillhalf', label: 'R3-1: combo + decoupled player skillHalf=60d', fn: (d, c, gs) => fitComboSkillHalf(d, c, gs), ctxOpts: {}}] : []),
    ...(IDEAS.includes('combo-archetype') ? [{id: 'combo-archetype', label: 'R3-2: combo + explicit archetype matchup matrix', fn: (d, c, gs) => fitComboArchetype(d, c, gs), ctxOpts: {}}] : []),
    ...(IDEAS.includes('combo-hier-sets') ? [{id: 'combo-hier-sets', label: 'R3-3: combo + recency-centered hierarchical sets', fn: (d, c, gs) => fitComboHierSets(d, c, gs), ctxOpts: {recencySetFreq: true}}] : []),
    ...(IDEAS.includes('combo-seg-cal') ? [{id: 'combo-seg-cal', label: 'R3-4: combo + segment-aware calibration', fn: (d, c, gs) => fitCombo(d, c, gs, 4), ctxOpts: {}, segCal: true}] : []),
  ];
}

function runWalkForward(data) {
  const {evDates, isSD, G} = data;
  const tourDates = data.M.events.map((e, i) => isSD(i) ? null : e[1]).filter(Boolean).sort();
  if (!tourDates.length) throw new Error('No tournament events found in matches.json');
  const maxDate = tourDates[tourDates.length - 1];
  const cuts = [];
  for (let k = WEEKS; k >= 1; k--) cuts.push(addDays(maxDate, -7 * k));

  const variants = buildVariants(IDEAS);
  const pooled = Object.fromEntries(variants.map(v => [v.id, {probs: [], ys: [], evs: [], perCut: []}]));
  const meta = {evBig: [], bothCommon: []};
  let lastArch = null;

  console.log(`=== WALK-FORWARD LAB (${cuts.length} weekly cuts ending ${maxDate}; ${BOOTS} tournament-clustered boots) ===`);
  for (const cut of cuts) {
    const to = addDays(cut, 7);
    const train = G.filter(g => evDates[g[3]] <= cut);
    const test = G.filter(g => evDates[g[3]] > cut && evDates[g[3]] <= to && !isSD(g[3]));
    if (!train.length || !test.length) {
      console.log(`  cut ${cut} -> ${to}: skipped (train=${train.length}, test=${test.length})`);
      continue;
    }
    const ys = test.map(g => g[2] === 1 ? 1 : 0);
    const evs = test.map(g => `${cut}:${g[3]}`);
    const trTeamCnt = new Int32Array(data.M.teams.length);
    for (const g of train) { trTeamCnt[g[0]]++; trTeamCnt[g[1]]++; }
    for (const g of test) {
      meta.evBig.push((data.evPlayers[g[3]] || 0) >= 64);
      meta.bothCommon.push(trTeamCnt[g[0]] >= 30 && trTeamCnt[g[1]] >= 30);
    }
    const rowLine = [`  cut ${cut}->${to} (n=${test.length}${test.length < 500 ? ' UNKNOWN' : ''}):`];

    for (const v of variants) {
      const fitted = fitWithCalib(data, train, v.fn, v.ctxOpts, {segCal: !!v.segCal});
      if (fitted.model && fitted.model.wArch) lastArch = {cut, w: Array.from(fitted.model.wArch)};
      const probs = test.map(fitted.predictProb);
      const m = metricsOf(probs, ys);
      pooled[v.id].probs.push(...probs);
      pooled[v.id].ys.push(...ys);
      pooled[v.id].evs.push(...evs);
      pooled[v.id].perCut.push({cut, to, ...m});
      rowLine.push(`${v.id} acc=${(m.acc * 100).toFixed(1)}% ll=${m.ll.toFixed(4)}`);
    }
    console.log(rowLine.join(' | '));
  }

  console.log('\n=== POOLED WALK-FORWARD RESULTS (PAIRED ON EXACT SAME GAMES) ===');
  const baseP = pooled.baseline;
  const summary = {};
  for (const v of variants) {
    const p = pooled[v.id];
    const m = metricsOf(p.probs, p.ys);
    const ci = bootstrapCI(p.probs, p.ys, p.evs, v.id === 'baseline' ? null : baseP.probs);
    let verdict = 'BASELINE';
    if (v.id !== 'baseline') {
      if (m.unknown) verdict = 'UNKNOWN (<500 test games)';
      else if (ci && ci.dLlCI[1] < 0) verdict = 'KEEP (95% CI strictly beats baseline log-loss)';
      else if (ci && ci.dLlCI[0] > 0) verdict = 'REJECT (95% CI strictly worse than baseline)';
      else verdict = 'NO DIFFERENCE / REJECT (95% CI crosses 0)';
    }
    summary[v.id] = {label: v.label, metrics: m, ci, verdict, perCut: p.perCut};
    const fCI = c => c ? `[${c[0].toFixed(4)}, ${c[1].toFixed(4)}]` : 'n/a';
    const fPctCI = c => c ? `[${(c[0] * 100).toFixed(2)}%, ${(c[1] * 100).toFixed(2)}%]` : 'n/a';
    console.log(`\n${v.label} [${v.id}] -> ${verdict}`);
    console.log(`  games=${m.n}${m.unknown ? ' (UNKNOWN)' : ''} | acc=${(m.acc * 100).toFixed(2)}% ${ci ? fPctCI(ci.accCI) : ''} | ll=${m.ll.toFixed(5)} ${ci ? fCI(ci.llCI) : ''} | brier=${m.brier.toFixed(5)} ${ci ? fCI(ci.brierCI) : ''} | calSlope=${m.calSlope.toFixed(3)}`);
    if (ci && ci.dLlCI) {
      const bm = metricsOf(baseP.probs, baseP.ys);
      console.log(`  delta vs baseline: dAcc=${((m.acc - bm.acc) * 100 >= 0 ? '+' : '')}${((m.acc - bm.acc) * 100).toFixed(2)} pts ${fPctCI(ci.dAccCI)} | dLL=${(m.ll - bm.ll >= 0 ? '+' : '')}${(m.ll - bm.ll).toFixed(5)} ${fCI(ci.dLlCI)} | dBrier=${(m.brier - bm.brier >= 0 ? '+' : '')}${(m.brier - bm.brier).toFixed(5)} ${fCI(ci.dBrierCI)}`);
    }
    if (v.id.startsWith('combo-') && pooled.combo && pooled.combo.probs.length === p.probs.length) {
      const cm = metricsOf(pooled.combo.probs, pooled.combo.ys);
      const ciC = bootstrapCI(p.probs, p.ys, p.evs, pooled.combo.probs);
      const vCombo = m.unknown ? 'UNKNOWN' : (ciC && ciC.dLlCI[1] < 0 ? 'BEATS COMBO' : ciC && ciC.dLlCI[0] > 0 ? 'WORSE THAN COMBO' : 'NO ADDED VALUE');
      summary[v.id].vsCombo = {dAcc: m.acc - cm.acc, dLL: m.ll - cm.ll, ci: ciC, verdict: vCombo};
      if (ciC && ciC.dLlCI) {
        console.log(`  delta vs combo   : [${vCombo}] dAcc=${((m.acc - cm.acc) * 100 >= 0 ? '+' : '')}${((m.acc - cm.acc) * 100).toFixed(2)} pts ${fPctCI(ciC.dAccCI)} | dLL=${(m.ll - cm.ll >= 0 ? '+' : '')}${(m.ll - cm.ll).toFixed(5)} ${fCI(ciC.dLlCI)}`);
      }
    }
  }
  // Robustness splits (Rule 21: "too few teams = unknown" under 500 games)
  const slices = [
    {id: 'ev_under_64', label: 'Event size: under 64 players', mask: meta.evBig.map(b => !b)},
    {id: 'ev_64_plus', label: 'Event size: 64+ players', mask: meta.evBig},
    {id: 'teams_common_30', label: 'Team familiarity: both teams 30+ train games', mask: meta.bothCommon},
    {id: 'teams_rarer', label: 'Team familiarity: rarer team (<30 train games)', mask: meta.bothCommon.map(b => !b)},
  ];
  const robustness = {};
  if (variants.length > 1) {
    console.log('\n=== ROBUSTNESS SPLITS (PAIRED 95% CI; <500 GAMES = UNKNOWN) ===');
    for (const sl of slices) {
      const idx = [];
      for (let i = 0; i < sl.mask.length; i++) if (sl.mask[i]) idx.push(i);
      const bProbs = idx.map(i => baseP.probs[i]), bYs = idx.map(i => baseP.ys[i]), bEvs = idx.map(i => baseP.evs[i]);
      const bm = metricsOf(bProbs, bYs);
      console.log(`\n  Slice: ${sl.label} (n=${bm.n}${bm.unknown ? ' UNKNOWN' : ''}) | baseline acc=${bm.n ? (bm.acc * 100).toFixed(2) + '%' : 'n/a'} ll=${bm.n ? bm.ll.toFixed(5) : 'n/a'}`);
      robustness[sl.id] = {label: sl.label, n: bm.n, unknown: bm.unknown, baseline: bm, variants: {}};
      for (const v of variants) {
        if (v.id === 'baseline') continue;
        const p = pooled[v.id];
        const vProbs = idx.map(i => p.probs[i]);
        const vm = metricsOf(vProbs, bYs);
        const ci = !vm.unknown ? bootstrapCI(vProbs, bYs, bEvs, bProbs) : null;
        let verdict = 'UNKNOWN (<500 games)';
        if (!vm.unknown) {
          if (ci && ci.dLlCI[1] < 0) verdict = 'KEEP';
          else if (ci && ci.dLlCI[0] > 0) verdict = 'REJECT';
          else verdict = 'NO DIFFERENCE';
        }
        robustness[sl.id].variants[v.id] = {metrics: vm, ci, verdict};
        const dLL = vm.n ? (vm.ll - bm.ll) : NaN;
        const dAcc = vm.n ? (vm.acc - bm.acc) * 100 : NaN;
        const fCI = c => c ? `[${c[0].toFixed(4)}, ${c[1].toFixed(4)}]` : 'n/a';
        const fPct = c => c ? `[${(c[0] * 100).toFixed(2)}%, ${(c[1] * 100).toFixed(2)}%]` : 'n/a';
        console.log(`    ${v.id.padEnd(14)} -> ${verdict.padEnd(20)} | dAcc=${isFinite(dAcc) ? (dAcc >= 0 ? '+' : '') + dAcc.toFixed(2) + ' pts' : 'n/a'} ${ci ? fPct(ci.dAccCI) : ''} | dLL=${isFinite(dLL) ? (dLL >= 0 ? '+' : '') + dLL.toFixed(5) : 'n/a'} ${ci ? fCI(ci.dLlCI) : ''}`);
      }
    }
  }
  if (lastArch) {
    const AN = ['TrickRoom', 'Tailwind', 'Sun', 'Rain', 'Sand', 'Snow'];
    console.log(`\n=== combo-archetype learned matrix (last cut ${lastArch.cut}; logit added when row-archetype team A faces col-archetype team B; + favours A) ===`);
    let p = 0; const archPairs = [];
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) archPairs.push({a: AN[i], b: AN[j], w: lastArch.w[p++]});
    for (const r of [...archPairs].sort((x, y) => Math.abs(y.w) - Math.abs(x.w))) console.log(`  ${r.a} vs ${r.b}: ${(r.w >= 0 ? '+' : '')}${r.w.toFixed(4)}`);
    lastArch.pairs = archPairs;
  }
  return {summary, robustness, pooled, lastArch};
}

// ============================================================================
// 6. PART D: M-D DAY ONE SMALL-DATA SIMULATION (WEEKS 1-4 -> TEST WEEK 5+)
// ============================================================================
function runMdDayOneSim(data) {
  const {evDates, isSD, G} = data;
  const dates = data.M.events.map((e, i) => isSD(i) ? null : e[1]).filter(Boolean).sort();
  const start = dates[0];
  const w4End = addDays(start, 28);
  const testGames = G.filter(g => evDates[g[3]] > w4End && !isSD(g[3]));
  console.log(`\n=== PART D: M-D DAY-ONE SMALL-DATA SIMULATION (start=${start}, test > ${w4End}, testGames=${testGames.length}${testGames.length < 500 ? ' UNKNOWN' : ''}) ===`);
  if (!testGames.length) { console.log('  Not enough date span (>4 weeks) to run M-D day-one simulation.'); return null; }

  // Simulated "prior regulation" vector: fit on the FULL dataset with 35% random Gaussian noise to mimic a balance-patch shift
  // (only used to benchmark L2-SP transfer decay vs cold start; never touches test labels directly when run with a real M-C prior file).
  const fullCtx = buildContext(data, G.filter(g => evDates[g[3]] <= w4End));
  const rng = makeRng(777);
  const ys = testGames.map(g => g[2] === 1 ? 1 : 0);
  const evs = testGames.map(g => String(g[3]));

  const out = [];
  for (const wk of [1, 2, 3, 4]) {
    const cut = addDays(start, 7 * wk);
    const tr = G.filter(g => evDates[g[3]] <= cut);
    if (tr.length < 30) { console.log(`  Week ${wk} (<= ${cut}): only ${tr.length} train games (skipped)`); continue; }

    // Strategy 1: Cold start (today's model.mjs settings)
    const cold = fitWithCalib(data, tr, (d, c, gs) => fitBaseline(d, c, gs));
    const pCold = testGames.map(cold.predictProb);
    const mCold = metricsOf(pCold, ys);

    // Strategy 2: Heavy-shrinkage species-only (3x ridge, no pairs/sets until data accumulates)
    const heavy = fitWithCalib(data, tr, (d, c, gs) => fitBaseline(d, c, gs, {lb: 4 * 9, usePairs: false, useSets: false, evidK: 300}));
    const pHeavy = testGames.map(heavy.predictProb);
    const mHeavy = metricsOf(pHeavy, ys);

    // Strategy 3: Usage log-prior (shrinks each mon toward alpha * log(usage_i / mean_usage) from new-reg usage)
    const usageModel = fitWithCalib(data, tr, (d, c, gs) => {
      const cnt = new Float64Array(c.mons.length);
      for (const [A, B] of gs) for (const t of [A, B]) for (const j of c.tf[t].f) cnt[j]++;
      const meanU = (cnt.reduce((a, x) => a + x, 0) || 1) / Math.max(1, c.mons.length);
      const priorB = Float64Array.from(cnt, x => 0.12 * Math.log((x + 5) / (meanU + 5)));
      return fitBaseline(d, c, gs, {usePairs: false, useSets: false, priorB, priorLam: 12, evidK: 300});
    });
    const pUsage = testGames.map(usageModel.predictProb);
    const mUsage = metricsOf(pUsage, ys);

    // Strategy 4: L2-SP Transfer Prior with decaying weight lambda_sp = 25 / (1 + tr.length / 2500)
    // Uses week-1 usage-anchored prior + simulated noisy prior if no external --prior-model=out/model_mc.json is given.
    const priorPath = arg('prior-model', '');
    let extPrior = null;
    if (priorPath && fs.existsSync(priorPath)) extPrior = JSON.parse(fs.readFileSync(priorPath, 'utf8')).mons || null;
    const l2sp = fitWithCalib(data, tr, (d, c, gs) => {
      const priorB = new Float64Array(c.mons.length);
      if (extPrior) {
        for (let j = 0; j < c.mons.length; j++) priorB[j] = extPrior[c.mons[j]] || 0;
      } else {
        // Fallback self-contained prior from week-1 raw win rates shrunk strongly (keeps simulation strictly causal).
        const w = new Float64Array(c.mons.length), g = new Float64Array(c.mons.length);
        for (const [A, B, r] of tr) { for (const j of c.tf[A].f) { w[j] += r; g[j]++; } for (const j of c.tf[B].f) { w[j] += 1 - r; g[j]++; } }
        for (let j = 0; j < c.mons.length; j++) priorB[j] = 0.25 * Math.log((w[j] + 15) / (g[j] - w[j] + 15));
      }
      const lam = 25 / (1 + gs.length / 2500);
      return fitBaseline(d, c, gs, {usePairs: gs.length >= 1500, useSets: gs.length >= 2500, priorB, priorLam: lam, evidK: 300});
    });
    const pL2sp = testGames.map(l2sp.predictProb);
    const mL2sp = metricsOf(pL2sp, ys);

    const ciH = bootstrapCI(pHeavy, ys, evs, pCold);
    const ciU = bootstrapCI(pUsage, ys, evs, pCold);
    const ciL = bootstrapCI(pL2sp, ys, evs, pCold);
    console.log(`  Week ${wk} (train=${tr.length} games <= ${cut}):`);
    console.log(`    cold-start : acc=${(mCold.acc * 100).toFixed(2)}% ll=${mCold.ll.toFixed(5)} brier=${mCold.brier.toFixed(5)} cal=${mCold.calSlope.toFixed(3)}`);
    console.log(`    heavy-ridge: acc=${(mHeavy.acc * 100).toFixed(2)}% ll=${mHeavy.ll.toFixed(5)} dLL=${(mHeavy.ll - mCold.ll).toFixed(5)} ${ciH ? `[${ciH.dLlCI[0].toFixed(5)}, ${ciH.dLlCI[1].toFixed(5)}]` : ''}`);
    console.log(`    usage-prior: acc=${(mUsage.acc * 100).toFixed(2)}% ll=${mUsage.ll.toFixed(5)} dLL=${(mUsage.ll - mCold.ll).toFixed(5)} ${ciU ? `[${ciU.dLlCI[0].toFixed(5)}, ${ciU.dLlCI[1].toFixed(5)}]` : ''}`);
    console.log(`    l2-sp-decay: acc=${(mL2sp.acc * 100).toFixed(2)}% ll=${mL2sp.ll.toFixed(5)} dLL=${(mL2sp.ll - mCold.ll).toFixed(5)} ${ciL ? `[${ciL.dLlCI[0].toFixed(5)}, ${ciL.dLlCI[1].toFixed(5)}]` : ''}`);
    out.push({week: wk, cut, trainGames: tr.length, cold: mCold, heavy: mHeavy, usage: mUsage, l2sp: mL2sp});
  }
  return out;
}

// ============================================================================
// 7. BASELINE REPRODUCTION CHECK (--verify-baseline)
//    Spawns model.mjs on the exact same 80/20 split (read-only temp MODEL_OUT)
//    and fails (exit 1) if raw acc, raw log-loss, or calibrated log-loss differ > 1e-4.
// ============================================================================
function verifyBaselineRepro(data) {
  const {evDates, G} = data;
  const order = [...evDates.keys()].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1);
  const lo = Math.floor(order.length * 0.8);
  const before = new Set(order.slice(0, lo)), cut = new Set(order.slice(lo));
  const train = G.filter(g => before.has(g[3])), test = G.filter(g => cut.has(g[3]));
  // Use full-G context ONLY in this check to match model.mjs's exact vocabulary for bit-level verification.
  const ctx = buildContext(data, G);
  const m = fitBaseline(data, ctx, train);
  const ys = test.map(g => g[2] === 1 ? 1 : 0);
  const rawProbs = test.map(g => sig(m.predictLogit(g[0], g[1], g[7], g[8])));
  const calSlope = fitCalib(m, test);
  const calProbs = test.map(g => sig(calSlope * m.predictLogit(g[0], g[1], g[7], g[8])));
  const mr = metricsOf(rawProbs, ys), mc = metricsOf(calProbs, ys);

  const K = data.S.shrink ?? 3, half = data.S.half ?? 14, skill = data.S.skill ?? 1, sets = data.S.sets ?? 60;
  const fastSpec = `${K},${half},${skill},${sets}`;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'v3lab-verify-'));
  const tmpModelOut = path.join(tmpDir, 'model_verify.json');
  const rootDir = path.dirname(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));
  let ev = null;
  try {
    const env = {
      ...process.env,
      MATCHES: path.resolve(MATCHES_PATH),
      MODEL_OUT: tmpModelOut,
      TRAIN_ONLY: '1',
      FAST: fastSpec,
      ITERS: String(ITERS),
    };
    const stdout = execFileSync(process.execPath, [path.join(rootDir, 'model.mjs')], {cwd: rootDir, env, encoding: 'utf8'});
    if (fs.existsSync(tmpModelOut)) {
      ev = JSON.parse(fs.readFileSync(tmpModelOut, 'utf8')).eval;
    } else {
      const mEv = stdout.match(/held-out test (\{.*\})/);
      if (mEv) ev = JSON.parse(mEv[1]);
    }
  } finally {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  }
  if (!ev || !ev.model_teams_only) {
    console.error('FAIL --verify-baseline: could not read held-out eval from model.mjs');
    process.exit(1);
  }
  const mAcc = ev.model_teams_only.acc;
  const mLL = ev.model_teams_only.logloss;
  const mCalLL = ev.model_teams_only_calibrated ? ev.model_teams_only_calibrated.logloss : null;
  const mSlope = ev.model_teams_only_calibrated ? ev.model_teams_only_calibrated.slope : null;
  const vAcc = +mr.acc.toFixed(4), vLL = +mr.ll.toFixed(4), vCalLL = +mc.ll.toFixed(4), vSlope = +calSlope.toFixed(3);
  const dAcc = Math.abs(vAcc - mAcc), dLL = Math.abs(vLL - mLL);
  const dCalLL = mCalLL != null ? Math.abs(vCalLL - mCalLL) : 0;
  const dSlope = mSlope != null ? Math.abs(vSlope - mSlope) : 0;
  const TOL = 1e-4;
  const ok = dAcc <= TOL && dLL <= TOL && dCalLL <= TOL && dSlope <= 1e-3;

  console.log(`\n=== BASELINE REPRODUCTION PROOF (v3-lab vs model.mjs on same 80/20 split; FAST=${fastSpec}) ===`);
  console.log(`  Metric         | v3-lab   | model.mjs | |diff|   | limit`);
  console.log(`  ---------------+----------+-----------+----------+-------`);
  console.log(`  train / test   | ${train.length}/${test.length} | ${ev.train_games}/${ev.test_games}   | exact    | exact`);
  console.log(`  raw acc        | ${vAcc.toFixed(4)}   | ${mAcc.toFixed(4)}    | ${dAcc.toFixed(5)}  | <= 0.0001`);
  console.log(`  raw log-loss   | ${vLL.toFixed(4)}   | ${mLL.toFixed(4)}    | ${dLL.toFixed(5)}  | <= 0.0001`);
  if (mCalLL != null) console.log(`  cal log-loss   | ${vCalLL.toFixed(4)}   | ${mCalLL.toFixed(4)}    | ${dCalLL.toFixed(5)}  | <= 0.0001`);
  if (mSlope != null) console.log(`  cal slope      | ${vSlope.toFixed(3)}    | ${mSlope.toFixed(3)}     | ${dSlope.toFixed(4)}   | <= 0.001`);
  console.log(`  VERDICT: ${ok ? 'PASS (baseline proven identical within 1e-4)' : 'FAIL (baseline diverged > 1e-4)'}`);
  if (!ok) process.exit(1);
}


// ============================================================================
// 8. PART D (JOB 26): FALSIFICATION SUITE FOR COMBO
//    --falsify-shuffle : Permute team/deck labels within each event; combo gain must vanish.
//    --falsify-reverse : Time-reversed split (train later, test earlier; diagnostic ONLY, not primary evidence).
//    --falsify-loeo    : Leave-one-event-out influence on pooled combo vs baseline predictions.
// ============================================================================
function falsifySpec(id) {
  const v = buildVariants(ALL_IDEAS).find(x => x.id === id);
  if (!v) throw new Error(`--falsify-pair: unknown variant id "${id}"`);
  return (d, trainGames) => fitWithCalib(d, trainGames, v.fn, v.ctxOpts, {segCal: !!v.segCal});
}

function runFalsifyShuffle(data) {
  const {evDates, isSD, G} = data;
  const rng = makeRng(4242);
  // Group games by event, collect all (team, deck) appearances within each event, shuffle them, and reassign
  const byEv = new Map();
  for (let i = 0; i < G.length; i++) {
    const e = G[i][3];
    if (!byEv.has(e)) byEv.set(e, []);
    byEv.get(e).push(i);
  }
  const shufG = G.map(g => g.slice());
  for (const idxs of byEv.values()) {
    const pool = [];
    for (const i of idxs) { pool.push([G[i][0], G[i][7]]); pool.push([G[i][1], G[i][8]]); }
    for (let k = pool.length - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1));
      const tmp = pool[k]; pool[k] = pool[j]; pool[j] = tmp;
    }
    let p = 0;
    for (const i of idxs) {
      shufG[i][0] = pool[p][0]; shufG[i][7] = pool[p][1]; p++;
      shufG[i][1] = pool[p][0]; shufG[i][8] = pool[p][1]; p++;
    }
  }
  const shufData = {...data, G: shufG.filter(g => g[0] !== g[1])};
  const tourDates = data.M.events.map((e, i) => isSD(i) ? null : e[1]).filter(Boolean).sort();
  const maxDate = tourDates[tourDates.length - 1];
  const cuts = [];
  for (let k = WEEKS; k >= 1; k--) cuts.push(addDays(maxDate, -7 * k));
  const pBase = [], pCombo = [], ys = [], evs = [];
  for (const cut of cuts) {
    const to = addDays(cut, 7);
    const tr = shufData.G.filter(g => evDates[g[3]] <= cut);
    const te = shufData.G.filter(g => evDates[g[3]] > cut && evDates[g[3]] <= to && !isSD(g[3]));
    if (!tr.length || !te.length) continue;
    const fB = falsifySpec(FALSIFY_REF)(shufData, tr);
    const fC = falsifySpec(FALSIFY_CHAL)(shufData, tr);
    for (const g of te) {
      pBase.push(fB.predictProb(g)); pCombo.push(fC.predictProb(g));
      ys.push(g[2] === 1 ? 1 : 0); evs.push(`${cut}:${g[3]}`);
    }
  }
  const mb = metricsOf(pBase, ys), mc = metricsOf(pCombo, ys);
  const ci = bootstrapCI(pCombo, ys, evs, pBase);
  const dLL = mc.ll - mb.ll, dAcc = (mc.acc - mb.acc) * 100;
  const vanished = mb.unknown || (ci && ci.dLlCI[1] >= 0) || Math.abs(dLL) <= 0.0003;
  console.log('\n=== FALSIFICATION 1: WITHIN-EVENT TEAM-LABEL SHUFFLE ===');
  console.log(`  games=${mb.n}${mb.unknown ? ' (UNKNOWN)' : ''} | ${FALSIFY_REF} ll=${mb.ll.toFixed(5)} acc=${(mb.acc * 100).toFixed(2)}% | ${FALSIFY_CHAL} ll=${mc.ll.toFixed(5)} acc=${(mc.acc * 100).toFixed(2)}%`);
  console.log(`  ${FALSIFY_CHAL} - ${FALSIFY_REF}: dAcc=${(dAcc >= 0 ? '+' : '')}${dAcc.toFixed(2)} pts | dLL=${(dLL >= 0 ? '+' : '')}${dLL.toFixed(5)} ${ci ? `[${ci.dLlCI[0].toFixed(4)}, ${ci.dLlCI[1].toFixed(4)}]` : ''}`);
  console.log(`  VERDICT: ${vanished ? `PASS (${FALSIFY_CHAL} gain vanished under shuffled team labels)` : `FAIL (spurious ${FALSIFY_CHAL} gain persisted under shuffle!)`}`);
  return {pair: {challenger: FALSIFY_CHAL, reference: FALSIFY_REF}, games: mb.n, baseline: mb, combo: mc, dLL, dAcc, ci, pass: vanished};
}

function runFalsifyReverse(data) {
  const {evDates, isSD, G} = data;
  const tourDates = data.M.events.map((e, i) => isSD(i) ? null : e[1]).filter(Boolean).sort();
  const minDate = tourDates[0];
  const cuts = [];
  for (let k = 1; k <= WEEKS; k++) cuts.push(addDays(minDate, 7 * k));
  const pBase = [], pCombo = [], ys = [], evs = [];
  for (const cut of cuts) {
    const from = addDays(cut, -7);
    // Time-reversed: train strictly AFTER cut, test strictly BEFORE/ON cut in (from, cut]
    const tr = G.filter(g => evDates[g[3]] > cut);
    const te = G.filter(g => evDates[g[3]] > from && evDates[g[3]] <= cut && !isSD(g[3]));
    if (tr.length < 100 || !te.length) continue;
    const fB = falsifySpec(FALSIFY_REF)(data, tr);
    const fC = falsifySpec(FALSIFY_CHAL)(data, tr);
    for (const g of te) {
      pBase.push(fB.predictProb(g)); pCombo.push(fC.predictProb(g));
      ys.push(g[2] === 1 ? 1 : 0); evs.push(`${cut}:${g[3]}`);
    }
  }
  const mb = metricsOf(pBase, ys), mc = metricsOf(pCombo, ys);
  const ci = bootstrapCI(pCombo, ys, evs, pBase);
  const dLL = mc.ll - mb.ll, dAcc = (mc.acc - mb.acc) * 100;
  console.log('\n=== FALSIFICATION 2: TIME-REVERSED SPLIT (DIAGNOSTIC ONLY — NOT PRIMARY EVIDENCE) ===');
  console.log(`  games=${mb.n}${mb.unknown ? ' (UNKNOWN)' : ''} | ${FALSIFY_REF} ll=${mb.ll.toFixed(5)} acc=${(mb.acc * 100).toFixed(2)}% | ${FALSIFY_CHAL} ll=${mc.ll.toFixed(5)} acc=${(mc.acc * 100).toFixed(2)}%`);
  console.log(`  ${FALSIFY_CHAL} - ${FALSIFY_REF}: dAcc=${(dAcc >= 0 ? '+' : '')}${dAcc.toFixed(2)} pts | dLL=${(dLL >= 0 ? '+' : '')}${dLL.toFixed(5)} ${ci ? `[${ci.dLlCI[0].toFixed(4)}, ${ci.dLlCI[1].toFixed(4)}]` : ''}`);
  return {pair: {challenger: FALSIFY_CHAL, reference: FALSIFY_REF}, games: mb.n, baseline: mb, combo: mc, dLL, dAcc, ci};
}

function runFalsifyLOEO(data, pooled) {
  if (!pooled || !pooled[FALSIFY_REF] || !pooled[FALSIFY_CHAL] || !pooled[FALSIFY_CHAL].probs.length) {
    console.log('\n=== FALSIFICATION 3: LEAVE-ONE-EVENT-OUT INFLUENCE ===');
    console.log(`  Skipped: include \`${FALSIFY_CHAL}\` and \`${FALSIFY_REF}\` in --ideas to run leave-one-event-out influence.`);
    return null;
  }
  const bP = pooled[FALSIFY_REF].probs, cP = pooled[FALSIFY_CHAL].probs, ys = pooled[FALSIFY_REF].ys, evs = pooled[FALSIFY_REF].evs;
  const N = ys.length;
  const byEv = new Map();
  let totBaseLL = 0, totComboLL = 0;
  for (let i = 0; i < N; i++) {
    const y = ys[i];
    const pb = Math.min(1 - 1e-9, Math.max(1e-9, bP[i]));
    const pc = Math.min(1 - 1e-9, Math.max(1e-9, cP[i]));
    const lb = -(y ? Math.log(pb) : Math.log(1 - pb));
    const lc = -(y ? Math.log(pc) : Math.log(1 - pc));
    totBaseLL += lb; totComboLL += lc;
    const evId = evs[i].split(':')[1];
    let o = byEv.get(evId); if (!o) byEv.set(evId, o = {evIdx: +evId, id: (data.M.events[+evId] || ['?'])[0], date: (data.M.events[+evId] || ['', ''])[1], n: 0, sumBaseLL: 0, sumComboLL: 0});
    o.n++; o.sumBaseLL += lb; o.sumComboLL += lc;
  }
  const totalDeltaLL = (totComboLL - totBaseLL) / N;
  const rows = [...byEv.values()].map(o => {
    const loeoDeltaLL = ((totComboLL - o.sumComboLL) - (totBaseLL - o.sumBaseLL)) / Math.max(1, N - o.n);
    const contrib = (o.sumComboLL - o.sumBaseLL) / N;
    return {...o, contrib, loeoDeltaLL, shareOfGain: totalDeltaLL < 0 ? (contrib / totalDeltaLL) : 0};
  }).sort((a, b) => a.contrib - b.contrib); // most negative = most favorable to combo
  const topFav = rows[0];
  const broad = !(totalDeltaLL < 0 && topFav && topFav.shareOfGain > 0.25);
  console.log(`\n=== FALSIFICATION 3: LEAVE-ONE-EVENT-OUT INFLUENCE (${FALSIFY_CHAL.toUpperCase()} VS ${FALSIFY_REF.toUpperCase()}) ===`);
  console.log(`  events=${rows.length}, games=${N}, pooled dLL=${totalDeltaLL.toFixed(5)}`);
  if (topFav) {
    console.log(`  Most favorable single event: ${topFav.id} (${topFav.date}, n=${topFav.n}) contrib=${topFav.contrib.toFixed(5)} (${(topFav.shareOfGain * 100).toFixed(1)}% of total gain) | dLL without it=${topFav.loeoDeltaLL.toFixed(5)}`);
  }
  console.log(`  Top 5 most favorable events to ${FALSIFY_CHAL}:`);
  for (const r of rows.slice(0, 5)) console.log(`    ${r.id} (${r.date}, n=${r.n}): contrib=${r.contrib.toFixed(5)} (${(r.shareOfGain * 100).toFixed(1)}%), loeo_dLL=${r.loeoDeltaLL.toFixed(5)}`);
  console.log(`  Top 5 least favorable events to ${FALSIFY_CHAL}:`);
  for (const r of rows.slice(-5).reverse()) console.log(`    ${r.id} (${r.date}, n=${r.n}): contrib=${r.contrib.toFixed(5)}, loeo_dLL=${r.loeoDeltaLL.toFixed(5)}`);
  console.log(`  VERDICT: ${broad ? `PASS (no single event drives >25% of ${FALSIFY_CHAL} gain)` : `WARN (single event drives >25% of ${FALSIFY_CHAL} gain!)`}`);
  return {pair: {challenger: FALSIFY_CHAL, reference: FALSIFY_REF}, events: rows.length, games: N, totalDeltaLL, maxShare: topFav ? topFav.shareOfGain : 0, loeoWorstDrop: topFav ? topFav.loeoDeltaLL : totalDeltaLL, pass: broad, top5Fav: rows.slice(0, 5), top5Unfav: rows.slice(-5).reverse()};
}

// ============================================================================
// MAIN
// ============================================================================
const data = loadData(MATCHES_PATH, SETTINGS_PATH);
console.log(`v3-lab loaded ${MATCHES_PATH}: ${data.G.length} decided games, ${data.M.events.length} events, ${data.M.teams.length} teams, ${data.M.players} players, hasSets=${data.hasSets}`);

if (VERIFY_BASELINE) verifyBaselineRepro(data);

const wfOut = IDEAS.length || !VERIFY_BASELINE ? runWalkForward(data) : {summary: {}, robustness: {}};

// Separate Best-of-3 section (CLAUDE.md Rule 21)
console.log('\n=== BEST-OF-3 SECTION (SEPARATE PER CLAUDE.md RULE 21) ===');
if (!data.bo3Info.available) {
  console.log(`  Not available: ${MATCHES_PATH} does not distinguish single games from best-of-3 sets (eventFormat=${data.bo3Info.hasEventFormat}, gameFlag=${data.bo3Info.hasGameFlag}, multiGameRounds=${data.bo3Info.dupRounds}).`);
  console.log('  Per CLAUDE.md Rule 21, Bo3 evaluation stays separate until update.mjs tags Bo3 sets.');
} else {
  console.log(`  Detected Bo3 markers (${JSON.stringify(data.bo3Info)}). Filter Bo3 sets separately before evaluating.`);
}

const mdSummary = RUN_MD_SIM ? runMdDayOneSim(data) : null;

const falsify = {};
if (FALSIFY_SHUFFLE) falsify.shuffle = runFalsifyShuffle(data);
if (FALSIFY_REVERSE) falsify.reverse = runFalsifyReverse(data);
if (FALSIFY_LOEO) falsify.loeo = runFalsifyLOEO(data, wfOut.pooled);

if (JSON_OUT) {
  fs.writeFileSync(JSON_OUT, JSON.stringify({wfSummary: wfOut.summary, robustness: wfOut.robustness, mdSummary, falsify, archMatrix: wfOut.lastArch || null, bo3Info: data.bo3Info}, null, 2));
  console.log(`\nWrote ${JSON_OUT}`);
}
