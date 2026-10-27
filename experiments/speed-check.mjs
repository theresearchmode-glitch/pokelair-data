// Copied from the Oct 28 reference check (pl-verify) so CI can run it. Needs @smogon/calc: npm install --no-save @smogon/calc@0.12.0
// (or set SMOGCALC to a folder whose node_modules has it). Checks the repo's own built page (app/dist/page.html).
// Stat + speed check: the page's calcStat for every species/stat/nature/stat-point combo vs Smogon's Champions engine,
// and the speed tiers / Battle mode speed rows vs a reference that applies items, abilities and field. Usage: node speed.mjs
import fs from 'node:fs'; import {createRequire} from 'node:module';
const require = createRequire(process.env.SMOGCALC ? process.env.SMOGCALC.replace(/\\/g, '/').replace(/\/?$/, '/x.js') : import.meta.url), {chromium} = createRequire(import.meta.url)('playwright');
const {Generations, Pokemon} = require('@smogon/calc'); const G0 = Generations.get(0);
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), DOCS = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'verify-speed.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
const ev = c => pg.evaluate(c => window.__ev(c), c), out = [];
// 1) calcStat vs Smogon for every species, every stat, natures {+, -, neutral} and SP 0/1/16/31/32
const NAT = {Atk: ['Adamant', 'Modest'], Def: ['Bold', 'Lonely'], SpA: ['Modest', 'Adamant'], SpD: ['Calm', 'Naughty'], Spe: ['Jolly', 'Brave']};
const rows = await ev(`(()=>{const o=[];for(const p of ROSTER)for(const st of ['HP','Atk','Def','SpA','SpD','Spe'])for(const nat of ['Hardy',...(${JSON.stringify(NAT)}[st]||[])])for(const sp of [0,1,16,31,32])o.push([p.n,st,nat,sp,calcStat(p,st,sp,natMul(nat,st))]);return o})()`);
const key = {HP: 'hp', Atk: 'atk', Def: 'def', SpA: 'spa', SpD: 'spd', Spe: 'spe'}; let ok = 0, bad = [], skip = 0;
for (const [n, st, nat, sp, v] of rows) { let ref; try { ref = new Pokemon(G0, n === 'Palafin' ? 'Palafin-Hero' : n, {nature: nat, evs: {[key[st]]: sp}, level: 50}).rawStats[key[st]]; } catch (e) { skip++; continue; } if (ref === v) ok++; else bad.push(`${n} ${st} ${nat} SP${sp}: page ${v} vs ${ref}`); }
out.push(`stats: ${ok}/${ok + bad.length} exact vs Smogon Champions (${skip} skipped: species not in Smogon data)${bad.length ? '\n  ' + bad.slice(0, 15).join('\n  ') : ''}`);
// 2) speed tiers page with weather teams: does it apply Chlorophyll / Sand Rush / Swift Swim / Unburden / Scarf?
const cases = {
  sun: ['Charizard-Mega-Y', 'Venusaur', 'Incineroar', 'Whimsicott', 'Garchomp', 'Sneasler'],
  sand: ['Tyranitar-Mega', 'Excadrill', 'Incineroar', 'Rillaboom', 'Sinistcha', 'Corviknight'],
  rain: ['Pelipper', 'Basculegion-F', 'Archaludon', 'Incineroar', 'Rillaboom', 'Sneasler']};
for (const [k, team] of Object.entries(cases)) {
  const r = await ev(`S.slots=${JSON.stringify(team)}.map(n=>({n,a:null,lock:false}));fixSlots();render();setView('speed');[...document.querySelectorAll('.spdrow.me')].map(e=>e.querySelector('.spdn b').textContent+' '+e.querySelector('.spdv').textContent+' | '+e.querySelector('.t2').textContent)`);
  out.push(`speed tiers, ${k} team (your rows):\n  ` + r.join('\n  '));
  const bm = await ev(`S.opp=['Incineroar','Rillaboom','Sneasler','Kingambit','Salamence-Mega','Basculegion'];render();setView('matchup');(document.querySelector('[data-pane="matchup"]').innerText.match(/Speed[\\s\\S]{0,900}/)||[''])[0].slice(0,900)`);
  out.push(`battle mode speed text (${k}): ${bm.replace(/\s+/g, ' ').slice(0, 600)}`); }
// 3) reference speeds for the weather abusers (Smogon engine): the speed the game would use on turn 1 with their weather up
const refSpd = (n, nat, sp, ab, item) => new Pokemon(G0, n, {nature: nat, evs: {spe: sp}, level: 50, ability: ab, item}).rawStats.spe;
for (const [n, ab, w, nat, sp] of [['Venusaur', 'Chlorophyll', 'sun', 'Modest', 0], ['Venusaur', 'Chlorophyll', 'sun', 'Timid', 32], ['Excadrill', 'Sand Rush', 'sand', 'Jolly', 32], ['Excadrill', 'Sand Rush', 'sand', 'Adamant', 32], ['Basculegion-F', 'Swift Swim', 'rain', 'Modest', 32], ['Sneasler', 'Unburden', 'item consumed', 'Jolly', 32]])
  { const s = refSpd(n, nat, sp, ab); out.push(`reference: ${n} ${nat} ${sp} Spe = ${s}; with ${ab} in ${w} = ${s * 2}`); }
await b.close(); fs.unlinkSync(page);
fs.writeFileSync('speed.out.txt', out.join('\n')); console.log(out.join('\n'));
if (bad.length) { console.log(`FAIL: ${bad.length} stat mismatches vs Smogon`); process.exit(1); }
