// Pre-launch check 5a (Nov 17; 44px tap areas added Nov 19, design review #5): standalone text links and small buttons are at least 24px tall (WCAG 2.5.8); the reviewer measured
// 19-22px on these. Links inside a sentence are exempt (not listed). Exit 1 on failure.   PAGE=app/dist/v2.html node app/test/tap-size.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || process.argv[2] || 'app/dist/v2.html'), fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const b = await chromium.launch(), H = {};
for (const w of [390, 1440]) { const p = await b.newPage({viewport: {width: w, height: 900}});
  for (const [r, src] of [['tournaments', '^(Set as Opponent|Compare)'], ['team', '^Game Plan'], ['battle', 'Change on My Team'], ['track', 'How Ratings Work'], ['feedback', 'Show Email'], ['about', '^(Limitless|Victory Road|VR Pastes|Liquipedia|Pokémon Showdown|Smogon)$']]) {
    await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(2000);
    const hs = await p.evaluate(src => { const R = new RegExp(src); return [...document.querySelectorAll('#main a, #main button')].filter(e => e.offsetParent !== null && R.test(e.textContent.trim()) && !(e.parentElement.tagName === 'P' && [...e.parentElement.childNodes].filter(n => !(n.nodeType === 1 && /^(A|BUTTON|SPAN)$/.test(n.tagName) && n.querySelector && (n.matches('a,button') || n.querySelector('a,button')))).map(n => n.textContent).join('').trim().length > 20)) /* a link inside a sentence is exempt (WCAG 2.5.8); Nov 22: a row of links (My Team's Game Plan / Legal / Team Sheet) is not a sentence, so only the words outside links and buttons count */.map(e => Math.round(e.getBoundingClientRect().height)); }, src);
    H[w + r] = await p.evaluate(() => document.documentElement.scrollHeight);
    ok(hs.length > 0 && hs.every(h => h >= 24), `${w} wide, ${r}: /${src}/ at least 24px tall (${hs.join(', ') || 'not found'})`); }
  await p.close(); }
/* design review Nov 19 #5 + PC test run Nov 19: the real tap area of these links is at least 44px tall, measured where a finger lands, not
   from the drawn box: on every line the link sits on (a wrapped link has two), from the middle of that line straight up and down, 1px at a
   time, while the page still answers with this link (elementFromPoint). Because the scan stops at the first point another control or
   anything else answers, two tap areas that cover each other fail here too (the covered one comes up short), and each line's own middle must
   answer with the link. Before the fix: Go to My Team in Battle and Archetypes 20px, Read the Story at 1440 32px, the Mystery Gift source
   links 17-18px. It can't see: other screen widths or states than listed, links not named here, or whether anything looks different (the
   no-visible-change check is a before/after pixel compare). */
for (const w of [320, 390, 1440]) for (const [r, st, sel] of [['battle', 'empty', '.bt-empty .np-link'], ['archetypes', 'guide', '.ar-none .np-link'], ['news', '', '.nw2 .k-link'] /* Nov 22: News on the kit (Sim approved): its links are the kit's (All Ratings, All Mystery Gifts, Read ›, ...); the paper's Read the Story links are gone */, ['gifts', '', '.pr-src a'],
  ['team', '', '.tm-sample .np-link, .tm-links .np-link, .mtf-bb .mtf-btn, .mtf-acts .np-link'] /* Nov 21: My Team frame (Sim approved): the header's two buttons and its action links */, ['practice', 'empty', '.pp2-act .np-link'], ['team', 'cleared', '.np-toast button']]) {
  const p = await b.newPage({viewport: {width: w, height: 900}}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
  if (st === 'empty' || st === 'guide') { await p.evaluate(() => { window.__ev('clearTeam(); render()'); document.querySelectorAll('.np-toast').forEach(t => t.remove()); }); await p.waitForTimeout(500); }
  if (st === 'guide') { await p.evaluate(() => window.__ev('V2.arUi.open = V2.arData().rows[0].k; V2.redraw()')); await p.waitForTimeout(500); }
  if (st === 'cleared') { await p.evaluate(() => window.__ev('V2.clearTeam()')); await p.waitForTimeout(500); }
  const got = await p.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().height > 0).map(e => { if (!e.closest('.np-toast')) e.scrollIntoView({block: 'center'});
    const own = (x, y) => { const t = document.elementFromPoint(x, y); return !!t && t.closest('a,button') === e; };
    const lines = [...e.getClientRects()].filter(q => q.width > 2).map(q => { const x = q.left + q.width / 2, y = q.top + q.height / 2; if (!own(x, y)) return 0;
      let up = 0, dn = 0; while (up < 80 && own(x, y - up - 1)) up++; while (dn < 80 && own(x, y + dn + 1)) dn++; return up + dn + 1; });
    return `${e.textContent.trim().replace(/\s+/g, ' ').slice(0, 24)} ${lines.join('/')}`; }), sel);
  ok(got.length > 0 && got.every(g => g.split(' ').pop().split('/').every(h => +h >= 44)), `${w} wide, ${r}${st ? ' (' + st + ')' : ''}: tap area at least 44px tall on every line of ${sel} (${got.join(', ') || 'not found'})`);
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
