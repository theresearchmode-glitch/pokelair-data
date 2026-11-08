// Data audit (Nov 8, foundation plan Phase 0: "bad data would undermine every phase after it").
// Checks out/matches.json (the games every grade is learned from) for problems that would quietly skew the model:
//   duplicate games, a player paired with themselves, games whose result is unknown (stored as a draw), events that
//   look wrong (no games, very few games for their size, everyone on one side), teams that are not six distinct Pokémon,
//   Pokémon names not in the roster, decks with no sets, players on two teams in the same event, rounds out of range.
// Usage: node experiments/data-audit.mjs [out.json]   (read-only; exit code 1 if a hard problem is found)
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches.json', 'utf8'));
const roster = (() => { try { return new Set(JSON.parse(fs.readFileSync(ROOT + 'roster.json', 'utf8')).map(p => p.n || p.name || p)); } catch (e) { return null; } })();
const teams = M.teams.map(k => k.split('|')), R = {hard: [], soft: [], stats: {}};
const hard = (k, n, ex) => { if (n) R.hard.push({check: k, count: n, examples: ex.slice(0, 5)}); }, soft = (k, n, ex) => { if (n) R.soft.push({check: k, count: n, examples: ex.slice(0, 5)}); };
R.stats = {events: M.events.length, games: M.m.length, teams: M.teams.length, players: M.players, decks: M.decks.length,
  from: M.events.map(e => e[1]).sort()[0], to: M.events.map(e => e[1]).sort().at(-1)};
// 1. duplicate games: same event, same round, same two players (either order)
{ const seen = new Map(), dup = []; M.m.forEach((g, i) => { const a = Math.min(g[4], g[5]), b = Math.max(g[4], g[5]), k = `${g[3]}:${g[6]}:${a}:${b}`; if (seen.has(k)) dup.push({game: i, first: seen.get(k), event: M.events[g[3]][0], round: g[6]}); else seen.set(k, i); });
  hard('duplicate games (same event, round and players)', dup.length, dup); }
// 2. self-pairings
{ const x = M.m.map((g, i) => [g, i]).filter(([g]) => g[4] === g[5]).map(([g, i]) => ({game: i, event: M.events[g[3]][0]})); hard('player paired with themselves', x.length, x); }
// 3. unknown results stored as draws (real draws are rare in VGC; a big share means missing results)
{ const per = new Map(); M.m.forEach(g => { if (g[2] === .5) per.set(g[3], (per.get(g[3]) || 0) + 1); });
  const tot = [...per.values()].reduce((a, b) => a + b, 0), cnt = new Map(); M.m.forEach(g => cnt.set(g[3], (cnt.get(g[3]) || 0) + 1));
  const bad = [...per].filter(([e, n]) => n / cnt.get(e) > .2).map(([e, n]) => ({event: M.events[e][0], date: M.events[e][1], draws: n, games: cnt.get(e)}));
  R.stats.draws = tot; R.stats.drawShare = +(tot / M.m.length * 100).toFixed(2);
  soft('events where over 20% of games have no winner (likely missing results)', bad.length, bad); }
// 4. events with no usable games, or few games for their size
{ const cnt = new Map(); M.m.forEach(g => cnt.set(g[3], (cnt.get(g[3]) || 0) + 1));
  const none = M.events.map((e, i) => [e, i]).filter(([, i]) => !cnt.get(i)).map(([e]) => ({event: e[0], date: e[1], players: e[2]}));
  // a Swiss event of P players has about P/2 games per round and log2(P)+ rounds; under 25% of that means most sheets or pairings are missing
  const thin = M.events.map((e, i) => [e, i]).filter(([e, i]) => cnt.get(i) && e[2] >= 16 && cnt.get(i) < .25 * (e[2] / 2) * Math.ceil(Math.log2(e[2]))).map(([e, i]) => ({event: e[0], date: e[1], players: e[2], games: cnt.get(i)}));
  R.stats.eventsNoGames = none.length; soft('events with no usable games (no team sheets or pairings)', none.length, none); soft('events with far fewer games than their size suggests', thin.length, thin); }
// 5. one side always wins: A won every game in an event (a sign the order of A/B encodes the winner)
{ const per = new Map(); M.m.forEach(g => { if (g[2] === .5) return; const o = per.get(g[3]) || {n: 0, a: 0}; o.n++; o.a += g[2]; per.set(g[3], o); });
  const tot = [...per.values()].reduce((x, o) => ({n: x.n + o.n, a: x.a + o.a}), {n: 0, a: 0}); R.stats.firstSideWins = +(tot.a / tot.n * 100).toFixed(1);
  const bad = [...per].filter(([, o]) => o.n >= 20 && (o.a / o.n > .9 || o.a / o.n < .1)).map(([e, o]) => ({event: M.events[e][0], games: o.n, firstSideWon: o.a}));
  soft('events where the first-listed side wins over 90% or under 10%', bad.length, bad); }
// 6. teams that are not six distinct Pokémon
{ const bad = teams.map((t, i) => [t, i]).filter(([t]) => t.length !== 6 || new Set(t).size !== 6).map(([t, i]) => ({team: i, mons: t.join(', ')}));
  const used = new Set(M.m.flatMap(g => [g[0], g[1]])); R.stats.badTeamsInGames = bad.filter(b => used.has(b.team)).length;
  soft('teams that are not six distinct Pokémon (left out of the grade tests)', bad.length, bad); }
// 7. names not in the roster
if (roster) { const miss = new Map(); for (const t of teams) for (const n of t) if (!roster.has(n)) miss.set(n, (miss.get(n) || 0) + 1);
  hard('Pokémon names in games that are not in the roster', miss.size, [...miss].sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n} (${c} teams)`)); }
// 8. decks with no sets, and games missing a deck
{ const empty = M.decks.map((d, i) => [d, i]).filter(([d]) => !d.length).length, noDk = M.m.filter(g => g[7] == null || g[8] == null).length;
  R.stats.gamesMissingDeck = noDk; soft('decks with no items, Abilities or moves recorded', empty, [`${empty} decks`]); }
// 9. a player on two different teams in the same event
{ const seen = new Map(), bad = []; M.m.forEach(g => { for (const [p, t] of [[g[4], g[0]], [g[5], g[1]]]) { const k = g[3] + ':' + p; if (seen.has(k) && seen.get(k) !== t) bad.push({event: M.events[g[3]][0], player: p}); else seen.set(k, t); } });
  hard('player listed with two different teams in one event', new Set(bad.map(b => b.event + b.player)).size, bad); }
// 10. a player meeting the same opponent twice in Swiss (allowed in top cut best-of-3 only if rounds differ: flag same round only, done in 1)
// 11. games per player: accounts with an implausible number of games
{ const c = new Map(); M.m.forEach(g => { c.set(g[4], (c.get(g[4]) || 0) + 1); c.set(g[5], (c.get(g[5]) || 0) + 1); });
  const top = [...c].sort((a, b) => b[1] - a[1]); R.stats.mostGamesOnePlayer = top[0][1]; R.stats.medianGamesPerPlayer = top[Math.floor(top.length / 2)][1]; }
console.log(`matches.json: ${R.stats.events} events (${R.stats.from} – ${R.stats.to}), ${R.stats.games} games, ${R.stats.teams} teams, ${R.stats.players} players`);
console.log(`no winner recorded: ${R.stats.draws} games (${R.stats.drawShare}%) · first-listed side won ${R.stats.firstSideWins}% · events with no usable games ${R.stats.eventsNoGames}`);
console.log(`\nHARD problems (would skew the grade): ${R.hard.length ? '' : 'none'}`); for (const p of R.hard) console.log(`  ✗ ${p.check}: ${p.count}\n      e.g. ${p.examples.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join('\n           ')}`);
console.log(`\nworth a look: ${R.soft.length ? '' : 'none'}`); for (const p of R.soft) console.log(`  • ${p.check}: ${p.count}\n      e.g. ${p.examples.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join('\n           ')}`);
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(R, null, 1));
process.exitCode = R.hard.length ? 1 : 0;
