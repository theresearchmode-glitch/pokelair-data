// Item 5 (Nov 8, Sim: "let's do #5"): does adding Showdown ladder games make the grade better at predicting tournaments?
// Builds a copy of the tournament match file (out/matches_ab.json) with ladder games from out/replays.json added as extra
// games: one "event" per day (id sd-YYYY-MM-DD), teams by species (ladder games have no sets), and a fresh player for each
// side (no names are kept; each side's skill counts as unknown). Only games where both players are rated MIN+ are added.
// Usage: MIN=1500 node experiments/matches-rp.mjs out/matches_rp1500.json
import fs from 'node:fs';
const M = JSON.parse(fs.readFileSync('out/matches_ab.json', 'utf8')), R = JSON.parse(fs.readFileSync('out/replays.json', 'utf8')).games, MIN = +(process.env.MIN || 0);
const teamIx = new Map(M.teams.map((k, i) => [k, i])), tix = ns => { const k = ns.slice().sort().join('|'); if (!teamIx.has(k)) { teamIx.set(k, M.teams.length); M.teams.push(k); } return teamIx.get(k); };
const evIx = new Map(); let added = 0;
for (const g of R) { if (!Array.isArray(g.p) || g.p.length !== 2 || g.p.some(t => !Array.isArray(t) || t.length !== 6) || (g.w !== 0 && g.w !== 1)) continue;
  if (!Array.isArray(g.r) || Math.min(...g.r) < MIN) continue;
  const day = new Date(g.t * 1000).toISOString().slice(0, 10), id = 'sd-' + day; if (!evIx.has(id)) { evIx.set(id, M.events.length); M.events.push([id, day, 0]); }
  const a = M.players++, b = M.players++; M.m.push([tix(g.p[0]), tix(g.p[1]), g.w === 0 ? 1 : 0, evIx.get(id), a, b, 0, null, null]); added++; }
fs.writeFileSync(process.argv[2], JSON.stringify(M));
console.log(`added ${added} ladder games (both players ${MIN}+) over ${evIx.size} days → ${process.argv[2]}`);
