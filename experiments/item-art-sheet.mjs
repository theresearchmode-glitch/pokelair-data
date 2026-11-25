// The item drawings review sheet (Dossier step 4, part 1, Nov 23): every drawing in V2.ITEM_ART at 96px and 48px, in the evidence bag,
// on the manila of the item tag, day and night; plus one item sheet with the bag in place (a mock-up: the sheet is not wired yet).
// Needs a --v2 --preview-data --art=../src/v2/art/ build and out/info.json (the shares).
//   node experiments/item-art-sheet.mjs [outdir]     (default docs/rebuild/pics/nov23/itemart)
import {chromium} from 'playwright'; import path from 'node:path'; import fs from 'node:fs';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'), OUT = process.argv[2] || 'docs/rebuild/pics/nov23/itemart';
fs.mkdirSync(OUT, {recursive: true});
const I = JSON.parse(fs.readFileSync('out/info.json', 'utf8')), share = n => I.it[n] ? 100 * I.it[n][0] / I.N : 0;
const TOP = Object.entries(I.it).filter(([n]) => !/^(Safety Goggles|Covert Cloak|Clear Amulet|Loaded Dice|Choice Band|Choice Specs|Assault Vest)$/.test(n))
  .sort((a, b) => b[1][0] - a[1][0]).slice(0, 20).map(([n]) => n);
const FAM = ['Garchompite', 'Charizardite X', 'Colbur Berry', 'Occa Berry', 'Electric Seed', 'Misty Seed', 'Damp Rock', 'Heat Rock', 'Icy Rock', 'Smooth Rock'];
// the evidence bag (HANDOFF / tools/mock.cjs), sized by --sz (the drawing's size); colours from tokens only
const CSS = `
.evbag{--sz:62px;flex:none;position:relative;width:calc(var(--sz)*1.48);height:calc(var(--sz)*1.55);display:grid;place-items:center;transform:rotate(3deg);
  border-radius:var(--r-m);background:var(--ev-bag);border:1.5px solid var(--ev-bag-line);box-shadow:inset 0 8px 0 -4px var(--ev-bag-sheen)}
.evbag::before{content:'';position:absolute;left:calc(var(--sz)*.1);right:calc(var(--sz)*.1);top:calc(var(--sz)*.145);border-top:2px dashed var(--ev-bag-line)}
.evbag .ia{width:var(--sz);height:var(--sz);margin-top:calc(var(--sz)*.16)}
.evbag.s96{--sz:96px}.evbag.s48{--sz:48px}
#iaRev{position:fixed;inset:0;z-index:9999;overflow:auto;background:var(--bg);color:var(--ink);padding:var(--s10) var(--s12) var(--s12);font-family:var(--b)}
#iaRev h1{font:italic 800 var(--t34)/1.1 var(--u);font-synthesis:style;margin:0 0 var(--s2)}
#iaRev .lede{font-size:var(--t16);line-height:1.5;color:var(--ink-2);margin:0 0 var(--s6);max-width:72ch}
#iaRev h2{font:italic 800 var(--t22)/1.2 var(--u);font-synthesis:style;margin:var(--s8) 0 var(--s4);display:flex;align-items:baseline;gap:var(--s3)}
#iaRev h2 span{font:500 var(--t15)/1.5 var(--b);color:var(--ink-3)}
.iag{display:grid;grid-template-columns:repeat(5,1fr);gap:var(--s4)}
.iac{background:var(--is-manila);color:var(--is-tag-ink);border-radius:var(--r-l);padding:var(--s4) var(--s4) var(--s3);display:flex;flex-direction:column;gap:var(--s3)}
.iac .pr{display:flex;align-items:flex-end;justify-content:space-around;gap:var(--s3);min-height:160px}
.iac .nm{display:flex;align-items:baseline;justify-content:space-between;gap:var(--s2);border-top:2px dashed var(--is-tear);padding-top:var(--s2)}
.iac .nm b{font:italic 800 var(--t16)/1.2 var(--u);font-synthesis:style}
.iac .nm em{font:italic 800 var(--t15)/1 var(--u);font-synthesis:style;font-style:italic;white-space:nowrap}
.iac .nm small{display:block;font:600 var(--t13)/1.3 var(--b);color:var(--cpn-fine)}
.iac .rk{font:italic 800 var(--t13)/1 var(--u);font-synthesis:style;background:var(--is-tag-ink);color:var(--is-manila);padding:var(--s1) var(--s2);align-self:flex-start;transform:skewX(-10deg)}
/* the bag in place on the tag (mock-up): left of the name, as the seal and the ID photo */
.is-pn .evbag{margin:0 var(--s1)}
@media (max-width:699.98px){.is-pn .evbag{--sz:48px}}`;
const KIND = n => / Berry$/.test(n) ? 'Berry: the shared berry shape' : / Seed$/.test(n) ? 'Seed: the shared seed shape' : / Rock$/.test(n) ? 'Rock: the shared rock shape'
  : /(ite|inite)( [XYZ])?$/.test(n) && n !== 'Eviolite' ? 'Mega Stone: the shared stone shape' : 'Its own drawing';
const b = await chromium.launch();
for (const theme of ['day', 'night']) {
  const p = await b.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1});
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
  if (theme === 'night') await p.evaluate(() => document.documentElement.dataset.theme = 'night');
  await p.addStyleTag({content: CSS});
  const types = await p.evaluate(() => Object.fromEntries(['Charizardite Y', 'Raichunite Y', 'Floettite', 'Staraptite', 'Salamencite', 'Garchompite Z', 'Golisopite', 'Tyranitarite', 'Garchompite'].map(n => [n, V2.iaMegaType(n)])));
  if (theme === 'day') console.log('stone types from the roster:', JSON.stringify(types));
  const rows = L => L.map((n, i) => ({n, i, pct: share(n), kind: KIND(n)}));
  const missing = await p.evaluate(([top, fam, css]) => { V2.kTySprite();
    const E = V2.esc, miss = [];
    const card = (r, rank) => { const a = V2.itemArt(r.n); if (!a) miss.push(r.n);
      return `<div class="iac">${rank ? `<span class="rk">#${r.i + 1}</span>` : ''}<div class="pr"><div class="evbag s96">${a}</div><div class="evbag s48">${a}</div></div>`
        + `<div class="nm"><div><b>${E(r.n)}</b><small>${E(r.kind)}</small></div><em>${r.pct === 0 ? 'unused' : r.pct < 0.1 ? '<0.1%' : (r.pct >= 1 ? Math.round(r.pct) : r.pct.toFixed(1)) + '%'}</em></div></div>`; };
    document.body.insertAdjacentHTML('beforeend', `<div id="iaRev"><h1>Item drawings. First 20.</h1>`
      + `<p class="lede">Our own flat symbols in the evidence bag, no game art. Each drawing at 96px and at 48px (the phone size). % = share of tournament teams, Online tournaments, last 28 days.</p>`
      + `<h2>The 20 most used <span>items on tournament teams</span></h2><div class="iag">${top.map(r => card(r, true)).join('')}</div>`
      + `<h2>The shared shapes <span>one shape per family; only the colour and the mark change</span></h2><div class="iag">${fam.map(r => card(r, false)).join('')}</div></div>`);
    return miss; }, [rows(TOP), rows(FAM), CSS]);
  if (missing.length) console.log('NO DRAWING:', missing.join(', '));
  await p.waitForTimeout(800);
  const h = await p.evaluate(() => { const r = document.getElementById('iaRev'); r.style.position = 'absolute'; r.style.height = 'auto'; r.style.bottom = 'auto'; return r.scrollHeight; });
  await p.setViewportSize({width: 1440, height: h}); await p.waitForTimeout(400);
  await p.screenshot({path: `${OUT}/sheet-${theme}.png`, clip: {x: 0, y: 0, width: 1440, height: h}}); console.log('wrote', `${OUT}/sheet-${theme}.png`);
  // the item sheet mock-up: the bag in place on the tag (Life Orb)
  await p.evaluate(() => document.getElementById('iaRev').remove()); await p.setViewportSize({width: 1440, height: 900});
  for (const [w, hh] of theme === 'day' ? [[1440, 900], [390, 844]] : [[1440, 900]]) {
    await p.setViewportSize({width: w, height: hh});
    await p.evaluate(n => { V2.openItemSheet(n); const tab = document.querySelector('.np-sheet .is-tab'), tn = tab.querySelector('.is-tn'), r = document.createElement('div');
      r.className = 'is-pn'; tn.replaceWith(r); r.insertAdjacentHTML('afterbegin', `<div class="evbag" aria-hidden="true">${V2.itemArt(n)}</div>`); r.appendChild(tn); }, 'Life Orb');
    await p.waitForTimeout(900); const s = await p.$('.np-sheet'), bb = await s.boundingBox();
    const f = `${OUT}/sheet-mock-life-orb-${w}-${theme}.png`;
    await p.screenshot({path: f, clip: {x: bb.x, y: bb.y, width: bb.width, height: Math.min(w < 700 ? 700 : 420, bb.height)}}); console.log('wrote', f);
    await p.evaluate(() => V2.closeSheet && V2.closeSheet()); await p.waitForTimeout(300); }
  await p.close(); }
await b.close();
