// Saved teams vs the team page: why "7/8 checks" vs "7/7"? Compare both computations for the same team.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = 'C:/Users/simra/code/pl-h/app/', OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'ck-probe.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3500);
console.log(await pg.evaluate(() => window.__ev(`(()=>{const out=[];const desc=(lab,ms,useA)=>{const ck=proChecks(ms,useA);out.push(lab+': '+ck.pass+'/'+ck.n+' '+ck.items.filter(x=>!x.skip).map(x=>x.k+(x.ok?'+':'-')).join(' ')+' | items: '+ms.map(m=>m.d+'@'+(m.item||'-')).join(', '))};
  const useA=typeof ui.useA==='boolean'?ui.useA:($('useAbil')?$('useAbil').checked:true);
  desc('page members, useA='+useA, members(), useA); desc('page members, true', members(), true);
  desc('teamRating(S.slots)', teamRating(S.slots).ms, true);
  S.teams.forEach(t=>desc('saved '+t.name, teamRating(t.slots).ms, true));
  return out.join('\\n')})()`)));
await b.close(); fs.unlinkSync(page);
