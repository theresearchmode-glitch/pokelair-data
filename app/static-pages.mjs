// Static pages of the public site (night queue item 8, Nov 26; SEO audit Nov 25 #9 and #10). Called by build.mjs --public.
//  1. /pokemon (dist/pokemon.html): every Pokémon page as a real <a href="/pokemon/<slug>"> link in the HTML, readable with no script,
//     with its own title, description, canonical and BreadcrumbList; the list is the one the sitemap uses (build.mjs `seen`).
//  2. A light 404 (dist/404.html, about 20 KB + the shared /v2.css and fonts): the site's approved not-found screen (shell.js V2.nfHtml,
//     Sim Nov 22) with today's underdog (V2.underdog: Flapple first, then the rotation; rule 23), and links to Home, Search and /pokemon.
//     It used to be a 950 KB copy of the whole app. Cloudflare serves the NEAREST 404.html (checked on wrangler dev, Nov 26), so
//  3. dist/pokemon/404.html keeps the app copy for a wrong /pokemon/<name>: the app's own "No Pokémon here." view with its suggestions.
// How: the built page is opened in Chromium on a local server with today's documents (the same ones public-site.mjs publishes), so the
// header, footer, kit cards, underdog and ratings are the site's own markup, drawn by its own code; the script-only controls become
// links or are left out; the inline logo pictures become files (/brand/*.svg, the same bytes); /fit.js is the kit's own name fitting
// (kit.js V2.kFit, copied from the source at build time). No inline script but the page's theme script (its hash is in the CSP already).
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import crypto from 'node:crypto';

const H = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);

export async function staticPages({dir, h, ph, ownHead, esc, pages, lastmod}) {
  const dist = dir + 'dist/', root = path.resolve(dir, '..') + '/';
  /* 3. the app copy for /pokemon/<unknown> (what dist/404.html was) */
  const appNotFound = h.replace(/<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>/g, '').replace(/<title>/, '<meta name="robots" content="noindex"><title>');
  if (/<meta name="robots"/.test(h)) throw new Error('public build: the page already has a robots tag');
  fs.writeFileSync(dist + 'pokemon/404.html', appNotFound);

  /* today's documents, as public-site.mjs writes them to /data/ */
  const here = process.cwd(); let docs = {};
  try { process.chdir(root); const {DOC_SOURCES} = await import(root + 'split-docs.mjs'), {perfDoc} = await import(root + 'app/data-docs.mjs');
    const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
    docs = Object.fromEntries(Object.entries(DOC_SOURCES).map(([k, g]) => [k, g()])); docs.perf = perfDoc(rd('limitless.json'), rd('perf.json')); } finally { process.chdir(here); }
  const T = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'};
  const srv = http.createServer((q, s) => { const p = decodeURIComponent(q.url.split('?')[0]);
    const dm = p.match(/^\/data\/([a-z_0-9]+)\.json$/); if (dm) { s.writeHead(200, {'content-type': 'application/json'}); s.end(JSON.stringify(docs[dm[1]] ?? null)); return; }
    let f = path.join(dist, p); if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = dist + 'v2.html';
    s.writeHead(200, {'content-type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(s); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const {chromium} = await import('playwright'); const b = await chromium.launch();
  let got;
  try { const pg = await b.newPage({viewport: {width: 1440, height: 900}}), errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    /* networkidle: the page first draws from the data inside the script, then again when today's documents arrive; capture the second */
    await pg.goto(`http://127.0.0.1:${srv.address().port}/no-such-page-static-build`, {waitUntil: 'networkidle'});
    /* the not-found view, drawn with today's data (the underdog and the footer's date come from it) */
    const ready = await pg.waitForFunction(() => document.querySelector('#main [data-v2nf]') && window.V2 && V2.dataReady && V2.dataReady(), null, {timeout: 30000}).then(() => true, () => false);
    if (!ready) throw new Error('public build: the not-found view with today\'s data did not draw (' + (errs.join(' | ') || 'no page error') + ')');
    await pg.evaluate(() => { if (V2.redraw) V2.redraw(); }); await pg.waitForSelector('#main [data-v2nf]'); await pg.waitForTimeout(300);
    got = await pg.evaluate(PAGES => {
      const app = document.getElementById('app').cloneNode(true);
      /* script-only controls: back/forward and the theme button go; Search becomes a link that opens it on Home (shell.js: /?search) */
      app.querySelectorAll('.np-goback,.np-gofwd,[data-v2theme],[data-fsrc],.np-fsrc,[data-v2skip]').forEach(e => e.remove());
      app.querySelectorAll('[aria-current]').forEach(e => e.removeAttribute('aria-current'));
      const sb = app.querySelector('button.np-search'); if (sb) { const a = document.createElement('a'); a.className = sb.className; a.href = '/?search'; a.setAttribute('aria-label', sb.getAttribute('aria-label') || 'Search'); a.innerHTML = sb.innerHTML; sb.replaceWith(a); }
      /* the footer's script-only links: Contact is on the About page (its "Show email"); Send Feedback is a form the app draws, so it goes */
      app.querySelectorAll('a[href="#feedback"]').forEach(a => a.remove()); app.querySelectorAll('a[href="#about=contact"]').forEach(a => a.setAttribute('href', '/about'));
      app.querySelectorAll('a[href^="#"]').forEach(a => { const p = V2.pubPath ? V2.pubPath(a.getAttribute('href')) : null; if (p) a.setAttribute('href', p); });
      const head = app.querySelector('.np-head').outerHTML, foot = (app.querySelector('.np-foot') || {outerHTML: ''}).outerHTML, bar = (app.querySelector('.np-bar') || {outerHTML: ''}).outerHTML;
      const slugOf = n => (PAGES.find(x => x.n === n) || {}).s;
      /* 2. the not-found screen: the site's own (V2.nfHtml), the underdog's card a link to its page, and the two other ways on */
      const dog = V2.underdog(), dogS = slugOf(dog), d = V2.disp(dog);
      const card = V2.kCard(dog, {size: 'hero', form: "Today's underdog", fact: 'Meet it', alt: ''}).replace(/^<div class="k-card/, `<a href="/pokemon/${dogS}" aria-label="${V2.esc(d)}: its page" class="k-card`).replace(/<\/div>$/, '</a>');
      const nf = `<div class="ra gsp nf-pg nf2 st-nf"><div class="nf2-two"><div class="k-head"><p class="k-kicker np-eyebrow">PAGE NOT FOUND · WRONG TURN</p><h1 class="k-h1 u">Nothing here. <br><em>Wrong turn.</em></h1><p class="k-lead">This address doesn't match a page on NastyPlot. It may be an old or mistyped link.</p>${V2.kGo('GO TO HOME.', {href: '/'})}<p class="st-ways">${V2.kLink('Search the site', {href: '/?search'})}${V2.kLink('Every Pokémon, A to Z', {href: '/pokemon'})}</p></div><aside class="nf-dog nf2-dog" aria-label="Today's underdog">${V2.kScrib(`Lost? ${d}'s been here all along.`)}${dogS ? card : ''}</aside></div></div>`;
      /* 1. the index: A to Z, one line per Pokémon, its forms (Mega, regional, other) as slanted chips on the same line, every one a
         link to its page. (Sim, Nov 25, option A: no 'Top rated today' cards: they repeat Home and Meta, and the page stays nearer 3 screens.) */
      const topHtml = '';
      const groups = new Map();
      for (const {n, s} of PAGES) { const k = V2.kName(n); let base = k.name.replace(/\u00a0/g, ' '); const xyz = /^Mega/.test(k.form) && base.match(/^(.+) ([XYZ])$/); if (xyz) { base = xyz[1]; k.form = k.form.replace(/^Mega/, 'Mega ' + xyz[2]); } if (!groups.has(base)) groups.set(base, []); groups.get(base).push({n, s, form: k.form}); }
      const fold = x => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const names = [...groups.keys()].sort((a, c) => fold(a).localeCompare(fold(c)));
      const letters = new Map(); for (const nm of names) { const L = /^[a-z]/.test(fold(nm)) ? fold(nm)[0].toUpperCase() : '#'; if (!letters.has(L)) letters.set(L, []); letters.get(L).push(nm); }
      const line = nm => { const g = groups.get(nm).sort((a, c) => (a.form ? 1 : 0) - (c.form ? 1 : 0) || a.form.localeCompare(c.form)), base = g.find(x => !x.form);
        const forms = g.filter(x => x.form).map(x => `<a class="pd-form" href="/pokemon/${x.s}" aria-label="${V2.esc(V2.disp(x.n))}"><span>${V2.esc(x.form)}</span></a>`).join('');
        return `<li>${base ? `<a class="pd-nm" href="/pokemon/${base.s}">${V2.esc(nm)}</a>` : `<span class="pd-nm">${V2.esc(nm)}</span>`}${forms}</li>`; };
      const jn = letters.size, jump = `<nav class="pd-jump" style="--jc2:${Math.ceil(jn / 2)};--jc4:${Math.ceil(jn / 4)}" aria-label="Jump to a letter">${[...letters.keys()].map(L => `<a href="#pd-${L === '#' ? 'num' : L.toLowerCase()}" class="u">${L}</a>`).join('')}</nav>`;
      const board = `<div class="pd-board">${[...letters].map(([L, ns]) => `<section class="pd-l" id="pd-${L === '#' ? 'num' : L.toLowerCase()}" aria-label="${L === '#' ? 'Other' : L}"><h2 class="pd-letter u">${L}</h2><ul class="pd-list">${ns.map(line).join('')}</ul></section>`).join('')}</div>`;
      const idx = `<div class="ra gsp pd">${V2.kHead({kicker: `POKÉMON A TO Z · ${PAGES.length} PAGES`, h1Html: 'Every Pokémon. <em>One page each.</em>', lead: 'Each page has its best tournament set, its rating and its best partners, from real tournament results. Pick one.'})}${jump}${topHtml}<h2 class="k-h2 u pd-azh">A to Z</h2>${board}</div>`;
      return {head, foot, bar, nf, idx, dog, asOf: V2.asOf ? V2.asOf() : '', html: document.documentElement.className, body: document.body.className};
    }, pages);
    if (errs.length) throw new Error('public build: page errors while drawing the static pages: ' + errs.join(' | '));
  } finally { await b.close(); srv.close(); }

  /* the inline logo pictures (data: SVG) become files under /brand/ (same bytes; the header and footer use them on every static page) */
  fs.rmSync(dist + 'brand', {recursive: true, force: true}); fs.mkdirSync(dist + 'brand', {recursive: true});
  const unData = html => html.replace(/data:image\/svg\+xml,([^"'\s]+)/g, (m, enc) => { const svg = decodeURIComponent(enc), f = `brand/${H(svg)}.svg`; if (!fs.existsSync(dist + f)) fs.writeFileSync(dist + f, svg); return '/' + f; });
  const frame = main => unData(`<a class="vh np-skip" href="#main">Skip to the page</a>${got.head}<main class="np-main" id="main">${main}</main>${got.foot}${got.bar}`);

  /* the kit's name fitting (V2.kFit) for the static pages, from kit.js as it is */
  const kit = fs.readFileSync(dir + 'src/v2/kit.js', 'utf8'), km = kit.match(/^V2\.kFit = root => \{[\s\S]*?\n {2}for \(const \[e, m\] of writes\) e\.dataset\.kf = m; \};$/m);
  if (!km) throw new Error('public build: V2.kFit not found in kit.js');
  const fit = `/* NastyPlot static pages: the kit's name fitting (kit.js V2.kFit), nothing else */\n(function(){var V2={};${km[0]}\nvar go=function(){V2.kFit(document)};go();addEventListener('resize',go);try{document.fonts.ready.then(go)}catch(e){}})();\n`;
  const fitF = `/fit.js?v=${H(fit)}`; fs.writeFileSync(dist + 'fit.js', fit);

  /* the head: the Pokémon pages' head (shared /v2.css, fonts, icons, link-preview tags) without the app's scripts; the theme script stays
     (the same bytes as the page's, so its hash is already in the CSP) */
  const theme = (ph.match(/<script>\/\* theme before first paint[\s\S]*?<\/script>/) || [])[0]; if (!theme) throw new Error('public build: theme script not found');
  const baseHead = ph.slice(0, ph.indexOf('</head>')).replace(/<script\b[^>]*>[\s\S]*?<\/script>\n?/g, s => s.trim() === theme ? s : '').replace(/<!--[\s\S]*?-->\n?/g, '');
  const docOf = (head, main, ld) => `${head.replace(/<\/title>/, m => m)}${ld ? `<script type="application/ld+json">${ld.replace(/</g, '\\u003c')}</script>` : ''}</head><body${got.body ? ` class="${esc(got.body)}"` : ''}>\n<div id="app">${frame(main)}</div>\n<script src="${fitF}" defer></script>\n</body></html>\n`;
  const withHtmlClass = s => got.html ? s.replace(/<html\b([^>]*)>/, (m, a) => /class=/.test(a) ? m : `<html${a} class="${esc(got.html)}">`) : s;

  /* 1. /pokemon */
  const title = `All ${pages.length} Pokémon in Pokémon Champions, A to Z · NastyPlot`, desc = `Every Pokémon in Pokémon Champions with its own page: best tournament set, rating and best partners, from real tournament results. Free, no account.`;
  const ld = JSON.stringify({'@context': 'https://schema.org', '@graph': [{'@type': 'CollectionPage', '@id': 'https://nastyplot.org/pokemon', url: 'https://nastyplot.org/pokemon', name: title, description: desc, isPartOf: {'@type': 'WebSite', name: 'NastyPlot', url: 'https://nastyplot.org/'}},
    {'@type': 'BreadcrumbList', itemListElement: [{'@type': 'ListItem', position: 1, name: 'NastyPlot', item: 'https://nastyplot.org/'}, {'@type': 'ListItem', position: 2, name: 'Pokémon', item: 'https://nastyplot.org/pokemon'}]}]});
  let pokHtml = withHtmlClass(docOf(ownHead(baseHead, title, desc, 'https://nastyplot.org/pokemon'), got.idx, ld));
  /* 2. the light 404: no canonical, no og:url, noindex */
  const h404 = ownHead(baseHead, 'Page not found · NastyPlot', 'This address doesn\'t match a page on NastyPlot.', 'https://nastyplot.org/').replace(/<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>/g, '').replace('<title>', '<meta name="robots" content="noindex"><title>');
  let nfHtml = withHtmlClass(docOf(h404, got.nf, ''));
  /* Job 64: inline pruned CSS on /pokemon (0 RTT first paint) and serve pruned /static.css for 404.html (keeps 404.html under 30 KB cap) */
  if (fs.existsSync(dist + 'v2.css')) {
    const {pruneCss} = await import('./crit-css.mjs');
    const v2Css = fs.readFileSync(dist + 'v2.css', 'utf8');
    const pokCss = pruneCss(v2Css, pokHtml + '\n' + fit);
    const nfCss = pruneCss(v2Css, nfHtml + '\n' + fit);
    pokHtml = pokHtml.replace(/<link rel="stylesheet" href="\/v2\.css\?v=[^"]+">/, () => `<style id="np-crit">${pokCss}</style>`);
    const staticRef = `/static.css?v=${H(nfCss)}`;
    fs.writeFileSync(dist + 'static.css', nfCss);
    nfHtml = nfHtml.replace(/href="\/v2\.css\?v=[^"]+"/, `href="${staticRef}"`);
  }
  fs.writeFileSync(dist + 'pokemon.html', pokHtml);
  fs.writeFileSync(dist + '404.html', nfHtml);
  return {underdog: got.dog, asOf: got.asOf, sitemap: `  <url><loc>https://nastyplot.org/pokemon</loc><lastmod>${lastmod}</lastmod></url>`, size404: fs.statSync(dist + '404.html').size, sizeIndex: fs.statSync(dist + 'pokemon.html').size};
}
