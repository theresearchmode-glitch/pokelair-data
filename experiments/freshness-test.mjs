// Freshness alarm tests for health.mjs with fake ages (Node 22, no network).
// Usage: node experiments/freshness-test.mjs
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {emptyFor} from '../reg-guard.mjs';

const NOW = '2026-11-24';
const isoDaysAgo = d => new Date(Date.parse(NOW + 'T12:00:00Z') - d * 864e5).toISOString();
const dayDaysAgo = d => isoDaysAgo(d).slice(0, 10);

function makeFixture({reg = 'M-C', launch = false, overrides = {}} = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'np-fresh-'));
  const out = path.join(dir, 'out');
  fs.mkdirSync(path.join(out, 'split'), {recursive: true});
  fs.mkdirSync(path.join(dir, 'data'), {recursive: true});

  const pad = n => 'x'.repeat(n);
  const w = (f, obj) => fs.writeFileSync(path.join(out, f), JSON.stringify(obj));

  if (launch) {
    const nowIso = isoDaysAgo(0);
    w('reg.json', {id: 'M-D', name: 'Reg M-D', since: NOW, sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: NOW, by: 'date'}, checked: NOW});
    w('regstate.json', {reg: 'M-D', day: 1, events: 0, players: 0, games: 0, since: NOW, updated: nowIso});
    const guarded = [
      'limitless.json', 'meta_tour.json', 'info.json', 'teams.json', 'history.json', 'matches.json',
      'model.json', 'meta_ladder.json', 'meta_ingame.json', 'events.json', 'official.json',
      'perf.json', 'practice.json', 'weekly.json', 'track.json', 'sources.json', 'crosscheck.json',
    ];
    for (const f of guarded) w(f, emptyFor(f, 'M-D', 'gen9championsvgc2026regmd', nowIso));
    w('ratings_log.json', {updated: nowIso, byReg: {'M-D': []}});
    w('scoreboard.json', {updated: nowIso, today: null, history: []});
  } else {
    const nowIso = isoDaysAgo(0);
    w('reg.json', {id: reg, name: 'Reg ' + reg, since: '2026-09-01', sd: 'gen9championsvgc2026regmc', checked: NOW});
    w('regstate.json', {reg, day: 85, events: 100, players: 4000, games: 30000, since: '2026-09-01', updated: nowIso});
    w('limitless.json', {reg, updated: nowIso, teams: 1000, results: {pad: pad(55000)}, adj: {rows: []}});
    w('meta_tour.json', {reg, updated: nowIso, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, p: pad(500)}))});
    w('info.json', {reg, updated: nowIso, N: 500, mv: {Protect: pad(1200)}});
    w('teams.json', {reg, updated: nowIso, teams: Array.from({length: 6}, (_, i) => ({id: i, p: pad(400)}))});
    w('history.json', {reg, days: [{d: dayDaysAgo(1), p: pad(600)}, {d: dayDaysAgo(0), p: pad(600)}]});
    w('matches.json', {reg, updated: nowIso, m: Array.from({length: 50}, () => [0, 1, 1]), pad: pad(5500)});
    w('model.json', {reg, updated: nowIso, mons: {Incineroar: pad(5500)}});
    w('meta_ingame.json', {updated: isoDaysAgo(120), top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, p: pad(100)}))});
    w('meta_ladder.json', {reg, month: '2026-10', updated: nowIso, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, p: pad(500)}))});
    w('events.json', {reg, updated: nowIso, events: Array.from({length: 6}, (_, i) => ({id: i, p: pad(2000)}))});
    w('official.json', {reg, updated: nowIso, events: [{id: 1, p: pad(1200)}]});
    w('official_perf.json', {updated: isoDaysAgo(120), asOf: '2026-10-15', pad: pad(200)});
    w('perf.json', {
      reg: {id: reg}, updated: nowIso, pad: pad(5500),
      tour: {updated: nowIso}, adj: {updated: nowIso}, ingame: {updated: isoDaysAgo(120)},
      smogon: {updated: '2026-10'}, ladder: {updated: nowIso},
      outside: {lists: [{name: 'sdt', date: dayDaysAgo(0)}]},
    });
    w('practice.json', {reg, updated: nowIso, rounds: Array.from({length: 25}, (_, i) => ({i, p: pad(250)}))});
    w('weekly.json', {reg, v: 1, updated: nowIso, pad: pad(300)});
    w('track.json', {reg, v: 1, updated: nowIso, pad: pad(300)});
    w('sources.json', {reg, updated: nowIso, problems: [], pad: pad(300)});
    w('crosscheck.json', {reg, updated: nowIso, checks: [], pad: pad(300)});
    w('ratings_log.json', {updated: nowIso, byReg: {[reg]: [{d: NOW, p: pad(300)}]}});
    w('scoreboard.json', {updated: nowIso, pad: pad(300)});
  }
  w('calendar.json', {checked: NOW, ev: [{n: 'Future Regional', s: '2026-12-10', e: '2026-12-12'}], pad: pad(250)});
  w('split/index.json', {made: isoDaysAgo(0), sizes: {results: 50000}, split: {}});
  fs.writeFileSync(path.join(dir, 'data/index.json'), JSON.stringify({tournaments: {t1: {d: dayDaysAgo(1)}}}));

  for (const [f, fn] of Object.entries(overrides)) {
    const fp = path.join(out, f);
    const cur = fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : {};
    fs.writeFileSync(fp, JSON.stringify(fn(cur)));
  }
  return dir;
}

function runHealth(dir) {
  const rep = path.join(dir, 'report.md');
  const r = spawnSync(process.execPath, ['health.mjs', `--root=${dir}`, `--now=${NOW}`], {
    env: {...process.env, HEALTH_REPORT: rep},
    encoding: 'utf8',
  });
  const md = fs.existsSync(rep) ? fs.readFileSync(rep, 'utf8') : '';
  return {status: r.status, stdout: r.stdout, stderr: r.stderr, md};
}

let failed = 0;
const check = (id, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ': ' + detail : ''}`);
  if (!ok) failed++;
};

// F1: All sources fresh (including paused meta_ingame 120d old & frozen official_perf 120d old) -> exit 0 + age summary line
{
  const d = makeFixture();
  try {
    const r = runHealth(d);
    check('F1-all-fresh-and-age-line',
      r.status === 0 && r.md.includes('Source ages (days):') && r.md.includes('limitless=0d/2d') &&
      r.md.includes('meta_ingame=120d(paused)') && r.md.includes('official_perf=120d(frozen)'),
      `status=${r.status}`);
  } finally { fs.rmSync(d, {recursive: true, force: true}); }
}

// F2: Daily file (limitless.json) 3 days old (limit 2) -> fails exit 1 as stale
{
  const d = makeFixture({overrides: {'limitless.json': o => ({...o, updated: isoDaysAgo(3)})}});
  try {
    const r = runHealth(d);
    check('F2-daily-stale-fails', r.status === 1 && r.md.includes('3 days old (limit 2)'), `status=${r.status}`);
  } finally { fs.rmSync(d, {recursive: true, force: true}); }
}

// F3: Monthly Smogon meta_ladder.json within 40d passes; >40d fails
{
  const d1 = makeFixture({overrides: {'meta_ladder.json': o => ({...o, month: '2026-10'})}});
  const d2 = makeFixture({overrides: {'meta_ladder.json': o => ({...o, month: '2026-09'})}});
  try {
    const r1 = runHealth(d1), r2 = runHealth(d2);
    check('F3-monthly-smogon-window', r1.status === 0 && r2.status === 1 && r2.md.includes('Smogon monthly ladder stats'), `r1=${r1.status}, r2=${r2.status}`);
  } finally { fs.rmSync(d1, {recursive: true, force: true}); fs.rmSync(d2, {recursive: true, force: true}); }
}

// F4: New regulation launch Day 1 (reg-guard empty shapes, thin data) -> passes exit 0 as thin (not stale)
{
  const d = makeFixture({launch: true});
  try {
    const r = runHealth(d);
    check('F4-reg-switch-thin-passes', r.status === 0 && r.md.includes('🟡 thin'), `status=${r.status}`);
  } finally { fs.rmSync(d, {recursive: true, force: true}); }
}

// F5: Reg-switch Day 1 with real staleness (model.json 5 days old) -> STILL fails exit 1
{
  const d = makeFixture({launch: true, overrides: {'model.json': o => ({...o, updated: isoDaysAgo(5)})}});
  try {
    const r = runHealth(d);
    check('F5-reg-switch-real-staleness-fails', r.status === 1 && r.md.includes('Win model: data from') && r.md.includes('5 days old'), `status=${r.status}`);
  } finally { fs.rmSync(d, {recursive: true, force: true}); }
}

// F6: split/index.json 4 days old -> fails exit 1 as stale
{
  const d = makeFixture({overrides: {'split/index.json': o => ({...o, made: isoDaysAgo(4)})}});
  try {
    const r = runHealth(d);
    check('F6-split-index-stale-fails', r.status === 1 && r.md.includes('Page storage (split/index.json)'), `status=${r.status}`);
  } finally { fs.rmSync(d, {recursive: true, force: true}); }
}

// F7: matches.json staleness caught (previously unchecked in health.mjs)
{
  const d = makeFixture({overrides: {'matches.json': o => ({...o, updated: isoDaysAgo(4)})}});
  try {
    const r = runHealth(d);
    check('F7-matches-stale-fails', r.status === 1 && r.md.includes('Game-level matches'), `status=${r.status}`);
  } finally { fs.rmSync(d, {recursive: true, force: true}); }
}

console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
if (failed) process.exit(1);
