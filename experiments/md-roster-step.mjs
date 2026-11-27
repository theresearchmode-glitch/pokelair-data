// Dec 1 night roster step, in one command (Job 42, Nov 25).
// Runs every file update required when adding new regulation Pokémon + Megas, in order:
//   1. app/src/data/data.js     via experiments/gen-roster.mjs
//   2. roster.json              rebuilt from the new ROSTER names
//   3. app/src/app/15-visual-helpers.js  SPRITE_ID entries for any new Pokémon/Megas
//   4. experiments/add-sprites.mjs       prints exact command (or runs it with --run-sprites)
//   5. app/src/data/items-list.js        rebuilt from --items <txt> (if provided)
//   6. app/src/app/24-sheet-data.js      PAGE_REG updated to --reg <id> (if provided)
//   7. regulation.json                   "site" updated to --reg <id> (if file exists & --reg provided)
//   8. experiments/apply-dec2-patch.mjs  re-applied automatically if present (so regenerated LEARN keeps patch moves);
//      before 2026-12-02T02:00Z it is skipped with a message unless --force-patch is given
//
// DRY-RUN by default: prints every planned change and writes nothing. Pass --write to apply.
// Stops on the first error with a plain message (exit 1).
//
// Usage:
//   node experiments/md-roster-step.mjs [--root <dir>] [--ps <showdown dir>] [--format <sd format>]
//        [--add <extra.json>] [--sprites <map.json>] [--items <items.txt>] [--reg <M-D>]
//        [--run-sprites] [--force-patch] [--write]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const SCRIPT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d = null) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes('--' + k);
const fail = msg => { console.error('md-roster-step ERROR: ' + msg); process.exit(1); };

const ROOT = path.resolve(arg('root', SCRIPT_ROOT));
const WRITE = has('write');
const RUN_SPRITES = has('run-sprites');
const FMT = arg('format', 'gen9championsvgc2026regmc');
const REG = arg('reg', null);
const ADD_ARG = arg('add', null);
const SPRITES_ARG = arg('sprites', null);
const ITEMS_ARG = arg('items', null);

// Resolve Showdown dir
let psDir = path.resolve(arg('ps', process.env.PS_DIR || path.join(ROOT, 'node_modules/pokemon-showdown')));
if (!fs.existsSync(path.join(psDir, 'config/formats.ts')) && fs.existsSync(path.join(psDir, 'node_modules/pokemon-showdown'))) {
  psDir = path.join(psDir, 'node_modules/pokemon-showdown');
}
if (!fs.existsSync(path.join(psDir, 'dist'))) fail(`Showdown is not built at ${psDir} (run \`node build\` inside pokemon-showdown first)`);

if (REG && !/^[A-Z]-[A-Z]$/.test(REG)) fail(`--reg must look like M-D (got "${REG}")`);

const P = rel => path.join(ROOT, rel);
for (const req of ['app/src/data/data.js', 'app/src/app/15-visual-helpers.js', 'app/src/app/24-sheet-data.js', 'experiments/gen-roster.mjs']) {
  if (!fs.existsSync(P(req))) fail(`required file missing in ${ROOT}: ${req}`);
}

let extraList = [];
if (ADD_ARG) {
  const fp = path.resolve(ADD_ARG);
  if (!fs.existsSync(fp)) fail(`--add file not found: ${fp}`);
  try { extraList = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { fail(`--add file is not valid JSON: ${e.message}`); }
  if (!Array.isArray(extraList)) fail('--add file must be a JSON array');
}

let spriteMap = {};
if (SPRITES_ARG) {
  const fp = path.resolve(SPRITES_ARG);
  if (!fs.existsSync(fp)) fail(`--sprites file not found: ${fp}`);
  try { spriteMap = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { fail(`--sprites file is not valid JSON: ${e.message}`); }
}
for (const x of extraList) {
  if (x && x.n && Number.isInteger(x.sprite) && x.sprite > 0 && !(x.n in spriteMap)) spriteMap[x.n] = x.sprite;
}

let itemLines = null;
if (ITEMS_ARG) {
  const fp = path.resolve(ITEMS_ARG);
  if (!fs.existsSync(fp)) fail(`--items file not found: ${fp}`);
  itemLines = [...new Set(fs.readFileSync(fp, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean))].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  if (!itemLines.length) fail(`--items file is empty: ${fp}`);
}

console.log(`md-roster-step (${WRITE ? 'WRITE' : 'DRY-RUN'}) in ${ROOT}`);

// Step 1: gen-roster.mjs
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md-roster-step-'));
const genOut = path.join(tmpDir, 'data.generated.js');
const genArgs = [P('experiments/gen-roster.mjs'), '--ps', psDir, '--format', FMT, '--out', genOut];
if (ADD_ARG) genArgs.push('--add', path.resolve(ADD_ARG));
const gr = spawnSync(process.execPath, genArgs, {cwd: ROOT, encoding: 'utf8'});
if (gr.status !== 0) {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  fail(`gen-roster.mjs failed (exit ${gr.status}): ${(gr.stderr || gr.stdout || '').trim().slice(0, 300)}`);
}
const genText = fs.readFileSync(genOut, 'utf8');
const curDataText = fs.readFileSync(P('app/src/data/data.js'), 'utf8');
const parseRoster = txt => {
  const m = txt.match(/^const ROSTER=(\[[\s\S]*?\]);\n/m);
  if (!m) fail('could not parse ROSTER from data.js');
  return JSON.parse(m[1]);
};
const oldRoster = parseRoster(curDataText);
const newRoster = parseRoster(genText);
const oldNames = new Set(oldRoster.map(p => p.n));
const newNames = newRoster.map(p => p.n);
const addedNames = newNames.filter(n => !oldNames.has(n));
const removedNames = oldRoster.map(p => p.n).filter(n => !new Set(newNames).has(n));
console.log(`  1. data.js: ${oldRoster.length} -> ${newRoster.length} entries (+${addedNames.length}: ${addedNames.join(', ') || 'none'}; -${removedNames.length}: ${removedNames.join(', ') || 'none'})${genText === curDataText ? ' [unchanged]' : ''}`);
if (WRITE && genText !== curDataText) fs.writeFileSync(P('app/src/data/data.js'), genText);
fs.rmSync(tmpDir, {recursive: true, force: true});

// Step 2: roster.json
const rosterPath = P('roster.json');
const newRosterJson = JSON.stringify(newNames);
const curRosterJson = fs.existsSync(rosterPath) ? fs.readFileSync(rosterPath, 'utf8').trim() : '';
console.log(`  2. roster.json: ${newNames.length} names${curRosterJson === newRosterJson ? ' [unchanged]' : ' [will update]'}`);
if (WRITE && curRosterJson !== newRosterJson) fs.writeFileSync(rosterPath, newRosterJson);

// Step 3: SPRITE_ID in app/src/app/15-visual-helpers.js
const helpPath = P('app/src/app/15-visual-helpers.js');
const helpSrc = fs.readFileSync(helpPath, 'utf8');
const sprMatch = helpSrc.match(/const SPRITE_ID = (\{[^\n]*?\});/);
if (!sprMatch) fail('SPRITE_ID not found in app/src/app/15-visual-helpers.js');
const sprObj = JSON.parse(sprMatch[1]);
const missingSpr = newNames.filter(n => !(n in sprObj) && !(n in spriteMap));
if (missingSpr.length) fail(`missing SPRITE_ID for new roster Pokémon: ${missingSpr.join(', ')} (supply via --add sprite field or --sprites JSON)`);
const sprToAdd = newNames.filter(n => !(n in sprObj) && (n in spriteMap));
if (sprToAdd.length) {
  const keys = Object.keys(sprObj);
  for (const n of sprToAdd) {
    const base = n.split('-')[0];
    let at = -1;
    keys.forEach((k, j) => { if (k === base || k.startsWith(base + '-')) at = j; });
    keys.splice(at < 0 ? keys.length : at + 1, 0, n);
    sprObj[n] = spriteMap[n];
  }
  const ordered = {};
  for (const k of keys) ordered[k] = sprObj[k];
  const nextHelp = helpSrc.replace(sprMatch[1], () => JSON.stringify(ordered));
  console.log(`  3. SPRITE_ID: +${sprToAdd.length} (${sprToAdd.map(n => `${n}:${sprObj[n]}`).join(', ')})`);
  if (WRITE) fs.writeFileSync(helpPath, nextHelp);
} else {
  console.log('  3. SPRITE_ID: all roster Pokémon present [unchanged]');
}

// Step 4: sprites via experiments/add-sprites.mjs
const spritePairs = sprToAdd.map(n => `${sprObj[n]}:${n}`);
if (spritePairs.length) {
  const cmd = `node experiments/add-sprites.mjs ${spritePairs.join(' ')}${WRITE ? ' --write' : ''}`;
  if (RUN_SPRITES && WRITE) {
    console.log(`  4. sprites: running ${cmd}`);
    const sr = spawnSync(process.execPath, [P('experiments/add-sprites.mjs'), ...spritePairs, '--write'], {cwd: ROOT, encoding: 'utf8'});
    if (sr.status !== 0) fail(`add-sprites.mjs failed (exit ${sr.status}): ${(sr.stderr || sr.stdout || '').trim().slice(0, 300)}`);
  } else {
    console.log(`  4. sprites: next command -> ${cmd}`);
  }
} else {
  console.log('  4. sprites: no new sprite entries needed [unchanged]');
}

// Step 5: items list -> app/src/data/items-list.js
if (itemLines) {
  const itemsPath = P('app/src/data/items-list.js');
  const regLabel = REG || 'M-C';
  const relItems = path.relative(ROOT, path.resolve(ITEMS_ARG)).replace(/\\/g, '/');
  const nextItems = `// Every item legal in Reg ${regLabel} (${itemLines.length}), from ${relItems} (experiments/md-roster-step.mjs).\nconst REGMC_ITEMS=${JSON.stringify(itemLines)};\n`;
  const curItems = fs.existsSync(itemsPath) ? fs.readFileSync(itemsPath, 'utf8') : '';
  console.log(`  5. items-list.js: ${itemLines.length} items${curItems === nextItems ? ' [unchanged]' : ' [will update]'}`);
  if (WRITE && curItems !== nextItems) fs.writeFileSync(itemsPath, nextItems);
} else {
  console.log('  5. items-list.js: skipped (--items not given)');
}

// Step 6: PAGE_REG in app/src/app/24-sheet-data.js
if (REG) {
  const sheetPath = P('app/src/app/24-sheet-data.js');
  const sheetSrc = fs.readFileSync(sheetPath, 'utf8');
  const m = sheetSrc.match(/const PAGE_REG = '([A-Z]-[A-Z])';/);
  if (!m) fail('const PAGE_REG = ... not found in app/src/app/24-sheet-data.js');
  const nextSheet = sheetSrc.replace(m[0], `const PAGE_REG = '${REG}';`);
  console.log(`  6. PAGE_REG: '${m[1]}' -> '${REG}'${m[1] === REG ? ' [unchanged]' : ''}`);
  if (WRITE && m[1] !== REG) fs.writeFileSync(sheetPath, nextSheet);
} else {
  console.log('  6. PAGE_REG: skipped (--reg not given)');
}

// Step 7: regulation.json "site"
const regJsonPath = P('regulation.json');
if (REG && fs.existsSync(regJsonPath)) {
  const regRaw = fs.readFileSync(regJsonPath, 'utf8');
  let regDoc;
  try { regDoc = JSON.parse(regRaw); } catch (e) { fail(`regulation.json invalid JSON: ${e.message}`); }
  if (!regDoc.regs || !regDoc.regs[REG]) fail(`regulation.json has no regs["${REG}"] entry`);
  const nextRaw = regRaw.replace(/"site":\s*"[A-Z]-[A-Z]"/, `"site": "${REG}"`);
  console.log(`  7. regulation.json site: "${regDoc.site}" -> "${REG}"${regDoc.site === REG ? ' [unchanged]' : ''}`);
  if (WRITE && regDoc.site !== REG) fs.writeFileSync(regJsonPath, nextRaw);
} else {
  console.log(`  7. regulation.json: skipped (${!REG ? '--reg not given' : 'file not present on this branch'})`);
}

// Step 8: re-apply Dec 2 balance patch if present (regenerating data.js resets LEARN)
const patchScript = P('experiments/apply-dec2-patch.mjs');
if (fs.existsSync(patchScript)) {
  if (WRITE) {
    /* apply-dec2-patch.mjs is a dry run unless given --write, and refuses --write before 2026-12-02T02:00Z (exit 3) unless --force */
    const nowArg = arg('now', null);
    const pr = spawnSync(process.execPath, [patchScript, '--write', '--root', ROOT, ...(has('force-patch') ? ['--force'] : []), ...(nowArg ? ['--now', nowArg] : [])], {cwd: ROOT, encoding: 'utf8'});
    if (pr.status === 3) console.log('  8. apply-dec2-patch.mjs: NOT applied, it is before the patch time (2026-12-02T02:00Z). After that, run: node experiments/apply-dec2-patch.mjs --write (or pass --force-patch here)');
    else if (pr.status !== 0) fail(`apply-dec2-patch.mjs failed (exit ${pr.status}): ${(pr.stderr || pr.stdout || '').trim().slice(0, 300)}`);
    else console.log('  8. apply-dec2-patch.mjs: re-applied cleanly');
  } else {
    console.log('  8. apply-dec2-patch.mjs: will re-apply on --write');
  }
} else {
  console.log('  8. apply-dec2-patch.mjs: not present [skipped]');
}

console.log(`md-roster-step: ${WRITE ? 'DONE' : 'DRY-RUN COMPLETE (pass --write to apply)'}`);
