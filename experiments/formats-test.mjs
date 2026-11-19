// Checks formats.mjs's themed-event filters (Nov 18 data audit, finding 3): the names of the themed cups that slipped through
// are left out, standard events with similar words are kept, and oddEvents now catches small restricted events (8-19 teams)
// by how rarely the most-used Pokémon appear, without flagging a small normal event. Exit 1 on failure.
// node experiments/formats-test.mjs
import {offFormat, oddEvents} from '../formats.mjs';
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
// real event names (Limitless, Sep-Nov 2026)
const themed = ['VGC UU Regulation M-C Weekly #1', 'VGC UU Regulation M-C "Houston Regional 2027"', 'VGC UU Regulation M-C Bi-Weekly #1',
  'Thalera Champions Cheese #17 - GEN 3 Edition', 'Outlanders Silver&Gold: Gen 2 Showdown', 'Single Type Cup Championships #1',
  'Thalera Champions Cheese #19 - POKÉMONAS', 'Thalera Champions Cheese #18 - Só Evos Especiais'];
const standard = ['Halloween Cup 🎃 | Champions M-C series', "Maddo's Cup #13 | 100€ for the Winner | Reg M-C", 'Friday Fight Night #74 Reg M-C Bo3',
  'Team Philippines @ VRWC 2026: Tryouts #1 🇵🇭 ONLY', 'X1 Remote Battle League 10ª Edição - Reg M-C', 'Gen 9 Showdown Weekly', 'Generation 10 Open',
  'Guru Cup', 'Thalera Champions Cheese #16', 'Pokemon Champions @ The Cafe #6', 'Mudkip\'s Marsh Pit #6', 'Copa Ranciarda III', 'Duumvirate Open'];
for (const n of themed) ok(offFormat(n), `left out by name: ${n}`);
for (const n of standard) ok(!offFormat(n), `kept: ${n}`);
ok(offFormat('Spooky Cup - $500 PRIZE POOL') && offFormat('Monotype Cup Championship'), 'the older words still match');
// oddEvents on a made-up field: 40 normal events of 24 teams built from a usual pool (staples on 30-60% of teams), one small
// normal event, one small event with no staples at all, one 12-team event with staples at a third of the usual rate
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const staples = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], share = [.6, .55, .5, .45, .4, .4, .35, .35, .3, .3], others = Array.from({length: 60}, (_, i) => 'x' + i);
const team = (k = 1) => { const s = new Set(); staples.forEach((x, i) => { if (s.size < 6 && rnd() < share[i] * k) s.add(x); }); while (s.size < 6) s.add(others[Math.floor(rnd() * others.length)]); return [...s]; };
const T = {}; const ev = (id, n, k) => { T[id] = {e: Array.from({length: n}, () => ['p', 3, 2, team(k)])}; };
for (let i = 0; i < 40; i++) ev('n' + i, 24, 1);
ev('small-normal', 9, 1); ev('small-themed', 10, 0); ev('third', 12, 1 / 3);
const logs = [], odd = oddEvents(Object.keys(T), id => T[id], m => logs.push(m));
ok(odd.has('small-themed'), 'a 10-team event with none of the usual Pokémon is left out (was skipped: under 20 teams)');
ok(odd.has('third'), 'a 12-team event where the usual Pokémon show up a third as often is left out');
ok(!odd.has('small-normal'), 'a 9-team normal event is kept');
ok([...odd].every(id => !/^n\d/.test(id)), `no normal 24-team event is flagged (${[...odd].filter(id => /^n\d/.test(id)).join(', ') || 'none'})`);
ok(logs.length === odd.size && logs.every(m => m.startsWith('::warning::left out event')), 'every left-out event is named in the log');
// tiny events (under 8 full teams) are never judged: too few teams to tell
T.tiny = {e: Array.from({length: 6}, () => ['p', 3, 2, ['y1', 'y2', 'y3', 'y4', 'y5', 'y6']])};
ok(!oddEvents(Object.keys(T), id => T[id], () => {}).has('tiny'), 'a 6-team event is not judged (too few teams to tell)');
console.log(`formats: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
