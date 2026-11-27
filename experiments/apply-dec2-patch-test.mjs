// Tests for experiments/apply-dec2-patch.mjs on an isolated scratch copy (leaves the repo untouched).
// Verifies:
//   1. Refuses to run before Dec 2, 2026 02:00 UTC without --force
//   2. Dry run (--force without --write) prints all 49 planned changes and writes nothing
//   3. Time-bomb proof: rules-fixes-test.mjs --src FAILS on/after Dec 2 without the patch
//   4. --write --force lands every change (44 LEARN entries incl. Megas, Flash Fire + Stalwart ABIL, infosheet 20%, run.mjs Hustle)
//   5. Second run is a clean no-op (idempotent, byte-identical)
//   6. Stops with a plain error on unexpected file content
//   7. After patch: rules-fixes-test.mjs --src passes both before and after Dec 2 (fake clock)
//   8. After patch: app/build.mjs + app/test/run.mjs and --v2 --preview-data + experiments/unrated-test.mjs pass
// Usage: node experiments/apply-dec2-patch-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PATCH = path.join(ROOT, 'experiments/apply-dec2-patch.mjs');
let fails = 0;
const ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails++; };

// Copy directory tree, symlinking large read-only asset folders for speed.
const SYMLINK_DIRS = new Set(['art', 'art-s', 'fonts']);
function copyTree(src, dst) {
  fs.mkdirSync(dst, {recursive: true});
  for (const ent of fs.readdirSync(src, {withFileTypes: true})) {
    if (ent.name === 'dist') continue;
    const s = path.join(src, ent.name), d = path.join(dst, ent.name);
    if (ent.isDirectory() && SYMLINK_DIRS.has(ent.name)) fs.symlinkSync(s, d);
    else if (ent.isDirectory()) copyTree(s, d);
    else if (ent.isSymbolicLink()) fs.symlinkSync(fs.readlinkSync(s), d);
    else fs.copyFileSync(s, d);
  }
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'np-dec2-patch-'));
const clockScript = path.join(scratch, 'fake-clock.cjs');
fs.writeFileSync(clockScript, `
const t = Number(process.env.FAKE_NOW);
if (Number.isFinite(t)) {
  Date.now = () => t;
  const vm = require('node:vm');
  const orig = vm.createContext;
  vm.createContext = function(sb, opts) {
    const ctx = orig.call(this, sb, opts);
    vm.runInContext('Date.now = () => ' + t + ';', ctx);
    return ctx;
  };
}
`);

const runNode = (args, {cwd = scratch, fakeNow = null, env = {}} = {}) => {
  const fullArgs = fakeNow != null ? ['--require', clockScript, ...args] : args;
  return spawnSync(process.execPath, fullArgs, {
    cwd,
    encoding: 'utf8',
    env: {...process.env, ...(fakeNow != null ? {FAKE_NOW: String(fakeNow)} : {}), ...env},
  });
};

try {
  copyTree(path.join(ROOT, 'app'), path.join(scratch, 'app'));
  fs.mkdirSync(path.join(scratch, 'app/dist'), {recursive: true});
  fs.mkdirSync(path.join(scratch, 'experiments'), {recursive: true});
  const COPY_EXP = new Set(['rules-fixes-test.mjs', 'unrated-test.mjs', 'stress-checks.mjs', 'stress-lib.mjs']);
  for (const ent of fs.readdirSync(path.join(ROOT, 'experiments'), {withFileTypes: true})) {
    const s = path.join(ROOT, 'experiments', ent.name), d = path.join(scratch, 'experiments', ent.name);
    if (COPY_EXP.has(ent.name)) fs.copyFileSync(s, d);
    else fs.symlinkSync(s, d);
  }
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(scratch, 'node_modules'));
  fs.symlinkSync(path.join(ROOT, 'out'), path.join(scratch, 'out'));
  fs.symlinkSync(path.join(ROOT, 'docs'), path.join(scratch, 'docs'));
  fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(scratch, 'package.json'));

  const BEFORE_DEC2 = Date.parse('2026-12-01T12:00:00Z');
  const AFTER_DEC2 = Date.parse('2026-12-02T03:00:00Z');
  const targets = ['app/src/data/data.js', 'app/src/v2/pages/infosheet.js', 'app/test/run.mjs'];
  const snap = () => Object.fromEntries(targets.map(f => [f, fs.readFileSync(path.join(scratch, f), 'utf8')]));
  const before = snap();

  // 1. Refuses to run before Dec 2 02:00 UTC without --force
  {
    const r = runNode([PATCH, '--root', scratch], {fakeNow: BEFORE_DEC2});
    ok(r.status !== 0 && /refusing to run before Dec 2, 2026 02:00 UTC/.test(r.stderr),
      `1. refuses before Dec 2 without --force (exit ${r.status}: ${r.stderr.trim().slice(0, 100)})`);
  }

  // 2. Dry run (--force, no --write) prints planned changes and writes nothing
  {
    const r = runNode([PATCH, '--force', '--root', scratch], {fakeNow: BEFORE_DEC2});
    const afterDry = snap();
    const untouched = targets.every(f => afterDry[f] === before[f]);
    ok(r.status === 0 && /DRY RUN \(49 change\(s\) across 3 file\(s\)/.test(r.stdout) && untouched,
      `2. dry run prints 49 planned changes across 3 files and leaves all files untouched (exit ${r.status})`);
  }

  // 3. Time-bomb proof: rules-fixes-test.mjs --src FAILS after Dec 2 without the patch
  {
    const r = runNode([path.join(scratch, 'experiments/rules-fixes-test.mjs'), '--src'], {fakeNow: AFTER_DEC2});
    ok(r.status !== 0 && /Flash Fire text:/.test(r.stdout + r.stderr),
      `3. time-bomb FAILS after Dec 2 without patch (exit ${r.status}; Flash Fire guard triggered)`);
  }

  // 4. --write --force applies all changes
  {
    const r = runNode([PATCH, '--write', '--force', '--root', scratch], {fakeNow: BEFORE_DEC2});
    ok(r.status === 0 && /APPLIED 49 change\(s\) across 3 file\(s\)/.test(r.stdout),
      `4a. --write --force applies 49 changes across 3 files (exit ${r.status})`);

    const dataSrc = fs.readFileSync(path.join(scratch, 'app/src/data/data.js'), 'utf8');
    const {LEARN, MOVES, ABIL} = new Function(dataSrc + '; return {LEARN, MOVES, ABIL};')();
    const mvIdx = n => MOVES.findIndex(m => m[0] === n);
    const has = (mon, mv) => (LEARN[mon] || []).includes(mvIdx(mv));
    const psych = [
      'Alakazam', 'Alakazam-Mega', 'Starmie', 'Starmie-Mega', 'Mr. Mime',
      'Mawile', 'Mawile-Mega', 'Altaria', 'Altaria-Mega', 'Castform',
      'Absol', 'Absol-Mega', 'Absol-Mega-Z', 'Roserade', 'Weavile',
      'Rotom', 'Rotom-Heat', 'Rotom-Wash', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow',
      'Liepard', 'Musharna', 'Audino', 'Audino-Mega', 'Cofagrigus',
      'Slurpuff', 'Drampa', 'Drampa-Mega', 'Annihilape',
    ];
    const others = [
      ['Emboar', 'Slack Off'], ['Emboar-Mega', 'Slack Off'],
      ['Beedrill', 'Roost'], ['Beedrill-Mega', 'Roost'], ['Hydreigon', 'Roost'],
      ['Emolga', 'Tailwind'], ['Umbreon', 'Wonder Room'],
      ...['Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon'].map(m => [m, 'Play Rough']),
    ];
    const missPsych = psych.filter(m => !has(m, 'Psych Up'));
    const missOther = others.filter(([m, v]) => !has(m, v));
    ok(!missPsych.length && !missOther.length,
      `4b. all 30 Psych Up (22 + 8 Megas) and 14 other move pairings landed in LEARN (missing: ${missPsych.length}/${missOther.length})`);
    ok(/Fire Boost/.test(ABIL['Flash Fire']) && /Mega Evolves/.test(ABIL['Flash Fire']) && /substitutes/i.test(ABIL['Stalwart']),
      `4c. ABIL['Flash Fire'] and ABIL['Stalwart'] updated to Dec 2 official wording`);
    const isSrc = fs.readFileSync(path.join(scratch, 'app/src/v2/pages/infosheet.js'), 'utf8');
    ok(isSrc.includes('20% chance to flinch.') && !isSrc.includes('30% chance to flinch.'),
      `4d. infosheet.js Rock Slide flinch updated 30% -> 20%`);
    const runSrc = fs.readFileSync(path.join(scratch, 'app/test/run.mjs'), 'utf8');
    ok(runSrc.includes('hustleBase:') && runSrc.includes('Math.floor(r.hustleBase * 0.8)') && !runSrc.includes('r.hustle === 72'),
      `4e. app/test/run.mjs Hustle check reads Rock Slide base accuracy dynamically`);
  }

  // 5. Second run is a clean no-op (idempotent)
  {
    const afterFirst = snap();
    const r = runNode([PATCH, '--write', '--force', '--root', scratch], {fakeNow: AFTER_DEC2});
    const afterSecond = snap();
    const same = targets.every(f => afterSecond[f] === afterFirst[f]);
    ok(r.status === 0 && /no changes needed/.test(r.stdout) && same,
      `5. second run is a no-op and leaves all files byte-identical (exit ${r.status})`);
  }

  // 6. Stops with a plain error on unexpected content
  {
    const badDir = fs.mkdtempSync(path.join(os.tmpdir(), 'np-dec2-bad-'));
    try {
      copyTree(path.join(scratch, 'app'), path.join(badDir, 'app'));
      const ip = path.join(badDir, 'app/src/v2/pages/infosheet.js');
      fs.writeFileSync(ip, fs.readFileSync(ip, 'utf8').replace('20% chance to flinch.', '99% chance to flinch.'));
      const r = runNode([PATCH, '--force', '--root', badDir], {fakeNow: AFTER_DEC2});
      ok(r.status !== 0 && /expected Rock Slide flinch line not found/.test(r.stderr),
        `6. stops with plain error on unexpected file content (exit ${r.status}: ${r.stderr.trim().slice(0, 90)})`);
    } finally { fs.rmSync(badDir, {recursive: true, force: true}); }
  }

  // 7. After patch: rules-fixes-test.mjs --src passes both BEFORE and AFTER Dec 2
  {
    const rb = runNode([path.join(scratch, 'experiments/rules-fixes-test.mjs'), '--src'], {fakeNow: BEFORE_DEC2});
    ok(rb.status === 0, `7a. rules-fixes-test.mjs --src passes BEFORE Dec 2 after patch (exit ${rb.status})`);
    const ra = runNode([path.join(scratch, 'experiments/rules-fixes-test.mjs'), '--src'], {fakeNow: AFTER_DEC2});
    ok(ra.status === 0, `7b. rules-fixes-test.mjs --src passes AFTER Dec 2 after patch (exit ${ra.status})`);
  }

  // 8. After patch: build + app/test/run.mjs and --v2 --preview-data + experiments/unrated-test.mjs pass
  {
    const b1 = runNode([path.join(scratch, 'app/build.mjs')]);
    const t1 = b1.status === 0 ? runNode([path.join(scratch, 'app/test/run.mjs')]) : {status: 1, stdout: '', stderr: b1.stderr};
    const t1Fail = (t1.stdout + '\n' + t1.stderr).split('\n').filter(l => /FAIL|Error|ENOENT/.test(l)).slice(0, 3).join(' | ');
    ok(b1.status === 0 && t1.status === 0 && /ALL PASSED/.test(t1.stdout),
      `8a. patched scratch build + app/test/run.mjs passes (build exit ${b1.status}, run exit ${t1.status}${t1Fail ? '; ' + t1Fail : ''})`);

    const b2 = runNode([path.join(scratch, 'app/build.mjs'), '--v2', '--preview-data', '--no-static']);
    const t2 = b2.status === 0 ? runNode([path.join(scratch, 'experiments/unrated-test.mjs')], {env: {PAGE: path.join(scratch, 'app/dist/v2.html')}}) : {status: 1, stdout: '', stderr: b2.stderr};
    ok(b2.status === 0 && t2.status === 0,
      `8b. patched scratch --v2 build + experiments/unrated-test.mjs passes (build exit ${b2.status}, unrated exit ${t2.status})`);
  }
} finally {
  fs.rmSync(scratch, {recursive: true, force: true});
}

console.log(`apply-dec2-patch-test: ${fails ? fails + ' failed' : 'all passed'}`);
process.exit(fails ? 1 : 0);
