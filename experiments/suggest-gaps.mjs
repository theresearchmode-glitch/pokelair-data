// Suggestion gaps (Oct 30, Sim): a team's own game-plan gaps must surface in its suggestions, and no suggestion may make the
// game plan or the checklist worse. Mega Swampert (Swift Swim) with nothing setting rain must get a rain setter in the first
// two Fix it plans and the first two All suggestions; a sun setter must never be suggested next to it; a box with no rain
// setter says so; Sand Rush gets sand, a Trick Room team gets a slow attacker; no top suggestion lowers the checklist score
// or takes away lead support, speed control, Trick Room attackers, terrain or weather.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/teams': rd('teams.json')};
const page = APP + 'suggest-gaps.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const pg = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
// one case: the team, box and pool; returns the first plans and All suggestions with what each does to the game plan
const run = (team, pool, box) => pg.evaluate(([team, pool, box]) => window.__ev(`(()=>{S.slots=${JSON.stringify(team)}.map(n=>({n,a:null,lock:false}));while(S.slots.length<6)S.slots.push({n:'',a:null,lock:false});
  S.box=${box ? JSON.stringify(box) : 'DEFAULT_BOX.slice()'};ui.pool='${pool}';ui.recSrc='${pool === 'all' ? 'all' : 'box'}';fixSlots();planCache={key:null,plans:[]};recCache={key:null,val:null};
  const ms=members(),gp0=gamePlan(ms),ck0=(proChecks(ms,true)||{pass:0}).pass,plans=planFixes(ms,suggestPool(),true),rc=computeRecs(ms,true);
  const d=pl=>({names:pl.ch.map(x=>(x.out?x.out.d+'→':'+')+x.c.p.d).join(' & '),sets:[...new Set(pl.ch.map(x=>WEATHER_OF[x.c.mem.ability]).filter(Boolean))],fix:pl.gap?pl.gap.fix:[],why:pl.gap?pl.gap.why:[],clash:!!(pl.gap&&pl.gap.clash),worse:gpWorse(gp0,gamePlan(pl.team)),ckDrop:(proChecks(pl.team,true)||{pass:0}).pass<ck0});
  return {plans:plans.slice(0,3).map(d),recs:(rc.clean||[]).slice(0,3).map(d),gapNote:plans.gapNote||''}})()`), [team, pool, box]);
const swampert5 = ['Gholdengo', 'Swampert-Mega', 'Sylveon', 'Indeedee-F', 'Staraptor-Mega'], swampert6 = [...swampert5, 'Tinkaton'];
const noRain = (await pg.evaluate(() => window.__ev('DEFAULT_BOX'))).filter(n => !['Pelipper', 'Politoed'].includes(n));
const clean = (label, r) => { const all = [...r.plans, ...r.recs];
  ok(!all.some(x => x.clash), `${label}: no suggestion adds a weather that works against the team's own`);
  ok(!all.some(x => x.worse.length), `${label}: no suggestion takes away speed control, Trick Room attackers or weather (terrain and lead support: see GUARD_KEYS, Nov 9)${all.filter(x => x.worse.length).map(x => ` (${x.names}: ${x.worse})`).join('')}`);
  ok(!all.some(x => x.ckDrop), `${label}: no suggestion lowers the checklist score${all.filter(x => x.ckDrop).map(x => ` (${x.names})`).join('')}`); };
for (const [label, team, pool] of [['Mega Swampert, 5 Pokémon, my box', swampert5, 'box'], ['Mega Swampert, 6 Pokémon, my box', swampert6, 'box'], ['Mega Swampert, 6 Pokémon, whole roster', swampert6, 'all']]) {
  const r = await run(team, pool);
  ok(r.plans.slice(0, 2).some(x => x.sets.includes('rain') && x.fix.includes('weather')), `${label}: a rain setter is in the first two Fix it plans (${r.plans.map(x => x.names).join(' | ')})`);
  ok(r.recs.slice(0, 2).some(x => x.sets.includes('rain') && x.fix.includes('weather')), `${label}: a rain setter is in the first two All suggestions (${r.recs.map(x => x.names).join(' | ')})`);
  ok([...r.plans, ...r.recs].some(x => x.why.some(w => /^Sets rain for Mega Swampert \(Swift Swim\)/.test(w))), `${label}: the reason says "Sets rain for Mega Swampert (Swift Swim)"`);
  ok(![...r.plans, ...r.recs].some(x => x.sets.some(w => w !== 'rain')), `${label}: no sun, sand or snow setter is suggested next to Swift Swim`);
  clean(label, r); }
{ const r = await run(swampert6, 'box', noRain);
  ok(/needs rain/.test(r.gapNote) && /Box \+ catch/.test(r.gapNote), `box with no rain setter: the plans say so and point to Box + catch / Whole roster ("${r.gapNote}")`); clean('box with no rain setter', r); }
{ const r = await run(['Excadrill', 'Rotom-Wash', 'Incineroar', 'Whimsicott', 'Kingambit', 'Sylveon'], 'box');
  ok(r.plans.slice(0, 2).some(x => x.sets.includes('sand') && x.fix.includes('weather')), `Sand Rush Excadrill without sand: a sand setter is in the first two plans (${r.plans.map(x => x.names).join(' | ')})`); clean('Sand Rush without sand', r); }
/* Nov 18: Gholdengo in place of Whimsicott: with Whimsicott's Tailwind, Trick Room is the second mode and too few slow attackers is a note (rule-holes sweep, hole 3) */
{ const r = await run(['Farigiraf', 'Indeedee-F', 'Sneasler', 'Garchomp', 'Dragonite', 'Gholdengo'], 'box');
  ok(r.plans.slice(0, 2).some(x => x.fix.includes('trfit')), `Trick Room with no slow attackers: a slow attacker is in the first two plans (${r.plans.map(x => x.names).join(' | ')})`); clean('Trick Room without slow attackers', r); }
const sample = await pg.evaluate(() => window.__ev('DEFAULT_TEAM.slots.map(s=>s.n)'));
for (const [label, team] of [['sun team, Incineroar the only lead support', ['Torkoal', 'Venusaur', 'Incineroar', 'Garchomp', 'Kingambit', 'Whimsicott']], ['Venusaur + Mega Charizard Y, Whimsicott the only Tailwind', ['Venusaur-Mega', 'Charizard-Mega-Y', 'Incineroar', 'Garchomp', 'Kingambit', 'Whimsicott']], ['sample team', sample]])
  for (const pool of ['box', 'all']) clean(`${label} (${pool})`, await run(team, pool));
// never a second terrain (Nov 18: on live data a plan swapped Sneasler for Rillaboom next to Indeedee's Psychic Surge). The gate is
// checked on that exact plan (does not depend on the day's data), then every plan and More idea for that team.
{ const r = await pg.evaluate(() => window.__ev(`(()=>{S.slots=['Corviknight','Indeedee','Salamence-Mega','Sneasler','Tyranitar-Mega','Basculegion'].map(n=>({n,a:null,lock:false}));
  S.box=DEFAULT_BOX.slice();ui.pool='all';ui.swOut=null;fixSlots();planCache={key:null,plans:[]};const ms=members(),nm=pl=>pl.ch.map(x=>(x.out?x.out.d+'→':'+')+x.c.p.d).join(' & ');
  const mk=n=>{const p=byName.get(n),mm=memberFrom(p,metaAbility(p)||undefined);return {p,mem:{...mm,i:-1,p,d:p.d}}},sn=ms.find(m=>m.p.n==='Sneasler'),cv=ms.find(m=>m.p.n==='Corviknight'),A=mk('Rillaboom'),B=mk('Kingambit');
  const team=ms.map(x=>x===sn?{...A.mem,i:x.i}:x===cv?{...B.mem,i:x.i}:x),pl={ch:[{out:sn,slot:sn.i,c:A},{out:cv,slot:cv.i,c:B}],team,gp:gamePlan(team)};
  const t2=t=>new Set(t.map(m=>TERRAIN_OF[m.ability]).filter(Boolean)).size>1,plans=planFixes(ms,suggestPool(),true);
  return {gate:wxLoneBad(gamePlan(ms),pl),bad:[...plans,...(plans.more||[])].filter(pl=>t2(pl.team)).map(nm)}})()`));
  ok(r.gate, 'Psychic Surge team: a plan bringing in Rillaboom (Grassy Surge) is blocked as a second terrain');
  ok(!r.bad.length, `Psychic Surge team: no plan or More idea adds a second terrain${r.bad.length ? ' (' + r.bad.join(' | ') + ')' : ''}`); }
// a support setter's own Weather Ball uses its weather (Sim, Nov 18: Weather Ball only works in weather); its own Water moves or
// Hurricane still don't (Nov 7). Checked with the sets typed in (does not depend on the day's data), then with the usual sets.
{ const r = await pg.evaluate(() => window.__ev(`(()=>{const T=['Gengar-Mega','Incineroar','Kingambit','Kommo-o','Politoed','Rillaboom'];
  const mk=(n,mv)=>{const p=byName.get(n),m={...memberFrom(p,metaAbility(p)||undefined),p,d:p.d};if(mv){const x=mv.map(name=>({name}));m.custom=true;m.moves=x;m._mv=x}else m._mv=memberMoves(m).moves;return m};
  const lone=pt=>!!(gamePlan(T.map(n=>mk(n,n==='Politoed'?pt:null))).rows.find(r=>r.k==='weather')||{}).lone;
  return {wb:lone(['Weather Ball','Muddy Water','Perish Song','Protect']),noWb:lone(['Muddy Water','Ice Beam','Perish Song','Protect']),meta:lone(null)}})()`));
  ok(!r.wb, 'Perish Trap Politoed with Weather Ball: its rain is not called a weather nothing uses');
  ok(r.noWb, 'the same Politoed with Muddy Water and Ice Beam but no Weather Ball: still a weather nothing uses');
  ok(!r.meta, 'Perish Trap team (Mega Gengar, Incineroar, Kingambit, Kommo-o, Politoed, Rillaboom) with the usual sets: not flagged'); }
// sun + rain (Nov 18 rule-holes sweep): Chlorophyll Venusaur is still the team's speed mode when Pelipper also sets rain, so the
// team has speed control and no suggestion "adds speed control" by swapping out a weather setter
{ const r = await pg.evaluate(() => window.__ev(`(()=>{const mk=(n,a,mv)=>{const p=byName.get(n),m={...memberFrom(p,a),p,d:p.d},x=mv.map(name=>({name}));m.custom=true;m.moves=x;m._mv=x;return m};
  const T=[mk('Charizard-Mega-Y','Drought',['Heat Wave','Solar Beam','Protect','Overheat']),mk('Venusaur','Chlorophyll',['Sleep Powder','Giga Drain','Earth Power','Protect']),
    mk('Pelipper','Drizzle',['Hurricane','Weather Ball','Wide Guard','Protect']),mk('Archaludon','Stamina',['Electro Shot','Draco Meteor','Flash Cannon','Protect']),
    mk('Garchomp-Mega-Z','Rough Skin',['Earthquake','Dragon Claw','Rock Slide','Protect']),mk('Grimmsnarl','Prankster',['Reflect','Light Screen','Spirit Break','Fake Out'])];
  const sp=gamePlan(T).rows.find(r=>r.k==='speed')||{},one=gamePlan(T.filter(m=>m.p.n!=='Pelipper'&&m.p.n!=='Archaludon')).rows.find(r=>r.k==='speed')||{};return {st:sp.st,who:sp.who,one:one.st}})()`));
  ok(r.st === 'ok', `sun + rain team: Chlorophyll Venusaur still counts as speed control (${r.st}: ${r.who})`);
  ok(r.one === 'ok', `the same sun core alone: speed control as before (${r.one})`); }
// Trick Room on a fast team (Nov 18 rule-holes sweep, hole 3): Imprison + Trick Room, or Trick Room next to Tailwind, is not the flaw
// "Trick Room with no slow attacker"; Trick Room as the only mode with no slow attacker still is
{ const r = await pg.evaluate(() => window.__ev(`(()=>{const mk=(n,a,mv)=>{const p=byName.get(n),m={...memberFrom(p,a),p,d:p.d},x=mv.map(name=>({name}));m.custom=true;m.moves=x;m._mv=x;return m};
  const base=[mk('Charizard-Mega-Y','Drought',['Heat Wave','Air Slash','Protect','Overheat']),mk('Garchomp','Rough Skin',['Earthquake','Dragon Claw','Rock Slide','Protect']),mk('Glimmora','Toxic Debris',['Power Gem','Sludge Bomb','Spiky Shield','Mortal Spin'])];
  const ind=mv=>mk('Indeedee','Psychic Surge',mv),whim=mk('Whimsicott','Prankster',['Tailwind','Moonblast','Encore','Protect']),gh=mk('Gholdengo','Good as Gold',['Make It Rain','Shadow Ball','Nasty Plot','Protect']),sn=mk('Sneasler','Unburden',['Close Combat','Dire Claw','Fake Out','Protect']);
  const fl=t=>teamFlaws(t).includes('Trick Room with no slow attacker');
  return {imp:fl([...base,ind(['Trick Room','Imprison','Follow Me','Psychic']),gh,sn]),tw:fl([...base,ind(['Trick Room','Follow Me','Psychic','Helping Hand']),whim,sn]),plain:fl([...base,ind(['Trick Room','Follow Me','Psychic','Helping Hand']),gh,sn])}})()`));
  ok(!r.imp, 'Imprison + Trick Room Indeedee on a fast team: not "Trick Room with no slow attacker"');
  ok(!r.tw, 'Trick Room next to Whimsicott\'s Tailwind on a fast team: not "Trick Room with no slow attacker"');
  ok(r.plain, 'Trick Room as the only speed mode with no slow attacker: still "Trick Room with no slow attacker"'); }
// a weather weakens an attacker only by its role (Nov 18 rule-holes sweep, hole 5): a support Milotic (Haze) on a sun team is not
// "its weather weakens its own attacker"; an attacking Milotic still is, and so is a Rage Powder Volcarona in rain
{ const r = await pg.evaluate(() => window.__ev(`(()=>{const mk=(n,a,mv)=>{const p=byName.get(n),m={...memberFrom(p,a),p,d:p.d},x=mv.map(name=>({name}));m.custom=true;m.moves=x;m._mv=x;return m};
  const sun=[mk('Charizard-Mega-Y','Drought',['Heat Wave','Solar Beam','Protect','Overheat']),mk('Rillaboom','Grassy Surge',['Fake Out','Grassy Glide','Wood Hammer','Protect']),mk('Aerodactyl','Unnerve',['Tailwind','Rock Slide','Wide Guard','Protect']),
    mk('Drampa-Mega','Berserk',['Draco Meteor','Hyper Voice','Protect','Heat Wave']),mk('Farigiraf','Armor Tail',['Trick Room','Psychic Noise','Protect','Helping Hand'])];
  const rain=[mk('Pelipper','Drizzle',['Hurricane','Weather Ball','Tailwind','Protect']),mk('Archaludon','Stamina',['Electro Shot','Draco Meteor','Flash Cannon','Protect']),mk('Kingambit','Defiant',['Kowtow Cleave','Sucker Punch','Iron Head','Protect']),
    mk('Incineroar','Intimidate',['Fake Out','Flare Blitz','Parting Shot','Knock Off']),mk('Rillaboom','Grassy Surge',['Fake Out','Grassy Glide','Wood Hammer','Protect'])];
  const fl=t=>teamFlaws(t).includes('its weather weakens its own attacker');
  return {sup:fl([...sun,mk('Milotic','Competitive',['Haze','Muddy Water','Ice Beam','Protect'])]),att:fl([...sun,mk('Milotic','Competitive',['Muddy Water','Scald','Ice Beam','Protect'])]),volc:fl([...rain,mk('Volcarona','Flame Body',['Heat Wave','Bug Buzz','Rage Powder','Protect'])])}})()`));
  ok(!r.sup, 'support Milotic (Haze) on a sun team: not "its weather weakens its own attacker"');
  ok(r.att, 'attacking Milotic (Muddy Water, Scald, Ice Beam) on a sun team: still "its weather weakens its own attacker"');
  ok(r.volc, 'Rage Powder Volcarona on a rain team: still "its weather weakens its own attacker"'); }
// a weather override is a use (Nov 18 rule-holes sweep, hole 4): a support setter with a support job of its own (Yawn Hippowdon next
// to Mega Gengar, Will-O-Wisp Ninetales) is not "a weather nothing uses"; one with plain attacks still is, and a plan may still never
// bring one in for a team that has nothing to use its weather (Nov 7 rule)
{ const r = await pg.evaluate(() => window.__ev(`(()=>{const mk=(n,a,mv)=>{const p=byName.get(n),m={...memberFrom(p,a),p,d:p.d},x=mv.map(name=>({name}));m.custom=true;m.moves=x;m._mv=x;return m};
  const gen=[mk('Gengar-Mega','Shadow Tag',['Shadow Ball','Sludge Bomb','Protect','Perish Song']),mk('Incineroar','Intimidate',['Fake Out','Flare Blitz','Parting Shot','Knock Off']),mk('Whimsicott','Prankster',['Tailwind','Moonblast','Encore','Protect']),
    mk('Sylveon','Pixilate',['Hyper Voice','Moonblast','Protect','Quick Attack']),mk('Dragonite','Inner Focus',['Extreme Speed','Dragon Claw','Protect','Fire Punch'])];
  const tal=[mk('Indeedee-F','Psychic Surge',['Follow Me','Psychic','Helping Hand','Protect']),mk('Gardevoir-Mega','Trace',['Hyper Voice','Psychic','Protect','Moonblast']),mk('Kingambit','Defiant',['Kowtow Cleave','Sucker Punch','Iron Head','Protect']),
    mk('Dragonite','Inner Focus',['Extreme Speed','Dragon Claw','Protect','Iron Head']),mk('Sylveon','Pixilate',['Hyper Voice','Moonblast','Protect','Quick Attack'])];
  const lone=t=>!!(gamePlan(t).rows.find(r=>r.k==='weather')||{}).lone,fl=t=>teamFlaws(t).includes('weather nobody uses');
  const hipY=mk('Hippowdon','Sand Stream',['High Horsepower','Stone Edge','Protect','Yawn']),hipA=mk('Hippowdon','Sand Stream',['High Horsepower','Stone Edge','Rock Slide','Protect']);
  const nt=mk('Ninetales','Drought',['Fire Blast','Heat Wave','Protect','Will-O-Wisp']);
  const base=[...gen,mk('Farigiraf','Armor Tail',['Psychic Noise','Hyper Voice','Helping Hand','Protect'])],out=base[5],tm=[...gen,{...hipY,i:out.i}];
  const pl={ch:[{out,slot:out.i,c:{p:hipY.p,mem:hipY}}],team:tm,gp:gamePlan(tm)};
  return {yawn:lone([...gen,hipY])||fl([...gen,hipY]),att:lone([...gen,hipA]),wisp:lone([...tal,nt])||fl([...tal,nt]),gate:wxLoneBad(gamePlan(base),pl)}})()`));
  ok(!r.yawn, 'Yawn Hippowdon next to Mega Gengar (a weather override): not "a weather nothing uses"');
  ok(!r.wisp, 'Will-O-Wisp Ninetales on a team with nothing using sun (a weather override): not "a weather nothing uses"');
  ok(r.att, 'Hippowdon with plain attacks and nothing using sand: still "a weather nothing uses"');
  ok(r.gate, 'a plan bringing a Yawn Hippowdon into a team with nothing using sand: still blocked'); }
ok(!errs.length, 'no page errors ' + errs.join(' | '));
await b.close(); fs.unlinkSync(page); console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED'); process.exit(fails.length ? 1 : 0);
