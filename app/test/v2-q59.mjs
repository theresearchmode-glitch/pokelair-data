// My Team on phones (Sim's yes, Nov 20: option B of docs/rebuild/research/team-meta-length-nov20.md): under 700 wide the bar under the
// six is real tabs (role=tablist, role=tab buttons with aria-selected, roving tabindex, aria-controls to role=tabpanel sections; arrow
// keys, Home and End) and ONE of Matchups / Suggestions / Team Checks shows at a time, Matchups first (scan S18, Nov 20: Suggestions first
// when the Strength Score reads under 70 and no tab was chosen); Your Games stays under it, always
// shown. The Suggestions tab carries the number of suggestion cards and Team Checks the number of failing basics (counted here from the
// sections themselves). The chosen tab is kept through a redraw and a resize; Matchups' "All 30 Matchups" (threat sheet) and a
// '#team=sg' address open their tab. At 390 the page is at least 0.6 screens shorter than the same page with every section shown,
// measured in this test by undoing the tabs in place (same data). 700, 1024 and 1440: no tablist, every section shown (as before).
// The sample team and a weaker team (the write-up's weak.js). Light and dark: nothing sideways, tabs inside the screen and 44px+ tall,
// no page errors. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q59.mjs   (a --v2 --preview-data build)
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
  return [p, errs, c]; };
// what the page shows: the bar, its tabs and the sections
const look = p => p.evaluate(SEC => { const vis = e => !!e && e.getClientRects().length > 0, nav = document.querySelector('.tm-jump');
  const tabs = nav ? [...nav.querySelectorAll('[role="tab"]')] : [];
  const fl = document.querySelector('#tm-ck > ul.tm-ck'), ckFail = fl ? [...fl.children].filter(li => !li.querySelector('.tm-cknote')).length : 0;
  return {role: nav ? nav.getAttribute('role') : null, tabs: tabs.map(t => { const r = t.getBoundingClientRect(), pn = document.getElementById(t.getAttribute('aria-controls'));
    return {k: t.dataset.tmjump, tag: t.tagName, txt: t.textContent.replace(/\s+/g, ' ').trim(), cnt: (t.querySelector('.tm-tcnt') || {}).textContent?.trim() || '', sel: t.getAttribute('aria-selected'), ti: t.tabIndex,
      ctl: !!pn && pn.getAttribute('role') === 'tabpanel' && pn.getAttribute('aria-labelledby') === t.id, h: Math.round(r.height), l: r.left, r: r.right}; }),
    shown: SEC.filter(k => vis(document.getElementById(k))), yg: vis(document.getElementById('tm-yg')), focus: document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.tmjump || '' : '',
    nSug: document.querySelectorAll('#tm-sg .tm-sug > li').length, nothing: !!(window.V2 && V2.plan && V2.plan.plans && V2.plan.plans.nothing), ckFail, H: document.documentElement.scrollHeight, side: document.documentElement.scrollWidth > innerWidth, W: innerWidth}; }, SEC);
const one = (x, k) => x.shown.length === 1 && x.shown[0] === k && x.tabs.filter(t => t.sel === 'true').map(t => t.k).join() === k && x.tabs.every(t => t.ti === (t.k === k ? 0 : -1));
const phone = async (W, th, weak) => { const [p, errs, c] = await open(W, th, weak), tag = `${th} ${W}${weak ? ' weaker team' : ''}`; let x = await look(p);
  ok(x.role === 'tablist' && x.tabs.map(t => t.k).join() === SEC.join() && x.tabs.every(t => t.tag === 'BUTTON' && t.ctl), `${tag}: tablist with 3 tab buttons, each aria-controls its tabpanel (${x.role}; ${x.tabs.map(t => t.txt).join(' | ')})`);
  if (x.role !== 'tablist') { ok(!errs.length, `${tag}: no page errors (${errs.length})`); await c.close(); return; }
  /* scan S18 (Nov 20): a team whose Strength Score reads under 70 (Needs work / Missing a basic) opens on Suggestions; others on Matchups.
     The weaker team here scores under 70 (checked, so this line can fail), the sample team 70+ */
  const sc = await p.evaluate(() => Number((document.querySelector('.fn-belt b') || {}).textContent)), first = sc < 70 ? 'tm-sg' : 'tm-mu';
  ok(weak ? sc < 70 : sc >= 70, `${tag}: this team's Strength Score is ${weak ? 'under' : 'at least'} 70 (${sc})`);
  ok(one(x, first) && x.yg, `${tag}: ${first === 'tm-sg' ? 'Suggestions' : 'Matchups'} first (score ${sc}), the only section shown (${x.shown.join()}), Your Games under it (${x.yg})`);
  ok(x.tabs.every(t => t.h >= 44 && t.l >= 0 && t.r <= x.W + 0.5), `${tag}: tabs 44px+ tall and inside the screen (${x.tabs.map(t => `${t.h}px ${Math.round(t.l)}-${Math.round(t.r)}`).join(', ')})`);
  const sg = x.tabs[1], ck = x.tabs[2];
  ok(sg.cnt === (x.nSug && !x.nothing ? String(x.nSug) : ''), `${tag}: Suggestions tab count "${sg.cnt}" = the ${x.nSug} suggestion cards${x.nothing ? ', none shown beside Nothing to fix (Q64)' : ''}`);
  if (W === 390 && !weak) { /* Sim Q64 A: with 'Nothing to fix' the tab shows no count (forced here; the redraw keeps the plans) */
    const q = await p.evaluate(() => { const P = V2.plan && V2.plan.plans; if (!P) return null; const was = P.nothing; P.nothing = true; V2.redraw(); const t = document.querySelector('#tmtab-tm-sg .tm-tcnt');
      const r = {cnt: t ? t.textContent.trim() : '', kept: !!(V2.plan.plans && V2.plan.plans.nothing)}; V2.plan.plans.nothing = was; V2.redraw(); return r; });
    ok(q && q.kept && q.cnt === '', `${tag}: beside 'Nothing to fix' the Suggestions tab shows no count (count "${q && q.cnt}", flag kept through the redraw: ${q && q.kept})`); }
  ok(ck.cnt === (x.ckFail ? String(x.ckFail) : ''), `${tag}: Team Checks tab count "${ck.cnt}" = the ${x.ckFail} failing basics`);
  if (W === 390) { const L = await p.evaluate(() => { const w = document.querySelector('.tm-work'), H = document.documentElement.scrollHeight; w.classList.remove('tm-tabbed'); const H0 = document.documentElement.scrollHeight; w.classList.add('tm-tabbed'); return {H, H0}; });
    ok((L.H0 - L.H) / 844 >= 0.6, `${tag}: page ${(L.H / 844).toFixed(2)} screens, ${((L.H0 - L.H) / 844).toFixed(2)} shorter than with every section shown (${(L.H0 / 844).toFixed(2)}; at least 0.6)`); }
  // a tap on each tab shows its section alone
  for (const k of ['tm-sg', 'tm-ck', 'tm-mu']) { await p.tap(`.tm-tabs [data-tmjump="${k}"]`); await p.waitForTimeout(250); x = await look(p);
    ok(one(x, k) && x.yg && !x.side, `${tag}: tap ${k}: only it shown (${x.shown.join()}), selected and tabindex follow, Your Games shown, nothing sideways`); }
  // keyboard: arrows, End, Home
  await p.focus('.tm-tabs [data-tmjump="tm-mu"]');
  for (const [key, k] of [['ArrowRight', 'tm-sg'], ['ArrowRight', 'tm-ck'], ['ArrowRight', 'tm-mu'], ['ArrowLeft', 'tm-ck'], ['Home', 'tm-mu'], ['End', 'tm-ck']]) {
    await p.keyboard.press(key); await p.waitForTimeout(200); x = await look(p); ok(one(x, k) && x.focus === k, `${tag}: ${key} -> ${k} shown, selected and focused (${x.shown.join()}, focus ${x.focus})`); }
  // kept through a redraw
  await p.evaluate(() => window.__ev('V2.redraw()')); await p.waitForTimeout(300); x = await look(p); ok(one(x, 'tm-ck'), `${tag}: a redraw keeps Team Checks (${x.shown.join()})`);
  // section links from elsewhere: the threat sheet's "All 30 Matchups" opens the Matchups tab; '#team=sg' opens Suggestions
  /* (a locator, not a held handle: the open sheet redraws itself when the suggestions finish, which replaced the button mid-tap once) */
  await p.evaluate(() => { V2.muOpen(null); }); await p.waitForTimeout(800); const full = await p.locator('.np-sheet [data-mufull]').count();
  if (full) { await p.locator('.np-sheet [data-mufull]').first().click({timeout: 15000}); await p.waitForTimeout(500); x = await look(p); ok(one(x, 'tm-mu'), `${tag}: the threat sheet's All 30 Matchups opens the Matchups tab (${x.shown.join()})`); }
  else ok(false, `${tag}: the threat sheet opens with its All 30 Matchups button`);
  await p.evaluate(() => { location.hash = '#team=sg'; }); await p.waitForTimeout(800); x = await look(p); ok(one(x, 'tm-sg'), `${tag}: '#team=sg' opens the Suggestions tab (${x.shown.join()})`);
  await p.tap('.tm-tabs [data-tmjump="tm-ck"]'); await p.waitForTimeout(250); await p.evaluate(() => window.__ev('V2.redraw()')); await p.waitForTimeout(300); x = await look(p);
  ok(one(x, 'tm-ck'), `${tag}: a tab picked after arriving by '#team=sg' stays through a redraw (${x.shown.join()})`);
  // wider and back: 700+ draws every section, back under 700 the same tab again
  if (W === 390) { await p.setViewportSize({width: 800, height: 844}); await p.waitForTimeout(800); x = await look(p);
    ok(x.role !== 'tablist' && x.shown.length === 3, `${tag}: resized to 800: no tablist, all 3 sections (${x.shown.join()})`);
    await p.setViewportSize({width: 390, height: 844}); await p.waitForTimeout(800); x = await look(p); ok(x.role === 'tablist' && one(x, 'tm-ck'), `${tag}: back to 390: tabs again, Team Checks kept (${x.shown.join()})`); }
  ok(!x.side, `${tag}: nothing scrolls sideways`); ok(!errs.length, `${tag}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); };
for (const th of ['light', 'dark']) for (const W of [320, 390]) for (const weak of [false, true]) await phone(W, th, weak);
// scan S18 (Nov 20): the first tab follows the score only when no tab was chosen, is kept while the team is edited, and is picked again
// for a new six; on arrival a weaker saved team opens on Suggestions from the first paint (no switch after it)
{ const SG = `(()=>{const names=['Snorlax','Drampa','Politoed','Vivillon','Corviknight','Hippowdon'];S.slots=names.map(n=>{const b=blank();b.n=n;return b;});fixSlots();S.loadedId=null;persist();render();})()`;
  const sel = p => p.evaluate(() => { const t = document.querySelector('.tm-tabs [aria-selected="true"]'); return t ? t.dataset.tmjump : ''; });
  let [p, errs, c] = await open(390, 'light', true);
  ok(await sel(p) === 'tm-sg', `S18 390: a weaker team loaded on the page (an import) opens on Suggestions (${await sel(p)})`);
  await p.evaluate(() => window.__ev(`(()=>{const i=S.slots.findIndex(x=>x&&x.n==='Vivillon');const b=blank();b.n='Incineroar';S.slots[i]=b;fixSlots();render();})()`)); await p.waitForTimeout(1500);
  ok(await sel(p) === 'tm-sg', `S18 390: one Pokémon swapped (as a suggestion does): the tab stays on Suggestions (${await sel(p)})`);
  await p.evaluate(() => window.__ev(`(()=>{const names=['Charizard-Mega-Y','Garchomp','Whimsicott','Sneasler','Basculegion','Kingambit'];S.slots=names.map(n=>{const b=blank();b.n=n;return b;});fixSlots();S.loadedId=null;render();})()`)); await p.waitForTimeout(2500);
  const sc2 = await p.evaluate(() => Number((document.querySelector('.fn-belt b') || {}).textContent));
  ok(sc2 >= 70 && await sel(p) === 'tm-mu', `S18 390: a new six scoring ${sc2} (70+) is picked again: Matchups (${await sel(p)})`);
  await p.tap('.tm-tabs [data-tmjump="tm-ck"]'); await p.waitForTimeout(250); await p.evaluate(s => window.__ev(s), SG); await p.waitForTimeout(1500);
  ok(await sel(p) === 'tm-ck', `S18 390: a tab the player chose wins over the score (${await sel(p)})`);
  await c.close();
  [p, errs, c] = await open(390, 'light', true); await p.evaluate(() => window.__ev('persist()'));
  const seen = []; p.on('framenavigated', () => {}); await p.reload(); for (let i = 0; i < 20; i++) { const k = await sel(p); if (k && seen[seen.length - 1] !== k) seen.push(k); await p.waitForTimeout(150); }
  ok(seen.join() === 'tm-sg', `S18 390: arriving with a weaker saved team, Suggestions from the first paint (tabs seen: ${seen.join(' → ')})`);
  await p.evaluate(() => { location.hash = '#team=mu'; }); await p.waitForTimeout(800);
  ok(await sel(p) === 'tm-mu', `S18 390: '#team=mu' wins over the score (${await sel(p)})`);
  ok(!errs.length, `S18 390: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
for (const W of [360, 375, 430, 699]) await phone(W, 'light', true);
for (const th of ['light', 'dark']) for (const W of [700, 1024, 1440]) { const [p, errs, c] = await open(W, th, false), x = await look(p);
  ok(x.role !== 'tablist' && !x.tabs.length && x.shown.length === 3 && !x.side && !errs.length, `${th} ${W}: as before: no tablist, all 3 sections shown (${x.shown.join()}), nothing sideways, no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-q59: ${fails.length} failed` : 'v2-q59: all passed'); process.exit(fails.length ? 1 : 0);
