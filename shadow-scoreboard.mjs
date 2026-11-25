// Shadow scoreboard (Kip job 24, Part 3; rule 21 gate 3):
// Each day, grades yesterday's real games (the latest completed event date < today, or SHADOW_DATE)
// with BOTH out/model.json (live) and out/model_shadow.json (shadow "combo"), and appends the paired
// daily comparison per regulation to out/shadow_scoreboard.json. Never touches out/model.json or any page file.
import fs from 'node:fs';
import {activeReg, SITE_REG} from './formats.mjs';

const rd = (f, d = null) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const sig = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));

export function scoreModelOnGames(model, matches, games) {
  const teams = (matches.teams || []).map(k => k.split('|'));
  const feats = matches.feats || [];
  const decks = matches.decks || [];
  const monsW = model.mons || {};
  const pairsW = model.pairs || {};
  const setsW = model.sets || {};
  const setFreq = model.setFreq || {};
  const setRange = model.setRange || {};
  const sixDelta = model.sixDelta || {};
  const bc = model.bc || null;
  const calib = Number.isFinite(model.calib) ? model.calib : 1;

  const spF = new Map();
  for (const k of Object.keys(setsW)) {
    const sp = k.split(/[@#:]/)[0];
    if (!spF.has(sp)) spF.set(sp, []);
    spF.get(sp).push(k);
  }

  const teamX = (tIdx, dIdx) => {
    const m = teams[tIdx] || [];
    let v = 0;
    for (const n of m) v += monsW[n] || 0;
    for (let i = 0; i < m.length; i++) {
      for (let j = i + 1; j < m.length; j++) {
        const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i];
        v += pairsW[k] || 0;
      }
    }
    if (model.center && dIdx != null && Array.isArray(decks[dIdx])) {
      const has = new Set(decks[dIdx].map(fi => feats[fi]));
      for (const n of m) {
        const fk = spF.get(n);
        if (!fk) continue;
        let u = 0;
        for (const k of fk) u += setsW[k] * ((has.has(k) ? 1 : 0) - (setFreq[k] || 0));
        const r = setRange[n];
        v += r ? Math.max(r[0], Math.min(r[1], u)) : u;
      }
    }
    const tk = matches.teams[tIdx];
    if (tk && sixDelta[tk]) v += sixDelta[tk];
    return v;
  };

  const bcDot = (tA, tB) => {
    if (!bc || !bc.u || !bc.v || !bc.d) return 0;
    const D = bc.d, mA = teams[tA] || [], mB = teams[tB] || [];
    let val = 0;
    for (let d = 0; d < D; d++) {
      let uA = 0, vA = 0, uB = 0, vB = 0;
      for (const n of mA) { const u = bc.u[n], v = bc.v[n]; if (u) uA += u[d] || 0; if (v) vA += v[d] || 0; }
      for (const n of mB) { const u = bc.u[n], v = bc.v[n]; if (u) uB += u[d] || 0; if (v) vB += v[d] || 0; }
      val += (uA * vB - uB * vA) / 6;
    }
    return val;
  };

  let ll = 0, acc = 0, n = 0;
  for (const g of games) {
    const [A, B, r, , , , , dA, dB] = g;
    if (r === 0.5 || A === B) continue;
    const eta = teamX(A, dA) - teamX(B, dB) + bcDot(A, B);
    const p = sig(calib * eta);
    ll -= r * Math.log(Math.max(1e-12, p)) + (1 - r) * Math.log(Math.max(1e-12, 1 - p));
    acc += (p > 0.5) === (r === 1) ? 1 : 0;
    n++;
  }
  return n ? {games: n, acc: +(acc / n).toFixed(4), logloss: +(ll / n).toFixed(4)} : null;
}

export function runShadowScoreboard({
  matchesPath = process.env.MATCHES || 'out/matches.json',
  livePath = process.env.MODEL_LIVE || 'out/model.json',
  shadowPath = process.env.MODEL_SHADOW_OUT || 'out/model_shadow.json',
  outPath = process.env.SHADOW_SCOREBOARD_OUT || 'out/shadow_scoreboard.json',
  today = process.env.SHADOW_TODAY || new Date().toISOString().slice(0, 10),
  targetDate = process.env.SHADOW_DATE || null
} = {}) {
  const MM = rd(matchesPath), live = rd(livePath), shadow = rd(shadowPath);
  if (!MM || !live || !shadow) {
    console.log('shadow-scoreboard: missing matches.json, model.json, or model_shadow.json; skipping');
    return null;
  }
  const reg = MM.reg || activeReg().id;
  const same = d => d && (!d.reg || d.reg === reg);
  if (!same(live) || !same(shadow) || !live.ships || !shadow.ships) {
    console.log(`shadow-scoreboard: model reg mismatch or unshipped for ${reg}; skipping`);
    return null;
  }
  const evDates = (MM.events || []).map(e => e[1]);
  const decided = (MM.m || []).filter(g => g[2] !== 0.5 && g[0] !== g[1]);
  let gradeDate = targetDate;
  if (!gradeDate) {
    const pastDates = [...new Set(decided.map(g => evDates[g[3]]).filter(d => d && d < today))].sort();
    gradeDate = pastDates[pastDates.length - 1] || null;
  }
  if (!gradeDate) {
    console.log('shadow-scoreboard: no completed prior-day games found; skipping');
    return null;
  }
  const dayGames = decided.filter(g => evDates[g[3]] === gradeDate);
  if (!dayGames.length) {
    console.log(`shadow-scoreboard: 0 decided games on ${gradeDate}; skipping`);
    return null;
  }
  const liveScore = scoreModelOnGames(live, MM, dayGames);
  const shadowScore = scoreModelOnGames(shadow, MM, dayGames);
  const row = {
    date: gradeDate,
    scoredAt: today,
    reg,
    games: liveScore.games,
    live: {acc: liveScore.acc, logloss: liveScore.logloss},
    shadow: {name: shadow.shadow || 'combo', acc: shadowScore.acc, logloss: shadowScore.logloss},
    delta: {
      acc: +(shadowScore.acc - liveScore.acc).toFixed(4),
      logloss: +(shadowScore.logloss - liveScore.logloss).toFixed(4)
    }
  };
  const prev = rd(outPath, {byReg: {}});
  const byReg = prev.byReg && typeof prev.byReg === 'object' ? {...prev.byReg} : {};
  if (!Object.keys(byReg).length && Array.isArray(prev.history) && prev.history.length) byReg[prev.reg || SITE_REG.id] = prev.history;
  const hist = (Array.isArray(byReg[reg]) ? byReg[reg] : []).filter(h => h.date !== gradeDate);
  byReg[reg] = [...hist, row].sort((a, b) => a.date.localeCompare(b.date)).slice(-365);
  const payload = {updated: new Date().toISOString(), reg, latest: row, byReg, history: byReg[reg]};
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 1));
  console.log('shadow-scoreboard', JSON.stringify(row));
  return payload;
}

if (import.meta.url === `file://${process.argv[1]}`) runShadowScoreboard();
