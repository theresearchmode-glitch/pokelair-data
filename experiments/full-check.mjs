// The full check run, in one command (R4, Nov 11): proves today's site behaves exactly as at a known-good commit after shared
// code moves, then runs every check GitHub runs plus the behaviour tests. Made for Sim's PC (faster, doesn't restart) and the
// cloud alike. LOOK ONLY: it changes no code; it writes one report.
// Usage: node experiments/full-check.mjs <base-ref> [label]
//   base-ref  a commit whose today's page is the known-good one (e.g. 4a674b0); its page is built in a temporary worktree
//   label     names the report: docs/rebuild/test-runs/full-check-<label>.txt (default: today's date)
// Needs: node, the repo's node_modules (playwright with its Chromium), git. About 1-2 hours on the cloud machine.
import {execFileSync, spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const [ref, label = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);
if (!ref) { console.error('usage: node experiments/full-check.mjs <base-ref> [label]'); process.exit(2); }
const out = path.join(ROOT, 'docs/rebuild/test-runs', `full-check-${label}.txt`), log = s => { fs.appendFileSync(out, s + '\n'); console.log(s); };
fs.writeFileSync(out, `Full check run, ${new Date().toISOString()}\nbase ${ref} vs working tree ${execFileSync('git', ['rev-parse', '--short', 'HEAD'], {cwd: ROOT}).toString().trim()}${execFileSync('git', ['status', '--porcelain'], {cwd: ROOT}).toString().trim() ? ' (with uncommitted changes)' : ''}\n`);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'np-check-')), A = path.join(tmp, 'base.html'), B = path.join(tmp, 'now.html');
// 1) the known-good page from base-ref, built in a temporary worktree (data and node_modules from this checkout)
const wt = path.join(tmp, 'wt'); execFileSync('git', ['worktree', 'add', '--detach', wt, ref], {cwd: ROOT, stdio: 'ignore'});
try {
  for (const d of ['out', 'node_modules', 'docs']) { try { fs.rmSync(path.join(wt, d), {recursive: true, force: true}); fs.symlinkSync(path.join(ROOT, d), path.join(wt, d), 'junction'); } catch (e) {} }
  execFileSync(process.execPath, ['app/build.mjs'], {cwd: wt, stdio: 'ignore'}); fs.copyFileSync(path.join(wt, 'app/dist/page.html'), A);
} finally { try { execFileSync('git', ['worktree', 'remove', '--force', wt], {cwd: ROOT, stdio: 'ignore'}); } catch (e) {} }
// 2) today's page and the new build from the working tree
execFileSync(process.execPath, ['app/build.mjs'], {cwd: ROOT, stdio: 'ignore'}); fs.copyFileSync(path.join(ROOT, 'app/dist/page.html'), B);
execFileSync(process.execPath, ['app/build.mjs', '--v2'], {cwd: ROOT, stdio: 'ignore'});
const run = (name, args, pick, mins = 40) => { log(`== ${name}`); const r = spawnSync(process.execPath, args, {cwd: ROOT, encoding: 'utf8', timeout: mins * 60e3, maxBuffer: 1 << 28});
  const txt = (r.stdout || '') + (r.stderr || ''), lines = txt.split('\n').filter(l => pick.test(l)); log(lines.length ? lines.slice(-1)[0] : `NO RESULT LINE (exit ${r.status}${r.error ? ', ' + r.error.message : ''}); last output: ${txt.trim().split('\n').slice(-3).join(' | ')}`); };
// 3) today's site unchanged: every same-output proof (base page vs now)
// SMOKE=1: only the first proof (to check the script itself works)
const SMOKE = !!process.env.SMOKE;
for (const c of SMOKE ? ['same-import'] : ['same-import', 'same-box', 'same-record', 'same-compare', 'same-edits', 'same-saved', 'same-team', 'same-info', 'same-sheet', 'same-share', 'same-matchups', 'same-six', 'same-why'])
  run(c, [`experiments/${c}.mjs`, A, B], /compared|identical/);
if (SMOKE) { log('SMOKE DONE'); fs.rmSync(tmp, {recursive: true, force: true}); process.exit(0); }
run('same-share-v2', ['experiments/same-share-v2.cjs', B], /share images/);
// 4) every check GitHub runs, and the behaviour tests on today's page
run('run.mjs', ['app/test/run.mjs'], /PASSED|FAIL/);
const keep = fs.readFileSync(path.join(ROOT, 'app/test/behaviour/results.json'), 'utf8');
for (const g of ['A-team', 'C-battle', 'D-meta-shell']) run(`behaviour ${g}`, ['app/test/behaviour/run.mjs', g], /^behaviour:/, 60);
fs.writeFileSync(path.join(ROOT, 'app/test/behaviour/results.json'), keep);
run('golden', ['experiments/golden.mjs'], /known-answer/); run('same-grade', ['experiments/same-grade.mjs'], /PASSED|FAIL/); run('suggest-audit', ['experiments/suggest-audit.mjs'], /AUDIT|FAIL/);
log('DONE'); fs.rmSync(tmp, {recursive: true, force: true});
