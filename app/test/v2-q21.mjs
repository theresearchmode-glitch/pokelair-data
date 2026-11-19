// Meta (Ratings) on phones: search and filters come first (Sim's Q21 A, Nov 19; design review #12 + #19). Below 700 wide the search box sits
// ABOVE the featured #1 (it was about 842-950px down at 390x844), first in both what you see and the tab order, inside the first screen;
// the filter chips wrap into rows (they scrolled sideways and some were off-screen), every chip fully inside the window, at least 44px
// tall, no row with a lone chip, and nothing scrolls the page sideways. At 700 and 1440 the layout is unchanged: the search box sits
// where it sat before Q21 (6ef440a5, within 2px; measured on the --preview-data build). Light and dark. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-q21.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
// before Q21 (6ef440a5, --preview-data build): the search box's gap under the featured #1 and its left edge at 700 and 1440, light and dark
// alike. Nov 19: measured from the featured #1, not from the page top, so the content above it (today's data vs CI's frozen data) can't move it
// (absolute tops were 923/557 on today's data, 1008/620 on the frozen data; the gaps are 24/93 on both)
const BEFORE = {700: {gap: 24, left: 43}, 1440: {gap: 93, left: 91}};
const open = async (W, H, th, touch) => { const c = await b.newContext({viewport: {width: W, height: H}, colorScheme: th, hasTouch: touch, isMobile: touch}), p = await c.newPage();
  await p.addInitScript(() => { window.__PL_TEST = 1; }); await p.goto('file://' + PAGE + '#meta', {timeout: 90000}); await p.waitForSelector('[data-raq]', {timeout: 30000}); await p.waitForTimeout(1500); return {c, p}; };
const measure = p => p.evaluate(() => { const q = document.querySelector('[data-raq]'), box = q.closest('.ra-q') || q, sp = document.querySelector('[data-raspotw]'), Q = box.getBoundingClientRect();
  const S = sp && sp.getBoundingClientRect(), cw = document.documentElement.clientWidth, chips = [...document.querySelectorAll('.ra-filt .ra-chip')].filter(x => x.getClientRects().length);
  const out = {top: Q.top + scrollY, left: Q.left, vh: innerHeight, theme: document.documentElement.dataset.theme || '', spotTop: S ? S.top + scrollY : null, gap: S ? Q.top - S.bottom : null,
    domFirst: !!(sp && (q.compareDocumentPosition(sp) & Node.DOCUMENT_POSITION_FOLLOWING)), n: chips.length, out: [], short: [], rows: {},
    filtScroll: (() => { const f = document.querySelector('.ra-filt'); return f ? f.scrollWidth - f.clientWidth : 0; })(), side: document.documentElement.scrollWidth - innerWidth };
  for (const c of chips) { const r = c.getBoundingClientRect(); if (r.left < -0.5 || r.right > cw + 0.5) out.out.push(c.textContent.trim()); if (r.height < 44) out.short.push(c.textContent.trim());
    (out.rows[Math.round(r.top)] ||= []).push(r.width); }
  // a row is even when it holds two or more chips, or one chip that fills the whole row (Clear, when a filter is on)
  const fw = (document.querySelector('.ra-filt') || document.body).clientWidth; out.rows = Object.values(out.rows); out.lone = out.rows.filter(r => r.length === 1 && r[0] < fw * 0.9).length; out.rows = out.rows.map(r => r.length);
  // tab order: the first focusable thing in .ra (after the header) that is the search box, or a spot link
  const foc = [...document.querySelectorAll('.ra a[href], .ra button, .ra input')].filter(e => e.getClientRects().length && e.tabIndex >= 0);
  out.tabSearch = foc.indexOf(q); out.tabSpot = sp ? foc.findIndex(e => sp.contains(e)) : -1; return out; });

for (const th of ['light', 'dark']) {
  for (const W of [320, 360, 390, 430, 699]) { const H = W === 699 ? 900 : 844, {c, p} = await open(W, H, th, true), m = await measure(p), tag = `${W} ${th} phone`;
    ok(m.top < m.vh, `${tag}: the search box starts inside the first screen (top ${Math.round(m.top)}px, screen ${m.vh}px)`);
    ok(m.spotTop != null && m.top < m.spotTop && m.domFirst && m.tabSearch >= 0 && (m.tabSpot < 0 || m.tabSearch < m.tabSpot),
      `${tag}: search comes before the featured #1 on screen (${Math.round(m.top)} < ${Math.round(m.spotTop)}), in the page order and the tab order (${m.tabSearch} < ${m.tabSpot})`);
    ok(m.n >= 5 && !m.out.length && m.filtScroll <= 0, `${tag}: all ${m.n} filter chips are fully on screen, no sideways scroll in the chip rows (${m.out.length} off${m.out.length ? ': ' + m.out.join(', ') : ''}; ${m.filtScroll}px hidden)`);
    ok(m.rows.length > 1 && !m.lone, `${tag}: the chips wrap into rows with no lone chip (${m.rows.join(' + ')})`);
    ok(!m.short.length, `${tag}: every chip is a 44px+ tap (${m.short.length} shorter${m.short.length ? ': ' + m.short.join(', ') : ''})`);
    ok(m.side <= 0, `${tag}: nothing scrolls the page sideways (${m.side}px)`);
    ok((th === 'dark') === (m.theme === 'night'), `${tag}: the page is in ${th} mode (data-theme "${m.theme}")`);
    // a filter still works from its new place: Megas narrows the list, All brings everyone back, and the search box keeps its spot
    if (W === 390 || W === 699) { await p.locator('.ra-filt [data-raflag="mega"]').click(); await p.waitForTimeout(600); const a = await measure(p);
      ok(Math.abs(a.top - m.top) <= 2 && a.top < a.spotTop, `${tag}: after tapping Megas the search and filters stay above the featured #1`);
      ok(a.n === m.n + 1 && !a.out.length && !a.lone && a.side <= 0, `${tag}: with Clear added (${a.n} chips) every chip is on screen and no row holds a lone chip (${a.rows.join(' + ')})`);
      await p.fill('[data-raq]', 'Sneasler'); await p.waitForTimeout(900); const s = await p.evaluate(() => ({focus: document.activeElement && document.activeElement.matches('[data-raq]'), v: document.querySelector('[data-raq]').value}));
      ok(s.focus && s.v === 'Sneasler', `${tag}: typing in the search keeps the box focused with its text after the redraw`); }
    await c.close(); }
  for (const W of [700, 1440]) { const {c, p} = await open(W, 900, th, false), m = await measure(p), B = BEFORE[W], tag = `${W} ${th}`;
    ok(m.gap != null && Math.abs(m.gap - B.gap) <= 2 && Math.abs(m.left - B.left) <= 2, `${tag}: the search box sits where it did before Q21 (${Math.round(m.gap)}px under the featured #1 vs ${B.gap}, left ${Math.round(m.left)} vs ${B.left})`);
    ok(m.side <= 0, `${tag}: nothing scrolls the page sideways (${m.side}px)`);
    await c.close(); } }
// crossing the line by resizing moves the controls (the page redraws when the width crosses 700)
{ const {c, p} = await open(1000, 900, 'light', false); await p.setViewportSize({width: 390, height: 844}); await p.waitForTimeout(800); const m = await measure(p);
  ok(m.top < m.spotTop && m.domFirst, `resize 1000 → 390: the search moves above the featured #1 (${Math.round(m.top)} < ${Math.round(m.spotTop)})`);
  await p.setViewportSize({width: 1440, height: 900}); await p.waitForTimeout(800); const d = await measure(p);
  ok(d.gap != null && Math.abs(d.gap - BEFORE[1440].gap) <= 2, `resize 390 → 1440: the search goes back to its desktop place (${Math.round(d.gap)}px under the featured #1 vs ${BEFORE[1440].gap})`); await c.close(); }
await b.close();
console.log(fails.length ? `\nv2-q21: ${fails.length} FAILED` : '\nv2-q21: ALL PASSED'); process.exit(fails.length ? 1 : 0);
