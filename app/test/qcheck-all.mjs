// The full quality check (app/test/qcheck.cjs: contained, no text on text, sizes on the scale, tap targets, no code as text) on
// every built page of the new site, in GitHub's checks (code review C-I8, Nov 17: it only ever ran by hand).
// Findings already judged are listed in app/test/qcheck-known.json; any NEW finding fails. KNOWN=write saves today's as the list.
// Usage: PAGE=app/dist/v2.html node app/test/qcheck-all.mjs   (a --v2 --preview-data build; real data, as RULES.md asks)
//        WIDTHS=320,390,820,1280,1920 THEMES=day,night ROUTES=home,team (defaults: those widths, both themes, every page)
import {chromium} from 'playwright'; import {execFileSync} from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url)), PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'), KF = HERE + 'qcheck-known.json';
const WIDTHS = process.env.WIDTHS || '320,390,820,1280,1920', THEMES = process.env.THEMES || 'day,night';
let routes = process.env.ROUTES ? process.env.ROUTES.split(',') : null;
if (!routes) { const b = await chromium.launch(), p = await b.newPage(); await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500);
  routes = await p.evaluate(() => Object.keys(V2.pages).filter(r => !/^(sheet|team-empty|coming|gallery)$/.test(r))); await b.close(); }
const found = [], t0 = Date.now();
for (const r of routes) { let out = '';
  try { out = execFileSync('node', [HERE + 'qcheck.cjs'], {env: {...process.env, PF: PAGE, HASH: '#' + r, WIDTHS, THEMES, QALL: '1'}, encoding: 'utf8', maxBuffer: 1 << 26}); }
  catch (e) { out = (e.stdout || '') + '\nERROR qcheck crashed: ' + String(e.message).split('\n')[0]; }
  let at = '?'; for (const l of out.split('\n')) { const h = l.match(/^(\w+) (\d+): /); if (h) { at = h[1] + ' ' + h[2]; continue; }
    const f = l.match(/^  (.+)$/) || l.match(/^(ERROR .+)$/); if (f) found.push(`${r} | ${at} | ${f[1].trim()}`); } }
const uniq = [...new Set(found)].sort();
if (process.env.KNOWN === 'write') { fs.writeFileSync(KF, JSON.stringify({made: 'see git log', note: 'findings judged and kept (RULES.md 00q); a new one fails qcheck-all', items: uniq}, null, 1) + '\n'); console.log(`qcheck-all: wrote ${uniq.length} known findings`); process.exit(0); }
let known = []; try { known = JSON.parse(fs.readFileSync(KF, 'utf8')).items; } catch (e) {}
const K = new Set(known), fresh = uniq.filter(x => !K.has(x)), gone = known.filter(x => !uniq.includes(x) && routes.includes(x.split(' | ')[0]));
for (const x of fresh) console.log('  NEW   ' + x);
if (gone.length) console.log(`  (${gone.length} known findings no longer seen: remove them with KNOWN=write after a look)`);
console.log(`qcheck-all: ${routes.length} pages x ${WIDTHS.split(',').length} widths x ${THEMES.split(',').length} themes, ${uniq.length} findings, ${fresh.length} new; ${Math.round((Date.now() - t0) / 1000)}s`);
process.exit(fresh.length ? 1 : 0);
