// The stage (Nov 3 redesign): My team's lead / back / leave-home suggestion and the change you make to it, the plan → stage
// colour map, the no-overlap placement on awkward teams, tap a Pokémon to see its set, one yellow button, and the info sheet
// on the same stage. Run on its own (node app/test/stage.mjs, after a build) or from run.mjs.
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('..', import.meta.url)), OUT = APP + '../out/';
const page = APP + 'dist/test-stage.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('  FAIL', msg); } else console.log('  ok  ', msg); };
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { window.__PL_TEST = true;
  window.claude = {use: async n => { await new Promise(r => setTimeout(r, 20));
    if (n === 'db') return {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})};
    if (n === 'user') return {id: async () => 'u_test', isOwner: () => true}; return null; }}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(2500);
const E = c => pg.evaluate(c => window.__ev(c), c);
const team = async names => { await E(`localStorage.removeItem('cc2.lineup');S.loadedId=null;S.slots=${JSON.stringify(names.map(n => ({n})))};while(S.slots.length<6)S.slots.push(blank());fixSlots();render();setView('report',false);0`); await pg.waitForTimeout(500); };
const SAMPLE = ['Staraptor-Mega', 'Gholdengo', 'Raichu-Mega-Y', 'Primarina', 'Rillaboom', 'Incineroar'];

// 1. palette: white text on every stage colour, both themes
const pal = await E(`(()=>{const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]};return Object.entries(__STG.PAL).map(([t,c])=>[t,...c.map(h=>1.05/(L(h)+.05))])})()`);
ok(pal.length >= 18 && pal.every(r => r[1] >= 6.5 && r[2] >= 6.5), `white text on every stage colour is 6.5:1 or more (worst ${Math.min(...pal.flatMap(r => [r[1], r[2]])).toFixed(1)})`);
ok(await E(`!Object.values(__STG.PAL).flat().some(h=>{const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(d<.15)return false;let hu=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;hu=(hu*60+360)%360;return hu<15||hu>345})`), 'no stage colour is red (hue 345–15°; red is for opponents)');

// 2. lead / back / leave home
await team(SAMPLE);
let s = await E(`(()=>{const L=__STG.lineup(members());return {lead:L.lead.map(m=>m.p.n),back:L.back.map(m=>m.p.n),home:L.home.map(m=>m.p.n),by:L.by,custom:L.custom}})()`);
ok(s.lead.length === 2 && s.back.length === 2 && s.home.length === 2 && new Set([...s.lead, ...s.back, ...s.home]).size === 6, `six split 2 lead / 2 back / 2 home (${s.lead} | ${s.back} | ${s.home})`);
ok(s.by === 'meta' && !s.custom, `the suggestion comes from the four-vs-the-meta's-six planner (${s.by})`);
{ const f = await E(`(()=>{const F=CH.four(members());return [F?F.lead.join():'none',__STG.lineup(members()).lead.map(m=>m.p.n).join()]})()`);
  ok(f[0] === f[1], `the leads match Battle mode's planner, CH.four (${f[0]} / ${f[1]})`); }
const stage = await pg.evaluate(() => ({figs: [...document.querySelectorAll('#chTeam .stg-figs .pk')].map(b => b.dataset.stgpk), bench: [...document.querySelectorAll('#chTeam .stg-bench [data-stgpk]')].map(b => b.dataset.stgpk)}));
ok(stage.figs.length === 4 && stage.bench.length === 2, `the stage shows the four, the leave-home row the other two (${stage.figs.length} + ${stage.bench.length})`);
// change it: tap the first leave-home Pokémon, make it a lead
const mover = s.home[0];
await pg.click(`#chTeam .stg-bench [data-stgpk="${mover}"]`); await pg.waitForTimeout(400);
ok(await E(`(document.querySelector('#stgSet .set-name')||{}).textContent.replace(/\\s+/g,' ').toLowerCase()===byName.get(${JSON.stringify(mover)}).d.toLowerCase()`), `tapping ${mover} shows its set`);
ok(await pg.evaluate(n => document.querySelector(`#chTeam [data-stgpk="${n}"]`).getAttribute('aria-pressed') === 'true', mover), 'the tapped Pokémon is marked pressed');
await pg.click('#stgSet [data-stgrole="lead"]'); await pg.waitForTimeout(500);
s = await E(`(()=>{const L=__STG.lineup(members());return {lead:L.lead.map(m=>m.p.n),home:L.home.map(m=>m.p.n),custom:L.custom,saved:JSON.parse(localStorage.getItem('cc2.lineup')||'{}')}})()`);
ok(s.lead.includes(mover) && s.lead.length === 2 && s.home.length === 2 && s.custom, `"Lead" moves it into the leads and one lead goes home (${s.lead} | ${s.home})`);
ok(Object.keys(s.saved).length === 1, 'the change is kept for this six on this device');
ok(await pg.evaluate(n => !!document.querySelector(`#chTeam .stg-figs [data-stgpk="${n}"]`), mover), 'the stage redraws with it in front');
await pg.click('#stgSet [data-stgreset]'); await pg.waitForTimeout(500);
ok(await E(`!__STG.lineup(members()).custom && !Object.keys(JSON.parse(localStorage.getItem('cc2.lineup')||'{}')).length`), '"Use the suggestion" goes back to the suggestion');

// 3. tap a stage Pokémon, arrow keys
const first = stage.figs[1];
await pg.click(`#chTeam .stg-figs [data-stgpk="${first}"]`, {force: true}); await pg.waitForTimeout(400);
ok(await E(`(document.querySelector('#stgSet .set-name')||{}).textContent.replace(/\\s+/g,' ').toLowerCase()===byName.get(${JSON.stringify(first)}).d.toLowerCase()`), `tapping ${first} on the stage shows its set`);
ok(await pg.evaluate(() => document.querySelectorAll('#stgSet .set-mv li').length === 4 && /Item/.test(document.querySelector('#stgSet .set-kv').innerText)), 'the set shows item, ability, role and four moves');
await pg.focus(`#chTeam .stg-figs [data-stgpk="${first}"]`); await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(400);
ok(await pg.evaluate(n => document.activeElement && document.activeElement.dataset.stgpk && document.activeElement.dataset.stgpk !== n && document.activeElement.getAttribute('aria-pressed') === 'true', first), 'ArrowRight moves to the next Pokémon and shows its set');

// 4. one yellow button; the grade is plain text; nothing cut off
const yel = await pg.evaluate(() => { const y = c => { const m = c.match(/[\d.]+/g); if (!m) return false; const [r, g, b, a = 1] = m.map(Number); return a > .5 && r > 225 && g > 190 && b < 110; };
  return [...document.querySelectorAll('[data-pane="report"] *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 24 && r.height > 14 && y(getComputedStyle(e).backgroundColor) && !e.closest('.ty,.chip'); }).map(e => e.id || e.className); });
ok(yel.length === 1 && yel[0] === 'saveBtn', `My team has one yellow button, Save team (${yel.join(', ')})`);
ok(await pg.evaluate(() => { const g = document.querySelector('#chTeam .stg-gr'); return g && !g.closest('button') && !g.querySelector('button') && getComputedStyle(g.querySelector('span')).borderTopWidth === '0px'; }), 'the grade on the stage is plain text, not a button or chip');
ok(await pg.evaluate(() => [...document.querySelectorAll('#chTeam :is(.stg-tn,.stg-names p,.bn>span:last-child,.set-name)')].every(e => e.scrollWidth <= e.clientWidth + 1)), 'no name on the stage, the leave-home row or the set is cut off');

// 5. placement: no two outlines overlap, on awkward teams, phone and desktop widths
const AW = [['Staraptor-Mega', 'Corviknight', 'Dragonite', 'Indeedee-F', 'Maushold', 'Archaludon'], ['Archaludon', 'Gholdengo', 'Dragonite', 'Corviknight', 'Incineroar', 'Rillaboom'],
  ['Charizard-Mega-Y', 'Venusaur-Mega', 'Raichu-Mega-Y', 'Tyranitar', 'Excadrill', 'Garchomp'], ['Ninetales-Alola', 'Baxcalibur', 'Kingambit', 'Incineroar', 'Sneasler'], ['Torkoal', 'Farigiraf', 'Hatterene'], ['Dragonite'], SAMPLE];
const ov = await E(`(()=>{const T=${JSON.stringify(AW)},out=[];for(const t of T)for(const [W,H] of [[366,438],[300,438],[560,470]]){const ps=t.map(n=>byName.get(n)),lead=ps.slice(0,Math.min(2,ps.length)),back=ps.slice(2,4);__STG._lay={};const pos=__STG.layout(W,H,lead,back,{top:100});
  let n=0;for(let i=0;i<pos.length;i++)for(let j=i+1;j<pos.length;j++)n+=__STG.overlap(W,H,pos[i],pos[j]);const inside=pos.every(q=>q.x>=0&&q.x+q.w<=W&&q.y>=90&&q.y+q.h<=H);out.push([t[0]+'@'+W,pos.length,n,inside])}return out})()`);
ok(ov.every(r => r[2] === 0), `no outlines overlap on ${ov.length} stages (${ov.filter(r => r[2]).map(r => r[0] + ':' + r[2]).join(', ') || 'all clear'})`);
ok(ov.every(r => r[3]), `every Pokémon stays inside the stage and below the title (${ov.filter(r => !r[3]).map(r => r[0]).join(', ') || 'all inside'})`);
ok(ov.every(r => r[1] === Math.min(4, AW.find(t => t[0] === r[0].split('@')[0]).length)), 'the stage holds up to four Pokémon');

// 6. plan → stage colour
const plans = await E(`(()=>{const T=${JSON.stringify(AW)},out=[];for(const t of T){S.slots=t.map(n=>({n}));while(S.slots.length<6)S.slots.push(blank());fixSlots();const ms=members(),a=teamArchetype(ms),k=wxKeyOf(ms),p=__STG.planType(ms);
  const exp=a.speed==='tw'||a.speed==='tailroom'?'Flying':a.speed==='tr'||a.speed==='hardtr'?'Psychic':k?__STG.FIELD[k]:null;out.push([t[0],a.speed,k,p.t,exp])}return out})()`);
ok(plans.every(r => !r[4] || r[3] === r[4]), `the stage colour follows the plan: Tailwind → Flying, Trick Room → Psychic, weather/terrain → its type (${plans.map(r => r[0] + ':' + r[3]).join(', ')})`);
ok(plans.find(r => r[0] === 'Staraptor-Mega')[3] === 'Flying', 'the sample Tailwind team is on the indigo stage');
ok(await E(`__STG.FIELD.rain==='Water'&&__STG.FIELD.sun==='Fire'&&__STG.FIELD.sand==='Rock'&&__STG.FIELD.snow==='Ice'&&__STG.FIELD.grassy==='Grass'&&__STG.FIELD.misty==='Fairy'`), 'rain blue, sun orange, sand rock, snow ice, terrains their type');
ok(await E(`__STG.sheetType(byName.get('Sneasler'))==='Poison'&&__STG.sheetType(byName.get('Machamp'))==='Fighting'&&__STG.sheetType(byName.get('Rillaboom'))==='Grass'`), 'info sheets: first type, Fighting uses its second (pure Fighting keeps the brown-orange tone)');

// 7. empty team keeps today's empty state
await team([]);
ok(await pg.evaluate(() => !document.querySelector('#chTeam .stgteam') && !!document.querySelector('#chTeam .chempty2')), 'an empty team keeps the empty state (Add your first Pokémon)');

// 8. info sheet on the same stage
await team(SAMPLE.slice(0, 5));
await E(`lairClose();lairSheet('Sneasler');0`); await pg.waitForTimeout(400);
const sh = await pg.evaluate(() => { const p = document.querySelector('#lairSheet .lspanel'), h = p.querySelector('.lshead');
  return {stage: h.classList.contains('stgsheet'), stg: p.dataset.stg, name: (h.querySelector('.stg-tn') || {}).textContent, num: (h.querySelector('.stg-gr b') || {}).textContent, lab: (h.querySelector('.stg-gr span') || {}).textContent,
    img: !!h.querySelector('.stg-hero'), strip: [...p.querySelectorAll('.chlstats > div')].length, yel: [...p.querySelectorAll('.stgyel')].map(b => b.textContent), x: !!p.querySelector('.stgbar .lsx'), tabs: p.querySelectorAll('.lstabs [role=tab]').length,
    best: [...p.querySelectorAll('.lstats .lstr.best > span')].map(x => x.textContent), ab: [...p.querySelectorAll('.lstp-info .lsab .lsabh b')].map(x => x.textContent)}; });
ok(sh.stage && sh.stg === 'Poison', `Sneasler's sheet is on a Poison stage (${sh.stg})`);
ok(/sneasler/i.test(sh.name) && /^\d+$/.test(sh.num) && /^Rating · [SABCDF] tier/.test(sh.lab), `name, rating number and "Rating · tier" as plain text (${sh.num} / ${sh.lab})`);
ok(sh.img && sh.x && sh.tabs === 3, `the hero stage, the close button and the three tabs are there (the picture itself needs sp/, not in the test copy) (${sh.img} ${sh.x} ${sh.tabs})`);
ok(sh.strip === 3, `the strip shows % of teams, win rate and rank (${sh.strip})`);
ok(sh.yel.length === 1 && sh.yel[0] === 'Add to my team', `one yellow button: Add to my team (${sh.yel})`);
ok(sh.best.join() === 'Attack', `the best base stat is marked (${sh.best})`);
ok(sh.ab[0] === 'Unburden', `abilities are listed most used first (${sh.ab.join(', ')})`);
await pg.click('#lairSheet .stgyel'); await pg.waitForTimeout(500);
ok(await E(`members().some(m=>m.p.n==='Sneasler')`), 'Add to my team adds it');
await E(`lairClose();lairSheet('Charizard-Mega-Y');0`); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => document.querySelector('#lairSheet .lspanel').dataset.stg === 'Fire' && /Mega/.test(document.querySelector('#lairSheet .stg-ts').textContent)), 'a Mega sheet works (Fire stage, "Mega" in its line)');

// 9. Home: the champion card's pick names whose six it plans against (My team plans against the meta)
await team(SAMPLE); await E(`setView('home',false);render();0`); await pg.waitForTimeout(600);
{ const w = await pg.evaluate(() => [...document.querySelectorAll('#homeOut .chmwho, #homeOut .chk')].map(x => x.textContent).filter(t => /pick vs|four vs/.test(t)));
  const pl = await E(`(()=>{try{const E=META.events,ev=E&&E.events&&E.events[0],t=ev&&ev.top&&ev.top[0];return t&&t.player||''}catch(e){return ''}})()`);
  ok(w.length && w.every(t => !/the champion's six/.test(t)) && (!pl || w.some(t => t.includes(pl + "'s six"))), `Home names the six it plans against (${w.join(' | ').slice(0, 120)})`); }
ok(!errs.length, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
await browser.close(); try { fs.unlinkSync(page); } catch (e) {}
console.log(fails ? `${fails} FAILED (stage)` : 'stage: all passed'); process.exit(fails ? 1 : 0);
