// The folder that goes to nastyplot.org (public-site.mjs, night plan item 6): builds it into site-test/ from today's out/ and checks
// what Cloudflare would serve. Runs in CI's "today's data" job (the frozen Nov 9 test data still has player names, so it can't run there).
//   node experiments/public-site-test.mjs
import fs from 'node:fs'; import path from 'node:path'; import {spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), D = path.join(ROOT, 'site-test');
let bad = 0; const ok = (c, m) => { console.log(`  ${c ? 'pass' : 'FAIL'}  ${m}`); if (!c) bad++; };
const r = spawnSync(process.execPath, ['public-site.mjs', 'site-test'], {cwd: ROOT, encoding: 'utf8'});
ok(r.status === 0, `public-site.mjs builds the folder (${(r.stdout + r.stderr).trim().split('\n').pop().slice(0, 200)})`);
const all = []; const walk = d => { if (fs.existsSync(d)) for (const e of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : all.push(path.relative(D, p)); } }; walk(D);
ok(!all.some(f => f.endsWith('.map') || f === 'preview.json'), 'no source map and no preview.json');
ok(all.every(f => /\.(html|js|css|json|woff2|svg|png|webp|ico|txt|xml)$/.test(f) || f === '_redirects' || f === '_headers'), 'only page file types');
for (const f of ['index.html', '404.html', 'v2.js', 'v2.css', 'robots.txt', 'sitemap.xml', '_redirects', '_headers', 'favicon.svg', 'pokemon/garchomp.html']) ok(all.includes(f), `has ${f}`);
const keys = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/src/app/03-persistence.js'), 'utf8').match(/META_KEYS=(\[[^\]]*\])/)[1].replace(/'/g, '"'));
const dataOk = keys.filter(k => { try { JSON.parse(fs.readFileSync(path.join(D, 'data', k + '.json'), 'utf8')); return true; } catch (e) { return false; } });
ok(dataOk.length === keys.length, `every document the page asks for is a readable file (${dataOk.length} of ${keys.length})`);
const filled = keys.filter(k => { try { const v = JSON.parse(fs.readFileSync(path.join(D, 'data', k + '.json'), 'utf8')); return v && typeof v === 'object'; } catch (e) { return false; } });
ok(['model', 'perf', 'teams', 'results', 'events', 'doubles_tour'].every(k => filled.includes(k)), `the main documents have data (${filled.length} filled)`);
const art = all.filter(f => f.startsWith('art/')).length; ok(art > 300, `the pictures are there (${art})`);
const v = all.includes('v2.html') ? fs.readFileSync(path.join(D, 'v2.html'), 'utf8') : '';
ok(/NP_ART\s*=\s*["']\/?art\//.test(v) || v.includes('"art/"') || v.includes("'art/'"), 'the page looks for pictures in /art/');
ok(all.length < 20000, `under Cloudflare's 20,000 files (${all.length})`);
/* phone speed (Nov 25, night plan 9): the 166 item pictures are files in art/items/, not data: URIs inside v2.js. Inlined they were
   1.56 MB of the script and made it 1.65 MB brotli (0.52 MB without), and every page's first draw waits for the whole script:
   mid-phone LCP (390x844 @3x, 4x CPU, 150 ms / 1.6 Mbps) went 11.9 -> 6.3 s on Home, 11.8 -> 6.2 s on /pokemon/garchomp, 13.3 -> 7.6 s on /meta
   (wrangler dev, 5 runs each, medians), with pixel-identical settled screenshots. */
const js = all.includes('v2.js') ? fs.readFileSync(path.join(D, 'v2.js'), 'utf8') : '';
const im = js.match(/\bITEM_IMG\s*=\s*(\{[^}]*\})/), items = im ? (() => { try { return JSON.parse(im[1].replace(/([{,])\s*([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')); } catch (e) { return null; } })() : null;
ok(items && Object.keys(items).length > 100 && Object.values(items).every(f => typeof f === 'string' && !f.startsWith('data:')), `v2.js names the item pictures as files, no data: pictures inside (${items ? Object.keys(items).length + ' items, ' + Object.values(items).filter(f => String(f).startsWith('data:')).length + ' inlined' : 'ITEM_IMG not readable'})`);
const missingItems = items ? Object.values(items).filter(f => !String(f).startsWith('data:') && !all.includes(`art/items/${f}.webp`)) : ['?'];
ok(items && !missingItems.length, `every item picture is a file in art/items/ (${missingItems.length} missing${missingItems.length ? ': ' + missingItems.slice(0, 4).join(', ') : ''})`);
const br = (await import('node:zlib')).brotliCompressSync(Buffer.from(js)).length;
ok(js && br < 800 * 1024, `v2.js is under 800 KB brotli, what a phone downloads before the first draw (${(br / 1024).toFixed(0)} KB)`);
fs.rmSync(D, {recursive: true, force: true});
console.log(bad ? `public-site-test: ${bad} failed` : 'public-site-test: all passed'); process.exit(bad ? 1 : 0);
