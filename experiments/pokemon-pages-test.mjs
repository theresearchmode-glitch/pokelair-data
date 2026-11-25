// Pokémon pages on the public site (Nov 25, Sim: quiet launch Dec 2-3; Kip job 31: one page per Pokémon is the fastest Google win).
// Run after a public build: node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public && node experiments/pokemon-pages-test.mjs
// Checks: every Pokémon in ROSTER has dist/pokemon/<slug>.html and a sitemap entry; each page has its own title, description and
// canonical address; the page's files load from the site root (a relative "v2.js" broke every /pokemon/x page); the address part
// is the same rule in the build and in the page (V2.pubSlug); and /pokemon/garchomp, served like Cloudflare Pages, shows Garchomp.
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), D = path.join(ROOT, 'app/dist');
let fails = 0; const ok = (c, m) => { console.log(`  ${c ? 'pass' : 'FAIL'}  ${m}`); if (!c) fails++; };
const line = fs.readFileSync(path.join(ROOT, 'app/src/data/data.js'), 'utf8').split('\n')[0], roster = JSON.parse(line.slice(line.indexOf('['), line.lastIndexOf(']') + 1));
const src = fs.readFileSync(path.join(ROOT, 'app/src/v2/pages/pokemon.js'), 'utf8'), m = src.match(/V2\.pubSlug = (n => [^\n]*);/);
ok(!!m, 'pokemon.js defines V2.pubSlug');
const slug = m ? new Function('return ' + m[1])() : () => '';
const files = fs.existsSync(path.join(D, 'pokemon')) ? new Set(fs.readdirSync(path.join(D, 'pokemon'))) : new Set();
const missing = roster.filter(p => !files.has(slug(p.n) + '.html')).map(p => p.n);
ok(roster.length > 300 && !missing.length, `every Pokémon has its page, by the page's own address rule (${roster.length - missing.length} of ${roster.length}; missing: ${missing.slice(0, 5).join(', ') || 'none'})`);
const sm = fs.existsSync(path.join(D, 'sitemap.xml')) ? fs.readFileSync(path.join(D, 'sitemap.xml'), 'utf8') : '';
ok(roster.every(p => sm.includes(`<loc>https://nastyplot.org/pokemon/${slug(p.n)}</loc>`)), 'every Pokémon page is in the sitemap');
const g = files.has('garchomp.html') ? fs.readFileSync(path.join(D, 'pokemon/garchomp.html'), 'utf8') : '';
ok(/<title>Garchomp in Pokémon Champions: best set, rating &amp; partners<\/title>/.test(g) && g.includes('<link rel="canonical" href="https://nastyplot.org/pokemon/garchomp">') && /<meta name="description" content="Garchomp in Pokémon Champions/.test(g),
  'garchomp.html has its own title, description and canonical address');
ok((g.match(/<link rel="canonical"/g) || []).length === 1 && /<meta property="og:description" content="Garchomp in Pokémon Champions/.test(g), `garchomp.html has exactly one canonical tag (${(g.match(/<link rel="canonical"/g) || []).length}) and its own og:description (Kip job 33 F6)`);
const v = fs.existsSync(path.join(D, 'v2.html')) ? fs.readFileSync(path.join(D, 'v2.html'), 'utf8') : '';
ok(v.length > 0 && !/(src|href)="(v2\.(js|css)|fonts\/)/.test(v) && !/url\(fonts\//.test(v), "the page's own files load from the site root (no relative v2.js, v2.css or fonts/)");
ok(['favicon.ico', 'favicon.svg', 'favicon-48.png', 'apple-touch-icon.png'].every(f => fs.existsSync(path.join(D, f))), 'the brand icons are at the site root');
const r = fs.existsSync(path.join(D, '_redirects')) ? fs.readFileSync(path.join(D, '_redirects'), 'utf8') : '';
ok(r.indexOf('/pokemon/:name /pokemon/:name.html 200') > -1 && r.indexOf('/pokemon/:name') < r.indexOf('/* /v2.html 200'), 'the Pokémon rule comes before the catch-all');
// served like Cloudflare Pages: a file if it exists, /x -> x.html, otherwise the page
const T = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'};
const srv = http.createServer((q, s) => { let p = decodeURIComponent(q.url.split('?')[0]), f = path.join(D, p);
  if (!f.startsWith(D)) { s.writeHead(404); s.end(); return; }
  if (!(fs.existsSync(f) && fs.statSync(f).isFile())) f = fs.existsSync(f + '.html') ? f + '.html' : path.join(D, 'v2.html');
  s.writeHead(200, {'content-type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(s); });
await new Promise(res => srv.listen(0, '127.0.0.1', res));
const {chromium} = await import('playwright'); const b = await chromium.launch();
try { const q = await b.newPage({viewport: {width: 1280, height: 900}}), errs = []; q.on('pageerror', e => errs.push(String(e).slice(0, 100)));
  for (const [u, want] of [['/pokemon/garchomp', 'Garchomp'], ['/pokemon/mr-mime', 'Mr. Mime'], ['/pokemon/charizard-mega-y', 'Mega Charizard Y'], ['/pokemon/sneasler.html', 'Sneasler']]) {
    await q.goto(`http://127.0.0.1:${srv.address().port}${u}`); await q.waitForFunction(w => (document.querySelector('#main h1') || {}).innerText && document.querySelector('#main h1').innerText.includes(w), want, {timeout: 15000}).catch(() => {});
    const h1 = await q.evaluate(() => ((document.querySelector('#main h1') || {}).innerText || '').replace(/\s+/g, ' '));
    const ft = (fs.readFileSync(path.join(D, 'pokemon', u.slice(9).replace(/\.html$/, '') + '.html'), 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || '', dt = await q.evaluate(() => document.title);
    ok(ft.replace(/&amp;/g, '&') === dt, `${u}: the title the page sets matches the file's ("${dt}")`);
    ok(h1.includes(want) && !errs.length, `${u} shows ${want} (h1 "${h1.slice(0, 40)}"${errs.length ? '; errors: ' + errs.join(' | ') : ''})`); errs.length = 0; }
} finally { await b.close(); srv.close(); }
console.log(fails ? `pokemon-pages-test: ${fails} failed` : 'pokemon-pages-test: all passed'); process.exit(fails ? 1 : 0);
