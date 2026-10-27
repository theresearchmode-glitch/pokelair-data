// The NastyPlot logo on a transparent background (dark and light versions), plus the sprite file ids the video uses.
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), dir = process.argv[2];
const page = APP + 'logo.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
for (const scheme of ['dark', 'light']) { const pg = await (await b.newContext({viewport: {width: 900, height: 500}, deviceScaleFactor: 4, colorScheme: scheme})).newPage();
  await pg.goto('file://' + page); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { const src = document.querySelector('.hhlogo') || document.querySelector('.logo'); const w = document.createElement('div'); w.id = 'L'; w.innerHTML = src.innerHTML;
    w.style.cssText = 'position:fixed;left:40px;top:40px;z-index:99999;padding:30px 40px;background:transparent'; w.querySelector('.np').style.setProperty('--s', '1.2');
    document.body.appendChild(w); for (const el of document.body.children) if (el !== w) el.style.visibility = 'hidden'; document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent'; });
  await pg.addStyleTag({content: 'html,body,body::before,body::after{background:transparent!important;background-image:none!important}'});
  await pg.waitForTimeout(400); await (await pg.$('#L')).screenshot({path: `${dir}/logo_${scheme}.png`, omitBackground: true}); }
const pg = await (await b.newContext()).newPage(); await pg.goto('file://' + page); await pg.waitForTimeout(2000);
const ids = await pg.evaluate(() => window.__ev("Object.fromEntries(['Annihilape','Charizard-Mega-Y','Kingambit','Floette-Mega','Kommo-o','Sneasler','Whimsicott','Basculegion','Garchomp','Garchomp-Mega','Snorlax','Scrafty','Basculegion-F','Incineroar','Rillaboom','Raichu-Mega-Y','Staraptor-Mega','Salamence-Mega','Gholdengo','Primarina','Archaludon','Pelipper','Tyranitar-Mega','Dragonite'].map(n=>[n,SPRITE_ID[n]]))"));
fs.writeFileSync(`${dir}/sprites.json`, JSON.stringify(ids)); console.log(ids); await b.close(); fs.unlinkSync(page);
