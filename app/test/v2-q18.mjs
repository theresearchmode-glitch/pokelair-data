// Log a game: two equal buttons that say what the tap does, "Log a Win" and "Log a Loss" (Sim's Q18 A, Nov 19; design review #7:
// a solid "Win" beside an outlined "Loss" read as Win already picked). Wherever the control appears (My Team > Your Games >
// Log a Game sheet, and Battle > Your Games), at 320, 390 and 1440, light and dark: exactly two result buttons named "Log a Win"
// and "Log a Loss", the same size, background, border, text colour and weight (shape layers included), neither marked as
// picked, each at least 44px tall; tapping each logs that result (the stored log, S.log) and is then cleaned up (My Team: its
// Undo; Battle: the log is put back). Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q18.mjs   (a --v2 build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const SPOTS = {team: '.np-sheet .yg2-res', battle: '.bt-log .bt-lacts'}, KEY = {team: 'data-ygres', battle: 'data-btlres'};
const look = (sel, key) => { const bs = [...document.querySelectorAll(`${sel} [${key}]`)].filter(e => e.getClientRects().length);
  const pick = (cs, ks) => ks.map(k => cs.getPropertyValue(k)).join('|');
  const K = ['background-color', 'background-image', 'border-top-width', 'border-top-style', 'border-top-color', 'color', 'font-weight', 'font-style', 'font-size', 'box-shadow', 'transform', 'opacity'];
  return bs.map(e => { const r = e.getBoundingClientRect(), sp = e.querySelector('span') || e;
    return {name: e.textContent.replace(/\s+/g, ' ').trim(), aria: e.getAttribute('aria-label'), pressed: e.getAttribute('aria-pressed'), cls: e.className, r: e.getAttribute(key),
      w: Math.round(r.width * 2) / 2, h: Math.round(r.height * 2) / 2,
      st: [pick(getComputedStyle(e), K), pick(getComputedStyle(e, '::before'), K), pick(getComputedStyle(e, '::after'), K), pick(getComputedStyle(sp), ['color', 'font-weight', 'font-style', 'font-size'])].join(' / ')}; }); };
for (const th of ['light', 'dark']) for (const W of [320, 390, 1440]) {
  const p = await b.newPage({viewport: {width: W, height: 900}, colorScheme: th}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(2500);
  const ev = s => p.evaluate(s => window.__ev(s), s);
  // a real six: the first winning team in the data
  await ev(`(() => { const t = META.events.events.find(e => e.top && e.top[0] && e.top[0].mons && e.top[0].mons.length === 6).top[0].mons.map(m => m.n);
    S.slots = t.map(n => ({n, a: null, lock: false})); fixSlots(); S.log = []; persist(); V2.redraw(); return 1; })()`); await p.waitForTimeout(600);
  for (const where of ['team', 'battle']) { const tag = `${th} ${W} ${where === 'team' ? 'My Team sheet' : 'Battle'}`;
    if (where === 'team') { await p.evaluate(() => { location.hash = '#team'; }); await p.waitForTimeout(900);
      await p.locator('#main [data-yglog]').first().click(); await p.waitForTimeout(700); }
    else { await p.evaluate(() => { location.hash = '#battle'; }); await p.waitForTimeout(1200);
      await ev(`(() => { V2.btUi.logPick = members().slice(0, 4).map(m => m.p.n); V2.btUi.logTouched = true; V2.redraw(); return 1; })()`); await p.waitForTimeout(600); }
    const bs = await p.evaluate(`(${look.toString()})(${JSON.stringify(SPOTS[where])}, ${JSON.stringify(KEY[where])})`);
    const names = bs.map(x => x.name);
    ok(bs.length === 2 && names[0] === 'Log a Win' && names[1] === 'Log a Loss' && bs[0].r === 'W' && bs[1].r === 'L', `${tag}: two buttons named exactly "Log a Win" and "Log a Loss" (found ${JSON.stringify(names)})`);
    if (bs.length === 2) {
      ok(bs[0].w === bs[1].w && bs[0].h === bs[1].h, `${tag}: same size (${bs[0].w}x${bs[0].h} vs ${bs[1].w}x${bs[1].h})`);
      ok(bs[0].st === bs[1].st && bs[0].cls === bs[1].cls, `${tag}: same style, neither looks picked${bs[0].st === bs[1].st ? '' : ' (' + bs[0].cls + ' ' + bs[0].st + ' VS ' + bs[1].cls + ' ' + bs[1].st + ')'}`);
      ok(bs.every(x => x.pressed == null || x.pressed === 'false'), `${tag}: neither is marked pressed`);
      ok(bs.every(x => x.h >= 44), `${tag}: each at least 44px tall (${bs.map(x => x.h).join(', ')})`); }
    // tap each: it logs that result, then clean up
    for (const r of ['W', 'L']) {
      if (where === 'team' && !(await p.locator(`${SPOTS.team} [data-ygres="${r}"]`).count())) { await p.locator('#main [data-yglog]').first().click(); await p.waitForTimeout(700); }
      if (where === 'battle') await ev(`(() => { V2.btUi.logPick = members().slice(0, 4).map(m => m.p.n); V2.btUi.logTouched = true; V2.redraw(); return 1; })()`);
      const before = await ev('JSON.stringify(S.log || [])'); const n0 = JSON.parse(before).length;
      const btn = p.locator(`${SPOTS[where]} [${KEY[where]}="${r}"]`).first();
      if (!(await btn.count())) { ok(false, `${tag}: no ${r} button to tap`); continue; }
      await btn.click(); await p.waitForTimeout(800);
      const L = JSON.parse(await ev('JSON.stringify(S.log || [])'));
      ok(L.length === n0 + 1 && L[L.length - 1].r === r, `${tag}: tapping "${r === 'W' ? 'Log a Win' : 'Log a Loss'}" logs one ${r === 'W' ? 'win' : 'loss'} (log ${n0} -> ${L.length}, last ${L.length ? L[L.length - 1].r : '-'})`);
      if (where === 'team') { const u = p.locator('#main [data-ygundo]').first(); const has = await u.count();
        const line = has ? await p.locator('#main .tm-yg-last').first().textContent() : '';
        ok(has && new RegExp(`^${r === 'W' ? 'Win' : 'Loss'} logged\\. ?Undo$`).test(line.trim()), `${tag}: "${r === 'W' ? 'Win' : 'Loss'} logged. Undo" shows (${JSON.stringify(line.trim())})`);
        if (has) { await u.click(); await p.waitForTimeout(600); }
        ok(JSON.parse(await ev('JSON.stringify(S.log || [])')).length === n0, `${tag}: Undo removes it`); }
      else { await ev(`(() => { S.log = ${before}; persist(); V2.redraw(); return 1; })()`); await p.waitForTimeout(300); } }
    if (where === 'team') { await p.evaluate(() => window.__ev('V2.closeSheet(true), 1')).catch(() => {}); await p.waitForTimeout(800); } }
  await p.close(); }
await b.close(); console.log(`v2-q18: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
