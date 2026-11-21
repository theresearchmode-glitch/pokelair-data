// The shared kit's own test page (site-wide reskin, Nov 21; app/src/v2/kit.js + css/kit.css). It builds one page from every kit part
// with real Pokémon (Rillaboom, Sneasler, Incineroar, Kingambit, Mega Charizard Y, Paldean Tauros (Combat), Squawkabilly (Yellow),
// Indeedee (F)) inside the real v2 build, opens it at 320, 360, 390, 700, 1040, 1440 and 2560 wide, by day and night, and FAILS on:
//   text overflowing its box or clipped at the page edge; overlapping text (a card's name/score/form against any other text); taps under
//   44px; sideways scroll; font sizes off the scale (display parts excepted); Unbounded under 15px; a row of six that wraps unevenly
//   (5 + 1, 4 + 2); a word broken over two lines; a line that ends with a lone letter; text under 4.5:1 on its background.
// Also fails on card text over the Pokémon art's box (Sim, Nov 21). What it can't see: an art picture's own transparent margins, hover and focus looks, real phones' font rendering.
// The scores and facts on the page are the reference mock-ups' (ratings2.html), only to fill the parts; the page is never shipped.
//   node app/build.mjs --v2 --art=../src/v2/art/ && node app/test/kit-page.mjs     (SHOTS=<folder> saves one picture per width and mode)
import {chromium} from 'playwright'; import path from 'node:path'; import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('..', import.meta.url)), PAGE = path.resolve(process.env.PAGE || APP + 'dist/v2.html'), SHOTS = process.env.SHOTS || '';
if (!fs.existsSync(PAGE)) { console.log('kit-page: no ' + PAGE + ' (run node app/build.mjs --v2 --art=../src/v2/art/ first)'); process.exit(1); }
if (SHOTS) fs.mkdirSync(SHOTS, {recursive: true});
const WIDTHS = [320, 360, 390, 700, 1040, 1440, 2560], MODES = ['day', 'night'];
const SCALE = [13, 15, 16, 17, 20, 22, 24, 26, 28, 34];
const b = await chromium.launch(); let fails = 0, checks = 0; const bad = [];
const kitPage = () => { const go = {'data-kit': 'go'};
  const row1 = [['Rillaboom', 97, '51.6% wins'], ['Sneasler', 96, '52.0% wins'], ['Incineroar', 95, '51.4% wins'], ['Kingambit', 93, '54.2% wins'], ['Charizard-Mega-Y', 90, '50.9% wins'], ['Tauros-Paldea-Combat', 71, '49.8% wins']];
  const row2 = [['Squawkabilly-Yellow', 58], ['Indeedee-F', 74], ['Tauros-Paldea-Combat', 71], ['Charizard-Mega-Y', 90], ['Kingambit', 93], ['Incineroar', 95]];
  return `<div class="k-demo">` + V2.kPlan(V2.kHead({kicker: 'META · THE LINE-UP', h1Html: 'Who’s <em>running</em> the show.', lead: 'Every Pokémon rated 0–100 from 10,209 real tournament teams. Know who you’re up against before you plot.'})
    + V2.kSent(['Show me', {w: 'everyone', on: true}, {w: 'Megas'}, {w: 'no Megas'}, 'from', {w: 'every event', menu: true}], {label: 'Which Pokémon to show'})
    + V2.kStep(1, 'The kingpin', '#1 right now', V2.kHero(V2.kCard('Rillaboom', {score: 97, tier: 'S tier', size: 'hero', fact: 'Grass · 51.6% wins', attrs: {'data-kit': 'hero'}}),
      V2.kScrib('on almost half of all teams!') + V2.kFacts([['48.1%', 'of teams', 1], ['51.6%', 'win rate'], ['85', 'base Speed']]) + V2.kGo('BUILD AROUND IT.', go) + `<p>${V2.kLink('Pokémon Page', {href: '#pokemon'})}</p>`))
    + V2.kStep(2, 'The heavy hitters', '345 rated · best first', V2.kRoster(row1.map(([n, s, f], i) => V2.kCard(n, {score: s, tier: s >= 90 ? 'S tier' : 'B tier', fact: f, sel: i === 1, mine: i === 4, attrs: {'data-kit': n}}))), {link: {label: 'List with win rates', attrs: {href: '#usage'}}})
    + V2.kStep(3, 'The receipts', 'what we called, what we missed', `<p class="k-tags">${V2.kTag('good', 'CALLED IT')} ${V2.kTag('bad', 'MISSED')} ${V2.kTag('live', 'LIVE NOW')} ${V2.kTag('neutral', 'Even match')} ${V2.kMine()}</p>`
      + V2.kRoster(row2.map(([n, s]) => V2.kCard(n, {score: s, size: 'small', mine: n === 'Indeedee-F'})))
      + V2.kRoster(['Rillaboom', 'Sneasler', 'Squawkabilly-Yellow'].map(n => V2.kCard(n, {score: 80, size: 'small'}))))) + `</div>`; };
for (const w of WIDTHS) for (const mode of MODES) {
  const ctx = await b.newContext({viewport: {width: w, height: 900}, deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#home'); await p.waitForFunction(() => window.V2 && V2.kCard && document.querySelector('#app .np-head'), null, {timeout: 20000});
  await p.evaluate(([src, mode]) => { V2.pages.kit = {place: 'meta', draw: new Function('return (' + src + ')()')}; V2.setTheme(mode); location.hash = '#kit'; }, [kitPage.toString(), mode]);
  await p.waitForFunction(() => document.querySelector('.k-demo .k-roster'), null, {timeout: 10000}); await p.waitForTimeout(300);
  await p.evaluate(async () => { document.querySelectorAll('.k-demo img').forEach(i => { i.loading = 'eager'; }); await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('.k-demo img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); V2.kFit(); });
  await p.waitForTimeout(200);
  const r = await p.evaluate(([SCALE]) => { const out = [], add = (k, m) => out.push(k + ': ' + m), demo = document.querySelector('.k-demo'), vw = document.documentElement.clientWidth;
    const nameOf = e => (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : e.tagName.toLowerCase()) + ' "' + e.textContent.trim().slice(0, 24) + '"';
    if (document.documentElement.scrollWidth > vw) add('sideways scroll', document.documentElement.scrollWidth + ' > ' + vw);
    // every text node and its tight line boxes
    const texts = []; { const tw = document.createTreeWalker(demo, NodeFilter.SHOW_TEXT); let t; while ((t = tw.nextNode())) { if (!t.data.trim()) continue; const e = t.parentElement, cs = getComputedStyle(e); if (cs.visibility === 'hidden' || !e.getClientRects().length) continue;
      /* each line box trimmed to its em box (font size tall, centred): a font's content area is taller than a tight headline's line height,
         so the raw box would report overlaps and overflows that no letter makes */
      const fs = parseFloat(cs.fontSize), em = x => { const d = Math.max(0, (x.height - fs) / 2); return {left: x.left, right: x.right, width: x.width, top: x.top + d, bottom: x.bottom - d, height: x.height - 2 * d}; };
      const rg = document.createRange(); rg.selectNodeContents(t); const rs = [...rg.getClientRects()].filter(x => x.width > 0.5 && x.height > 0.5).map(em); if (rs.length) texts.push({t, e, rs}); } }
    const SLANT = 3; // a synthetic italic leans past its box by a few pixels
    const boxOf = e => e.closest('.k-w,.k-go,.k-tag,.k-mine,.k-kicker,.k-link') || e.closest('.k-nm') || e;
    for (const {e, rs} of texts) { const bx = boxOf(e), B = bx.getBoundingClientRect(), plate = e.closest('.k-plate'), P = plate && plate.getBoundingClientRect();
      for (const x of rs) { if (x.left < -0.5 || x.right > vw + 0.5) add('clipped at the page edge', nameOf(e));
        if (x.right > B.right + SLANT || x.left < B.left - SLANT || x.bottom > B.bottom + 2 || x.top < B.top - 2) add('text out of its box', nameOf(e) + ` (${Math.round(x.right - B.right)}px right)`);
        if (P && !e.closest('.k-mine') && (x.right > P.right + SLANT || x.left < P.left - 1)) add('text out of its card', nameOf(e)); }
      if (e.closest('.k-name,.k-form,.k-h1,.k-h2') && (e.scrollWidth > e.clientWidth + 1)) add('text out of its box', nameOf(e) + ' (scrollWidth)'); }
    // overlap: any two text boxes of different elements (a chip's whole box for the score and the yours marker)
    const boxes = texts.map(({e, rs}) => { const c = e.closest('.k-mine'); return {e: c || e, rs: c ? [c.getBoundingClientRect()] : rs}; });
    const hit = (a, z) => a.left < z.right - 1 && z.left < a.right - 1 && a.top < z.bottom - 1 && z.top < a.bottom - 1;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const A = boxes[i], Z = boxes[j]; if (A.e === Z.e || A.e.contains(Z.e) || Z.e.contains(A.e)) continue;
      if (A.rs.some(a => Z.rs.some(z => hit(a, z)))) add('overlap', nameOf(A.e) + ' x ' + nameOf(Z.e)); }
    // Sim, Nov 21 (~12:25 PM): no score (and no other card text) over the Pokémon art; the art's box, not only its visible pixels
    for (const c of demo.querySelectorAll('.k-card')) { const im = c.querySelector('.k-art'); if (!im) continue; const I = im.getBoundingClientRect();
      for (const t of c.querySelectorAll('.k-score,.k-tier,.k-form,.k-name,.k-fact')) { const T = t.getBoundingClientRect(); if (T.width && T.left < I.right && I.left < T.right && T.top < I.bottom - 0.5 && I.top < T.bottom) add('card text over the art', nameOf(t)); } }
    // taps
    for (const t of demo.querySelectorAll('a,button')) { const R = t.getBoundingClientRect(); if (R.height < 44 - 0.5 || R.width < 44 - 0.5) add('tap under 44px', nameOf(t) + ` ${Math.round(R.width)}x${Math.round(R.height)}`); }
    // type: on the scale (display parts excepted), Unbounded 15px and up
    const DISPLAY = '.k-h1,.k-h1 *,.k-sent,.k-sent *,.k-h2,.k-go,.k-hero-c .k-score';
    for (const {e} of texts) { const cs = getComputedStyle(e), px = parseFloat(cs.fontSize);
      if (!e.matches(DISPLAY) && !SCALE.includes(Math.round(px * 100) / 100)) add('font size off the scale', nameOf(e) + ' ' + px + 'px');
      if (e.matches(DISPLAY) && px < 17) add('display text too small', nameOf(e) + ' ' + px + 'px');
      if (/Unbounded/.test(cs.fontFamily) && px < 15) add('Unbounded under 15px', nameOf(e) + ' ' + px + 'px'); }
    // rows of six: every row the same count (6, or 3 + 3, or 2 + 2 + 2), never 5 + 1 or 4 + 2
    for (const ro of demo.querySelectorAll('.k-roster')) { const li = [...ro.children]; if (li.length !== 6) continue; const rows = new Map(); for (const x of li) { const k = Math.round(x.getBoundingClientRect().top); rows.set(k, (rows.get(k) || 0) + 1); }
      const c = [...rows.values()]; if (new Set(c).size > 1) add('uneven row of six', c.join(' + ')); }
    // words: never broken over two lines; no line ends with a lone letter (names, headlines, the sentence)
    for (const el of demo.querySelectorAll('.k-name,.k-form,.k-h1,.k-h2,.k-lead,.k-note,.k-fact,.k-sent>span,.k-go,.k-tag')) { const words = []; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let t;
      while ((t = tw.nextNode())) { const re = /[^\s ]+/g; let m; while ((m = re.exec(t.data))) { const rg = document.createRange(); rg.setStart(t, m.index); rg.setEnd(t, m.index + m[0].length); const rs = [...rg.getClientRects()].filter(x => x.width > 0.5);
        if (new Set(rs.map(x => Math.round(x.top / 4))).size > 1) add('word broken over two lines', nameOf(el) + ' "' + m[0] + '"'); if (rs.length) words.push({w: m[0], top: Math.round(rs[0].top / 4), ln: rs[0].bottom}); } }
      const lines = new Map(); for (const x of words) lines.set(x.top, x.w); /* the last word seen on each line */
      if (lines.size > 1) for (const [, last] of lines) if (/^[A-Za-z]$/.test(last)) add('a line ends with a lone letter', nameOf(el) + ' "' + last + '"'); }
    // contrast: each text against the first solid background under it (card text: the card's own colour)
    const rgb = s => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(s); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; };
    const hex = s => { s = s.trim(); if (/^#[0-9a-f]{6}$/i.test(s)) return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 1]; return rgb(s); };
    const L = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
    const ratio = (a, z) => { const x = L(a), y = L(z); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const bgOf = e => { for (let x = e; x; x = x.parentElement) { const c = rgb(getComputedStyle(x).backgroundColor); if (c && c[3] > .5) return c; if (x.classList && x.classList.contains('k-plate')) return hex(getComputedStyle(x).getPropertyValue('--k-card')); } return hex(getComputedStyle(document.body).backgroundColor); };
    for (const {e} of texts) { const c = rgb(getComputedStyle(e).color), z = bgOf(e); if (!c || !z) continue; const q = ratio(c, z); if (q < 4.5) add('contrast under 4.5:1', nameOf(e) + ' ' + q.toFixed(2) + ':1'); }
    return [...new Set(out)]; }, [SCALE]);
  checks++; if (errs.length) r.push('page error: ' + errs.join(' | '));
  if (r.length) { fails++; bad.push(`${w} ${mode}:\n    ` + r.join('\n    ')); }
  console.log(`  ${r.length ? 'FAIL' : 'ok  '} ${w} ${mode}${r.length ? ' (' + r.length + ')' : ''}`);
  if (SHOTS) await p.screenshot({path: path.join(SHOTS, `kit-${w}-${mode}.png`), fullPage: true});
  await ctx.close(); }
await b.close();
if (bad.length) console.log('\n' + bad.join('\n'));
console.log(fails ? `kit-page: ${fails} of ${checks} views FAILED` : `kit-page: all ${checks} views passed (7 widths x day and night)`); process.exit(fails ? 1 : 0);
