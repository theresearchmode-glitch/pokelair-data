// quiet-launch-alarms-test.mjs (Kip job 44, Nov 26): tests for md-watch.mjs and health.mjs on quiet launch days
// with a faked clock (no network calls).
//   1. md-watch.mjs uses regAt(): an event still tagged M-C after REG_END['M-C'] (Dec 2 01:59Z) is spotted as M-D;
//      one before 01:59Z is not.
//   2. md-watch.mjs quiet day vs real outage:
//      - API answers HTTP 200 with no event newer than data/index.json (or empty index + empty API) -> NOT paused.
//      - API errors (HTTP 503) -> paused.
//      - API has a newer active/next-reg event that data/index.json missed for 2+ days -> paused.
//      - Corrupt/unreadable data/index.json -> paused.
//   3. health.mjs quiet launch day vs real outage:
//      - Launch window (day 5 of M-D), fresh out/limitless.json, newest index event 5 days old (or empty index) -> PASS (exit 0).
//      - Launch window, stale out/limitless.json (real API outage) -> FAIL (exit 1).
//      - Steady state (day 19 of M-D, past launch window), newest index event >4 days old -> FAIL (exit 1).
//      - Launch window, corrupt data/index.json -> FAIL (exit 1).
// Run: node experiments/quiet-launch-alarms-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'quiet-alarms-'));
let fails = 0;
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };

// Preload hook for md-watch.mjs: fakes Date/Date.now, intercepts fetch() offline, and skips the 10 s retry sleep.
const preloadPath = path.join(tmp, 'preload.mjs');
fs.writeFileSync(preloadPath, `
const fakeNow = Date.parse(process.env.FAKE_NOW);
const RealDate = Date;
class FakeDate extends RealDate {
  constructor(...a) { super(...(a.length ? a : [fakeNow])); }
  static now() { return fakeNow; }
}
globalThis.Date = FakeDate;
const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = (fn, ms, ...a) => realSetTimeout(fn, ms >= 5000 ? 1 : ms, ...a);
const limMode = process.env.FAKE_LIMITLESS_MODE || 'ok';
const limBody = process.env.FAKE_LIMITLESS_JSON || '[]';
globalThis.fetch = async url => {
  const u = String(url);
  if (u.includes('limitlesstcg.com')) {
    if (limMode === '503') return {ok: false, status: 503, json: async () => ({}), text: async () => 'down'};
    return {ok: true, status: 200, json: async () => JSON.parse(limBody), text: async () => limBody};
  }
  return {ok: true, status: 200, json: async () => ({list: []}), text: async () => ''};
};
`);
const preloadUrl = pathToFileURL(preloadPath).href;

const wr = (dir, rel, obj) => {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, typeof obj === 'string' ? obj : JSON.stringify(obj));
};

const runWatch = ({nowIso, regId, since, indexData, apiList, apiMode = 'ok'}) => {
  const dir = fs.mkdtempSync(path.join(tmp, 'watch-'));
  const rep = path.join(dir, 'report.json');
  const idx = path.join(dir, 'data/index.json');
  wr(dir, 'out/reg.json', {id: regId, name: 'Reg ' + regId, since, sd: regId === 'M-C' ? 'gen9championsvgc2026regmc' : 'gen9championsvgc2026regmd', checked: nowIso.slice(0, 10)});
  if (indexData !== null) wr(dir, 'data/index.json', indexData);
  const r = spawnSync(process.execPath, ['--import', preloadUrl, path.join(ROOT, 'md-watch.mjs')], {
    cwd: dir,
    encoding: 'utf8',
    env: {
      ...process.env,
      FAKE_NOW: nowIso,
      FAKE_LIMITLESS_MODE: apiMode,
      FAKE_LIMITLESS_JSON: JSON.stringify(apiList || []),
      WATCH_INDEX: idx,
      WATCH_REPORT: rep,
      WATCH_FAKE_FOUND: 'showdown,news'
    }
  });
  return {status: r.status, stdout: r.stdout, stderr: r.stderr, report: fs.existsSync(rep) ? JSON.parse(fs.readFileSync(rep, 'utf8')) : null};
};

// --- 1. md-watch.mjs regAt (LOW-1) ---
{
  const r = runWatch({
    nowIso: '2026-12-03T12:00:00Z', regId: 'M-C', since: '2026-09-01',
    indexData: {tournaments: {t1: {d: '2026-12-02T03:00:00Z', p: 32, f: 'M-C'}}},
    apiList: [{id: 't1', name: 'Dec 2 Open', format: 'M-C', date: '2026-12-02T03:00:00.000Z', players: 32}]
  });
  const spottedLim = !!(r.report && r.report.spotted.some(s => s.where === 'Limitless'));
  ok(r.status === 0 && spottedLim, `1a. md-watch spots M-C event after Dec 2 01:59Z as M-D via regAt (spotted=${r.report && r.report.spotted.map(s => s.where).join(',')})`);
}
{
  const r = runWatch({
    nowIso: '2026-12-01T22:00:00Z', regId: 'M-C', since: '2026-09-01',
    indexData: {tournaments: {t0: {d: '2026-12-01T20:00:00Z', p: 32, f: 'M-C'}}},
    apiList: [{id: 't0', name: 'Dec 1 Open', format: 'M-C', date: '2026-12-01T20:00:00.000Z', players: 32}]
  });
  const spottedLim = !!(r.report && r.report.spotted.some(s => s.where === 'Limitless'));
  ok(r.status === 0 && !spottedLim, `1b. md-watch does NOT spot M-C event before Dec 2 01:59Z as M-D (spotted=${r.report && r.report.spotted.map(s => s.where).join(',')})`);
}

// --- 2. md-watch.mjs quiet days vs real outage ---
{
  const r = runWatch({
    nowIso: '2026-12-06T12:00:00Z', regId: 'M-D', since: '2026-12-02',
    indexData: {tournaments: {t0: {d: '2026-12-01T20:00:00Z', p: 32, f: 'M-C'}}},
    apiList: [{id: 't0', name: 'Dec 1 Open', format: 'M-C', date: '2026-12-01T20:00:00.000Z', players: 32}]
  });
  ok(r.status === 0 && r.report && r.report.paused === null, `2a. md-watch quiet launch day (API 200, no event newer than index) is NOT paused (paused=${Boolean(r.report && r.report.paused)})`);
}
{
  const r = runWatch({
    nowIso: '2026-12-06T12:00:00Z', regId: 'M-D', since: '2026-12-02',
    indexData: {tournaments: {}},
    apiList: []
  });
  ok(r.status === 0 && r.report && r.report.paused === null, `2b. md-watch quiet launch day (empty index + API 200 []) is NOT paused (paused=${Boolean(r.report && r.report.paused)})`);
}
{
  const r = runWatch({
    nowIso: '2026-12-06T12:00:00Z', regId: 'M-D', since: '2026-12-02',
    indexData: {tournaments: {t0: {d: '2026-12-05T20:00:00Z', p: 32, f: 'M-D'}}},
    apiList: [], apiMode: '503'
  });
  ok(r.status === 0 && r.report && r.report.paused !== null, `2c. md-watch real API outage (HTTP 503) STILL alarms (paused=${Boolean(r.report && r.report.paused)})`);
}
{
  const r = runWatch({
    nowIso: '2026-12-06T12:00:00Z', regId: 'M-D', since: '2026-12-02',
    indexData: {tournaments: {t0: {d: '2026-12-01T20:00:00Z', p: 32, f: 'M-C'}}},
    apiList: [{id: 't9', name: 'Dec 5 M-D', format: 'M-D', date: '2026-12-05T18:00:00.000Z', players: 64}]
  });
  ok(r.status === 0 && r.report && r.report.paused !== null, `2d. md-watch real ingest stall (API has Dec 5 M-D event, index stuck at Dec 1) STILL alarms (paused=${Boolean(r.report && r.report.paused)})`);
}
{
  const r = runWatch({
    nowIso: '2026-12-06T12:00:00Z', regId: 'M-D', since: '2026-12-02',
    indexData: '{corrupt',
    apiList: []
  });
  ok(r.status === 0 && r.report && r.report.paused !== null, `2e. md-watch corrupt data/index.json STILL alarms (paused=${Boolean(r.report && r.report.paused)})`);
}

// --- 3. health.mjs quiet launch day vs real outage ---
const seedHealth = (dir, {reg, since, date, day, limitlessUpdated, apiOk = true, indexData, full = false}) => {
  const iso = date + 'T10:00:00Z';
  const big = full ? 'x'.repeat(60000) : '';
  wr(dir, 'data/index.json', indexData);
  wr(dir, 'out/split/index.json', {made: iso, sizes: {'meta/model': 50000}, split: {}});
  wr(dir, 'out/reg.json', {id: reg, name: 'Reg ' + reg, since, sd: 'gen9championsvgc2026regmd', checked: date});
  wr(dir, 'out/regstate.json', {reg, day, events: full ? 25 : 0, players: full ? 1500 : 0, games: full ? 5000 : 0, since, updated: iso});
  wr(dir, 'out/limitless.json', {reg, updated: limitlessUpdated || iso, ...(apiOk ? {apiOk: true} : {}), results: full ? {Pikachu: 10} : {}, adj: full ? {Pikachu: 0.5} : {}, teams: full ? 500 : 0, pad: big});
  wr(dir, 'out/meta_tour.json', {reg, updated: iso, top: full ? Array.from({length: 12}, (_, i) => ({n: 'M' + i, u: 10})) : [], pad: full ? 'x'.repeat(6000) : ''});
  wr(dir, 'out/info.json', {reg, updated: iso, N: full ? 500 : 0, mv: full ? {Protect: 'x'.repeat(1200)} : {}});
  wr(dir, 'out/teams.json', {reg, updated: iso, teams: full ? Array.from({length: 6}, () => ['M0']) : [], pad: full ? 'x'.repeat(2500) : ''});
  wr(dir, 'out/history.json', {reg, updated: iso, days: full ? [{d: since, tour: {M0: 1}}, {d: date, tour: {M0: 1}}] : [], pad: full ? 'x'.repeat(1200) : ''});
  wr(dir, 'out/matches.json', {reg, updated: iso, m: full ? ['x'.repeat(6000)] : []});
  wr(dir, 'out/model.json', {reg, updated: iso, ships: full, mons: full ? {M0: 0.1} : {}, pad: full ? 'x'.repeat(6000) : 'x'.repeat(100)});
  wr(dir, 'out/meta_ingame.json', {updated: '2026-11-18T10:00:00Z', top: [], pad: 'x'.repeat(100)});
  wr(dir, 'out/meta_ladder.json', {reg, updated: iso, top: []});
  wr(dir, 'out/events.json', {reg, updated: iso, events: full ? Array.from({length: 6}, (_, i) => ({id: i, pad: 'x'.repeat(2000)})) : []});
  wr(dir, 'out/official.json', {reg, updated: iso, events: [], pad: full ? 'x'.repeat(1200) : ''});
  wr(dir, 'out/perf.json', {reg: {id: reg, name: 'Reg ' + reg, since}, updated: date, tour: {updated: date, rows: full ? ['x'.repeat(6000)] : []}, adj: {updated: date, rows: []}, ladder: {updated: date, rows: []}, outside: {lists: [{name: 'L1', date}]}});
  wr(dir, 'out/practice.json', {reg, updated: iso, rounds: full ? Array.from({length: 22}, (_, i) => [i, 'x'.repeat(300)]) : []});
  wr(dir, 'out/weekly.json', {reg, v: 1, updated: iso, pad: 'x'.repeat(300)});
  wr(dir, 'out/calendar.json', {checked: date, ev: [{s: date, e: '2027-01-10'}], pad: 'x'.repeat(250)});
  wr(dir, 'out/track.json', {reg, v: 1, updated: iso, pad: 'x'.repeat(250)});
  wr(dir, 'out/sources.json', {reg, updated: iso, problems: [], pad: 'x'.repeat(300)});
  wr(dir, 'out/crosscheck.json', {reg, updated: iso, checks: [], pad: 'x'.repeat(300)});
  wr(dir, 'out/ratings_log.json', {reg, updated: iso, byReg: {[reg]: [{d: date, r: {M0: 80}}]}, pad: 'x'.repeat(300)});
  wr(dir, 'out/scoreboard.json', {reg, updated: iso, byReg: {}, pad: 'x'.repeat(300)});
};

const runHealth = (dir, nowDate) => spawnSync(process.execPath, [path.join(ROOT, 'health.mjs'), `--root=${dir}`, `--now=${nowDate}`], {cwd: ROOT, encoding: 'utf8'});

{
  const d = fs.mkdtempSync(path.join(tmp, 'h3a-'));
  seedHealth(d, {reg: 'M-D', since: '2026-12-02', date: '2026-12-06', day: 5, indexData: {tournaments: {t0: {d: '2026-12-01'}}}});
  const r = runHealth(d, '2026-12-06');
  ok(r.status === 0 && /::warning::.*newest tournament/.test(r.stdout), `3a. health quiet launch day (day 5, fresh limitless.json, last event 5d old) passes with warning (exit=${r.status})`);
}
{
  const d = fs.mkdtempSync(path.join(tmp, 'h3b-'));
  seedHealth(d, {reg: 'M-D', since: '2026-12-02', date: '2026-12-06', day: 5, indexData: {tournaments: {}}});
  const r = runHealth(d, '2026-12-06');
  ok(r.status === 0, `3b. health quiet launch day (day 5, fresh limitless.json, empty index) passes (exit=${r.status})`);
}
{
  const d = fs.mkdtempSync(path.join(tmp, 'h3c-'));
  seedHealth(d, {reg: 'M-D', since: '2026-12-02', date: '2026-12-06', day: 5, limitlessUpdated: '2026-12-02T10:00:00Z', indexData: {tournaments: {t0: {d: '2026-12-01'}}}});
  const r = runHealth(d, '2026-12-06');
  ok(r.status === 1 && /Limitless tournaments: data from 2026-12-02/.test(r.stdout), `3c. health real API outage during launch (stale limitless.json) STILL fails (exit=${r.status})`);
}
{
  const d = fs.mkdtempSync(path.join(tmp, 'h3d-'));
  seedHealth(d, {reg: 'M-D', since: '2026-12-02', date: '2026-12-20', day: 19, full: true, indexData: {tournaments: {t0: {d: '2026-12-10'}}}});
  const r = runHealth(d, '2026-12-20');
  ok(r.status === 1 && /Limitless: newest tournament is 10 days old/.test(r.stdout), `3d. health steady state (day 19, newest event 10d old > 4d) STILL fails (exit=${r.status})`);
}
{
  const d = fs.mkdtempSync(path.join(tmp, 'h3e-'));
  seedHealth(d, {reg: 'M-D', since: '2026-12-02', date: '2026-12-06', day: 5, indexData: '{corrupt'});
  const r = runHealth(d, '2026-12-06');
  ok(r.status === 1 && /unreadable/.test(r.stdout), `3e. health corrupt data/index.json during launch STILL fails (exit=${r.status})`);
}
{
  const d = fs.mkdtempSync(path.join(tmp, 'h3f-'));
  seedHealth(d, {reg: 'M-D', since: '2026-12-02', date: '2026-12-06', day: 5, apiOk: false, indexData: {tournaments: {t0: {d: '2026-12-01'}}}});
  const r = runHealth(d, '2026-12-06');
  ok(r.status === 1 && /newest tournament is 5 days old/.test(r.stdout), `3f. health launch day WITHOUT apiOk: true in limitless.json STILL fails (exit=${r.status})`);
}

fs.rmSync(tmp, {recursive: true, force: true});
console.log(fails ? `quiet-launch-alarms-test: ${fails} FAILED` : 'quiet-launch-alarms-test: ALL PASSED');
process.exit(fails ? 1 : 0);
