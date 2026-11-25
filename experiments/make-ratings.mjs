// Ratings mock-up (R2, Meta > Pokémon ratings): real numbers from today's site, upscaled art, logo
// -> docs/rebuild/mocks/out/ratings.html + PNGs (desktop 1440x900, iPad 820x1180, phone 390x844; light and dusk).
// Data: the site itself through the test harness, with meta/perf served the way the morning refresh writes it (all of
// out/perf.json, exactly as ratings-snapshot.mjs does). Without that the harness falls back to the page's built-in Nov 1
// snapshot for On teams / Win rate and the date line; the ratings themselves are the same either way (checked Nov 11).
// Every rating is the displayed one, RS(rating(p).total); ranks are the site's own (lairRank, ties share a rank).
// The order and ranks are checked against the site's own Ratings page DOM before anything is written.
import fs from 'node:fs'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
import {open, closeAll, DOCS} from '../app/test/behaviour/harness.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), MOCKS = ROOT + 'docs/rebuild/mocks/', OUT = MOCKS + 'out/';
const helpers = fs.readFileSync(ROOT + 'app/src/app/15-visual-helpers.js', 'utf8'), i0 = helpers.indexOf('SPRITE_ID =');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(ROOT + 'app/src/data/logos.js', 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const art = n => { const id = SPRITE_ID[n]; const f = ROOT + `docs/rebuild/art/up1024/${id}.webp`; if (!id || !fs.existsSync(f)) throw new Error('no art for ' + n); return 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64'); };
const TEAM = ['Garchomp', 'Sneasler', 'Charizard-Mega-Y', 'Whimsicott', 'Basculegion', 'Kingambit'], SHOW = 12;

// meta/perf as the morning refresh writes it (ratings-snapshot.mjs): adj from the results, every part of out/perf.json
const PERF = JSON.parse(fs.readFileSync(ROOT + 'out/perf.json', 'utf8'));
DOCS['meta/perf'] = Object.assign({adj: DOCS['meta/perf'] && DOCS['meta/perf'].adj}, PERF, {updated: (DOCS['meta/perf'] || {}).updated});

const {ui, close} = await open({team: TEAM, width: 1440});
await ui.go('ratings', 2500);
const s = JSON.parse(await ui.peek(`JSON.stringify((()=>{
  const rows=lairRows(), one=x=>{const t=(x.r.src&&x.r.src.tour)||null;const k=lairRank(x.p);return {n:x.p.n,d:x.p.d,t:x.p.t,sp:x.p.sp,m:!!x.p.m,r:RS(x.r.total),tier:lTier(x.r.total).k,
    rank:k?k.rank:null,range:rRange(x.r),gem:isGem(x.p),est:!x.r.tc,on:t?+t[0]:null,wr:t?+t[1]:null,games:t?+t[2]:null};};
  const pf=activePerf(), kick=(document.querySelector('#lair .chpghead .chk')||{}).textContent||'';
  const dom=[...document.querySelectorAll('#chHot [data-lt]')].map(b=>({n:b.dataset.lt,rk:(b.querySelector('.rk,.chrk')||{}).textContent||'',sc:(b.querySelector('.sc,.n')||{}).textContent||''}));
  const ab=[...document.querySelectorAll('#lair .chfold')].map(e=>e.textContent.replace(/\\s+/g,' '));
  const track=((ab.find(t=>t.startsWith('About'))||'').match(/Track record: (.+?\\(50% would be a coin flip\\)\\.)/)||[])[1]||'';
  return {all:rows.length,top:rows.slice(0,${SHOW}).map(one),of:(lairRank(rows[0].p)||{}).of,teams:RES.teams,src:RES.source,updated:pf&&pf.updated,kick,dom,track,
    tiers:LTIERS.map(T=>({k:T.k,band:tierBand(T),d:T.d,n:rows.filter(x=>lTier(x.r.total).k===T.k).length})),gems:rows.filter(x=>isGem(x.p)).map(x=>x.p.d),
    sources:4,TC};})())`));
// the Strength Score and band the dock shows: read from today's My Team for this team
await ui.go('My Team', 2500);
const mtTxt = await ui.peek(`[...document.querySelectorAll('[data-pane]')].find(e=>!e.hidden&&e.getClientRects().length).innerText.replace(/\\s+/g,' ')`);
await close(); await closeAll();
const sc = mtTxt.match(/Strength Score (\d+) (Top tier|Tournament ready|Solid|Needs work|Missing a basic)/);
if (!sc) throw new Error('no Strength Score on My Team');

// order and ranks must be the site's own: compare with its Ratings page (hero card #1, then the rows)
s.dom.forEach((d, i) => { const t = s.top[i]; if (!t) return; if (d.n !== t.n) throw new Error(`order differs at ${i + 1}: site ${d.n}, mock ${t.n}`);
  if (d.sc && +d.sc !== t.r) throw new Error(`${t.n}: site shows ${d.sc}, mock ${t.r}`); if (i && d.rk && d.rk !== '#' + t.rank) throw new Error(`${t.n}: site rank ${d.rk}, mock #${t.rank}`); });
console.log(`checked against the site's Ratings page: ${Math.min(s.dom.length, SHOW)} rows, same order, ratings and ranks`);
const fmtDate = x => { const d = new Date(String(x).slice(0, 10) + 'T12:00:00Z'); return isNaN(d) ? '' : d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'}); };
const src = String(s.src).match(/([\d,]+) games \(Limitless, (\d+) events/) || [];
const D = {
  top: s.top.map(t => ({...t, img: art(t.n), mine: TEAM.includes(t.n)})), all: s.all, of: s.of, teams: s.teams.toLocaleString('en-US'),
  games: src[1] || '', events: src[2] || '', asOf: fmtDate(s.updated), kick: s.kick, track: s.track, tiers: s.tiers, gems: s.gems, TC: s.TC,
  team: {name: 'Sun Tailwind', style: 'Sun · Tailwind', score: +sc[1], band: sc[2], six: TEAM.map(n => ({n, img: art(n)}))},
  logo: sb.NP_SVG.hdrL, logoD: sb.NP_SVG.hdrD};
fs.writeFileSync(OUT + 'ratings.html', fs.readFileSync(MOCKS + 'ratings.tpl.html', 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(D) + ';'));
fs.copyFileSync(MOCKS + 'tokens.css', OUT + 'tokens.css');
console.log('kicker on the site:', s.kick); console.log('dock:', D.team.score, D.team.band);
console.log('top', s.top.map(t => `#${t.rank} ${t.d} ${t.r} (${t.on}% / ${t.wr}%)`).join(', '));
const b = await chromium.launch();
for (const [layout, w, h] of [['desktop', 1440, 900], ['ipad', 820, 1180], ['phone', 390, 844]]) for (const theme of ['light', 'dusk']) {
  const pg = await (await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2})).newPage();
  await pg.goto('file://' + OUT + 'ratings.html#' + theme); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}); await pg.waitForTimeout(500);
  await pg.screenshot({path: OUT + `ratings-${layout}-${theme}.png`, fullPage: true}); await pg.close(); }
await b.close();
