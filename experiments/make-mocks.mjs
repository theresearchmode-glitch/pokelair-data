// Rebuild R2 mock-ups: fills docs/rebuild/mocks/<page>.tpl.html with REAL data read from today's site (same numbers players see),
// the new upscaled art (docs/rebuild/art/up1024) and the logo, then renders desktop/phone x light/dusk screenshots.
// Usage: node experiments/make-mocks.mjs [mybox] [--dsf=2]   Output: docs/rebuild/mocks/out/<page>-<layout>-<theme>.png
import fs from 'node:fs'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
import {open, closeAll} from '../app/test/behaviour/harness.mjs';
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
const {ui, close} = await open({team: TEAM, box: BOX});
const site = JSON.parse(await ui.peek(`JSON.stringify((()=>{
  const one=n=>{const p=byName.get(n);const r=rating(p);return {n,d:p.d,t:p.t,sp:p.sp,r:RS(r.total),tier:lTier(r.total).k+' tier',usage:r.usage,wr:r.wr};};
  const L=AR.lineup(members()),role=n=>L.lead.some(m=>m.p.n===n)?'Lead':L.back.some(m=>m.p.n===n)?'Back':'Bench';
  return {box:${JSON.stringify(BOX)}.map(one),team:${JSON.stringify(TEAM)}.map(n=>({...one(n),role:role(n)})),asOf:(typeof RES==='object'&&RES&&RES.updated)||''};})())`));
await close(); await closeAll();
const fmtDate = s => { const d = new Date(String(s).slice(0, 10) + 'T12:00:00Z'); return isNaN(d) ? '' : d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'}); };
const teamSet = new Set(TEAM.map(n => n.replace(/-Mega-[XY]$/, '').replace(/-Mega$/, '')));

const DATA = {
  mybox: () => { const box = site.box.map(m => ({...m, img: art(m.n), team: teamSet.has(m.n)})).sort((a, b) => a.d.localeCompare(b.d));
    const sel = {...box.find(m => m.n === 'Garchomp')};
    return {box, sel, team: site.team.map(m => ({d: m.d, role: m.role, img: art(m.n)})), sortBy: 'A–Z', asOf: fmtDate(site.asOf) || 'Nov 10', logo: LOGO, logo2: LOGO2, logoD: LOGOD, logoD2: LOGOD2}; },
};

const b = await chromium.launch();
for (const p of pages) {
  const D = DATA[p](), tpl = fs.readFileSync(MOCKS + p + '.tpl.html', 'utf8');
  const html = tpl.replace('/*DATA*/', 'const D=' + JSON.stringify(D) + ';'); const f = MOCKS + `_${p}.html`; fs.writeFileSync(f, html);
  for (const [layout, w, h] of [['desktop', 1440, 900], ['phone', 390, 844]].filter(x => !process.env.LAYOUT || x[0] === process.env.LAYOUT)) for (const theme of (process.env.THEMES || 'dusk,light').split(',')) {
    const pg = await (await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', p, layout, theme, e.message));
    await pg.goto('file://' + f + '#' + theme); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}).catch(() => console.log('NOT READY', p, layout, theme));
    await pg.waitForTimeout(300);
    const sw = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.documentElement.scrollHeight]);
    const out = OUT + `${p}-${layout}-${theme.replace('-', '_')}.png`; await pg.screenshot({path: out, fullPage: true}); console.log(out.replace(ROOT, ''), sw.join(' '), sw[0] > sw[1] ? 'SIDEWAYS SCROLL' : '');
    await pg.context().close(); }
  fs.unlinkSync(f);
}
await b.close();
