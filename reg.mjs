// Regulation check (first step of the daily job, Nov 1): which regulation the newest tournaments and the ladder are played
// under, so no step ever mixes two regulations (formats.mjs has the rules). Reads:
//   - Limitless: the newest VGC tournaments of every format (3 list pages, well under its 50-requests-per-5-minutes limit)
//   - Showdown: replay searches for the next regulation's format id (e.g. gen9championsvgc2026regmd, this year and next)
// Writes out/reg.json; perf.mjs copies it into out/perf.json as "reg", so the page gets it with meta/perf.
// If both sources fail, yesterday's file stays (a ::warning:: in the log). REG_OFFLINE=1 builds it from the saved tournaments
// in data/index.json only (no network; they are all one regulation, so it can't see a new one) for local previews.
import fs from 'node:fs';
import {detectReg, readReg, activeReg, nextRegIds, sdGuess, regName, SITE_REG} from './formats.mjs';
const UA = {'User-Agent': 'pokelair-data (personal team-builder stats)'}, sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(url) { const c = new AbortController(), to = setTimeout(() => c.abort(), 30000);
  try { const r = await fetch(url, {headers: UA, signal: c.signal}); if (!r.ok) throw new Error(url + ' ' + r.status); return await r.json(); } finally { clearTimeout(to); } }
const prev = readReg(), act = activeReg(), today = new Date().toISOString().slice(0, 10);
let list = null; const sd = {};
if (process.env.REG_OFFLINE === '1') {
  let idx = {tournaments: {}}; try { idx = JSON.parse(fs.readFileSync('data/index.json', 'utf8')); } catch (e) {}
  list = Object.values(idx.tournaments || {}).map(t => ({format: t.f || SITE_REG.id, date: t.d, players: t.p}));
} else {
  try { list = []; for (let page = 1; page <= 3; page++) { if (page > 1) await sleep(6500);
      const r = await getJSON(`https://play.limitlesstcg.com/api/tournaments?game=VGC&limit=100&page=${page}`); if (!Array.isArray(r) || !r.length) break; list.push(...r); }
    if (!list.some(t => t && t.format)) { console.log('::warning::reg: Limitless tournaments came back without formats'); list = null; } }
  catch (e) { console.log('::warning::reg: Limitless list failed (' + e.message + ')'); list = null; }
  // the next regulation on Showdown: one search page per candidate id (51 replays per page at most)
  const y = +today.slice(0, 4);
  for (const id of nextRegIds(act.id)) for (const yr of [y, y + 1]) { const f = sdGuess(id, yr);
    try { await sleep(400); const r = await getJSON(`https://replay.pokemonshowdown.com/search.json?format=${f}`);
      if (Array.isArray(r) && r.length) { const t = Math.min(...r.map(x => +x.uploadtime || Infinity)); sd[f] = {n: r.length, first: isFinite(t) ? new Date(t * 1000).toISOString().slice(0, 10) : null}; } }
    catch (e) { console.log(`reg: Showdown search for ${f} failed (${e.message})`); } }
}
if (!list && !Object.keys(sd).length) { console.log('::warning::reg: no source answered; kept yesterday\'s out/reg.json'); process.exit(0); }
const r = detectReg(list || [], sd, prev, today);
// a source that failed today doesn't erase what it showed yesterday
if (!list && prev && prev.seen) r.seen = prev.seen;
if (r.now) console.log(`::warning::reg: ${r.now.name} is being played since ${r.now.since} (${r.now.events} events, ${r.now.players} players${r.now.ladder ? ', ' + r.now.ladder + '+ Showdown replays' : ''}); numbers stay on ${r.name} until it has ${r.now.need.events} events and ${r.now.need.players} players`);
if (r.switched && r.switched.on === today) console.log(`::warning::reg: switched from ${regName(r.switched.from)} to ${r.name} (started ${r.since}); every step now counts ${r.name} events only`);
fs.writeFileSync('out/reg.json', JSON.stringify(r));
console.log(`reg: ${r.name} since ${r.since}${r.now ? `, newer ${r.now.name} since ${r.now.since}` : ''} · seen ${Object.entries(r.seen).map(([k, s]) => `${k} ${s.events} events (${s.week} this week)`).join(', ') || 'nothing'}`);
