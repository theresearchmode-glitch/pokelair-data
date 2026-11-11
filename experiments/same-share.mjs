// Same-output check for the Share images (R4, Nov 11): draws Team Card, Team Poster and Team Sheet in light and dark for three
// real teams (one partial) with today's Share code in two builds and compares the pixels (PNG data URLs).
// Usage: node experiments/same-share.mjs before.html after.html
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

  // three real teams (one partial) x Team Card / Team Poster / Team Sheet x light / dark, drawn by today's own Share code
  out[k] = await p.evaluate(() => window.__ev(`(async()=>{const T=[];for(const e of META.events.events)for(const t of e.top||[])if(T.length<2&&t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)))T.push(t.mons.map(m=>m.n));T.push(T[0].slice(0,3));
    const res=[];for(const tm of T){S.slots=normSlots(tm.map(n=>({n,a:null,lock:false})));fixSlots();render();
      for(const kind of ['card','poster','sheet'])for(const mode of ['light','dark']){CH.shareKind=kind;CH.shareMode=mode;SHARE_KIND=null;let u='';try{const c=await buildShareCard();u=c?c.width+'x'+c.height+':'+c.toDataURL('image/png'):'none'}catch(e){u='ERR '+e.message}
        let h=0;for(let i=0;i<u.length;i++)h=(h*31+u.charCodeAt(i))|0;res.push([tm.length+' '+kind+' '+mode,u.slice(0,20)+' '+u.length+' #'+h])}}
    return res;})()`));
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x[1] === out.b[i][1] && !x[1].includes('ERR') && !x[1].startsWith('none')) same++; else diff.push([x[0], x[1], out.b[i][1]]); });
console.log(`${out.a.length} share images compared: ${same} identical, ${diff.length} different or missing`); diff.slice(0, 4).forEach(d => console.log('  ', d.join(' | ')));
if (process.env.SHOW) out.a.forEach(x => console.log('   ', x[0], x[1].slice(0, 40)));
process.exit(diff.length ? 1 : 0);
