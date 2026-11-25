// experiments/kip35-real-check.mjs (Kip job 35 check, Nov 25)
// Is Kip's BASELINE (his own re-implementation in experiments/kip35-zero-center-eb.mjs) a fair stand-in for the real model.mjs?
// And does his variant beat the REAL model when it starts from the real model's settings?
// For each of Kip's 4 windows (cuts 2026-10-28 / 11-04 / 11-11 / 11-18; the last window runs to 11-26 as in his script):
//   - out/matches.json is cut to events before the cut (renumbered, as experiments/walk-forward.mjs does)
//   - the REAL model.mjs is trained on it (MATCHES=..., MODEL_OUT=...), exactly as production would on that day
//     (locked settings, its own 80/20 calibration split, sets on/off choice, set clamps, shipped pairs)
//   - the VARIANT is experiments/kip35-model-variant.mjs with MODEL_VARIANT=kip (a copy of model.mjs, Kip's change on top)
//   - both are scored on the window's games the way the page does: P = sig(calib * (x(A) - x(B))), x from the written
//     model file (Pokemon + shipped pairs + each member's set clamped to setRange + team basics), as experiments/board.mjs
// Same scoring as Kip's script: log-loss clamped at 1e-12, accuracy = P > .5 picks the winner, event-clustered bootstrap
// (1000 resamples, same seed 42, keys "cut:event") on the paired log-loss difference (variant - real).
// Also: Kip's unseen-6-Pokemon team score and his week-1 stress test (first 5 events -> events 6-7), for both.
// Usage (repo root): node experiments/kip35-real-check.mjs        env: WORK=<dir for temp files>, REUSE=1 keeps fitted models
// Writes only into WORK (default out/kip35-check/). Never touches out/model.json.
import fs from 'node:fs'; import {execFileSync} from 'node:child_process';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const WORK = (process.env.WORK || ROOT + 'out/kip35-check').replace(/\/?$/, '/'); fs.mkdirSync(WORK, {recursive: true});
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || ROOT + 'out/matches.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), evDates = M.events.map(e => e[1]);
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
const sig = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
const ll1 = (p, r) => { const q = Math.min(1 - 1e-12, Math.max(1e-12, p)); return -(r * Math.log(q) + (1 - r) * Math.log(1 - q)); };
const cutFile = keepEv => { const keep = [...keepEv].sort((a, b) => a - b), nu = new Map(keep.map((o, n) => [o, n])), C = {...M};
  C.m = M.m.filter(g => nu.has(g[3])).map(g => { const h = g.slice(); h[3] = nu.get(g[3]); return h; }); C.events = keep.map(i => M.events[i]); return C; };
const KINDS = {real: ['model.mjs', {}], copy: ['experiments/kip35-model-variant.mjs', {}], variant: ['experiments/kip35-model-variant.mjs', {MODEL_VARIANT: 'kip'}]};
function train(tag, kind, keepEv) {
  const mt = WORK + `model-${tag}-${kind}.json`;
  if (process.env.REUSE === '1' && fs.existsSync(mt)) return JSON.parse(fs.readFileSync(mt, 'utf8'));
  const mf = WORK + `matches-${tag}.json`; if (!fs.existsSync(mf)) fs.writeFileSync(mf, JSON.stringify(cutFile(keepEv)));
  if (fs.existsSync(mt)) fs.unlinkSync(mt);
  const [script, env] = KINDS[kind], t0 = Date.now();
  let o = ''; try { o = execFileSync('node', [script], {cwd: ROOT, env: {...process.env, ...env, MATCHES: mf, MODEL_OUT: mt, TRAIN_ONLY: '', TEST_DATE: '', MODEL_SHADOW: ''}, encoding: 'utf8', maxBuffer: 1 << 28}); }
  catch (e) { o = String(e.stdout || '') + String(e.stderr || ''); }
  const last = o.trim().split('\n').filter(l => l.startsWith('model:')).pop() || o.trim().split('\n').pop();
  console.log(`  [${tag} ${kind}] ${((Date.now() - t0) / 1000).toFixed(0)}s: ${last}`);
  return JSON.parse(fs.readFileSync(mt, 'utf8'));
}
// team x the way the page computes it (same as experiments/board.mjs pairX + setX, clamped)
function scorer(MT) {
  const spF = new Map(); for (const f of Object.keys(MT.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
  const T = MT.team || {};
  return (t, d) => { const m = teams[t]; let v = 0;
    if (T.noMega && !m.some(n => /-Mega/.test(n))) v += T.noMega;
    if (T.protectLow && d != null && M.decks[d]) { const f = M.decks[d].map(j => M.feats[j]); if (f.filter(n => n.includes(':')).length >= 16 && m.filter(n => f.includes(n + ':Protect')).length <= 2) v += T.protectLow; }
    for (const n of m) v += MT.mons[n] || 0;
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) v += (MT.pairs || {})[m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]] || 0;
    if (d != null && M.decks[d]) { const has = new Set(M.decks[d].map(f => M.feats[f]));
      for (const n of m) { let u = 0; for (const f of spF.get(n) || []) u += MT.sets[f] * ((has.has(f) ? 1 : 0) - ((MT.setFreq || {})[f] || 0)); const r = (MT.setRange || {})[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; } }
    return v; };
}
const ssUnseen = MT => { const p = sig(MT.calib * (0 - MT.meanX)); return Math.max(0, Math.min(100, 80 + 122 * (p - .5))); }; // Kip's formula
// the page's own version (app/src/app/60-concept-h.js CH.fieldWin + SS_MID 80 / SS_K 122): chance against the 101 real-team points in dist.q
const ssUnseenPage = MT => { const q = (MT.dist || {}).q; if (!q) return NaN; const e = q.reduce((a, v) => a + sig(MT.calib * (0 - v)), 0) / q.length; return Math.max(0, Math.min(100, 80 + 122 * (e - .5))); };
const cuts = [['2026-10-28', '2026-11-04'], ['2026-11-04', '2026-11-11'], ['2026-11-11', '2026-11-18'], ['2026-11-18', '2026-11-26']];
const kinds = (process.env.KINDS || 'real,variant').split(',');
const tot = Object.fromEntries(kinds.map(k => [k, {ll: 0, acc: 0}])); let N = 0; const evD = new Map(), lines = []; let lastMT = {};
const say = s => { console.log(s); lines.push(s); };
say(`=== kip35-real-check (matches=${G.length}, updated=${M.updated}) ===`);
for (const [from, to] of cuts) {
  const keepEv = new Set(M.events.map((e, i) => e[1] < from ? i : -1).filter(i => i >= 0));
  const test = G.filter(g => evDates[g[3]] >= from && evDates[g[3]] < to);
  const MT = {}, X = {}; for (const k of kinds) { MT[k] = train(from, k, keepEv); X[k] = scorer(MT[k]); }
  const w = Object.fromEntries(kinds.map(k => [k, {ll: 0, acc: 0}]));
  for (const [A, B, r, ev, , , , dA, dB] of test) { const p = {};
    for (const k of kinds) { p[k] = sig(MT[k].calib * (X[k](A, dA) - X[k](B, dB))); const l = ll1(p[k], r); w[k].ll += l; tot[k].ll += l; const a = (p[k] > .5) === (r === 1) ? 1 : 0; w[k].acc += a; tot[k].acc += a; }
    if (kinds.includes('variant') && kinds.includes('real')) { const key = from + ':' + ev; if (!evD.has(key)) evD.set(key, []); evD.get(key).push(ll1(p.variant, r) - ll1(p.real, r)); } }
  N += test.length;
  say(`  ${from}..${to} (${test.length}g): ` + kinds.map(k => `${k} ll=${(w[k].ll / test.length).toFixed(5)} acc=${(100 * w[k].acc / test.length).toFixed(2)}% (cal=${MT[k].calib}, ships=${MT[k].ships}, sets=${Object.keys(MT[k].sets || {}).length}, meanX=${MT[k].meanX})`).join(' | ')
    + (kinds.includes('variant') ? ` | delta=${((w.variant.ll - w.real.ll) / test.length).toFixed(5)}` : ''));
  lastMT = MT;
}
say('\n--- Pooled ---'); say(`  Games: ${N} across ${evD.size} events`);
for (const k of kinds) say(`  ${k}: ll=${(tot[k].ll / N).toFixed(5)} acc=${(100 * tot[k].acc / N).toFixed(2)}%`);
const boot = keys => { let st = 42; const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; }; const S = [];
  for (let b = 0; b < 1000; b++) { let s = 0, n = 0; for (let i = 0; i < keys.length; i++) { const a = evD.get(keys[Math.floor(rnd() * keys.length)]); for (const x of a) { s += x; n++; } } S.push(s / n); }
  S.sort((a, b) => a - b); return [S[25], S[975]]; };
if (evD.size) { const keys = [...evD.keys()], [lo, hi] = boot(keys), d = (tot.variant.ll - tot.real.ll) / N;
  // sealed set (experiments/sealed.json): events on/after its 'from' are meant for end-of-phase checks only; show the dev-only part
  const SL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from, dk = keys.filter(k => evDates[+k.split(':')[1]] < SL);
  if (dk.length) { const [a2, b2] = boot(dk), arr = dk.flatMap(k => evD.get(k)); say(`  Dev-only part (events before the sealed date ${SL}): ${arr.length} games, ${dk.length} events, delta ${(arr.reduce((a, x) => a + x, 0) / arr.length).toFixed(5)} [95% CI ${a2.toFixed(5)} to ${b2.toFixed(5)}]`); }
  say(`  Delta (variant - real): ${d.toFixed(5)}  [95% event-clustered CI: ${lo.toFixed(5)} to ${hi.toFixed(5)}]`);
  say(`  Rule 21 verdict: ${hi < 0 ? 'KEEP (95% CI strictly below 0)' : lo > 0 ? 'REJECT (95% CI strictly above 0)' : 'INCONCLUSIVE (95% CI crosses 0)'}`); }
say(`  Unseen 6-mon team score, last window, Kip's formula 80+122*(sig(calib*(0-meanX))-.5): ` + kinds.map(k => `${k}=${ssUnseen(lastMT[k]).toFixed(1)} (meanX=${lastMT[k].meanX}, calib=${lastMT[k].calib})`).join(' vs '));
say(`  Same team, page formula (fieldWin over dist.q, x = 0, team basics and player-skill nudge left out as Kip does): ` + kinds.map(k => `${k}=${ssUnseenPage(lastMT[k]).toFixed(1)}`).join(' vs '));
// week-1 stress test, Kip's split: first 7 events by date; train on the first 5, score events 6-7.
// (a) the file cut to the first 5 events, as production would run on that day: its own ship gate decides (x = 0 if not shipped)
// (b) the file cut to the first 7 events with TEST_FROM=.72, so model.mjs itself trains on events 1-5 and reports the
//     uncalibrated held-out log-loss on events 6-7 (its eval.model_teams_only) = Kip's metric, the real fit, no ship gate.
//     Caveat: in (b) model.mjs picks pairs/set features and set centering from all 7 events' sheets (no results), as it always uses its whole file.
if (process.env.WEEK1 !== '0') {
  const ord = [...evDates.keys()].sort((a, b) => evDates[a].localeCompare(evDates[b]) || a - b), tr = new Set(ord.slice(0, 5)), te = new Set(ord.slice(5, 7));
  const eTe = G.filter(g => te.has(g[3]));
  say(`\n--- Week-1 stress test (${G.filter(g => tr.has(g[3])).length} train -> ${eTe.length} test games) ---`);
  const mf7 = WORK + 'matches-week1-7ev.json'; fs.writeFileSync(mf7, JSON.stringify(cutFile(new Set(ord.slice(0, 7)))));
  for (const k of kinds) { const MT = train('week1', k, tr), x = scorer(MT); let a = 0, ac = 0;
    for (const [A, B, r, , , , , dA, dB] of eTe) { const p = sig(MT.calib * (x(A, dA) - x(B, dB))); a += ll1(p, r); ac += (p > .5) === (r === 1) ? 1 : 0; }
    say(`  ${k} (a) as production on day 5: ships=${MT.ships} -> ll=${(a / eTe.length).toFixed(5)} acc=${(100 * ac / eTe.length).toFixed(2)}%`);
    const [script, env] = KINDS[k]; let o = ''; try { o = execFileSync('node', [script], {cwd: ROOT, env: {...process.env, ...env, MATCHES: mf7, MODEL_OUT: WORK + `model-week1b-${k}.json`, TEST_FROM: '.72', TRAIN_ONLY: '', TEST_DATE: '', MODEL_SHADOW: ''}, encoding: 'utf8', maxBuffer: 1 << 28}); } catch (e) { o = String(e.stdout || ''); }
    const h = o.split('\n').find(l => l.startsWith('held-out test')), ev = h ? JSON.parse(h.slice(14)) : null;
    say(`  ${k} (b) real fit on events 1-5, scored on 6-7 (${ev && ev.test_games}g): no calib ll=${ev && ev.model_teams_only.logloss} acc=${ev && (100 * ev.model_teams_only.acc).toFixed(2)}% | raw win rates ll=${ev && ev.raw_win_rates.logloss} acc=${ev && (100 * ev.raw_win_rates.acc).toFixed(2)}%`); }
}
fs.writeFileSync(WORK + 'result.txt', lines.join('\n') + '\n');
