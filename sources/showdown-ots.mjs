// Backup adapter: Pokémon Showdown Open-Team-Sheet (Bo3) public replays (replay.pokemonshowdown.com/search.json + <id>.json).
// Groups daily OTS replays for the active regulation into synthetic daily event buckets returning exact update.mjs shapes:
//   - tournament list: [{id: 'sd_<fmt>_<YYYY-MM-DD>', date, players, name, format}]
//   - standings: full 6-Pokémon open team sheets (species, item, ability, moves, nature) + wins/losses
//   - pairings: game-level [round, player1, player2, winner] for matches.json
// Uses politeFetch from http.mjs; raw usernames stay in memory only (update.mjs hashes them via pid() before saving).
import {politeFetch} from '../http.mjs';
import {sdReg} from '../formats.mjs';

const BASE = 'https://replay.pokemonshowdown.com';

// Parse Showdown's packed |showteam|p1|... string into update.mjs decklist entries.
// Packed format per mon: Species|Nickname|Item|Ability|Moves|Nature|EVs|Gender|IVs|Shiny|Level|Misc (',,,,,Tera')
export function parseShowteam(packed) {
  if (!packed) return [];
  return String(packed).split(']').map(chunk => {
    const f = chunk.split('|');
    const name = (f[0] || f[1] || '').trim();
    if (!name) return null;
    const item = (f[2] || '').trim();
    const ability = (f[3] || '').trim();
    const attacks = (f[4] || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 4);
    const nature = (f[5] || '').trim();
    const misc = (f[11] || '').split(',');
    const tera = (misc[5] || '').trim();
    return {name, item, ability, attacks, tera, nature};
  }).filter(Boolean).slice(0, 6);
}

export function parseReplayLog(replay) {
  const log = String((replay && replay.log) || '');
  const players = {p1: '', p2: ''};
  const teams = {p1: [], p2: []};
  let winner = null;
  for (const line of log.split('\n')) {
    if (line.startsWith('|player|p1|')) { const n = line.split('|')[3]; if (n && !players.p1) players.p1 = n.trim(); }
    else if (line.startsWith('|player|p2|')) { const n = line.split('|')[3]; if (n && !players.p2) players.p2 = n.trim(); }
    else if (line.startsWith('|showteam|p1|')) teams.p1 = parseShowteam(line.slice('|showteam|p1|'.length));
    else if (line.startsWith('|showteam|p2|')) teams.p2 = parseShowteam(line.slice('|showteam|p2|'.length));
    else if (line.startsWith('|win|')) winner = line.slice('|win|'.length).trim();
  }
  if (!players.p1 && Array.isArray(replay && replay.players)) players.p1 = replay.players[0] || '';
  if (!players.p2 && Array.isArray(replay && replay.players)) players.p2 = replay.players[1] || '';
  if (!players.p1 || !players.p2 || teams.p1.length !== 6 || teams.p2.length !== 6) return null;
  return {p1: players.p1, p2: players.p2, t1: teams.p1, t2: teams.p2, winner};
}

async function fetchJson(url, fetchFn) {
  const fn = fetchFn || politeFetch;
  const r = await fn(url);
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}

export const showdownOtsAdapter = {
  name: 'showdown-ots',
  async listTournaments({format, sdFormat, fetchFn}) {
    const baseFmt = sdFormat || '';
    if (!baseFmt) return [];
    const otsFmt = baseFmt.endsWith('bo3') ? baseFmt : `${baseFmt}bo3`;
    const fmtReg = sdReg(baseFmt.replace(/bo3$/, ''));
    if (format && fmtReg && fmtReg !== format) return [];
    const rows = await fetchJson(`${BASE}/search.json?format=${encodeURIComponent(otsFmt)}`, fetchFn);
    if (!Array.isArray(rows)) return [];
    const byDay = new Map();
    for (const r of rows) {
      if (!r || !r.id || !r.uploadtime) continue;
      // Verify each replay's own formatid matches the requested regulation
      const rFmt = String(r.formatid || otsFmt).replace(/bo3$/, '');
      if (format && sdReg(rFmt) && sdReg(rFmt) !== format) continue;
      const day = new Date(+r.uploadtime * 1000).toISOString().slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(r);
    }
    return [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([day, replays]) => ({
      id: `sd_${otsFmt}_${day}`,
      date: `${day}T23:59:00.000Z`,
      players: new Set(replays.flatMap(r => Array.isArray(r.players) ? r.players : [])).size,
      name: `Showdown OTS Daily ${day}`,
      format: format || fmtReg || '',
      _replays: replays,
    }));
  },
  async getStandings(t, {fetchFn}) {
    const byPlayer = new Map();
    const pairings = [];
    let round = 0;
    for (const r of (t._replays || [])) {
      try {
        const full = await fetchJson(`${BASE}/${encodeURIComponent(r.id)}.json`, fetchFn);
        const parsed = parseReplayLog(full);
        if (!parsed) continue;
        round++;
        const ensure = (pl, dk) => {
          if (!byPlayer.has(pl)) byPlayer.set(pl, {player: pl, placing: null, record: {wins: 0, losses: 0, ties: 0}, decklist: dk});
          return byPlayer.get(pl);
        };
        const a = ensure(parsed.p1, parsed.t1);
        const b = ensure(parsed.p2, parsed.t2);
        if (parsed.winner === parsed.p1) { a.record.wins++; b.record.losses++; }
        else if (parsed.winner === parsed.p2) { b.record.wins++; a.record.losses++; }
        else { a.record.ties++; b.record.ties++; }
        pairings.push({round, player1: parsed.p1, player2: parsed.p2, winner: parsed.winner || '0'});
      } catch (e) {
        // Skip unreadable individual replay
      }
    }
    t._pairings = pairings;
    const sorted = [...byPlayer.values()].sort((x, y) => (y.record.wins - x.record.wins) || (x.record.losses - y.record.losses));
    sorted.forEach((s, i) => { s.placing = i + 1; });
    return sorted;
  },
  async getPairings(t) {
    return Array.isArray(t._pairings) ? t._pairings : [];
  },
};
