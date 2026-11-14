// ---------- Team Preview Practice (Nov 14), Battle's tool: pick four and two leads against a real ladder team ----------
// Sim's pick: 'Arena VS' (mock-ups docs/rebuild/mocks/practice/round2). The state, scoring, picks and reveal are today's shared
// logic (63-practice-data.js: pr, prStart, prReveal, prTarget, prScore); today's words and rules are kept (63-practice.js).
V2.ppCp = n => { const m = (typeof ART_META === 'object' && ART_META[SPRITE_ID[n]]) || [150, 150, 165]; return `${m[0]},${m[1]},${m[2]}`; };
V2.ppTy = n => ((byName.get(n) || {}).t || []).map(V2.typeChip).join('');
V2.ppMeter = (nP, nL) => `<div class="pp2-meter" role="img" aria-label="Bring four, ${nP} of 4; lead two, ${nL} of 2"><span class="grp"><span class="lab">1 · Bring four <b>${nP}/4</b></span>${[0, 1, 2, 3].map(i => `<i class="${i < nP ? 'on' : ''}"></i>`).join('')}</span><span class="grp"><span class="lab">2 · Lead two <b>${nL}/2</b></span>${[0, 1].map(i => `<i class="${i < nL ? 'on ld' : ''}"></i>`).join('')}</span></div>`;
V2.ppFoot = P => { const range = P.from && P.to ? ` (${prDay(P.from)} – ${prDay(P.to)})` : ''; return `<p class="fine pp2-src">From the Showdown ladder${range}. "Strong players" are ladder players rated ${prN(P.minR)}+. A similar team is the same six, or five of the six the same.</p>`; };
V2.ppScore = s => s.played ? `<p class="pp2-score" aria-label="Your practice score"><b class="u">${s.streak}</b> in a row, <b class="u">${s.best}</b> best, <b class="u">${s.matched}</b> of ${s.played} matched</p>` : '';
V2.ppHead = h => `<section class="pp2-h"><p class="np-eyebrow"><span>Battle · Team Preview Practice</span></p><h1 class="u">${h}</h1></section>`;

V2.pages.practice = {place: 'battle', draw() { const E = V2.esc, P = META.practice, s = prScore(), tools = V2.battleToolsBar('practice');
  if (!P) return `<div class="pp2">${tools}${V2.ppHead('<span>Pick your</span> <span class="pl">four.</span>')}<p class="tm-sub">Practice games appear after the next data refresh.</p></div>`;
  const ms = members();
  // start: use my team (needs exactly six) or a real team from the ladder
  if (pr.step === 'start' || !P.opp[pr.oi]) { const can = ms.length === 6, mode = pr.mode || (can ? 'mine' : 'real');
    return `<div class="pp2">${tools}${V2.ppHead('<span>Pick your</span> <span class="pl">four.</span>')}
      <p class="pp2-lede">Pick <b>four</b> and <b>two</b> leads against a real ladder team, then see what strong players chose against it.</p>
      <div class="pp2-modes" role="radiogroup" aria-label="Which six to practice with">
        <button type="button" role="radio" class="pp2-mode" data-ppmode="mine" aria-checked="${mode === 'mine'}"${can ? '' : ' disabled'}><b class="u">Use my team</b><span>${can ? E(teamTitleFor(ms)) + ' against real teams' : `Add six Pokémon on My team to use it${ms.length ? ` (you have ${ms.length})` : ''}`}</span>${can ? `<span class="six">${ms.map(m => V2.mon(m.p.n, {iw: 48, bare: true})).join('')}</span>` : ''}</button>
        <button type="button" role="radio" class="pp2-mode" data-ppmode="real" aria-checked="${mode === 'real'}"><b class="u">Practice with a real team</b><span>A strong player's six from the same game: compare your pick with theirs</span></button></div>
      ${V2.ppScore(s)}<div class="pp2-act"><button type="button" class="np-btn" data-ppgo="${mode}"><span>Start</span></button>${can ? '' : '<a class="np-link" href="#team">Go to My team</a>'}</div>${V2.ppFoot(P)}</div>`; }
  const o = P.opp[pr.oi], r = pr.mode === 'real' ? P.rounds[pr.ri] : null, rev = pr.step === 'reveal', t = rev ? prTarget() : null, res = pr.result;
  const who = r ? `<p class="pp2-who">Ladder player rated <b>${prN(r.tr)}</b>, your side was played by someone rated <b>${prN(r.r)}</b></p>` : `<p class="pp2-who">Strong players faced this team (or one 5 of 6 the same) in <b>${prN(o.n)}</b> games</p>`;
  const nP = pr.pick.length, nL = pr.lead.length, pickI = n => pr.pick.indexOf(n), isL = n => pr.lead.includes(n);
  const inT = n => !!(t && t.four.some(x => prBase(x) === prBase(n))), tL = n => !!(t && t.lead.some(x => prBase(x) === prBase(n)));
  const rate = n => { const c = o.mons[prBase(n)]; return c ? {g: c[0], b: prPc(c[1], c[0]), l: prPc(c[2], c[0])} : null; };
  const bars = n => { const c = rate(n); if (!c) return '<p class="pp2-rate none">No games with it against this team</p>'; return `<div class="pp2-rate"><div class="bars" aria-hidden="true"><i class="b" style="width:${c.b}%"></i><i class="l" style="width:${c.l}%"></i></div><small>Brought in <b>${c.b}%</b> of games, led in ${c.l}%, ${prN(c.g)} game${c.g === 1 ? '' : 's'}${c.g < 10 ? ', only a few: treat as a hint' : ''}</small></div>`; };
  const stamp = n => !rev || !t ? '' : `<b class="pp2-stamp u ${inT(n) ? 'yes' : 'no'}">${inT(n) ? (tL(n) ? 'They led' : 'They brought') : 'Not in their four'}</b>`;
  const mine = n => { const on = pickI(n) >= 0, ld = isL(n), lab = E(V2.disp(n)) + (on ? (ld ? ': bringing, leading' : ': bringing') : '');
    return `<button type="button" class="pp2-plate me${on ? ' on' : ''}${ld ? ' ld' : ''}${rev && t ? (inT(n) ? ' ok' : ' miss') : ''}" style="--cp:${V2.ppCp(n)}"${rev ? ' tabindex="-1"' : ` data-ppick="${E(n)}" aria-pressed="${on}"`} aria-label="${lab}">${V2.mon(n, {iw: 88, bare: true})}<span class="tx"><b class="nm u">${V2.nameHtml(V2.disp(n))}</b><span class="ty">${V2.ppTy(n)}${stamp(n)}</span>${rev ? bars(n) : ''}</span>${ld ? '<i class="pp2-rib u">Lead</i>' : on ? `<i class="pp2-no u">${pickI(n) + 1}</i>` : ''}</button>`; };
  const theirs = n => `<div class="pp2-plate them" style="--cp:${V2.ppCp(n)}"><span class="tx"><b class="nm u">${V2.nameHtml(V2.disp(n))}</b><span class="ty">${V2.ppTy(n)}</span></span>${V2.mon(n, {iw: 72, bare: true})}</div>`;
  const arena = `<section class="pp2-arena"><div class="pp2-side mine"><p class="pp2-cap u">Your six</p>${pr.six.map(mine).join('')}</div><div class="pp2-seam" aria-hidden="true"><b class="u">VS</b></div><div class="pp2-side them"><p class="pp2-cap u">Their six · as seen at team preview</p>${o.six.map(theirs).join('')}${who}</div></section>`;
  if (!rev) { const stage = nP < 4 ? 1 : 2, line = nP ? `Bringing <b>${pr.pick.map(n => E(V2.disp(n))).join(', ')}</b>${nL ? `. Leading <b>${pr.lead.map(n => E(V2.disp(n))).join(' + ')}</b>` : ''}.` : '';
    return `<div class="pp2">${tools}${V2.ppHead('<span>Pick your</span> <span class="pl">four.</span>')}${V2.ppScore(s)}<div class="pp2-bar">${V2.ppMeter(nP, nL)}<p class="pp2-hint" aria-live="polite">${stage === 1 ? 'Tap the four you would bring.' : nL < 2 ? 'Now tap two of your four to lead.' : 'Ready. Tap a lead again to change it.'}</p></div>
      ${arena}<p class="pp2-line" aria-live="polite">${line}</p>
      <div class="pp2-act"><button type="button" class="np-btn" data-pprev${nP === 4 && nL === 2 ? '' : ' disabled'}><span>Reveal what strong players chose</span></button><button type="button" class="np-link" data-ppskip>Skip this team</button>${nP ? '<button type="button" class="np-link" data-ppreset>Start the pick again</button>' : ''}<button type="button" class="np-link" data-pphome>Change six</button></div>${V2.ppFoot(P)}</div>`; }
  // reveal: the banner, both fours, and each of your six with how often strong players brought and led it
  const banner = !t ? `<div class="pp2-banner none"><b class="u">No score this round</b><span>Fewer than four of your Pokémon have 5+ games against this team, so there is no strong players' four to compare with. The numbers below still show what players did.</span></div>`
    : `<div class="pp2-banner ${res && res.m4 ? 'yes' : 'no'}"><b class="u">${res && res.m4 ? 'You matched the strong players\' four!' : 'A different four from the strong players'}</b><span>${res && res.ml ? (res.m4 ? 'Same two leads too.' : 'Same two leads as theirs.') : res && res.m4 ? 'Different leads.' : ''}${s.streak >= 2 ? ` You matched the top players' four ${s.streak} times in a row.` : ''}</span></div>`;
  const four = (list, lead) => `<span class="pp2-four">${lead.map(n => `<span class="ld">${V2.mon(n, {iw: 40, bare: true})}<b>${E(V2.disp(n))}</b><i>Lead</i></span>`).join('')}${list.filter(n => !lead.includes(n)).map(n => `<span>${V2.mon(n, {iw: 40, bare: true})}<b>${E(V2.disp(n))}</b><i>Back</i></span>`).join('')}</span>`;
  const theirLabel = r ? `What this player chose, rated ${prN(r.r)}` : 'Strong players\' four';
  const fours = `<section class="pp2-fours"><div><p class="pp2-cap u">Your pick</p>${four(pr.pick, pr.lead)}</div>${r ? `<div><p class="pp2-cap u">${theirLabel}</p>${four(r.b, r.l)}<p class="pp2-who">They ${r.won ? 'won' : 'lost'} this game. Their opponent led ${r.tl.map(n => E((byName.get(n) || {}).d || n)).join(' + ')}${r.tb.length > 2 ? ` and also brought ${r.tb.filter(n => !r.tl.includes(n)).map(n => E((byName.get(n) || {}).d || n)).join(' + ')}` : ''}.</p></div>
      <div><p class="pp2-cap u">Players with a similar six against a similar team</p><p class="pp2-who">${r.pair.n === 1 ? 'This is the only such game in the data.' : `<b>${prN(r.pair.n)}</b> games. The most common four was brought in <b>${prN(r.pair.fourN)}</b> of them, led by ${r.pair.lead.map(n => E(byName.get(n).d)).join(' + ')} in <b>${prN(r.pair.leadN)}</b>.`}${r.pair.n < 10 ? ` Only ${prN(r.pair.n)} similar game${r.pair.n === 1 ? '' : 's'}: treat as a hint.` : ''}</p>${r.pair.n > 1 ? four(r.pair.four, r.pair.lead) : ''}</div>` : t ? `<div><p class="pp2-cap u">${theirLabel}</p>${four(t.four, t.lead)}</div>` : ''}</section>`;
  return `<div class="pp2 rev">${tools}${V2.ppHead('<span>Your pick,</span> <span class="pl">their pick.</span>')}${banner}${fours}
    <p class="pp2-cap u pp2-each">Each of your six against this team</p><p class="fine">Players rated ${prN(P.minR)}+ with this Pokémon against this team (or one 5 of 6 the same): how often they brought it and led with it.</p>${arena}
    <div class="pp2-act"><button type="button" class="np-btn" data-ppnext><span>Next team</span></button><button type="button" class="np-link" data-pphome>Change six</button></div>${V2.ppFoot(P)}</div>`; }};

// taps: today's rules (63-practice.js)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.pp2 [data-ppmode],.pp2 [data-ppgo],.pp2 [data-ppick],.pp2 [data-ppreset],.pp2 [data-pprev],.pp2 [data-ppskip],.pp2 [data-pphome],.pp2 [data-ppnext]'); if (!b) return; const d = b.dataset;
  if (d.ppmode) { if (b.disabled) return; pr.mode = d.ppmode; V2.redraw(); return; }
  if (d.ppgo != null || d.ppskip != null || d.ppnext != null) { prStart(d.ppgo || pr.mode || 'real'); V2.redraw(); if (d.ppnext != null || d.ppskip != null) scrollTo({top: 0, behavior: 'smooth'}); return; }
  if (d.pphome != null) { pr.step = 'start'; V2.redraw(); return; }
  if (d.ppreset != null) { pr.pick = []; pr.lead = []; V2.redraw(); return; }
  if (d.ppick) { const n = d.ppick;
    if (pr.pick.length < 4) { if (pr.pick.includes(n)) pr.pick = pr.pick.filter(x => x !== n); else pr.pick.push(n); }
    else if (pr.pick.includes(n)) { if (pr.lead.includes(n)) pr.lead = pr.lead.filter(x => x !== n); else if (pr.lead.length < 2) pr.lead.push(n); else { pr.lead.shift(); pr.lead.push(n); } }
    else { toast('Four are picked. Tap "Start the pick again" to change them.'); return; }
    V2.redraw(); return; }
  if (d.pprev != null) { if (pr.pick.length !== 4 || pr.lead.length !== 2) return; prReveal(); V2.redraw(); scrollTo({top: 0, behavior: 'smooth'}); } });
