// Real links on the public site (SEO audit Nov 25 #9). Builds the public page and the Claude page, opens them over http and checks:
// public pages carry real addresses (/meta, /pokemon/<slug>, /privacy) with the hash kept in data-h; every such address is one the
// site serves (a tool page from V2.PUB_PATHS or a Pokémon file); a plain click still moves by the hash (same page, no reload);
// the Claude build keeps its # links. Run: node experiments/pub-links-test.mjs
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import {spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), D = path.join(ROOT, 'app/dist');
let bad = 0; const ok = (c, m) => { console.log(`  ${c ? 'pass' : 'FAIL'}  ${m}`); if (!c) bad++; };
const build = args => { const r = spawnSync(process.execPath, ['app/build.mjs', '--v2', '--split', '--one-art-size', '--art=../src/v2/art/', ...args], {cwd: ROOT, encoding: 'utf8'}); if (r.status !== 0) { console.log(r.stdout, r.stderr); process.exit(1); } };
const T = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml'};
const serve = () => new Promise(res => { const s = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]);
  if (u.startsWith('/api/')) { r.writeHead(204); return r.end(); }
  let f = path.join(D, u === '/' ? 'v2.html' : u); if (!f.startsWith(D)) { r.writeHead(400); return r.end(); }
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html'; if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(D, 'v2.html');
  r.writeHead(200, {'Content-Type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
  s.listen(0, '127.0.0.1', () => res({s, origin: `http://127.0.0.1:${s.address().port}`})); });
const links = p => p.evaluate(() => [...document.querySelectorAll('#app a[href]')].map(a => ({href: a.getAttribute('href'), h: a.getAttribute('data-h') || '', mon: a.hasAttribute('data-v2mon')})));
build(['--public']);
const pub = new Set(['/', ...fs.readdirSync(D).filter(f => f.endsWith('.html') && !['v2.html', 'index.html', '404.html'].includes(f)).map(f => '/' + f.slice(0, -5)), '/privacy']);
const mons = new Set(fs.readdirSync(path.join(D, 'pokemon')).map(f => '/pokemon/' + f.slice(0, -5)));
{ const {s, origin} = await serve(); const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  let all = [];
  for (const u of ['/', '/meta', '/pokemon/garchomp', '/team', '/events']) { await p.goto(origin + u, {waitUntil: 'networkidle'}); await p.waitForTimeout(1500); all = all.concat(await links(p)); }
  const real = all.filter(l => l.href.startsWith('/')), monL = real.filter(l => l.href.startsWith('/pokemon/'));
  ok(real.length >= 60, `public: in-site links carry real addresses (${real.length} of ${all.length} on 5 pages)`);
  ok(monL.length >= 10, `public: Pokémon links point at /pokemon/<name> (${monL.length})`);
  const unknown = [...new Set(real.map(l => l.href).filter(h => !pub.has(h) && !mons.has(h)))];
  ok(!unknown.length, `public: every real address is a page the site serves (${unknown.slice(0, 5).join(' ') || 'all known'})`);
  /* /pokemon is a static page outside the app (app/static-pages.mjs): its link is plain navigation, with no in-app hash (Sim, Nov 25: the
     Pokémon page's trail goes through it). Every other in-site link must still carry its hash. */
  const STATIC = new Set(['/pokemon']);
  ok(real.every(l => l.mon || /^#/.test(l.h) || STATIC.has(l.href)), 'public: each in-app link keeps its hash in data-h (Meta list rows open by data-v2mon; /pokemon is a static page)');
  // the Meta list (the hub of all rated Pokémon) links each one (Nov 25)
  await p.goto(origin + '/meta', {waitUntil: 'networkidle'}); await p.waitForTimeout(1500);
  const metaMons = await p.evaluate(() => new Set([...document.querySelectorAll('#app a[href^="/pokemon/"]')].map(a => a.getAttribute('href'))).size);
  ok(metaMons >= 60, `public: the Meta list links each rated Pokémon to its page (${metaMons})`);
  // a plain click moves by the hash, no reload
  await p.goto(origin + '/pokemon/garchomp', {waitUntil: 'networkidle'}); await p.waitForTimeout(1200); /* its partners are links (the Meta list uses buttons) */
  await p.evaluate(() => { window.__noReload = 1; });
  const target = await p.evaluate(() => { const a = [...document.querySelectorAll('#app a[href^="/pokemon/"]')].find(x => x.getClientRects().length && x.getAttribute('href') !== '/pokemon/garchomp'); return a && {href: a.getAttribute('href'), h: a.getAttribute('data-h')}; });
  if (target) { await p.click(`#app a[href="${target.href}"] >> nth=0`); await p.waitForTimeout(1500); }
  const after = await p.evaluate(() => ({hash: location.hash, path: location.pathname, same: window.__noReload === 1, route: window.V2 && V2.route()}));
  ok(!!target && after.same && after.hash === target.h && after.route === 'pokemon' && after.path === '/pokemon/garchomp', `public: a click opens the Pokémon page by its hash, no reload (${JSON.stringify(after)})`);
  ok(!errs.length, `public: no page errors (${errs.slice(0, 2).join(' | ')})`);
  await b.close(); s.close(); }
build([]);
{ const {s, origin} = await serve(); const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(origin + '/v2.html#meta', {waitUntil: 'networkidle'}); await p.waitForTimeout(1500); const l = await links(p);
  ok(l.length > 10 && !l.some(x => x.h) && !l.some(x => x.href.startsWith('/pokemon/')), `Claude build: # links as before (${l.length} links, none rewritten)`);
  await b.close(); s.close(); }
build(['--public']); /* leave the public build, as the steps after expect */
console.log(bad ? `pub-links-test: ${bad} failed` : 'pub-links-test: all passed'); process.exit(bad ? 1 : 0);
