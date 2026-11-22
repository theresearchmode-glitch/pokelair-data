// Info sheets: tap a move (then an Ability or an item) to see what it does, who runs it and who can learn it (Sim approved the design
// Nov 22, 11:29 AM; package docs/rebuild/info-sheets/: HANDOFF.md, RESEARCH.md, the approved pictures in 1-APPROVED-round3/).
// Step 2 (this file today): the MOVE sheet, "the case file": a slanted ticket in the move's type colour, one plain sentence, the stat
// strip, On the field (doubles lines from the move's data, plus checked hand-written lines), Usual suspects (who runs it, and how often
// that Pokémon runs it), Also capable (who can learn it in Reg M-C), links. Built on the kit: V2.sheet, V2.mon, V2.typeChip, V2.kLink.
// Data: INFO_TEXT (app/src/data/info-text.js: sentence + PP in battle, generated from Showdown, MIT), META.info (out/info.json from
// update.mjs: last 28 days of full Online tournament team sheets), MOVE_META / MOVE_ACC / mvByName (move data), LEARN / ROSTER.
// Thin data (HANDOFF): under 20 teams "Rarely used (on N teams)"; Usual suspects only at 50+ teams; 0 teams says so and keeps the rest.
V2.IS_TARGET = {normal: 'One foe', randomNormal: 'A random foe', any: 'Any one', allAdjacentFoes: 'Both foes', allAdjacent: 'Everyone else',
  self: 'Itself', adjacentAlly: 'Its partner', adjacentAllyOrSelf: 'Itself or partner', allySide: 'Your side', allies: 'Your side', allyTeam: 'Your side',
  foeSide: 'Their side', all: 'Whole field', scripted: 'The last attacker'};
// hand-written doubles lines (HANDOFF "Sim must check these before they ship"); every other move shows the lines its data gives
V2.IS_HAND = {mv: {'Rock Slide': ['Hits both foes, each for 0.75× damage', 'Never hits your partner', 'Blocked by Protect and Wide Guard', 'Flinch only works if it moves first']}};
// the plain sentence, hand-written where the approved pictures wrote it (else Showdown's short text)
V2.IS_LEAD = {mv: {'Rock Slide': 'Hits both foes. Each one hit has a 30% chance to flinch.'}};
V2.isMoveLines = (n, M) => { const t = M.t || 'normal', f = M.f || '', L = [];
  if (V2.IS_HAND.mv[n]) return V2.IS_HAND.mv[n];
  if (t === 'allAdjacentFoes') L.push('Hits both foes, each for 0.75× damage', 'Never hits your partner');
  if (t === 'allAdjacent') L.push('Hits both foes and your partner, each for 0.75× damage');
  if (/^(Fake Out|First Impression)$/.test(n)) L.push('Only works on its first turn out');
  if (M.p > 0) L.push(`Moves before normal moves (priority +${M.p})`);
  if (M.p < 0) L.push(`Moves after normal moves (priority ${M.p})`);
  const hitsFoe = /^(normal|randomNormal|any|allAdjacentFoes|allAdjacent)$/.test(t);
  if (hitsFoe && !M.np) L.push((t === 'allAdjacentFoes' || t === 'allAdjacent') ? 'Blocked by Protect and Wide Guard' : M.p > 0 ? 'Blocked by Protect and Quick Guard' : 'Blocked by Protect');
  if (hitsFoe && M.np) L.push('Goes through Protect');
  if (f.includes('s')) L.push('A sound move: it goes through Substitute');
  if (f.includes('c')) L.push('Makes contact (Rocky Helmet and Rough Skin hurt the user)');
  return L.slice(0, 4); };
V2.infoUse = (k, n) => { const I = typeof META === 'object' && META.info; if (!I || !I[k]) return null; const e = I[k][n]; return {N: I.N, src: I.source, period: I.period, t: e ? e[0] : 0, u: e ? e[1] : []}; };
V2.openInfo = (kind, n) => { if (kind === 'mv') return V2.openMoveSheet(n); };
V2.openMoveSheet = n => { const E = V2.esc, T = (typeof INFO_TEXT === 'object' && INFO_TEXT.mv[n]) || ['', null], M = (typeof MOVE_META === 'object' && MOVE_META[n]) || {}, m = typeof mvByName === 'object' && mvByName.get(n);
  if (!m && !T[0]) return;
  const ty = m && V2.TYPES.includes(m.type) ? m.type : '', cat = m ? ['Status', 'Physical', 'Special'][m.cat] : '', U = V2.infoUse('mv', n);
  const fmt = x => x.toLocaleString('en-US'), pct = U && U.N ? Math.round(100 * U.t / U.N) : null;
  const share = !U ? '' : U.t === 0 ? '<div class="is-sh is-sh0"><span>Not run on any tournament team in Reg M-C yet</span></div>'
    : U.t < 20 ? `<div class="is-sh is-sh0"><span>Rarely used (on ${fmt(U.t)} team${U.t === 1 ? '' : 's'})</span></div>`
    : `<div class="is-sh"><b class="u">${pct < 1 ? '<1' : pct}%</b><span>of tournament teams</span></div>`;
  const self = /^(self|allySide|allies|allyTeam|foeSide|all|adjacentAlly|adjacentAllyOrSelf)$/.test(M.t || '');
  const acc = typeof MOVE_ACC === 'object' && MOVE_ACC[n] != null ? MOVE_ACC[n] + '%' : self || (m && !m.cat) ? '—' : '100%';
  const pw = !m || !m.cat ? '—' : m.vbp || m.fixed || m.ohko ? 'Varies' : String(m.bp);
  const stats = [['Power', pw], ['Accuracy', acc], ['PP', T[1] != null ? String(T[1]) : '—'], ['Priority', M.p ? (M.p > 0 ? '+' : '') + M.p : '0'], ['Hits', V2.IS_TARGET[M.t || 'normal'] || 'One foe'], ['Contact', (M.f || '').includes('c') ? 'Yes' : 'No']];
  const h = (t, s) => `<div class="is-h"><h3 class="u">${E(t)}</h3>${s ? `<span>${E(s)}</span>` : ''}</div>`;
  const tab = `<div class="is-tab kd-move"><span class="gh u" aria-hidden="true">${E(n.toUpperCase())}</span><div class="is-tn"><span class="is-kk u">CASE FILE · MOVE</span><h2 class="u">${E(n)}</h2>
    <div class="is-sub">${ty ? V2.typeChip(ty) : ''}${cat ? `<span>${E(cat)}</span>` : ''}</div></div>${share}</div>`;
  const lines = V2.isMoveLines(n, M);
  const dbl = lines.length ? `<section class="is-sec">${h('On the field.', 'what it means in doubles')}<ul class="is-dbl">${lines.map(t => `<li>${E(t)}</li>`).join('')}</ul></section>` : '';
  const users = U && U.t >= 50 ? U.u.slice(0, 6) : [];
  const us = users.length ? `<section class="is-sec">${h('Usual suspects.', 'who runs it, and how often · tap one to open it')}<div class="is-users">${users.map(([p, c, tot]) => `<button type="button" class="is-u" data-v2mon="${E(p)}">${V2.mon(p, {iw: 48, bare: true})}<b>${V2.nameHtml(V2.disp(p))}</b><em class="u">${Math.round(100 * c / tot)}%</em><small>of ${fmt(tot)} ${E(V2.disp(p))} run it</small></button>`).join('')}</div><p class="is-src">Online tournaments, last 28 days (${E(U.period)}) · ${fmt(U.N)} teams</p></section>` : '';
  const mi = typeof MOVES === 'object' ? MOVES.findIndex(x => x[0] === n) : -1;
  const learn = mi < 0 || typeof ROSTER !== 'object' ? [] : ROSTER.filter(q => !q.m && (LEARN[q.n] || []).includes(mi)); /* Megas share their base form's list */
  const shown = new Set(users.map(u => u[0])), rest = learn.filter(q => !shown.has(q.n));
  const more = learn.length ? `<section class="is-sec">${h('Also capable.', `can learn it: ${learn.length} Pokémon in Reg M-C · tap one to open it`)}<div class="is-learn" data-islearn>${rest.map((q, i) => `<button type="button" class="is-l"${i >= 20 ? ' hidden' : ''} data-v2mon="${E(q.n)}" aria-label="${E(V2.disp(q.n))}">${V2.mon(q.n, {iw: 40, bare: true})}</button>`).join('')}</div>${rest.length > 20 ? `<button type="button" class="k-link is-all" data-isall>Show all ${rest.length}&nbsp;›</button>` : ''}</section>` : '';
  const links = `<div class="is-sec is-links">${V2.kLink('Try It in the Calc', {href: '#calc'})}${V2.kLink('Winning Teams With It', {href: '#tournaments', 'data-v2close': '', 'data-v2term': 'move', 'data-v2termv': n})}</div>`;
  const credit = '<p class="is-credit">Move text adapted from Pokémon Showdown (MIT License), © Guangcong Luo and contributors.</p>';
  V2.sheet(`<div class="is2 kd-move"${ty ? ` style="--c:var(--ty-${ty})"` : ''}>${tab}<p class="is-lead">${E(V2.IS_LEAD.mv[n] || T[0])}</p><dl class="is-stats">${stats.map(([l, v]) => `<div><dt>${E(l)}</dt><dd class="u">${E(v)}</dd></div>`).join('')}</dl>${dbl}${us}${more}${links}${credit}</div>`, {label: n}); };
// every move ticket (V2.kMove) carries data-v2info; one tap opens its sheet. "Show all N" opens the rest of Also capable in place.
document.addEventListener('click', e => { if (!e.target.closest) return; const b = e.target.closest('[data-v2info]');
  if (b) { e.preventDefault(); V2.openInfo(b.dataset.v2info, b.dataset.v2infon); return; }
  const a = e.target.closest('[data-isall]'); if (a) { const l = a.parentElement.querySelector('[data-islearn]'); if (l) { const h = [...l.querySelectorAll('[hidden]')]; h.forEach(x => x.hidden = false); if (h[0]) h[0].focus(); } a.remove(); } });
