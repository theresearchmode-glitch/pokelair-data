// The rebuild uses today's logic: for real tournament teams, the Strength Score, its band word, how sure it is and the
// matchups count must be the same in app/dist/v2.html as in app/dist/page.html. Usage: node experiments/same-score-v2.mjs
import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = fileURLToPath(new URL('../', import.meta.url)), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const PROBE = `(()=>{ const E=META.events.events, teams=[]; for(const e of E) for(const t of e.top||[]) if(t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n))) teams.push(t.mons.map(m=>m.n));
  const pick=teams.filter((_,i)=>i%Math.max(1,Math.floor(teams.length/40))===0).slice(0,40), out=[];
  for(const tm of [...pick, ...pick.slice(0,8).map(t=>t.slice(0,4))]){ S.slots=[...tm,'','','','','',''].slice(0,6).map(n=>({n,a:null,lock:false})); S.slots=normSlots(S.slots);
    const ms=members(); let why=""; try{const m2=typeof assignItems==="function"?assignItems(ms):ms; THR.teamReport(m2)}catch(e){why=String(e.message)} const RD=prepOf(ms), st=ms.length===6?CH.strengthOf(ms,RD?RD.score:null):CH.partialOf(ms);
    out.push([tm.join("/")+(why?" !"+why:""), st?Math.round(st.ss*10)/10:null, st?CH.wordOf(st.ss):null, ms.length===6?JSON.stringify(CH.sureOf(ms,st&&st.six)):null, RD?RD.score:null, JSON.stringify(CH.hand(RD))]); }
  return out; })()`;
const b = await chromium.launch(), res = {};
for (const [k, f, pre] of [['today', 'app/dist/page.html', true], ['v2', 'app/dist/v2.html', false]]) {
  const page = ROOT + `app/ss-${k}-${process.pid}.html`; let src = fs.readFileSync(ROOT + f, 'utf8');
  if (pre) src = '<!doctype html><meta charset="utf-8">' + src.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);');
  fs.writeFileSync(page, src); const p = await b.newPage();
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto(pathToFileURL(page).href + (pre ? '' : '#guide')); await p.waitForTimeout(3500);
  try { res[k] = await p.evaluate(c => window.__ev(c), PROBE); } catch (e) { console.log(k, 'failed:', e.message.split('\n')[0]); res[k] = []; }
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
res.today.forEach((r, i) => { if (JSON.stringify(r) === JSON.stringify(res.v2[i])) same++; else diff.push([r, res.v2[i]]); });
console.log(`${res.today.length} teams: ${same} the same in the rebuild, ${diff.length} different; scored ${res.today.filter(r => r[1] != null).length}`);
diff.slice(0, 4).forEach(([a, c]) => console.log('  today', JSON.stringify(a), '\n  v2   ', JSON.stringify(c)));
process.exit(diff.length || !res.today.length ? 1 : 0);
