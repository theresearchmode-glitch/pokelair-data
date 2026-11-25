// My Team on Safari's engine (WebKit) as an iPhone: sideways overflow, elements past the right edge, and a screenshot
const pw = require('/home/user/pokelair-data/node_modules/playwright');
const F = process.env.F || '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/redesign/foundation.html';
const O = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/shots/ios';
(async () => { require('fs').mkdirSync(O, {recursive: true});
  const b = await pw.webkit.launch(); const dev = pw.devices[process.env.DEV || 'iPhone 13'];
  const c = await b.newContext({...dev, colorScheme: 'dark'}); const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + F + '#' + (process.env.H || 'team')); await p.waitForTimeout(7000);
  const r = await p.evaluate(() => { const W = innerWidth, out = [];
    for (const e of document.querySelectorAll('body *')) { const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue;
      if (b.right > W + 0.5 || b.left < -0.5) { let p = e.parentElement, inner = false; while (p) { const cs = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX) && p !== document.documentElement && p !== document.body) { inner = true; break; } p = p.parentElement; }
        if (!inner) out.push((e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + [...e.classList].slice(0, 2).join('.')) + ' L' + Math.round(b.left) + ' R' + Math.round(b.right)); } }
    return {W, docW: document.documentElement.scrollWidth, bodyW: document.body.scrollWidth, over: out.slice(0, 25)}; });
  console.log(JSON.stringify(r, null, 1)); if (errs.length) console.log('errors', errs.slice(0, 3));
  await p.screenshot({path: O + '/team-top.png'}); await b.close(); })();
