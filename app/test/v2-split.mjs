// The --split Preview's loaders, served over http (review Nov 18, docs/rebuild/audits/review-behaviour-nov18.md C5 and C6).
//   SPL-1  all files there: no data warning, the page draws
//   SPL-2  preview.json missing (404, HTML body): the page says it couldn't read today's data (before: built-in numbers, no sign)
//   SPL-3  preview.json missing (404, JSON body): the same (before: the error body was used as the data, not even a warning)
//   SPL-4  v2.js missing (404): the loading line gives way to "This page didn't load." (before: "Getting today's numbers…" forever)
// Each check failed on the build before its fix. One browser at a time.
//   DIR=<folder with v2.html, v2.js, preview.json from: node app/build.mjs --v2 --preview-data --split> node app/test/v2-split.mjs
import {chromium} from 'playwright'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const DIR = path.resolve(process.env.DIR || 'app/dist');
for (const f of ['v2.html', 'v2.js', 'preview.json']) if (!fs.existsSync(path.join(DIR, f))) { console.log(`v2-split: ${f} is not in ${DIR} (build with --split)`); process.exit(1); }
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
let miss = null; /* {file, body, type}: the file answered with a 404 */
const srv = http.createServer((q, r) => { const f = decodeURIComponent(q.url.split('?')[0].split('#')[0]).replace(/^\/+/, '') || 'v2.html';
  if (miss && f === miss.file) { r.writeHead(404, {'content-type': miss.type}); return r.end(miss.body); }
  const p = path.join(DIR, f); if (!p.startsWith(DIR) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404, {'content-type': 'text/html'}); return r.end('<h1>Not found</h1>'); }
  r.writeHead(200, {'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.json') ? 'application/json' : f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL0 = `http://127.0.0.1:${srv.address().port}/v2.html`;
const b = await chromium.launch();
const open = async (m, hash, wait = 4000) => { miss = m; const c = await b.newContext({viewport: {width: 1280, height: 900}}), q = await c.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto(URL0 + hash); await q.waitForTimeout(wait);
  const r = await q.evaluate(() => { const m = document.querySelector('#main'), n = document.querySelector('#main .np-dnote'); return {main: m ? m.innerText.slice(0, 160) : '', note: n ? n.innerText : '', v2: !!window.V2, loading: !!document.querySelector('#main .np-loading')}; });
  await c.close(); return r; };
{ const r = await open(null, '#team'); ok(r.v2 && !/couldn.t read today/.test(r.note) && !r.loading, `SPL-1: every file there: My Team draws with no data warning (${JSON.stringify(r).slice(0, 160)})`); }
for (const [n, m] of [['SPL-2', {file: 'preview.json', type: 'text/html', body: '<h1>Not found</h1>'}], ['SPL-3', {file: 'preview.json', type: 'application/json', body: '{"error":"not found"}'}]])
  for (const h of ['#team', '#home']) { const r = await open(m, h); ok(r.v2 && /couldn.t read today.s data/.test(r.note) && /404/.test(r.note), `${n}: preview.json answers 404 (${m.type}): ${h} says the Preview couldn't read today's data (note: ${r.note.slice(0, 120) || 'none'})`); }
{ const r = await open({file: 'v2.js', type: 'text/html', body: '<h1>Not found</h1>'}, '#home', 2500); ok(!r.v2 && !r.loading && /This page didn.t load/.test(r.main), `SPL-4: v2.js answers 404: the loading line gives way to "This page didn't load." (${JSON.stringify(r).slice(0, 160)})`); }
await b.close(); srv.close();
console.log(`v2-split:${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
