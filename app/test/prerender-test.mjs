// prerender-test.mjs (Job W, Nov 26): what a search engine or link preview that does NOT run scripts reads on the public site.
// For "/", "/team" and "/meta" it reads the built HTML files as plain text (no browser, no script) and checks:
//   1. exactly one <h1> outside <script> (the "didn't load" fallback lives in a script string and doesn't count), with 3+ real words;
//   2. an intro <p> after it;
//   3. real links to other public pages (/team or /build, /calc, /meta ...), 5 or more;
//   4. "/" and "/meta": the top 10 as /pokemon/<name> links;
//   5. the words are visually hidden (class vh) and sit inside #main, beside the loading panel (so the screen before the script is today's).
// Expects the public build in app/dist (node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public) or PRE_DIST=<folder>.
// Failed on alt/day-batch3 76515304 (no h1 outside scripts on any of the three pages).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = path.resolve(process.env.PRE_DIST || path.join(ROOT, 'app/dist'));
let fails = 0; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };
const text = s => s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();
for (const [addr, file, top] of [['/', 'index.html', true], ['/team', 'team.html', false], ['/meta', 'meta.html', true]]) {
  const f = path.join(DIST, file); if (!fs.existsSync(f)) { ok(false, `${addr}: ${file} missing in ${DIST}`); continue; }
  const raw = fs.readFileSync(f, 'utf8'), html = raw.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => text(m[1]));
  ok(h1s.length === 1 && h1s[0].split(' ').filter(w => /[A-Za-zÀ-ÿ]{2,}/.test(w)).length >= 3 && !/didn.t load/i.test(h1s[0]), `${addr}: one <h1> with real words without scripts (${h1s.length}: ${JSON.stringify(h1s).slice(0, 120)})`);
  const blk = (html.match(/<section class="vh" data-v2pre>([\s\S]*?)<\/section>/) || [])[1] || '';
  const intro = text((blk.match(/<\/h1>\s*<p>([\s\S]*?)<\/p>/) || [])[1] || '');
  ok(intro.split(' ').length >= 6, `${addr}: an intro line after the h1 (${JSON.stringify(intro.slice(0, 90))})`);
  const links = [...blk.matchAll(/<a href="(\/[a-z0-9/-]*)"/g)].map(m => m[1]), pages = links.filter(l => !l.startsWith('/pokemon/')), mons = links.filter(l => /^\/pokemon\/[a-z0-9-]+$/.test(l));
  ok(pages.length >= 5 && pages.includes(addr === '/team' ? '/build' : '/team'), `${addr}: ${pages.length} real page links (${pages.slice(0, 5).join(' ')} ...)`);
  if (top) ok(mons.length === 10, `${addr}: the top 10 as /pokemon/ links (${mons.length}: ${mons.slice(0, 3).join(' ')} ...)`);
  const main = (html.match(/<main class="np-main" id="main">([\s\S]*?)<\/main>/) || [])[1] || '';
  ok(main.includes('data-v2pre') && main.includes('np-loading'), `${addr}: the words sit in #main, visually hidden, beside the loading panel`);
}
console.log(`prerender-test: ${fails ? fails + ' failed' : 'all passed'}`); process.exit(fails ? 1 : 0);
