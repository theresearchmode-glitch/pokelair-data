// public-dataready-test.mjs (Job Y, Nov 26): on the public site (nastyplot.org) the page must not draw the numbers built into the page
// (the Nov 1 copy) while today's /data/*.json are on their way. It used to: V2.dataReady (shell.js) only knew the Claude data store
// (window.__NP_CLAUDE || window.claude), so on the public site "no store" made the page ready at once, it drew the built-in numbers,
// and swapped them for today's about 1 s later (a flash of old numbers and a layout jump).
// Expects the public build in app/dist (node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public) and out/.
// Serves app/dist like Cloudflare (/x -> x.html) and /data/<doc>.json from out/ the way public-site.mjs publishes them.
//   1. /data/ missing (404): the page falls back to its built-in numbers; we read their date ("Data as of Nov 1") and team count.
//   2. /data/ answering after 1 s, at 390x844, on / and /meta: every text the page ever shows is recorded (MutationObserver from the
//      first byte); the built-in date and team count must never appear, today's must; CLS is measured and must stay under 0.02.
// Failed on alt/day-batch4 1f8eeeee (the built-in date was drawn first on both pages).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), DIST = path.join(ROOT, 'app/dist');
let fails = 0; const ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails++; };
if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.log('public-dataready-test: no public build in app/dist'); process.exit(1); }
const cwd = process.cwd(); process.chdir(ROOT);
const {DOC_SOURCES} = await import(pathToFileURL(path.join(ROOT, 'split-docs.mjs')).href), {perfDoc} = await import(pathToFileURL(path.join(ROOT, 'app/data-docs.mjs')).href);
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const docs = Object.fromEntries(Object.entries(DOC_SOURCES).map(([k, get]) => [k, get()])); docs.perf = perfDoc(rd('limitless.json'), rd('perf.json')); process.chdir(cwd);
const T = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png'};
let mode = 'none'; /* 'none' = /data/ 404, 'slow' = /data/ after 1 s */
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]);
  const m = /^\/data\/([a-z_]+)\.json$/.exec(p);
  if (m) { const send = () => { const v = docs[m[1]]; if (mode === 'none' || v === undefined) { r.writeHead(404); return r.end(); } r.writeHead(200, {'content-type': 'application/json'}); r.end(JSON.stringify(v)); };
    return mode === 'slow' ? setTimeout(send, 1000) : send(); }
  if (p === '/') p = '/index.html';
  let f = p.startsWith('/src/') ? path.join(ROOT, 'app', p) : path.join(DIST, p); /* --art=../src/v2/art/: the pictures from the source folder */ if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + '.html') ? f + '.html' : '';
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, {'content-type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
await new Promise(res => srv.listen(0, '127.0.0.1', res)); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await chromium.launch();
// every text the page shows from the first byte: the "Data as of <date>" line and "<N> real tournament teams"
const watch = () => { window.__seen = {dates: new Set(), teams: new Set(), loading: 0}; window.__cls = 0;
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; (window.__src = window.__src || []).push(e.value.toFixed(3) + ' @' + Math.round(e.startTime) + ' ' + (e.sources || []).map(x => x.node && x.node.nodeType === 1 ? x.node.tagName.toLowerCase() + '.' + String(x.node.className).split(' ')[0] + ' ' + Math.round(x.previousRect.y) + '->' + Math.round(x.currentRect.y) + ' h' + Math.round(x.previousRect.height) + '->' + Math.round(x.currentRect.height) : '?').join(', ')); } }).observe({type: 'layout-shift', buffered: true}); } catch (e) {}
  const scan = () => { const t = document.body ? document.body.innerText : ''; for (const m of t.matchAll(/Data as of ([A-Z][a-z]{2} \d{1,2})/g)) window.__seen.dates.add(m[1]);
    for (const m of t.matchAll(/([\d,]{4,}) real tournament teams/g)) window.__seen.teams.add(m[1]); if (/Getting today/.test(t)) window.__seen.loading++; };
  new MutationObserver(scan).observe(document, {subtree: true, childList: true, characterData: true}); addEventListener('DOMContentLoaded', scan); };
const run = async (pth, m, w = 390, h = 844) => { mode = m; const c = await b.newContext({viewport: {width: w, height: h}}); await c.addInitScript(watch); const q = await c.newPage(); const errs = [];
  q.on('pageerror', e => errs.push(e.message));
  await q.goto(base + pth); await q.waitForTimeout(m === 'slow' ? 4500 : 3000);
  const r = await q.evaluate(() => ({dates: [...window.__seen.dates], teams: [...window.__seen.teams], loading: window.__seen.loading, cls: window.__cls, src: window.__src || []}));
  await c.close(); return {...r, errs}; };
const B = await run('/', 'none'), bDate = B.dates[B.dates.length - 1], bTeams = B.teams[B.teams.length - 1];
ok(!!bDate, `built-in numbers when /data/ is missing: "Data as of ${bDate}"${bTeams ? `, ${bTeams} teams` : ''} (the fallback still works)`);
for (const pth of ['/', '/meta']) {
  const R = await run(pth, 'slow');
  ok(bDate && !R.dates.includes(bDate) && (!bTeams || !R.teams.includes(bTeams)), `${pth} at 390, /data/ 1 s late: the built-in numbers never drawn (dates seen ${JSON.stringify(R.dates)}, team counts ${JSON.stringify(R.teams)})`);
  ok(R.dates.length >= 1 && R.loading > 0, `${pth}: "Getting today's numbers" until the data came, then today's date (${R.dates.join(', ') || 'none'})`);
  ok(R.cls < 0.02 && !R.errs.length, `${pth}: CLS ${R.cls.toFixed(4)} (under 0.02), page errors ${R.errs.length}${R.cls >= 0.02 ? ' | shifts: ' + R.src.join(' ; ').slice(0, 400) : ''}`);
}
await b.close(); srv.close();
console.log(`public-dataready-test: ${fails ? fails + ' failed' : 'all passed'}`); process.exit(fails ? 1 : 0);
