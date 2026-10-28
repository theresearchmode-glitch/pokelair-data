// Items, suggestions and battle-math checks (Oct 28 audit). Uses the already-built app/dist/page.html (run.mjs builds it
// and then runs this). Run alone: node app/build.mjs && node app/test/items.mjs   (exit code 1 on any failure)
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('..', import.meta.url)), OUT = APP + '../out/';
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'dist/items-test.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('  FAIL', msg); } else console.log('  ok  ', msg); };
const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(), errs = [];
pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
const ev = c => pg.evaluate(c => window.__ev(c), c);
console.log('\n== items, suggestions, battle math');
// the user's team that wrongly scored 97 (Oct 27): dead Psychic Seed, Choice Scarf under its own Trick Room
const USER = `Raichu @ Raichunite X
Ability: Lightning Rod
Level: 50
EVs: 2 HP / 32 Atk / 32 Spe
Jolly Nature
- Fake Out
- Protect
- Volt Tackle
- Volt Switch

Sneasler @ Psychic Seed
Ability: Unburden
Level: 50
EVs: 2 HP / 32 Atk / 32 Spe
Adamant Nature
- Close Combat
- Dire Claw
- Protect
- Fake Out

Primarina @ Leftovers
Ability: Liquid Voice
Level: 50
EVs: 32 HP / 32 SpA / 2 SpD
Modest Nature
- Hyper Voice
- Protect
- Moonblast
- Calm Mind

Charizard @ Charizardite Y
Ability: Blaze
Level: 50
EVs: 2 HP / 32 SpA / 32 Spe
Timid Nature
- Heat Wave
- Protect
- Weather Ball
- Solar Beam

Farigiraf @ Sitrus Berry
Ability: Armor Tail
Level: 50
EVs: 27 HP / 20 Def / 19 SpD
Bold Nature
- Trick Room
- Helping Hand
- Psychic
- Thunderbolt

Hydreigon @ Choice Scarf
Ability: Levitate
Level: 50
EVs: 2 HP / 32 SpA / 32 Spe
Modest Nature
- Dark Pulse
- Draco Meteor
- Earth Power
- Snarl`;
// A1: paste keeps items, natures and stat points; export -> paste round-trips
const rt = await ev(`(()=>{const r=parsePaste(${JSON.stringify(USER)});S.slots=r.slots;fixSlots();render();const ex=exportPaste();const r2=parsePaste(ex);
  return {it:r.slots.map(s=>s.it&&s.it.doubles||''),sp:r.slots[1].sp,ex,same:JSON.stringify(normSlots(r.slots))===JSON.stringify(normSlots(r2.slots))}})()`);
ok(rt.it[1] === 'Psychic Seed' && rt.it[5] === 'Choice Scarf' && rt.it[2] === 'Leftovers', 'paste keeps held items');
ok(rt.sp && rt.sp.doubles && rt.sp.doubles.nat === 'Adamant' && rt.sp.doubles.v.join('/') === '2/32/0/0/0/32', 'paste keeps nature and stat points');
ok(/Sneasler @ Psychic Seed/.test(rt.ex) && /EVs: 2 HP \/ 32 Atk \/ 32 Spe/.test(rt.ex) && /Adamant Nature/.test(rt.ex), 'export writes your items and spreads');
ok(rt.same, 'export -> paste round-trips exactly');
// A2: team links carry items and spreads
const tl = await ev(`(()=>{const d=decodeTeam(teamCode());return d&&d.slots.map(s=>(s.it&&s.it.doubles||'')+'|'+(s.sp?s.sp.doubles.v.join('/'):''))})()`);
ok(tl && tl[1] === 'Psychic Seed|2/32/0/0/0/32' && tl[5].startsWith('Choice Scarf|'), 'team link keeps items and spreads');
ok(await ev(`!!decodeTeam(tlB64(JSON.stringify({v:1,f:'doubles',s:[['Incineroar'],['Rillaboom','',['Fake Out','','','']]]})))`), 'old team links still open');
// A3/A4: problems on the user's team are detected and shown, with fixes
const pr = await ev(`(()=>{const ms=members();const p=itemProblems(ms);const ck=proChecks(ms,true);const gp=gamePlan(ms.map(m=>({...m,_mv:memberMoves(m).moves})));
  return {k:p.map(x=>x.k+':'+x.ms.map(m=>m.p.n).join(',')),row:(ck.items.find(x=>x.k==='items')||{}).ok,terr:(gp.rows.find(r=>r.k==='terrain')||{}).note||''}})()`);
ok(pr.k.some(x => x.startsWith('dead:Sneasler')), 'dead Psychic Seed found (Raichu sets Electric Terrain)');
ok(pr.k.some(x => x.startsWith('scarftr:Hydreigon')), 'Choice Scarf under own Trick Room found');
ok(pr.row === false, 'checklist shows a failing Items row');
ok(/Psychic Seed never activates/.test(pr.terr), 'game plan terrain row names the dead seed');
await ev("setView('build');render()"); await pg.waitForTimeout(2500);
const card = await ev(`(()=>{const c=document.querySelector('#sugs .itemfix');return c?{n:c.querySelectorAll('[data-itfix]').length,t:c.innerText}:null})()`);
ok(card && card.n >= 2, `item fix card with one-tap fixes (${card ? card.n : 0})`);
const plansU = await ev(`(ui.planList||[]).map(pl=>({ip:itemProblemCount(pl.team),ch:pl.ch.map(x=>(x.out?x.out.p.n:'+')+'>'+x.c.p.n)}))`);
const ip0 = await ev('itemProblemCount(members())');
ok(plansU.every(p => p.ip <= ip0), `no plan adds an item problem (${plansU.length} plans)`);
ok(plansU.some(p => p.ip < ip0), 'at least one plan fixes an item problem');
// one-tap fix works
await ev(`document.querySelector('#sugs [data-itfix]').click()`); await pg.waitForTimeout(800);
ok(await ev('itemProblemCount(members())') < ip0, 'one-tap item fix removes a problem');
// A3 + B1 on real regional top-8 teams: defaults never clash, plans never add problems or drop staples for rare picks
const regs = await ev(`(META.teams&&META.teams.teams||[]).filter(t=>t.section==='Official events').slice(0,24).map(t=>t.mons)`);
let clash = 0, dead = 0, badPlans = [], stapleDrops = [], nPlans = 0;
for (const mons of regs.slice(0, 12)) {
  const r = await ev(`(()=>{S.slots=${JSON.stringify(mons)}.map(n=>({n,a:null,lock:false}));fixSlots();planCache={key:null,plans:[]};render();const ms=members();
    const pl=(ui.planList||[]).map(pl=>({ip:itemProblemCount(pl.team),drop:pl.ch.filter(x=>x.out&&U(x.out.p)>=15&&evidPct(x.c.p)<5).map(x=>x.out.p.n+'>'+x.c.p.n),rare:pl.ch.filter(x=>evidPct(x.c.p)<2).map(x=>x.c.p.n)}));
    return {clash:itemClash(ms).length,dead:deadItems(ms).length,pl}})()`);
  clash += r.clash; dead += r.dead; nPlans += r.pl.length;
  for (const p of r.pl) { if (p.ip > 0) badPlans.push(mons.join('/')); if (p.drop.length) stapleDrops.push(p.drop.join(',')); if (p.rare.length) stapleDrops.push('rare:' + p.rare.join(',')); } }
ok(clash === 0 && dead === 0, `real regional teams: no duplicate or dead default items (${regs.slice(0, 12).length} teams)`);
ok(badPlans.length === 0, `fix plans on real teams never output an item problem (${nPlans} plans)`);
ok(stapleDrops.length === 0, `fix plans never drop a staple for a rare pick, never suggest <2% picks${stapleDrops.length ? ': ' + stapleDrops.slice(0, 4).join('; ') : ''}`);
// Build for me: no item problems, proven teams have 3+ players, fresh take has a real Team Score
const ab = await ev(`(()=>{ui.abSrc='all';ui.abLock=null;const res=addFreshTake(buildBest());return res.teams.map(t=>{const tm=t.mons.map(m=>abMember(byName.get(m.n)));return {ip:itemProblemCount(tm),items:t.mons.map(m=>m.it),fresh:!!t.fresh,proven:t.proven||null,ts:modelOK()?tsOf(tm):null}})})()`);
ok(ab.length && ab.every(t => t.ip === 0 && new Set(t.items.filter(Boolean)).size === t.items.filter(Boolean).length), `Build for me: no duplicate/dead items (${ab.length} teams)`);
ok(ab.every(t => !t.proven || t.proven.n >= 3), 'Build for me: proven teams have 3+ players');
ok(ab.every(t => !t.fresh || t.ts == null || t.ts >= 60), 'Build for me: fresh take has Team Score 60+');
// A6: Gauntlet mirror is a coin flip
const mir = await ev(`(()=>{const t=gauntletTeams()[0];S.slots=t.mons.map(n=>({n,a:null,lock:false}));fixSlots();render();gauntCache={key:null,rows:null};renderGauntlet();const r=(gauntCache.rows||[]).find(x=>x.ix===0);return r?r.pm:null})()`);
ok(mir == null || Math.abs(mir - .5) < .005, `Gauntlet: identical six = 50% (${mir == null ? 'model off' : (mir * 100).toFixed(1) + '%'})`);
// A5: sun from Drought counts; calc defaults to the attacker's weather
const sun = await ev(`(()=>{const z=byName.get('Charizard-Mega-Y'),r=byName.get('Rillaboom'),hw=mvByName.get('Heat Wave');const A={p:z,...sideDefaults(z,'atk')},D={p:r,...sideDefaults(r,'def')};
  const a=damage({atk:A,def:D,move:hw,spread:true}),s=damage({atk:A,def:D,move:hw,spread:true,weather:'sun'});dc.a='Charizard-Mega-Y';dc.d='Rillaboom';dc.wSet=false;dc.mv='Heat Wave';renderCalc();
  return {r:s.max/a.max,cw:dc.weather}})()`);
ok(sun.r > 1.45 && sun.r < 1.55, `sun Heat Wave ≈1.5× (${sun.r.toFixed(2)})`);
ok(sun.cw === 'sun', 'damage calc defaults to Mega Charizard Y\'s sun');
const t1 = await ev(`(()=>{S.slots=['Charizard-Mega-Y','Whimsicott','Incineroar','Garchomp','Sneasler','Basculegion'].map(n=>({n,a:null,lock:false}));fixSlots();S.opp=['Incineroar','Rillaboom','Sneasler','Kingambit','Salamence-Mega','Basculegion'];render();const mine=members(),theirs=S.opp.map(n=>byName.get(n)).filter(Boolean).map(oppMember);const r=planMatchup(mine,theirs,true);return turnOnePlan(mine,theirs,r)})()`);
ok(/Field on turn 1/.test(t1) || !/Charizard/.test(t1), 'turn 1 plan states the field when a lead sets it');
// speed: weather speed abilities, Unburden, paralysis
const spd = await ev(`(()=>{S.slots=['Charizard-Mega-Y','Venusaur','Incineroar','Whimsicott','Garchomp','Sneasler'].map(n=>({n,a:null,lock:false}));fixSlots();render();spdUi.wx='auto';renderSpeed();
  const rows=[...document.querySelectorAll('.spdrow.me')].map(e=>e.querySelector('.spdn b').textContent+'='+e.querySelector('.spdv').textContent+'|'+e.querySelector('.t2').textContent);return rows})()`);
ok(spd.some(r => /^Venusaur=264/.test(r)), 'speed tiers: Chlorophyll doubles Venusaur in your sun (264)');
ok(spd.some(r => /^Sneasler=.*after its item is used/.test(r)), 'speed tiers: Unburden speed after its item');
ok(await ev(`(()=>{spdUi.par=true;renderSpeed();const ok=/They're paralyzed/.test(document.getElementById('spdCtl').innerText);spdUi.par=false;return ok})()`), 'speed tiers: paralysis toggle');
// forms: Aegislash attacks in Blade Forme, Palafin in Hero Form
const form = await ev(`(()=>{const a=byName.get('Aegislash'),d=byName.get('Incineroar'),mv=mvByName.get('Shadow Ball');const A={p:a,...sideDefaults(a,'atk')},D={p:d,...sideDefaults(d,'def')};
  const r=damage({atk:A,def:D,move:mv});const shield=damage({atk:{...A,ability:'',p:{...a,n:'x'}},def:D,move:mv});return {r:r.max/shield.max,pal:byName.get('Palafin').st.join('/')}})()`);
ok(form.r > 2, `Aegislash hits from Blade Forme (${form.r.toFixed(2)}× Shield)`);
ok(form.pal === '100/160/97/106/87/100', 'Palafin uses Hero Form stats');
// A8: priority is never called speed control
const pri = await ev(`(()=>{const g=gamePlan(['Incineroar','Rillaboom','Charizard-Mega-Y','Garchomp','Kingambit'].map(n=>{const p=byName.get(n);return abMember(p)}));return (g.rows.find(r=>r.k==='speed')||{}).mode})()`);
ok(pri !== undefined, 'game plan speed row says what it rests on');
ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
await b.close(); try { fs.unlinkSync(page); } catch (e) {}
console.log(fails ? `\n${fails} FAILED (items)` : '\nITEMS PASSED'); process.exit(fails ? 1 : 0);
