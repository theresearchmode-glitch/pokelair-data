// Same-output check for My Team's Matchups (R4, Nov 11): the working-out moved to 59-matchup-data.js (Top 10 and the next 20,
// the Top 12 grid, All 30's Threat preparation and Biggest threats, the threat sheet's counts, worst five and per-Pokémon dots).
// Drives today's real buttons for several teams, at desktop and phone width: each view (Top 10 | Top 12 grid | All 30), Show 5 more,
// Show all, opening threat folds, the threat sheet from a Top 10 row, a "next 20" tile and a grid row, switching and clearing the
// sheet's selected threat. Compares the HTML of every Matchups part, the open sheet, the remembered view and open rows after every step.
// data-rz (70-riso2.js) records a text length measured at draw time and flips with timing on both pages, so it is left out.
// Usage: node experiments/same-matchups.mjs before.html after.html   (DUMP=file.json writes every step)
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path';
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = fileURLToPath(new URL('../out/', import.meta.url)), rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null,
  'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'),
  'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/history': rd('history.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (path.resolve(f)));
const TEAMS = [['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'],
  ['Pelipper', 'Archaludon', 'Basculegion', 'Incineroar', 'Garchomp', 'Sneasler'],
  ['Kingambit', 'Whimsicott', 'Farigiraf', 'Gholdengo', 'Sinistcha', 'Dragonite'],
  ['Garchomp', 'Incineroar', 'Sneasler', 'Whimsicott'],
  ['Flapple', 'Absol', 'Azumarill', 'Kingambit', 'Basculegion', 'Rillaboom']];
const b = await chromium.launch(), out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  // the copy sits in app/, beside sp/, so every sprite loads (a missing sprite is swapped for a blank at a moment that varies)
  const page = fileURLToPath(new URL(`../app/_smu-${process.pid}-${k}.html`, import.meta.url)); out[k] = [];
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  for (const width of [1280, 390]) {
    const ctx = await b.newContext({viewport: {width, height: 900}, isMobile: width < 700, hasTouch: width < 700}), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2099-01-01"'); } catch (e) {}
      window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
    await p.goto(pathToFileURL(page).href); await p.waitForTimeout(3500);
    await p.evaluate(() => window.__ev(`window.NORM=h=>String(h||'').replace(/[?]r=[0-9]+/g,'').replace(/ data-retry="[0-9]+"/g,'').replace(/ data-arb="1"/g,'').replace(/ data-clr="[^"]*"/g,'').replace(/ data-rz="[0-9]+"/g,'');
      window.HT=id=>{const e=$(id);return e?NORM(e.innerHTML):null};
      window.SNAP=()=>JSON.stringify({seg:localStorage.getItem('cc2.seg.thr'),pressed:[...document.querySelectorAll('[data-chseg="thr"] [aria-pressed="true"]')].map(x=>x.dataset.chsegv).join(),
        tlMore:!!ui.tlMore,thrOpen:ui.thrOpen||null,all:!!ui.threatsAll,top:HT('chThrTop'),grid:HT('chVsOut'),card:HT('thrCard'),threats:HT('threats'),
        scout:$('chScout')&&!$('chScout').hidden?HT('chScout'):'(closed)',sel:CH.sel})`));
    // suggestions are worked out in slices between frames; the sheet's Best fix and the counts wait for them, so every step waits
    // until the planner is idle (the first run, on a quiet machine, matched without this; a busy machine showed timing differences)
    const idle = async () => { for (let i = 0; i < 120; i++) { if (await p.evaluate(() => window.__ev('!(ui.plans&&ui.plans.pending)&&!document.querySelector(".planwait")'))) break; await p.waitForTimeout(250); } await p.waitForTimeout(300); };
    const team = async ns => p.evaluate(ns => window.__ev(`(()=>{const ns=${JSON.stringify(ns)};const bad=ns.filter(n=>!byName.get(n));S.slots=ns.filter(n=>byName.get(n)).map(n=>({n,a:null,lock:false}));while(S.slots.length<6)S.slots.push({n:'',a:null,lock:false});ui.thrOpen={};render();setView('report');return bad.join()})()`), ns);
    const step = async (label, code) => { let r = ''; try { r = await p.evaluate(c => window.__ev(`(()=>{${c}})()`), code) || ''; } catch (e) { r = 'ERR ' + e.message.slice(0, 80); }
      await p.waitForTimeout(450); await idle(); out[k].push(width + ' ' + label + ' ' + r + ' ' + await p.evaluate(() => window.__ev('SNAP()'))); };
    const click = sel => `const e=[...document.querySelectorAll(${JSON.stringify(sel)})].find(x=>x.getClientRects().length)||document.querySelector(${JSON.stringify(sel)});if(!e)return 'none';e.click();return e.dataset.chthr||e.dataset.chhthr||''`;
    for (const ns of TEAMS) {
      const bad = await team(ns); await p.waitForTimeout(1200); await idle(); out[k].push(width + ' team ' + ns.join() + (bad ? ' (not in roster: ' + bad + ')' : ''));
      for (const v of ['top', 'grid', 'all', 'top']) await step('view ' + v, click(`[data-chsegv="${v}"]`));
      await step('show more', click('[data-tlmore]')); await step('show less', click('[data-tlmore]'));
      await step('open row 1', click('#chThrTop .chtl10 [data-chthr]'));
      await step('switch tile 5', `const t=document.querySelectorAll('#chScout .chtiles [data-chthr]')[4];if(!t)return 'none';t.click();return t.dataset.chthr`);
      await step('clear tile', `const t=document.querySelector('#chScout [data-chthr][aria-pressed="true"]');if(!t)return 'none';t.click();return t.dataset.chthr`);
      await step('tile 20', `const t=document.querySelectorAll('#chScout .chtiles [data-chthr]')[19];if(!t)return 'none';t.click();return t.dataset.chthr`);
      await step('close', click('#chScout [data-chclose]'));
      await step('open next-20 tile', `const t=document.querySelectorAll('#chThrTop .chsm [data-chthr]')[2];if(!t)return 'none';t.click();return t.dataset.chthr`);
      await step('escape', `chScoutClose();return ''`);
      await step('view grid', click('[data-chsegv="grid"]'));
      await step('grid row 3', `const t=document.querySelectorAll('#chVsOut [data-chhthr]')[2];if(!t)return 'none';t.click();return t.dataset.chhthr`);
      await p.waitForTimeout(300); await step('after grid open', `return CH.sel||''`);
      await step('close', `chScoutClose();return ''`);
      await step('view all', click('[data-chsegv="all"]'));
      await step('open a threat fold', `const d=[...document.querySelectorAll('#thrCard details.thrrow')][1];if(!d)return 'none';d.open=true;return d.dataset.thr`);
      await step('redraw', `render();return ''`);
      await step('show all biggest', click('#threatsAllBtn'));
      await step('redraw', `render();return ''`);
    }
    if (errs.length) out[k].push('page errors: ' + errs.join(' | '));
    await ctx.close(); }
  fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
if (out.a.length !== out.b.length) diff.push([-1, 'steps ' + out.a.length, 'steps ' + out.b.length]);
console.log(`${out.a.length} Matchups steps compared: ${same} identical, ${diff.length} different; last state ${out.a[out.a.length - 1].length} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => { let j = 0; while (j < x.length && x[j] === y[j]) j++; console.log('  step', i, 'first difference at char', j, '\n   a:', x.slice(Math.max(0, j - 150), j + 250), '\n   b:', y.slice(Math.max(0, j - 150), j + 250)); });
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);
