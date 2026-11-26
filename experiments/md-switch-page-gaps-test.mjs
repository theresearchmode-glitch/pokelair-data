// Reg M-D switch-over page & roster gap tests (Nov 25).
// Checks three gaps found in the Dec 1-2 switch-over audit:
//   1. liveUsage('doubles') / U(p) (app/src/app/01-state.js): while Smogon monthly stats (META.doubles) are
//      empty during Reg M-D's first month, liveUsage falls back to META.doubles_tour once M-D tournament
//      results arrive, so U(p) and threats do not mix Reg M-C p.u with Reg M-D sets.
//   2. V2.regDay (app/src/v2/shell.js): counts launch-night Reg M-D events whose UTC-6 evDay is the evening
//      before r.since (e.g. 2026-12-02T02:30Z -> "2026-12-01").
//   3. experiments/gen-roster.mjs: does not drop Meowstic-F (added in rules-fixes) when regenerating data.js.
// Run: PAGE=app/dist/v2.html node experiments/md-switch-page-gaps-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.resolve(process.env.PAGE || path.join(ROOT, 'app/dist/v2.html'));
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); if (!cond) fails++; };

const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#meta');
await p.waitForTimeout(2500);

const res = await p.evaluate(() => window.__ev(`(() => {
  // Baseline on today's Reg M-C data
  const mcLive = liveUsage('doubles');
  const mcSize = mcLive ? mcLive.size : 0;

  // Switch to Reg M-D day 1 (0 events, empty META.doubles and META.doubles_tour)
  const R = {id: 'M-D', since: '2026-12-02', now: null};
  META.reg = R;
  META.perf = {updated: '2026-12-02', reg: R};
  META.results = null; RES = null;
  META.model = {reg: 'M-D', updated: '2026-12-02T09:07:00Z', ships: false, mons: {}, pairs: {}, sets: {}};
  META.doubles = {format: 'doubles', kind: 'ladder', month: null, top: [], more: []};
  META.doubles_ingame = {format: 'doubles', kind: 'ingame', top: [], more: []};
  META.doubles_tour = {format: 'doubles', kind: 'tour', top: [], more: []};
  usageCache = {}; metaVersion++;
  const day1Live = liveUsage('doubles');
  const day1ScoreSrc = V2.scoreSrc({v: 1});

  // Launch-night M-D event (2026-12-02T02:30Z -> evDay 2026-12-01)
  META.events = {updated: '2026-12-02T09:07:00Z', events: [{id: 'night1', name: 'Launch Night Open', date: '2026-12-01', players: 64, src: 'limitless', top: []}]};
  const regDayNight = V2.regDay(Date.parse('2026-12-02T12:00:00Z'));

  // Day 3: M-D tournament results populate META.doubles_tour while META.doubles (Smogon) is still empty
  META.doubles_tour = {reg: 'M-D', format: 'doubles', kind: 'tour', updated: '2026-12-04T09:07:00Z', top: [
    {r: 1, n: 'Garchomp', u: 45.0, teams: 90, mv: [['Earthquake', 95]]},
    {r: 2, n: 'Pikachu', u: 20.0, teams: 40, mv: [['Fake Out', 99]]}
  ], more: []};
  usageCache = {}; metaVersion++;
  const day3Live = liveUsage('doubles');
  const day3Pika = U(byName.get('Pikachu'));
  const day3Incin = U(byName.get('Incineroar'));
  const day3ScoreSrc = V2.scoreSrc({v: 1});

  return {mcSize, day1Live: day1Live ? day1Live.size : null, day1ScoreSrc, regDayNight, day3Live: day3Live ? day3Live.size : null, day3Pika, day3Incin, day3ScoreSrc};
})()`));
await b.close();

ok(res.mcSize >= 50, `1a M-C baseline: liveUsage('doubles') reads META.doubles (${res.mcSize} mons)`);
ok(res.day1Live === null && /Graded against Reg\sM.C's teams/.test(res.day1ScoreSrc),
  `1b M-D day 1 (0 events): liveUsage is null and scoreSrc shows M-C fallback notice (live=${res.day1Live})`);
ok(res.day3Live === 2 && res.day3Pika === 20 && res.day3Incin === 0 && res.day3ScoreSrc === '',
  `1c M-D day 3 (META.doubles_tour populated, META.doubles empty): U(p) uses M-D tour usage only, never M-C p.u (live=${res.day3Live}, Pika=${res.day3Pika}, Incin=${res.day3Incin}, scoreSrc="${res.day3ScoreSrc}")`);
ok(/Day 1 of Reg M.D · 1 event$/.test(res.regDayNight),
  `2a V2.regDay counts launch-night M-D event dated 2026-12-01 (got "${res.regDayNight}")`);

// 3. gen-roster.mjs keeps Meowstic-F
const psDir = path.join(ROOT, 'node_modules/pokemon-showdown');
if (fs.existsSync(path.join(psDir, 'dist'))) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'md-gaps-roster-'));
  const outJs = path.join(tmp, 'data.gen.js');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'experiments/gen-roster.mjs'), '--ps', psDir, '--out', outJs], {cwd: ROOT, encoding: 'utf8'});
  const gen = fs.existsSync(outJs) ? fs.readFileSync(outJs, 'utf8') : '';
  const hasMeowF = gen.includes('"n":"Meowstic-F"');
  ok(r.status === 0 && hasMeowF, `3a gen-roster.mjs keeps Meowstic-F in ROSTER (exit=${r.status}, hasMeowsticF=${hasMeowF})`);
  fs.rmSync(tmp, {recursive: true, force: true});
} else {
  ok(false, '3a pokemon-showdown dist missing; build node_modules/pokemon-showdown first');
}

console.log(fails ? `md-switch-page-gaps-test: ${fails} FAILED` : 'md-switch-page-gaps-test: ALL PASSED');
process.exit(fails ? 1 : 0);
