// The ratings' daily inputs, in one file the morning refresh merges into the page's meta/perf:
//   tour   — tournament usage and game win rate per Pokémon, from update.mjs (limitless.json "tour")
//   ingame — op.gg's in-game Ranked Doubles order, from opgg.mjs (meta_ingame.json)
// The other rating sources (official events, Showdown ladder, top replays, Smogon) stay as dated snapshots in meta/perf.
// Usage: node perf.mjs   (after update.mjs and opgg.mjs)
import fs from 'node:fs';
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), G = rd('meta_ingame.json'), out = {updated: new Date().toISOString().slice(0, 10)};
if (L && L.tour && Array.isArray(L.tour.rows) && L.tour.rows.length >= 50) out.tour = L.tour;
else console.log('::warning::perf: no tournament table in limitless.json; tour left out');
if (G && Array.isArray(G.top)) { const rows = [...G.top, ...(G.more || [])].sort((a, b) => a.r - b.r), day = String(G.updated || '').slice(0, 10);
  if (rows.length >= 100) out.ingame = {label: `${G.source}${day ? ` · ${day}` : ''} (all ${rows.length} Pokémon ranked)`, names: rows.map(x => x.n), updated: day};
  else console.log(`::warning::perf: in-game order has only ${rows.length} Pokémon; ingame left out`); }
fs.writeFileSync('out/perf.json', JSON.stringify(out));
console.log(`perf: tour ${out.tour ? out.tour.rows.length + '+' + out.tour.megas.length : 'none'}, ingame ${out.ingame ? out.ingame.names.length : 'none'}`);
