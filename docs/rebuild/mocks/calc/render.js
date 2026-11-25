// mock-up only: draws one Damage Calc layout into the built page with the real numbers from data.js
(X, V) => { const E = V2.esc, r = X.r, pc = v => v.toFixed(v < 10 ? 1 : 0), A = X.A, D = X.D;
  const f = (lab, val, w) => `<label class="cm-f${w ? ' ' + w : ''}"><span>${lab}</span><b>${E(String(val))}<i aria-hidden="true">⌄</i></b></label>`;
  const chip = (t, on) => `<span class="np-chip${on ? ' on' : ''}">${t}</span>`;
  const wx = [['', 'No Weather'], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']].map(([k, t]) => chip(t, X.weather === k)).join('');
  const terr = ['No Terrain', 'Grassy', 'Electric', 'Psychic', 'Misty'].map((t, i) => chip(t, i === 0)).join('');
  const tog = [['Hits Both Foes', X.spread], ['Screen Up'], ['Helping Hand'], ['Friend Guard'], ['Critical Hit']].map(([t, on]) => chip(t, on)).join('');
  const field = `<div class="cm-field"><div class="chips">${wx}</div><div class="chips">${terr}</div><div class="chips">${tog}</div></div>`;
  const atkF = `${f('Pokémon', A.d, 'w2')}${f('Move', X.mv, 'w2')}${f(A.cat === 2 ? 'Sp. Atk points' : 'Attack points', A.sp)}${f('Nature', A.nat)}${f('Item', A.item || 'None')}${f('Ability', A.ab)}${f('Stat stage (Intimidate = −1)', A.boost > 0 ? '+' + A.boost : A.boost, 'w2')}`;
  const defF = `${f('Pokémon', D.d, 'w2')}${f('HP points', D.hp)}${f('Nature', D.nat)}${f('Def points', D.df)}${f('Sp. Def points', D.sd)}${f('Item', D.item || 'None')}${f('Ability', D.ab)}${f('Stat stage', D.boost > 0 ? '+' + D.boost : D.boost, 'w2')}`;
  const src = s => s && s !== 'yours' ? `<span class="cm-src">${s === 'estimated' ? 'estimated' : 'assumed'} spread</span>` : '';
  const bar = `<div class="cm-hp" aria-hidden="true"><i class="lo" style="width:${Math.min(100, r.lo)}%"></i><i class="hi" style="width:${Math.max(0, Math.min(100, r.hi) - Math.min(100, r.lo))}%"></i></div>`;
  const eff = r.eff >= 4 ? 'super effective twice over' : r.eff >= 2 ? 'super effective' : r.eff <= .25 ? 'resisted twice over' : r.eff < 1 ? 'resisted' : '';
  const big = `<div class="cm-num u">${pc(r.lo)}–${pc(r.hi)}<small>% of HP</small></div>`;
  const ko = `<p class="cm-ko"><b>${E(r.ko)}</b> · ${r.min}–${r.max} of ${r.hp} HP${eff ? ` · ${E(r.type)} is ${eff}` : ''}</p>`;
  const notes = `${X.notes.length ? `<p class="fine">${X.notes.join(' · ')}</p>` : ''}${X.nc.length ? `<p class="fine">Not counted: ${E(X.nc.join('; '))}.</p>` : ''}${X.bulk && !X.bulk.none ? `<p class="cm-bulk">Fewest points to always survive: <b>${X.bulk.hp} HP / ${X.bulk.df} ${E(X.bulk.stat)}</b> (${X.bulk.tot} total). ${r.max < r.hp ? 'This spread already survives.' : 'This spread does not.'}</p>` : ''}`;
  const kc = c => !c ? 'z' : c.lo >= 100 ? 'k1' : c.p >= 100 ? 'k1m' : c.lo >= 50 ? 'k2' : c.p >= 50 ? 'k2m' : 'k3';
  const table = (n) => `<section class="cm-tab"><div class="cm-th"><h2 class="u">Your Hits on the Top 30</h2><div class="np-slide" style="--n:2;--i:0"><span class="thumb"></span><button aria-pressed="true"><span>Your hits on them</span></button><button aria-pressed="false"><span>Their hits on you</span></button></div></div>
    <p class="fine">Each Pokémon's best hit with its usual set, as % of the target's HP. <span class="cm-key"><i class="k1"></i>KOs in one hit <i class="k2"></i>two hits <i class="k3"></i>three or more</span></p>
    <div class="cm-grid" style="--c:${X.mine.length}"><span></span>${X.mine.map(m => `<span class="ch">${V2.mon(m, {iw: 40, bare: true})}</span>`).join('')}
    ${X.thr.slice(0, n).map((t, i) => `<span class="rh">${V2.mon(t, {iw: 32, bare: true})}<b>${V2.rowName(V2.disp(t))}</b></span>${X.mine.map((m, j) => { const c = X.grid[j][i]; return `<span class="c ${kc(c)}">${c ? `<b>${Math.round(Math.min(c.p, 999))}%</b><small>${E(c.mv)}</small>` : '–'}</span>`; }).join('')}`).join('')}</div>
    ${n < X.thr.length ? `<p class="cm-more">${X.thr.length - n} more rows below ›</p>` : ''}</section>`;
  const head = (h1, h2) => `<section class="cm-h"><p class="np-eyebrow"><span>Battle · Damage Calc · level 50</span></p><h1 class="u"><span>${h1}</span> <span class="pl">${h2}</span></h1></section>`;
  const sp = (n, iw) => V2.mon(n, {iw, sel: true, bare: true});
  let body = '';
  if (V === 'A') { // Versus: the result is the page, both Pokémon face each other around it; settings in three even columns below
    body = `${head(`${E(A.d)}'s ${E(X.mv)}`, `into ${E(D.d)}.`)}
    <section class="cmA-arena"><div class="cmA-side"><p class="cm-k">Attacker ${src(A.src)}</p>${sp(A.n, 200)}<b class="cmA-nm u">${E(A.d)}</b><div class="chips cmA-mv">${X.pop.map(m => chip(E(m), m === X.mv)).join('')}<span class="np-chip">Other moves (${X.restN}) ⌄</span></div></div>
      <div class="cmA-mid">${big}${bar}${ko}<button class="np-btn2 cmA-sw"><span>⇄ Swap Sides</span></button></div>
      <div class="cmA-side"><p class="cm-k">Defender ${src(D.src)}</p>${sp(D.n, 200)}<b class="cmA-nm u">${E(D.d)}</b><p class="cmA-sub">${E(D.item || "No item")} · ${E(D.ab)} · ${D.hp} HP / ${D.df} Def / ${D.sd} Sp. Def</p></div></section>
    <section class="cmA-notes">${notes}</section>
    <section class="cmA-set"><div><h2 class="u">Attacker</h2><div class="cm-fs">${atkF}</div></div><div><h2 class="u">Field</h2>${field}</div><div><h2 class="u">Defender</h2><div class="cm-fs">${defF}</div></div></section>${table(12)}`;
  } else if (V === 'B') { // Workbench: settings on the left, the result stays in view on the right
    body = `${head('Damage Calc.', 'Any attacker into any defender.')}<section class="cmB"><div class="cmB-in"><div class="cmB-two"><div><h2 class="u">Attacker ${src(A.src)}</h2><div class="cmB-mon">${sp(A.n, 96)}</div><div class="cm-fs">${atkF}</div></div>
      <div><h2 class="u">Defender ${src(D.src)}</h2><div class="cmB-mon">${sp(D.n, 96)}</div><div class="cm-fs">${defF}</div></div></div><h2 class="u">Field</h2>${field}</div>
      <aside class="cmB-res"><p class="cm-k">${E(A.d)} · ${E(X.mv)} → ${E(D.d)}</p>${big}${bar}${ko}${notes}<button class="np-btn2"><span>⇄ Swap Sides</span></button></aside></section>${table(12)}`;
  } else { // Quick: tap a Pokémon to change it, tap a move; the result right under; spreads and items fold away
    body = `${head(`${pc(r.lo)}–${pc(r.hi)}% of HP.`, `${E(r.ko)}.`)}
    <section class="cmC"><div class="cmC-l"><div class="cmC-pair"><button class="cmC-mon">${sp(A.n, 128)}<span><small>Attacker · tap to change</small><b class="u">${E(A.d)}</b></span></button><span class="cmC-arrow u" aria-hidden="true">→</span><button class="cmC-mon">${sp(D.n, 128)}<span><small>Defender · tap to change</small><b class="u">${E(D.d)}</b></span></button></div>
      <div class="chips cmC-mv">${X.pop.map(m => chip(E(m), m === X.mv)).join('')}<span class="np-chip">Other moves ⌄</span></div>${bar}${ko}${notes}</div>
      <div class="cmC-r"><p class="cm-k">Weather</p><div class="chips cmC-q">${wx}</div><p class="cm-k">In play</p><div class="chips cmC-q">${tog}</div><p class="cmC-more"><span class="np-link">Spreads, items, Abilities, stages and terrain ›</span><span class="np-link">⇄ Swap sides</span></p></div></section>${table(12)}`; }
  return `<div class="cm">${V2.battleToolsBar('calc')}${body}</div>`; }
