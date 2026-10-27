// Suggestion check: take real tournament teams, swap one member for a random usable Pokémon (so there is something to fix),
// and see what Fix plans, Best additions and Quick add come back with: the Team Score each top pick reaches, how often it
// finds a fix at all, and how long it takes. Run on two builds to compare them.
// Usage: node experiments/sugg-eval.mjs <page.html> [teams=40]
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
const OUT = fileURLToPath(new URL('../out/', import.meta.url)), SRC = process.argv[2], N = +(process.argv[3] || 40);
const page = SRC.replace(/\.html$/, '.eval.html');
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(SRC, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': process.env.MODEL ? JSON.parse(fs.readFileSync(process.env.MODEL, 'utf8')) : rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const res = await pg.evaluate(N => window.__ev(`(() => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const E = META.events.events, teams = [];
  for (const e of E) for (const t of (e.top || [])) if (t.mons && t.mons.length === 6 && t.mons.every(m => byName.get(m.n))) teams.push(t.mons.map(m => m.n));
  const pool = ROSTER.filter(p => viability(p) >= 8 && !p.m), out = {fix: [], add: [], quick: [], tFix: 0, tAdd: 0};
  for (let k = 0; k < ${N} && k < teams.length; k++) { const t = teams[Math.floor(rnd() * teams.length)].slice();
    const i = Math.floor(rnd() * 6); if (byName.get(t[i]).m) { k--; continue; } let q; do q = pool[Math.floor(rnd() * pool.length)]; while (t.some(n => byName.get(n).b === q.b));
    t[i] = q.n; S.slots = t.map(n => ({n, a: null, lock: false})); fixSlots(); recCache = {key: null, val: null}; pmCache = new Map(); vCache = new Map(); setCache = new Map(); pairCache = new Map(); relCache = new Map();
    const ms = members(), base = tsOf(ms);
    let t0 = performance.now(); const plans = planFixes(ms, suggestPool(), true); out.tFix += performance.now() - t0;
    const top = plans[0]; out.fix.push({base, top: top ? (top._ts ?? tsOf(top.team)) : null, n: plans.length});
    t0 = performance.now(); const r = computeRecs(ms, true); out.tAdd += performance.now() - t0;
    const a = r.clean[0]; out.add.push({base, top: a ? (a._ts ?? tsOf(a.team)) : null});
    // quick add: best pick for any listed problem
    let qb = null; for (const key of ['gp:speed', 'gp:support', ...TYPES.map(x => 'weak:' + x)]) { const qp = quickPicks(key, plans, ms); for (const pl of qp) if (pl._ts != null && (qb == null || pl._ts > qb)) qb = pl._ts; }
    out.quick.push({base, top: qb}); }
  const sum = a => { const g = a.filter(x => x.top != null); return {teams: a.length, found: g.length, avgGain: +(g.reduce((s, x) => s + x.top - x.base, 0) / (g.length || 1)).toFixed(2), avgGainAll: +(a.reduce((s, x) => s + (x.top != null ? x.top - x.base : 0), 0) / a.length).toFixed(2)}; };
  // Build for me from the whole roster: the fresh (non-proven) path, its best team's Team Score and the time it takes
  ui.abSrc = 'all'; const keepR = RES; RES = null; let t1 = performance.now(), bb = null; try { bb = buildBest(); } finally { RES = keepR; } const tBuild = Math.round(performance.now() - t1);
  const bts = bb && bb.teams ? bb.teams.map(tm => { const m = tm.mons.map(x => abMember(byName.get(x.n))); return tsOf(m); }) : [];
  out.build = {ms: tBuild, teamScores: bts};
  return {build: out.build, fix: sum(out.fix), add: sum(out.add), quick: sum(out.quick), msFixPerTeam: Math.round(out.tFix / out.fix.length), msAddPerTeam: Math.round(out.tAdd / out.add.length)}; })()`), N);
console.log(JSON.stringify(res, null, 1)); await b.close();
