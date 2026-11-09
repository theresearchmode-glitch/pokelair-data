// Daily model guard (Foundation Phase 4, Nov 9): runs after model.mjs, six.mjs and ctr.mjs. Compares today's out/model.json with
// yesterday's (the committed one) and, if today's is clearly broken or worse, puts yesterday's back and exits 1 so the daily run
// records it (node model-guard.mjs || node skip.mjs ...). Checks:
//   1. complete: 250+ Pokémon, the team factors (noMega, protectLow) present and negative, calibration 0.6-1.2, the grade's
//      reference distribution present
//   2. accuracy: held-out calibrated log-loss not worse than yesterday's by more than 0.005, and better than a coin flip (0.693)
//   3. stability: the 200 most-played real sixes keep their order (rank correlation 0.85+ between yesterday's and today's strength)
// GUARD_PREV=<file> compares with that file instead of git's committed copy (for tests).
import fs from 'node:fs'; import {execSync} from 'node:child_process';
const F = 'out/model.json', now = JSON.parse(fs.readFileSync(F, 'utf8'));
let prevTxt = null; try { prevTxt = process.env.GUARD_PREV ? fs.readFileSync(process.env.GUARD_PREV, 'utf8') : execSync('git show HEAD:' + F, {encoding: 'utf8', maxBuffer: 64e6}); } catch (e) {}
const prev = prevTxt ? JSON.parse(prevTxt) : null, bad = [];
// 1. complete
if (Object.keys(now.mons || {}).length < 250) bad.push(`only ${Object.keys(now.mons || {}).length} Pokémon`);
for (const k of ['noMega', 'protectLow']) if (!(now.team && now.team[k] < 0)) bad.push(`team factor ${k} missing or not negative (${now.team && now.team[k]})`);
if (!(now.calib >= .6 && now.calib <= 1.2)) bad.push(`calibration ${now.calib} outside 0.6-1.2`);
if (!(now.dist && Array.isArray(now.dist.q) && now.dist.q.length > 10)) bad.push('grade reference distribution missing');
// 2. accuracy
const ll = m => m && m.eval && m.eval.calibrated_logloss ? m.eval.calibrated_logloss.with_sets : null, l1 = ll(now), l0 = ll(prev);
if (l1 == null || !(l1 < .693)) bad.push(`held-out log-loss ${l1} (coin flip 0.693)`);
else if (l0 != null && l1 > l0 + .005) bad.push(`held-out log-loss worse: ${l0} → ${l1}`);
// 3. stability
let rho = null; if (prev) { try { const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8')), cnt = new Map();
  for (const g of M.m) for (const t of [g[0], g[1]]) cnt.set(t, (cnt.get(t) || 0) + 1);
  const top = [...cnt].sort((a, b) => b[1] - a[1]).map(([t]) => M.teams[t].split('|')).filter(t => t.length === 6).slice(0, 200);
  const x = (m, ns) => { let v = 0; for (const n of ns) v += m.mons[n] || 0; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = ns[i] < ns[j] ? ns[i] + '|' + ns[j] : ns[j] + '|' + ns[i]; v += (m.pairs || {})[k] || 0; } return v; };
  const rk = a => { const o = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = new Array(a.length); o.forEach(([, i], k) => r[i] = k); return r; };
  const a = rk(top.map(t => x(prev, t))), c = rk(top.map(t => x(now, t))), n = a.length; let d2 = 0; for (let i = 0; i < n; i++) d2 += (a[i] - c[i]) ** 2;
  rho = 1 - 6 * d2 / (n * (n * n - 1)); if (rho < .85) bad.push(`the 200 most-played sixes reordered (rank correlation ${rho.toFixed(3)}, need 0.85+)`); } catch (e) { console.log('stability check skipped: ' + e.message); } }
console.log(`model guard: ${Object.keys(now.mons || {}).length} Pokémon · log-loss ${l0} → ${l1} · calib ${now.calib} · rank correlation ${rho == null ? '—' : rho.toFixed(3)}`);
if (bad.length) { console.log('::warning::model guard: ' + bad.join('; ') + (prev ? ' → kept yesterday\'s model' : ' (no previous model to fall back to)'));
  if (prev) fs.writeFileSync(F, prevTxt); process.exit(1); }
console.log('model guard: ok');
