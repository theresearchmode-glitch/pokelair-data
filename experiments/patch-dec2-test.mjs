// patch-dec2-test.mjs (Kip job 49, Nov 26): verifies the hand-written half of the Dec 2, 2026 balance patch
// (docs/rebuild/test-runs/patch-dec2-map.md + patch-dec2-psychup.md + patch-dec2-official-877.html):
//   - every new LEARN pairing (base forms + Megas + Castform weather forms) is present
//   - ABIL text for Flash Fire (persists after Mega Evolution) and Stalwart (ignores substitutes) is updated
//   - app/src/v2/pages/infosheet.js Rock Slide flinch chance is 20% (not 30%)
//   - app/test/run.mjs Hustle Rock Slide expectation is 76 (not 72)
//   - nothing else in LEARN or ABIL changed vs origin/claude/design6 (only the listed keys differ, and LEARN keys only gained the listed moves)
//   - generated files (move-acc.js, move-meta.js, info-text.js) are untouched
// Run: node experiments/patch-dec2-test.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0;
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };

const loadData = src => {
  const c = {};
  vm.runInNewContext(src + ';this.MOVES=MOVES;this.LEARN=LEARN;this.ABIL=ABIL;', c);
  return c;
};

const curSrc = fs.readFileSync(path.join(ROOT, 'app/src/data/data.js'), 'utf8');
const cur = loadData(curSrc);
const baseRef = process.env.PATCH_DEC2_BASE || 'origin/claude/design6';
const baseSrc = execFileSync('git', ['show', `${baseRef}:app/src/data/data.js`], {cwd: ROOT, encoding: 'utf8'});
const base = loadData(baseSrc);

const mvIdx = name => cur.MOVES.findIndex(m => m[0] === name);

// Every expected (Pokémon, move) addition from patch-dec2-map.md + patch-dec2-psychup.md + official 877.html
const EXPECTED_LEARN = [
  // Psych Up: 22 official species + 8 Megas + 3 Castform battle forms
  ...['Alakazam', 'Alakazam-Mega', 'Starmie', 'Starmie-Mega', 'Mr. Mime', 'Mawile', 'Mawile-Mega',
    'Altaria', 'Altaria-Mega', 'Castform', 'Castform-Sunny', 'Castform-Rainy', 'Castform-Snowy',
    'Absol', 'Absol-Mega', 'Absol-Mega-Z', 'Roserade', 'Weavile',
    'Rotom', 'Rotom-Heat', 'Rotom-Wash', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow',
    'Liepard', 'Musharna', 'Audino', 'Audino-Mega', 'Cofagrigus', 'Slurpuff',
    'Drampa', 'Drampa-Mega', 'Annihilape'].map(mon => [mon, 'Psych Up']),
  // Slack Off
  ['Emboar', 'Slack Off'], ['Emboar-Mega', 'Slack Off'],
  // Roost
  ['Beedrill', 'Roost'], ['Beedrill-Mega', 'Roost'], ['Hydreigon', 'Roost'],
  // Tailwind
  ['Emolga', 'Tailwind'],
  // Wonder Room
  ['Umbreon', 'Wonder Room'],
  // Play Rough
  ...['Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon'].map(mon => [mon, 'Play Rough']),
];

// 1. One check per LEARN pairing
const expectedByMon = new Map();
for (const [mon, move] of EXPECTED_LEARN) {
  const idx = mvIdx(move);
  const arr = cur.LEARN[mon];
  ok(idx >= 0 && Array.isArray(arr) && arr.includes(idx), `LEARN[${mon}] includes ${move} (idx ${idx})`);
  if (!expectedByMon.has(mon)) expectedByMon.set(mon, new Set());
  expectedByMon.get(mon).add(idx);
}

// 2. Nothing else in LEARN changed vs origin/claude/design6
{
  const curKeys = Object.keys(cur.LEARN).sort(), baseKeys = Object.keys(base.LEARN).sort();
  ok(JSON.stringify(curKeys) === JSON.stringify(baseKeys), `LEARN key set unchanged (${curKeys.length} keys)`);
  const unexpected = [];
  for (const k of curKeys) {
    const bArr = base.LEARN[k] || [], cArr = cur.LEARN[k] || [];
    const want = expectedByMon.get(k);
    if (!want) {
      if (JSON.stringify(bArr) !== JSON.stringify(cArr)) unexpected.push(`${k} (unexpectedly modified)`);
    } else {
      const bSet = new Set(bArr), cSet = new Set(cArr);
      const added = [...cSet].filter(x => !bSet.has(x));
      const removed = [...bSet].filter(x => !cSet.has(x));
      if (removed.length || added.length !== want.size || added.some(x => !want.has(x))) {
        unexpected.push(`${k} (added=${added.join(',')}, removed=${removed.join(',')})`);
      }
    }
  }
  ok(unexpected.length === 0, `LEARN diff vs ${baseRef} has only the ${expectedByMon.size} listed Pokémon (${unexpected.length ? unexpected.slice(0, 5).join('; ') : 'exact match'})`);
}

// 3. ABIL: Flash Fire and Stalwart updated, nothing else in ABIL changed
{
  const ff = cur.ABIL['Flash Fire'] || '';
  const st = cur.ABIL['Stalwart'] || '';
  ok(/Fire Boost/i.test(ff) && /Mega Evol/i.test(ff), `ABIL['Flash Fire'] notes Fire Boost persists after Mega Evolution ("${ff}")`);
  ok(/substitute/i.test(st) && /redirect/i.test(st), `ABIL['Stalwart'] notes ignores targets' substitutes ("${st}")`);
  const curKeys = Object.keys(cur.ABIL).sort(), baseKeys = Object.keys(base.ABIL).sort();
  const otherDiff = curKeys.filter(k => k !== 'Flash Fire' && k !== 'Stalwart' && cur.ABIL[k] !== base.ABIL[k]);
  ok(JSON.stringify(curKeys) === JSON.stringify(baseKeys) && otherDiff.length === 0,
    `ABIL diff vs ${baseRef} touches only Flash Fire and Stalwart (other diffs: ${otherDiff.join(', ') || 'none'})`);
}

// 4. app/src/v2/pages/infosheet.js: Rock Slide flinch 30% -> 20%
{
  const infoSrc = fs.readFileSync(path.join(ROOT, 'app/src/v2/pages/infosheet.js'), 'utf8');
  ok(infoSrc.includes("'Rock Slide': 'Hits both foes. Each one hit has a 20% chance to flinch.'"),
    'infosheet.js: Rock Slide lead text says 20% chance to flinch');
}

// 5. app/test/run.mjs: Hustle Rock Slide expectation 72 -> 76
{
  const runSrc = fs.readFileSync(path.join(ROOT, 'app/test/run.mjs'), 'utf8');
  ok(runSrc.includes('r.hustle === 76') && !runSrc.includes('r.hustle === 72'),
    'app/test/run.mjs: Hustle Rock Slide expectation updated from 72 to 76');
}

// 6. Generated files untouched vs origin/claude/design6
for (const gen of ['app/src/data/move-acc.js', 'app/src/data/move-meta.js', 'app/src/data/info-text.js']) {
  const curG = fs.readFileSync(path.join(ROOT, gen), 'utf8');
  const baseG = execFileSync('git', ['show', `${baseRef}:${gen}`], {cwd: ROOT, encoding: 'utf8'});
  ok(curG === baseG, `${gen} untouched (generated; waits for Showdown Dec 2 commit)`);
}

console.log(fails ? `patch-dec2-test: ${fails} FAILED` : 'patch-dec2-test: ALL PASSED');
process.exit(fails ? 1 : 0);
