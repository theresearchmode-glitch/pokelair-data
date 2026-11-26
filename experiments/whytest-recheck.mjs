// Re-check of the tested-on sentence (CH.WHY_TEST, alt/bands-c) on the REAL model with the Strength Score fix and bands option C
// (CH.SS_MID 73.33, CH.SS_K 166.67). Windows as alt/kip35-check and Kip job 37: cuts 2026-10-28 / 11-04 / 11-11 / 11-18 (the last runs
// to 11-26). For each window:
//   - out/matches.json cut to the events before the cut (renumbered, as experiments/kip35-real-check.mjs), model.mjs trained on it with
//     the branch's locked settings (MATCHES=, MODEL_OUT=), then six.mjs on the same cut file (each six's own record, as the daily run)
//   - every team in the window's games is scored by the built page (app/dist/page.html, META.model = that window's model, the other
//     META files today's), gradeTeam on the team's own sheet (the site's loader, as experiments/golden.mjs), CH.SS_MID / CH.SS_K set to
//     option C; band = CH.wordOf(score)
//   - each side of each game is one result for its band; win % per band with 95% event-clustered bootstrap CIs (1000, seed 42)
// Reported for single games (best-of-1 rounds, data/tour-modes.json + tour-modes.mjs roundMode) and, separately, for best-of-3 rounds
// (each row is a match result); with and without the sealed set (events on/after experiments/sealed.json 'from').
// Bands with fewer than 300 results: "unknown".
// Also, as a cross-check, Kip job 37's way: score = C(fieldWin(x)), x = the model's team number only (no matchups, own record or
// tested-pair credit), band by rounded score.
// Usage: WORK=<dir> node experiments/whytest-recheck.mjs   (build the page first; REUSE=1 keeps the trained models)
import fs from 'node:fs'; import {execFile} from 'node:child_process'; import {promisify} from 'node:util'; import {createRequire} from 'node:module'; import {roundMode} from '../tour-modes.mjs';
const {chromium} = createRequire(import.meta.url)('playwright'), run = promisify(execFile);
const ROOT = new URL('../', import.meta.url).pathname, WORK = (process.env.WORK || ROOT + 'out/whytest').replace(/\/?$/, '/'); fs.mkdirSync(WORK, {recursive: true});
const rd = f => { try { return JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8')); } catch (e) { return null; } };
const M = rd('matches.json'), TM = JSON.parse(fs.readFileSync(ROOT + 'data/tour-modes.json', 'utf8')), SEAL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from;
const evDates = M.events.map(e => e[1]), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]), teams = M.teams.map(k => k.split('|'));
const SS_MID = 73.33, SS_K = 166.67, MIN_N = 300;
const cuts = [['2026-10-28', '2026-11-04'], ['2026-11-04', '2026-11-11'], ['2026-11-11', '2026-11-18'], ['2026-11-18', '2026-11-26']];
const cutFile = keepEv => { const keep = [...keepEv].sort((a, b) => a - b), nu = new Map(keep.map((o, n) => [o, n])), C = {...M};
  C.m = M.m.filter(g => nu.has(g[3])).map(g => { const h = g.slice(); h[3] = nu.get(g[3]); return h; }); C.events = keep.map(i => M.events[i]); return C; };
// 1. train the 4 window models in parallel
const env0 = {...process.env}; for (const k of ['TRAIN_ONLY', 'TEST_DATE', 'MODEL_SHADOW', 'FAST', 'RETUNE', 'K_GRID', 'LB', 'LP', 'EVID_K', 'EVID_KP', 'ZERO_CENTER']) delete env0[k];
await Promise.all(cuts.map(async ([from]) => { const mt = WORK + `model-${from}.json`, mf = WORK + `matches-${from}.json`;
  if (process.env.REUSE === '1' && fs.existsSync(mt)) return;
  fs.writeFileSync(mf, JSON.stringify(cutFile(new Set(M.events.map((e, i) => e[1] < from ? i : -1).filter(i => i >= 0)))));
  const t0 = Date.now(), a = await run('node', ['model.mjs'], {cwd: ROOT, env: {...env0, MATCHES: mf, MODEL_OUT: mt}, maxBuffer: 1 << 28});
  const b = await run('node', ['six.mjs'], {cwd: ROOT, env: {...env0, MATCHES: mf, MODEL_FILE: mt}, maxBuffer: 1 << 28});
  console.log(`  [${from}] ${((Date.now() - t0) / 1000).toFixed(0)}s: ${a.stdout.trim().split('\n').filter(l => /^(ridge|model:)/.test(l)).join(' | ')} | ${b.stdout.trim().split('\n').pop().slice(0, 60)}`); }));
// 2. score every team-sheet of each window with the page
const L = rd('limitless.json'), base = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/history': rd('history.json')};
const sheetOf = d => { const set = {}; for (const f of M.decks[d].map(j => M.feats[j])) { const m = f.match(/^(.*?)([@#:])(.*)$/); if (!m) continue; const s = set[m[1]] || (set[m[1]] = {it: null, ab: null, mv: []});
  if (m[2] === '@') s.it = m[3]; else if (m[2] === '#') s.ab = m[3]; else s.mv.push(m[3]); } return set; };
const page = ROOT + `app/whytest-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const br = await chromium.launch(), rows = [];
const sig = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
for (const [from, to] of cuts) {
  const MT = JSON.parse(fs.readFileSync(WORK + `model-${from}.json`, 'utf8')); if (!MT.ships) { console.log(`  [${from}] model did not ship: window skipped`); continue; }
  const test = G.filter(g => evDates[g[3]] >= from && evDates[g[3]] < to), keys = [...new Set(test.flatMap(g => [g[0] + ',' + g[7], g[1] + ',' + g[8]]))];
  const SH = keys.map(k => { const [t, d] = k.split(','); return {mons: teams[+t], set: d !== 'null' && d !== 'undefined' && M.decks[+d] ? sheetOf(+d) : null}; });
  const pg = await (await br.newContext()).newPage(), errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, {...base, 'meta/model': MT});
  await pg.goto('file://' + page); await pg.waitForTimeout(4000);
  const S = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{ CH.SS_MID = ${SS_MID}; CH.SS_K = ${SS_K}; const SH = ${JSON.stringify(SH)};
    const mk = ns => ns.every(n => byName.get(n)) ? ns.map(n => abMember(byName.get(n))) : null;
    const fromSet = (ns, set) => { if (!set || !ns.every(n => byName.get(n))) return mk(ns); try { return ns.map((n, i) => { const s = set[n] || {}; const p = byName.get(n), mv = (s.mv || []).filter(x => mvByName.has(x)).slice(0, 4);
      return memberOf({n, a: s.ab && p.a.includes(s.ab) ? s.ab : null, lock: false, ...(mv.length ? {mv: {doubles: mv}} : {}), ...(!p.m && s.it ? {it: {doubles: s.it}} : {})}, i); }).filter(Boolean); } catch (e) { return null; } };
    return JSON.stringify(SH.map(x => { const ms = fromSet(x.mons, x.set); if (!ms || ms.length !== 6) return null; let s = null; try { s = gradeTeam(ms); } catch (e) {} return s == null ? null : [s, CH.wordOf(s)]; })); })()`));
  await pg.close(); if (errs.length) console.log(`  [${from}] page errors: ${errs.length} ${errs[0]}`);
  const byKey = new Map(keys.map((k, i) => [k, S[i]]));
  // Kip job 37's way, for comparison: x only
  const spF = new Map(); for (const f of Object.keys(MT.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
  const T = MT.team || {}, xOf = (t, d) => { const m = teams[t]; let v = 0; if (T.noMega && !m.some(n => /-Mega/.test(n))) v += T.noMega;
    if (T.protectLow && d != null && M.decks[d]) { const f = M.decks[d].map(j => M.feats[j]); if (f.filter(n => n.includes(':')).length >= 16 && m.filter(n => f.includes(n + ':Protect')).length <= 2) v += T.protectLow; }
    for (const n of m) v += MT.mons[n] || 0; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) v += (MT.pairs || {})[m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]] || 0;
    if (d != null && M.decks[d]) { const has = new Set(M.decks[d].map(f => M.feats[f])); for (const n of m) { let u = 0; for (const f of spF.get(n) || []) u += MT.sets[f] * ((has.has(f) ? 1 : 0) - ((MT.setFreq || {})[f] || 0)); const r = (MT.setRange || {})[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; } }
    return v; };
  const kipS = x => { const e = MT.dist.q.reduce((a, v) => a + sig(MT.calib * (x - v)), 0) / MT.dist.q.length, s = Math.max(0, Math.min(100, SS_MID + SS_K * (e - .5))), r = Math.round(s); return r >= 90 ? 'Top tier' : r >= 80 ? 'Tournament ready' : r >= 70 ? 'Solid' : r >= 60 ? 'Needs work' : 'Missing a basic'; };
  let nNull = 0;
  for (const g of test) { const mode = roundMode(TM[M.events[g[3]][0]], g[6]), sealed = evDates[g[3]] >= SEAL;
    for (const [t, d, won] of [[g[0], g[7], g[2]], [g[1], g[8], 1 - g[2]]]) { const v = byKey.get(t + ',' + d); if (!v) { nNull++; continue; }
      rows.push({w: from, ev: from + ':' + g[3], mode, sealed, band: v[1], s: v[0], kip: kipS(xOf(t, d)), won}); } }
  console.log(`  [${from}..${to}] ${test.length} games, ${keys.length} distinct team sheets, ${nNull} results not scorable, calib ${MT.calib}, meanX ${MT.meanX}`);
}
await br.close(); fs.unlinkSync(page);
// 3. win % per band
const BANDS = ['Top tier', 'Tournament ready', 'Solid', 'Needs work', 'Missing a basic'], LBL = {'Top tier': '90+', 'Tournament ready': '80s', 'Solid': '70s', 'Needs work': '60s', 'Missing a basic': 'under 60'};
const table = (name, R, key = 'band') => { const evs = [...new Set(R.map(r => r.ev))], byEv = new Map(evs.map(e => [e, BANDS.map(() => [0, 0])]));
  for (const r of R) { const a = byEv.get(r.ev)[BANDS.indexOf(r[key])]; a[0]++; a[1] += r.won; }
  const tot = BANDS.map((_, b) => [...byEv.values()].reduce((a, x) => [a[0] + x[b][0], a[1] + x[b][1]], [0, 0]));
  let st = 42; const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; }, bs = BANDS.map(() => []);
  for (let i = 0; i < 1000; i++) { const s = BANDS.map(() => [0, 0]); for (let j = 0; j < evs.length; j++) { const a = byEv.get(evs[Math.floor(rnd() * evs.length)]); for (let b = 0; b < 5; b++) { s[b][0] += a[b][0]; s[b][1] += a[b][1]; } } s.forEach((x, b) => { if (x[0]) bs[b].push(x[1] / x[0]); }); }
  const out = [`${name}: ${R.length / 2 | 0} games (${R.length} team results), ${evs.length} events`];
  BANDS.forEach((b, i) => { const [n, w] = tot[i], a = bs[i].sort((x, y) => x - y), lo = a[Math.floor(.025 * a.length)], hi = a[Math.floor(.975 * a.length)];
    out.push(`  ${(LBL[b] + ' ' + b).padEnd(26)} n=${String(n).padStart(5)} (${(100 * n / R.length).toFixed(1).padStart(4)}%)  ${n < MIN_N ? 'unknown (under ' + MIN_N + ')' + (n ? `  [won ${(100 * w / n).toFixed(1)}%]` : '') : `won ${(100 * w / n).toFixed(1)}%  95% CI ${(100 * lo).toFixed(1)}-${(100 * hi).toFixed(1)}%`}`); });
  return {out, tot}; };
const say = [], P = (n, R, k) => { const t = table(n, R, k); say.push(...t.out, ''); console.log(t.out.join('\n') + '\n'); return t; };
console.log('\n=== win % per band on later games (bands option C, the page score with the EB-fix model) ===');
const single = rows.filter(r => r.mode === 'bo1'), bo3 = rows.filter(r => r.mode === 'bo3');
P('SINGLE GAMES (best-of-1 rounds), all 4 windows', single);
P('SINGLE GAMES, without the sealed set (events before ' + SEAL + ')', single.filter(r => !r.sealed));
P('SINGLE GAMES, sealed set only (events on/after ' + SEAL + ')', single.filter(r => r.sealed));
P('BEST-OF-3 ROUNDS (each row is a match result; kept separate), all 4 windows', bo3);
P('BEST-OF-3 ROUNDS, without the sealed set', bo3.filter(r => !r.sealed));
P('ALL ROWS as Kip job 37 counted them (best-of-1 + best-of-3 mixed), all 4 windows', rows);
P('ALL ROWS, Kip job 37 scoring (x only, rounded), for comparison', rows, 'kip');
const other = rows.filter(r => r.mode !== 'bo1' && r.mode !== 'bo3'); console.log(`rows with another or unknown round format: ${other.length}`);
fs.writeFileSync(WORK + 'result.txt', say.join('\n') + '\n'); fs.writeFileSync(WORK + 'rows.json', JSON.stringify(rows));
