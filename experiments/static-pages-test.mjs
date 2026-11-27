// The public site's static pages (night queue item 8, Nov 26; SEO audit Nov 25 #9 /pokemon list, #10 light 404). Run after a public build:
//   node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public && node experiments/static-pages-test.mjs
// Checks: /pokemon links every Pokémon page the sitemap lists (same count, every link a real file) in the HTML itself, readable with
// script off; it is in the sitemap with its own canonical, title and description; the 404 answers 404, says noindex, is under 30 KB
// (its own HTML; the stylesheet, fonts and logo files are shared) and shows today's underdog with ways to Home, Search and /pokemon;
// a wrong /pokemon/<name> still gets the app's own "No Pokémon here." (Cloudflare serves the nearest 404.html, checked on wrangler dev);
// no inline script that the CSP doesn't hash; /?search opens Search on Home (the static pages' Search link).
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import crypto from 'node:crypto'; import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), D = path.join(ROOT, 'app/dist'), CAP = 30 * 1024;
let fails = 0; const ok = (c, m) => { console.log(`  ${c ? 'pass' : 'FAIL'}  ${m}`); if (!c) fails++; };
const rdD = f => fs.existsSync(path.join(D, f)) ? fs.readFileSync(path.join(D, f), 'utf8') : '';
const sm = rdD('sitemap.xml'), smPk = [...sm.matchAll(/<loc>https:\/\/nastyplot\.org\/pokemon\/([a-z0-9-]+)<\/loc>/g)].map(m => m[1]);
const idx = rdD('pokemon.html'), links = [...idx.matchAll(/<a\b[^>]*\bhref="\/pokemon\/([a-z0-9-]+)"/g)].map(m => m[1]), uniq = [...new Set(links)];
// 1. the list
ok(smPk.length > 300 && uniq.length === smPk.length && smPk.every(s => uniq.includes(s)), `/pokemon links every Pokémon page in the sitemap (${uniq.length} distinct links, sitemap ${smPk.length})`);
const dead = uniq.filter(s => !fs.existsSync(path.join(D, 'pokemon', s + '.html')));
ok(uniq.length > 300 && !dead.length, `every /pokemon link is a real page file (${uniq.length - dead.length} of ${uniq.length}; missing: ${dead.slice(0, 4).join(', ') || 'none'})`);
ok(sm.includes('<loc>https://nastyplot.org/pokemon</loc>'), '/pokemon is in the sitemap');
ok((idx.match(/<link rel="canonical"/g) || []).length === 1 && idx.includes('<link rel="canonical" href="https://nastyplot.org/pokemon">') && idx.includes('<meta property="og:url" content="https://nastyplot.org/pokemon">'), '/pokemon has one canonical (https://nastyplot.org/pokemon) and the same og:url');
ok(/<title>All \d+ Pokémon in Pokémon Champions, A to Z · NastyPlot<\/title>/.test(idx) && /<meta name="description" content="Every Pokémon in Pokémon Champions with its own page/.test(idx) && !/<meta name="robots"/.test(idx), '/pokemon has its own title and description and no robots tag');
ok(/"@type":"BreadcrumbList"/.test(idx) && /"@type":"CollectionPage"/.test(idx), '/pokemon carries its CollectionPage and BreadcrumbList (JSON-LD)');
// 2. the light 404
const n4 = rdD('404.html'), size = Buffer.byteLength(n4);
ok(size > 0 && size < CAP, `404.html is light: ${(size / 1024).toFixed(1)} KB (cap ${CAP / 1024} KB; it was the 950 KB app)`);
ok(/<meta name="robots" content="noindex">/.test(n4) && !/<link rel="canonical"|<meta property="og:url"/.test(n4), '404.html says noindex and has no canonical or og:url');
ok(!/<script src="\/v2\.js/.test(n4) && !/<script src="\/v2\.js/.test(idx), 'neither static page loads the app script (v2.js)');
ok(['href="/"', 'href="/?search"', 'href="/pokemon"'].every(x => n4.includes(x)), '404.html links Home, Search (/?search) and /pokemon');
const dog = (n4.match(/<a href="\/pokemon\/([a-z0-9-]+)"[^>]*class="k-card k-hero-c"/) || [])[1];
ok(!!dog && fs.existsSync(path.join(D, 'pokemon', dog + '.html')) && /Today(&#39;|')s underdog/.test(n4) && !/k-score|k-tier/.test(n4), `404.html shows today's underdog as a link to its page, with no score or tier (${dog || 'none'})`);
const app404 = rdD('pokemon/404.html'), v = rdD('v2.html');
ok(!!v && app404 === v.replace(/<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>/g, '').replace('<title>', '<meta name="robots" content="noindex"><title>'), 'pokemon/404.html is the app with noindex (the "No Pokémon here." view for a wrong /pokemon/<name>)');
// 3. CSP: every inline script on the static pages is hashed in the one CSP (data blocks need none)
const csp = (rdD('_headers').match(/Content-Security-Policy: ([^\n]*)/) || [])[1] || '';
const unhashed = f => [...rdD(f).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => !/\bsrc\s*=/i.test(m[1]) && !/type="application\/ld\+json"/i.test(m[1]))
  .filter(m => !csp.includes(`'sha256-${crypto.createHash('sha256').update(m[2], 'utf8').digest('base64')}'`)).length;
ok(!!csp && !/'unsafe-inline'[^;]*;/.test((csp.match(/script-src[^;]*;/) || [''])[0]) && unhashed('pokemon.html') === 0 && unhashed('404.html') === 0, `no inline script on /pokemon or the 404 that the CSP doesn't hash (unhashed: ${unhashed('pokemon.html')} + ${unhashed('404.html')})`);
// 4. served like Cloudflare (Workers static assets, html_handling auto-trailing-slash, not_found_handling 404-page: the NEAREST 404.html)
const isFile = f => fs.existsSync(f) && fs.statSync(f).isFile();
const T = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'};
const srv = http.createServer((q, s) => { const p = decodeURIComponent(q.url.split('?')[0]).replace(/(.)\/+$/, '$1'); let f = path.join(D, p === '/' ? 'index.html' : p), st = 200;
  if (!f.startsWith(D)) f = ''; else if (!isFile(f)) f = isFile(f + '.html') ? f + '.html' : '';
  const am = p.match(/\/(?:src\/v2\/)?art\/(.+)$/); if (!f && am) { const a = path.join(ROOT, 'app/src/v2/art', am[1]); if (isFile(a)) f = a; } /* the pictures: public-site.mjs copies them to /art/; a test build reads them from src (--art=../src/v2/art/) */
  if (!f) { st = 404; let d = path.dirname(path.join(D, p)); while (d.startsWith(D) && !isFile(path.join(d, '404.html'))) d = path.dirname(d); f = path.join(d.startsWith(D) ? d : D, '404.html'); }
  s.writeHead(st, {'content-type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(s); });
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const U = `http://127.0.0.1:${srv.address().port}`;
const {chromium} = await import('playwright'); const b = await chromium.launch();
try {
  // crawlable without script: the links are in the HTML
  { const c = await b.newContext({javaScriptEnabled: false}), q = await c.newPage(); const r = await q.goto(U + '/pokemon');
    const n = await q.evaluate(() => new Set([...document.querySelectorAll('a[href^="/pokemon/"]')].map(a => a.getAttribute('href'))).size);
    ok(r.status() === 200 && n === uniq.length, `/pokemon with script off: status ${r.status()}, ${n} Pokémon links`); await c.close(); }
  for (const [u, st, want] of [['/pokemon', 200, 'Every Pokémon.'], ['/zzz-wrong', 404, 'Wrong turn'], ['/a/b/c', 404, 'Wrong turn'], ['/pokemon/not-a-pokemon', 404, 'No Pokémon']]) {
    const q = await b.newPage({viewport: {width: 1280, height: 900}}), errs = [], bad = []; q.on('pageerror', e => errs.push(String(e).slice(0, 100)));
    q.on('response', r => { if (r.status() >= 400 && r.url() !== U + u && !r.url().startsWith(U + '/data/') /* no daily documents in a local build */) bad.push(r.status() + ' ' + r.url().replace(U, '')); });
    const r = await q.goto(U + u, {waitUntil: 'networkidle'}); await q.waitForFunction(w => ((document.querySelector('#main h1') || {}).innerText || '').includes(w), want, {timeout: 15000}).catch(() => {});
    const h1 = await q.evaluate(() => ((document.querySelector('#main h1') || {}).innerText || '').replace(/\s+/g, ' ')), ni = await q.evaluate(() => !!document.querySelector('meta[name="robots"][content*="noindex"]'));
    ok(r.status() === st && h1.includes(want) && ni === (st === 404) && !errs.length && !bad.length, `${u}: status ${r.status()} (want ${st}), noindex ${ni}, h1 "${h1.slice(0, 36)}"${errs.length ? '; errors: ' + errs.join(' | ') : ''}${bad.length ? '; failed: ' + bad.slice(0, 3).join(', ') : ''}`);
    await q.close(); }
  // the static pages' Search link: /?search opens Search on Home, and the address loses its ?search
  { const q = await b.newPage({viewport: {width: 1280, height: 900}}); await q.goto(U + '/?search');
    const open = await q.waitForSelector('.np-find input[type="search"]', {timeout: 15000}).then(() => true, () => false);
    ok(open && (await q.evaluate(() => location.search)) === '', `/?search opens Search on Home and drops the ?search (open ${open})`); await q.close(); }
  /* Sim, Nov 25 (option A): no 'Top rated today' cards on /pokemon; the letter tabs fill even rows at every width (rule 13) */
  ok(!/Top rated today|pd-top/.test(idx), '/pokemon has no "Top rated today" cards (Sim, Nov 25: A)');
  { const bad = []; for (const w of [320, 390, 768, 1024, 1440]) { const q = await b.newPage({viewport: {width: w, height: 900}}); await q.goto(U + '/pokemon');
      const rows = await q.evaluate(() => { const m = {}; for (const a of document.querySelectorAll('.pd-jump a')) { const t = Math.round(a.getBoundingClientRect().top); m[t] = (m[t] || 0) + 1; } return Object.values(m); });
      const full = rows.length && rows.slice(0, -1).every(n => n === rows[0]) && rows[rows.length - 1] >= rows[0] - (rows.length > 1 ? 1 : 0); if (!full) bad.push(`${w}: ${rows.join('+')}`); await q.close(); }
    ok(!bad.length, `/pokemon's letter tabs fill even rows at 320-1440 (${bad.join(' | ') || 'all even'})`); }
} finally { await b.close(); srv.close(); }
console.log(fails ? `static-pages-test: ${fails} failed` : 'static-pages-test: all passed'); process.exit(fails ? 1 : 0);
