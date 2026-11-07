// Battle lead logic (Nov 7 audit): the 40 most-run Reg M-C tournament teams, each against the 12 most-run teams, through the
// Battle planner (planMatchup). A recommended lead pair must never:
//   - put two different weather setters or two terrain setters side by side (each cancels the other's)
//   - put Indeedee's Psychic Terrain next to the team's own Fake Out (it blocks it), unless real players run that pair well
//   - put a Trick Room setter next to a different Tailwind setter (each undoes the other's speed advantage)
// and the four it brings should rarely leave a setter without anything that uses its field (counted, at most a few).
// Also the threat verdicts: each answer's move is in its Pokémon's set, and Tailwind / rain / sun are only claimed when real.
// Uses the built page (run app/build.mjs first). Usage: node experiments/lead-logic.mjs
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = APP + 'lead-logic.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const pg = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
const r = JSON.parse(await pg.evaluate(() => window.__ev(`(()=>{const recs=RES.records.slice().sort((a,b)=>b[1]-a[1]).map(r=>r[0]);const mk=t=>t.map(n=>byName.get(n)).filter(Boolean).map(p=>abMember(p));
  const bad={wx:[],ter:[],psy:[],trtw:[]},soft=[];let n=0;
  for(const t of recs.slice(0,40)){const ms=mk(t);if(ms.length<6)continue;for(const o of recs.slice(0,12)){const th=mk(o);if(th.length<6)continue;const r=planMatchup(ms,th,true);n++;
    const Ld=r.lead.map(i=>ms[i]),C=r.chosen.map(i=>ms[i]),tag=Ld.map(m=>m.d).join(' + ')+' vs '+o.slice(0,2).join('/');
    if(new Set(Ld.map(m=>WEATHER_OF[m.ability]).filter(Boolean)).size>1)bad.wx.push(tag);
    if(new Set(Ld.map(m=>TERRAIN_OF[m.ability]).filter(Boolean)).size>1)bad.ter.push(tag);
    if(Ld.length===2&&psyBlocked(Ld).some(m=>mvsOf(m).includes('Fake Out')))bad.psy.push(tag);
    const tr=Ld.find(m=>relMove(m,ROLE.tr)[0]>=.5),tw=Ld.find(m=>relMove(m,ROLE.tw)[0]>=.5);if(tr&&tw&&tr!==tw)bad.trtw.push(tag);
    if(teamFlaws(C).some(f=>/nobody|no slow/.test(f))&&!teamFlaws(ms).some(f=>/nobody|no slow/.test(f)))soft.push(C.map(m=>m.d).join(', ')+' vs '+o.slice(0,2).join('/'));}}
  return JSON.stringify({n,bad,soft})})()`)));
const show = a => a.length ? ': ' + a.slice(0, 3).join(' | ') : '';
ok(!r.bad.wx.length, `no lead pair has two different weather setters (${r.n} matchups)${show(r.bad.wx)}`);
ok(!r.bad.ter.length, `no lead pair has two different terrain setters${show(r.bad.ter)}`);
ok(!r.bad.psy.length, `no lead puts Psychic Terrain next to the team's own Fake Out${show(r.bad.psy)}`);
ok(!r.bad.trtw.length, `no lead puts a Trick Room setter next to a different Tailwind setter${show(r.bad.trtw)}`);
ok(r.soft.length <= Math.ceil(r.n * .03), `the four brought rarely leaves a setter without its users (${r.soft.length} of ${r.n}, at most 3%)${show(r.soft)}`);
// threat verdicts (Nov 7 audit): every "handled" answer relies on a move its Pokémon really has, the threat's move is in its usual
// set, and "with Tailwind", "in rain", "in sun" are only said when the team has them
const v = JSON.parse(await pg.evaluate(() => window.__ev(`(()=>{const recs=RES.records.slice().sort((a,b)=>b[1]-a[1]).map(r=>r[0]).slice(0,40);const bad=[];let n=0;
  for(const t of recs){const team=t.map(n=>byName.get(n)).filter(Boolean).map(p=>abMember(p));if(team.length<6)continue;const ms=assignItems(team),R=THR.teamReport(ms);
    const mvOf=nm=>{const m=ms.find(x=>x.p.n===nm||x.d===nm);return m?(m.moves||[]).map(x=>x.name):null};
    const tw=ms.some(m=>(m.moves||[]).some(x=>x.name==='Tailwind')),wx=wxSetsOf(ms);
    for(const row of R.rows)for(const h of [...(row.solid||[]),...(row.soft||[])]){n++;const du=h.du||{},o=du.o,mv=mvOf(h.m),why=h.why||'',tm=(row.t.moves||[]).map(x=>x.name),dn=du.d&&(du.d.name||String(du.d.mv).split(' (')[0]);
      if(o&&o.mv&&mv&&!mv.includes(o.mv))bad.push(h.m+' answers '+row.t.n+' with '+o.mv+', which it does not have');
      if(dn&&tm.length&&!tm.includes(dn))bad.push(row.t.n+"'s "+dn+' is not in its usual set');
      if(/with Tailwind/.test(why)&&!tw)bad.push('"with Tailwind" on a team without it: '+why);
      if(/ in rain/.test(why)&&!wx.includes('rain'))bad.push('"in rain" on a team without rain: '+why);if(/ in sun/.test(why)&&!wx.includes('sun'))bad.push('"in sun" on a team without sun: '+why);}}
  return JSON.stringify({n,bad})})()`)));
ok(!v.bad.length, `threat verdicts on 40 tournament teams match the real movesets and field (${v.n} answers)${show(v.bad)}`);
ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
await b.close(); fs.unlinkSync(page);
console.log(fails.length ? `${fails.length} FAILED` : 'ALL PASSED'); process.exit(fails.length ? 1 : 0);
