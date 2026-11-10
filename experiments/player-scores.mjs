// Focus plan f1-players (Nov 10): where do everyday players' teams land on the Strength Score? We don't collect visitors' teams
// (privacy), so Showdown ladder sixes stand in: grouped by the player's ladder rating (under 1200 ≈ beginners, 1200-1400,
// 1400-1600, 1600+), scored by the built page with the live model and typical sets (replays don't show sets). Compared with
// real tournament sheets (median 80, 10th percentile 70.2). Each six counted once per rating group.
// Can't see: the sets players really ran; unrated sides are left out. Usage: node experiments/player-scores.mjs [perGroup=150]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8')), PER = +(process.argv[2] || 150);
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const R = rd('replays.json'), G = [['under 1200', 0, 1200], ['1200-1400', 1200, 1400], ['1400-1600', 1400, 1600], ['1600+', 1600, 9999]];
const groups = G.map(() => new Map());
for (const g of R.games) for (const s of [0, 1]) { const r = g.r && g.r[s]; if (!r || g.p[s].length !== 6) continue; const gi = G.findIndex(([, lo, hi]) => r >= lo && r < hi); if (gi < 0) continue; const k = g.p[s].slice().sort().join('|'); if (!groups[gi].has(k)) groups[gi].set(k, g.p[s]); }
let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = m => { const a = [...m.values()]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, PER); };
const page = ROOT + `app/ps-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const q = (a, p) => a[Math.min(a.length - 1, Math.floor(p * a.length))];
try {
  console.log('group        sixes  scored  10%   25%  median  75%   90%   under 60  60s   70s   80s   90+   no Mega');
  for (const [gi, [lab]] of G.entries()) { const S = pick(groups[gi]);
    const res = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{const out=[];for(const names of ${JSON.stringify(S)}){try{S.slots=names.map(n=>({n,a:null,lock:false}));fixSlots();const ms=members();if(ms.length!==6)continue;const g=gradeTeam(ms);if(g!=null)out.push([g,ms.some(m=>m.mega)?1:0])}catch(e){}}return JSON.stringify(out)})()`));
    const v = res.map(x => x[0]).sort((a, c) => a - c), share = (lo, hi) => (v.filter(x => x >= lo && x < hi).length / v.length * 100).toFixed(0) + '%';
    console.log(`${lab.padEnd(12)} ${String(groups[gi].size).padStart(5)}  ${String(v.length).padStart(5)}  ${[.1, .25, .5, .75, .9].map(p => q(v, p).toFixed(1).padStart(5)).join(' ')}   ${[[-1, 60], [60, 70], [70, 80], [80, 90], [90, 101]].map(([a, c]) => share(a, c).padStart(5)).join(' ')}   ${(res.filter(x => !x[1]).length / res.length * 100).toFixed(0)}%`); }
} finally { await b.close(); fs.unlinkSync(page); }
console.log('Tournament sheets for comparison (strength-score.md): 10% 70.2 · 25% 74.9 · median 80.0 · 75% 84.3 · 90% 87.8');
