// split-routes-cross-test.mjs (speed review, Nov 26): --split-routes puts 22 pages in their own files (dist/routes/<page>.js), loaded
// when a page is opened. Several pages call helpers that live in ANOTHER page's file (Events draws Winning Teams' cards, This Week
// draws Events' tickets, Build's "Compare" needs Compare's, "Set as Opponent" needs Battle's ...). This test starts each case COLD on a
// public address (no other page visited first), does the real clicks, and fails on any page error or "This page didn't load".
// Expects the public build with --split-routes in app/dist (node app/build.mjs --v2 --split --split-routes --one-art-size
// --art=../src/v2/art/ --public) and out/. Serves app/dist like Cloudflare (/x -> x.html) and /data/<doc>.json from out/.
// Failed on alt/gemini-split-routes e6504b08: 9 of 11 cases (V2.wtCard / V2.ticket / V2.cxGo / V2.btSetOpp / V2.buildHits is not a
// function, V2.wtUi / V2.evUi undefined), and the Pokémon page lost its Report a Mistake / Send Feedback links (V2.FB lives in
// feedback.js's file). The same cases pass on a build without --split-routes (c540120c).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), DIST = path.join(ROOT, 'app/dist');
if (!fs.existsSync(path.join(DIST, 'routes'))) { console.log('split-routes-cross-test: no --split-routes build in app/dist'); process.exit(1); }
const cwd = process.cwd(); process.chdir(ROOT);
const {DOC_SOURCES} = await import(pathToFileURL(path.join(ROOT, 'split-docs.mjs')).href), {perfDoc} = await import(pathToFileURL(path.join(ROOT, 'app/data-docs.mjs')).href);
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const docs = Object.fromEntries(Object.entries(DOC_SOURCES).map(([k, get]) => [k, get()])); docs.perf = perfDoc(rd('limitless.json'), rd('perf.json')); process.chdir(cwd);
const T = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const m = /^\/data\/([a-z_]+)\.json$/.exec(p);
  if (m) { const v = docs[m[1]]; if (v === undefined) { r.writeHead(404); return r.end(); } r.writeHead(200, {'content-type': 'application/json'}); return r.end(JSON.stringify(v)); }
  if (p === '/') p = '/index.html';
  let f = p.startsWith('/src/') ? path.join(ROOT, 'app', p) : path.join(DIST, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + '.html') ? f + '.html' : '';
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, {'content-type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
await new Promise(res => srv.listen(0, '127.0.0.1', res)); const base = `http://127.0.0.1:${srv.address().port}`;
const CASES = [
  ['Build: "Teams with It" on a core', '/build', async q => { await q.click('[data-bdcteams]'); }],
  ['Build: a result\'s "Compare ›"', '/build', async q => { await q.click('[data-bdcx]'); }],
  ['Winning Teams: "Set as Opponent"', '/winning-teams', async q => { await q.click('[data-wtvs]'); }],
  ['Events: open the placings', '/events', async q => { await q.click('[data-evgo]'); }],
  ['Events: "Set as Opponent" in the placings', '/events', async q => { await q.click('[data-evgo]'); await q.waitForTimeout(800); await q.click('[data-evvs]'); }],
  ['Test Run: "Battle this team"', '/test-run', async q => { await q.waitForSelector('[data-trbat]', {timeout: 20000}); await q.click('[data-trbat]'); }],
  ['This Week: open it', '/this-week', async () => {}],
  ['News: the next-event calendar', '/', async q => { await q.evaluate(() => { location.hash = '#news'; }); await q.waitForTimeout(2500); await q.click('[data-dpcal]'); }],
  ['Search: "Build Around a Core"', '/', async q => { await q.click('[data-v2search]'); await q.waitForTimeout(500); await q.keyboard.type('core'); await q.waitForTimeout(600); await q.click('text=Build Around a Core'); }],
  ['Battle: type their Pokémon', '/battle', async q => { await q.click('[data-btopp]'); await q.waitForTimeout(600); await q.click('.bt-osheet [data-btfind]'); await q.keyboard.type('Gar'); await q.waitForTimeout(600); }],
  ['Pokémon page: "Report a Mistake" + footer "Send Feedback" there from the first draw', '/pokemon/garchomp', async q => { const n = await q.evaluate(() => [...document.querySelectorAll('a')].filter(a => /#feedback$|\/feedback$/.test(a.getAttribute('data-h') || a.getAttribute('href') || '')).length); if (n < 2) throw new Error(n + ' feedback links (want 2)'); }],
  ['Natures (deferred data) -> Ratings: real ratings rows render', '/natures', async q => { await q.click('a[data-h="#meta"], a[href="/meta"]'); await q.waitForTimeout(1500); const n = await q.evaluate(() => document.querySelectorAll('.ra-row, .rs-st li').length); if (n < 5) throw new Error('expected ratings rows, got ' + n); }],
  ['Gifts (deferred data) -> News: stories render without hanging', '/gifts', async q => { await q.evaluate(() => { location.hash = '#news'; }); await q.waitForTimeout(1500); const ok = await q.evaluate(() => /Dispatch/i.test((document.querySelector('#main h1') || {}).innerText || '')); if (!ok) throw new Error('News h1 did not render'); }],
  ['Track Record (cold): receipts render with real numbers', '/track-record', async q => { const len = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim().length); if (len < 300) throw new Error('Track Record main too short: ' + len); }],
  ['Info sheet (cold): ability button lazy-loads info-text and opens sheet', '/pokemon/garchomp', async q => { await q.click('[data-v2info="ab"]'); await q.waitForSelector('.np-sheet .is2 .is-lead', {timeout: 8000}); const t = await q.textContent('.np-sheet .is2 .is-lead'); if (!t || t.trim().length < 10) throw new Error('empty ability lead'); }],
  ['Search (cold): move query lazy-loads info-text and opens move sheet', '/', async q => { await q.click('[data-v2search]'); await q.waitForTimeout(400); await q.keyboard.type('Protect'); await q.waitForSelector('.np-sheet [data-v2info="mv"]', {timeout: 8000}); await q.click('.np-sheet [data-v2info="mv"]'); await q.waitForSelector('.np-sheet .is2 .is-lead', {timeout: 8000}); const t = await q.textContent('.np-sheet .is2 .is-lead'); if (!t || t.trim().length < 10) throw new Error('empty move lead'); }],
  ['Team (cold): team chunk renders My Team', '/team', async q => { const len = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim().length); if (len < 150) throw new Error('Team main too short: ' + len); }],
  ['Search (cold): Spicy Picks lazy-loads team chunk', '/', async q => { await q.click('[data-v2search]'); await q.waitForTimeout(400); await q.keyboard.type('Spicy Picks'); await q.waitForTimeout(500); await q.click('text=Spicy Picks'); await q.waitForTimeout(1200); const len = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim().length); if (len < 150) throw new Error('Team after Spicy Picks too short: ' + len); }],
  ['Build (cold): Hatch it runs auto-build from build chunk', '/build', async q => { await q.click('[data-bdgo]'); await q.waitForSelector('[data-bdcx], .bd-card, .bd-team', {timeout: 12000}); }],
  ['Battle (cold): tournament teams from gauntlet chunk load in opponent sheet', '/battle', async q => { await q.click('[data-btopp]'); await q.waitForSelector('.bt-osheet', {timeout: 8000}); const n = await q.evaluate(() => document.querySelectorAll('.bt-osheet button').length); if (n < 3) throw new Error('expected opponent buttons, got ' + n); }],
  ['Method (cold): method-data renders', '/how-it-works', async q => { const len = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim().length); if (len < 400) throw new Error('Method main too short: ' + len); }],
  ['Types (cold): types-data renders chart', '/types', async q => { const len = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim().length); if (len < 200) throw new Error('Types main too short: ' + len); }],
  ['Practice (cold): practice-data renders preview', '/practice', async q => { const len = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim().length); if (len < 200) throw new Error('Practice main too short: ' + len); }],
  ['Compare (cold): compare-data renders', '/compare', async q => { const len = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim().length); if (len < 120) throw new Error('Compare main too short: ' + len); }],
  ['Feedback (cold): feedback-data renders', '/', async q => { await q.evaluate(() => { location.hash = '#feedback'; }); await q.waitForSelector('#fbText2', {timeout: 8000}); const h1 = await q.textContent('#main h1'); if (!h1 || !h1.trim()) throw new Error('Feedback h1 missing'); }],
  ['7 pages by the menu, no reload', '/', async q => { for (const h of ['#build', '#meta', '#battle', '#team', '#gifts', '#events', '#calc']) { await q.evaluate(h => { location.hash = h; }, h); await q.waitForTimeout(1500); } }]];
const b = await chromium.launch({args: ['--disable-dev-shm-usage']}); let fails = 0;
for (const [name, pth, act] of CASES) {
  const c = await b.newContext({viewport: {width: 1440, height: 900}}), q = await c.newPage(), errs = []; q.setDefaultTimeout(8000);
  q.on('pageerror', e => errs.push(e.message)); q.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text().split('\n')[0]); });
  await q.goto(base + pth, {waitUntil: 'networkidle'}); await q.waitForTimeout(2500);
  let step = ''; try { await act(q); await q.waitForTimeout(1500); } catch (e) { step = String(e.message).split('\n')[0].slice(0, 90); }
  const r = await q.evaluate(() => ({at: location.pathname + location.hash.slice(0, 16), broken: /didn.t load/.test(document.body.innerText)}));
  const ok = !errs.length && !r.broken && !step; if (!ok) fails++;
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${name} (cold on ${pth}) -> ${r.at}${step ? ' | step failed: ' + step : ''}${errs.length ? ' | ' + [...new Set(errs)].slice(0, 2).join(' || ').slice(0, 160) : ''}${r.broken ? ' | "This page didn\'t load"' : ''}`);
  await c.close(); }
// Chunk-failure guards (Job 71 M1/M2): failing chunks must stop after 1 request, never loop
for (const [name, pth, pat, act, check] of [
  ['Chunk fail (M1): /routes/calc.js fails once -> "This page didn\'t load"', '/calc', /\/routes\/calc.*\.js/, null, async (q, reqs) => { const t = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim()); return reqs === 1 && /didn['’]t load/i.test(t); }],
  ['Chunk fail (M1): /routes/team.js fails once -> "This page didn\'t load"', '/team', /\/routes\/team.*\.js/, null, async (q, reqs) => { const t = await q.evaluate(() => (document.querySelector('#main')?.innerText || '').trim()); return reqs === 1 && /didn['’]t load/i.test(t); }],
  ['Chunk fail (M2): /routes/info-text.js fails once on ability tap -> no loop', '/pokemon/garchomp', /\/routes\/info-text.*\.js/, async q => { await q.click('[data-v2info="ab"]'); }, async (q, reqs) => { const s = await q.evaluate(() => Boolean(document.querySelector('.np-sheet, .np-toast'))); return reqs === 1 && s; }],
]) {
  const c = await b.newContext({viewport: {width: 1440, height: 900}}), q = await c.newPage(); let reqs = 0, step = '';
  await q.route(pat, async rt => { reqs++; if (reqs > 50) await new Promise(r => setTimeout(r, 100)); return rt.abort('failed').catch(() => {}); });
  try { await q.goto(base + pth, {waitUntil: act ? 'networkidle' : 'domcontentloaded', timeout: 10000}); if (act) { await q.waitForTimeout(400); await act(q); } await q.waitForTimeout(1500); } catch (e) { step = String(e.message).split('\n')[0].slice(0, 90); }
  const ok = !step && await check(q, reqs).catch(() => false); if (!ok) fails++;
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${name} (reqs=${reqs}${step ? ' | ' + step : ''})`);
  await c.close(); }
await b.close(); srv.close();
console.log(`split-routes-cross-test: ${fails ? fails + ' failed' : 'all passed'}`); process.exit(fails ? 1 : 0);
