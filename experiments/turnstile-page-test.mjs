// Turnstile on the public site's Send Feedback (night plan 5, Nov 25). Builds the public page, serves app/dist over http WITH the
// site's own Content-Security-Policy (from dist/_headers), and stands in for Cloudflare's api.js so no network is needed.
// Checks: api.js is fetched only when Send Feedback opens (never on Home); the widget is drawn with our site key, action "feedback"
// and "interaction-only"; the POST carries its token; a second message needs a fresh token (reset); no CSP violations;
// the Claude-hosted build never loads it. Run: node experiments/turnstile-page-test.mjs
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import {spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), D = path.join(ROOT, 'app/dist');
let bad = 0; const ok = (c, m) => { console.log(`  ${c ? 'pass' : 'FAIL'}  ${m}`); if (!c) bad++; };
const build = args => { const r = spawnSync(process.execPath, ['app/build.mjs', '--v2', '--split', '--one-art-size', '--art=../src/v2/art/', ...args], {cwd: ROOT, encoding: 'utf8'}); if (r.status !== 0) { console.log(r.stdout, r.stderr); process.exit(1); } };
const FAKE = `window.__tsCalls={render:[],reset:0,remove:0};window.turnstile={render:(el,o)=>{window.__tsCalls.render.push({sitekey:o.sitekey,action:o.action,appearance:o.appearance});const w=document.createElement('div');w.className='ts-fake-widget';w.dataset.w='w'+window.__tsCalls.render.length;el.appendChild(w);setTimeout(()=>o.callback('tok-'+window.__tsCalls.render.length+'-'+(window.__tsCalls.reset)),30);return 'w'+window.__tsCalls.render.length},reset:()=>{window.__tsCalls.reset++;},remove:(id)=>{window.__tsCalls.remove++;document.querySelectorAll('.ts-fake-widget[data-w="'+id+'"]').forEach(x=>x.remove());}};`; /* the stand-in draws one box per render (removed by remove), so the checks can count widgets on the page */
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml'};
const serve = csp => new Promise(res => { const posts = []; const s = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/api/feedback' || u === '/api/count') { let b = ''; q.on('data', c => b += c); q.on('end', () => { if (u === '/api/feedback') posts.push({tok: q.headers['cf-turnstile-response'] || '', body: b}); r.writeHead(u === '/api/count' ? 204 : 201); r.end(); }); return; }
  let f = path.join(D, u === '/' ? 'v2.html' : u); if (!f.startsWith(D)) { r.writeHead(400); return r.end(); }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(D, 'v2.html');
  r.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', ...(csp ? {'Content-Security-Policy': csp} : {})}); fs.createReadStream(f).pipe(r); });
  s.listen(0, '127.0.0.1', () => res({s, posts, origin: `http://127.0.0.1:${s.address().port}`})); });
const run = async (pub) => {
  build(pub ? ['--public'] : []);
  const hdr = pub ? fs.readFileSync(path.join(D, '_headers'), 'utf8') : '', cm = hdr.match(/Content-Security-Policy: ([^\n]+)/);
  if (pub) ok(!!cm && /script-src [^;]*https:\/\/challenges\.cloudflare\.com/.test(cm[1]) && /frame-src https:\/\/challenges\.cloudflare\.com/.test(cm[1]), 'the CSP allows Turnstile\'s script and frame');
  const csp = cm ? cm[1].replace(/;\s*upgrade-insecure-requests/, '') : ''; /* plain http here */
  const {s, posts, origin} = await serve(csp); const b = await chromium.launch(); const p = await b.newPage();
  const ts = [], viol = [];
  await p.route('https://challenges.cloudflare.com/**', r => { ts.push(r.request().url()); r.fulfill({status: 200, contentType: 'text/javascript', body: FAKE}); });
  p.on('console', m => { if (/Content Security Policy/i.test(m.text())) viol.push(m.text().slice(0, 140)); });
  await p.goto(origin + '/#home', {waitUntil: 'networkidle'}); await p.waitForTimeout(800);
  const onHome = ts.length;
  await p.goto(origin + '/#feedback', {waitUntil: 'networkidle'}); await p.waitForTimeout(1200);
  if (!pub) { ok(ts.length === 0, `Claude build: Send Feedback never loads Turnstile (${ts.length} requests)`); await b.close(); s.close(); return; }
  ok(onHome === 0, `public: Home loads no Turnstile (${onHome} requests)`);
  ok(ts.length === 1 && /turnstile\/v0\/api\.js\?render=explicit/.test(ts[0] || ''), `public: Send Feedback loads api.js once (${ts.join(' ')})`);
  const c1 = await p.evaluate(() => window.__tsCalls);
  ok(c1 && c1.render.length === 1 && c1.render[0].sitekey === '0x4AAAAAAGTHK0MAePecas7f' && c1.render[0].action === 'feedback' && c1.render[0].appearance === 'interaction-only', `widget drawn with our site key, action feedback, interaction-only (${JSON.stringify(c1 && c1.render)})`);
  // Kip job 41 / HH job I (Nov 26): a redraw of the page (data arriving, a theme switch) drew the widget a second time and threw the
  // first token away. Now: one widget per form; a redraw keeps it and its token; leaving and reopening Send Feedback draws a fresh one
  const count = () => p.evaluate(() => ({render: window.__tsCalls.render.length, onPage: document.querySelectorAll('.ts-fake-widget').length, inForm: document.querySelectorAll('#fbTs .ts-fake-widget').length, tok: window.__npTurnstileToken}));
  const w0 = await count(); await p.evaluate(() => V2.redraw()); await p.waitForTimeout(300); await p.click('[data-v2theme]'); await p.waitForTimeout(600); const w1 = await count();
  ok(w0.render === 1 && w0.inForm === 1 && w1.render === 1 && w1.onPage === 1 && w1.inForm === 1 && w1.tok === 'tok-1-0', `a redraw and a theme switch keep the one widget and its token (before ${JSON.stringify(w0)}, after ${JSON.stringify(w1)})`);
  await p.fill('#fbText2', 'The calc page is great'); await p.click('[data-fbsend2]'); await p.waitForTimeout(600);
  ok(posts.length === 1 && posts[0].tok === 'tok-1-0', `the message carries the widget's token (${JSON.stringify(posts.map(x => x.tok))})`);
  const c2 = await p.evaluate(() => ({reset: window.__tsCalls.reset, tok: window.__npTurnstileToken}));
  ok(c2.reset === 1 && c2.tok === '', `after sending, the token is used up and the widget reset (${JSON.stringify(c2)})`);
  await p.fill('#fbText2', 'Second note right away'); await p.click('[data-fbsend2]'); await p.waitForTimeout(300);
  const say = await p.textContent('[data-fbmsg2]');
  ok(posts.length === 1 && /checking you're a person/.test(say), `no token yet: nothing sent, the visitor is told to wait (${say})`);
  await p.goto(origin + '/#home', {waitUntil: 'networkidle'}); await p.waitForTimeout(500); await p.goto(origin + '/#feedback', {waitUntil: 'networkidle'}); await p.waitForTimeout(900);
  const w2 = await count(), loads = ts.length;
  ok(w2.render === 2 && w2.onPage === 1 && w2.inForm === 1 && loads === 1, `reopening Send Feedback draws one fresh widget, the old one removed, api.js not fetched again (${JSON.stringify(w2)}, ${loads} api.js request)`);
  ok(!viol.length, `no CSP violations (${viol.join(' | ')})`);
  await b.close(); s.close(); };
await run(true); await run(false);
build(['--public']); /* leave the plain public build, as the steps after expect */
console.log(bad ? `turnstile-page-test: ${bad} failed` : 'turnstile-page-test: all passed'); process.exit(bad ? 1 : 0);
