// dec2-undo-drill.mjs (Kip job 51, Nov 26): Dec 2 regulation-switch undo drill in a scratch git repo.
// Never touches the real repo's out/ or regulation.json.
// Simulates:
//   1. Pre-switch M-C state committed in a scratch git repo (out/, data/index.json, .github/workflows/update.yml).
//   2. Dec 2 switch run (clock = 2026-12-02T12:00:00Z, M-D events present):
//      reg.mjs -> reg-guard.mjs -> model.mjs -> regstate.mjs -> scoreboard.mjs -> track.mjs -> split-docs.mjs -> git commit.
//   3. Documented undo (docs/undo-plan.md section 3):
//      U1: set REG_AUTO_SWITCH: '0' in .github/workflows/update.yml and commit
//      U2: git revert --no-edit <switch commit>
//   4. File-by-file verification against the pre-switch M-C snapshot (every pre-switch out/ file byte-identical,
//      no M-D files/archives left behind, no M-D leak in ratings_log/scoreboard/track/regstate/model/reg).
//   5. Post-undo safety check: next run of reg.mjs (with REG_AUTO_SWITCH=0 on Dec 2) keeps id=M-C (banner only),
//      reg-guard.mjs empties nothing, regstate.mjs stays M-C, health.mjs passes.
// Options for failure proofs:
//   --skip-hold     skip U1 (REG_AUTO_SWITCH=0) -> next reg.mjs re-switches to M-D -> drill MUST fail
//   --skip-revert   skip U2 (git revert)        -> out/ stays M-D -> drill MUST fail
// Run: node experiments/dec2-undo-drill.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skipHold = process.argv.includes('--skip-hold');
const skipRevert = process.argv.includes('--skip-revert');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dec2-undo-'));
const W = path.join(tmp, 'repo');
fs.mkdirSync(W, {recursive: true});

let fails = 0;
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };

// Copy all top-level *.mjs and *.json (pattern, not a fixed list) plus .github/workflows/update.yml
for (const e of fs.readdirSync(ROOT, {withFileTypes: true})) {
  if (e.isFile() && /\.(mjs|json)$/.test(e.name)) fs.copyFileSync(path.join(ROOT, e.name), path.join(W, e.name));
}
fs.mkdirSync(path.join(W, '.github/workflows'), {recursive: true});
fs.copyFileSync(path.join(ROOT, '.github/workflows/update.yml'), path.join(W, '.github/workflows/update.yml'));

// Preload hook to fake Date/Date.now for Dec 2 scripts
const clockPath = path.join(tmp, 'fake-clock.mjs');
fs.writeFileSync(clockPath, `
const t = Date.parse(process.env.FAKE_NOW);
const RealDate = Date;
class FakeDate extends RealDate {
  constructor(...a) { super(...(a.length ? a : [t])); }
  static now() { return t; }
}
globalThis.Date = FakeDate;
`);
const clockUrl = pathToFileURL(clockPath).href;

const wr = (rel, obj) => {
  const p = path.join(W, rel);
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, typeof obj === 'string' ? obj : JSON.stringify(obj));
};
const rd = rel => JSON.parse(fs.readFileSync(path.join(W, rel), 'utf8'));
const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, {cwd: W, encoding: 'utf8', env: {...process.env, ...env}});
  return {code: r.status, out: (r.stdout || '') + (r.stderr || '')};
};
const step = (label, cmd, args, env = {}) => {
  const r = run(cmd, args, env);
  console.log(`  step  ${label} -> exit ${r.code}`);
  if (r.code !== 0) console.log(r.out.split('\n').slice(0, 8).map(l => '        ' + l).join('\n'));
  return r;
};
const snapOut = () => {
  const map = new Map();
  const walk = (dir, rel = '') => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) walk(path.join(dir, e.name), r);
      else map.set(r, fs.readFileSync(path.join(dir, e.name), 'utf8'));
    }
  };
  walk(path.join(W, 'out'));
  return map;
};

try {
  // 1. Seed healthy pre-switch M-C state (2026-12-01) and commit in scratch git repo
  console.log('== 1. Seed pre-switch M-C state (2026-12-01)');
  const preDate = '2026-12-01', preIso = preDate + 'T10:00:00Z';
  const big = 'x'.repeat(60000);
  wr('data/index.json', {tournaments: {
    t_mc1: {d: '2026-11-30T18:00:00Z', p: 64, f: 'M-C'},
    t_mc2: {d: '2026-12-01T18:00:00Z', p: 80, f: 'M-C'}
  }});
  wr('out/reg.json', {id: 'M-C', name: 'Reg M-C', since: '2026-09-01', sd: 'gen9championsvgc2026regmc', site: 'M-C', now: null, switched: null, seen: {'M-C': {events: 2, players: 144, first: '2026-11-30', last: '2026-12-01', week: 2}}, checked: preDate});
  wr('out/regstate.json', {reg: 'M-C', day: 92, events: 100, players: 5000, games: 20000, since: '2026-09-01', updated: preIso});
  wr('out/limitless.json', {reg: 'M-C', updated: preIso, apiOk: true, results: {Pikachu: 10}, adj: {Pikachu: 0.5}, teams: 500, pad: big});
  wr('out/meta_tour.json', {reg: 'M-C', updated: preIso, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, u: 10})), pad: 'x'.repeat(6000)});
  wr('out/info.json', {reg: 'M-C', updated: preIso, N: 500, mv: {Protect: 'x'.repeat(1200)}});
  wr('out/teams.json', {reg: 'M-C', updated: preIso, teams: Array.from({length: 6}, () => ['M0']), pad: 'x'.repeat(2500)});
  wr('out/history.json', {reg: 'M-C', updated: preIso, days: [{d: '2026-11-30', tour: {M0: 1}}, {d: preDate, tour: {M0: 1}}], pad: 'x'.repeat(1200)});
  wr('out/matches.json', {reg: 'M-C', updated: preIso, m: ['x'.repeat(6000)]});
  wr('out/model.json', {reg: 'M-C', updated: preIso, ships: true, mons: {M0: 0.1}, pad: 'x'.repeat(6000)});
  wr('out/meta_ingame.json', {updated: '2026-11-18T10:00:00Z', top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, r: i + 1})), pad: 'x'.repeat(1200)});
  wr('out/meta_ladder.json', {reg: 'M-C', month: '2026-11', updated: preIso, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, u: 5})), pad: 'x'.repeat(6000)});
  wr('out/events.json', {reg: 'M-C', updated: preIso, events: Array.from({length: 6}, (_, i) => ({id: 'ev' + i, date: preDate, name: 'Ev ' + i, players: 64})), pad: 'x'.repeat(11000)});
  wr('out/official.json', {reg: 'M-C', updated: preIso, events: [], pad: 'x'.repeat(1200)});
  wr('out/perf.json', {reg: {id: 'M-C', name: 'Reg M-C', since: '2026-09-01'}, updated: preDate, tour: {updated: preDate, rows: []}, adj: {updated: preDate, rows: []}, smogon: {updated: '2026-11', rows: []}, ladder: {updated: preDate, rows: []}, outside: {lists: [{name: 'L1', date: preDate}]}, pad: 'x'.repeat(6000)});
  wr('out/practice.json', {reg: 'M-C', updated: preIso, rounds: Array.from({length: 25}, () => [0]), pad: 'x'.repeat(5500)});
  wr('out/weekly.json', {reg: 'M-C', v: 1, updated: preIso, pad: 'x'.repeat(300)});
  wr('out/calendar.json', {checked: preDate, ev: [{s: preDate, e: '2027-01-10'}], pad: 'x'.repeat(250)});
  wr('out/track.json', {reg: 'M-C', v: 1, updated: preIso, since: '2026-09-01', snaps: 10, last: preDate, top: 8, ev: [{id: 'e1'}], mons: [{n: 'M0'}], mb: [[1, 1], [1, 1], [1, 1], [1, 1]], fw: [], mv: null, pad: 'x'.repeat(250)});
  wr('out/sources.json', {reg: 'M-C', updated: preIso, pad: 'x'.repeat(300)});
  wr('out/crosscheck.json', {reg: 'M-C', updated: preIso, checks: [], pad: 'x'.repeat(300)});
  wr('out/ratings_log.json', {reg: 'M-C', updated: preIso, byReg: {'M-C': [{d: preDate, r: {M0: 85, M1: 70}}]}, pad: 'x'.repeat(300)});
  wr('out/scoreboard.json', {reg: 'M-C', updated: preIso, byReg: {'M-C': [{date: preDate, reg: 'M-C', model: {heldOutAcc: 0.56}}]}, history: [{date: preDate, reg: 'M-C'}], pad: 'x'.repeat(300)});
  step('split-docs (pre-switch)', process.execPath, ['--import', clockUrl, 'split-docs.mjs'], {FAKE_NOW: preIso});

  step('git init', 'git', ['init', '-q', '-b', 'main']);
  run('git', ['config', 'user.name', 'drill']);
  run('git', ['config', 'user.email', 'drill@local']);
  run('git', ['config', 'commit.gpgsign', 'false']);
  step('git add + commit pre-switch M-C', 'git', ['add', '-A']);
  step('git commit pre-switch', 'git', ['commit', '-qm', 'Limitless data 2026-12-01 (pre-switch M-C)']);
  const preSnap = snapOut();
  ok(preSnap.size > 20 && rd('out/reg.json').id === 'M-C', `pre-switch snapshot captured (${preSnap.size} files in out/, reg=M-C)`);

  // 2. Simulate Dec 2 switch run (clock = 2026-12-02T12:00:00Z, M-D events present)
  console.log('\n== 2. Simulate Dec 2 switch run (2026-12-02T12:00:00Z)');
  const dec2Iso = '2026-12-02T12:00:00Z';
  const idx = rd('data/index.json');
  idx.tournaments.t_md1 = {d: '2026-12-02T05:00:00Z', p: 64, f: 'M-D'};
  wr('data/index.json', idx);
  const dec2Env = {FAKE_NOW: dec2Iso, REG_OFFLINE: '1'};
  step('reg.mjs (Dec 2)', process.execPath, ['--import', clockUrl, 'reg.mjs'], dec2Env);
  step('reg-guard.mjs (Dec 2)', process.execPath, ['--import', clockUrl, 'reg-guard.mjs'], dec2Env);
  step('model.mjs (Dec 2)', process.execPath, ['--import', clockUrl, 'model.mjs'], dec2Env);
  step('regstate.mjs (Dec 2)', process.execPath, ['--import', clockUrl, 'regstate.mjs'], dec2Env);
  step('scoreboard.mjs (Dec 2)', process.execPath, ['--import', clockUrl, 'scoreboard.mjs'], dec2Env);
  step('track.mjs (Dec 2)', process.execPath, ['--import', clockUrl, 'track.mjs'], dec2Env);
  step('split-docs.mjs (Dec 2)', process.execPath, ['--import', clockUrl, 'split-docs.mjs'], dec2Env);
  step('git add Dec 2 switch', 'git', ['add', '-A']);
  step('git commit Dec 2 switch', 'git', ['commit', '-qm', 'Limitless data 2026-12-02']);
  const switchSha = run('git', ['rev-parse', 'HEAD']).out.trim();

  ok(rd('out/reg.json').id === 'M-D', `Dec 2 run switched out/reg.json to M-D (id=${rd('out/reg.json').id})`);
  ok(rd('out/regstate.json').reg === 'M-D', `Dec 2 run switched out/regstate.json to M-D`);
  ok(fs.existsSync(path.join(W, 'out/archive/M-C/limitless.json')), `Dec 2 run archived M-C limitless.json to out/archive/M-C/`);
  ok(fs.existsSync(path.join(W, 'out/archive/M-C/track.json')), `Dec 2 run archived M-C track.json to out/archive/M-C/`);

  // 3. Execute documented undo steps (docs/undo-plan.md section 3)
  console.log('\n== 3. Execute documented undo (docs/undo-plan.md section 3)');
  if (!skipHold) {
    // U1: set REG_AUTO_SWITCH: '0' in .github/workflows/update.yml
    const wfPath = path.join(W, '.github/workflows/update.yml');
    let wf = fs.readFileSync(wfPath, 'utf8');
    if (!/^\s*env:\s*$/m.test(wf)) wf = wf.replace(/^(jobs:\n)/m, "env:\n  REG_AUTO_SWITCH: '0'\n\n$1");
    else wf = wf.replace(/^(\s*env:\s*\n)/m, "$1  REG_AUTO_SWITCH: '0'\n");
    fs.writeFileSync(wfPath, wf);
    step('U1: commit REG_AUTO_SWITCH=0 in update.yml', 'git', ['commit', '-qam', 'Undo: hold regulation switch (REG_AUTO_SWITCH=0)']);
  } else {
    console.log('  SKIP  U1 (--skip-hold): REG_AUTO_SWITCH left enabled');
  }
  if (!skipRevert) {
    step('U2: git revert Dec 2 switch commit', 'git', ['revert', '--no-edit', switchSha]);
  } else {
    console.log('  SKIP  U2 (--skip-revert): switch commit NOT reverted');
  }

  // 4. File-by-file comparison against pre-switch M-C snapshot
  console.log('\n== 4. Compare restored out/ file-by-file against pre-switch M-C');
  const postSnap = snapOut();
  const diffs = [];
  for (const [k, v] of preSnap) {
    if (!postSnap.has(k)) diffs.push(`missing ${k}`);
    else if (postSnap.get(k) !== v) diffs.push(`differs ${k}`);
  }
  for (const k of postSnap.keys()) {
    if (!preSnap.has(k)) diffs.push(`extra ${k}`);
  }
  ok(diffs.length === 0, `out/ equals pre-switch M-C state file-by-file (${preSnap.size} files; diffs: ${diffs.length ? diffs.slice(0, 6).join(', ') : 'none'})`);
  ok(!fs.existsSync(path.join(W, 'out/archive/M-C')), 'out/archive/M-C removed by revert');
  ok(!fs.existsSync(path.join(W, 'out/track_M-C.json')), 'out/track_M-C.json removed by revert');
  const sb = rd('out/scoreboard.json'), rl = rd('out/ratings_log.json');
  ok(sb.reg === 'M-C' && !('M-D' in (sb.byReg || {})), `scoreboard.json back to M-C with no M-D leak (reg=${sb.reg}, keys=${Object.keys(sb.byReg || {}).join(',')})`);
  ok(rl.reg === 'M-C' && !('M-D' in (rl.byReg || {})), `ratings_log.json back to M-C with no M-D leak (reg=${rl.reg}, keys=${Object.keys(rl.byReg || {}).join(',')})`);

  // 5. Post-undo safety check: next run on Dec 2 with update.yml's REG_AUTO_SWITCH setting
  console.log('\n== 5. Post-undo run on Dec 2 (must stay M-C, no M-D leak)');
  const wfNow = fs.readFileSync(path.join(W, '.github/workflows/update.yml'), 'utf8');
  const holdSet = /REG_AUTO_SWITCH:\s*['"]?0['"]?/.test(wfNow);
  // Add M-D event back into data/index.json to simulate Limitless still serving M-D events after the undo
  const idxAfter = rd('data/index.json');
  idxAfter.tournaments.t_md1 = {d: '2026-12-02T05:00:00Z', p: 64, f: 'M-D'};
  wr('data/index.json', idxAfter);
  const postEnv = {FAKE_NOW: '2026-12-02T16:00:00Z', REG_OFFLINE: '1', ...(holdSet ? {REG_AUTO_SWITCH: '0'} : {})};
  step('post-undo reg.mjs', process.execPath, ['--import', clockUrl, 'reg.mjs'], postEnv);
  step('post-undo reg-guard.mjs', process.execPath, ['--import', clockUrl, 'reg-guard.mjs'], postEnv);
  step('post-undo regstate.mjs', process.execPath, ['--import', clockUrl, 'regstate.mjs'], postEnv);
  const h = step('post-undo health.mjs', process.execPath, ['health.mjs', '--root=' + W, '--now=2026-12-02']);

  const regPost = rd('out/reg.json'), rsPost = rd('out/regstate.json');
  ok(regPost.id === 'M-C', `post-undo reg.mjs stays on M-C (id=${regPost.id}, holdSet=${holdSet})`);
  ok(regPost.now && regPost.now.id === 'M-D', `post-undo reg.mjs shows M-D as banner only (now.id=${regPost.now && regPost.now.id})`);
  ok(rsPost.reg === 'M-C', `post-undo regstate.mjs stays on M-C (reg=${rsPost.reg})`);
  ok(!fs.existsSync(path.join(W, 'out/archive/M-C')), 'post-undo reg-guard.mjs emptied/archived nothing');
  ok(h.code === 0, `post-undo health.mjs passes on restored M-C state (exit=${h.code})`);
} finally {
  fs.rmSync(tmp, {recursive: true, force: true});
}

console.log(fails ? `dec2-undo-drill: ${fails} FAILED` : 'dec2-undo-drill: ALL PASSED');
process.exit(fails ? 1 : 0);
