// Outside sources (daily, after ladder.mjs): other sites' numbers for Reg M-C doubles, read straight from their pages.
// Writes out/sources.json. perf.mjs uses them as rating inputs (Showdowntier ladder table, project-red-data replays) and
// for the "Other tier list" on each Pokémon's sheet (Showdowntier); crosscheck.mjs compares our own
// numbers against them. Each source is optional: one that fails or changes its page is left out (and reported).
//   sdt     Showdowntier: Showdown ladder, last 14 days. Tier, usage %, win %, average player rating
//   pika    Pikalytics: Showdown ladder 1760+. Usage %, win %; items and moves for the 40 most used
//   prd     project-red-data (GitHub): top 10% of public Showdown replays, last 30 days. Usage, items, moves
import fs from 'node:fs';
import {mapMon, ROSTER, dec, text} from './rk9-lib.mjs';
import {UA as NP_UA, politeFetch} from './http.mjs';
const UA = {'User-Agent': NP_UA};
const sleep = ms => new Promise(r => setTimeout(r, ms));
let calls = 0;
async function get(url, opt = {}) { if (calls++) await sleep(1500);
  for (let k = 0; k < 3; k++) { const r = await politeFetch(url, {headers: {...UA, ...(opt.headers || {})}, redirect: opt.redirect || 'follow'});
    if (opt.raw) return r; if (r.ok) return r.text(); if (r.status === 429 || r.status >= 500) { await sleep(15000); continue; } throw new Error(url + ' ' + r.status); }
  throw new Error(url + ' failed'); }
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
// Pokémon Zone is not read: it answers automated requests with 403 (tested Oct 31 from the daily job's runner), and
// that refusal is respected. Its tier list and the official-events data it shows are not part of the daily data.
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
for (const k of ['sdt', 'pika', 'prd']) { const s = out[k];
  console.log(`sources: ${k} ${s ? `${s.rows.length} rows, dated ${s.date || s.dataDate || '?'}; top ${s.rows.slice(0, 3).map(r => `${r.n} ${r.u}%`).join(', ')}${s.miss && s.miss.length ? '; unmapped ' + s.miss.slice(0, 12).join(', ') : ''}` : 'missing'}`); }
if (out.problems.length) console.log('::warning::sources: ' + out.problems.join(' | '));
