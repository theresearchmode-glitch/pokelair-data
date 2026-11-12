// Run the behaviour tests: node app/test/behaviour/run.mjs [group ...] [--only=ID,ID]   (PAGE=..., ADAPTER=... to test the rebuild; FAILSHOT=dir saves a picture + page text of each FAIL)
// Prints one line per test, a summary, writes results.json; exit 1 if any test that isn't marked known/skip fails.
import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2), only = (args.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const groups = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : fs.readdirSync(HERE).filter(f => /^[A-Z]-.*\.mjs$/.test(f)).map(f => f.replace('.mjs', ''));
const H = await import('./harness.mjs');
for (const g of groups) await import(`./${g}.mjs`);
const res = [], t0 = Date.now();
for (const T of H.tests()) { if (only.length && !only.includes(T.id)) continue;
  if (T.skip) { res.push({...T, r: 'skip', why: T.skip}); console.log(`  skip  ${T.id}  ${T.title}  (${T.skip})`); continue; }
  H.setGroup(T.group); let r = 'pass', why = '';
  try { await Promise.race([T.fn(), new Promise((_, j) => setTimeout(() => j(new Error('timed out after 60s')), 60000))]); } catch (e) { r = T.known ? 'known' : 'FAIL'; why = String(e.message || e).slice(0, 300); }
  if (r === 'pass' && T.known) { r = 'FIXED?'; why = 'marked known (' + T.known + ') but passed: remove the mark'; }
  if (r === 'FAIL' && process.env.FAILSHOT) { try { const pg = H.lastPage(); fs.mkdirSync(process.env.FAILSHOT, {recursive: true}); const f = process.env.FAILSHOT.replace(/[\\/]$/, '') + '/' + T.id;
    await pg.screenshot({path: f + '.png', fullPage: true}); fs.writeFileSync(f + '.txt', await pg.evaluate(() => document.body.innerText)); } catch (e) { console.log('  (FAILSHOT: ' + String(e.message).slice(0, 80) + ')'); } }
  res.push({group: T.group, id: T.id, title: T.title, r, why});
  console.log(`  ${r.padEnd(5)} ${T.id}  ${T.title}${why ? '  -> ' + why : ''}`); }
await H.closeAll();
const n = k => res.filter(x => x.r === k).length;
console.log(`\nbehaviour: ${n('pass')} pass, ${n('FAIL')} FAIL, ${n('known')} known bugs, ${n('FIXED?')} fixed?, ${n('skip')} skipped; ${Math.round((Date.now() - t0) / 1000)}s  (adapter ${process.env.ADAPTER || 'current'})`);
fs.writeFileSync(HERE + 'results.json', JSON.stringify({ran: new Date().toISOString(), adapter: process.env.ADAPTER || 'current', res: res.map(({fn, ...x}) => x)}, null, 1));
process.exit(n('FAIL') ? 1 : 0);
