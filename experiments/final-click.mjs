// Click-through of every page, phone + desktop, light + dark: page errors, console errors, NaN/undefined text, sideways
// scroll, and every visible button in the main area clicked once. Usage: node experiments/final-click.mjs [shotDir]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2] || null; if (dir) fs.mkdirSync(dir, {recursive: true});
const page = APP + 'final-click.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const TEAM = `Raichu @ Raichunite X\nAbility: Lightning Rod\nJolly Nature\n- Fake Out\n- Protect\n- Volt Tackle\n- Volt Switch\n\nSneasler @ Psychic Seed\nAbility: Unburden\nAdamant Nature\n- Close Combat\n- Dire Claw\n- Protect\n- Fake Out\n\nPrimarina @ Leftovers\nAbility: Liquid Voice\nModest Nature\n- Hyper Voice\n- Protect\n- Moonblast\n- Calm Mind\n\nCharizard @ Charizardite Y\nAbility: Blaze\nTimid Nature\n- Heat Wave\n- Protect\n- Weather Ball\n- Solar Beam\n\nFarigiraf @ Sitrus Berry\nAbility: Armor Tail\nBold Nature\n- Trick Room\n- Helping Hand\n- Psychic\n- Thunderbolt\n\nHydreigon @ Choice Scarf\nAbility: Levitate\nModest Nature\n- Dark Pulse\n- Draco Meteor\n- Earth Power\n- Snarl`;
const VIEWS = ['home', 'build', 'auto', 'teams', 'matchup', 'coverage', 'types', 'ratings', 'meta', 'top', 'cores', 'events', 'sets', 'box', 'speed', 'calc', 'gauntlet', 'arch'];
const BAD = /\bNaN\b|\bundefined\b|\[object |\bInfinity\b|null%|\bnull\b(?= ?(%|pts|games))/;
const issues = [], add = (tag, m) => { if (!issues.some(i => i.tag === tag && i.m === m)) issues.push({tag, m}); };
const loadTeam = pg => pg.evaluate(t => window.__ev(`(()=>{const u=parsePaste(${JSON.stringify(t)});S.slots=normSlots(u.slots);fixSlots();S.loadedId=null;planCache={key:null,plans:[]};render()})()`), TEAM);
const go = (pg, v) => pg.evaluate(v => window.__ev(`setView(${JSON.stringify(v)});window.scrollTo(0,0)`), v);
const check = async (pg, tag) => { const r = await pg.evaluate(BADs => { const BAD = new RegExp(BADs);
    const vis = [...document.querySelectorAll('main section, .bmsheet, #lairSheet, #fbSheet')].filter(s => s.offsetParent || s.getClientRects().length);
    const bad = []; for (const s of vis) { const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const t = n.textContent; if (BAD.test(t) && n.parentElement && n.parentElement.offsetParent && !n.parentElement.closest('script,style,textarea,code')) bad.push(t.trim().slice(0, 120)); } }
    const over = document.documentElement.scrollWidth - innerWidth;
    const wide = over > 1 ? [...document.querySelectorAll('main *')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > innerWidth + 1 && !e.closest('[style*="overflow"], .hscroll, .tblwrap, .scrollx, pre') && getComputedStyle(e.parentElement).overflowX === 'visible'; }).slice(0, 3).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right)) : [];
    return {bad: [...new Set(bad)].slice(0, 5), over, wide}; }, BAD.source);
  for (const b of r.bad) add(tag, 'text: ' + b);
  if (r.over > 1) add(tag, `sideways scroll ${r.over}px ${r.wide.join(', ')}`); };
const b = await chromium.launch();
for (const [w, h, dev] of [[375, 812, 'phone'], [1366, 900, 'desk']]) for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: w < 700 ? 2 : 1, isMobile: w < 700, hasTouch: w < 700, colorScheme: scheme}), pg = await ctx.newPage();
  let cur = ''; pg.on('pageerror', e => add(cur, 'page error: ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR_FILE/.test(m.text())) add(cur, 'console: ' + m.text().slice(0, 160)); });
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(2500);
  // a brand-new visitor first (empty team), then the user's team
  for (const v of VIEWS) { cur = `${dev}/${scheme}/empty/${v}`; await go(pg, v); await pg.waitForTimeout(v === 'gauntlet' || v === 'auto' ? 2500 : 500); await check(pg, cur); }
  cur = `${dev}/${scheme}/load`; await loadTeam(pg); await pg.waitForTimeout(800);
  for (const v of VIEWS) { cur = `${dev}/${scheme}/team/${v}`; await go(pg, v); await pg.waitForTimeout(v === 'gauntlet' || v === 'auto' ? 3000 : 700); await check(pg, cur);
    if (dir && ((dev === 'phone' && scheme === 'dark') || (dev === 'desk' && scheme === 'light')) && ['home', 'build', 'ratings', 'top', 'sets', 'matchup', 'calc', 'speed', 'gauntlet'].includes(v)) await pg.screenshot({path: `${dir}/${v}_${dev}_${scheme}.png`});
    // every visible button / summary in the main area, clicked once (phone light and desktop dark only, to keep it quick)
    if ((dev === 'phone') === (scheme === 'light')) { const n = await pg.evaluate(() => { const els = [...document.querySelectorAll('main button, main summary, main [data-view], main [role=button]')].filter(e => e.offsetParent && !e.disabled); els.forEach((e, i) => e.dataset.fcI = i); return els.length; });
      for (let i = 0; i < Math.min(n, 80); i++) { const lab = await pg.evaluate(i => { const e = document.querySelector(`[data-fc-i="${i}"]`); if (!e || !e.offsetParent) return null; const t = (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 40);
          if (/download|copy|share|export|delete|clear|reset|remove all|send/i.test(t)) return null; e.click(); return t; }, i);
        if (lab === null) continue; cur = `${dev}/${scheme}/team/${v}/click "${lab}"`; await pg.waitForTimeout(120); await check(pg, cur);
        const now = await pg.evaluate(() => window.__ev('view')); if (now !== v) { await go(pg, v); await pg.waitForTimeout(400); await pg.evaluate(() => { const els = [...document.querySelectorAll('main button, main summary, main [data-view], main [role=button]')].filter(e => e.offsetParent && !e.disabled); els.forEach((e, i) => e.dataset.fcI = i); }); }
        await pg.evaluate(() => { for (const k of ['lairSheet', 'fbSheet', 'jump']) { const s = document.getElementById(k); if (s && !s.hidden && s.querySelector('[data-close],.fbx,.close')) s.querySelector('[data-close],.fbx,.close').click(); } document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); }); }
      await loadTeam(pg); }
  }
  // back button: three pages forward, two back
  cur = `${dev}/${scheme}/back`; await go(pg, 'ratings'); await pg.waitForTimeout(300); await go(pg, 'speed'); await pg.waitForTimeout(300); await go(pg, 'calc'); await pg.waitForTimeout(300);
  await pg.goBack(); await pg.waitForTimeout(400); const v1 = await pg.evaluate(() => window.__ev('view')); await pg.goBack(); await pg.waitForTimeout(400); const v2 = await pg.evaluate(() => window.__ev('view'));
  if (v1 !== 'speed' || v2 !== 'ratings') add(cur, `back went to ${v1}, ${v2} (expected speed, ratings)`);
  await ctx.close(); }
// What's new: a returning visitor who saw the last note gets this one
{ const ctx = await b.newContext({viewport: {width: 375, height: 812}}), pg = await ctx.newPage();
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2026-10-28"'); } catch (e) {} }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(2500); await pg.evaluate(() => window.__ev("setView('home')")); await pg.waitForTimeout(500);
  const t = await pg.evaluate(() => { const c = document.getElementById('wnewCard'); return c ? c.innerText : null; });
  if (!t) add('whatsnew', 'card not shown to a returning visitor'); else if (dir) { await pg.evaluate(() => document.getElementById('wnewCard').scrollIntoView({block: 'center'})); await pg.screenshot({path: `${dir}/whats-new_phone.png`}); }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);
console.log(issues.length ? issues.map(i => `${i.tag}: ${i.m}`).join('\n') + `\n\n${issues.length} ISSUES` : 'CLICK-THROUGH CLEAN');
process.exit(issues.length ? 1 : 0);
