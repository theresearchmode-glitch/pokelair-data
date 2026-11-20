// A shorter News page on phones (Sim's Q41 A, Nov 19): under 700 wide "In Brief" shows its first 2 headlines plus "N more in brief ›"
// (N = the hidden ones, from the data), a real button (aria-expanded, aria-controls) that opens the rest in place, keeps focus on itself
// and then reads "Show Fewer"; Top Ratings on the Back Page shows its top 3 rows, Next Events its first 2 (their "All Ratings ›" and
// "All N Next Events ›" links stay). At 390 x 844 the page is at least 0.3 screens shorter than the same page with the cuts undone in
// place (same data; the frozen CI data and today's differ in length). Tablet and desktop (700, 1440) unchanged: every headline, 5 ratings,
// 3 events, no button. Light and dark: nothing out of its box, nothing scrolls sideways, no page errors. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-q41.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (W, th, phone) => { const c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})});
  const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#news', {timeout: 90000}); await p.waitForTimeout(4000); return [p, errs, c]; };
// what the data holds: the In Brief headlines the page draws, the rated rows (at most 5) and the upcoming events (at most 3)
const want = p => p.evaluate(() => ({brief: window.__ev('V2.dpParts(V2.postNow()).brief.length'), inter: window.__ev('V2.dpParts(V2.postNow()).inter.length'),
  rate: window.__ev('Math.min(lairRows().filter(x => x.r && x.r.tc).length, 5)'), next: window.__ev('V2.dpNext().length')}));
const look = p => p.evaluate(() => { const q = s => document.querySelector('#main ' + s), vis = e => !!e && e.getClientRects().length > 0, cnt = s => [...document.querySelectorAll('#main ' + s)].filter(vis).length;
  const btn = q('[data-dpbrief]'), ra = q('.dp-std .dp-all'), fa = q('.dp-fix .dp-all');
  return {brief: cnt('.dp-int .dp-il > li'), rate: cnt('.dp-tb > li'), next: cnt('.dp-fl > li'),
    btn: vis(btn) ? btn.textContent : '', tag: btn ? btn.tagName : '', exp: btn ? btn.getAttribute('aria-expanded') : '', ctl: btn && document.getElementById(btn.getAttribute('aria-controls')) ? 'ok' : 'missing',
    focus: !!btn && document.activeElement === btn, btnH: vis(btn) ? Math.round(btn.getBoundingClientRect().height) : 0,
    ra: vis(ra) ? ra.textContent + ' ' + ra.getAttribute('href') : '', raH: vis(ra) ? Math.round(ra.getBoundingClientRect().height) : 0,
    fa: vis(fa) ? fa.textContent : '', faH: vis(fa) ? Math.round(fa.getBoundingClientRect().height) : 0}; });
// nothing out of its box: every visible leaf inside the screen and inside the paper's column it sits in; no sideways scroll
const boxes = p => p.evaluate(() => { const W = innerWidth, bad = [];
  for (const el of document.querySelectorAll('#main .dp *')) { if (!el.getClientRects().length || el.children.length || el.closest('.vh')) continue; const r = el.getBoundingClientRect(); if (!r.width) continue;
    if (r.left < -1 || r.right > W + 1) bad.push('off screen: ' + (el.textContent || el.className).trim().slice(0, 24));
    const box = el.closest('.dp-bc, .dp-int, .dp-st, .dp-cpn, .dp-lead'); if (box) { const z = box.getBoundingClientRect(); if (r.left < z.left - 1 || r.right > z.right + 1) bad.push('out of its column: ' + (el.textContent || el.className).trim().slice(0, 24)); } }
  return {bad, side: document.documentElement.scrollWidth > W}; });

for (const th of ['light', 'dark']) {
  for (const W of [320, 390, 699]) { const [p, errs, c] = await open(W, th, true), n = await want(p); let x = await look(p);
    if (n.inter) ok(false, `${th} ${W}: the data has interviews (${n.inter}), so In Brief is not drawn; this test needs the official feed`);
    const hid = n.brief - 2;
    ok(n.brief > 2 && x.brief === 2 && x.btn === `${hid} more in brief ›` && x.tag === 'BUTTON' && x.exp === 'false' && x.ctl === 'ok' && x.btnH >= 44,
      `${th} ${W}: In Brief shows 2 of ${n.brief} + "${x.btn}" (${x.tag}, aria-expanded ${x.exp}, controls ${x.ctl}, ${x.btnH}px)`);
    ok(n.rate > 3 && x.rate === 3 && /^All Ratings ›/.test(x.ra) && /#meta$/.test(x.ra) && x.raH >= 44, `${th} ${W}: Top Ratings shows 3 rows of ${n.rate} + "${x.ra}" (${x.raH}px)`);
    ok(n.next > 2 && x.next === 2 && x.fa === `All ${n.next} Next Events ›` && x.faH >= 44, `${th} ${W}: Next Events shows 2 of ${Math.min(n.next, 3)} + "${x.fa}" (${x.faH}px)`);
    if (W === 390) { // relative to the same page with Q41's phone cuts undone in place (same data)
      const L = await p.evaluate(() => { const H = document.documentElement.scrollHeight, q = s => [...document.querySelectorAll('#main ' + s)];
        q('.dp-il > li, .dp-tb > li, .dp-fl > li').forEach(e => e.style.setProperty('display', 'list-item')); q('[data-dpbrief]').forEach(e => e.style.setProperty('display', 'none'));
        const H0 = document.documentElement.scrollHeight; return {H, H0}; });
      await p.reload(); await p.waitForTimeout(4000);
      ok((L.H0 - L.H) / 844 >= 0.3, `${th} 390: page ${(L.H / 844).toFixed(2)} screens, ${((L.H0 - L.H) / 844).toFixed(2)} shorter than without Q41's cuts (${(L.H0 / 844).toFixed(2)}; at least 0.3; measured 0.37 on today's and the CI data, Nov 19)`); }
    let bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}: nothing out of its box, nothing sideways (${bx.bad.slice(0, 3).join('; ') || 'clean'}${bx.side ? ', scrolls sideways' : ''})`);
    if (!x.btn) ok(false, `${th} ${W}: no "more in brief" button to open`); else {
      await p.focus('#main [data-dpbrief]'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); x = await look(p);
      ok(x.brief === n.brief && x.exp === 'true' && x.btn === 'Show Fewer' && x.focus, `${th} ${W}: Enter opens all ${n.brief} headlines (${x.brief}), aria-expanded ${x.exp}, "${x.btn}", focus stays on it ${x.focus}`);
      bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}: opened, nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
      await p.evaluate(() => V2.redraw()); await p.waitForTimeout(500); x = await look(p);
      ok(x.brief === n.brief && x.exp === 'true' && x.btn === 'Show Fewer', `${th} ${W}: still open after a redraw (${x.brief}, aria-expanded ${x.exp}, "${x.btn}")`);
      await p.click('#main [data-dpbrief]'); await p.waitForTimeout(300); x = await look(p);
      ok(x.brief === 2 && x.exp === 'false' && x.btn === `${hid} more in brief ›` && x.focus, `${th} ${W}: Show Fewer back to 2 (${x.brief}, "${x.btn}", focus ${x.focus})`); }
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
  for (const W of [700, 1440]) { const [p, errs, c] = await open(W, th, false), n = await want(p), x = await look(p);
    ok(x.brief === n.brief && x.rate === n.rate && x.next === Math.min(n.next, 3) && !x.btn && x.ra && x.fa,
      `${th} ${W}: unchanged, all ${n.brief} headlines (${x.brief}), ${n.rate} ratings (${x.rate}), ${Math.min(n.next, 3)} events (${x.next}), no button ("${x.btn}"), both links`);
    const bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}: nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length})`); await c.close(); }
}
await b.close(); console.log(`v2-q41: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
