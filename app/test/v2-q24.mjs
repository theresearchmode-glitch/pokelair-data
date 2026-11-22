// Odd addresses (Sim's Q24 A, Nov 19; docs/rebuild/morning-questions-nov19.md item 20): an address that matches no page (#nonsense)
// shows the not-found page in the 'No Pokémon here.' style: eyebrow 'Page not found', one h1 'Nothing here.', one line and a working
// 'Go to Home' button; header and phone bar stay, no top tab is marked current, the tab title says 'Page not found'. Before: Home on
// the real site, My Team in the Preview. '#owner' shows visitors the same page (was 'Only for the site's owner.'); the owner still gets
// the owner page. Every page the router knows (V2.pages) still opens itself, and so do addresses with a part (#method=rating ...).
// No address at all still opens Home (My Team in the Preview). 320 / 390 / 1440, light and dark: nothing out of its box, no sideways
// scroll, the headline is Unbounded slanted. Works on both builds (with and without --preview-data).
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q24.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (hash, {W = 1440, th = 'light'} = {}) => {
  const ctx = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th, hasTouch: W < 700}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e.message || e)));
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + hash, {timeout: 90000}); await p.waitForFunction(() => window.V2 && document.querySelector('#app .np-head'), null, {timeout: 30000}); await p.waitForTimeout(1200);
  return {ctx, p, errs}; };
const look = p => p.evaluate(() => { const m = document.getElementById('main'), h1 = [...m.querySelectorAll('h1')], go = [...m.querySelectorAll('a')].find(a => /^go to home\.?$/i.test(a.textContent.trim())); /* Nov 22 (Sim approved 12:40 PM): the kit's pink GO TO HOME. */
  return {route: V2.route(), nf: !!m.querySelector('[data-v2nf]'), h1: h1.map(h => h.textContent.replace(/\s+/g, ' ').trim()), eyebrow: (m.querySelector('.np-eyebrow') || {}).textContent || '',
    go: go ? go.getAttribute('href') : null, title: document.title, head: !!document.querySelector('#app .np-head'), bar: !!document.querySelector('#app .np-bar'),
    cur: [...document.querySelectorAll('.np-nav [aria-current], .np-bar [aria-current]')].map(a => a.textContent.trim()), hash: location.hash, txt: m.innerText.trim().length,
    owner: /Only for/.test(m.innerText)}; });
const isNF = r => r.nf && r.h1.length === 1 && r.h1[0] === 'Nothing here. Wrong turn.' && /Page not found/i.test(r.eyebrow) && r.go === '#home' && r.head && r.bar && !r.cur.length && r.title === 'Page not found · NastyPlot';
const say = r => `route ${r.route}, h1 ${JSON.stringify(r.h1)}, eyebrow '${r.eyebrow.trim()}', Go to Home ${r.go}, current tab ${JSON.stringify(r.cur)}, title '${r.title}', address ${r.hash}`;

// 1. unknown addresses
let preview = false; const unk = [];
for (const h of ['#nonsense', '#xyz=1', '#Home', '#constructor', '#toString']) { const {ctx, p, errs} = await open(h); const r = await look(p); preview = await p.evaluate(() => !!window.__NP_PREVIEW);
  if (!isNF(r) || errs.length) unk.push(`${h}: ${say(r)}${errs.length ? ', error ' + errs[0] : ''}`); await ctx.close(); }
ok(!unk.length, `unknown addresses (#nonsense, #xyz=1, #Home, #constructor, #toString) show 'Nothing here.' with Go to Home, header and phone bar kept, no tab current, title 'Page not found · NastyPlot' (${unk.length} not${unk.length ? '; e.g. ' + unk[0] : ''})`);
console.log(`  (this build: ${preview ? 'Preview, --preview-data' : 'real, no --preview-data'})`);

// 2. Go to Home works (click), and focus lands on the h1 when you arrive by a link
{ const {ctx, p} = await open('#home'); const bad = [];
  await p.evaluate(() => { const a = document.querySelector('.np-head a.logo'); a.focus(); location.hash = '#nonsense'; }); await p.waitForTimeout(600);
  const f = await p.evaluate(() => { const a = document.activeElement; return {tag: a && a.tagName, txt: a && a.textContent.trim(), nf: !!document.querySelector('#main [data-v2nf]')}; });
  if (!f.nf || f.tag !== 'H1' || f.txt.replace(/\s+/g, ' ') !== 'Nothing here. Wrong turn.') bad.push(`arriving by a link: focus on ${f.tag} '${f.txt}', not-found ${f.nf}`);
  const btn = p.locator('#main [data-v2nf] a[href="#home"]');
  if (!await btn.count()) bad.push('no Go to Home button on the page'); else { await btn.click(); await p.waitForTimeout(800); const r = await look(p);
    if (r.route !== 'home' || r.hash !== '#home' || r.nf || !r.cur.includes('Home')) bad.push(`after Go to Home: ${say(r)}`); }
  ok(!bad.length, `Go to Home opens Home (route home, address #home, Home tab current); arriving by a link puts focus on the h1 'Nothing here.' (${bad.length ? bad.join('; ') : 'ok'})`); await ctx.close(); }

// 3. #owner: visitors get the not-found page; the owner still gets the owner page
{ const {ctx, p} = await open('#owner'); const r = await look(p), bad = [];
  if (!isNF(r) || r.owner) bad.push(`visitor: ${say(r)}${r.owner ? ", still says 'Only for'" : ''}`);
  await p.evaluate(() => { V2.OWN = true; V2.draw(); }); await p.waitForTimeout(400); const o = await look(p);
  if (o.nf || !o.h1.length || !/What people use and say/.test(o.h1[0]) || o.title === 'Page not found · NastyPlot') bad.push(`owner: ${say(o)}`);
  ok(!bad.length, `#owner: a visitor sees 'Nothing here.' (not 'Only for the site's owner.'); the owner sees 'What people use and say.' (${bad.length ? bad.join('; ') : 'ok'})`); await ctx.close(); }

// 4. every route the router knows still opens its own page; addresses with a part too; no address = the start page
{ const {ctx, p} = await open('#home'); const routes = await p.evaluate(() => Object.keys(V2.pages).filter(k => k !== 'notfound' && k !== 'owner')); const bad = [];
  const extra = ['#method=rating', '#about=priv', '#about=contact', '#pokemon=garchomp', '#team=zzz'];
  for (const h of [...routes.map(k => '#' + k), ...extra]) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(250);
    const r = await look(p), want = h.slice(1).split('=')[0]; if (r.nf || r.route !== want || !r.txt) bad.push(`${h}: ${say(r)}`); }
  ok(routes.length >= 20 && !bad.length, `${routes.length} router pages + ${extra.length} addresses with a part each open their own page, never the not-found page (${bad.length ? bad.length + ' not; e.g. ' + bad[0] : 'all'})`); await ctx.close(); }
{ const bad = []; for (const h of ['', '#']) { const {ctx, p} = await open(h); const r = await look(p), want = preview ? 'team' : 'home'; if (r.nf || r.route !== want) bad.push(`'${h}': ${say(r)}`); await ctx.close(); }
  ok(!bad.length, `no address ('' and '#') still opens ${preview ? 'My Team (Preview)' : 'Home'} (${bad.length ? bad.join('; ') : 'ok'})`); }

// 5. 320 / 390 / 1440, light and dark: nothing out of its box, no sideways scroll, Unbounded slanted headline, a 44px+ button
{ const bad = [];
  for (const th of ['light', 'dark']) for (const W of [320, 390, 1440]) for (const h of ['#nonsense', '#owner']) { const {ctx, p} = await open(h, {W, th});
    const m = await p.evaluate(() => { const root = document.querySelector('#main [data-v2nf]'); if (!root) return null; const box = root.getBoundingClientRect(), out = [];
      for (const e of root.querySelectorAll('h1, p, a, span')) { const r = e.getBoundingClientRect(); if (!r.width) continue;
        if (r.left < box.left - 0.5 || r.right > box.right + 0.5 || r.right > innerWidth || r.left < 0) out.push(`${e.tagName} '${e.textContent.trim().slice(0, 20)}' ${Math.round(r.left)}-${Math.round(r.right)} (box ${Math.round(box.left)}-${Math.round(box.right)})`);
        if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline') out.push(`${e.tagName} '${e.textContent.trim().slice(0, 20)}' text wider than its box`); }
      const h1 = root.querySelector('h1'), cs = getComputedStyle(h1), btn = root.querySelector('a[href="#home"]').getBoundingClientRect();
      return {out, side: document.documentElement.scrollWidth > innerWidth, font: cs.fontFamily, style: cs.fontStyle, btnH: btn.height, theme: document.documentElement.dataset.theme}; });
    const at = `${th} ${W} ${h}`; if (!m) { bad.push(`${at}: no not-found page`); await ctx.close(); continue; }
    if (m.out.length) bad.push(`${at}: ${m.out[0]}`); if (m.side) bad.push(`${at}: scrolls sideways`);
    if (!/Unbounded/.test(m.font) || !/italic|oblique/.test(m.style)) bad.push(`${at}: h1 font ${m.font} ${m.style}`);
    if (m.btnH < 44) bad.push(`${at}: Go to Home ${m.btnH}px tall`); if (m.theme !== (th === 'dark' ? 'night' : 'day')) bad.push(`${at}: theme ${m.theme}`);
    await ctx.close(); }
  ok(!bad.length, `320/390/1440, light and dark (#nonsense and #owner): nothing out of its box, no sideways scroll, h1 Unbounded slanted, Go to Home 44px+ (${bad.length ? bad.length + ' problems; e.g. ' + bad[0] : 'ok'})`); }
await b.close(); console.log(`v2-q24: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
