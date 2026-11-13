// i41 (Nov 13): look-only debug of the flaky Build test X-10; run: PAGE=app/dist/v2.html ADAPTER=v2 node experiments/x10-debug.mjs
// X-10 debug: the test's exact steps through the harness, with page-side logging (look-only, nothing changed in the repo)
const H = await import('../app/test/behaviour/harness.mjs');
for (let run = 0; run < 10; run++) {
  const {ui, pg, close} = await H.open({team: H.TEAM, box: H.BOX});
  await pg.evaluate(() => { window.__lg = []; const T = () => Math.round(performance.now());
    for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click']) document.addEventListener(ev, e => __lg.push(T() + ' ' + ev + ' ' + (e.target.closest && e.target.closest('[data-v2mon]') ? 'TILE ' + e.target.closest('[data-v2mon]').dataset.v2mon : (e.target.className || e.target.tagName))), true);
    addEventListener('scroll', () => __lg.push(T() + ' scroll ' + Math.round(scrollY)), true);
    let downEl = null; document.addEventListener('mousedown', e => { downEl = e.target; const b = e.target.closest('button,a,[role=button]'); __lg.push(T() + ' down on ' + e.target.tagName + '.' + e.target.className + ' in ' + (b ? b.tagName + (b.disabled ? ' DISABLED' : '') : 'no button') + (e.target.closest('[inert]') ? ' INERT' : '') + (e.target.closest('fieldset[disabled]') ? ' FIELDSET-DISABLED' : '') + ' defaultPrevented=' + e.defaultPrevented + ' button=' + e.button + ' detail=' + e.detail); }, true);
    for (const ev of ['dragstart','pointercancel','selectstart','pointermove','mousemove']) document.addEventListener(ev, e => __lg.push(T() + ' ' + ev + ' ' + Math.round(e.clientX||0) + ',' + Math.round(e.clientY||0)), true);
    document.addEventListener('auxclick', e => __lg.push(T() + ' auxclick'), true); document.addEventListener('contextmenu', e => __lg.push(T() + ' contextmenu'), true);
    document.addEventListener('mouseup', e => __lg.push(T() + ' up: same node ' + (e.target === downEl) + ', down node still in page ' + (downEl && downEl.isConnected)), true);
    new MutationObserver(m => { const rem = m.reduce((n, r) => n + r.removedNodes.length, 0); if (rem) __lg.push(T() + ' mutation removed ' + rem + ' nodes in ' + (m[0].target.className || m[0].target.tagName)); }).observe(document.body, {childList: true, subtree: true}); });
  await ui.go('Build'); await ui.buildMeATeam();
  await pg.evaluate(() => __lg.push(Math.round(performance.now()) + ' READY'));
  const tile = await ui.builtTileLabel(0);
  const loc = pg.locator('#main .bd-result .bd-six [data-v2mon]').filter({visible: true}).nth(0);
  const bb = await loc.boundingBox(); await pg.evaluate(b => __lg.push(Math.round(performance.now()) + ' box ' + JSON.stringify(b) + ' scrollY ' + scrollY), bb);
  await ui.tapBuiltTile(0); await H.sleep(600);
  const sh = await ui.infoSheetText();
  console.log('RUN', run, sh ? 'PASS' : 'FAIL', tile); if (!sh) console.log((await pg.evaluate(() => __lg)).slice(-22).join('\n'));
  await close(); }
process.exit(0);
