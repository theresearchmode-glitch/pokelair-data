// Shared RK9 helpers for rk9.mjs (top 64 open team sheets) and rk9-field.mjs (every Masters team + every match).
// Paths are relative to the working folder, so a dry run can run these scripts from a scratch copy of out/ and data/.
import fs from 'node:fs';
import {activeReg} from './formats.mjs';
// official events count only inside the active regulation's window (formats.mjs): from the day it started to the day a newer one started
export const REG_ACTIVE = activeReg();
export const SITE = 'https://www.rk9.gg', REG_START = REG_ACTIVE.since;
const GAP = +(process.env.RK9_GAP || 1200);
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
export const dec = s => s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
export const text = h => dec(h.replace(/<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '\n')).split('\n').map(x => x.trim()).filter(Boolean);
// one request at a time, GAP ms apart (RK9 is a small site); 429s and 5xx wait 20 s and retry
let calls = 0;
export const callCount = () => calls;
export async function get(path) { if (calls++) await sleep(GAP);
  for (let k = 0; k < 3; k++) { const r = await fetch(SITE + path, {headers: {'User-Agent': 'Mozilla/5.0 (pokelair-data; personal team-builder stats)'}});
    if (r.ok) return r.text(); if (r.status === 429 || r.status >= 500) { await sleep(20000); continue; } throw new Error(path + ' ' + r.status); }
  throw new Error(path + ' failed'); }
export const ROSTER = new Set(readJSON('roster.json', []));
const STONE = /^(.*?)(?:ite|inite|onite)( [XYZ])?$/;
// RK9 species text ("Arcanine [Hisuian Form]") -> PokéLair name; the held Mega Stone picks the Mega form.
// Pokémon Zone prints species the same way, so sources.mjs uses this too.
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
export function parseTeam(html) { const t = text(html); const out = []; let date = null;
  const di = t.findIndex(x => /^\d{4}-\d{2}-\d{2} at /.test(x)); if (di >= 0) date = t[di].slice(0, 10);
  const end = t.findIndex((x, i) => i > di && /^(FR|IT|DE|ES|JP|KO|SC|TC)$/.test(x) && t[i + 1] === 'Ability:');
  const L = t.slice(0, end > 0 ? end - 1 : t.length);
  // Read the labelled fields in order. An empty field leaves its label with no value ("Held Item:" straight followed by
  // "Stat Alignment:"); the old fixed-offset read took the next label as the item and lost the nature and first move.
  const lab = x => /:\s*$/.test(x || '');
  for (let i = 0; i < L.length; i++) if (L[i] === 'Ability:' && (L[i - 1] === 'EN' || L[i - 2] === 'EN')) {
    const species = L[i - 1] === 'EN' ? L[i - 2] : L[i - 1], ability = L[i + 1]; let j = i + 2, item = '', nat = '';
    if (L[j] === 'Held Item:') { j++; if (!lab(L[j])) { item = L[j]; j++; } }
    if (L[j] === 'Stat Alignment:') { j++; if (!lab(L[j])) { nat = L[j]; j++; } }
    const mv = []; for (; j < L.length && mv.length < 4 && L[j + 1] !== 'EN' && L[j] !== 'EN'; j++) if (!lab(L[j])) mv.push(L[j]);
    out.push({sp: species, n: mapMon(species, item), i: validItem(item), a: ability, nt: nat, mv}); }
  return {date, mons: out}; }
// A roster page: every Masters player with a public team list, best standing first
export function parseRoster(r) {
  const rows = [...r.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c => c[1]));
  return rows.filter(c => c.length >= 8).map(c => ({first: text(c[1])[0] || '', last: text(c[2])[0] || '', country: text(c[3])[0] || '', div: text(c[4])[0] || '',
    trainer: text(c[5])[0] || '', tl: (c[6].match(/href="(\/teamlist\/public\/[^"]+)"/) || [])[1], st: parseInt(text(c[7])[0], 10)}))
    .filter(p => p.tl && p.div === 'Masters' && p.st > 0).sort((a, b) => a.st - b.st); }
// the same person in the roster ("First", "Last", "US") and in the pairings ("First Last [US]")
export const pkey = (name, country) => `${name} [${country}]`.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
