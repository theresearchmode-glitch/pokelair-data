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

  // 4) HIGH #4: health.mjs on Day 15 (Dec 16, inLaunch=false) with paused empty meta_ingame.json must pass exit 0
  check('4-health-day15-paused-empty-meta-ingame-passes', () => {
    const dir = path.join(TMP, 's4');
    const now = '2026-12-16', iso = now + 'T10:00:00Z', pad = n => 'x'.repeat(n);
    wr(dir, 'data/index.json', {tournaments: {t1: {d: now}}});
    wr(dir, 'out/split/index.json', {made: iso, sizes: {results: 50000}, split: {}});
    wr(dir, 'out/reg.json', {id: 'M-D', name: 'Reg M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', checked: now});
    wr(dir, 'out/regstate.json', {reg: 'M-D', day: 15, events: 30, players: 2000, games: 5000, since: '2026-12-02', updated: iso});
    wr(dir, 'out/limitless.json', {reg: 'M-D', updated: iso, teams: 500, results: {pad: pad(55000)}, adj: {rows: []}});
    wr(dir, 'out/meta_tour.json', {reg: 'M-D', updated: iso, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, p: pad(500)}))});
    wr(dir, 'out/info.json', {reg: 'M-D', updated: iso, N: 500, mv: {Protect: pad(1200)}});
    wr(dir, 'out/teams.json', {reg: 'M-D', updated: iso, teams: Array.from({length: 6}, (_, i) => ({id: i, p: pad(400)}))});
    wr(dir, 'out/history.json', {reg: 'M-D', days: [{d: '2026-12-15', p: pad(600)}, {d: now, p: pad(600)}]});
    wr(dir, 'out/matches.json', {reg: 'M-D', updated: iso, m: Array.from({length: 50}, () => [0, 1, 1]), pad: pad(5500)});
    wr(dir, 'out/model.json', {reg: 'M-D', updated: iso, mons: {Incineroar: pad(5500)}});
    // Paused op.gg meta_ingame.json after reg-guard emptied it on Dec 2 (0 mons, ~110 bytes)
    wr(dir, 'out/meta_ingame.json', {reg: 'M-D', format: 'doubles', kind: 'ingame', source: '', period: '', updated: '2026-12-02T09:15:00Z', top: [], more: []});
    wr(dir, 'out/meta_ladder.json', {reg: 'M-D', month: '2026-12', updated: iso, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, p: pad(500)}))});
    wr(dir, 'out/events.json', {reg: 'M-D', updated: iso, events: Array.from({length: 6}, (_, i) => ({id: i, p: pad(2000)}))});
    wr(dir, 'out/official.json', {reg: 'M-D', updated: iso, events: [{id: 1, p: pad(1200)}]});
    // perf.json has NO ingame key because meta_ingame.json is empty/paused
    wr(dir, 'out/perf.json', {reg: {id: 'M-D'}, updated: iso, pad: pad(5500), tour: {updated: iso}, adj: {updated: iso}, smogon: {updated: '2026-12'}, ladder: {updated: iso}, outside: {lists: [{name: 'sdt', date: now}]}});
    wr(dir, 'out/practice.json', {reg: 'M-D', updated: iso, rounds: Array.from({length: 25}, (_, i) => ({i, p: pad(250)}))});
    wr(dir, 'out/weekly.json', {reg: 'M-D', v: 1, updated: iso, pad: pad(300)});
    wr(dir, 'out/calendar.json', {checked: now, ev: [{n: 'Future', s: '2027-01-10', e: '2027-01-12'}], pad: pad(250)});
    wr(dir, 'out/track.json', {reg: 'M-D', v: 1, updated: iso, pad: pad(300)});
    wr(dir, 'out/sources.json', {reg: 'M-D', updated: iso, problems: [], pad: pad(300)});
    wr(dir, 'out/crosscheck.json', {reg: 'M-D', updated: iso, checks: [], pad: pad(300)});
    wr(dir, 'out/ratings_log.json', {updated: iso, byReg: {'M-D': [{d: now, p: pad(300)}]}});
    wr(dir, 'out/scoreboard.json', {updated: iso, pad: pad(300)});

    const r = spawnSync(process.execPath, [path.join(ROOT, 'health.mjs'), `--root=${dir}`, `--now=${now}`], {
      env: {...process.env, GITHUB_STEP_SUMMARY: '', HEALTH_REPORT: ''}, encoding: 'utf8'
    });
    assert.equal(r.status, 0, `expected health exit 0 on day 15 with paused empty meta_ingame, got ${r.status}:\n${r.stdout}`);
  });
} finally {
  fs.rmSync(TMP, {recursive: true, force: true});
}

console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
process.exit(failed ? 1 : 0);
