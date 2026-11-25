// Builds the folder that goes to nastyplot.org (Cloudflare Workers static assets), from a clean public build plus today's data.
// Night plan item 6 (launch review H4/H5/H6/S7/S8). Used by .github/workflows/deploy.yml; safe to run locally (writes only <dir>).
//   node public-site.mjs [dir]      default dir: site
// What goes in:
//   - the public build (node app/build.mjs --v2 --split --one-art-size --item-files --art=art/ --public), run here, every file it writes to app/dist
//     EXCEPT the source map (v2.js.map), preview.json and any file type not on the list below
//   - art/: the Pokémon pictures from app/src/v2/art, and art/items/: the item pictures
//   - data/<doc>.json: the same daily documents the morning refresh stores (split-docs.mjs DOC_SOURCES + meta/perf from data-docs.mjs),
//     whole (static files have no size limit like the old store), each checked for player names (app/test/no-names.mjs)
// Stops with exit 1 (and deploys nothing) on any missing document, a name, a file over 25 MiB or more than 20,000 files (Cloudflare's limits).
import fs from 'node:fs'; import path from 'node:path'; import {spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
import {DOC_SOURCES} from './split-docs.mjs'; import {perfDoc} from './app/data-docs.mjs';
const ROOT = path.dirname(fileURLToPath(import.meta.url)); process.chdir(ROOT);
const DIR = path.resolve(process.argv[2] || 'site'), DIST = path.join(ROOT, 'app/dist');
const fail = m => { console.error('::error::public-site: ' + m); process.exit(1); };
if (!DIR.startsWith(ROOT + path.sep) && !process.env.PUBLIC_SITE_ANYWHERE) fail(`the folder must be inside the repo: ${DIR}`);
if (DIR === ROOT || DIR === DIST) fail('refusing to write over ' + DIR);

// 1. the public build, from a clean app/dist (nothing left over from other builds)
for (const f of fs.readdirSync(DIST, {withFileTypes: true})) fs.rmSync(path.join(DIST, f.name), {recursive: true, force: true});
/* Web Analytics (Sim's token, once he adds the site in Cloudflare): set CF_ANALYTICS_TOKEN; without it the page loads no analytics */
const cfa = (process.env.CF_ANALYTICS_TOKEN || '').trim();
const b = spawnSync(process.execPath, ['app/build.mjs', '--v2', '--split', '--one-art-size', '--item-files', '--art=art/', '--public', ...(cfa ? ['--cf-analytics=' + cfa] : [])], {encoding: 'utf8'});
if (b.status !== 0) { console.error((b.stdout || '') + (b.stderr || '')); fail('the public build failed'); }

// 2. copy it, only the kinds of files a page needs
const ALLOW = /\.(html|js|css|json|woff2|svg|png|webp|ico|txt|xml)$|^_redirects$|^_headers$/, SKIP = new Set(['v2.js.map', 'preview.json']);
fs.rmSync(DIR, {recursive: true, force: true}); fs.mkdirSync(DIR, {recursive: true});
let files = 0; const skipped = [];
const copy = (from, to) => { for (const e of fs.readdirSync(from, {withFileTypes: true})) { const a = path.join(from, e.name), z = path.join(to, e.name);
  if (e.isDirectory()) { fs.mkdirSync(z, {recursive: true}); copy(a, z); continue; }
  if (SKIP.has(e.name) || e.name.endsWith('.map') || !ALLOW.test(e.name)) { skipped.push(path.relative(DIST, a)); continue; }
  fs.copyFileSync(a, z); files++; } };
copy(DIST, DIR);
// 3. the pictures
const ART = path.join(ROOT, 'app/src/v2/art'); fs.mkdirSync(path.join(DIR, 'art'), {recursive: true});
for (const f of fs.readdirSync(ART)) if (/\.(webp|png)$/.test(f)) { fs.copyFileSync(path.join(ART, f), path.join(DIR, 'art', f)); files++; }
/* the item pictures (art/items/, 166 files): the build names them as files (--item-files), not data: URIs inside v2.js (phone speed, Nov 25) */
if (fs.existsSync(path.join(ART, 'items'))) { fs.mkdirSync(path.join(DIR, 'art/items'), {recursive: true});
  for (const f of fs.readdirSync(path.join(ART, 'items'))) if (/\.webp$/.test(f)) { fs.copyFileSync(path.join(ART, 'items', f), path.join(DIR, 'art/items', f)); files++; } }
// 4. the data
fs.mkdirSync(path.join(DIR, 'data'), {recursive: true});
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join('out', f), 'utf8')); } catch (e) { return null; } };
const docs = Object.fromEntries(Object.entries(DOC_SOURCES).map(([k, get]) => [k, get()])); docs.perf = perfDoc(rd('limitless.json'), rd('perf.json'));
const missing = Object.keys(docs).filter(k => !docs[k] || typeof docs[k] !== 'object');
if (missing.length) fail('daily documents missing or unreadable: ' + missing.join(', '));
for (const [k, v] of Object.entries(docs)) { const f = path.join(DIR, 'data', k + '.json'); fs.writeFileSync(f, JSON.stringify(v)); files++;
  const n = spawnSync(process.execPath, ['app/test/no-names.mjs', f], {encoding: 'utf8'}); if (n.status !== 0) fail(`data/${k}.json: ${(n.stdout || '').trim().split('\n').pop()}`); }
// documents the page asks for that the refresh never writes (singles, status, info: old keys): a file holding null, which the page reads
// exactly as a missing document (03-persistence.js), so a visit makes no 404s (checked in a browser on wrangler dev, Nov 25)
const pk = fs.readFileSync('app/src/app/03-persistence.js', 'utf8').match(/META_KEYS=(\[[^\]]*\])/); if (!pk) fail('META_KEYS not found in 03-persistence.js');
const asked = JSON.parse(pk[1].replace(/'/g, '"')), empties = asked.filter(k => !(k in docs));
for (const k of empties) { fs.writeFileSync(path.join(DIR, 'data', k + '.json'), 'null'); files++; }
const unasked = Object.keys(docs).filter(k => !asked.includes(k)); if (unasked.length) fail('documents the page never asks for: ' + unasked.join(', '));
// 5. Cloudflare's limits (Workers static assets: 20,000 files, 25 MiB each)
const big = []; const walk = d => { for (const e of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (fs.statSync(p).size > 25 * 1024 * 1024) big.push(path.relative(DIR, p)); } }; walk(DIR);
if (big.length) fail('files over 25 MiB: ' + big.join(', '));
if (files > 20000) fail(`${files} files (limit 20,000)`);
console.log(`public-site: ${files} files in ${path.relative(ROOT, DIR) || DIR} (data: ${Object.keys(docs).length} documents, ${empties.length} empty: ${empties.join(', ')}; left out: ${skipped.join(', ') || 'nothing'})`);
