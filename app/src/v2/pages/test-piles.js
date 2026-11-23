// ---------- Test Run on the kit (reskin proposal, Nov 22): THE DRY RUN ----------
// Was "Three Piles" (Nov 14, docs/rebuild/mocks/test-run-piles/BRIEF.md): the 20 top teams dealt into The Problems (they're better prepared,
// pink = them), The Coin Flips (about even) and The Good Matchups (you're better prepared, blue = you); names approved by Sim, Nov 14.
// The piles, names, order, open card, plan line, prep and actions all stay. The one idea: every top team is drawn as its six Pokémon, each
// standing on YOUR answer to it (the slanted blocks of Compare's tug of war: 3 Beats it, 2 Handles it, 1 Shaky, a pink "!" No answer), so
// you see WHICH of their Pokémon get through your plan, not only how many. Step 1 adds them up over all 20 teams: the usual suspects.
// Every number comes from the same rows as before (V2.trRows: gauntletPrep levels); nothing new is worked out.
V2.tpUi = V2.tpUi || {open: undefined};
V2.DR_LV = ['No answer', 'Shaky', 'Handles it', 'Beats it'];
/* Q45: the Coin Flips 'N more' button opens the rest in place (no redraw, focus stays on the button); its state is kept for redraws */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tpmore]'); if (!b) return; const l = document.getElementById(b.getAttribute('aria-controls')); if (!l) return;
  const open = V2.tpUi.more = !l.classList.contains('on'); l.classList.toggle('on', open); b.setAttribute('aria-expanded', open); const n = l.querySelectorAll('.tp-more').length; b.innerHTML = V2.kMoreIn(n, {open, vh: `coin flip${n === 1 ? '' : 's'}`}); });
V2.tpPile = e => e <= -2 ? 'p' : e >= 2 ? 'g' : 'c';
V2.tpWide = () => innerWidth >= 1100;
V2.tpPlace = who => String(who || '').replace(/^Challenger · /, '').split(' · ')[0];
V2.tpEv = ev => { const s = String(ev || ''), n = (s.match(/([\d,]+) players/) || [])[1]; return `${evShort(s)}${n ? ` · ${n} players` : ''}`; };
// the slanted blocks under a Pokémon: how well one side answers it (side 'y' = yours, Plot blue; 't' = theirs, pink)
V2.drBk = l => `<span class="dr-bk" data-l="${l}" aria-hidden="true"><i></i><i></i><i></i></span>`;
V2.drImg = n => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null; return id != null ? `<img src="${V2.art(id)}" alt="" loading="lazy" decoding="async">` : ''; };
// one Pokémon standing on its answer: the art, the blocks, a pink "!" when there is no answer; o.word writes the level under it
V2.drMon = (n, lvl, side, o = {}) => `<span class="dr-m ${side} l${lvl}${o.cls ? ' ' + o.cls : ''}"${o.attrs || ''}><span class="dr-a">${V2.drImg(n)}${lvl === 0 ? '<b class="bang u" aria-hidden="true">!</b>' : ''}</span>${V2.drBk(lvl)}${o.word ? `<small class="dr-w">${V2.esc(V2.DR_LV[lvl])}</small>` : ''}${o.name ? `<b class="dr-nm">${V2.esc(o.name)}</b>` : ''}</span>`;
// Nov 22 (Sim: the rows with six pictures each looked "extremely chaotic"): a row names only the Pokémon of theirs that get through
// (no answer first, then shaky), in words; pictures stay in Usual suspects and the open team
V2.drThru = (theirs, lv) => { const E = V2.esc, w = theirs.map((o, j) => ({d: V2.disp(o.p.n), l: lv(j)})).filter(x => x.l <= 1).sort((a, b) => a.l - b.l);
  if (!w.length) return '<span class="dr-ok">You answer all six.</span>';
  return `<span class="dr-tk">Gets through</span> ${w.map(x => `<span class="dr-tn l${x.l}"><b>${E(x.d)}</b> <small>${x.l ? 'shaky' : 'no answer'}</small></span>`).join('')}`; };
// a top team's row (a button: tap to flip it open). The six stand on your answers; the two counts say it in numbers.
V2.tpCard = (x, first) => { const E = V2.esc, P = V2.tpPile(x.e), pr = x.pr, on = V2.tpOn === x.ix, word = {p: "they're better prepared", c: 'about even', g: "you're better prepared"}[P];
  const lv = j => pr && pr.you[j] ? pr.you[j].level : (x.un.includes(j) ? 0 : 2);
  return `<button type="button" class="tp-card dr-row ${P}${first ? ' first' : ''}${on ? ' on' : ''}" data-tpflip="${x.ix}" aria-expanded="${on}" aria-label="${E(V2.tpPlace(x.t.who))}, ${E(V2.tpEv(x.t.ev))}, ${word}.${pr ? ` You answer ${pr.yN} of their ${pr.n}; they answer ${pr.tN} of your six.` : ''} ${on ? 'Open below.' : 'Tap to see what to bring.'}">
    <span class="dr-id" aria-hidden="true">${first ? '<span class="tp-start u">Start here</span>' : ''}<b class="u">${E(V2.tpPlace(x.t.who))}</b><small>${E(V2.tpEv(x.t.ev)).replace(/ · ([\d,]+ players)$/, '<span class="dr-pl"> · $1</span>')}</small></span>
    <span class="dr-thru" aria-hidden="true">${V2.drThru(x.theirs, lv)}</span>
    ${pr ? `<span class="dr-sc" aria-hidden="true"><span class="y"><b class="u">${pr.yN}<small>/${pr.n}</small></b><small>you answer</small></span><span class="t"><b class="u">${pr.tN}<small>/6</small></b><small>they answer</small></span></span>` : ''}</button>`; };
// the open team: both ways (your answers to their six, theirs to your six), the four to bring, the one pink move, the prep
V2.tpOpen = (x, ms, top) => { const E = V2.esc, pr = x.pr, P = V2.tpPile(x.e), nm = i => E(ms[i].d), all = (k, n) => k === n ? `all ${n}` : `${k} of ${n}`;
  const verdict = {p: "They're better prepared", c: 'About even', g: "You're better prepared"}[P];
  const lane = (k, head, n, of, html) => `<div class="dr-lane ${k}"><p class="dr-lh"><b class="u">${n}<small> of ${of}</small></b><span>${head}</span></p>${html}</div>`;
  const six = `<div class="tr-six dr-big">${x.theirs.map((o, j) => { const no = x.un.includes(j), r = pr && pr.you[j], l = r ? r.level : no ? 0 : 2;
    return V2.drMon(o.p.n, l, 'y', {word: !!r, cls: 'm' + (no ? ' no' : ''), attrs: ` role="img" aria-label="${E(o.d)}${r ? ': ' + E(r.label) : ''}" title="${E(o.d)}${r ? ': ' + E(r.label) : ''}"`}); }).join('')}</div>`;
  const mine = pr ? `<div class="dr-big dr-mine">${pr.them.map(r => V2.drMon(r.t.n, r.level, 't', {word: true, attrs: ` role="img" aria-label="${E(r.t.d)}: they ${E(r.label.toLowerCase())}" title="${E(r.t.d)}: ${E(r.label)}"`})).join('')}</div>` : '';
  const four = [...x.r.lead.map(i => [i, 'Up front']), ...x.r.back.map(i => [i, 'In back'])];
  const cell = r => { const p = byName.get(r.t.n); return `<div class="tr-cell l${r.level}">${p ? V2.mon(p.n, {iw: 48, bare: true}) : '<span></span>'}<div><b>${E(r.t.d)}</b><i class="u">${E(r.label)}</i><small>${E(THR.evidence(r))}</small></div></div>`; };
  return `<article class="tp-open dr-open ${P} tr-card" aria-label="${E(x.t.who)}">${top ? '<span class="tp-start u">Top of the pile</span>' : ''}
    <div class="dr-oh"><p class="tp-from">From: <b>${{p: 'The Problems', c: 'The Coin Flips', g: 'The Good Matchups'}[P]}</b></p><h3 class="u">${E(x.t.who)}</h3>${x.t.ev ? `<p class="tp-evf">${E(x.t.ev)}</p>` : ''}<p class="tp-v">${V2.kTag(P === 'p' ? 'bad' : P === 'g' ? 'good' : 'neutral', verdict)}</p></div>
    ${pr ? lane('y', 'Your answers to their six', pr.yN, pr.n, six) + lane('t', 'Their answers to your six', pr.tN, ms.length, mine) : six}
    ${pr ? `<p class="tp-say">You have an answer for <b>${all(pr.yN, pr.n)}</b> of their Pokémon. They have an answer for <b>${all(pr.tN, ms.length)}</b> of yours.</p>` : ''}
    <p class="tp-bh u">Bring these four</p><div class="tp-four">${four.map(([i, w]) => `<span class="${w === 'Up front' ? 'big' : ''}"><span class="dr-a">${V2.drImg(ms[i].p.n)}</span><b>${nm(i)}</b><small>${w}</small></span>`).join('')}</div>
    <p class="tr-plan">Bring <b>${x.r.lead.map(nm).join(' + ')}</b> up front, ${x.r.back.map(nm).join(' + ')} in back.${x.un.length ? ` Watch <b class="w">${x.un.map(j => E(x.theirs[j].d)).join(', ')}</b>.` : ''}</p>
    <div class="tr-btns">${V2.kGo('SET AS OPPONENT.', {'data-trbat': x.ix, 'aria-label': `Set as Opponent: ${x.t.who}`})}<button type="button" class="k-link dr-copy" data-trcopy="${x.ix}">Copy for Showdown&nbsp;›</button></div>
    ${pr ? `<details class="tr-prep"><summary>Matchup prep ›</summary><p class="tr-lbl">You against their six</p><div class="tr-cells">${pr.you.map(cell).join('')}</div><p class="tr-lbl">Their six against yours</p><div class="tr-cells">${pr.them.map(cell).join('')}</div></details>` : ''}</article>`; };
// the usual suspects: their Pokémon you're Shaky on or have No answer to, counted over every top team (a Pokémon once per team)
V2.drSuspects = rows => { const M = new Map(); for (const x of rows) { if (!x.pr) continue; x.pr.you.forEach((r, j) => { const o = x.theirs[j]; if (!r || !o || r.level > 1) return;
    const s = M.get(o.p.n) || {n: o.p.n, d: o.d, teams: 0, no: 0}; s.teams++; if (r.level === 0) s.no++; M.set(o.p.n, s); }); }
  return [...M.values()].sort((a, b) => b.teams - a.teams || b.no - a.no); };
V2.drPhone = () => innerWidth < 700;
V2.drSuspectsHtml = (rows, total) => { const L = V2.drSuspects(rows), k = V2.drPhone() ? Math.min(3, L.length) : L.length >= 6 ? 6 : L.length >= 4 ? 4 : L.length, S = L.slice(0, k); /* phones: one row of three (THEME 4.1) */
  if (!S.length) return `<p class="dr-none k-none">Nothing gets through: you beat or handle every one of their Pokémon, in all ${total} teams.</p>`;
  const fact = s => s.no ? `No answer in ${s.no}${s.teams > s.no ? ` · Shaky in ${s.teams - s.no}` : ''}` : `Shaky in all ${s.teams}`;
  return `<div class="dr-sus">${V2.kRoster(S.map(s => V2.kCard(s.n, {size: 'small', score: s.teams, tier: `of ${total} teams`, fact: fact(s), attrs: {'data-v2mon': s.n, 'aria-label': `${s.d}: gets through in ${s.teams} of ${total} teams (${fact(s)}). Open its page`}})))}</div>${L.length > k ? `<p class="dr-also">Also: ${L.slice(k, k + 8).map(s => `${V2.esc(s.d)} ${s.teams}`).join(' · ')}${L.length > k + 8 ? ' · …' : ''}</p>` : ''}`; };
V2.drKey = () => `<p class="dr-key" aria-label="Under each of their Pokémon: your answer to it"><span class="dr-kl">Your answer to each:</span> ${[3, 2, 1, 0].map(l => `<span>${V2.drBk(l)}${l === 0 ? '<b class="bang u" aria-hidden="true">!</b>' : ''}${V2.DR_LV[l]}</span>`).join('')}<span class="dr-kc"><span><b class="u y">3/6</b>you answer</span><span><b class="u t">6/6</b>they answer</span></span></p>`;
V2.trHead = n => V2.kHead({kicker: 'BATTLE · THE DRY RUN', h1Html: `Your six vs <em>the top${n ? ' ' + n : ''}.</em>`}).replace('<header class="k-head">', '<header class="k-head dr-h">');
(() => { const before = V2.pages.gauntlet.draw; V2.pages.gauntlet.draw = () => { const ms = members(); if (ms.length < 4) return before();
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
    const more = k === 'c' && cMore ? V2.kMore(cMore, {open: cOpen, vh: `coin flip${cMore === 1 ? '' : 's'}`, attrs: {class: 'tp-morebtn', 'data-tpmore': '', 'aria-controls': 'tp-cards-c'}}) /* Wave 2 (Sim chose A, Nov 22): the kit show-more (was "N more coin flips ›") */ : '';
    return `<section class="tp-pile ${k}" aria-label="${name}: ${L.length} team${L.length === 1 ? '' : 's'}, ${word}"><header class="tp-ph"><b class="tp-n u" aria-hidden="true">${L.length}</b><div><p class="tp-name u">${name}</p><p class="tp-word">${word[0].toUpperCase() + word.slice(1)}</p></div></header>
      <div class="tp-cards${k === 'c' && cOpen ? ' on' : ''}"${k === 'c' ? ' id="tp-cards-c"' : ''}>${cards || `<p class="tp-none k-none">No teams in this pile.</p>`}</div>${more}</section>`; };
  const tools = V2.battleToolsBar('gauntlet');
  const ph = V2.drPhone(), s1 = V2.kStep(1, 'Usual suspects.', ph ? `shaky or no answer, across all ${rows.length}` : `their Pokémon you're shaky on, or have no answer to, across all ${rows.length} teams`, V2.drSuspectsHtml(rows, rows.length));
  const s2 = V2.kStep(2, 'The three piles.', ph ? 'pink pile first · tap a team to flip it' : `all ${rows.length} top teams · work through the pink pile first · tap one to flip it`,
    `${V2.drKey()}<div class="dr-board${wide && openHtml ? ' two' : ''}"><div class="tp-piles">${pile('p', 'The Problems', "they're better prepared")}${pile('c', 'The Coin Flips', 'about even')}${pile('g', 'The Good Matchups', "you're better prepared")}</div>${wide && openHtml ? `<aside class="dr-side">${openHtml}</aside>` : ''}</div>`);
  return `<div class="tr tp dr">${tools}${V2.trHead(rows.length)}
    <p class="k-lead tr-lede">Take a test run: the latest top tournament teams, least prepared first.</p>
    <details class="tr-how" data-trfold><summary><span>How it works</span><small>Same calcs as your Matchups, both ways</small></summary><p>Your six against real top tournament teams, with the same calcs as your Matchups: how many of their Pokémon you have an answer for, and how many of yours they have an answer for. A red <b class="w">!</b> marks one of theirs you have no answer to. Preparation, not a forecast: the player still decides the game.</p></details>
    ${V2.kPlan(s1 + s2)}
    <p class="fine tr-foot">Real damage calcs, least prepared matchups first ${V2.tip('gauntcalc')}</p></div>`; }; })();
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tpflip]'); if (!b) return; const ix = +b.dataset.tpflip;
  const cur = V2.tpUi.open === undefined ? (document.querySelector('.tp-card.on') ? +document.querySelector('.tp-card.on').dataset.tpflip : null) : V2.tpUi.open; V2.tpUi.open = cur === ix ? null : ix; V2.redraw(); const o = document.querySelector('.tp-open'); if (o && !V2.tpWide()) o.scrollIntoView({block: 'nearest', behavior: V2.smooth()}); });
(() => { let w = V2.tpWide() + '|' + V2.drPhone(), tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { const n = V2.tpWide() + '|' + V2.drPhone(); if (n === w) return; w = n; if (document.querySelector('.tp')) V2.redraw(); }, 150); }); })();
