// ---------- Team preview practice (today's drawing and taps). The logic (state, scoring, picks, reveal) is shared: 63-practice-data.js (moved Nov 12) ----------
function prMon(n, cls, inner) { const p = byName.get(n); return p ? `<div class="prm ${cls || ''}">${sprite(p) || ''}<span class="prmn">${esc(p.d)}</span>${inner || ''}</div>` : ''; }
function prFour(four, lead) { return `<div class="prfour">${[...lead, ...four.filter(n => !lead.some(l => prBase(l) === prBase(n)))].map(n => prMon(n, '', lead.some(l => prBase(l) === prBase(n)) ? '<i class="prtag lead">Lead</i>' : '<i class="prtag">Back</i>')).join('')}</div>`; }
function prTheirs(o, sm) { return `<div class="prband them${sm ? " sm" : ""}"><div class="chk">Their six · as seen at team preview</div><div class="prsix">${o.six.map(n => prMon(n)).join('')}</div></div>`; }
function renderPractice() { const el = $('prOut'); if (!el) return; const sec = $('practice');
  if (typeof CH === 'object' && CH.pagehead) CH.pagehead(sec, 'Battle · team preview practice', 'Pick your <span style="color:var(--chblueT)">four.</span>', '');
  const P = META.practice, s = prScore();
  if (!P) { el.innerHTML = '<div class="empty-note">Practice games appear after the next data refresh.</div>'; return; }
  const range = P.from && P.to ? ` (${prDay(P.from)} – ${prDay(P.to)})` : '';
  const foot = `<p class="t2 prsrc wdsub">From the Showdown ladder${range}${typeof tipText === 'function' ? ' ' + tipText('prsrc', 'How practice picks its games', `From ${P.source || 'recent Showdown ladder games'}${range}. "Strong players" are ladder players rated ${prN(P.minR)}+. A similar team is the same six, or five of the six the same.`) : ''}</p>`;
  const score = s.played ? `<div class="prscore" aria-label="Your practice score"><span><b>${s.streak}</b> in a row</span><span><b>${s.best}</b> best</span><span><b>${s.matched}</b> of ${s.played} matched</span></div>` : '';
  const ms = members();
  if (pr.step === 'start' || !P.opp[pr.oi]) {
    const can = ms.length === 6, mode = pr.mode || (can ? 'mine' : 'real');
    el.innerHTML = `<div class="prstart"><p class="prlede wdsub">Pick <b>four</b> and <b>two</b> leads against a real ladder team${typeof tipText === 'function' ? ' ' + tipText('prhow', 'How practice works', 'A real team from the ladder appears. Pick four to bring and two to lead, then see what strong players chose against it.') : ''}</p>
      <div class="prmodes" role="radiogroup" aria-label="Which six to practice with">
        <button type="button" role="radio" class="prmode" data-prmode="mine" aria-checked="${mode === 'mine'}"${can ? '' : ' disabled'}><b>Use my team</b><span>${can ? esc(teamTitleFor(ms)) + ' against real teams' : `Add six Pokémon on My team to use it${ms.length ? ` (you have ${ms.length})` : ''}`}</span>${can ? `<span class="prmini">${ms.map(m => sprite(m.p, 'mini') || '').join('')}</span>` : ''}</button>
        <button type="button" role="radio" class="prmode" data-prmode="real" aria-checked="${mode === 'real'}"><b>Practice with a real team</b><span>A strong player's six from the same game: compare your pick with theirs</span></button></div>
      ${score}<button type="button" class="chprimary prgo" data-prgo="${mode}">Start <span aria-hidden="true">➜</span></button>${can ? '' : `<button type="button" class="linkbtn" data-view="build">Go to My team</button>`}</div>${foot}`;
    return; }
  const o = P.opp[pr.oi], r = pr.mode === 'real' ? P.rounds[pr.ri] : null;
  const who = r ? `<div class="t2 prwho">Ladder player rated <b>${prN(r.tr)}</b> · your side was played by someone rated <b>${prN(r.r)}</b></div>` : `<div class="t2 prwho">Strong players faced this team (or one 5 of 6 the same) in <b>${prN(o.n)}</b> games</div>`;
  if (pr.step === 'pick') {
    const nP = pr.pick.length, nL = pr.lead.length, stage = nP < 4 ? 1 : 2;
    const card = n => { const p = byName.get(n); if (!p) return ''; const on = pr.pick.includes(n), ld = pr.lead.includes(n);
      return `<button type="button" class="prpick${on ? ' on' : ''}${ld ? ' ld' : ''}" data-prpick="${esc(n)}" aria-pressed="${on}" aria-label="${esc(p.d)}${on ? (ld ? ': bringing, leading' : ': bringing') : ''}">${sprite(p) || ''}<span class="prmn">${esc(p.d)}</span>${ld ? '<i class="prtag lead">Lead</i>' : on ? '<i class="prtag">BRING</i>' : ''}</button>`; };
    el.innerHTML = `${score}${prTheirs(o)}${who}
      <div class="prband you"><div class="prsteps"><span class="prst${stage === 1 ? ' on' : ' done'}">1 · Bring four <b>${nP}/4</b></span><span class="prst${stage === 2 ? ' on' : ''}">2 · Lead two <b>${nL}/2</b></span></div>
        <div class="prhint" aria-live="polite">${stage === 1 ? 'Tap the four you would bring.' : nL < 2 ? 'Now tap two of your four to lead.' : 'Ready. Tap a lead again to change it.'}</div>
        <div class="prsix mine">${pr.six.map(card).join('')}</div>
        ${nP ? `<button type="button" class="linkbtn" data-prreset="1">Start the pick again</button>` : ''}</div>
      <button type="button" class="chprimary prgo" data-prrev="1"${nP === 4 && nL === 2 ? '' : ' disabled'}>Reveal what strong players chose</button>
      <div class="row prrow"><button type="button" class="linkbtn" data-prskip="1">Skip this team</button><button type="button" class="linkbtn" data-prhome="1">Change six</button></div>${foot}`;
    return; }
  // reveal
  const t = prTarget(), res = pr.result;
  const banner = !t ? `<div class="prres none"><b>No score this round</b><span>Fewer than four of your Pokémon have 5+ games against this team, so there is no strong players' four to compare with. The numbers below still show what players did.</span></div>`
    : `<div class="prres ${res && res.m4 ? 'yes' : 'no'}"><b>${res && res.m4 ? 'You matched the strong players\' four!' : 'A different four from the strong players'}</b><span>${res && res.ml ? (res.m4 ? 'Same two leads too.' : 'Same two leads as theirs.') : res && res.m4 ? 'Different leads.' : ''}${s.streak >= 2 ? ` You matched the top players' four ${s.streak} times in a row.` : s.best >= 2 && !(res && res.m4) ? ` Your best run is ${s.best} in a row.` : ''} ${s.matched} of ${s.played} matched so far.</span></div>`;
  const hint = n => n < 10 ? `<span class="prhintn">only ${prN(n)} similar game${n === 1 ? '' : 's'} — treat as a hint</span>` : '';
  let chose = '';
  if (r) chose = `<div class="prcard"><div class="chk">What this player chose · rated ${prN(r.r)}</div>${prFour(r.b, r.l)}
      <p class="t2">They ${r.won ? 'won' : 'lost'} this game. Their opponent led ${r.tl.map(n => esc((byName.get(n) || {}).d || n)).join(' + ')}${r.tb.length > 2 ? ` and also brought ${r.tb.filter(n => !r.tl.includes(n)).map(n => esc((byName.get(n) || {}).d || n)).join(' + ')}` : ''}.</p>
      <div class="chk" style="margin-top:12px">Players with a similar six against a similar team</div>
      <p class="prpair" data-prn="${r.pair.n}" data-prk="${r.pair.fourN}">${r.pair.n === 1 ? 'This is the only such game in the data.' : `<b>${prN(r.pair.n)}</b> games. The most common four was brought in <b>${prN(r.pair.fourN)}</b> of them, led by ${r.pair.lead.map(n => esc(byName.get(n).d)).join(' + ')} in <b>${prN(r.pair.leadN)}</b>.`} ${hint(r.pair.n)}</p>
      ${r.pair.n > 1 ? prFour(r.pair.four, r.pair.lead) : ''}</div>`;
  else chose = t ? `<div class="prcard"><div class="chk">Strong players' four · the four of yours they brought most often against this team</div>${prFour(t.four, t.lead)}</div>` : '';
  const yourPick = `<div class="prcard"><div class="chk">Your pick</div>${prFour(pr.pick, pr.lead)}</div>`;
  const rows = pr.six.map(n => { const p = byName.get(n), c = o.mons[prBase(n)], br = c ? prPc(c[1], c[0]) : 0, ld = c ? prPc(c[2], c[0]) : 0, you = pr.pick.includes(n);
    return `<div class="prrate" data-prmon="${esc(n)}" data-prg="${c ? c[0] : 0}" data-prb="${br}" data-prl="${ld}">${sprite(p, 'mini') || ''}<div class="prrb"><div class="prrn"><b>${esc(p.d)}</b>${you ? `<span class="prtag ${pr.lead.includes(n) ? 'lead' : ''}">${pr.lead.includes(n) ? 'YOU LED' : 'YOU BROUGHT'}</span>` : ''}</div>
      ${c ? `<div class="prbar" aria-hidden="true"><i style="--w:${br}%"></i></div><div class="t2">Brought in <b>${pctTxt(100 * c[1] / c[0])}</b> of games · led in ${pctTxt(100 * c[2] / c[0])} · ${prN(c[0])} game${c[0] === 1 ? '' : 's'}${c[0] < 10 ? ' — only a few, treat as a hint' : ''}</div>` : '<div class="t2">No games with it against this team</div>'}</div></div>`; }).join('');
  el.innerHTML = `${banner}${prTheirs(o, true)}<div class="prgrid2">${yourPick}${chose}</div>
    <div class="prcard"><div class="chk">Each of your six against this team</div><p class="t2">Players rated ${prN(P.minR)}+ with this Pokémon against this team (or one 5 of 6 the same): how often they brought it and led with it.</p><div class="prrates">${rows}</div></div>
    <button type="button" class="chprimary prgo" data-prnext="1">Next team <span aria-hidden="true">➜</span></button>
    <div class="row prrow"><button type="button" class="linkbtn" data-prhome="1">Change six</button></div>${foot}`;
  requestAnimationFrame(() => el.querySelectorAll('.prbar i').forEach(i => i.classList.add('go'))); }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-prmode],[data-prgo],[data-prpick],[data-prreset],[data-prrev],[data-prskip],[data-prhome],[data-prnext]'); if (!b) return; const d = b.dataset;
  if (d.prmode) { if (b.disabled) return; pr.mode = d.prmode; renderPractice(); return; }
  if (d.prgo || d.prskip || d.prnext) { prStart(d.prgo || pr.mode || 'real'); renderPractice(); try { const sec = $('practice'); if (sec && (d.prnext || d.prskip)) sec.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (er) {} return; }
  if (d.prhome) { pr.step = 'start'; renderPractice(); return; }
  if (d.prreset) { pr.pick = []; pr.lead = []; keepScroll(renderPractice); return; }
  if (d.prpick) { const n = d.prpick;
    if (pr.pick.length < 4) { if (pr.pick.includes(n)) pr.pick = pr.pick.filter(x => x !== n); else pr.pick.push(n); }
    else if (pr.pick.includes(n)) { if (pr.lead.includes(n)) pr.lead = pr.lead.filter(x => x !== n); else if (pr.lead.length < 2) pr.lead.push(n); else { pr.lead.shift(); pr.lead.push(n); } }
    else { toast('Four are picked. Tap "Start the pick again" to change them.'); return; }
    keepScroll(renderPractice); return; }
  if (d.prrev) { if (pr.pick.length !== 4 || pr.lead.length !== 2) return; prReveal(); renderPractice(); try { const sec = $('practice'); if (sec) sec.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (er) {} } });
// Battle page: a way in to practice, and Copy for Showdown on their six when it is a real team sheet
CH.wrap('renderBattle', () => { const el = $('bmOut'), sec = $('matchup'); if (!el || !sec) return;
  if (!$('prEntry')) { const a = document.createElement('button'); a.type = 'button'; a.id = 'prEntry'; a.className = 'prentry'; a.dataset.view = 'practice';
    a.innerHTML = '<span class="prei" aria-hidden="true">4/6</span><span><b>Team preview practice</b><span class="t2">Pick four and two leads against real ladder teams, then see what strong players chose</span></span><span aria-hidden="true">›</span>';
    const oq = $('oppQuick'); if (oq && oq.parentNode) oq.after(a); else el.before(a); }
  const k = el.querySelector('.chbmk'); if (k && !el.querySelector('[data-sdcopy="opp"]') && sdOppSheet()) k.insertAdjacentHTML('afterend', `<div class="prcopyopp">${sdBtn('opp')}<span class="t2">Their open team sheet</span></div>`); });
