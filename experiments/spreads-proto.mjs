// Stat-point spreads prototype (Nov 17, look-only; NOT wired into the daily job or the site).
// Popular Sets player review: "stat-point spreads with share". Of our sources only Smogon's monthly "chaos" stats carry
// spreads (Limitless sheets, Victory Road / VR Pastes sheets and Showdown open team sheets all leave stat points out; see
// docs/rebuild/research/data-inventory-nov17.md). Champions spreads there are already stat points (0-32 per stat, 66 total),
// so nothing is converted.
//
// For each Champions VGC chaos file (format x rating cut-off) it writes, per Pokémon:
//   raw     appearances in the month at every rating (Smogon's "Raw count": one per team per battle, unweighted)
//   wt      the same appearances weighted toward players above the cut-off (sum of Smogon's weights; at cut-off 0 it is raw)
//   full    top complete builds: nature + six stat points, with share of wt
//   pts     top stat points ignoring nature, with share
//   fam     "families": the same investment where only small leftovers (under 8 points) differ, e.g. 2/32/0/0/0/32 and
//           0/32/2/0/0/32 are both "Atk 32 / Spe 32 (+2)"
//   na      top natures, with share
// and two checks that could fail: (1) the 1630 file's top spread per Pokémon must equal out/meta_ladder.json's sp[0] for the
// same month (the daily job already reads that file); (2) every spread must be 0-32 per stat and at most 66 in total.
//
// Run from the repo root:  node experiments/spreads-proto.mjs
//   MONTH=2026-10        a Smogon month (default: the newest that has the files)
//   FMT=gen9champions... Showdown format (default: the active regulation, formats.mjs)
//   CUTS=1630,1760       rating cut-offs for the normal ladder; the best-of-3 (open team sheet) ladder is read at the first one
//   CACHE=<dir>          where downloaded files are kept (default: the system temp folder); a file already there isn't fetched
//   OUT=<file>           default experiments/spreads-proto.out.json
// Polite: at most a handful of files, 1.1 s apart, a plain User-Agent (the daily job would use http.mjs politeFetch).
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import {activeReg} from '../formats.mjs';

const FMT = process.env.FMT || activeReg().sd, CUTS = (process.env.CUTS || '1630,1760').split(',').map(Number);
const CACHE = process.env.CACHE || path.join(os.tmpdir(), 'nastyplot-spreads'), OUT = process.env.OUT || 'experiments/spreads-proto.out.json';
const BASE = 'https://www.smogon.com/stats/', UA = {'User-Agent': 'NastyPlot-spreads-proto/0.1'};
const STATS = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'], TOP = {full: 8, pts: 6, fam: 5, na: 4};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
fs.mkdirSync(CACHE, {recursive: true});
let lastAt = 0;
async function get(url) { const w = lastAt + 1100 - Date.now(); if (w > 0) await sleep(w); lastAt = Date.now(); return fetch(url, {headers: UA}); }
async function file(month, name) {
  const f = path.join(CACHE, `${month}-${name}.json`); if (fs.existsSync(f)) return readJSON(f, null);
  const r = await get(`${BASE}${month}/chaos/${name}.json`); if (!r.ok) return null;
  const t = await r.text(); fs.writeFileSync(f, t); return JSON.parse(t); }

// roster names, the same way ladder.mjs maps Smogon's names
const ROSTER = new Set(readJSON('roster.json', []));
const mapMon = n => { n = n.replace(/'/g, '’'); if (ROSTER.has(n)) return n; const b = n.split('-')[0]; return ROSTER.has(b) ? b : null; };
const r1 = x => Math.round(10 * x) / 10;
const famKey = v => { const big = v.map((x, i) => [STATS[i], x]).filter(([, x]) => x >= 8), spare = v.filter(x => x < 8).reduce((a, b) => a + b, 0);
  return (big.map(([s, x]) => `${s} ${x}`).join(' / ') || 'none') + (spare ? ` (+${spare})` : ''); };
const top = (m, k, tot) => [...m].sort((a, b) => b[1] - a[1]).slice(0, k).map(([key, w]) => [key, r1(100 * w / tot)]);

function build(data) {
  const out = {}, bad = [], unmapped = [];
  for (const [name, x] of Object.entries(data.data)) {
    const sp = Object.entries(x.Spreads || {}); if (!sp.length) continue;
    const n = mapMon(name); if (!n) { unmapped.push(name); continue; }
    let wt = 0; const full = new Map(), pts = new Map(), fam = new Map(), na = new Map();
    for (const [k, w] of sp) {
      const [nat, s] = k.split(':'), v = (s || '').split('/').map(Number);
      if (v.length !== 6 || v.some(y => !(y >= 0 && y <= 32)) || v.reduce((a, b) => a + b, 0) > 66) { bad.push(`${name} ${k}`); continue; }
      wt += w; full.set(k, (full.get(k) || 0) + w); const p = v.join('/'); pts.set(p, (pts.get(p) || 0) + w);
      const f = famKey(v); fam.set(f, (fam.get(f) || 0) + w); na.set(nat, (na.get(nat) || 0) + w); }
    if (!wt) continue;
    // a Mega and its base form can map to the same roster name only if the roster lacks the Mega; keep the bigger one
    if (out[n] && out[n].wt >= wt) continue;
    out[n] = {raw: x['Raw count'] || 0, wt: Math.round(wt), usage: r1(100 * (x.usage || 0)),
      full: top(full, TOP.full, wt), pts: top(pts, TOP.pts, wt), fam: top(fam, TOP.fam, wt), na: top(na, TOP.na, wt)}; }
  return {mons: out, bad, unmapped}; }

// newest month with this format's files
const idx = await (await get(BASE)).text();
const months = [...idx.matchAll(/href="(\d{4}-\d{2})\/"/g)].map(m => m[1]).sort().reverse();
let month = process.env.MONTH || null;
if (!month) for (const m of months.slice(0, 3)) { if (await file(m, `${FMT}-${CUTS[0]}`)) { month = m; break; } }
if (!month) { console.log(`spreads: no ${FMT} stats in the last 3 months; nothing written`); process.exit(0); }
const plan = [...CUTS.map(c => ({key: `ladder${c}`, name: `${FMT}-${c}`, cut: c, label: `Showdown ladder ${c}+`})),
  {key: `bo3_${CUTS[0]}`, name: `${FMT}bo3-${CUTS[0]}`, cut: CUTS[0], label: `Showdown best-of-3 ladder (open team sheets) ${CUTS[0]}+`}];
const sources = [], byMon = {};
for (const s of plan) {
  const d = await file(month, s.name); if (!d) { console.log(`spreads: ${s.name} not found for ${month}`); continue; }
  const b = build(d);
  sources.push({key: s.key, label: s.label, file: `${BASE}${month}/chaos/${s.name}.json`, month, battles: d.info['number of battles'], mons: Object.keys(b.mons).length,
    outOfRange: b.bad.length, unmapped: b.unmapped.length});
  console.log(`${s.key}: ${d.info['number of battles'].toLocaleString('en-US')} battles, ${Object.keys(b.mons).length} Pokémon with spreads, ${b.bad.length} out-of-range spreads, ${b.unmapped.length} names not on the roster${b.unmapped.length ? ' (' + b.unmapped.slice(0, 8).join(', ') + ')' : ''}`);
  for (const [n, o] of Object.entries(b.mons)) (byMon[n] = byMon[n] || {})[s.key] = o; }

// check 1: the 1630 file's top spread against the one the daily job already stores (out/meta_ladder.json sp[0]), same month only
const L = readJSON('out/meta_ladder.json', null), k1 = `ladder${CUTS[0]}`;
if (L && L.month === month && CUTS[0] === 1630) { let same = 0, diff = [], n = 0;
  for (const r of [...(L.top || []), ...(L.more || [])]) { if (!r.sp || !r.sp[0] || !byMon[r.n] || !byMon[r.n][k1]) continue; n++;
    const mine = byMon[r.n][k1].full[0]; if (mine[0] === r.sp[0][0]) same++; else diff.push(`${r.n}: ours ${mine[0]} ${mine[1]}%, meta_ladder ${r.sp[0][0]} ${r.sp[0][1]}%`); }
  console.log(`check 1 (top spread = meta_ladder.json sp[0], ${month}): ${same} of ${n} the same${diff.length ? '; differ: ' + diff.slice(0, 6).join(' | ') : ''}`); }
else console.log(`check 1 skipped: out/meta_ladder.json is for ${L && L.month}, this run is ${month}`);

// coverage against today's tournament Pokémon (out/meta_tour.json: Limitless sheets, last 28 days)
const T = readJSON('out/meta_tour.json', null), tour = T ? [...(T.top || []), ...(T.more || [])] : [];
const cov = tour.map(r => ({n: r.n, teams: r.teams, ...Object.fromEntries(sources.map(s => [s.key, byMon[r.n] && byMon[r.n][s.key] ? byMon[r.n][s.key].wt : 0]))}));
for (const s of sources) { const has = cov.filter(c => c[s.key] > 0), big = cov.filter(c => c[s.key] >= 1000);
  console.log(`coverage ${s.key}: ${has.length} of ${cov.length} tournament Pokémon have spreads; ${big.length} with 1,000+ weighted appearances; missing: ${cov.filter(c => !c[s.key]).map(c => c.n).join(', ') || 'none'}`); }

// keep the file small: Pokémon used in tournaments, or with 1,000+ weighted appearances in any source
const keep = new Set([...tour.map(r => r.n), ...Object.keys(byMon).filter(n => Object.values(byMon[n]).some(o => o.wt >= 1000))]);
const mons = Object.fromEntries(Object.entries(byMon).filter(([n]) => keep.has(n)).sort((a, b) => (b[1][k1] ? b[1][k1].wt : 0) - (a[1][k1] ? a[1][k1].wt : 0)));
const doc = {made: new Date().toISOString(), format: FMT, month, prototype: true,
  note: 'Look-only prototype, not used by the site. Shares are % of each Pokémon\'s weighted appearances in that file. Stat points as Smogon records them (HP/Atk/Def/SpA/SpD/Spe, 0-32 each, 66 total).',
  sources, tourTeams: Object.fromEntries(tour.map(r => [r.n, r.teams])), mons};
fs.writeFileSync(OUT, JSON.stringify(doc));
console.log(`wrote ${OUT}: ${Object.keys(mons).length} Pokémon, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
for (const n of (process.env.SHOW || 'Garchomp,Incineroar,Sneasler').split(',')) { const m = byMon[n]; if (!m) { console.log(`${n}: no spreads`); continue; }
  for (const s of sources) { const o = m[s.key]; if (!o) continue;
    console.log(`${n} [${s.key}] raw ${o.raw.toLocaleString('en-US')}, weighted ${o.wt.toLocaleString('en-US')} · builds: ${o.full.slice(0, 3).map(([k, p]) => `${k} ${p}%`).join(', ')} · families: ${o.fam.slice(0, 3).map(([k, p]) => `${k} ${p}%`).join(', ')}`); } }
