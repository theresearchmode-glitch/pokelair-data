import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP=new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT=APP+'../out/', rd=f=>{try{return JSON.parse(fs.readFileSync(OUT+f,'utf8'))}catch(e){return null}};
const L=rd('limitless.json'), D={'meta/results':L.results,'meta/perf':{adj:L.adj,updated:L.updated.slice(0,10)},'meta/doubles_tour':rd('meta_tour.json'),'meta/doubles':rd('meta_ladder.json'),'meta/doubles_ingame':rd('meta_ingame.json'),'meta/events':rd('events.json'),'meta/model':rd('model.json'),'meta/teams':rd('teams.json')};
const page=APP+'why.html'; fs.writeFileSync(page,'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+fs.readFileSync(APP+'dist/page.html','utf8').replace('render();setView(view,false);','window.__ev=c=>eval(c);render();setView(view,false);'));
const b=await chromium.launch(), fails=[], ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails.push(m)};
for (const [lab,team] of [['sample',null],['four',['Incineroar','Rillaboom','Sneasler','Kingambit']],['rain-snow',['Pelipper','Froslass-Mega','Kingambit','Raichu-Mega-Y','Primarina','Sylveon']]]) {
  const pg=await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(D=>{localStorage.setItem('cc2.welcomed','"1"');window.claude={use:async n=>n==='db'?{doc:p=>({onSnapshot:cb=>{setTimeout(()=>cb({exists:!!D[p],data:()=>D[p]}),5);return()=>{}},get:async()=>({exists:false}),set:async()=>{},update:async()=>{}}),collection:()=>({doc:()=>({set:async()=>{},get:async()=>({exists:false}),onSnapshot:()=>()=>{}})})}:null}},D);
  await pg.goto('file://'+page); await pg.waitForTimeout(3000);
  if (team) await pg.evaluate(t=>window.__ev(`(()=>{S.slots=${JSON.stringify(t)}.map(n=>({n}));try{fixSlots()}catch(e){};persist();render()})()`),team);
  await pg.evaluate(()=>window.__ev("setView('report')")); await pg.waitForTimeout(2500);
  const n=await pg.evaluate(()=>document.querySelectorAll('#chSugOut .chwhy').length); ok(n>=1,`${lab}: suggestions have a Why? (${n})`);
  if(n){ await pg.click('#chSugOut .chwhy > summary'); await pg.waitForTimeout(300); const r=await pg.evaluate(()=>{const d=document.querySelector('#chSugOut .chwhy');return {open:d.open,items:d.querySelectorAll('li').length,first:(d.querySelector('li')||{}).innerText}}); ok(r.open&&r.items>=1,`${lab}: Why? opens its reasons (${r.items}: "${(r.first||'').slice(0,80)}")`);
    await pg.evaluate(()=>document.querySelector('#chSugOut').scrollIntoView({block:'start'})); await pg.evaluate(()=>window.scrollBy(0,-60)); await pg.waitForTimeout(200); await pg.screenshot({path:`C:/pl/why_${lab}.png`}); }
  { const before = await pg.evaluate(() => window.__ev('ui.pool')), pick = before === 'all' ? 'box' : 'all';
    await pg.click(`[data-chpool="${pick}"]`); await pg.waitForTimeout(2500);
    const r = await pg.evaluate(() => ({pool: window.__ev('ui.pool'), pressed: (document.querySelector('[data-chpool][aria-pressed="true"]') || {}).textContent, sel: (document.getElementById('poolSel') || {}).value, sugs: document.getElementById('chSugOut').innerText.slice(0, 90).replace(/\n/g, ' / ')}));
    ok(r.pool === pick && r.sel === pick && !!r.pressed, `${lab}: Suggest from switch changes the source (${before} -> ${JSON.stringify(r)})`); }
  ok(!errs.length,`${lab}: no page errors ${errs.join(' | ')}`); }
await b.close(); fs.unlinkSync(page); console.log(fails.length?`\n${fails.length} FAILED`:'\nALL PASSED');
