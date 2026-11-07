// Shake sweep (Nov 7, Sim: tapping a suggestion "bounces the page up and down crazy for a second").
// Taps every in-place control on every page, with no team and with a full team, and records the page frame by frame for 1.5 s
// after each tap: the scroll position and where the tapped control sits on screen. It flags
//   - a shake: the page (or the control on screen) moves one way and then back the other way by more than 6px;
//   - a jump: the control ends more than 40px from where it was (it moved away from under the finger).
// One move that keeps the tapped spot in place is fine; going to another page, opening a sheet or a "more" list is skipped.
// Uses the real data in out/ and a made-up team (never anyone's saved data). Writes nothing outside the temporary test page.
// Usage: node experiments/shake-sweep.mjs [390|1280] [views,comma] [out.json]      exit code 1 when anything shakes
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium, devices} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const [w = '390', only = '', outFile = ''] = process.argv.slice(2), PHONE = +w < 700;
const VIEWS = only ? only.split(',') : ['home', 'report', 'recs', 'auto', 'coverage', 'matchup', 'calc', 'speed', 'gauntlet', 'practice', 'ratings', 'meta', 'sets', 'top', 'events', 'arch', 'weekly', 'track', 'teams', 'box', 'types', 'method', 'about', 'compare'];
const TEAM = ['Annihilape', 'Salamence', 'Rillaboom', 'Glimmora', 'Kingambit', 'Delphox'];
const L = rd('limitless.json');
const D = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/teams': rd('teams.json'), 'meta/events': rd('events.json'), 'meta/weekly': rd('weekly.json'), 'meta/track': rd('track.json'), 'meta/practice': rd('practice.json')};
const page = ROOT + 'app/shake-sweep.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
const ctx = PHONE ? await b.newContext({...devices['iPhone 13'], colorScheme: 'dark'}) : await b.newContext({viewport: {width: 1280, height: 860}, colorScheme: 'dark'});
await ctx.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1;
  // a control is found again by what it is (tag, data-* / id / aria-label, text), so a redraw between taps doesn't lose it
  window.__skSig = e => ({tag: e.tagName, at: [...e.attributes].filter(a => (/^data-/.test(a.name) && !/^data-(swid|ctj|pm)$/.test(a.name)) || a.name === 'id' || a.name === 'aria-label').map(a => [a.name, a.value]), txt: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40)});
  window.__skFind = s => { const all = [...document.querySelectorAll(s.tag)].filter(x => x.getBoundingClientRect().width > 2), t = x => (x.textContent || x.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return (s.at.length && all.find(x => s.at.every(([k, v]) => x.getAttribute(k) === v) && t(x) === s.txt)) || (s.at.length && all.find(x => s.at.every(([k, v]) => x.getAttribute(k) === v))) || all.find(x => t(x) === s.txt) || null; };
  window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
const pg = await ctx.newPage(), errs = [];
pg.on('pageerror', e => errs.push(e.message.slice(0, 160)));
const tapAt = (x, y) => PHONE ? pg.touchscreen.tap(x, y) : pg.mouse.click(x, y);
// a fresh page in the given state, on the given view
async function open(team, v) {
  await pg.evaluate(() => { try { const keep = localStorage.getItem('cc2.welcomed'); localStorage.clear(); localStorage.setItem('cc2.welcomed', keep || '"1"'); } catch (e) {} }).catch(() => {});
  await pg.goto('file://' + page); await pg.waitForTimeout(2200);
  if (team) await pg.evaluate(t => window.__ev(`S.slots=${JSON.stringify(t)}.map(n=>({n,lock:false}));fixSlots();render()`), TEAM);
  const got = await pg.evaluate(v => window.__ev(`setView(${JSON.stringify(v)});document.documentElement.dataset.pg`), v).catch(() => null);
  await pg.waitForTimeout(1800); return got; }
// the controls on the page that change something in place (not links to other pages, not destructive ones)
const listCtrls = () => pg.evaluate(() => { const pane = document.querySelector(`[data-pane="${document.documentElement.dataset.pg}"]`) || document.body, seen = new Set(), out = [];
  const SKIP = /delete|remove|clear|reset|forget|copy|share|download|export|import|paste|feedback|sign|undo|replace|start over|new team|log out|show email/i;
  for (const e of pane.querySelectorAll('button,summary,[role=tab],[role=button],label,input[type=checkbox],input[type=radio]')) { const r = e.getBoundingClientRect();
    if (r.width < 3 || r.height < 3 || getComputedStyle(e).visibility === 'hidden' || e.disabled) continue;
    if (e.matches('[data-view],[data-lt],[data-lsheet],[data-chthr],.chtr,.chtile,.jumpbtn,[data-load],[data-del],[data-laddteam],[data-lsets],[data-chedit],[data-chrm]') || e.closest('.bnav,.sidenav,.side,#jump')) continue;
    const txt = (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40); if (SKIP.test(txt + ' ' + (e.getAttribute('aria-label') || ''))) continue;
    const key = (e.className || '') + '|' + txt; if (seen.has(key)) continue; seen.add(key);
    out.push({sig: window.__skSig(e), txt}); if (out.length >= 40) break; }
  return out; });
// tap one control and watch the next 1.5 s
async function tapWatch(c) {
  const pre = await pg.evaluate(sig => { const e = window.__skFind(sig); if (!e || e.getBoundingClientRect().width < 3) return null;
    const r0 = e.getBoundingClientRect(); scrollBy({top: r0.top - innerHeight * .55, behavior: 'instant'}); const r = e.getBoundingClientRect();
    const h = document.elementFromPoint(r.left + Math.min(r.width / 2, 20), r.top + r.height / 2); if (!h || !(e.contains(h) || h.contains(e))) return {covered: 1};
    return {x: r.left + Math.min(r.width / 2, 20), y: r.top + r.height / 2, pg: document.documentElement.dataset.pg}; }, c.sig);
  if (!pre || pre.covered || pre.y < 0) return {skip: 1};
  await pg.waitForTimeout(150);
  await pg.evaluate(sig => { const e0 = window.__skFind(sig), find = () => (e0 && e0.isConnected && e0.getBoundingClientRect().width > 2) ? e0 : window.__skFind(sig);
    window.__sk = []; const t0 = performance.now(); const f = () => { const e = find(); window.__sk.push([scrollY, e ? e.getBoundingClientRect().top : null]); if (performance.now() - t0 < 1500) requestAnimationFrame(f); }; requestAnimationFrame(f); }, c.sig);
  const a0 = await pg.evaluate(() => [window.__ev('KP.appAt'), scrollY]);
  await tapAt(pre.x, pre.y); await pg.waitForTimeout(1600);
  // the app scrolled somewhere on purpose (a "jump to" button: scrollIntoView, or a scroll to another place); a scroll back to
  // where the reader was (holding the place during a redraw) is not on purpose and is still watched
  if (await pg.evaluate(([t, y]) => window.__ev(`KP.appAt > ${t} && (KP.appTo === -1e9 || Math.abs(KP.appTo - ${y}) > 40)`), a0)) return {away: 1};
  const s = await pg.evaluate(() => ({fr: window.__sk, pg: document.documentElement.dataset.pg, ov: ['chEdit', 'chScout', 'lairSheet', 'jump', 'fbSheet', 'shareBox'].some(id => { const x = document.getElementById(id); return x && !x.hidden; })}));
  if (s.pg !== pre.pg || s.ov) return {away: 1};
  // a shake: movement one way, then back the other way, both over 6px (scroll, or the control's place on screen)
  const shake = xs => { xs = xs.filter(x => x != null); let lo = xs[0], hi = xs[0], dir = 0, flips = 0, amp = 0;
    for (const x of xs) { if (dir >= 0 && x < hi - 6) { if (dir > 0) { flips++; amp = Math.max(amp, hi - x); } dir = -1; lo = x; } else if (dir <= 0 && x > lo + 6) { if (dir < 0) { flips++; amp = Math.max(amp, x - lo); } dir = 1; hi = x; }
      hi = Math.max(hi, x); lo = Math.min(lo, x); } return {flips, amp: Math.round(amp)}; };
  const sy = shake(s.fr.map(f => f[0])), ct = shake(s.fr.map(f => f[1])), tops = s.fr.map(f => f[1]).filter(x => x != null);
  return {shake: Math.max(sy.flips, ct.flips), amp: Math.max(sy.amp, ct.amp), jump: tops.length ? Math.round(tops[tops.length - 1] - tops[0]) : null, scroll: [s.fr[0][0], s.fr[s.fr.length - 1][0]].map(Math.round)}; }
const R = {width: +w, found: [], tapped: 0};
for (const team of [false, true]) for (const v of VIEWS) {
  const got = await open(team, v); if (got !== v) continue;
  const ctrls = await listCtrls(); let changed = false;
  for (const c of ctrls) {
    if (changed) { await open(team, v); await listCtrls(); changed = false; }
    let r; try { r = await tapWatch(c); } catch (e) { continue; }
    if (process.env.SKDBG) console.log(team ? 'T' : '-', v, JSON.stringify(c.txt), JSON.stringify(r));
    if (r.skip) continue; if (r.away) { changed = true; continue; } R.tapped++;
    if (team && /apply/i.test(c.txt)) changed = true;
    const where = `${team ? 'with a team' : 'no team'} · ${v} · "${c.txt}"`;
    if (r.shake) R.found.push({where, what: `shakes: ${r.shake} back-and-forth move${r.shake > 1 ? 's' : ''}, up to ${r.amp}px`, scroll: r.scroll});
    else if (r.jump != null && Math.abs(r.jump) > 40) R.found.push({where, what: `jumps ${r.jump}px away from the finger`, scroll: r.scroll});
  } }
await b.close(); fs.unlinkSync(page);
if (outFile) fs.writeFileSync(outFile, JSON.stringify({...R, errs}, null, 1));
console.log(`shake sweep at ${w}px: ${R.tapped} taps on ${VIEWS.length} pages, with and without a team`);
for (const f of R.found) console.log(`  ${f.where}: ${f.what} (scroll ${f.scroll.join(' → ')})`);
if (errs.length) console.log(`page errors: ${[...new Set(errs)].slice(0, 5).join(' | ')}`);
console.log(R.found.length ? `FOUND ${R.found.length}` : 'NO SHAKES OR JUMPS');
process.exit(R.found.some(f => /shakes/.test(f.what)) ? 1 : 0);
