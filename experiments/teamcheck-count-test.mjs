// The anonymous Team check counter in the page, and the Web Analytics build flag (Nov 25; queue item 4).
// Builds the page itself (Claude-hosted v2, then public v2 with and without --cf-analytics) and serves app/dist like the public site,
// recording every request to /api/count. Checks:
//   P1 Claude-hosted build: a scored six sends nothing (and the score really is drawn, so the check could fail)
//   P2 public build: one count when My Team draws a full six's score; none for the same six again (redraws, other pages and back,
//      the same six opened again from a link); one more for a different six; none for a team of five
//   P3 the body is exactly {"k":"teamcheck"}: no team data, no id, no cookie, no query string
//   P4 a missing endpoint (404, as on a preview) causes no page error
//   P6 the beacon as the browser really sent it (Origin, Sec-Fetch-Site, Content-Type) is accepted by the real Worker
//   P5 --cf-analytics=<token>: the beacon script on v2.html and the Pokémon pages, its two hosts in the CSP, and nothing of it by default;
//      a bad token or a non-public build is refused
// Leaves app/dist as the plain public build (`node app/build.mjs --v2 --public --no-static`).
//   node experiments/teamcheck-count-test.mjs
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import {spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), D = path.join(ROOT, 'app/dist');
let fails = 0; const ok = (c, m) => { console.log(`  ${c ? 'pass' : 'FAIL'}  ${m}`); if (!c) fails++; };
const build = (...a) => spawnSync(process.execPath, [path.join(ROOT, 'app/build.mjs'), '--v2', '--no-static', ...a], {encoding: 'utf8', cwd: ROOT});

const SIX_A = ['Charizard-Mega-Y', 'Salamence-Mega', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'];
const SIX_B = ['Garchomp', 'Kingambit', 'Pelipper', 'Archaludon', 'Dragonite', 'Sinistcha'];
const slot = n => ({n, a: null, lock: false});
const stateOf = names => { const slots = names.map(slot); while (slots.length < 6) slots.push({n: '', a: null, lock: false});
  return {slots, box: [], teams: [], loadedId: null, format: 'doubles', maxMega: 1, opp: [], excl: [], log: []}; };
const linkOf = names => Buffer.from(JSON.stringify({v: 1, f: 'doubles', s: names.map(n => [n])})).toString('base64url');

// served like the public site: files, /data/* 404 (the page's built-in data), anything else the page; /api/count recorded
const T = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'};
const hits = []; let endpoint = true;
const srv = http.createServer((q, s) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname === '/api/count') { let b = ''; q.on('data', c => b += c); q.on('end', () => { hits.push({method: q.method, url: q.url, body: b, cookie: q.headers.cookie || '', ct: q.headers['content-type'] || '', origin: q.headers.origin, site: q.headers['sec-fetch-site']});
    s.writeHead(endpoint ? 204 : 404); s.end(); }); return; }
  let f = path.join(D, decodeURIComponent(u.pathname)); if (!f.startsWith(D)) { s.writeHead(404); s.end(); return; }
  if (u.pathname.startsWith('/data/')) { s.writeHead(404); s.end('{}'); return; }
  if (u.pathname === '/' || !(fs.existsSync(f) && fs.statSync(f).isFile())) f = fs.existsSync(f + '.html') ? f + '.html' : path.join(D, 'v2.html');
  s.writeHead(200, {'content-type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(s); });
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const O = `http://127.0.0.1:${srv.address().port}`;
const {chromium} = await import('playwright'); const B = await chromium.launch();
const settle = async (pg, ms = 900) => { await pg.waitForTimeout(ms); };
async function openWith(names) {
  const ctx = await B.newContext({viewport: {width: 1280, height: 900}}), pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  await pg.addInitScript(st => { try { if (!sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1');
    localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2099-01-01"'); if (st) localStorage.setItem('cc2.state', JSON.stringify(st)); } } catch (e) {} }, names ? stateOf(names) : null);
  await pg.goto(O + '/#team'); await pg.waitForFunction(() => document.querySelector('#main .mtf-score .n'), null, {timeout: 20000}).catch(() => {});
  await settle(pg); return {ctx, pg, errs};
}
const scoreOf = pg => pg.evaluate(() => ((document.querySelector('#main .mtf-score .n') || {}).textContent || '').trim());
const go = async (pg, h) => { await pg.evaluate(x => { location.hash = x; }, h); await settle(pg, 700); };
async function loadLink(pg, names) { await pg.goto(O + '/#team=' + linkOf(names)); await pg.waitForSelector('[data-shdload]', {timeout: 10000}).catch(() => {});
  await pg.click('[data-shdload]').catch(() => {}); await settle(pg, 1200); }

try {
  // ---------- P1: the Claude-hosted build sends nothing ----------
  { const r = build('--art=../src/v2/art/'); ok(r.status === 0, 'P1 the Claude-hosted v2 build runs');
    hits.length = 0; const {ctx, pg, errs} = await openWith(SIX_A); const sc = await scoreOf(pg);
    await go(pg, '#home'); await go(pg, '#team');
    ok(/^\d+$/.test(sc), `P1b the six's Strength Score is drawn (${sc || 'none'}), so a count could have been sent`);
    ok(hits.length === 0, `P1c no request to /api/count (${hits.length})`);
    ok(!errs.length, 'P1d no page errors' + (errs.length ? ': ' + errs[0] : '')); await ctx.close(); }

  // ---------- P2-P4: the public build ----------
  { const r = build('--public'); ok(r.status === 0, 'P2 the public build runs');
    const v = fs.readFileSync(path.join(D, 'v2.html'), 'utf8');
    ok(!/cloudflareinsights/.test(v) && !/cloudflareinsights/.test(fs.readFileSync(path.join(D, '_headers'), 'utf8')), 'P5 by default no Web Analytics script or host anywhere (page or CSP)');
    hits.length = 0; endpoint = true;
    const {ctx, pg, errs} = await openWith(SIX_A); const sc = await scoreOf(pg);
    ok(/^\d+$/.test(sc) && hits.length === 1, `P2b My Team draws the six's score (${sc || 'none'}) and sends one count (${hits.length})`);
    for (const h of ['#home', '#team', '#box', '#team', '#meta', '#team']) await go(pg, h);
    await pg.setViewportSize({width: 390, height: 844}); await settle(pg); await pg.setViewportSize({width: 1280, height: 900}); await settle(pg);
    ok(hits.length === 1, `P2c redraws, other pages and back, and window resizes send no more (${hits.length})`);
    await loadLink(pg, SIX_B); const sb = await scoreOf(pg);
    ok(/^\d+$/.test(sb) && hits.length === 2, `P2d a different six (opened from a team link, score ${sb || 'none'}) sends one more (${hits.length})`);
    await loadLink(pg, SIX_A); await go(pg, '#home'); await go(pg, '#team');
    ok(hits.length === 2, `P2e the first six again in the same page load sends nothing (${hits.length})`);
    const body = hits.map(x => x.body);
    ok(hits.every(x => x.method === 'POST' && x.url === '/api/count' && x.body === '{"k":"teamcheck"}'), `P3 every count is POST /api/count with exactly {"k":"teamcheck"} (${JSON.stringify(body)})`);
    // P6: the beacon exactly as the browser sent it (its Origin, Sec-Fetch-Site and Content-Type) is accepted by the real Worker
    { const worker = (await import('../worker/feedback.mjs')).default, calls = [], x = hits[0] || {};
      const env = {ALLOWED_ORIGINS: O, DB: {prepare: sql => ({bind: (...a) => ({run: async () => { calls.push(a); }})})}, ASSETS: {fetch: async () => new Response('')}};
      const h = {'Content-Type': x.ct || ''}; if (x.origin) h.Origin = x.origin; if (x.site) h['Sec-Fetch-Site'] = x.site;
      const res = await worker.fetch(new Request('https://nastyplot.org/api/count', {method: 'POST', headers: h, body: x.body || ''}), env);
      ok(res.status === 204 && calls.length === 1 && calls[0][1] === 'teamcheck', `P6 the real Worker accepts the browser's beacon (Origin ${x.origin}, Sec-Fetch-Site ${x.site}, ${x.ct}) -> ${res.status}`); }
    ok(hits.every(x => !x.cookie) && !body.some(b => /Garchomp|Incineroar|Sneasler|player|id|name/i.test(b)), 'P3b no cookie, no team data, no id in any count');
    ok(!errs.length, 'P2f no page errors' + (errs.length ? ': ' + errs[0] : '')); await ctx.close();
    // a team of five gets a score "so far": not a Team check
    hits.length = 0; const f = await openWith(SIX_A.slice(0, 5)); const s5 = await f.pg.evaluate(() => (document.querySelector('#main') || {}).innerText || '');
    ok(hits.length === 0, `P2g a team of five sends nothing (${hits.length}; page says "${(s5.match(/[^\n]*(so far|of 6 picked)[^\n]*/) || ['?'])[0].slice(0, 60)}")`); await f.ctx.close();
    // a reload is a new page load: the same six counts again (once)
    hits.length = 0; const g = await openWith(SIX_A); await g.pg.reload(); await g.pg.waitForFunction(() => document.querySelector('#main .mtf-score .n'), null, {timeout: 20000}).catch(() => {}); await settle(g.pg);
    ok(hits.length === 2, `P2h a reload is a new page load: one count per load (${hits.length} for 2 loads)`); await g.ctx.close();
    // P4: no endpoint (a preview or a local copy): no page error, the page works
    endpoint = false; hits.length = 0; const h = await openWith(SIX_B); const s4 = await scoreOf(h.pg);
    ok(hits.length === 1 && /^\d+$/.test(s4) && !h.errs.length, `P4 a 404 from /api/count causes no page error, the page keeps working (Chrome logs one "Failed to load resource" console line; score ${s4 || 'none'}${h.errs.length ? '; ' + h.errs[0] : ''})`); await h.ctx.close(); endpoint = true; }

  // ---------- P5: --cf-analytics ----------
  { const TOK = '0123456789abcdef0123456789abcdef';
    const r = build('--public', '--cf-analytics=' + TOK); ok(r.status === 0, 'P5b the public build with --cf-analytics=<token> runs' + (r.status ? ': ' + (r.stderr || '').slice(0, 120) : ''));
    const tag = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${TOK}"}'></script>`;
    const v = fs.readFileSync(path.join(D, 'v2.html'), 'utf8'), gp = fs.existsSync(path.join(D, 'pokemon/garchomp.html')) ? fs.readFileSync(path.join(D, 'pokemon/garchomp.html'), 'utf8') : '';
    ok(v.split(tag).length === 2 && gp.split(tag).length === 2 && v.indexOf(tag) < v.lastIndexOf('</body>'), 'P5c the beacon script is on v2.html and a Pokémon page, once each, before </body>');
    const csp = (fs.readFileSync(path.join(D, '_headers'), 'utf8').match(/Content-Security-Policy: ([^\n]*)/) || ['', ''])[1];
    const dir = k => ((csp.match(new RegExp(`(?:^|; )${k} ([^;]*)`)) || ['', ''])[1]).split(/\s+/);
    ok(dir('script-src').includes('https://static.cloudflareinsights.com/beacon.min.js') && dir('connect-src').includes('https://cloudflareinsights.com') && !dir('script-src').includes("'unsafe-inline'"),
      `P5d the CSP allows exactly the beacon script and its report address (script-src … ${dir('script-src').slice(-1)[0]}; connect-src ${dir('connect-src').join(' ')})`);
    for (const [args, name] of [[['--public', "--cf-analytics=abc'><script>x"], 'a token with markup'], [['--public', '--cf-analytics='], 'an empty token'], [['--cf-analytics=' + TOK], 'a non-public build']]) {
      const x = build(...args); ok(x.status !== 0, `P5e ${name} is refused (exit ${x.status})`); } }
} finally { await B.close(); srv.close(); }
// leave app/dist as the plain public build (like app/test/v2-public.mjs)
{ const r = build('--public'); ok(r.status === 0, 'the plain public build is left in app/dist'); }
console.log(fails ? `teamcheck-count-test: ${fails} failed` : 'teamcheck-count-test: all passed'); process.exit(fails ? 1 : 0);
