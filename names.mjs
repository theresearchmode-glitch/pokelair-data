// Shared name and text helpers for the data scripts (official.mjs, sources.mjs): species text -> NastyPlot roster name,
// held-item check, HTML to text. Paths are relative to the working folder, so a dry run can run from a scratch copy.
import fs from 'node:fs';
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
const ITEMS = new Set((() => { try { return fs.readFileSync('data/regmc-items.txt', 'utf8').split(/\r?\n/).map(x => x.trim()).filter(Boolean); } catch (e) { return []; } })());
export const bad = {items: 0};
export function validItem(it) { const s = String(it || '').trim(); if (!s) return '';
  if (/:\s*$/.test(s) || /Alignment|Ability|Held Item|Nature/i.test(s) || s.length > 30 || (ITEMS.size && !ITEMS.has(s))) { bad.items++; return ''; } return s; }

// ---------- Limitless names -> NastyPlot names (Nov 7: one shared copy; update.mjs, weekly.mjs and events.mjs used to keep
// three identical copies, so a fix in one could miss the others). key() reads the Mega from the held stone, lmap() the form.
// A name that matches nothing is recorded in UNKNOWN instead of vanishing silently; reportUnknown() prints a ::warning:: so a
// new regulation's Pokémon (or a Limitless spelling change) can't drop out of the numbers unnoticed.
const names = ROSTER, REG = {Hisuian: 'Hisui', Alolan: 'Alola', Galarian: 'Galar', Paldean: 'Paldea'};
export const lkey = m => { const it = m.item || ''; const z = it.match(/^(.*)ite( [XYZ])?$/); return z && it !== 'Eviolite' ? m.name + '|M' + (z[2] ? z[2].trim() : '') : m.name; };
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
