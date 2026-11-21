// Scan S16 (Nov 20): after "Build Me a Team", where the Blueprint is one column (under 1100 wide), Load Team sits right under the built six
// (it was ~3 screens down, below Spec, Revisions and Notes). Q83 item 2 (Nov 20): wide (1100+) too, no longer at the foot of Notes. One Load Team on the page (C4) at every
// width; a resize across 1100 moves it; tapping it still loads the team. 390, 820, 1440. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-s16.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const where = p => p.evaluate(() => { const six = document.querySelector('.pl-plates') || document.querySelector('.bp-six'), use = [...document.querySelectorAll('[data-bduse]')].filter(e => e.getClientRects().length);
  const u = use[0]; return {n: use.length, gap: six && u ? Math.round(u.getBoundingClientRect().top - six.getBoundingClientRect().bottom) : null, inNotes: !!(u && u.closest('.bp-right')), sideways: document.documentElement.scrollWidth > innerWidth}; });
for (const W of [390, 820, 1440]) { const c = await b.newContext({viewport: {width: W, height: 900}}); const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#build', {timeout: 90000}); await p.waitForTimeout(2500);
  await p.click('[data-bdgo]'); await p.waitForFunction(() => window.__ev('!!(ui.ab && !ui.ab.busy)') && document.querySelector('.pl-plates, .bp-six'), null, {timeout: 120000}).catch(() => {}); await p.waitForTimeout(800);
  const x = await where(p);
  ok(x.n === 1, `${W}: one Load Team on the page (${x.n})`);
  /* Q83 item 2 (Sim, Nov 20): under the six at every width now (was: 1100+ at the foot of Notes) */
  ok(x.gap != null && x.gap >= 0 && x.gap <= 64 && !x.inNotes, `${W}: Load Team right under the six (${x.gap} px below it; in Notes: ${x.inNotes})`);
  ok(!x.sideways, `${W}: no sideways scroll`);
  if (W === 390) { await p.setViewportSize({width: 1440, height: 900}); await p.waitForTimeout(900); let y = await where(p); ok(y.n === 1 && !y.inNotes && y.gap <= 64, `390 → 1440 resize: Load Team stays under the six (${y.n}, ${y.gap} px; Q83 item 2)`);
    await p.setViewportSize({width: 390, height: 900}); await p.waitForTimeout(900); y = await where(p); ok(y.n === 1 && !y.inNotes && y.gap <= 64, `1440 → 390 resize: Load Team under the six again (${y.gap} px)`);
    const names = await p.evaluate(() => window.__ev('abTeam("doubles").mons.map(m=>m.n).join("|")'));
    await p.click('[data-bduse]'); await p.waitForTimeout(1200); const after = await p.evaluate(() => ({h: location.hash, s: window.__ev('S.slots.map(s=>s.n).join("|")')}));
    ok(after.h === '#team' && after.s === names, `390: tapping it loads the built six on My Team (${after.h})`); }
  ok(!errs.length, `${W}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-s16: ${fails.length} FAILED` : 'v2-s16: all passed'); process.exit(fails.length ? 1 : 0);
