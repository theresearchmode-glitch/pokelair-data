// Every picture a new Pokémon needs, in one command (Reg M-D plan, Phase 0.3, Nov 24).
//   node experiments/add-sprites.mjs <PokéAPI id | Showdown name | id:Name> [...] [--write] [--crowd]
// For each Pokémon, the same files and formats as the existing ones (each rule checked against the repo's files, Nov 24):
//   1. old site  app/sp/<id>.webp           PokéAPI HOME render -> app/sprite-ink.py (512px, navy ink outline). Checked: rebuilds
//                                           sp/6 and sp/10035 byte for byte.
//   2. new site  docs/rebuild/art/up1024/<id>.webp   the 4x Real-ESRGAN upscale (realesrgan-x4plus-anime) + the approved edge clean.
//                THE UPSCALE NEEDS SIM'S PC GPU (docs/rebuild/gpu-jobs.md Job 2; the tool lives on his PC): when the file isn't
//                there, the exact PC commands are printed and the new-site steps wait. Put the x4 PNG at
//                experiments/out/sprites/x4/<id>.png and run again: the edge clean (experiments/add-sprites.py edge) makes up1024.
//   3. new site  app/src/v2/art/<id>.webp   + meta.json (colour, feet): experiments/v2-art.py --meta-only (384px q84 m4; checked: rebuilds
//                                           16 of 20 sampled files byte for byte, the other 4 same size, mean pixel difference < 1/255).
//   4. new site  app/src/v2/art-s/<id>.webp  240px from art, WebP q88 m6 (checked: 20 of 20 byte for byte).
//   5. SPRITE_ID ("Name":id) in app/src/app/15-visual-helpers.js: printed; added with --write (after the base species' entries).
//   --crowd also reruns experiments/v2-crowd-sheets.py (Home's crowd sheets); without it, the line to run is printed.
// Names: a PokéAPI id is named from SPRITE_ID, else PokéAPI's name ("heatran-mega" -> "Heatran-Mega"); a name is looked up in
// SPRITE_ID, else at PokéAPI (/api/v2/pokemon/<slug>). Use id:Name to set both.
import fs from 'node:fs'; import path from 'node:path'; import {execFileSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), has = k => process.argv.includes('--' + k), args = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!args.length) { console.log('usage: node experiments/add-sprites.mjs <PokéAPI id | Showdown name | id:Name> [...] [--write] [--crowd]'); process.exit(2); }
const HELP = ROOT + 'app/src/app/15-visual-helpers.js', helpSrc = fs.readFileSync(HELP, 'utf8'), m = helpSrc.match(/const SPRITE_ID = (\{[^\n]*?\});/);
if (!m) { console.error('SPRITE_ID not found in 15-visual-helpers.js'); process.exit(2); }
const SPR = JSON.parse(m[1]), byId = new Map(Object.entries(SPR).map(([n, i]) => [i, n]));
const WORK = ROOT + 'experiments/out/sprites/', HOME = WORK + 'home/', X4 = WORK + 'x4/'; fs.mkdirSync(HOME, {recursive: true}); fs.mkdirSync(X4, {recursive: true});
const sh = (cmd, a, env) => execFileSync(cmd, a, {cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], env: {...process.env, ...(env || {})}}).toString().trim();
const titled = s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('-');
const api = async u => { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: HTTP ${r.status}`); return r.json(); };
const lines = [], pending = []; let added = 0;
for (const a of args) {
  let id = null, name = null; const [x, y] = a.split(':');
  if (/^\d+$/.test(x)) { id = +x; name = y || byId.get(id) || titled((await api(`https://pokeapi.co/api/v2/pokemon/${id}`)).name); }
  else { name = x; id = SPR[name] || (await api(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().replace(/[^a-z0-9-]/g, '')}`)).id; }
  console.log(`\n== ${name} (PokéAPI id ${id})`);
  // 1. HOME render (cached) and the old site's inked sprite
  const png = HOME + id + '.png';
  if (!fs.existsSync(png)) { const r = await fetch(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`);
    if (!r.ok) { console.log(`  HOME render not found (HTTP ${r.status}): no picture made; do not use art from anywhere else (gpu-jobs.md)`); continue; }
    fs.writeFileSync(png, Buffer.from(await r.arrayBuffer())); }
  sh('python3', ['-I', 'app/sprite-ink.py', HOME, 'app/sp'], {ONLY: id + '.png'}); console.log(`  old site: app/sp/${id}.webp`);
  // 2. the upscale (PC) and its edge clean (here)
  const up = ROOT + `docs/rebuild/art/up1024/${id}.webp`, x4 = X4 + id + '.png';
  if (!fs.existsSync(up) && fs.existsSync(x4)) console.log('  ' + sh('python3', ['-I', 'experiments/add-sprites.py', 'edge', x4, up]));
  if (!fs.existsSync(up)) { pending.push({id, name}); console.log(`  new site: WAITING for the upscale (needs Sim's PC GPU; commands below)`); }
  else { // 3 + 4: the 384px and 240px files and meta.json (v2-art.py --meta-only only writes art files that are missing)
    const MJ = ROOT + 'app/src/v2/art/meta.json', beforeText = fs.existsSync(MJ) ? fs.readFileSync(MJ, 'utf8') : '{}', before = JSON.parse(beforeText);
    sh('python3', ['-I', 'experiments/v2-art.py', '--meta-only']); sh('python3', ['-I', 'experiments/add-sprites.py', 'small', String(id)]);
    /* v2-art.py rewrites every entry; on another machine one colour can round 1 step differently (981: 132 -> 131 here), and Node would
       reorder the keys and drop Python's "0.0", so the old text is kept byte for byte and only a new entry is appended, as Python wrote it */
    const freshText = fs.readFileSync(MJ, 'utf8'), entry = freshText.match(new RegExp(`"${id}":\\[[^\\]]*\\]`));
    const text = id in before || !entry ? beforeText : beforeText.replace(/\}\s*$/, (beforeText.trim() === '{}' ? '' : ',') + entry[0] + '}');
    fs.writeFileSync(MJ, text);
    console.log(`  new site: app/src/v2/art/${id}.webp, app/src/v2/art-s/${id}.webp, meta.json ${id in before ? 'entry kept as it was' : entry ? 'new entry ' + entry[0] : 'NO ENTRY (check v2-art.py)'}`); }
  // 5. SPRITE_ID
  if (SPR[name] === id) { console.log(`  SPRITE_ID: already has "${name}":${id}`); continue; }
  lines.push([name, id]); console.log(`  SPRITE_ID line to add: "${name}":${id}`); }
if (lines.length && has('write')) { const keys = Object.keys(SPR), o = {};
  for (const [n, i] of lines) { const base = n.split('-')[0]; let at = -1; keys.forEach((k, j) => { if (k === base || k.startsWith(base + '-')) at = j; }); keys.splice(at < 0 ? keys.length : at + 1, 0, n); SPR[n] = i; added++; }
  keys.forEach(k => { o[k] = SPR[k]; }); fs.writeFileSync(HELP, helpSrc.replace(m[1], () => JSON.stringify(o))); console.log(`\nSPRITE_ID: added ${added} to app/src/app/15-visual-helpers.js`); }
else if (lines.length) console.log(`\nSPRITE_ID: add with --write, or by hand: ${lines.map(([n, i]) => `"${n}":${i}`).join(',')}`);
if (pending.length) { console.log(`\nON SIM'S PC (RTX 3080; Real-ESRGAN at C:\\Users\\simra\\tools\\realesrgan\\x\\, docs/redesign/source/README.md):`);
  for (const {id} of pending) console.log(`  realesrgan-ncnn-vulkan.exe -i ${id}.png -o ${id}-x4.png -n realesrgan-x4plus-anime -s 4 -g 0     (input: the HOME render, ${path.relative(ROOT, HOME)}/${id}.png)`);
  console.log(`then copy each <id>-x4.png here as ${path.relative(ROOT, X4)}/<id>.png and run this command again (the edge clean and the 384/240 files follow).`); }
if (has('crowd')) { sh('python3', ['-I', 'experiments/v2-crowd-sheets.py']); console.log('\ncrowd sheets rebuilt (app/src/v2/art/crowd-*.webp, crowd.json)'); }
else if (!pending.length) console.log('\nHome crowd sheets: run `python3 -I experiments/v2-crowd-sheets.py` (or --crowd) so the new Pokémon joins the crowd.');
console.log('\nthen: node app/build.mjs --v2 --preview-data   (expect "guard: clean")');
