// Suggestions audit (Nov 7, Sim: "suggesting a weather that won't be used is a bad suggestion", then "there's a lot of
// suggestion loops"). Real tournament teams (the most-run Reg M-C sixes, some with one member missing) plus the team that
// started it (Pelipper with nothing using the rain). For every team the suggestions My team shows are checked, then the top
// one is applied again and again, the way a player taps Apply, and every step is checked the same way.
// A shown suggestion must never:
//   - set a weather nothing else on the team uses (a lone Pelipper), add a second weather or a second terrain
//   - bring an attacker the team's own rain or sun weakens (Volcarona into rain)
//   - bring Indeedee's Psychic Terrain onto 2+ teammates whose priority it blocks (Fake Out, Sucker Punch…)
//   - bring a Trick Room setter with no slow attacker to use it, or take away the team's speed control
//   - repeat a species, or cost more than 3 readiness points or 3 grade points (2 each for a "different look" swap; Nov 7:
//     the grade is the big number on My team and the cards are labelled with it)
// and a team whose weather nothing uses gets a fix for it (a user for the weather, or the setter swapped out) in its first two.
// and tapping Apply must never go round in circles (a team you already had comes back).
// Also: none of the 300 most-run tournament teams may be called a weather nobody uses (the rule must not flag real teams).
// Uses the built page (run app/build.mjs first). Usage: node experiments/suggest-audit.mjs [teams=20] [steps=4]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const NT = +(process.argv[2] || 20), STEPS = +(process.argv[3] || 4);
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = APP + 'suggest-audit.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const pg = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
const recs = (L.results.records || []).slice().sort((a, b) => b[1] - a[1]).map(r => r[0]);
const teams = [['Pelipper, nothing uses the rain (Nov 7)', ['Staraptor-Mega', 'Gholdengo', 'Raichu-Mega-Y', 'Arcanine-Hisui', 'Rillaboom', 'Pelipper']],
  ['Primarina team (Nov 7)', ['Staraptor-Mega', 'Gholdengo', 'Raichu-Mega-Y', 'Primarina', 'Rillaboom', 'Incineroar']],
  ['Politoed with Fire attackers', ['Politoed', 'Arcanine-Hisui', 'Incineroar', 'Garchomp', 'Sinistcha', 'Kingambit']],
  ['Pelipper + Archaludon (4 open)', ['Pelipper', 'Archaludon']]];
recs.slice(0, NT).forEach((t, i) => teams.push(['tournament #' + (i + 1), t]));
recs.slice(0, Math.round(NT / 2)).forEach((t, i) => teams.push(['tournament #' + (i + 1) + ' minus one', t.filter((_, j) => j !== (i * 7) % 6)]));
// one step: the suggestions My team shows for the team now (the Fix it plans, or the capped different-look swaps), each checked
const STEP = `(()=>{fixSlots();planCache={key:null,plans:[]};const ms=members(),mv=m=>({...m,_mv:memberMoves(m).moves}),g0=gamePlan(ms.map(mv)),row=(g,k)=>g.rows.find(r=>r.k===k)||{};
  const plans=planFixes(ms,suggestPool(),true);let base=null;try{base=ms.length===6?tsOf(ms):null}catch(e){}
  ui.plans=plans;ui.vsum={RD:{score:base}};ui.planList=plans.slice();try{CH.sugs()}catch(e){}const side=!plans.length,L=(ui.planList||[]).slice(0,3);
  const P=new Set([...ROLE.prio,'Fake Out']),flags=[];
  L.forEach((pl,k)=>{const t=pl.team,g=pl.gp||gamePlan(t.map(mv)),name=pl.ch.map(x=>(x.out?x.out.p.n+'>':'+')+x.c.p.n).join(' '),f=s=>flags.push(name+': '+s);
    if(row(g,'weather').lone&&(!row(g0,'weather').lone||pl.ch.some(x=>WEATHER_OF[x.c.mem.ability])))f('a weather nothing else on the team uses');
    if(wxSetsOf(t).length>1&&wxSetsOf(t).length>wxSetsOf(ms).length)f('a second weather');
    const tk=new Set(t.map(m=>TERRAIN_OF[m.ability]).filter(Boolean)),tk0=new Set(ms.map(m=>TERRAIN_OF[m.ability]).filter(Boolean));if(tk.size>1&&tk.size>tk0.size)f('a second terrain');
    if(wxHurtIn(gp0x(ms),pl))f('an attacker the team\\'s own weather weakens');
    if(psyHit(pl)>=2)f('Psychic Terrain blocks '+psyHit(pl)+' teammates\\' priority');
    if(trNew(g0,{gp:g})==='miss')f('a Trick Room setter with no slow attacker');
    if(row(g0,'speed').st==='ok'&&row(g,'speed').st!=='ok')f('loses speed control');
    if(new Set(t.map(m=>m.p.b)).size<t.length)f('a repeated species');
    let ts=pl._ts;if(ts===undefined&&t.length===6){try{ts=tsOf(t)}catch(e){ts=null}}if(ts!=null&&base!=null&&ts<base-(side?2:3))f((ts-base)+' readiness points');
    const gb=ms.length===6?gradeTeam(ms):null,gp=planGrade(pl);if(gb!=null&&gp!=null&&gp<gb-(side?2:3))f('grade '+gb+' → '+gp);});
  if(row(g0,'weather').lone&&!plans.slice(0,2).some(pl=>pl.gap&&pl.gap.fix.includes('weather')))flags.push('nothing in the first two suggestions fixes the weather nobody uses');
  const top=L[0];if(top){if(!ui.swOut||ui.swKey!==S.slots.map(x=>x.n||'').join())ui.swOut=new Set();top.ch.forEach(x=>{if(x.out)ui.swOut.add(x.out.p.b)});
    top.ch.forEach(x=>{S.slots[x.slot]={n:x.c.p.n,a:x.c.mem.ability||null,lock:false}});ui.swKey=S.slots.map(x=>x.n||'').join()}
  return JSON.stringify({team:ms.map(m=>m.p.n).sort().join(),flags,applied:top?top.ch.map(x=>(x.out?x.out.p.n+'>':'+')+x.c.p.n).join(' '):null})})()`;
await pg.evaluate(() => window.__ev(`window.gp0x=ms=>gamePlan(ms.map(m=>({...m,_mv:memberMoves(m).moves})));S.box=[];ui.pool='all';S.maxMega=1;S.megaGoal=1;`));
for (const [label, t] of teams) {
  await pg.evaluate(t => window.__ev(`ui.swOut=null;ui.swKey=null;S.slots=${JSON.stringify(t)}.map(n=>({n,a:null,lock:false}));while(S.slots.length<6)S.slots.push({n:'',a:null,lock:false});`), t);
  const seen = [], bad = [], path = [];
  for (let s = 0; s <= STEPS; s++) { let r; try { r = JSON.parse(await pg.evaluate(c => window.__ev(c), STEP)); } catch (e) { bad.push('error: ' + e.message.split('\n')[0]); break; }
    if (seen.includes(r.team)) { bad.push('Apply went round in circles: ' + path.join(' then ')); break; }
    seen.push(r.team); r.flags.forEach(f => bad.push((s ? 'after ' + path.join(', ') + ': ' : '') + f)); if (!r.applied) break; path.push(r.applied); }
  ok(!bad.length, `${label}${bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ` (${path.length} applies, no loop)`}`);
}
// the weather rule must not flag real teams
const lone = [];
for (const t of recs.slice(0, 300)) { const r = await pg.evaluate(t => window.__ev(`(()=>{const ms=${JSON.stringify(t)}.map(n=>byName.get(n)).filter(Boolean).map(p=>({...memberFrom(p,metaAbility(p)||undefined),p,d:p.d}));const r=gp0x(ms).rows.find(r=>r.k==='weather')||{};return r.lone?1:0})()`), t).catch(() => 0); if (r) lone.push(t.join(', ')); }
ok(!lone.length, `none of the ${Math.min(300, recs.length)} most-run tournament teams is called a weather nothing uses${lone.length ? ': ' + lone.slice(0, 3).join(' | ') : ''}`);
ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
await b.close(); fs.unlinkSync(page);
console.log(fails.length ? `${fails.length} FAILED` : 'SUGGESTIONS AUDIT PASSED'); process.exit(fails.length ? 1 : 0);
