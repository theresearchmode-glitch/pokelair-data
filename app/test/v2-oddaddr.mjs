// Odd addresses (Sim's design review #20, the part with no visible change): after a real Pokémon page, an address for a Pokémon that
// doesn't exist shows 'No Pokémon here.' and the browser tab says so too (it kept the previous Pokémon's title before the fix).
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-oddaddr.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}}); await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#pokemon=sneasler', {timeout: 90000}); await p.waitForTimeout(3000);
const t1 = await p.title(); ok(/Sneasler/.test(t1), `a real Pokémon page has its own title ("${t1}")`);
await p.evaluate(() => { location.hash = '#pokemon=notapokemon'; }); await p.waitForTimeout(2000);
const h = await p.evaluate(() => (document.querySelector('#main h1') || {}).textContent || ''), t2 = await p.title();
ok(/No Pokémon here/.test(h), `an unknown Pokémon shows "No Pokémon here." ("${h}")`);
ok(t2 === 'No Pokémon here · NastyPlot', `and the tab says so ("${t2}")`);
await b.close(); console.log(`v2-oddaddr: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
