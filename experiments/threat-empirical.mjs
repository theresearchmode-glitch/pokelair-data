// Real-games sanity check of threat preparation (research, not CI; not a user-facing prediction). Uses the built page's
// engine. For every Limitless game with both teams known: player Elo before the game (chronological) and each team's
// verdict on each top-30 threat with its registered items and moves. Per threat: does "you handle T" go with better
// skill-adjusted results when the opponent has T than when it doesn't (difference-in-differences)?
// Usage: node experiments/threat-empirical.mjs   (writes threat-empirical.out.json)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const require = createRequire(import.meta.url), {chromium} = require('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L0 = rd('limitless.json'), DOCS = {'meta/results': L0.results, 'meta/perf': {adj: L0.adj, updated: L0.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
async function open() { const page = APP + 'verify-emp.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, DOCS);
  await pg.goto('file://' + page); await pg.waitForTimeout(3500);
  return {ev: (c, a) => pg.evaluate(([c, a]) => window.__ev(`(${c})`)(a), [c, a]), close: async () => { await b.close(); fs.unlinkSync(page); }}; }
const THREATS = Object.entries(L0.results.tc.rows).sort((a, b) => b[1][1] - a[1][1]).slice(0, 30).map(([n, r]) => ({n, w: r[1]}));
const M = rd('matches.json');const teams = M.teams.map(k => k.split('|')), feats = M.feats;
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && g[7] != null && g[8] != null);
// one deck per team (the first seen), decoded to per-species item + moves
const deckOf = new Map(); for (const g of G) { if (!deckOf.has(g[0])) deckOf.set(g[0], g[7]); if (!deckOf.has(g[1])) deckOf.set(g[1], g[8]); }
const specOf = t => { const d = M.decks[deckOf.get(t)] || [], by = new Map(); for (const f of d) { const s = feats[f], i = s.search(/[@:]/), sp = s.slice(0, i); if (!by.has(sp)) by.set(sp, {n: sp, moves: []}); const o = by.get(sp);
  if (s[i] === '@') o.item = s.slice(i + 1); else o.moves.push(s.slice(i + 1)); }
  return teams[t].map(n => { const o = by.get(n) || {n}; return {n, item: o.item, moves: o.moves && o.moves.length ? o.moves.slice(0, 4) : undefined}; }); };
const ids = [...deckOf.keys()];
const {ev, close} = await open();
const lv = new Map(); let fail = 0; const t0 = Date.now();
for (let i = 0; i < ids.length; i += 150) { const chunk = ids.slice(i, i + 150).map(t => [t, specOf(t)]);
  const res = await ev(`(a) => a[0].map(([t, spec]) => { try { const r = THR.report(spec, a[1]); return [t, r.rows.map(x => x.level)]; } catch (e) { return [t, null]; } })`, [chunk, THREATS]);
  for (const [t, l] of res) { if (l) lv.set(t, l); else fail++; }
  if (i % 1500 === 0) console.log(`${i}/${ids.length} teams (${((Date.now() - t0) / 1000).toFixed(0)}s)`); }
await close();
// Elo, chronological (events are in date order; games keep their order inside an event)
const ord = G.map((g, i) => [M.events[g[3]][1], i]).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1]).map(x => G[x[1]]);
const elo = new Map(), E = p => elo.get(p) || 1500, rows = [];
for (const g of ord) { const [A, B, r, , pa, pb] = g, ea = E(pa), eb = E(pb), p = 1 / (1 + 10 ** ((eb - ea) / 400)); rows.push({A, B, r, p}); const k = 24; elo.set(pa, ea + k * (r - p)); elo.set(pb, eb - k * (r - p)); }
// per threat
const TN = THREATS.map(t => t.n), out = [];
const has = (t, n) => teams[t].includes(n);
for (let j = 0; j < TN.length; j++) { const T = TN[j]; const c = {h1: [0, 0], n1: [0, 0], h0: [0, 0], n0: [0, 0]};
  for (const {A, B, r, p} of rows) for (const [me, op, res, pr] of [[A, B, r, p], [B, A, 1 - r, 1 - p]]) { const l = lv.get(me); if (!l || has(me, T)) continue;
    const handled = l[j] >= 2, oppHas = has(op, T), key = (handled ? 'h' : 'n') + (oppHas ? '1' : '0'); c[key][0] += res - pr; c[key][1]++; }
  const m = k => c[k][1] ? c[k][0] / c[k][1] : 0, se = k => c[k][1] ? .5 / Math.sqrt(c[k][1]) : 1;
  const gapWith = m('h1') - m('n1'), gapWithout = m('h0') - m('n0'), did = gapWith - gapWithout, sd = Math.sqrt(se('h1') ** 2 + se('n1') ** 2 + se('h0') ** 2 + se('n0') ** 2);
  out.push({T, gamesVsT: c.h1[1] + c.n1[1], handledShare: +(c.h1[1] / Math.max(1, c.h1[1] + c.n1[1])).toFixed(2), gapWith: +(100 * gapWith).toFixed(1), gapWithout: +(100 * gapWithout).toFixed(1), did: +(100 * did).toFixed(1), z: +(did / sd).toFixed(1)}); }
// overall: prep advantage (A's handled share of B's registered top threats minus B's of A's) vs skill-adjusted result
let xs = [], ys = []; for (const {A, B, r, p} of rows) { const la = lv.get(A), lb = lv.get(B); if (!la || !lb) continue;
  const prep = (l, opp) => { let s = 0, n = 0; TN.forEach((T, j) => { if (has(opp, T)) { n++; s += l[j] >= 2 ? 1 : 0; } }); return n ? s / n : null; };
  const pa = prep(la, B), pb = prep(lb, A); if (pa == null || pb == null) continue; xs.push(pa - pb); ys.push(r - p); }
const mean = a => a.reduce((x, y) => x + y, 0) / a.length, mx = mean(xs), my = mean(ys);
const cov = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0), vx = xs.reduce((a, x) => a + (x - mx) ** 2, 0), vy = ys.reduce((a, y) => a + (y - my) ** 2, 0);
const corr = cov / Math.sqrt(vx * vy), slope = cov / vx;
// binned: games where you're better prepared by 30+ points vs worse by 30+
const bin = (lo, hi) => { const r = ys.filter((y, i) => xs[i] >= lo && xs[i] < hi); return {n: r.length, resid: +(100 * mean(r)).toFixed(2)}; };
const summary = {teams: lv.size, failed: fail, games: rows.length, pairsUsed: xs.length, corr: +corr.toFixed(3), slopePer100: +(100 * slope).toFixed(2),
  bins: {'prep gap <= -0.3': bin(-2, -.3), '-0.3..-0.1': bin(-.3, -.1), '-0.1..0.1': bin(-.1, .1), '0.1..0.3': bin(.1, .3), '>= 0.3': bin(.3, 2)}};
fs.writeFileSync(APP + '../threat-empirical.out.json', JSON.stringify({summary, perThreat: out}, null, 1));
console.log(JSON.stringify(summary, null, 1)); console.table(out.sort((a, b) => b.z - a.z));
