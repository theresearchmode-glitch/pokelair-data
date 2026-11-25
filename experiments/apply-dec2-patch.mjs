// Applies the Dec 2, 2026 balance patch to our data, word for word from the official page:
// Pokémon HOME news 877, "Wednesday, December 2, 2026 Battle Balance Adjustments" (copy: docs/rebuild/test-runs/patch-dec2-official-877.html).
// Why a script and not the generators: on Nov 25 Showdown's champions mod didn't have the patch yet (checked: master moves.ts has
// no Rock Slide entry), and the generators would put the old numbers back. Once Showdown has it, re-run the generators and
// experiments/patch-dec2-test.mjs must still pass.
// Safe to run twice: each edit checks the old text first, skips it if the new text is already there, and stops on anything else.
// Run: node experiments/apply-dec2-patch.mjs   then   node experiments/patch-dec2-test.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = f => path.join(root, f);
const NOTE = '// Dec 2, 2026 balance patch (official news 877) applied on top by experiments/apply-dec2-patch.mjs.';

function swap(file, pairs) {
  let s = fs.readFileSync(P(file), 'utf8');
  for (const [from, to] of pairs) {
    if (s.includes(to) && !s.includes(from)) { console.log(`  ${file}: already done: ${to.slice(0, 60)}`); continue; }
    const k = s.split(from).length - 1;
    if (k !== 1) throw new Error(`${file}: expected the old text once, found it ${k} times: ${from}`);
    s = s.replace(from, () => to);
    console.log(`  ${file}: ${from.slice(0, 50)}  ->  ${to.slice(0, 50)}`);
  }
  if (!s.includes(NOTE) && /^\/\/ (Generated|GENERATED)/.test(s)) s = s.replace(/\n/, '\n' + NOTE + '\n');
  fs.writeFileSync(P(file), s);
}

// 1. Accuracy (MOVE_ACC lists only moves under 100, so the four that reach 100 leave it)
swap('app/src/data/move-acc.js', [
  ['"Rock Slide":90', '"Rock Slide":95'],
  ['"Steel Wing":90,', ''], ['"Screech":85,', ''], ['"Metal Sound":85,', ''], ['"Frost Breath":90,', ''],
]);
swap('app/src/data/move-meta.js', [
  ['"Rock Slide":{"t":"allAdjacentFoes","a":90,"s":[[30,0,0,1]],"sf":1}', '"Rock Slide":{"t":"allAdjacentFoes","a":95,"s":[[20,0,0,1]],"sf":1}'],
  ['"Steel Wing":{"t":"normal","f":"c","a":90,', '"Steel Wing":{"t":"normal","f":"c",'],
  ['"Screech":{"t":"normal","f":"s","a":85,', '"Screech":{"t":"normal","f":"s",'],
  ['"Metal Sound":{"t":"normal","f":"s","a":85,', '"Metal Sound":{"t":"normal","f":"s",'],
  ['"Frost Breath":{"t":"normal","a":90,', '"Frost Breath":{"t":"normal",'],
]);

// 2. Words: Rock Slide's flinch, Flash Fire, Stalwart
const FF = s => `${s}'s Fire immunity: when hit by a Fire move it gains Fire Boost (its Fire attacks do 1.5× damage), and Fire Boost stays if it Mega Evolves.`;
const ST = s => `${s}'s moves cannot be redirected to a different target by any effect, and they ignore targets' substitutes.`;
swap('app/src/data/info-text.js', [
  ['"Rock Slide":["30% chance to make the foe(s) flinch.",', '"Rock Slide":["20% chance to make the foe(s) flinch.",'],
  ['"Flash Fire":"This Pokémon\'s Fire attacks do 1.5× damage if hit by one Fire move; Fire immunity."', `"Flash Fire":"${FF('This Pokémon')}"`],
  ['"Stalwart":"This Pokémon\'s moves cannot be redirected to a different target by any effect."', `"Stalwart":"${ST('This Pokémon')}"`],
]);
swap('app/src/data/data.js', [
  ['"Flash Fire":"This Pokemon\'s Fire attacks do 1.5× damage if hit by one Fire move; Fire immunity."', `"Flash Fire":"${FF('This Pokemon')}"`],
  ['"Stalwart":"This Pokemon\'s moves cannot be redirected to a different target by any effect."', `"Stalwart":"${ST('This Pokemon')}"`],
]);
swap('app/src/v2/pages/infosheet.js', [
  ["'Rock Slide': 'Hits both foes. Each one hit has a 30% chance to flinch.'", "'Rock Slide': 'Hits both foes. Each one hit has a 20% chance to flinch.'"],
]);

// 3. New moves in LEARN (lists of MOVES indexes, kept sorted). A Mega form gets the move too: in our data every Mega's
// list equals its base form's (checked Nov 25, all 80), so it stays that way.
const NEW = {
  'Psych Up': ['Alakazam', 'Starmie', 'Mr. Mime', 'Mawile', 'Altaria', 'Castform', 'Absol', 'Roserade', 'Weavile', 'Rotom', 'Rotom-Heat', 'Rotom-Wash', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow', 'Liepard', 'Musharna', 'Audino', 'Cofagrigus', 'Slurpuff', 'Drampa', 'Annihilape'],
  'Slack Off': ['Emboar'], 'Roost': ['Beedrill', 'Hydreigon'], 'Tailwind': ['Emolga'], 'Wonder Room': ['Umbreon'],
  'Play Rough': ['Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon'],
};
{
  const f = 'app/src/data/data.js', lines = fs.readFileSync(P(f), 'utf8').split('\n');
  const at = name => { const i = lines.findIndex(l => l.startsWith(`const ${name}=`)); if (i < 0) throw new Error(name + ' not found'); return i; };
  const parse = name => JSON.parse(lines[at(name)].slice(name.length + 7).replace(/;\s*$/, ''));
  const MOVES = parse('MOVES'), LEARN = parse('LEARN'), names = parse('ROSTER').map(r => r.n);
  let added = 0;
  for (const [mv, mons] of Object.entries(NEW)) {
    const i = MOVES.findIndex(r => r[0] === mv);
    if (i < 0) throw new Error('move not in MOVES: ' + mv);
    for (const m of mons) {
      const forms = names.filter(x => x === m || x.startsWith(m + '-Mega'));
      if (!forms.length) throw new Error('Pokémon not in ROSTER: ' + m);
      for (const fm of forms) {
        if (!LEARN[fm]) throw new Error('no LEARN entry: ' + fm);
        if (LEARN[fm].includes(i)) continue;
        LEARN[fm] = [...LEARN[fm], i].sort((a, b) => a - b); added++;
        console.log(`  LEARN: ${fm} + ${mv}`);
      }
    }
  }
  lines[at('LEARN')] = 'const LEARN=' + JSON.stringify(LEARN) + ';';
  fs.writeFileSync(P(f), lines.join('\n'));
  console.log(`  LEARN: ${added} added`);
}
console.log('done; now run: node experiments/patch-dec2-test.mjs');
