import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP='C:/Users/simra/code/pl-h/app/', OUT=APP+'../out/', rd=f=>{try{return JSON.parse(fs.readFileSync(OUT+f,'utf8'))}catch(e){return null}};
const L=rd('limitless.json'), D={'meta/results':L.results,'meta/perf':{adj:L.adj,updated:L.updated.slice(0,10)},'meta/doubles_tour':rd('meta_tour.json'),'meta/doubles':rd('meta_ladder.json'),'meta/doubles_ingame':rd('meta_ingame.json'),'meta/events':rd('events.json'),'meta/model':rd('model.json'),'meta/teams':rd('teams.json')};
const page=APP+'calc-card.html'; fs.writeFileSync(page,'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+fs.readFileSync(APP+'dist/page.html','utf8').replace('render();setView(view,false);','window.__ev=c=>eval(c);render();setView(view,false);'));
const b=await chromium.launch(), fails=[], ok=(c,m)=>{console.log((c?'  ok   ':'  FAIL ')+m);if(!c)fails.push(m)};
for (const [w,mob] of [[390,true],[1440,false]]) { const pg=await (await b.newContext({viewport:{width:w,height:900},isMobile:mob,hasTouch:mob})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(D=>{localStorage.setItem('cc2.welcomed','"1"');window.claude={use:async n=>n==='db'?{doc:p=>({onSnapshot:cb=>{setTimeout(()=>cb({exists:!!D[p],data:()=>D[p]}),5);return()=>{}},get:async()=>({exists:false}),set:async()=>{},update:async()=>{}}),collection:()=>({doc:()=>({set:async()=>{},get:async()=>({exists:false}),onSnapshot:()=>()=>{}})})}:null}},D);
  await pg.goto('file://'+page); await pg.waitForTimeout(3000); await pg.evaluate(()=>window.__ev("setView('matchup')")); await pg.waitForTimeout(1500);
  const card=await pg.evaluate(()=>{const c=document.querySelector('#chCalcCard .chcalc');const h=document.querySelector('#matchup > .chbmhead');return {has:!!c,afterHead:!!(h&&c&&(h.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING)),atk:document.querySelectorAll('.chcalcatk [data-dcgo]').length,noShot:!document.getElementById('shotBox')&&!document.getElementById('bmClockBtn')}});
  ok(card.has&&card.afterHead&&card.atk>=1&&card.noShot,`${w}px: calc card under the heading, ${card.atk} attackers, no screenshot reader or timer`);
  const t=await pg.$$('.chcalcatk [data-dcgo]'); const want=await t[t.length-1].getAttribute('data-dcgo'); await t[t.length-1].click(); await pg.waitForTimeout(1200);
  const r=await pg.evaluate(()=>({view:window.__ev('view'),a:window.__ev('dc.a'),d:window.__ev('dc.d'),res:(document.querySelector('#dcOut .dcbig')||{}).textContent||''}));
  ok(r.view==='calc'&&want===`${r.a}|${r.d}`&&/%/.test(r.res),`${w}px: tapping an attacker opens the calc on that matchup (${want} -> ${r.a} vs ${r.d}: ${r.res.trim()})`);
  ok(!errs.length,`${w}px: no page errors ${errs.join(' | ')}`); }
await b.close(); fs.unlinkSync(page); console.log(fails.length?`\n${fails.length} FAILED`:'\nALL PASSED');
