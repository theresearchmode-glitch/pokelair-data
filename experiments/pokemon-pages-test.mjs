// Pokémon pages on the public site (Nov 25, Sim: quiet launch Dec 2-3; Kip job 31: one page per Pokémon is the fastest Google win).
// Run after a public build: node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public && node experiments/pokemon-pages-test.mjs
// Nov 25 (soft 404s): wrong addresses answer 404 with a noindex page; each tool address has its own rule (no catch-all).
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
// soft 404s (Nov 25, SEO): no catch-all; each tool address has its own rule, read from V2.PUB_PATHS (shell.js)
const shellSrc = fs.readFileSync(path.join(ROOT, 'app/src/v2/shell.js'), 'utf8'), pm = shellSrc.match(/^V2\.PUB_PATHS = (\{[^\n]*\});/m);
const pubPaths = pm ? [...new Set(Object.values(new Function('return ' + pm[1])()))].filter(p => p !== '/') : [];
const rules = r.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => l.trim().split(/\s+/));
ok(!rules.some(x => x[0] === '/*'), 'no catch-all rule (/* answered 200 for every wrong address: a soft 404)');
ok(pubPaths.length > 15 && pubPaths.every(p => fs.existsSync(path.join(D, p.slice(1) + '.html')) || rules.some(x => x[0] === p && x[1] === '/v2.html' && x[2] === '200')), `every tool address has its own file or rule (${pubPaths.length} from V2.PUB_PATHS)`);
const h404 = fs.existsSync(path.join(D, '404.html')) ? fs.readFileSync(path.join(D, '404.html'), 'utf8') : '';
ok(/<meta name="robots" content="noindex">/.test(h404) && h404.includes('src="/v2.js'), '404.html is the page with a noindex tag');
ok(fs.existsSync(path.join(D, 'index.html')) && fs.readFileSync(path.join(D, 'index.html'), 'utf8') === v, 'index.html is the same page as v2.html ("/" serves it)');
// SEO fix 2 (Nov 25): each tool page has its own file (dist/team.html, served at /team) with its own title, description, og tags and
// canonical from docs/rebuild/seo-titles-draft.md, so search engines read the right words before any script runs
const seoRows = []; { const sp = path.join(ROOT, 'docs/rebuild/seo-titles-draft.md');
  for (const l of (fs.existsSync(sp) ? fs.readFileSync(sp, 'utf8') : '').split('\n')) { if (!l.startsWith('|')) continue; const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (c.length !== 4 || c[0] === 'Page (code)' || c[0].startsWith('---') || c[1].includes('{')) continue; seoRows.push({path: c[1], title: c[2], desc: c[3]}); } }
const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rdD = f => fs.existsSync(path.join(D, f)) ? fs.readFileSync(path.join(D, f), 'utf8') : '';
const headOk = (html, r) => html.includes(`<title>${escH(r.title)}</title>`) && html.includes(`<meta name="description" content="${escH(r.desc)}"`) && html.includes(`<meta property="og:title" content="${escH(r.title)}"`)
  && html.includes(`<meta property="og:description" content="${escH(r.desc)}"`) && (html.match(/<link rel="canonical"/g) || []).length === 1 && html.includes(`<link rel="canonical" href="https://nastyplot.org${r.path}">`);
const toolRows = seoRows.filter(r => pubPaths.includes(r.path)), badTool = toolRows.filter(r => !headOk(rdD(r.path.slice(1) + '.html'), r) || rules.some(x => x[0] === r.path)).map(r => r.path);
ok(toolRows.length >= 20 && !badTool.length, `every tool page has its own file with its title, description, og tags and canonical, and no _redirects rule (${toolRows.length - badTool.length} of ${toolRows.length}; wrong: ${badTool.slice(0, 4).join(' ') || 'none'})`);
const homeRow = seoRows.find(r => r.path === '/');
ok(!!homeRow && headOk(rdD('index.html'), homeRow), "index.html carries Home's title, description and canonical");
ok(toolRows.every(r => rdD(r.path.slice(1) + '.html').includes('<link rel="stylesheet" href="/v2.css?v=')), 'the tool pages share the one stylesheet file (/v2.css)');
// SEO fix 6 (Nov 25): og:url = the page's canonical address on every built page (none on 404.html); og:image is a brand-kit file
// (4-social/facebook/facebook-profile-720.png, copied as is, never redrawn) at /og-image.png
const allPages = [...fs.readdirSync(D).filter(f => f.endsWith('.html') && f !== '404.html'), ...[...files].map(f => 'pokemon/' + f)];
const badOg = allPages.filter(f => { const h = rdD(f), c = (h.match(/<link rel="canonical" href="([^"]*)">/) || [])[1], u = h.match(/<meta property="og:url" content="[^"]*">/g) || [];
  return !(c && u.length === 1 && u[0] === `<meta property="og:url" content="${c}">`) || !h.includes('<meta property="og:image" content="https://nastyplot.org/og-image.png">'); });
ok(allPages.length > 360 && !badOg.length, `og:url = the canonical address and og:image = /og-image.png on every page (${allPages.length - badOg.length} of ${allPages.length}; wrong: ${badOg.slice(0, 4).join(' ') || 'none'})`);
ok(!!h404 && !/og:url|rel="canonical"/.test(h404), '404.html has no canonical and no og:url');
const brandOg = path.join(ROOT, 'docs/brand/nastyplot-brand-assets/4-social/facebook/facebook-profile-720.png');
ok(fs.existsSync(path.join(D, 'og-image.png')) && fs.readFileSync(path.join(D, 'og-image.png')).equals(fs.readFileSync(brandOg)), 'dist/og-image.png is the brand-kit file, byte for byte');
// served like Cloudflare Pages (developers.cloudflare.com/pages/configuration/serving-pages): a file if it exists, /x -> x.html, then the
// _redirects 200 rules; otherwise 404.html with status 404, or, with no top-level 404.html, the page with 200 (Pages' SPA mode)
const T = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'};
const isFile = f => fs.existsSync(f) && fs.statSync(f).isFile();
const asset = p => { const f = path.join(D, p); if (!f.startsWith(D)) return null; return isFile(f) ? f : isFile(f + '.html') ? f + '.html' : null; };
const viaRule = p => { for (const [from, to, code] of rules) { if (code !== '200') continue; let m = null;
  if (from.endsWith('/*')) { if (p.startsWith(from.slice(0, -1))) m = {splat: p.slice(from.length - 1)}; }
  else if (from.includes('/:')) { const re = new RegExp('^' + from.replace(/:([a-z]+)/g, '(?<$1>[^/]+)') + '$'), x = p.match(re); if (x) m = x.groups; }
  else if (from === p) m = {};
  if (m) return asset(to.replace(/:([a-z]+)/g, (_, k) => m[k] || '')); } return null; };
const srv = http.createServer((q, s) => { const p = decodeURIComponent(q.url.split('?')[0]).replace(/(.)\/+$/, '$1');
  let f = asset(p === '/' ? '/index' : p) || viaRule(p), st = 200;
  if (!f) { if (isFile(path.join(D, '404.html'))) { f = path.join(D, '404.html'); st = 404; } else f = path.join(D, 'v2.html'); }
  s.writeHead(st, {'content-type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(s); });
await new Promise(res => srv.listen(0, '127.0.0.1', res));
const {chromium} = await import('playwright'); const b = await chromium.launch();
try { const q = await b.newPage({viewport: {width: 1280, height: 900}}), errs = []; q.on('pageerror', e => errs.push(String(e).slice(0, 100)));
  for (const [u, want] of [['/pokemon/garchomp', 'Garchomp'], ['/pokemon/mr-mime', 'Mr. Mime'], ['/pokemon/charizard-mega-y', 'Mega Charizard Y'], ['/pokemon/sneasler.html', 'Sneasler']]) {
    await q.goto(`http://127.0.0.1:${srv.address().port}${u}`); await q.waitForFunction(w => (document.querySelector('#main h1') || {}).innerText && document.querySelector('#main h1').innerText.includes(w), want, {timeout: 15000}).catch(() => {});
    const h1 = await q.evaluate(() => ((document.querySelector('#main h1') || {}).innerText || '').replace(/\s+/g, ' '));
    const ft = (fs.readFileSync(path.join(D, 'pokemon', u.slice(9).replace(/\.html$/, '') + '.html'), 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || '', dt = await q.evaluate(() => document.title);
    ok(ft.replace(/&amp;/g, '&') === dt, `${u}: the title the page sets matches the file's ("${dt}")`);
    ok(h1.includes(want) && !errs.length, `${u} shows ${want} (h1 "${h1.slice(0, 40)}"${errs.length ? '; errors: ' + errs.join(' | ') : ''})`); errs.length = 0; }
  // wrong addresses answer 404 and say noindex; real tool addresses answer 200 and show their page (Nov 25, SEO)
  for (const [u, want, h1w] of [['/zzz', 404, 'Wrong turn'], ['/pokemon/not-a-pokemon', 404, 'No Pokémon'], ['/team', 200, ''], ['/this-week', 200, ''], ['/', 200, '']]) {
    const res = await q.goto(`http://127.0.0.1:${srv.address().port}${u}`); await q.waitForSelector('#main h1', {timeout: 15000}).catch(() => {}); await q.waitForTimeout(300);
    const st = res ? res.status() : 0, ni = await q.evaluate(() => !!document.querySelector('meta[name="robots"][content*="noindex"]')), h1 = await q.evaluate(() => ((document.querySelector('#main h1') || {}).innerText || '').replace(/\s+/g, ' '));
    ok(st === want && ni === (want === 404) && (!h1w || h1.includes(h1w)) && !/Wrong turn|No Pokémon here/.test(want === 200 ? h1 : '') && !errs.length,
      `${u}: status ${st} (want ${want}), noindex ${ni}, h1 "${h1.slice(0, 40)}"${errs.length ? '; errors: ' + errs.join(' | ') : ''}`); errs.length = 0; }
} finally { await b.close(); srv.close(); }
console.log(fails ? `pokemon-pages-test: ${fails} failed` : 'pokemon-pages-test: all passed'); process.exit(fails ? 1 : 0);
