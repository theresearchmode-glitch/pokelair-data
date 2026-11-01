// Track record (step 9, after ratings-snapshot.mjs and scoreboard.mjs): how right have the ratings been?
// ratings-snapshot.mjs saves every Pokémon's rating each morning (out/ratings_log.json). Here each recent event in
// out/events.json (Limitless 32+ players, RK9 official events) is checked against the NEWEST snapshot saved BEFORE the
// event's day, so the ratings could not have seen it: which Pokémon made its top 8, and what we had rated them.
// Writes out/track.json for the page's Track record (meta/track). Checked events are kept here even after events.json
// drops them (it only holds 30 days), so the record keeps growing. Never fails the job.
//   ev   [id, date, name, players, official 0/1, snapshot date, top-8 teams, [Pokémon per band], [top-8 slots per band], tops]
//        tops = [[name, rating, top-8 teams, best place], ...] (null for the oldest events once the file nears its cap)
//   mons per Pokémon over the events whose snapshot is still in the log: [name, events judged, average rating, top-8 teams,
//        event wins, best event name] (only Pokémon rated 70+ on average or seen in a top 8)
//   mb   per band: [Pokémon whose average rating is in the band, of them seen in a top 8]
//   fw   scoreboard.mjs's games check (snapshot 14+ days old, 300+ later games): [date, accuracy, games]
// Bands: 80+, 60-79, 40-59, under 40 (index 0..3).
import fs from 'node:fs';
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
const L = rd('ratings_log.json'), E = rd('events.json'), SB = rd('scoreboard.json'), prev = rd('track.json') || {};
if (!L || !Array.isArray(L.days) || !L.days.length) { console.log('track: no ratings snapshots yet, skipped'); process.exit(0); }
const CAP = 240 * 1024, TOP = 8, band = r => r >= 80 ? 0 : r >= 60 ? 1 : r >= 40 ? 2 : 3;
const snaps = L.days.filter(s => s && s.d && s.r).sort((a, b) => a.d < b.d ? -1 : 1), sByD = new Map(snaps.map(s => [s.d, s]));
const snapFor = d => { let s = null; for (const x of snaps) if (x.d < d) s = x; return s; };
const ev = new Map((Array.isArray(prev.ev) ? prev.ev : []).filter(e => Array.isArray(e) && e[0]).map(e => [e[0], e]));
// events still in events.json are (re)checked: results of the last few days can still change
if (E && Array.isArray(E.events) && Array.isArray(E.dict)) for (const e of E.events) {
  const s = snapFor(e.date); if (!s || e.date < snaps[0].d) continue;
  const top = (e.top || []).filter(t => t[1] >= 1 && t[1] <= TOP && Array.isArray(t[3]) && t[3].length === 6); if (top.length < 4) continue;
  const c = new Map(); for (const t of top) for (const n of new Set(t[3].map(m => E.dict[m[0]]))) { const o = c.get(n) || {c: 0, p: 99}; o.c++; o.p = Math.min(o.p, t[1]); c.set(n, o); }
  const bs = [0, 0, 0, 0], ap = [0, 0, 0, 0]; for (const r of Object.values(s.r)) bs[band(r)]++;
  const tops = [...c].filter(([n]) => s.r[n] != null).map(([n, o]) => { ap[band(s.r[n])] += o.c; return [n, s.r[n], o.c, o.p]; }).sort((a, b) => b[2] - a[2] || b[1] - a[1]);
  ev.set(e.id, [e.id, e.date, String(e.name).slice(0, 80), e.players, e.src === 'official' ? 1 : 0, s.d, top.length, bs, ap, tops]); }
const evs = [...ev.values()].sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : b[3] - a[3]);
// per Pokémon, over the events whose snapshot is still kept (120 days)
const M = new Map(), seen = evs.filter(e => e[9] && sByD.has(e[5]));
for (const e of seen) { const s = sByD.get(e[5]), hit = new Map(e[9].map(x => [x[0], x]));
  for (const [n, r] of Object.entries(s.r)) { const o = M.get(n) || {n: 0, r: 0, c: 0, w: 0, best: null}; o.n++; o.r += r; const h = hit.get(n);
    if (h) { o.c += h[2]; if (h[3] === 1) { o.w++; o.best = e[2]; } else if (!o.best) o.best = e[2]; } M.set(n, o); } }
const mb = [[0, 0], [0, 0], [0, 0], [0, 0]], mons = [];
for (const [n, o] of M) { const r = o.r / o.n, b = band(Math.round(r)); mb[b][0]++; if (o.c) mb[b][1]++; if (r >= 70 || o.c) mons.push([n, o.n, Math.round(r), o.c, o.w, o.best]); }
const fw = (SB && Array.isArray(SB.history) ? SB.history : []).filter(h => h && h.ratingsForward).map(h => [h.date, h.ratingsForward.acc, h.ratingsForward.games]);
const out = {v: 1, updated: new Date().toISOString(), since: snaps[0].d, snaps: snaps.length, last: snaps[snaps.length - 1].d, top: TOP, ev: evs, mons, mb, fw};
// under the cap: the oldest events lose their per-Pokémon lists first (their band totals stay)
for (let i = 0; Buffer.byteLength(JSON.stringify(out)) > CAP && i < evs.length - 20; i++) evs[i][9] = null;
fs.writeFileSync('out/track.json', JSON.stringify(out));
console.log(`track: since ${out.since}, ${out.snaps} snapshots, ${evs.length} events checked, ${Math.round(Buffer.byteLength(JSON.stringify(out)) / 1024)} KiB`);
