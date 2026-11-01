// ---------- Team preview practice (Nov) ----------
// A real opposing six from the Showdown ladder; you pick four to bring and two to lead, then see what strong players chose.
// Data: meta/practice (out/practice.json from practice.mjs): opposing sixes with, for every Pokémon strong players (rated
// minR+) had against that six or one 5 of 6 the same, how often they brought and led it; and rounds (real games) with what
// that player brought and led, and what players with a similar six did against a similar six. Facts about choices, never
// a chance of winning. The score (matching the strong players' four) is kept in this browser only.
function cleanPractice(v) { try {
  if (!v || typeof v !== 'object' || !Array.isArray(v.dict) || !Array.isArray(v.opp) || !Array.isArray(v.rounds)) return null;
  const D = v.dict.map(x => typeof x === 'string' && byName.has(x) ? x : null), nm = i => Number.isInteger(i) ? D[i] || null : null;
  const list = (a, len) => { if (!Array.isArray(a) || (len && a.length !== len)) return null; const o = a.map(nm); return o.every(Boolean) ? o : null; };
  const cnt = x => Number.isFinite(+x) && +x >= 0 ? Math.round(+x) : 0;
  const opp = v.opp.slice(0, 500).map(o => { if (!Array.isArray(o)) return null; const six = list(o[0], 6); if (!six) return null; const mons = {};
    (Array.isArray(o[2]) ? o[2] : []).forEach(r => { if (!Array.isArray(r)) return; const n = nm(r[0]), c = [cnt(r[1]), cnt(r[2]), cnt(r[3])]; if (n && c[0] > 0 && c[1] <= c[0] && c[2] <= c[0]) mons[n] = c; });
    return {six, n: cnt(o[1]), mons}; });
  const rounds = v.rounds.slice(0, 2000).map(r => { if (!Array.isArray(r) || !opp[r[0]]) return null;
    const mine = list(r[1], 6), b = list(r[2], 4), l = list(r[3], 2), tb = list(r[7]), tl = list(r[8]), p = Array.isArray(r[9]) ? r[9] : null;
    if (!mine || !b || !l || !tb || !tl || !p) return null; const four = list(p[1], 4), lead = list(p[3], 2); if (!four || !lead) return null;
    return {o: r[0], mine, b, l, r: cnt(r[4]), tr: cnt(r[5]), won: r[6] === 1, tb, tl, pair: {n: Math.max(1, cnt(p[0])), four, fourN: Math.max(1, cnt(p[2])), lead, leadN: Math.max(1, cnt(p[4]))}}; }).filter(Boolean);
  if (!rounds.length) return null;
  return {opp, rounds, minR: cnt(v.minR), source: str(v.source, 200), updated: str(v.updated, 40), from: cnt(v.from), to: cnt(v.to)}; } catch (e) { return null; } }
const prBase = n => String(n || '').replace(/-Mega.*$/, '');
const prSame = (a, b) => a.length === b.length && a.every(x => b.some(y => prBase(y) === prBase(x)));
let pr = {step: 'start', mode: null, ri: -1, oi: -1, six: [], pick: [], lead: [], recent: []};
// the score: matching the strong players' four, kept per viewer in this browser
function prScore() { const s = LS.get('np.practice', null); return s && typeof s === 'object' ? {streak: +s.streak || 0, best: +s.best || 0, played: +s.played || 0, matched: +s.matched || 0} : {streak: 0, best: 0, played: 0, matched: 0}; }
function prScoreSave(s) { LS.set('np.practice', s); }
// how many of a six have at least 5 games against this opposing team
function prKnown(o, six) { return six.filter(n => (o.mons[prBase(n)] || [0])[0] >= 5).length; }
function prPickRandom(arr) { const fresh = arr.filter(x => !pr.recent.includes(x)), pool = fresh.length ? fresh : arr; return pool[Math.floor(Math.random() * pool.length)]; }
function prStart(mode) { const P = META.practice; if (!P) return; pr.mode = mode; pr.pick = []; pr.lead = []; pr.step = 'pick';
  if (mode === 'mine') { const mine = members().map(m => m.p.n); if (mine.length !== 6) { pr.mode = 'real'; return prStart('real'); }
    const all = P.opp.map((o, i) => o ? i : -1).filter(i => i >= 0), ok = all.filter(i => prKnown(P.opp[i], mine) >= 4);
    pr.oi = prPickRandom(ok.length ? ok : all); pr.ri = -1; pr.six = mine; pr.recent = [pr.oi, ...pr.recent].slice(0, 25); }
  else { pr.ri = prPickRandom(P.rounds.map((r, i) => i)); const r = P.rounds[pr.ri]; pr.oi = r.o; pr.six = r.mine.slice(); pr.recent = [pr.ri, ...pr.recent].slice(0, 40); } }
// what strong players chose, as the four (and two leads) to match
function prTarget() { const P = META.practice; if (!P) return null; const o = P.opp[pr.oi]; if (!o) return null;
  if (pr.mode === 'real') { const r = P.rounds[pr.ri]; return r ? {kind: 'pair', four: r.pair.four, lead: r.pair.lead, n: r.pair.n, k: r.pair.fourN, kl: r.pair.leadN} : null; }
  const rate = (n, j) => { const c = o.mons[prBase(n)]; return c && c[0] ? c[j] / c[0] : -1; };
  const rows = pr.six.filter(n => (o.mons[prBase(n)] || [0])[0] >= 5).sort((a, b) => rate(b, 1) - rate(a, 1) || (o.mons[prBase(b)][0] - o.mons[prBase(a)][0]));
  if (rows.length < 4) return null; const four = rows.slice(0, 4);
  return {kind: 'rates', four, lead: four.slice().sort((a, b) => rate(b, 2) - rate(a, 2)).slice(0, 2)}; }
function prReveal() { const t = prTarget(), s = prScore(); pr.step = 'reveal'; pr.result = null;
  if (t) { const m4 = prSame(pr.pick, t.four), ml = prSame(pr.lead, t.lead); s.played++; if (m4) { s.matched++; s.streak++; s.best = Math.max(s.best, s.streak); } else s.streak = 0; prScoreSave(s); pr.result = {m4, ml}; } }
const prN = n => (+n || 0).toLocaleString('en-US'), prPc = (a, b) => b ? Math.round(100 * a / b) : 0;
const prDay = t => { try { return new Date(t * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) { return ''; } };
function prMon(n, cls, inner) { const p = byName.get(n); return p ? `<div class="prm ${cls || ''}">${sprite(p) || ''}<span class="prmn">${esc(p.d)}</span>${inner || ''}</div>` : ''; }
function prFour(four, lead) { return `<div class="prfour">${[...lead, ...four.filter(n => !lead.some(l => prBase(l) === prBase(n)))].map(n => prMon(n, '', lead.some(l => prBase(l) === prBase(n)) ? '<i class="prtag lead">LEAD</i>' : '<i class="prtag">BACK</i>')).join('')}</div>`; }
function prTheirs(o, sm) { return `<div class="prband them${sm ? " sm" : ""}"><div class="chk">Their six · as seen at team preview</div><div class="prsix">${o.six.map(n => prMon(n)).join('')}</div></div>`; }
function renderPractice() { const el = $('prOut'); if (!el) return; const sec = $('practice');
  if (typeof CH === 'object' && CH.pagehead) CH.pagehead(sec, 'Battle · team preview practice', 'Pick your <span style="color:var(--chblueT)">four.</span>', '');
  const P = META.practice, s = prScore();
  if (!P) { el.innerHTML = '<div class="empty-note">Practice games appear after the next data refresh.</div>'; return; }
  const range = P.from && P.to ? ` (${prDay(P.from)} – ${prDay(P.to)})` : '';
  const foot = `<p class="t2 prsrc">From ${esc(P.source || 'recent Showdown ladder games')}${range}. "Strong players" are ladder players rated ${prN(P.minR)}+. A similar team is the same six, or five of the six the same.</p>`;
  const score = s.played ? `<div class="prscore" aria-label="Your practice score"><span><b>${s.streak}</b> in a row</span><span><b>${s.best}</b> best</span><span><b>${s.matched}</b> of ${s.played} matched</span></div>` : '';
  const ms = members();
  if (pr.step === 'start' || !P.opp[pr.oi]) {
    const can = ms.length === 6, mode = pr.mode || (can ? 'mine' : 'real');
    el.innerHTML = `<div class="prstart"><p class="prlede">A real team from the ladder appears. Pick <b>four</b> to bring and <b>two</b> to lead, then see what strong players chose against it.</p>
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
      return `<button type="button" class="prpick${on ? ' on' : ''}${ld ? ' ld' : ''}" data-prpick="${esc(n)}" aria-pressed="${on}" aria-label="${esc(p.d)}${on ? (ld ? ': bringing, leading' : ': bringing') : ''}">${sprite(p) || ''}<span class="prmn">${esc(p.d)}</span>${ld ? '<i class="prtag lead">LEAD</i>' : on ? '<i class="prtag">BRING</i>' : ''}</button>`; };
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
    : `<div class="prres ${res && res.m4 ? 'yes' : 'no'}"><b>${res && res.m4 ? 'You matched the strong players\' four!' : 'A different four from the strong players'}</b><span>${res && res.ml ? 'Same two leads too.' : res && res.m4 ? 'Different leads.' : ''}${s.streak >= 2 ? ` You matched the top players' four ${s.streak} times in a row.` : s.best >= 2 && !(res && res.m4) ? ` Your best run is ${s.best} in a row.` : ''} ${s.matched} of ${s.played} matched so far.</span></div>`;
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
      ${c ? `<div class="prbar" aria-hidden="true"><i style="--w:${br}%"></i></div><div class="t2">Brought <b>${br}%</b> · led ${ld}% · ${prN(c[0])} game${c[0] === 1 ? '' : 's'}${c[0] < 10 ? ' · few games, a hint' : ''}</div>` : '<div class="t2">No games with it against this team</div>'}</div></div>`; }).join('');
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
