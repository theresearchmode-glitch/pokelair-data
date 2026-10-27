// Records real interactions on the page as frame sequences for the hype video: taps (with a visible tap marker),
// typing, smooth scrolls, the result appearing. Phone size at 2x (780x1688 frames).
// Usage: node experiments/hype-record.mjs <outDir> [clip,...]
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2], only = process.argv[3] ? process.argv[3].split(',') : null;
const page = APP + 'rec.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
async function session(scheme = 'dark') { const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme}), pg = await ctx.newPage();
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3500);
  await pg.addStyleTag({content: '#tapdot{position:fixed;z-index:999999;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 0 0 3px rgba(255,62,165,.9),0 0 30px rgba(255,62,165,.7);pointer-events:none;display:none} .welcome,.welcomecard,#welcome{display:none!important}'});
  await pg.evaluate(() => { const d = document.createElement('div'); d.id = 'tapdot'; document.body.appendChild(d); });
  return {ctx, pg}; }
const ev = (pg, c) => pg.evaluate(c => window.__ev(c), c);
// a clip recorder: hold, tap, type, scroll, each step writes frames
function clip(pg, name) { const d = `${dir}/${name}`; fs.mkdirSync(d, {recursive: true}); let n = 0;
  const frame = async () => { await pg.screenshot({path: `${d}/${String(++n).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 88}); };
  return {
    hold: async k => { for (let i = 0; i < k; i++) await frame(); },
    // the tap marker grows in over 4 frames on the element, then the click lands and the marker fades over 4 frames
    tap: async (sel, after) => { const r = await pg.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const b = e.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2}; }, sel); if (!r) { console.log('missing', sel); return; }
      for (let i = 1; i <= 4; i++) { await pg.evaluate(([x, y, s]) => { const t = document.getElementById('tapdot'); t.style.display = 'block'; t.style.left = x + 'px'; t.style.top = y + 'px'; t.style.transform = `scale(${s})`; t.style.opacity = 1; }, [r.x, r.y, .4 + .15 * i]); await frame(); }
      if (after) await after(); else await pg.evaluate(s => document.querySelector(s).click(), sel);
      for (let i = 1; i <= 4; i++) { await pg.evaluate(o => { const t = document.getElementById('tapdot'); t.style.opacity = o; t.style.transform = `scale(${1.2 + (1 - o)})`; }, 1 - i / 4); await frame(); }
      await pg.evaluate(() => { document.getElementById('tapdot').style.display = 'none'; }); },
    scroll: async (dy, k) => { for (let i = 0; i < k; i++) { const e = i / (k - 1 || 1), step = dy * (Math.sin(Math.PI * e) * Math.PI / 2) / k; await pg.evaluate(s => window.scrollBy(0, s), step); await frame(); } },
    type: async (sel, text) => { for (const ch of text) { await pg.evaluate(([s, c]) => { const e = document.querySelector(s); e.value += c; e.dispatchEvent(new Event('input', {bubbles: true})); }, [sel, ch]); await frame(); await frame(); } },
    count: () => n };
}
const want = n => !only || only.includes(n);
{ const {ctx, pg} = await session();
  if (want('build')) { await ev(pg, "ui.abSrc='all';ui.ab=null;setView('auto');window.scrollTo(0,0);render()"); const c = clip(pg, 'build'); await c.hold(8); await c.tap('#abBtn', async () => { await ev(pg, "runAutoBuild()"); }); await pg.waitForTimeout(5500); await ev(pg, "const o=document.getElementById('abOut');o&&o.scrollIntoView({block:'start'});window.scrollBy(0,-60)"); await c.hold(6); await c.scroll(700, 40); await c.hold(6); console.log('build', c.count()); }
  if (want('fix')) { await ev(pg, "S.slots=['Greninja','Charizard-Mega-Y','Garchomp','Gengar','Lucario','Gardevoir'].map(n=>({n,a:null,lock:false}));fixSlots();S.loadedId=null;planCache={key:null,plans:[]};setView('build');render();window.scrollTo(0,0)"); await pg.waitForTimeout(800);
    const c = clip(pg, 'fix'); await c.hold(14); await ev(pg, "const s=document.getElementById('sugs');s&&s.scrollIntoView({block:'start'});window.scrollBy(0,-80)"); await c.hold(10); await c.tap('[data-plan="0"]'); await pg.waitForTimeout(300); await ev(pg, "window.scrollTo(0,0)"); await c.hold(22); console.log('fix', c.count()); }
  if (want('battle')) { await ev(pg, "document.getElementById('toast').hidden=true;S.opp=['Incineroar','Rillaboom','Sneasler','Kingambit','Salamence-Mega','Basculegion'];S.slots=DEFAULT_TEAM.slots.map(s=>({...s}));fixSlots();render();setView('matchup');window.scrollTo(0,0)"); await pg.waitForTimeout(700); const c = clip(pg, 'battle'); await c.hold(6); await c.scroll(900, 45); await c.hold(4); console.log('battle', c.count()); }
  if (want('search')) { await ev(pg, "setView('home');window.scrollTo(0,0)"); await pg.waitForTimeout(400); const c = clip(pg, 'search'); await c.hold(4); await c.tap('[data-jumpbtn]', async () => { await ev(pg, 'jumpOpen()'); }); await c.hold(4); await c.type('#jumpIn', 'king'); await c.hold(6); await c.tap('[data-jo="0"]'); await pg.waitForTimeout(400); await c.hold(14); console.log('search', c.count()); }
  if (want('rate')) { await ev(pg, "const sh=document.getElementById('lairSheet');sh&&(sh.hidden=true);setView('ratings');window.scrollTo(0,0)"); await pg.waitForTimeout(500); const c = clip(pg, 'rate'); await c.hold(4); await c.scroll(520, 24); await c.tap('.ltiles [data-lt], [data-lt]'); await pg.waitForTimeout(300); await c.hold(16); console.log('rate', c.count()); }
  if (want('theme')) { await ev(pg, "const sh=document.getElementById('lairSheet');sh&&(sh.hidden=true);setView('build');window.scrollTo(0,0);S.slots=DEFAULT_TEAM.slots.map(s=>({...s}));fixSlots();render()"); await pg.waitForTimeout(500); const c = clip(pg, 'theme'); await c.hold(10);
    await c.tap('[data-jumpbtn]', async () => { await ev(pg, "setTheme('light')"); }); await c.hold(14); await c.tap('[data-jumpbtn]', async () => { await ev(pg, "setTheme('dark')"); }); await c.hold(8); console.log('theme', c.count()); }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);
