#!/usr/bin/env node
// Dec 2, 2026 balance patch applier (hooked by experiments/md-roster-step.mjs:197-209).
// Applies every "must change on Dec 2" item in our hand-written code and data from:
//   - docs/rebuild/test-runs/patch-dec2-map.md
//   - docs/rebuild/test-runs/patch-dec2-psychup.md
//   - docs/rebuild/test-runs/maggi-M4-patchmap.md
// Generated files (move-acc.js, move-meta.js, info-text.js) and the Showdown commit pin are NOT edited here.
//
// Usage:
//   node experiments/apply-dec2-patch.mjs [--write] [--force] [--root <dir>]
//     (default)  DRY RUN: prints each planned change as "<file>: <old> -> <new>", writes nothing.
//     --write    Apply changes to disk.
//     --force    Allow running before 2026-12-02T02:00:00Z (refuses by default before the patch goes live).
//     --root DIR Target repo directory (defaults to cwd if app/src/data/data.js exists there, else this repo).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const PATCH_AT = Date.parse('2026-12-02T02:00:00Z');
const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const FORCE = argv.includes('--force');

let rootArg = '';
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--root' && argv[i + 1]) rootArg = argv[++i];
  else if (argv[i].startsWith('--root=')) rootArg = argv[i].slice(7);
}
const REPO = fileURLToPath(new URL('..', import.meta.url));
const ROOT = path.resolve(rootArg || (fs.existsSync(path.join(process.cwd(), 'app/src/data/data.js')) ? process.cwd() : REPO));
const P = rel => path.join(ROOT, rel);

const fail = msg => { console.error(`apply-dec2-patch: ERROR: ${msg}`); process.exit(1); };

// Safety gate: never run before Dec 2 02:00 UTC unless --force is given.
if (!FORCE && Date.now() < PATCH_AT) {
  fail(`refusing to run before Dec 2, 2026 02:00 UTC (now ${new Date(Date.now()).toISOString()}; pass --force to override)`);
}

// Official Dec 2 learnset additions (docs/rebuild/test-runs/patch-dec2-psychup.md).
const LEARN_ADDS = [
  // patch-dec2-psychup.md:8-32,48-50 — "Psych Up: 22 Pokémon (official list, in its order)" + Mega forms
  ['Psych Up', [
    'Alakazam', 'Alakazam-Mega', 'Starmie', 'Starmie-Mega', 'Mr. Mime',
    'Mawile', 'Mawile-Mega', 'Altaria', 'Altaria-Mega', 'Castform',
    'Absol', 'Absol-Mega', 'Absol-Mega-Z', 'Roserade', 'Weavile',
    'Rotom', 'Rotom-Heat', 'Rotom-Wash', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow',
    'Liepard', 'Musharna', 'Audino', 'Audino-Mega', 'Cofagrigus',
    'Slurpuff', 'Drampa', 'Drampa-Mega', 'Annihilape',
  ]],
  // patch-dec2-psychup.md:38,49 — "Slack Off | Emboar | Emboar no; Emboar-Mega no"
  ['Slack Off', ['Emboar', 'Emboar-Mega']],
  // patch-dec2-psychup.md:39,50 — "Roost | Beedrill, Hydreigon | Beedrill no; Beedrill-Mega no; Hydreigon no"
  ['Roost', ['Beedrill', 'Beedrill-Mega', 'Hydreigon']],
  // patch-dec2-psychup.md:40 — "Tailwind | Emolga | no"
  ['Tailwind', ['Emolga']],
  // patch-dec2-psychup.md:41 — "Wonder Room | Umbreon | no"
  ['Wonder Room', ['Umbreon']],
  // patch-dec2-psychup.md:42 — "Play Rough | Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon"
  ['Play Rough', ['Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon']],
];

// Official Dec 2 Ability text updates (patch-dec2-map.md:23, patch-dec2-psychup.md:53-54, rules-fixes-test.mjs:174-175).
const ABIL_UPDATES = [
  {
    name: 'Flash Fire',
    // patch-dec2-map.md:23: today's text
    old: "This Pokemon's Fire attacks do 1.5× damage if hit by one Fire move; Fire immunity.",
    // patch-dec2-psychup.md:53: "gains the Fire Boost status. The Fire Boost status will persist even if the Pokémon Mega Evolves."
    next: "This Pokemon's Fire attacks gain the Fire Boost status (1.5× damage) if hit by a Fire move; Fire immunity. The Fire Boost status persists even if the Pokemon Mega Evolves.",
  },
  {
    name: 'Stalwart',
    // patch-dec2-map.md:23: today's text
    old: "This Pokemon's moves cannot be redirected to a different target by any effect.",
    // patch-dec2-psychup.md:54: "When using its moves, the Pokémon ignores the effects of targets' substitutes."
    next: "This Pokemon's moves cannot be redirected to a different target by any effect. When using its moves, this Pokemon ignores the effects of targets' substitutes.",
  },
];

const changes = []; // {rel, desc, apply: () => void}
const pendingWrites = new Map(); // rel -> new content

const readRel = rel => {
  const full = P(rel);
  if (!fs.existsSync(full)) fail(`missing expected file: ${rel}`);
  return fs.readFileSync(full, 'utf8');
};

// 1. app/src/data/data.js (MOVES verification, LEARN additions, ABIL text updates)
{
  const rel = 'app/src/data/data.js';
  const src = readRel(rel);
  const grab = (name, re) => {
    const m = src.match(re);
    if (!m) fail(`${rel}: could not find ${name} declaration`);
    return {full: m[0], val: JSON.parse(m[1])};
  };
  const roster = grab('ROSTER', /^const ROSTER=(\[.*\]);$/m);
  const abil = grab('ABIL', /^const ABIL=(\{.*\});$/m);
  const moves = grab('MOVES', /^const MOVES=(\[.*\]);$/m);
  const learn = grab('LEARN', /^const LEARN=(\{.*\});$/m);

  const rosterNames = new Set(roster.val.map(p => p && p.n));
  const moveIndex = new Map(moves.val.map((m, i) => [Array.isArray(m) ? m[0] : m && m.name, i]));

  // patch-dec2-map.md:22 — verify all 6 moves exist in MOVES (no row change needed)
  for (const [mvName] of LEARN_ADDS) {
    if (!moveIndex.has(mvName)) fail(`${rel}: move "${mvName}" missing from MOVES`);
  }

  let learnChanged = 0;
  for (const [mvName, mons] of LEARN_ADDS) {
    const idx = moveIndex.get(mvName);
    for (const mon of mons) {
      if (!rosterNames.has(mon)) fail(`${rel}: Pokémon "${mon}" missing from ROSTER`);
      if (!Array.isArray(learn.val[mon])) fail(`${rel}: Pokémon "${mon}" missing from LEARN`);
      if (!learn.val[mon].includes(idx)) {
        learn.val[mon] = [...learn.val[mon], idx].sort((a, b) => a - b);
        learnChanged++;
        changes.push(`${rel}: LEARN["${mon}"] -> add ${mvName} (idx ${idx})`);
      }
    }
  }

  let abilChanged = 0;
  for (const {name, old, next} of ABIL_UPDATES) {
    const cur = abil.val[name];
    if (cur === next) continue;
    if (cur !== old) fail(`${rel}: unexpected ABIL["${name}"] text: ${JSON.stringify(cur)}`);
    abil.val[name] = next;
    abilChanged++;
    changes.push(`${rel}: ABIL["${name}"]: ${JSON.stringify(old)} -> ${JSON.stringify(next)}`);
  }

  if (learnChanged || abilChanged) {
    let out = src;
    if (abilChanged) out = out.replace(abil.full, () => `const ABIL=${JSON.stringify(abil.val)};`);
    if (learnChanged) out = out.replace(learn.full, () => `const LEARN=${JSON.stringify(learn.val)};`);
    pendingWrites.set(rel, out);
  }
}

// 2. app/src/v2/pages/infosheet.js — patch-dec2-map.md:24 & maggi-M4-patchmap.md (infosheet.js:16)
{
  const rel = 'app/src/v2/pages/infosheet.js';
  const src = readRel(rel);
  const old = "'Rock Slide': 'Hits both foes. Each one hit has a 30% chance to flinch.'";
  const next = "'Rock Slide': 'Hits both foes. Each one hit has a 20% chance to flinch.'";
  if (!src.includes(next)) {
    if (!src.includes(old)) fail(`${rel}: expected Rock Slide flinch line not found`);
    const out = src.replace(old, next);
    if (out.includes(old)) fail(`${rel}: multiple Rock Slide flinch lines found`);
    changes.push(`${rel}: ${old} -> ${next}`);
    pendingWrites.set(rel, out);
  }
}

// 3. app/test/run.mjs — patch-dec2-map.md:40-41 & maggi-M4-patchmap.md (run.mjs:146,149)
// Read Rock Slide's base accuracy from MOVE_ACC via T.moveAcc so Hustle expects floor(base * 0.8) (72 at 90%, 76 at 95%).
{
  const rel = 'app/test/run.mjs';
  const src = readRel(rel);
  const old1 = "hustle: T.moveAcc(M('Rock Slide'), 'Hustle', '', null, ''),";
  const next1 = "hustle: T.moveAcc(M('Rock Slide'), 'Hustle', '', null, ''), hustleBase: T.moveAcc(M('Rock Slide'), '', '', null, ''),";
  const old2 = "ok(r.sure.every(x => x === 100) && r.hustle === 72,";
  const next2 = "ok(r.sure.every(x => x === 100) && r.hustle === Math.floor(r.hustleBase * 0.8),";
  const already = src.includes(next1) && src.includes(next2);
  if (!already) {
    if (!src.includes(old1) || !src.includes(old2)) fail(`${rel}: expected Rock Slide Hustle accuracy check not found`);
    const out = src.replace(old1, next1).replace(old2, next2);
    changes.push(`${rel}: ${old1} -> ${next1}`);
    changes.push(`${rel}: ${old2} -> ${next2}`);
    pendingWrites.set(rel, out);
  }
}

if (!changes.length) {
  console.log(`apply-dec2-patch: no changes needed (already applied)${WRITE ? '' : ' [dry-run]'}`);
  process.exit(0);
}

for (const line of changes) console.log(line);

if (!WRITE) {
  console.log(`apply-dec2-patch: DRY RUN (${changes.length} change(s) across ${pendingWrites.size} file(s); pass --write to apply)`);
  process.exit(0);
}

for (const [rel, content] of pendingWrites) {
  fs.writeFileSync(P(rel), content, 'utf8');
}
console.log(`apply-dec2-patch: APPLIED ${changes.length} change(s) across ${pendingWrites.size} file(s)`);
