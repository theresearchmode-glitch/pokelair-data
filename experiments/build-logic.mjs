// Build logic (audit, Oct 30): Build for me and Build around it never make a team with two different weather setters, a
// weather user (Swift Swim, Sand Rush, Sand Force…) without its setter, or a Choice Scarf next to the team's own Trick Room;
// new teams come with speed control; a Swift Swim Pokémon is never suggested onto a sun team; Megas on team 0 with a Mega in
// explains itself; Add to my team on a full team names exactly who it replaces; and a normal build takes under a second here.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'build-logic.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const pg = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"x"'); window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
const ev = c => pg.evaluate(c => window.__ev(c), c);
// one build: every team with its weather setters, unmet weather needs, Scarf next to its own Trick Room, and speed control
const build = (lock, src, mg, box) => ev(`(async()=>{S.megaGoal=${mg};ui.abSrc='${src}';ui.abLock=${lock ? `'${lock}'` : 'null'};S.box=${box ? JSON.stringify(box) : 'DEFAULT_BOX.slice()'};
  const t0=performance.now();const res=await abRun();const ms=Math.round(performance.now()-t0);
  return {ms,teams:(res.teams||[]).map(t=>{const mem=t.mons.map(m=>abMember(byName.get(m.n))),tA=assignItems(mem);
    return {names:t.mons.map(m=>m.d).join(', '),proven:!!t.proven,sets:wxSetsOf(mem),unmet:wxUnmet(mem),clash:wxConflict(mem),
      scarfTR:mem.some(m=>setsTR(m))&&tA.some(m=>m.item==='Choice Scarf'),speed:(gamePlan(mem).rows.find(r=>r.k==='speed')||{}).st}})}})()`);
const cases = [['Alolan Ninetales', 'Ninetales-Alola', 'all', 2], ['Tyranitar', 'Tyranitar', 'all', 1], ['Excadrill', 'Excadrill', 'all', 1], ['Mega Abomasnow', 'Abomasnow-Mega', 'all', 2],
  ['Politoed', 'Politoed', 'all', 1], ['Hatterene', 'Hatterene', 'all', 1], ['Farigiraf', 'Farigiraf', 'all', 1], ['whole roster, 0 Megas', null, 'all', 0], ['my box, 2 Megas', null, 'box', 2],
  ['small box (Pelipper + Charizard), 2 Megas', null, 'box', 2, ['Incineroar', 'Garchomp', 'Pelipper', 'Basculegion', 'Whimsicott', 'Sylveon', 'Kingambit', 'Charizard']]];
for (const [label, lock, src, mg, box] of cases) {
  const r = await build(lock, src, mg, box), made = r.teams.filter(t => !t.proven);
  ok(r.teams.length > 0, `${label}: builds at least one team (${r.teams.length}, ${r.ms} ms)`);
  ok(!made.some(t => t.clash), `${label}: no built team has two weathers or a weather user switched off by the team's own${made.filter(t => t.clash).map(t => ` (${t.names}: ${t.sets})`).join('')}`);
  ok(!made.some(t => t.unmet.length), `${label}: no built team has a weather user without its setter${made.filter(t => t.unmet.length).map(t => ` (${t.names}: needs ${t.unmet})`).join('')}`);
  ok(!r.teams.some(t => t.scarfTR), `${label}: no Choice Scarf next to the team's own Trick Room${r.teams.filter(t => t.scarfTR).map(t => ` (${t.names})`).join('')}`);
  ok(!made.some(t => t.speed === 'miss'), `${label}: every newly built team has speed control${made.filter(t => t.speed === 'miss').map(t => ` (${t.names})`).join('')}`); }
// timing: a normal build here (unthrottled desktop) stays under a second
{ const r = await build(null, 'box', 2); console.log(`  info build time (my box, 2 Megas, unthrottled): ${r.ms} ms`); ok(r.ms < 1500, `a normal build finishes in under 1.5 s unthrottled (${r.ms} ms)`); }
// plans: Mega Swampert (Swift Swim) is never suggested onto the sample Mega Charizard Y sun team; Pelipper's rain isn't credited
// next to Fire attackers that it weakens
const plans = (team, pool, mg, swap) => ev(`(()=>{S.slots=${JSON.stringify(team)}.map(n=>({n,a:null,lock:false}));while(S.slots.length<6)S.slots.push({n:'',a:null,lock:false});S.box=DEFAULT_BOX.slice();
  S.megaGoal=${mg};S.maxMega=Math.max(1,${mg});$('swapMega').checked=${!!swap};ui.pool='${pool}';ui.recSrc='${pool === 'all' ? 'all' : 'box'}';fixSlots();planCache={key:null,plans:[]};recCache={key:null,val:null};
  const ms=members(),p=planFixes(ms,suggestPool(),true),rc=computeRecs(ms,true),nm=pl=>pl.ch.map(x=>x.c.p.n);
  return {ins:[...p,...(p.more||[]),...(rc.clean||[]),...(rc.more||[])].map(nm),note:p.gapNote||''}})()`);
const sample = await ev('DEFAULT_TEAM.slots.map(s=>s.n)');
for (const pool of ['box', 'boxfill', 'all']) { const r = await plans(sample, pool, 2);
  ok(!r.ins.some(n => n.includes('Swampert-Mega')), `sample sun team (${pool}): Mega Swampert (Swift Swim) is never suggested`); }
{ const r = await plans(sample, 'boxfill', 0, true);
  ok(/has 1 Mega and Megas on team is set to 0/.test(r.note), `Megas on team 0 with a Mega in: the plans explain it ("${r.note}")`); }
// cores: Add to my team on a full team names who goes, keeps the team's only Mega, and warns past 2 Megas
{ const t = await ev(`(()=>{S.slots=DEFAULT_TEAM.slots.map(s=>({...s}));fixSlots();return {txt:coreConfirmText(['Pelipper','Archaludon']),plan:corePlan(['Pelipper','Archaludon']),mega:members().filter(m=>m.mega).map(m=>m.p.n)}})()`);
  ok(/^Replace \S.* and \S.*\?$/.test(t.txt), `Add to my team on a full team names both Pokémon it replaces ("${t.txt}")`);
  ok(t.mega.every(n => t.plan.next.some(s => s.n === n)), `Add to my team keeps the team's only Mega (${t.mega})`);
  const t3 = await ev(`(()=>{S.slots=['Charizard-Mega-Y','Garchomp-Mega','Incineroar','Whimsicott','Rillaboom','Sneasler'].map(n=>({n,a:null,lock:false}));fixSlots();return coreConfirmText(['Floette-Mega','Kingambit'])})()`);
  ok(/3 Megas/.test(t3), `a core that would make 3 Megas says so ("${t3}")`); }
ok(!errs.length, 'no page errors ' + errs.join(' | '));
await b.close(); fs.unlinkSync(page); console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED'); process.exit(fails.length ? 1 : 0);
