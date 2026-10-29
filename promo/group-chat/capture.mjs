import fs from 'node:fs'; import {chromium} from 'playwright';
const APP=new URL('../../app/',import.meta.url).pathname, OUT=APP+'../out/', rd=f=>{try{return JSON.parse(fs.readFileSync(OUT+f,'utf8'))}catch(e){return null}};
const L=rd('limitless.json'), D={'meta/results':L.results,'meta/perf':{adj:L.adj,updated:L.updated.slice(0,10)},'meta/doubles_tour':rd('meta_tour.json'),'meta/teams':rd('teams.json'),'meta/history':rd('history.json'),'meta/model':rd('model.json'),'meta/doubles':rd('meta_ladder.json'),'meta/doubles_ingame':rd('meta_ingame.json'),'meta/events':rd('events.json')};
const dir=process.argv[2]; const page=APP+'cap.html';
fs.writeFileSync(page,'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+fs.readFileSync(APP+'dist/page.html','utf8').replace('render();setView(view,false);','window.__ev=c=>eval(c);render();setView(view,false);'));
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true}); const pg=await ctx.newPage();
await pg.addInitScript(D=>{window.claude={use:async n=>n==='db'?{doc:p=>({onSnapshot:cb=>{setTimeout(()=>cb({exists:!!D[p],data:()=>D[p]}),5);return()=>{}},get:async()=>({exists:false}),set:async()=>{}})}:null};try{localStorage.setItem('cc2.welcomed','"1"');localStorage.setItem('cc2.seenNew','"x"')}catch(e){}},D);
await pg.goto('file://'+page); await pg.waitForTimeout(3500);
await pg.addStyleTag({content:'.welcome,#welcomeCard,#wnewCard,.toast,#healthBar,.hfb,.bnav{display:none!important}'});
const ev=c=>pg.evaluate(c=>window.__ev(c),c);
const TEAM="S.slots=DEFAULT_TEAM.slots.map(s=>({...s}));S.teams.forEach(t=>{if(/sample/i.test(t.name))t.name='Sun Tailwind'});fixSlots();render();";
const V0=[['home',"setView('home')"],['build',TEAM+"setView('build')"],['report',TEAM+"setView('report')"],['auto',TEAM+"ui.abSrc='all';setView('auto');runAutoBuild()",6500],['matchup',TEAM+"S.opp=['Incineroar','Rillaboom','Sneasler','Kingambit','Salamence-Mega','Basculegion'];render();setView('matchup')"],['ratings',"setView('ratings')"],['meta',"setView('meta')"],['calc',TEAM+"setView('calc')"],['speed',TEAM+"setView('speed')"],['top',"setView('top')"],['events',"setView('events')"],['gauntlet',TEAM+"setView('gauntlet')",3000]];
const V=V0.filter(x=>process.argv[3].split(',').includes(x[0]));for(const [v,s,w] of V){ try{await ev("try{lairClose()}catch(e){}"); await ev(s); await pg.waitForTimeout(w||1200); await pg.evaluate(()=>scrollTo(0,0)); await pg.waitForTimeout(300); await pg.screenshot({path:`${dir}/${v}_full.png`,fullPage:true}); console.log('ok',v);}catch(e){console.log('fail',v,e.message)} }
await b.close(); fs.unlinkSync(page);
