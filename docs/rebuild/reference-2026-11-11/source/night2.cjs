// Second pass: night mode fixes (Save Team, a real floor, Set panel at night) and the same ideas carried into light mode. Desktop and phone.
// Overrides on a copy of the rebuild's My Team mock-up (d6/myteam.html). Usage: node night2.cjs <d6Dir> <outDir>
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const [D6, OUT] = process.argv.slice(2), uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64');
const noise = rgb => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${rgb}  0 0 0 0 ${rgb}  0 0 0 0 ${rgb}  0 0 0 .7 -.18"/></filter><rect width="240" height="240" filter="url(#n)"/></svg>`)}")`;
const NIGHT = `
:root[data-theme="dusk"]{--bg:#12121B;--surface:#1D1C29;--wash:#201F2D;--ink:#E4E0DA;--ink-2:#C4BFCB;--ink-3:#B0AAB8;--rule:rgba(228,224,236,.10);
  --plate:#343348;--on-plate:#F1EDE7;--pick:#F0708A;--pick-text:#F58DA1;--good:#74D3A0;--good-text:#86D9AC;--mid:#F0C768;--mid-text:#F0C768;--sunwarm:.07;--contact:transparent}
.page{background:linear-gradient(180deg,#0C0C14 0,#12121C 280px,#191928 450px,#14141F 620px,#12121B 100%)}
.page::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:${noise(1)};opacity:.05;mix-blend-mode:screen}
.band .pool,.band .teamlight{display:none!important}
/* the floor: a lit line at the feet and light spilling forward from it */
.six{position:relative}
@media (min-width:700px){.six::before{content:"";position:absolute;left:-70px;right:-40px;top:139px;height:120px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(214,218,255,.2) 12%,rgba(214,218,255,.2) 88%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,rgba(150,160,255,.13),transparent)}
 .grp.bench{border-left-color:transparent}}
.mon .sh{top:102px;width:112px;height:20px;margin-left:-56px;background:radial-gradient(closest-side,rgba(var(--c),.85),rgba(var(--c),.3) 45%,transparent);filter:blur(1.5px)}
.mon .glow{top:74px;width:104px;height:70px;margin:-35px 0 0 -52px;background:radial-gradient(closest-side,rgba(var(--c),.2),transparent)}
.mon img{filter:drop-shadow(0 0 .6px rgba(255,255,255,.55)) drop-shadow(0 -1px 5px rgba(var(--c),.3))}
@media (max-width:699px){.mon .sh{top:78px;width:84px;height:16px;margin-left:-42px}.mon .glow{top:56px;width:80px;height:56px;margin:-28px 0 0 -40px}}
.trow img,.sheet td img,.swap img{filter:drop-shadow(0 0 .6px rgba(255,255,255,.4))}
/* plates: raised dark surfaces with a lit edge; the ONE main action gets the logo blue */
.btn,.chip.on,.set .plate{background:linear-gradient(180deg,#3E3D56,#2C2B3D);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(0,0,0,.35)}
.acts .btn{background:linear-gradient(180deg,#63C0F8,#3FA2E2);color:#08131E;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(0,40,80,.35)}
@media (max-width:699px){.acts .btn{height:44px!important;background:linear-gradient(180deg,#4FAEEC,#2F8ACB)}}
.btn2{border-color:rgba(228,224,236,.42)}
.lock .num b{color:#D6D1CA}
.lock .num .w span{color:#62BEF7;text-shadow:0 0 22px rgba(79,178,240,.4)}
.u,.sec h2,.grp .lab{font-weight:800}
.mon.on::before,.mon.on::after{border-width:2px}
/* Set panel at night: dark glass tinted by the Pokemon, lit from it, not a bright slab */
.set .panel{background:linear-gradient(150deg,rgba(var(--c1),.46),rgba(var(--c1),.10))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.26),inset 0 0 0 1px rgba(var(--c1),.28)!important}
.set .panel::after{opacity:.22}
.set .pool{left:0;right:0;top:120px;height:190px;background:radial-gradient(closest-side,rgba(var(--c1),.34),transparent)}
.set .art{filter:drop-shadow(0 0 .8px rgba(255,255,255,.6)) drop-shadow(0 14px 16px rgba(0,0,0,.45))}`;
const LIGHT = `
:root[data-theme="light"]{--contact:rgba(30,20,50,.42)}
.band .pool,.band .teamlight{display:none!important}
.six{position:relative}
@media (min-width:700px){.six::before{content:"";position:absolute;left:-70px;right:-40px;top:139px;height:110px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(23,22,26,.13) 12%,rgba(23,22,26,.13) 88%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,rgba(60,40,110,.055),transparent)}
 .grp.bench{border-left-color:transparent}}
/* grounded: a tight contact shadow inside a small pool of the Pokemon's own colour */
.mon .sh{top:101px;width:124px;height:24px;margin-left:-62px;background:radial-gradient(closest-side,var(--contact),transparent 60%) center/46% 50% no-repeat,radial-gradient(closest-side,rgba(var(--cp),.62),rgba(var(--cp),.3) 55%,transparent)}
.mon .glow{background:radial-gradient(closest-side,rgba(var(--c),.10),transparent)}
.mon img{filter:drop-shadow(4px 7px 7px rgba(30,20,50,.16))}
@media (max-width:699px){.mon .sh{top:77px;width:92px;height:19px;margin-left:-46px}}
.page::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:${noise(.1)};opacity:.035;mix-blend-mode:multiply}`;
module.exports = {NIGHT, LIGHT};
if (require.main === module) (async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  const run = async (theme, css, vw, vh, name, clipH) => {
    const pg = await (await b.newContext({viewport: {width: vw, height: vh}, deviceScaleFactor: 2})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
    await pg.goto('file:///' + path.join(D6, 'myteam.html').replace(/\\/g, '/') + '#' + theme); await pg.evaluate(() => document.fonts.ready);
    await pg.waitForFunction(() => document.querySelector('.band .mon'), null, {timeout: 20000}); await pg.waitForTimeout(600);
    // every Pokemon's floor colour is brought to the same strength (pale or dark art colours would otherwise vanish or shout on the page)
    if (css) { await pg.addStyleTag({content: css}); console.log(name, await pg.evaluate(() => [...document.querySelectorAll('.band .mon')].map(m => { const [r, g, b] = m.style.getPropertyValue('--c').split(',').map(v => +v / 255);
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l0 = (mx + mn) / 2; let h = 0, s = d ? d / (1 - Math.abs(2 * l0 - 1)) : 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
      s = Math.max(s, .72); const l = .56, c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2, k = Math.floor(h / 60) % 6, q = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k].map(v => Math.round((v + m0) * 255));
      m.style.setProperty('--cp', q.join(',')); return q.join(','); }).join(' | '))); await pg.waitForTimeout(300); }
    await pg.screenshot({path: path.join(OUT, name), clip: {x: 0, y: 0, width: vw, height: clipH || vh}}); await pg.close();
  };
  await Promise.all([
    run('dusk', NIGHT, 1440, 1180, 'n2-desk-night.png'), run('light', '', 1440, 900, 'n2-desk-light-a.png', 700), run('light', LIGHT, 1440, 900, 'n2-desk-light-b.png', 700),
    run('dusk', '', 390, 844, 'n2-ph-dusk-a.png'), run('dusk', NIGHT, 390, 844, 'n2-ph-dusk-b.png'), run('light', '', 390, 844, 'n2-ph-light-a.png'), run('light', LIGHT, 390, 844, 'n2-ph-light-b.png')]);
  const col = (t, s, f) => `<div class="c"><b>${t} <span>${s}</span></b><img src="${uri(f)}"></div>`;
  const head = w => `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap">
<style>*{box-sizing:border-box;margin:0}body{width:${w}px;background:#E9E7E2;font:500 16px/1.4 "Instrument Sans",system-ui,sans-serif;color:#17161A;padding:36px 40px 40px}
h1{font-weight:700;font-size:28px;letter-spacing:-.01em}p{color:#48454F;margin-top:6px;max-width:1000px}h2{font-weight:700;font-size:20px;margin-top:34px}
.g{display:grid;gap:22px;margin-top:22px}.c b{display:block;font-weight:700;font-size:17px;margin-bottom:10px}.c b span{font-weight:500;color:#48454F}
img{display:block;width:100%;border-radius:10px;box-shadow:0 0 0 1px rgba(23,22,26,.12)}</style>`;
  { const f = path.join(OUT, 'nastyplot-day-fixed.html'); fs.writeFileSync(f, head(1520) + `<h1>Day mode, colours fixed, and the phone button fix</h1><p>Every Pokémon now has its own colour on the floor at the same strength: pale ones (Sneasler, Whimsicott, Kingambit) no longer vanish. Night on the phone: Save Team is shorter and a calmer blue.</p>
<div class="g">${col('Day, desktop', 'all six grounded in their own colour', 'n2-desk-light-b.png')}</div>
<div class="g" style="grid-template-columns:repeat(3,390px);justify-content:center">${col('Day, phone', '', 'n2-ph-light-b.png')}${col('Night, phone', 'calmer Save Team', 'n2-ph-dusk-b.png')}${col('Night, phone, before', 'for comparison', 'n2-ph-dusk-b0.png')}</div>`);
    const pg = await (await b.newContext({viewport: {width: 1520, height: 900}, deviceScaleFactor: 1})).newPage(); await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
    await pg.screenshot({path: path.join(OUT, 'nastyplot-day-fixed.png'), fullPage: true}); await pg.close(); }
  const sheets = [['nastyplot-night-v2-desktop.png', 1520, `<h1>Night mode, second pass, and the same ideas in light</h1><p>Night: Save Team is now the one blue action, the six stand on a lit floor line, and the Set panel is dark glass lit by Garchomp. Light: the blue pool is gone, the six share the same floor, and each Pokémon is grounded by a tight shadow in a small pool of its own colour.</p>
<h2>Night</h2><div class="g">${col('Night, second pass', '', 'n2-desk-night.png')}</div>
<h2>Light</h2><div class="g">${col('Light, now', 'blue pool behind the score', 'n2-desk-light-a.png')}${col('Light, with the same ideas', 'shared floor, grounded Pokémon, no pool', 'n2-desk-light-b.png')}</div>`],
    ['nastyplot-night-v2-phone.png', 1740, `<h1>Phone: now and proposed, dark and light</h1><p>First screen of My Team on a phone. On phones the six sit in two rows, so each Pokémon carries its own pool of light and there is no single floor line.</p>
<div class="g" style="grid-template-columns:repeat(4,390px)">${col('Dusk, now', '', 'n2-ph-dusk-a.png')}${col('Night, proposed', '', 'n2-ph-dusk-b.png')}${col('Light, now', '', 'n2-ph-light-a.png')}${col('Light, proposed', '', 'n2-ph-light-b.png')}</div>`]];
  for (const [name, w, body] of sheets) { const f = path.join(OUT, name.replace('.png', '.html')); fs.writeFileSync(f, head(w) + body);
    const pg = await (await b.newContext({viewport: {width: w, height: 900}, deviceScaleFactor: 1})).newPage(); await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
    await pg.screenshot({path: path.join(OUT, name), fullPage: true}); await pg.close(); }
  await b.close();
})();
