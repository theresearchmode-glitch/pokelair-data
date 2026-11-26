// Reg M-D switch-over data-job gap tests (Nov 25).
// Checks four gaps found in the Dec 1-2 switch-over audit:
//   1. reg-guard.mjs: empties stale regstate.json and model_shadow.json on switch day, and exempts
//      shadow_scoreboard.json, post.json and post-suggest.json (no false "unknown" files).
//   2. model.mjs (MODEL_SHADOW=1): on switch day (0 games / <5 events), replaces a stale M-C
//      out/model_shadow.json with a stamped not-ready M-D model_shadow.json; never overwrites a shipped same-reg one.
//   3. ratings-snapshot.mjs: on M-D day 1 with 0 tournament results (tc: null), does not save 346 stat-floor
//      placeholders into byReg['M-D'], while still updating reg and updated so health.mjs passes.
//   4. weekly.mjs and practice.mjs: on 0-event / 0-replay M-D launch days, refresh an empty (or wrong-reg)
//      file's updated timestamp so health.mjs does not fail as stale, while still protecting non-empty same-reg files.
// Run: node experiments/md-switch-data-gaps-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {guardOut} from '../reg-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); if (!cond) fails++; };

function makeTmp(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(dir, 'out'), {recursive: true});
  fs.mkdirSync(path.join(dir, 'data/t'), {recursive: true});
  fs.mkdirSync(path.join(dir, 'data/t2'), {recursive: true});
  for (const f of ['formats.mjs', 'reg-stamp.mjs', 'reg-guard.mjs', 'model.mjs', 'pilot.mjs', 'team-basics.mjs', 'weekly.mjs', 'practice.mjs', 'ratings-snapshot.mjs', 'names.mjs', 'regulation.json', 'roster.json', 'model-settings.json']) {
    if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  }
  if (fs.existsSync(path.join(ROOT, 'data/regmc-items.txt'))) {
    fs.copyFileSync(path.join(ROOT, 'data/regmc-items.txt'), path.join(dir, 'data/regmc-items.txt'));
  }
  fs.symlinkSync(path.join(ROOT, 'app'), path.join(dir, 'app'));
  if (fs.existsSync(path.join(ROOT, 'node_modules'))) {
    fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(dir, 'node_modules'));
  }
  return dir;
}

// 1. reg-guard.mjs: regstate.json, model_shadow.json, exempt files
{
  const dir = makeTmp('md-gaps-guard-');
  const out = path.join(dir, 'out');
  fs.writeFileSync(path.join(out, 'reg.json'), JSON.stringify({id: 'M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: '2026-12-02', by: 'date'}}));
  fs.writeFileSync(path.join(out, 'regstate.json'), JSON.stringify({reg: 'M-C', day: 92, events: 400, players: 20000, games: 50000, since: '2026-09-01', updated: '2026-12-01T09:07:00Z'}));
  fs.writeFileSync(path.join(out, 'model_shadow.json'), JSON.stringify({reg: 'M-C', updated: '2026-12-01T09:07:00Z', ships: true, shadow: 'combo', mons: {Incineroar: 0.2}}));
  fs.writeFileSync(path.join(out, 'shadow_scoreboard.json'), JSON.stringify({reg: 'M-C', byReg: {'M-C': [{date: '2026-11-30'}]}}));
  fs.writeFileSync(path.join(out, 'post.json'), JSON.stringify({checked: '2026-11-18T00:00:00Z', gifts: [], news: []}));
  fs.writeFileSync(path.join(out, 'post-suggest.json'), JSON.stringify([]));

  const g = guardOut({outDir: out, log: () => {}});
  const rs = JSON.parse(fs.readFileSync(path.join(out, 'regstate.json'), 'utf8'));
  const ms = JSON.parse(fs.readFileSync(path.join(out, 'model_shadow.json'), 'utf8'));
  const ss = JSON.parse(fs.readFileSync(path.join(out, 'shadow_scoreboard.json'), 'utf8'));
  ok(g.emptied.includes('regstate.json') && rs.reg === 'M-D' && rs.events === 0, `1a reg-guard empties stale M-C regstate.json (got reg=${rs.reg}, emptied=${g.emptied.join(',')})`);
  ok(g.emptied.includes('model_shadow.json') && ms.reg === 'M-D' && ms.ships === false, `1b reg-guard empties stale M-C model_shadow.json (got reg=${ms.reg}, ships=${ms.ships})`);
  ok(g.unknown.length === 0 && Array.isArray(ss.byReg['M-C']), `1c reg-guard exempts shadow_scoreboard/post/post-suggest and preserves byReg (unknown=${g.unknown.join(',') || 'none'})`);
  fs.rmSync(dir, {recursive: true, force: true});
}

// 2. model.mjs (MODEL_SHADOW=1) on switch day (0 games)
{
  const dir = makeTmp('md-gaps-shadow-');
  const out = path.join(dir, 'out');
  fs.writeFileSync(path.join(out, 'reg.json'), JSON.stringify({id: 'M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: '2026-12-02', by: 'date'}}));
  fs.writeFileSync(path.join(out, 'matches.json'), JSON.stringify({reg: 'M-D', updated: '2026-12-02T09:07:00Z', events: [], teams: [], players: 0, feats: [], decks: [], m: []}));
  fs.writeFileSync(path.join(out, 'model.json'), JSON.stringify({reg: 'M-C', updated: '2026-12-01T09:07:00Z', ships: true, mons: {Incineroar: 0.2}}));
  fs.writeFileSync(path.join(out, 'model_shadow.json'), JSON.stringify({reg: 'M-C', updated: '2026-12-01T09:07:00Z', ships: true, shadow: 'combo', mons: {Incineroar: 0.2}}));

  const r = spawnSync(process.execPath, ['model.mjs'], {cwd: dir, env: {...process.env, MODEL_SHADOW: '1'}, encoding: 'utf8'});
  const ms = JSON.parse(fs.readFileSync(path.join(out, 'model_shadow.json'), 'utf8'));
  ok(r.status === 0 && ms.reg === 'M-D' && ms.ships === false && Object.keys(ms.mons || {}).length === 0,
    `2a model.mjs (MODEL_SHADOW=1) on M-D day 1 replaces stale M-C model_shadow.json with not-ready M-D (exit=${r.status}, reg=${ms.reg}, ships=${ms.ships})`);
  fs.rmSync(dir, {recursive: true, force: true});
}

// 3. ratings-snapshot.mjs on M-D day 1 (0 tournament results -> tc: null for all mons)
{
  const dir = makeTmp('md-gaps-snap-');
  const out = path.join(dir, 'out');
  const R = {id: 'M-D', name: 'Reg M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: '2026-12-02', by: 'date'}};
  fs.writeFileSync(path.join(out, 'reg.json'), JSON.stringify(R));
  fs.writeFileSync(path.join(out, 'limitless.json'), JSON.stringify({reg: 'M-D', updated: '2026-12-02T09:07:00Z', teams: 0, adj: {label: '', rows: []}, results: {source: '', teams: 0, base: 0.5, minCore: 40, mons: {}, pairs: {}, cores: [], proven: [], records: []}}));
  fs.writeFileSync(path.join(out, 'perf.json'), JSON.stringify({updated: '2026-12-02', reg: {id: 'M-D', name: 'Reg M-D', since: '2026-12-02'}}));
  fs.writeFileSync(path.join(out, 'meta_tour.json'), JSON.stringify({reg: 'M-D', format: 'doubles', kind: 'tour', updated: '2026-12-02T09:07:00Z', top: [], more: []}));
  fs.writeFileSync(path.join(out, 'meta_ladder.json'), JSON.stringify({reg: 'M-D', format: 'doubles', kind: 'ladder', month: null, updated: '2026-12-02T09:07:00Z', top: [], more: []}));
  fs.writeFileSync(path.join(out, 'meta_ingame.json'), JSON.stringify({reg: 'M-D', format: 'doubles', kind: 'ingame', updated: '2026-12-02T09:07:00Z', top: [], more: []}));
  fs.writeFileSync(path.join(out, 'teams.json'), JSON.stringify({reg: 'M-D', updated: '2026-12-02T09:07:00Z', teams: []}));
  fs.writeFileSync(path.join(out, 'history.json'), JSON.stringify({reg: 'M-D', days: []}));
  fs.writeFileSync(path.join(out, 'model.json'), JSON.stringify({reg: 'M-D', updated: '2026-12-02T09:07:00Z', ships: false, mons: {}, pairs: {}, sets: {}}));
  fs.writeFileSync(path.join(out, 'events.json'), JSON.stringify({reg: 'M-D', updated: '2026-12-02T09:07:00Z', dict: [], events: []}));
  fs.writeFileSync(path.join(out, 'ratings_log.json'), JSON.stringify({reg: 'M-C', updated: '2026-12-01T09:07:00Z', byReg: {'M-C': [{d: '2026-12-01', r: {Incineroar: 95}}]}}));

  const r = spawnSync(process.execPath, ['ratings-snapshot.mjs'], {cwd: dir, encoding: 'utf8'});
  const log = JSON.parse(fs.readFileSync(path.join(out, 'ratings_log.json'), 'utf8'));
  const mdDays = (log.byReg && log.byReg['M-D']) || [];
  const mcDays = (log.byReg && log.byReg['M-C']) || [];
  ok(r.status === 0 && log.reg === 'M-D' && Array.isArray(log.byReg['M-D']) && mdDays.length === 0 && mcDays.length === 1,
    `3a ratings-snapshot.mjs on M-D day 1 (0 rated mons) keeps byReg['M-D'] empty and preserves M-C history (exit=${r.status}, mdDays=${mdDays.length}, firstDayMons=${mdDays[0] ? Object.keys(mdDays[0].r || {}).length : 0})`);
  fs.rmSync(dir, {recursive: true, force: true});
}

// 4. weekly.mjs & practice.mjs refresh empty M-D files on 0-event days, but protect non-empty same-reg files
{
  const dir = makeTmp('md-gaps-wp-');
  const out = path.join(dir, 'out');
  fs.writeFileSync(path.join(out, 'reg.json'), JSON.stringify({id: 'M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: '2026-12-02', by: 'date'}}));
  fs.writeFileSync(path.join(dir, 'data/index.json'), JSON.stringify({tournaments: {old1: {d: '2026-12-01T18:00:00Z', p: 64, name: 'Old M-C', f: 'M-C'}}}));
  fs.writeFileSync(path.join(out, 'replays.json'), JSON.stringify({reg: 'M-D', updated: '2026-12-05T09:07:00Z', format: 'gen9championsvgc2026regmd', games: []}));
  const staleTs = '2026-12-02T09:07:00.000Z';

  // 4a: empty M-D files get refreshed updated timestamp
  fs.writeFileSync(path.join(out, 'weekly.json'), JSON.stringify({reg: 'M-D', v: 1, updated: staleTs, a: {from: '', to: '', ev: 0, n: 0}, b: {from: '', to: '', ev: 0, n: 0}, enough: false}));
  fs.writeFileSync(path.join(out, 'practice.json'), JSON.stringify({reg: 'M-D', updated: staleTs, dict: [], opp: [], rounds: []}));
  const rw1 = spawnSync(process.execPath, ['weekly.mjs'], {cwd: dir, encoding: 'utf8'});
  const rp1 = spawnSync(process.execPath, ['practice.mjs'], {cwd: dir, encoding: 'utf8'});
  const w1 = JSON.parse(fs.readFileSync(path.join(out, 'weekly.json'), 'utf8'));
  const p1 = JSON.parse(fs.readFileSync(path.join(out, 'practice.json'), 'utf8'));
  ok(rw1.status === 0 && w1.reg === 'M-D' && w1.updated !== staleTs, `4a weekly.mjs refreshes empty M-D file timestamp (updated=${w1.updated})`);
  ok(rp1.status === 0 && p1.reg === 'M-D' && p1.updated !== staleTs, `4b practice.mjs refreshes empty M-D file timestamp (updated=${p1.updated})`);

  // 4b: non-empty same-reg files are preserved unchanged (outage fail-safe)
  fs.writeFileSync(path.join(out, 'weekly.json'), JSON.stringify({reg: 'M-D', v: 1, updated: staleTs, a: {from: '2026-12-02', to: '2026-12-08', ev: 5, n: 250}, b: {from: '', to: '', ev: 0, n: 0}, enough: false}));
  fs.writeFileSync(path.join(out, 'practice.json'), JSON.stringify({reg: 'M-D', updated: staleTs, dict: ['Garchomp'], opp: [[0]], rounds: [[0]]}));
  const rw2 = spawnSync(process.execPath, ['weekly.mjs'], {cwd: dir, encoding: 'utf8'});
  const rp2 = spawnSync(process.execPath, ['practice.mjs'], {cwd: dir, encoding: 'utf8'});
  const w2 = JSON.parse(fs.readFileSync(path.join(out, 'weekly.json'), 'utf8'));
  const p2 = JSON.parse(fs.readFileSync(path.join(out, 'practice.json'), 'utf8'));
  ok(rw2.status === 0 && w2.updated === staleTs && w2.a.n === 250, `4c weekly.mjs preserves non-empty same-reg file on 0-event glitch (a.n=${w2.a.n})`);
  ok(rp2.status === 0 && p2.updated === staleTs && p2.rounds.length === 1, `4d practice.mjs preserves non-empty same-reg file on 0-replay glitch (rounds=${p2.rounds.length})`);
  fs.rmSync(dir, {recursive: true, force: true});
}

console.log(fails ? `md-switch-data-gaps-test: ${fails} FAILED` : 'md-switch-data-gaps-test: ALL PASSED');
process.exit(fails ? 1 : 0);
