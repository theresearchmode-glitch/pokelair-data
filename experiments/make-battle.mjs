// Battle mock-up (R2): "Battle a team", their six in, your four, the leads and turn 1 out -> docs/rebuild/mocks/out/battle.html + PNGs.
// Every number is read from today's site through the test harness (frozen data, app/test/behaviour/fixture), with the sample
// team below and the opponent loaded the way a player does it: Home > "Prep vs the Champion" (the latest winner's six).
// The page DOM gives the plan, turn one, real games, watch out, speed order and the damage grid; the Deeper read (archetype notes,
// their threats, the 6 x 6 grid) comes from the same functions the site's Deeper read fold calls (planMatchup, archMatchup).
// No player names (CLAUDE.md): the event's organiser handle and the player are left out, as on the Home mock.
import fs from 'node:fs'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
import {open, closeAll} from '../app/test/behaviour/harness.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), MOCKS = ROOT + 'docs/rebuild/mocks/', OUT = MOCKS + 'out/';
const helpers = fs.readFileSync(ROOT + 'app/src/app/15-visual-helpers.js', 'utf8'), i0 = helpers.indexOf('SPRITE_ID =');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(ROOT + 'app/src/data/logos.js', 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const ART = {}; const art = n => { if (ART[n]) return ART[n]; const id = SPRITE_ID[n]; const f = ROOT + `docs/rebuild/art/up1024/${id}.webp`; if (!id || !fs.existsSync(f)) throw new Error('no art for ' + n); return (ART[n] = 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64')); };
const TEAM = ['Garchomp', 'Sneasler', 'Charizard-Mega-Y', 'Whimsicott', 'Basculegion', 'Kingambit'];

const {ui, pg, close} = await open({team: TEAM, width: 1440});
await ui.go('home', 1500);
if (!await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => e.getClientRects().length && /Prep vs the Champion/i.test(e.innerText)); if (b) b.click(); return !!b; })) throw new Error('no "Prep vs the Champion" on Home');
await pg.waitForTimeout(2000);
if (await ui.current() !== 'matchup') throw new Error('Battle did not open');
const R = JSON.parse(await pg.evaluate(() => { const P = document.querySelector('[data-pane="matchup"]'), T = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : '';
  const q = s => P.querySelector(s), qa = s => [...P.querySelectorAll(s)];
  // watch out rows (fold content is in the DOM even when closed)
  const watch = qa('[data-chf="bmwatch"] .bmw').map(w => ({n: T(w.querySelector('b')), tags: [...w.querySelectorAll('.bmwl')].map(l => ({t: T(l.querySelector('.sev')), sev: (l.querySelector('.sev').className.match(/\b(hi|mid|lo|ok)\b/) || [])[1] || 'lo', d: T(l.querySelector('.t2'))}))}));
  const watchSub = T(q('[data-chf="bmwatch"] .chs'));
  const speed = qa('.bmsr').map(e => ({me: e.classList.contains('me'), t: T(e)}));
  const prio = T(qa('p,div').find(e => /^Moves that skip the Speed order/.test(T(e)) && e.children.length < 3));
  const cells = qa('[title]').map(e => e.getAttribute('title')).filter(t => / of HP/.test(t));
  const W = r => { const o = []; const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) { const p = n.parentElement; if (!p || p.closest('select,option,script,style')) continue; o.push(n.nodeValue); } return o.join(' ').replace(/\s+/g, ' ').trim(); };
  return JSON.stringify({all: W(P), watch, watchSub, speed, prio, cells}); }));
const peek = JSON.parse(await ui.peek(`(()=>{const mine=members(),theirs=S.opp.map(n=>byName.get(n)).filter(Boolean).map(oppMember);const r=planMatchup(mine,theirs,$('useAbil').checked);
  const notes=archMatchup(r.A,r.B,mine),ll=likelyLead(theirs,r.B);
  const threats=theirs.map((o,j)=>{const hit=r.chosen.filter(i=>r.h.def[i][j]&&r.h.def[i][j].x>=2);const ans=r.chosen.filter(i=>r.h.M[i][j]>=1);return {o:o.d,hit:hit.map(i=>mine[i].d),ans:ans.map(i=>mine[i].d),move:hit.length?r.h.def[hit[0]][j].e.move:''};}).filter(t=>t.hit.length>=2||(t.hit.length&&!t.ans.length)).sort((a,b)=>b.hit.length-a.hit.length).slice(0,4);
  const ev=(META.events.events||[]).find(e=>(e.top||[]).some(t=>t.mons.map(m=>m.n).sort().join('|')===S.opp.slice().sort().join('|')));
  return JSON.stringify({A:r.A.label,B:r.B.label,notes,ll:ll.map(x=>x.d),threats,M:r.h.M,mine:mine.map((m,i)=>({n:(m.p&&m.p.n)||S.slots.filter(s=>s.n)[i].n,d:m.d})),theirs:theirs.map((m,j)=>({n:S.opp[j],d:m.d})),
    nTeams:META.teams.teams.length,recent:Math.max(0,(S.recentOpp||[]).filter(x=>x.slice().sort().join('|')!==S.opp.slice().sort().join('|')).length),log:S.log.length,
    ev:ev?{name:ev.name,date:ev.date,players:ev.players,top:ev.top.find(t=>t.mons.map(m=>m.n).sort().join('|')===S.opp.slice().sort().join('|'))}:null,
    mineSets:sdResolve('mine').text})})()`));
// the other Battle tools' own counts, read from their pages
await ui.go('gauntlet', 2500); const gTxt = await ui.text();
await ui.go('practice', 1500); const pTxt = await ui.text();
await ui.go('speed', 1500); const sTxt = await ui.text();
await close(); await closeAll();

const A = R.all, need = (re, what) => { const m = A.match(re); if (!m) throw new Error('could not read ' + what); return m; };
// ---------- the plan ----------
const lead = need(/Bring These Four\. Lead the Pair\. Lead (.+?) Lead (.+?) Lead Back (.+?) Back (.+?) Back Leave home: (.+?), (.+?) Tested/, 'bring four');
const leadNote = need(/(Tested on [\d,]+ ladder games: [^.]+\.)/, 'lead note')[1];
const real = need(/From real games ([\d,]+) tournament games (Favoured|Even match|Unfavoured)( so far)? (.+?) Who moves first/, 'real games');
const pairs = [...real[4].matchAll(/(Hurts you|Helps you) Your (.+?) vs their (.+?)(?= Hurts you| Helps you|$)/g)].map(m => ({kind: m[1], mine: m[2], theirs: m[3]}));
const threat = need(/Biggest threat (.+?) (Tailwind|Trick Room|[A-Z][\w ]+?) (\d+) Fake Out on their side/, 'the read');
const t1 = need(/Turn one, in move order your (.+?) \+ (.+?) vs their likely (.+?) \+ (.+?) 1 (.+?) Watch (.+?) Field on turn 1 (.+?) From real games/, 'turn one');
const steps = t1[5].split(/ \d (?=You:|Them:)/).map(s => { const m = s.match(/^(You|Them): (.+?) (\d+) Speed(?:, ([+−-]\d))? (.+?) ((?:its|KOs|up to|does|hits|holds|Sash|\d).+)$/); if (!m) throw new Error('turn step ' + s); return {side: m[1], d: m[2], spe: +m[3], prio: m[4] || '', move: m[5], why: m[6]}; });
const field = t1[7].trim();
// ---------- speed order (both sides), damage grid from the cell titles ----------
const speed = R.speed.map(s => { const m = s.t.match(/^(.+?)( Tie)? (\d+)( Scarf)?( → (\d+) after item)?$/); if (!m) throw new Error('speed ' + s.t); return {me: s.me, d: m[1], tie: !!m[2], spe: +m[3], scarf: !!m[4], after: m[6] ? +m[6] : null}; });
const ko = s => { if (/Focus Sash holds/.test(s)) return {k: 'Sash holds', lv: 1}; let m = s.match(/Guaranteed (\d|O)HKO/); if (m) return {k: (m[1] === 'O' ? 'O' : m[1]) + 'HKO', lv: m[1] === 'O' ? 1 : +m[1]};
  m = s.match(/(\d+)% chance to (\d|O)HKO/); if (m) return {k: (m[2] === 'O' ? 'O' : m[2]) + 'HKO ' + m[1] + '%', lv: m[2] === 'O' ? 1 : +m[2]}; m = s.match(/(\d)HKO or worse/); if (m) return {k: m[1] + 'HKO+', lv: +m[1]}; return {k: '', lv: 9}; };
const four = [lead[1], lead[2], lead[3], lead[4]];
const grid = four.map((d, i) => peek.theirs.map((o, j) => { const t = R.cells[i * 6 + j]; const [a, b] = t.split('; ');
  const pa = a.match(/^(.+?): (\d+)–(\d+)% of HP, (.+)$/), pb = b.match(/^(.+?): (\d+)–(\d+)% of HP, (.+)$/);
  if (!pa || !pb || !pa[1].startsWith(d + ' ') || !pb[1].startsWith(o.d + ' ')) throw new Error('grid cell ' + t);
  pa[1] = pa[1].slice(d.length + 1); pb[1] = pb[1].slice(o.d.length + 1);
  return {you: {pct: +pa[3], lo: +pa[2], move: pa[1], ...ko(pa[4])}, them: {pct: +pb[3], lo: +pb[2], move: pb[1], ...ko(pb[4])}}; }));
// ---------- sets: their open team sheet (event) and your most common complete sets (Copy for Showdown text) ----------
const myItem = {}; peek.mineSets.split('\n\n').forEach(b => { const m = b.match(/^(\S+) @ (.+)$/m); if (m) myItem[m[1]] = m[2]; });
const sheet = peek.ev.top.mons;
const mon = (n, d, extra) => ({n, d, img: art(n), ...extra});
const theirs = peek.theirs.map((o, j) => mon(o.n, o.d, {item: sheet.find(m => m.n === o.n).i, lead: peek.ll.includes(o.d)}));
const base = d => d.replace(/^Mega (\w+).*/, '$1');
const mine = peek.mine.map(m => mon(m.n, m.d, {item: myItem[base(m.d)] || myItem[m.n], role: [lead[1], lead[2]].includes(m.d) ? 'Lead' : [lead[3], lead[4]].includes(m.d) ? 'Back' : 'Leave home'}));
if (mine.some(m => !m.item) || theirs.some(m => !m.item)) throw new Error('missing item');
const byD = d => [...mine, ...theirs].find(m => m.d === d);
const dt = new Date(peek.ev.date + 'T12:00:00Z'), MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const place = peek.ev.top.place, rec = (A.match(/The Champion went (\d+-\d+)/) || [])[1];
const g = gTxt.match(/(\d+) you're better prepared (\d+) about even (\d+) they're better prepared/), gN = (gTxt.match(/Showing \d+ of (\d+)/) || [])[1];
const D = {
  // event name without the organiser handle and the prize note (no-names rule; as on the Home mock)
  event: peek.ev.name.replace(/^.*?(Champions Arena #\d+).*$/, '$1'), date: `${MON[dt.getUTCMonth()]} ${dt.getUTCDate()}`, players: peek.ev.players, record: rec, place,
  sheetKicker: /Their real open team sheet/.test(A) ? 'Their real open team sheet' : 'Team preview',
  styleMine: peek.A.replace(' · ', ' '), styleTheirs: peek.B.replace(' · ', ' '),
  theirs, mine, four: four.map(byD), leadNote, real: {games: real[1], word: real[2], sofar: !!real[3], pairs},
  threat: {d: threat[1], why: threat[2], fake: +threat[3]},
  turn: {me: [t1[1], t1[2]], them: [t1[3], t1[4]], steps: steps.map(s => ({...s, img: byD(s.d).img})), watch: t1[6].trim(), field},
  watch: R.watch.map(w => ({...w, img: byD(w.n).img})), watchSub: R.watchSub,
  speed: speed.map(s => ({...s, img: byD(s.d).img})), prio: R.prio,
  grid, notes: peek.notes, threats: peek.threats, M: peek.M,
  nTeams: peek.nTeams, recent: peek.recent, log: peek.log,
  test: {n: +gN, better: +g[1], even: +g[2], worse: +g[3]}, practice: (pTxt.match(/From the Showdown ladder \((.+?)\)/) || [])[1],
  speedN: +(sTxt.match(/against the (\d+) most-used/) || [])[1],
  logo: sb.NP_SVG.hdrL, logoD: sb.NP_SVG.hdrD};
fs.writeFileSync(OUT + 'battle.html', fs.readFileSync(MOCKS + 'battle.tpl.html', 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(D) + ';'));
fs.copyFileSync(MOCKS + 'tokens.css', OUT + 'tokens.css');
console.log(JSON.stringify({...D, theirs: D.theirs.map(m => [m.d, m.item, m.lead]), mine: D.mine.map(m => [m.d, m.item, m.role]), four: D.four.map(m => m.d),
  turn: {...D.turn, steps: D.turn.steps.map(s => ({...s, img: 0}))}, watch: D.watch.map(w => ({...w, img: 0})), speed: D.speed.map(s => ({...s, img: 0})), grid: D.grid.map(r => r.map(c => `${c.you.pct}/${c.you.k}|${c.them.pct}/${c.them.k}`)), logo: 0, logoD: 0}, null, 1));
if (process.env.NOSHOT) process.exit(0);
const b = await chromium.launch();
for (const [layout, w, h] of [['desktop', 1440, 900], ['ipad', 820, 1180], ['phone', 390, 844]]) for (const theme of ['light', 'dusk']) {
  const p = await (await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2})).newPage(); p.on('pageerror', e => console.log('ERR', layout, theme, e.message));
  await p.goto('file://' + OUT + 'battle.html#' + theme); await p.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}); await p.waitForTimeout(500);
  await p.screenshot({path: OUT + `battle-${layout}-${theme}.png`, fullPage: true}); await p.close(); }
await b.close();
