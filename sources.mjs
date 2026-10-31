// Outside sources (daily, after ladder.mjs): other sites' numbers for Reg M-C doubles, read straight from their pages.
// Writes out/sources.json. perf.mjs uses them as rating inputs (Showdowntier ladder table, project-red-data replays) and
// for the "Other tier lists" on each Pokémon's sheet (Pokémon Zone, Showdowntier); crosscheck.mjs compares our own
// numbers against them. Each source is optional: one that fails or changes its page is left out (and reported).
//   pz      Pokémon Zone tier list: Limitless tournaments (16+ players), all of Reg M-C. Tier, match win %, usage %, matches
//   pzMega  Pokémon Zone Mega tier list (same data, Mega forms)
//   sdt     Showdowntier: Showdown ladder, last 14 days. Tier, usage %, win %, average player rating
//   pika    Pikalytics: Showdown ladder 1760+. Usage %, win %; items and moves for the 40 most used
//   prd     project-red-data (GitHub): top 10% of public Showdown replays, last 30 days. Usage, items, moves
import fs from 'node:fs';
import {mapMon, ROSTER, dec, text} from './rk9-lib.mjs';
const UA = {'User-Agent': 'Mozilla/5.0 (pokelair-data; personal team-builder stats)'};
const sleep = ms => new Promise(r => setTimeout(r, ms));
let calls = 0;
async function get(url, opt = {}) { if (calls++) await sleep(1500);
  for (let k = 0; k < 3; k++) { const r = await fetch(url, {headers: {...UA, ...(opt.headers || {})}, redirect: opt.redirect || 'follow'});
    if (opt.raw) return r; if (r.ok) return r.text(); if (r.status === 429 || r.status >= 500) { await sleep(15000); continue; } throw new Error(url + ' ' + r.status); }
  throw new Error(url + ' failed'); }
const ISO = s => { const t = Date.parse(s); return isFinite(t) ? new Date(t).toISOString().slice(0, 10) : null; };
// any site's name -> our roster name: Showdown ids ("Indeedee-F", "Rotom-Wash"), Pokémon Zone / RK9 ("Arcanine [Hisuian Form]"),
// Megas written "Mega Charizard Y" or "Charizard-Mega-Y". null when it isn't on the roster.
export function norm(raw) { let n = dec(String(raw || '')).replace(/\s+/g, ' ').trim(); if (!n) return null;
  if (ROSTER.has(n)) return n; const q = n.replace(/'/g, '’'); if (ROSTER.has(q)) return q;
  const m = n.match(/^Mega (.*?)(?: ([XYZ]))?$/); if (m) { const b = norm(m[1]); if (!b) return null; const fam = b.replace(/-Eternal$/, '');
    for (const c of [`${fam}-Mega${m[2] ? '-' + m[2] : ''}`, `${fam.split('-')[0]}-Mega${m[2] ? '-' + m[2] : ''}`]) if (ROSTER.has(c)) return c; return null; }
  if (/^Floette(-Eternal)?$/i.test(n)) return 'Floette-Eternal';
  if (/-Mega/.test(n)) { const c = n.replace(/'/g, '’'); return ROSTER.has(c) ? c : null; }
  const r = mapMon(n.replace(/ \((.*)\)$/, ' [$1]')); if (r) return r;
  const d = n.replace(/ /g, '-'); return ROSTER.has(d) ? d : null; }
const out = {updated: new Date().toISOString(), problems: []};
const tryIt = async (k, f) => { try { const v = await f(); if (v) out[k] = v; else out.problems.push(`${k}: nothing parsed`); } catch (e) { out.problems.push(`${k}: ${e.message}`); console.log(`sources: ${k} failed: ${e.message}`); } };
// Pokémon Zone tier lists: cards under tier headings, each "WR 59.9% · 11.9% usage · 8192 matches"
function pzParse(h) { const rows = [], miss = []; let tier = null;
  for (const part of h.split(/(?=<div class="tier-row__label|<a [^>]*class="champs-pokemon-card")/)) {
    const t = part.match(/^<div class="tier-row__label[^"]*">\s*([A-Z][+-]?)\s*</); if (t) { tier = t[1]; continue; }
    if (!/^<a [^>]*champs-pokemon-card/.test(part)) continue;
    const nm = (part.match(/champs-pokemon-card__name">([\s\S]*?)<\/div>/) || [])[1], st = (part.match(/champs-pokemon-card__usage">([\s\S]*?)<\/div>/) || [])[1];
    if (!nm || !st) continue; const raw = text(nm).join(' '), n = norm(raw), s = text(st).join(' ');
    const wr = +(s.match(/WR ([\d.]+)%/) || [])[1], u = +(s.match(/([\d.]+)% usage/) || [])[1], mt = +(s.match(/([\d,]+) matches/) || [, ''])[1].replace(/,/g, '');
    if (!n) { miss.push(raw); continue; } rows.push({n, raw, tier, wr, u, m: mt}); }
  const meta = (h.match(/Last updated ([A-Z][a-z]+ \d+, \d{4}) with (\d+) Pokémon ranked across (\d+) tournaments/) || []);
  return {date: meta[1] ? ISO(meta[1]) : null, ranked: +meta[2] || null, events: +meta[3] || null, rows, miss}; }
await tryIt('pz', async () => { const P = pzParse(await get('https://www.pokemon-zone.com/champions/tier-list/'));
  // the popular order lists more Pokémon (usage, not tiers): fill in usage for the ones the tier list leaves out
  try { const Q = pzParse(await get('https://www.pokemon-zone.com/champions/tier-list/?sort=popular')); const have = new Set(P.rows.map(r => r.n)); for (const r of Q.rows) if (!have.has(r.n)) P.rows.push({...r, tier: null}); } catch (e) {}
  return P.rows.length >= 15 ? P : null; });
await tryIt('pzMega', async () => { const P = pzParse(await get('https://www.pokemon-zone.com/champions/tier-list-mega/')); return P.rows.length >= 5 ? P : null; });
// Pokémon Zone's other data set (RK9 official events, via pokedata): chosen with a cookie set by its set-source link
await tryIt('pzOfficial', async () => { const r = await get('https://www.pokemon-zone.com/champions/set-source/?source=pokedata&next=/champions/tier-list/', {raw: true, redirect: 'manual'});
  const ck = (r.headers.getSetCookie ? r.headers.getSetCookie() : [r.headers.get('set-cookie') || '']).map(c => c.split(';')[0]).filter(Boolean).join('; ');
  if (!ck) throw new Error('no cookie from set-source (status ' + r.status + ')');
  const h = await get('https://www.pokemon-zone.com/champions/tier-list/?sort=popular', {headers: {Cookie: ck}}), P = pzParse(h);
  P.cookie = ck.replace(/=.*/, '=…'); P.note = (h.match(/Last updated[^<]{0,160}/) || [''])[0];
  return P.rows.length >= 10 ? P : null; });
// Showdowntier: one table, every row carries data-name / data-tier / data-usage / data-win / data-rating
await tryIt('sdt', async () => { const h = await get('https://showdowntier.com/formats/dmc/index.html'), rows = [], miss = [];
  for (const m of h.matchAll(/<tr[^>]*data-rank="(\d+)"[^>]*data-name="([^"]+)"[^>]*data-tier="([^"]*)"[^>]*data-usage="([\d.]+)"[^>]*data-win="([\d.]+)"[^>]*data-rating="([\d.]+)"/g)) {
    const n = norm(m[2]); if (!n) { miss.push(m[2]); continue; } rows.push({n, tier: m[3], u: +(+m[4]).toFixed(2), w: +(+m[5]).toFixed(2), r: Math.round(+m[6])}); }
  const rng = h.match(/(\d{1,2}\/\d{1,2}\/\d{4}) to (\d{1,2}\/\d{1,2}\/\d{4})/), up = h.match(/Last Updated: (\d{1,2})\/(\d{1,2})\/(\d{4})/), bat = h.match(/([\d,]+) Games analyzed|Analyzed ([\d,]+) competitive battles/);
  const us = s => { const [mo, d, y] = s.split('/'); return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`; };
  return rows.length >= 30 ? {date: up ? `${up[3]}-${up[1].padStart(2, '0')}-${up[2].padStart(2, '0')}` : null, from: rng ? us(rng[1]) : null, to: rng ? us(rng[2]) : null, battles: bat ? +(bat[1] || bat[2]).replace(/,/g, '') : null, rows, miss} : null; });
// Pikalytics (Reg M-C): tournament teams from about the last two weeks (its own size threshold). The AI index is a
// markdown table of the top 50 (usage %, game win %, W-L record); each /ai/ Pokémon page lists items and moves.
await tryIt('pika', async () => { const F = 'gen9championsvgc2026regmc', h = await get(`https://www.pikalytics.com/ai/pokedex/${F}`), rows = [], miss = [];
  for (const m of h.matchAll(/^\| (\d+) \| \*\*(.+?)\*\* \| ([\d.]+)% \| ([\d.]+)% \| (\d+)-(\d+) \|/gm)) { const n = norm(m[2]); if (!n) { miss.push(m[2]); continue; }
    rows.push({n, raw: m[2], u: +m[3], wr: +m[4], g: +m[5] + +m[6]}); }
  if (rows.length < 30) return null;
  const scope = (h.match(/## Tournament Sample Scope\n\n([^\n]+)/) || [])[1] || '';
  const sets = {}; let date = null;
  for (const r of rows.slice(0, 40)) { try { const t = await get(`https://www.pikalytics.com/ai/pokedex/${F}/${encodeURIComponent(r.raw || r.n)}`);
      const sec = k => { const s = t.split(new RegExp(`## Common ${k}\\n`))[1]; return s ? [...s.split('\n## ')[0].matchAll(/- \*\*(.+?)\*\*: ([\d.]+)%/g)].map(m => [m[1], +m[2]]) : []; };
      const rec = t.match(/\*\*Record\*\* \| (\d+)-(\d+)/); date = date || (t.match(/\*\*Data Date\*\* \| ([\d-]+)/) || [])[1] || null;
      sets[r.n] = {it: sec('Items').slice(0, 4), mv: sec('Moves').slice(0, 6), g: rec ? +rec[1] + +rec[2] : null}; } catch (e) {} }
  return {date: new Date().toISOString().slice(0, 10), dataDate: date, scope, rows, sets, miss}; });
// project-red-data: stats.json in the pkmn stats shape
await tryIt('prd', async () => { const j = JSON.parse(await get('https://raw.githubusercontent.com/jamesrcode/project-red-data/main/stats.json')), rows = [], sets = {}, miss = [];
  const pct = o => Object.entries(o || {}).sort((a, b) => b[1] - a[1]); const tot = o => Object.values(o || {}).reduce((a, b) => a + b, 0) || 1;
  for (const [k, v] of Object.entries(j.pokemon || {})) { const n = norm(k); if (!n) { miss.push(k); continue; } const u = v.usage && typeof v.usage === 'object' ? v.usage.raw : v.usage;
    rows.push({n, u: +(100 * u).toFixed(2)});
    const it = pct(v.items), mv = pct(v.moves), ti = tot(v.items), tm = tot(v.moves) / 4;
    if (it.length || mv.length) sets[n] = {it: it.slice(0, 4).map(([a, b]) => [a, +(100 * b / ti).toFixed(1)]), mv: mv.slice(0, 6).map(([a, b]) => [a, +(100 * b / tm).toFixed(1)])}; }
  rows.sort((a, b) => b.u - a.u);
  const I = j.info || {}; return rows.length >= 30 ? {date: String(I.generated || '').slice(0, 10) || null, teams: I.teams || null, source: I.source || '', rows, sets, miss} : null; });
fs.writeFileSync('out/sources.json', JSON.stringify(out));
for (const k of ['pz', 'pzMega', 'pzOfficial', 'sdt', 'pika', 'prd']) { const s = out[k];
  console.log(`sources: ${k} ${s ? `${s.rows.length} rows, dated ${s.date || s.dataDate || '?'}; top ${s.rows.slice(0, 3).map(r => `${r.n} ${r.u}%`).join(', ')}${s.miss && s.miss.length ? '; unmapped ' + s.miss.slice(0, 12).join(', ') : ''}` : 'missing'}`); }
if (out.problems.length) console.log('::warning::sources: ' + out.problems.join(' | '));
