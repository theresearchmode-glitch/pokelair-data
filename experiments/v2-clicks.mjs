// One click, one action (Sim, Nov 12): the in-place redraw (V2.redraw / V2.morph) keeps unchanged elements, so a listener bound
// again after a redraw would fire twice. This test redraws My Team three times, then clicks every visible button, link and fold
// (header, page, footer) once, each in a fresh page, and records every click handler that runs. It fails when the same handler
// (same code) on the same element runs more than once for one click.
// C2_PLANT=1 (testing the test): a duplicate handler is planted on the jump bar's first link; the run must then report it.
// Usage: node app/build.mjs --v2 && node experiments/v2-clicks.mjs [page.html]   (default app/dist/v2.html)
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path'; import fs from 'node:fs'; import {createRequire} from 'node:module';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), require = createRequire(import.meta.url);
let pw; try { pw = require(path.join(ROOT, 'node_modules/playwright')); } catch (e) { pw = require('playwright'); }
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const file = process.argv[2] || path.join(ROOT, 'app/dist/v2.html'), PLANT = !!process.env.C2_PLANT;
// before the page's own code runs: every click listener is wrapped so each call is recorded with its element and its code
const HOOK = () => { const ids = new WeakMap(); let n = 0; const id = o => { if (!ids.has(o)) ids.set(o, ++n); return ids.get(o); };
  window.__calls = []; const add = EventTarget.prototype.addEventListener, rem = EventTarget.prototype.removeEventListener, wraps = new WeakMap();
  // one wrapper per function (so adding the very same function twice stays a no-op, as in a real browser); the element is read
  // from the event (currentTarget), so one wrapper serves every element it is attached to
  EventTarget.prototype.addEventListener = function (type, fn, opt) { if (type !== 'click' || typeof fn !== 'function') return add.call(this, type, fn, opt);
    let w = wraps.get(fn); if (!w) { w = function (e) { const t = e.currentTarget; window.__calls.push({ev: id(e), node: t === document ? 'document' : t === window ? 'window' : 'el' + id(t), code: String(fn).slice(0, 400)}); return fn.apply(this, arguments); }; wraps.set(fn, w); }
    return add.call(this, type, w, opt); };
  EventTarget.prototype.removeEventListener = function (type, fn, opt) { return rem.call(this, type, (type === 'click' && wraps.get(fn)) || fn, opt); }; };
const b = await pw.chromium.launch(); const res = []; let total = 0, bad = 0;
const page = async w => { const ctx = await b.newContext({viewport: {width: w, height: 900}}); const p = await ctx.newPage(); await p.addInitScript(HOOK);
  await p.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto(pathToFileURL(path.resolve(file)).href + '#team'); await p.waitForTimeout(2500); await p.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {});
  await p.evaluate(() => { V2.redraw(); V2.redraw(); V2.redraw(); }); await p.waitForTimeout(400);
  if (PLANT) await p.evaluate(() => { const a = document.querySelector('[data-tmjump]'); const mk = () => function plantedProbe() { return 1; }; a.addEventListener('click', mk()); a.addEventListener('click', mk()); });
  return {ctx, p}; };
// the controls to click: every visible one, by its place in document order (the page is the same fresh each time)
const SEL = '#app a[href], #app button, #app summary';
for (const w of [390, 1440]) {
  let {ctx, p} = await page(w); const list = await p.evaluate(sel => [...document.querySelectorAll(sel)].map((e, i) => [i, e.getClientRects().length > 0 && !e.closest('[hidden],[inert]') && (e.checkVisibility ? e.checkVisibility() : true), (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 40)]).filter(x => x[1]), SEL); await ctx.close();
  for (const [i, , label] of list) { ({ctx, p} = await page(w));
    const ok = await p.evaluate(([sel, i]) => { const e = document.querySelectorAll(sel)[i]; if (!e) return false; e.scrollIntoView({block: 'center'}); window.__calls = []; return true; }, [SEL, i]);
    if (!ok) { await ctx.close(); continue; }
    try { await p.locator(SEL).nth(i).click({timeout: 3000}); } catch (e) { try { await p.evaluate(([sel, i]) => document.querySelectorAll(sel)[i].click(), [SEL, i]); } catch (x) {} }
    await p.waitForTimeout(350);
    const dup = await p.evaluate(() => { const seen = new Map(), out = []; for (const c of window.__calls) { const k = c.ev + '|' + c.node + '|' + c.code; seen.set(k, (seen.get(k) || 0) + 1); }
      for (const [k, n] of seen) if (n > 1) out.push(n + 'x ' + k.split('|')[1] + ' ' + k.split('|').slice(2).join('|').replace(/\s+/g, ' ').slice(0, 60)); return out; });
    total++; if (dup.length) { bad++; res.push(`  ${w} "${label}": ${dup.join('; ')}`); }
    await ctx.close(); } }
await b.close();
console.log(res.join('\n'));
console.log(`v2 clicks: ${total} controls clicked once each after 3 redraws (390 and 1440); ${bad} fired a handler more than once${PLANT ? ' [planted duplicate on the first jump link]' : ''}`);
process.exit(bad ? 1 : 0);
