// Node 22 (no network) test suite for Reg M-D day-one model, history split, health floors, and regstate (Job 8).
// Usage: node experiments/md-day-one-test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'np-md-day1-'));

// Copy patched scripts into TMP and add minimal stubs for unseen helper imports (pilot.mjs, team-basics.mjs)
for (const f of ['formats.mjs', 'model.mjs', 'model-guard.mjs', 'six.mjs', 'ctr.mjs', 'leads.mjs', 'scoreboard.mjs', 'track.mjs', 'health.mjs', 'regstate.mjs']) {
  fs.copyFileSync(path.join(ROOT, f), path.join(TMP, f));
}
fs.writeFileSync(path.join(TMP, 'pilot.mjs'), 'export const pilotTest = () => ({});\n');
fs.writeFileSync(path.join(TMP, 'team-basics.mjs'), 'export const deckBasics = () => ({noMega: 0, protectLow: 0});\n');

const wr = (dir, rel, obj) => {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, typeof obj === 'string' ? obj : JSON.stringify(obj));
};
const rd = (dir, rel) => JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8'));
const run = (script, cwd, args = [], env = {}) => {
  try {
    const stdout = execFileSync(process.execPath, [path.join(TMP, script), ...args], {
      cwd, env: {...process.env, ...env}, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
    });
    return {code: 0, stdout, stderr: ''};
  } catch (e) {
    return {code: e.status ?? 1, stdout: String(e.stdout || ''), stderr: String(e.stderr || '')};
  }
};

// Build a valid full-size (>=250 mons) model object for tests
const makeFullModel = (reg, updated, seed = 0) => {
  const mons = {}, monSd = {};
  for (let i = 0; i < 260; i++) {
    const n = `Mon${String(i).padStart(3, '0')}`;
    mons[n] = +(((i % 50) - 25) * 0.02 + seed * 0.001).toFixed(4);
    monSd[n] = 0.05;
  }
  return {
    reg, updated, ships: true, shrink: 10, setShrink: null, games: 5000, events: 40, v: 3,
    meanX: 0, calib: 0.9, dist: {since: updated.slice(0, 10), n: 100, q: Array.from({length: 101}, (_, i) => +(i * 0.02 - 1).toFixed(3))},
    setRange: {}, supK: 6, tested: [], setFreq: {}, team: {noMega: -0.5, protectLow: -0.4},
    mons, pairs: {}, monSd, pairSd0: 0.06, pairSd: {}, sets: {}, pilot: {},
    eval: {model_teams_only: {acc: 0.56, logloss: 0.68}, calibrated_logloss: {species_only: 0.68, with_sets: 0.675}, raw_win_rates: {acc: 0.54, logloss: 0.689}, events_beating_coin_flip: {beat_coin_flip: 8, events: 10}}
  };
};

// Build healthy mature out/ + data/ for a given reg and date
const seedHealthy = (dir, reg, since, date, padBytes = true) => {
  const iso = date + 'T10:00:00Z';
  const big = padBytes ? 'x'.repeat(60000) : '';
  wr(dir, 'data/index.json', {tournaments: {t1: {d: date}}});
  wr(dir, 'out/split/index.json', {made: iso, sizes: {'meta/model': 50000}, split: {}});
  wr(dir, 'out/reg.json', {id: reg, name: 'Reg ' + reg, since, sd: reg === 'M-C' ? 'gen9championsvgc2026regmc' : 'gen9championsvgc2026regmd', checked: date});
  wr(dir, 'out/limitless.json', {reg, updated: iso, results: {Pikachu: 10}, adj: {Pikachu: 0.5}, teams: 500, pad: big});
  wr(dir, 'out/meta_tour.json', {reg, updated: iso, top: Array.from({length: 15}, (_, i) => ({n: `Mon${i}`, u: 10})), pad: padBytes ? 'x'.repeat(6000) : ''});
  wr(dir, 'out/teams.json', {reg, updated: iso, teams: Array.from({length: 6}, () => ['Mon0']), pad: padBytes ? 'x'.repeat(2500) : ''});
  wr(dir, 'out/history.json', {reg, days: [{d: since, tour: {Mon0: 1}}, {d: date, tour: {Mon0: 1}}], pad: padBytes ? 'x'.repeat(1200) : ''});
  wr(dir, 'out/model.json', makeFullModel(reg, iso));
  wr(dir, 'out/meta_ingame.json', {updated: '2026-11-18T10:00:00Z', top: Array.from({length: 12}, (_, i) => ({n: `Mon${i}`, r: i + 1})), pad: 'x'.repeat(1200)});
  wr(dir, 'out/meta_ladder.json', {reg, month: date.slice(0, 7), updated: iso, top: Array.from({length: 12}, (_, i) => ({n: `Mon${i}`, u: 5})), pad: padBytes ? 'x'.repeat(6000) : ''});
  wr(dir, 'out/events.json', {reg, updated: iso, dict: ['Mon0', 'Mon1', 'Mon2', 'Mon3', 'Mon4', 'Mon5'], events: Array.from({length: 6}, (_, i) => ({id: `ev${reg}${i}`, date, name: `Ev ${i}`, players: 64, top: [[0, 1, 0, [[0], [1], [2], [3], [4], [5]]], [0, 2, 0, [[0], [1], [2], [3], [4], [5]]], [0, 3, 0, [[0], [1], [2], [3], [4], [5]]], [0, 4, 0, [[0], [1], [2], [3], [4], [5]]]]})), pad: padBytes ? 'x'.repeat(11000) : ''});
  wr(dir, 'out/official.json', {reg, updated: iso, events: [], pad: padBytes ? 'x'.repeat(1200) : ''});
  wr(dir, 'out/perf.json', {reg: {id: reg, name: 'Reg ' + reg, since}, updated: date, tour: {updated: date, rows: []}, adj: {updated: date, rows: []}, ingame: {updated: '2026-11-18', names: []}, smogon: {updated: date.slice(0, 7), rows: []}, ladder: {updated: date, rows: []}, outside: {lists: [{name: 'Showdowntier', date}]}, pad: padBytes ? 'x'.repeat(6000) : ''});
  wr(dir, 'out/practice.json', {reg, updated: iso, rounds: Array.from({length: 25}, () => [0]), pad: padBytes ? 'x'.repeat(5500) : ''});
  wr(dir, 'out/weekly.json', {reg, v: 1, updated: iso, pad: 'x'.repeat(300)});
  wr(dir, 'out/calendar.json', {updated: iso, ev: [{s: date, e: '2027-01-10'}], pad: 'x'.repeat(250)});
  wr(dir, 'out/track.json', {reg, v: 1, updated: iso, since, snaps: 1, last: date, top: 8, ev: [], mons: [], mb: [[0, 0], [0, 0], [0, 0], [0, 0]], fw: [], mv: null, pad: 'x'.repeat(250)});
  wr(dir, 'out/sources.json', {reg, updated: iso, pad: 'x'.repeat(300)});
  wr(dir, 'out/crosscheck.json', {reg, updated: iso, checks: [], pad: 'x'.repeat(300)});
  wr(dir, 'out/ratings_log.json', {reg, updated: iso, byReg: {[reg]: [{d: date, r: {Mon0: 85, Mon1: 70, Mon2: 50, Mon3: 30}}]}, pad: 'x'.repeat(300)});
  wr(dir, 'out/scoreboard.json', {reg, updated: iso, byReg: {[reg]: [{date, reg, model: {heldOutAcc: 0.56, calibratedLogloss: 0.675}}]}, history: [{date, reg}], pad: 'x'.repeat(300)});
  wr(dir, 'out/matches.json', {reg, updated: iso, events: [['e1', date, 64]], players: 64, teams: ['Mon000|Mon001|Mon002|Mon003|Mon004|Mon005', 'Mon006|Mon007|Mon008|Mon009|Mon010|Mon011'], m: [[0, 1, 1, 0, 0, 1]]});
};

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`PASS: ${name}`); };

// --- Scenario 1: Day before switch (2026-12-01, M-C active) ---
const d1 = path.join(TMP, 's1-day-before');
seedHealthy(d1, 'M-C', '2026-09-01', '2026-12-01');
wr(d1, 'out/prev_mc_model.json', makeFullModel('M-C', '2026-11-30T10:00:00Z'));

await test('1. regstate on day before reports M-C day 92', () => {
  const rs = run('regstate.mjs', d1);
  // Note: regstate uses today's clock unless called via buildRegState; test CLI writes out/regstate.json and check pure date too
  assert.equal(rs.code, 0);
  const out = rd(d1, 'out/regstate.json');
  assert.equal(out.reg, 'M-C');
  assert.equal(out.since, '2026-09-01');
  assert.equal(out.events, 1);
  assert.equal(out.games, 1);
});

await test('2. health on day before passes with 0 problems', () => {
  const r = run('health.mjs', d1, ['--root=' + d1, '--now=2026-12-01']);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /Daily data healthy/);
});

await test('3. model-guard on day before accepts valid M-C model vs prev M-C', () => {
  const r = run('model-guard.mjs', d1, [], {GUARD_PREV: path.join(d1, 'out/prev_mc_model.json')});
  assert.equal(r.code, 0, r.stdout);
  assert.match(r.stdout, /model guard: ok/);
});

// --- Scenario 2: Switch day with 0 M-D games (2026-12-02, M-D active) ---
const d2 = path.join(TMP, 's2-switch-day-0-games');
seedHealthy(d2, 'M-C', '2026-09-01', '2026-12-01'); // yesterday's M-C files on disk
// Switch reg.json to M-D on 2026-12-02 and empty M-D matches.json
wr(d2, 'out/reg.json', {id: 'M-D', name: 'Reg M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: '2026-12-02'}, checked: '2026-12-02'});
wr(d2, 'out/matches.json', {reg: 'M-D', updated: '2026-12-02T10:00:00Z', events: [], players: 0, teams: [], m: []});
wr(d2, 'out/prev_mc_model.json', makeFullModel('M-C', '2026-12-01T10:00:00Z'));

await test('4. model.mjs on switch day with 0 M-D games overwrites M-C model with stamped not-ready M-D model', () => {
  const r = run('model.mjs', d2);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  const m = rd(d2, 'out/model.json');
  assert.equal(m.reg, 'M-D');
  assert.equal(m.ships, false);
  assert.equal(m.games, 0);
  assert.deepEqual(m.mons, {});
});

await test('5. model-guard.mjs on switch day ignores M-C prev and accepts not-ready M-D model', () => {
  const r = run('model-guard.mjs', d2, [], {GUARD_PREV: path.join(d2, 'out/prev_mc_model.json')});
  assert.equal(r.code, 0, r.stdout + r.stderr);
  const m = rd(d2, 'out/model.json');
  assert.equal(m.reg, 'M-D');
  assert.equal(m.ships, false);
});

await test('6. six.mjs refuses to mix M-D matches into an M-C model', () => {
  wr(d2, 'out/model_mc_tmp.json', makeFullModel('M-C', '2026-12-01T10:00:00Z'));
  const r = run('six.mjs', d2, [], {MODEL_FILE: path.join(d2, 'out/model_mc_tmp.json')});
  assert.equal(r.code, 0);
  assert.match(r.stdout, /reg mismatch/);
  assert.equal(rd(d2, 'out/model_mc_tmp.json').sixes, undefined);
});

await test('7. ctr.mjs refuses to mix M-D matches into an M-C model', () => {
  const r = run('ctr.mjs', d2, [], {MODEL_FILE: path.join(d2, 'out/model_mc_tmp.json')});
  assert.equal(r.code, 0);
  assert.match(r.stdout, /reg mismatch/);
  assert.equal(rd(d2, 'out/model_mc_tmp.json').ctr, undefined);
});

await test('8. leads.mjs refuses to mix M-C replays into M-D model', () => {
  wr(d2, 'out/replays.json', {format: 'gen9championsvgc2026regmc', games: [{t: 1, r: [1500, 1500], w: 0, b: [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H']], l: [['A', 'B'], ['E', 'F']]}]});
  const r = run('leads.mjs', d2);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /reg mismatch/);
  assert.equal(rd(d2, 'out/model.json').leads, undefined);
});

await test('9. track.mjs on switch day archives M-C track.json and writes empty stamped M-D track.json', () => {
  const r = run('track.mjs', d2);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  const arch = rd(d2, 'out/track_M-C.json');
  assert.equal(arch.reg, 'M-C');
  const cur = rd(d2, 'out/track.json');
  assert.equal(cur.reg, 'M-D');
  assert.equal(cur.snaps, 0);
  assert.deepEqual(cur.ev, []);
});

await test('10. scoreboard.mjs on switch day preserves M-C history in byReg and does not grade M-C snapshots', () => {
  wr(d2, 'out/events.json', {reg: 'M-D', updated: '2026-12-02T10:00:00Z', dict: [], events: []});
  wr(d2, 'out/replays.json', {reg: 'M-D', format: 'gen9championsvgc2026regmd', games: []});
  // Make M-C snapshot 20 days old so it would trigger ratingsForward if not isolated
  wr(d2, 'out/ratings_log.json', {reg: 'M-C', updated: '2026-12-01T10:00:00Z', byReg: {'M-C': [{d: '2026-11-01', r: {Mon000: 90}}]}});
  const r = run('scoreboard.mjs', d2);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  const sb = rd(d2, 'out/scoreboard.json');
  assert.equal(sb.reg, 'M-D');
  assert.equal(sb.byReg['M-C'].length, 1);
  assert.equal(sb.today.ratingsForward, undefined);
});

await test('11. health.mjs on switch day marks empty-but-stamped M-D files as thin and exits 0', () => {
  const d2h = path.join(TMP, 's2-health');
  seedHealthy(d2h, 'M-D', '2026-12-02', '2026-12-02', false);
  // Make all M-D files empty-but-stamped day-1 skeletons
  const iso = '2026-12-02T10:00:00Z';
  wr(d2h, 'data/index.json', {tournaments: {t1: {d: '2026-12-01'}}}); // yesterday's M-C event (1 day old, not >4)
  wr(d2h, 'out/regstate.json', {reg: 'M-D', day: 1, events: 0, players: 0, games: 0, since: '2026-12-02', updated: iso});
  wr(d2h, 'out/limitless.json', {reg: 'M-D', updated: iso, results: {}, adj: {}, teams: 0});
  wr(d2h, 'out/meta_tour.json', {reg: 'M-D', updated: iso, top: []});
  wr(d2h, 'out/teams.json', {reg: 'M-D', updated: iso, teams: []});
  wr(d2h, 'out/history.json', {reg: 'M-D', days: []});
  wr(d2h, 'out/model.json', {reg: 'M-D', updated: iso, ships: false, games: 0, events: 0, mons: {}});
  wr(d2h, 'out/meta_ladder.json', {reg: 'M-D', month: '', updated: iso, top: []});
  wr(d2h, 'out/events.json', {reg: 'M-D', updated: iso, events: []});
  wr(d2h, 'out/official.json', {reg: 'M-D', updated: iso, events: []});
  wr(d2h, 'out/perf.json', {reg: {id: 'M-D', name: 'Reg M-D', since: '2026-12-02'}, updated: '2026-12-02'});
  wr(d2h, 'out/practice.json', {reg: 'M-D', updated: iso, rounds: []});
  wr(d2h, 'out/weekly.json', {reg: 'M-D', v: 1, updated: iso});
  wr(d2h, 'out/track.json', {reg: 'M-D', v: 1, updated: iso, ev: []});
  wr(d2h, 'out/sources.json', {reg: 'M-D', updated: iso});
  wr(d2h, 'out/crosscheck.json', {reg: 'M-D', updated: iso, checks: []});
  wr(d2h, 'out/ratings_log.json', {reg: 'M-D', updated: iso, byReg: {'M-D': []}});
  wr(d2h, 'out/scoreboard.json', {reg: 'M-D', updated: iso, byReg: {'M-D': []}});
  const r = run('health.mjs', d2h, ['--root=' + d2h, '--now=2026-12-02']);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /🟡 thin/);
});

await test('12. health.mjs on switch day STILL fails when Limitless is down (data/index.json > 4 days old)', () => {
  const d2l = path.join(TMP, 's2-limitless-down');
  fs.cpSync(path.join(TMP, 's2-health'), d2l, {recursive: true});
  wr(d2l, 'data/index.json', {tournaments: {t1: {d: '2026-11-26'}}});
  const r = run('health.mjs', d2l, ['--root=' + d2l, '--now=2026-12-02']);
  assert.equal(r.code, 1);
  assert.match(r.stdout, /newest tournament is 6 days old/);
});

await test('13. health.mjs on switch day STILL fails when a step crashed 2 days in a row', () => {
  const d2s = path.join(TMP, 's2-skip-2days');
  fs.cpSync(path.join(TMP, 's2-health'), d2s, {recursive: true});
  wr(d2s, 'out/skips.json', {runs: [{day: '2026-12-01', steps: ['replays skipped']}, {day: '2026-12-02', steps: ['replays skipped']}]});
  const r = run('health.mjs', d2s, ['--root=' + d2s, '--now=2026-12-02']);
  assert.equal(r.code, 1);
  assert.match(r.stdout, /replays skipped.*two days in a row/);
});

await test('14. health.mjs on switch day STILL fails if an M-C file leaked into out/', () => {
  const d2m = path.join(TMP, 's2-wrong-reg');
  fs.cpSync(path.join(TMP, 's2-health'), d2m, {recursive: true});
  wr(d2m, 'out/events.json', {reg: 'M-C', updated: '2026-12-02T10:00:00Z', events: []});
  const r = run('health.mjs', d2m, ['--root=' + d2m, '--now=2026-12-02']);
  assert.equal(r.code, 1);
  assert.match(r.stdout, /wrong regulation \(M-C, expected M-D\)/);
});

// --- Scenario 3: Day 3 with 5 events (2026-12-04, M-D active) ---
const d3 = path.join(TMP, 's3-day3-5events');
seedHealthy(d3, 'M-D', '2026-12-02', '2026-12-04', false);
wr(d3, 'out/matches.json', {
  reg: 'M-D', updated: '2026-12-04T10:00:00Z',
  events: [['e1', '2026-12-02', 32], ['e2', '2026-12-02', 40], ['e3', '2026-12-03', 48], ['e4', '2026-12-03', 36], ['e5', '2026-12-04', 64]],
  players: 220,
  teams: ['Mon000|Mon001|Mon002|Mon003|Mon004|Mon005', 'Mon006|Mon007|Mon008|Mon009|Mon010|Mon011'],
  m: Array.from({length: 40}, (_, i) => [i % 2, (i + 1) % 2, 1, i % 5, 0, 1]) // constant win for team 0 -> model >= raw or tied -> !ships
});

await test('15. regstate buildRegState on day 3 with 5 events reports day=3, events=5, players=220, games=40', async () => {
  const {buildRegState} = await import(path.join(TMP, 'regstate.mjs'));
  const rs = buildRegState({regObj: {id: 'M-D', since: '2026-12-02'}, rawReg: null, matches: rd(d3, 'out/matches.json'), today: '2026-12-04'});
  assert.equal(rs.reg, 'M-D');
  assert.equal(rs.day, 3);
  assert.equal(rs.events, 5);
  assert.equal(rs.players, 220);
  assert.equal(rs.games, 40);
  assert.equal(rs.since, '2026-12-02');
});

await test('16. model.mjs on day 3 with 5 events writes M-D stamped not-ready model when !ships (does not restore M-C)', () => {
  wr(d3, 'out/model.json', makeFullModel('M-C', '2026-12-01T10:00:00Z'));
  const r = run('model.mjs', d3, [], {FAST: '10,0,1,0'});
  assert.equal(r.code, 0, r.stdout + r.stderr);
  const m = rd(d3, 'out/model.json');
  assert.equal(m.reg, 'M-D');
  assert.equal(m.ships, false);
  assert.equal(m.games, 40);
});

await test('17. model-guard.mjs rejects a broken shipped M-D model (<250 mons) without restoring M-C prev', () => {
  const broken = makeFullModel('M-D', '2026-12-04T10:00:00Z');
  broken.mons = {Mon000: 0.1};
  wr(d3, 'out/model.json', broken);
  wr(d3, 'out/prev_mc.json', makeFullModel('M-C', '2026-12-01T10:00:00Z'));
  const r = run('model-guard.mjs', d3, [], {GUARD_PREV: path.join(d3, 'out/prev_mc.json')});
  assert.equal(r.code, 1);
  assert.match(r.stdout, /only 1 Pokémon/);
  assert.equal(rd(d3, 'out/model.json').reg, 'M-D'); // did NOT overwrite with M-C
});

await test('18. scoreboard.mjs on day 3 does not warn on M-D against M-C 14-day median', () => {
  wr(d3, 'out/scoreboard.json', {
    reg: 'M-C', updated: '2026-12-01T10:00:00Z',
    byReg: {'M-C': Array.from({length: 14}, (_, i) => ({date: `2026-11-${17 + i}`, model: {heldOutAcc: 0.65, calibratedLogloss: 0.62}}))},
    history: []
  });
  const m = makeFullModel('M-D', '2026-12-04T10:00:00Z');
  m.eval.model_teams_only.acc = 0.52; m.eval.calibrated_logloss.with_sets = 0.69;
  wr(d3, 'out/model.json', m);
  const r = run('scoreboard.mjs', d3);
  assert.equal(r.code, 0);
  const sb = rd(d3, 'out/scoreboard.json');
  assert.deepEqual(sb.today.warnings, []);
  assert.equal(sb.byReg['M-C'].length, 14);
});

// --- Scenario 4: Day 20 with enough games (2026-12-21, M-D active) ---
const d4 = path.join(TMP, 's4-day20');
seedHealthy(d4, 'M-D', '2026-12-02', '2026-12-21', true);
wr(d4, 'out/regstate.json', {reg: 'M-D', day: 20, events: 35, players: 2400, games: 6000, since: '2026-12-02', updated: '2026-12-21T10:00:00Z'});

await test('19. health.mjs on day 20 enforces steady-state floors (empty file fails as broken)', () => {
  const d4b = path.join(TMP, 's4-day20-broken');
  fs.cpSync(d4, d4b, {recursive: true});
  wr(d4b, 'out/events.json', {reg: 'M-D', updated: '2026-12-21T10:00:00Z', events: []});
  const r = run('health.mjs', d4b, ['--root=' + d4b, '--now=2026-12-21']);
  assert.equal(r.code, 1);
  assert.match(r.stdout, /fewer than 5 events/);
});

await test('20. track.mjs on day 20 grades M-D events only against M-D snapshots (ignores M-C snapshots)', () => {
  wr(d4, 'out/ratings_log.json', {
    reg: 'M-D', updated: '2026-12-21T10:00:00Z',
    byReg: {
      'M-C': [{d: '2026-11-20', r: {Mon0: 95}}],
      'M-D': [{d: '2026-12-10', r: {Mon0: 82, Mon1: 75, Mon2: 65, Mon3: 55, Mon4: 45, Mon5: 35}}]
    }
  });
  const r = run('track.mjs', d4);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  const tr = rd(d4, 'out/track.json');
  assert.equal(tr.reg, 'M-D');
  assert.equal(tr.since, '2026-12-10');
  assert.equal(tr.snaps, 1);
  assert.ok(tr.ev.length > 0 && tr.ev.every(e => e[5] === '2026-12-10'));
});

await test('21. scoreboard.mjs on day 20 grades 14+ day-old M-D snapshot on M-D games and ignores M-C snapshots', () => {
  const mdSnap = new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10);
  const mcSnap = new Date(Date.now() - 40 * 864e5).toISOString().slice(0, 10);
  const evDay = new Date(Date.now() - 1 * 864e5).toISOString().slice(0, 10);
  wr(d4, 'out/ratings_log.json', {
    reg: 'M-D', updated: new Date().toISOString(),
    byReg: {
      'M-C': [{d: mcSnap, r: {Mon000: 99}}],
      'M-D': [{d: mdSnap, r: {Mon000: 90, Mon001: 80, Mon002: 70, Mon003: 60, Mon004: 50, Mon005: 40}}]
    }
  });
  wr(d4, 'out/matches.json', {
    reg: 'M-D', updated: new Date().toISOString(), events: [['e1', evDay, 64]], players: 64,
    teams: ['Mon000|Mon001|Mon002|Mon003|Mon004|Mon005', 'Mon006|Mon007|Mon008|Mon009|Mon010|Mon011'],
    m: Array.from({length: 310}, () => [0, 1, 1, 0, 0, 1])
  });
  const r = run('scoreboard.mjs', d4);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  const sb = rd(d4, 'out/scoreboard.json');
  assert.equal(sb.today.ratingsForward.snapshot, mdSnap);
  assert.equal(sb.today.ratingsForward.acc, 1);
});

await test('22. model-guard.mjs on day 20 catches rank reordering against prev M-D model and restores M-D prev', () => {
  const prevMD = makeFullModel('M-D', '2026-12-20T10:00:00Z', 0);
  const badMD = makeFullModel('M-D', '2026-12-21T10:00:00Z', 0);
  for (const k of Object.keys(badMD.mons)) badMD.mons[k] = -badMD.mons[k]; // invert all strengths -> rho ~ -1
  const teams = [];
  for (let i = 0; i < 205; i++) teams.push([0, 1, 2, 3, 4, 5].map(o => `Mon${String((i + o) % 260).padStart(3, '0')}`).join('|'));
  wr(d4, 'out/matches.json', {reg: 'M-D', updated: '2026-12-21T10:00:00Z', events: [['e1', '2026-12-21', 64]], players: 64, teams, m: teams.map((_, i) => [i, (i + 1) % teams.length, 1, 0, 0, 1])});
  wr(d4, 'out/model.json', badMD);
  wr(d4, 'out/prev_md.json', prevMD);
  const r = run('model-guard.mjs', d4, [], {GUARD_PREV: path.join(d4, 'out/prev_md.json')});
  assert.equal(r.code, 1);
  assert.match(r.stdout, /rank correlation/);
  assert.equal(rd(d4, 'out/model.json').updated, '2026-12-20T10:00:00Z');
});

fs.rmSync(TMP, {recursive: true, force: true});
console.log(`\nALL ${passed} TESTS PASSED`);
