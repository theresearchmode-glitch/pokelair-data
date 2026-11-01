// The ratings' outside inputs, in one file the morning refresh copies whole into the page's meta/perf:
//   tour     Limitless tournament usage and game win rate per Pokémon (update.mjs, limitless.json "tour")
//   adj      Limitless: each Pokémon's own share of team wins (update.mjs, limitless.json "adj")
//   ingame   op.gg's in-game Ranked Doubles order (opgg.mjs, meta_ingame.json)
//   official official events, every Masters team and match: frozen. Read from RK9 (rk9-field.mjs, out/official_perf.json)
//            until Nov 1, when RK9 reads stopped (its terms forbid automated extraction). No permitted source gives every
//            team and match yet (Victory Road lists the top ~128 with Swiss records, not the matches), so the last values
//            are kept as they are, marked frozen with the date of their newest event; the page shows them for 28 days
//            after that event (16-outside-performance-data.js), then leaves them out.
//   smogon   Smogon usage stats, 1760+ ladder, latest month (ladder.mjs, meta_ladder.json "usage1760")
//   ladder   Showdowntier: Showdown ladder usage, win rate and average rating, last 14 days (sources.mjs)
//   outside  other sites' tier lists for each Pokémon's sheet: Showdowntier (sources.mjs; Pokémon Zone refuses automated reads)
// Every part carries the date of its data ("updated", YYYY-MM-DD; a month for Smogon) and its label says it, so the page
// can show the date and leave out anything older than its cadence. A part whose source failed today is left out.
// Usage: node perf.mjs   (after update.mjs, ladder.mjs, opgg.mjs and sources.mjs)
import fs from 'node:fs';
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
const day = t => String(t || '').slice(0, 10), today = new Date().toISOString().slice(0, 10);
const L = rd('limitless.json'), G = rd('meta_ingame.json'), O = rd('official_perf.json'), Lad = rd('meta_ladder.json'), S = rd('sources.json') || {}, out = {updated: today};
if (L && L.tour && Array.isArray(L.tour.rows) && L.tour.rows.length >= 50) out.tour = Object.assign({}, L.tour, {updated: L.tour.updated || day(L.updated)});
else console.log('::warning::perf: no tournament table in limitless.json; tour left out');
if (L && L.adj && Array.isArray(L.adj.rows) && L.adj.rows.length >= 50) out.adj = Object.assign({}, L.adj, {updated: day(L.updated)});
if (G && Array.isArray(G.top)) { const rows = [...G.top, ...(G.more || [])].sort((a, b) => a.r - b.r), d = day(G.updated);
  if (rows.length >= 100) out.ingame = {label: `${G.source}${d ? ` · ${d}` : ''} (all ${rows.length} Pokémon ranked)`, names: rows.map(x => x.n), season: G.period || '', updated: d};
  else console.log(`::warning::perf: in-game order has only ${rows.length} Pokémon; ingame left out`); }
if (O && Array.isArray(O.rows) && O.rows.length >= 30 && O.teams >= 300) { const evs = O.events || [], ds = evs.map(e => e.date).filter(Boolean).sort(), asOf = ds[ds.length - 1] || day(O.updated);
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], md = d => `${M[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}`;
  out.official = {label: `RK9 (read before Nov 1, now frozen) · ${evs.length} official VGC events (${ds.length ? `${md(ds[0])} – ${md(asOf)}` : ''}), all ${Number(O.teams).toLocaleString('en-US')} Masters teams, ${Number(O.matches).toLocaleString('en-US')} matches`,
    rows: O.rows, megas: [], split: true, teams: O.teams, matches: O.matches, events: evs, frozen: true, asOf, updated: asOf}; }
else console.log('::warning::perf: no official-events table (official_perf.json); official left out');
if (Lad && Lad.usage1760 && Array.isArray(Lad.usage1760.rows) && Lad.usage1760.rows.length >= 30) out.smogon = {label: `Smogon usage stats · 1760+ rating, ${Lad.usage1760.month} (${Number(Lad.usage1760.battles || 0).toLocaleString('en-US')} battles)`, rows: Lad.usage1760.rows, updated: Lad.usage1760.month};
else console.log('::warning::perf: no Smogon 1760+ usage (meta_ladder.json usage1760); smogon left out');
if (S.sdt) out.ladder = {label: `Showdowntier · ${Number(S.sdt.battles || 0).toLocaleString('en-US')} ladder battles, ${S.sdt.from} – ${S.sdt.to}`, rows: S.sdt.rows.map(r => [r.n, r.u, r.w, r.r]), updated: S.sdt.date || S.sdt.to};
// Outside tier lists. Sites list species ("Charizard"); a species with Megas is filed under the form most tournament teams use
// (Charizard -> Charizard-Mega-Y), as before. A site's own Mega list is filed under each Mega.
const tourU = {}; if (L && L.tour) for (const r of [...(L.tour.rows || []), ...(L.tour.megas || [])]) tourU[r[0]] = r[1];
const ROSTER = (() => { try { return JSON.parse(fs.readFileSync('roster.json', 'utf8')); } catch (e) { return []; } })();
const famOf = n => { const b = n === 'Floette-Eternal' ? 'Floette' : n; return [n, ...ROSTER.filter(x => x.startsWith(b + '-Mega'))]; };
function tierList(k, name, how, url, note, src, megaSrc) { if (!src) return null;
  const order = [...new Set([...src.rows, ...((megaSrc && megaSrc.rows) || [])].map(r => r.tier).filter(Boolean))];
  if (!order.length) return null; const idx = t => order.length - order.indexOf(t), data = {};
  for (const r of (megaSrc && megaSrc.rows) || []) if (r.tier && !data[r.n]) data[r.n] = idx(r.tier);
  for (const r of src.rows) { if (!r.tier) continue; const fam = famOf(r.n), best = fam.slice().sort((a, b) => (tourU[b] || 0) - (tourU[a] || 0))[0];
    const key = data[best] == null ? best : r.n; if (data[key] == null) data[key] = idx(r.tier); }
  return {list: {k, name, how, url, note, date: src.date || today, tiers: Object.fromEntries(order.map(t => [idx(t), t]))}, data}; }
const T = [tierList('showdowntier', 'Showdowntier', 'Showdown ladder usage + win rate', 'https://showdowntier.com/formats/dmc/index.html', 'lists Pokémon with 1%+ ladder usage', S.sdt)].filter(Boolean);
if (T.length) out.outside = {updated: today, lists: T.map(t => t.list), data: Object.fromEntries(T.map(t => [t.list.k, t.data]))};
fs.writeFileSync('out/perf.json', JSON.stringify(out));
console.log(`perf: ${['tour', 'adj', 'ingame', 'official', 'smogon', 'ladder'].map(k => `${k} ${out[k] ? (out[k].rows || out[k].names).length + ' (' + out[k].updated + ')' : 'none'}`).join(', ')}, outside ${T.map(t => t.list.k + ' ' + Object.keys(t.data).length).join('/') || 'none'}`);
