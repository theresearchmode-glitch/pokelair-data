// Walk-forward scoreboard (Accuracy Lab, Nov 9, Sim: "what's the best way to see actual improvements in our data and accuracy?").
// The one honest scoreboard for the grade. For each weekly cut date: train the grade only on events before it
// (TRAIN_ONLY=1 TEST_DATE=<cut> node model.mjs), then score the next week's real games the way the site grades
// (experiments/board.mjs with the team rules and the model's own trained stretch, BOARD_FIXCAL=1), and the share of that
// week's top-4 teams (32+ player online events, each player's own sheet) that grade B or better (experiments/golden.mjs).
// Nothing is ever scored on games its model has seen; the sealed set (experiments/sealed.json) is never touched.
// The weeks are pooled into one scoreboard and one prediction file (same games, same order), so two versions of the grade
// are compared game for game with the agreed rule: node experiments/compare.mjs <A>/pred.json <B>/pred.json "<row>" "<row>"
//   KEEP a change only if the whole 95% range of the log-loss gap is on the better side (games resampled by tournament).
// Any env vars set when this runs reach model.mjs too, so a variant is just e.g.  FAST=10,14,1,200 node experiments/walk-forward.mjs set200
// Usage: node experiments/walk-forward.mjs [tag=baseline] [weeks=4]        (needs app/dist/page.html for the top-cut part; WF_TOPCUT=0 skips it)
// Output: out/wf/<tag>/ (models, per-week boards, pred.json, summary.json)
import fs from 'node:fs'; import {execFileSync} from 'node:child_process';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const tag = process.argv[2] || 'baseline', WEEKS = +(process.argv[3] || 4), DIR = ROOT + 'out/wf/' + tag + '/';
fs.mkdirSync(DIR, {recursive: true});
const SEAL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from;
const day = (d, n) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
// the last window ends the day the sealed set starts; earlier windows step back a week at a time
const cuts = []; for (let k = WEEKS; k >= 1; k--) cuts.push(day(SEAL, -7 * k));
const ROW = '+ own sets + this six\'s own record  [site today, minus matchups]';
const run = (args, env) => execFileSync('node', args, {cwd: ROOT, env: {...process.env, ...env}, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe']});
const weeks = [];
for (const cut of cuts) { const to = day(cut, 7), mt = DIR + `model-${cut}.json`;
  console.log(`week ${cut} → ${to}: training on events before ${cut}…`);
  // Nov 9 fix (found while checking calibration): TRAIN_ONLY + TEST_DATE fitted the model's stretch (calib) on every event on or
  // after the cut, i.e. on the very week being scored (Nov 2 cut: 51 of its 52 held-out events) plus one sealed-set event. Now
  // each week trains exactly like production on the data as it stood at the cut: games of events before the cut only, the
  // stretch from production's own split (last 20% of those events). WF_OLD=1 runs the old way, to compare.
  if (process.env.WF_OLD === '1') run(['model.mjs'], {TRAIN_ONLY: '1', TEST_DATE: cut, MODEL_OUT: mt});
  else { const M = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8')), mf = DIR + `matches-${cut}.json`;
    // drop the later events too (renumbering the rest), or production's "newest 20% of events" check holds out empty events
    const keep = M.events.map((e, i) => e[1] < cut ? i : -1).filter(i => i >= 0), nu = new Map(keep.map((o, n) => [o, n]));
    M.m = M.m.filter(g => nu.has(g[3])).map(g => { const h = g.slice(); h[3] = nu.get(g[3]); return h; }); M.events = keep.map(i => M.events[i]);
    fs.writeFileSync(mf, JSON.stringify(M)); run(['model.mjs'], {MATCHES: mf, MODEL_OUT: mt}); fs.unlinkSync(mf);
    // guard: a week whose model didn't ship would be scored on the fallback formula, not the grade (happened once, Nov 9)
    const md = JSON.parse(fs.readFileSync(mt, 'utf8')); if (!md.ships || !Object.keys(md.mons || {}).length) throw new Error(`week ${cut}: the model did not ship (ships ${md.ships}, ${Object.keys(md.mons || {}).length} Pokémon); refusing to score the fallback`); }
  // WF_BREAK=shuffle (test of the gate only): scramble the Pokémon strengths after training, a deliberately broken grade
  if (process.env.WF_BREAK === 'shuffle') { const m = JSON.parse(fs.readFileSync(mt, 'utf8')), k = Object.keys(m.mons), v = k.map(x => m.mons[x]); let s = 11;
    for (let i = v.length - 1; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [v[i], v[j]] = [v[j], v[i]]; } k.forEach((x, i) => { m.mons[x] = v[i]; }); fs.writeFileSync(mt, JSON.stringify(m)); }
  run(['experiments/board.mjs', DIR + `board-${cut}.json`], {BOARD_MT: mt, BOARD_DATE: cut, BOARD_TO: to, BOARD_FIXCAL: '1', BOARD_PRED: DIR + `pred-${cut}.json`});
  const B = JSON.parse(fs.readFileSync(DIR + `board-${cut}.json`, 'utf8')), r = B.rows[ROW];
  let top = null; if (process.env.WF_TOPCUT !== '0') { const o = run(['experiments/golden.mjs'], {GOLDEN_FROM: cut, GOLDEN_TO: to, GOLDEN_MODEL: mt, GOLDEN_TOPCUT_ONLY: '1'}); const m = o.match(/TOPCUT (\{.*\})/); top = m ? JSON.parse(m[1]) : null; }
  weeks.push({cut, to, games: B.later, ll: r.ll, pick: r.pick, calGap: r.calGap, letters: r.letters, swaps: r.swaps, top});
  console.log(`  ${B.later} games · ll ${r.ll} · pick ${r.pick}% · calibration gap ${r.calGap} pts${top ? ` · top-4 teams B or better ${top.good}/${top.n}` : ''}`); }
// pool the weeks: one prediction file over every scored game (for compare.mjs), and the pooled numbers
const P = {cuts, cutDate: cuts[0] + ' to ' + day(cuts[cuts.length - 1], 7) + ' (weekly)', ev: [], y: [], rows: {}};
for (const w of weeks) { const p = JSON.parse(fs.readFileSync(DIR + `pred-${w.cut}.json`, 'utf8')); P.ev.push(...p.ev.map(e => w.cut + ':' + e)); P.y.push(...p.y);
  for (const [k, v] of Object.entries(p.rows)) (P.rows[k] = P.rows[k] || []).push(...v); }
fs.writeFileSync(DIR + 'pred.json', JSON.stringify(P));
const p = P.rows[ROW], y = P.y, cl = q => Math.min(1 - 1e-9, Math.max(1e-9, q));
const ll = p.reduce((a, q, i) => a - (y[i] ? Math.log(cl(q)) : Math.log(1 - cl(q))), 0) / p.length;
let r = 0, n = 0; p.forEach((q, i) => { if (q === .5) return; n++; if ((q > .5) === (y[i] === 1)) r++; });
const bands = [[.5, .55], [.55, .6], [.6, .65], [.65, .7], [.7, 1.01]].map(([a, c]) => ({a, c, n: 0, s: 0, w: 0}));
p.forEach((q, i) => { const f = Math.max(q, 1 - q), won = (q > .5) === (y[i] === 1) ? 1 : 0; if (q === .5) return; const B = bands.find(B => f >= B.a && f < B.c); if (B) { B.n++; B.s += f; B.w += won; } });
const cal = bands.filter(B => B.n >= 30).map(B => ({band: `${Math.round(B.a * 100)}-${Math.min(100, Math.round(B.c * 100))}%`, n: B.n, said: +(B.s / B.n * 100).toFixed(1), won: +(B.w / B.n * 100).toFixed(1)}));
const calGap = cal.reduce((a, c) => a + c.n * Math.abs(c.said - c.won), 0) / Math.max(1, cal.reduce((a, c) => a + c.n, 0));
const tops = weeks.filter(w => w.top), tn = tops.reduce((a, w) => a + w.top.n, 0), tg = tops.reduce((a, w) => a + w.top.good, 0);
const S = {tag, made: new Date().toISOString(), row: ROW, cuts, games: p.length, ll: +ll.toFixed(5), pick: +(r / n * 100).toFixed(2), calGap: +calGap.toFixed(2), cal,
  topCut: tn ? {n: tn, good: tg, share: +(tg / tn).toFixed(4)} : null, coinFlipLL: 0.69315, weeks};
fs.writeFileSync(DIR + 'summary.json', JSON.stringify(S, null, 1));
console.log(`\n${tag}: ${p.length} later games over ${cuts.length} weeks · log-loss ${S.ll} (coin flip 0.6931) · higher grade wins ${S.pick}% · calibration gap ${S.calGap} pts`);
console.log(`  calibration: ${cal.map(c => `said ${c.said}% → won ${c.won}% (${c.n})`).join(' · ')}`);
if (S.topCut) console.log(`  top-4 teams graded B or better before their event: ${tg} of ${tn} (${Math.round(tg / tn * 100)}%)`);
console.log(`  saved ${DIR}summary.json and pred.json`);
