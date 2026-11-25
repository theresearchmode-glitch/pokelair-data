// S7 tests for Job 28 pre-landing BLOCKER/HIGH fixes (Node 22, no network).
// Each test fails on unpatched 03ff6914 and passes with the fixes applied.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'np-j28-'));

const wr = (dir, rel, obj) => {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, typeof obj === 'string' ? obj : JSON.stringify(obj));
};
const rd = (dir, rel) => JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8'));

let failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e.message}`);
  }
}

try {
  // 1) BLOCKER #1: update.mjs fail-safe & empty-day guard on Dec 2 (0 M-D teams -> base=0.5, no exit(1), no "Jan 1")
  check('1-update-dec2-zero-teams-does-not-abort', () => {
    const src = fs.readFileSync(path.join(ROOT, 'update.mjs'), 'utf8');
    // Check base computation when G === 0
    const mBase = src.match(/const base = ([^;]+);/);
    assert.ok(mBase, 'base declaration not found');
    const baseVal = Function('W', 'G', `return ${mBase[1]};`)(0, 0);
    assert.equal(baseVal, 0.5, `expected base=0.5 when G=0, got ${baseVal}`);
    // Check fail-safe does not trigger when G=0 on a new regulation (prev M-C, FORMAT M-D)
    const mGate = src.match(/if \((.+?)\) \{\s*\n\s*console\.log\(`::error::update:/);
    assert.ok(mGate, 'update fail-safe gate not found');
    const gateFn = Function('base', 'G', 'sameAsPrev', 'prev', 'E', `return (${mGate[1]});`);
    assert.equal(gateFn(0.5, 0, false, {reg: 'M-C', teams: 1000}, []), false, 'gate must not abort on Dec 2 switch with 0 M-D teams');
    assert.equal(gateFn(0.5, 0, true, {reg: 'M-D', teams: 0}, []), false, 'gate must not abort on Dec 3 with 0 M-D teams');
    assert.equal(gateFn(0.3, 500, true, {reg: 'M-C', teams: 1000}, new Array(1000)), true, 'gate must STILL abort on bogus win rate with G>=100');
    assert.equal(gateFn(0.5, 500, true, {reg: 'M-C', teams: 1000}, new Array(500)), true, 'gate must STILL abort on >20% team drop on same reg');
    assert.ok(!/day\(first\)\s*–\s*\$\{day\(last\)\}/.test(src) || /first\s*\?/.test(src), 'first/last null guard needed to avoid Jan 1');
  });

  // 2) BLOCKER #2: official.mjs must NOT emit cached M-C events stamped as M-D on Dec 2
  check('2-official-dec2-does-not-leak-mc-events-as-md', () => {
    const src = fs.readFileSync(path.join(ROOT, 'official.mjs'), 'utf8');
    assert.match(src, /inRegWindow/, 'official.mjs must filter cached evSlugs by inRegWindow');
    const mSlugs = src.match(/const evSlugs = ([^;]+);/);
    assert.ok(mSlugs, 'evSlugs not found');
    const fn = Function('RG_ID', 'index', 'inRegWindow', 'ACT', `return ${mSlugs[1]};`);
    const fakeIndex = {events: {'2026-laic': {teams: 64, done: true, date: '2026-11-20'}}};
    const fakeInWin = (d, reg) => d >= reg.since && (!reg.end || d < reg.end);
    // On Dec 2, RG_ID is null -> must return []
    assert.deepEqual(fn(null, fakeIndex, fakeInWin, {id: 'M-D', since: '2026-12-02', end: '2027-03-03'}), [], 'RG_ID=null must yield 0 evSlugs');
    // Even if RG_ID is set to 'M-D', cached M-C event dated 2026-11-20 must be excluded
    assert.deepEqual(fn('M-D', fakeIndex, fakeInWin, {id: 'M-D', since: '2026-12-02', end: '2027-03-03'}), [], 'cached M-C event must be excluded from M-D evSlugs');
    // Normal M-C day: RG_ID='M-C', date 2026-11-20 -> included
    assert.deepEqual(fn('M-C', fakeIndex, fakeInWin, {id: 'M-C', since: '2026-09-01', end: '2026-12-02'}), ['2026-laic'], 'normal M-C event must still be included');
  });

  // 3) BLOCKER #3: sources.mjs + crosscheck.mjs must NOT record expected "not available yet" sources into out/skips.json
  check('3-sources-and-crosscheck-do-not-poison-skips-on-md', () => {
    const dir = path.join(TMP, 's3');
    fs.mkdirSync(dir, {recursive: true});
    for (const f of ['regulation.json', 'formats.mjs', 'reg-stamp.mjs', 'skip.mjs', 'crosscheck.mjs', 'sources.mjs']) {
      fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
    }
    // Stub names.mjs and http.mjs for sources.mjs (no network needed since M-D sources are null!)
    wr(dir, 'names.mjs', 'export const mapMon = x => x; export const ROSTER = new Set(); export const dec = x => x; export const text = x => [];\n');
    wr(dir, 'http.mjs', 'export const UA = "test"; export const politeFetch = async () => { throw new Error("no net"); };\n');
    wr(dir, 'out/reg.json', {id: 'M-D', name: 'Reg M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: '2026-12-02', by: 'date'}, checked: '2026-12-02'});
    wr(dir, 'out/meta_tour.json', {reg: 'M-D', updated: '2026-12-02T10:00:00Z', top: [], more: []});
    wr(dir, 'out/official.json', {reg: 'M-D', updated: '2026-12-02T10:00:00Z', events: [], checks: []});
    wr(dir, 'out/perf.json', {updated: '2026-12-02', reg: {id: 'M-D', name: 'Reg M-D', since: '2026-12-02'}});

    const r1 = spawnSync(process.execPath, ['sources.mjs'], {cwd: dir, encoding: 'utf8'});
    assert.equal(r1.status, 0, r1.stderr);
    const r2 = spawnSync(process.execPath, ['crosscheck.mjs'], {cwd: dir, encoding: 'utf8'});
    assert.equal(r2.status, 0, r2.stderr);

    const skipsPath = path.join(dir, 'out/skips.json');
    const skips = fs.existsSync(skipsPath) ? rd(dir, 'out/skips.json') : {runs: []};
    const steps = skips.runs.flatMap(r => r.steps || []);
    assert.deepEqual(steps, [], `expected 0 skips.json entries on M-D day 1, got: ${JSON.stringify(steps)}`);
  });

  // Day-N health fixture shared by cases 4 and 5: every out/ file healthy for reg `reg` (since `since`) on `now`.
  const healthFixture = (dir, now, reg = 'M-D', since = '2026-12-02') => {
    const iso = now + 'T10:00:00Z', pad = n => 'x'.repeat(n);
    const day = Math.floor((Date.parse(now) - Date.parse(since)) / 864e5) + 1, yday = new Date(Date.parse(now) - 864e5).toISOString().slice(0, 10);
    wr(dir, 'data/index.json', {tournaments: {t1: {d: now}}});
    wr(dir, 'out/split/index.json', {made: iso, sizes: {results: 50000}, split: {}});
    wr(dir, 'out/reg.json', {id: reg, name: 'Reg ' + reg, since, sd: 'gen9championsvgc2026reg' + reg.slice(2).toLowerCase(), checked: now});
    wr(dir, 'out/regstate.json', {reg: reg, day, events: 30, players: 2000, games: 5000, since, updated: iso});
    wr(dir, 'out/limitless.json', {reg: reg, updated: iso, teams: 500, results: {pad: pad(55000)}, adj: {rows: []}});
    wr(dir, 'out/meta_tour.json', {reg: reg, updated: iso, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, p: pad(500)}))});
    wr(dir, 'out/info.json', {reg: reg, updated: iso, N: 500, mv: {Protect: pad(1200)}});
    wr(dir, 'out/teams.json', {reg: reg, updated: iso, teams: Array.from({length: 6}, (_, i) => ({id: i, p: pad(400)}))});
    wr(dir, 'out/history.json', {reg: reg, days: [{d: yday, p: pad(600)}, {d: now, p: pad(600)}]});
    wr(dir, 'out/matches.json', {reg: reg, updated: iso, m: Array.from({length: 50}, () => [0, 1, 1]), pad: pad(5500)});
    wr(dir, 'out/model.json', {reg: reg, updated: iso, mons: {Incineroar: pad(5500)}});
    // Paused op.gg meta_ingame.json after reg-guard emptied it on Dec 2 (0 mons, ~110 bytes)
    wr(dir, 'out/meta_ingame.json', {reg: reg, format: 'doubles', kind: 'ingame', source: '', period: '', updated: '2026-12-02T09:15:00Z', top: [], more: []});
    wr(dir, 'out/meta_ladder.json', {reg: reg, month: '2026-12', updated: iso, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, p: pad(500)}))});
    wr(dir, 'out/events.json', {reg: reg, updated: iso, events: Array.from({length: 6}, (_, i) => ({id: i, p: pad(2000)}))});
    wr(dir, 'out/official.json', {reg: reg, updated: iso, events: [{id: 1, p: pad(1200)}]});
    // perf.json has NO ingame key because meta_ingame.json is empty/paused
    wr(dir, 'out/perf.json', {reg: {id: reg}, updated: iso, pad: pad(5500), tour: {updated: iso}, adj: {updated: iso}, smogon: {updated: '2026-12'}, ladder: {updated: iso}, outside: {lists: [{name: 'sdt', date: now}]}});
    wr(dir, 'out/practice.json', {reg: reg, updated: iso, rounds: Array.from({length: 25}, (_, i) => ({i, p: pad(250)}))});
    wr(dir, 'out/weekly.json', {reg: reg, v: 1, updated: iso, pad: pad(300)});
    wr(dir, 'out/calendar.json', {checked: now, ev: [{n: 'Future', s: '2027-01-10', e: '2027-01-12'}], pad: pad(250)});
    wr(dir, 'out/track.json', {reg: reg, v: 1, updated: iso, pad: pad(300)});
    wr(dir, 'out/sources.json', {reg: reg, updated: iso, problems: [], pad: pad(300)});
    wr(dir, 'out/crosscheck.json', {reg: reg, updated: iso, checks: [], pad: pad(300)});
    wr(dir, 'out/ratings_log.json', {updated: iso, byReg: {[reg]: [{d: now, p: pad(300)}]}});
    wr(dir, 'out/scoreboard.json', {updated: iso, pad: pad(300)});
  };
  const runHealth = (dir, now) => spawnSync(process.execPath, [path.join(ROOT, 'health.mjs'), `--root=${dir}`, `--now=${now}`], {
    env: {...process.env, GITHUB_STEP_SUMMARY: '', HEALTH_REPORT: ''}, encoding: 'utf8'
  });

  // 4) HIGH #4: health.mjs on Day 15 (Dec 16, inLaunch=false) with paused empty meta_ingame.json must pass exit 0
  check('4-health-day15-paused-empty-meta-ingame-passes', () => {
    const dir = path.join(TMP, 's4'), now = '2026-12-16';
    healthFixture(dir, now);
    const r = runHealth(dir, now);
    assert.equal(r.status, 0, `expected health exit 0 on day 15 with paused empty meta_ingame, got ${r.status}:\n${r.stdout}`);
  });

  // 5) MEDIUM #5: Smogon publishes a month's stats only after it ends, so in the first calendar month of a new regulation
  // (plus Smogon's 10-day publish lag) meta_ladder.json has no month yet and perf.json has no smogon part. That is expected,
  // not an alarm. Outside that window (a normal M-C day, or M-D after Jan 11) the same empty file must still fail.
  check('5-health-first-month-no-smogon-is-expected-not-error', () => {
    const emptyLadder = (dir, reg) => {
      wr(dir, 'out/meta_ladder.json', {reg, month: null, updated: '2026-12-02T09:15:00Z', top: [], more: []});
      const pf = rd(dir, 'out/perf.json'); delete pf.smogon; wr(dir, 'out/perf.json', pf);
    };
    for (const now of ['2026-12-16', '2026-12-31', '2027-01-10']) {
      const dir = path.join(TMP, 's5-' + now); healthFixture(dir, now); emptyLadder(dir, 'M-D');
      const r = runHealth(dir, now);
      assert.equal(r.status, 0, `expected exit 0 on ${now} (M-D first month, no Smogon month yet), got ${r.status}:\n${r.stdout}`);
    }
    // could-fail controls: the check is NOT weakened
    for (const [now, reg, since] of [['2027-01-12', 'M-D', '2026-12-02'], ['2026-11-25', 'M-C', '2026-09-01']]) {
      const dir = path.join(TMP, 's5-ctl-' + now); healthFixture(dir, now, reg, since); emptyLadder(dir, reg);
      const r = runHealth(dir, now);
      assert.equal(r.status, 1, `expected exit 1 on ${now} (${reg}, empty Smogon ladder past its first month), got ${r.status}`);
      assert.match(r.stdout, /meta_ladder\.json fewer than 10 Pok/, `expected the Smogon ladder alarm on ${now}`);
      assert.match(r.stdout, /no Smogon 1760\+ usage \(smogon\)/, `expected the perf.smogon alarm on ${now}`);
    }
  });

  // 6) MEDIUM #6: the date switch respects the official start time. M-C ends 2026-12-02T01:59:00Z (regulation.json); a run
  // with a clock time before that (the FAST_DATA 01:07 UTC run on Dec 2) stays on M-C; at/after it switches. A date-only day
  // keeps the old date rule. reg.mjs itself must pass the clock time (run here with a fixed clock, REG_OFFLINE=1).
  check('6-date-switch-waits-for-official-start-time', () => {
    const out = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import {detectReg, SITE_REG} from './formats.mjs';
      const prev = {id: 'M-C', since: SITE_REG.since, sd: SITE_REG.sd};
      const t = x => { const r = detectReg([], {}, prev, x); return r.id + '/' + (r.switched ? r.switched.by : null); };
      console.log(JSON.stringify(['2026-11-25T09:07:00Z', '2026-12-02T01:07:00Z', '2026-12-02T01:58:59Z', '2026-12-02T01:59:00Z', '2026-12-02T09:07:00Z', '2026-12-02'].map(t)));
    `], {cwd: ROOT, encoding: 'utf8'});
    assert.equal(out.status, 0, out.stderr);
    assert.equal(out.stdout.trim(), JSON.stringify(['M-C/null', 'M-C/null', 'M-C/null', 'M-D/date', 'M-D/date', 'M-D/date']));
    // reg.mjs end to end with a fixed clock
    for (const [clock, want] of [['2026-12-02T01:07:00Z', 'M-C'], ['2026-12-02T02:07:00Z', 'M-D']]) {
      const dir = path.join(TMP, 's6-' + clock.slice(11, 13));
      for (const f of ['regulation.json', 'formats.mjs', 'reg.mjs']) { fs.mkdirSync(dir, {recursive: true}); fs.copyFileSync(path.join(ROOT, f), path.join(dir, f)); }
      wr(dir, 'data/index.json', {tournaments: {}});
      wr(dir, 'out/reg.json', {id: 'M-C', name: 'Reg M-C', since: '2026-09-01', sd: 'gen9championsvgc2026regmc', checked: '2026-12-01'});
      wr(dir, 'clock.mjs', `const T = Date.parse(${JSON.stringify(clock)}), D = Date; globalThis.Date = class extends D { constructor(...a) { if (a.length) super(...a); else super(T); } static now() { return T; } };\n`);
      const r = spawnSync(process.execPath, ['--import', './clock.mjs', 'reg.mjs'], {cwd: dir, encoding: 'utf8', env: {...process.env, REG_OFFLINE: '1', REG_PROFILE_FILE: ''}});
      assert.equal(r.status, 0, r.stderr);
      const got = rd(dir, 'out/reg.json');
      assert.equal(got.id, want, `reg.mjs at ${clock}: expected ${want}, got ${got.id} (${r.stdout.trim()})`);
    }
  });
} finally {
  fs.rmSync(TMP, {recursive: true, force: true});
}

console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
process.exit(failed ? 1 : 0);
