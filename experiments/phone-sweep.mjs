// iPhone sweep (Nov 8, list item 7): every page at 375 / 390 / 430 px wide, light and dark, with a full team and an opponent.
// Flags: the page scrolling sideways, an element sticking out past the screen edge, and text cut off inside its box
// (overflow hidden with more text than fits). Usage: node experiments/phone-sweep.mjs [page.html]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8')), SRC = process.argv[2] || ROOT + 'app/dist/page.html';
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/teams': (() => { try { return rd('teams.json'); } catch (e) { return null; } })()};
const page = ROOT + `app/phone-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(SRC, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const TEAM = ['Annihilape', 'Arcanine-Hisui', 'Dragonite', 'Kingambit', 'Garchomp', 'Rillaboom'].map(n => ({n, a: null, lock: false})), OPP = ['Sneasler', 'Basculegion', 'Kingambit', 'Rillaboom', 'Salamence-Mega', 'Floette-Mega'];
const VIEWS = ['home', 'report', 'auto', 'teams', 'compare', 'matchup', 'coverage', 'types', 'ratings', 'meta', 'top', 'sets', 'box', 'speed', 'calc', 'gauntlet', 'arch', 'cores', 'events', 'method'];
const b = await chromium.launch(), found = [];
for (const look of ['light', 'dark']) for (const w of [375, 390, 430]) {
  const ctx = await b.newContext({viewport: {width: w, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, colorScheme: look}), pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(([D, TEAM, OPP]) => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; const st = {slots: TEAM, box: [], teams: [], format: 'doubles', maxMega: 2, megaGoal: 2, opp: OPP, excl: [], log: []};
    window.claude = {use: async n => n === 'db' ? {doc: p => p.startsWith('meta/') ? ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})}) : ({get: async () => ({exists: true, data: () => st}), set: async () => {}, update: async () => {}, onSnapshot: () => () => {}})} : n === 'user' ? {id: async () => 'u'} : null}; }, [D, TEAM, OPP]);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000);
  for (const v of VIEWS) { await pg.evaluate(v => window.__ev(`setView('${v}')`), v).catch(() => {}); await pg.waitForTimeout(900);
    const r = await pg.evaluate(() => { const W = innerWidth, out = [], seen = new Set(), lab = e => (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' "' + (e.innerText || '').trim().slice(0, 30).replace(/\s+/g, ' ') + '"';
      if (document.documentElement.scrollWidth > W + 1) out.push('page scrolls sideways (' + document.documentElement.scrollWidth + 'px)');
      for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || e.closest('[hidden],details:not([open]) > :not(summary)')) continue; const rc = e.getBoundingClientRect(); if (!rc.width || !rc.height) continue;
        if (cs.position === 'fixed') continue;
        if ((rc.right > W + 1 || rc.left < -1) && !e.closest('.tablewrap,[style*="overflow"],.seg,.ar-jumps,.hscroll,table') && !seen.has(e.parentElement)) { seen.add(e); out.push('sticks out: ' + lab(e) + ' ' + Math.round(rc.left) + '…' + Math.round(rc.right)); }
        if (e.children.length === 0 && (e.innerText || '').trim() && (cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2) out.push('text cut off: ' + lab(e)); }
      return out.slice(0, 6); });
    for (const x of r) found.push(`${look} ${w}px · ${v}: ${x}`); }
  if (errs.length) found.push(`${look} ${w}px · page error: ${errs[0].slice(0, 120)}`);
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);
const uniq = [...new Set(found)]; console.log(uniq.length ? uniq.join('\n') : 'PHONE SWEEP CLEAN'); console.log(`${uniq.length} findings`);
