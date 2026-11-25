// Rebuild R2 mock-ups: fills docs/rebuild/mocks/<page>.tpl.html with REAL data read from today's site (same numbers players see),
// the new upscaled art (docs/rebuild/art/up1024) and the logo, then renders desktop/phone x light/dusk screenshots.
// Usage: node experiments/make-mocks.mjs [mybox] [--dsf=2]   Output: docs/rebuild/mocks/out/<page>-<layout>-<theme>.png
import fs from 'node:fs'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
import {open, closeAll, DOCS} from '../app/test/behaviour/harness.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), MOCKS = ROOT + 'docs/rebuild/mocks/', OUT = MOCKS + 'out/';
const args = process.argv.slice(2), pages = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : ['mybox'];
const DSF = +((args.find(a => a.startsWith('--dsf=')) || '--dsf=1.5').slice(6));
fs.mkdirSync(OUT, {recursive: true});
const helpers = fs.readFileSync(ROOT + 'app/src/app/15-visual-helpers.js', 'utf8'), i0 = helpers.indexOf('SPRITE_ID =');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(ROOT + 'app/src/data/logos.js', 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const LOGO = sb.NP_SVG.hdrL, LOGO2 = LOGO.replace(/nphdrL/g, 'nphdrLx'), LOGOD = sb.NP_SVG.hdrD, LOGOD2 = LOGOD.replace(/nphdrD/g, 'nphdrDx');
const art = n => { const id = SPRITE_ID[n]; const f = ROOT + `docs/rebuild/art/up1024/${id}.webp`; if (!id || !fs.existsSync(f)) throw new Error('no art for ' + n); return 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64'); };

// the sample player: the concept's box of 36 and team (Sim's concept, Nov 10)
const BOX = ['Rotom-Wash', 'Glimmora', 'Tyranitar', 'Absol', 'Incineroar', 'Corviknight', 'Archaludon', 'Blastoise', 'Staraptor', 'Rillaboom', 'Pelipper', 'Meowscarada', 'Sylveon', 'Primarina', 'Salamence', 'Lucario', 'Hydreigon', 'Gardevoir', 'Kingambit', 'Dragonite', 'Mimikyu', 'Dragalge', 'Serperior', 'Swampert', 'Tinkaton', 'Greninja', 'Empoleon', 'Drampa', 'Whimsicott', 'Steelix', 'Azumarill', 'Gengar', 'Charizard', 'Basculegion', 'Garchomp', 'Sneasler'];
const TEAM = ['Garchomp', 'Sneasler', 'Charizard-Mega-Y', 'Whimsicott', 'Basculegion', 'Kingambit'];

// real numbers from today's site: shown rating (RS), tier, usage %, win rate, types, base Speed, roles, data date

// meta/perf as the morning refresh writes it (same as make-ratings.mjs / ratings-snapshot.mjs), so numbers match the live site's Nov 10 data
{ const PERF = JSON.parse(fs.readFileSync(ROOT + 'out/perf.json', 'utf8'));
  DOCS['meta/perf'] = Object.assign({adj: DOCS['meta/perf'] && DOCS['meta/perf'].adj}, PERF, {updated: (DOCS['meta/perf'] || {}).updated}); }
const {ui, close} = await open({team: TEAM, box: BOX});
const site = JSON.parse(await ui.peek(`JSON.stringify((()=>{
  const one=n=>{const p=byName.get(n);const r=rating(p);return {n,d:p.d,t:p.t,sp:p.sp,r:RS(r.total),tier:lTier(r.total).k+' tier',usage:r.usage,wr:r.wr};};
  const L=AR.lineup(members()),role=n=>L.lead.some(m=>m.p.n===n)?'Lead':L.back.some(m=>m.p.n===n)?'Back':'Bench';
  return {box:${JSON.stringify(BOX)}.map(one),team:${JSON.stringify(TEAM)}.map(n=>({...one(n),role:role(n)})),asOf:(typeof RES==='object'&&RES&&RES.updated)||''};})())`));
// My Team: what today's My Team shows for this team (same numbers and words players see)
await ui.go('My Team', 2500);
const mt = JSON.parse(await ui.peek(`JSON.stringify((()=>{
  const txt=[...document.querySelectorAll('[data-pane]')].find(e=>!e.hidden&&e.getClientRects().length).innerText.replace(/\\s+/g,' ');
  const nOf=d=>{for(const p of byName.values())if(p.d===d)return p.n;return d;};
  const nat=m=>{const d=document.createElement('div');d.innerHTML=AR.natCells(m);const t=d.innerText.replace(/\\s+/g,' ');return {nat:(t.match(/Nature\\s*([A-Z][a-z]+)/)||[])[1]||'',pts:(t.match(/Stat points\\s*(.+?)\\s*most run/)||[])[1]||''};};
  const six=members().map(m=>({n:m.p.n,item:m.item,ab:m.ability,moves:LANE.moves(m).length?m.moves.map(v=>({name:v.name,type:v.type})):[],...nat(m)}));
  const top=[...document.querySelectorAll('.chtl10 button')].slice(0,10).map(b=>{const t=b.innerText.replace(/\\s+/g,' ').trim();const m=t.match(/^\\d+\\s*(.+?)\\s*(Favoured|Even match|Unfavoured)\\s*Calc: (.+)$/);return m?{n:nOf(m[1]),d:m[1],real:m[2],calc:m[3]}:null;}).filter(Boolean);
  const sc=txt.match(/Strength Score (\\d+) (Top tier|Tournament ready|Solid|Needs work|Missing a basic) (Teams scoring like this[^.]*?tournament teams) (Top \\d+% of tournament teams)/);
  const mu=txt.match(/Matchups (\\d+) Favoured (\\d+) Even (\\d+) Unfavoured/), calc=txt.match(/No answer (\\d+), Shaky (\\d+), Handles it (\\d+), Beats it (\\d+)/);
  const opt=txt.match(/→ (.+?) for (\\w[\\w\\- ]*?)(±\\d+|[+−-]\\d+) \\((\\d+ → \\d+)\\)/);
  const sugg=(txt.match(/Nothing to fix\\. (.+?tune your sets\\.)/)||[])[1]||'';
  const checks=(proChecks(members(),true)||{items:[]}).items.map(x=>({label:x.label==='Ready for the top threats'?'Matchups covered':x.label,ok:!!x.ok,note:!!x.note}));
  const L=AR.lineup(members()),role=n=>L.lead.some(m=>m.p.n===n)?'Lead':L.back.some(m=>m.p.n===n)?'Back':'Bench';
  return {six:six.map(m=>({...m,role:role(m.n)})),top,score:sc?{s:+sc[1],band:sc[2],line:sc[3],rank:sc[4]}:null,mu:mu&&calc?{fav:+mu[1],even:+mu[2],unf:+mu[3],calc:{none:+calc[1],shaky:+calc[2],handles:+calc[3],beats:+calc[4]}}:null,
    opt:opt?{in:opt[1],out:opt[2],inN:nOf(opt[1]),outN:nOf(opt[2]),delta:opt[3]+' ('+opt[4]+')'}:null,sugg,checks};})())`));
console.log('myteam data:', JSON.stringify({score: mt.score, mu: mt.mu, opt: mt.opt, top: mt.top.length, six: mt.six.map(m => m.role + ':' + m.n + ':' + m.nat)}));
await close(); await closeAll();
const fmtDate = s => { const d = new Date(String(s).slice(0, 10) + 'T12:00:00Z'); return isNaN(d) ? '' : d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'}); };
const teamSet = new Set(TEAM.map(n => n.replace(/-Mega-[XY]$/, '').replace(/-Mega$/, '')));

const DATA = {
  myteam: () => { const ex = n => site.team.find(m => m.n === n) || site.box.find(m => m.n === n) || {};
    const six = mt.six.map(m => ({...ex(m.n), ...m, nat: String(m.nat).replace(/most$/, ''), d: ex(m.n).d || m.n, img: art(m.n)}));
    return {six, sel: six.findIndex(m => m.n === 'Garchomp'), partner: (six.find(m => m.role === 'Lead' && m.n !== 'Garchomp') || {}).d || '',
      style: 'Sun · Tailwind', score: mt.score, sugg: mt.sugg, checks: mt.checks,
      mu: {...mt.mu, top: mt.top.map(t => ({...t, img: art(t.n)}))},
      opt: {...mt.opt, inImg: art(mt.opt.inN), outImg: art(mt.opt.outN)}, logo: LOGO, logo2: LOGO2, logoD: LOGOD, logoD2: LOGOD2}; },
  mybox: () => { const box = site.box.map(m => ({...m, img: art(m.n), team: teamSet.has(m.n)})).sort((a, b) => a.d.localeCompare(b.d));
    const sel = {...box.find(m => m.n === 'Garchomp')};
    return {box, sel, team: site.team.map(m => ({d: m.d, role: m.role, img: art(m.n)})), sortBy: 'A–Z', asOf: fmtDate(site.asOf) || 'Nov 10', logo: LOGO, logo2: LOGO2, logoD: LOGOD, logoD2: LOGOD2}; },
};

const b = await chromium.launch();
for (const p of pages) {
  const D = DATA[p](), tpl = fs.readFileSync(MOCKS + p + '.tpl.html', 'utf8');
  const html = tpl.replace('/*DATA*/', 'const D=' + JSON.stringify(D) + ';'); const f = OUT + `${p}.html`; fs.writeFileSync(f, html); /* kept: scroll-speed checks open it (experiments/scroll-perf.mjs) */
  for (const x of ['tokens.css']) fs.copyFileSync(MOCKS + x, OUT + x);
  for (const [layout, w, h] of [['desktop', 1440, 900], ['phone', 390, 844]].filter(x => !process.env.LAYOUT || x[0] === process.env.LAYOUT)) for (const theme of (process.env.THEMES || 'dusk,light').split(',')) {
    const pg = await (await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', p, layout, theme, e.message));
    await pg.goto('file://' + f + '#' + theme); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}).catch(() => console.log('NOT READY', p, layout, theme));
    await pg.waitForTimeout(300);
    const sw = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.documentElement.scrollHeight]);
    const out = OUT + `${p}-${layout}-${theme.replace('-', '_')}.png`; await pg.screenshot({path: out, fullPage: true}); console.log(out.replace(ROOT, ''), sw.join(' '), sw[0] > sw[1] ? 'SIDEWAYS SCROLL' : '');
    await pg.context().close(); }
}
await b.close();
