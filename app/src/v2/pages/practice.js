// ---------- Team Preview Practice (Nov 14), Battle's tool: pick four and two leads against a real ladder team ----------
// Sim's pick: 'Arena VS' (mock-ups docs/rebuild/mocks/practice/round2). The state, scoring, picks and reveal are today's shared
// logic (63-practice-data.js: pr, prStart, prReveal, prTarget, prScore); today's words and rules are kept (63-practice.js).
// Reskin proposal (helper hP3, Nov 22; NOT approved yet): Sim's direction "i like the 6v6 part ... bc its like the real pokemon champions
// so can we do our new kit but in that style but upgraded". The real game's team preview stays: their six against your six, side by side
// (theirs above yours on phones), you tap four and two leads. It now sits on the war room's night-plot board (dark in day and night, pink
// offset), on the kit: the kit header, art bursting out of each slanted plate, type chips with their symbol beside the word, Plot blue for
// yours, magenta for theirs, the plan line's pink dashes as the seam, and the page's one pink move. The reveal is the same board answering
// back: each of your plates fills to how often strong players brought it.
V2.ppCp = n => { const m = (typeof ART_META === 'object' && ART_META[SPRITE_ID[n]]) || [150, 150, 165]; return `${m[0]},${m[1]},${m[2]}`; };
// a type chip: the type's symbol beside its word, on the type colour (Sim: never the symbol alone)
V2.ppTy = n => ((byName.get(n) || {}).t || []).map(t => `<span class="pp2-tc"${V2.TYPES.includes(t) ? ` style="--tc:var(--ty-${t})"` : ''}>${V2.kTy(t)}<span>${V2.esc(t)}</span></span>`).join('');
V2.ppKc = n => { const t = ((byName.get(n) || {}).t || [])[0]; return V2.TYPES.includes(t) ? `--kc:var(--tyn-${t})` : '--kc:var(--type-none)'; };
// a plate's name: the form on its own small line ('Mega', 'Paldean · Combat'; a blank line when none, so every plate's frame is the same),
// the name under it, fitted down a size before it would wrap (kit.js V2.kFit)
V2.ppName = n => { const k = V2.kName(n); return `<b class="nm u"><small class="mg">${k.form ? V2.esc(k.form) : '&nbsp;'}</small><span class="nw" data-kmax="5">${V2.esc(k.name)}</span></b>`; };
V2.ppMeter = (nP, nL) => `<div class="pp2-meter" role="img" aria-label="Bring four, ${nP} of 4; lead two, ${nL} of 2"><span class="grp"><span class="lab">1 · Bring four <b class="u">${nP}/4</b></span><span class="pips">${[0, 1, 2, 3].map(i => `<i class="${i < nP ? 'on' : ''}"></i>`).join('')}</span></span><span class="grp"><span class="lab">2 · Lead two <b class="u">${nL}/2</b></span><span class="pips">${[0, 1].map(i => `<i class="${i < nL ? 'on ld' : ''}"></i>`).join('')}</span></span></div>`;
V2.ppFoot = P => { const range = P.from && P.to ? ` (${prDay(P.from)} – ${prDay(P.to)})` : ''; return `<p class="fine pp2-src">From the Showdown ladder${range}. "Strong players" are ladder players rated ${prN(P.minR)}+ on these replays (the replay rating; the 1630+ on usage numbers is Smogon's separate stats cut-off). A similar team is the same six, or five of the six the same.</p>`; };
V2.ppScore = s => s.played ? `<p class="pp2-score" aria-label="Your practice score"><b class="u">${s.streak}</b> in a row, <b class="u">${s.best}</b> best, <b class="u">${s.matched}</b> of ${s.played} matched</p>` : '';
V2.ppHead = (h1Html, leadHtml) => `<div class="pp2-h">${V2.kHead({kicker: 'BATTLE · TEAM PREVIEW', h1Html, leadHtml})}</div>`;

// every name in one six takes the smallest size any of them needed (V2.kFit fits each name alone; the kit evens only its own rosters)
V2.ppEven = () => document.querySelectorAll('.pp2-six').forEach(r => { const g = [...r.querySelectorAll('.nw')], m = Math.max(0, ...g.map(e => +e.dataset.kf || 0)); g.forEach(e => { if ((+e.dataset.kf || 0) < m) e.dataset.kf = String(m); }); });
// the reveal on desktop (two sides): each of your plates and the one of theirs beside it share one height, so the two sixes stay in rows
V2.ppRows = () => { const me = [...document.querySelectorAll('.pp2.rev .pp2-plate.me')], th = [...document.querySelectorAll('.pp2.rev .pp2-plate.them')];
  [...me, ...th].forEach(e => { e.style.minHeight = ''; }); if (innerWidth < 1180 || me.length !== th.length) return;
  const h = me.map((e, i) => Math.max(e.getBoundingClientRect().height, th[i].getBoundingClientRect().height));
  me.forEach((e, i) => { e.style.minHeight = th[i].style.minHeight = Math.ceil(h[i]) + 'px'; }); };
V2.ppEvenSoon = () => requestAnimationFrame(() => requestAnimationFrame(() => { if (document.querySelector('.pp2-board .nw')) { V2.ppEven(); V2.ppRows(); } }));
addEventListener('resize', V2.ppEvenSoon);
try { document.fonts.addEventListener('loadingdone', V2.ppEvenSoon); } catch (e) {}
V2.pages.practice = {place: 'battle', draw() { V2.ppEvenSoon(); const E = V2.esc, P = META.practice, s = prScore(), tools = V2.battleToolsBar('practice');
  if (!P) return `<div class="pp2">${tools}${V2.ppHead('Pick your <em>four.</em>')}<p class="pp2-lede">Practice games appear after the next data refresh.</p></div>`;
  const ms = members();
  // start: use my team (needs exactly six) or a real team from the ladder; the board's other half shows the pairs strong players bring together
  if (pr.step === 'start' || !P.opp[pr.oi]) { const can = ms.length === 6, mode = pr.mode || (can ? 'mine' : 'real');
    const pairs = V2.pairsHtml ? V2.pairsHtml() : '';
    return `<div class="pp2 st">${tools}${V2.ppHead('Pick your <em>four.</em>', 'Pick <b>four</b> and <b>two</b> leads against a real ladder team, then see what strong players chose against it.')}${V2.ppScore(s)}
      <section class="pp2-board pp2-start${pairs ? '' : ' solo'}"><div class="pp2-side mine"><p class="pp2-cap u">Your six · who plays your side</p>
      <div class="pp2-modes" role="radiogroup" aria-label="Which six to practice with">
        <button type="button" role="radio" class="pp2-mode" data-ppmode="mine" aria-checked="${mode === 'mine'}"${can ? '' : ' disabled'}><b class="u">Use My Team</b><span>${can ? E(teamTitleFor(ms)) + ' against real teams' : `Add six Pokémon on My Team to use it${ms.length ? ` (you have ${ms.length})` : ''}`}</span>${can ? `<span class="six">${ms.map(m => V2.mon(m.p.n, {iw: 56, bare: true})).join('')}</span>` : ''}</button>
        <button type="button" role="radio" class="pp2-mode" data-ppmode="real" aria-checked="${mode === 'real'}"><b class="u">Practice With a Real Team</b><span>A strong player's six from the same game: compare your pick with theirs</span><span class="pp2-q" aria-hidden="true">${'<i>?</i>'.repeat(6)}</span></button></div>
      <div class="pp2-act">${V2.kGo('Start', {'data-ppgo': mode})}${can ? '' : '<a class="np-link" href="#team">Go to My Team</a>'}</div></div>
      ${pairs ? `<div class="pp2-seam" aria-hidden="true"></div><div class="pp2-side them pp2-pairs">${pairs}</div>` : ''}</section>${V2.ppFoot(P)}</div>`; }
  const o = P.opp[pr.oi], r = pr.mode === 'real' ? P.rounds[pr.ri] : null, rev = pr.step === 'reveal', t = rev ? prTarget() : null, res = pr.result;
  const who = r ? `<p class="pp2-who">Ladder player rated <b>${prN(r.tr)}</b>, your side was played by someone rated <b>${prN(r.r)}</b></p>` : `<p class="pp2-who">Strong players faced this team (or one 5 of 6 the same) in <b>${prN(o.n)}</b> games</p>`;
  const nP = pr.pick.length, nL = pr.lead.length, pickI = n => pr.pick.indexOf(n), isL = n => pr.lead.includes(n);
  const inT = n => !!(t && t.four.some(x => prBase(x) === prBase(n))), tL = n => !!(t && t.lead.some(x => prBase(x) === prBase(n)));
  const rate = n => { const c = o.mons[prBase(n)]; return c ? {g: c[0], b: prPc(c[1], c[0]), l: prPc(c[2], c[0])} : null; };
  // the reveal: the plate fills to how often strong players brought it (the board answers back); the big number is that %
  const bars = n => { const c = rate(n); if (!c) return '<p class="pp2-rate none">No games with it against this team</p>'; return `<div class="pp2-rate"><div class="bars" aria-hidden="true"><i class="b" style="width:${c.b}%"></i><i class="l" style="width:${c.l}%"></i></div><small>Brought in <b>${c.b}%</b> of games, led in ${c.l}%, ${prN(c.g)} game${c.g === 1 ? '' : 's'}${c.g < 10 ? ', only a few: treat as a hint' : ''}</small></div>`; };
  const big = n => { const c = rate(n); return c ? `<b class="pp2-pc u" aria-hidden="true">${c.b}<small>%</small></b>` : '<b class="pp2-pc none u" aria-hidden="true">–</b>'; };
  const stamp = n => !rev || !t ? '' : `<b class="pp2-stamp k-tag u ${inT(n) ? 'yes k-good' : 'no k-neutral'}">${inT(n) ? (tL(n) ? 'They led' : 'They brought') : 'Not in their four'}</b>`;
  const mine = n => { const on = pickI(n) >= 0, ld = isL(n), lab = E(V2.disp(n)) + (on ? (ld ? ': bringing, leading' : ': bringing') : '');
    return `<button type="button" class="pp2-plate me${on ? ' on' : ''}${ld ? ' ld' : ''}${rev && t ? (inT(n) ? ' ok' : ' miss') : ''}${!rev && !on && nP === 4 ? ' dim' : ''}" style="--cp:${V2.ppCp(n)};${V2.ppKc(n)}"${rev ? ' tabindex="-1"' : ` data-ppick="${E(n)}" aria-pressed="${on}"`} aria-label="${lab}">${V2.mon(n, {iw: 112, bare: true})}<span class="tx">${V2.ppName(n)}<span class="ty">${V2.ppTy(n)}${stamp(n)}</span>${rev ? bars(n) : ''}</span>${rev || on ? `<span class="pp2-mk">${rev ? big(n) : `<i class="pp2-no u" aria-hidden="true">${pickI(n) + 1}</i>`}${ld ? '<i class="pp2-rib u">Lead</i>' : ''}</span>` : ''}</button>`; };
  // the reveal of a real game answers on their side too: what this opponent led, brought and left back (as the real game shows after a battle)
  const oStamp = n => { if (!rev || !r) return ''; const ld = r.tl.some(x => prBase(x) === prBase(n)), br = ld || r.tb.some(x => prBase(x) === prBase(n));
    return `<b class="pp2-stamp k-tag u ${br ? 'brought' : 'k-neutral'}">${ld ? 'Led' : br ? 'Brought' : 'Left back'}</b>`; };
  const theirs = n => `<div class="pp2-plate them" style="--cp:${V2.ppCp(n)};${V2.ppKc(n)}"><span class="tx">${V2.ppName(n)}<span class="ty">${V2.ppTy(n)}${oStamp(n)}</span></span>${V2.mon(n, {iw: 96, bare: true})}</div>`;
  const meter = rev ? '' : V2.ppMeter(nP, nL);
  const board = `<section class="pp2-board pp2-arena"><div class="pp2-side mine"><div class="pp2-top"><p class="pp2-cap u">Your six</p>${meter}</div><div class="pp2-six">${pr.six.map(mine).join('')}</div></div><div class="pp2-seam" aria-hidden="true"><b class="u">VS</b></div><div class="pp2-side them"><div class="pp2-top"><p class="pp2-cap u">Their six · as seen at team preview</p></div><div class="pp2-six">${o.six.map(theirs).join('')}</div>${who}</div></section>`;
  if (!rev) { const stage = nP < 4 ? 1 : 2, line = nP ? `Bringing <b>${pr.pick.map(n => E(V2.disp(n))).join(', ')}</b>${nL ? `. Leading <b>${pr.lead.map(n => E(V2.disp(n))).join(' + ')}</b>` : ''}.` : '';
    return `<div class="pp2 pk">${tools}${V2.ppHead('Pick your <em>four.</em>')}${V2.ppScore(s)}<p class="pp2-hint u" aria-live="polite">${stage === 1 ? 'Tap the four you would bring.' : nL < 2 ? 'Now tap two of your four to lead.' : 'Ready. Tap a lead again to change it.'}</p>
      ${board}<p class="pp2-line" aria-live="polite">${line}</p>
      <div class="pp2-act">${V2.kGo('Reveal What Strong Players Chose', {'data-pprev': true, disabled: !(nP === 4 && nL === 2)})}<span class="pp2-links"><button type="button" class="np-link" data-ppskip>Skip This Team</button>${nP ? '<button type="button" class="np-link" data-ppreset>Start the Pick Again</button>' : ''}<button type="button" class="np-link" data-pphome>Change Six</button></span></div>${V2.ppFoot(P)}</div>`; }
  // reveal: the verdict, both fours, and the same board with each of your six filled to how often strong players brought and led it
  const banner = !t ? `<div class="pp2-banner none">${V2.kTag('neutral', 'No score')}<b class="pp2-bv u">No score this round</b><span class="pp2-bs">Fewer than four of your Pokémon have 5+ games against this team, so there is no strong players' four to compare with. The numbers below still show what players did.</span></div>`
    : `<div class="pp2-banner ${res && res.m4 ? 'yes' : 'no'}">${res && res.m4 ? V2.kTag('good', 'Matched') : V2.kTag('bad', 'Missed')}<b class="pp2-bv u">${res && res.m4 ? 'You matched the strong players\' four!' : 'A different four from the strong players'}</b><span class="pp2-bs">${res && res.ml ? (res.m4 ? 'Same two leads too.' : 'Same two leads as theirs.') : res && res.m4 ? 'Different leads.' : ''}${s.streak >= 2 ? ` You matched the top players' four ${s.streak} times in a row.` : ''}</span></div>`;
  const same = (n, list) => list.some(x => prBase(x) === prBase(n));
  const tile = (n, ld, other) => { const k = V2.kName(n); return `<span class="pp2-t${ld ? ' ld' : ''}${other && same(n, other) ? ' same' : ''}" style="${V2.ppKc(n)}">${V2.mon(n, {iw: 64, bare: true})}<b>${k.form ? `<small>${E(k.form)}</small>` : ''}${E(k.name)}</b><i class="u">${ld ? 'Lead' : 'Back'}</i></span>`; };
  const four = (list, lead, other) => `<span class="pp2-four">${lead.map(n => tile(n, true, other)).join('')}${list.filter(n => !lead.includes(n)).map(n => tile(n, false, other)).join('')}</span>`;
  const theirLabel = r ? `What this player chose, rated ${prN(r.r)}` : 'Strong players\' four';
  const fours = `<section class="pp2-fours"><div class="you"><p class="pp2-cap u">Your pick</p>${four(pr.pick, pr.lead)}</div>${r ? `<div><p class="pp2-cap u">${theirLabel}</p>${four(r.b, r.l, pr.pick)}<p class="pp2-who">They ${r.won ? 'won' : 'lost'} this game. Their opponent led ${r.tl.map(n => E((byName.get(n) || {}).d || n)).join(' + ')}${r.tb.length > 2 ? ` and also brought ${r.tb.filter(n => !r.tl.includes(n)).map(n => E((byName.get(n) || {}).d || n)).join(' + ')}` : ''}.</p></div>
      <div class="sim"><p class="pp2-cap u">Players with a similar six against a similar team</p><p class="pp2-who">${r.pair.n === 1 ? 'This is the only such game in the data.' : `<b>${prN(r.pair.n)}</b> games. The most common four was brought in <b>${prN(r.pair.fourN)}</b> of them, led by ${r.pair.lead.map(n => E(byName.get(n).d)).join(' + ')} in <b>${prN(r.pair.leadN)}</b>.`}${r.pair.n < 10 ? ` Only ${prN(r.pair.n)} similar game${r.pair.n === 1 ? '' : 's'}: treat as a hint.` : ''}</p>${r.pair.n > 1 ? four(r.pair.four, r.pair.lead, pr.pick) : ''}</div>` : t ? `<div><p class="pp2-cap u">${theirLabel}</p>${four(t.four, t.lead, pr.pick)}</div>` : ''}</section>`;
  return `<div class="pp2 rev">${tools}${V2.ppHead('Your pick, <em>their pick.</em>')}${V2.ppScore(s)}${banner}${fours}
    <div class="pp2-each"><h2 class="k-h2 u">Each of your six against this team</h2><p class="fine">Players rated ${prN(P.minR)}+ with this Pokémon against this team (or one 5 of 6 the same): how often they brought it and led with it.</p></div>${board}
    <div class="pp2-act">${V2.kGo('Next Team', {'data-ppnext': true})}<span class="pp2-links"><button type="button" class="np-link" data-pphome>Change Six</button></span></div>${V2.ppFoot(P)}</div>`; }};

// taps: today's rules (63-practice.js)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.pp2 [data-ppmode],.pp2 [data-ppgo],.pp2 [data-ppick],.pp2 [data-ppreset],.pp2 [data-pprev],.pp2 [data-ppskip],.pp2 [data-pphome],.pp2 [data-ppnext]'); if (!b) return; const d = b.dataset;
  if (d.ppmode) { if (b.disabled) return; pr.mode = d.ppmode; V2.redraw(); return; }
  if (d.ppgo != null || d.ppskip != null || d.ppnext != null) { prStart(d.ppgo || pr.mode || 'real'); V2.redraw(); if (d.ppnext != null || d.ppskip != null) scrollTo({top: 0, behavior: V2.smooth()}); return; }
  if (d.pphome != null) { pr.step = 'start'; V2.redraw(); return; }
  if (d.ppreset != null) { pr.pick = []; pr.lead = []; V2.redraw(); return; }
  if (d.ppick) { const n = d.ppick;
    if (pr.pick.length < 4) { if (pr.pick.includes(n)) pr.pick = pr.pick.filter(x => x !== n); else pr.pick.push(n); }
    else if (pr.pick.includes(n)) { if (pr.lead.includes(n)) pr.lead = pr.lead.filter(x => x !== n); else if (pr.lead.length < 2) pr.lead.push(n); else { pr.lead.shift(); pr.lead.push(n); } }
    else { toast('Four are picked. Tap "Start the Pick Again" to change them.'); return; }
    V2.redraw(); return; }
  if (d.pprev != null) { if (pr.pick.length !== 4 || pr.lead.length !== 2) return; prReveal(); V2.redraw(); scrollTo({top: 0, behavior: V2.smooth()}); } });
