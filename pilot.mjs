// The "same players without it" test, for every Pokémon with enough tournament games: how often players win WITH it,
// and how often those very same players win in their games WITHOUT it. A big gap means the Pokémon itself is winning
// games, not just being picked by strong players. model.mjs ships it in out/model.json as `pilot`, which the page
// already receives every day. Run on its own (node pilot.mjs) to add it to the current out/model.json.
import fs from 'node:fs';
// Paired (Oct 28 audit): each player is compared with themselves in the same 3-week window, and weighted by
// min(games with, games without) in that window. The old pooled version let high-volume players dominate the "without"
// side and mixed early-season games (before players got better) with later ones. Only windows where a player ran the
// Pokémon AND something else count. Output shape unchanged: [games with it, win % with it, games without it, win % without
// it, players], all from the paired windows; Pokémon need minPlayers players with paired windows.
export function pilotTest(M, minGames = 150, minPlayers = 100) {
  const teams = M.teams.map(k => k.split('|')), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
  const day = i => Date.parse((M.events[i] || [])[1] || '2026-01-01') / 864e5, win = g => Math.floor(day(g[3]) / 21);
  // every player's games, as [team, won, window]
  const byP = new Map(); for (const g of G) for (const [t, p, won] of [[g[0], g[4], g[2]], [g[1], g[5], 1 - g[2]]]) { let a = byP.get(p); if (!a) byP.set(p, a = []); a.push([t, won, win(g)]); }
  const users = new Map(); // mon -> Set of players who ran it
  for (const [p, games] of byP) for (const [t] of games) for (const m of teams[t]) { let s = users.get(m); if (!s) users.set(m, s = new Set()); s.add(p); }
  const out = {};
  for (const [m, ps] of users) { if (ps.size < minPlayers) continue; let W = 0, sw = 0, so = 0, gW = 0, gO = 0, np = 0;
    for (const p of ps) { const by = new Map(); for (const [t, won, w] of byP.get(p)) { let c = by.get(w); if (!c) by.set(w, c = [0, 0, 0, 0]); if (teams[t].includes(m)) { c[0]++; c[1] += won; } else { c[2]++; c[3] += won; } }
      let paired = false; for (const [n1, w1, n0, w0] of by.values()) if (n1 && n0) { const k = Math.min(n1, n0); W += k; sw += k * w1 / n1; so += k * w0 / n0; gW += n1; gO += n0; paired = true; }
      if (paired) np++; }
    if (np < minPlayers || gW < minGames || gO < minGames || !W) continue;
    out[m] = [gW, +(100 * sw / W).toFixed(1), gO, +(100 * so / W).toFixed(1), np]; }
  return out; }
if (process.argv[1] && process.argv[1].endsWith('pilot.mjs')) {
  const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8')), model = JSON.parse(fs.readFileSync('out/model.json', 'utf8'));
  model.pilot = pilotTest(M); fs.writeFileSync('out/model.json', JSON.stringify(model)); console.log(`pilot test: ${Object.keys(model.pilot).length} Pokémon added to out/model.json`); }
