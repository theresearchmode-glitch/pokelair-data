// A brand-new visitor with no team: every page opens, shows something sensible, and nothing throws. Phone and desktop.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = 'C:/Users/simra/code/pl-h/app/', OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'empty-sweep.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const VIEWS = ['home', 'report', 'auto', 'matchup', 'gauntlet', 'speed', 'calc', 'types', 'ratings', 'meta', 'sets', 'top', 'events', 'arch', 'teams', 'box', 'coverage'];
const b = await chromium.launch(), fails = [], ok = (c, m) => { if (!c) { console.log('  FAIL ' + m); fails.push(m); } };
for (const [w, h, mob] of [[390, 844, true], [1440, 900, false]]) { const pg = await (await b.newContext({viewport: {width: w, height: h}, isMobile: mob, hasTouch: mob})).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  // a first visit: nothing stored, so the sample team loads; then the visitor clears it
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000);
  await pg.evaluate(() => window.__ev("(()=>{S.slots=[];try{fixSlots()}catch(e){};persist();render()})()")); await pg.waitForTimeout(800);
  for (const v of VIEWS) { const n0 = errs.length; await pg.evaluate(v => window.__ev(`setView(${JSON.stringify(v)})`), v); await pg.waitForTimeout(v === 'gauntlet' || v === 'auto' ? 2500 : 700);
    const r = await pg.evaluate(v => { const al = {cores: 'auto', build: 'report'}; const p = document.querySelector(`[data-pane="${al[v] || v}"]`); return {shown: !!p && !p.hidden, len: p ? p.innerText.trim().length : 0, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; }, v);
    ok(r.shown && r.len > 60, `${w}px ${v}: page shows content with no team (${r.len} chars)`); ok(r.sw <= r.cw + 1, `${w}px ${v}: no sideways scroll (${r.sw} > ${r.cw})`); ok(errs.length === n0, `${w}px ${v}: no errors ${errs.slice(n0).join(' | ')}`); }
  // My team with no team: the empty state and its buttons
  await pg.evaluate(() => window.__ev("setView('report')")); await pg.waitForTimeout(600);
  const m = await pg.evaluate(() => ({add: !!document.querySelector('.chempty2 [data-chedit="0"]'), box: !!document.querySelector('#chActs [data-view="box"]'), saved: !!document.querySelector('#chActs [data-view="teams"]'), parts: [...document.querySelectorAll('#chP1,#chP2,#chP3')].every(p => p.hidden), six: document.querySelectorAll('#chSheetOut .chrow.empty').length}));
  ok(m.add && m.box && m.saved && m.parts && m.six === 6, `${w}px My team empty state: Add button, Box and Saved buttons, report parts hidden, 6 empty slots (${JSON.stringify(m)})`);
  // Build me a team works from nothing
  await pg.evaluate(() => window.__ev("setView('auto')")); await pg.waitForTimeout(800); await pg.click('#abBtn').catch(() => {}); await pg.waitForTimeout(6000);
  const built = await pg.evaluate(() => window.__ev('members().length')); ok(built === 6 || (await pg.evaluate(() => !!document.querySelector('#abOut .chabsix'))), `${w}px Build me a team from an empty team gives a six (${built} on the team)`);
  ok(!errs.length, `${w}px: no errors overall ${errs.join(' | ')}`); }
await b.close(); fs.unlinkSync(page); console.log(fails.length ? `\n${fails.length} FAILED` : '\nEMPTY-TEAM SWEEP CLEAN');
