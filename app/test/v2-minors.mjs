// Small fixes from the code review (Nov 17), one check each; every check fails on the build before its fix.
//   A1-M1  Matchups never says "Ready for every top threat" (word list: answers, not readiness)
//   A1-M2  Build's "Copy for Showdown" uses the shared copy with its fallback (it failed where the clipboard API is blocked)
//   A1-M3  Build's Save says "for this visit" when the browser can't keep it (it always said "Saved")
//   DP-1..12  The Champions Dispatch (#news): source links, what goes on the front, the same numbers as the site, the coupon, contrast, widths, the small piece
//   SDP-1..6  Home's post band (The Stampede, band 4): the Post Room and Dispatch pieces with live POST data, the Pelipper clear of text, widths, empty states
//   NPR-1..13  Review of the three new pages (Nov 18): https-only links, one days-left and dates piece (Tokyo / Los Angeles / UTC),
//              a gift with no start, no empty "0" lines, one story count, cached tools data, one gift reader, official hosts, no
//              "0 players", shared pieces, the coupon's Copy Code as the Post Room's button, the Dispatch name's margins
//   OL-i39  Report a Mistake on a Pokémon page sends its numbers (rating, tier, rank, tournament numbers, moves, items), as today's site did
//   OL-i15  Build's Blueprint shows the catch tip, "X isn't in your box" and every plan chip (no cap of 3), in even rows
//   Q13d  Build's Blueprint shows the Megas tip (both shares counted from the data) and the proven-team note (this exact six, 55%+ wins)
//   Stampede polish 1/1b/2 (Nov 18): the hero/six seam, the three parts starting and ending together, the receipt's band names readable
//   Stampede tiles 2-5 + tags (Nov 18 night): Battle's VS clear, Test Run filled, Damage Calc balanced, equal band bars, board tags inside
//   HQ Q4a-Q13f (Nov 18): Sim's answers for Home (morning questions), one check each (ONLY=HQ runs these alone)
//   AS-1..9 (Nov 18): the All Suggestions sheet, option C (Sim's Q5): Suggest from, sections, card facts, Show 6 More, notes, height (ONLY=AS)
//   BR-C1..C7 (Nov 18): behaviour review: the Apply and Remove holds end on any scroll they didn't make and on leaving My Team,
//              redraws at 1100-1439 don't move My Team, keyboard Apply keeps the focus (ONLY=BR runs these alone)
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-minors.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path'; import fs from 'node:fs';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
/* Parts (Nov 18): the whole file took 18-21 min on GitHub, which pushed the code-tests job past its 35-min limit (runs 1331-1351
   cancelled; golden, same-grade and the logic checks never ran). test.yml runs it as parallel jobs, one per PART; together they run every
   check once. PART=all (the default) runs everything in one go, as before. Parts: main1 (Build ... the Dispatch), main2 (Home's bands, My
   Team height, NPR, Base Stats), groups (BR, MQ, AS, HQ, WebKit pair). ONLY=BR|MQ|AS|HQ still runs one group alone. */
const PART = process.env.PART || 'all', part = k => PART === 'all' || PART.split(',').includes(k);
if (!['all', 'main1', 'main2', 'groups'].includes(PART)) { console.log('v2-minors: unknown PART ' + PART + ' (all, main1, main2, groups)'); process.exit(1); }
/* q59 (Sim's yes, Nov 20): under 700 My Team's Matchups / Suggestions / Team Checks are tabs, one shown at a time. A check of something
   inside Suggestions opens its tab first, as a player would; where there are no tabs (700+) this does nothing */
/* (the tap brings Suggestions under the bar with a smooth scroll; wait past V2._smoothAt's 1.5 s, as the Card-tap checks do, so a hold
   check's outside scroll isn't taken for the site's own) */
const sgTab = async q => { const t = await q.evaluate(() => { const t = document.querySelector('.tm-tabs [data-tmjump="tm-sg"]'); if (t && t.getAttribute('aria-selected') !== 'true') { t.click(); return 1; } return 0; }); await q.waitForTimeout(t ? 1600 : 0); };
/* The pictures (Nov 18): a build without --art reads them from art/ and art-s/ beside the page, but the build copies only the fonts there,
   so in app/dist (CI and the usual setup) every sprite and crowd sheet was a broken image. The hero checks then measured broken-image
   icons (Q13f: icons over the tagline at 320-390; Q7a: sheets not loaded, failed requests counted as files). Put the folders there. */
if (!/window\.NP_ART=/.test(fs.readFileSync(PAGE, 'utf8'))) for (const d of ['art', 'art-s']) { const to = path.join(path.dirname(PAGE), d), from = path.resolve(import.meta.dirname, '../src/v2', d);
  if (!fs.existsSync(to) && fs.existsSync(from)) { try { fs.rmSync(to, {force: true}); fs.symlinkSync(from, to, 'dir'); console.log(`  (linked ${d}/ beside the page to app/src/v2/${d})`); } catch (e) { console.log(`  (could not link ${d}/: ${e.message})`); } } }
if (part('main1')) { // the three file reads (A1-M1, B-I3, B-m5) run in main1 only, so each check runs once across the parts
ok(!/Ready for every top threat/.test(fs.readFileSync(PAGE, 'utf8')), 'A1-M1: the page never says "Ready for every top threat"');
{ const h = fs.readFileSync(PAGE, 'utf8'); ok(/<div id="app"><a class="vh np-skip"[\s\S]*?class="np-head"/.test(h), 'B-I3: the header is in the page before the script runs (static first screen)'); if (h.includes('__NP_PREVIEW=1')) ok(/const D=JSON\.parse\("/.test(h), 'B-m5: the Preview\'s data is read with JSON.parse, not as a big object literal'); } }
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
// ---- BR begin: behaviour review (Nov 18, docs/rebuild/audits/review-behaviour-nov18.md C1, C2, C3, C7). Each check failed on the build before its fix.
//   ONLY=BR runs these alone. The --split loaders (C5, C6) are checked over http by app/test/v2-split.mjs.
const BR = async () => {
  const tOpen = async (W, from) => { const c = await b.newContext({viewport: {width: W, height: W < 700 ? 844 : 900}, hasTouch: false}), q = await c.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
    await q.goto('file://' + PAGE + (from || '#team')); await q.waitForTimeout(2000); if (from) { await q.evaluate(() => { location.hash = '#team'; }); await q.waitForTimeout(1500); }
    /* a team with something to fix (the sample team has nothing, so no Apply): the review's test team, through Import */
    await q.locator('[data-v2more]').first().click(); await q.waitForTimeout(400); await q.locator('.np-sheet [data-v2import]').first().click(); await q.waitForTimeout(400);
    await q.fill('[data-impin]', ['Incineroar', 'Garchomp', 'Sneasler', 'Kingambit', 'Basculegion', 'Sinistcha'].join('\n\n')); await q.locator('[data-impgo]').click(); await q.waitForTimeout(800);
    await q.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {}); await q.waitForTimeout(1200); await sgTab(q); return {q, c}; };
  const apply = async q => { const a = q.locator('#main [data-v2plan]').first(); await a.scrollIntoViewIfNeeded(); await q.evaluate(() => scrollBy(0, -120)); await q.waitForTimeout(300);
    const y = await q.evaluate(() => scrollY); await a.click(); return y; };
  /* far, but clear of the page's end (it may get shorter). q59: My Team on phones is about 3 screens now (tabs), so 1500px could reach
     the end or the top, where the page's own shortening clamps the scroll; up to 1500px toward the side with more room, 300px clear of it */
  const away = q => q.evaluate(() => { const max = document.documentElement.scrollHeight - innerHeight, dn = max - scrollY, up = scrollY;
    scrollTo(0, dn >= up ? scrollY + Math.min(1500, dn - 300) : scrollY - Math.min(1500, up - 300)); return scrollY; });
  // C1 (finding 2): a scroll the hold didn't make (a script here; a screen reader or find-in-page does the same) ends Apply's hold
  { const {q, c} = await tOpen(390); const y0 = await apply(q); await q.waitForTimeout(400); const y1 = await away(q); await q.waitForTimeout(1200); const y2 = await q.evaluate(() => scrollY);
    ok(Math.abs(y1 - y0) > 300 && Math.abs(y2 - y1) <= 2, `BR-C1a: after Apply, a script scroll (as a screen reader or find-in-page makes) ends the hold: the page stays where it was sent (Apply at ${y0}, sent to ${y1}, ${y2} 1.2 s later)`);
    await c.close(); }
  // control: with nothing else scrolling, Apply's hold still keeps an Apply under the finger (the guard doesn't end it on the redraw's own moves)
  { const {q, c} = await tOpen(390); await q.evaluate(() => { const a = document.querySelector('#main [data-v2plan]'), s = a.closest('section'); window.__brA = [s.id, a.getBoundingClientRect().top - s.getBoundingClientRect().top]; }); await apply(q);
    /* what the hold keeps: an Apply where the tapped one was, or with none left (nothing to fix), the section where it was */
    const tops = []; for (let i = 0; i < 6; i++) { await q.waitForTimeout(500); tops.push(await q.evaluate(() => { const s = document.getElementById(window.__brA[0]); if (!s) return null; const v = [...s.querySelectorAll('[data-v2plan]')].find(e => e.getClientRects().length); return Math.round(v ? v.getBoundingClientRect().top : s.getBoundingClientRect().top + window.__brA[1]); })); }
    ok(tops.every(t => t != null) && Math.max(...tops) - Math.min(...tops) <= 2, `BR-C1 control: with no other scroll, Apply's hold keeps the tapped place for the 3 s after (tops ${tops.join(', ')})`); await c.close(); }
  // C1 (finding 2), Remove: the same for V2.rmHold
  { const {q, c} = await tOpen(390); await q.locator('#main [data-tmsel="2"]').first().click(); await q.waitForTimeout(1600) /* past the Card tap's own smooth scroll (V2._smoothAt) */; const rm = q.locator('#main .mt-edit [data-v2rm], #main .mtf-sum [data-v2rm]').first(); /* Nov 21: My Team frame (Sim approved) */ await rm.scrollIntoViewIfNeeded(); await q.waitForTimeout(300);
    await rm.click(); await q.waitForTimeout(400); const y0 = await q.evaluate(() => scrollY), y1 = await away(q); await q.waitForTimeout(1200); const y2 = await q.evaluate(() => scrollY);
    ok(Math.abs(y1 - y0) > 300 && Math.abs(y2 - y1) <= 2, `BR-C1b: after Remove, a script scroll ends the hold: the page stays where it was sent (${y0} -> ${y1}, ${y2} 1.2 s later)`); await c.close(); }
  // Nov 19 (CI run 1365: BR-C1b "337 -> 1837, 337"): the same, with a layout change in the same frame as the scroll (as the suggestions'
  //   redraw can land on a slower machine); the hold took the whole scroll for the layout's and pulled the page back. Failed before the fix.
  { const {q, c} = await tOpen(390); await q.locator('#main [data-tmsel="2"]').first().click(); await q.waitForTimeout(1600); const rm = q.locator('#main .mt-edit [data-v2rm], #main .mtf-sum [data-v2rm]').first(); /* Nov 21: My Team frame (Sim approved) */ await rm.scrollIntoViewIfNeeded(); await q.waitForTimeout(300);
    await rm.click(); await q.waitForTimeout(400); const y0 = await q.evaluate(() => scrollY), y1 = await q.evaluate(() => { scrollTo(0, scrollY + Math.min(1500, document.documentElement.scrollHeight - innerHeight - scrollY - 300)); /* q59: clear of the shorter page's end, as away() */ const d =document.createElement('div'); d.style.height = '40px'; document.querySelector('#main').append(d); return scrollY; });
    await q.waitForTimeout(1200); const y2 = await q.evaluate(() => scrollY);
    ok(Math.abs(y1 - y0) > 300 && Math.abs(y2 - y1) <= 2, `BR-C1c: after Remove, a script scroll with a layout change in the same frame still ends the hold (${y0} -> ${y1}, ${y2} 1.2 s later)`); await c.close(); }
  // C2 (finding 3): Apply's hold ends when the player leaves My Team (Back, then Forward within its 5 s: no drag down to the old Apply)
  /* (Back then Forward restores the old scroll place by itself, so the check leaves and comes back through links: My Team opens at its top) */
  { const {q, c} = await tOpen(390); const y0 = await apply(q); await q.waitForTimeout(300); await q.evaluate(() => { location.hash = '#meta'; }); await q.waitForTimeout(500); await q.evaluate(() => { location.hash = '#team'; }); await q.waitForTimeout(300);
    const ya = await q.evaluate(() => scrollY); await q.waitForTimeout(1500); const yb = await q.evaluate(() => scrollY);
    ok(y0 > 500 && ya < 100 && yb < 100, `BR-C2: Apply, leave for Meta, back to My Team within 5 s: My Team opens at its top and stays there (Apply was at ${y0}; ${ya}, then ${yb} 1.5 s later)`); await c.close(); }
  // and when the section itself is gone: the hold doesn't come back with it
  { const {q, c} = await tOpen(390); const y1 = await apply(q); await q.waitForTimeout(300);
    const yc = await q.evaluate(async () => { const s = document.querySelector('#main [data-v2plan]').closest('section'), par = s.parentNode, nx = s.nextSibling; s.remove(); await new Promise(r => setTimeout(r, 300)); scrollTo(0, 0); par.insertBefore(s, nx); await new Promise(r => setTimeout(r, 1200)); return scrollY; });
    ok(y1 > 500 && yc < 100, `BR-C2b: once Suggestions is gone, the hold has ended: put back, it doesn't pull the page to it (Apply was at ${y1}; ${yc} after)`); await c.close(); }
  // C7 (finding 4): at 1100-1439 a redraw doesn't move My Team (the Hand's move lists are drawn with their last fit)
  for (const W of [1100, 1280, 1439]) { const {q, c} = await tOpen(W); const ys = await q.evaluate(async () => { scrollTo(0, 1500); const out = [scrollY]; for (let i = 0; i < 4; i++) { V2.redraw(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await new Promise(r => setTimeout(r, 150)); out.push(scrollY); } return out; });
    ok(ys[0] === 1500 && ys.every(y => Math.abs(y - ys[0]) <= 1), `BR-C7: at ${W} four redraws leave My Team where it was (scrollY ${ys.join(', ')})`); await c.close(); }
  // C3 (finding 5): keyboard Apply leaves the focus on the Undo or the Apply now in its place, not on <body>, and doesn't scroll to it
  for (const W of [390, 1280]) { const {q, c} = await tOpen(W); const a = q.locator('#main [data-v2plan]').first(); await a.scrollIntoViewIfNeeded(); await q.evaluate(() => scrollBy(0, -120)); await q.waitForTimeout(300); await a.focus();
    await q.keyboard.press('Enter'); await q.waitForTimeout(300); const f = () => q.evaluate(() => { const e = document.activeElement; return !e || e === document.body ? 'body' : e.matches('[data-undobar]') ? 'Undo' : e.matches('[data-v2plan]') ? 'Apply' : e.tagName + '.' + e.className; });
    const f1 = await f(); await q.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {}); await q.waitForTimeout(1500); const f2 = await f(), toast = await q.evaluate(() => document.querySelectorAll('.np-toast').length);
    ok(/^(Undo|Apply)$/.test(f1) && /^(Undo|Apply)$/.test(f2) && toast <= 1, `BR-C3: at ${W} keyboard Apply puts the focus on the Undo or the Apply now in its place (not <body>), it stays after the list settles, and one message at most (A6) (${f1}, then ${f2}; toasts ${toast})`); await c.close(); } };
if (process.env.ONLY === 'BR') { await BR(); await b.close(); console.log(`v2-minors:${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0); }
// ---- MQ begin: Sim's answers to the Nov 18 morning questions (docs/rebuild/morning-questions-nov18.md) and his Gifts-only rule.
//   Each check failed on the build before its change. ONLY=MQ runs these alone; the full run calls MQ() just before the browser closes.
const MQ = async () => {
  const open = async (hash, W = 1440) => { const q = await b.newPage({viewport: {width: W, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + hash); await q.waitForTimeout(2000); return q; };
  // MQ-G1 (Sim, Nov 18: "just mystery gifts"): #gifts shows only Serial Code and Event Gift entries, from the real post.js; the tabs' counts match the stamps
  { const q = await open('#gifts'); await q.click('#main [data-prmore]', {timeout: 3000}).catch(() => {}); await q.waitForTimeout(400);
    const r = await q.evaluate(() => window.__ev(`(() => { const kinds = [...document.querySelectorAll('#main .pr-sw')].map(li => (li.className.match(/pr-(\\w+)$/) || [])[1]);
      const lab = [...document.querySelectorAll('#main .pr-parcel .pr-meta')].map(m => m.textContent);
      const raw = (POST.gifts || []).map(g => g.how), shown = [...V2.postNow().live, ...V2.postNow().past].map(g => V2.prG(g).how);
      const tabs = Object.fromEntries([...document.querySelectorAll('#main [data-prf]')].map(t => [t.dataset.prf, +t.querySelector('small').textContent]));
      const P = V2.postNow().past.map(V2.prG);
      return {kinds: [...new Set(kinds)].join(','), labels: lab.filter(t => /Battle Pass|Competition|Livestream|Early download/i.test(t)).length, raw: [...new Set(raw)].join(','), shown: [...new Set(shown)].join(','),
        tabs, want: {all: P.length, mon: P.filter(g => g.isMon).length, item: P.filter(g => !g.isMon).length}, stamps: kinds.length}; })()`));
    ok(/^(serial|event)(,(serial|event))?$/.test(r.kinds) && !r.labels && /^(Serial Code|Event Gift)(,(Serial Code|Event Gift))?$/.test(r.raw) && /^(serial|event)(,(serial|event))?$/.test(r.shown)
      && r.tabs.all === r.want.all && r.tabs.mon === r.want.mon && r.tabs.item === r.want.item && r.stamps === r.want.all,
      `MQ-G1: #gifts shows only Mystery Gifts (Serial Code and Event Gift), post.js holds no other kind, and the tabs count the stamps (${JSON.stringify(r)})`);
    /* and a stray Battle Pass / Competition Prize / Livestream / Early Download entry never reaches the page, Home's band or the Dispatch coupon */
    const s = await q.evaluate(() => window.__ev(`(() => { const keep = POST, t = Date.now(), iso = x => new Date(x).toISOString(); try { POST = {checked: null, news: keep.news, series: keep.series, gifts: ['Battle Pass', 'Competition Prize', 'Livestream Reward', 'Early Download', 'Serial Code']
      .map((h, i) => ({id: 'x' + i, kind: 'item', name: 'Test ' + h, amount: 1, how: h, code: h === 'Serial Code' ? 'AB12' : undefined, start: iso(t - 864e5), end: iso(t + (i + 2) * 864e5)}))}; const P = V2.postNow();
      return P.live.map(g => g.how).join(',') + ' | ' + (/Test (Battle|Competition|Livestream|Early)/.test(V2.pages.gifts.draw() + V2.sdPost() + V2.dpFront(P)) ? 'leaks' : 'clean'); } finally { POST = keep; } })()`));
    ok(s === 'Serial Code | clean', `MQ-G1b: other kinds of gift are kept off #gifts, Home's post band and the Dispatch even if post.js had them (${s})`);
    await q.close(); }
  // MQ-1a (answer 1a): the parcel (kraft > label > Copy Code) is a named exception to "no boxes in boxes", written where the exceptions live
  { const ds = fs.readFileSync(new URL('../../docs/rebuild/design-system.md', import.meta.url), 'utf8');
    ok(/Named exception \(Sim, Nov 18, morning questions 1a[^\n]*\n[^\n]*\.pr-parcel/.test(ds), 'MQ-1a: design-system.md names the Post Room parcel as the exception to "no boxes in boxes" (Sim, Nov 18, 1a)'); }
  // MQ-1b (answer 1b): every label's middle column is headed "Sent", the date right under it, and how it is given on the line below;
  // on #gifts and on Home's compact parcel (they share V2.prLabel)
  for (const [hash, sel] of [['#gifts', '#main .pr-counter .pr-meta'], ['#home', '.sdp .pr-meta']]) { const q = await open(hash);
    const r = await q.evaluate(sel => [...document.querySelectorAll(sel)].map(m => { const d = m.children[1]; return d ? [...d.children].map(c => c.tagName + ':' + c.textContent.trim()).join(' / ') : 'none'; }), sel);
    ok(r.length > 0 && r.every(x => /^DT:Sent \/ DD:([A-Z][a-z]{2} \d{1,2}(, \d{4})?|Date not confirmed) \/ DD:(Serial code|Event gift)$/.test(x)), `MQ-1b ${hash}: the label's middle column reads "Sent", the date, then how it is given (${r.join(' | ')})`);
    await q.close(); }
  // MQ-9a (answer 9a): the official news feed is a source with its row in docs/legal-sources.md, and one User-Agent: http.mjs's NastyPlot-data string
  { const ls = fs.readFileSync(process.env.MQ_LEGAL || new URL('../../docs/legal-sources.md', import.meta.url), 'utf8'), hm = fs.readFileSync(new URL('../../http.mjs', import.meta.url), 'utf8');
    const row = ls.split('\n').find(l => /^\| \*\*Official in-game news feed\*\* \(champions-news\.pokemon-home\.com\)/.test(l)) || '';
    ok(!!row && /http\.mjs/.test(row) && /no article text/.test(row) && /one User-Agent for every source/.test(ls) && /NastyPlot-data\/1\.0/.test(hm) && /`User-Agent: NastyPlot-data\/1\.0/.test(ls),
      `MQ-9a: legal-sources.md has the official news feed's row (read through http.mjs, headlines and links only) and names NastyPlot-data/1.0 as the one User-Agent (row ${row ? 'found' : 'missing'})`); }
  // MQ-9b (answer 9b): the 2-outlet rule for codes is written in the data notes and enforced by post-data-test's outlet list
  { const ls = fs.readFileSync(process.env.MQ_LEGAL || new URL('../../docs/legal-sources.md', import.meta.url), 'utf8'), pt = fs.readFileSync(new URL('../../experiments/post-data-test.mjs', import.meta.url), 'utf8');
    const sec = (ls.split('### Codes: the 2-outlet rule (9b)')[1] || '').split('\n## ')[0];
    ok(/2 or more reputable outlets on different sites/.test(sec) && /Analytics Insight[^\n]*never counts/.test(sec) && /const OUTLETS = \[/.test(pt) && /outlets that count/.test(pt),
      `MQ-9b: legal-sources.md writes the 2-outlet rule for codes (which outlets count; Analytics Insight never does) and post-data-test enforces that list (section ${sec ? sec.length + ' chars' : 'missing'})`); }
  // MQ-9c (answer 9c): news automatic, gifts suggested, codes manual: post-news.mjs and its own test (experiments/post-news-test.mjs), and the split written down
  { const ls = fs.readFileSync(process.env.MQ_LEGAL || new URL('../../docs/legal-sources.md', import.meta.url), 'utf8'); let res = '';
    try { res = (await import('node:child_process')).execFileSync('node', [(await import('node:url')).fileURLToPath(new URL('../../experiments/post-news-test.mjs', import.meta.url))], {encoding: 'utf8', stdio: 'pipe'}).trim().split('\n').pop(); } catch (e) { res = 'failed: ' + String(e.stdout || e.message).trim().split('\n').pop(); }
    ok(res === 'ALL PASS' && /### Who updates what \(9c\)/.test(ls) && /News: automatic/.test(ls) && /Gifts: suggested only/.test(ls) && /Codes: manual/.test(ls),
      `MQ-9c: the split (news automatic, gifts suggested, codes manual) is written down and post-news-test passes (${res})`); }
  // MQ-9d (answer 9d): past codes are dropped from post.js; a gift that had ended when the list was checked holds no code, and none is in the page
  { const q = await open('#gifts'); const r = await q.evaluate(() => window.__ev(`(() => { const t = Date.parse(POST.checked), past = POST.gifts.filter(g => Date.parse(g.end) < t);
      const kept = past.filter(g => g.code).map(g => g.code), html = document.documentElement.outerHTML; return {past: past.length, kept: kept.join(','), inPage: kept.filter(c => html.includes(c)).length}; })()`));
    ok(r.past > 0 && !r.kept && !r.inPage, `MQ-9d: no past gift keeps its code in post.js (${JSON.stringify(r)})`); await q.close(); }
  // MQ-9e (answer 9e): in-game steps only. #gifts gives the steps in the game and no page of the family links a login or code redemption
  // site. (Nothing to change on the built pages: this guards it. It can fail: MQ-9e control adds such a link and must be caught.)
  { const q = await open('#gifts'); const LOGIN = /(^|\.)(app\.pokemonchampions\.jp|rewards\.pokemon\.com|club\.pokemon\.com|accounts\.nintendo\.com|join\.pokemon\.com)$/i;
    const scan = () => q.evaluate(() => window.__ev(`(() => { const d = document.createElement('div'); d.innerHTML = V2.pages.gifts.draw() + V2.pages.news.draw() + V2.sdPost();
      return {steps: [...d.querySelectorAll('.pr-howto li')].map(li => li.textContent).join(' | '), hosts: [...d.querySelectorAll('a[href]')].map(a => { try { return new URL(a.getAttribute('href'), 'https://x.invalid/').hostname; } catch (e) { return ''; } }).filter(Boolean)}; })()`));
    const r = await scan(), bad = r.hosts.filter(h => LOGIN.test(h));
    ok(/Submenu and choose Mystery Gift/.test(r.steps) && /Mailbox/.test(r.steps) && !bad.length, `MQ-9e: #gifts gives the in-game steps and #gifts, #news and Home's band link no login or code redemption site (${r.hosts.length} links; ${bad.join(',') || 'none bad'})`);
    await q.evaluate(() => window.__ev(`POST.gifts.find(g => g.code).src.unshift('https://serial-web-front.app.pokemonchampions.jp/?lng=10')`));
    const c = await scan(); ok(c.hosts.some(h => LOGIN.test(h)), 'MQ-9e control: a redemption-site link put into the data is found by the same scan'); await q.close(); }
  // MQ-2c (answer 2c): the Back Page's column names are the word list's: "Top Ratings" and "Next Events" (were The Standings / Fixtures), full paper and Home's small one
  { const q = await open('#news'); const r = await q.evaluate(() => { const h = [...document.querySelectorAll('#main .dp-bc h3')].map(x => x.textContent.trim()), all = document.body.innerText;
      return {h: h.join(' | '), labels: [...document.querySelectorAll('#main .dp-bc[aria-label]')].map(x => x.getAttribute('aria-label')).join(' | '), old: /The Standings|Fixtures/.test(all)}; });
    ok(/Top Ratings/.test(r.h) && /Next Events/.test(r.h) && /Top Ratings/.test(r.labels) && /Next Events/.test(r.labels) && !r.old, `MQ-2c: the Back Page says "Top Ratings" and "Next Events", never "The Standings" or "Fixtures" (${JSON.stringify(r)})`); await q.close(); }
  // MQ-1i (answer 1i): the new Post Room words as built, and "Live right now" (a small Unbounded stamp on its plate) on the font check's allowed list
  { const un = fs.readFileSync(new URL('./v2-unbounded.mjs', import.meta.url), 'utf8'), q = await open('#gifts');
    const t = await q.evaluate(() => { const pk = document.querySelector('#main .pr-stats .ev-pk'), cs = pk && getComputedStyle(pk); return {pk: pk && pk.textContent, font: cs && cs.fontFamily.split(',')[0] + ' ' + cs.fontSize,
      words: ['Special delivery.', 'No postage due.', 'Waiting at the Counter', 'The Stamp Sheet', 'How to collect', 'to claim', 'gifts so far', 'Collect by'].filter(w => !document.querySelector('#main').textContent.includes(w))}; });
    ok(/'\.pr-stats \.ev-pk'/.test(un) && t.pk === 'Live right now' && !t.words.length, `MQ-1i: the Post Room's words are as built and "Live right now" (${t.font}) is on v2-unbounded's allowed list (${JSON.stringify(t)})`); await q.close(); }
  // MQ-1f (answer 1f): Search finds both pages by name and by the words players type; the top bar keeps its five places
  for (const W of [390, 1440]) { const q = await open('#home', W); const hits = {};
    for (const w of ['gifts', 'mystery', 'codes', 'news', 'dispatch']) { await q.evaluate(() => V2.openSearch()); await q.waitForTimeout(300); await q.fill('[data-v2q]', w); await q.waitForTimeout(250);
      hits[w] = await q.evaluate(() => [...document.querySelectorAll('.np-sheet .np-hit')].map(h => (h.getAttribute('href') || '') + ' ' + ((h.querySelector('b') || {}).textContent || '')).join(' | '));
      await q.keyboard.press('Escape'); await q.waitForTimeout(250); }
    await q.evaluate(() => V2.openSearch()); await q.waitForTimeout(300); await q.fill('[data-v2q]', 'mystery'); await q.waitForTimeout(250); await q.locator('.np-sheet a.np-hit[href="#gifts"]').first().click().catch(() => {}); await q.waitForTimeout(1200);
    const went = await q.evaluate(() => [location.hash, document.title, !!document.querySelector('#main .pr-counter')]);
    const bar = await q.evaluate(() => [V2.places.length, [...document.querySelectorAll('.np-head .np-nav a, .np-bar a')].filter(a => a.getClientRects().length).map(a => a.getAttribute('href')).join(',')]);
    const g = /#gifts Mystery Gifts/, n = /#news Champions News/;
    ok(g.test(hits.gifts) && g.test(hits.mystery) && g.test(hits.codes) && n.test(hits.news) && n.test(hits.dispatch) && went.join() === '#gifts,Mystery Gifts · NastyPlot,true'
      && bar[0] === 5 && !/#gifts|#news/.test(bar[1]), `MQ-1f at ${W}: Search finds Mystery Gifts and Champions News (by name and by "codes", "dispatch") and opens them; the top bar keeps five places, neither page in it (${JSON.stringify({hits, went, bar})})`);
    await q.close(); }
};
if (process.env.ONLY === 'MQ') { await MQ(); await b.close(); console.log(`v2-minors:${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0); }
// ---- AS begin: All Suggestions sheet, option C (Sim, Nov 18, Q5 C "recommend for all is good"; sub-question A: Apply closes the sheet,
//   Undo waits on My Team). docs/rebuild/pics/nov18/README-allsugs-options.md. Each AS check failed on the build before (the sheet was one
//   list: no Suggest from, no headings, no notes, 12 cards then "Show 12 More"); AS-8 and AS-9 are guards that passed before too.
//   ONLY=AS runs these alone; the full run calls AS() just before the browser closes.
const AS = async () => {
  const BOXA = ['Absol', 'Archaludon', 'Azumarill', 'Basculegion', 'Garchomp', 'Incineroar', 'Kingambit', 'Sneasler', 'Whimsicott', 'Rillaboom', 'Charizard', 'Gengar', 'Dragonite', 'Tyranitar', 'Hydreigon', 'Amoonguss', 'Talonflame', 'Pelipper', 'Torkoal', 'Farigiraf'];
  const T68 = ['Garchomp', 'Kingambit', 'Sneasler', 'Basculegion', 'Archaludon', 'Azumarill']; /* scores 68, 21 suggestions (the README's team) */
  const st = (team, box, pool) => { const s = {slots: team.map(n => ({n, a: null, lock: false})), box, teams: [], loadedId: null, format: 'doubles', maxMega: 1, opp: [], excl: [], log: []}; while (s.slots.length < 6) s.slots.push({n: '', a: null, lock: false}); return {s, pool}; };
  const openAS = async ({team = T68, box = BOXA, pool = null, W = 1440, dark = false} = {}) => { const c = await b.newContext({viewport: {width: W, height: W < 700 ? 844 : 900}, colorScheme: dark ? 'dark' : 'light'}), q = await c.newPage();
    await q.addInitScript(([S]) => { window.__PL_TEST = 1; if (!sessionStorage.getItem('as1')) { sessionStorage.setItem('as1', 1); localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.state', JSON.stringify(S.s)); if (S.pool) localStorage.setItem('cc2.pool', JSON.stringify(S.pool)); } }, [st(team, box, pool)]);
    await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2000);
    await q.waitForFunction(() => window.V2 && V2.plan && V2.plan.plans && !document.querySelector('#main .sg2-wait'), null, {timeout: 90000}).catch(() => {}); await q.waitForTimeout(800);
    await sgTab(q); /* q59: on phones the sheet is opened from the Suggestions tab */ await q.evaluate(() => window.__ev('V2.openAllSugs()')); await q.waitForTimeout(800); return {q, c}; };
  const settle = q => q.waitForFunction(() => { const s = document.querySelector('.np-sheet .sga2'); return s && !s.querySelector('.sg2-wait'); }, null, {timeout: 90000}).catch(() => {});
  const T = (q, sel) => q.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }, sel);
  // AS-1: the head and the one Suggest from inside the sheet, showing the same choice as My Team's
  { const {q, c} = await openAS(); const r = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('.np-sheet .sga2'), sl = s && s.querySelector('[data-v2slide="sgpool"]');
      return {head: s ? s.querySelector('h2').textContent + ' / ' + s.querySelector('.tm-sub').textContent : '', ch: sl ? [...sl.querySelectorAll('button')].map(b => b.textContent.trim() + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')).join('|') : 'none', pool: ui.pool}; })()`));
    ok(/^All Suggestions \/ Every change the planner found for your team, best first/.test(r.head) && r.ch === ({box: 'My Box*|Box + Catch|Whole Roster', boxfill: 'My Box|Box + Catch*|Whole Roster', all: 'My Box|Box + Catch|Whole Roster*'})[r.pool],
      `AS-1 (Q5 C): the sheet's head, then Suggest from with My Team's choice pressed (${r.head.slice(0, 70)}; ${r.ch}; pool ${r.pool})`);
  // AS-2: tapping Whole Roster in the sheet changes the one shared setting; the sheet shows the working line, then the new list (To catch picks)
    const before = await T(q, '.np-sheet .sga2 .sga2-two'); await q.click('.np-sheet .sga2 [data-v2slide="sgpool"] [data-v="all"]', {timeout: 3000}).catch(() => {}); await q.waitForTimeout(500);
    const sawWait = await q.evaluate(() => !!document.querySelector('.np-sheet .sga2 .sg2-wait')); await settle(q); await q.waitForTimeout(600);
    const r2 = await q.evaluate(() => window.__ev(`({pool: ui.pool, mine: ((document.querySelector('#main [data-v2slide="sgpool"] [aria-pressed="true"]') || {}).textContent || '').trim(), focus: !!(document.activeElement && document.activeElement.closest('.np-sheet [data-v2slide="sgpool"]'))})`));
    const after = await T(q, '.np-sheet .sga2 .sga2-two');
    ok(r2.pool === 'all' && /Whole Roster/.test(r2.mine) && sawWait && after && after !== before && r2.focus,
      `AS-2 (Q5 C): Whole Roster in the sheet sets the shared Suggest from (My Team's reads it too), shows "Working out…", then a new list; focus stays on the choice (${JSON.stringify(r2)}, working ${sawWait}, list changed ${after !== before})`); await c.close(); }
  // AS-3: "One Pokémon In, One Out": 6 cards, then "Show 6 More · Showing 6 of N"; a tap opens 6 more and the focus goes to the 7th card's Apply
  { const {q, c} = await openAS(); const r = await q.evaluate(() => { const s = document.querySelector('.np-sheet .sga2'), h = [...s.querySelectorAll('.sga2-h3')].map(e => e.textContent), st = s.querySelector('[data-v2sgamore]');
      return {h, n: s.querySelectorAll('.sga2-two > li').length, strip: st ? st.innerText.replace(/\s+/g, ' ').trim() : ''}; });
    await q.click('.np-sheet [data-v2sgamore]', {timeout: 3000}).catch(() => {}); await q.waitForTimeout(500);
    const r2 = await q.evaluate(() => ({n: document.querySelectorAll('.np-sheet .sga2-two > li').length, f: document.activeElement && document.activeElement.getAttribute('data-v2plana'), eb: document.activeElement && document.activeElement.closest('li') ? document.activeElement.closest('li').querySelector('.np-eyebrow').textContent : ''}));
    const m = r.strip.match(/^Show (\d+) More Showing 6 of (\d+)$/);
    ok(r.h[0] === 'One Pokémon In, One Out' && r.n === 6 && m && r2.n === Math.min(12, +m[2]) && r2.f === '6' && r2.eb === 'Suggestion 7',
      `AS-3 (Q5 C): "One Pokémon In, One Out" with 6 cards, "${r.strip}"; Show More opens ${r2.n} (focus on ${r2.eb || 'nothing'})`); await c.close(); }
  // AS-4: "Bigger Plans" is an open section (no fold) of two-or-more-change plans only, each Apply mapped to its own plan
  { const {q, c} = await openAS(); const r = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('.np-sheet .sga2'), h = [...s.querySelectorAll('.sga2-h3')].find(e => e.textContent === 'Bigger Plans');
      const big = [...s.querySelectorAll('.sga2-big > li')], ks = big.map(li => li.querySelectorAll('.tm-chg').length), map = [...s.querySelectorAll('[data-v2plana]')].every(b => { const pl = V2.sgAll.list[+b.dataset.v2plana], li = b.closest('li'); return pl && pl.ch.length === li.querySelectorAll('.tm-chg').length; });
      return {h: !!h, inFold: !!(h && h.closest('details')), sub: h ? h.nextElementSibling.textContent : '', ks, map, note: (s.querySelector('.sga2-big') ? '' : (h && h.nextElementSibling.nextElementSibling || {}).textContent) || ''}; })()`));
    ok(r.h && !r.inFold && r.sub === 'Two or more changes at once.' && (r.ks.length ? r.ks.every(k => k >= 2) : /No plan with two or more changes raises the Strength Score \(it’s at \d+\)\./.test(r.note)) && r.map,
      `AS-4 (Q5 C): "Bigger Plans" open, two or more changes per card (${r.ks.join(',') || r.note}), every Apply mapped to its plan (${r.map})`);
  // AS-5: shorter card facts on every card: type chips, "X tier N", "Ability @ Item"; the change chips stay in Why? (not on the card)
    const f = await q.evaluate(() => [...document.querySelectorAll('.np-sheet .sga2 .tm-sug > li')].map(li => { const fa = li.querySelector('.sga2-facts'); if (!fa) return 'no facts';
      const t = fa.innerText.replace(/\s+/g, ' '); return (fa.querySelector('.np-type') ? '' : 'no type ') + (/\b[SABCD] tier \d+/.test(t) ? '' : 'no tier ') + (/\S @ \S/.test(t) ? '' : 'no set ') + (/(Weak spots|Unresisted|Offense) \d/.test(t) ? 'chips ' : ''); }).filter(Boolean));
    const n = await q.evaluate(() => document.querySelectorAll('.np-sheet .sga2 .tm-sug > li').length);
    ok(n > 0 && !f.length, `AS-5 (Q5 C): ${n} cards each show types, tier and Ability @ Item, no change chips outside Why? (${f.slice(0, 3).join(' | ') || 'all good'})`);
  // AS-4b (Sim, Nov 18, Q3 B): with two or more Bigger Plans the section shows the first, then "Show N More" (Showing 1 of M);
  // the strip opens the rest in place with the focus on the first new card's Apply; the end line waits until everything is open
  { const {q, c} = await openAS(); const r = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('.np-sheet .sga2'), n = s.querySelectorAll('.sga2-big > li').length,
      st = s.querySelector('[data-v2sgbmore]'); return {n, strip: st ? st.innerText.replace(/\\s+/g, ' ').trim() : '', end: !!s.querySelector('.sga2-end'), multi: [...(V2.plan.plans || []), ...((V2.plan.plans || {}).more || [])].filter(pl => pl.ch.length > 1).length}; })()`));
    if (r.multi >= 2) { await q.click('.np-sheet [data-v2sgbmore]'); await q.waitForTimeout(500);
      const r2 = await q.evaluate(() => ({n: document.querySelectorAll('.np-sheet .sga2-big > li').length, f: document.activeElement && document.activeElement.closest('.sga2-big > li') === document.querySelectorAll('.np-sheet .sga2-big > li')[1]}));
      ok(r.n === 1 && r.strip === `Show ${Math.min(3, r.multi - 1)} More Showing 1 of ${r.multi}` && !r.end && r2.n === Math.min(4, r.multi) && r2.f,
        `AS-4b (Q3 B): Bigger Plans shows 1 of ${r.multi}, "${r.strip}", no end line yet (${r.end}); Show More opens ${r2.n}, focus on the second plan (${r2.f})`); }
    else ok(r.n === r.multi && !r.strip, `AS-4b (Q3 B): ${r.multi} Bigger Plan(s), no strip needed (${r.n} shown)`);
    await c.close(); }
  // AS-6: the list ends with where to find more, once everything is open
    for (let i = 0; i < 8 && await q.$('.np-sheet [data-v2sgamore],.np-sheet [data-v2sgbmore]'); i++) { await q.click('.np-sheet [data-v2sgamore],.np-sheet [data-v2sgbmore]', {timeout: 3000}).catch(() => {}); await q.waitForTimeout(400); } /* both Show More strips (Q3 B) */
    const end = await T(q, '.np-sheet .sga2-end');
    ok(/^That’s every change the planner found in your box and the best Pokémon to catch\. For more, set Suggest from to Whole Roster above\.$/.test(end), `AS-6 (Q5 C): the end line (${end})`); await c.close(); }
  // AS-7: the game-plan gap note shows in the sheet too (COV-09's team: nothing in this box closes the gap)
  { const {q, c} = await openAS({team: ['Garchomp', 'Incineroar', 'Kingambit', 'Sneasler', 'Basculegion', 'Archaludon'], box: ['Garchomp', 'Incineroar', 'Kingambit', 'Sneasler', 'Basculegion', 'Archaludon', 'Azumarill'], pool: 'box'});
    const r = await q.evaluate(() => window.__ev(`({gap: (V2.plan.plans || {}).gapNote || '', sheet: ((document.querySelector('.np-sheet .sga2 .sg2-gap') || {}).textContent || '')})`));
    ok(r.gap && r.sheet.includes(r.gap), `AS-7 (Q5 C): the gap note in the sheet (${r.sheet.slice(0, 120) || 'none'}; planner: ${r.gap.slice(0, 60)})`); await c.close(); }
  // AS-8 (guard, Q5 sub-question A): Apply in the sheet closes it; the Applied … Undo bar waits on My Team
  { const {q, c} = await openAS({W: 390}); await q.click('.np-sheet .sga2 [data-v2plana="0"]', {timeout: 3000}).catch(() => {}); await q.waitForTimeout(1500);
    const r = await q.evaluate(() => ({open: !!document.querySelector('.np-sheet'), bar: ((document.querySelector('#main .sg2-undo') || {}).innerText || '').replace(/\s+/g, ' ')}));
    ok(!r.open && /^Applied .+ Undo$/.test(r.bar), `AS-8 (guard): Apply closes the sheet and My Team shows "${r.bar}"`); await c.close(); }
  // AS-9: the sheet's height at 390 (screens of 844), as the mock-up's 4.27 (was 6.20); no text outside the sheet, nothing under 13px,
  //   tap targets 44px, at 320, 390 and 1440, light and dark (guard part passed before)
  { const bad = []; let scr = null, asOpt = false;
    for (const [W, dark] of [[320, 0], [390, 0], [390, 1], [1440, 0], [1440, 1]]) { const {q, c} = await openAS({W, dark: !!dark});
      const m = await q.evaluate(() => { const s = document.querySelector('.np-sheet'), sr = s.getBoundingClientRect(), out = [];
        for (const e of s.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (!r.width || e.closest('[inert]')) continue; if (r.right > sr.right + 1 || r.left < sr.left - 1) out.push('outside ' + (e.className || e.tagName));
          const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 13 && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) out.push('small ' + e.className + ' ' + fs);
          if (innerWidth < 700 && e.matches('button,a[href],summary') && (r.height < 43.5 || r.width < 43.5)) out.push('tap ' + (e.className || e.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
        return {h: s.scrollHeight, out: [...new Set(out)].slice(0, 4)}; });
      if (W === 390 && !dark) { scr = +(m.h / 844).toFixed(2); asOpt = await q.evaluate(() => /Optional swaps:/.test(document.body.innerText)); } m.out.forEach(x => bad.push(`${W}${dark ? ' dark' : ''}: ${x}`)); await c.close(); }
    /* with optional swaps the sheet lists them too: its own limit (Sim, Nov 18 evening: recommended; CI's frozen data measured 5.49) */
    ok(scr != null && scr <= (asOpt ? 5.75 : 5) && !bad.length, `AS-9 (Q5 C): the sheet is ${scr} phone screens at 390${asOpt ? ' (with optional swaps, limit 5.75)' : ''} (mock-up 4.27, before 6.20); ${bad.join(' | ') || 'nothing outside, under 13px or under 44px'}`); }
  // AS-10 / AS-11 (audit Nov 19, findings 2 and 3; rule C3, two statements that disagree). Both failed on the build before their fix.
  //   AS-10: My Team says "Nothing to fix" (the ±0 best swap hidden behind See All, Sim's A3) while the sheet opened as "1 suggestion"
  //   with no word that nothing needs fixing: the sheet now says My Team's own sentence above the same list.
  //   AS-11: with 5 of 6, the suggestion that fills the empty spot said "a small change: real games can't tell it apart from what you
  //   have" (the sideways-swap line, LANE.lineParts0): an add is not a swap, so no add says it.
  const fresh = async W => { const c = await b.newContext({viewport: {width: W, height: 844}}), q = await c.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
    await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2000);
    const st = () => q.waitForFunction(() => window.V2 && V2.plan && V2.plan.plans && V2.plan.key === V2.planKey() && !document.querySelector('#main .sg2-wait'), null, {timeout: 90000}).catch(() => {}).then(() => q.waitForTimeout(800));
    await st(); await sgTab(q); return {q, c, st}; };
  const NONE = 'Nothing to fix. Your team has every basic and no swap clearly beats it in real games.';
  { const {q, c} = await fresh(390); const mt = await T(q, '#tm-sg'); await q.evaluate(() => window.__ev('V2.openAllSugs()')); await q.waitForTimeout(1000);
    const fold = await q.evaluate(() => ((document.querySelector('#main .sg2-fold[data-v2fix] summary .s') || {}).textContent || '').trim());
    const r = await q.evaluate(() => ({n: document.querySelectorAll('.np-sheet .sga2 .tm-sug > li').length, eb: ((document.querySelector('.np-sheet .sga2 .np-eyebrow') || {}).textContent || ''), sh: (document.querySelector('.np-sheet .sga2') || {innerText: ''}).innerText.replace(/\s+/g, ' ')}));
    ok(mt.includes(NONE) && r.n >= 1 && r.sh.includes(NONE), `AS-10 (audit Nov 19 #2): My Team says "Nothing to fix" (${mt.includes(NONE)}) and the sheet, listing ${r.n} card(s) under "${r.eb}", says it too (${r.sh.includes(NONE)})`);
    /* W1b and W1c (Sim, Nov 19): beside "Nothing to fix" the sheet counts optional swaps, and Things to Know calls its weak spots minor */
    ok(new RegExp(`^${r.n} optional swaps?$`).test(r.eb.trim()), `W1b (Sim, Nov 19): beside "Nothing to fix" the sheet's count reads "${r.n} optional swap${r.n === 1 ? '' : 's'}" (it reads "${r.eb.trim()}")`);
    ok(/^(No weak spots|\d+ minor weak spots?),/.test(fold), `W1c (Sim, Nov 19): beside "Nothing to fix", Things to Know says "N minor weak spots" (it says "${fold}")`); await c.close(); }
  { const {q, c, st} = await fresh(390);
    await q.evaluate(() => window.__ev(`(() => { const i = S.slots.findIndex(s => s && s.n === 'Garchomp'); S.slots[i] = {n: '', a: null, lock: false}; persist(); render(); })()`)); await q.waitForTimeout(500); await st();
    const lines = sel => q.evaluate(s => [...document.querySelectorAll(s + ' .tm-sug > li')].filter(li => [...li.querySelectorAll('.tm-chg')].some(x => /^Add /.test(x.getAttribute('aria-label') || '')))
      .map(li => ((li.querySelector('.sg2-ln') || {}).textContent || '(no line)').replace(/\s+/g, ' ').trim()), sel);
    const mtL = await lines('#tm-sg'); await q.evaluate(() => window.__ev('V2.openAllSugs()')); await q.waitForTimeout(1000); const shL = await lines('.np-sheet .sga2'); const all = [...mtL, ...shL];
    const bad = all.filter(t => /tell it apart|no clear edge/.test(t) || !/^(Add fills your empty spot|Fix )/.test(t)); /* W1a (Sim, Nov 19): 'Add · fills your empty spot' (a Fix line stays) */
    ok(mtL.length >= 1 && shL.length >= 1 && !bad.length, `AS-11 (audit Nov 19 #3): with 5 of 6, ${mtL.length} My Team and ${shL.length} sheet card(s) fill the empty spot; none says it's a small change real games can't tell apart (${[...new Set(bad.length ? bad : all)].slice(0, 3).join(' | ')})`); await c.close(); } };
if (process.env.ONLY === 'AS') { await AS(); await b.close(); console.log(`v2-minors:${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0); }
// ---- AS end
// ---- MQ end ----
// ---- BR end (run with the rest just before the browser closes) ----
// ---- HQ begin: Home answers (Sim, Nov 18 morning questions, docs/rebuild/morning-questions-nov18.md: "recommend for all is good").
//   One check per answer applied; each failed on the build before its change. ONLY=HQ runs these alone.
const HQ = async () => {
  const hq = async (w, h, o = {}) => { const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700 && !o.desk, hasTouch: w < 700 && !o.desk, /* desk: a desktop window (classic scrollbar) */ reducedMotion: o.rm || 'no-preference'}); const q = await ctx.newPage();
    await q.addInitScript(o => { window.__PL_TEST = 1; try { if (sessionStorage.getItem('hq')) return; sessionStorage.setItem('hq', '1'); /* once: a reload keeps what the page saved */ if (o.fresh) localStorage.clear(); for (const [k, v] of Object.entries(o.ls || {})) localStorage.setItem(k, v); } catch (x) {} }, {fresh: !!o.fresh, ls: o.ls || {}});
    await q.goto('file://' + PAGE + (o.hash || '#home')); await q.waitForTimeout(o.wait || 2500); if (o.night) { await q.evaluate(() => V2.setTheme('night')); await q.waitForTimeout(300); }
    const r = o.fn ? await q.evaluate(o.fn) : null; if (o.keep) return {q, ctx, r}; await ctx.close(); return r; };
  // Q6 A: the hero's motion is on by default (no flag): the surge on arrival, the moving ticker with its pause button; reduced motion: none of it
  { const mo = []; for (const [w, h] of [[1440, 900], [390, 844]]) for (const rm of ['no-preference', 'reduce']) { const r = await hq(w, h, {rm, fn: () => { const S = document.querySelector('#main .sdh');
      return {surge: S.classList.contains('sdh-surge'), trk: !!S.querySelector('.sdh-trk'), pz: !!S.querySelector('.sdh-tpz'), run: S.getAnimations({subtree: true}).filter(a => a.animationName === 'sdh-mq' || a.playState === 'running').length}; }}); /* the marquee rests (paused) while off screen */
    const on = rm === 'no-preference'; if (on ? !(r.surge && r.trk && r.pz && r.run > 0) : (r.trk || r.pz || r.run)) mo.push(`${w} ${rm}: ${JSON.stringify(r)}`); }
    ok(!mo.length, `HQ Q6 (Sim: A): the hero's motion is on with no flag (surge on arrival, moving ticker + pause button at 1440 and 390); with reduced motion nothing moves and no marquee is built${mo.length ? ': ' + mo.join(' | ') : ''}`); }
  // Q13f B: the hero sprites (and tags) in front of the tagline never cover its words, 320-2560. Pixel test: A = no front layers, B = A
  // without the tagline (A != B is the tagline's ink), C = the page; covered = ink pixels where C != A. Up to 0.15% allowed: the anti-aliased
  // edge where a head touches the last line (before the change: 3.05-3.47% at 1280-2560, 0.63% at 412)
  { const cv = []; const cmp = await b.newPage();
    for (const w of [320, 360, 390, 412, 600, 820, 1100, 1280, 1440, 1920, 2560]) { const h = w < 700 ? 844 : w >= 1900 ? 1080 : 900;
      const {q, ctx} = await hq(w, h, {rm: 'reduce', keep: true}); await q.waitForFunction(() => [...document.querySelectorAll('#main .sdh-f img, #main .sdh-m img')].every(i => i.complete), null, {timeout: 15000}).catch(() => {}); await q.waitForTimeout(400);
      /* the pictures must have loaded: a broken image draws an icon and a frame, which this test would count as covering */
      const broken = await q.evaluate(() => [...document.querySelectorAll('#main .sdh-f img, #main .sdh-m img')].filter(i => !i.naturalWidth).length); if (broken) cv.push(`${w}: ${broken} hero pictures didn't load`);
      const r = await q.evaluate(() => { const x = document.querySelector('#main .sdh-h').getBoundingClientRect(); return {x: Math.max(0, x.left), y: Math.max(0, x.top - 20), width: Math.min(innerWidth, x.right) - Math.max(0, x.left), height: x.height + 60}; });
      const set = (f, t) => q.evaluate(([f, t]) => { for (const s of ['.sdh-herd', '.sdh-front', '.sdh-tags']) if (document.querySelector('#main ' + s)) document.querySelector('#main ' + s).style.visibility = f ? '' : 'hidden'; document.querySelector('#main .sdh-h').style.visibility = t ? '' : 'hidden'; }, [f, t]);
      /* Nov 19: the words are the letters themselves; the tagline's halo (Q19) or sticker outline (Q30) reaches 5-24px around them, and a
         front-row head near that edge is not on the words. All three shots take the letters without it (run 44568079657: 0.22-0.82% was halo) */
      await q.addStyleTag({content: '#main .sdh-h{text-shadow:none!important;filter:none!important;-webkit-text-stroke:0!important}#main .sdh-chv{display:none!important}'});
      const sh = async () => (await q.screenshot({clip: r})).toString('base64'); const C = await sh(); await set(false, true); const A = await sh(); await set(false, false); const B = await sh(); await ctx.close();
      const x = await cmp.evaluate(async ([A, B, C]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); r(g.getImageData(0, 0, i.width, i.height).data); }; i.src = 'data:image/png;base64,' + s; });
        const [a, bb, c] = await Promise.all([ld(A), ld(B), ld(C)]), d = (p, q, i) => Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]); let m = 0, k = 0;
        for (let i = 0; i < a.length; i += 4) if (d(a, bb, i) > 60) { m++; if (d(c, a, i) > 60) k++; } return {m, pct: +(100 * k / Math.max(1, m)).toFixed(2)}; }, [A, B, C]);
      if (x.m < 5000 || x.pct > 0.15) cv.push(`${w}: ${x.pct}% of ${x.m} tagline pixels covered`); }
    await cmp.close(); ok(!cv.length, `HQ Q13f (Sim: B): the hero sprites never cover the tagline's words, 320-2560 (0.15% of its pixels at most: a head's edge touching the line)${cv.length ? ': ' + cv.join(' | ') : ''}`); }
  // Q13e A: every "›" link or button on Home answers a tap anywhere in a 44px band through its middle, links inside a sentence too
  { const ch = []; for (const w of [390, 1440]) { const r = await hq(w, 900, {rm: 'reduce', fn: async () => { const out = []; for (const e of document.querySelectorAll('#main a, #main button')) { if (!/›\s*$/.test(e.textContent) || !e.getClientRects().length || e.closest('[aria-hidden="true"]')) continue;
      e.scrollIntoView({block: 'center'}); await new Promise(r => setTimeout(r, 40)); const x = e.getBoundingClientRect(), cx = x.left + x.width / 2, cy = x.top + x.height / 2;
      const hit = dy => { const t = document.elementFromPoint(cx, cy + dy); return !!t && (t === e || e.contains(t)); }; if (!(hit(-21) && hit(21))) out.push(`"${e.textContent.trim()}" ${Math.round(x.height)}px`); } return out; }});
    for (const x of r) ch.push(w + ': ' + x); }
    ok(!ch.length, `HQ Q13e (Sim: A): every "›" link on Home has a 44px tap area, inside a sentence too${ch.length ? ': ' + ch.join(' | ') : ''}`); }
  // Sim (Nov 18, from his iPhone: "remove the incineroar and kingambit tags. its too much"; then desktop's too): no small dark name tag in
  // the hero at any width; only the white plates name Pokémon there, and the next six by rating stay named buttons (plate or ticker)
  { const tg = []; for (const w of [320, 390, 600, 699, 820, 1100, 1440, 1920, 2560]) { const r = await hq(w, w < 700 ? 844 : 900, {fn: () => window.__ev(`(() => {
      const S = document.querySelector('#main .sdh'), dark = [...S.querySelectorAll('.sdh-tag, .sdh-tags > *')].filter(e => e.getClientRects().length && !e.hidden).map(e => e.innerText.replace(/\\s+/g, ' ').trim());
      const R = V2.sdhRows().slice(0, 6), named = R.filter(x => [...S.querySelectorAll('.sdh-plate[data-v2mon], .sdh-tick ul:not([aria-hidden]) li:not([hidden]) button[data-v2mon]')].some(b => b.dataset.v2mon === x.n && b.getAttribute('aria-label'))).length;
      return JSON.stringify({dark, named}); })()`)}).then(x => JSON.parse(x)); if (r.dark.length || r.named < 6) tg.push(`${w}: ${JSON.stringify(r)}`); }
    ok(!tg.length, `HQ tags (Sim, Nov 18): no dark name tag in the hero at 320-2560; the six highest rated stay named buttons (white plates, then the ticker)${tg.length ? ': ' + tg.join(' | ') : ''}`); }
  // Q4c A: the first-visit welcome (HOME-12) is in the six band under the sample-team note, headed "New here?", with the three steps,
  // Copy a Top Team (Winning Teams) and Got It; Got It hides it for good; a returning visitor never sees it; nothing spills, 320-1440
  { const wl = []; for (const w of [320, 390, 820, 1440]) { const {q, ctx} = await hq(w, 900, {rm: 'reduce', fresh: true, keep: true});
      const r = await q.evaluate(() => { const c = document.querySelector('#main .sds-line .sds-wl'); if (!c) return {none: 1}; const prev = c.previousElementSibling, R = c.getBoundingClientRect(), bad = [];
        for (const e of c.querySelectorAll('*')) { if (!e.getClientRects().length) continue; const x = e.getBoundingClientRect(); if (x.right > R.right + 1 || x.left < R.left - 1) bad.push(e.textContent.trim().slice(0, 20)); if (parseFloat(getComputedStyle(e).fontSize) < 13) bad.push('small'); }
        return {after: prev && prev.className, h: (c.querySelector('h3') || {}).textContent, steps: [...c.querySelectorAll('li b')].map(b => b.textContent).join('|'), copy: (c.querySelector('a[data-hmwelcome]') || {}).getAttribute && c.querySelector('a[data-hmwelcome]').getAttribute('href'),
          got: !!c.querySelector('button[data-hmwelcome]'), taps: [...c.querySelectorAll('a,button')].every(e => e.getBoundingClientRect().height >= 44), bad, hs: document.documentElement.scrollWidth - innerWidth}; });
      let gone = null; if (!r.none) { for (let k = 0; k < 3; k++) { const g = q.locator('#main .sds-wl button[data-hmwelcome]'); if (!(await g.count())) break; await g.click(); await q.waitForTimeout(500); } /* again if a late data redraw swallowed the tap (shared machine) */
        /* "for good": the key is saved, and the page drawn again from it (not a reload: the kit's once-only clear can't tell a reload from a first visit) */
        gone = await q.evaluate(() => { const k = localStorage.getItem('cc2.welcomed'); V2.redraw(); return !!k && !document.querySelector('#main .sds-wl') || 'key ' + k; }); }
      await ctx.close();
      if (r.none || r.after !== 'sds-note' || r.h !== 'New here?' || r.steps !== 'Get a team|Read your Strength Score|Plan each match' || r.copy !== '#tournaments' || !r.got || !r.taps || r.bad.length || r.hs > 0 || gone !== true) wl.push(`${w}: ${JSON.stringify({...r, gone})}`); }
    const back = await hq(1440, 900, {ls: {'cc2.welcomed': '"1"'}, fn: () => !!document.querySelector('#main .sds-wl')}); if (back) wl.push('a returning visitor sees it');
    ok(!wl.length, `HQ Q4c (Sim: A, "New here?"): the first-visit welcome sits in the six band under the sample note (three steps, Copy a Top Team, Got It hides it for good), never for a returning visitor, nothing spills 320-1440${wl.length ? ': ' + wl.join(' | ').slice(0, 600) : ''}`); }
  // Q4d A: What's New (HOME-13) is a paper slip in the post band, after an update only (never a first visit), its items in the word list
  // (no "scouting report", "meta threats", "win odds"); open on wide screens, a fold on phones; × hides it for good; nothing spills
  { const nw = [], upd = {'cc2.welcomed': '"1"', 'cc2.seenNew': '"2020-01-01"'};
    for (const w of [320, 390, 820, 1440]) { const {q, ctx} = await hq(w, 900, {rm: 'reduce', ls: upd, keep: true});
      const r = await q.evaluate(() => { const c = document.querySelector('#main .sdp .sdp-top + .sdp-nw'); if (!c) return {none: 1}; c.scrollIntoView(); const R = c.getBoundingClientRect(), bad = [], d = c.querySelector('details');
        for (const e of c.querySelectorAll('*')) { if (!e.getClientRects().length) continue; const x = e.getBoundingClientRect(); if (x.right > R.right + 1 || x.left < R.left - 1) bad.push('out ' + e.textContent.trim().slice(0, 16)); if (e.children.length === 0 && parseFloat(getComputedStyle(e).fontSize) < 13) bad.push('small'); }
        const tx = c.textContent; return {n: c.querySelectorAll('li').length, open: d.open, old: /scouting report|meta threats|win odds|ready for/i.test(tx), x: c.querySelector('[data-hmnewx]').getBoundingClientRect().height, bad, hs: document.documentElement.scrollWidth - innerWidth}; });
      let gone = null; if (!r.none) { await q.click('#main .sdp-nw [data-hmnewx]'); await q.waitForTimeout(300); gone = await q.evaluate(() => { sessionStorage.removeItem('np.wnew'); V2.redraw(); return !document.querySelector('#main .sdp-nw') && JSON.parse(localStorage.getItem('cc2.seenNew') || '""') === V2.SD_NEW.id; }); }
      await ctx.close(); if (r.none || r.n !== 7 /* Sim Q77, Nov 20: the final 7 items (was 5) */ || r.open !== (w >= 700) || r.old || r.x < 44 || r.bad.length || r.hs > 0 || !gone) nw.push(`${w}: ${JSON.stringify({...r, gone})}`); }
    const first = await hq(1440, 900, {fresh: true, fn: () => !!document.querySelector('#main .sdp-nw')}); if (first) nw.push('a first-time visitor sees it');
    ok(!nw.length, `HQ Q4d (Sim: A, reworded): What's New is a paper slip in the post band after an update (7 items, Sim's final words, Q77 Nov 20, open on wide screens, a fold on phones), × hides it for good, never on a first visit${nw.length ? ': ' + nw.join(' | ').slice(0, 600) : ''}`); }
  // Q4a A: HOME-04's data line lives on the Usage page: with the Showdown ladder chosen, its source line names the month and says when the
  // next month's numbers arrive (". November's numbers arrive Dec 1."), only until that date; the other sources don't say it
  { const r = await hq(1440, 900, {hash: '#usage', keep: true}); const q = r.q; const line = async k => { await q.click(`[data-ussrc="${k}"]`); await q.waitForTimeout(500); return q.evaluate(() => (document.querySelector('#main .us-src') || {}).textContent || ''); };
    const lad = await line('ladder'), tour = await line('tour'), want = await q.evaluate(() => JSON.parse(window.__ev(`(() => { const d = META.doubles, m = /^(\\d{4})-(\\d{2})/.exec(d && d.period || ''); return JSON.stringify({now: V2.usNext ? V2.usNext(d) : 'no V2.usNext', early: m && V2.usNext ? V2.usNext(d, Date.UTC(+m[1], +m[2] - 1, 20)) : ''}); })()`)));
    await r.ctx.close();
    ok(/^. [A-Z][a-z]+'s numbers arrive [A-Z][a-z]{2} \d{1,2}\.$/.test(want.early) && lad.endsWith(want.now) && /[A-Z][a-z]{2} \d{4}/.test(lad) && !/numbers arrive/.test(tour), `HQ Q4a (Sim: A): the Usage page's Showdown ladder line names its month and when the next arrives (HOME-04 moved from Home) ("${lad}"; tournaments: "${tour}"; ${JSON.stringify(want)})`); }
  // Q4b B: HOME-05's rating moves live on This Week as "Ratings on the Move", under "Pokémon on the Move": every mover (V2.homeWeek(12)), each
  // a button to its page whose words read name, arrow + points, up/down, rating; tiles keep their words inside at 320-1440
  { const rm = []; for (const w of [320, 390, 820, 1440]) { const r = await hq(w, 900, {hash: '#weekly', rm: 'reduce', fn: () => JSON.parse(window.__ev(`(() => { const s = document.querySelector('#main .wk-move + .wk-rm'), want = V2.homeWeek(12);
      if (!s) return JSON.stringify({none: 1}); const T = [...s.querySelectorAll('.wk-rc')], bad = [];
      for (const b of T) { const B = b.getBoundingClientRect(); for (const e of b.querySelectorAll('span,b,small')) { if (!e.getClientRects().length) continue; const x = e.getBoundingClientRect(); if (x.right > B.right + 1 || x.left < B.left - 1 || x.bottom > B.bottom + 1) bad.push('out ' + e.textContent.trim().slice(0, 16)); if (parseFloat(getComputedStyle(e).fontSize) < 13) bad.push('small'); }
        if (B.height < 44) bad.push('tap ' + B.height); if (!/^.+ [▲▼] \\d+ (up|down) Rating \\d+$/.test(b.innerText.replace(/\\s+/g, ' ').trim())) bad.push('words ' + b.innerText.replace(/\\s+/g, ' ')); }
      return JSON.stringify({n: T.length, want: want.length, same: T.map(b => b.dataset.v2mon).join() === want.map(x => x.n).join(), bad: bad.slice(0, 3), hs: document.documentElement.scrollWidth - innerWidth}); })()`))});
      if (r.none || !r.n || r.n !== r.want || !r.same || r.bad.length || r.hs > 0) rm.push(`${w}: ${JSON.stringify(r)}`); }
    ok(!rm.length, `HQ Q4b (Sim: B): This Week shows "Ratings on the Move" under "Pokémon on the Move": every rating mover as a button (name, arrow + points, up/down, rating), nothing spills 320-1440${rm.length ? ': ' + rm.join(' | ') : ''}`); }
  // Q7a B: the hero crowd comes from 4 sprite sheets at 128px, except the 35 nearest (highest rated), which keep their own 384px file; every
  // Pokémon is still drawn, and Home asks for far fewer picture files (before: 345-359 at 1440, after: about 60)
  { const sh = []; for (const [w, h] of [[1440, 900], [390, 844]]) { const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: w < 700}); const q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
      const seen = new Set(); q.on('request', r => { if (/\.webp/.test(r.url())) seen.add(r.url()); }); await q.goto('file://' + PAGE + '#home');
      await q.waitForFunction(() => document.querySelectorAll('#main .sdh-c').length > 0, null, {timeout: 20000}).catch(() => {}); await q.waitForTimeout(1500);
      const r = await q.evaluate(async () => { const C = [...document.querySelectorAll('#main .sdh-c')], cs = C.filter(e => e.classList.contains('sdh-cs')), im = C.filter(e => e.tagName === 'IMG');
        const urls = [...new Set(cs.map(e => (/url\("?([^")]+)"?\)/.exec((e.firstElementChild || e).style.backgroundImage) || [])[1]).filter(Boolean))];
        const loads = await Promise.all(urls.map(u => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth > 0); i.onerror = () => r(false); i.src = u; })));
        const near = im.map(e => +e.dataset.sdhi).sort((a, b) => a - b), far = Math.min(...cs.map(e => +e.dataset.sdhi));
        const bad = cs.filter(e => !e.hidden && (!(e.firstElementChild || e).style.backgroundImage || !(parseFloat(e.style.width) > 0))).length;
        return {crowd: C.length, herd: V2.sdhRows().length, sheet: cs.length, img: im.length, near0: near[0], nearN: near[near.length - 1], far, sheets: urls.length, loaded: loads.every(Boolean), bad}; });
      r.files = seen.size; await ctx.close();
      if (r.crowd !== r.herd - 12 || r.img !== 35 || r.near0 !== 12 || r.nearN !== 46 || r.far !== 47 || r.sheet !== r.crowd - 35 || r.sheets < 1 || r.sheets > 4 || !r.loaded || r.bad || r.files > 80) sh.push(`${w}: ${JSON.stringify(r)}`); }
    ok(!sh.length, `HQ Q7a (Sim: B): the hero crowd draws the 35 nearest from their own files and the rest from at most 4 sprite sheets (every Pokémon drawn, 80 picture files at most on Home)${sh.length ? ': ' + sh.join(' | ') : ''}`); }
  // Polish (Sim: "clean and refined"): the two hero buttons keep their words on one line in a narrow DESKTOP window too (Windows app,
  // classic scrollbar: the page is 15-17px narrower than the window, so a width rule keyed to the window missed; "Build Me a Team" broke at 390)
  { const pb = []; for (const w of [360, 375, 390, 404, 412, 430, 520]) { const r = await hq(w, 800, {rm: 'reduce', desk: true, fn: () => [...document.querySelectorAll('#main .sdh-go a')].map(e => { const t = e.querySelector('span') || e, rg = document.createRange(); rg.selectNodeContents(t);
      return {n: e.textContent.trim(), lines: new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size, top: Math.round(e.getBoundingClientRect().top), fs: parseFloat(getComputedStyle(e).fontSize)}; }).concat([{sb: innerWidth - document.documentElement.clientWidth}])});
      const sb = r.pop().sb; for (const x of r) { if (x.lines > 1) pb.push(`${w} (scrollbar ${sb}px): "${x.n}" on ${x.lines} lines`); if (x.fs < 13) pb.push(`${w}: ${x.fs}px`); } }
    ok(!pb.length, `HQ polish 1: the hero's Score My Team / Build Me a Team keep one line each in a desktop window with a classic scrollbar, 360-520${pb.length ? ': ' + pb.join(' | ') : ''}`); }
  // Shorter phone Home, Post X (Sim, Nov 18): under 700 the post band shows one parcel (the soonest-ending gift) and the Dispatch with its
  // masthead, lead story and Next event; no stamps, no second slip, no more stories. 700 and wider keep everything
  { const px = []; for (const [w, phone] of [[360, 1], [390, 1], [430, 1], [699, 1], [700, 0], [1440, 0]]) { const r = await hq(w, 900, {rm: 'reduce', fn: () => { const s = document.querySelector('#main .sdp'), vis = q => [...s.querySelectorAll(q)].filter(e => e.getClientRects().length).length;
      return {parcel: vis('.pr-parcel'), stamps: vis('.sdp-stamps'), other: vis('.sdp-other'), more: vis('.dp-more'), name: vis('.dp-name, .dp-mast'), bar: vis('.dp-nbar'), all: [...s.querySelectorAll('.sdp-all')].filter(e => e.getClientRects().length).length, h: Math.round(s.getBoundingClientRect().height), hs: document.documentElement.scrollWidth - innerWidth}; }});
      const okp = phone ? r.parcel === 1 && !r.stamps && !r.other && !r.more : r.parcel >= 1 && (r.stamps || r.other || r.more); if (!okp || r.all !== 2 || r.hs > 0) px.push(`${w}: ${JSON.stringify(r)}`); }
    ok(!px.length, `HQ Post X (Sim, Nov 18): phone Home's post band is one parcel and the front page (no stamps, second slip or more stories) under 700; 700+ unchanged; both "All ›" links stay${px.length ? ': ' + px.join(' | ') : ''}`); }
  // Sim (Nov 18): Team Preview Practice takes Test Run's small plate (700-2560): its picture is a team preview of live Pokémon (six, two rows
  // of three, 44px+) with "Pick 4"; the small plates' rows stay even (same top and height, full rows); Test Run is in More tools
  { const pr = []; for (const w of [1100, 1440, 1920, 2560]) { const r = await hq(w, 900, {rm: 'reduce', fn: () => JSON.parse(window.__ev(`(() => { const s = document.querySelector('#main .sdt');
      const sm = [...s.querySelectorAll('.sdt-grid > .sdt-sm')].filter(e => e.getClientRects().length), names = sm.map(e => e.querySelector('.sdt-go').textContent);
      const rows = {}; for (const e of sm) { const b = e.getBoundingClientRect(); (rows[Math.round(b.top / 4)] = rows[Math.round(b.top / 4)] || []).push(Math.round(b.height)); }
      const pp = s.querySelector('.sdt-pr .sdt-pp'), st = pp ? [...pp.querySelectorAll('.np-mon .st')].map(e => Math.round(e.getBoundingClientRect().width)) : [];
      const want = (META.events ? homeChamp() : null), six = want ? want.six.map(x => x.p.n).join() : '';
      return JSON.stringify({names: names.join('|'), rows: Object.values(rows), sprites: st.length, small: st.length ? Math.min(...st) : 0, pick: pp ? (pp.querySelector('.sdt-pick') || {}).textContent : '',
        live: !six || !!pp && [...pp.querySelectorAll('.np-mon')].length === 6, test: [...s.querySelectorAll('.sdt-more a')].some(a => a.getAttribute('href') === '#gauntlet' && a.getClientRects().length),
        prMore: [...s.querySelectorAll('.sdt-more a')].some(a => a.getAttribute('href') === '#practice')}); })()`))});
      const even = r.rows.every(h => h.length === r.rows[0].length && Math.max(...h) - Math.min(...h) <= 2);
      if (r.names !== 'Winning Cores|Archetypes|Team Preview Practice|Popular Sets' || !even || r.sprites !== 6 || r.small < 44 || r.pick !== 'Pick 4' || !r.test || r.prMore) pr.push(`${w}: ${JSON.stringify(r)}`); }
    ok(!pr.length, `HQ Practice plate (Sim, Nov 18): Team Preview Practice takes Test Run's small plate at 1100-2560 (team preview of six live Pokémon, 44px+, "Pick 4"), the small plates' rows stay even, Test Run is in More tools${pr.length ? ': ' + pr.join(' | ').slice(0, 700) : ''}`); }
  // Shorter phone Home, Tools B with Practice (Sim, Nov 18): under 700 six big plates in order (Speed Tiers, Ratings, Damage Calc, Battle,
  // Team Preview Practice, Winning Teams) and six picture chips (Type Chart, Winning Cores, Archetypes, Popular Sets, Events, How We
  // Calculate), names whole inside, 44px+; all 18 of Home's tools reachable on screen; 700+ keeps its twelve plates and no chips
  { const tb = []; for (const [w, phone] of [[320, 1], [360, 1], [390, 1], [430, 1], [699, 1], [700, 2], [820, 2], [1099, 2], [1100, 0], [1440, 0]]) { const r = await hq(w, 900, {rm: 'reduce', fn: () => { const s = document.querySelector('#main .sdt'), vis = e => !!e.getClientRects().length;
      const plates = [...s.querySelectorAll('.sdt-grid > .sdt-p')].filter(vis).sort((a, b) => (a.getBoundingClientRect().top - b.getBoundingClientRect().top) || (a.getBoundingClientRect().left - b.getBoundingClientRect().left)).map(e => e.querySelector('.sdt-go').textContent);
      const chips = [...s.querySelectorAll('.sdt-chp')].filter(vis), bad = [];
      for (const c of chips) { const B = c.getBoundingClientRect(), t = c.querySelector('b:last-child'), rg = document.createRange(); rg.selectNodeContents(t); for (const x of rg.getClientRects()) if (x.right > B.right - 4 || x.left < B.left) bad.push(t.textContent + ' out'); if (B.height < 44) bad.push(t.textContent + ' ' + Math.round(B.height) + 'px'); }
      const reach = new Set([...s.querySelectorAll('a[href^="#"]')].filter(vis).map(a => a.getAttribute('href')));
      return {plates: plates.join('|'), chips: chips.map(c => c.textContent.trim().replace(/^[\d,]+\s*/, '')).join('|'), bad, reach: (V2.HOME_TOOLS || []).filter(([, , to]) => !reach.has('#' + to)).map(x => x[0]), hs: document.documentElement.scrollWidth - innerWidth}; }});
      const want = phone === 2 ? r.plates === 'Speed Tiers|Ratings|Damage Calculator|Battle|Team Preview Practice|Winning Teams|Type Chart|Winning Cores|Archetypes|Popular Sets' && !r.chips
        : phone ? r.plates === 'Speed Tiers|Ratings|Damage Calculator|Battle|Team Preview Practice|Winning Teams' && r.chips === 'Type Chart|Winning Cores|Archetypes|Popular Sets|Events|How We Calculate'
        : r.plates.split('|').length >= 10 && !r.chips; if (!want || r.bad.length || r.reach.length || r.hs > 0) tb.push(`${w}: ${JSON.stringify(r)}`); }
    const h = await hq(390, 844, {rm: 'reduce', ls: {'cc2.welcomed': '"1"'}, fn: () => { const n = document.querySelector('#main .sdp-nw'); if (n) n.remove(); return document.documentElement.scrollHeight; }}); const scr = +(h / 844).toFixed(2); /* a returning visitor who has seen What's New (the first-visit welcome and the What's New slip add their own height) */
    // iPad (Sim, Nov 18): the phone's six plates plus the Type Chart strip and three picture plates ('too plain' with chips): 7,141px at 820, against 8,180 with twelve plates
    { const hi = await hq(820, 1180, {rm: 'reduce', ls: {'cc2.welcomed': '"1"'}, fn: () => { const n = document.querySelector('#main .sdp-nw'); if (n) n.remove(); return document.documentElement.scrollHeight; }}); if (hi > 7300) tb.push(`iPad Home at 820 is ${hi}px (7,300 at most)`); }
    /* Nov 19: Sim's Q23 A adds a plain line under two Home headlines (phone Home 7.04 -> 7.24 screens, measured); Home is exempt from the
       short-pages rule (Sim, Nov 19), so the limit follows the approved copy */
    ok(!tb.length && scr <= 7.3, `HQ Tools B (Sim, Nov 18): phone Home shows six big plates (Speed Tiers, Ratings, Damage Calculator, Battle, Team Preview Practice, Winning Teams) and six picture chips, every tool on screen; iPads (700-1099, Sim Nov 18) the same six, then Type Chart as a strip and Cores | Archetypes | Sets as plates, no chips; 1100+ keeps twelve plates; phone Home at 390 is ${scr} screens (7.3 at most)${tb.length ? ': ' + tb.join(' | ').slice(0, 700) : ''}`); }
  // Polish 2: the Practice plate's team preview is no taller than it needs to be, so its row neighbours keep no big empty band between
  // their picture and their words (110px at most, 700-2560; the Practice plate as first built left 154-172px at 820 and 1920)
  { const gp = []; for (const w of [700, 820, 1024, 1100, 1440, 1920, 2560]) { const r = await hq(w, 900, {rm: 'reduce', fn: () => [...document.querySelectorAll('#main .sdt-grid > .sdt-sm')].map(p => [p.querySelector('.sdt-go').textContent, Math.round(p.querySelector('.sdt-tx').getBoundingClientRect().top - p.lastElementChild.getBoundingClientRect().bottom)])});
      for (const [n, g] of r) if (g > 110) gp.push(`${w} ${n}: ${g}px`); }
    ok(!gp.length, `HQ polish 2: no small tools plate has an empty band over 110px between its picture and its words, 700-2560 (iPads show Cores, Archetypes and Sets as plates again, Sim Nov 18)${gp.length ? ': ' + gp.join(' | ') : ''}`); }
};
if (process.env.ONLY === 'HQ') { await HQ(); await b.close(); console.log(`v2-minors:${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0); }
// ---- HQ end (run with the rest just before the browser closes) ----
if (part('main1')) {
await p.goto('file://' + PAGE + '#build'); await p.waitForTimeout(2500);
await p.getByRole('button', {name: 'Build Me a Team'}).first().click();
await p.waitForSelector('[data-bdcopy]', {timeout: 30000}).catch(() => {});
const has = await p.$('[data-bdcopy]');
ok(!!has, 'Build made a team with its Copy and Save buttons');
const lab = await p.evaluate(() => ({core: document.querySelectorAll('.bp-core').length, roles: [...document.querySelectorAll('.bp-role')].map(e => e.textContent.trim()).filter(t => t && t !== '\u00a0')}));
{ const tx = await p.evaluate(() => document.querySelector('#main').innerText); ok(!/Best core/.test(tx), `Sim (Nov 17): Build says "Best trio", not "Best core" (${(tx.match(/Best (core|trio)[^\n]{0,24}/) || ['none'])[0]})`); }
ok(lab.core === 0 && lab.roles.length === 0, `Sim (Nov 17): Build's team cards carry no Core badge and no role heading (${JSON.stringify(lab)})`);
/* Q13d (Sim, Nov 18, B): the Megas tip and the proven-team note are back on the Blueprint. The tip's numbers are read from the data:
   the event-winner share is re-counted here from META.events, and a made-up results.megaN must change the tournament share
   (so a number typed into the page would fail); the note follows the proven record (this exact six, 55%+ wins), not the option */
/* Nov 20: The Plot (Sim locked; approved picture docs/rebuild/pics/nov20/Q99/Q99-A-390.png): the Megas tip moved from the Blueprint's
   Spec to the "Megas on team" helper column under the plot sentence (before a build), and it gives the event-winner share only. The same
   strength: the share is re-counted here from META.events, a made-up winners list (14 of 20 with 2 Megas) must show 70%, and fewer than
   20 winners must drop the number (so a number typed into the page would fail). The proven-team note check below is unchanged. */
{ const q13 = await p.evaluate(() => window.__ev(`(() => { const tip = () => { const d = document.createElement('div'); d.innerHTML = V2.plotHelp();
      const c = [...d.querySelectorAll('.pl-hc')].find(x => /^Megas on team/.test((x.querySelector('b') || {}).textContent || '')); return c ? c.querySelector('p').textContent : ''; };
    const EV = META.events, keep = EV.events, two = t => t.mons.filter(m => byName.get(m.n).m).length === 2;
    const win = (keep || []).map(e => e.top && e.top[0]).filter(t => t && t.place === 1 && t.mons && t.mons.length === 6 && t.mons.every(m => byName.get(m.n)));
    const wpct = pctFmt(100 * win.filter(two).length / win.length), A = win.find(two), B = win.find(t => !two(t));
    const t0 = tip(); let t1 = 'no team with and without 2 Megas to make a split from';
    if (A && B) { EV.events = [...Array(20)].map((_, i) => ({top: [i < 14 ? A : B]})); t1 = tip(); }
    EV.events = (keep || []).slice(0, 0); const t2 = tip(); EV.events = keep;
    const t = abTeam('doubles'), pv = t.proven, note = () => !!document.querySelector('#main .bd-prov');
    t.proven = {n: 5, wr: .6, g: 80, swapped: false}; V2.redraw(); const n1 = note(); t.proven.swapped = true; V2.redraw(); const n2 = note();
    t.proven = {n: 5, wr: .52, g: 80, swapped: false}; V2.redraw(); const n3 = note(); t.proven = null; V2.redraw(); const n4 = note(); t.proven = pv; V2.redraw();
    const nt = (document.querySelector('#main .bd-prov') || {}).textContent || null;
    return {wpct, n: win.length, t0, t1, t2, n1, n2, n3, n4, now: pv ? {wr: pv.wr, swapped: pv.swapped, note: nt} : null}; })()`));
  ok(q13.n >= 20 && q13.t0 === `${q13.wpct} of event winners carry 2 Mega options. Only one can Mega Evolve per battle.`
    && q13.t1 === '70% of event winners carry 2 Mega options. Only one can Mega Evolve per battle.' && q13.t2 === 'Only one can Mega Evolve per battle.',
    `Q13d: the Megas tip counts its numbers from the data (winners ${q13.wpct} of ${q13.n}; a made-up 14-of-20 list shows 70%, under 20 winners drops the number) (${JSON.stringify([q13.t0, q13.t1, q13.t2])})`);
  ok(q13.n1 && !q13.n2 && !q13.n3 && !q13.n4 && (!q13.now || (q13.now.note === 'This exact team has won at real events. Treat these as optional tweaks, not problems.') === (!q13.now.swapped && q13.now.wr >= .55)),
    `Q13d: the proven-team note shows for this exact six at 55%+ wins only (exact 60%: ${q13.n1}, 1 swap: ${q13.n2}, 52%: ${q13.n3}, new: ${q13.n4}; option shown: ${JSON.stringify(q13.now)})`); }
const toastAfter = async fn => { await p.evaluate(() => document.querySelectorAll('.np-toast').forEach(t => t.remove())); await fn(); await p.waitForTimeout(500);
  return p.evaluate(() => [...document.querySelectorAll('.np-toast')].map(t => t.textContent).join(' | ')); };
if (has) {
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => true; });
  const t1 = await toastAfter(() => p.click('[data-bdcopy]'));
  ok(/copied/i.test(t1), `A1-M2: with the clipboard API blocked, Copy still copies through the fallback (toast: ${t1.slice(0, 60)})`);
  await p.evaluate(() => window.__ev('V2.canStore = false'));
  const t2 = await toastAfter(() => p.click('[data-bdsave]'));
  ok(/for this visit/.test(t2), `A1-M3: Save says "for this visit" when the browser can't keep it (toast: ${t2.slice(0, 80)})`);
  const m4 = await p.evaluate(() => window.__ev(`(() => { const g = CH.gradeOf; CH.gradeOf = () => { throw new Error('test'); }; try { V2.redraw(); } finally { CH.gradeOf = g; } const b = document.querySelector('#app .bd-alt-sc b, #app .np-score b'); const t = b ? b.textContent.trim() : 'none'; V2.redraw(); return t; })()`));
  ok(m4 === '–' || m4 === 'none', `A1-M4: if the score can't be worked out, Build shows "–", not the builder's own number (${m4})`); }
await p.goto('file://' + PAGE + '#meta'); await p.waitForTimeout(2500);
const im = await p.evaluate(() => { const i = [...document.querySelectorAll('img[src*=".webp"]')]; return {n: i.length, a: i.filter(x => x.decoding === 'async').length}; });
ok(im.n > 0 && im.a === im.n, `B-I6 (part): every sprite decodes off the main thread (${im.a} of ${im.n} on Meta)`);
const m8 = await p.evaluate(() => window.__ev(`(() => { V2.ql.opp = ['Charizard']; const b = document.createElement('button'); b.dataset.ygopp = 'Charizard-Mega-Y'; document.body.append(b); b.click(); b.remove(); return V2.ql.opp.join(','); })()`));
ok(m8 === 'Charizard', `A1-M8: Their Team in the game log takes one of each Pokémon (Charizard, then Mega Charizard Y: ${m8})`);
const m6 = await p.evaluate(() => window.__ev(`(() => { const T = META.teams && META.teams.teams; if (!T || !T.length) return 'no teams'; const keep = T[0].mons; T[0].mons = [...keep.slice(0, 5), 'Notamon']; const b = document.createElement('button'); b.dataset.wtvs = '0'; document.body.append(b); b.click(); b.remove(); T[0].mons = keep; return S.opp.filter(Boolean).join(','); })()`));
ok(!/Notamon/.test(m6), `A1-M6: an unknown name from a winning team never reaches their six (${m6.slice(0, 60)})`);
const m7 = await p.evaluate(() => window.__ev(`(() => { const keep = S.log; S.log = [{r: 'W', t: 0, b: [], o: []}, {r: 'L', t: 0, b: [], o: []}, {r: 'W', t: 5, b: [], o: []}];
  const b = document.createElement('button'); b.dataset.btldel = '0'; document.body.append(b); b.click(); b.remove(); const n = S.log.length; S.log = keep; persist(); return n; })()`));
ok(m7 === 2, `A1-M7: deleting one game removes one game, even when old games share no time (${m7} of 3 left)`);
await p.evaluate(() => window.__ev(`(() => { window.__cxi = cxInfo; cxInfo = () => { throw new Error('test'); }; V2.cxGo('cur', 't:0'); location.hash = '#compare'; })()`)); await p.waitForTimeout(2500);
const m9 = await p.evaluate(() => window.__ev(`(() => { const t = (document.querySelector('#app .cx2') || {}).textContent || ''; cxInfo = window.__cxi; return {busy: !!V2.cxBusy, msg: /couldn't be worked out/.test(t), working: /Working out both teams/.test(t)}; })()`));
ok(!m9.busy && m9.msg && !m9.working, `A1-M9: Compare stops and says so when a team can't be worked out (${JSON.stringify(m9)})`);
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
const a7 = await p.evaluate(() => window.__ev(`(() => { const n0 = S.slots.filter(s => s.n).length; keepUndo(); const gone = S.slots[0].n; S.slots[0] = blank(); render(); toast('Removed ' + gone, true);
  const s1 = S.slots.find(s => s.n); s1.a = (byName.get(s1.n).a || []).find(a => a !== s1.a) || s1.a; s1.lock = !s1.lock; render(); /* an unrelated change after it */
  const u = document.querySelector('#toastUndo'); if (!u) return 'no undo button'; u.click(); return {back: S.slots[0].n === gone, n: S.slots.filter(s => s.n).length, n0}; })()`));
ok(a7 && a7.back === false, `A2-M7: a toast's Undo doesn't roll back a later, unrelated change (${JSON.stringify(a7)})`);
const m5 = await p.evaluate(() => window.__ev(`(() => { activePerf(); const k1 = perfCache.key, now = Date.now; Date.now = () => now() + 3 * 864e5; try { activePerf(); return k1 !== perfCache.key; } finally { Date.now = now; } })()`));
ok(m5, 'A2-M5: the ratings data in use is re-checked for age each day, not only when data arrives');
const a8 = await p.evaluate(() => window.__ev(`(() => { const keep = Object.assign({}, DATA_AT); for (const k in DATA_AT) delete DATA_AT[k];
  DATA_AT.results = Date.parse('2026-11-01T12:00:00'); DATA_AT.teams = Date.parse('2026-11-01T12:00:00'); DATA_AT.track = Date.now(); const t = dataDateText();
  for (const k in DATA_AT) delete DATA_AT[k]; Object.assign(DATA_AT, keep); return t; })()`));
ok(/Nov 1\b/.test(a8), `A2-M8: "Data as of" follows the data the scores stand on, not a fresher side part (${a8})`);
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(2500); /* the sample six again */
const pf = await p.evaluate(() => window.__ev(`(() => { const ms = members(); if (ms.length !== 6) return 'members ' + ms.length; const mv = [['Protect'], ['Protect'], ['Detect'], ['Detect'], ['Spiky Shield'], ['Tailwind']];
  const t = ms.map((m, i) => ({...m, moves: mv[i].map(n => mvByName.get(n)).filter(Boolean), _mv: null})); const o = teamBasicsOf(t.map(m => m.p.n), t); return o && o.protectLow; })()`));
ok(pf === 0, `A2-I5 / Sim 2B: 2 Protect + 2 Detect + 1 Spiky Shield counts as five Protect users, no penalty (protectLow ${pf})`);
const mu = await p.evaluate(async () => { const t = [...document.querySelectorAll('#main button')].find(x => /^\s*Top 10\s*$/i.test(x.textContent)); /* the war room (reskin page 1): the view words are lower case in the sentence "Show me [top 10]" */ if (t) t.click(); await new Promise(r => setTimeout(r, 800));
  const rows = [...document.querySelectorAll('#main .mu-rows .mu-row')].filter(r => r.getClientRects().length); if (!rows.length) return 'no rows';
  return rows.map(r => { const v = r.querySelector('.tm-v'), n = r.querySelector('.nm'); return !v ? 'ok' : v.scrollWidth <= v.clientWidth + 1 && v.getBoundingClientRect().left >= n.getBoundingClientRect().right - 1 ? 'ok' : v.textContent + ' cut'; }); });
ok(Array.isArray(mu) && mu.every(x => x === 'ok'), `Sim (Nov 17): Top 10 verdicts sit right of the name, in full (${JSON.stringify(mu).slice(0, 120)})`);
/* Q5 A (Nov 18): on desktop the panel opens on a Card tap, as on phones */ await p.evaluate(() => { if (!document.querySelector('#main #tm-set')) { const c = document.querySelector('#main [data-tmsel]'); if (c) c.click(); } }); await p.waitForTimeout(900);
await p.evaluate(() => document.querySelector('#main #tm-set [data-v2edit]') && document.querySelector('#main #tm-set [data-v2edit]').click()); await p.waitForTimeout(1200);
const dd = await p.evaluate(() => { const s = document.querySelector('.np-sheet .ed-sel select'); if (!s) return 'no dropdown'; const c = getComputedStyle(s), a = getComputedStyle(s.parentElement, '::after');
  return {app: c.appearance || c.webkitAppearance, arrow: a.content !== 'none' && a.content !== 'normal' && parseFloat(a.width) > 0}; });
ok(dd.app === 'none' && dd.arrow, `Sim Q1 (Nov 17): Edit Set dropdowns draw our own arrow, not the device's box (${JSON.stringify(dd)})`);
{ const lab = {}; for (const [r, re] of [['meta', /On (?:[\d.]+% of )?tournament teams/ /* Q2 A (Nov 17): the hero shows "Of teams"; its spoken label keeps the base */], ['weekly', /% of this week's tournament teams/], ['team-empty', /% of Showdown ladder teams/]]) { await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1800); lab[r] = re.test(await p.evaluate(() => document.querySelector('#main').innerText.replace(/\s+/g, ' '))); } /* line breaks read as spaces (Nov 19: the empty My Team tiles put 'Showdown ladder teams' on its own line) */
  ok(Object.values(lab).every(Boolean), `Player review 1a-c (Nov 17): each share names its base (tournament / this week's tournament / Showdown ladder teams; W2c, Nov 19) (${JSON.stringify(lab)})`); }
{ const mv = await p.evaluate(() => window.__ev(`(() => { let n = 0, bad = []; for (const p of ROSTER) { let h = ''; try { h = V2.pkBuild(p); } catch (e) { continue; } const d = document.createElement('div'); d.innerHTML = h;
    const us = [...d.querySelectorAll('.pk-usual li')].filter(li => li.querySelector('.k-mp, :scope > small')).map(li => (li.querySelector('.k-mn b') || li.querySelector('b')).textContent.trim()); /* Nov 21: the move ticket's share is .k-mp (every ticket has a small 'what it does' line) */ const L = [...d.querySelectorAll('.pk-list')].find(x => /Moves/.test(x.querySelector('h3') ? x.querySelector('h3').textContent : ''));
    if (!us.length || !L) continue; n++; const names = [...L.querySelectorAll('.ms-br span')].map(s => s.textContent.trim()); const miss = us.filter(m => !names.includes(m)); if (miss.length) bad.push(p.n + ':' + miss.join('/')); } return {n, bad: bad.slice(0, 6), nb: bad.length}; })()`));
  ok(mv.nb === 0, `Player review 1d (Nov 17): every move 'Usually' names is in the Moves list below it (${mv.n} Pokémon; missing on ${mv.nb}: ${mv.bad.join(', ')})`); }
{ await p.goto('file://' + PAGE + '#pokemon=garchomp'); await p.waitForTimeout(2000); const t = await p.evaluate(() => (document.querySelector('#main .pk-run') || {}).textContent || ''); /* reskin (Nov 21): what players run is the rap sheet's big Speed (was the hero's last number) */
  ok(/Choice Scarf/.test(t) || !/Speed/.test(t), `Player review 1e (Nov 17): a Speed with the usual Choice Scarf says so (Garchomp: ${t.replace(/\s+/g, ' ').trim()})`); }
{ await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(2200);
  const t = await p.evaluate(() => document.querySelector('#main').innerText); ok(/After 5 logged games, Build Me a Team weighs your own results/.test(t), 'Player review 2b (Nov 17): empty Your Games says what logging unlocks'); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(1800); await p.evaluate(() => V2.openSearch()); await p.fill('[data-v2q]', 'trick room'); await p.waitForTimeout(400);
  const hits = await p.evaluate(() => [...document.querySelectorAll('[data-v2hits] .np-hit')].map(h => h.innerText.replace(/\s+/g, ' ').trim()));
  ok(hits.some(h => /^Move Trick Room/.test(h)) && hits.some(h => /^Team style Trick Room/.test(h)), `Player review 2c (Nov 17): site search finds the move and the team style 'Trick Room' (${hits.slice(0, 4).join(' | ')})`);
  /* info sheets (Sim, Nov 22: Search is the tying point): picking the move opens its sheet; Winning Teams With It is the link inside */
  await p.click('[data-v2hits] [data-v2info="mv"][data-v2infon="Trick Room"]'); await p.waitForTimeout(800);
  const sh = await p.evaluate(() => ({kind: !!document.querySelector('.np-sheet .is2.kd-move'), name: ((document.querySelector('.np-sheet .is-tab h2') || {}).textContent || '').trim(), wt: !!document.querySelector('.np-sheet [data-v2term="move"][data-v2termv="Trick Room"]')}));
  ok(sh.kind && sh.name === 'Trick Room' && sh.wt, `Info sheets (Nov 22): picking the move in Search opens its sheet, with Winning Teams With It inside (${JSON.stringify(sh)})`);
  await p.click('.np-sheet [data-v2term="move"][data-v2termv="Trick Room"]'); await p.waitForTimeout(1500);
  const wt = await p.evaluate(() => ({h: location.hash, f: (V2.wtUi && V2.wtUi.f || []).map(x => x.v).join(',')}));
  ok(wt.h === '#tournaments' && /Trick Room/.test(wt.f), `Player review 2c: Winning Teams With It opens Winning Teams filtered by the move (${JSON.stringify(wt).slice(0, 120)})`); }
{ const vp = p.viewportSize(); await p.setViewportSize({width: 390, height: 844}); await p.goto('file://' + PAGE + '#tournaments'); await p.reload(); await p.waitForTimeout(2200);
  const w = await p.evaluate(() => { const vis = el => el && el.offsetParent !== null && el.getBoundingClientRect().height > 0, f = document.querySelector('#main .wt-find');
    const spots = [...document.querySelectorAll('#main .ra-spotw')].filter(vis); return {find: f ? Math.round(f.getBoundingClientRect().top + scrollY) : -1, spots: spots.length,
      spot: spots[0] ? Math.round(spots[0].getBoundingClientRect().top + scrollY) : -1}; });
  ok(w.find > 0 && w.find < 844 && w.spots === 1 && w.spot > w.find, `Player review 2d (Nov 17): on a 390-wide phone the Winning Teams search is on the first screen, above Your Team, with one Your Team shown (search at ${w.find}px, Your Team at ${w.spot}px, ${w.spots} shown)`);
  await p.setViewportSize(vp); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(1800);
  /* Player review 3a, moved for Sim's Nov 18 redesign (the Stampede): Home no longer shows the ladder's Most used (it lives on the Usage page,
     feature map HOME-02/04 in docs/rebuild/stampede/AUDIT-mockups-nov18.md; its spotlight tag is checked below). The wording rule still holds
     for the whole new Home: nothing on it says "right now" (the post band, built separately, is left out: its gift wording is its own check) */
  const h = await p.evaluate(() => ({sd: !!document.querySelector('#main .sd'), t: [...document.querySelectorAll('#main .sd > .sd-band:not(.sd-post)')].map(e => e.innerText).join(' '), old: !!document.querySelector('#main .fn-ringside'), per: window.__ev('(META[S.format] || {}).period || ""'),
    a: typeof V2.homeNext === 'function' ? V2.homeNext(Date.UTC(2026, 10, 17)) : null, b: typeof V2.homeNext === 'function' ? V2.homeNext(Date.UTC(2026, 11, 2)) : null,
    hd: typeof V2.homeHead === 'function' ? [V2.homeHead(Date.UTC(2026, 10, 17)).h, V2.homeHead(Date.UTC(2026, 11, 5)).h] : []})); const t = h.t.replace(/\s+/g, ' ');
  ok(h.sd && !h.old && t.length > 200 && !/right now/i.test(t) && !/Most used (?:in|last month|on the ladder)/.test(t), `Player review 3a (Nov 17; moved Nov 18 to the Stampede Home): Home calls no numbers "right now" and shows no month's ladder figures (Stampede ${h.sd}, old Ringside ${h.old}, ${t.length} characters read${/right now/i.test(t) ? ': "' + t.match(/.{0,40}right now.{0,20}/i)[0] + '"' : ''})`);
  ok(h.per !== '2026-10' || (h.hd[0] === 'Most used last month.' && h.hd[1] === 'Most used on the ladder.'), `Player review 3a: "last month" only while it's true (Nov 17: ${h.hd[0]}; Dec 5: ${h.hd[1]})`);
  ok(h.per !== '2026-10' || (/^\. November's numbers arrive Dec 1\.$/.test(h.a || '') && h.b === ''), `Player review 3a: the data line says how old October's numbers are until Dec 1, then drops the note (Nov 17: "${h.a}", Dec 2: "${h.b}")`); }
{ await p.goto('file://' + PAGE + '#usage'); await p.waitForTimeout(1800); const g = await p.evaluate(() => (document.querySelector('#main .gs-tag') || {}).textContent || '');
  ok(g && !/right now/i.test(g), `Player review 3a: the Usage spotlight tag doesn't say "right now" ("${g}")`); }
{ await p.goto('file://' + PAGE + '#meta'); await p.waitForTimeout(2000);
  const t = await p.evaluate(() => window.__ev(`(() => { const xs = lairRows().filter(x => x.r.tc), bad = []; for (let i = 1; i < xs.length; i++) { const a = xs[i - 1], b = xs[i], ka = lairRank(a.p).rank, kb = lairRank(b.p).rank;
    if (RS(a.r.total) === RS(b.r.total) ? ka !== kb : kb !== i + 1) bad.push(a.p.d + ' ' + RS(a.r.total) + ' #' + ka + ' / ' + b.p.d + ' ' + RS(b.r.total) + ' #' + kb); } return {n: xs.length, bad: bad.slice(0, 4), nb: bad.length}; })()`));
  ok(t.nb === 0, `Player review 3b (Nov 17): Pokémon showing the same rating share a rank, and the next one skips ahead (${t.n} rated; ${t.nb} wrong: ${t.bad.join(', ')})`); }
{ await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(3500);
  const m = await p.evaluate(() => { const team = new Set(JSON.parse(window.__ev('JSON.stringify(members().map(x => x.p.n))'))), rows = [...document.querySelectorAll('#main .tm-mus [data-muthr]')].filter(b => b.querySelector('.mu-dis, .nm'));
    const mir = rows.filter(b => team.has(b.dataset.muthr)), other = rows.filter(b => !team.has(b.dataset.muthr));
    return {n: rows.length, mir: mir.map(b => b.dataset.muthr + ':' + /Mirror\b/.test(b.innerText)), wrong: other.filter(b => /Mirror\b/.test(b.innerText)).length}; }); /* Sim's Q20 A (Nov 19): the cards say 'Mirror' (the list rows 'Mirror match') */
  ok(m.mir.length > 0 && m.mir.every(x => /:true$/.test(x)) && m.wrong === 0, `Player review 3e (Nov 17): a threat that is also on your team says "Mirror" ("Mirror match" in the list, Q20), no other row does (${m.mir.join(', ')}; ${m.wrong} wrong of ${m.n})`); }
{ await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(5000);
  const s2 = await p.evaluate(() => { const d = document.querySelector('[data-v2fix] summary'); return d ? d.innerText.replace(/\s+/g, ' ').trim() : ''; });
  ok(/^Things to Know \d+ (minor )?weak spots?, type chart, (legal|not legal yet)$|^Things to Know No weak spots, type chart/.test(s2), `Player review 3f (Nov 17): Things to Know names what it holds ("${s2}")`); }
{ await p.goto('file://' + PAGE + '#practice'); await p.waitForTimeout(2500);
  const pp = await p.evaluate(() => [...document.querySelectorAll('#main .hm-pair .hm-pp')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  ok(pp.length >= 2 && pp.every(t => /^\d+% brought together$/.test(t)), `Player review 3g (Nov 17): each pair % says "brought together" beside it (${pp.slice(0, 2).join(' | ')})`); }
{ await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#box'); await p.reload(); await p.waitForTimeout(2500);
  const bx0 = await p.evaluate(() => (document.querySelector('#main .bx-count') || {}).textContent || '');
  await p.evaluate(() => window.__ev('(() => { S.box = S.box.slice(1); render(); })()')); await p.waitForTimeout(900);
  const bx1 = await p.evaluate(() => (document.querySelector('#main .bx-count') || {}).textContent || '');
  ok(/\(sample\)/.test(bx0) && !/\(sample\)/.test(bx1), `Player review 3j (Nov 17): a first visit's box says "(sample)", and stops once changed ("${bx0}" -> "${bx1}")`); }
{ const vp = p.viewportSize(), rowsAt = async w => { await p.setViewportSize({width: w, height: 900}); await p.waitForTimeout(500);
    return p.evaluate(() => { const L = [...document.querySelectorAll('#main .tm-mus .mu-cards li, #main .tm-mus .mu-out > li')] /* the war room (reskin page 1): the stand-outs are rows (.mu-out), two across under 1000 */, t = {}; L.forEach(l => { const k = Math.round(l.getBoundingClientRect().top); t[k] = (t[k] || 0) + 1; }); return Object.values(t); }); };
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(3500);
  const out = {}; for (const w of [320, 360, 390, 404, 430, 768, 1024]) out[w] = await rowsAt(w); await p.setViewportSize(vp);
  const bad = Object.entries(out).filter(([w, r]) => r.length && new Set(r).size > 1);
  ok(Object.values(out).some(r => r.length) && !bad.length, `Player review 3d (Nov 17): Stand-Outs rows are even at every width (${Object.entries(out).map(([w, r]) => w + ':' + r.join('+')).join(' ')})`); }
{ await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2000);
  const run = txt => p.evaluate(t => window.__ev(`JSON.stringify((() => { const s = JSON.stringify(S.slots); const r = importPaste(${JSON.stringify(t)}); S.slots = JSON.parse(s); return r; })())`), txt).then(JSON.parse);
  const a = await run('Garchmp @ Choice Scarf\n- Earthquake\n\nSneasler @ Focus Sash\n- Close Combat'), b2 = await run('hello this is not a team, just me typing a sentence here');
  const c = await run(['Garchomp', 'Sneasler', 'Rillaboom', 'Kingambit'].map(n => n + ' @ Choice Scarf\n- Protect').join('\n\n'));
  ok(/did you mean Garchomp\?/.test(a.msg || ''), `Pre-launch 6a (Nov 17): a typo gets "did you mean" (${a.msg || a.error})`);
  ok(/doesn't look like a team/.test(b2.error || ''), `Pre-launch 6b: a sentence gets "doesn't look like a team" (${b2.error || b2.msg})`);
  ok(/Item Clause: 4 hold Choice Scarf/.test(c.msg || ''), `Pre-launch 6c: the same item on four is flagged at import (${c.msg || c.error})`); }
{ await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(1500); await p.evaluate(() => { const d = document.querySelector('[data-v2save], [data-v2saveopen]'); if (d) d.click(); }); await p.waitForTimeout(600);
  const cnt = await p.evaluate(() => { const i = document.querySelector('[data-v2savename]'); if (!i) return 'no field'; i.value = 'Wonderfully Overgrown Rain Team Name'; i.dispatchEvent(new Event('input', {bubbles: true}));
    const c = i.parentElement.querySelector('[data-v2cnt]'); return (c ? c.textContent : 'no counter') + ' | ' + i.getAttribute('aria-label'); });
  ok(/^36\/40 \| Team name, up to 40 characters$/.test(cnt), `Pre-launch 6d: the team name shows its length from 30 characters and says the limit (${cnt})`); }
{ const ctx = await b.newContext(); const q = await ctx.newPage(); await q.addInitScript(() => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('cc2.state', '{"slots":[broken'); } window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(3000);
  const u = await q.evaluate(() => ({toast: (document.querySelector('.np-toast') || {}).textContent || '', kept: localStorage.getItem('cc2.state.unreadable')}));
  ok(/couldn't be read/.test(u.toast) && u.kept === '{"slots":[broken', `Pre-launch 6e: unreadable saved data is kept aside and the player is told ("${u.toast.slice(0, 60)}", copy kept: ${u.kept === '{"slots":[broken'})`); await ctx.close(); }
{ await p.goto('file://' + PAGE + '#track'); await p.waitForTimeout(2000);
  const tb = await p.evaluate(() => window.__ev(`(() => { const raw = {since: '2026-10-29', ev: []}, out = [];
    cleanTrack(Object.assign({}, raw, {bands: [80, 70, 60]})); out.push(TR_BANDS.join(' / ')); cleanTrack(raw); out.push(TR_BANDS.join(' / ')); return out.join(' | '); })()`));
  ok(tb === '90+ / 80–89 / 70–79 / Under 70 | 90+ / 70–89 / 53–69 / Under 53', `Player review 3h (Nov 17): Track Record's groups follow the data's cut-offs (tier lines when it says so, the old ones otherwise): ${tb}`); }
{ const ctx = await b.newContext({viewport: {width: 1280, height: 900}}); const q = await ctx.newPage();
  await q.addInitScript(() => { window.__PL_TEST = 1; if (!sessionStorage.getItem('h10')) { sessionStorage.setItem('h10', 1); localStorage.setItem('cc2.state', JSON.stringify({slots: [{n: ''}, {n: ''}, {n: ''}, {n: ''}, {n: ''}, {n: ''}], teams: []})); localStorage.setItem('cc2.welcomed', '"1"'); } });
  /* HOME-10b, updated with Sim's yes (Nov 18, decisions.md 10:30 PM): an empty team on Home is the mock-up's view, three open rings plus the three
     most used, under "Your six goes here." (was: six add tiles). Each open ring still opens the Add box for its own slot, name box focused */
  await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const v = await q.evaluate(() => ({eye: ((document.querySelector('#main .sds-k') || {}).textContent || '').trim(), open: [...document.querySelectorAll('#main .sds-rings [data-v2addto]')].map(e => e.getAttribute('aria-label')), named: document.querySelectorAll('#main .sds-rings .sds-slot.on').length}));
  const got = []; for (const k of [1, 3, 5]) { const t = q.locator(`#main .sds-rings [aria-label="Add a Pokémon to slot ${k}"]`); if (!(await t.count())) { got.push(k + ': no ring'); continue; } await t.first().click(); await q.waitForTimeout(700);
    got.push(k + ': ' + await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('[role="dialog"]'); return (s ? s.getAttribute('aria-label') : 'no sheet') + ' / spot ' + (V2.ed ? V2.ed.i + 1 : '?') + (document.activeElement && document.activeElement.matches('[data-adq]') ? ' / name box focused' : ''); })()`)));
    await q.keyboard.press('Escape'); await q.waitForTimeout(400); }
  ok(v.eye === 'Your six goes here.' && v.named === 3 && v.open.length === 3 && got.join(' | ') === '1: Add a Pokémon / spot 1 / name box focused | 3: Add a Pokémon / spot 3 / name box focused | 5: Add a Pokémon / spot 5 / name box focused',
    `HOME-10b (Nov 17; Nov 18 with Sim's yes): an empty team shows "Your six goes here.", three open rings and the three most used; each open ring opens the Add box for its own slot (${v.eye}; ${v.named} named, ${v.open.length} open; ${got.join(' | ')})`); await ctx.close(); }
{ const ctx = await b.newContext({viewport: {width: 1280, height: 900}}); const q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.evaluate(() => window.__ev('clearSlot(5);render()')); await q.waitForTimeout(9000);
  const own = await q.evaluate(() => [...document.querySelectorAll('.tm-chg')].map(c => c.getAttribute('aria-label') + ' [' + ((c.querySelector('.tm-own') || {}).textContent || '') + ']').join(' | '));
  ok(/\[(In your box|To catch)\]/.test(own) && !/\[\]/.test(own), `Known-bug COV-04 (Nov 17): each suggestion says whether the Pokémon coming in is in your box or still to catch (${own.slice(0, 160)})`); await ctx.close(); }
{ const ctx = await b.newContext({viewport: {width: 412, height: 823}}); const q = await ctx.newPage();
  await q.addInitScript(() => { window.__PL_TEST = 1; let w; Object.defineProperty(window, '__NP_CLAUDE', {configurable: true, get: () => w, set: v => {
    w = v && v.use ? {use: async n => { const r = await v.use(n); if (n !== 'db' || !r) return r;
      return {doc: x => { const d = r.doc(x); return Object.assign({}, d, {onSnapshot: cb => d.onSnapshot(sn => setTimeout(() => cb(sn), 1200))}); }}; }} : v; }}); });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(400);
  await q.evaluate(() => window.__ev(`(() => { window.__ord = []; const R = ratings, D = V2.redraw; let inDraw = false;
    ratings = function () { if (!__ord.length || __ord[__ord.length - 1] !== (inDraw ? 'ratings inside draw' : 'ratings')) __ord.push(inDraw ? 'ratings inside draw' : 'ratings'); return R.apply(this, arguments); };
    V2.redraw = function () { if (!V2._dataOk) return D.apply(this, arguments); inDraw = true; __ord.push('draw'); try { return D.apply(this, arguments); } finally { inDraw = false; } }; })()`));
  await q.waitForTimeout(3500); const ord = (await q.evaluate(() => window.__ord.slice(0, 3))).join(' > ');
  ok(/^ratings > draw/.test(ord), `Speed fix 2 (Nov 17, pre-launch 2c): when today's numbers arrive the ratings are worked out as their own step before the page is drawn (${ord})`); await ctx.close(); }
{ await p.goto('file://' + PAGE + '#about'); await p.waitForTimeout(2500);
  const st = await p.evaluate(() => window.__ev(`(() => { const mf = memberFrom, pn = performance.now; let n = 0, fake = pn.call(performance); memberFrom = function () { n++; return mf.apply(this, arguments); };
    performance.now = () => (fake += 10); /* a slow phone: every clock reading 10 ms later */
    try { const g = planFixesG(members(), suggestPool(), true); g.next(); return n; } finally { memberFrom = mf; performance.now = pn; } })()`));
  ok(st > 0 && st <= 5, `Speed fix 3 (Nov 17, pre-launch 2d): on a slow clock the planner's first step stops after a few candidates (pauses by time, not by count; ${st} built)`);
  const rg = await p.evaluate(() => window.__ev(`(() => { if (typeof THR.teamReportG !== 'function') return {none: 1}; const ms = assignItems(members()), sig = r => JSON.stringify([r.score, r.rows.map(x => [x.t.n, x.level, x.solid.map(y => y.why), x.soft.map(y => y.why)])]);
    THR.noCache(false); const g = THR.teamReportG(ms); let r, n = 0; do { r = g.next(); n++; } while (!r.done); const a = sig(r.value); THR.noCache(false); const b = sig(THR.teamReport(ms));
    return {n, threats: THR.threatList().length, same: a === b}; })()`));
  ok(rg.same && rg.n === rg.threats + 1, `Speed fix 3c (Nov 18, pre-launch 2d): the planner works a team's matchup report out one threat per step (${rg.n} steps for ${rg.threats} threats), with the same report as in one go (${rg.same})`); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500);
  const rn = await p.evaluate(() => window.__ev(`(() => { const R = {id: 'M-C', since: '2026-09-01', now: {id: 'M-D', since: '2026-12-02', events: 3, need: {events: 20}}}, P = META.perf, o1 = META.reg, o2 = P && P.reg; META.reg = R; if (P) P.reg = R; try { return V2.dataNote().replace(/<[^>]+>/g, ''); } finally { META.reg = o1; if (P) P.reg = o2; } })()`));
  ok(/3 Reg M-D events so far, switches at 20\./.test(rn), `Known-bug SHELL-05 (Nov 17): the new-regulation note says how far along it is (${String(rn).slice(0, 200)})`); }
{ const lin = [];
  /* Home's ranks and most used moved for Sim's Nov 18 redesign (the Stampede): the hero's plates, tags and ticker (ratings) and the six's ring
     names stand in for .hm-rk / .hm-used; on Home every such button is read, not only the first */
  for (const [route, sel] of [['meta', '.gs-mon'], ['speed', '.sp2-m'], ['home', '.sdh-plate'], ['home', '.sdh-tick li:not([hidden]) button'], ['home', '.sds-rings .sds-nm[data-v2mon]'], ['usage', '.us-fig']]) {
    await p.goto('file://' + PAGE + '#' + route); await p.waitForTimeout(2000);
    lin.push(await p.evaluate(([sel, all]) => { const norm = x => x.toLowerCase().replace(/[^a-z0-9%.# ]+/g, ' ').replace(/\s+/g, ' ').trim(); const es = [...document.querySelectorAll('#main ' + sel)].filter(x => x.getClientRects().length && x.getAttribute('aria-label')); if (!es.length) return sel + ' none';
      return (all ? es : es.slice(0, 1)).map(e => { const vis = norm((e.querySelector('.us-tx') || e).innerText).split(' ').slice(0, 2).join(' ') /* a Usage figure's podium number is decoration; its label text is .us-tx */, raw = e.getAttribute('aria-label'), al = norm(raw);
        return al.startsWith(vis) && !/\[object|undefined|NaN/.test(raw) ? '' : sel + ': "' + vis + '" vs "' + raw.slice(0, 60) + '"'; }).filter(Boolean).slice(0, 2).join(' | '); }, [sel, route === 'home'])); }
  const bad = lin.filter(Boolean); ok(!bad.length, `pl-5d (Nov 17; Home re-pointed to the Stampede Nov 18): spoken names start with the visible words and hold no "[object Object]" (rating tiles, speed rows, Home's hero plates, ticker and ring names, Usage figures)${bad.length ? ': ' + bad.join(' | ') : ''}`); }
/* Sim, Nov 18 (C): from 360 the Hand is three across and the panel opens under the whole Hand (checked below); the Nov 17 B placement stays at 320 (two across) */
{ const ctx = await b.newContext({viewport: {width: 320, height: 844}}); const q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.evaluate(() => document.querySelectorAll('[data-tmsel]')[0].click()); await q.waitForTimeout(500);
  const pos = await q.evaluate(() => { const c = document.querySelector('[data-tmsel][aria-pressed="true"]').closest('.mh-slot, .mtf-row').getBoundingClientRect() /* Nov 21: My Team frame (Sim approved): the tapped row */, r = document.querySelector('[data-v2rep]'), m = document.querySelector('[data-v2rm]'); return r && m ? Math.round(m.getBoundingClientRect().bottom - c.bottom) : -1; });
  await q.evaluate(() => { const r = document.querySelector('[data-v2rep]'); if (r) r.click(); }); await q.waitForTimeout(400); const head = await q.evaluate(() => (document.querySelector('.np-sheet h2') || {}).textContent || '');
  await q.keyboard.type('incin'); await q.waitForTimeout(400); await q.keyboard.press('Enter'); await q.waitForTimeout(700);
  const after = await q.evaluate(() => window.__ev('members().map(m => m.p.n).join(",")')), tst = await q.evaluate(() => (document.querySelector('.np-toast') || {}).textContent || '');
  await q.evaluate(() => document.getElementById('toastUndo') && document.getElementById('toastUndo').click()); await q.waitForTimeout(500); const undone = await q.evaluate(() => window.__ev('members().map(m => m.p.n).join(",")'));
  ok(pos > 0 && pos < 650 && /^Replace /.test(head) && /Incineroar/.test(after) && /^Replaced .+ with Incineroar/.test(tst) && /Charizard-Mega-Y/.test(undone) && !/Incineroar/.test(undone), `Sim (Nov 17, B; Nov 18 C keeps it under 360): tapping the first Card at 320 (Nov 20: was "a Lead Card"; Sim: no Lead / Back / Bench on My Team) puts Replace, Edit Set and Remove right under it (Remove ${pos}px below the Card); Replace swaps in one step and Undo brings the old one back (${head} | ${tst.slice(0, 50)})`); await ctx.close(); }
{ const ms = []; for (const w of [700, 740, 820]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(1500);
    ms.push(await p.evaluate(() => Math.min(...[...document.querySelectorAll('.tm-acts > button, .mtf-acts > .mtf-btn, .mtf-bb > .mtf-btn')].filter(b => b.getClientRects().length && !b.classList.contains('tm-saved')) /* Nov 21: My Team frame (Sim approved): the header's slanted buttons */.map(b => { const br = b.getBoundingClientRect(), tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); let L = 1e9, R = -1e9, n;
      while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const c of rg.getClientRects()) if (c.width) { L = Math.min(L, c.left); R = Math.max(R, c.right); } } return Math.round(Math.min(L - br.left, br.right - R)); })))); }
  await p.setViewportSize({width: 1280, height: 900}); ok(ms.every(x => x >= 12), `Audit v199 #1 (Nov 17): My Team's action buttons keep their words clear of the slanted edges at 700-820 (closest ${ms.join(' / ')} px; was -1 at 700)`); }
{ const tg = []; for (const w of [320, 390, 1024, 1100, 1180, 1280, 1366, 1920]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#track'); await p.waitForTimeout(1800);
    tg.push(await p.evaluate(() => { const r = [...document.querySelectorAll('.trk-slip')].map(s => { const st = s.querySelector('.trk-st'), L = s.querySelector('.trk-sr').getBoundingClientRect().left; let R = -1e9; const tw = document.createTreeWalker(st, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const rg = document.createRange(); rg.selectNodeContents(n); for (const c of rg.getClientRects()) if (c.width) R = Math.max(R, c.right); } return Math.round(L - Math.max(R, st.querySelector('.trk-stamp').getBoundingClientRect().right)); }); return r.length ? Math.min(...r) : 99; })); }
  await p.setViewportSize({width: 1280, height: 900}); ok(tg.every(x => x >= 4), `Audit v199 #2 (Nov 17): Track Record cards keep their words and stamp left of the dashed tear line at 320-1920 (closest ${tg.join(' / ')} px; was -41 / -46 / -14 at 1100 / 1180 / 1280)`); }
{ const sg = {}; for (const w of [320, 390, 600]) for (const r of ['tournaments', 'events', 'archetypes', 'weekly']) { await p.setViewportSize({width: w, height: 844}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    (sg[w] = sg[w] || []).push(await p.evaluate(() => { const n = [...document.querySelectorAll('.ra-seg[aria-label="Tournament views"]')].find(e => e.getClientRects().length); /* the shown copy (the page writes the bar twice, one hidden per width) */ return n ? [...n.querySelectorAll('a')].map(a => { const cs = getComputedStyle(a), rg = document.createRange(); rg.selectNodeContents(a);
      return cs.fontSize + '/' + new Set([...rg.getClientRects()].filter(c => c.width).map(c => Math.round(c.top))).size; }).join(' ') : 'none'; })); }
  await p.setViewportSize({width: 1280, height: 900}); const same = Object.values(sg).every(v => v.every(x => x === v[0] && x !== 'none'));
  ok(same, `Audit v199 #3 (Nov 17): the Tournaments tab bar has the same type size and line breaks on Winning Teams, Events, Archetypes and This Week (${Object.entries(sg).map(([w, v]) => w + ': ' + [...new Set(v)].join(' | ')).join('; ')})`); }
{ await p.setViewportSize({width: 1280, height: 900}); await p.goto('file://' + PAGE + '#speed'); await p.waitForTimeout(2000);
  const sv = await p.evaluate(() => { const h = (document.querySelector('.sp2-h h1') || {}).textContent || '', lines = [...document.querySelectorAll('.sp2-sum p, .sp2-cs')].map(x => x.textContent); /* Speed reskin (Nov 22): each line now sits on its blue cut (.sp2-cs) */
    const cnt = t => [...t.matchAll(/(?:of|vs)\s+the\s+(?:top\s+)?(\d+)/g)].map(m => +m[1]), hn = cnt(h)[0], ln = [...new Set(lines.flatMap(cnt))], note = ((document.querySelector('.sp2-sum-k') || {}).textContent || '').replace(/\s+/g, ' ');
    return {n: lines.length, hn, ln, note, ok: ln.every(x => x === hn || (note.includes('top ' + x) && note.includes('shows the ' + hn)))}; });
  ok(sv.n > 0 && sv.ok, `Audit v199 #7 (Nov 17): Speed Tiers says once what its shares count: headline top ${sv.hn}, lines of the top ${sv.ln.join('/')}, note "${sv.note}"`); }
/* Audit v199 #6, moved for Sim's Nov 18 redesign (the Stampede): the slanted lead tiles are gone; Home's 'Lead' marks now sit under the line-up's
   names (.sds-ld, the sample team's two leads). Same rule: each stays clear of its spot's edges (and so of the next name) at 360-1920; none found fails */
{ const ld = []; for (const w of [360, 420, 700, 900, 1024, 1180, 1280, 1366, 1440, 1920]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(1500);
    ld.push(await p.evaluate(() => { const L = [...document.querySelectorAll('#main .sds-rings .sds-ld')].filter(e => e.getClientRects().length); if (L.length !== 2) return 'found ' + L.length;
      return Math.min(...L.map(e => { const t = e.closest('.sds-cap').getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect(); return Math.round(Math.min(t.right - r.right, r.left - t.left)); })); })); }
  await p.setViewportSize({width: 1280, height: 900}); ok(ld.every(x => typeof x === 'number' && x >= 4), `Audit v199 #6 (Nov 17; moved Nov 18 to the Stampede line-up): Home's two 'Lead' marks stay clear of their spot's edges at 360-1920 (closest ${ld.join(' / ')} px)`); }
{ const ta = []; const tctx = await b.newContext({hasTouch: true}), tq = await tctx.newPage();
  for (const [w, r, sel] of [[820, 'build', '.np-nav a'], [820, 'build', '.bd-side .np-link'], [820, 'battle', '.bt-lfour'], [1024, 'calc', '.arn-links .np-link'], [320, 'types', '.tc-tm'], [320, 'events', '.ev-fc']]) { /* the phone header logo is an open layout item for Sim (overlaps the arrows), not checked here */
    await tq.setViewportSize({width: w, height: 900}); await tq.goto('file://' + PAGE + '#' + r); await tq.waitForTimeout(1500);
    ta.push(...await tq.evaluate(([sel, w, r]) => [...document.querySelectorAll(sel)].filter(x => x.getClientRects().length).map(e => { e.scrollIntoView({block: 'center'}); const R = e.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2;
      const hit = (x, y) => { const h = document.elementFromPoint(x, y); return h && (h === e || e.contains(h)); }, ext = (dx, dy) => { let d = 0; while (d < 80 && hit(cx + dx * (d + 1), cy + dy * (d + 1))) d++; return d; };
      return [w + ' ' + r + ' ' + (e.textContent.trim() || 'logo').slice(0, 12), ext(-1, 0) + ext(1, 0) + 1, ext(0, -1) + ext(0, 1) + 1]; }), [sel, w, r])); }
  await tctx.close(); const small = ta.filter(x => x[1] < 44 || x[2] < 44);
  ok(ta.length > 10 && !small.length, `Audit v199 #11 (Nov 17): measured by where a tap lands, every listed button and link is at least 44 x 44 (${ta.length} checked; too small: ${small.map(x => x[0] + ' ' + x[1] + 'x' + x[2]).join(', ') || 'none'})`); }
{ const sc = []; for (const w of [320, 390, 430]) for (const r of ['sets', 'usage']) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    sc.push(await p.evaluate(([w, r]) => { const g = document.querySelector('.us-srcs'); if (!g) return [w, r, 'none', 99, 0]; const bs = [...g.querySelectorAll('button')], G = g.getBoundingClientRect(), last = bs[bs.length - 1].getBoundingClientRect();
      return [w, r, bs.map(b => b.textContent.trim()).join('/'), Math.round(G.right - last.right), Math.round(Math.max(...bs.map(b => b.getBoundingClientRect().width)) - Math.min(...bs.map(b => b.getBoundingClientRect().width)))]; }, [w, r])); }
  await p.setViewportSize({width: 1280, height: 900}); const words = sc.filter(x => x[1] === 'sets').every(x => /Online tournaments\/Showdown ladder$/.test(x[2]));
  ok(words && sc.every(x => x[3] <= 4 && x[4] <= 2), `Audit v199 #9 (Nov 17): source chips use the word-list names and fill the row in three even columns on phones (${sc.map(x => x[0] + ' ' + x[1] + ': gap ' + x[3] + ', widths differ ' + x[4]).join('; ')}; Sets: ${(sc.find(x => x[1] === 'sets') || [])[2]})`); }
{ await p.setViewportSize({width: 1280, height: 900}); await p.goto('file://' + PAGE + '#track'); await p.waitForTimeout(1500);
  const tc = await p.evaluate(() => [...document.querySelectorAll('.trk-slip')].map(s => [s.querySelector('.trk-st span').textContent, s.getAttribute('aria-label')]));
  ok(tc.length > 0 && tc.every(([t, a]) => !/·|\bRated\b/.test(t) && /rated \d+/.test(a)), `Sim (Nov 17, Q1 recommended): Track Record cards have no dots and don't repeat 'Rated N' (the big number says it; screen readers still hear it) ("${(tc[0] || [''])[0]}")`); }
{ await p.goto('file://' + PAGE + '#track'); await p.waitForTimeout(1200); /* review Nov 17 #8: a card's text is already escaped HTML; escaping it again in the label made '&' read "amp" */
  const tl = await p.evaluate(() => { const n = [...document.querySelectorAll('.trk-slip')].map(s => s.dataset.v2mon)[0]; if (!n) return ['(no card on Track Record)', ''];
    const t = document.createElement('template'); t.innerHTML = V2.trSlip({n, r: 80}, true, 'on 2 top-8 teams<br>won ' + V2.esc('Players\' Cup "A" & B <C>'), 0); const s = t.content.querySelector('.trk-slip');
    return [s ? s.getAttribute('aria-label') : '(no card drawn)', s ? s.querySelector('.trk-st span').textContent : '']; });
  ok(tl[0].includes(`top-8 teams, won Players' Cup "A" & B <C>.`) && tl[1].endsWith(`won Players' Cup "A" & B <C>`), `Review Nov 17 #8: Track Record card labels read event titles as written, with no "amp" or "#39" ('${tl[0]}')`); }
{ const tt = []; await p.setViewportSize({width: 390, height: 844}); for (const r of ['meta', 'usage', 'sets', 'tournaments', 'events', 'archetypes', 'weekly']) { await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    tt.push([r, await p.evaluate(() => { const t = [...document.querySelectorAll('#main .ra-tabs')].find(e => e.getClientRects().length), h = document.querySelector('#main .ra-lede') || document.querySelector('#main h1'); if (!t || !h) return [9999, 999];
      const T = t.closest('.ra-sub').getBoundingClientRect(); return [Math.round(T.top + scrollY), Math.round(T.top - h.getBoundingClientRect().bottom)]; })]); }
  await p.setViewportSize({width: 1280, height: 900}); const ys = tt.map(x => x[1][0]);
  ok(Math.max(...ys) <= 450 && tt.every(x => x[1][1] >= 0 && x[1][1] <= 24), `Sim (Nov 17, Q2 recommended): on phones the Pokémon / Tournaments tabs come right after the headline and intro line on every Meta page (${tt.map(x => x[0] + ' ' + x[1][0] + ' (+' + x[1][1] + ')').join(', ')} px)`); }
{ const fo = [], FW = [390, 900, 1099, 1100, 1280], FR = ['meta', 'usage', 'sets', 'tournaments', 'events', 'archetypes', 'weekly']; for (const w of FW) for (const r of FR) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    const sr = await p.getByRole('navigation', {name: 'Meta'}).count(); /* a hidden copy is not heard: role queries skip display:none */
    const st = await p.evaluate(() => { const top = document.querySelector('#main .gs-top, #main .wk-mast'), vis = e => e.getClientRects().length > 0, T = [...document.querySelectorAll('#main .ra-sub')].find(vis);
      if (!top || !T) return null; const R = T.getBoundingClientRect(), y0 = R.top + scrollY, y1 = R.bottom + scrollY;
      /* reading order: each visible line or control of the top block wholly above the tab bar comes before it in the page, each one wholly below comes after */
      const bad = [...top.querySelectorAll('h1, p, a, button, li')].filter(e => vis(e) && !T.contains(e) && !e.contains(T)).flatMap(e => { const r = e.getBoundingClientRect(), a = r.top + scrollY, z = r.bottom + scrollY, pre = !!(T.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING);
        return (z <= y0 && !pre) || (a >= y1 && pre) ? [(e.textContent.trim() || e.tagName).slice(0, 16)] : []; });
      top.setAttribute('tabindex', '-1'); top.focus(); return {y0: Math.round(y0), y1: Math.round(y1), bad, n: T.querySelectorAll('a').length}; });
    if (!st) { fo.push([w, r, 'no tab bar']); continue; }
    const seq = []; for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); /* real Tab presses from the start of the top block */
      const f = await p.evaluate(() => { const e = document.activeElement, top = document.querySelector('#main .gs-top, #main .wk-mast'); if (!e || !top || e === top || !top.contains(e)) return null; const r = e.getBoundingClientRect();
        return {t: (e.textContent.trim() || e.getAttribute('aria-label') || e.tagName).slice(0, 16), a: Math.round(r.top + scrollY), z: Math.round(r.bottom + scrollY), tab: !!e.closest('.ra-sub'), vis: e.getClientRects().length > 0}; });
      if (!f) break; seq.push(f); }
    const ti = seq.map((f, i) => f.tab ? i : -1).filter(i => i >= 0), first = Math.min(...ti), last = Math.max(...ti);
    const wrong = seq.filter((f, i) => !f.tab && ((f.z <= st.y0 && i > first) || (f.a >= st.y1 && i < last))).map(f => f.t + ' (y ' + f.a + ')');
    if (!(st.bad.length === 0 && sr === 1 && ti.length === st.n && last - first === st.n - 1 && seq.every(f => f.vis) && wrong.length === 0))
      fo.push([w, r, `tabs at y ${st.y0}; focus ${seq.map(f => (f.tab ? '[' + f.t + ']' : f.t) + ' ' + f.a).join(' > ')}; focused out of order: ${wrong.join(', ') || 'none'}; read out of order: ${st.bad.join(', ') || 'none'}; Meta tab bars heard: ${sr}; tab links focused ${ti.length} of ${st.n}`]); }
  await p.setViewportSize({width: 1280, height: 900});
  ok(!fo.length, `Review Nov 17 evening #2: on every Meta page at ${FW.join(', ')}, keyboard focus and screen-reader order follow what is seen around the Pokémon / Tournaments tabs (what is above them comes first, what is below after; one tab bar heard)${fo.length ? ': ' + fo.map(x => x.join(' ')).join(' | ') : ' (' + FW.length * FR.length + ' page views)'}`); }
{ const hg = []; for (const w of [390, 900, 1099]) for (const r of ['meta', 'usage', 'sets', 'tournaments', 'events', 'archetypes', 'about', 'method', 'feedback']) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    hg.push([w, r, await p.evaluate(() => { const h = document.querySelector('#main .gs-top>.ra-h'); if (!h) return null; const B = s => { const e = h.querySelector(s); return e && e.getClientRects().length ? e.getBoundingClientRect() : null; }, e = B('.np-eyebrow'), t = B('h1'), l = B('.ra-lede');
      const s = h.parentElement.querySelector(':scope>.ra-spotw'), S = s && s.getClientRects().length ? s.getBoundingClientRect() : null;
      return e && t && l ? [Math.round(t.top - e.bottom), Math.round(l.top - t.bottom), h.querySelector('.ra-sub') || !S ? null : Math.round(S.top - l.bottom)] : null; })]); }
  await p.setViewportSize({width: 1280, height: 900});
  const hbad = hg.filter(([, , g]) => !g || g[0] !== 12 || g[1] !== 12 || (g[2] !== null && g[2] !== 40));
  ok(!hbad.length, `Review Nov 17 evening #4: under 1100 the headline keeps its 12px line spacing (eyebrow to headline, headline to intro) on the Meta pages and on About, How We Calculate and Feedback, and those three keep their 40px to the card below (were 16 / 16 and 20 after the Nov 17 tab move)${hbad.length ? ': ' + hbad.map(([w, r, g]) => w + ' ' + r + ' ' + (g ? g.filter(x => x !== null).join('/') : 'no headline')).join(', ') : ' (' + hg.length + ' page views)'}`); }
{ const ch = []; for (const w of [320, 390, 599, 600, 640, 700, 759, 760, 820, 899, 1280]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#speed'); await p.waitForTimeout(1500);
    ch.push(await p.evaluate(w => { const cs = [...document.querySelectorAll('.sp2-ctl .np-chip, .sp2-ctl .k-w')].filter(c => c.getClientRects().length), sizes = [...new Set(cs.map(c => getComputedStyle(c).fontSize))];
      const wx = [...document.querySelectorAll('.sp2-wx .np-chip, .sp2-wx .k-w')].filter(c => c.getClientRects().length), rows = {}; wx.forEach(c => { const t = Math.round(c.getBoundingClientRect().top); rows[t] = (rows[t] || 0) + 1; }); const r = Object.values(rows);
      return [w, sizes.join('/'), r.join('+'), cs.length, wx.length]; }, w)); }
  await p.setViewportSize({width: 1280, height: 900}); /* review Nov 17 #3/#6: chips must be found (6 weather chips), and the weather rows are even at every width under 900, not only on phones (640-759 had 5 + 1).
     Speed reskin (Nov 22, helper hT3): the chips are now the kit's plot sentence ('In [Your Weather] [No Weather] [Sun] ...'), a sentence that flows like
     Build's, so the rule reads: one size, all six found, and no weather word left alone on a row at any width (the first row also holds the word 'In') (the old 'equal rows' can't hold for a
     sentence: at 390 'Your Weather (sun)' takes most of a row) */
  ok(ch.every(x => x[3] > 0 && x[4] === 6 && x[1] && !x[1].includes('/')) && ch.every(x => x[2].split('+').every((n, i) => !i || +n >= 2)), `Audit v199 #12 (Nov 17): Speed Tiers chips are one size, and no weather word sits alone on a row after the first (${ch.map(x => x[0] + ': ' + x[1] + ', rows ' + x[2] + (x[4] === 6 ? '' : ', ' + x[4] + ' weather chips')).join('; ')})`); }
{ const wl = []; await p.setViewportSize({width: 1280, height: 900}); for (const r of ['battle', 'team', 'weekly', 'method']) { await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    wl.push(...await p.evaluate(r => { const t = document.querySelector('#main').textContent; return [[/Build for Me\b/, 'Build for Me'], [/Count abilities/, 'Count abilities'], [/items, moves and abilities/, 'abilities (lower case)'], [/in the checklist/, 'the checklist']].filter(([re]) => re.test(t)).map(x => r + ': ' + x[1]); }, r)); }
  ok(!wl.length, `Audit v199 #16 (Nov 17): word-list names on Battle, My Team, This Week and How We Calculate (Build Me a Team, Abilities, Team Checks) (slips: ${wl.join(', ') || 'none'})`); }
{ await p.setViewportSize({width: 390, height: 900}); const lk = []; for (const n of ['Whimsicott', 'Incineroar', 'Flapple']) { await p.goto('file://' + PAGE + '#pokemon=' + n); await p.waitForTimeout(1500);
    lk.push(await p.evaluate(() => ((document.querySelector('.pk-rate small') || {}).textContent || 'none').trim())); } /* reskin (Nov 21, Sim approved the file mock-up): the kit card has no 0-100 gauge, so the band half is gone */
  await p.setViewportSize({width: 1280, height: 900}); ok(lk.every(t => t !== 'none' && !/likely|\d+\s*[–-]\s*\d+/.test(t)), `Sim (Nov 17): the Pokémon page rating line has no 'likely 81-92' words (${lk.join(' | ')})`); }
{ const hd = []; const hctx = await b.newContext({hasTouch: true}), hq = await hctx.newPage();
  for (const w of [320, 360, 390, 414, 700, 1024, 1440]) { await hq.setViewportSize({width: w, height: 800}); await hq.goto('file://' + PAGE + '#home'); await hq.waitForTimeout(1200);
    await hq.evaluate(() => { location.hash = '#events'; }); await hq.waitForTimeout(800); await hq.evaluate(() => { location.hash = '#types'; }); await hq.waitForTimeout(800); await hq.goBack(); await hq.waitForTimeout(1000);
    hd.push(await hq.evaluate(w => { const q = s => document.querySelector(s), B = q('.np-goback'), L = q('.np-head .logo'), F = q('.np-gofwd'), g = e => (e.querySelector('svg,img') || e).getBoundingClientRect();
      const hit = e => { const R = e.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2, h = x => { const t = document.elementFromPoint(x, cy); return t && (t === e || e.contains(t)); }; let a = 0, z = 0; while (a < 80 && h(cx - a - 1)) a++; while (z < 80 && h(cx + z + 1)) z++; return a + z + 1; };
      const tools = q('.np-head .tools'), over = tools ? Math.round(tools.getBoundingClientRect().left - F.getBoundingClientRect().right) : 99;
      return [w, Math.round(g(L).left - g(B).right), Math.round(g(F).left - g(L).right), hit(B), hit(L), hit(F), over, document.documentElement.scrollWidth <= innerWidth]; }, w)); }
  await hctx.close(); const bad = hd.filter(([w, a, c, tb, tl, tf, ov, fit]) => Math.abs(a - c) > 1 || tb < 44 || tl < 44 || tf < 44 || ov < 0 || !fit);
  ok(!bad.length, `Sim (Nov 17): header back / logo / forward: the same gap on both sides of the logo and 44px taps for all three, nothing pushed off (${hd.map(x => x[0] + ': ' + x[1] + '|' + x[2] + ' taps ' + x[3] + '/' + x[4] + '/' + x[5]).join('; ')})`); }
{ await p.setViewportSize({width: 390, height: 900}); await p.goto('file://' + PAGE + '#compare'); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__ev('ui.cx.A = null; ui.cx.B = null; V2.redraw()')); await p.waitForTimeout(300); /* review Nov 17 #6: always the empty state, so the check reads its words (it passed when no hint was shown) */
  const cx = await p.evaluate(() => { const h = document.querySelector('.cx2-hint'); return h && h.getClientRects().length ? [h.textContent, document.querySelectorAll('.cx2 tr, .cx2-row').length] : ['(no hint shown)', -1]; });
  ok(cx[1] === 0 && /^Pick two teams/.test(cx[0]) && !/rows? below/.test(cx[0]), `Audit v199 #21 (Nov 17): Compare's empty state doesn't point at rows that aren't there ("${cx[0].slice(0, 90)}")`); }
{ const gs = [], gm = []; const gctx = await b.newContext(), gq = await gctx.newPage(); await gq.addInitScript(() => { window.__PL_TEST = 1; }); /* fresh storage: the sample six are on the team, so 'on your team' bars show */
  for (const w of [390, 700, 1280]) { await gq.setViewportSize({width: w, height: 900}); await gq.goto('file://' + PAGE + '#meta'); await gq.waitForTimeout(1800);
    /* review Nov 17 #6: grouped by shelf row (the .gs-row; on phones .gs-row is display:contents and the .gs-rows scroller is the row), not by tile top, so a tile pushed down is still compared with its row */
    const [d, m] = await gq.evaluate(() => { const rows = new Map(); [...document.querySelectorAll('.gs-row .gs-mon')].filter(m => m.getClientRects().length).forEach(m => { const r = m.parentElement, k = getComputedStyle(r).display === 'contents' ? r.closest('.gs-rows') : r; if (!rows.has(k)) rows.set(k, []); rows.get(k).push(m.querySelector('.gs-sc').getBoundingClientRect().top); });
      const d = [...rows.values()].filter(v => v.length > 1).map(v => Math.max(...v) - Math.min(...v));
      const mine = [...document.querySelectorAll('.gs-mon .gs-mine')].filter(x => x.getClientRects().length).map(x => x.getBoundingClientRect().top - x.closest('.gs-mon').querySelector('.gs-sc').getBoundingClientRect().bottom);
      return [d.length ? Math.round(Math.max(...d)) : 99, mine.length ? Math.round(Math.min(...mine)) + ' (' + mine.length + ')' : 'none']; }); gs.push(d); gm.push(m); }
  await gctx.close(); ok(gs.every(x => x <= 1), `Audit v199 #13 (Nov 17): Meta Grandstand numbers line up across each shelf row, even when a name takes two lines (worst ${gs.join(' / ')} px; was 16-17)`);
  ok(gm.every(x => x !== 'none' && parseInt(x) >= 0), `Review Nov 17 #5: the Grandstand 'on your team' bar sits under its number, never over it (space between, at 390 / 700 / 1280: ${gm.join(' / ')} px)`); }
{ const ut = []; for (const w of [390, 1280]) for (const r of ['usage', 'sets']) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1800);
    ut.push(await p.evaluate(([w, r]) => { const tx = [...document.querySelectorAll('#main .gs-row .gs-tx')].filter(t => t.getClientRects().length && !t.closest('.gs-rows'));
      const gap = tx.map(t => t.getBoundingClientRect().bottom - Math.max(...[...t.children].filter(c => c.getClientRects().length).map(c => c.getBoundingClientRect().bottom)));
      return [w, r, tx.length, tx.length ? Math.round(Math.max(...gap)) : 99]; }, [w, r])); }
  await p.setViewportSize({width: 1280, height: 900}); /* the Ratings Grandstand's 'on your team' bar row (Audit v199 #13) belongs to the Ratings shelves only */
  ok(ut.every(x => x[2] > 0 && x[3] <= 1), `Review Nov 17 #5: Usage and Sets teammate and bench tiles keep no empty row under their last line (${ut.map(x => x[0] + ' ' + x[1] + ': ' + x[2] + ' tiles, ' + x[3] + ' px').join('; ')}; was 8)`); }
{ await p.setViewportSize({width: 1280, height: 900}); await p.goto('file://' + PAGE + '#build'); await p.waitForTimeout(1500);
  const ph = await p.evaluate(() => (document.querySelector('[data-bdfind]') || {}).placeholder || '(none)');
  ok(!/^optional$/i.test(ph), `Audit v199 #22 (Nov 17): Build's 'Build around a Pokémon · optional' box doesn't say 'Optional' again (placeholder "${ph}")`); }
{ const ig = []; const ictx = await b.newContext({hasTouch: true}), iq = await ictx.newPage(); for (const w of [390, 1024, 1280]) { await iq.setViewportSize({width: w, height: 900}); await iq.goto('file://' + PAGE + '#team'); await iq.waitForTimeout(1800);
    ig.push(await iq.evaluate(w => { const el = [...document.querySelectorAll('#main p.tm-sample')][0]; if (!el) return [w, 'none', 0]; const rg = document.createRange(); rg.selectNodeContents(el); const tops = [...new Set([...rg.getClientRects()].map(r => Math.round(r.top)))].sort((a, b) => a - b), gaps = tops.slice(1).map((t, i) => t - tops[i]).filter(g => g > 4);
      const taps = [...el.querySelectorAll('.np-link'), ...document.querySelectorAll('#main .mtf-bb > .mtf-btn')].map(a => { /* Nov 21: My Team frame (Sim approved) */ /* the two buttons under the line */ const R = a.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2, h = y => { const t = document.elementFromPoint(cx, y); return t && (t === a || a.contains(t)); }; let u = 0, d = 0; while (u < 40 && h(cy - u - 1)) u++; while (d < 40 && h(cy + d + 1)) d++; return u + d + 1; });
      return [w, gaps.length ? Math.max(...gaps) - Math.min(...gaps) : 0, Math.min(...taps)]; }, w)); }
  await ictx.close(); ok(ig.every(x => x[1] !== 'none' && x[1] <= 2 && x[2] >= 40), `Audit v199 #22 (Nov 17): My Team's intro lines are evenly spaced (the links' tap areas don't stretch a line) and its links stay easy to tap (${ig.map(x => x[0] + ': spread ' + x[1] + ', tap ' + x[2]).join('; ')})`); }
// SUGG-09 again (Nov 18): Suggestions kept its place only for one frame after Apply; on a slow phone the parts above redraw later
// and the page still jumped (the behaviour test failed under load). A late 120px change above Suggestions must not move it.
{ const q = await b.newPage({viewport: {width: 390, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.addStyleTag({content: 'html,body{overflow-anchor:none}'}); // as a browser without scroll anchoring
  await q.evaluate(() => window.__ev(`(() => { const T = ['Incineroar','Garchomp','Sneasler','Kingambit','Basculegion','Sinistcha']; S.slots.forEach((s, i) => { s.n = T[i]; }); persist(); V2.redraw(); })()`));
  /* q59 (Sim's yes, Nov 20): on phones My Team's sections are tabs; open Suggestions as a player would (no tabs at 700+: nothing to do) */
  await q.evaluate(() => { const t = document.querySelector('.tm-tabs [data-tmjump="tm-sg"]'); if (t) t.click(); }); await q.waitForTimeout(600);
  await q.waitForSelector('#tm-sg [data-v2plan]', {timeout: 20000}).catch(() => {});
  // Nov 18 (full test run): the planner works in steps now and redraws Suggestions after the first Apply shows, so wait until it settles
  await q.waitForFunction(() => { const s = document.querySelector('#tm-sg'); return s && !s.querySelector('[aria-busy=true]') && !/Working out|Plotting your best changes/.test(s.innerText) && s.querySelector('[data-v2plan]'); }, null, {timeout: 30000}).catch(() => {});
  // the place under the finger (Nov 18, SUGG-09 inside Suggestions): an Apply (the faded copy's while the planner works, then the next
  // suggestion's) where the tapped one was; with none left, Suggestions' top
  const at = () => q.evaluate(() => { const s = document.querySelector('#tm-sg'), A = s && [...s.querySelectorAll('[data-v2plan]')].find(e => e.getClientRects().length); return s ? Math.round((A || s).getBoundingClientRect().top) + (A ? ' Apply' : ' top') : null; });
  const y0 = await q.evaluate(() => { const s = document.querySelector('#tm-sg'), a = s && s.querySelector('[data-v2plan]'); if (!a) return null; scrollBy(0, a.getBoundingClientRect().top - innerHeight * 2 / 3); return Math.round(s.getBoundingClientRect().top); });
  const a = await q.$('#tm-sg [data-v2plan]'); let y1 = null, a0 = null;
  if (y0 != null && a) { a0 = await at(); await q.locator('#tm-sg [data-v2plan]').first().click(); /* a fresh lookup: a held handle can go stale on a redraw */ await q.waitForTimeout(700);
    await q.evaluate(() => { const d = document.createElement('div'); d.style.height = '120px'; d.id = 'zz-late'; const m = document.querySelector('#main'); m.insertBefore(d, m.firstChild); });
    await q.waitForTimeout(1200); y1 = await at(); }
  const want = y1 && / Apply$/.test(y1) ? parseInt(a0) : y0;
  ok(y0 != null && y1 != null && Math.abs(parseInt(y1) - want) <= 4, `SUGG-09 (Nov 18): after Apply, the place under the finger stays put when the parts above change height later (${a0}, Suggestions top ${y0} -> ${y1})`);
  await q.close(); }
// SUGG-09, inside Suggestions (Nov 18): with the CPU 4x slower, the faded list sat under the new 'Applied … Undo' bar while the next
// suggestions were worked out, so the Apply under the finger dropped about 175px (600 -> 775), then moved again when the new list came.
// Every frame from the tap until the list has settled: an Apply (the faded copy's, then the next suggestion's) stays where the tapped one
// was; with no Apply left (nothing to fix), Suggestions stays where it was. One six ends with a next suggestion, one with none.
for (const [nm, T] of [['next suggestion', ['Flapple', 'Pikachu', 'Garchomp', 'Incineroar', 'Whimsicott', 'Sneasler']], ['nothing to fix', ['Incineroar', 'Garchomp', 'Sneasler', 'Kingambit', 'Basculegion', 'Sinistcha']]]) {
  const q = await b.newPage({viewport: {width: 390, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.addStyleTag({content: 'html,body{overflow-anchor:none}'}); // as Safari: no scroll anchoring
  await q.evaluate(T => window.__ev(`(() => { const T = ${JSON.stringify(T)}; S.slots.forEach((s, i) => { s.n = T[i]; }); persist(); V2.redraw(); })()`), T);
  const settled = () => q.waitForFunction(() => { const s = document.querySelector('#tm-sg'); return s && !s.querySelector('[aria-busy=true]') && !/Working out|Plotting your best changes/.test(s.innerText) && !s.querySelector('.sg2-stale'); }, null, {timeout: 30000}).catch(() => {});
  await q.evaluate(() => { const t = document.querySelector('.tm-tabs [data-tmjump="tm-sg"]'); if (t) t.click(); }); await q.waitForTimeout(600); /* q59: the Suggestions tab, as a player opens it */
  await settled();
  /* 'nothing to fix' (Nov 18 fix of the check): the six's last suggestion is FOUND, not assumed. Its one suggestion got a follow-up after the
     planner changes (run 1351: 14 frames with a new Apply), so the "no Apply left: Suggestions stays" ending went unchecked and the check
     failed. At normal speed: Apply; while a new Apply follows, keep that team and go on; when none follows, go back one step and measure there. */
  if (nm === 'nothing to fix') { let last = null;
    for (let i = 0; i < 6; i++) { const st = await q.evaluate(() => window.__ev('JSON.stringify(S.slots)')); const a1 = await q.$('#tm-sg [data-v2plan]'); if (!a1) break;
      await a1.click(); await q.waitForTimeout(600); await settled(); await q.waitForTimeout(600); last = st;
      if (!(await q.$('#tm-sg [data-v2plan]'))) { await q.evaluate(st => window.__ev(`(() => { S.slots = ${st}; persist(); V2.redraw(); })()`), last); await q.waitForTimeout(600); await settled(); break; } } }
  await q.waitForFunction(() => { const s = document.querySelector('#tm-sg'); return s && s.querySelector('[data-v2plan]'); }, null, {timeout: 30000}).catch(() => {});
  const cdp = await q.context().newCDPSession(q); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  const s0 = await q.evaluate(() => { const s = document.querySelector('#tm-sg'), a = s && s.querySelector('[data-v2plan]'); if (!a) return null; scrollBy(0, a.getBoundingClientRect().top - 600); return Math.round(s.getBoundingClientRect().top); });
  const a = await q.$('#tm-sg [data-v2plan]'), seen = [], bad = []; let busy = 0, live = 0, msg = '';
  if (s0 != null && a) { const y0 = await a.evaluate(e => Math.round(e.getBoundingClientRect().top)); await a.click(); const t0 = Date.now(); let calm = 0;
    while (Date.now() - t0 < 30000) { // measured in a frame, after the page's own frame work, as the player sees it
      const r = await q.evaluate(() => new Promise(res => requestAnimationFrame(() => { const s = document.querySelector('#tm-sg'), A = s && [...s.querySelectorAll('[data-v2plan]')].find(e => e.getClientRects().length);
        const u = s && s.querySelector('.sg2-undo'), U = u && u.getBoundingClientRect(), t = document.querySelector('.np-toast');
        res({ap: A ? Math.round(A.getBoundingClientRect().top) : null, stale: !!(A && A.closest('.sg2-stale')), sec: s ? Math.round(s.getBoundingClientRect().top) : null, busy: !!(s && (s.querySelector('[aria-busy=true]') || /Working out|Plotting your best changes/.test(s.innerText))),
          bar: !!(U && U.top >= 0 && U.bottom <= innerHeight), toast: !!(t && t.getClientRects().length && /^Applied/.test(t.innerText))}); })));
      if (!msg) msg = r.bar && r.toast ? 'two' : r.bar ? 'bar' : r.toast ? 'toast' : ''; if (r.busy) busy++; else if (r.ap != null && !r.stale) live++;
      const at = r.ap != null ? ['Apply' + (r.stale ? ' (faded)' : ''), r.ap, y0] : ['Suggestions', r.sec, s0]; seen.push(at[0][0] + at[1]); if (Math.abs(at[1] - at[2]) > 4) bad.push(`${at[0]} ${at[2]} -> ${at[1]} at ${Date.now() - t0} ms`);
      if (r.busy) calm = 0; else if (!calm) calm = Date.now(); else if (Date.now() - calm > 1500) break; await q.waitForTimeout(80); } }
  ok(s0 != null && busy > 0 && (nm === 'nothing to fix' ? !live : live > 0) && (msg === 'bar' || msg === 'toast') && !bad.length, `SUGG-09 inside Suggestions (Nov 18), ${nm}, 4x slower CPU: what is under the finger after Apply never moves, through the working state and when the new list comes (${bad.length ? bad.slice(0, 3).join('; ') : 'held'}; ${busy} working frames, ${live} with a new Apply, message: ${msg || 'none'}; ${[...new Set(seen)].slice(0, 8).join(' ')})`);
  await q.close(); }
// X-05 helper's find (Nov 18): Build's sticky Recent Winners / Cores bar covered one row of the 'Build around' name list on a phone
{ const q = await b.newPage({viewport: {width: 390, height: 844}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#build'); await q.waitForTimeout(2000); const f = await q.$('[data-bdfind]'); let r = 'no box';
  if (f) { await f.click(); await f.type('gar'); await q.waitForTimeout(600);
    r = await q.evaluate(() => { const h = document.querySelector('.bd-hits'); if (!h || !h.children.length) return 'no list';
      const rows = [...h.querySelectorAll('button,a,li')].filter(e => e.getClientRects().length && e.getBoundingClientRect().bottom < innerHeight);
      const hid = rows.filter(e => { const b = e.getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !t || !h.contains(t); });
      return `${hid.length} of ${rows.length} rows covered`; }); }
  ok(/^0 of [1-9]/.test(r), `Build: the 'Build around' name list sits above the sticky tab bar at 390 (${r})`); await q.close(); }
// qcheck triage (Nov 18, defects 3-4): the Mystery Gifts 'Home' back link and My Team's Your Games '?' keep a 44px tap at every phone width
{ const tp = []; for (const [w, r, sel] of [[390, 'gifts', '#main .np-back'], [320, 'team', '#main .tm-yg-n .sg2-tip'], [390, 'team', '#main .tm-yg-n .sg2-tip']]) { const q = await b.newPage({viewport: {width: w, height: 844}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
    await q.goto('file://' + PAGE + '#' + r); await q.waitForTimeout(2000); tp.push(w + ' ' + r + ': ' + await q.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'none'; const R = e.getBoundingClientRect(); return Math.round(R.width) + 'x' + Math.round(R.height); }, sel)); await q.close(); }
  ok(tp.every(t => { const m = t.match(/(\d+)x(\d+)$/); return m && +m[1] >= 44 && +m[2] >= 44; }), `qcheck triage (Nov 18): Gifts' Home link and My Team's Your Games '?' are at least 44x44 (${tp.join(' | ')})`); }
{ const sp = []; for (const [w, r] of [[390, 'build'], [390, 'speed'], [1280, 'calc'], [1280, 'battle'], [390, 'team']]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1800);
    sp.push(await p.evaluate(() => { const im = [...document.querySelectorAll('#main img[src*=".webp"]')].filter(i => i.getClientRects().length); const sm = im.filter(i => i.getAttribute('src').includes('-s/') || i.dataset.full); /* GitHub (Nov 17): no sprite files beside the test page, so a small file can already have fallen back to the big one (V2.artFix sets data-full) */
      const big = sm.filter(i => { const m = i.closest('.np-mon'), iw = m ? parseFloat(((m.getAttribute('style') || '').match(/--iw:([\d.]+)px/) || [])[1]) : NaN; return m && !(iw <= 80); }); return [sm.length, big.length, im.length]; })); }
  await p.setViewportSize({width: 1280, height: 900}); const used = sp.reduce((a, x) => a + x[0], 0), wrong = sp.reduce((a, x) => a + x[1], 0), one = await p.evaluate(() => !!window.NP_ONE_ART), all = sp.reduce((a, x) => a + x[2], 0);
  if (one) ok(all > 0 && used === 0, `Sprites A on Claude hosting (Nov 17): a --one-art-size build asks for no small file, since an artifact holds at most 511 files (${used} small of ${all} sprites on 5 pages; review Nov 17 #6: no sprites at all fails)`);
  else ok(used > 0 && wrong === 0, `Sprites A (Nov 17): small spots use the 240px files (${used} on 5 pages) and no sprite set larger than 80px gets one (${wrong})`); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500); await p.evaluate(() => V2.openSearch()); await p.waitForTimeout(300);
  const fnd = []; for (const q of ['cores', 'build for me', 'battle a team', 'pokémon ratings']) { await p.fill('[data-v2q]', q); await p.waitForTimeout(300); fnd.push(q + ' > ' + await p.evaluate(() => { const b = document.querySelector('[data-v2hits] .np-hit b'); return b ? b.textContent : 'nothing'; })); }
  await p.fill('[data-v2q]', 'cores'); await p.waitForTimeout(300); if (await p.$('[data-v2hits] .np-hit')) await p.click('[data-v2hits] .np-hit'); await p.waitForTimeout(1200);
  const cs = await p.evaluate(() => { const c = document.querySelector('#main .bd-cores'); return location.hash + (c && c.getClientRects().length ? ' cores shown' : ' cores hidden'); });
  ok(fnd.join(' | ') === 'cores > Build Around a Core | build for me > Build Me a Team | battle a team > Battle | pokémon ratings > Ratings' && cs === '#build cores shown', `Known-bug BROKEN-10 (Nov 17): search finds the cores and today's menu names, and 'cores' opens Build at its cores (${fnd.join(' | ')}; ${cs})`); await p.keyboard.press('Escape'); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500); await p.evaluate(() => V2.openSearch()); await p.waitForTimeout(300);
  await p.fill('[data-v2q]', 'garch'); await p.waitForTimeout(400);
  const hits = await p.evaluate(() => [...document.querySelectorAll('[data-v2hits] .np-hit')].map(h => h.querySelector('b') ? h.querySelector('b').textContent.trim() : '').slice(0, 4).join(' | '));
  ok(/^Garchomp\b/.test(hits) && hits.indexOf('Garchomp') < hits.indexOf('Garchompite'), `Known-bug JUMP-03 (Nov 17): Search lists the Pokémon before its items ("garch": ${hits})`); await p.keyboard.press('Escape'); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500);
  const mj = await p.evaluate(() => window.__ev(`(() => { const fake = docs => ({doc: n => ({onSnapshot: (cb, err) => { const v = docs[n]; setTimeout(() => cb({exists: v !== undefined, data: () => v}), n.endsWith('_2') ? 20 : 0); }})});
    const out = []; const run = (name, docs) => new Promise(res => { const got = []; metaJoin(fake(docs), name, s => got.push(s.exists ? s.data() : null)); setTimeout(() => res(got), 80); });
    return Promise.all([run('t1', {'meta/t1': {a: [1]}}), run('t2', {'meta/t2': {a: [1]}, 'meta/t2_2': undefined}), run('t3', {'meta/t3': {_part: {id: 'x'}, a: [1]}, 'meta/t3_2': {_part: {id: 'x'}, a: [2]}})])
      .then(([g1, g2, g3]) => JSON.stringify({one: g1.length, emptyPart2: g2.length, joined: g3.length ? g3[g3.length - 1].a : null, counts: typeof META_EMITS === "object" ? [META_EMITS.doubles, META_EMITS.perf] : [1, 1]})); })()`));
  const m = JSON.parse(mj); ok(m.one === 1 && m.emptyPart2 === 1 && JSON.stringify(m.joined) === '[1,2]' && m.counts.every(c => c === 1), `Speed fix 1 (Nov 17): each daily document reaches the page once (an empty second part no longer sends it again); two parts still join (${mj})`); }
{ const q = await b.newPage({viewport: {width: 700, height: 900}}); await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500);
  const yn = await q.evaluate(() => Math.round(Math.min(...[...document.querySelectorAll('.sg2-ctl .np-slide button')].map(x => x.getBoundingClientRect().width).filter(Boolean))));
  ok(yn >= 44, `Nov 17: at 700 the Adjust Suggestions Yes/No buttons are at least 44px wide (narrowest ${yn}px; was 30, letters cut by the slant)`); await q.close(); }
{ const q = await b.newPage({viewport: {width: 390, height: 844}}); await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500);
  await q.evaluate(() => document.querySelectorAll('[data-tmsel]')[4].click()); await q.waitForTimeout(400);
  await q.evaluate(() => { const r = document.querySelector('[data-v2rm]'); scrollTo(0, r.getBoundingClientRect().top + scrollY - 400); r.click(); }); await q.waitForTimeout(800);
  const ad = await q.evaluate(() => { const a = document.querySelector('[data-v2addto]'); if (!a) return 'no Add spot'; const r = a.getBoundingClientRect(); return Math.round(r.top) + ' to ' + Math.round(r.bottom) + (document.activeElement === a ? ', focused' : ''); });
  const m = ad.match(/^(-?\d+) to (-?\d+), focused$/); ok(!!m && +m[1] >= 72 && +m[2] <= 844 - 72, `Sim (Nov 17): after Remove, the empty spot's Add is on screen (clear of the header and tab bar) and focused (${ad})`); await q.close(); }
/* Nov 18: at 4x CPU the page kept moving after Remove (the Add spot drifted 358 -> 298, once to -76 under the header): each later redraw
   flipped the score belt's full-width row off and on (scroll anchoring moved the page 30px each time), and the Card tap's smooth scroll
   could land after the Remove's own scroll. The Add spot must stay where it landed for 3 s, on screen and focused. */
{ const q = await b.newPage({viewport: {width: 390, height: 844}}); await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500);
  const cdp = await q.context().newCDPSession(q); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  await q.evaluate(() => document.querySelectorAll('[data-tmsel]')[4].click()); await q.waitForTimeout(400);
  await q.evaluate(() => { window.__rmS = {first: null, dev: 0, lo: 1e9, hi: -1e9, n: 0}; const t0 = performance.now(); let tf = 0;
    const tick = () => { const a = document.querySelector('[data-v2addto]'), S = window.__rmS; if (a && document.activeElement === a) { const r = a.getBoundingClientRect(); if (S.first === null) { S.first = Math.round(r.top); tf = performance.now(); }
        S.dev = Math.max(S.dev, Math.abs(Math.round(r.top) - S.first)); S.lo = Math.min(S.lo, Math.round(r.top)); S.hi = Math.max(S.hi, Math.round(r.bottom)); S.n++; }
      if (S.first === null ? performance.now() - t0 < 3000 : performance.now() - tf < 3000) requestAnimationFrame(tick); else S.done = 1; };
    const r = document.querySelector('[data-v2rm]'); scrollTo(0, r.getBoundingClientRect().top + scrollY - 400); r.click(); requestAnimationFrame(tick); });
  await q.waitForFunction(() => window.__rmS && window.__rmS.done, null, {timeout: 20000}).catch(() => {});
  const s = await q.evaluate(() => ({...window.__rmS, focused: document.activeElement === document.querySelector('[data-v2addto]')}));
  ok(s.first !== null && s.dev <= 8 && s.lo >= 72 && s.hi <= 844 - 72 && s.focused, `Nov 18 (4x CPU): after Remove, the Add spot stays within 8px of where it landed for 3 s, on screen and focused (landed at ${s.first}, moved up to ${s.dev}px, top ${s.lo} to bottom ${s.hi}, ${s.n} frames, focused ${s.focused})`);
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1}); await q.close(); }
{ const q = await b.newPage({viewport: {width: 390, height: 844}}); await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500);
  const yg = await q.evaluate(() => { const s = document.querySelector('#tm-yg'), n = s && s.querySelector('.tm-yg-0 span'), w = s && s.querySelector('.tm-yg-why'), t = s && s.querySelector('.tm-yg-0 [data-v2tip]'); if (!n || !w) return 'missing';
    const L = e => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)); /* Sim, Nov 18 (C): on phones the note sits behind a "?" beside 'None logged yet' */
    return L(n) + ' / ' + (w.getClientRects().length ? L(w) : t && t.getClientRects().length && (t.click(), ((document.querySelector('.sg2-tipop p') || {}).textContent || '') === w.textContent.trim()) ? 'behind ?' : 'hidden, no ?'); });
  ok(/^1 \/ ([123]|behind \?)$/.test(yg), `Nov 12 re-check (Nov 17; Nov 18 C): Your Games at 390 keeps 'None logged yet' on one line and its note on three lines at most or, since Sim's Nov 18 choice, behind a "?" with the same words, was 7 (lines: ${yg})`); /* GitHub's machine wraps it to 3 */ await q.close(); }
{ await p.goto('file://' + PAGE + '#sets'); await p.waitForTimeout(2500); await p.evaluate(() => window.__ev(`(() => { ui.setSrc = 'tour'; ui.setMon = 'Garchomp'; V2.redraw(); })()`)); await p.waitForTimeout(800);
  const sp = await p.evaluate(() => { const e = document.querySelector('.st-sp'); return e ? e.innerText.replace(/\s+/g, ' ') : 'no stat points'; });
  ok(/STAT POINTS|Stat points/.test(sp) && /Adamant: 2 HP \/ 32 Atk \/ 32 Spe 27%/.test(sp) && /Showdown ladder 1630\+.*don't include them/.test(sp), `Plans pr-4c (Nov 17): Popular Sets shows the top stat-point spreads with their share and source, even with Tournaments picked (${sp.slice(0, 120)})`); }
{ await p.goto('file://' + PAGE + '#sets'); await p.waitForTimeout(2500); const st = {};
  for (const src of ['ingame', 'tour']) { await p.evaluate(s => window.__ev(`(() => { ui.setSrc = '${s}'; ui.setMon = 'Charizard-Mega-Y'; V2.redraw(); })()`), src); await p.waitForTimeout(800);
    st[src] = await p.evaluate(() => ((document.querySelector('#main .st-side') || {}).innerText || '').replace(/\s+/g, ' ')); }
  ok(/Always Drought/.test(st.tour) && !/Blaze/.test(st.tour), `Player review 4c (Nov 17): a Mega's Ability reads "Always Drought", not the base form's Blaze (${st.tour.slice(0, 90)})`);
  ok(/No usage numbers in this source/.test(st.ingame), `Player review 4c: Best data says where the nature numbers are (${st.ingame.slice(-120)})`); }
{ await p.goto('file://' + PAGE + '#usage'); await p.waitForTimeout(2000); await p.evaluate(() => window.__ev(`(() => { ui.metaSrc = 'tour'; V2.redraw(); })()`)); await p.waitForTimeout(800);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#main [data-uspick], #main [data-v2mon], #main button')].find(x => /Charizard\sY/.test(x.textContent)); /* \s: the row keeps 'Charizard\u00a0Y' together */ if (b) b.click(); }); await p.waitForTimeout(800); /* Nov 22: Usage's call sheet picks with its rows (data-uspick) */
  const u = await p.evaluate(() => document.querySelector('#main').innerText.replace(/\s+/g, ' ')), k = u.search(/ABILITIES/); /* Nov 22: the heading (shown in capitals), not the note's lowercase 'abilities and natures' */
  ok(k >= 0 && /Always Drought/.test(u.slice(k, k + 120)) && !/Blaze \d/.test(u), `Player review 4c: Usage (tournaments) gives Mega Charizard Y "Always Drought" (${u.slice(k, k + 80)})`); }
{ await p.goto('file://' + PAGE + '#speed'); await p.waitForTimeout(2500);
  const calc = await p.evaluate(() => window.__ev(`JSON.stringify([spdCalc(200, false, '', null, {up: true}), spdCalc(201, true, '', null, {up: true}), spdCalc(201, true, '', null, {})])`));
  const chip = await p.evaluate(() => !!document.querySelector('#main [data-spd="up"]'));
  const mine = () => p.evaluate(() => [...document.querySelectorAll('#main .sp2 [data-spme], #main .sp2 .me')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).join('|').slice(0, 200));
  const before = await mine(); if (chip) { await p.click('#main [data-spd="up"]'); await p.waitForTimeout(700); } const after = await mine();
  ok(calc === '[300,451,301]' && chip && before !== after, `Player review 4b (Nov 17): "You +1" raises your six one Speed stage in the game's order (200 -> 300; 201 with Scarf -> 451; chip ${chip}, your rows changed ${before !== after}; ${calc})`); }
{ const ctx = await b.newContext({viewport: {width: 390, height: 844}, javaScriptEnabled: false}); const q = await ctx.newPage(); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(600);
  const st = await q.evaluate(() => ({main: ((document.querySelector('#main') || {}).innerText || '').trim(), logo: !!document.querySelector('#main .np-ldlogo img, #main .np-ldlogo picture')}));
  ok(/Getting today.s numbers/.test(st.main) && st.logo, `Pre-launch 2b (Nov 17): before any code runs, the page shows the logo and "Getting today's numbers" (main: "${st.main.slice(0, 40)}", logo ${st.logo})`); await ctx.close(); }
/* X-05 (Nov 18, behaviour test "the × in a Pokémon box empties it and keeps the keyboard up"): the site's own × (V2.CLR) in five search boxes,
   by a phone tap at 390 and a mouse click at 1280. Fails on the build before it (no ×; only the browser's own, which iPhone Safari may not draw). */
{ const xr = []; for (const touch of [true, false]) { const xc = await b.newContext({hasTouch: touch, viewport: touch ? {width: 390, height: 844} : {width: 1280, height: 900}}), xq = await xc.newPage(); await xq.addInitScript(() => { window.__PL_TEST = 1; });
    for (const [r, prep, sel, list] of [['build', '', '[data-bdfind]', '[data-bdhits]'], ['build', 'cores', '[data-bdcfind]', '[data-bdchits]'], ['home', 'search', '[data-v2q]', '[data-v2hits]'], ['tournaments', '', '[data-wtq]', '.wt-find'], ['meta', '', '[data-raq]', '.ra-count']]) {
      await xq.goto('file://' + PAGE + '#' + r); await xq.waitForTimeout(1800);
      if (prep === 'cores') await xq.evaluate(() => { const t = document.querySelector('#main [data-bdjump="cores"]'); if (t) t.click(); else document.querySelector('#main .bd-cores').scrollIntoView({block: 'start'}); }); /* Nov 20 (The Plot piece 5): no tabs, the cores always show */ if (prep === 'search') await xq.evaluate(() => V2.openSearch()); await xq.waitForTimeout(500);
      const st = () => xq.evaluate(([sel, list]) => { const i = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length), f = i && i.closest('.np-field, .pl-find') /* Nov 20: The Plot (Sim locked): Build's box is the sentence's search plate (.pl-find) */, x = f && f.querySelector('[aria-label="Clear"]'), L = document.querySelector(list);
        const vis = !!x && x.getClientRects().length > 0, R = vis && x.getBoundingClientRect(), cx = R && R.left + R.width / 2, cy = R && R.top + R.height / 2;
        const hit = (a, c) => { const h = document.elementFromPoint(a, c); return !!h && (h === x || x.contains(h)); }, ext = (dx, dy) => { let d = 0; while (d < 60 && hit(cx + dx * (d + 1), cy + dy * (d + 1))) d++; return d; };
        return {v: i ? i.value : null, foc: !!i && document.activeElement === i, x: vis, cx, cy, w: vis ? ext(-1, 0) + ext(1, 0) + 1 : 0, h: vis ? ext(0, -1) + ext(0, 1) + 1 : 0,
          nat: i ? (() => { const walk = rs => [...rs].some(c => !c.selectorText ? !!c.cssRules && walk(c.cssRules) : c.style.display === 'none' &&c.selectorText.split(',').some(s => /::-webkit-search-cancel-button\s*$/.test(s) && i.matches(s.replace(/::-webkit-search-cancel-button\s*$/, '')))); /* Chrome's getComputedStyle can't read this pseudo, so: a rule that hides it on this box */
            return [...document.styleSheets].some(s => { try { return walk(s.cssRules); } catch (e) { return false; } }) ? 'none' : 'shown'; })() : '', fh: f ? Math.round(f.getBoundingClientRect().height) : 0, list: L ? L.innerText.replace(/\s+/g, ' ').trim() : ''}; }, [sel, list]);
      const el = xq.locator(sel).filter({visible: true}).first(); await el.scrollIntoViewIfNeeded(); await xq.evaluate(s => { const i = [...document.querySelectorAll(s)].find(e => e.getClientRects().length); scrollTo(0, i.getBoundingClientRect().top + scrollY - 160); }, sel);
      const s0 = await st(); if (touch) await el.tap(); else await el.click(); await xq.keyboard.type('gar', {delay: 20}); await xq.waitForTimeout(700); const s1 = await st();
      if (s1.x) { if (touch) await xq.touchscreen.tap(s1.cx, s1.cy); else await xq.mouse.click(s1.cx, s1.cy); } await xq.waitForTimeout(700); const s2 = await st();
      const bad = [!s0.x || 'shown when empty', s1.x || 'no ×', s1.w >= 44 && s1.h >= 44 || `tap ${s1.w}x${s1.h}`, s1.nat === 'none' || 'browser × too (' + s1.nat + ')', s1.fh === s0.fh || `box ${s0.fh}->${s1.fh}px`, s1.list !== s0.list || 'list ignored typing',
        s2.v === '' || 'not emptied', s2.foc || 'focus lost', !s2.x || '× left after clear', s2.list === s0.list || 'list not back'].filter(z => z !== true);
      xr.push(`${touch ? 390 : 1280} ${prep || r}: ${bad.length ? bad.join(', ') : 'ok ' + s1.w + 'x' + s1.h}`); }
    await xc.close(); }
  ok(xr.every(x => / ok /.test(x)), `X-05 (Nov 18): the site's own × in search boxes (Build around, Cores, Search, Winning Teams, Meta; phone tap and mouse): hidden when empty, a 44px tap, the browser's own × hidden, the box no taller; one tap empties the box, keeps focus (keyboard up) and the list goes back (${xr.join('; ')})`); }
// Audit v199 #5 (Sim, Nov 17, 7:52 PM, option A for both): fill the empty desktop halves from 1100 up; under 1100 the stacked layout stays
{ const bw = []; for (const w of [1024, 1099, 1100, 1150, 1180, 1220, 1280, 1339, 1366, 1440, 1500, 1600, 1920, 2560]) { const q = await b.newPage({viewport: {width: w, height: 900}}); await q.goto('file://' + PAGE + '#battle'); await q.waitForTimeout(1800);
    bw.push(await q.evaluate(w => { const q = s => document.querySelector(s), R = s => q(s).getBoundingClientRect(); if (!q('.bt2.bt-noopp') || !q('.bt-log') || !q('.bt-empty')) return [w, 'no empty Battle'];
      const h1 = q('.bt-head h1'), lines = Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)), body = R('.bt-body'), log = R('.bt-log'), lgl = R('.bt-lgl'), emp = R('.bt-empty'), btn = R('.bt-theirs .bt-acts');
      const fit = document.documentElement.scrollWidth <= innerWidth;
      if (w < 1100) return [w, log.top >= body.bottom ? 'stacked' : 'beside', fit];
      return [w, lines, Math.round(log.left - body.right), Math.round(Math.abs(body.width - log.width)), Math.round(Math.abs(R('.bt-theirs .bt-lab').top - R('.bt-lgl h2').top)), Math.round(Math.abs(body.width - parseFloat(getComputedStyle(q('.bt-body')).paddingRight) - lgl.width)),
        emp.top >= btn.bottom && emp.right <= log.left + 1, getComputedStyle(q('.bt-log')).borderLeftWidth, fit]; }, w)); await q.close(); }
  const bad = bw.filter(x => x[0] < 1100 ? x[1] !== 'stacked' || !x[2] : (([w, l, gap, even, dt, ev, under, rule, fit]) => l !== 2 || gap < 0 || even > 1 || dt > 2 || ev > 2 || !under || rule !== '1px' || !fit)(x));
  ok(!bad.length, `Audit v199 #5 Battle A (Sim, Nov 17): before their six is in, from 1100 up the headline is 2 lines, Their Six | Your Games are two even columns with a thin rule between (headings level), "Everything below..." under Enter, nothing past the edge; under 1100 stacked (${bw.map(x => x[0] + ': ' + x.slice(1).join('/')).join('; ')})`); }
// Sim Q2 A (Nov 17, audit v199 #14): the Ratings / Usage / Popular Sets heroes' share label reads "Of teams" (spoken label keeps the
// base); from 360 up every label keeps one line, so the labels sit level and no fact runs past the hero
{ const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const q = await ctx.newPage(); const res = {};
  for (const w of [360, 375, 390, 412, 420]) { await q.setViewportSize({width: w, height: 844}); for (const r of ['meta', 'usage', 'sets']) { await q.goto('file://' + PAGE + '#' + r); await q.waitForTimeout(1500);
    res[r + '@' + w] = await q.evaluate(() => { const f = document.querySelector('#main .gs-facts'); if (!f) return 'no hero'; const hb = f.closest('.gs-spot').getBoundingClientRect(), rg = document.createRange();
      const ps = [...f.querySelectorAll(':scope > p')].map(p => { const s = [...p.querySelectorAll('span')].find(x => !x.classList.contains('vh')), v = p.querySelector('b'); rg.selectNodeContents(s); const a = rg.getBoundingClientRect(); rg.selectNodeContents(v); const c = rg.getBoundingClientRect();
        return {t: s.textContent.trim(), top: Math.round(s.getBoundingClientRect().top), lines: Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)), right: Math.max(a.right, c.right)}; });
      const share = ps.find(x => /teams/i.test(x.t)), spoken = (f.querySelector('.vh') || {}).textContent || '';
      return share && share.t === 'Of teams' && /of .*teams/.test(spoken) && ps.every(x => x.lines === 1 && x.top === ps[0].top && x.right <= hb.right + 0.5) ? 'ok' : ps.map(x => `${x.t}:${x.lines}L@${x.top}${x.right > hb.right + 0.5 ? ' past the hero' : ''}`).join('/') + (spoken ? '' : ' (no spoken label)'); }); } }
  const bad = Object.entries(res).filter(([, v]) => v !== 'ok');
  ok(!bad.length, `Sim Q2 A (Nov 17): the heroes' share reads "Of teams", every label on one line and level, inside the hero, 360-420 (${bad.length ? bad.slice(0, 4).map(([k, v]) => k + ' ' + v).join('; ') : '15 of 15 ok'})`);
// Sim Q5 B (Nov 17, audit v199 #20): the phone bar's five words sit on one line (the current page's word was 10.8px lower); its
// blue mark stays just above its word, and every tap target stays 44px or taller
  const bar = {}; for (const w of [320, 340, 360, 390, 412, 600, 699]) { await q.setViewportSize({width: w, height: 844}); for (const r of ['battle', 'meta']) { await q.goto('file://' + PAGE + '#' + r); await q.waitForTimeout(900);
    bar[r + '@' + w] = await q.evaluate(() => { const as = [...document.querySelectorAll('.np-bar a')]; if (!as.length || !as[0].getClientRects().length) return 'no bar'; const rg = document.createRange();
      const m = as.map(a => { const t = [...a.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); rg.selectNodeContents(t || a); const tb = rg.getBoundingClientRect(), ab = a.getBoundingClientRect(); return {top: tb.top, bottom: tb.bottom, h: ab.height, cur: a.getAttribute('aria-current') === 'page', at: ab.top}; });
      const c = m.find(x => x.cur), cs = c && getComputedStyle(as[m.indexOf(c)], '::before'), mb = c ? c.at + parseFloat(cs.top) + parseFloat(cs.height) : NaN, spread = Math.max(...m.map(x => x.top)) - Math.min(...m.map(x => x.top));
      return spread < 0.5 && m.every(x => x.h >= 44) && c && mb <= c.top && c.top - mb <= 8 ? 'ok' : `words ${spread.toFixed(1)}px apart, mark gap ${c ? (c.top - mb).toFixed(1) : '-'}, tap ${Math.min(...m.map(x => x.h)).toFixed(0)}px`; }); } }
  const bb = Object.entries(bar).filter(([, v]) => v !== 'ok');
  ok(!bb.length, `Sim Q5 B (Nov 17): the phone bar's five words sit on one line with the mark just above the current one, 320-699 (${bb.length ? bb.slice(0, 3).map(([k, v]) => k + ' ' + v).join('; ') : '14 of 14 ok'})`); await ctx.close(); }
{ /* audit v199 #18 (Sim, Nov 17: Option A), reskinned Nov 21 (Sim approved the "file" mock-up; docs/rebuild/reskin/27-pokemon.md): from 960
     the kit card sits left of the verdict, facts and set; under 960 the kit hero stacks (the card on top). The tier word under the score stays on
     one line, the facts in a row keep a clear gap (12px+), and the forms strip keeps its even tiles in full rows from 700 */
  const top = async (w, m) => { const q = await b.newPage({viewport: {width: w, height: 1000}}); await q.goto('file://' + PAGE + '#pokemon=' + m); await q.waitForTimeout(2200);
    const r = await q.evaluate(() => { const R = s => { const e = document.querySelector(s); return e && e.getBoundingClientRect(); }, c = R('.pk-card'), s = R('.pk-verdict'), /* Nov 21 (Sim, 6:46 PM): the fact tiles sit under the verdict, so at 960-1099 the set card can start below the hero card; the verdict is the right column's first part */ em = document.querySelector('.pk-rate .tier-tag'); /* .pk-is is display: contents from 960 (its parts sit in the hero grid) */
      const tx = e => { const g = document.createRange(); g.selectNodeContents(e); const a = [...g.getClientRects()]; return {l: Math.min(...a.map(x => x.left)), r: Math.max(...a.map(x => x.right)), t: Math.round(Math.min(...a.map(x => x.top))), n: new Set(a.map(x => Math.round(x.top))).size}; };
      const nb = [...document.querySelectorAll('.pk-is .k-facts b')].map(tx), pairs = nb.slice(1).map((x, i) => x.t === nb[i].t ? x.l - nb[i].r : null).filter(v => v != null);
      const fs = document.querySelector('.pk-forms'), fw = [...document.querySelectorAll('.pk-forms a')].map(a => a.getBoundingClientRect());
      return {side: !!(c && s && c.right <= s.left && c.top < s.bottom && s.top < c.bottom), tierLines: em ? tx(em).n : 0, gap: pairs.length ? Math.round(Math.min(...pairs)) : 99,
        forms: fw.length, formSpread: fw.length ? Math.round(Math.max(...fw.map(x => x.width)) - Math.min(...fw.map(x => x.width))) : 0, formRows: new Set(fw.map(x => Math.round(x.top))).size, formScroll: fs ? /auto|scroll/.test(getComputedStyle(fs).overflowX) && fs.scrollWidth > fs.clientWidth + 1 : false,
        formOut: fs && fw.length ? Math.round(Math.max(...fw.map(x => x.right)) - fs.getBoundingClientRect().right) : 0}; }); /* the slanted tiles' corners may stick out a few px */
    await q.close(); return r; };
  const t1024 = await top(1024, 'charizard'), t768 = await top(768, 'charizard'), t700 = await top(700, 'charizard-mega-y'), t700r = await top(700, 'rotom-wash'), t810 = await top(810, 'dragonite-mega'), t699 = await top(699, 'charizard');
  ok(t1024.side && !t768.side && !t699.side, `reskin (Nov 21): from 960 the card sits left of the verdict and set; under 960 it is on top (1024 ${t1024.side}, 768 ${t768.side}, 699 ${t699.side})`);
  ok(t768.forms === 3 && t768.formSpread <= 2 && t768.formRows === 1 && !t768.formScroll && t768.formOut <= 8, `audit #18 (Nov 17): at 768 the 3 forms are even tiles in one row (${JSON.stringify(t768)})`);
  ok([t700, t700r, t810, t1024].every(t => t.tierLines === 1 && t.gap >= 12), `audit #18: the tier word is on one line and the facts in a row are 12px+ apart (${[t700, t700r, t810, t1024].map(t => t.tierLines + ' line, gap ' + t.gap).join('; ')})`);
  ok(t700r.forms === 6 && t700r.formRows === 2 && t700r.formSpread <= 2 && !t700r.formScroll && t700r.formOut <= 8, `audit #18: six forms at 700 sit as 3 + 3 even tiles, nothing hidden off to the side (${JSON.stringify(t700r)})`);
  /* the widest score and tier ('80 A tier', '88 S tier'...) must stay inside the card at every width (it sits in the card's name row now) */
  const fit = async w => { const q = await b.newPage({viewport: {width: w, height: 1000}}); await q.goto('file://' + PAGE + '#pokemon=dragonite-mega'); await q.waitForTimeout(2200);
    const r = await q.evaluate(() => { const nb = document.querySelector('.pk-rate>b'), em = document.querySelector('.pk-rate .tier-tag'), cd = document.querySelector('.pk-card .k-plate'); let worst = -99, wv = '';
      for (const n of ['80', '88', '40', '11', '94']) for (const t of ['A', 'S', 'C', 'F']) { nb.textContent = n; em.textContent = t + ' tier'; const R = cd.getBoundingClientRect();
        const o = Math.max(...[...document.querySelectorAll('.pk-rate *')].map(e => e.getBoundingClientRect().right)) - R.right;
        if (o > worst) { worst = Math.round(o); wv = n + ' ' + t; } } return {worst, wv}; }); await q.close(); return r; };
  const f320 = await fit(320), f700 = await fit(700), f1024 = await fit(1024);
  ok(f320.worst <= 0 && f700.worst <= 0 && f1024.worst <= 0, `audit #18: the widest score and tier stay inside the card (px past it: 320 ${f320.worst} for ${f320.wv}, 700 ${f700.worst}, 1024 ${f1024.worst})`); }
{ /* audit v199 #19 (Sim, Nov 17: Option A): under 430 This Week's Most Used is a ranked 5-row list (rank, sprite, name, 'of teams', share right);
     it was 3 + 2 tiles whose slanted plates crossed. No name breaks mid-word at 320. 430 up keeps the strip of five tiles */
  const wk = async w => { const q = await b.newPage({viewport: {width: w, height: 900}}); await q.goto('file://' + PAGE + '#weekly'); await q.waitForTimeout(2000);
    const r = await q.evaluate(() => { const L = [...document.querySelectorAll('.wk-top li')], R = e => e.getBoundingClientRect(), vis = e => !!e && getComputedStyle(e).display !== 'none';
      const broken = []; for (const s of document.querySelectorAll('.wk-top .wk-tm span')) { const tn = s.firstChild; if (!tn || tn.nodeType !== 3) continue; let i = 0;
        for (const wd of tn.data.split(' ')) { const g = document.createRange(); g.setStart(tn, i); g.setEnd(tn, i + wd.length); if (wd && new Set([...g.getClientRects()].map(x => Math.round(x.top))).size > 1) broken.push(wd); i += wd.length + 1; } }
      const tops = new Set(L.map(e => Math.round(R(e).top))).size, lefts = new Set(L.map(e => Math.round(R(e).left))).size;
      const pr = L.map(e => Math.round(R(e).right - R(e.querySelector('.wk-tm b')).right)), rk = L.map(e => vis(e.querySelector('.wk-rk')) ? e.querySelector('.wk-rk').textContent : '').join('');
      return {n: L.length, rows: tops, cols: lefts, ranks: rk, ofTeams: L.filter(e => vis(e.querySelector('.wk-tm small'))).length, shareRight: Math.max(...pr), broken, hs: document.documentElement.scrollWidth - innerWidth}; }); await q.close(); return r; };
  const w390 = await wk(390), w320 = await wk(320), w429 = await wk(429), w430 = await wk(430), w1280 = await wk(1280);
  ok(w390.n === 5 && w390.rows === 5 && w390.cols === 1 && w390.ranks === '12345' && w390.ofTeams === 5 && w390.shareRight <= 4, `audit #19 (Nov 17): at 390 Most Used is a ranked list of 5 rows, 'of teams' under each name, the share on the right (${JSON.stringify(w390)})`);
  ok(w320.rows === 5 && w320.cols === 1 && !w320.broken.length && w320.hs <= 0 && w429.rows === 5 && !w429.broken.length, `audit #19: at 320 and 429 the list holds: 5 rows, no name broken mid-word, no sideways scroll (320 ${JSON.stringify(w320)})`);
  ok(w430.rows === 1 && w430.cols === 5 && !w430.ranks && !w430.ofTeams && w1280.rows === 1 && w1280.cols === 5 && !w1280.ranks, `audit #19: from 430 the five stay one strip of tiles, no ranks or 'of teams' (430 ${JSON.stringify(w430)}, 1280 rows ${w1280.rows})`); }
// The Post Room (#gifts, Nov 18): a test fixture (made-up gifts, set inside the page; post.js is never touched); each check fails on the skeleton page
{ const FX = `{checked: '2026-11-17', news: [], gifts: [{id: 'a', name: 'Training Ticket', amount: 2, how: 'Serial Code', code: 'AB1CD0E', start: '2026-11-01T00:00:00Z', end: '2026-11-22T23:59:00Z'},
    {id: 'b', name: 'Quick Coupons', amount: 100, how: 'Event Gift', start: '2026-11-01T00:00:00Z', end: '2026-12-31T23:59:00Z'}].concat(Array.from({length: 14}, (_, i) => i % 2
    ? {id: 'p' + i, kind: 'pokemon', mon: 'Incineroar', name: 'Incineroar', how: 'Event Gift', start: '2026-08-01T00:00:00Z', end: '2026-09-0' + (i % 9 + 1) + 'T23:59:00Z'}
    : {id: 'p' + i, kind: 'item', item: 'VP', name: 'VP', amount: 5000, how: 'Serial Code', start: '2026-08-01T00:00:00Z', end: '2026-09-0' + (i % 9 + 1) + 'T23:59:00Z'}))}`;
  const NOW = Date.parse('2026-11-17T17:00:00Z'), redraw = `const n = Date.now; Date.now = () => ${NOW}; try { V2.redraw(); } finally { Date.now = n; }`;
  const q = await b.newPage({viewport: {width: 1280, height: 900}, timezoneId: 'America/New_York'}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#gifts'); await q.waitForTimeout(2500); await q.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => true; });
  const draw = () => q.evaluate(([fx, r]) => window.__ev(`(() => { POST = ${fx}; V2.prUi = {f: 'all', all: false}; ${r} })()`), [FX, redraw]);
  await draw(); await q.waitForTimeout(500);
  const pr = await q.evaluate(() => { const m = document.querySelector('#main'), st = [...m.querySelectorAll('.pr-sw')];
    return {parcels: m.querySelectorAll('.pr-parcel').length, stamps: st.length, more: ((m.querySelector('[data-prmore]') || {}).textContent || '').trim(), rub: [...m.querySelectorAll('.pr-rub')].map(r => (r.className.match(/pr-(soon|plenty)/) || ['', '?'])[1] + ':' + r.textContent.trim()).join(' | '),
      code: (m.querySelector('.pr-parcel .pr-cv') || {}).innerHTML || '', spell: ((m.querySelector('.pr-spell') || {}).textContent || ''), nocode: ((m.querySelector('.pr-none') || {}).textContent || ''), codes: m.querySelectorAll('.pr-parcel .pr-cv').length,
      monBtn: st.filter(x => x.querySelector('button.pr-st[data-v2mon],button.pr-st[data-prset]')).length, itemDiv: st.filter(x => x.querySelector('div.pr-st')).length, cols: new Set(st.map(x => Math.round(x.getBoundingClientRect().left))).size}; });
  ok(pr.parcels === 2 && pr.stamps === 12 && /^Show All 14 Stamps/.test(pr.more), `Post Room: 2 live gifts make 2 parcels, 14 past gifts show 12 stamps and "Show All 14 Stamps" (${pr.parcels} parcels, ${pr.stamps} stamps, "${pr.more}")`);
  ok(pr.cols === 6 && pr.monBtn === 6 && pr.itemDiv === 6, `Post Room: six stamps across at 1280; Pokémon stamps are buttons, item stamps are not (${pr.cols} across, ${pr.monBtn} buttons, ${pr.itemDiv} items)`);
  ok(pr.rub === 'soon:5 days left | plenty:44 days left', `Post Room: days left count from the viewer's local day, red at 7 or fewer, blue above (Nov 17 in New York: ${pr.rub})`);
  ok(pr.code === 'AB<b class="pr-d">1</b>CD<b class="pr-d">0</b>E' && pr.spell === 'A, B, 1, C, D, 0, E', `Post Room: in the code only digits are blue, and screen readers get it spelled (${pr.code} / ${pr.spell})`);
  ok(pr.codes === 1 && /^No code: it waits in your in-game mailbox/.test(pr.nocode), `Post Room: a gift with no code shows no code area and says why (${pr.codes} code areas; "${pr.nocode}")`);
  await q.evaluate(() => document.querySelectorAll('.np-toast').forEach(t => t.remove())); if (await q.$('[data-prcopy]')) await q.click('[data-prcopy]'); await q.waitForTimeout(500);
  const t = await q.evaluate(() => [...document.querySelectorAll('.np-toast')].map(x => x.textContent).join(' | '));
  ok(t === 'Copied AB1CD0E', `Post Room: Copy Code uses the shared copy with its fallback (clipboard blocked) and says "Copied <code>" (${t || 'no toast'})`);
  await q.setViewportSize({width: 390, height: 844}); await q.waitForTimeout(400);
  const vis = () => q.evaluate(() => { const v = [...document.querySelectorAll('#main .pr-sheet > li')].filter(x => x.getClientRects().length); return `${new Set(v.map(x => Math.round(x.getBoundingClientRect().left))).size} across, ${v.length} spaces, ${v.filter(x => x.classList.contains('pr-blank')).length} blank`; });
  // Q43 A (Sim, Nov 19): a phone shows the first 6 (two full rows of 3) until "Show All N Stamps" (was 12; v2-q43.mjs checks the button)
  const ph = await vis(); ok(ph === '3 across, 6 spaces, 0 blank', `Post Room: three stamps across on a phone, the first 6 in two full rows (Q43) (${ph})`);
  await q.evaluate(r => window.__ev(`(() => { V2.prUi.all = true; ${r} })()`), redraw); await q.waitForTimeout(400);
  const ph2 = await q.evaluate(() => { const li = [...document.querySelectorAll('#main .pr-sheet > li')].filter(x => x.getClientRects().length), rows = {}; li.forEach(x => { const t = Math.round(x.getBoundingClientRect().top); rows[t] = (rows[t] || 0) + 1; }); return Object.values(rows).join('+') + (document.querySelector('#main .pr-blank') ? ' blank' : ''); });
  ok(ph2 === '3+3+3+3+2', `Post Room: with all 14 stamps on a phone, rows of 3 and a centred short row, no blank spaces (Sim, Nov 18) (${ph2})`);
  { // Sim, Nov 18: 7 stamps sit in one even row on desktop, 3 + 3 + 1 on a phone; no empty dashed spaces anywhere; stamps never wider than 220px
    const rowsAt = async w => { await q.setViewportSize({width: w, height: 900}); await q.evaluate(r => window.__ev(`(() => { POST.gifts = POST.gifts.slice(0, 2).concat(Array.from({length: 7}, (_, i) => ({id: 's' + i, name: 'Stamp ' + i, amount: 10, how: 'Serial Code', start: '2026-0' + (i + 1) + '-01T00:00:00Z', end: '2026-0' + (i + 2) + '-01T00:00:00Z'}))); V2.prUi.all = false; V2.prUi.f = 'all'; ${r} })()`), redraw); await q.waitForTimeout(400);
      return q.evaluate(() => { const li = [...document.querySelectorAll('#main .pr-sheet > li')].filter(x => x.getClientRects().length), rows = {}; li.forEach(x => { const t = Math.round(x.getBoundingClientRect().top); rows[t] = (rows[t] || 0) + 1; });
        return Object.values(rows).join('+') + (document.querySelector('#main .pr-blank') ? ' blank' : '') + (Math.max(...li.map(x => x.getBoundingClientRect().width)) > 220.5 ? ' wide' : ''); }); };
    const seven = []; for (const [w, want] of [[390, '3+3'], [820, '4+3'], [1440, '7'], [2560, '7']]) { const got = await rowsAt(w); if (got !== want) seven.push(`${w}: ${got} (want ${want})`); }
    ok(!seven.length, `Post Room: 7 stamps in even rows (one row of 7 on desktop; on a phone 3+3 until Show All, Q43), no blank spaces, none wider than 220px (${seven.join(' | ') || 'all as planned'})`); }
  await q.evaluate(() => { localStorage.setItem('np2.theme', 'night'); }); await q.reload(); await q.waitForTimeout(2500); await draw(); await q.waitForTimeout(400);
  const dim = await q.evaluate(() => { const e = document.querySelector('#main .pr-label'); if (!e) return {theme: document.documentElement.dataset.theme, label: 'none'}; const c = getComputedStyle(e).backgroundColor.match(/\d+/g).map(Number), pg = getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number), L = a => (a[0] * .3 + a[1] * .59 + a[2] * .11) / 255; return {label: L(c).toFixed(2), page: L(pg).toFixed(2), theme: document.documentElement.dataset.theme}; });
  ok(dim.theme === 'night' && +dim.label > .75 && +dim.page < .2, `Post Room "Dim Paper": at night the page is dark and the label stays paper (lightness label ${dim.label}, page ${dim.page})`);
  await q.evaluate(() => window.__ev(`(() => { POST = {checked: null, news: [], gifts: [{id: 'old', name: 'VP', amount: 10, how: 'Serial Code', start: '2026-01-01T00:00:00Z', end: '2026-02-01T00:00:00Z'}]}; V2.redraw(); })()`)); await q.waitForTimeout(400);
  const em = await q.evaluate(() => { const m = document.querySelector('#main'); return {shelf: ((m.querySelector('.pr-shelf') || {}).textContent || '').replace(/\s+/g, ' ').trim(), stamps: m.querySelectorAll('.pr-sw').length, plate: ((m.querySelector('.pr-stats .ev-pk') || {}).textContent || '')}; });
  ok(/Nothing at the counter right now\.\s*The next gift will wait here\./.test(em.shelf) && em.stamps === 1 && em.plate === 'Nothing live right now', `Post Room empty state: no live gift shows the empty shelf and its line, and the stamp sheet still shows (${JSON.stringify(em)})`);
  await q.close(); }
// Stampede tools band (Nov 18; docs/rebuild/stampede/BRIEF.md section 3): live data, every tool reachable, every row full, nothing spills
{ const q = await b.newPage({viewport: {width: 1440, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const d = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('#main .sdt'); if (!s) return JSON.stringify({none: true});
    const go = [...s.querySelectorAll('.sdt-go')].map(a => [a.dataset.sdtool, a.getAttribute('href')]), more = [...s.querySelectorAll('.sdt-more a')].map(a => [a.dataset.sdtool, a.getAttribute('href')]);
    const want = V2.HOME_TOOLS.map(([n, , to]) => n + '>#' + to).sort().join('|'), got = go.concat(more).map(([n, h]) => n + '>' + h).sort().join('|');
    const R = lairRows().filter(x => x.r.tc), top9 = R.slice(0, 9).map(x => ({n: x.p.n, s: x.p.st[5]})).sort((a, b) => a.s - b.s).map(x => x.n);
    const race = [...s.querySelectorAll('.sdt-run')].map(e => e.dataset.v2mon);
    const TY = [...s.querySelectorAll('.sdt-types li')].map(li => [li.querySelector('.sdt-flag').textContent.trim(), (li.querySelector('[data-v2mon]') || {}).dataset ? li.querySelector('[data-v2mon]').dataset.v2mon : '']);
    const tyOk = TY.length === 18 && TY.every(([t, n]) => !n) && !/Under each flag/.test(s.querySelector('.sdt-tc').textContent); const tc = s.querySelector('.sdt-tc').getBoundingClientRect(), ra = s.querySelector('.sdt-ra').getBoundingClientRect(), dc = s.querySelector('.sdt-dc').getBoundingClientRect(); const tyRow = Math.abs(tc.width - ra.width) < 2 && Math.abs(tc.top - ra.top) < 2 && Math.abs(dc.top - ra.top) < 2;
    const pod = [...s.querySelectorAll('.sdt-step')].map(e => [e.className.match(/s(\\d)/)[1], e.querySelector('.sdt-blk b').textContent]);
    const tieOk = pod.length === 3 && pod.every(a => pod.every(b => (a[1] === b[1]) === (a[0] === b[0])));
    const big = [...s.querySelectorAll('.sdt-big b')].map(e => e.textContent.replace(/,/g, ''));
    return JSON.stringify({plates: go.length, toolsOk: want === got, raceOk: race.length === 9 && race.join() === top9.join(), tyOk, tyRow, tieOk, pod, nums: big.join('/') === META.events.events.length + '/' + RES.teams, big}); })()`));
  const m = JSON.parse(d);
  ok(m.plates === 12 && m.toolsOk, `Stampede tools (Nov 18): twelve plates and a More tools row reach all ${''}18 of today's Home tools, same pages (${m.plates} plates, match ${m.toolsOk})`);
  ok(m.raceOk && m.tyOk && m.tyRow, `Stampede tools: Speed Tiers is the nine highest rated by base Speed; Type Chart is 18 flags only, no Pokémon (Sim, Nov 18: A), as wide as Ratings, with Damage Calc on the same row (race ${m.raceOk}, types ${m.tyOk}, row ${m.tyRow})`);
  ok(m.tieOk && m.nums, `Stampede tools: tied ratings share a podium step; Events and How We Calculate show the Events page's count and RES.teams (${JSON.stringify(m.pod)}, ${JSON.stringify(m.big)})`);
  const lay = []; for (const [w, th] of [[320, 'day'], [390, 'night'], [820, 'day'], [1100, 'night'], [1440, 'day']]) { await q.evaluate(t => { try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th); await q.setViewportSize({width: w, height: 900}); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(1800);
    await q.evaluate(() => document.fonts.ready.then(() => 1)); await q.waitForTimeout(200); /* measure in the real fonts: a fallback font is wider (a name 'spilling' under load, Nov 18) */
    lay.push(w + ': ' + await q.evaluate(() => { const s = document.querySelector('#main .sdt'); if (!s) return 'no band'; const out = []; if (document.documentElement.scrollWidth > innerWidth) out.push('sideways');
      for (const e of s.querySelectorAll('.sdt-mn,.sdt-t a,.sdt-d span,.sdt-blk b,.sdt-flag span,.sdt-item,.sdt-big b,.sdt-spe,.sdt-chip')) { if (!e.getClientRects().length) continue; if (parseFloat(getComputedStyle(e).fontSize) < 13) out.push('under 13px');
        const box = (e.closest('.sdt-m') ? e.parentElement : e.closest('.sdt-p')).getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e);
        if ([...rg.getClientRects()].some(r => r.width && (r.left < box.left - 1 || r.right > box.right + 1))) out.push('spills: ' + e.textContent.slice(0, 16)); }
      const g = s.querySelector('.sdt-grid'), gb = g.getBoundingClientRect(), rows = {}; for (const c of [...g.children].filter(c => c.getClientRects().length) /* phones hide six plates (Sim, Nov 18: Tools B) */) { const r = c.getBoundingClientRect(); (rows[Math.round(r.top / 4)] = rows[Math.round(r.top / 4)] || []).push(r); }
      for (const rs of Object.values(rows)) if (Math.min(...rs.map(r => r.left)) - gb.left > 2 || gb.right - Math.max(...rs.map(r => r.right)) > 2) out.push('row not full');
      return out.length ? out.join(', ') : 'ok'; })); }
  ok(lay.every(x => / ok$/.test(x)), `Stampede tools: at 320 / 390 / 820 / 1100 / 1440 (day and night) no sideways scroll, no text under 13px or out of its spot, every row of plates full (${lay.join(' | ')})`);
  await q.evaluate(() => { try { localStorage.removeItem('np2.theme'); } catch (e) {} }); await q.close(); }
/* Stampede tile fixes (polish sweep Nov 18 night, defects 2-5; docs/rebuild/audits/polish-sweep-nov18-night.md). Each failed on the build before. */
{ const q = await b.newPage({viewport: {width: 1440, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const bt = [], tr = [], dc = [], bars = [], tags = [];
  for (const w of [320, 390, 520, 700, 820, 880, 1024, 1100, 1180, 1280, 1366, 1440, 1500, 1920, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(350); await q.evaluate(() => document.fonts.ready.then(() => 1));
    const m = await q.evaluate(() => { const R = e => e.getBoundingClientRect(), o = {bt: '', tr: '', dc: '', bars: ''};
      /* 2. Battle: every sprite inside its own side (you / them), none in the VS's box, none under 56px */
      const vs = document.querySelector('#main .sdt-vsw'); if (!vs) o.bt = 'no VS'; else { const V = R(vs);
        for (const s of document.querySelectorAll('#main .sdt-side')) { const S = R(s); for (const st of s.querySelectorAll('.np-mon .st')) { const r = R(st);
          if (r.left < S.left - 1 || r.right > S.right + 1) o.bt = `sprite ${Math.round(r.left)}-${Math.round(r.right)} out of its side ${Math.round(S.left)}-${Math.round(S.right)}`;
          else if (r.right > V.left + 1 && r.left < V.right - 1) o.bt = 'sprite over the VS'; else if (r.width < 56) o.bt = `sprite ${Math.round(r.width)}px`; } }
        /* and every name shown under a sprite is on top: the middle of each of its lines hits the name itself, not a neighbour's sprite */
        vs.scrollIntoView({block: 'center'}); for (const mn of document.querySelectorAll('#main .sdt-side .sdt-mn')) { if (!mn.getClientRects().length) continue; const rg = document.createRange(); rg.selectNodeContents(mn);
          for (const l of rg.getClientRects()) { if (!l.width) continue; const hit = document.elementFromPoint(l.left + l.width / 2, l.top + l.height / 2); if (!hit || !mn.contains(hit)) o.bt = `name "${mn.textContent}" covered`; } } }
      /* 3. Test Run (Sim, Nov 18: Team Preview Practice took its plate, so the same rule is checked on Practice's picture): no empty middle
         (the space the sprites leave between the plate's top and its words, 32px at most), no sprite under 44px */
      const t = document.querySelector('#main .sdt-tr, #main .sdt-pp'); if (!t) o.tr = 'no picture'; else { const P = R(t.closest('.sdt-p')), X = R(t.closest('.sdt-p').querySelector('.sdt-tx')), S = [...t.querySelectorAll('.np-mon .st')].map(R);
        const empty = Math.round(X.top - Math.max(...S.map(r => r.bottom), t.classList.contains('sdt-pp') ? R(t).bottom : 0 /* Practice's "Pick 4" is part of its picture */) - 12 + Math.max(0, Math.min(...S.map(r => r.top)) - P.top)), small = Math.round(Math.min(...S.map(r => r.width)));
        if (empty > 32 || small < 44) o.tr = `empty ${empty}px, smallest sprite ${small}px`; }
      /* 4. Damage Calc: the spare height is shared above and below the picture (within 8px), or there is none to speak of (24px at most) */
      const h = document.querySelector('#main .sdt-hit'); if (innerWidth < 1100) {} /* phones and iPads (Sim, Nov 18: Tools B): a half tile with its picture on top, by design */ else if (!h) o.dc = 'no picture'; else { const p = h.closest('.sdt-p'), P = R(p), H = R(h), X = R(p.querySelector('.sdt-tx')), pb = parseFloat(getComputedStyle(p).paddingBottom);
        const up = Math.round(H.top - X.bottom - (parseFloat(getComputedStyle(p).rowGap) || 0)), down = Math.round(P.bottom - pb - H.bottom); if (Math.abs(up - down) > 8 && Math.max(up, down) > 24) o.dc = `${up}px above, ${down}px below`; }
      /* 5. the receipt's five band bars: one width (untransformed, within 1px) */
      const B = [...document.querySelectorAll('#main .sds-b i')].map(e => e.offsetWidth); if (B.length !== 5) o.bars = B.length + ' bars'; else if (Math.max(...B) - Math.min(...B) > 1) o.bars = B.join('/');
      /* the plan board's name tags: the whole slanted tag 4px or more inside the board, clear of its folded top-right corner (24px), 13px or more */
      o.tags = ''; const tg = [...document.querySelectorAll('#main .sds-tg')].filter(e => e.getClientRects().length); if (!tg.length) o.tags = 'no tags';
      for (const t of tg) { const Bd = R(t.closest('.sds-board')), r = R(t), fold = Math.max(0, 24 - (r.top - Bd.top)), f = parseFloat(getComputedStyle(t).fontSize);
        if (f < 13 || r.left < Bd.left + 3.5 || r.right > Bd.right - 3.5 - fold) { o.tags = `${t.textContent} ${Math.round(r.left - Bd.left)}px / ${Math.round(Bd.right - fold - r.right)}px from the edge, ${f}px`; break; } }
      return o; });
    for (const [k, a] of [['bt', bt], ['tr', tr], ['dc', dc], ['bars', bars], ['tags', tags]]) if (m[k]) a.push(w + ': ' + m[k]); }
  ok(!bt.length, `Stampede tiles 2 (Nov 18 night): Battle, at 320-2560 every sprite stays inside its side, clear of the VS, and is 56px or more; no name under a sprite${bt.length ? ': ' + bt.slice(0, 4).join(' | ') : ''}`);
  ok(!tr.length, `Stampede tiles 3: Test Run, at 320-2560 the sprites fill the plate (32px or less left empty between its top and its words) and none is under 44px${tr.length ? ': ' + tr.slice(0, 4).join(' | ') : ''}`);
  ok(!dc.length, `Stampede tiles 4: Damage Calc, at 1100-2560 (phones and iPads: Tools B puts the picture on top) the picture sits in the middle of the spare height (no empty band only above it)${dc.length ? ': ' + dc.slice(0, 4).join(' | ') : ''}`);
  ok(!bars.length, `Stampede tiles 5: the receipt's five band bars are one width at 320-2560${bars.length ? ': ' + bars.slice(0, 4).join(' | ') : ''}`);
  ok(!tags.length, `Stampede tags (qcheck triage Nov 18, defect 2): every plan-board name tag ("Mega Charizard Y") fits whole inside the board, clear of its folded corner, at 13px or more, 320-2560${tags.length ? ': ' + tags.slice(0, 4).join(' | ') : ''}`);
  await q.close(); }
{ /* The Champions Dispatch (#news; Sim, Nov 18, docs/rebuild/dispatch/BRIEF.md). Each check fails on the skeleton page (one h1, no paper). */
  const q = await b.newPage({viewport: {width: 1440, height: 1000}});
  /* a page without the Dispatch (the skeleton) answers with {err}, so each check prints FAIL instead of stopping the run */
  const qe = (f, x) => q.evaluate(f, x).catch(e => ({err: String(e.message).split('\n')[0].slice(0, 80)})), qc = s => q.click(s, {timeout: 3000}).catch(() => {}); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#news'); await q.waitForTimeout(2500);
  const d1 = await qe(() => { const a = [...document.querySelectorAll('.dp-paper .dp-hl')]; return {n: a.length, bad: a.filter(x => !x.href || x.target !== '_blank' || !/noopener/.test(x.rel)).length}; });
  ok(d1.n >= 5 && d1.bad === 0, `DP-1: every front-page headline links to its source in a new tab with rel=noopener (${JSON.stringify(d1)})`);
  const bal = await qe(() => window.__ev(`(() => [V2.dpMaint({t: 'Wednesday, December 2, 2026 Battle Balance Adjustments', type: 'Maintenance'}), V2.dpMaint({t: 'Maintenance Notice', type: 'Maintenance'}), V2.dpMaint({t: 'Server maintenance', type: 'Maintenance'})].join(','))()`));
  ok(bal === 'false,true,true', `DP: a balance change filed under Maintenance is news (can lead the front page); plain maintenance notices stay off the front (${bal})`);
  const d2 = await qe(() => window.__ev(`(() => { const D = V2.dpParts(V2.postNow()), shown = [...document.querySelectorAll('.dp-paper .dp-hl')].map(a => a.textContent.replace(/\\s*\\(opens[^)]*\\)\\s*$/, '').replace(/\\u2060/g, '').trim());
    const maint = shown.filter(t => /^Maintenance( Completion)? Notice$/i.test(t)).length, others = D.all.filter(x => !V2.dpMaint(x)).length;
    const earl = (document.querySelector('[data-dpmore]') || {}).textContent || '', n = +((earl.match(/(\\d[\\d,]*) more stor/) || [])[1] || '-1').replace(/,/g, '');
    return {maint, others, shown: shown.length, all: D.all.length, earlier: n}; })()`));
  ok(d2.others > 0 && d2.maint === 0 && d2.earlier === d2.all - d2.shown, `DP-2: no maintenance notice on the front while other stories exist; Earlier Editions counts every story not on the front (${JSON.stringify(d2)})`);
  const d3 = await qe(() => window.__ev(`(() => { const rows = lairRows().filter(x => x.r && x.r.tc).slice(0, 5).map(x => (lairRank(x.p) || {}).rank + ' ' + x.p.d + ' ' + monRating(x.p).n);
    const seen = [...document.querySelectorAll('.dp-tb .dp-row')].map(r => r.querySelector('.dp-rk1').textContent + ' ' + r.querySelector('.dp-rn').textContent.replace(/\\u00a0/g, ' ') + ' ' + r.querySelector('.dp-rv').textContent);
    const c = homeChamp(), ev = (document.querySelector('.dp-evt') || {}).textContent || '', six = [...document.querySelectorAll('.dp-six [data-v2mon]')].map(x => x.dataset.v2mon).join(',');
    const S = POST.series || [], G = POST.gifts || [], lead = V2.dpParts(V2.postNow()).lead, all = V2.dpParts(V2.postNow()).all, yr = ((S.find(r => lead && r.src === lead.url) || all.map(x => S.find(r => r.src && r.src === x.url)).find(Boolean) || {}).month || 'none').slice(0, 4); /* the lead's round, else the newest round in the news (Nov 18: a balance notice can lead) */
    const cells = [...document.querySelectorAll('.dp-rd')].map(li => { const m = li.querySelector('[data-v2mon]'); return m ? m.dataset.v2mon : ''; }).join(',');
    return {rows: rows.join('|'), seen: seen.join('|'), ev: ev === V2.evTitle(c.ev.name), six: six === c.t.mons.map(m => m.n).join(','), series: cells, want: S.filter(r => r.month.startsWith(yr)).map(r => r.mon || (G.find(g => g.id === r.gift) || {}).mon || '').join(',')}; })()`));
  ok(!!d3.seen && d3.seen.split('|').length === 5 && d3.rows === d3.seen, `DP-3: Top Ratings are the Ratings page's top five, shared ranks and shown ratings (${d3.seen})`);
  ok(d3.ev && d3.six, `DP-4: Latest Result is homeChamp(): the same event name and the winner's six (${JSON.stringify({ev: d3.ev, six: d3.six})})`);
  ok(d3.series && d3.series === d3.want, `DP-5: the series row shows each round's gift from POST.series, in order (${d3.series} vs ${d3.want})`);
  const nx = await qe(() => (((document.querySelector('.dp-fix [data-dpcal]') || {}).textContent || '').match(/All (\d+) Next Events/) || [])[1] || 'none');
  await qc('.dp-fix [data-dpcal]'); await q.waitForTimeout(1500);
  const ev = await qe(() => ({hash: location.hash, n: [...document.querySelectorAll('.ev-plate .ev-cal li')].length}));
  ok(ev.hash === '#events' && String(ev.n) === nx, `DP-6: 'All ${nx} Next Events' opens Events with the same ${ev.n} upcoming events listed (${JSON.stringify(ev)})`);
  /* a gift live for five more days (a test POST through the test hook; never in post.js): the coupon, its blue digits and Copy Code with the clipboard blocked */
  await q.goto('file://' + PAGE + '#news'); await q.waitForTimeout(2000);
  const cp = await qe(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => true;
    return window.__ev(`(() => { const keep = POST; window.__dpKeep = keep; POST = {checked: null, gifts: [{name: 'Test Gift', code: 'AB1CD0', how: 'Serial Code', start: new Date(Date.now() - 864e5).toISOString(), end: new Date(Date.now() + 5 * 864e5).toISOString()}],
      news: [{title: 'Test lead', date: new Date(Date.now() - 864e5).toISOString(), type: 'Tournament', url: 'https://example.org/t', end: new Date(Date.now() - 36e5).toISOString()}]}; V2.redraw();
      const c = document.querySelector('.dp-cpn'); return {nums: [...c.querySelectorAll('.pr-cv .pr-d')].map(x => x.textContent).join(''), code: (c.querySelector('.pr-cv') || {}).textContent, said: (c.querySelector('.pr-spell') || {}).textContent, upright: getComputedStyle(c.querySelector('.pr-cv')).fontStyle, bar: !!c.querySelector('.dp-bar2'), btn: (b => b ? [getComputedStyle(b).backgroundColor, getComputedStyle(c).backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(c.closest('.dp-paper')).backgroundColor : getComputedStyle(c).backgroundColor] : null)(c.querySelector('[data-prcopy].np-btn')), left: /5 days left/.test(c.textContent), stamp: !!document.querySelector('.dp-stamp'), post: (document.querySelector('.dp-pk') || {}).textContent || ''}; })()`); });
  await qe(() => document.querySelectorAll('.np-toast').forEach(t => t.remove())); await qc('.dp-cpn [data-prcopy]'); await q.waitForTimeout(500);
  const toast = await qe(() => [...document.querySelectorAll('.np-toast')].map(t => t.textContent).join(''));
  ok(cp.nums === '10' && cp.code === 'AB1CD0' && cp.left && /1 gift waiting/.test(cp.post), `DP-7: the coupon shows the live gift's code as text, digits blue, days left, and In the Post counts it (${JSON.stringify(cp)})`);
  ok(cp.said === 'A, B, 1, C, D, 0' && cp.upright === 'normal' && !cp.bar && !!cp.btn && cp.btn[0] !== 'rgb(255, 255, 255)' && cp.btn[0] !== cp.btn[1], `DP-7b (Nov 18): the coupon uses the Post Room's code (upright, spelled for screen readers) and its ink Copy Code button straight on the coupon, not a white box in a black bar (${JSON.stringify({said: cp.said, upright: cp.upright, bar: cp.bar, btn: cp.btn})})`);
  ok(cp.stamp, 'DP-8: an ended lead story carries the Ended stamp');
  ok(/copied/i.test(toast), `DP-9: Copy Code copies through the fallback when the clipboard API is blocked (toast: ${toast})`);
  await qe(() => window.__ev('POST = window.__dpKeep; V2.redraw()'));
  /* Lamplight and day: the paper stays cream and every text on it reads at 4.5:1 or better (WCAG AA), on its own background */
  for (const th of ['day', 'night']) { await qe(t => { localStorage.setItem('np2.theme', t); }, th); await q.reload(); await q.waitForTimeout(2200);
    const k = await qe(() => { const rgb = s => (s.match(/[\d.]+/g) || []).map(Number), L = c => { const v = c.slice(0, 3).map(x => x / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
      const paper = rgb(getComputedStyle(document.querySelector('.dp-paper')).backgroundColor.replace(/.*,\s*(rgb[^)]*\))\s*$/, '$1')), bgOf = e => { for (let a = e; a; a = a.parentElement) { const s = getComputedStyle(a); const c = rgb(s.backgroundColor); if (a.classList.contains('dp-paper')) return rgb(s.backgroundColor.match(/rgb\([^)]*\)\s*$/) ? s.backgroundColor.match(/rgb\([^)]*\)\s*$/)[0] : s.backgroundColor); if (c.length >= 3 && (c.length === 3 || c[3] > .5)) return c; } return [255, 255, 255]; };
      let worst = 99, at = ''; for (const e of document.querySelectorAll('.dp-paper *')) { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; if (e.closest('.vh,[aria-hidden="true"]') || !e.getClientRects().length) continue;
        const f = rgb(getComputedStyle(e).color), g = bgOf(e), a = L(f), z = L(g), r = (Math.max(a, z) + .05) / (Math.min(a, z) + .05); if (r < worst) { worst = Math.round(r * 100) / 100; at = e.className + ' "' + e.textContent.trim().slice(0, 20) + '"'; } }
      return {paperL: Math.round(L(paper) * 100) / 100, worst, at}; });
    ok(k.paperL > .6 && k.worst >= 4.5, `DP-10 (${th}): the paper stays light (luminance ${k.paperL}) and its least-contrast text is ${k.worst}:1 (${k.at})`); }
  await qe(() => localStorage.setItem('np2.theme', 'day'));
  /* every width: no sideways scroll, the name inside the paper, nothing sticking out of the paper */
  const out = []; for (const w of [320, 412, 768, 1100, 1366, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(400);
    const m = await qe(() => { const p = document.querySelector('.dp-paper').getBoundingClientRect(), h = document.querySelector('.dp-name'); let spill = 0, what = '';
      for (const e of document.querySelectorAll('.dp-paper *')) { const r = e.getBoundingClientRect(); if (!r.width || e.closest('.vh')) continue; const o = Math.max(p.left - r.left, r.right - p.right); if (o > spill + .5) { spill = Math.round(o); what = e.className; } }
      return {hs: document.documentElement.scrollWidth - innerWidth, name: h.scrollWidth - h.clientWidth, spill, what}; });
    if (m.err || m.hs > 0 || m.name > 0 || m.spill > 0) out.push(w + ':' + JSON.stringify(m)); }
  ok(!out.length, `DP-11: 320 to 2560 wide: no sideways scroll, the name fits, nothing spills out of the paper (${out.join(' ') || 'all clean'})`);
  /* the piece for Home's post band */
  const sm = await qe(() => window.__ev(`(() => { const d = document.createElement('div'); d.style.width = '340px'; d.innerHTML = V2.dpFront(V2.postNow(), {compact: true}); document.querySelector('#main').append(d);
    const p = d.querySelector('.dp-small'), r = p ? p.getBoundingClientRect() : null, o = p ? Math.max(...[...p.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - r.right : 99;
    const res = {small: !!p, lead: !!(p && p.querySelector('.dp-lh .dp-hl[href]')), bar: !!(p && p.querySelector('.dp-nbar')), more: p ? [...p.querySelectorAll('.dp-more li')].filter(li => li.getClientRects().length).length : 0, over: Math.round(o)}; d.remove(); return res; })()`));
  ok(sm.small && sm.lead && sm.bar && sm.more === 2 && sm.over <= 0, `DP-12: V2.dpFront(post, {compact: true}) draws the small paper (lead link, two more stories in a 340 slot, Next event bar, nothing out of it) (${JSON.stringify(sm)})`);
  await q.close(); }
/* Audit Nov 19 #4 (C3): Damage Calc's KO Board wings at 1100 and 1280: each caption counts exactly the tiles under it (it counted the whole board:
   "18 down in one hit" over 15 tiles, "8 can go down · 4 survive" over 15 with 3 KO), and stays on one line. Three teams (the sample, a review team,
   a bulky team with few KOs), both directions ("Your hits on them" and "Their hits on you") */
{ const bad = [], seen = []; /* the Arena (Nov 19): the wings are gone; the counts now sit on the KO Board bar over the whole board, so the bar's line must count exactly the board's tiles */ const wk = q => q.evaluate(() => [...document.querySelectorAll('.arn-kb')].filter(w => w.getClientRects().length).map(w => { const cap = w.querySelector('.arn-kbbar .c'), t = cap.textContent, n = k => w.querySelectorAll('.dc2-kts .dc2-kt' + k).length + document.querySelectorAll('.arn-kbfull .kob-r' + k).length; /* Q58 C (Sim, Nov 19): from 1024 the opened board's rows sit under the Arena (.arn-kbfull), outside the bar's <details> */
    const num = re => { const m = t.match(re); return m ? +m[1] : 0; }, said = {ko: num(/(\d+) (?:KO|down in one hit)/), can: num(/(\d+) can go down/), sv: num(/(\d+) survive/)}, has = {ko: n('.ko'), can: n('.can'), sv: n('.sv')};
    return {t, all: n(''), said, has, lines: Math.round(cap.getBoundingClientRect().height / parseFloat(getComputedStyle(cap).lineHeight)), vh: cap.classList.contains('vh'), facts: (() => { const st = w.closest('.k-step'); return st ? [...st.querySelectorAll('.k-facts b')].map(b => +b.textContent.replace(/\D/g, '')) : []; })()}; /* Calc reskin (Sim, Nov 21): the bar is the pink OPEN THE KO BOARD. with its counts for screen readers; the counts on screen are the step's facts */ }));
  for (const team of [null, ['Incineroar', 'Garchomp', 'Sneasler', 'Kingambit', 'Basculegion', 'Sinistcha'], ['Sinistcha', 'Clefable', 'Blissey', 'Hatterene', 'Amoonguss', 'Farigiraf']]) for (const W of [1100, 1280]) {
    const c = await b.newContext({viewport: {width: W, height: 900}}), q = await c.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(1800);
    if (team) { await q.locator('[data-v2more]').first().click(); await q.waitForTimeout(400); await q.locator('.np-sheet [data-v2import]').first().click(); await q.waitForTimeout(400);
      await q.fill('[data-impin]', team.join('\n\n')); await q.locator('[data-impgo]').click(); await q.waitForTimeout(1200); }
    await q.evaluate(() => { location.hash = '#calc'; }); await q.waitForTimeout(1800); await q.evaluate(() => { const d = document.querySelector('.arn-kb'); if (d) d.open = true; }); await q.waitForTimeout(600);
    for (const dir of ['mine', 'theirs']) { if (dir === 'theirs') { await q.locator('[data-dcdir="theirs"]').first().click(); await q.waitForTimeout(1200); }
      const ws = await wk(q), tag = `${team ? team[0] : 'sample'} ${W} ${dir}`; if (ws.length !== 1) { bad.push(`${tag}: ${ws.length} KO Board bars`); continue; }
      for (const w of ws) { seen.push(w.t); if (['ko', 'can', 'sv'].some(k => w.said[k] !== w.has[k]) || w.said.ko + w.said.can + w.said.sv !== w.all || (w.vh ? !(w.facts.length === 3 && w.facts[0] === w.has.ko && w.facts[1] === w.has.can && w.facts[2] === w.has.sv) : w.lines !== 1)) bad.push(`${tag}: "${w.t}" over ${w.has.ko} KO / ${w.has.can} can / ${w.has.sv} survive (${w.lines} lines)`); } }
    await c.close(); }
  /* Audit Nov 19 #5 (C3, word list): Usage's hero card vs the Podium's key line, for each source chip. When the chosen list has no shares
     (no % on the Podium) but the hero shows one, or the list has no win rate for its #1 (data: metaDoc().top[0].w) but the hero shows one,
     the key line names where they come from (Online tournaments) and never says the page "gives no percentages" */
  { const us = [], ctx = await b.newContext({viewport: {width: 820, height: 900}}), q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#usage'); await q.waitForTimeout(2000);
    for (const s of ['ingame', 'tour', 'ladder']) { if (!await q.locator(`[data-ussrc="${s}"]:not([disabled])`).count()) { us.push([s, 'chip off', false]); continue; } await q.locator(`[data-ussrc="${s}"]`).first().click(); await q.waitForTimeout(800);
      const r = await q.evaluate(() => { const f = [...document.querySelectorAll('.ra-spot .gs-facts p')].map(p => p.innerText.replace(/\s+/g, ' ')), share = f.some(t => /Of teams\s*[\d.]+%/.test(t)), win = f.some(t => /Win rate\s*[\d.]+%/.test(t));
        const podPct = [...document.querySelectorAll('.us-sheet .ten .us-nums')] /* kit reskin proposal (Nov 22): the top-ten rows (were the podium and benches) */.some(e => /%/.test(e.textContent)), listW = !!(window.__ev ? window.__ev('(metaDoc().top[0] || {}).w') : null), key = document.querySelector('.gs-key').textContent;
        return {share, win, podPct, listW, key}; });
      const needU = r.share && !r.podPct, needW = r.win && !r.listW, named = /from Online tournaments/.test(r.key);
      us.push([s, r.key, (needU || needW ? named : true) && !(r.share && /gives no percentages/.test(r.key)) && (!needU || /share/.test(r.key)) && (!needW || /win rate/.test(r.key))]); }
    await ctx.close(); ok(us.length === 3 && us.every(x => x[2]), `Audit Nov 19 #5: Usage's key line names the source of any hero number the chosen list doesn't give, and never says "no percentages" beside one (${us.map(x => x[0] + ': "' + x[1] + '"' + (x[2] ? '' : ' WRONG')).join(' | ')})`); }
  ok(seen.length === 12 && !bad.length, `Audit Nov 19 #4 (the Arena since Nov 19: one bar, not two wings): the KO Board bar's counts are exactly the board's tiles, on one line (3 teams x 1100/1280 x both directions; ${bad.join(' | ') || 'e.g. "' + seen.slice(0, 2).join('" / "') + '"'})`); }
} // main1 end
if (part('main2')) {
// ---------- Home, The Stampede: the hero band (Nov 18; app/src/v2/pages/stampede-hero.js, css/sd-hero.css, sd-shared.css) ----------
{ const hero = async (w, h, o = {}) => { const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: w < 700, reducedMotion: o.rm || "no-preference"}); const q = await ctx.newPage();
    await q.addInitScript(e => { window.__PL_TEST = 1; if (e) try { localStorage.clear(); } catch (x) {} }, !!o.empty); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
    if (o.empty) await q.evaluate(() => window.__ev(`(() => { S.slots = S.slots.map(() => blank()); render(); })()`)); if (o.night) await q.evaluate(() => V2.setTheme('night'));
    if (o.wait) await q.waitForFunction(() => document.querySelectorAll('#main .sdh-c').length > 0, null, {timeout: 20000}).catch(() => {}); await q.waitForTimeout(400);
    const r = await q.evaluate(o.fn || (() => { const g = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const x = e.getBoundingClientRect(); return {t: Math.round(x.top), b: Math.round(x.bottom), l: Math.round(x.left), r: Math.round(x.right)}; };
      const bar = document.querySelector('.np-bar'), fold = bar && getComputedStyle(bar).position === 'fixed' ? bar.getBoundingClientRect().top : innerHeight;
      return {b1: g('#main .sdh-b1'), b2: g('#main .sdh-b2'), fold: Math.round(fold), first: (document.querySelector('#main .sdh-go a') || {}).textContent || '', hs: document.documentElement.scrollWidth - innerWidth}; }));
    await ctx.close(); return r; };
  // 0. (Nov 18, phone check) the two hero buttons each keep their words on one line, side by side, from 360 to 899 (at 375 "Build Me a Team" broke onto 2 lines)
  { const wr = []; for (const w of [360, 375, 389, 390, 412, 430, 520, 700, 899]) { const r = await hero(w, 800, {fn: () => [...document.querySelectorAll('#main .sdh-go a')].map(e => { const t = e.querySelector('span') || e, rg = document.createRange(); rg.selectNodeContents(t); return {n: e.textContent.trim(), lines: new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size, top: Math.round(e.getBoundingClientRect().top)}; })});
      for (const x of r) if (x.lines > 1) wr.push(`${w}: "${x.n}" on ${x.lines} lines`); if (r.length === 2 && r[0].top !== r[1].top) wr.push(`${w}: buttons not side by side`); }
    ok(!wr.length, `Stampede hero 0: Score My Team and Build Me a Team each on one line, side by side, 360 to 899 wide (${wr.join(' | ') || 'all one line'})`); }
  // 1. the tagline is the page's one h1, the named Pokémon are buttons that open their page, the crowd is hidden from screen readers
  const a = await hero(1440, 900, {wait: true, fn: () => { const h1 = [...document.querySelectorAll('#main h1')].map(e => { const c = e.cloneNode(true); c.querySelectorAll('.sdh-k').forEach(k => k.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); }) /* Nov 22: without the product label above the tagline (Sim chose A, 10:51 AM) */;
    const named = [...document.querySelectorAll('#main .sdh-plate, #main .sdh-tag:not([hidden]), #main .sdh-tick li:not([hidden]) button')].filter(e => e.getClientRects().length);
    const bad = named.filter(e => e.tagName !== 'BUTTON' || !e.dataset.v2mon || !e.getAttribute('aria-label').startsWith(e.innerText.replace(/\s+/g, ' ').trim())).map(e => e.innerText);
    const deco = [...document.querySelectorAll('#main .sdh-crowd, #main .sdh-f, #main .sdh-m, #main .sdh-lines')].filter(e => e.getAttribute('aria-hidden') !== 'true').length;
    return {h1, named: named.length, bad, deco, plates: document.querySelectorAll('#main .sdh-plate').length}; }});
  ok(a.h1.length === 1 && a.h1[0] === 'Sharply raise your win rate.' && a.plates === 4 && a.named >= 8 && !a.bad.length && !a.deco, `Stampede hero 1: one h1 "Sharply raise your win rate.", four plates, every named Pokémon a button whose spoken name starts with its words, the herd aria-hidden (${JSON.stringify(a)})`);
  // 2. every Pokémon the Ratings page rates is in the herd, the line says that number, and sizes follow ratings (the ones with tournament
  //    results: a lower rating never stands larger; the rest stand at the back, smaller than all of them)
  for (const [w, h] of [[1440, 900], [390, 844]]) { const c = await hero(w, h, {wait: true, fn: () => window.__ev(`(() => { const D = V2.sdData(), H = D.herd || [], sz = e => e.getBoundingClientRect().width;
    const shown = [...document.querySelectorAll('#main .sdh-f, #main .sdh-m, #main .sdh-c')].filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.hidden);
    const box = e => e.classList.contains('sdh-f') ? e.firstElementChild : e, byN = new Map(); for (const e of shown) { const n = e.dataset.v2mon || (H[+e.dataset.sdhi] || {}).n; if (n && !byN.has(n)) byN.set(n, sz(box(e))); }
    const tc = H.filter(x => x.tc), bad = []; for (let i = 0; i < tc.length; i++) for (let j = i + 1; j < tc.length; j++) if (tc[j].r < tc[i].r && byN.get(tc[j].n) > byN.get(tc[i].n) + 1) { bad.push(tc[j].n + '>' + tc[i].n); if (bad.length > 3) break; }
    const minTc = Math.min(...tc.map(x => byN.get(x.n) || 0)), back = H.filter(x => !x.tc).filter(x => byN.get(x.n) > minTc + 1).length;
    return {herd: H.length, drawn: byN.size, missing: H.filter(x => !byN.has(x.n)).map(x => x.n).slice(0, 4), bad, back, said: (document.querySelector('#main .sdh-say') || {}).textContent || ''}; })()`)});
    ok(c.herd >= 300 && c.drawn === c.herd && !c.missing.length && !c.bad.length && !c.back && c.said.includes('Every one of the ' + c.herd.toLocaleString('en-US') + ' Pokémon'), `Stampede hero 2 (${w}): all ${c.herd} rated Pokémon drawn, the line says ${c.herd}, no lower rating larger than a higher one (${JSON.stringify(c).slice(0, 300)})`); }
  { const q = await b.newPage({viewport: {width: 1280, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#meta'); await q.waitForTimeout(2500);
    const lg = await q.evaluate(() => ((document.querySelector('.ra-legend') || {}).textContent || '').match(/(\d[\d,]*) rated/)); const nh = await q.evaluate(() => window.__ev('(V2.sdData().herd || []).length')); await q.close();
    ok(lg && +lg[1].replace(/,/g, '') === nh, `Stampede hero 2b: the herd holds as many Pokémon as the Ratings page rates (${lg && lg[1]} vs ${nh})`); }
  // 3. the buttons: today's Home order (HOME-06) and on the first screen (above the phone tab bar) at the sizes Sim checks
  const full = await hero(1440, 900), none = await hero(1440, 900, {empty: true});
  ok(/Score My Team/.test(full.first) && /Build Me a Team/.test(none.first), `Stampede hero 3 (HOME-06): Score My Team first with a team (${full.first}), Build Me a Team first with none (${none.first})`);
  const fold = []; for (const [w, h] of [[390, 844], [390, 664], [375, 667], [1280, 800], [1366, 768], [1440, 900], [1920, 1080]]) { const r = await hero(w, h); if (!r.b1 || !r.b2 || Math.max(r.b1.b, r.b2.b) > r.fold || r.b1.t < 0) fold.push(`${w}x${h}: ${JSON.stringify(r)}`); }
  ok(!fold.length, `Stampede hero 3b: both start buttons are on the first screen at 390x844, 390x664, 375x667, 1280x800, 1366x768, 1440x900, 1920x1080${fold.length ? ': ' + fold.join(' | ') : ''}`);
  // 4. the crowd comes after the first screen: the first draw holds about 12 pictures; the crowd arrives later
  const d = await hero(1440, 900, {fn: () => ({html: (V2.sdHero().match(/<img/g) || []).length, crowdInHtml: /sdh-c\b/.test(V2.sdHero())})});
  ok(d.html > 0 && d.html <= 16 && !d.crowdInHtml, `Stampede hero 4: the first draw asks for ${d.html} pictures, none from the crowd (it is added once the first screen's own pictures are in)`);
  // 5. every width: no sideways scroll; the ticker shows whole names inside the window, and what it hides can't take focus
  const wd = []; for (const w of [320, 340, 360, 390, 412, 600, 768, 820, 900, 1024, 1100, 1180, 1366, 1500, 1920, 2560]) { const r = await hero(w, 900, {rm: 'reduce', fn: () => { const L = [...document.querySelectorAll('#main .sdh-tick li')];
      const vis = L.filter(l => l.getClientRects().length && !l.hidden), cut = vis.filter(l => { const x = l.getBoundingClientRect(); return x.left < 0 || x.right > innerWidth; }).map(l => l.innerText);
      return {hs: document.documentElement.scrollWidth - innerWidth, vis: vis.length, cut, hiddenFocusable: L.filter(l => l.hidden && l.getClientRects().length).length}; }});
    if (r.hs > 0 || !r.vis || r.cut.length || r.hiddenFocusable) wd.push(w + ': ' + JSON.stringify(r)); }
  ok(!wd.length, `Stampede hero 5 (reduced motion: the still strip): 320-2560 (odd widths too) no sideways scroll, the ticker shows whole names only${wd.length ? ': ' + wd.join(' | ') : ''}`);
  // 6. contrast from the tokens (both themes): white on the hero blue and the red 4.5:1+, the tagline's second line and the ticker numbers 3:1+ (display / 24px+ bold)
  for (const night of [false, true]) { const c = await hero(1440, 900, {night, fn: () => { const v = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      const L = hx => { const m = hx.replace('#', ''), c = [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
      const cr = (a, b) => { const x = L(v(a)), y = L(v(b)); return +((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(2); };
      return {hero: cr('--sd-on-band', '--sd-hero'), line2: cr('--sd-line2', '--sd-hero'), flag: cr('--sd-on-band', '--sd-flag'), num: cr('--sd-flag-num', '--sd-flag'), link: cr('--sd-link', '--sd-ink'), plate: cr('--sd-plate-num', '--sd-plate'), tick: (t => t ? parseFloat(getComputedStyle(t).fontSize) : 0)(document.querySelector('#main .sdh-tick button'))}; }});
    ok(c.hero >= 4.5 && c.flag >= 4.5 && c.link >= 4.5 && c.plate >= 4.5 && c.line2 >= 3 && c.num >= 3 && c.tick >= 24, `Stampede hero 6 (${night ? 'night' : 'day'}): contrast white on blue ${c.hero}, on red ${c.flag}, link ${c.link}, plate number ${c.plate} (4.5+); second line ${c.line2}, ticker numbers ${c.num} at ${c.tick}px (3+ at 24px+)`); } }
/* Home, The Stampede: motion (Nov 18; css/sd-motion.css, V2.sdhTick in stampede-hero.js). A watcher records, every frame from the first
   draw for 1.5 s, every animation or transition running inside the hero, so a surge, a marquee or a stray transition is caught. */
{ const watch = async (w, h, rm, after) => { const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: w < 700, reducedMotion: rm}); const q = await ctx.newPage();
    await q.addInitScript(() => { window.__PL_TEST = 1; window.NP_SD_MOTION = 1; /* motion is off until Sim's yes; the checks turn it on */ const seen = window.__sdhSeen = {n: 0, names: {}, ends: 0, first: ''}; const t0 = performance.now();
      const tick = () => { const S = document.querySelector('#main .sdh'); if (S) { if (!seen.first) seen.first = S.className; for (const a of S.getAnimations({subtree: true})) if (a.playState === 'running') { seen.n++; const nm = a.animationName || a.transitionProperty || 'anim'; seen.names[nm] = 1;
        if (a.animationName && a.animationName.startsWith('sdh-surge')) { const t = a.effect.getComputedTiming(); seen.ends = Math.max(seen.ends, t.endTime); } } } if (performance.now() - t0 < 6000) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); });
    await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500); const r = await q.evaluate(after); await ctx.close(); return r; };
  const still = () => { const S = document.querySelector('#main .sdh'), t = S.querySelector('.sdh-tick'); return {seen: window.__sdhSeen, running: S.getAnimations({subtree: true}).filter(a => a.playState === 'running').length, trk: !!S.querySelector('.sdh-trk'), pz: !!S.querySelector('.sdh-tpz'), uls: t ? t.querySelectorAll('ul').length : 0}; };
  // 1. reduced motion: nothing in the hero runs an animation or transition at any moment from the first draw, no marquee copy, no pause button
  for (const [w, h] of [[1440, 900], [390, 844]]) { const r = await watch(w, h, 'reduce', still);
    ok(r.seen.first && !r.seen.n && !r.running && !r.trk && !r.pz && r.uls === 1, `Stampede motion 1 (${w}, reduced motion): no animation or transition runs in the hero from the first draw (${Object.keys(r.seen.names).join(',') || 'none'}), the ticker stays the one still list (${JSON.stringify({n: r.seen.n, trk: r.trk, pz: r.pz, uls: r.uls})})`); }
  // 2. motion on: the surge plays on the first draw (front row and herd), is over by 900ms, and never touches the buttons; a redraw does not replay it
  const m = await watch(1440, 900, 'no-preference', () => window.__ev(`(() => { const S = document.querySelector('#main .sdh'), seen = window.__sdhSeen; const go = [...S.querySelectorAll('.sdh-go a, .sdh-plate')].some(e => e.getAnimations().length || getComputedStyle(e).animationName !== 'none');
    V2.redraw(); const S2 = document.querySelector('#main .sdh'); return JSON.stringify({first: seen.first, names: Object.keys(seen.names).sort().join(','), ends: Math.round(seen.ends), go, again: S2.classList.contains('sdh-surge')}); })()`)).then(x => JSON.parse(x));
  ok(/sdh-surge/.test(m.first) && /sdh-surge,sdh-surge-m/.test(m.names) && m.ends > 0 && m.ends <= 900 && !m.go && !m.again, `Stampede motion 2: the surge runs once on arrival (${m.names}), ends by ${m.ends}ms (900 at most), the buttons and plates never move, a redraw does not replay it (${JSON.stringify(m)})`);
  // 3. the ticker: list + aria-hidden copy (buttons out of the tab order) moving as one track, seamless (the copy matches), a pause button 44px+ that pauses it
  for (const [w, h] of [[1440, 900], [390, 844], [320, 700], [2560, 1200]]) { const t = await watch(w, h, 'no-preference', async () => { const tk = document.querySelector('#main .sdh-tick'), U = [...tk.querySelectorAll('.sdh-trk ul')], tr = tk.querySelector('.sdh-trk'), pz = tk.querySelector('.sdh-tpz');
      const names = u => [...u.children].filter(l => !l.hidden).map(l => l.innerText.replace(/\s+/g, ' ')).join('|'), pr = pz ? pz.getBoundingClientRect() : {};
      const res = {uls: U.length, same: U.length === 2 && names(U[0]) === names(U[1]) && Math.abs(U[0].offsetWidth - U[1].offsetWidth) < 1 && Math.abs(tr.scrollWidth - 2 * U[0].offsetWidth) < 2, hid: U[1] && U[1].getAttribute('aria-hidden') === 'true' && [...U[1].querySelectorAll('button')].every(x => x.tabIndex === -1), anim: tr ? getComputedStyle(tr).animationName : '',
        pz: pz ? Math.round(Math.min(pr.width, pr.height)) : 0, inWin: pz ? pr.left >= 0 && pr.right <= innerWidth : false, label: pz && pz.getAttribute('aria-label'), hs: document.documentElement.scrollWidth - innerWidth};
      if (!tr || !pz) return res; tk.scrollIntoView({block: 'center'}); await new Promise(r => setTimeout(r, 300)); pz.click(); await new Promise(r => setTimeout(r, 100)); const a = tr.getAnimations()[0]; const x0 = getComputedStyle(tr).transform; await new Promise(r => setTimeout(r, 400));
      res.paused = pz.getAttribute('aria-pressed') === 'true' && a && a.playState === 'paused' && getComputedStyle(tr).transform === x0; pz.click(); await new Promise(r => setTimeout(r, 400)); res.resumed = a.playState === 'running' && getComputedStyle(tr).transform !== x0; return res; });
    ok(t.uls === 2 && t.same && t.hid && t.anim === 'sdh-mq' && t.pz >= 44 && t.inWin && t.paused && t.resumed && t.hs <= 0, `Stampede motion 3 (${w}): the ticker scrolls as list + matching aria-hidden copy (copy buttons tabindex -1), the ${t.pz}px pause button (${t.label}) pauses and restarts it, no sideways scroll (${JSON.stringify(t)})`); }
  // 4. a keyboard user: tabbing into the ticker stops it at its start, so the focused name is on screen
  const k = await (async () => {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}}); const q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; window.NP_SD_MOTION = 1; }); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
    await q.evaluate(() => document.querySelector('#main .sdh-tick').scrollIntoView({block: 'center'})); await q.waitForTimeout(1500); await q.focus('#main .sdh-go a:last-child'); await q.keyboard.press('Tab'); await q.waitForTimeout(200);
    const r = await q.evaluate(() => { const a = document.activeElement, x = a.getBoundingClientRect(); return {inTick: !!a.closest('.sdh-trk ul:not([aria-hidden])'), tf: (t => t ? getComputedStyle(t).transform : 'no track')(document.querySelector('#main .sdh-trk')), on: x.left >= 0 && x.right <= innerWidth}; }); await ctx.close(); return r; })();
  ok(k.inTick && k.tf === 'none' && k.on, `Stampede motion 4: Tab from the start buttons lands on the ticker's first name, the ticker stops at its start and the name is on screen (${JSON.stringify(k)})`); }
/* Home, The Stampede, band 2 "Call six out of the herd" (Nov 18; stampede-six.js): live data, word list, the old Home's features, fit */
{ const q = await (await b.newContext({viewport: {width: 1440, height: 900}})).newPage(); /* a fresh visitor: the sample team */ await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const set = t => q.evaluate(t => window.__ev(`(() => { S.slots = ${JSON.stringify(t)}.map(n => ({n, a: null, lock: false})); S.loadedId = null; V2.redraw(); V2.sdSixAfter && V2.sdSixAfter(); return 1; })()`), t);
  const six = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('.sds'); if (!s) return 'no band'; const ms = members(), G = CH.gradeOf(prepOf(ms), proChecks(ms, true), ms);
    return JSON.stringify({named: [...s.querySelectorAll('.sds-rings .sds-slot.on')].length, eye: s.querySelector('.sds-k').innerText, note: !!s.querySelector('.sds-note'), n: (s.querySelector('.sds-n') || {}).textContent, want: String(Math.round(G.s)), w: (s.querySelector('.sds-w .u') || {}).textContent, wantW: CH.wordOf(G.s),
      bands: [...s.querySelectorAll('.sds-b span')].map(x => x.textContent).join('|'), plan: (s.querySelector('.sds-plan') || {}).innerText || '', them: s.querySelectorAll('.sds-tk.them').length, you: s.querySelectorAll('.sds-tk.you').length, prep: !!s.querySelector('[data-hmprep][data-sdgo]'), imp: !!s.querySelector('[data-v2homeimport]'), arrows: s.querySelectorAll('.sds-arw .ln').length}); })()`)).then(x => { try { return JSON.parse(x); } catch (e) { return {err: x}; } });
  ok(six.named === 6 && /^A sample six · Sun Tailwind · Sun team$/.test(six.eye) /* Q84 S21 (Sim, Nov 20): the sample is named as a sample, not 'Your six' */ && six.note, `Stampede six (Nov 18): the sample six fills six rings, its eyebrow names it with its weather word, and the sample note shows (${JSON.stringify([six.named, six.eye, six.note])})`);
  ok(/^\d+$/.test(six.n || '') && six.n === six.want && !!six.w && six.w === six.wantW, `Stampede six: the receipt shows the team's real Strength Score and band word (${six.n} ${six.w}; live ${six.want} ${six.wantW})`);
  ok(six.bands === 'Missing a basic|Needs work|Solid|Tournament ready|Top tier', `Stampede six: the band strip uses the word list, low to high (${six.bands})`);
  ok(/^Game Plan vs the Champion's six: lead .+ \+ .+, back .+ \+ .+, bench .+ \+ .+\.$/.test(String(six.plan || '').replace(/\s+/g, ' ').trim()) && six.them === 2 && six.you === 2 && six.prep && six.imp, `Stampede six: the plan board has two leads a side, the lead/back/bench line, Battle sets the Champion as opponent, Import is there (${String(six.plan || '').slice(0, 60)}; ${six.them}/${six.you})`);
  ok(six.arrows >= 1, `Stampede six: the board draws at least one turn 1 arrow from the real plan (${six.arrows})`);
  // baseline: the three parts end within 32px of each other on desktop (the receipt is tilted 2 degrees)
  const bl = await q.evaluate(() => { const y = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom) : null; }; return [y('.sds-acts'), y('.sds-rc'), y('.sds-bt')]; });
  ok(bl.every(v => v != null) && Math.max(...bl) - Math.min(...bl) <= 32, `Stampede six: at 1440 the line-up, receipt and plan board end on one baseline (bottoms ${bl.join(', ')})`);
  // no team: the three most used by tournament share (the Ratings page's numbers), open rings for slots 1, 3, 5, and "?"
  await set(['', '', '', '', '', '']); await q.waitForTimeout(500);
  const em = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('.sds'), top = lairRows().map(x => ({n: x.p.n, u: V2.raNums(x.p).u})).filter(x => x.u != null && lairHead(byName.get(x.n)).tOK).sort((a, b) => b.u - a.u).slice(0, 3);
    return JSON.stringify({shown: [...s.querySelectorAll('.sds-slot.on .sds-nm')].map(e => e.dataset.v2mon).sort().join(), want: top.map(x => x.n).sort().join(), u: [...s.querySelectorAll('.sds-u b')].map(e => e.textContent).sort().join(), wantU: top.map(x => V2.raPct(x.u)).sort().join(),
      add: [...s.querySelectorAll('[data-v2addto]')].map(e => e.dataset.v2addto + ':' + e.getAttribute('aria-label')).join('|'), q: (s.querySelector('.sds-q') || {}).textContent}); })()`)).then(x => JSON.parse(x));
  ok(em.shown === em.want && em.u === em.wantU, `Stampede six: with no team, the three rings show the three most used by tournament share with the Ratings page's numbers (${em.shown} ${em.u}; live ${em.want} ${em.wantU})`);
  ok(em.add === '0:Add a Pokémon to slot 1|2:Add a Pokémon to slot 3|4:Add a Pokémon to slot 5' && em.q === '?', `Stampede six: with no team, the open rings add to their own slots and the receipt shows "?" (${em.add}; ${em.q})`);
  // long names fit at 320 and 1100, never under 13px (Sim, Nov 18: Mega Crabominable, Squawkabilly (Yellow), Paldean Tauros (Combat))
  await set(['Crabominable-Mega', 'Squawkabilly-Yellow', 'Tauros-Paldea-Combat', 'Charizard-Mega-Y', 'Basculegion', 'Indeedee-F']);
  for (const w of [320, 390, 1100, 1440]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(500); await q.evaluate(() => document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))); await q.evaluate(() => window.V2.sdSixAfter()); /* fit after the fonts and the resize's own redraw (a name read as 'out' under load, Nov 18) */
    const f = await q.evaluate(() => { const bad = []; document.querySelectorAll('.sds .sds-nm, .sds .sds-sub, .sds .sds-tg').forEach(e => { if (!e.getClientRects().length) return; const box = e.closest('.sds-cap') || e.closest('.sds-board'), br = box.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e);
        if ([...rg.getClientRects()].some(r => r.width && (r.left < br.left - 1 || r.right > br.right + 1))) bad.push(e.textContent.trim() + ' out'); if (parseFloat(getComputedStyle(e).fontSize) < 13) bad.push(e.textContent.trim() + ' under 13px'); });
      return {bad, sw: document.documentElement.scrollWidth, vw: innerWidth}; });
    ok(!f.bad.length && f.sw <= f.vw, `Stampede six: at ${w} every name and item stays in its spot at 13px or more, no sideways scroll (${f.bad.slice(0, 3).join('; ') || 'all in'}; ${f.sw}/${f.vw})`); }
  await q.close(); }
/* Home, The Stampede, band 4 "The post is in." (Nov 18; stampede-post.js, css/sd-post.css): the Post Room's and the Dispatch's own pieces
   with live POST data, empty states, the Pelipper clear of every word, widths, sizes, taps, contrast. Each check fails on the placeholder band. */
{ const q = await b.newPage({viewport: {width: 1440, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  const qe = (f, x) => q.evaluate(f, x).catch(e => ({err: String(e.message).split('\n')[0].slice(0, 80)}));
  const ev = s => qe(x => window.__ev(x), s).then(x => { try { return typeof x === 'string' ? JSON.parse(x) : x; } catch (e) { return {err: String(x).slice(0, 80)}; } });
  await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const d = await ev(`(() => { const s = document.querySelector('.sdp'); if (!s) return JSON.stringify({none: true}); const P = V2.postNow(), live = P.live.map(V2.prG), past = P.past.map(V2.prG);
    const first = live.find(g => g.code) || live[0], next = live.find(g => g !== first && g.code), A = [...s.querySelectorAll('.sdp-all')].map(a => a.getAttribute('href') + ' ' + a.textContent.trim());
    return JSON.stringify({h2: (s.querySelector('h2') || {}).textContent, parcel: (s.querySelector('.sdp-gifts .pr-parcel.pr-cpt .pr-what dd') || {}).textContent, want: first && first.name, rub: !!s.querySelector('.sdp-gifts .pr-parcel .pr-rub'),
      stamps: [...s.querySelectorAll('.sdp-stamps .pr-sw .pr-nm')].map(e => e.textContent).join('|'), wantSt: past.slice(0, 4).map(g => g.name).join('|'),
      slip: (s.querySelector('.sdp-slip .pr-cv') || {}).textContent, wantSlip: next && next.code, slipBtn: (s.querySelector('.sdp-slip [data-prcopy]') || {}).dataset?.prcopy,
      links: A.join(' | '), wantLinks: '#gifts All ' + (live.length + past.length) + ' Gifts › | #news All ' + P.news.length + ' Stories ›', paper: !!s.querySelector('.sdp-news .dp-paper.dp-small'),
      bird: !!s.querySelector('.sdp-bird[aria-hidden="true"] .np-mon img'), copies: document.querySelectorAll('.sdp .pr-label').length + '/' + document.querySelectorAll('.sdp .dp-paper').length}); })()`);
  ok(d.h2 === 'The post is in.' && d.parcel && d.parcel === d.want && d.rub && d.paper && d.bird, `SDP-1: the post band: h2 "The post is in.", the Post Room's compact parcel for the first live gift with its days-left stamp, the Dispatch's small paper, a decorative Pelipper sprite (${JSON.stringify({h2: d.h2, parcel: d.parcel, want: d.want, rub: d.rub, paper: d.paper, bird: d.bird})})`);
  ok(!!d.stamps && d.stamps === d.wantSt && d.slip === d.wantSlip && d.slipBtn === d.wantSlip && d.links === d.wantLinks && d.copies === '1/1', `SDP-2: live POST data: the four newest past-gift stamps, the next live code on its slip with Copy Code, "All N Gifts" (live + past) and "All N Stories"; one parcel label and one paper, no copies (${JSON.stringify(d).slice(0, 420)})`);
  /* the Pelipper (its visible middle: the picture box less 15% each side) covers no word of the tools band or the post band's heading and line */
  const fly = []; for (const w of [2560, 1920, 1440, 1366, 1100, 820, 520, 390, 360, 320]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(500);
    const r = await qe(() => { const im = document.querySelector('.sdp-bird img'); if (!im) return 'no bird'; const a = im.getBoundingClientRect(), k = .15, B = {l: a.left + a.width * k, r: a.right - a.width * k, t: a.top + a.height * k, b: a.bottom - a.height * k}, hit = [];
      for (const e of document.querySelectorAll('.sd-tools *, .sdp-top h2, .sdp-top p, .sdp-ch *')) { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || !e.getClientRects().length) continue; const rg = document.createRange(); rg.selectNodeContents(e);
        for (const x of rg.getClientRects()) if (x.width && x.right > B.l && x.left < B.r && x.bottom > B.t && x.top < B.b) { hit.push(e.textContent.trim().slice(0, 16)); break; } }
      const band = document.querySelector('.sdp').getBoundingClientRect(); return {hit, over: Math.round(band.top - B.t)}; });
    if (typeof r === 'string' || r.err || r.hit.length || r.over < 16) fly.push(w + ':' + JSON.stringify(r)); }
  ok(!fly.length, `SDP-3: the Pelipper flies in over the band's top edge (16px or more above it) and covers no text, 320 to 2560 (${fly.join(' ') || 'clear'})`);
  /* the columns: side by side and ending level on desktop; gifts above news on phones; 4 stamps on desktop, 3 on phones */
  const lay = []; for (const w of [2560, 1920, 1440, 1366, 1100, 390, 360]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(500);
    lay.push(w + ':' + await qe(() => { const g = document.querySelector('.sdp-gifts'), n = document.querySelector('.sdp-news'); if (!g || !n) return 'missing'; const a = g.getBoundingClientRect(), z = n.getBoundingClientRect();
      const st = [...document.querySelectorAll('.sdp-stamps .pr-sw')].filter(e => e.getClientRects().length).length, gb = document.querySelector('.sdp-gb').getBoundingClientRect().bottom, pb = document.querySelector('.sdp-tilt').getBoundingClientRect().bottom;
      return (Math.abs(a.top - z.top) < 2 ? (Math.abs(gb - pb) <= 12 ? 'level' : 'uneven ' + Math.round(gb - pb)) : z.top >= a.bottom ? 'stacked' : 'overlap') + ',' + st; })); }
  const want = {2560: 'level,4', 1920: 'level,4', 1440: 'level,4', 1366: 'level,4', 1100: 'stacked,4', 390: 'stacked,0', 360: 'stacked,0'}; /* phones: no stamps (Sim, Nov 18: Post X) */
  ok(lay.every(x => x.split(':')[1] === want[x.split(':')[0]]), `SDP-4: gifts and news side by side ending level from 1360, stacked gifts first below; 4 stamps, none on phones (Post X) (${lay.join(' | ')})`);
  /* every width, day and night: no sideways scroll, no text under 13px or outside the band, the code slip's parts never overlap, white text 4.5:1 on the red, every link and button 44px tall */
  const wd = []; for (const th of ['day', 'night']) { await qe(t => localStorage.setItem('np2.theme', t), th); await q.reload(); await q.waitForTimeout(2200);
    for (const w of [320, 340, 412, 600, 768, 1024, 1180, 1366, 1440, 1500, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(450);
      const r = await qe(() => { const s = document.querySelector('.sdp'); if (!s) return {err: 'no band'}; const out = [], br = s.getBoundingClientRect(), rgb = c => (c.match(/[\d.]+/g) || []).map(Number),
        L = c => { const v = c.slice(0, 3).map(x => x / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; }, cr = (a, b) => (Math.max(L(a), L(b)) + .05) / (Math.min(L(a), L(b)) + .05);
        if (document.documentElement.scrollWidth > innerWidth) out.push('sideways');
        for (const e of s.querySelectorAll('*')) { if (!e.getClientRects().length || e.closest('.vh,[aria-hidden="true"]') || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          if (parseFloat(getComputedStyle(e).fontSize) < 13) out.push('13px:' + e.className);
          for (const n of e.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); if ([...rg.getClientRects()].some(x => x.width && (x.left < br.left - 1 || x.right > br.right + 1))) { out.push('out:' + e.className); break; } } }
        { const sl = s.querySelector('.sdp-slip'); if (sl) { const box = e => { const out = [], w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) { if (!n.textContent.trim() || n.parentElement.closest('.vh')) continue; const rg = document.createRange(); rg.selectNodeContents(n); out.push(...[...rg.getClientRects()].filter(x => x.width)); } return out; }, parts = [...sl.children].map(box);
          for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) if (parts[i].some(a => parts[j].some(z => a.right > z.left + 1 && a.left < z.right - 1 && a.bottom > z.top + 1 && a.top < z.bottom - 1))) out.push('slip overlap ' + i + '/' + j); } }
        const red = rgb(getComputedStyle(s, '::before').backgroundColor), low = [...s.querySelectorAll('.sdp-top h2, .sdp-lede, .sdp-ch h3, .sdp-all, .sdp-none')].filter(e => e.getClientRects().length).map(e => [e.className, Math.round(cr(rgb(getComputedStyle(e).color), red) * 100) / 100]).filter(x => x[1] < (/sdp-h/.test(x[0]) ? 3 : 4.5));
        if (low.length) out.push('contrast:' + JSON.stringify(low));
        for (const e of s.querySelectorAll('a[href], button')) { const r = e.getBoundingClientRect(); if (r.width && r.height < 43.5 && !e.closest('.dp-paper')) out.push('tap:' + (e.className || e.tagName) + ' ' + Math.round(r.height)); }
        return out; });
      if (r.err || r.length) wd.push(th + ' ' + w + ':' + JSON.stringify(r).slice(0, 200)); } }
  await qe(() => localStorage.setItem('np2.theme', 'day')); await q.reload(); await q.waitForTimeout(2200);
  ok(!wd.length, `SDP-5: 320 to 2560, day and night: no sideways scroll, nothing under 13px or out of the band, slip parts apart, white on red 4.5:1 (heading 3:1, display size), every link and button 44px tall (${wd.join(' | ') || 'all clean'})`);
  /* empty states (a test POST through the test hook; never in post.js): no live gift, then no news */
  await q.setViewportSize({width: 1440, height: 900});
  const em = await ev(`(() => { const keep = POST, day = 864e5, t = Date.now(), iso = x => new Date(x).toISOString(), out = {};
    try { POST = {checked: null, gifts: [{name: 'Old Gift', how: 'Event Gift', start: iso(t - 9 * day), end: iso(t - 2 * day)}], news: keep.news}; V2.redraw();
      let s = document.querySelector('.sdp'); out.none = !!(s && s.querySelector('.sdp-none a[href="#gifts"]')) && !s.querySelector('.pr-parcel') && s.querySelectorAll('.sdp-stamps .pr-sw').length === 1;
      POST = {checked: null, gifts: [{name: 'Gift A', code: 'AB12', how: 'Serial Code', start: iso(t - day), end: iso(t + 5 * day)}, {name: 'Gift B', how: 'Event Gift', start: iso(t - day), end: iso(t + 9 * day)}], news: []}; V2.redraw();
      s = document.querySelector('.sdp'); const c = s && s.querySelector('.sdp-cols'), g = s && s.querySelector('.sdp-gifts'), two = s && [...s.querySelectorAll('.sdp-two > *')].map(e => e.getBoundingClientRect());
      out.solo = !!c && !s.querySelector('.sdp-news') && c.classList.contains('sdp-solo') && Math.abs(g.getBoundingClientRect().width - c.getBoundingClientRect().width) < 2 && two.length === 2 && Math.abs(two[0].top - two[1].top) < 2 && two[1].left > two[0].right;
    } finally { POST = keep; V2.redraw(); } return JSON.stringify(out); })()`);
  ok(em.none === true && em.solo === true, `SDP-6: empty states: no live gift = one line with a link to #gifts and the stamps; no news = no news column, the gifts take the full width as two parcels side by side (${JSON.stringify(em)})`);
  await q.close(); }
// Sim, Nov 18 (My Team Q1 C and Q2 option 1): phone length and the desktop links row. Each of these failed on the build before the change.
{ const mtOpen = async (W, long) => { const c = await b.newContext({viewport: {width: W, height: 844}, hasTouch: W < 1100}), q = await c.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
    await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2000); const settle = async () => { await q.waitForTimeout(600); await q.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {}); await q.waitForTimeout(1200); };
    await settle();
    if (long) { await q.locator('[data-v2more]').first().click(); await q.waitForTimeout(400); await q.locator('.np-sheet [data-v2import]').first().click(); await q.waitForTimeout(400);
      await q.fill('[data-impin]', ['Tauros-Paldea-Combat', 'Squawkabilly-Yellow', 'Toxtricity-Low-Key', 'Crabominable-Mega', 'Lycanroc-Midnight', 'Typhlosion-Hisui'].join('\n\n')); await q.locator('[data-impgo]').click(); await settle(); }
    return {q, c}; };
  // 1. page length at 390 (the sample team, folds as they open): about 4 screens (5.6 before)
  // Nov 18 evening (Sim: recommended): a team that shows optional swaps ("Optional swaps:") is its own state with its own limit, as 5 of 6
  // has (CI's frozen data gives the sample team one optional swap: +363px, 4.47 screens); measured + margin: 4.75
  { const {q, c} = await mtOpen(390); const r = await q.evaluate(() => ({H: document.documentElement.scrollHeight, scr: +(document.documentElement.scrollHeight / 844).toFixed(2), opt: /Optional swaps:/.test(document.body.innerText)}));
    const lim = r.opt ? 4.75 : 4.3;
    ok(r.scr <= lim, `Sim, Nov 18 (C): My Team at 390 is at most ${lim} screens long${r.opt ? ' (with optional swaps)' : ''} (${r.scr} screens, ${r.H}px)`);
    // 2. the Hand three across; the editing panel shut until a Card is tapped, with the hint; tapped, it opens under the whole Hand with Replace, Edit Set, Remove and Lock
    /* Nov 20 (Sim: no Lead / Back / Bench on My Team; leads are Battle's call): was three groups side by side (Lead | Back | Bench); now ONE
       group (no "Your Six" heading on a full team, approved mock-up Nov 11; its line points to Battle) whose six Cards sit three across in
       two level rows, in slot order, with no role words */
    const h = await q.evaluate(() => { const g = [...document.querySelectorAll('#main .mh-hand .mh-grp')], hint = document.querySelector('#main .mt-hint'), sl = [...document.querySelectorAll('#main .mh-hand .mh-slot')].map(e => e.getBoundingClientRect());
      const tops = [...new Set(sl.map(r => Math.round(r.top)))], ord = [...document.querySelectorAll('#main .mh-hand [data-tmsel]')].map(e => +e.dataset.tmsel).join('');
      return {n: g.length, head: g[0] ? ((g[0].querySelector('.mh-gh b') || {}).textContent || '') + '|' + ((g[0].querySelector('.mh-gh') || {}).textContent || '') : '', cols: new Set(sl.map(r => Math.round(r.left))).size, level: sl.length === 6 && tops.length === 2 && tops.every(t => sl.filter(r => Math.round(r.top) === t).length === 3), ord,
        words: (((document.querySelector('#main .mh-hand') || {}).innerText || '').match(/\b(Lead|Back|Bench)\b/g) || []).join(','), panel: !!document.querySelector('#main .mt-edit'), hint: hint ? hint.textContent : ''}; });
    /* Nov 21: My Team frame (Sim approved): Your six is the frame's one list (.mtf-party), in slot order, the Battle line under the Game Plan
       bar (.mtf-lead); on phones (360+) the six are ONE row of six taps (the mock), 320-359 three across; the tapped one (#tm-set.mtf-sum)
       opens under the six. Whether the panel stays shut until a tap (Sim, Nov 18 C) is its own line below: the frame always shows one */
    const fr = await q.evaluate(() => { const P = document.querySelector('#main .mtf-party'); if (!P) return null; const rows = [...P.querySelectorAll('.mtf-row')], R = rows.map(e => e.getBoundingClientRect()), tops = [...new Set(R.map(r => Math.round(r.top)))];
      return {n: document.querySelectorAll('#main .mtf-party').length, lead: ((document.querySelector('#main .mtf-lead') || {}).textContent || '').trim(), ord: rows.map(e => e.dataset.tmsel).join(''), tops: tops.length, per: tops.map(t => R.filter(r => Math.round(r.top) === t).length).join('+'),
        words: ((P.innerText || '').match(/\b(Lead|Back|Bench)\b/g) || []).join(','), panel: !!document.querySelector('#main #tm-set'), hint: /Tap a Card|tap one to see it/.test(document.body.innerText)}; });
    await q.locator('#main [data-tmsel="2"]').first().click(); await q.waitForTimeout(900);
    if (fr) { const ft = await q.evaluate(() => { const e = document.querySelector('#main #tm-set.mtf-sum'), rows = [...document.querySelectorAll('#main .mtf-party .mtf-row')].map(x => x.getBoundingClientRect().bottom + scrollY);
        return e ? {below: e.getBoundingClientRect().top + scrollY >= Math.max(...rows), btn: ['[data-v2rep]', '[data-v2edit]', '[data-v2rm]', '[data-v2lock]'].every(s => e.querySelector(s) && e.querySelector(s).getClientRects().length), seen: e.getBoundingClientRect().top < innerHeight, name: (e.querySelector('h2') || {}).textContent || ''} : null; });
      const wr = await q.evaluate(() => !!document.querySelector('#main .tmk')); /* reskin page 1, the war room (Sim approved mock-up B, Nov 21): the six are kit cards 3 + 3 on phones and the Battle line ends with the page's pink move */
      ok(fr.n === 1 && (wr ? /^Who leads depends on who you face\.\s*PLAN IT IN BATTLE\.$/.test(fr.lead) && fr.tops === 2 && fr.per === '3+3' : fr.lead === 'Who leads depends on who you face. Plan it in Battle ›' && fr.tops === 1 && fr.per === '6') && !fr.words && fr.ord === '012345' && ft && ft.below && ft.btn && ft.seen, `Nov 21 frame (Sim approved; was Sim, Nov 18 C): at 390 Your six is one group in slot order, one row of six, no Lead / Back / Bench, the Battle line under the Game Plan bar; a tap opens that one under the six, on screen, with Replace, Edit Set, Remove and Lock (${JSON.stringify({...fr, open: ft})})`);
      ok(fr.panel && fr.hint, `Nov 21 (design authority, flagged to Sim; was Sim's Nov 18 C): the frame shows the first Pokémon's set before any tap with the "tap one to see it" hint (panel ${fr.panel}, hint ${fr.hint})`);
      await c.close(); } else {
    const t = await q.evaluate(() => { const e = document.querySelector('#main .mt-edit'), cards = [...document.querySelectorAll('#main .mh-hand .mh-pick')].map(x => x.getBoundingClientRect().bottom + scrollY);
      return e ? {below: e.getBoundingClientRect().top + scrollY >= Math.max(...cards), btn: ['[data-v2rep]', '[data-v2edit]', '[data-v2rm]', '[data-v2lock]'].every(s => e.querySelector(s) && e.querySelector(s).getClientRects().length), seen: e.getBoundingClientRect().top < innerHeight} : null; });
    ok(h.n === 1 && h.head === '|Who leads depends on who you face. Plan it in Battle ›' && !h.words && h.ord === '012345' && h.cols === 3 && h.level && !h.panel && /Tap a Card/.test(h.hint) && t && t.below && t.btn && t.seen, `Sim, Nov 18 (C; Nov 20: one group in slot order under "Who leads depends on who you face. Plan it in Battle ›", no Lead / Back / Bench): at 390 the Hand is three across in two level rows, the editing panel is shut with "Tap a Card…" until a Card is tapped, then opens under the whole Hand, on screen, with Replace, Edit Set, Remove and Lock (${JSON.stringify({...h, open: t})})`);
    await c.close(); } }
  // 3. the three Suggestions links in one row: phones 360-699 and desktop 1100-1280 (they already were from 1440)
  { const rows = []; for (const W of [360, 390, 600, 1100, 1180, 1280]) { const {q, c} = await mtOpen(W); await sgTab(q); rows.push(W + ':' + await q.evaluate(() => { const a = [...document.querySelectorAll('#main .tm-sgs .sg2-links .sg2-all')].filter(x => x.getClientRects().length);
      const T = a.map(x => Math.round(x.getBoundingClientRect().top)), H = a.map(x => Math.round(x.getBoundingClientRect().height)); return a.length === 3 && new Set(T).size === 1 && new Set(H).size === 1 && a.every(x => x.scrollWidth <= x.clientWidth + 1) ? (() => { /* every two words drawn side by side keep a space between them (a block part inside the flex link dropped it: 'See AllSuggestions') */ const tight = []; a.forEach(x => { const R = []; const tw = document.createTreeWalker(x, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const r = rg.getBoundingClientRect(); R.push([m[0], r.left, r.right, Math.round(r.top)]); } }
        for (let k = 1; k < R.length; k++) if (R[k][3] === R[k - 1][3] && R[k][1] - R[k - 1][2] < 2) tight.push(R[k - 1][0] + R[k][0]); }); return tight.length ? 'words run together: ' + tight.join(', ') : 'row'; })() : T.join('/'); })); await c.close(); }
    ok(rows.every(x => /:row$/.test(x)), `Sim, Nov 18 (C and Q2 option 1): the three Suggestions links sit in one even row at 360-699 and 1100-1280, their words spaced (${rows.join(', ')})`); }
  // 4. long names on the three-across Cards: none past its Card or over two lines, never under 13px (320 keeps two across)
  { /* Nov 21: wait for the name fit to settle after the viewport change (two frames + 300 ms, then the names' sizes the same on two reads
       in a row, up to about 6 s) before measuring: it measured before the fit settled. What it checks is unchanged. */
    const fitSettle = async q => { await q.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await q.waitForTimeout(300);
      const snap = () => q.evaluate(() => [...document.querySelectorAll('#main .mtf-party .mtf-row .nm b, #main .mtf-party .mtf-row .k-name, #main .mh .mc-id h3')].map(h => { const r = h.getBoundingClientRect(); return [getComputedStyle(h).fontSize, Math.round(r.left), Math.round(r.width), h.offsetHeight, h.scrollWidth].join(','); }).join('|'));
      let prev = await snap(); for (let i = 0; i < 20; i++) { await q.waitForTimeout(300); const cur = await snap(); if (cur === prev) break; prev = cur; } };
    const out = []; for (const W of [320, 360, 390]) { const {q, c} = await mtOpen(W, true); await fitSettle(q); out.push(await q.evaluate(W => {
      /* Nov 21: My Team frame (Sim approved): the names sit in the frame's rows (.mtf-row .nm b); 360+ one row of six, 320-359 three across */
      const F = [...document.querySelectorAll('#main .mtf-party .mtf-row')]; if (F.length) { const L = new Set(F.map(e => Math.round(e.getBoundingClientRect().left))).size;
        const bad = F.map(r => r.querySelector('.nm b, .k-name')).filter(Boolean).map(h => { const cr = h.closest('.mtf-row').getBoundingClientRect(), x = h.getBoundingClientRect(), lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * 1.2, fs = parseFloat(getComputedStyle(h).fontSize);
          const past = Math.round(Math.max(cr.left - x.left, x.right - cr.right)); /* the frame keeps a 'Mega' plate line above every name (blank '.mg.none' on non-Megas, so the six line up): not a name line, as the Hand's check counts it */ const mg = h.querySelector('.mg'), plate = mg && getComputedStyle(mg).display === 'block' ? mg.offsetHeight : 0, H = h.offsetHeight - plate; return past > 0 || H > 2 * lh + 2 || fs < 13 || h.scrollWidth > h.clientWidth + 1 ? `${h.textContent.trim()} ${past}px ${Math.round(H / lh)} lines ${fs}px` : ''; }).filter(Boolean);
        const wr = !!document.querySelector('#main .tmk'), want = wr || W < 360 ? 3 : 6; /* the war room (reskin page 1): kit cards, 3 + 3 at every phone width */ return `${W}: ${L !== want ? 'not ' + (want === 6 ? 'six' : 'three') + ' across; ' : ''}${bad.length ? bad.join('; ') : 'ok'}`; }
      const g = [...document.querySelectorAll('#main .mh-hand .mh-slot')].map(e => Math.round(e.getBoundingClientRect().left)); /* Nov 20 (Sim: no Lead / Back / Bench on My Team): 'three across' = three Card columns in the one Your Six group (were three groups) */
      const bad = [...document.querySelectorAll('#main .mh .mc-id h3')].map(h => { const cr = h.closest('.ms-card').getBoundingClientRect(), r = h.getBoundingClientRect(), lh = parseFloat(getComputedStyle(h).lineHeight), fs = parseFloat(getComputedStyle(h).fontSize);
        const past = Math.round(Math.max(cr.left - r.left, r.right - cr.right)); /* Q17 A (Nov 19): 'Mega' on its own plate above the name counts as one line, as monsheet.js's fit counts it */ const mg = getComputedStyle(h).display === 'grid' && h.querySelector('.mg:not(.none)'), plate = mg ? mg.offsetHeight + (parseFloat(getComputedStyle(h).rowGap) || 0) - lh : 0; return past > 0 || h.offsetHeight > 2 * lh + 2 + plate || fs < 13 || h.scrollWidth > h.clientWidth + 1 ? `${h.textContent.trim()} ${past}px ${Math.round(h.offsetHeight / lh)} lines ${fs}px` : ''; }).filter(Boolean);
      const three = new Set(g).size === 3; return `${W}: ${W >= 360 && !three ? 'not three across; ' : ''}${bad.length ? bad.join('; ') : 'ok'}`; }, W)); await c.close(); }
    ok(out.every(x => /: ok$/.test(x)), `Sim, Nov 18 (C): six long names (Paldean Tauros (Combat), Squawkabilly (Yellow), Mega Crabominable...) fit their Cards at 320/360/390 (three across from 360): none past the edge or over two lines, none under 13px (${out.join(' | ')})`); }
  // 5. Stand-Outs four across from 360 with level verdicts; Adjust Suggestions folded with its settings line; Your Games' note behind "?"
  { const out = []; for (const W of [360, 390, 430]) { const {q, c} = await mtOpen(W); out.push(await q.evaluate(W => { const li = [...document.querySelectorAll('#main .mu-cards li, #main .tm-mus .mu-out > li')] /* the war room (reskin page 1): the stand-outs are rows, two across on phones */, rows = {};
      li.forEach(l => { const t = Math.round(l.getBoundingClientRect().top), v = l.querySelector('.tm-v'); (rows[t] = rows[t] || []).push(v ? Math.round(v.getBoundingClientRect().top) : -1); });
      const R = Object.values(rows), adj = document.querySelector('#main [data-v2adj]'), why = document.querySelector('#main .tm-yg-why'), tip = document.querySelector('#main .tm-yg-0 [data-v2tip]');
      const fr = !!document.querySelector('#main .mtf'); /* Nov 21: My Team frame (Sim approved, mock step 3): on phones the stand-outs are short rows two across */
      const ok4 = li.length === 8 ? (fr ? R.length === 4 && R.every(r => r.length === 2 && new Set(r).size === 1) : R.length === 2 && R.every(r => r.length === 4 && new Set(r).size === 1)) : false;
      return `${W}: ${ok4 ? (fr ? 'two across, level' : 'four across, level') : 'rows ' + R.map(r => r.length).join('+')}; adjust ${adj && !adj.open && /Mega/.test(adj.querySelector('summary').textContent) ? 'folded' : 'open'}; note ${why && !why.getClientRects().length && tip && tip.getClientRects().length ? 'behind ?' : 'shown'}`; }, W)); await c.close(); }
    ok(out.every(x => /(four|two) across, level; adjust folded; note behind \?$/.test(x)), `Sim, Nov 18 (C): on phones Stand-Outs go four across with the verdicts level, Adjust Suggestions is folded with its settings on the closed line, Your Games' note is behind a "?" (${out.join(' | ')})`); } }
// OL-i39 (Nov 18): Report a Mistake on a Pokémon page sends that Pokémon's numbers, as today's site did (53-feedback.js fbMisContext);
// the page still shows only its name, and the entry carries nothing personal (the same six fields as every feedback entry)
{ const q = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#pokemon=incineroar'); await q.waitForTimeout(2500);
  await q.evaluate(() => window.__ev(`(() => { V2.FB.ok = true; window.__fbSaved = null; V2.FB.ref = {get: async () => ({exists: false}), set: async d => { window.__fbSaved = d; }, update: async d => { window.__fbSaved = d; }}; V2.redraw(); return 1; })()`));
  await q.waitForTimeout(400); await q.evaluate(() => document.querySelector('[data-fbmistake="pokemon"]').click()) /* part 6 can be folded */; await q.waitForTimeout(1200);
  const seen = await q.evaluate(() => ((document.querySelector('.inf-ctx') || {}).innerText || '').replace(/\s+/g, ' ').trim());
  await q.evaluate(() => { window.__NP_PREVIEW = 0; }); await q.fill('#fbText2', 'The rating looks off'); await q.click('[data-fbsend2]'); await q.waitForTimeout(600);
  const e = await q.evaluate(() => { const m = window.__fbSaved && window.__fbSaved.m; return m ? Object.values(m)[0] : null; });
  const c = (e && e.c) || '';
  ok(/^Incineroar\n/.test(c) && /rated \d+ \(likely [\d–]+, [SABCD] tier, #\d+ of \d+/.test(c) && /Tournaments: [\d.]+% of teams, [\d.]+% won, [\d,]+ games/.test(c) && /Moves shown: .*Fake Out \d/.test(c) && /Items shown: /.test(c),
    `OL-i39: Report a Mistake on a Pokémon page sends its rating, tier, rank, tournament numbers, moves and items (${JSON.stringify(c.slice(0, 160))})`);
  ok(seen === "Sent with what was on screen: Incineroar Don't send it", `OL-i39: the page still shows only the name (${seen})`);
  ok(!!e && Object.keys(e).sort().join() === 'c,d,k,t,v,w' && e.k === 'mistake' && !/@/.test(c), `OL-i39: the entry keeps the same fields, nothing personal (${e ? Object.keys(e).sort().join() : 'nothing saved'})`);
  await q.close(); }
// OL-i15 (Nov 18): the Blueprint shows the engine's catch tip and "X isn't in your box" lines (22-auto-build.js), and every plan chip
// (no cap of 3), in rows that never leave one chip alone; it never shows the readiness line (word list) or the two-weather line (not asked)
{ const q = await (await b.newContext({viewport: {width: 1440, height: 900}})).newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#build'); await q.waitForTimeout(2500);
  const run = async src => { await q.evaluate(s => window.__ev(`(() => { ui.abSrc = '${s}'; ui.ab = null; V2.redraw(); return 1; })()`), src); await q.waitForTimeout(300);
    await q.getByRole('button', {name: 'Build Me a Team'}).first().click(); await q.waitForFunction(() => window.__ev('!!(ui.ab && !ui.ab.busy && ui.ab.doubles && ui.ab.doubles.teams)'), null, {timeout: 60000}); await q.waitForTimeout(800); };
  const show = i => q.evaluate(i => window.__ev(`(() => { ui.abIdx = ui.abIdx || {}; ui.abIdx.doubles = ${i}; V2.redraw(); return 1; })()`), i);
  const pick = re => q.evaluate(re => window.__ev(`ui.ab.doubles.teams.findIndex(t => (t.why || []).some(w => ${re}.test(w)))`), re);
  const sheetTx = () => q.evaluate(() => (document.querySelector('.bd-ans.bp') || {}).innerText || ''); /* Q83 item 2 (Nov 20): the tips sit with Load Team under the six now, not in the right column */
  // the engine's catch search and plan chips can differ between runs on a busy machine (time-sliced search), so when this build has
  // none, the test gives option 1 the engine's own sentence and all four chips (22-auto-build.js line 121; 11-game-plan.js labels)
  await run('box'); let ic = await pick('/^(Best single catch|To reach 90\\+)/'), made = '';
  if (ic < 0) { ic = 0; made = ', test-made'; await q.evaluate(() => window.__ev(`ui.ab.doubles.teams[0].why.push('Best single catch: Farigiraf for Empoleon, which takes this team from 73 to 77'); 1`)); }
  if (await q.evaluate(() => window.__ev(`ui.ab.doubles.teams.findIndex(t => (t.gp || []).length >= 4)`)) < 0) { made += ', test-made chips'; await q.evaluate(() => window.__ev(`ui.ab.doubles.teams[0].gp = ['Speed control', 'Weather', 'Terrain', 'Lead support']; 1`)); }
  { await show(ic); await q.waitForTimeout(400); const w = await q.evaluate(i => window.__ev(`ui.ab.doubles.teams[${i}].why.find(w => /^(Best single catch|To reach 90\\+)/.test(w))`), ic), tx = await sheetTx();
    ok(tx.includes(w), `OL-i15: the Blueprint shows the catch tip (${w.slice(0, 70)}${made})`); }
  const i4 = await q.evaluate(() => window.__ev(`ui.ab.doubles.teams.findIndex(t => (t.gp || []).length >= 4)`));
  if (i4 < 0) ok(false, 'OL-i15: no option with 4 plan chips to check (unknown, not a pass)');
  else { await show(i4); for (const w of [320, 390, 768, 1100, 1440, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(400);
    const r = await q.evaluate(i => { /* Nov 20: The Plot (Sim locked, spec 7 'Meta line 1'): the plan chips are tags on the answer's tag line (.pl-tags .pl-gp, after the plan,
         kind, Megas and to-catch tags) instead of the Blueprint's chip grid; the same checks on them: every chip, in order, none past the
         line's edge, no sideways scroll, and the tag line's rows even (no tag alone on a row) */
      const want = window.__ev(`ui.ab.doubles.teams[${i}].gp.join('|')`), cs = [...document.querySelectorAll('.bd-ans .pl-tags .pl-gp')], all = [...document.querySelectorAll('.bd-ans .pl-tags .pl-tag')], rows = {};
      all.forEach(c => { const y = Math.round(c.getBoundingClientRect().top); rows[y] = (rows[y] || 0) + 1; }); const box = document.querySelector('.bd-ans .pl-tags'), bb = box && box.getBoundingClientRect(), out = all.some(c => c.getBoundingClientRect().right > (bb ? bb.right : 0) + 1);
      return {got: cs.map(c => c.textContent).join('|'), want, rows: Object.values(rows), out, sw: document.documentElement.scrollWidth, vw: innerWidth}; }, i4);
    /* Nov 21 (The Plot, Q98 approved): the plan chips are tags on the answer's free-wrapping tag line now, beside 'Plan A of 4', 'Proven team' and
       the Mega and catch tags, so rows of equal count can't be promised; the rule kept is Sim's 'no lone tile': no row holds a single tag */
    ok(r.got === r.want && !r.rows.includes(1) && !r.out && r.sw <= r.vw, `OL-i15: at ${w} all ${r.want.split('|').length} plan chips show, no tag alone on a row (${r.got}; rows ${r.rows.join('+')}; ${r.sw}/${r.vw})`); }
    await q.setViewportSize({width: 1440, height: 900}); }
  await run('all'); const ib = await pick(`/isn't in your box: /`);
  if (ib < 0) ok(false, 'OL-i15: a Whole Roster build gave no "isn\'t in your box" line to check (unknown, not a pass)');
  else { await show(ib); await q.waitForTimeout(400); const ws = await q.evaluate(i => window.__ev(`JSON.stringify(ui.ab.doubles.teams[${i}].why.filter(w => /isn't in your box: /.test(w)))`), ib).then(JSON.parse), tx = await sheetTx();
    ok(ws.every(w => tx.includes(w)), `OL-i15: the Blueprint shows every "isn't in your box" line (${ws.length}: ${ws[0].slice(0, 50)})`); }
  const bad = await q.evaluate(() => /ready for the top|Sets both /.test((document.querySelector('.bp') || {}).innerText || ''));
  ok(!bad, 'OL-i15: the readiness line and the two-weather line stay off the Blueprint');
  await q.close(); }
/* Home, The Stampede, polish of the joined bands (Nov 18): the seam under the hero and the receipt's band strip (sd-hero.css, sd-six.css) */
{ const seam = [], start = [], strip = [];
  for (const empty of [false, true]) { const ctx = await b.newContext({viewport: {width: 1440, height: 900}}); const q = await ctx.newPage();
    await q.addInitScript(e => { window.__PL_TEST = 1; if (e && !sessionStorage.getItem('pz')) { sessionStorage.setItem('pz', 1); localStorage.setItem('cc2.state', JSON.stringify({slots: [{n: ''}, {n: ''}, {n: ''}, {n: ''}, {n: ''}, {n: ''}], teams: []})); localStorage.setItem('cc2.welcomed', '"1"'); } }, empty);
    await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2200);
    for (const w of [1100, 1280, 1440, 1920, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(400); await q.evaluate(() => window.V2.sdSixAfter && window.V2.sdSixAfter());
      const m = await q.evaluate(() => { const tk = document.querySelector('#main .sdh-tick'), k = document.querySelector('#main .sds-k'); if (!tk || !k) return {err: 'no ticker or line-up'};
        /* the ticker is tilted with the bands: its bottom edge, at x, from its rotated corners (bottom-left is the lowest point) */
        const T = tk.getBoundingClientRect(), tan = Math.tan(Math.abs(parseFloat(getComputedStyle(tk).rotate) || 0) * Math.PI / 180), K = k.getBoundingClientRect(), gap = Math.round(K.top - (T.bottom - (K.left - T.left) * tan));
        const P = [...document.querySelectorAll('#main .sds-part')].map(e => e.getBoundingClientRect()), side = P.length === 3 && Math.abs(P[0].top - P[2].top) < P[0].height && P[2].left > P[0].right;
        /* Nov 19: Sim had the rings under the six removed ("the rings mess it up"); a hidden ring measures 0, so only drawn rings count, and the
           six names (Sim: "the names are not all in a line") must share one baseline too */
        const vis = s => [...document.querySelectorAll(s)].filter(e => e.getClientRects().length), spread = a => a.length ? Math.max(...a) - Math.min(...a) : 0;
        const rings = vis('#main .sds-rings .sds-ring').map(e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; }), names = vis('#main .sds-rings .sds-nm').map(e => e.getBoundingClientRect().bottom);
        return {gap, side, topGap: side ? Math.round(P[0].top - Math.min(P[1].top, P[2].top)) : 0, ends: side ? Math.round(Math.max(...P.map(r => r.bottom)) - Math.min(...P.map(r => r.bottom))) : 0, ringSpread: Math.round(Math.max(spread(rings), spread(names)))}; });
      const tag = (empty ? 'empty ' : '') + w;
      seam.push(m.err ? tag + ' ' + m.err : m.gap >= 16 && m.gap <= 80 ? '' : `${tag}: line-up ${m.gap}px under the ticker`);
      if (m.side) start.push(m.topGap <= 8 && m.ends <= 32 && m.ringSpread <= 2 ? '' : `${tag}: line-up starts ${m.topGap}px under the board, ends ${m.ends}px apart, rings/names ${m.ringSpread}px off one line`); }
    for (const night of [false, true]) for (const w of night ? [390, 1440] : [320, 340, 360, 390, 412, 600, 700, 768, 820, 1024, 1100, 1180, 1280, 1366, 1440, 1500, 1920, 2560]) {
      if (night) await q.evaluate(() => { document.documentElement.dataset.theme = 'night'; });
      await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(300);
      /* Nov 19 (CI run 1365: "Missing a basic / Needs work 8px apart" at 1100 and 1920): the receipt is tilted 2 degrees (.sds-rcw), so
         screen-aligned boxes of its text are wider than the text and two names 8.30px apart in the receipt read 7.73px. Measured in the
         receipt's own frame: the tilt is taken off for the measurement and put back (a rotation moves nothing relative to anything else). */
      const r = await q.evaluate(() => { const ol = document.querySelector('#main .sds-bands'); if (!ol) return 'no strip'; const flat = [];
        for (let e = ol; e && e.id !== 'main'; e = e.parentElement) { const c = getComputedStyle(e); if (c.rotate !== 'none' || c.transform !== 'none') { flat.push([e, e.style.rotate, e.style.transform]); e.style.rotate = 'none'; e.style.transform = 'none'; } }
        try { const B = ol.getBoundingClientRect(), bad = [];
        const L = [...ol.querySelectorAll('.sds-b span')].map(s => { const rg = document.createRange(); rg.selectNodeContents(s); return {t: s.textContent, f: parseFloat(getComputedStyle(s).fontSize), rs: [...rg.getClientRects()].filter(c => c.width)}; });
        for (let i = 0; i < L.length; i++) { if (L[i].f < 13) bad.push(L[i].t + ' ' + L[i].f + 'px'); for (const a of L[i].rs) { if (a.left < B.left - .5 || a.right > B.right + .5) bad.push(L[i].t + ' out of the strip');
          for (let j = i + 1; j < L.length; j++) for (const c of L[j].rs) if (Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 1) { const g = c.left >= a.right ? c.left - a.right : a.left >= c.right ? a.left - c.right : -1; if (g < 8) bad.push(`${L[i].t} / ${L[j].t} ${Math.round(g)}px apart`); } } }
        /* the chosen band's bar grows 1.5x with a 4px ring (box-shadow): no name may sit under it */
        const on = ol.querySelector('.sds-b.on i'); if (on) { const R = on.getBoundingClientRect(), x0 = R.left - 4, x1 = R.right + 4, y0 = R.top - 4, y1 = R.bottom + 4;
          for (const l of L) for (const a of l.rs) if (a.left < x1 && a.right > x0 && a.top < y1 && a.bottom > y0) bad.push(l.t + ' under the chosen bar'); }
        return bad.slice(0, 2).join(', '); } finally { flat.forEach(([e, rt, tf]) => { e.style.rotate = rt; e.style.transform = tf; }); } });
      strip.push(r ? `${empty ? 'empty ' : ''}${night ? 'night ' : ''}${w}: ${r}` : ''); }
    await ctx.close(); }
  ok(!seam.filter(Boolean).length, `Stampede polish 1 (Nov 18): at 1100-2560 (sample team and empty team) the line-up starts 16-80px under the pink ticker, no empty ink strip between them${seam.filter(Boolean).length ? ': ' + seam.filter(Boolean).join(' | ') : ''}`);
  ok(start.length >= 6 && !start.filter(Boolean).length, `Stampede polish 1b: where the three parts stand side by side (1280-2560) the line-up starts with the board (no strip above its headline), all three end on one baseline and the six rings and names stay on one line${start.filter(Boolean).length ? ': ' + start.filter(Boolean).join(' | ') : ` (${start.length} views)`}`);
  ok(!strip.filter(Boolean).length, `Stampede polish 2 (Nov 18): the receipt's five band names are 13px or more, inside the strip, at least 8px apart and clear of the chosen bar's ring at 320-2560, day and night, team and no team${strip.filter(Boolean).length ? ': ' + strip.filter(Boolean).slice(0, 4).join(' | ') : ''}`); }
// ---- NPR begin: review of the three new pages (Nov 18, docs/rebuild/audits/review-new-pages-nov18.md). Each check failed on the build before its fix. ----
{ /* two test gifts (through the test hook; never in post.js): G1 a day-only (approx) serial code with a space in its code, G2 an exact-time one */
  const G1 = {id: 't-tix', kind: 'item', item: 'Training Ticket', name: 'Training Ticket', amount: 2, how: 'Serial Code', start: '2026-11-11T00:00:00Z', end: '2026-11-22T23:59:00Z', approx: ['start', 'end'], code: 'LA1C TRA1N1NG27', src: ['https://www.nintendolife.com/t']};
  const G2 = {id: 't-cp', kind: 'item', item: 'Quick Coupon', name: 'Quick Coupon', amount: 100, how: 'Serial Code', start: '2026-11-17T02:00:00Z', end: '2026-11-25T03:00:00Z', code: 'QC0PN9', src: ['https://www.pokemon.com/t']};
  const open = async (tz, iso, hash = '#news', w = 1280) => { const ctx = await b.newContext({viewport: {width: w, height: 900}, timezoneId: tz}); const q = await ctx.newPage(); if (iso) await q.clock.setFixedTime(new Date(iso));
    await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + hash); await q.waitForTimeout(2500); return {ctx, q}; };
  const ev = (q, s) => q.evaluate(c => window.__ev(c), s).catch(e => ({err: String(e.message).split('\n')[0].slice(0, 90)}));
  /* every days-left and date the three pages show for one live gift, read from the pieces themselves */
  const read = (q, g) => ev(q, `(() => { const keep = POST, g = ${JSON.stringify(g)}; try { POST = {checked: null, gifts: [g], news: keep.news, series: keep.series};
      const el = h => { const d = document.createElement('div'); d.innerHTML = h; return d; }, tx = (d, s) => ((d.querySelector(s) || {}).textContent || '').replace(/\\s+/g, ' ').trim();
      const pr = el(V2.pages.gifts.draw()), dp = el(V2.dpFront(V2.postNow())), sl = el(V2.sdpSlip(V2.prG(g))), hm = el(V2.sdPost()), cpm = tx(dp, '.dp-cpm');
      const by = [...pr.querySelectorAll('.pr-counter .pr-meta div')].find(x => /Collect by/.test(x.textContent));
      return {rub: tx(pr, '.pr-counter .pr-rub'), hmRub: tx(hm, '.sdp-gifts .pr-rub'), cp: tx(dp, '.dp-cpm b'), mast: tx(dp, '.dp-pk span'), slip: tx(sl, '.sdp-sw i'),
        by: by ? by.querySelector('dd').childNodes[0].textContent.trim() : '', range: (cpm.match(/[A-Z][a-z]{2} \\d+ – [A-Z][a-z]{2} \\d+/) || [''])[0], how: (cpm.match(/Serial [Cc]ode/) || [''])[0],
        copy: (dp.querySelector('.dp-cpn [data-prcopy]') || {dataset: {}}).dataset.prcopy, nums: [...pr.querySelectorAll('.pr-nums p')].map(p => p.querySelector('b').textContent + '/' + p.querySelector('span').textContent)}; } finally { POST = keep; } })()`);
  const days = s => /last day|ends today/i.test(s) ? 0 : /tomorrow/i.test(s) ? 1 : /-?\d+/.test(s) ? +s.match(/-?\d+/)[0] : null;
  const TZ = {Tokyo: 'Asia/Tokyo', LA: 'America/Los_Angeles', UTC: 'UTC'};
  /* [gift, clock, days left per zone, Collect by per zone, the Dispatch's date range per zone] */
  const cases = [[G1, '2026-11-18T12:00:00Z', {Tokyo: 4, LA: 4, UTC: 4}, 'Nov 22', 'Nov 11 – Nov 22'], [G1, '2026-11-22T23:00:00Z', {Tokyo: 0, LA: 0, UTC: 0}, 'Nov 22', 'Nov 11 – Nov 22'],
    [G2, '2026-11-18T12:00:00Z', {Tokyo: 7, LA: 6, UTC: 7}, {Tokyo: 'Nov 25', LA: 'Nov 24', UTC: 'Nov 25'}, {Tokyo: 'Nov 17 – Nov 25', LA: 'Nov 16 – Nov 24', UTC: 'Nov 17 – Nov 25'}],
    [G2, '2026-11-25T02:30:00Z', {Tokyo: 0, LA: 0, UTC: 0}, {Tokyo: 'Nov 25', LA: 'Nov 24', UTC: 'Nov 25'}, {Tokyo: 'Nov 17 – Nov 25', LA: 'Nov 16 – Nov 24', UTC: 'Nov 17 – Nov 25'}]];
  const dl = [], dt = [], neg = [], np8 = [], zero = [];
  for (const [z, tz] of Object.entries(TZ)) for (const clock of ['2026-11-18T12:00:00Z', '2026-11-22T23:00:00Z', '2026-11-25T02:30:00Z']) { const {ctx, q} = await open(tz, clock);
    for (const [g, c, want, by, range] of cases.filter(x => x[1] === clock)) { const r = await read(q, g), tag = `${z} ${clock.slice(5, 16)} ${g.id}`;
      if (r.err) { dl.push(tag + ' ' + r.err); continue; }
      const got = ['rub', 'hmRub', 'cp', 'mast', 'slip'].map(k => k + ':' + days(r[k])); if (got.some(x => x.split(':')[1] !== String(want[z]))) dl.push(`${tag} want ${want[z]}: ${got.join(' ')}`);
      if (['rub', 'hmRub', 'cp', 'mast', 'slip'].some(k => days(r[k]) == null || days(r[k]) < 0)) neg.push(`${tag}: ${JSON.stringify([r.rub, r.hmRub, r.cp, r.mast, r.slip])}`);
      const wb = typeof by === 'string' ? by : by[z], wr = typeof range === 'string' ? range : range[z]; if (r.by !== wb || r.range !== wr) dt.push(`${tag}: Collect by "${r.by}" (want ${wb}), Dispatch "${r.range}" (want ${wr})`);
      if (g === G1) np8.push(r.how === 'Serial code' && r.copy === 'LA1CTRA1N1NG27' ? '' : `${tag}: "${r.how}" copies "${r.copy}"`);
      if (want[z] === 0 && r.nums.some(x => /^0\//.test(x))) zero.push(`${tag}: ${r.nums.join(' | ')}`); }
    await ctx.close(); }
  ok(!dl.length, `NPR-2/3: days left agree on the Post Room's parcel, Home's parcel, the Dispatch coupon and masthead and Home's code slip, in Tokyo, Los Angeles and UTC, mid-gift and in its last hours (${dl.join(' || ').slice(0, 400) || 'all agree'})`);
  ok(!neg.length, `NPR-3: a live gift is never shown as ended or "-1 days left" in any time zone; its last day reads "Last day" / "Ends today" (${neg.join(' || ').slice(0, 300) || 'none'})`);
  ok(!dt.length, `NPR-2: day-only (approx) dates show the source's UTC day and exact times the viewer's local day, the same on the Post Room and the Dispatch (${dt.join(' || ').slice(0, 400) || 'all agree'})`);
  ok(np8.length && !np8.filter(Boolean).length, `NPR-8: the Dispatch reads gifts with the Post Room's reader: "Serial code", and the code copies with its spaces taken out (${np8.filter(Boolean).join(' || ').slice(0, 200) || 'ok'})`);
  ok(!zero.length, `NPR-5a: on a gift's last day the Post Room's numbers show no "0 / one ends today" pair (${zero.join(' || ').slice(0, 200) || 'none'})`);
  /* the rest at the real clock, UTC */
  const {ctx, q} = await open('UTC', null, '#home');
  const n1 = await ev(q, `(() => { const keep = POST, kc = META.calendar && META.calendar.ev.slice(), km = V2.dpUi.more, t = Date.now(), iso = x => new Date(x).toISOString();
    const bad = ['javascript:window.__x=1', ' JavaScript:window.__x=2', 'http://example.org/c', 'data:text/html,hi', 'https:/x', 'vbscript:x'];
    try { POST = {checked: null, series: [], gifts: [{name: 'Bad Gift', how: 'Serial Code', code: 'AB12', start: iso(t - 864e5), end: iso(t + 5 * 864e5), src: bad.concat('https://www.pokemon.com/ok')}],
        news: bad.map((u, i) => ({title: 'Bad ' + i, date: iso(t - i * 36e5), type: i === 1 ? 'Interview' : 'Tournament', url: u})).concat({title: 'Good one', date: iso(t - 9 * 36e5), type: 'Tournament', url: 'https://example.org/g'})};
      const n = V2.dpNext()[0]; if (n) META.calendar.ev.splice(META.calendar.ev.indexOf(n), 0, {...n, url: 'javascript:window.__x=3'}); V2.dpUi.more = true;
      const d = document.createElement('div'); d.innerHTML = V2.pages.news.draw() + V2.dpFront(V2.postNow(), {compact: true}) + V2.pages.gifts.draw() + V2.sdPost();
      const hrefs = [...d.querySelectorAll('[href]')].map(a => a.getAttribute('href')), badH = hrefs.filter(h => !/^https:\\/\\//.test(h) && !/^#/.test(h));
      return {bad: badH.slice(0, 4), plain: [0, 1, 2, 3, 4, 5].every(i => d.textContent.includes('Bad ' + i)), good: hrefs.includes('https://example.org/g'), fix: !!n};
    } finally { POST = keep; if (kc) META.calendar.ev = kc; V2.dpUi.more = km; } })()`);
  ok(n1.bad && !n1.bad.length && n1.plain && n1.good && n1.fix, `NPR-1: a javascript:, data:, vbscript:, http: or broken news, Next Events or source URL never becomes a link on #news, #gifts or Home; its headline shows as plain text (${JSON.stringify(n1)})`);
  const n4 = await ev(q, `(() => { const keep = POST; try { POST = {checked: null, news: [], gifts: [{kind: 'item', name: 'VP', amount: 500, how: 'Event Gift', end: new Date(Date.now() + 20 * 864e5).toISOString()}]};
    return {live: V2.postNow().live.length, shown: /500 VP/.test(V2.pages.gifts.draw())}; } finally { POST = keep; } })()`);
  const wf = fs.readFileSync(path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)), '../../.github/workflows/test.yml'), 'utf8');
  ok(n4.live === 1 && n4.shown, `NPR-4: a gift with no start shows at the counter while its end hasn't passed (${JSON.stringify(n4)})`);
  ok(/^\s*- run: node experiments\/post-data-test\.mjs/m.test(wf) && /'experiments\/post-data-test\.mjs'/.test(wf), 'NPR-4b: the post data test runs in CI (.github/workflows/test.yml, and its path starts a run)');
  const n5 = await ev(q, `(() => { const keep = POST, t = Date.now(), iso = x => new Date(x).toISOString(), el = h => { const d = document.createElement('div'); d.innerHTML = h; return d; };
    const nums = d => [...d.querySelectorAll('.pr-nums p')].map(p => p.querySelector('b').textContent + '/' + p.querySelector('span').textContent);
    try { const now = new Date(t), mid = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()); POST = {checked: null, news: keep.news, gifts: [{name: 'Old Gift', how: 'Event Gift', start: iso(mid - 3 * 864e5), end: iso(Math.min(t - 6e4, mid + 1000))}]};
      const a = nums(el(V2.pages.gifts.draw())); POST = {checked: null, news: [], gifts: [], series: []}; const b = nums(el(V2.pages.gifts.draw())), h = el(V2.sdPost());
      return {endedToday: a, empty: b, home: [...h.querySelectorAll('a')].map(x => x.textContent.trim())}; } finally { POST = keep; } })()`);
  ok(n5.home && !n5.endedToday.some(x => /^0\/.*end/.test(x)) && !n5.empty.some(x => /^0\/gifts so far/.test(x)) && !n5.home.some(x => /All 0 /.test(x)), `NPR-5b: empty states show no "0 / the last one ended today", no "0 gifts so far" and no "All 0 Gifts ›" on Home (${JSON.stringify(n5)})`);
  const n7 = await ev(q, `(() => { const a = V2.sdtData(), b = V2.sdtData(); V2.redraw(); return {same: a === b, afterRedraw: V2.sdtData() === a}; })()`);
  ok(n7.same && n7.afterRedraw, `NPR-7: the tools band's data is cached per ratings map, as V2.sdData (a redraw doesn't rebuild it) (${JSON.stringify(n7)})`);
  const n9 = await ev(q, `JSON.stringify(V2.prG({name: 'x', how: 'Event Gift', src: ['https://notpokemon.com/a', 'https://champions-news.pokemon-home.com/x', 'https://www.pokemon.com/y', 'https://pokemon.com.evil.org/z', 'https://pokemonchampions.jp/n']}).src.map(s => s.name))`);
  ok(n9 === JSON.stringify(['notpokemon.com', 'the official news', 'the official news', 'pokemon.com.evil.org', 'the official news']), `NPR-9: "the official news" only for the official hosts and their subdomains, never a lookalike (${n9})`);
  const n10 = await ev(q, `(() => { const c = homeChamp(); if (!c) return 'no champion'; const k = c.ev.players; try { delete c.ev.players; return V2.dpLatest(); } finally { c.ev.players = k; } })()`);
  ok(typeof n10 === 'string' && /winner's six/.test(n10) && !/\b0 players|undefined|NaN/.test(n10), `NPR-10: Latest Result with no player count shows no "0 players" (${String(typeof n10 === 'string' ? (n10.match(/dp-meta">[^<]*/) || [''])[0] : JSON.stringify(n10)).slice(0, 120)})`);
  const n11 = await ev(q, `(() => { const n = V2.dpNext()[0], g = V2.prG({name: 'Gift', how: 'Serial Code', code: 'AB12', start: new Date(Date.now() - 864e5).toISOString(), end: new Date(Date.now() + 864e5).toISOString()});
    const cp = V2.dpCoupon({coupon: g}); return {row: typeof V2.prCopyRow === 'function' && cp.includes(V2.prCopyRow(g.code, ' dp-crow')) && V2.prLabel(g).includes(V2.prCopyRow(g.code)), short: !n || (typeof V2.evShort === 'function' && V2.sdtData().next.short === V2.evShort(n) && V2.dpEvShort(n).startsWith(V2.evShort(n)))}; })()`);
  ok(n11.row && n11.short, `NPR-11: one Copy Code row (V2.prCopyRow) on the Post Room label and the Dispatch coupon, and one next-event short name (V2.evShort) for the tools band and the Dispatch (${JSON.stringify(n11)})`);
  await ctx.close();
  /* NPR-6: the story count and the kinds beside it count the same stories (no maintenance), over the past 12 months, so January isn't empty; checked now and on Jan 5 */
  const sc = []; for (const clock of [null, '2027-01-05T12:00:00Z']) { const {ctx: c6, q: q6} = await open('UTC', clock, '#news');
    const r = await ev(q6, `(() => { const s = ((document.querySelector('.dp-date > span') || {}).textContent || ''), now = Date.now(), win = POST.news.map(V2.dpItem).filter(x => !V2.dpMaint(x) && V2.dpDay(x.date) && V2.dpDay(x.date) <= now && V2.dpDay(x.date) > now - 365 * 864e5);
      const kinds = {}; for (const x of win) kinds[x.type] = (kinds[x.type] || 0) + 1; const parts = s.split(' · '), n = +((parts[0].match(/^([\\d,]+) stor/) || [])[1] || 'NaN').replace(/,/g, '');
      const lead = (document.querySelector('.dp-lead .dp-sum') || {}).textContent || '', R = (POST.series || []).find(r => r.src === (V2.dpParts(V2.postNow()).lead || {}).url);
      return {s, n, want: win.length, kinds: parts.slice(1).map(p => { const m = p.match(/^([\\d,]+) (.+)$/); return m && Object.entries(kinds).some(([t, k]) => k === +m[1].replace(/,/g, '') && V2.dpPlural(k, t) === p); }), lead, roundYear: R ? R.month.slice(0, 4) : null, year: String(new Date().getFullYear())}; })()`);
    const tag = clock ? 'Jan 5' : 'today'; if (r.err || r.n !== r.want || !r.kinds.every(Boolean) || !/past 12 months/.test(r.s)) sc.push(`${tag}: ${JSON.stringify(r).slice(0, 220)}`);
    if (r.roundYear && r.roundYear !== r.year && /this year/.test(r.lead)) sc.push(`${tag}: the lead says "this year" for a ${r.roundYear} round`);
    await c6.close(); }
  ok(!sc.length, `NPR-6: "N stories in the past 12 months" and its kinds count the same stories (maintenance notices in neither), and January still counts December's (${sc.join(' || ') || 'ok'})`);
  /* the new "Today" figure fits beside the other numbers at every width */
  { const {ctx: c5, q: q5} = await open('UTC', '2026-11-22T23:00:00Z', '#gifts', 320); await ev(q5, `(() => { window.__k5 = POST; POST = {checked: null, news: POST.news, gifts: [${JSON.stringify(G1)}]}; V2.redraw(); })()`); const fit = [];
    for (const w of [320, 390, 768, 1100, 1440]) { await q5.setViewportSize({width: w, height: 900}); await q5.waitForTimeout(300);
      const m = await ev(q5, `(() => { const S = document.querySelector('.pr-stats'); if (!S) return 'no stats'; const R = S.getBoundingClientRect(), bad = [...S.querySelectorAll('.pr-nums b, .pr-nums span')].filter(e => { const r = e.getBoundingClientRect(); return e.scrollWidth > e.clientWidth + 1 || r.left < R.left - .5 || r.right > R.right + .5; }).map(e => e.textContent);
        return (document.documentElement.scrollWidth > innerWidth ? 'sideways scroll ' : '') + bad.join(','); })()`); if (m) fit.push(w + ': ' + JSON.stringify(m)); }
    const t = await ev(q5, `[...document.querySelectorAll('.pr-nums p')].map(p => p.textContent).join(' | ')`); await c5.close();
    ok(!fit.length && /Today/.test(t), `NPR-5c: the last-day figure ("Today") fits in the Post Room's numbers at 320 to 1440 (${fit.join(' ') || t})`); }
  /* polish sweep (Nov 18 night, defect 1): the coupon's Copy Code is the Post Room's button (same class, padding and font), never cut to "Copy Cod" */
  { const {ctx: c12, q: q12} = await open('UTC', null, '#news', 640); const cut = [];
    for (const th of ['day', 'night']) { await q12.evaluate(t => { try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th); await q12.reload(); await q12.waitForTimeout(2200);
      await ev(q12, `(() => { window.__k12 = POST; const t = Date.now(); POST = {checked: null, news: POST.news, series: POST.series, gifts: [{name: 'Test Gift', how: 'Serial Code', code: 'AB1CD0', start: new Date(t - 864e5).toISOString(), end: new Date(t + 5 * 864e5).toISOString()}]}; V2.redraw();
        const d = document.createElement('div'); d.className = 'npr12'; d.style.cssText = 'position:absolute;left:0;top:0;width:480px'; d.innerHTML = V2.prParcel(V2.postNow().live[0]); document.body.append(d); /* outside #main: a redraw keeps it */ })()`);
      for (const w of [640, 1024, 1440, 2560]) { await q12.setViewportSize({width: w, height: 900}); await q12.waitForTimeout(300);
        const m = await ev(q12, `(() => { const a = document.querySelector('.dp-cpn [data-prcopy]'), p = document.querySelector('.npr12 [data-prcopy]'); if (!a || !p) return 'no button';
          const k = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'paddingLeft', 'paddingRight', 'letterSpacing'], A = getComputedStyle(a), P = getComputedStyle(p), s = a.querySelector('span') || a;
          const diff = k.filter(x => A[x] !== P[x]).map(x => x + ' ' + A[x] + ' vs ' + P[x]), R = a.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(s); const T = rg.getBoundingClientRect();
          return [a.className === p.className ? '' : 'class ' + a.className, a.scrollWidth > a.clientWidth + 1 || s.scrollWidth > s.clientWidth + 1 || T.left < R.left - .5 || T.right > R.right + .5 ? 'text clipped (' + Math.round(T.width) + ' in ' + Math.round(R.width) + ')' : '', ...diff].filter(Boolean).join('; '); })()`);
        if (m) cut.push(`${th} ${w}: ${typeof m === 'string' ? m : JSON.stringify(m)}`); }
      await ev(q12, `POST = window.__k12; document.querySelector('.npr12') && document.querySelector('.npr12').remove(); V2.redraw()`); }
    await q12.evaluate(() => { try { localStorage.removeItem('np2.theme'); } catch (e) {} }); await c12.close();
    /* qcheck triage (Nov 18, defect 1): the masthead name has its room (12px above, 16px below) at 320-1280; Home's small paper keeps its 8px / 12px */
    { const {ctx: c13, q: q13} = await open('UTC', null, '#news', 320); const nm = [];
      for (const w of [320, 390, 820, 1280]) { await q13.setViewportSize({width: w, height: 900}); await q13.waitForTimeout(300);
        const m = await ev(q13, `(() => { const n = document.querySelector('.dp-paper:not(.dp-small) .dp-name'); if (!n) return 'no name'; const c = getComputedStyle(n);
          const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:0;top:0;width:340px'; d.innerHTML = V2.dpFront(V2.postNow(), {compact: true}); document.body.append(d);
          const s = getComputedStyle(d.querySelector('.dp-small .dp-name')), out = c.marginTop + '/' + c.marginBottom + ' small ' + s.marginTop + '/' + s.marginBottom; d.remove(); return out; })()`);
        if (m !== '12px/16px small 8px/12px') nm.push(w + ': ' + (typeof m === 'string' ? m : JSON.stringify(m))); }
      await c13.close(); ok(!nm.length, `NPR-13 (qcheck triage defect 1): the Dispatch's name keeps 12px above and 16px below at 320-1280 (the margin reset no longer wins); Home's small paper keeps 8px / 12px (${nm.join(' | ') || 'ok'})`); }
    ok(!cut.length, `NPR-12 (polish sweep defect 1): the News coupon's Copy Code is the Post Room's button (class, padding, font) and its text is never clipped, 640 to 2560, day and night (${cut.join(' || ').slice(0, 400) || 'same button, not clipped'})`); }
}
// ---- NPR end ----
} // main2 end (Base Stats, below, is main2 too)
if (part('groups')) {
await BR(); /* behaviour review (Nov 18), above */
await MQ(); /* Sim's Nov 18 answers, above */
await AS(); /* All Suggestions sheet, option C, above */
}
// WebKit pair (Nov 18, docs/rebuild/test-runs/webkit-new-pages-nov18.md): two Safari defects, measured the same way in any engine. This file runs
// them in Chromium; for Safari's engine the same function (between the wk-pair markers) runs with playwright.webkit, over http (WebKit blocks
// the fonts on file://). WK-1 the stamp's perforated edge: on its pixels, nothing outside the holes' centre line (Safari drew a ring of loose
// dots there), the holes along every edge, the middle solid, the corners bitten. WK-2 the Copy Code row, 320-2560: the code never overflows or
// breaks, 13px or more; Copy Code sits beside the code wherever the code fits beside it at 24px (Safari dropped it under at 1440, Chromium
// by 1.3px from doing the same); the two parcels in a row decide alike, so their rows line up.
// wk-pair start
const wkPair = async (br, url, ok) => {
  const FX = `(() => { const t = Date.now(), d = 864e5, iso = x => new Date(x).toISOString(); POST = {checked: null, news: POST.news, series: POST.series, gifts: [
    {id: 'w1', name: 'Training Ticket', amount: 2, how: 'Serial Code', code: 'LA1CTRA1N1NG27', start: iso(t - d), end: iso(t + 9 * d)},
    {id: 'w2', name: 'Mint Coupons', amount: 3, how: 'Serial Code', code: '10M1NTRNR', start: iso(t - d), end: iso(t + 9 * d)}].concat(Array.from({length: 6}, (_, i) =>
    ({id: 'wp' + i, kind: 'item', item: 'VP', name: 'VP', amount: 500, how: 'Serial Code', start: iso(t - 90 * d), end: iso(t - (40 + i) * d)})))}; V2.prUi = {f: 'all', all: false}; V2.redraw(); })()`;
  const q = await br.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  const go = async (route, w) => { await q.setViewportSize({width: w, height: 900}); await q.goto(url + '#' + route); await q.waitForTimeout(2200); await q.evaluate(fx => window.__ev(fx), FX); await q.evaluate(() => document.fonts.ready); await q.waitForTimeout(400); };
  /* WK-1: each stamp drawn black on white, upright, with its picture hidden, at 2x (as on an iPhone or iPad), then read pixel by pixel (distances from the stamp box's edge) */
  const st = [];
  for (const [route, w, sel] of [['gifts', 390, '#main .pr-sheet .pr-sw'], ['gifts', 1440, '#main .pr-sheet .pr-sw'], ['home', 1440, '.sdp-stamps .pr-sw']]) {
    await go(route, w);
    await q.addStyleTag({content: '.wkst .pr-sw{filter:none;background:#fff;rotate:none}.wkst .pr-st{background:#000;transition:none}.wkst .pr-st>*,.wkst .pr-pm{visibility:hidden}'}); await q.evaluate(() => document.documentElement.classList.add('wkst'));
    const els = await q.$$(sel + ' .pr-st'); if (!els.length) { st.push(`${route} ${w}: no stamps`); continue; }
    for (const el of els.slice(0, 2)) { await el.scrollIntoViewIfNeeded(); await q.waitForTimeout(150); const r = await el.boundingBox(); const x0 = Math.floor(r.x), y0 = Math.floor(r.y);
      const png = await q.screenshot({clip: {x: x0, y: y0, width: Math.ceil(r.x + r.width) - x0, height: Math.ceil(r.y + r.height) - y0}});
      const m = await q.evaluate(async ([b64, dx, dy, W, H]) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
        const g = c.getContext('2d'); g.drawImage(im, 0, 0); const D = g.getImageData(0, 0, c.width, c.height).data;
        const dark = (x, y) => { const i = (Math.floor((y + dy) * 2) * c.width + Math.floor((x + dx) * 2)) * 4; return D[i] + D[i + 1] + D[i + 2] < 384; };
        const line = (horiz, at, from, to) => { const v = []; for (let s = from; s <= to; s += .5) v.push(horiz ? dark(s, at) : dark(at, s)); return v; };
        /* the holes cut into one edge: the centres of the gaps in the paper, in px from the line's start (gaps touching either end left out) */
        const holes = (v, from) => { const c = []; let s = -1; for (let i = 0; i < v.length; i++) { if (!v[i] && s < 0) s = i; if (v[i] && s >= 0) { if (s > 0) c.push(from + (s + i - 1) / 4); s = -1; } } return c; };
        /* e: how far in the paper starts on each side (its outermost pixel); the holes sit on that line, 6px in. Then: holes all along it, evenly
           12px apart (none missing, none extra), and solid paper 6px further in */
        const edge = (hz, far, L, M) => { let e = 99; for (let s = 2; s < M - 2; s += .5) for (let t = 0; t < 14; t += .5) if (hz ? dark(s, far ? L - .5 - t : t) : dark(far ? L - .5 - t : t, s)) { e = Math.min(e, t); break; } return e; };
        const out = [], E = [['top', true, false, H, W], ['bottom', true, true, H, W], ['left', false, false, W, H], ['right', false, true, W, H]], es = {};
        for (const [nm, hz, far, D, L] of E) es[nm] = edge(hz, far, D, L);
        for (const [nm, hz, far, D, L] of E) { const e = es[nm], at = d => far ? D - .5 - e - d : e + d, [p0, p1] = hz ? [es.left, es.right] : [es.top, es.bottom];
          if (e < 5 || e > 13) out.push(`${nm}: paper starts ${e}px in (want 6: nothing in the outer band)`);
          const a = p0 + 6, z = L - p1 - 6, c = holes(line(hz, at(1.5), a, z), a), gaps = c.slice(1).map((x, i) => x - c[i]);
          if (c.length < (z - a) / 12 - 1 || gaps.some(g => g < 10 || g > 14) || !c.length || c[0] - a > 14 || z - c[c.length - 1] > 14) out.push(`${nm}: holes along the edge at ${c.map(Math.round).join(',') || 'none'}`);
          if (line(hz, at(6), p0 + 12, L - p1 - 12).some(x => !x)) out.push(`${nm}: not solid 6px inside the edge`); }
        if (Math.abs(es.left - es.right) > 2 || Math.abs(es.top - es.bottom) > 2) out.push('paper off centre ' + JSON.stringify(es));
        if (line(true, H / 2, 16, W - 16).some(x => !x)) out.push('middle not solid');
        for (const [x, y] of [[1.5, 1.5], [es.left + 1, es.top + 1], [W - 2 - es.right, es.top + 1], [es.left + 1, H - 2 - es.bottom], [W - 2 - es.right, H - 2 - es.bottom]]) if (dark(x, y)) out.push(`corner ${Math.round(x)},${Math.round(y)} not bitten`);
        return out; }, [png.toString('base64'), r.x - x0, r.y - y0, r.width, r.height]);
      if (m.length) st.push(`${route} ${w} ${Math.round(r.width)}x${Math.round(r.height)}: ${m.join(', ')}`); } }
  ok(!st.length, `WK-1 (WebKit pair): the stamps' perforated edge, read off the pixels on #gifts 390 / 1440 and Home's post band 1440: no paper outside the holes' line, holes along each edge, solid middle, bitten corners (${st.join(' | ').slice(0, 400) || 'clean'})`);
  /* WK-2: every Copy Code row on #gifts (320-2560) and Home and News (390-2560) */
  const bad = [], seen = {beside: 0, meant: 0};
  for (const [route, sel, ws] of [['gifts', '#main .pr-crow', [320, 390, 600, 820, 1024, 1100, 1180, 1280, 1300, 1360, 1400, 1440, 1600, 1920, 2560]], ['home', '.sdp .pr-crow', [390, 820, 1100, 1440, 2560]], ['news', '.dp-crow', [390, 820, 1100, 1300, 1440, 2560]]]) {
    await go(route, 1440);
    for (const w of ws) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(300);
      const rs = await q.evaluate(sel => [...document.querySelectorAll(sel)].filter(c => c.getClientRects().length).map(c => {
        const cb = c.querySelector('.pr-cbox'), cv = c.querySelector('.pr-cv'), bt = c.querySelector('.pr-copy'), R = c.getBoundingClientRect(), B = cb.getBoundingClientRect(), T = bt.getBoundingClientRect();
        const rg = document.createRange(); rg.selectNodeContents(cv); const X = rg.getBoundingClientRect(), fs = parseFloat(getComputedStyle(cv).fontSize);
        const k = cv.cloneNode(true); k.style.cssText = 'position:absolute;visibility:hidden;display:inline-block;white-space:nowrap;font-size:24px'; cb.append(k); const w24 = k.getBoundingClientRect().width; k.remove();
        const beside = T.top < B.bottom - 2, meant = getComputedStyle(cb).flexBasis !== '100%' && R.width >= w24 + parseFloat(getComputedStyle(c).columnGap) + T.width, why = [];
        if (cv.scrollWidth > cv.clientWidth + 1 || X.right > B.right + 1 || X.left < B.left - 1 || T.right > R.right + 1 || B.right > R.right + 1) why.push('overflows');
        if (X.height > fs * 1.2 * 1.6) why.push('code on ' + Math.round(X.height / (fs * 1.2)) + ' lines'); if (fs < 13) why.push(fs + 'px');
        if (meant && !beside) why.push(`Copy Code under the code though it fits beside (${Math.round(R.width)} >= ${Math.round(w24)}+gap+${Math.round(T.width)})`);
        return {why: why.join(', '), beside, meant, top: Math.round((c.closest('.pr-parcel') || c.closest('.dp-cpn, .pr-label')).getBoundingClientRect().top), h: R.height, code: cv.textContent}; }), sel);
      for (const r of rs) { if (r.why) bad.push(`${route} ${w} ${r.code}: ${r.why}`); seen.beside += r.beside; seen.meant += r.meant; }
      const rows = {}; for (const r of rs) (rows[r.top] = rows[r.top] || []).push(r);
      for (const row of Object.values(rows)) if (row.length > 1 && (new Set(row.map(r => r.beside)).size > 1 || Math.max(...row.map(r => r.h)) - Math.min(...row.map(r => r.h)) > 1)) bad.push(`${route} ${w}: the parcels' rows don't line up (${row.map(r => (r.beside ? 'beside ' : 'under ') + Math.round(r.h) + 'px').join(' vs ')})`); } }
  ok(!bad.length && seen.meant > 10, `WK-2 (WebKit pair): Copy Code rows on #gifts 320-2560, Home and News: never overflow or break, 13px+, Copy Code beside the code wherever it fits there at 24px (${seen.meant} such rows), a row's parcels line up (${bad.join(' | ').slice(0, 500) || 'all good'})`);
  await q.close(); };
// wk-pair end
if (part('main2')) { // Sim, Nov 18: Base Stats calm and compact, on theme (no big bubbly numbers): at most 260px tall on a phone, numbers 16px in the slanted
  // type with no shadow, a Mega's numbers line up in each column, nothing spills out, at 320-1440
  const bad = [], ctx = await b.newContext(); const q = await ctx.newPage();
  for (const [m, w] of [['garchomp', 320], ['garchomp', 390], ['garchomp', 1440], ['charizard-mega-y', 390], ['charizard-mega-y', 1440]]) {
    await q.setViewportSize({width: w, height: 900}); await q.goto('file://' + PAGE + '#pokemon=' + m); await q.waitForTimeout(2200);
    const r = await q.evaluate(() => { const s = document.querySelector('.pk-stats'); if (!s) return {none: 1}; const R = s.getBoundingClientRect(), bs = [...s.querySelectorAll('.pk-bsr dd>b')], c = getComputedStyle(bs[0]);
      const edges = new Set(bs.map(b => Math.round(b.getBoundingClientRect().right))), over = [...s.querySelectorAll('*')].some(e => e.getBoundingClientRect().right > R.right + 1);
      return {h: Math.round(R.height), fs: c.fontSize, st: c.fontStyle, sh: c.textShadow, cols: edges.size, over}; });
    if (r.none || r.fs !== '16px' || r.st !== 'italic' || r.sh !== 'none' || r.cols > 2 || r.over || (w < 700 && m === 'garchomp' && r.h > 260)) bad.push(`${m} ${w}: ${JSON.stringify(r)}`); }
  await ctx.close(); ok(!bad.length, `Pokémon page Base Stats (Sim, Nov 18): compact (260px or less on a phone), 16px slanted numbers with no shadow, numbers lined up, nothing out (${bad.join(' | ') || 'all as planned'})`); }
if (part('groups')) { await HQ(); await wkPair(b, 'file://' + PAGE, ok); }
await b.close();
console.log(`v2-minors${PART === 'all' ? '' : ' (' + PART + ')'}:${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
