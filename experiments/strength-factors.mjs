// Strength Score, Phase 2 step 1 (Sim, Nov 9): every factor for every real tournament team sheet, computed by the built page itself
// (app/dist/page.html), so the numbers are exactly what the site would compute. Sheets load the way checks-real.mjs loads them
// (memberOf with the sheet's moves, item and Ability; an unknown set counts as the typical build).
// Per deck (one player's sheet): x0 (team strength in the model's units: Pokémon + pairs + sets + team terms), today's grade s and
// its expected win e (CH.gradeOf), ready (readiness for the top 30 threats, %), mega (has a Mega), maxStack and w3 (type weak
// spots), stackOK/w3OK (the two checks), off (types hit super effectively, of 18), unres (attacking types nobody resists),
// protect (members with Protect), itemProblems, phys/spec (attackers by category), dup (most members sharing one type).
// MODEL=<file> uses another model (Phase 3: one per walk-forward week, trained only on earlier games); default out/model.json.
// Usage: node experiments/strength-factors.mjs <out.json> [MODEL=file] [CK_LIMIT=n]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const OUTF = process.argv[2]; if (!OUTF) { console.error('usage: node experiments/strength-factors.mjs <out.json>'); process.exit(2); }
const MODEL = process.env.MODEL ? JSON.parse(fs.readFileSync(process.env.MODEL, 'utf8')) : rd('model.json');
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': MODEL, 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const MT = rd('matches.json'), teams = MT.teams.map(k => k.split('|'));
const G0 = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1] && g[7] != null && g[8] != null);
const deckTeam = new Map(); for (const g of G0) { deckTeam.set(g[7], g[0]); deckTeam.set(g[8], g[1]); }
const sheet = d => { const t = teams[deckTeam.get(d)], by = new Map(t.map(n => [n, {n, mv: [], i: null, a: null}]));
  for (const fi of MT.decks[d] || []) { const f = MT.feats[fi], m = f.match(/^(.+?)([:@#])(.+)$/); if (!m || !by.has(m[1])) continue; const o = by.get(m[1]);
    if (m[2] === ':') o.mv.push(m[3]); else if (m[2] === '@') o.i = m[3]; else o.a = m[3]; }
  return [...by.values()]; };
const decks = [...deckTeam.keys()].slice(0, +(process.env.CK_LIMIT || 1e9));
const page = ROOT + `app/sf-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
await pg.evaluate(c => window.__ev(c), `S.megaGoal=1;S.maxMega=2;window.__SF=sh=>{try{const ms0=sh.map((m,i)=>{const p=byName.get(m.n);if(!p)return null;const mv=m.mv.filter(x=>mvByName.has(x)).slice(0,4);
    return memberOf({n:m.n,a:p.a.includes(m.a)?m.a:null,lock:false,...(mv.length?{mv:{doubles:mv}}:{}),...(!p.m&&m.i?{it:{doubles:m.i}}:{})},i)}).filter(Boolean);
  if(ms0.length!==6)return null;const ms=assignItems(ms0),names=ms.map(m=>m.p.n);
  const RD=THR.teamReport(ms),CK=proChecks(ms,true),G=CH.gradeOf(RD,CK,ms),st=stateScore(ms,true),sh2=typeShape(st.a),xs=strengthX(names,ms);
  const ok=k=>{const x=CK.items.find(i=>i.k===k);return x?(x.ok?1:x.part?.5:0):null};
  const mv=ms.map(m=>((m._mv&&m._mv.length?m._mv:m.moves)||[]));const dmg=mv.map(L=>L.filter(z=>z&&z.cat>0&&z.bp>0));
  const phys=dmg.filter(L=>L.some(z=>z.cat===1)).length,spec=dmg.filter(L=>L.some(z=>z.cat===2)).length;
  const tc={};for(const m of ms)for(const t of (m.types||m.p.t||[]))tc[t]=(tc[t]||0)+1;
  return {x0:xs.x0,s:G?G.s:null,e:G?G.e:null,ready:RD?RD.score:null,mega:ms.some(m=>m.p.m)?1:0,maxStack:sh2.maxStack,w3:sh2.w3,stackOK:ok('stack'),w3OK:ok('w3'),reachOK:ok('reach'),
    off:st.off,unres:st.a.unresisted.length,protect:mv.filter(L=>L.some(z=>z&&z.name==='Protect')).length,itemProblems:(typeof itemProblems==='function'?itemProblems(ms).length:0),phys,spec,dup:Math.max(...Object.values(tc))}}catch(e){return {err:String(e).slice(0,80)}}};'1'`);
const F = {}; const B = 100;
try { for (let s = 0; s < decks.length; s += B) { const part = decks.slice(s, s + B), sh = part.map(sheet);
    const r = JSON.parse(await pg.evaluate(a => JSON.stringify(a.map(x => window.__SF(x))), sh)); part.forEach((d, i) => { F[d] = r[i]; });
    console.error(`factors ${Math.min(s + B, decks.length)}/${decks.length}`); } }
finally { await b.close(); fs.unlinkSync(page); }
fs.writeFileSync(OUTF, JSON.stringify({made: new Date().toISOString(), model: process.env.MODEL || 'out/model.json', decks: decks.length, F}));
const V = Object.values(F), errs = V.filter(v => !v || v.err).length; console.log(`${decks.length} sheets, ${errs} not loadable`);
