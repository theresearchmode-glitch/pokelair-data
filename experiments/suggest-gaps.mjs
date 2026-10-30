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
  ok(!all.some(x => x.worse.length), `${label}: no suggestion takes away speed control, lead support, Trick Room attackers, terrain or weather${all.filter(x => x.worse.length).map(x => ` (${x.names}: ${x.worse})`).join('')}`);
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
{ const r = await run(['Farigiraf', 'Indeedee-F', 'Sneasler', 'Garchomp', 'Dragonite', 'Whimsicott'], 'box');
  ok(r.plans.slice(0, 2).some(x => x.fix.includes('trfit')), `Trick Room with no slow attackers: a slow attacker is in the first two plans (${r.plans.map(x => x.names).join(' | ')})`); clean('Trick Room without slow attackers', r); }
const sample = await pg.evaluate(() => window.__ev('DEFAULT_TEAM.slots.map(s=>s.n)'));
for (const [label, team] of [['sun team, Incineroar the only lead support', ['Torkoal', 'Venusaur', 'Incineroar', 'Garchomp', 'Kingambit', 'Whimsicott']], ['Venusaur + Mega Charizard Y, Whimsicott the only Tailwind', ['Venusaur-Mega', 'Charizard-Mega-Y', 'Incineroar', 'Garchomp', 'Kingambit', 'Whimsicott']], ['sample team', sample]])
  for (const pool of ['box', 'all']) clean(`${label} (${pool})`, await run(team, pool));
ok(!errs.length, 'no page errors ' + errs.join(' | '));
await b.close(); fs.unlinkSync(page); console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED'); process.exit(fails.length ? 1 : 0);
