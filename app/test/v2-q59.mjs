// My Team on phones: every section is shown and quick to reach. History: Nov 20 (Sim's yes, option B of
// docs/rebuild/research/team-meta-length-nov20.md) the bar under the six became real tabs under 700 wide, one of Matchups / Suggestions /
// Team Checks at a time, to keep the page short. Nov 21: the My Team frame (Sim approved) replaced the phone tabs: natural scrolling, every
// section shown (Sim, Nov 20: don't bury content behind tabs that have to be opened and closed; phone length is done). Suggestions now sit
// inside the frame, under the tapped Pokémon. The needs the tabs served stay, so this test now checks them on the frame (rewritten Nov 21;
// the tab checks retired with the tabs):
//   - every section is there: Matchups, Suggestions, Team Checks and Your Games all shown, no tablist, nothing hidden;
//   - each is one tap away: the "On this page" bar has Matchups, Suggestions and Team Checks, each 44px+ tall and inside the screen,
//     and a tap brings that section's heading onto the screen (below the sticky header and the bar, in the top half) with the focus in it;
//   - the threat sheet's "All 30 Matchups" brings Matchups onto the screen;
//   - the page stays within its length limit at 390 (docs/rebuild/page-heights.md: 3,750 px for the first-visit sample team);
//   - light and dark, the sample team and a weaker team: nothing sideways, no page errors. 700, 1024, 1440: no tablist, all 3 sections.
// Can fail: checked Nov 21 by breaking the page in the browser (Team Checks hidden; the bar's links squeezed under 44px; the bar's tap
// handler removed): each fails. Not checked here: a '#team=sg' address no longer scrolls to Suggestions in the frame (reported Nov 21).
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q59.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const WEAK = `(()=>{const names=['Snorlax','Drampa','Politoed','Vivillon','Corviknight','Hippowdon'];S.slots=names.map(n=>{const b=blank();b.n=n;return b;});fixSlots();S.loadedId=null;render();})()`;
const SEC = ['tm-mu', 'tm-sg', 'tm-ck'];
const open = async (W, th, weak) => { const phone = W < 700, c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})});
  const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(3000);
  if (weak) { await p.evaluate(s => window.__ev(s), WEAK); await p.waitForTimeout(500); }
  await p.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {}); await p.waitForTimeout(800);
  if (process.env.Q59_BREAK) await p.addStyleTag({content: process.env.Q59_BREAK}); /* only to prove the test can fail */
  if (process.env.Q59_BREAK_JS) await p.evaluate(s => eval(s), process.env.Q59_BREAK_JS);
  return [p, errs, c]; };
const look = p => p.evaluate(SEC => { const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden', nav = document.querySelector('.tm-jump');
  const links = nav ? [...nav.querySelectorAll('[data-tmjump]')].filter(vis) : [];
  return {tablist: !!document.querySelector('[role="tablist"]'), frame: !!document.querySelector('#main .mtf'), links: links.map(a => { const r = a.getBoundingClientRect(); return {k: a.dataset.tmjump, txt: a.textContent.trim(), h: Math.round(r.height), l: r.left, r: r.right}; }),
    shown: SEC.filter(k => vis(document.getElementById(k))), yg: vis(document.getElementById('tm-yg')), H: document.documentElement.scrollHeight, side: document.documentElement.scrollWidth > innerWidth, W: innerWidth}; }, SEC);
/* where a section's heading is after a tap: on screen, below the sticky header and below the bar when the bar sits above it, in the top half */
const landed = (p, k) => p.evaluate(k => { const s = document.getElementById(k), h = s && (s.querySelector('h2') || s), r = h.getBoundingClientRect(), hd = (document.querySelector('.np-head') || {getBoundingClientRect: () => ({bottom: 0})}).getBoundingClientRect().bottom;
  const j = document.querySelector('.tm-jump'), jr = j ? j.getBoundingClientRect() : null, under = jr && jr.top < r.top ? jr.bottom : 0, a = document.activeElement;
  return {top: Math.round(r.top), below: Math.round(Math.max(hd, under)), half: innerHeight / 2, focus: !!a && s.contains(a)}; }, k);
const NAMES = {'tm-mu': 'Matchups', 'tm-sg': 'Suggestions', 'tm-ck': 'Team Checks'};
const phone = async (W, th, weak) => { const [p, errs, c] = await open(W, th, weak), tag = `${th} ${W}${weak ? ' weaker team' : ''}`; const x = await look(p);
  ok(x.frame && !x.tablist && x.shown.join() === SEC.join() && x.yg, `${tag}: the frame, no tablist, every section shown (${x.shown.join()}), Your Games shown (${x.yg})`);
  ok(SEC.every(k => x.links.some(l => l.k === k && l.txt === NAMES[k])), `${tag}: the "On this page" bar links Matchups, Suggestions and Team Checks (${x.links.map(l => l.txt).join(' | ') || 'none'})`);
  ok(x.links.length && x.links.every(l => l.h >= 44 && l.l >= 0 && l.r <= x.W + 0.5), `${tag}: its links 44px+ tall and inside the screen (${x.links.map(l => `${l.h}px ${Math.round(l.l)}-${Math.round(l.r)}`).join(', ')})`);
  if (W === 390 && !weak) ok(x.H <= 3750, `${tag}: page ${x.H} px (${(x.H / 844).toFixed(2)} screens), within the 3,750 px limit (page-heights.md)`);
  for (const k of ['tm-sg', 'tm-ck', 'tm-mu']) { if (!x.links.some(l => l.k === k)) { ok(false, `${tag}: tap ${NAMES[k]}: no link to tap`); continue; }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(200);
    await p.locator(`.tm-jump [data-tmjump="${k}"]`).scrollIntoViewIfNeeded(); await p.tap(`.tm-jump [data-tmjump="${k}"]`); await p.waitForTimeout(1500); const L = await landed(p, k);
    ok(L.top >= L.below - 1 && L.top <= L.half && L.focus, `${tag}: tap ${NAMES[k]}: its heading lands at ${L.top}px (below ${L.below}, top half under ${Math.round(L.half)}), focus in it (${L.focus})`); }
  if (W === 390) { await p.evaluate(() => scrollTo(0, 0)); await p.evaluate(() => { V2.muOpen(null); }); await p.waitForTimeout(800); const full = await p.locator('.np-sheet [data-mufull]').count();
    if (full) { await p.locator('.np-sheet [data-mufull]').first().click({timeout: 15000}); await p.waitForTimeout(1500); const L = await landed(p, 'tm-mu');
      ok(L.top >= L.below - 1 && L.top <= L.half, `${tag}: the threat sheet's All 30 Matchups brings Matchups onto the screen (heading at ${L.top}px, below ${L.below})`); }
    else ok(false, `${tag}: the threat sheet opens with its All 30 Matchups button`); }
  const y = await look(p); ok(!y.side, `${tag}: nothing scrolls sideways`); ok(!errs.length, `${tag}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); };
for (const th of ['light', 'dark']) for (const W of [320, 390]) for (const weak of [false, true]) await phone(W, th, weak);
for (const W of [360, 375, 430, 699]) await phone(W, 'light', true);
for (const th of ['light', 'dark']) for (const W of [700, 1024, 1440]) { const [p, errs, c] = await open(W, th, false), x = await look(p);
  ok(!x.tablist && x.shown.length === 3 && !x.side && !errs.length, `${th} ${W}: no tablist, all 3 sections shown (${x.shown.join()}), nothing sideways, no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-q59: ${fails.length} failed` : 'v2-q59: all passed'); process.exit(fails.length ? 1 : 0);
