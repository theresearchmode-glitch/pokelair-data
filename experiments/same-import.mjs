// Same-output check for Import, Clear Team and opening a team link (R4, Nov 11): pastes real exports, hand-made pastes with things
// Champions doesn't have (off-roster Pokémon, items, moves, too many stat points, a nature with no stat points), a NastyPlot team link,
// junk and an empty box, through today's Import panel; then Clear Team and Undo. Compares the whole team (sets included), the toast,
// the panel's notes and My Team's HTML after every step.
// Usage: node experiments/same-import.mjs before.html after.html   (DUMP=file.json writes every step)
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
  const IMP = t => `if(!$('pasteIn'))$('importBtn').click();$('pasteIn').value=${JSON.stringify(t)};$('pasteLoad').click()`;
  const HAND = ['Garchomp @ Leftovers\nAbility: Rough Skin\nEVs: 20 HP / 32 Atk / 20 Spe\nJolly Nature\n- Earthquake\n- Dragon Claw\n- Protect\n- Rock Slide',
    'Mewtwo @ Life Orb\nAbility: Pressure\n- Psystrike\n\nIncineroar @ Sitrus Berry\nAbility: Intimidate\nCareful Nature\n- Fake Out\n- Parting Shot\n- Flare Blitz\n- Knock Off',
    'Kingambit @ Not A Real Item\nAbility: Defiant\nEVs: 32 HP / 32 Atk / 32 Spe\nAdamant Nature\n- Kowtow Cleave\n- Sucker Punch\n- Made Up Move\n- Protect',
    'hello there', '', 'Pikachu\n\n\n'].join('\n\n\n');
  const steps = [
    `S.slots=normSlots(['Garchomp','Incineroar'].map(n=>({n,a:null,lock:false})));fixSlots();S.loadedId=null;render()`,
    `$('importBtn').click()`, `$('pasteLoad').click()`,
    `$('pasteIn').value='hello there';$('pasteLoad').click()`,
    `$('pasteIn').value='Mewtwo @ Life Orb\\nAbility: Pressure\\n- Psystrike';$('pasteLoad').click()`,
    `if(!$('pasteIn'))$('importBtn').click();$('pasteIn').value=P1;$('pasteLoad').click()`, `const u=$('toastUndo');if(u)u.click()`, `if(!$('pasteIn'))$('importBtn').click();$('pasteIn').value=P2;$('pasteLoad').click()`,
    ...HAND.split('\n\n\n').map(t => IMP(t)),
    `if(!$('pasteIn'))$('importBtn').click();$('pasteIn').value=LINK;$('pasteLoad').click()`, `const u=$('toastUndo');if(u)u.click()`, `if(!$('pasteIn'))$('importBtn').click();$('pasteIn').value=LINK;$('pasteLoad').click()`,
    `if(!$('pasteIn'))$('importBtn').click();$('pasteIn').value=LINK.slice(0,LINK.length-9);$('pasteLoad').click()`,
    `$('clearTeam').click()`, `const u=$('toastUndo');if(u)u.click()`, `$('clearTeam').click()`,
    `$('importBtn').click()`, `$('importBtn').click()`, `$('exportBtn').click()`, `CLICK({pastex:1})`,
  ];
  await p.evaluate(() => window.__ev(`window.TQ=[];for(const e of META.events.events)for(const t of e.top||[])if(TQ.length<2&&t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)))TQ.push(t.mons.map(m=>m.n));
    window.CLICK=d=>{const x=document.createElement('button');x.type='button';Object.assign(x.dataset,d);document.body.appendChild(x);x.click();x.remove()};
    const keep=S.slots;S.slots=normSlots(TQ[0].map(n=>({n,a:null,lock:false})));fixSlots();window.P1=exportPaste();S.slots=normSlots(TQ[1].map(n=>({n,a:null,lock:false})));fixSlots();window.P2=exportPaste();window.LINK=teamLink();S.slots=keep;
    window.NORM=h=>h.replace(/[?]r=[0-9]+/g,'').replace(/ data-retry="[0-9]+"/g,'').replace(/ data-arb="1"/g,'').replace(/ data-clr="[^"]*"/g,'').replace(/ style="[^"]*"/g,'').replace(/<span class="clrw[^"]*">(<input[^>]*>)<button[^>]*>×<[/]button><[/]span>/g,'$1');
    window.SNAP=()=>JSON.stringify({teams:[],slots:S.slots,loaded:S.loadedId,paste:ui.paste||null,undo:!!ui.undo,toast:($('toast')||{}).textContent,notes:($('pasteNotes')||{}).textContent,
      panel:NORM(($('pastePanel')||{}).innerHTML),title:($('teamTitle')||{}).textContent,six:NORM(($('slots')||{}).innerHTML)})`));
  const snaps = [];
  for (const st of steps) { await p.waitForTimeout(520); snaps.push(await p.evaluate(c => window.__ev(`(()=>{try{${c}}catch(e){return 'ERR '+e.message}return ''})()`) + window.__ev('SNAP()'), st)); }
  // team ids are made from the clock and a random number: number them by first appearance instead
  const ids = new Map(); out[k] = snaps.map(s => { const pre = s.slice(0, s.indexOf('{')), j = JSON.parse(s.slice(pre.length));
    for (const t of j.teams) if (!ids.has(t.id)) ids.set(t.id, 'T' + ids.size);
    let x = s; for (const [id, T] of ids) x = x.split(id).join(T); return x; });
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
console.log(`${out.a.length} import/clear steps compared: ${same} identical, ${diff.length} different; last state ${out.a[out.a.length - 1].length} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => console.log('  step', i, '\n   a:', x.slice(0, 400), '\n   b:', y.slice(0, 400)));
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);
