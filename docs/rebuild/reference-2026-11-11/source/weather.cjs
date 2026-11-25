// The room follows the team: sun, rain, Trick Room and Tailwind treatments on the My Team top, day and night.
// Illustration on the sample team (which really is Sun + Tailwind): the style line is changed per picture to show each state. Usage: node weather.cjs <d6Dir> <outDir>
const fs = require('fs'), path = require('path'), {createRequire} = require('module'), {NIGHT, LIGHT} = require('./night2.cjs'), {SEL, NIGHT2, NORM} = require('./ref.cjs');
const [D6, OUT] = process.argv.slice(2), uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64');
const BASE = `.weather{display:none}.wx{position:absolute;left:0;right:0;top:0;height:620px;z-index:0;pointer-events:none;overflow:hidden}.wx i{position:absolute;inset:0;display:block}
:root{--k:1}:root[data-theme="dusk"]{--k:1.5}`;
const WX = {
  // warm light falling from the top right in a few soft shafts; the floor line warms
  sun: [`Sun`, `.wx{background:radial-gradient(70% 90% at 88% -12%,rgba(255,170,50,calc(.26*var(--k))),transparent 70%)}
    .wx i{background:linear-gradient(118deg,transparent 0 38%,rgba(255,196,110,calc(.13*var(--k))) 40% 45%,transparent 47% 52%,rgba(255,196,110,calc(.09*var(--k))) 54% 61%,transparent 63% 68%,rgba(255,196,110,calc(.06*var(--k))) 70% 74%,transparent 76%);
      -webkit-mask-image:radial-gradient(90% 100% at 90% 0,#000 20%,transparent 78%);mask-image:radial-gradient(90% 100% at 90% 0,#000 20%,transparent 78%);filter:blur(6px)}
    @media (min-width:700px){.six::before{background:linear-gradient(90deg,transparent,rgba(255,170,60,.5) 12%,rgba(255,170,60,.5) 88%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,rgba(255,170,60,calc(.09*var(--k))),transparent)!important}}`],
  // a cool cast, fine slanted rain fading out before the text, and a wet floor that reflects the six
  rain: [`Rain`, `.wx{background:linear-gradient(180deg,rgba(60,110,180,calc(.13*var(--k))),transparent 80%)}
    .wx i{background:repeating-linear-gradient(104deg,transparent 0 29px,rgba(70,120,190,calc(.24*var(--k))) 29px 30px,transparent 30px 53px),repeating-linear-gradient(104deg,transparent 0 71px,rgba(70,120,190,calc(.17*var(--k))) 71px 72.5px,transparent 72.5px 127px);-webkit-mask-image:linear-gradient(180deg,#000 0,rgba(0,0,0,.6) 45%,transparent 72%),linear-gradient(90deg,transparent 24%,#000 42%);-webkit-mask-composite:source-in;mask-image:linear-gradient(180deg,#000 0,rgba(0,0,0,.6) 45%,transparent 72%),linear-gradient(90deg,transparent 24%,#000 42%);mask-composite:intersect}
    .mon img{-webkit-box-reflect:below -5px linear-gradient(transparent 64%,rgba(255,255,255,.34))}
    @media (min-width:700px){.six::before{background:linear-gradient(90deg,transparent,rgba(70,130,210,.55) 12%,rgba(70,130,210,.55) 88%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,rgba(70,130,210,calc(.13*var(--k))),transparent)!important}}`],
  // the twisted dimensions: a violet cast and a receding grid on the floor under the six
  trick: [`Trick Room`, `.wx{background:radial-gradient(60% 70% at 64% 0,rgba(170,70,220,calc(.12*var(--k))),transparent 75%)}
    .wx i{left:300px;right:-140px;top:291px;bottom:auto;height:460px;transform:perspective(700px) rotateX(72deg);transform-origin:50% 0;
      background:repeating-linear-gradient(90deg,rgba(180,80,230,calc(.36*var(--k))) 0 2px,transparent 2px 64px),repeating-linear-gradient(0deg,rgba(180,80,230,calc(.36*var(--k))) 0 2px,transparent 2px 64px);
      -webkit-mask-image:linear-gradient(180deg,#000 0,transparent 78%);mask-image:linear-gradient(180deg,#000 0,transparent 78%)}
    @media (min-width:700px){.six::before{background:linear-gradient(90deg,transparent,rgba(180,80,230,.7) 12%,rgba(180,80,230,.7) 88%,transparent) top/100% 1.5px no-repeat!important}}`],
  // wind from behind: long soft streaks crossing the room at the brand's slant
  wind: [`Tailwind`, `.wx{background:linear-gradient(100deg,rgba(40,190,190,calc(.10*var(--k))),transparent 60%)}
    .wx i{inset:-40px -80px;transform:rotate(-7deg);--s:rgba(40,180,185,calc(.4*var(--k)));
      background:${[[30,10,30,2],[62,15,34,1.5],[40,23,22,1.5],[86,27,26,2],[52,34,36,2],[28,41,24,1.5],[74,47,30,1.5],[44,55,40,2],[90,61,22,1.5],[34,69,28,2],[64,76,34,1.5],[48,86,26,2]].map(s => `linear-gradient(90deg,transparent,var(--s) 35%,var(--s) 65%,transparent) ${s[0]}% ${s[1]}%/${s[2]}% ${s[3]}px no-repeat`).join(",")};filter:blur(.6px);
      -webkit-mask-image:linear-gradient(90deg,transparent 24%,#000 40%);mask-image:linear-gradient(90deg,transparent 24%,#000 40%)}`]};
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch(), jobs = [];
  for (const k of Object.keys(WX)) for (const theme of ['light', 'dusk']) jobs.push((async () => {
    const pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
    await pg.goto('file:///' + path.join(D6, 'myteam.html').replace(/\\/g, '/') + '#' + theme); await pg.evaluate(() => document.fonts.ready);
    await pg.waitForFunction(() => document.querySelector('.band .mon'), null, {timeout: 20000}); await pg.waitForTimeout(600);
    await pg.addStyleTag({content: (theme === 'dusk' ? NIGHT + SEL + NIGHT2 : LIGHT + SEL) + BASE + WX[k][1]}); await pg.evaluate(NORM);
    await pg.evaluate(name => { const w = document.createElement('div'); w.className = 'wx'; w.innerHTML = '<i></i>'; const p = document.getElementById('page'); p.insertBefore(w, p.firstChild);
      const e = document.querySelector('.lock .eyebrow'); if (e) e.textContent = 'My Team · ' + name; }, WX[k][0]); await pg.waitForTimeout(300);
    await pg.screenshot({path: path.join(OUT, `wx-${k}-${theme}.png`), clip: {x: 0, y: 0, width: 1440, height: 470}}); await pg.close(); })());
  await Promise.all(jobs);
  const col = (t, f) => `<div class="c"><b>${t}</b><img src="${uri(f)}"></div>`;
  const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap">
<style>*{box-sizing:border-box;margin:0}body{width:2360px;background:#E9E7E2;font:500 16px/1.4 "Instrument Sans",system-ui,sans-serif;color:#17161A;padding:36px 40px 40px}
h1{font-weight:700;font-size:28px;letter-spacing:-.01em}p{color:#48454F;margin-top:6px;max-width:1200px}
.g{display:grid;gap:22px;margin-top:22px;grid-template-columns:1fr 1fr}.c b{display:block;font-weight:700;font-size:17px;margin-bottom:10px}
img{display:block;width:100%;border-radius:10px;box-shadow:0 0 0 1px rgba(23,22,26,.12)}</style>
<h1>The room follows the team: Sun, Rain, Trick Room, Tailwind</h1><p>Each state shown on the sample team for illustration (that team is really Sun and Tailwind; only the style line was changed per picture). Stills only: on the real page the rain would fall, the wind streaks would drift and the sun shafts would shift slowly.</p>
<div class="g">${Object.keys(WX).map(k => col(WX[k][0] + ', day', `wx-${k}-light.png`) + col(WX[k][0] + ', night', `wx-${k}-dusk.png`)).join('')}</div>`;
  const f = path.join(OUT, 'nastyplot-idea-weather.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 2360, height: 900}, deviceScaleFactor: 1})).newPage(); await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
  await pg.screenshot({path: path.join(OUT, 'nastyplot-idea-weather.png'), fullPage: true}); await b.close();
})();
