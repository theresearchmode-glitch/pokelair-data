// Test for experiments/apply-dec2-patch.mjs (Dec 2, 2026 balance patch), run on scratch copies of the files, never the real tree.
// Checks: dry run writes nothing; --write before 2026-12-02T02:00Z is refused (exit 3) unless --force; a surprise (expected old
// text missing) stops with exit 1 and writes NOTHING; every change from the official notes lands, and only those; a second run
// changes nothing (byte-identical); a regenerated data.js with renumbered MOVES (or a lost MOVES row) still gets the right moves;
// and experiments/rules-fixes-test.mjs's Dec 2 guard (check 5: Flash Fire / Stalwart) FAILS with a clock after Dec 2 on unpatched
// data and PASSES on patched data (the fake clock is injected into its vm context by a preload; the test file itself is unchanged).
// The expected lists below are typed from the official page (docs/rebuild/test-runs/patch-dec2-official-877.html), not read from
// the script, so a wrong table in the script fails here.
// Run: node experiments/apply-dec2-patch-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = 'experiments/apply-dec2-patch.mjs';
let fails = 0, passes = 0;
const ok = (cond, msg) => { console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); cond ? passes++ : fails++; };
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

const TARGETS = ['app/src/data/data.js', 'app/src/data/info-text.js', 'app/src/data/move-acc.js', 'app/src/data/move-meta.js',
  'app/src/v2/pages/infosheet.js', 'app/test/run.mjs'];
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dec2-patch-test-'));
function scratch(name) {
  const d = path.join(TMP, name);
  for (const dir of ['app/src/data', 'app/src/app']) fs.cpSync(path.join(ROOT, dir), path.join(d, dir), {recursive: true});
  for (const f of ['app/src/v2/pages/infosheet.js', 'app/test/run.mjs', SCRIPT, 'experiments/rules-fixes-test.mjs']) {
    fs.mkdirSync(path.dirname(path.join(d, f)), {recursive: true});
    fs.copyFileSync(path.join(ROOT, f), path.join(d, f));
  }
  return d;
}
const shas = d => Object.fromEntries(TARGETS.map(f => [f, sha(path.join(d, f))]));
const same = (a, b) => TARGETS.every(f => a[f] === b[f]);
const run = (d, ...args) => spawnSync(process.execPath, [path.join(d, SCRIPT), '--root', d, ...args], {encoding: 'utf8'});
// read the data files the way the page does (plain scripts with const declarations)
function load(d) {
  const ctx = {}; vm.createContext(ctx);
  const src = ['app/src/data/data.js', 'app/src/data/move-acc.js', 'app/src/data/move-meta.js', 'app/src/data/info-text.js']
    .map(f => fs.readFileSync(path.join(d, f), 'utf8')).join('\n');
  return vm.runInContext(src + '\n;({ROSTER, ABIL, MOVES, LEARN, MOVE_ACC, MOVE_META, INFO_TEXT})', ctx);
}

// ---- expected, from the official notes (news 877) ----
const OFFICIAL = {
  'Psych Up': ['Alakazam', 'Starmie', 'Mr. Mime', 'Mawile', 'Altaria', 'Castform', 'Absol', 'Roserade', 'Weavile', 'Rotom', 'Rotom-Heat',
    'Rotom-Wash', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow', 'Liepard', 'Musharna', 'Audino', 'Cofagrigus', 'Slurpuff', 'Drampa', 'Annihilape'],
  'Slack Off': ['Emboar'], 'Roost': ['Beedrill', 'Hydreigon'], 'Tailwind': ['Emolga'], 'Wonder Room': ['Umbreon'],
  'Play Rough': ['Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon'],
};
// their Megas and Castform's weather forms (same moves as the base form in our data; patch-dec2-psychup.md "Missed by the map")
const FORMS = {'Psych Up': ['Alakazam-Mega', 'Starmie-Mega', 'Mawile-Mega', 'Altaria-Mega', 'Absol-Mega', 'Absol-Mega-Z', 'Audino-Mega',
  'Drampa-Mega', 'Castform-Sunny', 'Castform-Rainy', 'Castform-Snowy'], 'Slack Off': ['Emboar-Mega'], 'Roost': ['Beedrill-Mega']};
const PAIRS = Object.entries(OFFICIAL).flatMap(([mv, l]) => [...l, ...(FORMS[mv] || [])].map(p => [p, mv]));

const pairsOf = D => new Set(Object.entries(D.LEARN).flatMap(([p, l]) => l.map(i => p + '|' + D.MOVES[i][0])));
const diffKeys = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])).sort();

console.log('apply-dec2-patch-test: scratch copies in ' + TMP);

// 1. dry run (default): prints the plan, writes nothing
{
  const d = scratch('dry'), before = shas(d), r = run(d);
  ok(r.status === 0 && /DRY RUN, 6 file\(s\) would change/.test(r.stdout), `1. dry run exits 0 and lists 6 files (exit ${r.status})`);
  ok(/Rock Slide":90,\s+->\s+"Rock Slide":95,/.test(r.stdout) && /LEARN \+ Psych Up/.test(r.stdout), '1. dry run prints old -> new for each change');
  ok(same(before, shas(d)), '1. dry run changed no file');
}
// 2. --write before the patch time is refused, nothing written; md-roster-step's call (--write --root) gets exit 3
{
  const d = scratch('early'), before = shas(d), r = run(d, '--write', '--now', '2026-12-02T01:59:59Z');
  ok(r.status === 3 && /REFUSED/.test(r.stderr), `2. --write at 01:59:59Z Dec 2 is refused with exit 3 (exit ${r.status})`);
  ok(same(before, shas(d)), '2. refused --write changed no file');
}
// 3. a surprise stops it before anything is written (even the LEARN edits it had already worked out)
{
  const d = scratch('surprise'), f = path.join(d, 'app/src/data/data.js');
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('"Stalwart":"This Pokemon', '"Stalwart":"THIS Pokemon'));
  const before = shas(d), r = run(d, '--write', '--force');
  ok(r.status === 1 && /STOPPED \(nothing written\).*ABIL Stalwart/.test(r.stderr), `3. unexpected Stalwart text: exit 1 with a plain message (exit ${r.status}: ${r.stderr.split('\n').pop() || r.stderr.trim().split('\n').pop()})`);
  ok(same(before, shas(d)), '3. nothing written after the surprise (data.js LEARN untouched too)');
}
// 4-6. the real run: at the patch time without --force; every change lands, only those; a second run is a no-op
const PATCHED = scratch('patched');
{
  const d = PATCHED, B = load(d), r = run(d, '--write', '--now', '2026-12-02T02:00:00Z');
  ok(r.status === 0 && /WROTE 6 file\(s\)/.test(r.stdout), `4. --write at 02:00Z Dec 2 (no --force) writes 6 files (exit ${r.status}) ${r.stderr.trim()}`);
  const A = load(d), pb = pairsOf(B), pa = pairsOf(A);
  const added = [...pa].filter(x => !pb.has(x)).sort(), lost = [...pb].filter(x => !pa.has(x));
  const want = PAIRS.map(([p, m]) => p + '|' + m).sort();
  ok(JSON.stringify(added) === JSON.stringify(want) && !lost.length, `4. LEARN gained exactly the ${want.length} official pairings (+ Megas/forms) and lost none (added ${added.length}, lost ${lost.length})`);
  ok(PAIRS.every(([p]) => A.ROSTER.some(x => x.n === p) || /^Castform-/.test(p)), '4. every patched Pokémon is a real ROSTER entry (Castform weathers are LEARN-only forms)');
  ok(pb.has('Sylveon|Play Rough') && pa.has('Sylveon|Play Rough'), '4. Sylveon keeps Play Rough (not on the list, already had it)');
  ok(JSON.stringify(A.MOVES) === JSON.stringify(B.MOVES), '4. MOVES unchanged');
  ok(diffKeys(B.ABIL, A.ABIL).join() === 'Flash Fire,Stalwart', '4. ABIL: only Flash Fire and Stalwart changed (' + diffKeys(B.ABIL, A.ABIL).join() + ')');
  ok(/Fire Boost/.test(A.ABIL['Flash Fire']) && /Mega Evolves/.test(A.ABIL['Flash Fire']) && /Fire immunity/.test(A.ABIL['Flash Fire']), '4. ABIL Flash Fire: Fire Boost, persists through Mega Evolution, still a Fire immunity');
  ok(/cannot be redirected/.test(A.ABIL.Stalwart) && /targets' substitutes/.test(A.ABIL.Stalwart), '4. ABIL Stalwart: still not redirected, now ignores substitutes');
  ok(diffKeys(B.MOVE_ACC, A.MOVE_ACC).join() === 'Frost Breath,Metal Sound,Rock Slide,Screech,Steel Wing' && A.MOVE_ACC['Rock Slide'] === 95 &&
    ['Screech', 'Steel Wing', 'Metal Sound', 'Frost Breath'].every(m => !(m in A.MOVE_ACC)), '4. MOVE_ACC: Rock Slide 95; Screech, Steel Wing, Metal Sound, Frost Breath at 100 (not listed); nothing else');
  const rs = A.MOVE_META['Rock Slide'];
  ok(diffKeys(B.MOVE_META, A.MOVE_META).join() === 'Frost Breath,Metal Sound,Rock Slide,Screech,Steel Wing' && rs.a === 95 && rs.s[0][0] === 20 && rs.s[0][3] === 1 &&
    ['Screech', 'Steel Wing', 'Metal Sound', 'Frost Breath'].every(m => A.MOVE_META[m].a === undefined), '4. MOVE_META: Rock Slide a 95 + 20% flinch; the other four have no "a" (100); nothing else');
  ok(diffKeys(B.INFO_TEXT.mv, A.INFO_TEXT.mv).join() === 'Rock Slide' && A.INFO_TEXT.mv['Rock Slide'][0].startsWith('20% chance') &&
    diffKeys(B.INFO_TEXT.ab, A.INFO_TEXT.ab).join() === 'Flash Fire,Stalwart' && diffKeys(B.INFO_TEXT.it || {}, A.INFO_TEXT.it || {}).length === 0, '4. INFO_TEXT: Rock Slide 20%, Flash Fire and Stalwart; nothing else');
  ok(/Mega Evolves/.test(A.INFO_TEXT.ab['Flash Fire']) && /substitutes/.test(A.INFO_TEXT.ab.Stalwart), '4. INFO_TEXT ability lines carry the new rules');
  const is = fs.readFileSync(path.join(d, 'app/src/v2/pages/infosheet.js'), 'utf8'), rm = fs.readFileSync(path.join(d, 'app/test/run.mjs'), 'utf8');
  ok(is.includes("'Rock Slide': 'Hits both foes. Each one hit has a 20% chance to flinch.'") && !/30% chance to flinch/.test(is), '4. infosheet.js: Rock Slide 20% flinch');
  ok(rm.includes('r.hustle === 76') && !rm.includes('r.hustle === 72') && Math.floor(A.MOVE_ACC['Rock Slide'] * 0.8) === 76, '4. run.mjs: Hustle Rock Slide expects 76 (= floor(95 × 0.8))');
  const after = shas(d), r2 = run(d, '--write', '--now', '2026-12-02T02:00:00Z');
  ok(r2.status === 0 && /nothing to change/.test(r2.stdout), `5. second --write: exit 0, "nothing to change" (exit ${r2.status})`);
  ok(same(after, shas(d)), '5. second --write: all 6 files byte-identical');
  const r3 = run(d);
  ok(r3.status === 0 && /nothing to change/.test(r3.stdout) && !/->/.test(r3.stdout), '5. dry run on the patched tree plans no change');
}
// 6. regenerated data.js: MOVES renumbered (gen-roster numbers moves by first use) and a row lost; moves found by name, row appended
{
  const d = scratch('regen'), f = path.join(d, 'app/src/data/data.js'), lines = fs.readFileSync(f, 'utf8').split('\n');
  const at = n => lines.findIndex(l => l.startsWith(`const ${n}=`)), get = n => JSON.parse(lines[at(n)].slice(n.length + 7).replace(/;\s*$/, ''));
  const MOVES = get('MOVES'), LEARN = get('LEARN'), pu = MOVES.findIndex(r => r[0] === 'Psych Up'), wr = MOVES.findIndex(r => r[0] === 'Wonder Room');
  [MOVES[0], MOVES[pu]] = [MOVES[pu], MOVES[0]]; // swap Psych Up into index 0
  for (const k of Object.keys(LEARN)) LEARN[k] = LEARN[k].map(i => i === 0 ? pu : i === pu ? 0 : i).sort((a, b) => a - b);
  MOVES[wr] = ['Wonder Room (fixture: lost)', 10, 0, 0, 0, 0]; // as if the regenerated MOVES no longer had Wonder Room
  lines[at('MOVES')] = 'const MOVES=' + JSON.stringify(MOVES) + ';'; lines[at('LEARN')] = 'const LEARN=' + JSON.stringify(LEARN) + ';';
  fs.writeFileSync(f, lines.join('\n'));
  const B = load(d), r = run(d, '--write', '--force'), A = load(d), last = A.MOVES.length - 1;
  ok(r.status === 0 && A.LEARN.Alakazam.includes(0) && A.LEARN['Absol-Mega-Z'].includes(0) && !B.LEARN.Alakazam.includes(0), `6. renumbered MOVES: Psych Up added at its new index 0 (exit ${r.status})`);
  ok(A.MOVES[last][0] === 'Wonder Room' && A.MOVES.length === B.MOVES.length + 1 && A.LEARN.Umbreon.includes(last) && JSON.stringify(A.MOVES.slice(0, -1)) === JSON.stringify(B.MOVES),
    '6. lost Wonder Room row: appended at the end (no index shifts), Umbreon learns it');
}
// 7. rules-fixes-test.mjs Dec 2 guard, with a fake clock injected into its vm context
{
  const clock = path.join(TMP, 'fake-clock.mjs');
  fs.writeFileSync(clock, `import vm from 'node:vm';
const T = Date.parse(process.env.FAKE_NOW); if (Number.isNaN(T)) throw new Error('FAKE_NOW not set');
Date.now = () => T;
const orig = vm.runInContext;
vm.runInContext = function (code, ctx, ...rest) { orig.call(vm, 'Date.now = () => ' + T + ';', ctx); return orig.call(vm, code, ctx, ...rest); };
`);
  const rf = (d, when) => spawnSync(process.execPath, ['--import', 'file://' + clock, path.join(d, 'experiments/rules-fixes-test.mjs'), '--src'],
    {encoding: 'utf8', env: {...process.env, FAKE_NOW: when}});
  const un = scratch('unpatched-guard');
  const a = rf(un, '2026-12-03T12:00:00Z');
  ok(a.status !== 0 && /FAIL {2}5\. data\.js ABIL/.test(a.stdout), `7. unpatched data, clock Dec 3: rules-fixes-test FAILS on check 5 (exit ${a.status}; ${(a.stdout.match(/FAIL {2}5\.[^\n]*/) || ['no check-5 failure'])[0].slice(0, 120)})`);
  const b = rf(un, '2026-11-30T12:00:00Z');
  ok(b.status === 0 && /PASS {2}5\. data\.js ABIL/.test(b.stdout), `7. unpatched data, clock Nov 30: rules-fixes-test passes (exit ${b.status}; ${(b.stdout.match(/\d+\/\d+ passed[^\n]*/) || [''])[0]})`);
  const c = rf(PATCHED, '2026-12-03T12:00:00Z');
  ok(c.status === 0 && /PASS {2}5\. data\.js ABIL/.test(c.stdout), `7. patched data, clock Dec 3: rules-fixes-test passes (exit ${c.status}; ${(c.stdout.match(/\d+\/\d+ passed[^\n]*/) || [''])[0]})`);
}

fs.rmSync(TMP, {recursive: true, force: true});
console.log(fails ? `apply-dec2-patch-test: ${fails} FAILED (${passes} passed)` : `apply-dec2-patch-test: ALL ${passes} PASSED`);
process.exit(fails ? 1 : 0);
