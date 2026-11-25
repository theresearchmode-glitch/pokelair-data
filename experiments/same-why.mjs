// Same-output check for "Why this score?" and the Legal mark (R4, Nov 11): for every tournament team in today's data (and its
// first 1-5 Pokémon as partial teams, and illegal variants), today's breakdown text (CH.gradeWhy) and the legality My Team shows
// (renderVerdict -> ui.vsum.legal) in two builds.
// Usage: node experiments/same-why.mjs before.html after.html   (DUMP=file.json writes every entry)
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
  out[k] = await p.evaluate(() => window.__ev(`(()=>{const res=[];const T=[];for(const e of META.events.events)for(const t of e.top||[])if(t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)))T.push(t.mons.map(m=>m.n));
    const one=(names,tag,mut)=>{S.slots=normSlots(names.map(n=>({n,a:null,lock:false})));fixSlots();if(mut)mut();S.loadedId=null;const ms=members();let G=null,h='',lg=null;
      try{const RD=prepOf(ms);G=RD?CH.gradeOf(RD,proChecks(ms,true),ms):null;h=G?CH.gradeWhy(G):'';}catch(e){h='ERR '+e.message}
      try{ui.vsum=null;render();lg=ui.vsum&&ui.vsum.legal}catch(e){lg="ERR "+e.message}
      res.push(tag+'|'+names.join(',')+'|legal='+lg+'|'+h)};
    T.slice(0,120).forEach((n,i)=>{one(n,'full');if(i<25)for(let k=1;k<6;k++)one(n.slice(0,k),'part'+k);});
    T.slice(0,15).forEach(n=>one(n,'sameitem',()=>{const it=(S.slots[0].it&&S.slots[0].it.doubles)||'Sitrus Berry';S.slots[1].it={doubles:it};S.slots[0].it={doubles:it}}));
    T.slice(0,5).forEach(n=>one([n[0],n[0]].concat(n.slice(2)),'dup'));
    return res})()`));
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
console.log(`${out.a.length} breakdowns and legal marks compared: ${same} identical, ${diff.length} different; text ${out.a.join('').length} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => console.log('  entry', i, '\n   a:', x.slice(0, 300), '\n   b:', y.slice(0, 300)));
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);
