// Type coverage vs wins (Sim, Nov 9: "what's the correlation between the type coverage in offense/defense and wins?").
// Built from deep-factors.mjs (same single-game replays, same page code). Per six, with the site's own type chart (mult) and
// each member's typical moves (memberMoves):
//   offense   how many of the 18 types at least one damaging move hits super-effectively
//   stack     the most members weak to one attacking type (a stack of shared weaknesses)
//   gaps      attacking types no member resists or is immune to
// Two questions: (1) plain correlation with winning; (2) does the side with more coverage win more than the grade expects?
// Data: Showdown ladder replays (out/replays.json), one game each, never used to train the grade, so an independent check.
// For every game: both sixes graded by the page itself (typical sets), expected win chance = σ(calib·(xA − xB)).
// For each factor where the two sides differ: how often the side WITH it won vs what the grade expected, in two separate
// date slices (a factor counts only if both agree) and for higher-rated games. Each line says how many games it rests on;
// under 300 games = "too few to tell", never "no effect" (CLAUDE.md "How we test").
// Usage: node experiments/deep-factors.mjs      (build the page first: node app/build.mjs)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const R = rd('replays.json').games.filter(g => g.p && g.p[0].length === 6 && g.p[1].length === 6 && (g.w === 0 || g.w === 1));
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = ROOT + `app/tc-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const key = s => [...s].sort().join('|'), sixes = [...new Set(R.flatMap(g => [key(g.p[0]), key(g.p[1])]))];
const F = {};
const code = ch => `(()=>{const o={};const TY=Object.keys(EFF);
 for(const k of ${JSON.stringify(ch)}){try{const ns=k.split('|');if(ns.some(n=>!byName.get(n)))continue;const ms=assignItems(ns.map(n=>abMember(byName.get(n))));
  const x=strengthX(ns,ms).xRaw;const mvs=ms.flatMap(m=>memberMoves(m).moves).filter(v=>v&&v.cat>0&&v.bp>0);
  const off=TY.filter(d=>mvs.some(v=>EFF[v.type]&&mult(v.type,[d],null,false)>1)).length;
  let stack=0,gaps=0;for(const a of TY){const e=ms.map(m=>mult(a,m.p.t||[],m.ability));stack=Math.max(stack,e.filter(v=>v>1).length);if(!e.some(v=>v<1))gaps++;}
  o[k]=[x,{off,stack,gaps}]}catch(e){}}return JSON.stringify(o)})()`;
for (let i = 0; i < sixes.length; i += 150) Object.assign(F, JSON.parse(await pg.evaluate(c => window.__ev(c), code(sixes.slice(i, i + 150)))));
const calib = +(rd('model.json').calib) || 1;
await b.close(); fs.unlinkSync(page);
const sig = z => 1 / (1 + Math.exp(-z)), ts = R.map(g => g.t).sort((a, b) => a - b), mid = ts[ts.length >> 1];
const G0 = R.map(g => { const A = F[key(g.p[0])], B = F[key(g.p[1])]; if (!A || !B) return null; return {z: A[0] - B[0], y: g.w === 0 ? 1 : 0, fa: A[1], fb: B[1], late: g.t >= mid}; }).filter(Boolean);
let k = 0; for (let it = 0; it < 30; it++) { let g = 0, h = 0; for (const d of G0) { const q = sig(k * d.z); g += (d.y - q) * d.z; h += q * (1 - q) * d.z * d.z; } k += g / h; }
const G = G0.map(d => ({...d, p: sig(k * d.z)}));
console.log(`${G.length} single games (Showdown ladder replays, ${new Date(ts[0] * 1000).toISOString().slice(0, 10)} – ${new Date(ts[ts.length - 1] * 1000).toISOString().slice(0, 10)}), ${Object.keys(F).length} sixes`);
const S = Object.values(F).map(v => v[1]); for (const f of ['off', 'stack', 'gaps']) { const a = S.map(s => s[f]).sort((x, y) => x - y); console.log(`  ${f}: median ${a[a.length >> 1]}, 10th-90th percentile ${a[Math.floor(a.length * .1)]}-${a[Math.floor(a.length * .9)]}`); }
// (1) plain correlation: difference in the feature between the two sides vs who won (point-biserial r)
const corr = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; } return sxy / Math.sqrt(sxx * syy); };
// (2) beyond the grade: side with MORE of it (by 2+ for offense/gaps, 1+ for stack) vs what the grade expected, two date slices
const row = (f, d0, sel, better) => { let n = 0, y = 0, p = 0, v = 0; for (const d of G) { if (!sel(d)) continue; const diff = d.fa[f] - d.fb[f]; if (Math.abs(diff) < d0) continue; const aMore = diff > 0, pa = aMore ? d.p : 1 - d.p, ya = aMore ? d.y : 1 - d.y; n++; y += ya; p += pa; v += pa * (1 - pa); }
  return n ? {n, act: y / n * 100, exp: p / n * 100, gap: (y - p) / n * 100, se: Math.sqrt(v) / n * 100} : {n: 0}; };
const fmt = r => !r.n ? '      —' : `${String(r.n).padStart(5)} games  won ${r.act.toFixed(1)}%  grade expected ${r.exp.toFixed(1)}%  gap ${(r.gap >= 0 ? '+' : '') + r.gap.toFixed(1)} ±${(1.96 * r.se).toFixed(1)}`;
const NAME = {off: 'OFFENSE: types hit super-effectively', stack: 'DEFENSE: most members weak to one type (higher = worse)', gaps: 'DEFENSE: attacking types nobody resists (higher = worse)'};
for (const [f, d0] of [['off', 2], ['stack', 1], ['gaps', 2]]) {
  const r = corr(G.map(d => d.fa[f] - d.fb[f]), G.map(d => d.y)), rz = corr(G.map(d => d.fa[f] - d.fb[f]), G.map(d => d.z));
  const e = row(f, d0, d => !d.late), l = row(f, d0, d => d.late), all = row(f, d0, () => true);
  const real = e.n >= 300 && l.n >= 300 && Math.sign(e.gap) === Math.sign(l.gap) && Math.abs(e.gap) > 1.96 * e.se && Math.abs(l.gap) > 1.96 * l.se;
  console.log(`\n${NAME[f]}\n  plain correlation with winning: r = ${r.toFixed(3)} (with the grade's strength gap: r = ${rz.toFixed(3)})\n  side with more (by ${d0}+), all games: ${fmt(all)}\n    earlier half ${fmt(e)}\n    later half   ${fmt(l)}\n  verdict: ${e.n < 300 || l.n < 300 ? 'too few games to tell' : real ? (e.gap > 0 ? 'wins MORE than the grade expects in both halves: the grade underrates it' : 'wins LESS than the grade expects in both halves: the grade overrates it') : 'no gap beyond chance in both halves: the grade already accounts for it (or the effect is too small to see)'}`); }
