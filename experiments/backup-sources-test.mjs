// Fixture-based tests (no network, fake handles only) for Job 17 backup data sources.
// S7: every check fails on base 39ce8205 (no sources/*.mjs or update.mjs wiring) and passes after patch.
// Usage: node experiments/backup-sources-test.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {primaryStatus, isDuplicateEvent, fetchBackupEvents} from '../sources/fallback.mjs';
import {victoryRoadAdapter} from '../sources/victoryroad.mjs';
import {showdownOtsAdapter} from '../sources/showdown-ots.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const FIX = JSON.parse(fs.readFileSync(ROOT + 'experiments/fixtures/backup-sources.json', 'utf8'));

function mockFetch(url) {
  const u = String(url);
  const ok = body => Promise.resolve({ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body)});
  if (u.includes('victoryroad.pro/wp-json/wp/v2/pages?search=')) return ok(FIX.vrPagesList);
  const slugM = u.match(/victoryroad\.pro\/wp-json\/wp\/v2\/pages\?slug=([^&]+)/);
  if (slugM) return ok(FIX.vrPagesBySlug[decodeURIComponent(slugM[1])] || []);
  const pasteM = u.match(/vrpaste-backend\.vercel\.app\/api\/paste\/([^?]+)/);
  if (pasteM) return ok(FIX.vrPastes[decodeURIComponent(pasteM[1])] || null);
  if (u.includes('replay.pokemonshowdown.com/search.json')) return ok(FIX.sdSearch);
  const repM = u.match(/replay\.pokemonshowdown\.com\/([^/]+)\.json$/);
  if (repM) return ok(FIX.sdReplays[decodeURIComponent(repM[1])] || null);
  return Promise.resolve({ok: false, status: 404, json: async () => ({})});
}

let passed = 0;
async function test(name, fn) {
  await fn();
  console.log(`PASS  ${name}`);
  passed++;
}

// 1. Primary down / empty / stale detection (matches md-watch.mjs 2-day alarm)
await test('1. primaryStatus detects down, empty, stale (>=2d), and ok (<=1d)', async () => {
  const idxFresh = {tournaments: {a: {d: '2026-11-23T12:00:00Z', f: 'M-C'}}};
  const idxStale = {tournaments: {a: {d: '2026-11-21T12:00:00Z', f: 'M-C'}}};
  assert.equal(primaryStatus({list: null, index: idxFresh, format: 'M-C', today: '2026-11-24'}).reason, 'down');
  assert.equal(primaryStatus({list: [], index: idxFresh, format: 'M-C', today: '2026-11-24'}).reason, 'empty');
  assert.equal(primaryStatus({list: [{id: 'x'}], index: idxStale, format: 'M-C', today: '2026-11-24'}).reason, 'stale');
  assert.equal(primaryStatus({list: [{id: 'x'}], index: idxFresh, format: 'M-C', today: '2026-11-24'}).ok, true);
});

// 2. Victory Road adapter: exact update.mjs shapes + regulation filter
await test('2. victoryRoadAdapter returns update.mjs shapes and excludes Reg M-D when active is M-C', async () => {
  const list = await victoryRoadAdapter.listTournaments({format: 'M-C', fetchFn: mockFetch, season: 2027});
  assert.equal(list.length, 2, 'should include the 2 M-C regionals and exclude M-D');
  assert.ok(list.every(t => t.format === 'M-C' && t.id.startsWith('vr_')));
  const sample = list.find(t => t.id === 'vr_2027-sample-city-regional');
  assert.ok(sample);
  const standings = await victoryRoadAdapter.getStandings(sample, {fetchFn: mockFetch});
  assert.equal(standings.length, 2);
  assert.equal(standings[0].placing, 1);
  assert.deepEqual(standings[0].record, {wins: 14, losses: 2, ties: 0});
  assert.equal(standings[0].decklist.length, 6);
  assert.equal(standings[0].decklist[0].attacks.length, 4);
  const pairings = await victoryRoadAdapter.getPairings(sample);
  assert.deepEqual(pairings, []);
});

// 3. Showdown OTS adapter: daily buckets + full team sheets + pairings + regulation filter
await test('3. showdownOtsAdapter builds daily buckets with full team sheets, pairings, and no reg mixing', async () => {
  const list = await showdownOtsAdapter.listTournaments({format: 'M-C', sdFormat: 'gen9championsvgc2026regmc', fetchFn: mockFetch});
  assert.equal(list.length, 1, 'should group the 2 M-C replays into 1 day and exclude the M-D replay');
  const dayEv = list[0];
  assert.ok(dayEv.id.startsWith('sd_gen9championsvgc2026regmcbo3_'));
  assert.equal(dayEv.players, 3);
  const standings = await showdownOtsAdapter.getStandings(dayEv, {fetchFn: mockFetch});
  assert.equal(standings.length, 3);
  assert.ok(standings.every(s => s.decklist.length === 6));
  const p2 = standings.find(s => s.player === 'PlayerTwo');
  assert.deepEqual(p2.record, {wins: 1, losses: 1, ties: 0});
  const pairings = await showdownOtsAdapter.getPairings(dayEv);
  assert.equal(pairings.length, 2);
  assert.equal(pairings[0].winner, 'PlayerOne');
  assert.equal(pairings[1].winner, 'PlayerTwo');
});

// 4. Deduplication without double counting (same Regional already in Limitless index)
await test('4. isDuplicateEvent prevents double counting an event already indexed from Limitless', async () => {
  const existingIndex = {
    tournaments: {
      '6abc1234': {d: '2026-11-15T00:00:00Z', p: 600, name: '2027 Harbor Town Regional Championships', f: 'M-C'},
    },
  };
  assert.equal(isDuplicateEvent({id: 'vr_2027-already-indexed-regional', date: '2026-11-14T12:00:00.000Z', name: '2027 Harbor Town Pokémon Regional Championships'}, existingIndex), true);
  assert.equal(isDuplicateEvent({id: 'vr_2027-sample-city-regional', date: '2026-11-21T12:00:00.000Z', name: '2027 Sample City Pokémon Regional Championships'}, existingIndex), false);
});

// 5. End-to-end fallback coordinator + regulation end-date enforcement (REG_END['M-C'])
await test('5. fetchBackupEvents deduplicates, enforces REG_END, and merges both adapters cleanly', async () => {
  const existingIndex = {
    tournaments: {
      '6abc1234': {d: '2026-11-15T00:00:00Z', p: 600, name: '2027 Harbor Town Regional Championships', f: 'M-C'},
    },
  };
  const postEndAdapter = {
    name: 'post-end-fake',
    listTournaments: async () => [{id: 'fake_dec3', date: '2026-12-03T12:00:00Z', players: 100, name: 'Dec 3 Cup', format: 'M-C'}],
    getStandings: async () => [{player: 'FakeP', placing: 1, record: {wins: 3, losses: 0}, decklist: []}],
  };
  const bk = await fetchBackupEvents({
    format: 'M-C',
    sdFormat: 'gen9championsvgc2026regmc',
    index: existingIndex,
    adapters: [victoryRoadAdapter, showdownOtsAdapter, postEndAdapter],
    fetchFn: mockFetch,
    log: () => {},
  });
  // Harbor Town deduplicated; Future City (M-D) excluded; Dec 3 Cup (past REG_END['M-C']) excluded
  assert.equal(bk.tournaments.length, 2);
  assert.ok(bk.tournaments.some(t => t.id === 'vr_2027-sample-city-regional'));
  assert.ok(bk.tournaments.some(t => t.id.startsWith('sd_')));
  assert.ok(!bk.tournaments.some(t => t.id === 'vr_2027-already-indexed-regional'));
  assert.ok(!bk.tournaments.some(t => t.id === 'fake_dec3'));
});

// 6. update.mjs wiring: OFF by default, politeFetch used, pid() hashing preserved
await test('6. update.mjs backup switch is OFF by default and adapters use politeFetch', async () => {
  const upd = fs.readFileSync(ROOT + 'update.mjs', 'utf8');
  assert.ok(upd.includes("USE_BACKUPS = process.env.BACKUP_SOURCES === '1'"));
  assert.ok(upd.includes('fetchBackupEvents('));
  assert.ok(upd.includes('pid(x.player'));
  const vr = fs.readFileSync(ROOT + 'sources/victoryroad.mjs', 'utf8');
  const sd = fs.readFileSync(ROOT + 'sources/showdown-ots.mjs', 'utf8');
  assert.ok(vr.includes("from '../http.mjs'") && vr.includes('politeFetch'));
  assert.ok(sd.includes("from '../http.mjs'") && sd.includes('politeFetch'));
});

console.log(`\n${passed}/6 passed (backup-sources-test)`);
