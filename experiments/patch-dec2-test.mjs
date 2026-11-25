// Dec 2, 2026 balance patch: checks that every change on the official page is in our data.
// Source: Pokémon HOME news 877, "Wednesday, December 2, 2026 Battle Balance Adjustments" (copy: docs/rebuild/test-runs/patch-dec2-official-877.html).
// Applied by experiments/apply-dec2-patch.mjs. If a generator is re-run from an older Showdown build, this test fails and says what went back.
// Run: node experiments/patch-dec2-test.mjs   (exit 0 = all in, 1 = something missing)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const grab = (src, name) => { const l = src.split('\n').find(x => x.startsWith(`const ${name}=`)); if (!l) throw new Error(`${name} not found`); return JSON.parse(l.slice(name.length + 7).replace(/;\s*$/, '')); };

const data = read('app/src/data/data.js');
const ROSTER = grab(data, 'ROSTER'), ABIL = grab(data, 'ABIL'), MOVES = grab(data, 'MOVES'), LEARN = grab(data, 'LEARN');
const MOVE_ACC = grab(read('app/src/data/move-acc.js'), 'MOVE_ACC');
const MOVE_META = grab(read('app/src/data/move-meta.js'), 'MOVE_META');
const INFO = grab(read('app/src/data/info-text.js'), 'INFO_TEXT');
const sheet = read('app/src/v2/pages/infosheet.js');

let bad = 0, n = 0;
const ok = (c, msg) => { n++; if (!c) { bad++; console.log('FAIL', msg); } };

// 1. New moves, with each Mega form too (our LEARN gives every Mega its base form's list; checked Nov 25: all 80 equal)
const NEW = {
  'Psych Up': ['Alakazam', 'Starmie', 'Mr. Mime', 'Mawile', 'Altaria', 'Castform', 'Absol', 'Roserade', 'Weavile', 'Rotom', 'Rotom-Heat', 'Rotom-Wash', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow', 'Liepard', 'Musharna', 'Audino', 'Cofagrigus', 'Slurpuff', 'Drampa', 'Annihilape'],
  'Slack Off': ['Emboar'], 'Roost': ['Beedrill', 'Hydreigon'], 'Tailwind': ['Emolga'], 'Wonder Room': ['Umbreon'],
  'Play Rough': ['Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon'],
};
const names = ROSTER.map(r => r.n);
for (const [mv, mons] of Object.entries(NEW)) {
  const i = MOVES.findIndex(r => r[0] === mv);
  ok(i >= 0, `${mv} is a row in MOVES`);
  for (const m of mons) {
    const forms = names.filter(x => x === m || x.startsWith(m + '-Mega'));
    ok(forms.length > 0, `${m} is in ROSTER`);
    for (const f of forms) ok((LEARN[f] || []).includes(i), `${f} learns ${mv}`);
  }
}
ok(Object.values(LEARN).every(a => a.every((x, k) => k === 0 || a[k - 1] < x)), 'every LEARN list stays sorted with no repeats');

// 2. Accuracy and flinch
ok(MOVE_ACC['Rock Slide'] === 95, `Rock Slide accuracy 95 (MOVE_ACC has ${MOVE_ACC['Rock Slide']})`);
for (const mv of ['Screech', 'Steel Wing', 'Metal Sound', 'Frost Breath']) {
  ok(!(mv in MOVE_ACC), `${mv} is 100% so it leaves MOVE_ACC (has ${MOVE_ACC[mv]})`);
  ok(MOVE_META[mv] && !('a' in MOVE_META[mv]), `${mv} has no accuracy in MOVE_META`);
}
ok(MOVE_META['Rock Slide'] && MOVE_META['Rock Slide'].a === 95, 'Rock Slide a:95 in MOVE_META');
ok(JSON.stringify(MOVE_META['Rock Slide'] && MOVE_META['Rock Slide'].s) === '[[20,0,0,1]]', 'Rock Slide flinch 20% in MOVE_META');
ok(/^20% chance/.test(INFO.mv['Rock Slide'][0]), 'Rock Slide info text says 20%: ' + INFO.mv['Rock Slide'][0]);
ok(/'Rock Slide': 'Hits both foes\. Each one hit has a 20% chance to flinch\.'/.test(sheet), 'info sheet Rock Slide line says 20%');
ok(!/Rock Slide[^\n]{0,80}30% chance/.test(sheet + INFO.mv['Rock Slide'][0]), 'no Rock Slide 30% left');

// 3. Abilities (the words rules-fixes-test.mjs check 5 needs from Dec 2 01:59 UTC: Fire Boost, Mega Evolves, substitutes)
for (const [where, t] of [['data.js ABIL', ABIL], ['info-text ab', INFO.ab]]) {
  ok(/Fire Boost/.test(t['Flash Fire']) && /Mega Evolves/.test(t['Flash Fire']) && /Fire immunity/.test(t['Flash Fire']), `${where} Flash Fire: ${t['Flash Fire']}`);
  ok(/substitutes/i.test(t['Stalwart']) && /redirected/.test(t['Stalwart']), `${where} Stalwart: ${t['Stalwart']}`);
}

console.log(`${n - bad}/${n} checks passed`);
process.exit(bad ? 1 : 0);
