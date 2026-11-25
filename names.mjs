// Shared name and text helpers for the data scripts (official.mjs, sources.mjs): species text -> NastyPlot roster name,
// held-item check, HTML to text. Paths are relative to the working folder, so a dry run can run from a scratch copy.
import fs from 'node:fs';
import {activeReg, regProfile, LEGACY_REG} from './formats.mjs';
export const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
export const dec = s => s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;|&#8217;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
export const text = h => dec(h.replace(/<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '\n')).split('\n').map(x => x.trim()).filter(Boolean);
export const ROSTER = new Set(readJSON('roster.json', []));
const STONE = /^(.*?)(?:ite|inite|onite)( [XYZ])?$/;
// Species text -> roster name; the held Mega Stone picks the Mega form. Takes the official team-sheet style
// ("Arcanine [Hisuian Form]") and Showdown ids ("Arcanine-Hisui", "Basculegion-F", "Vivillon-Monsoon"); cosmetic forms
// that are not on the roster (Vivillon patterns, Sinistcha-Masterpiece) fall back to the base species.
export function mapMon(species, item) {
  let n = String(species || '').replace(/\s+/g, ' ').trim(), form = '';
  const m = n.match(/^(.*?) \[(.*)\]$/); if (m) { n = m[1]; form = m[2]; }
  n = n.replace(/'/g, '’');
  const F = form.toLowerCase();
  if (/female/.test(F)) n += '-F';
  else if (/alolan/.test(F)) n += '-Alola'; else if (/galarian/.test(F)) n += '-Galar'; else if (/hisuian/.test(F)) n += '-Hisui';
  else if (/paldean/.test(F)) n = 'Tauros-Paldea' + (/aqua/.test(F) ? '-Aqua' : /blaze/.test(F) ? '-Blaze' : '-Combat');
  else if (/(wash|heat|frost|fan|mow) rotom/.test(F)) n = 'Rotom-' + F.match(/(wash|heat|frost|fan|mow)/)[1].replace(/^./, c => c.toUpperCase());
  else if (/dusk/.test(F)) n += '-Dusk'; else if (/midnight/.test(F)) n += '-Midnight'; else if (/low key/.test(F)) n += '-Low-Key';
  else if (/eternal/.test(F)) n += '-Eternal';
  const st = item && item !== 'Eviolite' ? item.match(STONE) : null;
  if (st && item !== 'Eviolite') { const s = st[2] ? st[2].trim() : ''; const base = n.replace(/-F$/, '');
    for (const c of [n + '-Mega' + (s ? '-' + s : ''), base + '-Mega' + (s ? '-' + s : ''), base + '-F-Mega', n + '-Mega', n.split('-')[0] + '-Mega' + (s ? '-' + s : '')]) if (ROSTER.has(c)) return c; }
  if (ROSTER.has(n)) return n; const b = n.split('-')[0]; return ROSTER.has(b) ? b : null; }
// An item must look like an item: not a field label, not empty, a sane length; checked against the Reg M-C item list
// (data/regmc-items.txt) when that file exists. Bad parses become '' (unknown) and are counted.
// the item list's file comes from the regulation profile (regulation.json "items"); if missing on disk, fall back to M-C's list and say so
const _act = activeReg(), ITEMS_FILE = (regProfile(_act.id) || {}).items || null;
const ITEMS = new Set((() => {
  const readList = f => fs.readFileSync(f, 'utf8').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (!ITEMS_FILE) return [];
  try { return readList(ITEMS_FILE); } catch (e) {
    const fb = (regProfile(LEGACY_REG) || {}).items;
    if (fb && fb !== ITEMS_FILE) {
      try { const xs = readList(fb); console.log(`names: ${ITEMS_FILE} not found for ${_act.name}; falling back to ${fb}`); return xs; } catch (e2) {}
    }
    return [];
  }
})());
export const bad = {items: 0};
export function validItem(it) { const s = String(it || '').trim(); if (!s) return '';
  if (/:\s*$/.test(s) || /Alignment|Ability|Held Item|Nature/i.test(s) || s.length > 30 || (ITEMS.size && !ITEMS.has(s))) { bad.items++; return ''; } return s; }

// ---------- one spelling per item, Ability and move (Nov 18 data audit, docs/rebuild/research/data-integrity-nov17.md, finding 4)
// Players type their sheets, so the same thing arrives as "Protect", "protect", "Protect " or "Lucarionite-Z" (2% of game sides),
// which split one set into several features and set protectLow wrongly on 16 decks. Each text is matched case-, space- and
// punctuation-free against the lists the site already has (data/regmc-items.txt; moves and Abilities from app/src/data/data.js)
// and replaced by the list's spelling. Mega Stone typos whose holder makes the stone certain are mapped (STONE_TYPO, seen on
// Limitless sheets Sep-Nov 2026); "No Item" and the like become '' (no item). Anything else is never guessed: it stays as
// written (spaces trimmed) and is counted in CANON_UNKNOWN, which canonReport() prints. The raw files in data/ are untouched.
const fold = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const DATA_JS = (() => { try { return fs.readFileSync('app/src/data/data.js', 'utf8'); } catch (e) { return ''; } })();
const grabJS = k => { try { const m = DATA_JS.match(new RegExp('const ' + k + '=([\\s\\S]*?);\\n')); return m ? JSON.parse(m[1]) : null; } catch (e) { return null; } };
// Natures (Dossier step 3, Nov 23): the 25 names from data.js SETS.NAT, matched case-, space- and punctuation-free. Misspellings seen on
// Limitless sheets (data/t2 check, Nov 23: "Adament" x16, "Modeste", "Quieto"...) where only one nature fits are mapped; anything else
// ("mid", "ve") is not a nature we can read: '' (left out of the counts, never guessed).
const NAT_LIST = (() => { try { const m = DATA_JS.match(/"NAT":(\[[^\]]*\])/); return m ? JSON.parse(m[1]) : []; } catch (e) { return []; } })();
const NAT_MAP = new Map(NAT_LIST.map(x => [fold(x), x]));
const NAT_TYPO = {adament: 'Adamant', adaman: 'Adamant', ademant: 'Adamant', admant: 'Adamant', adamnt: 'Adamant', asamant: 'Adamant', admanant: 'Adamant', adamat: 'Adamant',
  modeste: 'Modest', modesto: 'Modest', quieto: 'Quiet', quite: 'Quiet', jelly: 'Jolly', sasay: 'Sassy'};
export const canonNature = s => { const k = fold(s || ''); return !k ? '' : NAT_MAP.get(k) || (NAT_TYPO[k] && NAT_MAP.has(fold(NAT_TYPO[k])) ? NAT_TYPO[k] : ''); };
const LIST = {i: new Map([...ITEMS].map(x => [fold(x), x])), a: new Map(Object.keys(grabJS('ABIL') || {}).map(x => [fold(x), x])),
  mv: new Map((grabJS('MOVES') || []).map(x => [fold(x[0]), x[0]]))};
const STONE_TYPO = {staraptorite: 'Staraptite', dragonitite: 'Dragoninite', dragonitinite: 'Dragoninite', golisopodite: 'Golisopite', venosaurite: 'Venusaurite',
  raichuitex: 'Raichunite X', raichuitey: 'Raichunite Y', glimmorite: 'Glimmoranite', scovillanite: 'Scovillainite', garchompitite: 'Garchompite', sableyite: 'Sablenite', floetitte: 'Floettite'};
// Item misspellings seen on Limitless sheets (Nov 19 check of data/t2; design review #15, 'Leftovers' / 'Left Over') where only one
// legal item fits; unclear ones ('King', 'Dragon claw', 'Fairy plume', 'Gold Berry', 'Miracle Berry') stay as written.
const ITEM_TYPO = {leftover: 'Leftovers', passchoberry: 'Passho Berry', choppleberry: 'Chople Berry', focusslash: 'Focus Sash', citrusberry: 'Sitrus Berry',
  sitrisberry: 'Sitrus Berry', charcol: 'Charcoal', charlcoal: 'Charcoal', choicescraf: 'Choice Scarf', ejectbuttom: 'Eject Button', grassyseeds: 'Grassy Seed',
  kassibberry: 'Kasib Berry', rindo: 'Rindo Berry', floettenite: 'Floettite', dragonitete: 'Dragoninite', garchompnitez: 'Garchompite Z', clefabite: 'Clefablite'};
const NONE = {i: new Set(['m', 'f', 'noitem', 'nohelditem', 'none', 'nothing', 'withoutitem', 'noobject']), a: new Set(['noability', 'none']), mv: new Set()};
export const CANON_UNKNOWN = {i: new Map(), a: new Map(), mv: new Map()};
function canon(kind, s, count = true) { if (s == null) return ''; const t = String(s).replace(/\s+/g, ' ').trim(); if (!t) return '';
  const k = fold(t); if (NONE[kind].has(k)) return ''; if (kind === 'i' && STONE_TYPO[k] && LIST.i.has(fold(STONE_TYPO[k]))) return STONE_TYPO[k]; if (kind === 'i' && ITEM_TYPO[k] && LIST.i.has(fold(ITEM_TYPO[k]))) return ITEM_TYPO[k];
  const c = LIST[kind].get(k); if (c) return c; if (count && LIST[kind].size) CANON_UNKNOWN[kind].set(t, (CANON_UNKNOWN[kind].get(t) || 0) + 1); return t; }
export const canonItem = (s, count) => canon('i', s, count), canonAbility = (s, count) => canon('a', s, count), canonMove = (s, count) => canon('mv', s, count);
// Natures (Dossier step 3, Nov 23): the 25 names from data.js SETS.NAT, matched case-, space- and punctuation-free. Misspellings seen on
// Limitless sheets (data/t2 check, Nov 23: "Adament" x16, "Modeste", "Quieto"...) where only one nature fits are mapped; anything else
// ("mid", "ve") is not a nature we can read: '' (left out of the counts, never guessed).
const NAT_LIST = (() => { try { const m = DATA_JS.match(/"NAT":(\[[^\]]*\])/); return m ? JSON.parse(m[1]) : []; } catch (e) { return []; } })();
const NAT_MAP = new Map(NAT_LIST.map(x => [fold(x), x]));
const NAT_TYPO = {adament: 'Adamant', adaman: 'Adamant', ademant: 'Adamant', admant: 'Adamant', adamnt: 'Adamant', asamant: 'Adamant', admanant: 'Adamant', adamat: 'Adamant',
  modeste: 'Modest', modesto: 'Modest', quieto: 'Quiet', quite: 'Quiet', jelly: 'Jolly', sasay: 'Sassy'};
export const canonNature = s => { const k = fold(s || ''); return !k ? '' : NAT_MAP.get(k) || (NAT_TYPO[k] && NAT_MAP.has(fold(NAT_TYPO[k])) ? NAT_TYPO[k] : ''); };
// one Pokémon of a data/t2 sheet ({n, i, a, mv, t, nt}) with its item, Ability and moves in the list spelling
export const canonSet = m => ({...m, i: canonItem(m.i), a: canonAbility(m.a), mv: Array.isArray(m.mv) ? m.mv.map(x => canonMove(x)) : []});
export function canonReport(step, log = console.log) { const part = (k, w) => { const m = CANON_UNKNOWN[k], n = [...m.values()].reduce((a, b) => a + b, 0);
    return n ? `${n} ${w} (${m.size} spellings, e.g. ${[...m].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([x, c]) => `"${x}"${c > 1 ? ' ×' + c : ''}`).join(', ')})` : ''; };
  const s = [part('i', 'items'), part('a', 'Abilities'), part('mv', 'moves')].filter(Boolean);
  if (s.length) log(`${step}: kept as written, not on the site's lists: ${s.join('; ')}`); return s.length; }

// ---------- Limitless names -> NastyPlot names (Nov 7: one shared copy; update.mjs, weekly.mjs and events.mjs used to keep
// three identical copies, so a fix in one could miss the others). key() reads the Mega from the held stone, lmap() the form.
// A name that matches nothing is recorded in UNKNOWN instead of vanishing silently; reportUnknown() prints a ::warning:: so a
// new regulation's Pokémon (or a Limitless spelling change) can't drop out of the numbers unnoticed.
const names = ROSTER, REG = {Hisuian: 'Hisui', Alolan: 'Alola', Galarian: 'Galar', Paldean: 'Paldea'};
// the item is read in its list spelling first (canonItem above), so "raichunite y", "Lucarionite-Z" and "Staraptorite" pick the
// Mega too (Nov 18 data audit: 14 sheets' stones were missed and the Pokémon counted as its base form)
export const lkey = m => { const it = canonItem(m.item, false); const z = it.match(/^(.*)ite( [XYZ])?$/); return z && fold(it) !== 'eviolite' ? m.name + '|M' + (z[2] ? z[2].trim() : '') : m.name; };
export const UNKNOWN = new Map(); let MEGA_MISS = false;
function lmap0(k) { let [n, mega] = k.split('|'); if (/^Eternal Flower Floette$/.test(n) && mega == null) return 'Floette-Eternal'; n = n.replace(/^Eternal Flower /, '');
  { const r = n.match(/^(Wash|Heat|Frost|Fan|Mow) Rotom$/); if (r) n = 'Rotom-' + r[1]; }
  n = n.replace(/'/g, '’').replace(/^Lycanroc (Dusk|Midnight)$/, 'Lycanroc-$1').replace(/^Low Key Toxtricity$/, 'Toxtricity-Low-Key').replace(/^Paldean Tauros (Aqua|Blaze|Combat) Breed$/, 'Tauros-Paldea-$1');
  let m = n.match(/^(Hisuian|Alolan|Galarian|Paldean) (.*)$/); if (m) n = m[2] + '-' + REG[m[1]];
  n = n.replace(/ ♀$/, '-F').replace(/ ♂$/, '');
  m = n.match(/^(.*?) \((.*)\)$/); if (m) n = m[1] + ({'Dusk Form': '-Dusk', 'Midnight Form': '-Midnight', 'Low Key Form': '-Low-Key'}[m[2]] || '');
  if (mega != null) { const s = mega.slice(1); for (const c of [n + '-Mega' + (s ? '-' + s : ''), n.replace(/-F$/, '') + '-F-Mega', n + '-Mega']) if (names.has(c)) return c;
    // a stone it can't use (another Pokémon's, or a new Mega the roster doesn't have yet): counted as the base Pokémon, and
    // still reported by lmap() so a new regulation's Megas are noticed (Nov 7; before, the Pokémon was dropped from the team)
    MEGA_MISS = true; }
  if (names.has(n)) return n; const b = n.split('-')[0]; return names.has(b) ? b : null; }
export function lmap(k) { MEGA_MISS = false; const r = lmap0(k); if (r == null || MEGA_MISS) UNKNOWN.set(k, (UNKNOWN.get(k) || 0) + 1); return r; }
const ODD = new Set((readJSON('data/name-oddities.json', {keys: []}).keys) || []); // already looked at, not new
export function reportUnknown(step, log = console.log) { const known = [...UNKNOWN.keys()].filter(k => ODD.has(k));
  for (const k of known) UNKNOWN.delete(k); if (known.length) log(`${step}: ${known.length} known name oddit${known.length === 1 ? 'y' : 'ies'} (data/name-oddities.json), as expected`);
  if (!UNKNOWN.size) return 0;
  const list = [...UNKNOWN].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, c]) => `${k.replace('|M', ' (Mega')}${k.includes('|M') ? ')' : ''}${c > 1 ? ' ×' + c : ''}`);
  log(`::warning::${step}: ${UNKNOWN.size} Pokémon name${UNKNOWN.size === 1 ? '' : 's'} from Limitless didn't fully match the roster (left out, or a Mega Stone it can't use counted as the base Pokémon): ${list.join(', ')}`); return UNKNOWN.size; }
