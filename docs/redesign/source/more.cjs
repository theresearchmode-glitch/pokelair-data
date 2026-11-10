// Two more homepage concepts from NastyPlot's real data. Usage: node more.cjs <repo> <outDir> <dsf> [stage|orrery]
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const REPO = process.argv[2], OUT = process.argv[3], DSF = +(process.argv[4] || 2), ONLY = process.argv[5];
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, L = rd('limitless.json'), TS = rd('teams.json').teams;
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const dataJs = fs.readFileSync(path.join(REPO, 'app/src/data/data.js'), 'utf8'), TYPES = {};
for (const m of dataJs.matchAll(/\{"n":"([^"]+)","t":\[([^\]]+)\]/g)) TYPES[m[1]] = JSON.parse('[' + m[2] + ']');
const spr = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(REPO, 'app/sp', SPRITE_ID[n] + '.webp')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : '')).replace('Arcanine-Hisui', 'Hisuian Arcanine').replace('Indeedee-F', 'Indeedee \u2640');
const mons = L.results.mons, use = n => +(mons[n][0] / L.teams * 100).toFixed(1);
const mon = n => ({n, d: disp(n), r: R[n] || 0, u: mons[n] ? use(n) : 0, w: mons[n] ? +(mons[n][1] * 100).toFixed(1) : 0, t: TYPES[n] || [], img: spr(n)});
// stage: the two finalists of the same event
const [A, B] = TS; if (A.event !== B.event) throw new Error('finalists are from different events');
const stage = {you: A.mons.map(mon), them: B.mons.map(mon), youP: A.player, themP: B.player, event: A.event, teams: L.teams};
// orrery: the 16 most-used Pokemon and every real pairing between them
const ring = Object.keys(mons).sort((a, b) => mons[b][0] - mons[a][0]).slice(0, 16), pairs = [];
for (const k of Object.keys(L.results.pairs)) { const [a, b] = k.split('|'); if (ring.includes(a) && ring.includes(b)) pairs.push({a, b, n: L.results.pairs[k][0], w: +(L.results.pairs[k][1] * 100).toFixed(1)}); }
const SEL = 'Kingambit', best = pairs.filter(p => (p.a === SEL || p.b === SEL) && p.n >= 400).sort((x, y) => y.w - x.w)[0];
const orrery = {ring: ring.map(mon), pairs, sel: SEL, best, base: +(L.results.base * 100).toFixed(0), teams: L.teams, tours: L.tournaments, games: L.games};
console.log('pairs', pairs.length, 'best', JSON.stringify(best), 'ring', ring.join(','));
const DOORS = `<section class="doors">
  <div class="door" style="--c:var(--gold)"><div class="n dsp">01</div><h2 class="dsp">Build</h2><p>A full six drafted from real winning teams, or built your own way.</p><a>Build me a team <span>➜</span></a></div>
  <div class="door" style="--c:var(--blue)"><div class="n dsp">02</div><h2 class="dsp">My team</h2><p>Your six graded out of 100, with the reasons and the fixes.</p><a>Check my team <span>➜</span></a></div>
  <div class="door" style="--c:var(--orange)"><div class="n dsp">03</div><h2 class="dsp">Battle</h2><p>Their six in. Your four, the leads and turn 1 out.</p><a>Battle mode <span>➜</span></a></div>
  <div class="door" style="--c:var(--purple)"><div class="n dsp">04</div><h2 class="dsp">Meta</h2><p>Every recent tournament, every winning team, every Pokémon rated.</p><a>Ratings <span>➜</span></a></div>
</section>
<footer>%LOGO2%<span>Team building for Pokémon Champions, from real tournament results.</span><div class="r"><span>How the ratings work</span><span>About</span><span>Send feedback</span></div></footer>`;
const HEADER = `<header><div class="logo">%LOGO%</div>
  <nav><a style="--c:var(--gold)"><i></i>Build</a><a style="--c:var(--blue)"><i></i>My team</a><a style="--c:var(--orange)"><i></i>Battle</a><a style="--c:var(--purple)"><i></i>Meta</a></nav>
  <div class="find"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>Find a Pokémon or tool<kbd>/</kbd></div></header>`;
const BASE = fs.readFileSync(path.join(__dirname, 'base.css'), 'utf8');
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true});
  for (const [name, data, logo] of [['stage', stage, 'hdrD'], ['orrery', orrery, 'hdrL']]) {
    if (ONLY && ONLY !== name) continue;
    const lg = sb.NP_SVG[logo], html = fs.readFileSync(path.join(__dirname, name + '.tpl.html'), 'utf8').replace('/*BASE*/', BASE).replace('<!--HEADER-->', HEADER).replace('<!--DOORS-->', DOORS)
      .replace('%LOGO%', lg).replace('%LOGO2%', lg.replace(/nphdr([DL])/g, 'nphdr$1x')).replace('/*DATA*/', 'const D=' + JSON.stringify(data) + ';');
    const f = path.join(OUT, name + '.html'); fs.writeFileSync(f, html);
    const pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', name, e.message));
    await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600);
    console.log(name, await pg.evaluate(() => [document.fonts.check('900 20px Unbounded'), document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(' ')));
    await pg.screenshot({path: path.join(OUT, 'nastyplot-home-concept-' + name + '.png'), fullPage: true});
  }
  await b.close();
})();
