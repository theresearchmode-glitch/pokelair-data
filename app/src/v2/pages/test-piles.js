// ---------- Test Run (Nov 14): Sim's pick "Three Piles" (docs/rebuild/mocks/test-run-piles/BRIEF.md) ----------
// All 20 top teams dealt into three piles by how the matchup looks: The Problems (they're better prepared, pink = them), The Coin Flips
// (about even, grey), The Good Matchups (you're better prepared, blue = you). Names approved by Sim, Nov 14. Same rows, verdicts, order,
// plan line, prep and actions as gauntlet.js (trRows, gauntletPrep); a card flips open to show what to bring. No bare scores anywhere.
V2.tpUi = V2.tpUi || {open: undefined};
/* Q45: the Coin Flips 'N more' button opens the rest in place (no redraw, focus stays on the button); its state is kept for redraws */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tpmore]'); if (!b) return; const l = document.getElementById(b.getAttribute('aria-controls')); if (!l) return;
  const open = V2.tpUi.more = !l.classList.contains('on'); l.classList.toggle('on', open); b.setAttribute('aria-expanded', open); const n = l.querySelectorAll('.tp-more').length; b.textContent = open ? 'Show Fewer' : `${n} more coin flip${n === 1 ? '' : 's'} ›`; });
V2.tpPile = e => e <= -2 ? 'p' : e >= 2 ? 'g' : 'c';
V2.tpWide = () => innerWidth >= 1100;
V2.tpPlace = who => String(who || '').replace(/^Challenger · /, '').split(' · ')[0];
V2.tpEv = ev => { const s = String(ev || ''), n = (s.match(/([\d,]+) players/) || [])[1]; return `${evShort(s)}${n ? ` · ${n} players` : ''}`; };
V2.tpCard = (x, first) => { const E = V2.esc, P = V2.tpPile(x.e), lead = x.theirs[0], on = V2.tpOn === x.ix, word = {p: "they're better prepared", c: 'about even', g: "you're better prepared"}[P];
  return `<button type="button" class="tp-card ${P}${first ? ' first' : ''}${on ? ' on' : ''}" data-tpflip="${x.ix}" aria-expanded="${on}" aria-label="${E(V2.tpPlace(x.t.who))}, ${E(V2.tpEv(x.t.ev))}, ${word}. ${on ? 'Open below.' : 'Tap to see what to bring.'}">
    ${first ? '<span class="tp-start u" aria-hidden="true">Start here</span>' : ''}<span class="tp-lead" aria-hidden="true">${lead ? V2.mon(lead.p.n, {bare: true}) : ''}</span>
    <span class="tp-ct" aria-hidden="true"><b class="u">${E(V2.tpPlace(x.t.who))}</b><small>${E(V2.tpEv(x.t.ev))}</small><span class="tp-five">${x.theirs.slice(1).map(o => V2.mon(o.p.n, {bare: true})).join('')}</span></span></button>`; };
V2.tpOpen = (x, ms, top) => { const E = V2.esc, pr = x.pr, P = V2.tpPile(x.e), nm = i => E(ms[i].d), all = (k, n) => k === n ? `all ${n}` : `${k} of ${n}`;
  const verdict = {p: "They're better prepared", c: 'About even', g: "You're better prepared"}[P];
  const six = `<div class="tr-six tp-six">${x.theirs.map((o, j) => { const no = x.un.includes(j), r = pr && pr.you[j]; return `<span class="m${no ? ' no' : ''}" role="img" aria-label="${E(o.d)}${r ? ': ' + E(r.label) : ''}" title="${E(o.d)}${r ? ': ' + E(r.label) : ''}">${V2.mon(o.p.n, {bare: true})}${no ? '<b class="bang u" aria-hidden="true">!</b>' : ''}</span>`; }).join('')}</div>`;
  const four = [...x.r.lead.map(i => [i, 1]), ...x.r.back.map(i => [i, 0])];
  const cell = r => { const p = byName.get(r.t.n); return `<div class="tr-cell l${r.level}">${p ? V2.mon(p.n, {iw: 48, bare: true}) : '<span></span>'}<div><b>${E(r.t.d)}</b><i class="u">${E(r.label)}</i><small>${E(THR.evidence(r))}</small></div></div>`; };
  return `<article class="tp-open ${P} tr-card" aria-label="${E(x.t.who)}">${top ? '<span class="tp-start u">Top of the pile</span>' : ''}<p class="tp-from">From: <b>${{p: 'The Problems', c: 'The Coin Flips', g: 'The Good Matchups'}[P]}</b></p><h3 class="u">${E(x.t.who)}</h3>${x.t.ev ? `<p class="tp-evf">${E(x.t.ev)}</p>` : ''}${six}
    <p class="tp-v u">${verdict}</p>${pr ? `<p class="tp-say">You have an answer for <b>${all(pr.yN, pr.n)}</b> of their Pokémon. They have an answer for <b>${all(pr.tN, ms.length)}</b> of yours.</p>` : ''}
    <p class="tp-bh u">Bring these four</p><div class="tp-four">${four.map(([i, big]) => `<span class="${big ? 'big' : ''}">${V2.mon(ms[i].p.n, {bare: true})}</span>`).join('')}</div>
    <p class="tr-plan">Bring <b>${x.r.lead.map(nm).join(' + ')}</b> up front, ${x.r.back.map(nm).join(' + ')} in back.${x.un.length ? ` Watch <b class="w">${x.un.map(j => E(x.theirs[j].d)).join(', ')}</b>.` : ''}</p>
    <div class="tr-btns"><button type="button" class="np-btn" data-trbat="${x.ix}"><span>Set as Opponent</span></button><button type="button" class="np-btn2" data-trcopy="${x.ix}"><span>Copy for Showdown</span></button></div>
    ${pr ? `<details class="tr-prep"><summary>Matchup prep ›</summary><p class="tr-lbl">You against their six</p><div class="tr-cells">${pr.you.map(cell).join('')}</div><p class="tr-lbl">Their six against yours</p><div class="tr-cells">${pr.them.map(cell).join('')}</div></details>` : ''}</article>`; };
(() => { const before = V2.pages.gauntlet.draw; V2.pages.gauntlet.draw = () => { const E = V2.esc, ms = members(); if (ms.length < 4) return before();
  let rows = []; try { rows = V2.trRows(ms); } catch (e) { rows = []; } if (!rows.length) return before();
  const piles = {p: rows.filter(x => V2.tpPile(x.e) === 'p'), c: rows.filter(x => V2.tpPile(x.e) === 'c'), g: rows.filter(x => V2.tpPile(x.e) === 'g')};
  const firstP = piles.p[0] || piles.c[0] || piles.g[0], wide = V2.tpWide();
  /* until a card is tapped, the first card of the pink pile is open on wide screens (worked out on every draw, so it follows the data) */
  V2.tpOn = null; const openX = (V2.tpUi.open === undefined ? (wide ? firstP : null) : rows.find(x => x.ix === V2.tpUi.open)) || null; V2.tpOn = openX ? openX.ix : null; const openHtml = openX ? V2.tpOpen(openX, ms, openX === firstP) : '';
  /* Sim Q45 A (Nov 19, 8:33 PM): on phones the Coin Flips pile shows its first 5 cards and a button for the rest (opens in place);
     a card that is open from before (saved state) keeps the pile open, so an open card is never hidden. 700 and up: every card */
  const cMore = Math.max(0, piles.c.length - 5), cOpen = !!(V2.tpUi.more || (openX && piles.c.indexOf(openX) >= 5));
  const pile = (k, name, word) => { const L = piles[k];
    const cards = L.map((x, i) => { const c = V2.tpCard(x, x === firstP); return (k === 'c' && i >= 5 ? c.replace('class="tp-card ', 'class="tp-card tp-more ') : c) + (!wide && openX === x ? openHtml : ''); }).join('');
    const more = k === 'c' && cMore ? `<button type="button" class="np-link tp-morebtn" data-tpmore aria-expanded="${cOpen}" aria-controls="tp-cards-c">${cOpen ? 'Show Fewer' : `${cMore} more coin flip${cMore === 1 ? '' : 's'} ›`}</button>` : '';
    return `<section class="tp-pile ${k}" aria-label="${name}: ${L.length} team${L.length === 1 ? '' : 's'}, ${word}"><header class="tp-ph"><b class="tp-n u" aria-hidden="true">${L.length}</b><div><p class="tp-name u">${name}</p><p class="tp-word">${word[0].toUpperCase() + word.slice(1)}</p></div></header>
      <div class="tp-cards${k === 'c' && cOpen ? ' on' : ''}"${k === 'c' ? ' id="tp-cards-c"' : ''}>${cards || `<p class="fine tp-none">No teams in this pile.</p>`}</div>${more}${wide && k === 'g' ? openHtml : ''}</section>`; };
  const tools = V2.battleToolsBar('gauntlet');
  return `<div class="tr tp">${tools}${V2.trHead(rows.length)}
    <p class="tr-lede">Take a test run: the latest top tournament teams, least prepared first.</p>
    <details class="tr-how" data-trfold><summary><span class="u">How it works</span><small>Same calcs as your Matchups, both ways</small></summary><p>Your six against real top tournament teams, with the same calcs as your Matchups: how many of their Pokémon you have an answer for, and how many of yours they have an answer for. A red <b class="w">!</b> marks one of theirs you have no answer to. Preparation, not a forecast: the player still decides the game.</p></details>
    <section class="tp-table"><div class="tp-th"><h2 class="u">Three Piles</h2><p>We dealt all ${rows.length} top teams into three piles. Work through the pink pile first. Tap a card to flip it over.</p></div>
      <div class="tp-piles">${pile('p', 'The Problems', "they're better prepared")}${pile('c', 'The Coin Flips', 'about even')}${pile('g', 'The Good Matchups', "you're better prepared")}</div></section>
    <p class="fine tr-foot">Real damage calcs, least prepared matchups first ${V2.tip('gauntcalc')}</p></div>`; }; })();
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tpflip]'); if (!b) return; const ix = +b.dataset.tpflip;
  const cur = V2.tpUi.open === undefined ? (document.querySelector('.tp-card.on') ? +document.querySelector('.tp-card.on').dataset.tpflip : null) : V2.tpUi.open; V2.tpUi.open = cur === ix ? null : ix; V2.redraw(); const o = document.querySelector('.tp-open'); if (o && !V2.tpWide()) o.scrollIntoView({block: 'nearest', behavior: V2.smooth()}); });
(() => { let w = V2.tpWide(), tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { const n = V2.tpWide(); if (n === w) return; w = n; if (document.querySelector('.tp')) V2.redraw(); }, 150); }); })();
