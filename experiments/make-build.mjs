// Build page mock-up (R2): Build for Me + Build around a core + Start from a recent winner.
// Every number is read from today's Build page through the test harness (frozen data snapshot): the build is run for real
// (Whole roster, 2 Megas, Build around Garchomp), each option is read with Try another, then the cores and recent winners.
// Output: docs/rebuild/mocks/out/build.html + PNGs (desktop 1440x900, iPad 820x1180, phone 390x844; light and dusk).
// Event names drop emoji, prize text and the organiser's handle (no-names rule), as on the Home mock.
import fs from 'node:fs'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
import {open, closeAll} from '../app/test/behaviour/harness.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), MOCKS = ROOT + 'docs/rebuild/mocks/', OUT = MOCKS + 'out/';
const helpers = fs.readFileSync(ROOT + 'app/src/app/15-visual-helpers.js', 'utf8'), i0 = helpers.indexOf('SPRITE_ID =');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(ROOT + 'app/src/data/logos.js', 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const ART = {}; const art = n => { if (ART[n]) return ART[n]; const id = SPRITE_ID[n]; const f = ROOT + `docs/rebuild/art/up1024/${id}.webp`; if (!id || !fs.existsSync(f)) throw new Error('no art for ' + n); return ART[n] = 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64'); };
const AROUND = 'Garchomp';

const {ui, pg, close} = await open({team: ['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'], width: 1440});
await ui.go('auto', 1500);
const names = JSON.parse(await ui.peek(`JSON.stringify(Object.fromEntries([...byName.values()].map(p=>[p.d,p.n])))`));
const dn = JSON.parse(await ui.peek(`JSON.stringify(Object.fromEntries([...byName.values()].map(p=>[p.n,p.d])))`));
const toN = d => names[d] || (d.startsWith('Mega ') ? (([b, x]) => b + '-Mega' + (x ? '-' + x : ''))(d.slice(5).split(/\s/)) : d.startsWith('Hisuian ') ? d.slice(8) + '-Hisui' : d);
const lines = s => s.split('\n').map(x => x.trim()).filter(Boolean);
// the page as it starts: hero line, Megas tip, How it works
const startTxt = await pg.evaluate(() => document.getElementById('autobuild').innerText);
const megaTip = await pg.evaluate(() => document.querySelector('.megactl').title);
const megas = await pg.evaluate(() => document.querySelector('[data-megas][aria-pressed="true"]').dataset.megas);
const boxN = await pg.evaluate(() => document.getElementById('abBoxN').innerText.trim());
// recent winners
await pg.evaluate(() => document.querySelectorAll('[data-pane="auto"] details').forEach(d => { d.open = true; d.dispatchEvent(new Event('toggle')); })); await pg.waitForTimeout(1200);
const wins = await pg.evaluate(() => [...document.querySelectorAll('[data-pane="auto"] [data-evload]')].map(b => b.closest('.evteam').innerText));
const winFold = lines(await pg.evaluate(() => document.getElementById('autobuild').innerText)).find(x => /winning teams, full sets/.test(x)) || '3 winning teams, full sets, ready to load';
const clean = s => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]\u{FE0F}?/gu, '|').split('|').map(x => x.trim()).find(Boolean).replace(/\s*(!|\$\d|\d+€).*$/u, '').replace(/^Amyverse VGC /, '').trim(); // organiser handle and prize text left out
const winners = wins.map(t => { const W = lines(t); const m = W[2].match(/^(.*), (\w{3} \d+), (\d+) players$/);
  const mons = W.slice(3, 9); const tags = W.slice(9, W.indexOf('Load team'));
  return {place: W[0], record: W[1], event: clean(m[1]), date: m[2], players: +m[3], mons: mons.map(d => ({d, n: toN(d), img: art(toN(d))})), tags}; });
// the build: Whole roster, around Garchomp
await pg.click('[data-absrc="all"]'); await pg.waitForTimeout(400);
await ui.buildAround(AROUND.slice(0, 5).toLowerCase());
const chip = await ui.buildAroundChip(); if (!chip.includes(AROUND)) throw new Error('build-around chip: ' + chip);
const btnLabel = (await ui.buildButton()).label;
const t0 = Date.now(); await ui.buildMeATeam(90000); const secs = (Date.now() - t0) / 1000;
await pg.waitForTimeout(4000); // let a late option arrive
const n = +(await ui.buildResult()).match(/Option \d+ of (\d+)/)[1];
const opts = [];
for (let k = 0; k < n; k++) {
  await pg.evaluate(() => document.querySelectorAll('#abOut details').forEach(d => d.open = true)); await pg.waitForTimeout(300);
  const L = lines(await pg.evaluate(() => document.getElementById('abOut').innerText));
  const o = {kicker: L[0], arch: L[1], opt: L[2], score: +L[L.indexOf('Strength Score') + 1], band: L[L.indexOf('Strength Score') + 2], rank: L[L.indexOf('Strength Score') + 3]};
  o.guess = L.find(x => /best guess/.test(x)) || '';
  o.six = await ui.builtSix();
  // Sets and roles rows: name, @ item, N teams, types, To catch, role, tier
  o.sets = []; L.forEach((x, i) => { if (x.startsWith('@ ')) { const r = {d: L[i - 1], item: x.slice(2), teams: L[i + 1]}; let j = i + 2; while (j < L.length && !/^[SABCDE] tier \d+$/.test(L[j])) j++; r.tier = L[j]; r.role = L[j - 1]; r.box = L.slice(i + 2, j - 1).includes('To catch') ? 'To catch' : L.slice(i + 2, j - 1).includes('In your box') ? 'In your box' : ''; o.sets.push(r); } });
  const ri = L.findIndex(x => /ready for top threats/.test(x)); o.ready = L[ri - 1]; o.readyNote = L[ri + 1];
  const ci = L.indexOf('team checks'); o.checks = L[ci - 1]; o.missing = (L[ci + 1] || '').startsWith('Missing') ? L[ci + 1] : '';
  const gi = L.findIndex(x => /^Items, abilities/.test(x)); let gj = L.findIndex((x, i) => i > gi && /tier \d+$/.test(x)); // after the last set row
  let lastTier = -1; L.forEach((x, i) => { if (/^[SABCDE] tier \d+$/.test(x)) lastTier = i; }); const cs = Math.max(gi, lastTier) + 1;
  const ui2 = L.indexOf('Use this team'); const rest = L.slice(cs, ui2); o.chips = rest.filter(x => x.length < 24); o.why = rest.filter(x => x.length >= 24);
  o.scoreTip = await pg.evaluate(() => (document.querySelector('#abOut [title^="Strength Score"]') || {}).title || '');
  o.checkTip = await pg.evaluate(() => ([...document.querySelectorAll('#abOut [title]')].find(e => /Mega Evolution/.test(e.title)) || {}).title || '');
  o.actions = L.slice(ui2);
  opts.push(o);
  if (k < n - 1) await ui.tryAnother();
}
// cores: pairs, top rated, details open
await pg.evaluate(() => document.querySelectorAll('#cores details').forEach(d => d.open = true)); await pg.waitForTimeout(300);
await pg.evaluate(() => document.querySelectorAll('#cores button').forEach(b => { if (/^Details/.test(b.innerText.trim())) b.click(); })); await pg.waitForTimeout(600);
const CL = lines(await pg.evaluate(() => document.getElementById('cores').innerText)).map(x => x.replace(/\s+/g, ' '));
const keys = await pg.evaluate(() => [...document.querySelectorAll('#cores [data-coreuse]')].map(b => b.dataset.coreuse.split('|')));
const coreIntro = CL.find(x => x.startsWith('From ')).replace(/ \?$/, '');
const cores = []; for (let i = 0; i < CL.length; i++) if (/^\d+$/.test(CL[i]) && CL[i + 1] && CL[i + 1].includes('+')) {
  const c = {rank: +CL[i], names: CL[i + 1], tags: []}; let j = i + 2; while (!/%/.test(CL[j])) c.tags.push(CL[j++]);
  c.win = CL[j].replace(/ ?wins$/, ''); if (CL[j + 1] === 'wins') j++; c.vsAvg = CL[j + 1]; c.teams = CL[j + 2]; c.together = CL[j + 3]; c.share = CL[j + 4]; c.n = keys[cores.length]; cores.push(c); }
const moreLeft = +(CL.find(x => /^Show more/.test(x)) || '0').replace(/\D/g, '');
const kinds = await pg.evaluate(() => [...document.querySelectorAll('[data-corekind]')].map(b => b.innerText.trim()));
await close(); await closeAll();

const mon = n => ({n, d: dn[n] || n, img: art(n)});
opts.forEach(o => { o.mons = o.six.map((n, i) => ({...mon(n), ...(o.sets[i] || {})})); });
cores.forEach(c => { c.mons = c.n.map(mon); });
const D = {around: AROUND, aroundImg: art(AROUND), btnLabel, megas, megaTip, boxN, secs,
  hero: lines(startTxt)[2], how: lines(startTxt).slice(lines(startTxt).indexOf('How It Works') + 1, lines(startTxt).indexOf('How It Works') + 2)[0],
  opts, cores, coreIntro, moreLeft, coreTotal: cores.length + moreLeft, kinds, winners, winFold,
  logo: sb.NP_SVG.hdrL, logoD: sb.NP_SVG.hdrD};
fs.writeFileSync(OUT + 'build-data.json', JSON.stringify({...D, aroundImg: undefined, logo: undefined, logoD: undefined, opts: opts.map(o => ({...o, mons: o.mons.map(m => ({...m, img: undefined}))})),
  cores: cores.map(c => ({...c, mons: undefined})), winners: winners.map(w => ({...w, mons: w.mons.map(m => m.d)}))}, null, 1));
fs.writeFileSync(OUT + 'build.html', fs.readFileSync(MOCKS + 'build.tpl.html', 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(D) + ';'));
fs.copyFileSync(MOCKS + 'tokens.css', OUT + 'tokens.css');
console.log(`built in ${secs}s: ${opts.length} options`, opts.map(o => `${o.kicker} ${o.arch} ${o.score} ${o.band}`).join(' | '));
console.log('cores', cores.length, '+', moreLeft, '| winners', winners.map(w => w.event).join(' | '));
if (process.argv.includes('--no-shots')) process.exit(0);
const b = await chromium.launch();
for (const [layout, w, h] of [['desktop', 1440, 900], ['ipad', 820, 1180], ['phone', 390, 844]]) for (const theme of ['light', 'dusk']) {
  const p = await (await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2})).newPage();
  await p.goto('file://' + OUT + 'build.html#' + theme); await p.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}); await p.waitForTimeout(500);
  await p.screenshot({path: OUT + `build-${layout}-${theme}.png`, fullPage: true}); await p.close(); }
await b.close();
