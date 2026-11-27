// Applies the Wed Dec 2, 2026 battle balance patch (Pokémon Champions) to OUR code and data, exactly as the official notes say.
// Official notes: Pokémon HOME news 877, "Wednesday, December 2, 2026 Battle Balance Adjustments" (saved copy:
// docs/rebuild/test-runs/patch-dec2-official-877.html). Our map of what it touches: docs/rebuild/test-runs/patch-dec2-map.md and
// patch-dec2-psychup.md, audited in maggi-M4-patchmap.md (branch alt/maggi-m4-patchmap; lines moved, nothing in our files missed).
//
//   node experiments/apply-dec2-patch.mjs                 DRY RUN (default): prints every change as  file: old -> new ; writes nothing
//   node experiments/apply-dec2-patch.mjs --write         applies them (refused before 2026-12-02T02:00Z unless --force)
//        [--root <repo dir>]   the tree to patch (default: this script's repo)
//        [--force]             allow --write before the patch time (scratch copies, tests, a branch prepared early)
//        [--now <ISO time>]    pretend the clock says this (tests only)
// Exit codes: 0 = done (or nothing left to do), 1 = stopped on a surprise (nothing written), 3 = --write refused: too early.
//
// Safe to run again: every edit first checks whether the new text is already there and skips it. If neither the expected old text
// nor the new text is found, it stops with a plain message and writes NOTHING (all edits are checked before any file is written).
// experiments/md-roster-step.mjs (step 8) runs this with --write --root <its root> after it regenerates data.js, because
// regenerating data.js from Showdown rebuilds LEARN (and renumbers MOVES), which wipes the hand-added patch moves.
//
// What changes, with the official line each one comes from (news 877, word for word):
// | # | File (thing)                               | Change                                          | Official line                                                        |
// |---|--------------------------------------------|-------------------------------------------------|----------------------------------------------------------------------|
// | 1 | app/src/data/data.js LEARN                 | Psych Up for 22 Pokémon (+ their Megas and      | "Psych Up: Alakazam, Starmie, Mr. Mime, Mawile, Altaria, Castform,   |
// |   |                                            | Castform's weather forms, which share their     |  Absol, Roserade, Weavile, Rotom, Rotom (Heat Rotom), Rotom (Wash     |
// |   |                                            | base form's moves in our data)                  |  Rotom), Rotom (Frost Rotom), Rotom (Fan Rotom), Rotom (Mow Rotom),   |
// |   |                                            |                                                 |  Liepard, Musharna, Audino, Cofagrigus, Slurpuff, Drampa, Annihilape" |
// | 2 | data.js LEARN                              | Slack Off: Emboar (+ Emboar-Mega)               | "Slack Off: Emboar"                                                  |
// | 3 | data.js LEARN                              | Roost: Beedrill (+ Beedrill-Mega), Hydreigon    | "Roost: Beedrill, Hydreigon"                                         |
// | 4 | data.js LEARN                              | Tailwind: Emolga                                | "Tailwind: Emolga"                                                   |
// | 5 | data.js LEARN                              | Wonder Room: Umbreon                            | "Wonder Room: Umbreon"                                               |
// | 6 | data.js LEARN                              | Play Rough: the 7 Eeveelutions listed           | "Play Rough: Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon,    |
// |   |                                            | (Sylveon already has it)                        |  Glaceon"                                                            |
// | 7 | data.js MOVES                              | none: all 6 rows exist (rows hold no accuracy); | (map: "MOVES ... no change")                                         |
// |   |                                            | a row is appended only if a regenerated MOVES   |                                                                      |
// |   |                                            | lost one                                        |                                                                      |
// | 8 | data.js ABIL Flash Fire                    | Fire Boost wording, persists through Mega       | "When the Ability Flash Fire is activated, the Pokémon now gains the |
// |   | + app/src/data/info-text.js (ab)           | Evolution                                       |  Fire Boost status. The Fire Boost status will persist even if the   |
// |   |                                            |                                                 |  Pokémon Mega Evolves."                                              |
// | 9 | data.js ABIL Stalwart + info-text.js (ab)  | adds: ignores targets' substitutes              | "When using its moves, the Pokémon ignores the effects of targets'   |
// |   |                                            |                                                 |  substitutes."                                                       |
// |10 | app/src/data/move-acc.js MOVE_ACC          | Rock Slide 90 -> 95; Screech, Steel Wing, Metal | "Screech: 85% → 100% accuracy" / "Rock Slide: 90% → 95% accuracy" /  |
// |   |                                            | Sound, Frost Breath reach 100 so they leave the | "Steel Wing: 90% → 100% accuracy" / "Metal Sound: 85% → 100%         |
// |   |                                            | list (it only lists moves under 100)            |  accuracy" / "Frost Breath: 90% → 100% accuracy"                     |
// |11 | app/src/data/move-meta.js MOVE_META        | Rock Slide a 95 + flinch 20; the other four     | same lines + "Rock Slide: ... 30% → 20% chance to make targets       |
// |   |                                            | lose their "a" (100 = no "a")                   |  flinch"                                                             |
// |12 | info-text.js (mv) Rock Slide               | 30% -> 20% flinch                               | "Rock Slide: ... 30% → 20% chance to make targets flinch"            |
// |13 | app/src/v2/pages/infosheet.js IS_LEAD      | Rock Slide 30% -> 20% flinch                    | same                                                                 |
// |14 | app/test/run.mjs Hustle check              | Rock Slide under Hustle 72 -> 76 (95 × 0.8)     | "Rock Slide: 90% → 95% accuracy"                                     |
// 10-12 are GENERATED files (experiments/gen-move-meta.mjs, gen-info-text.mjs, from Showdown pinned at 1242c1e). If the generators
// are re-run from a Showdown commit that already has the patch, those edits show "already done"; if they are re-run from the old pin,
// this script puts the patch back on top. experiments/fields-audit.mjs compares MOVE_ACC / MOVE_META with the installed Showdown, so
// after --write it disagrees on these 5 moves until the Showdown pin moves to a commit with the patch (job GG-2).
// Not changed (the map, "Rules the code does not model"): the calc models neither Flash Fire's 1.5× boost nor Substitute, and
// King's Rock only checks that a move has its own flinch (still true at 20%).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const arg = (k, d = null) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes('--' + k);
const ROOT = path.resolve(arg('root', path.join(path.dirname(fileURLToPath(import.meta.url)), '..')));
const WRITE = has('write'), FORCE = has('force');
const PATCH_TIME = Date.parse('2026-12-02T02:00:00Z');
const NOW = arg('now') ? Date.parse(arg('now')) : Date.now();
if (Number.isNaN(NOW)) { console.error('apply-dec2-patch STOPPED: --now is not a time: ' + arg('now')); process.exit(1); }

class Surprise extends Error {}
const stop = msg => { throw new Surprise(msg); };

// ---- the patch, as data ----
const NEW_MOVES = {
  'Psych Up': ['Alakazam', 'Starmie', 'Mr. Mime', 'Mawile', 'Altaria', 'Castform', 'Absol', 'Roserade', 'Weavile', 'Rotom',
    'Rotom-Heat', 'Rotom-Wash', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow', 'Liepard', 'Musharna', 'Audino', 'Cofagrigus', 'Slurpuff',
    'Drampa', 'Annihilape'],
  'Slack Off': ['Emboar'],
  'Roost': ['Beedrill', 'Hydreigon'],
  'Tailwind': ['Emolga'],
  'Wonder Room': ['Umbreon'],
  'Play Rough': ['Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon'],
};
// today's MOVES rows (data.js, Nov 26): appended only if a regenerated MOVES has lost one of them
const MOVE_ROWS = {'Psych Up': ['Psych Up', 0, 0, 0, 0, 0], 'Slack Off': ['Slack Off', 0, 0, 0, 0, 0], 'Roost': ['Roost', 9, 0, 0, 0, 0],
  'Tailwind': ['Tailwind', 9, 0, 0, 0, 0], 'Wonder Room': ['Wonder Room', 10, 0, 0, 0, 0], 'Play Rough': ['Play Rough', 17, 1, 90, 0, 0]};

// Ability wording (HH OK, Nov 26): built from the official patch note; replace with the in-game English text once Showdown/Bulbapedia
// publish it on Dec 2 (keep "Fire Boost" + "Mega Evolves" and "substitutes": rules-fixes-test check 5 looks for them).
const FF_OLD = "This Pokemon's Fire attacks do 1.5× damage if hit by one Fire move; Fire immunity.";
const FF_NEW = "Fire immunity: when hit by a Fire move, this Pokemon gains Fire Boost (its Fire attacks do 1.5× damage). Fire Boost persists even if it Mega Evolves.";
const ST_OLD = "This Pokemon's moves cannot be redirected to a different target by any effect.";
const ST_NEW = "This Pokemon's moves cannot be redirected to a different target by any effect, and they ignore the effects of targets' substitutes.";
const acc = (s, n) => { const m = s.match(new RegExp(`"${n}":(\\d+)[,}]`)); return m ? +m[1] : 100; };

// Text edits: [file, label, old, new, done(text) -> true when the new state is already there in another form (regenerated)]
const TEXT = [
  ['app/src/data/data.js', 'ABIL Flash Fire', `"Flash Fire":"${FF_OLD}"`, `"Flash Fire":"${FF_NEW}"`,
    s => { const m = s.match(/"Flash Fire":"([^"]*)"/); return !!(m && /Fire Boost/.test(m[1]) && /Mega Evol/.test(m[1])); }],
  ['app/src/data/data.js', 'ABIL Stalwart', `"Stalwart":"${ST_OLD}"`, `"Stalwart":"${ST_NEW}"`,
    s => /"Stalwart":"[^"]*substitute/i.test(s)],
  ['app/src/data/info-text.js', 'INFO_TEXT ab Flash Fire', `"Flash Fire":"${FF_OLD.replace('Pokemon', 'Pokémon')}"`, `"Flash Fire":"${FF_NEW.replace('Pokemon', 'Pokémon')}"`,
    s => /"Flash Fire":"[^"]*Mega Evol/.test(s)],
  ['app/src/data/info-text.js', 'INFO_TEXT ab Stalwart', `"Stalwart":"${ST_OLD.replace('Pokemon', 'Pokémon')}"`, `"Stalwart":"${ST_NEW.replace('Pokemon', 'Pokémon')}"`,
    s => /"Stalwart":"[^"]*substitute/i.test(s)],
  ['app/src/data/info-text.js', 'INFO_TEXT mv Rock Slide flinch', '"Rock Slide":["30% chance to make the foe(s) flinch.",', '"Rock Slide":["20% chance to make the foe(s) flinch.",',
    s => /"Rock Slide":\["20% /.test(s)],
  ['app/src/data/move-acc.js', 'MOVE_ACC Rock Slide', '"Rock Slide":90,', '"Rock Slide":95,', s => acc(s, 'Rock Slide') === 95],
  ['app/src/data/move-acc.js', 'MOVE_ACC Screech (100: leaves the list)', '"Screech":85,', '', s => acc(s, 'Screech') === 100],
  ['app/src/data/move-acc.js', 'MOVE_ACC Steel Wing (100: leaves the list)', '"Steel Wing":90,', '', s => acc(s, 'Steel Wing') === 100],
  ['app/src/data/move-acc.js', 'MOVE_ACC Metal Sound (100: leaves the list)', '"Metal Sound":85,', '', s => acc(s, 'Metal Sound') === 100],
  ['app/src/data/move-acc.js', 'MOVE_ACC Frost Breath (100: leaves the list)', '"Frost Breath":90,', '', s => acc(s, 'Frost Breath') === 100],
  ['app/src/data/move-meta.js', 'MOVE_META Rock Slide', '"Rock Slide":{"t":"allAdjacentFoes","a":90,"s":[[30,0,0,1]],"sf":1}', '"Rock Slide":{"t":"allAdjacentFoes","a":95,"s":[[20,0,0,1]],"sf":1}',
    s => /"Rock Slide":\{[^{}]*"a":95,[^{}]*"s":\[\[20,/.test(s)],
  ['app/src/data/move-meta.js', 'MOVE_META Screech', '"Screech":{"t":"normal","f":"s","a":85,', '"Screech":{"t":"normal","f":"s",', s => /"Screech":\{(?![^{}]*"a":)/.test(s)],
  ['app/src/data/move-meta.js', 'MOVE_META Steel Wing', '"Steel Wing":{"t":"normal","f":"c","a":90,', '"Steel Wing":{"t":"normal","f":"c",', s => /"Steel Wing":\{(?![^{}]*"a":)/.test(s)],
  ['app/src/data/move-meta.js', 'MOVE_META Metal Sound', '"Metal Sound":{"t":"normal","f":"s","a":85,', '"Metal Sound":{"t":"normal","f":"s",', s => /"Metal Sound":\{(?![^{}]*"a":)/.test(s)],
  ['app/src/data/move-meta.js', 'MOVE_META Frost Breath', '"Frost Breath":{"t":"normal","a":90,', '"Frost Breath":{"t":"normal",', s => /"Frost Breath":\{(?![^{}]*"a":)/.test(s)],
  ['app/src/v2/pages/infosheet.js', 'IS_LEAD Rock Slide', "'Rock Slide': 'Hits both foes. Each one hit has a 30% chance to flinch.'", "'Rock Slide': 'Hits both foes. Each one hit has a 20% chance to flinch.'"],
  ['app/test/run.mjs', 'Hustle Rock Slide accuracy (95 × 0.8)', 'r.hustle === 72', 'r.hustle === 76',
    s => /r\.hustle === Math\.floor\(/.test(s)], // a run.mjs that reads Rock Slide's accuracy from MOVE_ACC needs no change
];
const GENERATED = new Set(['app/src/data/info-text.js', 'app/src/data/move-acc.js', 'app/src/data/move-meta.js']);
const NOTE = '// Dec 2, 2026 balance patch (official news 877) applied on top by experiments/apply-dec2-patch.mjs.';

// ---- work on copies in memory; write only if every edit checks out ----
const files = new Map(), changed = new Set(), log = [];
const read = f => { if (!files.has(f)) { const p = path.join(ROOT, f); if (!fs.existsSync(p)) stop(`${f} not found under ${ROOT}`); files.set(f, fs.readFileSync(p, 'utf8')); } return files.get(f); };
const short = s => s.length > 90 ? s.slice(0, 87) + '...' : s;

function textEdits() {
  for (const [f, label, from, to, done] of TEXT) {
    const s = read(f);
    if (!s.includes(from) && ((to && s.includes(to)) || (done && done(s)))) {
      log.push(`  ${f}: ${label}: already done`); continue;
    }
    const k = s.split(from).length - 1;
    if (k !== 1) stop(`${f}: ${label}: expected the old text once, found it ${k} times, and the new text isn't there either.\n  old text: ${from}`);
    files.set(f, s.replace(from, () => to)); changed.add(f);
    log.push(`  ${f}: ${label}: ${short(from)}  ->  ${to ? short(to) : '(removed)'}`);
  }
}

function learnEdits() {
  const f = 'app/src/data/data.js', lines = read(f).split('\n');
  const at = name => { const i = lines.findIndex(l => l.startsWith(`const ${name}=`)); if (i < 0) stop(`${f}: no line starting "const ${name}="`); return i; };
  const parse = name => { try { return JSON.parse(lines[at(name)].slice(name.length + 7).replace(/;\s*$/, '')); } catch (e) { stop(`${f}: ${name} is not one line of JSON (${e.message})`); } };
  const MOVES = parse('MOVES'), LEARN = parse('LEARN'), ROSTER = parse('ROSTER'), byName = new Map(ROSTER.map(p => [p.n, p]));
  if ('const LEARN=' + JSON.stringify(LEARN) + ';' !== lines[at('LEARN')]) stop(`${f}: LEARN isn't in the expected one-line JSON form (re-writing it would change more than the patch)`);
  let movesChanged = false, added = 0;
  for (const [mv, mons] of Object.entries(NEW_MOVES)) {
    let i = MOVES.findIndex(r => r[0] === mv);
    if (i < 0) { MOVES.push(MOVE_ROWS[mv]); i = MOVES.length - 1; movesChanged = true; log.push(`  ${f}: MOVES: ${mv} row missing, appended as index ${i}: ${JSON.stringify(MOVE_ROWS[mv])}`); }
    const did = [], had = [];
    for (const base of mons) {
      if (!LEARN[base] || !byName.has(base)) stop(`${f}: ${base} (official ${mv} list) is not in our ROSTER/LEARN`);
      // its Megas (ROSTER m:1) and battle-only forms that exist only in LEARN (Castform weathers): they use the base form's moves
      const forms = Object.keys(LEARN).filter(k => k !== base && k.startsWith(base + '-') && (!byName.has(k) || byName.get(k).m === 1));
      for (const k of [base, ...forms]) {
        if (LEARN[k].includes(i)) { had.push(k); continue; }
        LEARN[k] = [...LEARN[k], i].sort((a, b) => a - b); added++; did.push(k);
      }
    }
    if (did.length) log.push(`  ${f}: LEARN + ${mv} (MOVES index ${i}), ${did.length}: ${did.join(', ')}`);
    if (had.length) log.push(`  ${f}: LEARN + ${mv}: already done for ${had.length}: ${had.join(', ')}`);
  }
  if (added || movesChanged) {
    lines[at('LEARN')] = 'const LEARN=' + JSON.stringify(LEARN) + ';';
    if (movesChanged) lines[at('MOVES')] = 'const MOVES=' + JSON.stringify(MOVES) + ';';
    files.set(f, lines.join('\n')); changed.add(f);
  }
  log.push(`  ${f}: LEARN: ${added} pairing(s) to add`);
}

try {
  learnEdits();
  textEdits();
  for (const f of changed) if (GENERATED.has(f) && !files.get(f).includes(NOTE)) files.set(f, files.get(f).replace(/\n/, '\n' + NOTE + '\n'));
} catch (e) {
  if (!(e instanceof Surprise)) throw e;
  console.error(log.join('\n'));
  console.error('apply-dec2-patch STOPPED (nothing written): ' + e.message);
  process.exit(1);
}

console.log(`apply-dec2-patch (${WRITE ? 'WRITE' : 'DRY RUN'}) on ${ROOT}`);
console.log(log.join('\n'));
if (!changed.size) { console.log('apply-dec2-patch: nothing to change (the patch is already in)'); process.exit(0); }
if (!WRITE) { console.log(`apply-dec2-patch: DRY RUN, ${changed.size} file(s) would change: ${[...changed].join(', ')} (pass --write to apply)`); process.exit(0); }
if (NOW < PATCH_TIME && !FORCE) {
  console.error(`apply-dec2-patch REFUSED: it is ${new Date(NOW).toISOString()}, before the patch (2026-12-02T02:00:00Z). Nothing written. Pass --force to write anyway.`);
  process.exit(3);
}
for (const f of changed) fs.writeFileSync(path.join(ROOT, f), files.get(f));
console.log(`apply-dec2-patch: WROTE ${changed.size} file(s): ${[...changed].join(', ')}`);
if ([...changed].some(f => GENERATED.has(f))) console.log('apply-dec2-patch: note: generated files were patched on top; fields-audit.mjs disagrees until the Showdown pin has the patch (GG-2).');
