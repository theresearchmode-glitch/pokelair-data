// Phase 4 step 1 (Nov 9): the same team must show the same grade everywhere the site shows one: My Team, Saved Teams, Compare,
// Build for Me (card vs. after "Use this team") and an event's "Load team". Real event teams with full sheets are used, so items,
// Abilities and moves are the players' own. Fails on any difference in the letter or the "Top N%" rank.
// Usage: node experiments/same-grade.mjs [teams=6]     (build the page first: node app/build.mjs)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const N = +(process.argv[2] || 6), L = rd('limitless.json');
const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = ROOT + `app/same-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(), errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3500); fs.unlinkSync(page);
const ev = c => pg.evaluate(c => window.__ev(c), c), wait = ms => pg.waitForTimeout(ms);
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const RX = /([A-F][+\u2212]?)\s*(Top \d+%|Bottom \d+%)/;
// event teams with full sheets, stored as saved teams
const picks = JSON.parse(await ev(`(()=>{const out=[];for(const e of META.events.events){for(let k=0;k<(e.top||[]).length;k++){const t=e.top[k];if(out.length>=${N})break;if(!t||!t.mons||t.mons.length!==6||t.mons.some(m=>!byName.get(m.n)||!m.mv||m.mv.length<4))continue;out.push({id:'sg'+out.length,ev:e.id+'#'+k,name:'SG'+out.length,slots:cxSheetSlots(t.mons)})}}
 S.teams=out.map(x=>({id:x.id,name:x.name,format:'doubles',slots:x.slots,at:Date.now()}));persist&&persist();return JSON.stringify(out)})()`));
const myTeam = async slotsJ => { await ev(`S.slots=normSlots(${slotsJ});S.loadedId=null;S.format='doubles';render();setView('report');1`); await wait(2500);
  return ev(`(()=>{const L=(document.querySelector('.ar-gletter')||{}).textContent||'',n=(document.querySelector('.ar-gnum')||{}).textContent||'';const m=n.match(/(Top|Bottom) \\d+%/);return (L+' '+(m?m[0]:'?')).trim()})()`); };
const R = [];
for (const t of picks) R.push({name: t.name, ev: t.ev, my: await myTeam(JSON.stringify(t.slots))});
// Saved Teams page
await ev(`setView('teams');1`); await wait(3000);
const saved = JSON.parse(await ev(`(()=>{const o={};for(const t of S.teams){/* the row's own grade badge (.svstats), found from its Compare button; [data-load] also matches My Team's team switcher */const c=document.querySelector('[data-cmp="'+t.id+'"]');let el=c;for(let i=0;el&&i<10;i++){el=el.parentElement;const st=el&&el.querySelector('.svstats');if(st){const g=st.querySelector('.npgb'),m=g?((g.querySelector('.npgl')||{}).textContent+' '+g.getAttribute('title')).match(${RX}):st.textContent.match(${RX});o[t.name]=m?m[1]+' '+m[2]:'(no grade: '+st.textContent.slice(0,40)+')';break}}}return JSON.stringify(o)})()`));
// Compare (pairs of saved teams) and an event's own Load team
for (let i = 0; i < R.length; i++) { const A = picks[i], Bt = picks[(i + 1) % picks.length];
  await ev(`ui.cx.A='s:${A.id}';ui.cx.B='s:${Bt.id}';ui.cx.pick=null;setView('compare');renderCompare&&renderCompare();1`); await wait(3000);
  R[i].cmp = await ev(`(()=>{const g=[...document.querySelectorAll('.cxgr')].map(e=>e.textContent),s=[...document.querySelectorAll('.cxgs')].map(e=>e.textContent);const m=s[0]&&s[0].match(/(Top|Bottom) \\d+%/);return g.length?(g[0]+' '+(m?m[0]:'?')):'(none)'})()`);
  await ev(`(()=>{const x=evTeam('${A.ev}');loadSheet(x.t);return 1})()`); await wait(2500);
  R[i].evload = await ev(`(()=>{const L=(document.querySelector('.ar-gletter')||{}).textContent||'',n=(document.querySelector('.ar-gnum')||{}).textContent||'';const m=n.match(/(Top|Bottom) \\d+%/);return (L+' '+(m?m[0]:'?')).trim()})()`); }
for (const r of R) { const vals = {myTeam: r.my, saved: saved[r.name] || '(missing)', compare: r.cmp, eventLoad: r.evload}, set = new Set(Object.values(vals));
  ok(set.size === 1, `${r.name}: ${Object.entries(vals).map(([k, v]) => k + ' ' + v).join(' · ')}`); }
// Build for Me: the card's grade vs My Team after "Use this team"
for (const k of [1, 2]) { await ev(`S.megaGoal=${k};S.maxMega=${k};ui.abSrc='all';ui.abLock=null;ui.ab=null;setView('auto');runAutoBuild&&runAutoBuild();1`); await wait(9000);
  const card = await ev(`(()=>{const c=document.querySelector('#abOut [data-abuse]');if(!c)return '(no card)';let el=c;for(let i=0;el&&i<10;i++){el=el.parentElement;const s=el&&el.querySelector('.arb-score');if(s){const t=s.textContent+' '+(s.getAttribute('title')||'');const L=(s.querySelector('.ar-num')||{}).textContent||'';const m=t.match(/(Top|Bottom) \\d+%/);return L+' '+(m?m[0]:'?')}}return '(no score)'})()`);
  await ev(`document.querySelector('#abOut [data-abuse]').click();1`); await wait(3000);
  const after = await ev(`(()=>{const L=(document.querySelector('.ar-gletter')||{}).textContent||'',n=(document.querySelector('.ar-gnum')||{}).textContent||'';const m=n.match(/(Top|Bottom) \\d+%/);return (L+' '+(m?m[0]:'?')).trim()})()`);
  ok(card === after, `Build for Me (${k} Mega${k > 1 ? 's' : ''}): card ${card} · My Team after Use ${after}`); }
ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''));
await b.close(); console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED'); process.exit(fails.length ? 1 : 0);
