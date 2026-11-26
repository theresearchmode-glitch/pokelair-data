// iPhone WebKit: load a full team, wait for suggestions, tap the 5th Pokémon, open Why / sheets, scroll through; after each step
// report sideways overflow and what sticks out; also count heavy paint features (filters, blur, animations) on screen
const pw = require('/home/user/pokelair-data/node_modules/playwright');
const F = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/redesign/foundation.html';
const O = '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/shots/ios';
const OVER = () => { const W = innerWidth, out = [];
  for (const e of document.querySelectorAll('body *')) { const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue;
    if (b.right > W + 0.5 || b.left < -0.5) { let p = e.parentElement, inner = false; while (p && p !== document.body) { const cs = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) { inner = true; break; } p = p.parentElement; }
      if (!inner) out.push((e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + [...e.classList].slice(0, 2).join('.')) + ' L' + Math.round(b.left) + ' R' + Math.round(b.right)); } }
  return {docW: document.documentElement.scrollWidth, scrollX, over: out.slice(0, 12)}; };
(async () => { const b = await pw.webkit.launch(); const c = await b.newContext({...pw.devices['iPhone 13'], colorScheme: 'dark'}); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + F + '#team'); await p.waitForTimeout(4000);
  const log = async t => console.log(t, JSON.stringify(await p.evaluate(OVER)));
  await log('loaded');
  await p.evaluate(() => window.__ev ? 0 : 0);
  // a team like Sim's
  const team = ['Charizard-Mega-Y', 'Whimsicott', 'Kingambit', 'Basculegion', 'Sneasler', 'Garchomp'];
  const ok = await p.evaluate(t => { try { return window.__ev ? (window.__ev(`S.slots=normSlots(${JSON.stringify(t)}.map(n=>({n,a:null,lock:false})));fixSlots();S.loadedId=null;render();1`), 'ev') : 'no __ev'; } catch (e) { return 'err ' + e.message; } }, team);
  console.log('set team via', ok); await p.waitForTimeout(9000); await log('team + suggestions');
  const tiles = p.locator('[data-tmsel]'); if (await tiles.count() > 4) { await tiles.nth(4).tap(); await p.waitForTimeout(800); await log('tapped 5th'); }
  await p.screenshot({path: O + '/team-sel.png'});
  for (let y = 0; y < 6000; y += 700) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(250); }
  await log('scrolled');
  const heavy = await p.evaluate(() => { let f = 0, d = 0, a = 0, bf = 0; for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if (cs.filter !== 'none') f++; if (cs.backdropFilter && cs.backdropFilter !== 'none' || cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none') bf++; if (cs.animationName !== 'none') a++; if (cs.boxShadow !== 'none') d++; } return {filters: f, backdrop: bf, animations: a, shadows: d, nodes: document.getElementsByTagName('*').length}; });
  console.log('paint load', JSON.stringify(heavy)); if (errs.length) console.log('errors', errs.slice(0, 3)); await b.close(); })();
