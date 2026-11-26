// News freshness test for health.mjs (Job 46, Nov 25).
// Verifies health.mjs dates out/post.json by `ran` (falling back to `updated`, never `checked`):
//   1. Old `checked` (2026-11-18) + fresh `ran` (2026-11-26) with post-news.mjs present -> PASS (exit 0)
//   2. Fresh `checked` (2026-11-26) + old `ran` (2026-11-20) with post-news.mjs present -> FAIL (exit 1, stale)
//   3. Missing `ran` + fresh `updated` (2026-11-26) + old `checked` -> PASS (exit 0)
//   4. Missing `post-news.mjs` (main before Saturday's merge) -> PASS (exit 0, noAgeCheck safe alone)
// Run: node experiments/news-freshness-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0;
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'news-fresh-'));
fs.copyFileSync(path.join(ROOT, 'health.mjs'), path.join(tmp, 'health.mjs'));
fs.mkdirSync(path.join(tmp, 'out/split'), {recursive: true});
fs.mkdirSync(path.join(tmp, 'data'), {recursive: true});

const NOW = '2026-11-26';
const TS = '2026-11-26T09:07:00.000Z';
const pad = n => 'x'.repeat(n);

fs.writeFileSync(path.join(tmp, 'data/index.json'), JSON.stringify({tournaments: {t1: {d: TS, p: 64, f: 'M-C'}}}));
const files = {
  'reg.json': {id: 'M-C', since: '2026-09-01', sd: 'gen9championsvgc2026regmc', checked: NOW},
  'regstate.json': {reg: 'M-C', day: 87, events: 100, players: 5000, games: 20000, since: '2026-09-01', updated: TS},
  'limitless.json': {reg: 'M-C', updated: TS, teams: 500, adj: {rows: []}, results: {mons: {}, pad: pad(60000)}},
  'meta_tour.json': {reg: 'M-C', updated: TS, top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, pad: pad(500)}))},
  'info.json': {reg: 'M-C', updated: TS, N: 100, mv: {Protect: [100, pad(1500)]}},
  'teams.json': {reg: 'M-C', updated: TS, teams: Array.from({length: 6}, (_, i) => ({id: i, pad: pad(400)}))},
  'history.json': {reg: 'M-C', updated: TS, days: [{d: '2026-11-25', pad: pad(600)}, {d: NOW, pad: pad(600)}]},
  'matches.json': {reg: 'M-C', updated: TS, m: [pad(6000)]},
  'model.json': {reg: 'M-C', updated: TS, ships: true, mons: {Garchomp: 0.1}, pad: pad(6000)},
  'meta_ingame.json': {reg: 'M-C', updated: '2026-11-17T09:07:00Z', top: []},
  'meta_ladder.json': {reg: 'M-C', updated: TS, month: '2026-11', top: Array.from({length: 12}, (_, i) => ({n: 'M' + i, pad: pad(500)}))},
  'events.json': {reg: 'M-C', updated: TS, events: Array.from({length: 6}, (_, i) => ({id: i, pad: pad(2000)}))},
  'official.json': {reg: 'M-C', updated: TS, events: [{name: 'R1', pad: pad(1500)}]},
  'perf.json': {updated: NOW, reg: {id: 'M-C', name: 'Reg M-C', since: '2026-09-01'}, tour: {updated: NOW, rows: [pad(6000)]}, adj: {updated: NOW, rows: []}, smogon: {updated: '2026-11', rows: []}, ladder: {updated: NOW, rows: []}, outside: {lists: [{name: 'L1', date: NOW}]}},
  'practice.json': {reg: 'M-C', updated: TS, rounds: Array.from({length: 22}, (_, i) => [i, pad(300)])},
  'weekly.json': {reg: 'M-C', v: 1, updated: TS, pad: pad(300)},
  'calendar.json': {checked: NOW, ev: [{n: 'Regional', s: '2026-12-05', e: '2026-12-06', pad: pad(300)}]},
  'track.json': {reg: 'M-C', v: 1, updated: TS, pad: pad(300)},
  'sources.json': {reg: 'M-C', updated: TS, problems: [], pad: pad(300)},
  'crosscheck.json': {reg: 'M-C', updated: TS, checks: [], pad: pad(300)},
  'ratings_log.json': {reg: 'M-C', updated: TS, byReg: {'M-C': [{d: NOW, r: {Garchomp: 90}}]}, pad: pad(300)},
  'scoreboard.json': {reg: 'M-C', updated: TS, byReg: {}, pad: pad(300)},
  'split/index.json': {made: TS, sizes: {}, split: {}}
};
for (const [f, obj] of Object.entries(files)) fs.writeFileSync(path.join(tmp, 'out', f), JSON.stringify(obj));

const runHealth = postObj => {
  fs.writeFileSync(path.join(tmp, 'out/post.json'), JSON.stringify(postObj));
  return spawnSync(process.execPath, [path.join(tmp, 'health.mjs'), `--root=${tmp}`, `--now=${NOW}`], {cwd: tmp, encoding: 'utf8'});
};

// With post-news.mjs present (post-Saturday merged state)
fs.writeFileSync(path.join(tmp, 'post-news.mjs'), '// present\n');

{
  const r = runHealth({checked: '2026-11-18T02:21:50Z', ran: TS, gifts: [], series: [], held: [], news: [{id: 'n1'}]});
  ok(r.status === 0, `1. old checked + fresh ran passes health.mjs (exit=${r.status})`);
}
{
  const r = runHealth({checked: TS, ran: '2026-11-20T09:07:00.000Z', gifts: [], series: [], held: [], news: [{id: 'n1'}]});
  ok(r.status === 1 && /News & Mystery Gifts: data from 2026-11-20/.test(r.stdout), `2. fresh checked + old ran fails health.mjs as stale (exit=${r.status})`);
}
{
  const r = runHealth({checked: '2026-11-18T02:21:50Z', updated: TS, gifts: [], series: [], held: [], news: [{id: 'n1'}]});
  ok(r.status === 0, `3. missing ran + fresh updated + old checked passes health.mjs (exit=${r.status})`);
}

// Without post-news.mjs (main before Saturday's merge)
fs.unlinkSync(path.join(tmp, 'post-news.mjs'));
{
  const r = runHealth({checked: '2026-11-18T02:21:50Z', gifts: [], series: [], held: [], news: [{id: 'n1'}]});
  ok(r.status === 0, `4. without post-news.mjs (main today), old checked without ran still passes (exit=${r.status})`);
}

fs.rmSync(tmp, {recursive: true, force: true});
console.log(fails ? `news-freshness-test: ${fails} FAILED` : 'news-freshness-test: ALL PASSED');
process.exit(fails ? 1 : 0);
