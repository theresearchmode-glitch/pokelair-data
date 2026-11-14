(X, V) => { const E = V2.esc, r = X.r, A = X.A, D = X.D, n1 = v => v.toFixed(v < 10 ? 1 : 0);
  const rolls = r.rolls.length ? r.rolls : [r.min, r.max], koN = rolls.filter(v => v >= r.hp).length, koPct = Math.round(100 * koN / rolls.length);
  const verdict = koN === rolls.length ? 'It goes down.' : koN ? `${koN} of ${rolls.length} rolls KO.` : 'It survives.';
  const card = (n, back) => { const p = V2.byName.get(n); return V2.msCard(p, n, `<h2 class="u">${V2.nameHtml(V2.disp(n))}</h2>`, `<div class="ms-ty">${(p.t || []).map(V2.typeChip).join('')}</div>`); };
  const tc = t => `var(--ty-${t})`;
  // the defender's HP bar, as in the game: what's left after the hit, the damage range, and a tick for each of the 16 damage rolls
  const hpbar = `<div class="ar-hp"><div class="ar-hp-t"><b class="u">${E(D.d)}</b><span>${r.hp} HP</span></div><div class="ar-bar"><i class="left" style="width:${Math.max(0, 100 - r.hi)}%"></i><i class="range" style="left:${Math.max(0, 100 - r.hi)}%;width:${Math.min(100, r.hi) - Math.min(100, r.lo)}%"></i>${rolls.map(v => `<i class="tick" style="left:${Math.max(0, 100 - 100 * v / r.hp)}%"></i>`).join('')}</div>
    <p class="ar-left">${r.min >= r.hp ? 'Nothing left in any roll' : `${Math.max(0, r.hp - r.max)}–${r.hp - r.min} HP left`}</p></div>`;
  const moves = `<div class="ar-mvs">${X.pop.map(([m, t]) => `<span class="ar-mv${m === X.mv ? ' on' : ''}" style="--tc:${tc(m === X.mv ? (r.type || t) : t)}">${E(m)}</span>`).join('')}<span class="ar-mv more">All Moves ⌄</span></div>`;
  const fx = [['Hits Both Foes', X.spread], ['Screen Up'], ['Helping Hand'], ['Friend Guard'], ['Critical Hit']];
  const wxN = {sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow'}[X.weather] || 'No Weather';
  const field = `<div class="ar-field"><span class="ar-wx on" style="--tc:${tc(X.weather === 'rain' ? 'Water' : X.weather === 'sand' ? 'Rock' : X.weather === 'snow' ? 'Ice' : 'Fire')}">${E(wxN)} ⌄</span><span class="ar-wx">No Terrain ⌄</span>${fx.map(([t, on]) => `<span class="np-chip${on ? ' on' : ''}">${t}</span>`).join('')}</div>`;
  const notes = `${X.notes.length ? `<p class="fine">${X.notes.join(' · ')}</p>` : ''}${X.bulk && !X.bulk.none ? `<p class="ar-bulk">To always survive this: <b>${X.bulk.hp} HP / ${X.bulk.df} ${E(X.bulk.stat)} points</b> (${X.bulk.tot} total). ${r.max < r.hp ? 'This spread already does.' : 'This spread doesn\'t.'}</p>` : ''}`;
  // the back of a card: its spread as slanted sliders, nature/item/Ability as chips (tap a card to flip it)
  const slider = (lab, v) => `<div class="ar-sl"><span>${lab}</span><div class="tr"><i style="width:${100 * v / 32}%"></i><b style="left:${100 * v / 32}%"></b></div><em>${v}</em></div>`;
  const back = (X0, who, stats) => `<div class="ar-back"><p class="ar-k">${who} · tap to flip back</p><b class="u ar-bn">${E(X0.d)}</b>${stats}<div class="ar-chips"><span class="np-chip on">${E(X0.nat)}</span><span class="np-chip">${E(X0.item || 'No item')}</span><span class="np-chip">${E(X0.ab)}</span><span class="np-chip">Stage ${X0.boost > 0 ? '+' : ''}${X0.boost}</span></div>${X0.src && X0.src !== 'yours' ? `<p class="fine">Their real spread is hidden: this is the most common one. Slide to change it.</p>` : ''}</div>`;
  // the KO board: the top 30, each with what your best hit leaves of its HP; the ones you KO in one hit are stamped
  const board = `<section class="ko-b"><div class="ko-h"><h2 class="u">Who Falls in One Hit</h2><div class="np-slide" style="--n:2;--i:0"><span class="thumb"></span><button aria-pressed="true"><span>Your hits on them</span></button><button aria-pressed="false"><span>Their hits on you</span></button></div></div>
    <p class="fine">Your best hit on each of the top 30 (its usual set). The bar is the HP it has left. Tap one to put it in the arena.</p>
    <div class="ko-g">${X.best.filter(Boolean).map(b => { const ko = b.lo >= 100, mko = b.p >= 100; return `<div class="ko-t${ko ? ' ko' : mko ? ' mko' : ''}">${V2.mon(b.n, {iw: 56, bare: true})}<b>${V2.rowName(V2.disp(b.n))}</b><div class="ko-bar"><i style="width:${Math.max(0, 100 - b.p)}%"></i><i class="r" style="left:${Math.max(0, 100 - b.p)}%;width:${Math.max(0, Math.min(100, b.p) - Math.min(100, b.lo))}%"></i></div>
      <small>${ko ? 'KO' : mko ? 'Can KO' : `${Math.round(b.p)}%`} · ${E(b.mv)}</small>${ko ? '<span class="stamp u">KO</span>' : ''}<span class="by">${V2.mon(b.a, {iw: 24, bare: true})}</span></div>`; }).join('')}</div></section>`;
  const head = `<p class="np-eyebrow"><span>Battle · Damage Calc · level 50</span></p>`;
  let body;
  if (V === 'arena' || V === 'flip') {
    const flip = V === 'flip';
    body = `<section class="ar wx-${X.weather || 'none'}">${head}<h1 class="u ar-q"><span>${E(A.d)}'s ${E(X.mv)}.</span> <span class="pl">${E(verdict)}</span></h1>
      <div class="ar-stage"><div class="ar-side atk">${flip ? `<div class="ms-card ar-flipped">${back(A, 'Attacker', slider(X.cat === 2 ? 'Sp. Atk' : 'Attack', A.sp))}</div>` : card(A.n)}${moves}</div>
        <div class="ar-strike" style="--tc:${tc(r.type || X.mtype)}"><div class="beam"><span class="mvn">${E(X.mv)}${r.type && r.type !== X.mtype ? ` · ${E(r.type)} in ${E(wxN)}` : ""}</span><span class="num u">${n1(r.lo)}–${n1(r.hi)}<small>%</small></span></div><p class="ar-ko u">${E(r.ko)}</p><p class="ar-odds">${koN ? `<b>${koPct}%</b> to KO · ` : ''}${r.min}–${r.max} damage${r.eff !== 1 ? ` · ${E(r.type)} ${r.eff >= 2 ? 'super effective' : 'resisted'}` : ''}</p><button class="np-btn2 ar-sw"><span>⇄ Swap</span></button></div>
        <div class="ar-side def">${hpbar}${flip ? `<div class="ms-card ar-flipped">${back(D, 'Defender', slider('HP', D.hp) + slider('Defense', D.df) + slider('Sp. Def', D.sd))}</div>` : card(D.n)}</div></div>
      ${field}<div class="ar-notes">${notes}</div></section>${board}`;
  } else { // rolls: the answer is the 16 damage rolls against the defender's HP line
    const mx = Math.max(r.hp * 1.15, r.max * 1.05);
    body = `<section class="rl">${head}<h1 class="u ar-q"><span>${koN}<small> of ${rolls.length}</small> rolls KO.</span> <span class="pl">${E(A.d)}'s ${E(X.mv)} into ${E(D.d)}.</span></h1>
      <div class="rl-wrap"><div class="rl-mons"><div>${V2.mon(A.n, {iw: 120, sel: true, bare: true})}<b class="u">${E(A.d)}</b>${moves}</div><span class="rl-vs u">→</span><div>${V2.mon(D.n, {iw: 120, sel: true, bare: true})}<b class="u">${E(D.d)}</b><small>${r.hp} HP</small></div></div>
      <div class="rl-chart" style="--tc:${tc(r.type || X.mtype)}"><i class="line" style="bottom:${100 * r.hp / mx}%"><span>${E(D.d)}'s HP · ${r.hp}</span></i>${rolls.map((v, i) => `<div class="b${v >= r.hp ? ' ko' : ''}" style="height:${100 * v / mx}%"><span>${v}</span></div>`).join('')}</div>
      <p class="ar-odds rl-odds"><b class="u">${koPct}%</b> to KO in one hit · ${n1(r.lo)}–${n1(r.hi)}% of HP · ${E(r.ko)}</p></div>${field}<div class="ar-notes">${notes}</div></section>${board}`; }
  return `<div class="cm">${V2.battleToolsBar('calc')}${body}</div>`; }
