(X, V) => { const E = V2.esc, d = n => V2.disp(n), [C, step] = V.split('-'), rev = step === 'rev', t = X.target || {four: [], lead: []};
  const pickI = n => X.pick.indexOf(n), isL = n => X.lead.includes(n), inT = n => t.four.includes(n), tL = n => t.lead.includes(n), rate = n => X.rates.find(r => r.n === n) || {g: 0, b: 0, l: 0};
  const head = (h) => `<section class="pp-h"><p class="np-eyebrow"><span>Battle · Team Preview Practice</span></p><h1 class="u">${h}</h1></section>`;
  const who = `<p class="pp-who">Strong players faced this team (or one 5 of 6 the same) in <b>${X.n}</b> games</p>`;
  const steps = `<div class="pp-steps"><span class="done">1 · Bring four <b>4/4</b></span><span class="on">2 · Lead two <b>2/2</b></span></div>`;
  const banner = rev ? `<div class="pp-res ${X.m4 ? 'yes' : 'no'}"><b class="u">${X.m4 ? 'You matched the strong players\' four!' : 'A different four from the strong players'}</b><span>${X.ml ? 'Same two leads as theirs.' : 'Different leads.'}</span></div>` : '';
  const bar = n => { const r = rate(n); return `<div class="pp-rate"><div class="pp-bar"><i style="width:${r.b}%"></i></div><small>Brought in <b>${r.b}%</b> · led in ${r.l}% · ${r.g} games${r.g < 10 ? ' (a hint)' : ''}</small></div>`; };
  const badge = n => pickI(n) < 0 ? '' : `<i class="pp-num u">${isL(n) ? 'Lead' : pickI(n) + 1}</i>`;
  const mark = n => !rev ? '' : inT(n) ? `<i class="pp-mk yes">${tL(n) ? 'They led' : 'They brought'}</i>` : `<i class="pp-mk">Not in their four</i>`;
  const foot = `<p class="fine pp-src">From the Showdown ladder (Oct 23 – Nov 10). Strong players: rated ${X.minR}+.</p>`;
  const actions = rev ? `<div class="pp-act"><button type="button" class="np-btn"><span>Next Team</span></button><button type="button" class="np-link">Change six</button></div>`
    : `<div class="pp-act"><button type="button" class="np-btn"><span>Reveal What Strong Players Chose</span></button><button type="button" class="np-link">Skip this team</button><button type="button" class="np-link">Start the pick again</button><button type="button" class="np-link">Change six</button></div>`;

  if (C === 'A') { // the game's team preview screen: your six left, theirs right, VS between
    const mine = n => `<button type="button" class="pp-a-m${pickI(n) >= 0 ? ' on' : ''}${isL(n) ? ' ld' : ''}${rev ? (inT(n) ? ' ok' : ' miss') : ''}">${V2.mon(n, {iw: 72, bare: true})}<span class="nm u">${V2.nameHtml(d(n))}</span>${badge(n)}${mark(n)}${rev ? bar(n) : ''}</button>`;
    const theirs = n => `<div class="pp-a-t">${V2.mon(n, {iw: 56, bare: true})}<span class="nm">${V2.nameHtml(d(n))}</span></div>`;
    return `<div class="pp pp-A">${V2.battleToolsBar('practice')}${head(rev ? '<span>Your pick,</span> <span class="pl">their pick.</span>' : '<span>Pick your</span> <span class="pl">four.</span>')}${banner}
      <div class="pp-a-stage"><div class="pp-a-col mine"><p class="pp-lbl">Your six</p>${X.six.map(mine).join('')}</div>
        <div class="pp-a-mid"><b class="pp-vs u">VS</b>${rev ? '' : steps}${rev ? '' : `<p class="pp-hint">Ready. Tap a lead again to change it.</p>`}${who}</div>
        <div class="pp-a-col them"><p class="pp-lbl">Their six · as seen at team preview</p>${X.opp.map(theirs).join('')}</div></div>${actions}${foot}</div>`; }

  if (C === 'B') { // the card table: their six far, the four slots in the middle, your six as a hand
    const slot = (n, lab) => n ? `<div class="pp-b-slot full">${V2.mon(n, {iw: 96, bare: true})}<span class="nm u">${V2.nameHtml(d(n))}</span><i class="lab">${lab}</i></div>` : `<div class="pp-b-slot"><i class="lab">${lab}</i></div>`;
    const back = X.pick.filter(n => !isL(n)), tback = t.four.filter(n => !tL(n));
    const field = (L, B, cap) => `<div class="pp-b-field"><p class="pp-lbl">${cap}</p><div class="row">${slot(L[0], 'Lead')}${slot(L[1], 'Lead')}</div><div class="row back">${slot(B[0], 'Back')}${slot(B[1], 'Back')}</div></div>`;
    const hand = X.six.map((n, i) => `<button type="button" class="pp-b-card${pickI(n) >= 0 ? ' used' : ''}" style="--r:${(i - 2.5) * 4}deg">${V2.mon(n, {iw: 72, bare: true})}<span class="nm">${V2.nameHtml(d(n))}</span>${rev ? bar(n) : ''}</button>`).join('');
    return `<div class="pp pp-B">${V2.battleToolsBar('practice')}${head(rev ? '<span>Your pick,</span> <span class="pl">their pick.</span>' : '<span>Pick your</span> <span class="pl">four.</span>')}${banner}
      <section class="pp-b-table"><div class="pp-b-surface" aria-hidden="true"></div><div class="pp-b-them"><p class="pp-lbl">Their six · as seen at team preview</p><div class="row">${X.opp.map(n => `<div class="pp-b-t">${V2.mon(n, {iw: 64, bare: true})}<span class="nm">${V2.nameHtml(d(n))}</span></div>`).join('')}</div>${who}</div>
        <div class="pp-b-mid">${field(X.lead, back, 'Your four')}${rev ? field(t.lead, tback, 'Strong players\' four') : steps}</div>
        <div class="pp-b-hand">${hand}</div></section>${actions}${foot}</div>`; }

  // C: split screen, your six big on the blue side, theirs on the dark side
  const tile = n => `<button type="button" class="pp-c-t${pickI(n) >= 0 ? ' on' : ''}${isL(n) ? ' ld' : ''}${rev ? (inT(n) ? ' ok' : ' miss') : ''}">${V2.mon(n, {iw: 112, bare: true})}<span class="nm u">${V2.nameHtml(d(n))}</span>${badge(n)}${mark(n)}${rev ? bar(n) : ''}</button>`;
  return `<div class="pp pp-C">${V2.battleToolsBar('practice')}${banner}
    <section class="pp-c-split"><div class="pp-c-you">${head(rev ? '<span>Your pick,</span> <span class="pl">their pick.</span>' : '<span>Pick your</span> <span class="pl">four.</span>')}<div class="pp-c-grid">${X.six.map(tile).join('')}</div></div>
      <div class="pp-c-them"><p class="pp-lbl">Their six</p><div class="pp-c-tg">${X.opp.map(n => `<div class="pp-c-s">${V2.mon(n, {iw: 72, bare: true})}<span class="nm">${V2.nameHtml(d(n))}</span></div>`).join('')}</div>${who}</div></section>
    <div class="pp-c-dock">${rev ? '' : steps}${actions}</div>${foot}</div>`; }
