(X, V) => { const E = V2.esc, d = n => V2.disp(n), [C, step] = V.split('-'), rev = step === 'rev', t = X.target || {four: [], lead: []};
  const cp = n => { const id = SPRITE_ID[n], m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165]; return `${m[0]},${m[1]},${m[2]}`; };
  const ty = n => (byName.get(n) || {t: []}).t, pickI = n => X.pick.indexOf(n), isL = n => X.lead.includes(n), inT = n => t.four.includes(n), tL = n => t.lead.includes(n);
  const rate = n => X.rates.find(r => r.n === n) || {g: 0, b: 0, l: 0};
  const meter = `<div class="r2-meter" aria-label="Bring four, 4 of 4; lead two, 2 of 2"><span class="lab">Bring four</span>${[0, 1, 2, 3].map(i => `<i class="on"></i>`).join('')}<span class="lab">Lead two</span>${[0, 1].map(() => '<i class="on ld"></i>').join('')}</div>`;
  const stamp = n => !rev ? '' : `<b class="r2-stamp u ${inT(n) ? 'yes' : 'no'}">${inT(n) ? (tL(n) ? 'They led' : 'They brought') : 'Not in their four'}</b>`;
  const rbar = n => { const r = rate(n); return `<div class="r2-rate"><div class="r2-bars"><i class="b" style="width:${r.b}%"></i><i class="l" style="width:${r.l}%"></i></div><small><b>${r.b}%</b> brought · <b>${r.l}%</b> led · ${r.g} games</small></div>`; };
  const banner = rev ? `<div class="r2-banner ${X.m4 ? 'yes' : 'no'}"><b class="u">${X.m4 ? 'You matched the strong players\' four!' : 'A different four from the strong players'}</b><span>${X.ml ? 'Same two leads as theirs.' : 'Different leads.'}</span></div>` : '';
  const who = `<p class="r2-who">Strong players faced this team (or one 5 of 6 the same) in <b>${X.n}</b> games</p>`;
  const acts = rev ? `<div class="r2-act"><button type="button" class="np-btn"><span>Next Team</span></button><button type="button" class="np-link">Change six</button></div>`
    : `<div class="r2-act"><button type="button" class="np-btn"><span>Reveal What Strong Players Chose</span></button><button type="button" class="np-link">Skip this team</button><button type="button" class="np-link">Start the pick again</button><button type="button" class="np-link">Change six</button></div>`;
  const foot = `<p class="fine r2-src">From the Showdown ladder (Oct 23 – Nov 10). Strong players: rated ${X.minR}+.</p>`;
  const tools = V2.battleToolsBar('practice'), eb = `<p class="np-eyebrow"><span>Battle · Team Preview Practice</span></p>`;

  if (C === 'vs') { // 1. Arena VS: two halves of an arena, a slanted seam with a giant outlined VS; picks slide toward the seam and glow in their own colour
    const mine = n => `<button type="button" class="r2-plate me${pickI(n) >= 0 ? ' on' : ''}${isL(n) ? ' ld' : ''}${rev ? (inT(n) ? ' ok' : ' miss') : ''}" style="--cp:${cp(n)}">${V2.mon(n, {iw: 88, bare: true})}<span class="tx"><b class="nm u">${V2.nameHtml(d(n))}</b><span class="ty">${ty(n).map(V2.typeChip).join('')}</span>${rev ? rbar(n) : ''}</span>${isL(n) ? '<i class="r2-rib u">Lead</i>' : pickI(n) >= 0 ? `<i class="r2-no u">${pickI(n) + 1}</i>` : ''}${stamp(n)}</button>`;
    const theirs = n => `<div class="r2-plate them" style="--cp:${cp(n)}"><span class="tx"><b class="nm u">${V2.nameHtml(d(n))}</b><span class="ty">${ty(n).map(V2.typeChip).join('')}</span></span>${V2.mon(n, {iw: 72, bare: true})}</div>`;
    return `<div class="r2 r2-vs">${tools}<section class="r2-h">${eb}<h1 class="u">${rev ? '<span>Your pick,</span> <span class="pl">their pick.</span>' : '<span>Pick your</span> <span class="pl">four.</span>'}</h1>${rev ? '' : meter}</section>${banner}
      <section class="r2-arena"><div class="r2-side mine"><p class="r2-cap u">You</p>${X.six.map(mine).join('')}</div><div class="r2-seam" aria-hidden="true"><b class="u">VS</b></div>
        <div class="r2-side them"><p class="r2-cap u">Them</p>${X.opp.map(theirs).join('')}${who}</div></section>${acts}${foot}</div>`; }

  if (C === 'ped') { // 2. Pedestals: two lead pedestals in front, two back behind, your six as mini Cards below; their six in a band across the top
    const four = rev ? t : {four: X.pick, lead: X.lead}, backs = list => list.four.filter(n => !list.lead.includes(n));
    const ped = (n, cls, ghost) => `<div class="r2-ped ${cls}${n ? '' : ' empty'}${ghost ? ' ghost' : ''}" style="--cp:${n ? cp(n) : '120,120,140'}">${n ? `${V2.mon(n, {iw: cls === 'lead' ? 168 : 120, bare: true, ft: true})}<b class="nm u">${V2.nameHtml(d(n))}</b>` : ''}<i class="ring" aria-hidden="true"></i><span class="lab">${cls === 'lead' ? 'Lead' : 'Back'}</span></div>`;
    const stage = (L, cap) => `<div class="r2-stage"><p class="r2-cap u">${cap}</p><div class="back">${backs(L).map(n => ped(n, 'bk')).join('')}</div><div class="front">${L.lead.map(n => ped(n, 'lead')).join('')}</div></div>`;
    const card = n => `<button type="button" class="r2-mini${pickI(n) >= 0 ? ' used' : ''}" style="--cp:${cp(n)}">${V2.mon(n, {iw: 72, bare: true})}<b class="nm">${V2.nameHtml(d(n))}</b>${rev ? rbar(n) : ''}${stamp(n)}</button>`;
    return `<div class="r2 r2-ped-v">${tools}<section class="r2-band"><span class="r2-giant u" aria-hidden="true">THEIR SIX</span><p class="r2-cap u">Their six · as seen at team preview</p><div class="r2-opp">${X.opp.map(n => `<div class="o" style="--cp:${cp(n)}">${V2.mon(n, {iw: 80, bare: true})}<b>${V2.nameHtml(d(n))}</b></div>`).join('')}</div>${who}</section>
      <section class="r2-h">${eb}<h1 class="u">${rev ? '<span>Your pick,</span> <span class="pl">their pick.</span>' : '<span>Pick your</span> <span class="pl">four.</span>'}</h1>${rev ? '' : meter}</section>${banner}
      <section class="r2-stages${rev ? ' two' : ''}">${stage({four: X.pick, lead: X.lead}, 'Your four')}${rev ? stage(t, 'Strong players\' four') : ''}</section>
      <section class="r2-lineup"><p class="r2-cap u">Your six</p><div class="r2-minis">${X.six.map(card).join('')}</div></section>${acts}${foot}</div>`; }

  // 3. Broadcast: two slanted team banners, lineup strips like a stream overlay, the streak as a giant numeral between them
  const strip = (n, me) => `<div class="r2-row${me && pickI(n) >= 0 ? ' on' : ''}${me && isL(n) ? ' ld' : ''}${me && rev ? (inT(n) ? ' ok' : ' miss') : ''}" style="--cp:${cp(n)}"><span class="pos u">${me ? (isL(n) ? 'L' : pickI(n) >= 0 ? pickI(n) + 1 : '') : ''}</span>${V2.mon(n, {iw: 56, bare: true})}<b class="nm u">${V2.nameHtml(d(n))}</b><span class="ty">${ty(n).map(V2.typeChip).join('')}</span>${me && rev ? rbar(n) : ''}${me ? stamp(n) : ''}</div>`;
  const s = X.score;
  return `<div class="r2 r2-bc">${tools}<section class="r2-h">${eb}<h1 class="u">${rev ? '<span>Your pick,</span> <span class="pl">their pick.</span>' : '<span>Pick your</span> <span class="pl">four.</span>'}</h1></section>
    <section class="r2-cast"><div class="r2-team me"><div class="r2-flag u">You<small>${E(teamTitleFor(members()) || 'Your six')}</small></div>${X.six.map(n => strip(n, true)).join('')}</div>
      <div class="r2-mid"><div class="r2-big u">${s.streak}</div><p class="r2-cap u">in a row</p><p class="r2-sub">${s.best} best · ${s.matched} of ${s.played} matched</p>${rev ? '' : meter}</div>
      <div class="r2-team them"><div class="r2-flag u">Ladder<small>Strong players, rated ${X.minR}+</small></div>${X.opp.map(n => strip(n, false)).join('')}${who}</div></section>
    ${rev ? `<div class="r2-third ${X.m4 ? 'yes' : 'no'}"><b class="u">${X.m4 ? 'You matched the strong players\' four!' : 'A different four from the strong players'}</b><span>${X.ml ? 'Same two leads as theirs.' : 'Different leads.'}</span></div>` : ''}${acts}${foot}</div>`; }
