// Split scoreboard (Sim, Nov 17: "single games first"; record each round's format, then score the Strength Score on SINGLE GAMES
// separately). Same walk-forward method as experiments/walk-forward.mjs (train model.mjs only on events before each cut, score the
// next window with experiments/board.mjs, the model's own trained stretch, BOARD_FIXCAL=1, row "site today, minus matchups"), but
// every number is reported SEPARATELY for best-of-1 rounds, best-of-3 rounds and rounds of unknown format:
//   games and tournaments · pick rate (does the higher score win) · log-loss · calibration (said vs won, 10-point bins of the
//   favourite's chance) · edge scale (the stretch s that fits best, P = σ(s·logit p): 1 = win chances the right size, under 1 =
//   too confident for that kind of round). Every range is 95%, resampled by tournament (200 resamples, fixed seed).
// Round format: data/tour-modes.json (tour-modes.mjs, daily job) holds each Limitless event's phases [type, rounds, mode] in order.
// A pairing's round number counts across phases (Swiss 6 + top cut: top-cut round 1 is round 7), so phases are walked in order with
// rounds counted cumulatively. No record for the event, no round number, or a round past the last phase = unknown.
//
// Sealed set (docs/sealed-pass-rules.md): games dated 2026-11-09 or later. This script refuses any window that reaches them unless
// --sealed is given, and a sealed run must be the one-model kind the rules describe (model trained only on games before 2026-11-09,
// scored on everything from 2026-11-09 to --until). It runs once: it leaves out/wf/split/SEALED-LOOK.json and refuses a second look.
//
// Usage (from the repo root):
//   node experiments/split-scoreboard.mjs                                   4 weekly windows ending 2026-11-09 (as walk-forward.mjs)
//   node experiments/split-scoreboard.mjs --from 2026-10-12 --until 2026-11-09 [--weeks-of 7] [--tag name]
//   node experiments/split-scoreboard.mjs --one-model --from 2026-10-27 --until 2026-11-09   one model trained before --from
//   node experiments/split-scoreboard.mjs --preds out/wf/<tag>        split an existing walk-forward run (no training, its own weeks)
//   node experiments/split-scoreboard.mjs --sealed --one-model --from 2026-11-09 --until <day after the last event>   (ONCE)
// --until is exclusive (events dated before it). Env: MATCHES (default out/matches.json), TOUR_MODES (default data/tour-modes.json).
// Output: out/wf/split/<tag>/summary.json (+ the per-window models, boards and predictions when it trains).
import fs from 'node:fs'; import {execFileSync} from 'node:child_process'; import {pathToFileURL} from 'node:url';

export const SEAL_FROM = '2026-11-09';                       // docs/sealed-pass-rules.md: sealed = events on or after this date
export const ROW = '+ own sets + this six\'s own record  [site today, minus matchups]';   // walk-forward.mjs's row
export const MODES = ['BO1', 'BO3', 'unknown'];

// round format of one pairing: phases [[type, rounds, mode], ...] walked in order, rounds counted cumulatively
export function roundMode(phases, round) {
  const r = round == null || round === '' ? NaN : +round;
  if (!Array.isArray(phases) || !phases.length || !Number.isInteger(r) || r < 1) return 'unknown';
  let k = 0; for (const [, n, m] of phases) { k += +n || 0; if (r <= k) return m === 'BO1' || m === 'BO3' ? m : 'unknown'; }
  return 'unknown';                                         // past the last phase: the record doesn't say
}

// the date window and the sealed guard; returns {ok, why}
export function windowGuard({from, until, sealed = false, oneModel = false, preds = false}) {
  const isDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') && !isNaN(Date.parse(d + 'T00:00:00Z'));
  if (!isDay(from) || !isDay(until)) return {ok: false, why: `dates must be YYYY-MM-DD (from ${from}, until ${until})`};
  if (from >= until) return {ok: false, why: `--from ${from} must be before --until ${until} (until is exclusive)`};
  const reaches = until > SEAL_FROM;                       // events dated on/after SEAL_FROM would be scored
  if (reaches && !sealed) return {ok: false, why: `refusing: the window ${from} to ${until} (exclusive) reaches games dated ${SEAL_FROM} or later, the sealed set. Use --until ${SEAL_FROM} or earlier. The one sealed look needs --sealed.`};
  if (sealed) {
    if (preds) return {ok: false, why: 'refusing: a sealed run trains its own model (no --preds)'};
    if (!oneModel) return {ok: false, why: 'refusing: a sealed run must be --one-model (docs/sealed-pass-rules.md: the model is trained only on games before 2026-11-09)'};
    if (from !== SEAL_FROM) return {ok: false, why: `refusing: a sealed run scores from ${SEAL_FROM} exactly (got --from ${from})`};
    if (!reaches) return {ok: false, why: '--sealed was given but the window holds no sealed dates'};
  }
  return {ok: true};
}

const lg = p => Math.log(p / (1 - p)), sig = z => 1 / (1 + Math.exp(-z)), cl = q => Math.min(1 - 1e-9, Math.max(1e-9, q));
const llOf = d => d.reduce((a, r) => a - (r.y ? Math.log(cl(r.p)) : Math.log(1 - cl(r.p))), 0) / d.length;
// best edge scale: s minimising log-loss of σ(s·logit p), ternary search on [0, 3] (as the Nov 17 helper's bo1-cal.mjs)
export function edgeScale(d) {
  const ll = s => d.reduce((a, r) => { const q = cl(sig(s * lg(cl(r.p)))); return a - (r.y ? Math.log(q) : Math.log(1 - q)); }, 0) / d.length;
  let lo = 0, hi = 3; for (let i = 0; i < 50; i++) { const a = lo + (hi - lo) / 3, c = hi - (hi - lo) / 3; if (ll(a) < ll(c)) hi = c; else lo = a; } return (lo + hi) / 2;
}
const pickOf = d => { let n = 0, h = 0; for (const r of d) { if (r.p === .5) continue; n++; if ((r.p > .5) === (r.y === 1)) h++; } return n ? h / n * 100 : NaN; };
export const BINS = [[.5, .6], [.6, .7], [.7, .8], [.8, .9], [.9, 1.0001]];
const binsOf = d => { const B = BINS.map(() => ({n: 0, s: 0, w: 0}));
  for (const r of d) { if (r.p === .5) continue; const f = Math.max(r.p, 1 - r.p), j = BINS.findIndex(([a, c]) => f >= a && f < c); if (j < 0) continue; B[j].n++; B[j].s += f; B[j].w += (r.p > .5) === (r.y === 1) ? 1 : 0; }
  return B; };

// every number for one bucket of games; d = [{p, y, ev}] (ev = tournament key for resampling)
export function bucketStats(d, {resamples = 200} = {}) {
  if (!d.length) return {games: 0};
  const byE = new Map(); for (const r of d) (byE.get(r.ev) || byE.set(r.ev, []).get(r.ev)).push(r);
  const E = [...byE.values()], B = binsOf(d), R = {pick: [], ll: [], scale: [], bins: BINS.map(() => [])};
  let q = 5;                                                // Park-Miller, seed 5: same draws as the Nov 17 helper run
  for (let k = 0; k < resamples; k++) { const s = []; for (let j = 0; j < E.length; j++) { q = (q * 16807) % 2147483647; s.push(...E[q % E.length]); }
    R.pick.push(pickOf(s)); R.ll.push(llOf(s)); R.scale.push(edgeScale(s)); binsOf(s).forEach((b, i) => { if (b.n) R.bins[i].push(b.w / b.n * 100); }); }
  const rg = (a, f = 2) => { if (a.length < 20) return null; const b = a.slice().sort((x, y) => x - y), lo = Math.floor(.025 * b.length), hi = Math.ceil(.975 * b.length) - 1; return [+b[lo].toFixed(f), +b[hi].toFixed(f)]; };
  const cal = B.map((b, i) => b.n ? {bin: `${Math.round(BINS[i][0] * 100)}-${Math.min(100, Math.round(BINS[i][1] * 100))}%`, games: b.n, said: +(b.s / b.n * 100).toFixed(1), won: +(b.w / b.n * 100).toFixed(1), wonRange: rg(R.bins[i], 1)} : null).filter(Boolean);
  const calGap = cal.reduce((a, c) => a + c.games * Math.abs(c.said - c.won), 0) / Math.max(1, cal.reduce((a, c) => a + c.games, 0));
  return {games: d.length, tournaments: E.length, pick: +pickOf(d).toFixed(2), pickRange: rg(R.pick), ll: +llOf(d).toFixed(5), llRange: rg(R.ll, 5),
    edgeScale: +edgeScale(d).toFixed(3), edgeScaleRange: rg(R.scale, 3), calGap: +calGap.toFixed(2), cal, resamples};
}

const day = (d, n) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
// board.mjs's scored games for one window, in its order (same filter), so predictions pair with their round and event
export function scoredGames(M, from, to) {
  const teams = M.teams.map(k => k.split('|')), ev = M.events;
  const futE = new Set([...ev.keys()].filter(i => ev[i][1] >= from && ev[i][1] < to && !String(ev[i][0]).startsWith('sd-')));
  return M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6 && futE.has(g[3]));
}

function main() {
  const A = process.argv.slice(2), flag = k => A.includes(k), val = (k, d) => { const i = A.indexOf(k); return i >= 0 && A[i + 1] && !A[i + 1].startsWith('--') ? A[i + 1] : d; };
  const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  const sealed = flag('--sealed'), oneModel = flag('--one-model'), predsDir = val('--preds', null), stepDays = +val('--weeks-of', 7), resamples = +val('--resamples', 200);
  const MF = process.env.MATCHES || ROOT + 'out/matches.json', TMF = process.env.TOUR_MODES || ROOT + 'data/tour-modes.json';
  let windows, from, until;
  if (predsDir) { const S = JSON.parse(fs.readFileSync(predsDir.replace(/\/?$/, '/') + 'summary.json', 'utf8'));
    windows = S.weeks.map(w => ({cut: w.cut, to: w.to})); from = windows[0].cut; until = windows[windows.length - 1].to; }
  else { until = val('--until', SEAL_FROM); from = val('--from', day(until, -7 * +val('--weeks', 4)));
    if (oneModel) windows = [{cut: from, to: until}];
    else { windows = []; for (let c = from; c < until; c = day(c, stepDays)) windows.push({cut: c, to: day(c, stepDays) < until ? day(c, stepDays) : until}); } }
  const G = windowGuard({from, until, sealed, oneModel, preds: !!predsDir});
  for (const w of windows) if (w.to > SEAL_FROM && !sealed) G.ok = false, G.why = G.why || `refusing: window ${w.cut} to ${w.to} reaches the sealed set (${SEAL_FROM} on)`;
  if (!G.ok) { console.error(G.why); process.exit(2); }
  const tag = val('--tag', (sealed ? 'SEALED-' : '') + (predsDir ? 'from-' + predsDir.replace(/\/+$/, '').split('/').pop() : `${oneModel ? 'one' : 'wk'}-${from}_${until}`));
  const M = JSON.parse(fs.readFileSync(MF, 'utf8')), TM = JSON.parse(fs.readFileSync(TMF, 'utf8'));
  const OUT = ROOT + 'out/wf/split/', DIR = OUT + tag + '/'; fs.mkdirSync(DIR, {recursive: true});
  if (sealed) { const L = OUT + 'SEALED-LOOK.json';
    if (fs.existsSync(L)) { console.error(`refusing: the one sealed look already started (${fs.readFileSync(L, 'utf8').trim()}). docs/sealed-pass-rules.md: one look per question, no re-runs. If it crashed before printing any result, delete ${L} and log why.`); process.exit(2); }
    fs.writeFileSync(L, JSON.stringify({started: new Date().toISOString(), from, until, tag}) + '\n');
    console.log(`SEALED LOOK (one only): model trained on events before ${from}; scoring ${from} to ${until} (exclusive)`); }
  const run = (args, env) => execFileSync('node', args, {cwd: ROOT, env: {...process.env, ...env}, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe']});
  const D = {BO1: [], BO3: [], unknown: [], all: []}, diag = {noRecord: 0, noRound: 0, pastLastPhase: 0}, per = [];
  for (const w of windows) {
    let pf;
    if (predsDir) pf = predsDir.replace(/\/?$/, '/') + `pred-${w.cut}.json`;
    else { const mt = DIR + `model-${w.cut}.json`, mf = DIR + `matches-${w.cut}.json`; pf = DIR + `pred-${w.cut}.json`;
      console.log(`window ${w.cut} → ${w.to}: training on events before ${w.cut}…`);
      // exactly walk-forward.mjs: only events before the cut (renumbered), production's own stretch split, model must ship
      const T = JSON.parse(fs.readFileSync(MF, 'utf8')), keep = T.events.map((e, i) => e[1] < w.cut ? i : -1).filter(i => i >= 0), nu = new Map(keep.map((o, n) => [o, n]));
      T.m = T.m.filter(g => nu.has(g[3])).map(g => { const h = g.slice(); h[3] = nu.get(g[3]); return h; }); T.events = keep.map(i => T.events[i]);
      fs.writeFileSync(mf, JSON.stringify(T)); run(['model.mjs'], {MATCHES: mf, MODEL_OUT: mt}); fs.unlinkSync(mf);
      const md = JSON.parse(fs.readFileSync(mt, 'utf8')); if (!md.ships || !Object.keys(md.mons || {}).length) throw new Error(`window ${w.cut}: the model did not ship; refusing to score the fallback`);
      run(['experiments/board.mjs', DIR + `board-${w.cut}.json`], {MATCHES: MF, BOARD_MT: mt, BOARD_DATE: w.cut, BOARD_TO: w.to, BOARD_FIXCAL: '1', BOARD_PRED: pf, ...(sealed ? {SEALED: '1'} : {})}); }
    const P = JSON.parse(fs.readFileSync(pf, 'utf8')), p = P.rows[ROW], fut = scoredGames(M, w.cut, w.to);
    if (!p || fut.length !== p.length || fut.some((g, i) => g[3] !== P.ev[i] || (g[2] === 1 ? 1 : 0) !== P.y[i])) throw new Error(`window ${w.cut}: predictions don't line up with the games (${fut.length} games vs ${p && p.length} predictions); wrong MATCHES file?`);
    const c = {BO1: 0, BO3: 0, unknown: 0};
    fut.forEach((g, i) => { const e = M.events[g[3]], ph = TM[e[0]], m = roundMode(ph, g[6]);
      if (m === 'unknown') { if (!ph) diag.noRecord++; else if (g[6] == null || g[6] === '') diag.noRound++; else diag.pastLastPhase++; }
      const r = {p: p[i], y: P.y[i], ev: w.cut + ':' + g[3]}; D[m].push(r); D.all.push(r); c[m]++; });
    per.push({cut: w.cut, to: w.to, games: fut.length, ...c});
    console.log(`  ${w.cut} → ${w.to}: ${fut.length} games · best-of-1 ${c.BO1} · best-of-3 ${c.BO3} · unknown ${c.unknown}`); }
  const res = {tag, made: new Date().toISOString(), row: ROW, sealed, oneModel, from, until, windows: per, matches: MF, tourModes: TMF, unknownWhy: diag, buckets: {}};
  for (const k of [...MODES, 'all']) res.buckets[k] = bucketStats(D[k], {resamples});
  fs.writeFileSync(DIR + 'summary.json', JSON.stringify(res, null, 1));
  const name = {BO1: 'best-of-1 rounds', BO3: 'best-of-3 rounds', unknown: 'unknown format', all: 'all rounds'}, f = r => r ? `${r[0]} to ${r[1]}` : 'n/a';
  console.log(`\n${tag}: ${from} to ${until} (exclusive), ${per.length} window(s)${sealed ? ' · SEALED LOOK' : ''}`);
  for (const k of [...MODES, 'all']) { const b = res.buckets[k]; if (!b.games) { console.log(`\n${name[k]}: 0 games`); continue; }
    console.log(`\n${name[k]}: ${b.games} games in ${b.tournaments} tournaments`);
    console.log(`  pick ${b.pick}% (${f(b.pickRange)}) · log-loss ${b.ll} (${f(b.llRange)}) · edge scale ${b.edgeScale.toFixed(2)} (${f(b.edgeScaleRange)}) · calibration gap ${b.calGap} pts`);
    console.log('  ' + b.cal.map(c => `said ${c.said}% → won ${c.won}% (${c.games}${c.wonRange ? `; ${f(c.wonRange)}` : ''})`).join(' · ')); }
  console.log(`\nunknown format because: no round-format record for the event ${diag.noRecord} · no round number ${diag.noRound} · round past the last phase ${diag.pastLastPhase}`);
  console.log(`ranges: 95%, ${resamples} resamples by tournament · edge scale 1 = win chances the right size, under 1 = too confident`);
  console.log(`saved ${DIR}summary.json`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
