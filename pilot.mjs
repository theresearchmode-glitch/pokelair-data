// The "same players without it" test, for every Pokémon with enough tournament games: how often players win WITH it,
// and how often those very same players win in their games WITHOUT it. A big gap means the Pokémon itself is winning
// games, not just being picked by strong players. model.mjs ships it in out/model.json as `pilot`, which the page
// already receives every day. Run on its own (node pilot.mjs) to add it to the current out/model.json.
import fs from 'node:fs';
export function pilotTest(M, minGames = 150) {
  const teams = M.teams.map(k => k.split('|')), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
  // every player's games, as [team, won]
  const byP = new Map(); for (const g of G) for (const [t, p, won] of [[g[0], g[4], g[2]], [g[1], g[5], 1 - g[2]]]) { let a = byP.get(p); if (!a) byP.set(p, a = []); a.push([t, won]); }
  const withS = new Map(); // mon -> {n, w, players:Set}
  for (const [p, games] of byP) for (const [t, won] of games) for (const m of teams[t]) { let s = withS.get(m); if (!s) withS.set(m, s = {n: 0, w: 0, players: new Set()}); s.n++; s.w += won; s.players.add(p); }
  const out = {};
  for (const [m, s] of withS) { if (s.n < minGames || s.players.size < 20) continue; let n = 0, w = 0;
    for (const p of s.players) for (const [t, won] of byP.get(p)) if (!teams[t].includes(m)) { n++; w += won; }
    if (n < minGames) continue;
    // [games with it, win % with it, games without it (same players), win % without it, players]
    out[m] = [s.n, +(100 * s.w / s.n).toFixed(1), n, +(100 * w / n).toFixed(1), s.players.size]; }
  return out; }
if (process.argv[1] && process.argv[1].endsWith('pilot.mjs')) {
  const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8')), model = JSON.parse(fs.readFileSync('out/model.json', 'utf8'));
  model.pilot = pilotTest(M); fs.writeFileSync('out/model.json', JSON.stringify(model)); console.log(`pilot test: ${Object.keys(model.pilot).length} Pokémon added to out/model.json`); }
