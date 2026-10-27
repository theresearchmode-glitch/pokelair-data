// What stands behind one Pokémon's numbers: games, win rate, how many players and events, how concentrated it is in a
// few players' hands, its usual teammates, and how its win rate holds up by player strength and over time.
// Usage: node experiments/mon-evidence.mjs Annihilape Kingambit ...
import fs from 'node:fs';
const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8')), model = JSON.parse(fs.readFileSync('out/model.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]), evD = M.events.map(e => e[1]);
// each player's overall record, to see whether a Pokémon's wins come from strong players
const prec = new Map(); for (const g of G) for (const [p, won] of [[g[4], g[2]], [g[5], 1 - g[2]]]) { const x = prec.get(p) || [0, 0]; x[0]++; x[1] += won; prec.set(p, x); }
const pwr = p => { const x = prec.get(p); return (x[1] + 5) / (x[0] + 10); };
for (const mon of process.argv.slice(2)) { let n = 0, w = 0, oppStrength = 0, ownStrength = 0; const pl = new Map(), ev = new Set(), tm = new Map(), byHalf = [[0, 0], [0, 0]];
  const dates = [...new Set(evD)].sort(), mid = dates[Math.floor(dates.length / 2)];
  for (const g of G) for (const [t, p, won, o] of [[g[0], g[4], g[2], g[5]], [g[1], g[5], 1 - g[2], g[4]]]) { if (!teams[t].includes(mon)) continue;
    n++; w += won; ev.add(g[3]); ownStrength += pwr(p); oppStrength += pwr(o); const x = pl.get(p) || [0, 0]; x[0]++; x[1] += won; pl.set(p, x);
    for (const m of teams[t]) if (m !== mon) tm.set(m, (tm.get(m) || 0) + 1); const h = evD[g[3]] < mid ? 0 : 1; byHalf[h][0]++; byHalf[h][1] += won; }
  // the same players' record in their games WITHOUT this Pokémon: if they win as much without it, it's the players
  let wo = 0, woW = 0; for (const g of G) for (const [t, p, won] of [[g[0], g[4], g[2]], [g[1], g[5], 1 - g[2]]]) { if (!pl.has(p) || teams[t].includes(mon)) continue; wo++; woW += won; }
  console.log(mon, 'same players without it:', (100 * woW / Math.max(1, wo)).toFixed(1) + '% of ' + wo + ' games');
  const top = [...pl.values()].sort((a, b) => b[0] - a[0]), top5 = top.slice(0, 5).reduce((a, x) => a + x[0], 0);
  console.log(JSON.stringify({mon, games: n, winPct: +(100 * w / n).toFixed(1), players: pl.size, events: ev.size, top5PlayersShareOfGames: Math.round(100 * top5 / n) + '%',
    avgPilotRecord: +(100 * ownStrength / n).toFixed(1), avgOpponentRecord: +(100 * oppStrength / n).toFixed(1), firstHalfWin: +(100 * byHalf[0][1] / Math.max(1, byHalf[0][0])).toFixed(1) + '% of ' + byHalf[0][0],
    secondHalfWin: +(100 * byHalf[1][1] / Math.max(1, byHalf[1][0])).toFixed(1) + '% of ' + byHalf[1][0], modelStrength: model.mons[mon], usualTeammates: [...tm].sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0])})); }
