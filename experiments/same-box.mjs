// Same-output check for My Box (R4, Nov 11): every sort, adding (typed into today's Add box), removing, Undo, Reset (both taps),
// box links (copy, open, add, replace, a broken link, a link with Pokémon outside the regulation) through today's buttons.
// Compares the box, the remembered sort, the toast, the count, the link message and the box's HTML after every step.
// Usage: node experiments/same-box.mjs before.html after.html   (DUMP=file.json writes every step)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = new URL('../out/', import.meta.url).pathname, rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (f.startsWith('/') ? f : process.cwd() + '/' + f));
const b = await chromium.launch(), out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  const page = f.replace(/\.html$/, '.ss.html');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const p = await b.newPage({viewport: {width: 1280, height: 900}});
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto('file://' + page); await p.waitForTimeout(3500);
  const steps = [
    `setView('box')`, ...['type', 'new', 'old', 'rating', 'za', 'az'].map(k => `CLICK({boxsort:'${k}'})`),
    {type: 'Dondozo'}, {type: 'Garchomp'}, {type: 'Flapple'}, `CLICK({boxsort:'new'})`,
    `CLICK({unbox:'Absol'})`, `$('toastBoxUndo').click()`, `CLICK({unbox:'Garchomp'})`, `CLICK({unbox:'Flapple'})`, `$('toastBoxUndo').click()`,
    `$('boxReset').click()`, `$('boxReset').click()`, `$('toastBoxUndo').click()`, `CLICK({boxsort:'rating'})`,
    `$('boxLinkOpen').click()`, `$('boxLinkField').value='nonsense';$('boxLinkAdd').click()`,
    `$('boxLinkField').value=LINK;$('boxLinkAdd').click()`, `$('boxLinkOpen').click();$('boxLinkField').value=SMALL;$('boxLinkAdd').click()`,
    `$('toastBoxUndo').click()`, `$('boxLinkOpen').click();$('boxLinkField').value=SMALL;$('boxLinkReplace').click()`, `$('toastBoxUndo').click()`,
    `$('boxLinkOpen').click();$('boxLinkField').value=ODD;$('boxLinkReplace').click()`, `$('toastBoxUndo').click()`,
    `for(const n of [...S.box])CLICK({unbox:n})`, `CLICK({boxsort:'type'})`, {type: 'Pikachu'}, `CLICK({boxsort:'az'})`,
  ];
  await p.evaluate(() => window.__ev(`window.CLICK=d=>{const x=document.createElement('button');x.type='button';Object.assign(x.dataset,d);document.body.appendChild(x);x.click();x.remove()};
    window.LINK=boxLink();const k=S.box;S.box=['Garchomp','Flapple','Dondozo'];window.SMALL=boxLink();window.ODD=SMALL.replace(/box=.*/,'box='+tlB64(JSON.stringify({v:1,b:['Garchomp','Mewtwo','Charizard-Mega-Y','Kingambit']})));S.box=k;
    window.NORM=h=>h.replace(/[?]r=[0-9]+/g,'').replace(/ data-retry="[0-9]+"/g,'').replace(/ data-arb="1"/g,'').replace(/ data-clr="[^"]*"/g,'').replace(/ style="[^"]*"/g,'').replace(/<span class="clrw[^"]*">(<input[^>]*>)<button[^>]*>×<[/]button><[/]span>/g,'$1');
    window.SNAP=()=>JSON.stringify({teams:[],box:S.box,sort:ui.boxSort,saved:localStorage.getItem('cc2.boxSort'),undo:!!ui.boxUndo,toast:($('toast')||{}).textContent,count:($('boxCount')||{}).textContent,
      msg:($('boxLinkMsg')||{}).textContent,linkOpen:!!($('boxLinkIn')&&!$('boxLinkIn').hidden),pressed:[...document.querySelectorAll('[data-boxsort][aria-pressed="true"]')].map(x=>x.dataset.boxsort).join(),list:NORM(($('boxList')||{}).innerHTML)})`));
  const snaps = [];
  for (const st of steps) { await p.waitForTimeout(520);
    if (typeof st === 'object') { await p.fill('#boxAdd', st.type); await p.waitForTimeout(350); await p.press('#boxAdd', 'Enter'); await p.waitForTimeout(300); snaps.push('type ' + st.type + ' ' + await p.evaluate(() => window.__ev('SNAP()'))); continue; }
    snaps.push(await p.evaluate(c => window.__ev(`(()=>{try{${c}}catch(e){return 'ERR '+e.message}return ''})()`) + window.__ev('SNAP()'), st)); }
  // team ids are made from the clock and a random number: number them by first appearance instead
  const ids = new Map(); out[k] = snaps.map(s => { const pre = s.slice(0, s.indexOf('{')), j = JSON.parse(s.slice(pre.length));
    for (const t of j.teams) if (!ids.has(t.id)) ids.set(t.id, 'T' + ids.size);
    let x = s; for (const [id, T] of ids) x = x.split(id).join(T); return x; });
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
console.log(`${out.a.length} My Box steps compared: ${same} identical, ${diff.length} different; last state ${out.a[out.a.length - 1].length} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => console.log('  step', i, '\n   a:', x.slice(0, 400), '\n   b:', y.slice(0, 400)));
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);
