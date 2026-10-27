// Results board (step 7, after the model): one place that scores every model the same way each day, and keeps the history,
// so a change that makes anything worse shows up the next morning instead of weeks later.
//  - Win model: its own held-out test (accuracy, calibrated log-loss, events where it beat a coin flip).
//  - Team strength on real events: within each recent event's top cut, how often the team the model rates stronger
//    finished higher (the same model numbers as the page's Team Score, without the page's checklist cut).
//  - Showdown replays: how many games we hold, and how many from 1300+ rated players.
// Writes out/scoreboard.json (today + up to a year of daily history) and warns when a number falls clearly below its
// recent level. Never fails the job: it only reports.
import fs from 'node:fs';
const rd = (f, d = null) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const M = rd('out/model.json'), E = rd('out/events.json'), R = rd('out/replays.json'), today = new Date().toISOString().slice(0, 10), row = {date: today};
if (M && M.eval) { const e = M.eval;
  row.model = {heldOutAcc: e.model_teams_only.acc, calibratedLogloss: e.calibrated_logloss && (e.calibrated_logloss.with_sets ?? e.calibrated_logloss.species_only),
    eventsBeatCoinFlip: e.events_beating_coin_flip ? `${e.events_beating_coin_flip.beat_coin_flip}/${e.events_beating_coin_flip.events}` : null, rawWinRateAcc: e.raw_win_rates.acc, games: M.games}; }
// team strength x the way the page computes it (species + pairs + clamped set effects, two strongest Megas, untried-mix cut)
if (M && M.ships && E && E.events) { const D = E.dict, sets = M.sets || {}, fq = M.setFreq || {}, tested = new Set(M.tested || []), spF = new Map();
  for (const k of Object.keys(sets)) { const sp = k.split(/[@:]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(k); }
  const setOne = (n, item, moves) => { if (!M.center) return 0; let u = 0; const mv = new Set(moves);
    for (const k of spF.get(n) || []) { const it = k.indexOf('@') === n.length, has = it ? k.slice(n.length + 1) === item : mv.has(k.slice(n.length + 1)); u += sets[k] * ((has ? 1 : 0) - (fq[k] || 0)); }
    const r = M.setRange && M.setRange[n]; return r ? Math.max(r[0], Math.min(r[1], u)) : u; };
  const x = mons => { const names = mons.map(m => m.n); let v = 0;
    const val = m => (M.mons[m.n] || 0) + setOne(m.n, m.it, m.mv), megas = mons.filter(m => /-Mega/.test(m.n)).sort((a, b) => val(b) - val(a)), drop = new Set(megas.slice(2).map(m => m.n));
    for (const m of mons) v += drop.has(m.n) ? 0 : val(m);
    let k = 0; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const a = names[i] < names[j] ? names[i] + '|' + names[j] : names[j] + '|' + names[i]; v += (M.pairs || {})[a] || 0; if (tested.has(a)) k++; }
    const mx = M.meanX || 0, d = v - mx; return d > 0 ? mx + d * (.5 + .5 * Math.min(1, k / (M.supK || 6))) : v; };
  let right = 0, pairs = 0, evs = 0;
  for (const ev of E.events) { const ts = (ev.top || []).map(t => ({place: t[1], mons: (t[3] || []).map(m => ({n: D[m[0]], it: D[m[1]], mv: (m[4] || []).map(i => D[i])}))})).filter(t => t.mons.length === 6 && t.mons.every(m => m.n));
    if (ts.length < 2) continue; evs++; const xs = ts.map(t => ({p: t.place, x: x(t.mons)}));
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) { if (xs[i].p === xs[j].p || xs[i].x === xs[j].x) continue; pairs++; if ((xs[i].x > xs[j].x) === (xs[i].p < xs[j].p)) right++; } }
  row.teamStrengthOnEvents = {acc: pairs ? +(right / pairs).toFixed(4) : null, pairs, events: evs}; }
if (R && Array.isArray(R.games)) row.replays = {games: R.games.length, rated1300: R.games.filter(g => Math.min(g.r[0] || 0, g.r[1] || 0) >= 1300).length};
const board = rd('out/scoreboard.json', {history: []}), hist = board.history.filter(h => h.date !== today);
// warn when today is clearly below the median of the last 14 days
const med = a => { const s = a.filter(v => v != null).sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; }, recent = hist.slice(-14), warns = [];
const cmp = (label, now, past, worseIfLower, tol) => { const m = med(past); if (now == null || m == null) return; if (worseIfLower ? now < m - tol : now > m + tol) warns.push(`${label}: ${now} vs ${m} recently`); };
cmp('Win model held-out accuracy', row.model && row.model.heldOutAcc, recent.map(h => h.model && h.model.heldOutAcc), true, .01);
cmp('Win model calibrated log-loss', row.model && row.model.calibratedLogloss, recent.map(h => h.model && h.model.calibratedLogloss), false, .003);
cmp('Team strength on real events', row.teamStrengthOnEvents && row.teamStrengthOnEvents.acc, recent.map(h => h.teamStrengthOnEvents && h.teamStrengthOnEvents.acc), true, .015);
row.warnings = warns;
fs.writeFileSync('out/scoreboard.json', JSON.stringify({updated: new Date().toISOString(), today: row, history: [...hist, row].slice(-365)}, null, 1));
console.log('scoreboard', JSON.stringify(row)); for (const w of warns) console.log(`::warning::${w}`);
