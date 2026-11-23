// ---------- Compare (R4, Nov 11): two teams side by side ----------
// Today's shared data (62-compare-data.js): cxResolve (My Team, a saved team, an event winner, a pasted team), cxInfo (each side
// worked out with the same functions My Team uses, cached), cxFacts (every row, whether it differs, and the "What's different"
// sentences). Facts only, no head-to-head prediction. ui.cx holds the two sides (memory only), as today.
V2.cxBusy = false;
V2.cxGo = (a, b) => { if (a === 'cur' && !members().length) { a = b; b = ''; } ui.cx.A = a || null; ui.cx.B = b || null; ui.cx.same = false; ui.cx.wmore = 0;
  if (location.hash !== '#compare') location.hash = '#compare'; else V2.redraw(); if (!ui.cx.A || !ui.cx.B) setTimeout(() => V2.cxPick(!ui.cx.A ? 'A' : 'B'), 60); };
const cxBadge = s => `<span class="cx2-b ${s === 'A' ? 'a' : 'b'}" aria-hidden="true">${s}</span>`;
// the event's name goes through the shared cleaner, as everywhere else (design review #22: raw names with prize text and emoji)
// a top team's event carries ' · N players' after the name: only the name is cleaned (review Nov 19); a function replacer, so '$' in a name is literal
V2.cxSub = R => { if (!R.ev || !R.sub) return R.sub || ''; const [nm, ...rest] = String(R.ev).split(' · '); const clean = [V2.evTitle(nm), ...rest].join(' · '); return R.sub.replace(R.ev, () => clean); };
/* scan S31 A (Sim, Nov 20): an empty Team B offers the 3 newest event winners (the picker's own rows), one tap compares; a link opens the
   whole picker (saved teams, more winners, a pasted team). Phones show the newest only (CSS), so the page grows one row, not three */
V2.cxQuick = side => { let pool = []; try { pool = tsPool().filter(x => x.t.place === 1); } catch (e) {} const E = V2.esc, other = ui.cx[side === 'A' ? 'B' : 'A'];
  const opts = pool.filter(x => other !== 'e:' + x.key).slice(0, 3).map(x => V2.cxOpt(side, other, 'e:' + x.key, String(teamPlanLabel(x.t.mons.map(m => m.n)) || '') || 'Event winner', `Won ${V2.evTitle(x.ev.name)} · ${evDate(x.ev.date)}`, x.t.mons.map(m => m.n)));
  if (!opts.length) return '';
  return `<div class="cx2-qp ${side === 'A' ? 'a' : 'b'}"><div class="top">${cxBadge(side)}<span class="nm">Pick Team ${side}</span></div><p class="k">Take on a latest winner</p>${opts.join('')}<button type="button" class="np-link more" data-cxp="${side}">Saved, more winners or paste a team ›</button></div>`; };
V2.cxHead = (side, R) => { const E = V2.esc;
  if (!R && side === 'B') { const q = V2.cxQuick(side); if (q) return q; }
  if (!R) return `<button type="button" class="cx2-head empty ${side === 'A' ? 'a' : 'b'}" data-cxp="${side}">${cxBadge(side)}<span class="nm">Pick Team ${side}</span><span class="fine">My Team, saved, winning or pasted</span></button>`;
  const ms = teamRating(R.slots).ms;
  return `<div class="cx2-head ${side === 'A' ? 'a' : 'b'}"><div class="cx2-hd">${cxBadge(side)}<div class="cx2-nm"><b>${E(R.name)}</b><span>${E(V2.cxSub(R))}</span></div><button type="button" class="np-link" data-cxp="${side}" aria-label="Change team ${side}">Change</button></div>
    <ul class="cx2-six">${ms.map(m => `<li>${V2.mon(m.p.n, {iw: 64})}</li>`).join('')}${Array.from({length: Math.max(0, 6 - ms.length)}, () => '<li class="cx2-e" aria-hidden="true"></li>').join('')}</ul></div>`; };
// each row's cell in the new design (word list: Strength Score, Matchups with the four calc levels, Team checks)
const CX2 = {
  grade: G => G ? `<div class="np-score sm" style="--band:var(--band-${({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid'})"><b>${Math.round(G.s)}</b><div class="w"><span>${V2.esc(CH.wordOf(G.s))}${G.partial ? ' so far' : ''}</span><small>${G.partial ? `${(G.st && G.st.partialN) || 0} of 6 picked` : V2.esc(CH.recLine(G, true))}</small></div></div>` : '<span class="fine">Add Pokémon first</span>', /* a partial team says so, as My Team does (code review A1-I5) */
  ready: v => { if (!v) return '–'; const c = [0, 0, 0, 0]; for (const r of v.RD.rows) c[r.level]++; return `<span class="cx2-l"><b>${c[3]}</b> Beats it</span><span class="cx2-l"><b>${c[2]}</b> Handles it</span><span class="cx2-l fine">${c[1]} Shaky · ${c[0]} No answer</span>`; },
  thr: L => L.length ? `<span class="cx2-mons">${L.slice(0, 5).map(r => `<span><img src="${V2.art(SPRITE_ID[r.t.n])}" alt="" loading="lazy" decoding="async">${V2.rowName(r.t.d)}</span>`).join('')}${L.length > 5 ? `<span class="fine">+${L.length - 5} more</span>` : ''}</span>` : '<span class="fine">None</span>',
  ck: v => v == null ? '<span class="cx2-ck un" title="Not counted">–</span>' : v ? '<span class="cx2-ck ok" aria-label="Yes">✓</span>' : '<span class="cx2-ck no" aria-label="No">✗</span>',
  spd: v => { if (!v) return '–'; const os = x => { const r = typeof outspeedOf === 'function' ? outspeedOf(x.v, v.wxS || '', {}) : null; return r ? ` <span class="fine">· outspeeds ${r.pct}% of the top ${r.n}</span>` : ''; }, f = v.spd[0], l = v.spd[v.spd.length - 1];
    return `<span class="cx2-l">Fastest <b>${V2.esc(f.m.d)}</b> ${f.v}${os(f)}</span><span class="cx2-l">Slowest <b>${V2.esc(l.m.d)}</b> ${l.v}${os(l)}</span>`; },
  sc: s => s.txt.length ? s.txt.map(x => `<span class="cx2-l">${V2.esc(x)}</span>`).join('') : '<span class="fine">Neither</span>',
  field: L => L.length ? L.map(x => `<span class="cx2-l"><b>${V2.esc(x.name)}</b>${x.active ? '' : ' <span class="fine">(nothing uses it)</span>'}</span>`).join('') : '<span class="fine">None</span>',
  weak: L => L.length ? `<span class="cx2-ty">${L.slice(0, 4).map(V2.typeChip).join('')}${L.length > 4 ? `<span class="fine">+${L.length - 4}</span>` : ''}</span>` : '<span class="fine">No type hits 2+ more than resist</span>',
  unres: L => L.length ? `<span class="cx2-ty">${L.slice(0, 4).map(V2.typeChip).join('')}${L.length > 4 ? `<span class="fine">+${L.length - 4}</span>` : ''}</span>` : '<span class="fine">Every type is resisted</span>',
  off: n => n != null ? `<span class="cx2-l"><b>${n}</b> of 18</span>` : '–',
  arch: v => v && v.label ? `<span class="cx2-l">${V2.esc(String(v.label))}</span>` : '–',
  mine: I => I && I.n ? `<span class="cx2-l"><b>${I.w}–${I.l}</b> <span class="fine">${I.n} game${I.n === 1 ? '' : 's'} you logged</span></span>` : '<span class="fine">None logged</span>'};
const CX2_LABEL = {ready: 'Matchups (damage calc, top 30)'};

// re-audit Nov 15: a row is 'the same on both' only when both cells read the same; today's flag compares one number (Matchups' score,
// a check's yes/no) while the cells show more (Beats/Handles counts, the Tailwind setter), so rows that differ were listed as the same
V2.cxRows = (IA, IB) => cxFacts(IA, IB).map(r => { if (r.diff) return r; let d = false; try { const c = v => CX2[r.k.startsWith('ck:') ? 'ck' : r.k](v); d = c(r.a) !== c(r.b); } catch (e) {} return d ? {...r, diff: true} : r; });
/* Compare on the kit (reskin proposal, Nov 22): HEAD TO HEAD. The one idea is the tug of war (compare-faceoff.js, V2.cmpTug): the top 30
   threats that one team handles and the other can't, each pulled toward the team that has the answer. Every row, fold, link and hook of the
   Face-Off page stays (What's different, the differing rows, Same on Both, Why These Scores, the picker, Swap, Change, the quick winners). */
V2.cxCell = (r, v, NOTE) => NOTE.has(r.k) ? `<span class="cx2-note">${v == null ? '–' : v ? 'Has it' : 'No'}</span>` : CX2[r.k.startsWith('ck:') ? 'ck' : r.k](v);
V2.cxRowHtml = (r, NOTE) => `<div class="cx2-row${NOTE.has(r.k) ? ' cx2-nrow' : ''}"><div class="cx2-lab">${V2.esc(CX2_LABEL[r.k] || V2.wl(r.label))}${NOTE.has(r.k) ? ' <small class="cx2-nk">note</small>' : ''}</div><div class="cx2-c a">${V2.cxCell(r, r.a, NOTE)}</div><div class="cx2-c b">${V2.cxCell(r, r.b, NOTE)}</div></div>`;
V2.cxHrow = () => '<div class="cx2-row cx2-hrow"><div class="cx2-lab"></div><div class="cx2-c a"><b class="cx2-tm a">Team A</b></div><div class="cx2-c b"><b class="cx2-tm b">Team B</b></div></div>';
// the page header on the kit: the back link, the kicker, the slanted headline, one lead line (the empty state's lead is today's hint)
V2.cxTop = (leadHtml, hint) => `<div class="cx2-top cmp-top"><a class="np-back k-link" href="#team">← My Team</a>${V2.kHead({kicker: 'MY TEAM · HEAD TO HEAD', h1Html: 'Compare <em>Teams.</em>'}).replace('</header>', leadHtml ? `<p class="k-lead${hint ? ' tm-sub cx2-hint' : ''}">${leadHtml}</p></header>` : '</header>')}</div>`;
V2.pages.compare = {place: 'team', draw() { /* scan S13 (Nov 20): the first visit starts with My Team as Team A when it has Pokémon; once per visit, so clearing it stays cleared */
  if (!ui.cx.seeded) { ui.cx.seeded = true; try { if (!ui.cx.A && !ui.cx.B && members().length) ui.cx.A = 'cur'; } catch (e) {} } const RA = cxResolve(ui.cx.A), RB = cxResolve(ui.cx.B); if (!RA) ui.cx.A = null; if (!RB) ui.cx.B = null;
  /* picking: the two corners face to face, each a team or its picker (Team B's offers the latest winners, scan S31) */
  const face = `<div class="cx2-heads cmp-face cmp-pick">${V2.cxHead('A', RA)}<i class="cmp-vs u" aria-hidden="true">VS</i>${V2.cxHead('B', RB)}</div>${RA && RB ? '<button type="button" class="np-link k-link cx2-swap" data-cxswap2>Swap A and B ⇄</button>' : ''}`;
  if (!RA || !RB) return `<section class="cx2 cmp">${V2.cxTop('Pick two teams: your team, a saved one, an event winner or a pasted Showdown team. Both are worked out as on My Team.', true)}${face}</section>`;
  const IA = CX.cache.get(cxKey(RA.slots)), IB = CX.cache.get(cxKey(RB.slots));
  if (!IA || !IB) { V2.cxWork(); return `<section class="cx2 cmp">${V2.cxTop('')}${face}<p class="tm-sub cx2-busy" role="status">Working out both teams: Strength Score, matchups, checks and speed…</p></section>`; }
  if (IA.err || IB.err) return `<section class="cx2 cmp">${V2.cxTop('')}${face}<p class="tm-sub cx2-hint" role="status">One of these teams couldn't be worked out. Try another team, or change this one on My Team.</p></section>`;
  const rows = V2.cxRows(IA, IB), diff = rows.filter(r => r.diff), same = rows.filter(r => !r.diff);
  /* the threats sentence and the score sentence say what the tug of war and the face-off already show, so they're left out here */
  const says = ['sc', 'field', 'ready', 'weak'].map(k => (rows.find(r => r.k === k) || {}).say).concat(rows.filter(r => r.k.startsWith('ck:')).map(r => r.say)).filter(Boolean);
  // known-bug CMP-04b (Nov 17): speed control, spread damage and lead support are notes, not counted (word list, Nov 9): no ✓/✗ for them, a plain 'Has it' / 'No' and a 'note' tag
  const NOTE = new Set([...((IA.CK || {items: []}).items), ...((IB.CK || {items: []}).items)].filter(i => i.note).map(i => 'ck:' + i.k));
  const tm = s => V2.esc(s).replace(/Team A/g, '<b class="cx2-tm a">Team A</b>').replace(/Team B/g, '<b class="cx2-tm b">Team B</b>');
  /* the Strength Score is in the face-off and the threats and matchups are the tug of war: the rows grid lists every other row that differs */
  const above = r => ['grade', 'ready', 'thr'].includes(r.k), rest = diff.filter(r => !above(r));
  const T = V2.cmpTally(IA), U = V2.cmpTally(IB);
  const lead = T && U ? `Of the top 30 threats, ${tm('Team A')} beats or handles ${T.ok}, ${tm('Team B')} ${U.ok}.` : '';
  const steps = V2.kStep(1, 'The tug of war.', 'threats only one of them handles', V2.cmpTug(IA, IB, rows))
    + V2.kStep(2, "What's different.", rest.length ? `${rest.length} more row${rest.length === 1 ? '' : 's'} where they differ` : 'the rows where they differ', `<div class="cx2-sum">${says.length ? `<ul>${says.slice(0, 6).map(s => `<li>${tm(V2.wl(s))}</li>`).join('')}</ul>` : '<p class="tm-sub">These two line up the same on every row below.</p>'}</div>${rest.length ? V2.cxHrow() + `<div class="cx2-grid">${rest.map(r => V2.cxRowHtml(r, NOTE)).join('')}</div>` : ''}`)
    + V2.kStep(3, 'The fine print.', 'what matches, and why the scores', `${same.length ? `<details class="cx2-same"${ui.cx.same ? ' open' : ''}><summary>Same on Both <span class="fine">${same.length} row${same.length === 1 ? '' : 's'}</span></summary>${V2.cxHrow()}<div class="cx2-grid">${same.map(r => V2.cxRowHtml(r, NOTE)).join('')}</div></details>` : ''}
    ${IA.G || IB.G ? `<details class="cx2-why"><summary>Why These Scores</summary><div class="cx2-whyg">${[['A', IA, RA], ['B', IB, RB]].map(([sd, I, R]) => I.G ? `<div class="cx2-whyi"><p class="cx2-whyt"><b class="cx2-tm ${sd.toLowerCase()}">Team ${sd}</b> ${V2.esc(R.name || '')}</p>${V2.whyHtml(I.G, {inline: true})}</div>` : '').join('')}</div><p class="fine">${V2.esc(CH.WHY_TEST)}</p><p class="fine">${V2.esc(CH.LETTERS)} <a class="np-link" href="#method">How the Strength Score works</a></p></details>` : ''}
    <p class="fine cx2-foot">The Strength Score and matchups are worked out exactly as on My Team: how each team's matchups look against the top 30 threats, not a prediction of this match. Speeds are the likely stat (your spread, or the most common one), in each team's own weather.</p>${V2.kGo('TAKE ON ANOTHER TEAM.', {'data-cxp': 'B', 'aria-label': 'Take on another team: change Team B'})}`);
  return `<section class="cx2 cxf cmp">${V2.cxTop(lead)}
    <section class="cmp-face cxf-poster" aria-label="Team A against Team B">${V2.cmpHalf('A', RA, IA, IB)}<i class="cmp-vs cxf-vs u" aria-hidden="true">VS</i>${V2.cmpHalf('B', RB, IB, IA)}</section>
    <button type="button" class="np-link k-link cx2-swap" data-cxswap2>Swap A and B ⇄</button>${V2.kPlan(steps)}</section>`; }};
// work out what isn't cached yet, one side per frame, so the page answers at once (as today)
V2.cxWork = () => { if (V2.cxBusy) return; V2.cxBusy = true; const step = () => requestAnimationFrame(() => setTimeout(() => { let R = null; try { R = [cxResolve(ui.cx.A), cxResolve(ui.cx.B)].find(r => r && !CX.cache.has(cxKey(r.slots))); if (R) { cxInfo(R.slots); step(); return; } } catch (e) { if (R) try { CX.cache.set(cxKey(R.slots), {err: true}); } catch (x) {} /* remembered, so the page says so instead of trying again forever (code review A1-M9) */ } V2.cxBusy = false; if (V2.route() === 'compare') V2.redraw(); }, 0)); step(); };

// Sim Q10d (Nov 15): titled 'Change Team X' when that side already has a team (the button you tapped says Change), 'Pick Team X' when empty
// the picker, as a sheet: My Team, saved teams, event winners (newest first), or a pasted Showdown team
// one picker row (also Team B's quick winners, scan S31)
V2.cxOpt = (side, other, src, title, sub, names) => { const E = V2.esc; return `<button type="button" class="cx2-opt" data-cxset2="${side}|${E(src)}"${other === src ? ' aria-disabled="true"' : ''}><span class="t"><b>${E(title)}</b>${other === src ? `<span>Already team ${side === 'A' ? 'B' : 'A'}</span>` : sub ? `<span>${E(sub)}</span>` : ''}</span><span class="s">${names.map(n => `<img src="${V2.art(SPRITE_ID[n])}" alt="" loading="lazy" decoding="async">`).join('')}</span></button>`; };
V2.cxPickHtml = side => { const other = ui.cx[side === 'A' ? 'B' : 'A'], E = V2.esc;
  const opt = (src, title, sub, names) => V2.cxOpt(side, other, src, title, sub, names);
  const mine = members(), parts = [];
  if (mine.length) parts.push(`<h3 class="cx2-ph">My Team</h3>${opt('cur', teamTitleFor(mine), 'Open now', mine.map(m => m.p.n))}`);
  const sv = S.teams.filter(t => t.format !== 'singles');
  if (sv.length) parts.push(`<h3 class="cx2-ph">Saved Teams</h3>${sv.map(t => opt('s:' + t.id, t.name, '', teamRating(t.slots).ms.map(m => m.p.n))).join('')}`);
  const pool = tsPool().filter(x => x.t.place === 1), cap = 6 + ui.cx.wmore * 10;
  if (pool.length) parts.push(`<h3 class="cx2-ph">Winning Teams <small>event winners, newest first</small></h3>${pool.slice(0, cap).map(x => opt('e:' + x.key, String(teamPlanLabel(x.t.mons.map(m => m.n)) || '') || 'Event winner', `Won ${V2.evTitle(x.ev.name)} · ${evDate(x.ev.date)}`, x.t.mons.map(m => m.n)) /* Nov 15 (re-audit #10): every row said 'Champion'; now the team's style, as on Winning Teams; event names cleaned as on Build */).join('')}${pool.length > cap ? V2.kMore(pool.length - cap, {vh: 'winners', attrs: {class: 'cx2-more', 'data-cxwmore2': ''}}) /* Wave 2 (Sim chose A, Nov 22): the kit show-more; N = how many are left, as on Events (each tap still adds 10) */ : ''}<p class="fine">Any other tournament team: tap Compare on its card in Winning Teams.</p>`); /* today's line, restored (quality pass Nov 15) */
  parts.push(`<h3 class="cx2-ph">Paste a Showdown Team</h3><textarea class="imp2-in cx2-paste" data-cxpaste-in rows="5" spellcheck="false" placeholder="Paste a team from Showdown, Pokémon Zone, Pikalytics or Victory Road" aria-label="Showdown team text"></textarea>
    <div class="cx2-pacts"><button type="button" class="np-btn2" data-cxpaste2="${side}"><span>Use This Team</span></button><p class="fine" data-cxpnote aria-live="polite"></p></div>`);
  return `<div class="cx2-pick"><div class="np-eyebrow">Compare</div><h2 class="u">${ui.cx[side] ? 'Change' : 'Pick'} Team ${side}</h2>${parts.join('')}</div>`; };
V2.cxPick = side => { ui.cx.pick = side; V2.sheet(V2.cxPickHtml(side), {label: 'Pick team ' + side, small: true}); };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-cxp],[data-cxset2],[data-cxswap2],[data-cxwmore2],[data-cxpaste2],[data-cxgo2]'); if (!t) return; const d = t.dataset;
  if (d.cxgo2 !== undefined) { const [a, b] = d.cxgo2.split('|'); V2.cxGo(a, b); }
  else if (d.cxp) V2.cxPick(d.cxp);
  else if (d.cxset2) { if (t.getAttribute('aria-disabled') === 'true') return; const i = d.cxset2.indexOf('|'), side = d.cxset2.slice(0, i); ui.cx[side] = d.cxset2.slice(i + 1); ui.cx.wmore = 0; V2.closeSheet(true);
    V2.redraw(); if (!ui.cx.A || !ui.cx.B) setTimeout(() => V2.cxPick(!ui.cx.A ? 'A' : 'B'), 60); }
  else if (d.cxswap2 !== undefined) { const x = ui.cx.A; ui.cx.A = ui.cx.B; ui.cx.B = x; const p = ui.cx.paste; if (p.A || p.B) { ui.cx.paste = {A: p.B, B: p.A}; if (ui.cx.A === 'p:B') ui.cx.A = 'p:A'; if (ui.cx.B === 'p:A') ui.cx.B = 'p:B'; } V2.redraw(); }
  else if (d.cxwmore2 !== undefined) { ui.cx.wmore++; const sh = document.querySelector('.cx2-pick'); if (sh) sh.outerHTML = V2.cxPickHtml(ui.cx.pick); }
  else if (d.cxpaste2) { const side = d.cxpaste2, ta = document.querySelector('[data-cxpaste-in]'), note = document.querySelector('[data-cxpnote]'); let r = null; try { r = parsePaste(ta ? ta.value : ''); } catch (er) {}
    if (!r || !r.slots.length) { if (note) note.textContent = 'No Pokémon found in that text. Paste the team as Showdown exports it.'; return; }
    ui.cx.paste[side] = normSlots(r.slots); ui.cx[side] = 'p:' + side; V2.closeSheet(true); V2.redraw(); if (r.notes.length) toast(r.notes[0]); if (!ui.cx.A || !ui.cx.B) setTimeout(() => V2.cxPick(!ui.cx.A ? 'A' : 'B'), 60); } });
document.addEventListener('toggle', e => { const d = e.target; if (d && d.classList && d.classList.contains('cx2-same')) ui.cx.same = d.open; }, true);
