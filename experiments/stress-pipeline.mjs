// Stress test: the daily data job must fail safe. Runs the job's steps (update, rk9, events, replays, ladder) in a
// throwaway copy of the repo with every outside source down, erroring, sending HTML, sending nothing, or half-working, and
// with corrupted local files. Afterwards every out/*.json must still parse and hold at least ~80% of what it held before
// (yesterday's data kept, never garbage), and the raw tournament files must keep their teams.
// Usage: node experiments/stress-pipeline.mjs [mode ...]   (exit 1 on any failure)
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {spawnSync} from 'node:child_process'; import {fileURLToPath, pathToFileURL} from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url)), STUB = pathToFileURL(fileURLToPath(new URL('./stress-fetch-stub.mjs', import.meta.url))).href;
const MODES = process.argv.slice(2).length ? process.argv.slice(2) : ['down', '500', 'html', 'empty', 'glitch', 'corrupt-index+empty', 'missing-index+empty', 'corrupt-out+empty', 'truncated-t2+empty', 'half-data+empty'];
const STEPS = [['update.mjs', true], ['rk9.mjs', false], ['events.mjs', false], ['replays.mjs', false], ['ladder.mjs', false]];
const copy = (a, b) => fs.cpSync(a, b, {recursive: true});
const rdj = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return undefined; } };
// what each output holds, to compare before/after
const size = (dir) => { const o = {}, J = f => rdj(path.join(dir, 'out', f));
  const L = J('limitless.json'); o['limitless teams'] = L ? L.teams : -1; o['limitless tournaments'] = L ? L.tournaments : -1; o['results.proven'] = L && L.results ? (L.results.proven || []).length : -1; o['results.tc rows'] = L && L.results && L.results.tc ? Object.keys(L.results.tc.rows).length : -1;
  o['results.base ok'] = L && L.results && L.results.base > .4 && L.results.base < .6 ? 1 : 0;
  const E = J('events.json'); o['events'] = E ? E.events.length : -1; const O = J('official.json'); o['official events'] = O ? O.events.length : -1;
  const T = J('teams.json'); o['teams'] = T ? T.teams.length : -1; const H = J('history.json'); o['history days'] = H ? H.days.length : -1;
  const MT = J('meta_tour.json'); o['meta_tour rows'] = MT ? (MT.top || []).length : -1; const LD = J('meta_ladder.json'); o['meta_ladder rows'] = LD ? (LD.top || []).length : -1;
  const R = J('replays.json'); o['replays'] = R ? (R.games || []).length : -1; const M = J('matches.json'); o['matches'] = M ? M.m.length : -1;
  const idx = rdj(path.join(dir, 'data/index.json')); o['index tournaments'] = idx ? Object.keys(idx.tournaments || {}).length : -1;
  let t2 = 0; for (const f of fs.readdirSync(path.join(dir, 'data/t2'))) { const T2 = rdj(path.join(dir, 'data/t2', f)); if (T2 && T2.e) t2 += T2.e.length; } o['t2 entries'] = t2;
  let pp = 0; for (const f of fs.readdirSync(path.join(dir, 'data/p'))) { const P = rdj(path.join(dir, 'data/p', f)); if (Array.isArray(P)) pp += P.length; } o['pairings'] = pp;
  return o; };
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'pl-pipe-'));
const src = path.join(base, 'src'); fs.mkdirSync(src);
for (const f of fs.readdirSync(ROOT)) if (/\.mjs$/.test(f) || f === 'roster.json' || f === 'package.json') copy(path.join(ROOT, f), path.join(src, f));
copy(path.join(ROOT, 'data'), path.join(src, 'data')); copy(path.join(ROOT, 'out'), path.join(src, 'out'));
const before = size(src); console.log('before:', JSON.stringify(before));
let fails = 0;
for (const mode of MODES) {
  const dir = path.join(base, mode.replace(/[^a-z0-9]+/gi, '_')); copy(src, dir); const net = mode.split('+').pop();
  if (mode.startsWith('corrupt-index')) fs.writeFileSync(path.join(dir, 'data/index.json'), '{"tournaments": {"x": ');
  if (mode.startsWith('missing-index')) fs.rmSync(path.join(dir, 'data/index.json'));
  if (mode.startsWith('corrupt-out')) for (const f of ['replays.json', 'events.json', 'official.json', 'teams.json']) fs.writeFileSync(path.join(dir, 'out', f), '{"oops');
  if (mode.startsWith('truncated-t2')) { const fs2 = fs.readdirSync(path.join(dir, 'data/t2')).slice(-5); for (const f of fs2) { const p = path.join(dir, 'data/t2', f); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').slice(0, 200)); } }
  if (mode.startsWith('half-data')) { const ts = fs.readdirSync(path.join(dir, 'data/t')); ts.slice(0, Math.floor(ts.length * .6)).forEach(f => fs.rmSync(path.join(dir, 'data/t', f))); }
  const pre = size(dir), log = [];
  for (const [script, stop] of STEPS) { const r = spawnSync(process.execPath, ['--import', STUB, script], {cwd: dir, env: {...process.env, STUB_MODE: net, GAP: '0', MAX_FETCH: '8'}, encoding: 'utf8', timeout: 240000});
    log.push(`${script}: exit ${r.status}${r.signal ? ' ' + r.signal : ''} ${(r.stdout + r.stderr).trim().split('\n').slice(-2).join(' | ').slice(0, 200)}`); if (stop && r.status !== 0) { log.push('(the job stops here: later steps and the commit never run)'); break; } }
  const after = size(dir), bad = [];
  for (const [k, v] of Object.entries(before)) { const a = after[k], p = pre[k];
    // a file we corrupted on purpose may stay corrupt (nothing to keep), but nothing else may shrink below 80%
    const ref = p >= 0 ? Math.max(p, k === 'results.base ok' ? 1 : 0) : v;
    if (k === 'results.base ok') { if (a !== 1) bad.push('results.base out of range (garbage written)'); continue; }
    if (p < 0 && a < 0) continue; if (p < 0) continue; if (a < 0) bad.push(`${k}: file unreadable after the job`); else if (a < (/t2 entries|pairings|index tournaments/.test(k) ? 1 : .8) * ref) bad.push(`${k}: ${ref} -> ${a}`); }
  console.log(`\n== ${mode}: ${bad.length ? 'FAIL' : 'ok'}\n   ${log.join('\n   ')}${bad.length ? '\n   LOST: ' + bad.join('; ') : ''}`); if (bad.length) fails++;
}
fs.rmSync(base, {recursive: true, force: true});
console.log(fails ? `\nSTRESS PIPELINE: ${fails} of ${MODES.length} scenarios lost or damaged data` : '\nSTRESS PIPELINE CLEAN'); process.exit(fails ? 1 : 0);
