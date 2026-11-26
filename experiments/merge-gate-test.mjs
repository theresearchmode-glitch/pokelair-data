// merge-gate-test.mjs (Kip job 43, Nov 25): the merge gate (docs/rebuild/merge-check.sh) and the pre-push hook
// (docs/rebuild/pre-push-hook.sh) on a SCRATCH repo with a local bare "origin" (never GitHub). Every `node <script>` the gate runs
// is replaced by a fake that logs its name, its arguments and which out/ it saw (frozen or today's), and fails on request;
// `gh` is a fake on PATH that reports GitHub green or red. Checks:
//   1. a merge into main runs main's list (test.yml's code tests on the FROZEN out/, then data checks + accuracy gate on today's
//      out/), leaves the tree clean and writes a stamp for main; a merge into claude/design6 runs design6's list unchanged.
//   2. a failing test blocks the stamp, for each target.
//   3. every safety check still stops it before the tests: report not read, GitHub red, HEAD not the merge, dirty tree, conflict
//      marker; plus a wrong or unknown target.
//   4. the hook refuses an unstamped merge to main and to claude/design6, refuses a merge stamped for the other branch, lets a
//      stamped one through, and ignores other branches.
// Run: node experiments/merge-gate-test.mjs   (needs git and bash; about 10 s)
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import {spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GATE = fs.readFileSync(path.join(ROOT, 'docs/rebuild/merge-check.sh'), 'utf8');
const HOOK = fs.readFileSync(path.join(ROOT, 'docs/rebuild/pre-push-hook.sh'), 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-gate-')), W = path.join(tmp, 'w'), BARE = path.join(tmp, 'origin.git');
const LOG = path.join(tmp, 'gate.log'), BIN = path.join(tmp, 'bin');
let fails = 0; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };
const sh = (cmd, env = {}, cwd = W) => { const r = spawnSync('bash', ['-c', cmd], {cwd, encoding: 'utf8', env: {...process.env, ...env}}); return {code: r.status, out: (r.stdout || '') + (r.stderr || '')}; };
const must = (cmd, cwd = W) => { const r = sh(cmd, {}, cwd); if (r.code !== 0) throw new Error(`setup failed: ${cmd}\n${r.out}`); return r.out.trim(); };

// the scripts the gate runs, read from the gate itself
const scripts = [...new Set([...GATE.matchAll(/node ((?:app|experiments)\/[\w./-]+\.mjs)/g)].map(m => m[1]))];
ok(scripts.length >= 10, `the gate names ${scripts.length} test scripts`);

// fake gh: the gate asks for "[status, conclusion]" of the newest test.yml run on the source tip
fs.mkdirSync(BIN);
fs.writeFileSync(path.join(BIN, 'gh'), '#!/usr/bin/env bash\nif [ "${GH_FAKE:-green}" = green ]; then printf \'completed\\tsuccess\\n\'; else printf \'completed\\tfailure\\n\'; fi\n', {mode: 0o755});
const PATH = BIN + path.delimiter + process.env.PATH;

// scratch repo: out/data.txt is "frozen" in the TEST_DATA commit and "today" on the tip
fs.mkdirSync(W); must(`git init -q --bare "${BARE}"`, tmp);
must('git init -q -b main && git config user.name t && git config user.email t@t && git config commit.gpgsign false && git config core.hooksPath .git/hooks');
for (const s of scripts) { const f = path.join(W, s); fs.mkdirSync(path.dirname(f), {recursive: true});
  fs.writeFileSync(f, `import fs from 'node:fs';\nconst d = fs.readFileSync('out/data.txt', 'utf8').trim();\n` +
    `fs.appendFileSync(process.env.GATE_LOG, ${JSON.stringify(s)} + (process.argv.length > 2 ? ' ' + process.argv.slice(2).join(' ') : '') + ' @' + d + '\\n');\n` +
    `if (process.env.GATE_FAIL === ${JSON.stringify(s)}) { console.log('FAIL fake failure'); process.exit(1); }\nconsole.log('fake ok');\n`); }
fs.mkdirSync(path.join(W, 'docs/rebuild'), {recursive: true}); fs.mkdirSync(path.join(W, 'out')); fs.mkdirSync(path.join(W, '.github/workflows'), {recursive: true});
fs.writeFileSync(path.join(W, 'docs/rebuild/merge-check.sh'), GATE); fs.writeFileSync(path.join(W, 'docs/rebuild/pre-push-hook.sh'), HOOK);
fs.writeFileSync(path.join(W, 'out/data.txt'), 'frozen\n'); fs.writeFileSync(path.join(W, 'out/only-frozen.txt'), 'x\n');
must('git add -A && git commit -qm frozen-data');
const TD = must('git rev-parse HEAD');
fs.writeFileSync(path.join(W, 'out/data.txt'), 'today\n'); fs.rmSync(path.join(W, 'out/only-frozen.txt'));
fs.writeFileSync(path.join(W, '.github/workflows/test.yml'), `jobs:\n  test:\n    steps:\n      - name: Use the frozen test data\n        env:\n          TEST_DATA: ${TD}\n`);
must('git add -A && git commit -qm today');
must(`git remote add origin "${BARE}" && git push -q origin main && git fetch -q origin`);
// claude/design6 is ahead of main by one commit (as today: they differ), so a merge made on one is not on the other's line
must('git switch -q -c claude/design6 && echo d6 > d6.txt && git add d6.txt && git commit -qm design6-only && git push -q origin claude/design6 && git fetch -q origin && git switch -q main');
fs.copyFileSync(path.join(W, 'docs/rebuild/pre-push-hook.sh'), path.join(W, '.git/hooks/pre-push')); fs.chmodSync(path.join(W, '.git/hooks/pre-push'), 0o755);
const feature = name => { must(`git switch -q -c ${name} origin/main && echo ${name} > ${name.replace(/\W/g, '_')}.txt && git add -A && git commit -qm ${name} && git push -q origin ${name} && git fetch -q origin`); };
const mergeInto = (target, src) => must(`git switch -q -C ${target} origin/${target} && git merge -q --no-ff --no-edit origin/${src}`);
const gate = (src, env = {}, args = '') => { fs.writeFileSync(LOG, '');
  const r = sh(`bash docs/rebuild/merge-check.sh origin/${src} ${args}`, {PATH, GATE_LOG: LOG, REPORT_OK: '1', ...env});
  return {...r, ran: fs.readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean)}; };
const stampOf = () => { const f = path.join(W, '.git/merge-ok', must('git rev-parse HEAD')); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : null; };
const unstamp = () => fs.rmSync(path.join(W, '.git/merge-ok'), {recursive: true, force: true});
const clean = () => sh('git diff --quiet && git diff --cached --quiet && [ -z "$(git status --porcelain)" ]').code === 0;

// main's list as .github/workflows/test.yml runs it for main's code (origin/main f4017535): code tests on the frozen out/,
// then the data checks and the accuracy gate on today's out/ (live-data audits are alert-only on GitHub, so not gated)
const MAIN_FROZEN = ['app/test/run.mjs', 'experiments/replays-test.mjs', 'experiments/reg-profile-test.mjs', 'experiments/reg-switch-test.mjs',
  'experiments/no-rk9-test.mjs', 'experiments/date-switch-test.mjs', 'experiments/reg-guard-test.mjs', 'experiments/md-switch-data-gaps-test.mjs',
  'experiments/md-day-one-test.mjs', 'experiments/freshness-test.mjs', 'experiments/bo3-tagging-test.mjs', 'experiments/shadow-model-test.mjs',
  'experiments/dec2-landing-fixes-test.mjs', 'experiments/speed-check.mjs', 'experiments/calc-check.mjs 2000', 'experiments/legality-check.mjs',
  'experiments/threat-check.mjs', 'experiments/fields-audit.mjs', 'experiments/suggest-gaps.mjs', 'experiments/suggest-audit.mjs 30 5',
  'experiments/build-logic.mjs', 'experiments/lead-logic.mjs', 'experiments/sync-logic.mjs', 'experiments/typing-sync.mjs',
  'experiments/sync-quiet.mjs', 'experiments/golden.mjs', 'experiments/same-grade.mjs', 'experiments/plan-cache-test.mjs'].map(s => s + ' @frozen');
const MAIN_TODAY = ['app/build.mjs', 'app/test/run.mjs', 'experiments/threat-check.mjs', 'experiments/lead-logic.mjs', 'experiments/golden.mjs',
  'app/build.mjs', 'experiments/accuracy-gate.mjs'].map(s => s + ' @today');
// design6's list exactly as it was before job 43 (merge-check.sh on claude/design6 c062acf1); the scratch tree has today's out/
const D6 = ['app/build.mjs', 'app/test/run.mjs', 'experiments/strength-invariants.mjs', 'app/build.mjs --v2 --preview-data',
  'experiments/commander-test.mjs', 'experiments/score-src-test.mjs', 'experiments/unrated-test.mjs', 'experiments/a11y-code.mjs',
  'app/test/v2-public.mjs', 'experiments/public-build-test.mjs', 'experiments/security-csp-test.mjs --self-test',
  'app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public', 'experiments/security-csp-test.mjs',
  'app/build.mjs', 'app/build.mjs --v2', 'app/test/v2-saved.mjs'].map(s => s + ' @today');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const firstDiff = (a, b) => { const i = a.findIndex((x, k) => x !== b[k]); return i < 0 ? (a.length === b.length ? '' : `length ${a.length} vs ${b.length}`) : `#${i}: ran "${a[i]}", expected "${b[i]}"`; };

try {
  // 1. each target runs its own list and stamps for that target
  feature('alt/m1'); mergeInto('main', 'alt/m1');
  let r = gate('alt/m1');
  ok(r.code === 0 && stampOf() === `${must('git rev-parse HEAD')} main`, `1a. merge into main (target read from the branch): exit ${r.code}, stamp "${stampOf()}"`);
  ok(same(r.ran, [...MAIN_FROZEN, ...MAIN_TODAY]), `1b. main runs test.yml's main list: frozen out/ for code tests, today's for data checks ${firstDiff(r.ran, [...MAIN_FROZEN, ...MAIN_TODAY])}`);
  ok(clean(), '1c. after the main run the tree is clean again (frozen out/ put back, nothing staged or left over)');
  if (r.code !== 0) console.log(r.out.split('\n').map(l => '          ' + l).join('\n'));
  feature('alt/d1'); mergeInto('claude/design6', 'alt/d1');
  r = gate('alt/d1');
  ok(r.code === 0 && stampOf() === `${must('git rev-parse HEAD')} claude/design6`, `1d. merge into claude/design6: exit ${r.code}, stamp "${stampOf()}"`);
  ok(same(r.ran, D6), `1e. claude/design6 runs the same list as before job 43 ${firstDiff(r.ran, D6)}`);
  unstamp(); r = gate('alt/d1', {}, 'claude/design6');
  ok(r.code === 0 && same(r.ran, D6), `1f. target given as the 2nd argument works too (exit ${r.code})`);

  // 2. a failing test blocks the stamp
  unstamp(); mergeInto('main', 'alt/m1'); r = gate('alt/m1', {GATE_FAIL: 'experiments/golden.mjs'});
  ok(r.code === 1 && stampOf() === null && /FAIL/.test(r.out), `2a. main: golden.mjs failing -> exit ${r.code}, no stamp`);
  ok(clean(), '2b. ... and the tree is still clean afterwards');
  unstamp(); mergeInto('claude/design6', 'alt/d1'); r = gate('alt/d1', {GATE_FAIL: 'experiments/unrated-test.mjs'});
  ok(r.code === 1 && stampOf() === null, `2c. claude/design6: unrated-test.mjs failing -> exit ${r.code}, no stamp`);

  // 3. the safety checks still stop it before any test runs
  unstamp(); mergeInto('main', 'alt/m1');
  const before = (name, res) => ok(res.code !== 0 && res.ran.length === 0 && stampOf() === null, `${name} (exit ${res.code}, ${res.ran.length} tests run, no stamp)`);
  before('3a. REPORT_OK not set stops it', gate('alt/m1', {REPORT_OK: ''}));
  before('3b. GitHub red on the source tip stops it', gate('alt/m1', {GH_FAKE: 'red'}));
  feature('alt/m2'); mergeInto('main', 'alt/m1'); before('3c. HEAD not the merge of the named branch stops it', gate('alt/m2'));
  fs.appendFileSync(path.join(W, 'out/data.txt'), 'dirty\n'); before('3d. uncommitted change stops it', gate('alt/m1')); must('git checkout -- out/data.txt');
  fs.writeFileSync(path.join(W, 'y.txt'), '<'.repeat(7) + ' HEAD\na\n' + '='.repeat(7) + '\nb\n' + '>'.repeat(7) + ' origin/alt/m1\n');
  must('git add y.txt && git commit -q --amend --no-edit'); // still the merge of alt/m1 (same parents), now carrying a marker
  before('3e. a conflict marker in the merge stops it', gate('alt/m1'));
  mergeInto('main', 'alt/m1');
  before('3f. a merge made on main but gated as claude/design6 stops it (wrong target)', gate('alt/m1', {}, 'claude/design6'));
  r = gate('alt/m1', {}, 'live'); ok(r.code === 2 && r.ran.length === 0, `3g. an unknown target is refused (exit ${r.code})`);
  must('git switch -q --detach'); r = gate('alt/m1'); ok(r.code === 2 && r.ran.length === 0, `3h. no target and not on main/claude/design6 is refused (exit ${r.code})`);

  // 4. the pre-push hook, pushing to the local bare repo
  unstamp(); mergeInto('main', 'alt/m1');
  const remoteTip = br => must(`git --git-dir="${BARE}" rev-parse refs/heads/${br}`, tmp);
  let was = remoteTip('main'), p = sh('git push origin main');
  ok(p.code !== 0 && /REFUSED/.test(p.out) && remoteTip('main') === was, '4a. hook refuses an unstamped merge pushed to main');
  mergeInto('claude/design6', 'alt/d1'); was = remoteTip('claude/design6'); p = sh('git push origin claude/design6');
  ok(p.code !== 0 && /REFUSED/.test(p.out) && remoteTip('claude/design6') === was, '4b. hook refuses an unstamped merge pushed to claude/design6');
  r = gate('alt/d1'); const d6merge = must('git rev-parse HEAD');
  was = remoteTip('main'); p = sh(`git push origin ${d6merge}:refs/heads/main`);
  ok(r.code === 0 && p.code !== 0 && /REFUSED/.test(p.out) && remoteTip('main') === was, '4c. hook refuses a merge stamped for claude/design6 pushed to main');
  p = sh('git push origin claude/design6');
  ok(p.code === 0 && remoteTip('claude/design6') === d6merge, `4d. hook lets the stamped merge into claude/design6 through (exit ${p.code})`);
  must('git fetch -q origin'); mergeInto('main', 'alt/m1'); r = gate('alt/m1'); p = sh('git push origin main');
  ok(r.code === 0 && p.code === 0 && remoteTip('main') === must('git rev-parse HEAD'), `4e. hook lets the stamped merge into main through (exit ${p.code})`);
  must('git fetch -q origin && git switch -q -C alt/side origin/alt/m2 && git merge -q --no-ff --no-edit origin/alt/m1'); p = sh('git push origin alt/side');
  ok(p.code === 0, `4f. hook ignores branches other than main / claude/design6 (exit ${p.code})`);

  // 5. Kip job 48: Saturday merge into main (merge's own test.yml has design6's v2 step) runs BOTH test lists
  must('git fetch -q origin && git switch -q -c alt/sat-switch origin/main');
  fs.appendFileSync(path.join(W, '.github/workflows/test.yml'), '      - run: node app/test/v2-public.mjs\n');
  must('git add .github/workflows/test.yml && git commit -qm sat-switch && git push -q origin alt/sat-switch && git fetch -q origin');
  unstamp(); mergeInto('main', 'alt/sat-switch');
  r = gate('alt/sat-switch');
  ok(r.code === 0 && stampOf() === `${must('git rev-parse HEAD')} main`, `5a. Saturday merge into main (test.yml has v2-public.mjs): exit ${r.code}, stamp "${stampOf()}"`);
  ok(same(r.ran, [...MAIN_FROZEN, ...MAIN_TODAY, ...D6]), `5b. Saturday merge runs BOTH lists (main + design6) ${firstDiff(r.ran, [...MAIN_FROZEN, ...MAIN_TODAY, ...D6])}`);
  ok(clean(), '5c. after Saturday merge run the tree is clean');
  unstamp(); mergeInto('main', 'alt/sat-switch');
  r = gate('alt/sat-switch', {GATE_FAIL: 'app/test/v2-public.mjs'});
  ok(r.code === 1 && stampOf() === null, `5d. Saturday merge: failing design6-list test (v2-public.mjs) blocks main stamp (exit ${r.code}, stamp=${stampOf()})`);
  unstamp(); mergeInto('main', 'alt/sat-switch');
  r = gate('alt/sat-switch', {GATE_FAIL: 'experiments/golden.mjs'});
  ok(r.code === 1 && stampOf() === null, `5e. Saturday merge: failing main-list test (golden.mjs) still blocks main stamp (exit ${r.code}, stamp=${stampOf()})`);
} catch (e) { ok(false, 'setup: ' + e.message); }

fs.rmSync(tmp, {recursive: true, force: true});
console.log(fails ? `merge-gate-test: ${fails} FAILED` : 'merge-gate-test: ALL PASSED');
process.exit(fails ? 1 : 0);
