// Pre-launch check 5a (Nov 17): standalone text links and small buttons are at least 24px tall (WCAG 2.5.8); the reviewer measured
// 19-22px on these. Links inside a sentence are exempt (not listed). Exit 1 on failure.   PAGE=app/dist/v2.html node app/test/tap-size.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || process.argv[2] || 'app/dist/v2.html'), fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const b = await chromium.launch(), H = {};
for (const w of [390, 1440]) { const p = await b.newPage({viewport: {width: w, height: 900}});
  for (const [r, src] of [['tournaments', '^(Set as Opponent|Compare)'], ['team', '^Game Plan'], ['battle', 'Change on My Team'], ['track', 'How Ratings Work'], ['feedback', 'Show Email'], ['about', '^(Limitless|Victory Road|VR Pastes|Liquipedia|Pokémon Showdown|Smogon)$']]) {
    await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(2000);
    const hs = await p.evaluate(src => { const R = new RegExp(src); return [...document.querySelectorAll('#main a, #main button')].filter(e => e.offsetParent !== null && R.test(e.textContent.trim()) && !(e.parentElement.tagName === 'P' && e.parentElement.textContent.trim().length > e.textContent.trim().length + 20)) /* a link inside a sentence is exempt (WCAG 2.5.8) */.map(e => Math.round(e.getBoundingClientRect().height)); }, src);
    H[w + r] = await p.evaluate(() => document.documentElement.scrollHeight);
    ok(hs.length > 0 && hs.every(h => h >= 24), `${w} wide, ${r}: /${src}/ at least 24px tall (${hs.join(', ') || 'not found'})`); }
  await p.close(); }
/* C8 tap areas (Nov 19: audit #10 and design review #3 measured the drawn boxes, 36-38 px wide or 19-26 px tall; a box says nothing about where a
   tap lands, and the 24px check above passes any 20px link). Each named control, in the state where it shows (touch context), is hit-tested
   21 px left, right, above and below its centre (a 43 px reach, as experiments/c13-check.mjs); each point must be the control or inside it.
   Exact geometry (elementFromPoint), not touchscreen.tap: Chromium's touch adjustment snaps a near-miss onto the nearest link, so a real
   tap passed even with the header's tap areas deleted. "Log a Game" is tested too, so the Undo under it can't take its taps. The Undo after
   a logged game was missed before: no check logged a game, and the shared 44px area skipped buttons inside a <p>. */
const tapOk = async (q, re, sel = '#main a, #main button, .np-head a, .np-toast button') => {
  const n = await q.evaluate(([re, sel]) => { const R = new RegExp(re); window.__t = [...document.querySelectorAll(sel)].filter(e => e.checkVisibility({checkOpacity: true, checkVisibilityCSS: true}) && R.test((e.getAttribute('aria-label') || e.textContent).trim()));
    return window.__t.length; }, [re, sel]);
  const out = []; for (let i = 0; i < n; i++) { const g = await q.evaluate(i => { const e = window.__t[i], R0 = e.getBoundingClientRect(); if (getComputedStyle(e.closest('.np-head,.np-toast') || document.body).position !== 'fixed') window.scrollTo({top: scrollY + R0.top + R0.height / 2 - innerHeight / 2, behavior: 'instant'});
      const R = e.getBoundingClientRect(); return {x: R.left + R.width / 2, y: R.top + R.height / 2, t: (e.textContent.trim() || e.getAttribute('aria-label')).replace(/\s+/g, ' ').slice(0, 24), box: Math.round(R.width) + 'x' + Math.round(R.height)}; }, i);
    const miss = await q.evaluate(([i, g]) => { const e = window.__t[i]; return [[-21, 0, 'left'], [21, 0, 'right'], [0, -21, 'above'], [0, 21, 'below']].map(([dx, dy, k]) => { const h = document.elementFromPoint(g.x + dx, g.y + dy);
      if (h && (h === e || e.contains(h))) return ''; const a = h && h.closest('a,button'); return k + (a ? ' (on ' + a.textContent.trim().slice(0, 16) + ')' : h ? ' (on ' + h.tagName.toLowerCase() + ')' : ''); }).filter(Boolean); }, [i, g]);
    out.push(`${g.t} (${g.box})${miss.length ? ' MISSES ' + miss.join('/') : ''}`); }
  return out; };
const T = [];
for (const w of [390, 820, 1024]) { const c = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 900}, hasTouch: true}), q = await c.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2000);
  if (w > 700) T.push([w + ' header', await tapOk(q, '^(Home|Build|Battle|Meta)$', '.np-nav a')]);
  if (w < 1000) { T.push([w + ' My Team', await tapOk(q, '^(Build Me a Team|Import a Team|Why This Score\\?|Team Sheet)')]);
    await q.locator('[data-yglog]').first().click(); await q.waitForTimeout(500); await q.locator('[data-ygres="W"]').first().click(); await q.waitForTimeout(1000);
    T.push([w + ' after Log a Game: Win', await tapOk(q, '^(Undo|Log a Game)$', '.tm-yg button')]);
    await q.locator('[data-tmsel="5"]').first().click(); await q.waitForTimeout(500); await q.locator('[data-v2rm]').first().click(); await q.waitForTimeout(600);
    T.push([w + ' toast after Remove', await tapOk(q, '^Undo$', '.np-toast button')]);
    await q.goto('file://' + PAGE + '#battle'); await q.waitForTimeout(1800); const o = q.locator('[data-btopp]').first(); if (await o.count()) { await o.click(); await q.waitForTimeout(500); await q.locator('[data-btteam="0"]').first().click(); await q.waitForTimeout(1500); }
    T.push([w + ' Battle', await tapOk(q, '^Change the four you brought')]); }
  await c.close(); }
for (const [k, v] of T) ok(v.length > 0 && !v.some(x => x.includes('MISSES')), `C8 tap areas, ${k}: 21px left, right, above and below the centre is still the control (${v.join(', ') || 'not found'})`);
await b.close(); if (process.env.HEIGHTS) console.log(JSON.stringify(H));
console.log(`tap-size: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
