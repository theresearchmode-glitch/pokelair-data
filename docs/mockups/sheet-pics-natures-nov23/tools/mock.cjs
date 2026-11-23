// Nov 23 mock-up: a picture on each info sheet (move type symbol, Ability ID photo / emblem, item picture).
// Injects into the live sheets of the downloaded Preview (preview2). Reference only, not code to paste in.
// Usage: node mock.cjs <outdir>
const {chromium} = require('C:/Users/simra/code/pl-pcrun/node_modules/playwright'); const {open} = require('./pv-shot.cjs');
const CSS = `
.pnrow{display:flex;align-items:center;gap:20px;position:relative;z-index:1}
.pnrow .is-tn{min-width:0}
/* MOVE A: the type seal, a slanted tile in a deeper shade of the type colour with the white symbol */
.mvseal{flex:none;width:84px;height:84px;display:grid;place-items:center;transform:skewX(-10deg);border-radius:10px;
  background:color-mix(in srgb,var(--c) 62%,#000);box-shadow:inset 0 0 0 2px rgba(255,255,255,.28),0 6px 14px -6px rgba(0,0,0,.5)}
.mvseal svg{width:52px;height:52px;fill:#fff;transform:skewX(10deg)}
/* MOVE B: a giant faint type symbol behind the tab, in place of the outlined letters */
.is-tab.mvB .gh{display:none}
.mvwm{position:absolute;right:170px;top:50%;width:230px;height:230px;transform:translateY(-50%) rotate(-8deg);fill:rgba(255,255,255,.16);pointer-events:none}
.is-tab.mvB .is-sub .k-tyi{width:22px;height:22px}
.is-tab.mvB .is-sub .np-type{font-size:var(--t17)}
/* ABILITY A: the ID photo, the Pokemon most often seen with it, stapled to the card */
.idph{flex:none;width:92px;transform:rotate(-3deg);background:#F4F0EA;border-radius:4px;padding:6px 6px 4px;box-shadow:0 6px 14px -6px rgba(0,0,0,.6);position:relative}
.idph .ph{height:84px;display:grid;place-items:center;background:linear-gradient(180deg,#DCE7F0,#C9D6E2);border-radius:2px;overflow:hidden}
.idph .ph img{width:84px;height:84px;object-fit:contain}
.idph small{display:block;font:600 10px/1.3 var(--b);letter-spacing:.06em;color:#48454F;text-align:center;margin-top:4px;text-transform:uppercase}
.idph small b{display:block;font:700 11px/1.2 var(--b);color:#17161A;letter-spacing:0;text-transform:none}
.idph:before{content:"";position:absolute;top:-4px;left:50%;width:26px;height:5px;margin-left:-13px;border-radius:2px;background:#9AA3AD;box-shadow:inset 0 -1px 0 rgba(0,0,0,.25)}
/* ABILITY B: the emblem, a ring with the type the Ability is about, or its effect in two words */
.abem{flex:none;width:84px;height:84px;border-radius:50%;display:grid;place-items:center;border:3px solid var(--logo-blue);background:rgba(0,120,191,.14);color:#fff;text-align:center}
.abem svg{width:46px;height:46px;fill:#fff}
.abem span{font:italic 800 15px/1.05 var(--u);font-synthesis:style}
.abem span i{display:block;font-style:normal;font-size:20px}
/* ITEM: the picture in an evidence bag clipped to the tag */
.evbag{flex:none;width:92px;height:96px;position:relative;border-radius:6px;background:rgba(255,255,255,.55);border:1.5px solid rgba(60,50,20,.35);
  box-shadow:inset 0 8px 0 -4px rgba(255,255,255,.7);display:grid;place-items:center;transform:rotate(3deg)}
.evbag:before{content:"";position:absolute;left:6px;right:6px;top:9px;border-top:2px dashed rgba(60,50,20,.35)}
.evbag svg,.evbag img{width:62px;height:62px;margin-top:10px}
.evbag em{position:absolute;bottom:-9px;right:-10px;font:italic 800 11px/1 var(--u);font-synthesis:style;background:#C41E35;color:#fff;padding:3px 6px;transform:rotate(-6deg)}
@media (max-width:699.98px){.mvseal,.abem{width:64px;height:64px}.mvseal svg{width:40px;height:40px}.abem svg{width:36px;height:36px}.idph{width:76px}.idph .ph{height:68px}.idph .ph img{width:68px;height:68px}
  .evbag{width:72px;height:76px}.evbag svg,.evbag img{width:48px;height:48px}.mvwm{right:-30px;width:170px;height:170px}.pnrow{gap:14px}}
`;
// Ability B: what each sample Ability is "about" (a hand-written map would be needed for every Ability)
const AB_EM = {Levitate: {ty: 'Ground'}, 'Flash Fire': {ty: 'Fire'}, Drought: {ty: 'Fire'}, Intimidate: {txt: '<i>ATK ▼</i>both foes'}};
// Item B: our own drawn symbols (sample: Focus Sash = a knotted band, Sitrus Berry = a round fruit with a leaf)
const IT_DRAW = {'Focus Sash': `<svg viewBox="0 0 64 64"><path d="M6 22c10 6 20 8 26 8s16-2 26-8l-2 10c-9 5-17 7-24 7S17 37 8 32z" fill="#D2411E"/><path d="M28 30l-8 26 8-5 4 8 4-29z" fill="#B33416"/><circle cx="32" cy="32" r="6" fill="#E8573A" stroke="#7A1F0C" stroke-width="2"/></svg>`,
  'Sitrus Berry': `<svg viewBox="0 0 64 64"><circle cx="32" cy="38" r="20" fill="#F2C230" stroke="#8A6A00" stroke-width="2"/><path d="M32 18c2-8 10-12 18-10-2 8-10 12-18 10z" fill="#3E9E4A"/><path d="M24 34a8 8 0 0 1 8-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/></svg>`};
const VARIANT = {
  'move-A': async (p, n) => p.evaluate(n => { V2.openMoveSheet(n); const tab = document.querySelector('.np-sheet .is-tab'), ty = document.querySelector('.np-sheet .is2').getAttribute('style').match(/ty-(\w+)/)[1];
    wrap(tab, `<div class="mvseal" aria-hidden="true"><svg viewBox="0 0 256 256"><use href="#kty-${ty}"/></svg></div>`); }, n),
  'move-B': async (p, n) => p.evaluate(n => { V2.openMoveSheet(n); const tab = document.querySelector('.np-sheet .is-tab'), ty = document.querySelector('.np-sheet .is2').getAttribute('style').match(/ty-(\w+)/)[1];
    tab.classList.add('mvB'); tab.insertAdjacentHTML('afterbegin', `<svg class="mvwm" viewBox="0 0 256 256" aria-hidden="true"><use href="#kty-${ty}"/></svg>`); }, n),
  'ability-A': async (p, n) => p.evaluate(n => { V2.openAbilitySheet(n); const s = document.querySelector('.np-sheet'), tab = s.querySelector('.is-tab'), u = s.querySelector('.is-u');
    const who = u.dataset.v2mon, pct = u.querySelector('em').textContent, img = u.querySelector('img').getAttribute('src');
    wrap(tab, `<div class="idph" aria-hidden="true"><div class="ph"><img src="${img}" alt=""></div><small>Most seen<b>${V2.esc(V2.disp(who))}</b></small></div>`); }, n),
  'ability-B': async (p, n, em) => p.evaluate(([n, em]) => { V2.openAbilitySheet(n); const tab = document.querySelector('.np-sheet .is-tab');
    wrap(tab, `<div class="abem" aria-hidden="true">${em.ty ? `<svg viewBox="0 0 256 256"><use href="#kty-${em.ty}"/></svg>` : `<span>${em.txt}</span>`}</div>`); }, [n, AB_EM[n]]),
  'item-B': async (p, n) => p.evaluate(([n, svg]) => { V2.openItemSheet(n); const tab = document.querySelector('.np-sheet .is-tab');
    wrap(tab, `<div class="evbag" aria-hidden="true">${svg}</div>`); }, [n, IT_DRAW[n]]),
};
(async () => { const out = process.argv[2]; const b = await chromium.launch();
  const jobs = [['move-A', 'Rock Slide'], ['move-B', 'Rock Slide'], ['move-A', 'Tailwind'], ['move-B', 'Tailwind'],
    ['ability-A', 'Intimidate'], ['ability-B', 'Intimidate'], ['ability-A', 'Levitate'], ['ability-B', 'Levitate'],
    ['item-B', 'Focus Sash'], ['item-B', 'Sitrus Berry']];
  await Promise.all([[1440, 900], [390, 844]].map(async ([w, h]) => { const {p} = await open(b, w, h, '#team');
    await p.addStyleTag({content: CSS}); await p.evaluate(() => { window.wrap = (tab, html) => { const tn = tab.querySelector('.is-tn'), r = document.createElement('div'); r.className = 'pnrow'; tn.replaceWith(r); r.insertAdjacentHTML('afterbegin', html); r.appendChild(tn); }; });
    for (const theme of ['day', 'night']) { if (theme === 'night') await p.evaluate(() => document.documentElement.dataset.theme = 'night');
      for (const [v, n] of jobs) { if (theme === 'night' && w < 700) continue;
        await VARIANT[v](p, n); await p.waitForTimeout(700); const s = await p.$('.np-sheet'); const bb = await s.boundingBox();
        const f = `${out}/${v}-${n.replace(/ /g, '-').toLowerCase()}-${w}${theme === 'night' ? '-night' : ''}.png`;
        await p.screenshot({path: f, clip: {x: bb.x, y: bb.y, width: bb.width, height: Math.min(w < 700 ? 844 : 380, bb.height)}});
        await p.evaluate(() => V2.closeSheet && V2.closeSheet()); await p.waitForTimeout(300); console.log('wrote', f); } } }));
  await b.close(); })();
