const pw = require('/home/user/pokelair-data/node_modules/playwright');
const F = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/v2/nav6.html', O = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/shots/';
(async () => { const b = await pw.webkit.launch();
  for (const w of [300, 320, 375, 390, 430, 699, 700, 900, 1440]) for (const h of ['team', 'box']) {
    const c = await b.newContext(w < 700 ? {...pw.devices['iPhone 13'], viewport: {width: w, height: 800}} : {viewport: {width: w, height: 900}}); const p = await c.newPage();
    await p.goto('file://' + F + '#' + h); await p.waitForTimeout(2000);
    const r = await p.evaluate(() => { const g = s => document.querySelector(s).getBoundingClientRect(); const L = g('.np-head .logo'), T = g('.np-head .tools'), B = g('.np-boxlink'), N = g('.np-nav');
      return {docW: document.documentElement.scrollWidth, logoR: Math.round(L.right), toolsL: Math.round(T.left), toolsR: Math.round(T.right), box: [Math.round(B.width), Math.round(B.height)], navR: N.width ? Math.round(N.right) : null, cur: !!document.querySelector('.np-boxlink[aria-current]')}; });
    console.log(w, h, JSON.stringify(r));
    if (h === 'box' && (w === 320 || w === 1440)) await p.screenshot({path: O + 'boxlink-' + w + '.png', clip: {x: 0, y: 0, width: w, height: 80}});
    await c.close(); }
  await b.close(); })();
