// Checks replays.mjs's log parser on a sample in Showdown's battle protocol: node experiments/replays-test.mjs
import {parseLog} from '../replays.mjs';
const log = `|j|☆Alice
|j|☆Bob
|gametype|doubles
|player|p1|Alice|60|1534
|player|p2|Bob|265|1611
|teamsize|p1|6
|teamsize|p2|6
|gen|9
|tier|[Gen 9 Champions] VGC 2026 Reg M-C
|rated|
|clearpoke
|poke|p1|Incineroar, L50, M|
|poke|p1|Rillaboom, L50, M|
|poke|p1|Salamence, L50, F|
|poke|p1|Primarina, L50, F|
|poke|p1|Farigiraf, L50, M|
|poke|p1|Indeedee-F, L50, F|
|poke|p2|Kingambit, L50, M|
|poke|p2|Charizard, L50, M|
|poke|p2|Whimsicott, L50, F|
|poke|p2|Garchomp, L50, F|
|poke|p2|Sneasler, L50, M|
|poke|p2|Tauros-Paldea-Combat, L50, M|
|teampreview|4
|
|start
|switch|p1a: Incy|Incineroar, L50, M|100/100
|switch|p1b: Sala|Salamence, L50, F|100/100
|switch|p2a: Whimsicott|Whimsicott, L50, F|100/100
|switch|p2b: Charizard|Charizard, L50, M|100/100
|turn|1
|detailschange|p1b: Sala|Salamence-Mega, L50, F
|-mega|p1b: Sala|Salamence|Salamencite
|detailschange|p2b: Charizard|Charizard-Mega-Y, L50, M
|move|p1a: Incy|Fake Out|p2a: Whimsicott
|faint|p2a: Whimsicott
|switch|p2a: Kingambit|Kingambit, L50, M|100/100
|turn|2
|switch|p1a: Prim|Primarina, L50, F|100/100
|turn|3
|faint|p2b: Charizard
|switch|p2b: Sneasler|Sneasler, L50, M|100/100
|switch|p1b: Sala|Salamence-Mega, L50, F|40/100
|switch|p1a: Faris|Farigiraf, L50, M|100/100
|turn|4
|win|Alice`;
const g = parseLog(log), ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
console.log(JSON.stringify(g));
ok(g && g.w === 0, 'winner is p1 (Alice)');
ok(g.p[0].length === 6 && g.p[0].includes('Salamence-Mega') && !g.p[0].includes('Salamence'), 'p1 team lists the Mega that Mega Evolved');
ok(g.p[1].includes('Charizard-Mega-Y') && g.p[1].includes('Tauros-Paldea-Combat'), 'p2 team: Mega Charizard Y, Paldean Tauros');
ok(JSON.stringify(g.l[0]) === JSON.stringify(['Incineroar', 'Salamence-Mega']) && JSON.stringify(g.l[1]) === JSON.stringify(['Whimsicott', 'Charizard-Mega-Y']), 'leads read from before turn 1');
ok(g.b[0].length === 4 && g.b[0].includes('Primarina') && g.b[0].includes('Farigiraf') && !g.b[0].includes('Rillaboom'), 'p1 brought four (a Mega re-entering counts once)');
ok(g.b[1].length === 4 && g.b[1].includes('Kingambit') && g.b[1].includes('Sneasler'), 'p2 brought four');
ok(JSON.stringify(g.r) === JSON.stringify([1534, 1611]), 'ratings');
ok(parseLog(log.replace('|gametype|doubles', '|gametype|singles')) === null, 'singles battles are skipped');
ok(parseLog(log.replace('|win|Alice', '')) === null, 'unfinished battles are skipped');
ok(parseLog(log.replace('Farigiraf, L50, M|', 'Missingno, L50|')) === null, 'teams with an unknown Pokémon are skipped');
