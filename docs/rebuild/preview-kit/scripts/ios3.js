// iPhone WebKit checks for Sim's three reports: picture flash on tap, Save Team input zoom/overflow, top edge under the header
const pw = require('/home/user/pokelair-data/node_modules/playwright');
const F = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/redesign/foundation.html';
const O = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/shots/ios';
(async () => { const b = await pw.webkit.launch(); const c = await b.newContext({...pw.devices['iPhone 13'], colorScheme: 'dark'}); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + F + '#team'); await p.waitForTimeout(7000);
  console.log('hover:none', await p.evaluate(() => matchMedia('(hover:none)').matches));
  // 1. tag the six pictures, tap tiles and action buttons, and check the same nodes stay and none is blank
  const tag = () => p.evaluate(() => { let n = 0; for (const i of document.querySelectorAll('.tm-six img')) { if (!i.__id) i.__id = ++window.__n || (window.__n = 1); n++; } return n; });
  await p.evaluate(() => { window.__n = 0; }); await tag();
  const check = async label => { const r = await p.evaluate(() => { const im = [...document.querySelectorAll('.tm-six img')]; return {n: im.length, kept: im.filter(i => i.__id).length, blank: im.filter(i => !i.complete || !i.naturalWidth).length}; }); console.log(label, JSON.stringify(r)); };
  const tiles = p.locator('[data-tmsel]'); await tiles.nth(2).tap(); await p.waitForTimeout(30); await check('tap tile 3, 30ms later');
  await tiles.nth(4).tap(); await p.waitForTimeout(30); await check('tap tile 5, 30ms later');
  const lock = p.locator('[data-v2lock]'); if (await lock.count()) { await lock.first().tap(); await p.waitForTimeout(30); await check('tap Lock, 30ms later'); await lock.first().tap(); await p.waitForTimeout(200); }
  // 3. scroll and compare the header bottom with the jump bar top
  await p.evaluate(() => scrollTo(0, 1600)); await p.waitForTimeout(400);
  console.log('header bottom vs jump top', JSON.stringify(await p.evaluate(() => { const h = document.querySelector('.np-head').getBoundingClientRect(), j = document.querySelector('.tm-jump').getBoundingClientRect(); return {headBottom: Math.round(h.bottom), jumpTop: Math.round(j.top)}; })));
  await p.screenshot({path: O + '/top-scrolled.png', clip: {x: 0, y: 0, width: 390, height: 200}});
  // 2. Save Team: open, type a name, check input size and sideways overflow
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
  const save = p.getByText(/^Save Team$|^Update Saved Team$/).first(); if (await save.count()) { await save.tap(); await p.waitForTimeout(600);
    const inp = p.locator('.np-sheet input').first(); if (await inp.count()) { await inp.tap(); await inp.type('My Sun Team for Regionals'); await p.waitForTimeout(400);
      console.log('save input', JSON.stringify(await p.evaluate(() => { const i = document.querySelector('.np-sheet input'); return {font: getComputedStyle(i).fontSize, docW: document.documentElement.scrollWidth, W: innerWidth, scale: visualViewport.scale}; }))); } else console.log('no input in save sheet'); } else console.log('no Save Team button');
  await p.screenshot({path: O + '/save-sheet.png'});
  if (errs.length) console.log('errors', errs.slice(0, 3)); await b.close(); })();
