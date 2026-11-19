// My Team: on phones, each Card's "Mega" label sits on its own dark slanted plate, the Strength Score plate's look ("94 S tier")
// (Sim's Q17 A, Nov 19). Before, it was blue text straight over the sprite art (hard to read on orange Charizard).
// At 320, 360, 390 and 430, light and dark, for the sample team and a team with two Megas: every visible "Mega" label on a My Team
// Card has the score plate's computed background colour, its text reads at least 4.5:1 against it, and it stays inside its Card.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q17.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const TEAMS = {sample: null, twoMegas: ['Charizard-Mega-Y', 'Whimsicott', 'Garchomp', 'Raichu-Mega-Y', 'Basculegion', 'Kingambit']};
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
let labels = 0; const bg = [], low = [], out = [], noPlate = [];
for (const th of ['light', 'dark']) for (const W of [320, 360, 390, 430]) for (const [tn, mons] of Object.entries(TEAMS)) {
  const p = await b.newPage({viewport: {width: W, height: 900}, colorScheme: th}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(2000);
  if (mons) { await p.evaluate(m => window.__ev(`S.slots = ${JSON.stringify(m)}.map(n => ({n, a: null, lock: false})); fixSlots(); V2.redraw()`), mons); await p.waitForTimeout(800); }
  const r = await p.evaluate(() => {
    const rgb = s => (s.match(/[\d.]+/g) || []).map(Number), lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const plate = document.querySelector('.mh-rate'), pbg = plate ? getComputedStyle(plate).backgroundColor : null;
    const ls = [...document.querySelectorAll('.mh .ms-card .mc-id .mg')].filter(x => !x.classList.contains('none') && x.getClientRects().length);
    return {pbg, labels: ls.map(x => { const cs = getComputedStyle(x), c = x.closest('.ms-card').getBoundingClientRect(), L = x.getBoundingClientRect(), b = rgb(cs.backgroundColor);
      return {name: x.parentElement.textContent.trim(), bg: cs.backgroundColor, opaque: b.length === 3 || b[3] === 1, ratio: ratio(rgb(cs.color), b),
        inside: L.left >= c.left - 0.5 && L.right <= c.right + 0.5 && L.top >= c.top - 0.5 && L.bottom <= c.bottom + 0.5}; })}; });
  const tag = `${th} ${W} ${tn}`;
  if (!r.pbg) noPlate.push(tag);
  for (const l of r.labels) { labels++;
    if (l.bg !== r.pbg) bg.push(`${tag} ${l.name}: ${l.bg} vs plate ${r.pbg}`);
    if (!l.opaque || l.ratio < 4.5) low.push(`${tag} ${l.name}: ${l.opaque ? l.ratio.toFixed(2) + ':1' : 'no plate behind it (' + l.bg + ')'}`);
    if (!l.inside) out.push(`${tag} ${l.name}`); }
  await p.close(); }
ok(!noPlate.length && labels >= 24, `enough Mega labels to tell (${labels} over 16 views; the score plate found in every view${noPlate.length ? ', missing in ' + noPlate[0] : ''})`);
ok(!bg.length, `every Mega label sits on the score plate's colour (${bg.length} off${bg.length ? ', e.g. ' + bg[0] : ''})`);
ok(!low.length, `every Mega label reads at least 4.5:1 on its plate (${low.length} below${low.length ? ', e.g. ' + low[0] : ''})`);
ok(!out.length, `every Mega label stays inside its Card (${out.length} out${out.length ? ', e.g. ' + out[0] : ''})`);
await b.close(); console.log(`v2-q17: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
