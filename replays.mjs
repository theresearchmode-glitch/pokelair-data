// Showdown replays (step 4b): public Champions VGC Reg M-C replays from replay.pokemonshowdown.com.
// For each game: both teams from team preview, the four each side brought, the two leads, Megas used, ladder ratings and
// the winner. Limitless records only who won; replays also show what was brought and led, which nothing else gives us.
// Writes out/replays.json (newest 20,000 games kept). Polite: one request at a time with a pause, capped per run.
// If the replay server is down the step just stops and the existing file stays (the workflow treats it as optional).
import fs from 'node:fs';
export const FMT = 'gen9championsvgc2026regmc';
const BASE = 'https://replay.pokemonshowdown.com', KEEP = 20000, MAX_NEW = +(process.env.MAX_REPLAYS || 600), PAUSE = 350;
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const ROSTER = new Set(readJSON('roster.json', []));
// Showdown species -> roster name (the roster mostly uses Showdown's own spelling)
export function mapMon(n) { if (!n) return null; n = String(n).replace(/'/g, '’').trim(); if (ROSTER.has(n)) return n;
  for (const c of [n.replace(/-\*$/, ''), n.replace(/-(F|M)$/, ''), n.split('-')[0]]) if (ROSTER.has(c)) return c; return null; }
// "p1a: Nick" -> "p1";  "Incineroar, L50, M" -> "Incineroar"
const side = s => String(s).slice(0, 2), species = d => String(d).split(',')[0].trim();
// Parse one replay log (Showdown battle protocol). Returns null for logs we can't use (not 4-of-6 doubles, unknown Pokémon, no winner).
export function parseLog(log) {
  const L = String(log).split('\n'), names = {}, rating = {}, team = {p1: [], p2: []}, brought = {p1: [], p2: []}, leads = {p1: [], p2: []}, mega = {p1: null, p2: null};
  let started = false, winner = null, doubles = false, preview = 0;
  const bring = (sd, sp) => { const n = mapMon(sp); if (!n || !brought[sd]) return; const base = n.replace(/-Mega.*$/, '');
    if (!brought[sd].some(x => x.replace(/-Mega.*$/, '') === base)) { brought[sd].push(n); if (!started && leads[sd].length < 2) leads[sd].push(n); } };
  for (const line of L) { const p = line.split('|'); const t = p[1];
    if (t === 'gametype') doubles = p[2] === 'doubles';
    else if (t === 'player' && p[2] && p[3]) { names[p[2]] = p[3]; if (p[5] && /^\d+$/.test(p[5])) rating[p[2]] = +p[5]; }
    else if (t === 'poke' && team[p[2]]) team[p[2]].push(species(p[3]));
    else if (t === 'teampreview') preview = +p[2] || 4;
    else if (t === 'switch' || t === 'drag') bring(side(p[2]), species(p[3]));
    else if (t === 'detailschange' && /-Mega/.test(p[3] || '')) { const sd = side(p[2]), n = mapMon(species(p[3])); if (n) mega[sd] = n; }
    else if (t === 'turn') started = true;
    else if (t === 'win') winner = p[2]; }
  if (!doubles || preview !== 4 || !winner) return null;
  const out = {};
  for (const sd of ['p1', 'p2']) { let six = team[sd].map(mapMon); if (six.length !== 6 || six.some(x => !x)) return null;
    // the Mega that Mega Evolved is listed in its Mega form, like tournament team lists
    if (mega[sd]) { const base = mega[sd].replace(/-Mega.*$/, ''); six = six.map(x => x === base ? mega[sd] : x); brought[sd] = brought[sd].map(x => x === base ? mega[sd] : x); leads[sd] = leads[sd].map(x => x === base ? mega[sd] : x); }
    out[sd] = {team: six.sort(), brought: brought[sd], leads: leads[sd], mega: mega[sd], rating: rating[sd] || null}; }
  const w = winner === names.p1 ? 0 : winner === names.p2 ? 1 : null; if (w == null) return null;
  return {p: [out.p1.team, out.p2.team], b: [out.p1.brought, out.p2.brought], l: [out.p1.leads, out.p2.leads], m: [out.p1.mega, out.p2.mega], r: [out.p1.rating, out.p2.rating], w}; }
async function get(url) { const c = new AbortController(), to = setTimeout(() => c.abort(), 30000);
  try { const r = await fetch(url, {signal: c.signal, headers: {'user-agent': 'NastyPlot data job (github.com/theresearchmode-glitch/pokelair-data)'}}); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(to); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));
// the replay server is sometimes slow or briefly down: try a list page up to 5 times, waiting longer each time
async function getRetry(url) { for (let k = 0; ; k++) { try { return await get(url); } catch (e) { if (k >= 4) throw e; await sleep(5000 * (k + 1)); } } }
// BACKFILL=1 walks all the way back through the search pages, skipping games we already have (a one-off catch-up
// run; list pages are cheap, only new games are downloaded). The daily run stops when it reaches games it already has.
const BACKFILL = process.env.BACKFILL === '1', MAX_PAGES = BACKFILL ? 100000 : 60;
function save(prev, fresh) {
  const byId = new Map(); for (const g of [...fresh, ...prev.games]) if (!byId.has(g.id)) byId.set(g.id, g);
  const games = [...byId.values()].sort((a, b) => (b.t || 0) - (a.t || 0)).slice(0, KEEP);
  fs.writeFileSync('out/replays.json', JSON.stringify({updated: new Date().toISOString(), format: FMT, source: 'Showdown replays (replay.pokemonshowdown.com)', games}));
  return games.length; }
async function main() {
  const prev = readJSON('out/replays.json', {games: []}), seen = new Set(prev.games.map(g => g.id)), fresh = [];
  let before = '', pages = 0, skipped = 0;
  // newest first; stop at replays we already have, or the per-run cap
  outer: while (fresh.length < MAX_NEW && pages < MAX_PAGES) {
    let list; try { list = await getRetry(`${BASE}/search.json?format=${FMT}${before ? '&before=' + before : ''}`); } catch (e) { console.log('replays: list page failed (' + e.message + '), saving what we have'); break; } pages++;
    if (!Array.isArray(list) || !list.length) break;
    for (const s of list) { if (seen.has(s.id)) { if (pages > 1 && !BACKFILL) break outer; continue; }
      await sleep(PAUSE); let j; try { j = await get(`${BASE}/${s.id}.json`); } catch (e) { skipped++; continue; }
      const g = parseLog(j.log); if (!g) { skipped++; continue; }
      seen.add(s.id); fresh.push({id: s.id, t: j.uploadtime || s.uploadtime || null, ...g}); if (fresh.length >= MAX_NEW) break;
      if (fresh.length % 250 === 0) { save(prev, fresh); console.log(`replays: ${fresh.length} so far`); } }
    before = list[list.length - 1].uploadtime; if (list.length < 51) break; await sleep(PAUSE); }
  const kept = save(prev, fresh);
  console.log(`replays: ${fresh.length} new, ${skipped} skipped (not usable), ${kept} kept`); }
if (process.argv[1] && process.argv[1].endsWith('replays.mjs')) main().catch(e => { console.log('replays: stopped (' + e.message + '); kept the existing file'); process.exit(0); });
