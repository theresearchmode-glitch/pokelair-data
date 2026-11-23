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
V2.IS_HAND = {it: {'Focus Sash': ['Fake Out or any chip damage first breaks it', 'Multi-hit moves can still finish it', 'Best on fast, frail Pokémon']}, ab: {'Intimidate': ['Hits both foes at once', 'Works again each time it switches back in', 'Defiant and Competitive foes get a boost instead', 'Inner Focus, Oblivious, Own Tempo and Scrappy ignore it']}, mv: {'Rock Slide': ['Hits both foes, each for 0.75× damage', 'Never hits your partner', 'Blocked by Protect and Wide Guard', 'Flinch only works if it moves first']}};
// the plain sentence, hand-written where the approved pictures wrote it (else Showdown's short text)
V2.IS_LEAD = {it: {'Focus Sash': 'At full HP, it survives a hit that would knock it out, with 1 HP left. Then it’s used up.'}, ab: {'Intimidate': 'When it comes in, lowers both foes’ Attack by 1 stage.'}, mv: {'Rock Slide': 'Hits both foes. Each one hit has a 30% chance to flinch.'}};
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
V2.infoUse = (k, n) => { const I = typeof META === 'object' && META.info; if (!I || !I[k]) return null; const e = I[k][n]; return {N: I.N, src: I.source, period: I.period, t: e ? e[0] : 0, u: e ? e[1] : [], nu: e ? (e[2] != null ? e[2] : e[1].length) : 0}; };
V2.openInfo = (kind, n) => kind === 'mv' ? V2.openMoveSheet(n) : kind === 'ab' ? V2.openAbilitySheet(n) : kind === 'it' ? V2.openItemSheet(n) : undefined;
// the parts every kind shares (HANDOFF "The sheet, top to bottom")
V2.isFmt = x => x.toLocaleString('en-US');
V2.isH = (t, s) => `<div class="is-h"><h3 class="u">${V2.esc(t)}</h3>${s ? `<span>${V2.esc(s)}</span>` : ''}</div>`;
V2.isShare = U => !U ? '' : U.t === 0 ? '<div class="is-sh is-sh0"><span>Not run on any tournament team in Reg M-C yet</span></div>'
  : U.t < 20 ? `<div class="is-sh is-sh0"><span>Rarely used (on ${V2.isFmt(U.t)} team${U.t === 1 ? '' : 's'})</span></div>`
  : (p => `<div class="is-sh"><b class="u">${p < 1 ? '<1' : p}%</b><span>of tournament teams</span></div>`)(Math.round(100 * U.t / U.N));
V2.isStats = L => `<dl class="is-stats">${L.map(([l, v]) => `<div><dt>${V2.esc(l)}</dt><dd class="u">${V2.esc(v)}</dd></div>`).join('')}</dl>`;
V2.isLines = L => L.length ? `<section class="is-sec">${V2.isH('On the field.', 'what it means in doubles')}<ul class="is-dbl">${L.map(t => `<li>${V2.esc(t)}</li>`).join('')}</ul></section>` : '';
V2.isUsersOf = U => U && U.t >= 50 ? U.u.slice(0, 6) : [];
V2.isUsers = (U, users) => { const E = V2.esc; return users.length ? `<section class="is-sec">${V2.isH('Usual suspects.', 'who runs it, and how often · tap one to open it')}<div class="is-users">${users.map(([p, c, tot]) => `<button type="button" class="is-u" data-v2mon="${E(p)}">${V2.mon(p, {iw: 48, bare: true})}<b>${V2.nameHtml(V2.disp(p))}</b><em class="u">${Math.round(100 * c / tot)}%</em><small>of ${V2.isFmt(tot)} ${E(V2.disp(p))} run it</small></button>`).join('')}</div><p class="is-src">Online tournaments, last 28 days (${E(U.period)}) · ${V2.isFmt(U.N)} teams</p></section>` : ''; };
V2.isMore = (list, users, what) => { const E = V2.esc, shown = new Set(users.map(u => u[0])), rest = list.filter(q => !shown.has(q.n));
  return list.length ? `<section class="is-sec">${V2.isH('Also capable.', `${what}: ${list.length} Pokémon in Reg M-C · tap one to open it`)}<div class="is-learn" data-islearn>${rest.map((q, i) => `<button type="button" class="is-l"${i >= 20 ? ' hidden' : ''} data-v2mon="${E(q.n)}" aria-label="${E(V2.disp(q.n))}">${V2.mon(q.n, {iw: 40, bare: true})}</button>`).join('')}</div>${rest.length > 20 ? V2.kMore(rest.length - 20, {vh: 'Pokémon', attrs: {class: 'is-all', 'data-isall': ''}}) /* Wave 2 (Sim chose A, Nov 22): the kit show-more (was "Show all N ›") */ : ''}</section>` : ''; };
V2.isCredit = w => `<p class="is-credit">${w} text adapted from Pokémon Showdown (MIT License), © Guangcong Luo and contributors.</p>`;
V2.isTab = (kind, n, sub, share, extra = '', pic = '') => { const E = V2.esc, KK = {move: 'CASE FILE · MOVE', ability: 'ID CARD · ABILITY', item: 'EVIDENCE · ITEM'}[kind];
  /* pic (Sim approved the pictures, Nov 23 4:33 PM; docs/mockups/sheet-pics-natures-nov23): a picture left of the name, decorative */
  return `<div class="is-tab kd-${kind}">${extra}<span class="gh u" aria-hidden="true">${E(n.toUpperCase())}</span>${pic ? `<div class="is-pn">${pic}` : ''}<div class="is-tn"><span class="is-kk u">${KK}</span><h2 class="u">${E(n)}</h2><div class="is-sub">${sub}</div></div>${pic ? '</div>' : ''}${share}</div>`; };
// the move's TYPE SEAL (Sim, Nov 23, Q1 A): a slanted tile in a deeper shade of the type colour with the white type symbol (#kty-, MIT, approved
// Nov 21). Decorative: the type chip beside the name says the type in words. A typeless move gets no seal
V2.isSeal = ty => ty && typeof V2.TY_ICON === 'object' && V2.TY_ICON[ty] ? (V2.kTySprite(), `<div class="is-seal" aria-hidden="true"><svg viewBox="0 0 256 256" focusable="false"><use href="#kty-${ty}"/></svg></div>`) : '';
V2.openMoveSheet = n => { const E = V2.esc, T = (typeof INFO_TEXT === 'object' && INFO_TEXT.mv[n]) || ['', null], M = (typeof MOVE_META === 'object' && MOVE_META[n]) || {}, m = typeof mvByName === 'object' && mvByName.get(n);
  if (!m && !T[0]) return;
  const ty = m && V2.TYPES.includes(m.type) ? m.type : '', cat = m ? ['Status', 'Physical', 'Special'][m.cat] : '', U = V2.infoUse('mv', n);
  const self = /^(self|allySide|allies|allyTeam|foeSide|all|adjacentAlly|adjacentAllyOrSelf)$/.test(M.t || '');
  const acc = typeof MOVE_ACC === 'object' && MOVE_ACC[n] != null ? MOVE_ACC[n] + '%' : self || (m && !m.cat) ? '—' : '100%';
  const pw = !m || !m.cat ? '—' : m.vbp || m.fixed || m.ohko ? 'Varies' : String(m.bp);
  const stats = [['Power', pw], ['Accuracy', acc], ['PP', T[1] != null ? String(T[1]) : '—'], ['Priority', M.p ? (M.p > 0 ? '+' : '') + M.p : '0'], ['Hits', V2.IS_TARGET[M.t || 'normal'] || 'One foe'], ['Contact', (M.f || '').includes('c') ? 'Yes' : 'No']];
  const users = V2.isUsersOf(U), mi = typeof MOVES === 'object' ? MOVES.findIndex(x => x[0] === n) : -1;
  const learn = mi < 0 || typeof ROSTER !== 'object' ? [] : ROSTER.filter(q => !q.m && (LEARN[q.n] || []).includes(mi)); /* Megas share their base form's list */
  const links = `<div class="is-sec is-links">${V2.kLink('Try It in the Calc', {href: '#calc'})}${V2.kLink('Winning Teams With It', {href: '#tournaments', 'data-v2close': '', 'data-v2term': 'move', 'data-v2termv': n})}</div>`;
  V2.sheet(`<div class="is2 kd-move"${ty ? ` style="--c:var(--ty-${ty})"` : ''}>${V2.isTab('move', n, `${ty ? V2.typeChip(ty) : ''}${cat ? `<span>${E(cat)}</span>` : ''}`, V2.isShare(U), '', V2.isSeal(ty))}<p class="is-lead">${E(V2.IS_LEAD.mv[n] || T[0])}</p>${V2.isStats(stats)}${V2.isLines(V2.isMoveLines(n, M))}${V2.isUsers(U, users)}${V2.isMore(learn, users, 'can learn it')}${links}${V2.isCredit('Move')}</div>`, {label: n}); };
// the ABILITY sheet, "the ID card" (approved round 3): a dark rounded card, a logo-blue strip, a big faint fingerprint, TRAIT ON FILE
V2.IS_FP = '<svg class="fp" viewBox="0 0 100 120" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' + [6.0, 11.2, 16.4, 21.6, 26.8, 32.0, 37.2, 42.4, 47.6].map((r, i) => `<ellipse cx="50" cy="62" rx="${r}" ry="${(r * 1.22).toFixed(1)}" stroke-dasharray="${18 + 7 * i} ${[5, 9, 13][i % 3]}" transform="rotate(${13 * i} 50 62)"/>`).join('') + '</svg>';
V2.openAbilitySheet = n => { const E = V2.esc, txt = (typeof INFO_TEXT === 'object' && INFO_TEXT.ab[n]) || (typeof ABIL === 'object' && ABIL[n]) || '';
  if (!txt) return; const U = V2.infoUse('ab', n), seen = new Set();
  const has = typeof ROSTER !== 'object' ? [] : ROSTER.filter(q => (q.a || []).includes(n)).filter(q => { const k = q.m ? q.b : q.n; if (seen.has(k)) return false; seen.add(k); return true; }); /* each species once */
  const users = V2.isUsersOf(U), runs = U ? U.nu : 0;
  const stats = [['Teams', U ? V2.isFmt(U.t) : '—'], ['Pokémon run it', U ? String(runs) : '—'], ['Can have it', String(has.length)]];
  const links = `<div class="is-sec is-links">${V2.kLink('Winning Teams With It', {href: '#tournaments', 'data-v2close': '', 'data-v2term': 'ability', 'data-v2termv': n})}</div>`;
  V2.sheet(`<div class="is2 kd-ability">${V2.isTab('ability', n, '<span>Ability</span><span class="is-tof u">TRAIT ON FILE</span>', V2.isShare(U), V2.IS_FP)}<p class="is-lead">${E(V2.IS_LEAD.ab[n] || txt)}</p>${V2.isStats(stats)}${V2.isLines(V2.IS_HAND.ab[n] || [])}${V2.isUsers(U, users)}${V2.isMore(has, users, 'can have it')}${links}${V2.isCredit('Ability')}</div>`, {label: n}); };
// an Ability name anywhere: a blue word (the site's "blue words are buttons") that opens its sheet
V2.kAbil = n => n && typeof INFO_TEXT === 'object' && INFO_TEXT.ab[n] ? `<button type="button" class="is-w" data-v2info="ab" data-v2infon="${V2.esc(n)}" aria-haspopup="dialog">${V2.esc(n)}</button>` : V2.esc(n || '');
// the ITEM sheet, "the evidence tag" (approved round 3): a manila tag with a punched hole, a string and a dashed tear line, a red EVIDENCE
// stamp (hidden under 700 wide); manila with dark ink in both themes. Items not in Pokémon Champions (HANDOFF) get no sheet.
V2.IS_NOT_IN = ['Safety Goggles', 'Covert Cloak', 'Clear Amulet', 'Loaded Dice', 'Choice Band', 'Choice Specs', 'Assault Vest'];
V2.openItemSheet = n => { const E = V2.esc, txt = (typeof INFO_TEXT === 'object' && INFO_TEXT.it[n]) || ''; if (!txt || V2.IS_NOT_IN.includes(n)) return;
  const U = V2.infoUse('it', n), users = V2.isUsersOf(U);
  const stats = [['Teams', U ? V2.isFmt(U.t) : '—'], ['Pokémon run it', U ? String(U.nu) : '—'], ['Uses per battle', /Single use/i.test(txt) ? '1' : 'No limit']];
  const links = `<div class="is-sec is-links">${V2.kLink('Winning Teams With It', {href: '#tournaments', 'data-v2close': '', 'data-v2term': 'item', 'data-v2termv': n})}</div>`;
  const tab = `<div class="is-tagw"><svg class="str" viewBox="0 0 70 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M57 54 C 40 40, 20 30, 4 2"/></svg>${V2.isTab('item', n, '<span>Held item</span>', V2.isShare(U), '<span class="ev u" aria-hidden="true">EVIDENCE</span>')}</div>`;
  V2.sheet(`<div class="is2 kd-item">${tab}<p class="is-lead">${E(V2.IS_LEAD.it[n] || txt)}</p>${V2.isStats(stats)}${V2.isLines(V2.IS_HAND.it[n] || [])}${V2.isUsers(U, users)}${links}${V2.isCredit('Item')}</div>`, {label: n}); };
// an item name anywhere: a blue word that opens its sheet (no button for 'No item' or an item without a sheet); a Mega letter stays with its name
V2.kItem = n => { const t = V2.keepForm(V2.esc(n || '')).replace(/ (\S{1,2})$/, '\u00a0$1');
  return n && typeof INFO_TEXT === 'object' && INFO_TEXT.it[n] && !V2.IS_NOT_IN.includes(n) ? `<button type="button" class="is-w" data-v2info="it" data-v2infon="${V2.esc(n)}" aria-haspopup="dialog">${t}</button>` : t; };
// every move ticket (V2.kMove) carries data-v2info; one tap opens its sheet. "Show all N" opens the rest of Also capable in place.
document.addEventListener('click', e => { if (!e.target.closest) return; const b = e.target.closest('[data-v2info]');
  if (b) { e.preventDefault(); V2.openInfo(b.dataset.v2info, b.dataset.v2infon); return; }
  const a = e.target.closest('[data-isall]'); if (a) { const l = a.parentElement.querySelector('[data-islearn]'); if (l) { const h = [...l.querySelectorAll('[hidden]')]; h.forEach(x => x.hidden = false); if (h[0]) h[0].focus(); } a.remove(); } });
