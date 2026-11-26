// Reg M-D plan, Phase 0.2 / gap G10 (Nov 24): rebuild the Pokémon data the site uses (app/src/data/data.js: ROSTER, ABIL, MOVES,
// LEARN) from Pokémon Showdown's Champions data for one format, and print what changed against today's file.
//
//   node experiments/gen-roster.mjs --ps <folder that holds node_modules/pokemon-showdown, or the showdown folder itself>
//        [--format gen9championsvgc2026regmc] [--out <file>] [--report <file.md>] [--add <extra.json>] [--write]
//
// Showdown must be built (`node build` in its folder; CI pins commit 1242c1e2d9763ba5b85d33f13aecb89bae19ae3d, test.yml).
// Writes <out> (default experiments/out/data.generated.js) and NEVER touches data.js unless --write is given.
//
// WHO IS IN THE ROSTER (the format's own rules, no list typed here): every species of the format's mod that exists, is not marked
// isNonstandard, is not banned by the format's rule table (Flat Rules bans Mythical and Restricted Legendary), is not an in-battle-only
// form unless it is a Mega, and is not cosmetic: flagged isCosmeticForme, or a non-Mega form whose types, base stats and Abilities are
// all the same as its base species' (Polteageist-Antique, Sinistcha-Masterpiece, Maushold-Four...; each one dropped is listed), unless
// today's roster already has it (Squawkabilly-Blue: a colour form, kept by hand in October).
// Order: carried over from today's file (see ORDER below); a new Pokémon goes after its base species' entries, else by Dex number.
// LEARNSETS: the species' own learnset, else the one of the form it changes from (a Mega uses its pre-Mega form's: Floette-Mega ->
// Floette-Eternal), else its base species'. MOVES: [name, type index (engine/types.js TYPES), category 0 status / 1 physical /
// 2 special, base power, sound flag, spread (hits all adjacent)], numbered in order of first use walking the roster, each learnset
// in move-id order. LEARN keeps extra entries for battle-only forms the old file had (Castform weathers, Aegislash-Blade).
//
// CARRIED OVER BY NAME, NOT FROM SHOWDOWN: u / us (the built-in usage fallback), each existing Ability's text in ABIL (ours was edited:
// "×" not "x"; a new Ability gets Showdown's short text with x -> ×), DEFAULT_BOX, SETS, RESULTS, PERF_RAW (copied as they are), and
// each existing entry's key order (so an unchanged entry is byte-identical). New Pokémon get u 0, us 0.
// --add <json>: extra species for a dry run when Showdown doesn't have them yet: [{n, b, t, st, a?, m?, learnFrom?}] where a missing
// Ability becomes "not announced yet" and learnFrom names an existing entry whose moves it copies (else no moves).
import fs from 'node:fs'; import path from 'node:path'; import {createRequire} from 'node:module'; import {fileURLToPath} from 'node:url';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; }, has = k => process.argv.includes('--' + k);
const ROOT = fileURLToPath(new URL('..', import.meta.url)), DATA = ROOT + 'app/src/data/data.js';
const psArg = arg('ps', process.env.PS_DIR || ROOT); let psDir = path.resolve(psArg);
if (!fs.existsSync(path.join(psDir, 'config/formats.ts')) && fs.existsSync(path.join(psDir, 'node_modules/pokemon-showdown'))) psDir = path.join(psDir, 'node_modules/pokemon-showdown');
if (!fs.existsSync(path.join(psDir, 'dist'))) { console.error(`Showdown not found or not built at ${psDir} (run \`node build\` there)`); process.exit(2); }
const PS = createRequire(path.join(psDir, 'x.js'))(psDir);
const {Dex} = PS, fmtId = arg('format', 'gen9championsvgc2026regmc'), fmt = Dex.formats.get(fmtId);
if (!fmt.exists) { console.error('Unknown format ' + fmtId); process.exit(2); }
const D = Dex.forFormat(fmt), RT = Dex.formats.getRuleTable(fmt);
const TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'], toId = t => String(t).toLowerCase().replace(/[^a-z0-9]/g, '');

// ---- today's file
const src = fs.readFileSync(DATA, 'utf8'), decl = [...src.matchAll(/^const ([A-Z_]+)=/gm)].map(m => ({k: m[1], at: m.index}));
const raw = {}; decl.forEach((d, i) => { const end = i + 1 < decl.length ? decl[i + 1].at : src.length; raw[d.k] = src.slice(d.at, end); });
const cut = k => raw[k].indexOf(';\n') + 2, val = k => JSON.parse(raw[k].slice(raw[k].indexOf('=') + 1, cut(k) - 2)); /* a value ends at its first ';' + newline; what follows is the next block's header comment */
const OLD = {ROSTER: val('ROSTER'), ABIL: val('ABIL'), MOVES: val('MOVES'), LEARN: val('LEARN')}, oldBy = new Map(OLD.ROSTER.map(p => [p.n, p]));

// ---- the roster from Showdown
const same = (s, b) => JSON.stringify(s.types) === JSON.stringify(b.types) && JSON.stringify(s.baseStats) === JSON.stringify(b.baseStats) && JSON.stringify(s.abilities) === JSON.stringify(b.abilities);
/* HAND DECISIONS carried over (each with its reason; printed in the report): forms Showdown lists that the site keeps out on purpose */
const HAND_OMIT = {'Meowstic-F': 'the site folds it into Meowstic: the paste importer maps "Meowstic-F" to Meowstic (app/src/app/19-showdown-paste.js:76); only its Mega is separate'};
const dropped = [], species = [];
for (const s of D.species.all()) {
  if (!s.exists || s.isNonstandard || RT.isBannedSpecies(s)) continue;
  if (HAND_OMIT[s.name]) { dropped.push(`${s.name} (hand decision: ${HAND_OMIT[s.name]})`); continue; }
  if (s.battleOnly && !s.isMega) { dropped.push(`${s.name} (in-battle form)`); continue; }
  if (s.isCosmeticForme) { dropped.push(`${s.name} (cosmetic, flagged)`); continue; }
  if (s.forme && !s.isMega && s.name !== s.baseSpecies && !oldBy.has(s.name)) { const b = D.species.get(s.baseSpecies); if (b.exists && same(s, b)) { dropped.push(`${s.name} (same types, stats and Abilities as ${b.name})`); continue; } }
  species.push(s); }
/* ORDER, carried over: today's order is the hand-built one (Perrserker beside Persian, Politoed before Alakazam, but Annihilape near the
   end: probably the game's own list, which Showdown doesn't have), so every Pokémon already in data.js keeps its place. A new one goes
   right after the last entry of its base species, or, for a new family, before the first entry with a higher Dex number. */
const oldPos = new Map(OLD.ROSTER.map((p, i) => [p.n, i]));
/* the hand order isn't sorted by number, so a new family goes right after the entry with the closest lower Dex number (and its forms) */
const afterNum = (nums, n) => { let best = -1; nums.forEach((x, i) => { if (x < n && (best < 0 || x > nums[best] || x === nums[best])) best = i; }); return best + 1; };
const keep = species.filter(s => oldPos.has(s.name)).sort((x, y) => oldPos.get(x.name) - oldPos.get(y.name)), fresh = species.filter(s => !oldPos.has(s.name)).sort((x, y) => x.num - y.num);
for (const s of fresh) { let at = -1; for (let k = 0; k < keep.length; k++) if (keep[k].baseSpecies === s.baseSpecies && (s.isMega || !keep[k].isMega)) at = k + 1; /* a new form goes before its family's Megas */
  if (at < 0) at = afterNum(keep.map(k => k.num), s.num); keep.splice(at, 0, s); }
species.splice(0, species.length, ...keep);
const order = species; /* Showdown's formeOrder puts each species' forms and Megas in the order today's file has them (Raichu, Raichu-Alola, Raichu-Mega-X) */
const learnOf = s => { for (const id of [s.id, s.changesFrom && D.species.get(s.changesFrom).id, D.species.get(s.baseSpecies).id]) { if (!id) continue; const l = D.species.getLearnsetData(id); if (l && l.learnset) return Object.keys(l.learnset); } return []; };

// --add: species Showdown doesn't have yet (dry runs)
const extra = has('add') ? JSON.parse(fs.readFileSync(arg('add'), 'utf8')) : [];
const entries = order.map(s => ({num: s.num, from0: s.changesFrom, n: s.name, t: [...s.types], a: [...new Set(Object.values(s.abilities))].filter(Boolean), m: s.isMega ? 1 : 0, b: s.baseSpecies,
  st: STATS.map(k => s.baseStats[k]), moves: learnOf(s).map(id => D.moves.get(id)).filter(m => m.exists && !m.isNonstandard)}));
for (const x of extra) { const at = entries.findIndex(e => e.b === x.b), base = x.learnFrom && entries.find(e => e.n === x.learnFrom);
  /* moves: --add's learnFrom entry, else Showdown's learnset for the base species filtered to moves that exist in this mod (a stand-in until
     the real data: it isn't checked against the Champions game), else none */
  const sl = !base && D.species.getLearnsetData(toId(x.b)), slMoves = sl && sl.learnset ? Object.keys(sl.learnset).map(id => D.moves.get(id)).filter(m => m.exists && !m.isNonstandard) : [];
  const e = {num: x.num || 9999, n: x.n, t: x.t, a: x.a && x.a.length ? x.a : ['not announced yet'], m: x.m ? 1 : 0, b: x.b, st: x.st, moves: base ? base.moves : slMoves, added: true,
    from: base ? `copied from ${base.n}` : slMoves.length ? `stand-in: Showdown's ${x.b} learnset, ${slMoves.length} moves that exist in "${fmt.mod}" (not checked against the game)` : 'none'};
  if (at >= 0) { let j = at; while (j + 1 < entries.length && entries[j + 1].b === x.b) j++; entries.splice(j + 1, 0, e); }
  else entries.splice(afterNum(entries.map(q => q.num), e.num), 0, e); }

// ---- MOVES and LEARN (first use, walking the roster, each learnset in name order)
const moveIdx = new Map(), MOVES = [], LEARN = {};
const row = m => [m.name, TYPES.indexOf(m.type), m.category === 'Status' ? 0 : m.category === 'Physical' ? 1 : 2, m.basePower || 0, m.flags && m.flags.sound ? 1 : 0, ['allAdjacent', 'allAdjacentFoes'].includes(m.target) ? 1 : 0];
const idxOf = m => { if (!moveIdx.has(m.name)) { moveIdx.set(m.name, MOVES.length); MOVES.push(row(m)); } return moveIdx.get(m.name); };
for (const e of entries) LEARN[e.n] = [...e.moves].sort((x, y) => x.id < y.id ? -1 : 1).map(idxOf).sort((x, y) => x - y); /* move id order (muddywater before mudshot), as Showdown lists a learnset */
// battle-only forms the old LEARN kept (Castform weathers, Aegislash-Blade): their own learnset when Showdown has one, else their base's
const extraKeys = Object.keys(OLD.LEARN).filter(k => !LEARN[k] && D.species.get(k).exists);
for (const k of extraKeys) LEARN[k] = [...learnOf(D.species.get(k)).map(id => D.moves.get(id)).filter(m => m.exists && !m.isNonstandard)].sort((x, y) => x.id < y.id ? -1 : 1).map(idxOf).sort((x, y) => x - y);
/* each battle-only entry sits right after the Pokémon it is a form of (Castform-Sunny after Castform), as today */
{ const ordered = {}; for (const e of entries) { ordered[e.n] = LEARN[e.n]; for (const k of extraKeys) if (D.species.get(k).battleOnly === e.n) ordered[k] = LEARN[k]; }
  for (const k of extraKeys) if (!(k in ordered)) ordered[k] = LEARN[k]; for (const k of Object.keys(LEARN)) delete LEARN[k]; Object.assign(LEARN, ordered); }

// ---- ROSTER entries (carry u / us and key order by name)
const ROSTER = entries.map(e => { const o = oldBy.get(e.n), v = {n: e.n, t: e.t, a: e.a, m: e.m, u: o ? o.u : 0, s: e.st.reduce((x, y) => x + y, 0), us: o ? o.us : 0, b: e.b, sp: e.st[5], st: e.st};
  const keys = o ? Object.keys(o) : ['n', 't', 'a', 'm', 'u', 's', 'us', 'b', 'sp', 'st']; return Object.fromEntries(keys.filter(k => k in v).map(k => [k, v[k]])); });
// ---- ABIL (first use in roster order; our text kept by name, Showdown's short text for a new one)
const ABIL = {}; for (const p of ROSTER) for (const a of p.a) if (!(a in ABIL)) { if (a in OLD.ABIL) ABIL[a] = OLD.ABIL[a]; else { const d = D.abilities.get(a); ABIL[a] = d.exists ? (d.shortDesc || d.desc || '').replace(/(\d)x\b/g, '$1×') : 'Not announced yet.'; } }

// ---- write the new file: the four generated consts, everything else copied as it is
const outFile = path.resolve(arg('out', ROOT + 'experiments/out/data.generated.js')), gen = {ROSTER, ABIL, MOVES, LEARN};
const text = src.slice(0, decl[0].at) + decl.map(d => gen[d.k] ? `const ${d.k}=${JSON.stringify(gen[d.k])};\n` + raw[d.k].slice(cut(d.k)) : raw[d.k]).join('');
fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, text);
if (has('write')) fs.writeFileSync(DATA, text);

// ---- the change report (by name, never by index)
const mv = (M, L, n) => new Set((L[n] || []).map(i => M[i] && M[i][0]));
const oldN = new Set(OLD.ROSTER.map(p => p.n)), newN = new Set(ROSTER.map(p => p.n)), R = [];
const added = ROSTER.filter(p => !oldN.has(p.n)).map(p => p.n), removed = OLD.ROSTER.filter(p => !newN.has(p.n)).map(p => p.n);
const changed = []; for (const p of ROSTER) { const o = oldBy.get(p.n); if (!o) continue; const d = [];
  for (const k of ['t', 'a', 'st', 'm', 'b']) if (JSON.stringify(o[k]) !== JSON.stringify(p[k])) d.push(`${k}: ${JSON.stringify(o[k])} -> ${JSON.stringify(p[k])}`);
  const a = mv(OLD.MOVES, OLD.LEARN, p.n), b = mv(MOVES, LEARN, p.n), plus = [...b].filter(x => !a.has(x)), minus = [...a].filter(x => !b.has(x));
  if (plus.length) d.push(`learns now: ${plus.join(', ')}`); if (minus.length) d.push(`no longer learns: ${minus.join(', ')}`); if (d.length) changed.push(`${p.n}: ${d.join('; ')}`); }
const oldMoves = new Map(OLD.MOVES.map(m => [m[0], m])), newMoves = new Map(MOVES.map(m => [m[0], m]));
const movesAdded = MOVES.filter(m => !oldMoves.has(m[0])).map(m => m[0]), movesGone = OLD.MOVES.filter(m => !newMoves.has(m[0])).map(m => m[0]);
const movesChanged = MOVES.filter(m => oldMoves.has(m[0]) && JSON.stringify(oldMoves.get(m[0]).slice(1)) !== JSON.stringify(m.slice(1))).map(m => `${m[0]}: ${JSON.stringify(oldMoves.get(m[0]).slice(1))} -> ${JSON.stringify(m.slice(1))}`);
const abAdded = Object.keys(ABIL).filter(a => !(a in OLD.ABIL)), abGone = Object.keys(OLD.ABIL).filter(a => !(a in ABIL));
/* SPRITE_ID (PokéAPI ids, app/src/app/15-visual-helpers.js) is app code, not data.js: list every roster entry that has none, for a hand edit */
let SPR = {}; try { SPR = JSON.parse(fs.readFileSync(ROOT + 'app/src/app/15-visual-helpers.js', 'utf8').match(/const SPRITE_ID = (\{[^\n]*?\});/)[1]); } catch (e) {}
const noSprite = ROSTER.filter(p => !(p.n in SPR)).map(p => p.n + (extra.find(x => x.n === p.n && x.sprite) ? ` (PokéAPI id ${extra.find(x => x.n === p.n).sprite})` : ''));
const learnKeys = [...new Set([...Object.keys(OLD.LEARN), ...Object.keys(LEARN)])].filter(k => !newN.has(k) && !oldN.has(k)).filter(k => !!OLD.LEARN[k] !== !!LEARN[k]);
const cf = Object.fromEntries(entries.map(e => [e.n, e.from0])), orphanMega = ROSTER.filter(p => p.m && !newN.has(p.b) && !newN.has(cf[p.n])).map(p => `${p.n}: its base form ${p.b} is not in the roster (the site looks Megas up by base; check before shipping)`);
const addedFrom = Object.fromEntries(entries.filter(e => e.added).map(e => [e.n, e.from]));
const consts = Object.fromEntries(Object.keys(gen).map(k => [k, `const ${k}=${JSON.stringify(gen[k])};\n` === raw[k].slice(0, cut(k))]));
const L = s => s.length ? s.map(x => '- ' + x).join('\n') : '- none';
R.push(`# Roster change report: ${fmt.name} (${fmtId}), Showdown mod "${fmt.mod}"`, '', `Generated by experiments/gen-roster.mjs from ${psDir}. Compared by name with app/src/data/data.js.`,
  `Output: ${path.relative(ROOT, outFile)}${has('write') ? ' (ALSO WRITTEN to data.js)' : ' (data.js untouched)'}${extra.length ? `; --add ${arg('add')} (${extra.length} made-up entr${extra.length === 1 ? 'y' : 'ies'})` : ''}.`, '',
  `Roster ${OLD.ROSTER.length} -> ${ROSTER.length} entries; moves ${OLD.MOVES.length} -> ${MOVES.length}; Abilities ${Object.keys(OLD.ABIL).length} -> ${Object.keys(ABIL).length}.`,
  `Byte-identical to today's text: ${Object.entries(consts).map(([k, v]) => `${k} ${v ? 'yes' : 'NO'}`).join(', ')}; whole file ${text === src ? 'yes' : 'NO'}.`, '',
  '## Pokémon and forms added', L(added.map(n => { const p = ROSTER.find(q => q.n === n); return `${n} (${p.t.join('/')}, ${p.st.join('/')}, ${p.a.join(', ')}; ${(LEARN[n] || []).length} moves${addedFrom[n] ? `, moves ${addedFrom[n]}` : ''})`; })), '',
  '## Warnings', L(orphanMega), '',
  '## Pokémon and forms removed', L(removed), '', '## Changed (types, Abilities, stats, Mega flag, base, moves learned)', L(changed), '',
  '## Moves added', L(movesAdded), '', '## Moves removed', L(movesGone), '', '## Moves changed (type, category, power, sound, spread)', L(movesChanged), '',
  '## Abilities added', L(abAdded.map(a => `${a}: ${ABIL[a]}`)), '', '## Needs a SPRITE_ID (app/src/app/15-visual-helpers.js, by hand)', L(noSprite), '', '## Abilities removed', L(abGone), '', '## LEARN-only entries (battle-only forms) added or removed', L(learnKeys), '',
  '## Forms Showdown lists as legal that the roster leaves out (rule above)', L(dropped), '');
const report = R.join('\n'); if (has('report')) { fs.mkdirSync(path.dirname(path.resolve(arg('report'))), {recursive: true}); fs.writeFileSync(arg('report'), report); }
console.log(report);
