// Do the planner's type-chart rules predict wins beyond the grade? (Nov 8, Phase 3: two type rules, "at most one more weakness than
// resists" and "at most one more type nothing resists", blocked the best swaps on 9 of 30 real teams.) For every later tournament game
// (same games and order as experiments/site-board.mjs), each side's type numbers from the page's own analyze(): excess weaknesses,
// unresisted types and the biggest stack of shared weaknesses. Then: win ~ logit(site chance) + b × (mine − theirs).
// Usage: node experiments/type-check.mjs <pred.json from site-board.mjs>     (build the page first)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches_dev.json', 'utf8')), P = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const FROM = process.env.BOARD_DATE || '2026-10-27', teams = M.teams.map(k => k.split('|')), isSD = i => String(M.events[i][0]).startsWith('sd-');
const futE = new Set(M.events.map((e, i) => [e, i]).filter(([e, i]) => e[1] >= FROM && !isSD(i)).map(([, i]) => i));
const G = M.m.filter(g => futE.has(g[3]) && g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6);
if (G.length !== P.y.length) { console.error('game count differs from the pred file'); process.exit(2); }
const need = [...new Set(G.flatMap(g => [g[0], g[1]]))];
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = ROOT + `app/tc-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const TY = {};
for (let i = 0; i < need.length; i += 200) { const ch = need.slice(i, i + 200).map(t => [t, teams[t]]);
  Object.assign(TY, JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{const o={};for(const [t,ns] of ${JSON.stringify(ch)}){try{if(ns.some(n=>!byName.get(n)))continue;const ms=ns.map(n=>abMember(byName.get(n)));const a=analyze(ms,true);o[t]=[a.excess,a.unresisted.length,typeShape(a).maxStack]}catch(e){}}return JSON.stringify(o)})()`))); }
await b.close(); fs.unlinkSync(page);
const row = P.rows[Object.keys(P.rows).find(k => /^site today/.test(k))], logit = p => Math.log(p / (1 - p)), sig = z => 1 / (1 + Math.exp(-z));
const data = G.map((g, i) => ({off: logit(Math.min(.999, Math.max(.001, row[i]))), y: P.y[i], A: TY[g[0]], B: TY[g[1]], ev: g[3]})).filter(d => d.A && d.B);
function fit(j) { let w = 0; const xs = d => d.A[j] - d.B[j]; for (let it = 0; it < 30; it++) { let g = 0, h = 0; for (const d of data) { const x = xs(d); if (!x) continue; const p = sig(d.off + w * x); g += (d.y - p) * x; h += p * (1 - p) * x * x; } w += g / h; }
  let h = 0; const byE = new Map(); for (const d of data) { const x = xs(d); if (!x) continue; const p = sig(d.off + w * x); h += p * (1 - p) * x * x; byE.set(d.ev, (byE.get(d.ev) || 0) + (d.y - p) * x); } let v = 0; for (const s of byE.values()) v += s * s; return {w, se: Math.sqrt(v) / h}; }
const pts = c => (sig(c) - .5) * 100;
console.log(`${data.length} later tournament games; effect of each extra unit on my side vs theirs, beyond the grade (win-chance pts, 95% range):`);
for (const [j, k] of [[0, 'one more weakness than resists'], [1, 'one more type nothing resists'], [2, 'one more Pokémon in the biggest shared weakness']]) { const f = fit(j), lo = pts(f.w - 1.96 * f.se), hi = pts(f.w + 1.96 * f.se);
  console.log(`  ${k.padEnd(48)} ${pts(f.w) >= 0 ? '+' : ''}${pts(f.w).toFixed(1)} (${lo.toFixed(1)} to ${hi.toFixed(1)})${hi < 0 ? '  HURTS beyond the grade' : lo > 0 ? '  HELPS beyond the grade' : ''}`); }
