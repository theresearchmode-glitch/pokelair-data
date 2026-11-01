// Official events (step 4): open team sheets from RK9 for Reg M-C VGC Regionals/Internationals.
// For each finished event since the regulation started, keeps the top 64 team lists (species, item, ability, nature, moves)
// in data/rk9/, writes out/official.json, and puts each event's top 8 at the front of out/teams.json.
// (rk9-field.mjs then reads every Masters team and every match of the same events for the ratings' official-events row.)
import fs from 'node:fs';
import {get, readJSON, parseTeam, parseRoster, validItem, bad, REG_START, REG_ACTIVE} from './rk9-lib.mjs';
import {inRegWindow} from './formats.mjs';
const TOP = +(process.env.RK9_TOP || 64);
fs.mkdirSync('data/rk9', {recursive: true});
// a cached event parsed by the old reader (a label stored as an item) is fetched again
const staleParse = f => { const e = readJSON(f, null); return !!(e && e.teams && e.teams.some(t => t.mons.some(m => /:\s*$/.test(m.i || '')))); };
// 1) finished events since the regulation started
const evHtml = await get('/events/pokemon');
const slugs = [...new Set([...evHtml.matchAll(/href="\/event\/(pokemon-[a-z0-9-]+)"/g)].map(m => m[1]))].filter(s => /-20(2[7-9]|[3-9]\d)$/.test(s));
const index = readJSON('data/rk9/index.json', {events: {}});
for (const slug of slugs) { if (index.events[slug] && index.events[slug].done && !index.events[slug].refetch && !(index.events[slug].date && staleParse(`data/rk9/${slug}.json`))) continue;
  try { const ev = await get('/event/' + slug); const name = (ev.match(/<title>([^<]*)/) || [, slug])[1].replace(/ - RK9$/, '').trim();
    const rosters = [...new Set([...ev.matchAll(/href="\/roster\/([A-Za-z0-9-]+)"/g)].map(m => m[1]))];
    let found = null;
    for (const rid of rosters) { const r = await get('/roster/' + rid); if (!/\/teamlist\/public\//.test(r)) continue;
      const players = parseRoster(r);
      if (!players.length) continue;
      const first = parseTeam(await get(players[0].tl));
      if (!first.date || first.mons.length !== 6) continue;  // TCG and GO lists have no Pokémon sets
      found = {rid, players, first}; break; }
    if (!found) { index.events[slug] = {name, done: false, note: 'no VGC team lists yet'}; continue; }
    if (found.first.date < REG_START) { index.events[slug] = {name, done: true, skip: 'before ' + REG_ACTIVE.name}; continue; }
    // played under a newer regulation that isn't active yet: not counted, and looked at again once it is
    if (REG_ACTIVE.end && found.first.date >= REG_ACTIVE.end) { index.events[slug] = {name, date: found.first.date, done: false, note: 'newer regulation'}; continue; }
    const teams = [];
    for (const p of found.players.slice(0, TOP)) { const T = p === found.players[0] ? found.first : parseTeam(await get(p.tl));
      if (T.mons.length === 6) teams.push({player: `${p.first} ${p.last}`.trim(), country: p.country, st: p.st, mons: T.mons}); }
    fs.writeFileSync(`data/rk9/${slug}.json`, JSON.stringify({slug, name, date: found.first.date, players: found.players.length, teams}));
    index.events[slug] = {name, date: found.first.date, players: found.players.length, done: true, rid: found.rid};
    console.log(`rk9: ${name} (${found.first.date}), ${found.players.length} Masters, kept top ${teams.length}`);
  } catch (err) { console.log('rk9 skip', slug, err.message); } }
fs.writeFileSync('data/rk9/index.json', JSON.stringify(index));
// 2) outputs
const evs = Object.keys(index.events).filter(s => index.events[s].done && !index.events[s].skip && inRegWindow(index.events[s].date, REG_ACTIVE)).map(s => readJSON(`data/rk9/${s}.json`, null)).filter(Boolean).sort((a, b) => b.date < a.date ? -1 : 1);
const miss = new Set(); evs.forEach(e => e.teams.forEach(t => t.mons.forEach(m => { if (!m.n) miss.add(m.sp); })));
fs.writeFileSync('out/official.json', JSON.stringify({updated: new Date().toISOString(), source: 'RK9 open team sheets · official VGC events (Masters top ' + TOP + ')',
  events: evs.map(e => ({name: e.name, date: e.date, players: e.players, teams: e.teams.map(t => ({player: t.player, st: t.st, mons: t.mons.map(m => ({n: m.n || m.sp, i: validItem(m.i), a: m.a, nt: m.nt, mv: m.mv}))}))}))}));
if (bad.items) console.log(`rk9: ${bad.items} held items didn't parse as items and were left blank`);
const T = readJSON('out/teams.json', {teams: []});
const off = []; for (const e of evs.slice(0, 4)) for (const t of e.teams.filter(t => t.st <= 8 && t.mons.every(m => m.n))) off.push({player: t.player, event: `${e.name} · ${e.players} players`, record: `#${t.st} · official`, section: 'Official events', mons: t.mons.map(m => m.n)});
T.teams = [...off, ...(T.teams || []).filter(t => t.section !== 'Official events')].slice(0, 90);
T.source = (T.source || '').replace(/ \+ RK9.*$/, '') + (off.length ? ' + RK9 official events (top 8)' : '');
fs.writeFileSync('out/teams.json', JSON.stringify(T));
console.log(`rk9: ${evs.length} events, ${off.length} official top-8 teams${miss.size ? ', unmapped: ' + [...miss].join(', ') : ''}`);
