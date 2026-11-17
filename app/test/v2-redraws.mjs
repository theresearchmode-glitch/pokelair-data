// Redraw counts (code review B-m1, Nov 17): the Day/Night button redraws the page once, not twice (the theme watcher used to redraw
// again 50 ms later); a theme change from outside the button (the phone switching to dark on its own) still redraws once.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-redraws.mjs   (a --v2 build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500);
const count = () => p.evaluate(() => window.__ev(`(() => { if (!V2._rdWrap) { const r = V2.redraw; V2.redraw = (...a) => { V2._rdN = (V2._rdN || 0) + 1; return r(...a); }; V2._rdWrap = 1; } V2._rdN = 0; })()`));
await count(); await p.click('[data-v2theme]'); await p.waitForTimeout(400);
const n1 = await p.evaluate(() => window.__ev('V2._rdN'));
ok(n1 === 1, `the Day/Night button redraws once (${n1})`);
await count(); await p.evaluate(() => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'night' ? 'day' : 'night'; }); await p.waitForTimeout(400);
const n2 = await p.evaluate(() => window.__ev('V2._rdN'));
ok(n2 === 1, `a theme change from outside the button redraws once (${n2})`);
const sc = await p.evaluate(() => window.__ev(`(() => { let n = 0; const f = window.scrollTo; window.scrollTo = (...a) => { n++; return f.apply(window, a); }; scrollTo(0, 300); n = 0; V2.redraw(); window.scrollTo = f; return {n, y: Math.round(scrollY)}; })()`));
ok(sc.n === 0 && sc.y === 300, `a redraw that changes nothing doesn't touch the scroll (scrollTo calls ${sc.n}, still at ${sc.y}; code review B-m2)`);
await b.close();
console.log(`v2-redraws: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
