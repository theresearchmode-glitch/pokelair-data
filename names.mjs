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
