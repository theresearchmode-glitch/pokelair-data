// Battle "The field", drawn with the site's REAL parts (kit header, plan steps, kit roster cards, move tickets with type symbols, the Pokémon
// page's damage bars, kit tags) inside the built page, then screenshotted. Mock-up only: nothing in the app changes.
const {chromium} = require('playwright');
(async () => {
  const [page, out] = process.argv.slice(2), b = await chromium.launch();
  for (const [w, th, tag] of [[1440, 'day', 'd'], [1440, 'night', 'n'], [390, 'day', 'p'], [390, 'night', 'pn']]) {
    const c = await b.newContext({viewport: {width: w, height: 900}, deviceScaleFactor: w < 700 ? 2 : 1, hasTouch: w < 700}), p = await c.newPage();
    await p.addInitScript(() => { window.__PL_TEST = 1; });
    await p.goto('file://' + page + '#battle'); await p.waitForTimeout(3000); await p.evaluate(t => V2.setTheme(t), th); await p.waitForTimeout(400);
    await p.evaluate(() => {
      const H = [
        {n: 1, side: 'them', who: 'Sneasler', from: 'Sneasler', to: ['Charizard-Mega-Y'], mv: 'Fake Out', sp: '172 Speed · +3 priority', lo: 0, hi: 0, tag: ['bad', 'Flinch'], line: 'If they have it, your Charizard loses its turn. Protect blocks it.'},
        {n: 2, side: 'them', who: 'Incineroar', from: 'Incineroar', to: ['Garchomp'], mv: 'Fake Out', sp: '80 Speed · +3 priority', lo: 0, hi: 0, tag: ['bad', 'Flinch'], line: 'If they have it, Garchomp loses its turn.'},
        {n: 3, side: 'you', who: 'Garchomp', from: 'Garchomp', to: ['Sneasler', 'Incineroar'], mv: 'Earthquake', sp: '231 Speed', lo: 76, hi: 90, tag: ['neutral', '2HKO'], line: 'Hits both: up to 90% of Sneasler. Only if it wasn\'t flinched.'},
        {n: 4, side: 'you', who: 'Mega Charizard Y', from: 'Charizard-Mega-Y', to: ['Sneasler'], mv: 'Weather Ball', sp: '167 Speed · in sun', lo: 96, hi: 113, tag: ['good', '75% KO'], line: 'Fire in the sun: 75% chance to KO in one hit.'}];
      const card = (n, side) => `<div class="bf-c bf-${side}" data-bf="${n}">${V2.kCard(n)}</div>`;
      const ty = {"Fake Out": 'Normal', Earthquake: 'Ground', 'Weather Ball': 'Fire'};
      const calls = H.map(h => `<li class="bf-call bf-${h.side}"><span class="bf-n u">${h.n}</span><div class="bf-cb"><p class="bf-who"><em>${h.side === 'you' ? 'You' : 'Them'}</em> · ${h.who} · ${h.sp}</p>${h.mv === 'Weather Ball' ? V2.kMove(h.mv).replace(/var\(--ty-Normal\)/, 'var(--ty-Fire)').replace(/kty-Normal/, 'kty-Fire').replace(/<span>Normal<\/span>/, '<span>Fire</span>') : V2.kMove(h.mv)}
        ${h.hi ? `<span class="pk-dmg bf-dmg" style="--lo:${h.lo};--hi:${h.hi};--tc:var(--tyn-${ty[h.mv]})"><i></i></span>` : ''}<p class="bf-line">${V2.kTag(h.tag[0], h.tag[1])} ${h.line}</p></div></li>`).join('');
      const css = `<style>
        .bf{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:var(--s8);align-items:start}
        .bf-field{position:relative;padding:var(--s6) var(--s6) var(--s5);background:var(--mtf-frame);color:var(--mtf-on-frame);box-shadow:8px 8px 0 var(--mtf-drop);overflow:visible}
        .bf-rows{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-areas:"k t1 t2" "y1 y2 k2";row-gap:var(--s10);column-gap:var(--s5);padding-top:var(--s8)}
        .bf-k{font:800 var(--t13)/1 var(--b);letter-spacing:.08em;text-transform:uppercase}
        .bf-k{align-self:center;justify-self:center;font-size:var(--t15)}.bf-k.t{grid-area:k;color:#FF8193}.bf-k.y{grid-area:k2;color:#62BEF7}
        .bf-c[data-bf="Sneasler"]{grid-area:t1}.bf-c[data-bf="Incineroar"]{grid-area:t2}.bf-c[data-bf="Charizard-Mega-Y"]{grid-area:y1}.bf-c[data-bf="Garchomp"]{grid-area:y2}
        .bf-gap{grid-row:2;grid-column:1/-1;height:var(--s10)}
        .bf-svg{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:visible}
        .bf-pin{position:absolute;z-index:3;width:34px;height:34px;display:grid;place-items:center;border-radius:50%;font:800 var(--t15)/1 var(--u);font-style:italic;color:#fff;border:3px solid var(--mtf-frame);transform:translate(-50%,-50%)}
        .bf-pin.them{background:var(--k-nasty)}.bf-pin.you{background:var(--k-plot)}
        .bf-calls{list-style:none;margin:0;padding:0;display:grid;gap:var(--s4)}
        .bf-call{display:grid;grid-template-columns:36px minmax(0,1fr);gap:var(--s3);align-items:start}
        .bf-n{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;font-size:var(--t15);color:#fff}
        .bf-them .bf-n{background:var(--k-nasty)}.bf-you .bf-n{background:var(--k-plot)}
        .bf-who{margin:0 0 var(--s1);font:600 var(--t13)/1.3 var(--b);color:var(--k-ink2)}.bf-who em{font-style:normal;font-weight:800}
        .bf-them .bf-who em{color:var(--k-nasty-text)}.bf-you .bf-who em{color:var(--k-plot-text)}
        .bf-dmg{display:block;margin-top:var(--s2)}
        .bf-line{margin:var(--s2) 0 0;font:500 var(--t15)/1.4 var(--b);color:var(--k-ink2)}
        .bf-verd{margin-top:var(--s6);display:flex;align-items:baseline;gap:var(--s4);flex-wrap:wrap}.bf-verd b{font-size:var(--t34);color:var(--k-plot-text)}.bf-rg{width:100%;font:800 var(--t13)/1 var(--b);letter-spacing:.08em;text-transform:uppercase;color:var(--k-ink2)}.bf-verd span{font:600 var(--t15)/1.4 var(--b);color:var(--k-ink2)}
        @media (max-width:699.98px){.bf{grid-template-columns:minmax(0,1fr)}.bf-field{padding:var(--s4) var(--s3)}.bf-rows{column-gap:var(--s2);row-gap:var(--s4)}.bf-gap{height:var(--s6)}.bf-pin{width:28px;height:28px;font-size:var(--t13)}}
      </style>`;
      const html = `${css}<section class="bt-mock">${V2.kHead({kicker: 'BATTLE A TEAM · TEAM PREVIEW', h1Html: 'Bring these four. <em>Lead the pair.</em>', lead: 'Turn one, plotted on the field: who hits whom, in the order the game runs it.'})}
        ${V2.kPlan(V2.kStep(1, 'Turn one, plotted.', 'your lead below, their likely lead above', `<div class="bf"><div class="bf-field"><div class="bf-rows"><span class="bf-k t">Them</span>${card('Sneasler', 'them')}${card('Incineroar', 'them')}${card('Charizard-Mega-Y', 'you')}${card('Garchomp', 'you')}<span class="bf-k y">You</span></div><svg class="bf-svg"></svg></div>
          <div><ol class="bf-calls">${calls}</ol><p class="bf-verd"><small class="bf-rg">Real games</small><b class="u">Favoured.</b><span>13,000 ladder battles: this lead won more than its players' rating predicted.</span></p></div></div>`)
        + V2.kStep(2, 'The Read', 'what they bring, what to watch', '<p class="bf-line">(today\'s The Read and its three tabs, unchanged)</p>') + V2.kStep(3, 'Your Games', 'log how it went', '<p class="bf-line">(today\'s Your Games, unchanged)</p>'))}
        <p>${V2.kGo('CHANGE THEIR SIX.', {href: '#battle'})}</p></section>`;
      const m = document.querySelector('#main'); m.innerHTML = `<div class="ra">${html}</div>`; V2.kTySprite && V2.kTySprite();
      document.querySelectorAll('.bt-mock .k-h1 em').forEach(e => { e.style.fontStyle = 'inherit'; e.style.color = 'var(--k-plot-text)'; });
      // the plot line: one dashed curve per hit, from the attacker's card to each target, numbered where it bends
      const f = document.querySelector('.bf-field'), svg = f.querySelector('.bf-svg'), R = f.getBoundingClientRect();
      const ctr = n => { const r = f.querySelector(`[data-bf="${n}"] .k-plate`).getBoundingClientRect(); return [r.left - R.left + r.width / 2, r.top - R.top + r.height * 0.45]; };
      let s = '<defs><marker id="bfp" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--k-nasty)"/></marker><marker id="bfb" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--k-plot)"/></marker></defs>';
      const pins = [];
      H.forEach((h, i) => h.to.forEach((t, j) => { const [x1, y1] = ctr(h.from), [x2, y2] = ctr(t), mx = (x1 + x2) / 2 + (h.side === 'them' ? -70 : 70) + (j ? 40 : 0), my = (y1 + y2) / 2 + (h.side === 'them' ? 20 : -20);
        const col = h.side === 'them' ? 'var(--k-nasty)' : 'var(--k-plot)';
        s += `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="${h.side === 'them' ? 5 : 6}" stroke-linecap="round" ${h.side === 'them' ? 'stroke-dasharray="2 10"' : 'stroke-dasharray="14 8"'} marker-end="url(#${h.side === 'them' ? 'bfp' : 'bfb'})" opacity=".95"/>`;
        if (!j) pins.push([h.n, h.side, 0.49 * x1 + 0.42 * mx + 0.09 * x2, 0.49 * y1 + 0.42 * my + 0.09 * y2]); }));
      svg.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`); svg.innerHTML = s;
      f.insertAdjacentHTML('beforeend', pins.map(([n, sd, x, y]) => `<span class="bf-pin u ${sd}" style="left:${x}px;top:${y}px">${n}</span>`).join(''));
      scrollTo(0, 0);
    });
    await p.waitForTimeout(700);
    await p.screenshot({path: `${out}-${tag}.png`, fullPage: true}); console.log(tag, await p.evaluate(() => document.documentElement.scrollHeight)); await c.close();
  }
  await b.close();
})();
