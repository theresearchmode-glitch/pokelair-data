import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP='C:/Users/simra/code/pl-h/app/', OUT=APP+'../out/', rd=f=>{try{return JSON.parse(fs.readFileSync(OUT+f,'utf8'))}catch(e){return null}};
const L=rd('limitless.json'), D={'meta/results':L.results,'meta/perf':{adj:L.adj,updated:L.updated.slice(0,10)},'meta/doubles_tour':rd('meta_tour.json'),'meta/doubles':rd('meta_ladder.json'),'meta/doubles_ingame':rd('meta_ingame.json'),'meta/events':rd('events.json'),'meta/model':rd('model.json'),'meta/teams':rd('teams.json')};
const page=APP+'bh.html'; fs.writeFileSync(page,'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+fs.readFileSync(APP+'dist/page.html','utf8').replace('render();setView(view,false);','window.__ev=c=>eval(c);render();setView(view,false);'));
const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(D=>{localStorage.setItem('cc2.welcomed','"1"');window.claude={use:async n=>n==='db'?{doc:p=>({onSnapshot:cb=>{setTimeout(()=>cb({exists:!!D[p],data:()=>D[p]}),5);return()=>{}},get:async()=>({exists:false}),set:async()=>{},update:async()=>{}}),collection:()=>({doc:()=>({set:async()=>{},get:async()=>({exists:false}),onSnapshot:()=>()=>{}})})}:null}},D);
await pg.goto('file://'+page); await pg.waitForTimeout(3000);
// three opponents: a 2nd-place team with a record, a team with no record, and a hand-typed six
const picks=await pg.evaluate(()=>window.__ev(`(()=>{const out=[];for(const e of META.events.events){for(const t of e.top||[]){if(!t||!t.mons||t.mons.length!==6)continue;if(!out.find(x=>x.k==='rec')&&t.record){out.push({k:'rec',m:t.mons.map(m=>m.n)})}if(!out.find(x=>x.k==='norec')&&!t.record&&t.place){out.push({k:'norec',m:t.mons.map(m=>m.n)})}}if(out.length>=2)break}out.push({k:'typed',m:['Incineroar','Rillaboom','Sneasler','','','']});return out})()`));
for (const x of picks){ await pg.evaluate(m=>window.__ev(`(()=>{S.opp=${JSON.stringify(m)};persist();setView('matchup');renderMatchup()})()`),x.m); await pg.waitForTimeout(1200);
  console.log(x.k.padEnd(6), await pg.evaluate(()=>{const h=document.querySelector('#matchup > .chbmhead');return h?h.querySelector('.chbmt').innerText.replace(/\n/g,' ')+'  ||  '+((h.querySelector('.chpgs')||{}).innerText||''):'no head'}));
  if(x.k==='norec') await pg.screenshot({path:'C:/pl/battle_head.png',clip:{x:0,y:0,width:390,height:520}}); }
console.log(errs.length?'errors: '+errs.join(' | '):'no page errors'); await b.close(); fs.unlinkSync(page);
