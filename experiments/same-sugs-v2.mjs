// The rebuild's My Team suggestions must match today's page: for real tournament teams (some with a slot changed so there is
// something to fix), the suggestions shown, in order, with each one's Strength Score change. Usage: node experiments/same-sugs-v2.mjs
// WHY=1 also compares each one's Why? reasons, weak-spot change and kind line (R4, Nov 11).
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('..', import.meta.url).pathname, rd = f => { try { return JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const N = +(process.env.N || 25);
const PICK = `(()=>{const E=META.events.events,t=[];for(const e of E)for(const x of e.top||[])if(x.mons&&x.mons.length===6&&x.mons.every(m=>byName.get(m.n)))t.push(x.mons.map(m=>m.n));
  const p=t.filter((_,i)=>i%Math.max(1,Math.floor(t.length/${N}))===0).slice(0,${N});
  // every third team gets a weak slot (Gyarados) so there is something to suggest
  return JSON.stringify(p.map((x,i)=>i%3===1?[...x.slice(0,5),x.includes('Gyarados')?'Pelipper':'Gyarados']:x))})()`;
const SHOW = `JSON.stringify((ui.planList||[]).slice(0,3).map(pl=>{const g0=gradeTeam(members()),g1=planGrade(pl);return pl.ch.map(x=>(x.out?x.out.p.n:'+')+'>'+x.c.p.n).join('&')+' '+(g0!=null&&g1!=null?CH.gradeMove(g0,g1):'')+(process.env.WHY?' | why: '+(pl._why||[]).join(' / ')+' | weak: '+(pl._wk||[]).join(' > ')+' | kind: '+LANE.line(pl):'')}))`.replace('process.env.WHY', process.env.WHY ? 'true' : 'false');
const b = await chromium.launch(), out = {}; let teams = null;
for (const [k, f, pre] of [['today', 'app/dist/page.html', true], ['v2', 'app/dist/v2.html', false]]) {
  const page = ROOT + `app/ssg-${k}-${process.pid}.html`; let src = fs.readFileSync(ROOT + f, 'utf8');
  if (pre) src = '<!doctype html><meta charset="utf-8">' + src.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);');
  fs.writeFileSync(page, src); const p = await b.newPage({viewport: {width: 1440, height: 900}});
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto('file://' + page + (pre ? '' : '#team')); await p.waitForTimeout(4000);
  if (!teams) teams = JSON.parse(await p.evaluate(c => window.__ev(c), PICK));
  out[k] = [];
  for (const t of teams) {
    await p.evaluate(([t, pre]) => window.__ev(`S.slots=normSlots(${JSON.stringify(t)}.map(n=>({n,a:null,lock:false})));${pre ? "setView('report',false);" : ''}render()`), [t, pre]);
    for (let i = 0; i < 400; i++) { await p.waitForTimeout(150); if (await p.evaluate(pre => window.__ev(pre ? "!planJob&&planCache.key===planKeyOf($('useAbil').checked)&&!ckWin.busy&&!!ckWin.rates" : "!V2.plan.job&&V2.plan.key===V2.planKey()&&!ckWin.busy&&!!ckWin.rates"), pre)) break; }
    await p.evaluate(pre => window.__ev(pre ? 'render()' : 'V2.redraw()'), pre); await p.waitForTimeout(100);
    out[k].push(await p.evaluate(c => window.__ev(c), SHOW));
  }
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0, withSugs = 0; const diff = [];
teams.forEach((t, i) => { if (out.today[i] !== '[]') withSugs++; if (out.today[i] === out.v2[i]) same++; else diff.push([t.join('/'), out.today[i], out.v2[i]]); });
console.log(`${teams.length} teams: ${same} show the same suggestions in the rebuild, ${diff.length} different (${withSugs} have suggestions)`);
if (process.env.WHY) console.log('  sample (rebuild): ' + (out.v2.find(x => x !== '[]') || '').slice(0, 400));
for (const [t, a, c] of diff.slice(0, 4)) { let j = 0; while (j < a.length && a[j] === c[j]) j++; if (j > 300) console.log('  first difference at character ' + j + ':\n    today …' + a.slice(j - 120, j + 200) + '\n    v2    …' + c.slice(j - 120, j + 200)); }
diff.slice(0, 4).forEach(([t, a, c]) => console.log('  ' + t + '\n    today ' + a + '\n    v2    ' + c));
process.exit(diff.length ? 1 : 0);
