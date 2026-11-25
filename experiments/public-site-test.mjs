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
fs.rmSync(D, {recursive: true, force: true});
console.log(bad ? `public-site-test: ${bad} failed` : 'public-site-test: all passed'); process.exit(bad ? 1 : 0);
