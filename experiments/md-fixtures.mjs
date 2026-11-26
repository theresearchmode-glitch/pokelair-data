// Fixture teams for Reg M-D day (reg-md-plan gap G11, Nov 24). Checks that read real tournament teams pass on nothing when a new
// regulation starts and out/ has no teams yet. withFixtures(docs) fills ONLY the team lists that are empty with the fixture teams
// (experiments/fixtures/md-teams.json: 12 real Reg M-C top-4 sheets + 2 made-up Mega Heatran teams), in each list's own shape, and
// prints one "fixture teams" line saying so. With today's data nothing is empty, so nothing changes and nothing is printed.
//   docs['meta/results'].records  [names, n, win rate, games]   (n / win rate / games are made-up, the same for every fixture team)
//   docs['meta/teams'].teams      {player, event, record, section, mons}   (player is "Fixture MC01": no real names)
//   docs['meta/events']           one Limitless-shaped event holding every fixture team, dict-encoded as out/events.json is
// A fixture team with a Pokémon the roster doesn't have (Heatran-Mega before the M-D data is in) is left out, and the line says so.
// Also: node experiments/md-fixtures.mjs --zero <out dir copy>   empties the team lists of an out/ copy (the M-D-day test).
import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const FIX = JSON.parse(fs.readFileSync(ROOT + 'experiments/fixtures/md-teams.json', 'utf8'));
const roster = () => { const s = fs.readFileSync(ROOT + 'app/src/data/data.js', 'utf8'); return new Set(JSON.parse(s.match(/const ROSTER=(\[[\s\S]*?\]);\n/)[1]).map(p => p.n)); };
const pick = () => { const have = roster(), use = FIX.teams.filter(t => t.mons.every(m => have.has(m.n))), skipped = FIX.teams.filter(t => !use.includes(t));
  return {use, note: skipped.length ? `; ${skipped.length} skipped (not in this roster: ${[...new Set(skipped.flatMap(t => t.mons.map(m => m.n).filter(n => !have.has(n))))].join(', ')})` : ''}; };
const say = (n, what, note) => console.log(`fixture teams: ${n} used (out/ has no real teams: ${what} empty), from experiments/fixtures/md-teams.json${note}`);
/* official.json (RK9 sheets, read directly by legality-check and threat-check): one fixture event when it has none */
export function withFixturesOfficial(O) { if (!O || (O.events || []).length) return O; const {use, note} = pick();
  O.events = [{name: 'Fixture teams (Reg M-D practice)', date: new Date(Date.now() - 864e5).toISOString().slice(0, 10), players: 64, teams: use.map((t, i) => ({player: 'Fixture ' + t.id, st: i + 1, mons: t.mons}))}];
  say(use.length, 'official.events', note); return O; }
/* matches.json decks (suggest-gaps reads real sheets from them) as 'Name@item', 'Name#Ability', 'Name:move' lists */
export function fixtureDecks() { const {use, note} = pick(); say(use.length, 'matches.decks', note);
  return use.map(t => t.mons.flatMap(m => [`${m.n}@${m.i}`, `${m.n}#${m.a}`, ...m.mv.map(x => `${m.n}:${x}`)])); }
export function withFixtures(docs, opts = {}) {
  const R = docs['meta/results'], T = docs['meta/teams'], E = docs['meta/events'], empty = [];
  if (R && !(R.records || []).length) empty.push('results.records'); if (T && !(T.teams || []).length) empty.push('teams.teams'); if (E && !(E.events || []).length) empty.push('events.events');
  if (!empty.length) return docs;
  const {use, note} = pick();
  const date = opts.date || new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (R && !(R.records || []).length) R.records = use.map(t => [t.mons.map(m => m.n), 20, 0.5, 40]);
  if (T && !(T.teams || []).length) T.teams = use.map((t, i) => ({player: 'Fixture ' + t.id, event: 'Fixture teams (Reg M-D practice)', record: '#' + (i + 1), section: 'Online tournaments', mons: t.mons.map(m => m.n)}));
  if (E && !(E.events || []).length) { const dict = [], ix = s => { let i = dict.indexOf(s); if (i < 0) { dict.push(s); i = dict.length - 1; } return i; };
    E.dict = dict; E.events = [{id: 'fixture-md', name: 'Fixture teams (Reg M-D practice)', date, players: 64, src: 'limitless', field: [],
      top: use.map((t, i) => ['Fixture ' + t.id, Math.min(i + 1, 16), '0-0', t.mons.map(m => [ix(m.n), ix(m.i), ix(m.a), ix(m.nt), m.mv.map(ix)])])}]; }
  say(use.length, empty.join(', '), note);
  return docs; }
if (process.argv[2] === '--zero') { const d = process.argv[3].replace(/\/?$/, '/'), rd = f => JSON.parse(fs.readFileSync(d + f, 'utf8')), wr = (f, v) => fs.writeFileSync(d + f, JSON.stringify(v));
  const L = rd('limitless.json'); L.results.records = []; L.results.proven = []; wr('limitless.json', L);
  const E = rd('events.json'); E.events = []; wr('events.json', E); const T = rd('teams.json'); T.teams = []; wr('teams.json', T);
  const M = rd('matches.json'); M.decks = []; M.m = []; wr('matches.json', M); const O = rd('official.json'); O.events = []; wr('official.json', O);
  console.log('emptied: limitless results.records + proven, events.events, teams.teams, matches.decks + m, official.events in ' + d); }
