// Same-output check for the Pokémon info sheet (R4, Nov 11): opens today's info sheet for every Pokémon on the roster in two
// builds and compares the whole sheet (rating, why it rates N, what the data says, other tier lists, typical set, the Info /
// Meta / Rating tabs). Inline styles and sprite retry counters are left out (they don't come from the sheet's data).
// Usage: node experiments/same-info.mjs before.html after.html
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path';
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = fileURLToPath(new URL('../out/', import.meta.url)), rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (path.resolve(f)));
const b = await chromium.launch(), out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  const page = f.replace(/\.html$/, '.ss.html');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const p = await b.newPage({viewport: {width: 1280, height: 900}});
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto(pathToFileURL(page).href); await p.waitForTimeout(3500);

  // every Pokémon on the roster: open today's info sheet (all its layers: the rating sheet, the decorations, the three tabs)
  out[k] = await p.evaluate(() => window.__ev(`(()=>{const res=[];const N=x=>x.replace(/[?]r=[0-9]+/g,'').replace(/ data-retry="[0-9]+"/g,'').replace(/ style="[^"]*"/g,'');
    for(const q of ROSTER){try{lairSheet(q.n);const sh=document.getElementById('lairSheet');res.push([q.n,N(sh?sh.innerHTML:'')]);}catch(e){res.push([q.n,'ERR '+e.message])}}
    // the pages that use the moved helpers: Ratings (tiers, rank, range) and every page that lists sleepers (the same players test)
    for(const v of ['ratings','meta','top','home']){try{setView(v,false);render();const pn=document.querySelector('[data-pane="'+v+'"]');res.push(['view:'+v,N(pn?pn.innerHTML:'')])}catch(e){res.push(['view:'+v,'ERR '+e.message])}}
    try{res.push(['sleepers',JSON.stringify(sleepers().map(x=>x.p?x.p.n:x))])}catch(e){res.push(['sleepers','ERR '+e.message])}
    return res;})()`));
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0, errs = 0; const diff = [];
out.a.forEach((x, i) => { if (x[1].startsWith('ERR')) errs++; if (x[1] === out.b[i][1]) same++; else diff.push([x[0], x[1], out.b[i][1]]); });
console.log(`${out.a.length} info sheets compared: ${same} identical, ${diff.length} different; ${errs} errors; sheet chars ${out.a.reduce((s, x) => s + x[1].length, 0)}`);
diff.slice(0, 3).forEach(([n, x, y]) => { let j = 0; while (j < x.length && x[j] === y[j]) j++; console.log('  ', n, '\n   a:', x.slice(Math.max(0, j - 150), j + 200), '\n   b:', y.slice(Math.max(0, j - 150), j + 200)); });
process.exit(diff.length || errs ? 1 : 0);
