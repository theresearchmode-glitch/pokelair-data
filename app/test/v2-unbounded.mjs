// Type rule (Sim, Nov 11): Unbounded only at 15px and up; smaller text is Instrument Sans (design audit Nov 16, P2 #2 found 22
// rules at 13px). Opens every page with the sample six, by day and night, at a phone and a desktop width, and lists any visible
// text drawn in Unbounded under 15px (computed style, so classes set in the HTML count too).
// Sim, Nov 16 (batch 3B): short stamps and tags on plates, and names fitted down to match their neighbours, are a named exception
// (design-system.md section 3); the kinds found then are listed in ALLOW. Exit 1 if any OTHER kind shows up.
//   PAGE=app/dist/v2.html node app/test/v2-unbounded.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 390, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
const routes = await p.evaluate(() => Object.keys(V2.pages).filter(r => !/^(sheet|team-empty|coming|gallery)$/.test(r)));
const ALLOW = new Set(['.st .np-megatag', '.mc-id .u', '.u .mg', '.ffm', '.fn-unm .mg', '.wt-spot .gs-tag.u', '.ev-counts .ev-pk.u', '.tk-mid .tk-tag.u',
  '.tk-hero .tk-seal.u', '.ev-plate .ev-pk.u', '.ar-rk .u', '.ar-rk .ar-you', '.wk-ht .wk-tag.u', '.wk-tile .u', '.trk-st .trk-stamp.u.hit', '.trk-st .trk-stamp.u.miss',
  '.arn-mv .nm.u' /* the calc's move names (the Arena's move buttons since Nov 19; were the old hand's cards) */, '.dc2-kt .stamp.u', '.tp-card .tp-start.u', '.gs-sinfo .gs-tag.u', '.gs-tx .gs-mg.u', '.tp-open .tp-start.u', '.u',
  '.pr-stats .ev-pk' /* the Post Room's "Live right now" stamp on its plate (Sim, Nov 18, morning questions 1i: added to this list) */,
  /* Home's plan board (Nov 18): each lead's name is a short tag on its slanted colour plate, the same kind as exception (a) (a long name
     already drops to Instrument Sans: .sds-tg.nar); and the Practice plate's "Pick 4" tag on its slanted plate under 700 */
  '.sds-tk .sds-tg.u', '.sdt-pp .u.sdt-pick',
  /* Nov 18 evening (Sim: recommended, keep as built): on phones Home's two start buttons drop to 13px to stay on one line, and the
     Ratings podium's score and the Events / How We Calculate chip numbers are 13px badges inside small tiles */
  '.sdh-go .sdh-b1', '.sdh-b2 span', '.sdt-blk .u', '.sdt-cpic .u',
  /* Nov 19: the small '%' after a big share number on Usage (as designed since the Usage rebuild; a sign, not words). The share number itself
     is 15px on phones (it was caught at 13px by the name rule '.us-tx b' once Usage opened on Online tournaments, Q13 A) */
  '.u .us-pct']);
const hits = new Map();
for (const theme of ['day', 'night']) for (const w of [390, 1440]) { await p.setViewportSize({width: w, height: 900});
  for (const r of routes) { await p.evaluate(([r, t]) => { document.documentElement.dataset.theme = t; location.hash = '#' + r; }, [r, theme === 'night' ? 'night' : 'day']); await p.waitForTimeout(500);
    const found = await p.evaluate(() => { const out = [];
      for (const e of document.querySelectorAll('#app *, .np-head *, .np-foot *')) { if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim())) continue;
        const cs = getComputedStyle(e); if (!/Unbounded/i.test(cs.fontFamily.split(',')[0])) continue; const px = parseFloat(cs.fontSize); if (px >= 15) continue;
        const cls = (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') || e.nodeName.toLowerCase();
        const par = e.parentElement && typeof e.parentElement.className === 'string' && e.parentElement.className ? '.' + e.parentElement.className.trim().split(/\s+/)[0] + ' ' : '';
        out.push([par + cls, px, e.textContent.trim().slice(0, 24)]); }
      return out; });
    for (const [sel, px, t] of found) { const k = sel + ' @' + px + 'px'; if (!hits.has(k)) hits.set(k, {where: new Set(), t}); hits.get(k).where.add(`${r} ${w} ${theme}`); } } }
await b.close();
for (const k of [...hits.keys()]) if (ALLOW.has(k.replace(/ @[\d.]+px$/, ''))) hits.delete(k); /* the named exception */
for (const [k, v] of hits) console.log(`  ${k}  "${v.t}"  on ${[...v.where].slice(0, 3).join(', ')}${v.where.size > 3 ? ` +${v.where.size - 3} more` : ''}`);
console.log(`v2-unbounded: ${hits.size ? hits.size + ' new kinds of text in Unbounded under 15px (not stamps/tags or fitted names)' : 'none outside the named exception'} across ${routes.length} pages`);
process.exit(hits.size ? 1 : 0);
