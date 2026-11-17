// Pre-launch check 5a (Nov 17): standalone text links and small buttons are at least 24px tall (WCAG 2.5.8); the reviewer measured
// 19-22px on these. Links inside a sentence are exempt (not listed). Exit 1 on failure.   PAGE=app/dist/v2.html node app/test/tap-size.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || process.argv[2] || 'app/dist/v2.html'), fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const b = await chromium.launch(), H = {};
for (const w of [390, 1440]) { const p = await b.newPage({viewport: {width: w, height: 900}});
  for (const [r, src] of [['tournaments', '^(Set as Opponent|Compare)'], ['team', '^Game Plan'], ['battle', 'Change on My Team'], ['track', 'How Ratings Work'], ['feedback', 'Show Email'], ['about', '^(Limitless|Victory Road|VR Pastes|Liquipedia|Pokémon Showdown|Smogon)$']]) {
    await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(2000);
    const hs = await p.evaluate(src => { const R = new RegExp(src); return [...document.querySelectorAll('#main a, #main button')].filter(e => e.offsetParent !== null && R.test(e.textContent.trim()) && !(e.parentElement.tagName === 'P' && e.parentElement.textContent.trim().length > e.textContent.trim().length + 20)) /* a link inside a sentence is exempt (WCAG 2.5.8) */.map(e => Math.round(e.getBoundingClientRect().height)); }, src);
    H[w + r] = await p.evaluate(() => document.documentElement.scrollHeight);
    ok(hs.length > 0 && hs.every(h => h >= 24), `${w} wide, ${r}: /${src}/ at least 24px tall (${hs.join(', ') || 'not found'})`); }
  await p.close(); }
await b.close(); if (process.env.HEIGHTS) console.log(JSON.stringify(H));
console.log(`tap-size: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
