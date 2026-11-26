// Capture for experiments/known-six-bias.mjs (measurement only). Same 4 windows and models as whytest-recheck (NEW_WORK: its WORK dir,
// the branch's model.mjs + six.mjs per window). For every team sheet in each window's games, the built page gives the pieces of its
// score: st.x (team model with the tested-pair credit), st.mu (matchups nudge), the six's own record δ the page used (six.d), and
// the share of that record the sheet keeps (CH.sixOf with a stand-in record, so it is known for every sheet). Writes WORK/capture.json:
// per window the model's calib and dist.q, the sheets, and the games as [sheetA, sheetB, result, event, round format, round].
// Usage: NEW_WORK=<dir> WORK=<dir> node experiments/known-six-capture.mjs   (build the page first)
import fs from 'node:fs'; import {createRequire} from 'node:module'; import {roundMode} from '../tour-modes.mjs';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, WORK = process.env.WORK.replace(/\/?$/, '/'), NEW = process.env.NEW_WORK.replace(/\/?$/, '/'); fs.mkdirSync(WORK, {recursive: true});
const rd = f => JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8'));
const M = rd('matches.json'), TM = JSON.parse(fs.readFileSync(ROOT + 'data/tour-modes.json', 'utf8'));
const evDates = M.events.map(e => e[1]), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]), teams = M.teams.map(k => k.split('|'));
const cuts = [['2026-10-28', '2026-11-04'], ['2026-11-04', '2026-11-11'], ['2026-11-11', '2026-11-18'], ['2026-11-18', '2026-11-26']];
const L = rd('limitless.json'), base = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/history': rd('history.json')};
const sheetOf = d => { const set = {}; for (const f of M.decks[d].map(j => M.feats[j])) { const m = f.match(/^(.*?)([@#:])(.*)$/); if (!m) continue; const s = set[m[1]] || (set[m[1]] = {it: null, ab: null, mv: []});
  if (m[2] === '@') s.it = m[3]; else if (m[2] === '#') s.ab = m[3]; else s.mv.push(m[3]); } return set; };
const page = ROOT + `app/knownsix-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const br = await chromium.launch(), out = {windows: []};
for (const [from, to] of cuts) {
  const MT = JSON.parse(fs.readFileSync(NEW + `model-${from}.json`, 'utf8'));
  const test = G.filter(g => evDates[g[3]] >= from && evDates[g[3]] < to), keys = [...new Set(test.flatMap(g => [g[0] + ',' + g[7], g[1] + ',' + g[8]]))], ix = new Map(keys.map((k, i) => [k, i]));
  const SH = keys.map(k => { const [t, d] = k.split(','); return {mons: teams[+t], set: d !== 'null' && d !== 'undefined' && M.decks[+d] ? sheetOf(+d) : null}; });
  const pg = await (await br.newContext()).newPage(), errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, {...base, 'meta/model': MT});
  await pg.goto('file://' + page); await pg.waitForTimeout(4000);
  const S = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{ const SH = ${JSON.stringify(SH)};
    const mk = ns => ns.every(n => byName.get(n)) ? ns.map(n => abMember(byName.get(n))) : null;
    const fromSet = (ns, set) => { if (!set || !ns.every(n => byName.get(n))) return mk(ns); try { return ns.map((n, i) => { const s = set[n] || {}; const p = byName.get(n), mv = (s.mv || []).filter(x => mvByName.has(x)).slice(0, 4);
      return memberOf({n, a: s.ab && p.a.includes(s.ab) ? s.ab : null, lock: false, ...(mv.length ? {mv: {doubles: mv}} : {}), ...(!p.m && s.it ? {it: {doubles: s.it}} : {})}, i); }).filter(Boolean); } catch (e) { return null; } };
    const SX = META.model.sixes || (META.model.sixes = {});
    return JSON.stringify(SH.map(x => { try { const t = fromSet(x.mons, x.set); if (!t || t.length !== 6) return null; const ms = typeof assignItems === 'function' ? assignItems(t) : t;
      const RD = THR.teamReport(ms), Gd = CH.gradeOf(RD, proChecks(ms, true), ms); if (!Gd || !Gd.st) return null; const st = Gd.st;
      const key = ms.map(m => m.p.n).sort().join('|'), had = SX[key]; SX[key] = [1, 99]; const sh = (CH.sixOf(ms) || {}).share; if (had) SX[key] = had; else delete SX[key];
      return {x: st.x, mu: st.mu, d: st.six ? st.six.d : 0, e: st.e, y: st.y, share: sh == null ? 1 : sh, key}; } catch (e) { return null; } })); })()`));
  await pg.close();
  out.windows.push({from, to, calib: MT.calib, q: MT.dist.q, sheets: S, games: test.map(g => [ix.get(g[0] + ',' + g[7]), ix.get(g[1] + ',' + g[8]), g[2], g[3], roundMode(TM[M.events[g[3]][0]], g[6]), g[6]]), errs: errs.length});
  console.log(`  [${from}..${to}] ${test.length} games, ${keys.length} sheets, ${S.filter(s => !s).length} not scorable, page errors ${errs.length}`);
}
await br.close(); fs.unlinkSync(page); fs.writeFileSync(WORK + 'capture.json', JSON.stringify(out));
