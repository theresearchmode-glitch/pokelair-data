// Cut-out UI parts for promo videos: every card-like block on each page, captured on its own with a transparent
// background at 3x, plus a manifest (view, size, text) so a video can pick real components to animate.
// Usage: node experiments/hype-parts.mjs <outDir>
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2]; fs.mkdirSync(dir, {recursive: true});
const page = APP + 'parts.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), manifest = [];
const TEAM = "S.slots=DEFAULT_TEAM.slots.map(s=>({...s}));fixSlots();render();";
const BAD = "S.slots=['Greninja','Charizard-Mega-Y','Garchomp','Gengar','Lucario','Gardevoir'].map(n=>({n,a:null,lock:false}));fixSlots();S.loadedId=null;planCache={key:null,plans:[]};render();";
const OPP = "S.opp=['Incineroar','Rillaboom','Sneasler','Kingambit','Salamence-Mega','Basculegion'];render();";
const VIEWS = [['home', "setView('home')"], ['team', TEAM + "setView('build')"], ['teambad', BAD + "setView('build')"], ['auto', TEAM + "ui.abSrc='all';setView('auto');runAutoBuild()", 6500],
  ['ratings', "setView('ratings')"], ['sheet', "setView('ratings');lairSheet('Kingambit')"], ['meta', "setView('meta')"], ['cores', "setView('cores')"], ['top', "setView('top')"], ['sets', "setView('sets')"],
  ['speed', TEAM + "setView('speed')"], ['calc', TEAM + "setView('calc')"], ['gauntlet', TEAM + "setView('gauntlet')", 3000], ['matchup', TEAM + OPP + "setView('matchup')"], ['arch', "setView('arch')"],
  ['search', "setView('home');jumpOpen();const i=document.getElementById('jumpIn');i.value='gar';jumpRender()"], ['coverage', TEAM + "setView('coverage')", 2500]];
for (const scheme of ['dark', 'light']) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: scheme}), pg = await ctx.newPage();
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"x"'); } catch (e) {} }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3500);
  await pg.addStyleTag({content: '.welcome,#welcomeCard,#wnewCard,.toast,#healthBar,.hfb,.bnav{display:none!important}'});
  for (const [v, setup, wait] of (scheme === 'dark' ? VIEWS : VIEWS.filter(x => ['home', 'team', 'ratings', 'matchup'].includes(x[0])))) {
    await pg.evaluate(c => window.__ev(c), "try{lairClose()}catch(e){};try{jumpClose()}catch(e){}"); await pg.evaluate(c => window.__ev(c), setup); await pg.waitForTimeout(wait || 900);
    // pick visual blocks: has its own background or shadow, rounded, a sensible size; keep outermost-but-not-huge
    const n = await pg.evaluate(v => { const root = v === 'sheet' ? document.querySelector('#lairSheet .lspanel') : v === 'search' ? document.getElementById('jump') : document.querySelector('[data-pane]:not([hidden])'); if (!root) return 0;
      const vis = el => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(); if (r.width < 160 || r.height < 44 || r.height > 760) return false; if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        const bg = cs.backgroundColor, has = (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') || cs.backgroundImage !== 'none' || cs.boxShadow !== 'none'; return has && parseFloat(cs.borderTopLeftRadius) >= 6; };
      const all = [...root.querySelectorAll('*')].filter(vis); const keep = all.filter(el => !all.some(o => o !== el && o.contains(el) && o.getBoundingClientRect().height <= 520));
      keep.slice(0, 40).forEach((el, i) => el.setAttribute('data-part', v + '_' + i)); return Math.min(keep.length, 40); }, v);
    for (let i = 0; i < n; i++) { const el = await pg.$(`[data-part="${v}_${i}"]`); if (!el) continue; const name = `${v}_${i}${scheme === 'light' ? '_L' : ''}`;
      // clear every ancestor's background so the rounded corners come out transparent
      await el.evaluate(e => { for (let a = e.parentElement; a; a = a.parentElement) { a.style.setProperty('background', 'transparent', 'important'); a.style.setProperty('background-image', 'none', 'important'); } });
      try { await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(60); const bb = await el.boundingBox(); await el.screenshot({path: `${dir}/${name}.png`, omitBackground: true, animations: 'disabled'});
        const text = (await el.innerText()).replace(/\s+/g, ' ').slice(0, 140); manifest.push({name, view: v, scheme, w: Math.round(bb.width), h: Math.round(bb.height), text}); } catch (e) {} }
    await pg.evaluate(() => document.querySelectorAll('[data-part]').forEach(e => e.removeAttribute('data-part')));
    console.log(scheme, v, n); }
  await ctx.close(); }
fs.writeFileSync(dir + '/manifest.json', JSON.stringify(manifest, null, 1)); await b.close(); fs.unlinkSync(page); console.log('parts', manifest.length);
