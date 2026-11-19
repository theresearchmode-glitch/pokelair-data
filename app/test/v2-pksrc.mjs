// The Pokémon page's "How to build it" uses one source (Sim, Nov 18, Q10 A; outside audit #1): the Typical set, Usually, Moves and
// Items all come from tournament sets, whatever source the player last picked on the Usage page, and each list names its base.
// Checks for Sneasler and two more, after picking the Showdown ladder on Usage: the Moves and Items notes say "of N teams" (tournament),
// and the Items list's first item is the tournament data's top item.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-pksrc.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#usage'); await p.waitForTimeout(5000);
await p.evaluate(() => window.__ev(`ui.metaSrc = 'ladder'`)); /* as if the player picked the Showdown ladder on Usage */
for (const n of ['sneasler', 'incineroar', 'kingambit']) {
  await p.evaluate(n => { location.hash = '#pokemon=' + n; }, n); await p.waitForTimeout(2500);
  await p.evaluate(() => { const b = document.querySelector('[data-pklists]'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); }); await p.waitForTimeout(800);
  const r = await p.evaluate(n => { const lists = [...document.querySelectorAll('#pk-lists .pk-list')], get = h => lists.find(l => (l.querySelector('h3') || {}).textContent === h);
    const mv = get('Moves'), it = get('Items'), note = l => l ? ((l.querySelector('.fine') || {}).textContent || '') : '';
    const first = it ? ((it.querySelector('.ms-br span') || {}).textContent || '') : '';
    const T = window.__ev(`(() => { const r = [...(META.doubles_tour.top || []), ...(META.doubles_tour.more || [])].find(x => x.n.toLowerCase() === '${n}'); return r && r.it && r.it[0] ? r.it[0][0] : null; })()`);
    return {mvNote: note(mv), itNote: note(it), first, tourTop: T, items: !!it}; }, n);
  ok(/of [\d,]+ teams/.test(r.mvNote), `${n}: Moves names its base as tournament teams ("${r.mvNote}")`);
  if (r.items && !/hold|Always holds/.test(r.itNote)) ok(/of [\d,]+ teams/.test(r.itNote) && (!r.tourTop || r.first === r.tourTop), `${n}: Items names its base and leads with the tournament top item ("${r.itNote}", first ${r.first}, tournament top ${r.tourTop})`);
}
await b.close();
console.log(`v2-pksrc: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
