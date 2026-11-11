// Final reference pictures for the rebuild session: My Team, day and night, desktop and phone, with every agreed change in one place.
// Overrides on a copy of the rebuild's My Team mock-up (d6/myteam.html). Usage: node ref.cjs <d6Dir> <outDir>
const fs = require('fs'), path = require('path'), {createRequire} = require('module'), {NIGHT, LIGHT} = require('./night2.cjs');
const [D6, OUT] = process.argv.slice(2), uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64');
// selected Pokemon: no bracket, no red name; it stands on the tilted colour panel in its own (normalised) colour and steps forward a little
const SEL = `.mon.on::after{display:none}.mon.on .nm{color:var(--ink);font-weight:800}
.mon.on::before{content:"";position:absolute;left:6px;right:6px;top:22px;width:auto;height:86px;border:0;transform:skewY(-7deg);border-radius:6px;
  background:linear-gradient(150deg,rgba(var(--cp),.9),rgba(var(--cp),.55));box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 1px 2px rgba(30,20,50,.12),0 8px 14px -6px rgba(30,20,50,.22),0 22px 30px -18px rgba(30,20,50,.3)}
.mon.on img{transform:scale(1.08);transform-origin:50% 100%}.mon.on .sh{opacity:.55}
@media (max-width:699px){.mon.on::before{top:16px;height:66px;left:4px;right:4px}}`;
const NIGHT2 = `
/* night corrections: a panel that reads, a floor that registers, normalised colour everywhere */
.mon.on::before{background:linear-gradient(150deg,rgba(var(--cp),.78),rgba(var(--cp),.34));box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 0 0 1px rgba(var(--cp),.25),0 14px 30px -12px rgba(var(--cp),.55)}
.mon.on .sh{opacity:1}
.mon .sh{background:radial-gradient(closest-side,rgba(var(--cp),.9),rgba(var(--cp),.32) 45%,transparent)}
.mon img{filter:drop-shadow(0 0 .6px rgba(255,255,255,.55)) drop-shadow(0 -1px 5px rgba(var(--cp),.3))}
@media (min-width:700px){.six::before{background:linear-gradient(90deg,transparent,rgba(214,218,255,.3) 12%,rgba(214,218,255,.3) 88%,transparent) top/100% 1px no-repeat,radial-gradient(52% 100% at 50% 0,rgba(150,160,255,.2),transparent)}}
.set .panel{background:linear-gradient(150deg,rgba(var(--c1),.78),rgba(var(--c1),.34))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 0 0 1px rgba(var(--c1),.25),0 24px 50px -24px rgba(var(--c1),.6)!important}
.set .panel::after{opacity:.3}`;
const NORM = () => [...document.querySelectorAll('.band .mon')].map(m => { const [r, g, b] = m.style.getPropertyValue('--c').split(',').map(v => +v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l0 = (mx + mn) / 2; let h = 0, s = d ? d / (1 - Math.abs(2 * l0 - 1)) : 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
  s = Math.max(s, .72); const l = .56, c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2, k = Math.floor(h / 60) % 6, q = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k].map(v => Math.round((v + m0) * 255));
  m.style.setProperty('--cp', q.join(',')); return m.querySelector('.nm').textContent + ' ' + m.style.getPropertyValue('--c') + ' -> ' + q.join(','); });
module.exports = {SEL, NIGHT2, NORM};
if (require.main === module) (async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  const run = async (theme, vw, vh, name) => {
    const pg = await (await b.newContext({viewport: {width: vw, height: vh}, deviceScaleFactor: 2})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
    await pg.goto('file:///' + path.join(D6, 'myteam.html').replace(/\\/g, '/') + '#' + theme); await pg.evaluate(() => document.fonts.ready);
    await pg.waitForFunction(() => document.querySelector('.band .mon'), null, {timeout: 20000}); await pg.waitForTimeout(600);
    await pg.addStyleTag({content: theme === 'dusk' ? NIGHT + SEL + NIGHT2 : LIGHT + SEL}); const n = await pg.evaluate(NORM); if (name.includes('desktop-day')) console.log(n.join('\n')); await pg.waitForTimeout(300);
    await pg.screenshot({path: path.join(OUT, name), clip: {x: 0, y: 0, width: vw, height: vh}}); await pg.close();
  };
  await Promise.all([run('light', 1440, 1180, 'nastyplot-ref-myteam-desktop-day.png'), run('dusk', 1440, 1180, 'nastyplot-ref-myteam-desktop-night.png'), run('light', 390, 1500, 'nastyplot-ref-myteam-phone-day.png'), run('dusk', 390, 1500, 'nastyplot-ref-myteam-phone-night.png')]);
  const col = (t, f) => `<div class="c"><b>${t}</b><img src="${uri(f)}"></div>`;
  const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap">
<style>*{box-sizing:border-box;margin:0}body{width:2360px;background:#E9E7E2;font:500 16px/1.4 "Instrument Sans",system-ui,sans-serif;color:#17161A;padding:36px 40px 40px}
h1{font-weight:700;font-size:28px;letter-spacing:-.01em}p{color:#48454F;margin-top:6px}
.g{display:grid;gap:22px;margin-top:22px;grid-template-columns:1440px 390px 390px;align-items:start}.c b{display:block;font-weight:700;font-size:17px;margin-bottom:10px}
img{display:block;width:100%;border-radius:10px;box-shadow:0 0 0 1px rgba(23,22,26,.12)}</style>
<h1>My Team reference: day and night, desktop and phone</h1><p>Overview of the four reference pictures. Each is also saved on its own at full sharpness.</p>
<div class="g"><div>${col('Desktop, day', 'nastyplot-ref-myteam-desktop-day.png')}<div style="height:22px"></div>${col('Desktop, night', 'nastyplot-ref-myteam-desktop-night.png')}</div>${col('Phone, day', 'nastyplot-ref-myteam-phone-day.png')}${col('Phone, night', 'nastyplot-ref-myteam-phone-night.png')}</div>`;
  const f = path.join(OUT, 'nastyplot-ref-overview.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 2360, height: 900}, deviceScaleFactor: 1})).newPage(); await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
  await pg.screenshot({path: path.join(OUT, 'nastyplot-ref-overview.png'), fullPage: true}); await b.close();
})();
