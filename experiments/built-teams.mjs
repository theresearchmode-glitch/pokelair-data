// Deep Check d3-built (Nov 8): put the teams OUR TOOLS make (Build for Me, suggestions) through tests the grade does not decide,
// side by side with real top-cut teams (out/teams.json). Read-only: uses the built page (app/dist/page.html), never rebuilds.
// Usage: node experiments/built-teams.mjs <simbox.json> <outdir>
// Every team, built or real, is read the same way: typed in as six names, so each gets its most common tournament set (members()).
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const BOXF = process.argv[2], DIR = process.argv[3] || '/tmp/built'; fs.mkdirSync(DIR, {recursive: true});
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': process.env.GRADE_MODEL ? JSON.parse(fs.readFileSync(process.env.GRADE_MODEL, 'utf8')) : rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const MODEL = process.env.GRADE_MODEL ? JSON.parse(fs.readFileSync(process.env.GRADE_MODEL, 'utf8')) : rd('model.json'), MT = rd('matches.json'), TOP = rd('teams.json').teams, REP = rd('replays.json').games;
const BOX = JSON.parse(fs.readFileSync(BOXF, 'utf8')).b;

// ---------- independent data (not the grade): real teams, pairs, games ----------
const base = n => n.replace(/-Mega.*$/, '');
const teamsArr = MT.teams.map(k => k.split('|'));
const tGames = new Map(); // team idx -> [games, wins] (draws/ mirrors dropped, like model.mjs)
for (const g of MT.m) { if (g[2] === .5 || g[0] === g[1]) continue; for (const [t, w] of [[g[0], g[2]], [g[1], 1 - g[2]]]) { const a = tGames.get(t) || [0, 0]; a[0]++; a[1] += w; tGames.set(t, a); } }
const pairCnt = new Map(); const pk = (a, b) => a < b ? a + '|' + b : b + '|' + a;
for (const t of teamsArr) for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = pk(t[i], t[j]); pairCnt.set(k, (pairCnt.get(k) || 0) + 1); }
const exactIdx = new Map(teamsArr.map((t, i) => [t.slice().sort().join('|'), i]));
const baseSets = teamsArr.map(t => new Set(t.map(base)));
const tested = new Set(MODEL.tested);
// species bring rate in ladder replays (brought / on the team): a slot real players rarely bring is a dead slot
const onT = new Map(), brT = new Map();
for (const g of REP) for (let s = 0; s < 2; s++) { if (!g.p || !g.b) continue; const br = new Set(g.b[s].map(base)); for (const n of g.p[s]) { const b = base(n); onT.set(b, (onT.get(b) || 0) + 1); if (br.has(b)) brT.set(b, (brT.get(b) || 0) + 1); } }
const bring = n => { const b = base(n), o = onT.get(b) || 0; return o >= 30 ? (brT.get(b) || 0) / o : null; };
function realness(names) {
  const key = names.slice().sort().join('|'), self = exactIdx.has(key) ? exactIdx.get(key) : -1;
  let pairsT = 0, pairs15 = 0, pairsRare = 0, minPair = 1e9;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = pk(names[i], names[j]); let c = pairCnt.get(k) || 0; if (self >= 0) c--; // leave the team itself out
    if (tested.has(k)) pairsT++; if (c >= 15) pairs15++; if (c < 3) pairsRare++; minPair = Math.min(minPair, c); }
  const bs = new Set(names.map(base)); let nb = 0, ng = 0, nw = 0;
  for (let i = 0; i < baseSets.length; i++) { if (i === self) continue; let s = 0; for (const b of bs) if (baseSets[i].has(b)) s++; if (s >= 5) { nb++; const r = tGames.get(i); if (r) { ng += r[0]; nw += r[1]; } } }
  const ex = self >= 0 ? tGames.get(self) || [0, 0] : null;
  const br = names.map(bring).filter(x => x != null);
  return {pairsT, pairs15, pairsRare, minPair, nb, ng, nwr: ng ? nw / ng : null, exG: ex ? ex[0] : 0, exWr: ex && ex[0] ? ex[1] / ex[0] : null,
    lowBring: names.filter(n => { const b = bring(n); return b != null && b < .5; }).length, minBring: br.length ? Math.min(...br) : null};
}

// ---------- the page ----------
const page = ROOT + `app/built-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const ev = async c => JSON.parse(await pg.evaluate(c => window.__ev(c), c));
// helpers defined inside the page once
await pg.evaluate(c => window.__ev(c), `window.__T={
 PRI:new Set(['Sucker Punch','Extreme Speed','Aqua Jet','Grassy Glide','Bullet Punch','Ice Shard','Shadow Sneak','Mach Punch','Quick Attack','Vacuum Wave','Jet Punch','First Impression','Accelerock','Thunderclap']),
 setTeam(names){S.slots=names.map(n=>({n,a:null,lock:false}));fixSlots();return members()},
 measure(names){const ms=__T.setTeam(names);if(ms.length!==6)return {err:'only '+ms.length};const SPREAD=new Set(Object.values(MV).filter(m=>m&&m.spread&&m.cat!=='Status').map(m=>m.name));
  const mv=ms.map(m=>(m.moves||[]).map(z=>z&&(z.name||z)).filter(Boolean)),has=n=>mv.some(L=>L.includes(n)),cnt=n=>mv.filter(L=>L.includes(n)).length;
  const wx=ms.filter(m=>WEATHER_OF[m.ability]).map(m=>m.d);const ck=proChecks(ms,true);const fails=ck.items.filter(x=>!x.skip&&!x.ok).map(x=>x.k);
  const g=gradeTeam(ms),G=(()=>{try{const RD=THR.teamReport(ms);return CH.gradeOf(RD,ck,ms)}catch(e){return null}})();
  const xs=strengthX(names,ms),M=META.model,k=testedPairs(names),chCr=k==null||!M.supK?1:.75+.25*Math.min(1,k/M.supK);
  const roles=ms.map(m=>{try{return monRole(m)}catch(e){return '?'}});
  const supportMv=['Tailwind','Trick Room','Fake Out','Follow Me','Rage Powder','Wide Guard','Icy Wind','Electroweb','Thunder Wave','Spore','Will-O-Wisp','Parting Shot','Snarl','Helping Hand','Reflect','Light Screen','Encore','Taunt','Haze','Coaching','Pollen Puff','Life Dew','Yawn','Sleep Powder','Hypnosis','Quash','Ally Switch','Rain Dance','Sunny Day','Sandstorm','Snowscape','Perish Song'];
  const noJob=ms.filter((m,i)=>roles[i]==='Attacker'&&!mv[i].some(n=>supportMv.includes(n))&&m.ability!=='Intimidate'&&!mv[i].some(n=>SPREAD.has(n))&&!m.p.m).map(m=>m.d);
  return {names,disp:ms.map(m=>m.d),items:ms.map(m=>m.heldItem||m.item||''),abil:ms.map(m=>m.ability),moves:mv,roles,
   g,e:G&&G.e,pct0:G&&G.pct0,six:G&&G.six,rec:G&&G.rec?G.rec.g:0,mixCredit:mixCredit(names),chCredit:chCr,tested:k,struct:+xs.sc.c.toFixed(2),structMiss:xs.sc.miss,x0:xs.x0,
   pass:ck.pass,n:ck.n,fails,megas:ms.filter(m=>m.p.m).length,
   tw:has('Tailwind')?1:0,tr:has('Trick Room')?1:0,icy:has('Icy Wind')||has('Electroweb')?1:0,prio:mv.some(L=>L.some(n=>__T.PRI.has(n)))?1:0,
   fake:cnt('Fake Out'),intim:ms.filter(m=>m.ability==='Intimidate').length,redir:has('Follow Me')||has('Rage Powder')?1:0,protect:cnt('Protect')+cnt('Detect')+cnt('Spiky Shield')+cnt('King\\'s Shield')+cnt('Silk Trap')+cnt('Baneful Bunker')+cnt('Burning Bulwark'),
   spread:mv.filter(L=>L.some(n=>SPREAD.has(n))).length,wx,wideG:has('Wide Guard')?1:0,scarf:ms.filter(m=>/Choice Scarf/.test(m.heldItem||m.item||'')).length,
   phys:ms.filter(m=>m.p.st&&m.p.st[1]>m.p.st[3]).length,noJob,itemProb:(()=>{try{return itemProblems(ms).map(x=>x.why)}catch(e){return []}})()}},
 plans(names,pool){const ms=__T.setTeam(names);ui.pool=pool;const P=planFixes(ms,suggestPool(),true);const top=P.slice(0,3).map(pl=>({names:pl.team.map(m=>m.p.n),ch:pl.ch.map(x=>(x.out?x.out.p.n:'(empty)')+' -> '+x.c.p.n),g:pl._g}));
  return {n:P.length,top,gBase:P.gBase,tsOn:P.tsOn,gapNote:P.gapNote||null,moreN:(P.more||[]).length}}
};'1'`);

// ---------- 1. generate ----------
const gen = [];
for (const src of ['box', 'all']) for (const mg of [0, 1, 2]) for (const v of [false, true]) {
  const r = await ev(`(()=>{S.box=${JSON.stringify(BOX)};ui.abSrc='${src}';ui.abLock=null;AB_GRADE_V2=${v};abYMemo.clear();S.megaGoal=${mg};S.maxMega=Math.max(1,${mg});const t0=performance.now();const res=buildBest();
    return JSON.stringify({ms:Math.round(performance.now()-t0),teams:(res.teams||[]).map(t=>({names:t.mons.map(m=>m.n),proven:t.proven||null,offBox:t.mons.filter(m=>!m.box).map(m=>m.n)}))})})()`);
  r.teams.forEach((t, i) => gen.push({tool: 'build', src, mg, engine: v ? 'v2' : 'old', rank: i + 1, ...t}));
  console.error(`build ${src} ${mg}M ${v ? 'v2' : 'old'}: ${r.teams.length} teams, ${r.ms} ms`);
}
await ev(`(()=>{AB_GRADE_V2=false;S.megaGoal=2;S.maxMega=2;return '1'})()`);
// suggestions on 10 real top-cut teams (spread over the list), whole roster
const pick = [...Array(10)].map((_, i) => TOP[Math.floor(i * TOP.length / 10)]);
const sugBase = [];
for (const t of pick) { const P = await ev(`JSON.stringify(__T.plans(${JSON.stringify(t.mons)},'all'))`); sugBase.push({from: t.mons, P});
  P.top.forEach((pl, i) => gen.push({tool: 'suggest', src: 'all', from: t.mons, rank: i + 1, names: pl.names, ch: pl.ch, gPlan: pl.g}));
  console.error(`suggest on ${t.mons.join(',')}: ${P.n} plans`); }

// ---------- 2. measure everything ----------
const meas = async names => ({...(await ev(`JSON.stringify(__T.measure(${JSON.stringify(names)}))`)), ...realness(names)});
for (const t of gen) Object.assign(t, await meas(t.names), {names: t.names});
const real = []; for (const t of TOP) real.push({tool: 'real', player: t.player, record: t.record, event: t.event, ...(await meas(t.mons))});
for (const s of sugBase) s.M = await meas(s.from);
// suggestions on every built team (box teams with the box pool, the way Sim met the bug) and on the real ones:
// does at least one of the top 3 plans fix each unmet check, and is there any plan at all?
const sugCheck = async (t, pool) => { if (!t.fails || !t.fails.length) return null; const P = await ev(`(()=>{S.box=${JSON.stringify(BOX)};return JSON.stringify(__T.plans(${JSON.stringify(t.names)},'${pool}'))})()`);
  const fixed = {}; for (const f of t.fails) fixed[f] = false;
  for (const pl of P.top) { const m = await ev(`JSON.stringify(__T.measure(${JSON.stringify(pl.names)}))`); for (const f of t.fails) if (!m.fails.includes(f)) fixed[f] = true; }
  return {nPlans: P.n, gBase: P.gBase, gapNote: P.gapNote, fixed, unfixed: Object.keys(fixed).filter(k => !fixed[k]), top: P.top}; };
for (const t of gen.filter(t => t.tool === 'build')) t.sug = await sugCheck(t, t.src === 'box' ? 'box' : 'all');
for (const t of real) t.sug = await sugCheck(t, 'all');
await b.close(); fs.unlinkSync(page);
fs.writeFileSync(DIR + '/teams.json', JSON.stringify({gen, real, sugBase}, null, 1));

// ---------- 3. compare ----------
const avg = (A, f) => { const v = A.map(f).filter(x => x != null && isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const share = (A, f) => A.length ? A.filter(f).length / A.length : null;
const uniq = A => { const s = new Set(); return A.filter(t => { const k = t.names.slice().sort().join('|'); if (s.has(k)) return false; s.add(k); return true; }); };
const groups = {'real top cut': real, 'Build: box, old': uniq(gen.filter(t => t.tool === 'build' && t.src === 'box' && t.engine === 'old')), 'Build: box, v2': uniq(gen.filter(t => t.tool === 'build' && t.src === 'box' && t.engine === 'v2')),
  'Build: all, old': uniq(gen.filter(t => t.tool === 'build' && t.src === 'all' && t.engine === 'old')), 'Build: all, v2': uniq(gen.filter(t => t.tool === 'build' && t.src === 'all' && t.engine === 'v2')), 'Suggestions (top 3)': uniq(gen.filter(t => t.tool === 'suggest'))};
const f1 = x => x == null ? '—' : x.toFixed(1), pc = x => x == null ? '—' : Math.round(x * 100) + '%';
const rows = [
  ['teams', A => A.length], ['grade', A => f1(avg(A, t => t.g))], ['exact six in data (share)', A => pc(share(A, t => t.exG > 0))],
  ['tested pairs (model, of 15)', A => f1(avg(A, t => t.tested))], ['pairs on 15+ real teams (own count)', A => f1(avg(A, t => t.pairs15))], ['pairs on <3 real teams', A => f1(avg(A, t => t.pairsRare))],
  ['has a 5-of-6 real neighbour', A => pc(share(A, t => t.nb > 0))], ['neighbours: real win rate', A => pc(avg(A.filter(t => t.ng >= 30), t => t.nwr))],
  ['grade says (expected win %)', A => f1(avg(A.filter(t => t.ng >= 30), t => t.e))], ['Megas', A => f1(avg(A, t => t.megas))], ['no Mega', A => pc(share(A, t => t.megas === 0))],
  ['Tailwind or Trick Room', A => pc(share(A, t => t.tw || t.tr))], ['Tailwind AND Trick Room', A => pc(share(A, t => t.tw && t.tr))], ['Fake Out users', A => f1(avg(A, t => t.fake))], ['Intimidate', A => pc(share(A, t => t.intim > 0))],
  ['redirection', A => pc(share(A, t => t.redir))], ['Protect count', A => f1(avg(A, t => t.protect))], ['Protect on 4+', A => pc(share(A, t => t.protect >= 4))], ['spread users', A => f1(avg(A, t => t.spread))],
  ['2+ weather setters', A => pc(share(A, t => t.wx.length > 1))], ['5+ physical', A => pc(share(A, t => t.phys >= 5))], ['no-job Pokémon', A => f1(avg(A, t => t.noJob.length))], ['rarely-brought (<50% ladder)', A => f1(avg(A, t => t.lowBring))],
  ['checks passed', A => f1(avg(A, t => t.pass)) + '/' + f1(avg(A, t => t.n))], ['all checks pass', A => pc(share(A, t => !t.fails.length))], ['mixCredit', A => f1(avg(A, t => t.mixCredit))], ['grade credit (CH)', A => f1(avg(A, t => t.chCredit))], ['structCredit', A => f1(avg(A, t => t.struct))],
  ['unmet check w/o fix offered', A => { const s = A.filter(t => t.sug); return s.length ? `${s.filter(t => t.sug.unfixed.length).length}/${s.length}` : '—'; }], ['… with NO plan at all', A => { const s = A.filter(t => t.sug); return s.length ? `${s.filter(t => !t.sug.nPlans).length}/${s.length}` : '—'; }]];
const G = Object.entries(groups); let rep = '| measure | ' + G.map(g => g[0]).join(' | ') + ' |\n|' + '---|'.repeat(G.length + 1) + '\n';
for (const [k, f] of rows) rep += `| ${k} | ` + G.map(([, A]) => f(A)).join(' | ') + ' |\n';
// optimizer's curse: on teams with a 30+ game real neighbourhood, grade's expected win % minus the neighbours' real win %
rep += '\nGrade minus reality (teams whose 5-of-6 neighbours have 30+ games): expected win% − neighbours\' real win%\n';
for (const [k, A] of G) { const s = A.filter(t => t.ng >= 30 && t.e != null); rep += `  ${k}: n=${s.length}, mean gap ${f1(avg(s, t => t.e - t.nwr * 100))} pts\n`; }
// within all teams: is the grade highest where the team is least real?
const all = [...real, ...uniq(gen)]; const corr = (A, fx, fy) => { const P = A.map(t => [fx(t), fy(t)]).filter(p => p.every(v => v != null && isFinite(v))); const n = P.length, mx = P.reduce((s, p) => s + p[0], 0) / n, my = P.reduce((s, p) => s + p[1], 0) / n;
  let a = 0, bx = 0, by = 0; for (const [x, y] of P) { a += (x - mx) * (y - my); bx += (x - mx) ** 2; by += (y - my) ** 2; } return {r: a / Math.sqrt(bx * by), n}; };
const genU = uniq(gen);
rep += `\nBuilt teams: corr(grade, rare pairs) = ${corr(genU, t => t.g, t => t.pairsRare).r.toFixed(2)} (n=${genU.length}); corr(grade, tested pairs) = ${corr(genU, t => t.g, t => t.tested).r.toFixed(2)}\n`;
rep += `Real teams: corr(grade, rare pairs) = ${corr(real, t => t.g, t => t.pairsRare).r.toFixed(2)}; corr(grade, neighbour real wr) = ${corr(real.filter(t => t.ng >= 30), t => t.g, t => t.nwr).r.toFixed(2)}\n`;
rep += `All: corr(grade − neighbour wr gap, rare pairs) = ${corr(all.filter(t => t.ng >= 30 && t.e != null), t => t.e - t.nwr * 100, t => t.pairsRare).r.toFixed(2)} (n=${all.filter(t => t.ng >= 30).length})\n`;
rep += '\n## Every built / suggested team\n';
for (const t of uniq(gen)) rep += `- [${t.tool} ${t.src}${t.mg != null ? ' ' + t.mg + 'M' : ''}${t.engine ? ' ' + t.engine : ''} #${t.rank}${t.ch ? ' ' + t.ch.join('; ') : ''}] ${t.names.join(', ')} | grade ${f1(t.g)} (e ${f1(t.e)}%) | ${t.pass}/${t.n}${t.fails.length ? ' fails ' + t.fails.join(',') : ''} | Megas ${t.megas} | TW${t.tw} TR${t.tr} FO${t.fake} Int${t.intim} Rd${t.redir} Pr${t.protect} Sp${t.spread} wx[${t.wx.join(',')}] | noJob[${t.noJob.join(',')}] | tested ${t.tested}/15, rare ${t.pairsRare}, minPair ${t.minPair}, exact ${t.exG}g${t.exWr != null ? ' ' + pc(t.exWr) : ''}, nb ${t.nb} (${t.ng}g ${pc(t.nwr)}) | mix ${t.mixCredit.toFixed(2)} ch ${t.chCredit.toFixed(2)} struct ${t.struct} | items ${t.items.join('/')}${t.sug ? ` | sug: ${t.sug.nPlans} plans, unfixed [${t.sug.unfixed.join(',')}]${t.sug.gapNote ? ' note: ' + t.sug.gapNote : ''}` : ''}\n`;
rep += '\n## Real teams with unmet checks and no fix offered\n';
for (const t of real.filter(t => t.sug && t.sug.unfixed.length)) rep += `- ${t.names.join(', ')} | grade ${f1(t.g)} | fails ${t.fails.join(',')} | ${t.sug.nPlans} plans, unfixed ${t.sug.unfixed.join(',')}\n`;
fs.writeFileSync(DIR + '/report.md', rep); console.log(rep);
