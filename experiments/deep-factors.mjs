// Deep Check Step 3 (Nov 8): does the grade get each battle factor right in SINGLE games? (Sim: single games first.)
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
const page = ROOT + `app/df-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const key = s => [...s].sort().join('|'), sixes = [...new Set(R.flatMap(g => [key(g.p[0]), key(g.p[1])]))];
const F = {};
const code = ch => `(()=>{const o={};const PRI=new Set(['Sucker Punch','Extreme Speed','Aqua Jet','Grassy Glide','Bullet Punch','Ice Shard','Shadow Sneak','Mach Punch','Quick Attack','Vacuum Wave','Jet Punch','First Impression','Accelerock','Thunderclap']);
 const WX=new Set(['Drought','Drizzle','Sand Stream','Snow Warning','Orichalcum Pulse']);
 for(const k of ${JSON.stringify(ch)}){try{const ns=k.split('|');if(ns.some(n=>!byName.get(n)))continue;const ms=assignItems(ns.map(n=>abMember(byName.get(n))));
  const x=strengthX(ns,ms).xRaw;const mv=ms.map(m=>memberMoves(m).moves.map(z=>z.name||z));const has=n=>mv.some(L=>L.includes(n));const cnt=n=>mv.filter(L=>L.includes(n)).length;
  const ck={};for(const it of (proChecks(ms,true)||{items:[]}).items)if(!it.skip)ck[it.k]=it.ok?1:0;
  const phys=ms.filter(m=>m.p.st&&m.p.st[1]>m.p.st[3]).length;const wx=new Set(ms.map(m=>m.ability).filter(a=>WX.has(a)));
  o[k]=[x,{
   'Mega used (replays only show USED Megas: not a fair test)':ms.some(m=>m.p.m)?1:0,
   'speed control (site check)':ck.speed??null,'lead support (site check)':ck.fake??null,'spread damage (site check)':ck.spread??null,
   'Fake Out':has('Fake Out')?1:0,'Intimidate':ms.some(m=>m.ability==='Intimidate')?1:0,'two Fake Out users':cnt('Fake Out')>=2?1:0,
   'redirection':has('Follow Me')||has('Rage Powder')?1:0,'Tailwind':has('Tailwind')?1:0,'Trick Room':has('Trick Room')?1:0,
   'Tailwind AND Trick Room':has('Tailwind')&&has('Trick Room')?1:0,'priority attack':mv.some(L=>L.some(n=>PRI.has(n)))?1:0,
   'Wide Guard':has('Wide Guard')?1:0,'Protect on 4+':cnt('Protect')>=4?1:0,
   'Spore answer (Grass, Overcoat, Goggles)':ms.some(m=>(m.p.t||[]).includes('Grass')||m.ability==='Overcoat'||m.item==='Safety Goggles')?1:0,
   '5+ physical attackers':phys>=5?1:0,'two weather setters':wx.size>=2?1:0}]}catch(e){}}return JSON.stringify(o)})()`;
for (let i = 0; i < sixes.length; i += 150) Object.assign(F, JSON.parse(await pg.evaluate(c => window.__ev(c), code(sixes.slice(i, i + 150)))));
const calib = +(rd('model.json').calib) || 1;
await b.close(); fs.unlinkSync(page);
const sig = z => 1 / (1 + Math.exp(-z)), ts = R.map(g => g.t).sort((a, b) => a - b), mid = ts[ts.length >> 1];
const G0 = R.map(g => { const A = F[key(g.p[0])], B = F[key(g.p[1])]; if (!A || !B) return null;
  return {z: A[0] - B[0], p: sig(calib * (A[0] - B[0])), y: g.w === 0 ? 1 : 0, fa: A[1], fb: B[1], late: g.t >= mid, hi: Math.min(g.r[0] || 0, g.r[1] || 0) >= 1400}; }).filter(Boolean);
// single games are noisier than tournament rounds: refit the grade's confidence on these games (one number, k) before
// judging any factor, or every factor that goes with a high grade would look "overrated" just from overconfidence
let k = 0; for (let it = 0; it < 30; it++) { let g = 0, h = 0; for (const d of G0) { const q = sig(k * d.z); g += (d.y - q) * d.z; h += q * (1 - q) * d.z * d.z; } k += g / h; }
const llOf = f => G0.reduce((s, d) => { const q = f(d); return s - Math.log(d.y ? q : 1 - q); }, 0) / G0.length;
console.log(`confidence: the page uses ${calib.toFixed(3)}; best fit for single ladder games ${k.toFixed(3)} (log-loss ${llOf(d => d.p).toFixed(4)} -> ${llOf(d => sig(k * d.z)).toFixed(4)})`);
const G = G0.map(d => ({...d, p: sig(k * d.z)}));
const ll = G.reduce((s, d) => s - Math.log(d.y ? d.p : 1 - d.p), 0) / G.length, acc = G.filter(d => (d.p > .5) === !!d.y).length / G.length;
console.log(`${G.length} single games (ladder replays ${new Date(ts[0] * 1000).toISOString().slice(0, 10)} – ${new Date(ts[ts.length - 1] * 1000).toISOString().slice(0, 10)}), ${Object.keys(F).length} sixes graded`);
console.log(`the grade picks the winner ${(acc * 100).toFixed(1)}% of the time (coin flip 50%), log-loss ${ll.toFixed(4)} (coin flip 0.6931)`);
const row = (k, sel) => { let n = 0, y = 0, p = 0, v = 0; for (const d of G) { if (!sel(d)) continue; const a = d.fa[k], c = d.fb[k]; if (a == null || c == null || a === c) continue; const pa = a ? d.p : 1 - d.p, ya = a ? d.y : 1 - d.y; n++; y += ya; p += pa; v += pa * (1 - pa); }
  return n ? {n, act: y / n * 100, exp: p / n * 100, gap: (y - p) / n * 100, se: Math.sqrt(v) / n * 100} : {n: 0}; };
const fmt = r => !r.n ? '      —' : `${String(r.n).padStart(5)}  won ${r.act.toFixed(1)}% vs grade ${r.exp.toFixed(1)}%  ${(r.gap >= 0 ? '+' : '') + r.gap.toFixed(1)} ±${(1.96 * r.se).toFixed(1)}`;
console.log('\nside WITH the factor vs side without (games where they differ): how it really did vs what the grade expected');
for (const k of Object.keys(Object.values(F)[0][1])) {
  const e = row(k, d => !d.late), l = row(k, d => d.late), h = row(k, d => d.hi);
  const real = e.n >= 300 && l.n >= 300 && Math.sign(e.gap) === Math.sign(l.gap) && Math.abs(e.gap) > 1.96 * e.se && Math.abs(l.gap) > 1.96 * l.se;
  const verdict = e.n < 300 || l.n < 300 ? 'too few games to tell' : real ? (e.gap > 0 ? 'GRADE UNDERRATES IT (both slices)' : 'GRADE OVERRATES IT (both slices)') : 'grade about right (both slices within range)';
  console.log(`\n${k}: ${verdict}\n   earlier ${fmt(e)}\n   later   ${fmt(l)}\n   1400+   ${fmt(h)}`); }
