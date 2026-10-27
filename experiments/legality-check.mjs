// Copied from the Oct 28 reference check (pl-verify) so CI can run it. Needs @smogon/calc: npm install --no-save @smogon/calc@0.12.0
// (or set SMOGCALC to a folder whose node_modules has it). Checks the repo's own built page (app/dist/page.html).
// Legality + data check: the page's roster, moves, items, Mega stones vs Smogon's Champions data (@smogon/calc gen 0)
// and vs what real Reg M-C tournament teams actually register. Usage: node legality.mjs
import fs from 'node:fs'; import {createRequire} from 'node:module';
const require = createRequire(process.env.SMOGCALC ? process.env.SMOGCALC.replace(/\\/g, '/').replace(/\/?$/, '/x.js') : import.meta.url), {chromium} = createRequire(import.meta.url)('playwright');
const {Generations} = require('@smogon/calc'); const G0 = Generations.get(0);
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), DOCS = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'verify-legal.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
const P = await pg.evaluate(() => window.__ev(`({R:ROSTER.map(p=>({n:p.n,d:p.d,t:p.t,st:p.st,a:p.a,m:!!p.m,b:p.b})),
  L:Object.fromEntries(Object.entries(LEARN).map(([k,v])=>[k,v.map(i=>MV[i]&&MV[i].name).filter(Boolean)])),
  M:MV.map(m=>m&&({name:m.name,type:m.type,bp:m.bp,cat:m.cat})).filter(Boolean),
  ITEMS:(()=>{const s=new Set();for(const p of ROSTER){try{const st=setFor(p,'doubles');(st.it||[]).forEach(x=>s.add(x[0]))}catch(e){}}return [...s]})(),
  CALC:CALC_ITEMS, STONES:ROSTER.filter(p=>p.m).map(p=>{try{return [p.n,stoneFor(p)]}catch(e){return [p.n,null]}})})`));
await b.close(); fs.unlinkSync(page); 
// Reg M-C legal base species (regmc-legal.txt, from metavgc.com/regulations/regulationm-c, Oct 2026)
{ const id0 = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ''), legal = new Set(fs.readFileSync(new URL('./regmc-legal.txt', import.meta.url), 'utf8').split(/\r?\n/).filter(Boolean).map(id0));
  const base = p => String(p.b || p.n).replace(/-(Alola|Galar|Hisui|Paldea.*|Mega.*|F|M|Eternal|Low-Key|Amped|Small|Large|Super|Midnight|Dusk|Blue|Yellow|White|Wash|Heat|Mow|Frost|Fan|Combat|Blaze|Aqua)$/, '');
  const ill = P.R.filter(p => !legal.has(id0(base(p))));
  console.log(`REG M-C: ${P.R.length} page species; ${ill.length} whose base species is not on the Reg M-C list: ${ill.map(p => p.n).join(', ')}`); globalThis.__ill = ill.length; }
const id = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const out = [];
// species
const spMiss = P.R.filter(p => !G0.species.get(id(p.n)));
out.push(`roster: ${P.R.length} species on the page; ${spMiss.length} not in Smogon's Champions dex: ${spMiss.map(p => p.n).join(', ')}`);
const g0sp = [...G0.species].map(s => s.name), pageSet = new Set(P.R.map(p => id(p.n)));
const extra = g0sp.filter(n => !pageSet.has(id(n)));
out.push(`Smogon Champions dex species not on the page (${extra.length}): ${extra.join(', ')}`);
// base stats / types / abilities
const statDiff = [];
for (const p of P.R) { const s = G0.species.get(id(p.n)); if (!s) continue; const bs = s.baseStats, v = [bs.hp, bs.atk, bs.def, bs.spa, bs.spd, bs.spe];
  if (v.join() !== p.st.join()) statDiff.push(`${p.n}: page ${p.st.join('/')} vs ${v.join('/')}`);
  if (s.types.join() !== p.t.join()) statDiff.push(`${p.n}: types ${p.t.join('/')} vs ${s.types.join('/')}`);
  const ab = Object.values(s.abilities || {}); const pa = p.a.filter(a => !ab.includes(a)), sa = ab.filter(a => !p.a.includes(a)); if (pa.length || sa.length) statDiff.push(`${p.n}: abilities page-only [${pa}] smogon-only [${sa}]`); }
out.push(`species data differences (${statDiff.length}):\n  ` + statDiff.join('\n  '));
// moves: page move data vs smogon, learnsets page vs smogon learnsets unavailable in calc -> compare move existence only
const mvMiss = P.M.filter(m => !G0.moves.get(id(m.name)));
out.push(`moves on the page not in Smogon's Champions move list (${mvMiss.length}): ${mvMiss.map(m => m.name).join(', ')}`);
// items
const itemMiss = P.ITEMS.filter(i => !G0.items.get(id(i))), calcMiss = P.CALC.filter(i => i && !G0.items.get(id(i)));
out.push(`items players register (page usage data) not in Smogon Champions items (${itemMiss.length}): ${itemMiss.join(', ')}`);
out.push(`damage-calc item list entries not in Smogon Champions items (${calcMiss.length}): ${calcMiss.join(', ')}`);
for (const k of ['Choice Band', 'Choice Specs', 'Assault Vest', 'Life Orb', 'Choice Scarf', 'Focus Sash', 'Rocky Helmet', 'Eviolite', 'Booster Energy', 'Clear Amulet', 'Covert Cloak', 'Safety Goggles', 'Weakness Policy', 'Mirror Herb', 'Throat Spray', 'Loaded Dice', 'Light Clay', 'Lum Berry', 'White Herb', 'Psychic Seed', 'Electric Seed', 'Grassy Seed', 'Misty Seed', 'Expert Belt', 'Leftovers', 'Sitrus Berry', 'Black Sludge', 'Heavy-Duty Boots', 'Room Service', 'Eject Button', 'Eject Pack', 'Red Card', 'Quick Claw', 'Iron Ball', 'Lagging Tail', 'Scope Lens', 'Razor Claw', 'King\'s Rock', 'Damp Rock', 'Heat Rock', 'Smooth Rock', 'Icy Rock'])
  out.push(`  item ${k}: ${G0.items.get(id(k)) ? 'in Champions' : 'NOT in Champions data'}`);
// stones
const stoneMiss = P.STONES.filter(([n, s]) => !s || !G0.items.get(id(s)));
out.push(`Mega stones not in Smogon Champions items (${stoneMiss.length}): ${stoneMiss.map(x => x.join('@')).join(', ')}`);
// real tournament teams: species/items registered
const T = rd('official.json'), seen = new Map(), its = new Map();
for (const e of T.events) for (const t of e.teams) for (const m of t.mons) { seen.set(m.n, (seen.get(m.n) || 0) + 1); if (m.i) its.set(m.i, (its.get(m.i) || 0) + 1); }
const notOnPage = [...seen.keys()].filter(n => !pageSet.has(id(n)));
out.push(`species on official RK9 team sheets not on the page: ${notOnPage.join(', ') || 'none'}`);
out.push(`items on official RK9 sheets (${its.size}): ${[...its].sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(', ')}`);
const dupTeams = []; for (const e of T.events) for (const t of e.teams) { const c = new Map(); for (const m of t.mons) if (m.i) c.set(m.i, (c.get(m.i) || 0) + 1); const d = [...c].filter(x => x[1] > 1); if (d.length) dupTeams.push(`${e.name} #${t.st} ${t.player}: ${d.map(x => x[0]).join(',')}`); }
out.push(`official RK9 teams with duplicate items (should be 0 under Item Clause): ${dupTeams.length}${dupTeams.length ? '\n  ' + dupTeams.slice(0, 10).join('\n  ') : ''}`);
const megaCount = []; for (const e of T.events) for (const t of e.teams) { const k = t.mons.filter(m => /-Mega/.test(m.n) || /ite( [XYZ])?$/.test(m.i || '')).length; megaCount.push(k); }
const hist = {}; megaCount.forEach(k => hist[k] = (hist[k] || 0) + 1); out.push(`Mega stones per official team: ${JSON.stringify(hist)}`);
fs.writeFileSync('legality.out.txt', out.join('\n')); console.log(out.join('\n'));
const fails = (globalThis.__ill || 0) + itemMiss.length + calcMiss.length + stoneMiss.length;
if (fails) { console.log(`FAIL: ${globalThis.__ill || 0} illegal species, ${itemMiss.length + calcMiss.length} unknown items, ${stoneMiss.length} unknown stones`); process.exit(1); }
