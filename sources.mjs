// Outside sources (daily, after ladder.mjs): other sites' numbers for Reg M-C doubles, read straight from their pages.
// Writes out/sources.json. perf.mjs uses them as rating inputs (Showdowntier ladder table) and
// for the "Other tier list" on each Pokémon's sheet (Showdowntier); crosscheck.mjs compares our own
// numbers against them. Each source is optional: one that fails or changes its page is left out (and reported).
//   sdt     Showdowntier: Showdown ladder, last 14 days. Tier, usage %, win %, average player rating
//   pika    Pikalytics: Showdown ladder 1760+. Usage %, win %; items and moves for the 40 most used
// (project-red-data was dropped on Nov 1: its repository carries no licence, so we have no permission to reuse it.)
import fs from 'node:fs';
import {mapMon, ROSTER, dec, text} from './names.mjs';
import {UA as NP_UA, politeFetch} from './http.mjs';
const UA = {'User-Agent': NP_UA};
const sleep = ms => new Promise(r => setTimeout(r, ms));
let calls = 0;
async function get(url, opt = {}) { if (calls++) await sleep(1500);
  for (let k = 0; k < 3; k++) { const r = await politeFetch(url, {headers: {...UA, ...(opt.headers || {})}, redirect: opt.redirect || 'follow'});
    if (opt.raw) return r; if (r.ok) return r.text(); if (r.status === 429 || r.status >= 500) { await sleep(15000); continue; } throw new Error(url + ' ' + r.status); }
  throw new Error(url + ' failed'); }
// any site's name -> our roster name: Showdown ids ("Indeedee-F", "Rotom-Wash"), official team-sheet style ("Arcanine [Hisuian Form]"),
// Megas written "Mega Charizard Y" or "Charizard-Mega-Y". null when it isn't on the roster.
export function norm(raw) { let n = dec(String(raw || '')).replace(/\s+/g, ' ').trim(); if (!n) return null;
  if (ROSTER.has(n)) return n; const q = n.replace(/'/g, '’'); if (ROSTER.has(q)) return q;
  const m = n.match(/^Mega (.*?)(?: ([XYZ]))?$/); if (m) { const b = norm(m[1]); if (!b) return null; const fam = b.replace(/-Eternal$/, '');
    for (const c of [`${fam}-Mega${m[2] ? '-' + m[2] : ''}`, `${fam.split('-')[0]}-Mega${m[2] ? '-' + m[2] : ''}`]) if (ROSTER.has(c)) return c; return null; }
  if (/^Floette(-Eternal)?$/i.test(n)) return 'Floette-Eternal';
  // Nov 9: Pikalytics writes Mega Floette as "Floette-Eternal-Mega" (ours: Floette-Mega); it was dropped
  if (/-Mega/.test(n)) { const c = n.replace(/'/g, '’'); if (ROSTER.has(c)) return c; const e = c.replace(/-Eternal(?=-Mega)/, ''); return ROSTER.has(e) ? e : null; }
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
// Nov 8 (Sim: our popular sets must agree with established sites): Pikalytics' TOURNAMENT stats ('championstournaments',
// built from Limitless events). The 'gen9championsvgc2026regmc' format we read before is its Showdown LADDER data, a different
// population, which made 14 of 40 top items look like conflicts (Rillaboom: Life Orb there, Miracle Seed 75.5% in tournaments).
await tryIt('pika', async () => { const F = 'championstournaments', h = await get(`https://www.pikalytics.com/ai/pokedex/${F}`), rows = [], miss = [];
  // Nov 9: a row whose win rate or record is "N/A" (Mega Floette's) used to fail this pattern and vanish without a trace;
  // win rate and record are optional now, and every table row is counted so a row that still can't be read is reported
  const tableRows = (h.match(/^\| \d+ \| \*\*/gm) || []).length;
  for (const m of h.matchAll(/^\| (\d+) \| \*\*(.+?)\*\* \| ([\d.]+)% \| (?:([\d.]+)%|N\/A) \| (?:(\d+)-(\d+)(?:-\d+)?|N\/A) \|/gm)) { const n = norm(m[2]); if (!n) { miss.push(m[2]); continue; }
    rows.push({n, raw: m[2], u: +m[3], wr: m[4] != null ? +m[4] : null, g: m[5] != null ? +m[5] + +m[6] : null}); } // wins-losses, and since Nov 2026 sometimes -ties
  if (rows.length + miss.length !== tableRows) out.problems.push(`pika: ${tableRows - rows.length - miss.length} of ${tableRows} table rows could not be read`);
  if (miss.length) out.problems.push(`pika: names not on our roster: ${miss.join(', ')}`);
  if (rows.length < 30) return null;
  const scope = (h.match(/## Tournament Sample Scope\n\n([^\n]+)/) || [])[1] || '';
  const sets = {}; let date = null;
  for (const r of rows.slice(0, 40)) { try { const t = await get(`https://www.pikalytics.com/ai/pokedex/${F}/${encodeURIComponent(r.raw || r.n)}`);
      const sec = k => { const s = t.split(new RegExp(`## Common ${k}\\n`))[1]; return s ? [...s.split('\n## ')[0].matchAll(/- \*\*(.+?)\*\*: ([\d.]+)%/g)].map(m => [m[1], +m[2]]) : []; };
      const rec = t.match(/\*\*Record\*\* \| (\d+)-(\d+)/); date = date || (t.match(/\*\*Data Date\*\* \| ([\d-]+)/) || [])[1] || null;
      sets[r.n] = {it: sec('Items').slice(0, 4), mv: sec('Moves').slice(0, 6), g: rec ? +rec[1] + +rec[2] : null}; } catch (e) {} }
  return {date: new Date().toISOString().slice(0, 10), dataDate: date, scope, rows, sets, miss}; });
fs.writeFileSync('out/sources.json', JSON.stringify(out));
// Nov 9 (no silent failures): each source problem is recorded like a skipped step (skip.mjs -> out/skips.json), so the same
// source failing two days in a row raises the 'Daily data problem' alarm in health.mjs instead of one warning line a day
{ const {execFileSync} = await import('node:child_process'); for (const k of new Set(out.problems.map(p => p.split(':')[0]))) { try { execFileSync('node', ['skip.mjs', `source ${k} skipped (${out.problems.filter(p => p.startsWith(k + ':')).join(' | ').slice(0, 300)})`], {stdio: 'inherit'}); } catch (e) {} } }
for (const k of ['sdt', 'pika']) { const s = out[k];
  console.log(`sources: ${k} ${s ? `${s.rows.length} rows, dated ${s.date || s.dataDate || '?'}; top ${s.rows.slice(0, 3).map(r => `${r.n} ${r.u}%`).join(', ')}${s.miss && s.miss.length ? '; unmapped ' + s.miss.slice(0, 12).join(', ') : ''}` : 'missing'}`); }
if (out.problems.length) console.log('::warning::sources: ' + out.problems.join(' | '));
