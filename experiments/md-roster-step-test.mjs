// Fixture test for experiments/md-roster-step.mjs (Job 42, Nov 25).
// Runs md-roster-step.mjs in a scratch copy of the repo with a fake regulation fixture adding
// 2 existing Showdown Pokémon not in our roster (Latios, Latias) + 1 Mega (Latios-Mega).
// Checks:
//   1. Broken inputs fail fast with exit 1 and plain error messages (missing sprite ID, bad --ps, bad --reg).
//   2. Default DRY-RUN prints planned changes and modifies 0 files.
//   3. --write updates data.js, roster.json, 15-visual-helpers.js, items-list.js, 24-sheet-data.js, regulation.json.
//   4. Running --write a second time is byte-for-byte idempotent across all 6 files.
//   5. rules-fixes-test.mjs, unrated-test.mjs, and pokemon-pages-test.mjs still pass after the roster update.
// Run: node experiments/md-roster-step-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PS_DIR = path.join(ROOT, 'node_modules/pokemon-showdown');
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); if (!cond) fails++; };
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

if (!fs.existsSync(path.join(PS_DIR, 'dist'))) {
  console.error('Showdown not built at node_modules/pokemon-showdown/dist');
  process.exit(1);
}

// Build a clean scratch copy of the repo (symlinking node_modules, out, and art dirs except art where we add 3 fixture webps)
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'md-roster-test-'));
const cpDir = (src, dst) => fs.cpSync(src, dst, {recursive: true});
cpDir(path.join(ROOT, 'app/src'), path.join(scratch, 'app/src'));
fs.mkdirSync(path.join(scratch, 'app/dist'), {recursive: true});
fs.symlinkSync(path.join(ROOT, 'app/test'), path.join(scratch, 'app/test'));
fs.symlinkSync(path.join(ROOT, 'docs'), path.join(scratch, 'docs'));
/* every top-level build file in app/ (Nov 26, HH: a fixed list missed app/static-pages.mjs once /pokemon landed, so the scratch
   public build failed and 5c reported it as a roster problem) */
for (const f of fs.readdirSync(path.join(ROOT, 'app')).filter(f => /\.(mjs|json)$/.test(f))) {
  if (fs.statSync(path.join(ROOT, 'app', f)).isFile()) fs.copyFileSync(path.join(ROOT, 'app', f), path.join(scratch, 'app', f));
}
fs.copyFileSync(path.join(ROOT, 'roster.json'), path.join(scratch, 'roster.json'));
/* the repo-root modules the build imports (static-pages.mjs reads ../split-docs.mjs); only read, never changed by the roster step */
for (const f of fs.readdirSync(ROOT).filter(f => /\.mjs$/.test(f))) if (!fs.existsSync(path.join(scratch, f))) fs.copyFileSync(path.join(ROOT, f), path.join(scratch, f));
fs.mkdirSync(path.join(scratch, 'experiments'), {recursive: true});
for (const f of ['gen-roster.mjs', 'md-roster-step.mjs', 'rules-fixes-test.mjs', 'unrated-test.mjs', 'pokemon-pages-test.mjs', 'add-sprites.mjs']) {
  if (fs.existsSync(path.join(ROOT, 'experiments', f))) fs.copyFileSync(path.join(ROOT, 'experiments', f), path.join(scratch, 'experiments', f));
}
fs.mkdirSync(path.join(scratch, 'data'), {recursive: true});
fs.copyFileSync(path.join(ROOT, 'data/regmc-items.txt'), path.join(scratch, 'data/regmc-items.txt'));
fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(scratch, 'node_modules'));
fs.symlinkSync(path.join(ROOT, 'out'), path.join(scratch, 'out'));
if (fs.existsSync(path.join(ROOT, 'package.json'))) fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(scratch, 'package.json'));

// Synthetic regulation.json in scratch (same shape as main's regulation.json)
fs.writeFileSync(path.join(scratch, 'regulation.json'), JSON.stringify({
  site: 'M-C',
  regs: {
    'M-C': {name: 'Reg M-C', long: 'Regulation M-C', sd: 'gen9championsvgc2026regmc', since: '2026-09-01'},
    'M-D': {name: 'Reg M-D', long: 'Regulation M-D', sd: 'gen9championsvgc2026regmd', since: '2026-12-02'}
  }
}, null, 2) + '\n');

// Fixture: 2 existing Showdown Pokémon not in ROSTER + 1 Mega
const fixtureMons = [
  {n: 'Latias', b: 'Latias', num: 380, t: ['Dragon', 'Psychic'], st: [80, 80, 90, 110, 130, 110], a: ['Levitate'], m: 0, sprite: 380},
  {n: 'Latios', b: 'Latios', num: 381, t: ['Dragon', 'Psychic'], st: [80, 90, 80, 130, 110, 110], a: ['Levitate'], m: 0, sprite: 381},
  {n: 'Latios-Mega', b: 'Latios', num: 381, t: ['Dragon', 'Psychic'], st: [80, 130, 100, 160, 120, 110], a: ['Levitate'], m: 1, learnFrom: 'Latios', sprite: 10062}
];
const addFile = path.join(scratch, 'fixture-add.json');
fs.writeFileSync(addFile, JSON.stringify(fixtureMons, null, 2));

const itemsFile = path.join(scratch, 'data/regmd-items.txt');
fs.writeFileSync(itemsFile, fs.readFileSync(path.join(scratch, 'data/regmc-items.txt'), 'utf8').trim() + '\nLatiosite\n');

// Placeholder art files in scratch for the 3 fixture sprite IDs so pokemon-pages-test preload checks pass
const sampleWebp = path.join(scratch, 'app/src/v2/art/445.webp');
if (fs.existsSync(sampleWebp)) {
  for (const id of [380, 381, 10062]) fs.copyFileSync(sampleWebp, path.join(scratch, `app/src/v2/art/${id}.webp`));
}

const runStep = extraArgs => spawnSync(process.execPath, [path.join(scratch, 'experiments/md-roster-step.mjs'), '--root', scratch, '--ps', PS_DIR, ...extraArgs], {cwd: scratch, encoding: 'utf8'});

// 1. Broken step proofs (must fail with exit 1 + plain error)
{
  const badAdd = path.join(scratch, 'bad-add.json');
  fs.writeFileSync(badAdd, JSON.stringify([{n: 'Latios', b: 'Latios', num: 381, t: ['Dragon', 'Psychic'], st: [80, 90, 80, 130, 110, 110], a: ['Levitate'], m: 0}]));
  const r1 = runStep(['--add', badAdd]);
  ok(r1.status === 1 && /missing SPRITE_ID.*Latios/.test(r1.stderr), `1a broken step (missing sprite ID) fails fast (exit=${r1.status})`);

  const r2 = spawnSync(process.execPath, [path.join(scratch, 'experiments/md-roster-step.mjs'), '--root', scratch, '--ps', '/nonexistent-ps-dir'], {cwd: scratch, encoding: 'utf8'});
  ok(r2.status === 1 && /Showdown is not built/.test(r2.stderr), `1b broken step (bad --ps) fails fast (exit=${r2.status})`);

  const r3 = runStep(['--reg', 'BAD']);
  ok(r3.status === 1 && /--reg must look like/.test(r3.stderr), `1c broken step (bad --reg) fails fast (exit=${r3.status})`);
}

const TARGETS = [
  'app/src/data/data.js',
  'roster.json',
  'app/src/app/15-visual-helpers.js',
  'app/src/data/items-list.js',
  'app/src/app/24-sheet-data.js',
  'regulation.json'
].map(f => path.join(scratch, f));
const snapHashes = () => TARGETS.map(sha);

// 2. Dry-run modifies 0 files
{
  const h0 = snapHashes();
  const r = runStep(['--add', addFile, '--items', itemsFile, '--reg', 'M-D']);
  const h1 = snapHashes();
  ok(r.status === 0 && r.stdout.includes('DRY-RUN COMPLETE') && JSON.stringify(h0) === JSON.stringify(h1),
    `2a dry-run exits 0 and modifies 0 files (exit=${r.status}, unchanged=${JSON.stringify(h0) === JSON.stringify(h1)})`);
}

// 3. --write updates all 6 files as expected
{
  const r = runStep(['--add', addFile, '--items', itemsFile, '--reg', 'M-D', '--write']);
  const dataTxt = fs.readFileSync(path.join(scratch, 'app/src/data/data.js'), 'utf8');
  const rosterArr = JSON.parse(fs.readFileSync(path.join(scratch, 'roster.json'), 'utf8'));
  const helpTxt = fs.readFileSync(path.join(scratch, 'app/src/app/15-visual-helpers.js'), 'utf8');
  const itemsTxt = fs.readFileSync(path.join(scratch, 'app/src/data/items-list.js'), 'utf8');
  const sheetTxt = fs.readFileSync(path.join(scratch, 'app/src/app/24-sheet-data.js'), 'utf8');
  const regObj = JSON.parse(fs.readFileSync(path.join(scratch, 'regulation.json'), 'utf8'));
  ok(r.status === 0 && r.stdout.includes('md-roster-step: DONE'), `3a --write succeeds (exit=${r.status})`);
  ok(dataTxt.includes('"n":"Latios"') && dataTxt.includes('"n":"Latias"') && dataTxt.includes('"n":"Latios-Mega"') && dataTxt.includes('"n":"Meowstic-F"'),
    '3b data.js has Latios, Latias, Latios-Mega, and preserves Meowstic-F');
  ok(rosterArr.includes('Latios') && rosterArr.includes('Latias') && rosterArr.includes('Latios-Mega') && rosterArr.length === 349,
    `3c roster.json updated (${rosterArr.length} names)`);
  ok(helpTxt.includes('"Latios":381') && helpTxt.includes('"Latias":380') && helpTxt.includes('"Latios-Mega":10062'),
    '3d 15-visual-helpers.js SPRITE_ID updated for all 3 fixture Pokémon');
  ok(itemsTxt.includes('"Latiosite"'), '3e items-list.js updated with Latiosite');
  ok(sheetTxt.includes("const PAGE_REG = 'M-D';") && regObj.site === 'M-D', '3f PAGE_REG and regulation.json site updated to M-D');
}

// 4. Idempotency: running --write a second time changes nothing
{
  const h1 = snapHashes();
  const r2 = runStep(['--add', addFile, '--items', itemsFile, '--reg', 'M-D', '--write']);
  const h2 = snapHashes();
  ok(r2.status === 0 && JSON.stringify(h1) === JSON.stringify(h2),
    `4a second --write is byte-for-byte idempotent across all 6 files (exit=${r2.status}, identical=${JSON.stringify(h1) === JSON.stringify(h2)})`);
}

// 5. Post-roster regression tests on scratch copy
{
  const b1 = spawnSync(process.execPath, ['app/build.mjs'], {cwd: scratch, encoding: 'utf8'});
  const t1 = spawnSync(process.execPath, ['experiments/rules-fixes-test.mjs'], {cwd: scratch, encoding: 'utf8'});
  ok(b1.status === 0 && t1.status === 0, `5a rules-fixes-test passes after roster update (build=${b1.status}, test=${t1.status}: ${(t1.stdout || '').trim().split('\n').pop()})`);

  const b2 = spawnSync(process.execPath, ['app/build.mjs', '--v2', '--preview-data'], {cwd: scratch, encoding: 'utf8'});
  const t2 = spawnSync(process.execPath, ['experiments/unrated-test.mjs'], {cwd: scratch, env: {...process.env, PAGE: path.join(scratch, 'app/dist/v2.html')}, encoding: 'utf8'});
  ok(b2.status === 0 && t2.status === 0, `5b unrated-test passes after roster update (build=${b2.status}, test=${t2.status}: ${(t2.stdout || '').trim().split('\n').pop()})`);

  const b3 = spawnSync(process.execPath, ['app/build.mjs', '--v2', '--split', '--one-art-size', '--art=../src/v2/art/', '--public'], {cwd: scratch, encoding: 'utf8'});
  const t3 = spawnSync(process.execPath, ['experiments/pokemon-pages-test.mjs'], {cwd: scratch, encoding: 'utf8'});
  ok(b3.status === 0 && t3.status === 0, `5c pokemon-pages-test passes after roster update (build=${b3.status}, test=${t3.status}: ${(t3.stdout || '').trim().split('\n').pop()}${b3.status ? '; build said: ' + ((b3.stderr || '') + (b3.stdout || '')).trim().split('\n').filter(l => /error|Error|throw|cannot|not found/i.test(l)).slice(-2).join(' | ').slice(0, 300) : ''}${t3.status ? '; ' + (t3.stdout || '').split('\n').filter(l => /FAIL/.test(l)).slice(0, 3).join(' | ').slice(0, 400) : ''})`);
}

fs.rmSync(scratch, {recursive: true, force: true});
console.log(fails ? `md-roster-step-test: ${fails} FAILED` : 'md-roster-step-test: ALL PASSED');
process.exit(fails ? 1 : 0);
