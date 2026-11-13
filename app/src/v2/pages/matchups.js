// ---------- My Team · Matchups (R4, Nov 11): Top 10 | Top 12 grid | All 30, and the threat sheet ----------
// Every number comes from today's shared working-out (59-matchup-data.js, 58-strength.js, 55-threats.js); this file only draws it.
// The view is remembered under today's key (cc2.seg.thr), so both sites open on the same one. Word list: Matchups; Beats it /
// Handles it / Shaky / No answer; Favoured / Even match / Unfavoured. team.js calls V2.muSec(D) and V2.muAfter().
// Sim, Nov 11: most of the 30 are "Even match", so the section opens on the stand-outs (Unfavoured, then Favoured) with "See all 30".
// The view is kept under the new build's own key (today's page doesn't know "Stand-outs", so it never sees it).
V2.MUV = [['out', 'Stand-Outs'], ['top', 'Top 10'], ['grid', 'Top 12 Grid'], ['all', 'All 30']];
V2.muView = () => { const v = LS.get('np2.seg.thr', 'out'); return V2.MUV.some(x => x[0] === v) ? v : 'out'; };
V2.MUG = ['✗', '~', '✓', '✓✓']; // a shape per calc level, so the colour is never the only signal
V2.MUC = {win: 'cw', trade: 'ct', lose: 'cl', none: 'cn'}; // grid cells: CH.cellOf's four answers
V2.VCLS = {'Favoured': 'vf', 'Even match': 've', 'Unfavoured': 'vu'};
V2.muImg = n => `<img src="${V2.art(SPRITE_ID[n])}" alt="" loading="lazy">`;
V2.muLv = l => `<span class="mu-lv l${l}"><i aria-hidden="true">${V2.MUG[l]}</i>${CH.LV[l]}</span>`;

// ---------- the section ----------
// the real-games split: Favoured | Even match | Unfavoured as one slanted bar (the approved mock's)
V2.muSplit = D => { const tot = D.mu.fav + D.mu.even + D.mu.unf, pc = n => tot ? Math.round(n / tot * 1000) / 10 : 0;
  return `<div class="mu-split" aria-hidden="true"><i class="sf" style="flex-grow:${pc(D.mu.fav)}"></i><i class="se" style="flex-grow:${pc(D.mu.even)}"></i><i class="su" style="flex-grow:${pc(D.mu.unf)}"></i></div>`; };
V2.muSec = D => { if (!D.rows.length) return ''; const RD = D.RD, ms = D.ms, view = V2.muView();
  const head = `<h2 class="u">Matchups</h2><p class="tm-sub">Against the top ${D.rows.length} threats.${D.mu.any ? ' Verdicts from real tournament games with your Pokémon; a row notes when the calc disagrees.' : ''}</p>
    ${D.mu.any ? `<div class="tm-legend"><span class="lf"><b>${D.mu.fav}</b> Favoured</span><span class="le"><b>${D.mu.even}</b> Even match</span><span class="lu"><b>${D.mu.unf}</b> Unfavoured</span></div>
    ${V2.muSplit(D)}` : ''}
    <p class="fine">Damage calc: ${CH.LV[0]} ${D.calc.none}, ${CH.LV[1]} ${D.calc.shaky}, ${CH.LV[2]} ${D.calc.handles}, ${CH.LV[3]} ${D.calc.beats}</p>
    <div class="mu-pick">${V2.slide('thr', V2.MUV, view, 'Matchups view')}</div>`;
  return `<section class="tm-sec tm-mus" id="tm-mu">${head}<div class="mu-pane">${view === 'grid' ? V2.muGrid(RD, ms) : view === 'all' ? V2.muAll(RD, ms) : view === 'top' ? V2.muTop(RD) : V2.muOut(RD)}</div></section>`; };

// A4 proposal (Sim's fix plan, Nov 12: "your recommendation"): one verdict per row. The real-games word leads; the calc reading
// shows only when it points the other way ("Calc disagrees: Beats it"); with no real-games verdict the calc is the row's verdict.
V2.calcNote = (R, lv) => R && ((R.w === 'Unfavoured' && lv >= 2) || (R.w === 'Favoured' && lv <= 1)) ? `<small class="mu-dis">Calc disagrees: ${CH.LV[lv]}</small>` : '';
// Stand-outs (Sim, Nov 11): only the threats real games call Unfavoured (worst first) or Favoured; the even ones are one line
V2.muOut = RD => { const rows = RD.rows.map(r => ({r, R: CH.realVs(r.t.n)})).filter(x => x.R && x.R.w !== 'Even match');
  const unf = rows.filter(x => x.R.w === 'Unfavoured'), fav = rows.filter(x => x.R.w === 'Favoured');
  const row = ({r, R}) => `<li><button type="button" class="mu-row mu-nk" data-muthr="${V2.esc(r.t.n)}" aria-label="${V2.esc(r.t.d)}: ${V2.esc(R.w)}, calc ${CH.LV[r.level]}">${V2.muImg(r.t.n)}<span class="nm">${V2.nameHtml(r.t.d)}${V2.calcNote(R, r.level)}</span><span class="tm-v ${V2.VCLS[R.w]}"><i aria-hidden="true"></i>${R.w}</span></button></li>`;
  // Nov 12 height cut: no group headings (each row carries its verdict badge; the counts line above has the numbers)
  // Sim, Nov 13 (My Team Q1 B, Sim chose it): at most 4 of each (the most common threats first), so rows stay even and the page length no longer
  // depends on the team; a line says how many more and opens All 30
  const N = 4, grp = (t, a) => a.length ? `<ol class="tm-rows mu-out" aria-label="${t}: ${a.length}">${a.slice(0, N).map(row).join('')}</ol>` : '';
  const more = [unf.length > N ? `${unf.length - N} more Unfavoured` : '', fav.length > N ? `${fav.length - N} more Favoured` : ''].filter(Boolean).join(' and ');
  return `${grp('Unfavoured', unf)}${grp('Favoured', fav)}${more ? `<p class="tm-sub mu-outmore">${more} in <button type="button" class="np-link" data-muall30>All 30 ›</button></p>` : ''}${!unf.length && !fav.length ? '<p class="tm-sub">Real games call every top threat an even match for this team.</p>' : ''}
`; }; // Nov 12 height cut: no "The other N are even matches. See all 30" line; the counts line above says how many are even and
  // the "All 30" view button sits just above the rows (the data-muall30 handler below stays for any other link)

// Top 10 (by top-cut share), numbered; phones and tablets show 5 and "Show 5 more"; then the next 20 as tiles, worst first
V2.muTop = RD => { const {top, rest, RV} = CH.top10(RD), more = !!ui.tlMore;
  const row = (r, i) => { const R = CH.realVs(r.t.n), vw = R ? `${R.w}, calc ${CH.LV[r.level]}` : CH.LV[r.level];
    return `<li><button type="button" class="mu-row" data-muthr="${V2.esc(r.t.n)}" aria-label="${V2.esc(r.t.d)}: ${V2.esc(vw)}"><span class="k">${i + 1}</span>${V2.muImg(r.t.n)}<span class="nm">${V2.nameHtml(r.t.d)}${V2.calcNote(R, r.level)}</span>${R ? `<span class="tm-v ${V2.VCLS[R.w]}"><i aria-hidden="true"></i>${R.w}</span>` : V2.muLv(r.level)}</button></li>`; };
  const tile = r => { const R = RV.get(r), w = R ? `${R.w}, calc ${CH.LV[r.level]}` : CH.LV[r.level];
    return `<button type="button" class="mu-tile${R ? ' ' + V2.VCLS[R.w] : ''}" data-muthr="${V2.esc(r.t.n)}" aria-label="${V2.esc(r.t.d)}: ${V2.esc(w)}" title="${V2.esc(r.t.d)}: ${V2.esc(w)}">${V2.muImg(r.t.n)}</button>`; };
  return `<ol class="tm-rows mu-rows${more ? ' is-more' : ''}">${top.map(row).join('')}</ol>
    ${top.length > 5 ? `<button type="button" class="np-link mu-more" data-mumore aria-expanded="${more}">${more ? 'Show top 5 only' : `Show ${top.length - 5} more`}</button>` : ''}
    ${rest.length ? `<h3 class="tm-h3 mu-h3">The next ${rest.length}, worst first</h3><div class="mu-tiles" role="group" aria-label="The next ${rest.length} threats">${rest.map(tile).join('')}</div>` : ''}`; };

// Top 12 grid: your six across, the top 12 threats down (worst first); a cell says what that Pokémon does 1-on-1
V2.muGrid = (RD, ms) => { const rows = CH.gridRows(RD, 12);
  const cell = (r, m) => { const c = CH.cellOf(r, m), L = CH.LVC[c]; return `<span role="cell" class="mu-c ${V2.MUC[c]}" title="${V2.esc(m.d)} vs ${V2.esc(r.t.d)}: ${L[1]}" aria-label="${V2.esc(m.d)}: ${L[1]}">${L[2]}</span>`; };
  return `<div class="mu-grid" role="table" aria-label="Your six against the top 12 threats" style="--n:${ms.length}">
    <div class="mu-gr mu-gh" role="row"><span role="columnheader"><span class="vh">Threat</span></span>${ms.map(m => `<span role="columnheader" title="${V2.esc(m.d)}">${V2.muImg(m.p.n)}<span class="vh">${V2.esc(m.d)}</span></span>`).join('')}</div>
    ${rows.map(r => `<button type="button" class="mu-gr" role="row" data-muthr="${V2.esc(r.t.n)}" aria-label="${V2.esc(r.t.d)}: ${CH.LV[r.level]}"><span class="th" role="rowheader">${V2.muImg(r.t.n)}<span class="nm">${V2.nameHtml(r.t.d)}<small>${CH.LV[r.level]}</small></span></span>${ms.map(m => cell(r, m)).join('')}</button>`).join('')}</div>
    <div class="mu-key">${Object.entries(CH.LVC).map(([c, L]) => `<span><i class="mu-c ${V2.MUC[c]}" aria-hidden="true">${L[2]}</i>${L[1]}</span>`).join('')}</div>
    <p class="fine">Rows are the top 12 threats by top-cut share, worst first. Tap one for the full matchup.</p>`; };

// All 30: Threat preparation (four groups, each threat opens to its calc reasons), then Biggest threats
V2.muAll = (RD, ms) => { const open = ui.thrOpen || {}, un = RD.rows.filter(r => r.level === 0).length;
  const reasons = r => { const R = thrReasons(r), g = {ok: '✓', part: '~', no: '✗'};
    return `<ul class="mu-why">${R.list.map(x => x.k === 't2' ? `<li class="t2">${V2.esc(x.text)}</li>` : `<li class="${x.k}"><i aria-hidden="true">${g[x.k]}</i><span>${V2.esc(x.text)}</span></li>`).join('')}</ul><p class="fine">Field: ${V2.esc(R.field)} · its usual set: ${V2.esc(R.set)}</p>`; };
  const row = r => `<details class="mu-thr" data-muopen="${V2.esc(r.t.n)}"${open[r.t.n] ? ' open' : ''}><summary>${V2.muImg(r.t.n)}<span class="nm">${V2.nameHtml(r.t.d)}<small>${pctTxt(+r.t.w)} of top cuts</small></span><span class="ev">${V2.esc(THR.evidence(r))}</span></summary>${reasons(r)}</details>`;
  const grp = (lv, start) => { const rs = thrGroup(RD, lv); if (!rs.length) return '';
    return `<details class="mu-grp l${lv}"${start ? ' open' : ''}><summary><span class="mu-lv l${lv}"><i aria-hidden="true">${V2.MUG[lv]}</i>${CH.LV[lv]}</span><b>${rs.length}</b> threat${rs.length === 1 ? '' : 's'}</summary>${rs.map(row).join('')}</details>`; };
  const bt = biggestThreats(ms, true), all = !!ui.threatsAll || !PHONE(), shown = bt ? (all ? bt : bt.slice(0, 4)) : [];
  const big = !bt ? '<p class="tm-sub">Threats appear once meta data has loaded.</p>' : !bt.length ? '<p class="tm-sub">No top meta Pokémon hits several of yours super effectively while going unanswered. Nice.</p>'
    : `<ul class="mu-big">${shown.map(r => `<li>${V2.muImg(r.o.p.n)}<div><p class="nm">${V2.nameHtml(r.name)} <span class="ty">${r.o.types.map(V2.typeChip).join('')}</span></p>
      <p class="t">${r.hit.length ? `Hits ${r.hit.length} of yours super effectively (${r.hit.map(i => V2.esc(ms[i].d)).join(', ')})` : 'Hard to hit back'}. ${r.ans.length ? 'Your answers: ' + r.ans.map(i => V2.esc(ms[i].d)).join(', ') : r.lv >= 2 ? 'Answered by your scouting report (speed control, support or a combined KO), not 1-on-1' : '<b class="no">No clean answer</b>'}${r.hard ? `<br>Hardest hit: ${V2.esc(r.hard.mv)} does up to ${r.hard.pct}% to ${V2.esc(r.hard.m.d)}.` : ''}</p></div>
      ${r.lv != null ? V2.muLv(r.lv) : r.ans.length ? '' : '<span class="mu-lv l0">No answer</span>'}</li>`).join('')}</ul>
      ${shown.length < bt.length ? `<button type="button" class="np-link mu-more" data-muall>Show All ${bt.length}</button>` : ''}`;
  return `<div class="mu-prep"><div class="np-eyebrow">Threat preparation${ms.length < 6 ? ' · so far' : ''}</div><p class="mu-big1 u">${(h => h ? `Beats or handles ${h.x} of the top ${h.n} threats` : '')(CH.hand(RD))}</p>
    <p class="fine">${un ? `${un} with no answer` : 'Every threat has an answer'} · weighted by how often each makes top cut</p></div>
    ${grp(0, true)}${grp(1, true)}${grp(2, false)}${grp(3, false)}
    <p class="fine mu-note">Each verdict is a real damage calc with your sets against the set most players run (one-on-one, average rolls, no crits or misses), with the speed, weather, terrain, Tailwind and Trick Room your team actually has. Doubles adds partners and switches, so treat it as preparation, not a forecast.</p>
    <div class="np-eyebrow mu-h3">Biggest threats</div><p class="tm-sub mu-bsub">Meta Pokémon that hit several of yours hard, or that nothing answers.</p>${big}`; };

// ---------- the threat sheet (today's scouting report), one threat picked at a time ----------
// The picked threat's detail sits above the 30 tiles (today: below them), so the threat you tapped is on the first screen.
V2.muSel = null;
V2.muSheetHtml = () => { const D = V2.teamData(); if (D.empty || !D.RD) return '<div class="mu-sh"><h2 class="u">Scouting Report</h2><p class="tm-sub">Add Pokémon to your team to see how ready it is for the top threats.</p></div>';
  const {RD, ms, G} = D, need = CH.needN(RD), sel = V2.muSel && RD.rows.find(r => r.t.n === V2.muSel), s = G ? Math.round(G.s) : null;
  const band = G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid' : 'solid';
  const ring = s == null ? '' : `<div class="np-score sm mu-score" style="--band:var(--band-${band})"><b>${s}</b><div class="w"><span>${V2.esc(CH.wordOf(G.s) + (G.partial ? ' so far' : ''))}</span><small>Strength Score</small></div></div>`;
  const sum = G ? (G.partial ? `<b>${V2.wl(CH.readyTxt(RD))}</b> so far` : V2.wl(CH.gradeSum(G, RD), CH.hand(RD))) : '';
  const tiles = `<div class="mu-stiles" role="group" aria-label="Top 30 threats, worst first">${CH.order(RD).map(r => `<button type="button" class="mu-st l${r.level}" data-muthr="${V2.esc(r.t.n)}" aria-pressed="${r === sel}" aria-label="${V2.esc(r.t.d)}: ${CH.LV[r.level]}" title="${V2.esc(r.t.d)}: ${CH.LV[r.level]}">${V2.muImg(r.t.n)}<i aria-hidden="true">${V2.MUG[r.level]}</i></button>`).join('')}</div>`;
  const thr = (r, cls) => `<div class="${cls}">${V2.muImg(r.t.n)}<div><p class="nm">${V2.nameHtml(r.t.d)} <small>${pctTxt(+r.t.w)} of top cuts</small></p><p class="t">${V2.esc(THR.evidence(r))}</p></div>${V2.muLv(r.level)}</div>`;
  const det = sel ? `<div class="mu-det" aria-live="polite">${thr(sel, 'mu-dh')}<ul class="mu-dots">${ms.map(m => { const c = CH.cellOf(sel, m), L = CH.LVC[c]; return `<li>${V2.muImg(m.p.n)}<i class="mu-c ${V2.MUC[c]}" aria-hidden="true">${L[2]}</i><span><b>${V2.esc(m.d)}</b>${L[1]}</span></li>`; }).join('')}</ul></div>` : '';
  const w5 = CH.worst5(RD), list = w5.length ? `<h3 class="tm-h3">Needs a plan</h3><div class="mu-w5">${w5.map(r => thr(r, 'mu-wr')).join('')}</div>` : '';
  const real = D.mu.any ? `<h3 class="tm-h3">Against the top 30</h3><div class="tm-legend"><span class="lf"><b>${D.mu.fav}</b> Favoured</span><span class="le"><b>${D.mu.even}</b> Even match</span><span class="lu"><b>${D.mu.unf}</b> Unfavoured</span></div>${V2.muSplit(D)}` : '';
  const CK = D.CK, ck = CK ? `<h3 class="tm-h3">Team Checks: ${CK.pass}/${CK.n}</h3><ul class="mu-ck">${CK.items.filter(x => !x.skip && !x.note).map(x => `<li class="${x.ok ? 'ok' : ''}"><b role="img" aria-label="${x.ok ? 'yes' : 'no'}">${x.ok ? '✓' : '✗'}</b>${V2.esc(x.label)}</li>`).join('')}</ul>` : '';
  // Best fix: the first suggestion, and only when it raises the Strength Score (known bug MU-05c: today's sheet can offer ±0)
  const S2 = D.sug, b = S2 && !S2.pending && !S2.side && S2.top[0], up = b && b.d != null && b.d > 0;
  const best = !up ? '' : `<div class="mu-best"><div class="np-eyebrow">Best fix: ${V2.esc(CH.gradeMove(b.g0, b.g1))}</div><p class="sw">${b.pl.ch.map(x => `${x.out ? `${V2.muImg(x.out.p.n)}<span>${V2.esc(x.out.d)}</span><b aria-hidden="true">→</b>` : '<b aria-hidden="true">+</b>'}${V2.muImg(x.c.p.n)}<span>${V2.esc(x.c.p.d)}</span>`).join('')}</p><button type="button" class="np-btn" data-mufix>Apply This Fix <span aria-hidden="true">➜</span></button></div>`;
  return `<div class="mu-sh"><header class="mu-shh"><div><div class="np-eyebrow">Scouting report: top 30 threats</div><h2 class="u">${need ? `${need} threat${need === 1 ? '' : 's'} need${need === 1 ? 's' : ''} a plan.` : 'Ready for every top threat.'}</h2></div>${ring}</header>
    <p class="mu-sum">${sum}${sum ? ' · ' : ''}${CH.handTxt(RD)}</p><p class="fine">${V2.esc(CH.LEGEND)}</p>${det}
    ${tiles}<p class="mu-key mu-skey"><span class="k">Damage calc:</span>${[D.calc.none, D.calc.shaky, D.calc.handles, D.calc.beats].map((n, l) => `<span><i class="mu-g l${l}" aria-hidden="true">${V2.MUG[l]}</i>${CH.LV[l]} ${n}</span>`).join('')}</p>
    <div class="mu-cols">${list ? `<div>${list}</div>` : ''}<div>${ck}${real}${best}</div></div>
    <div class="mu-acts"><button type="button" class="np-btn2" data-mufull><span>All 30 Matchups</span></button><button type="button" class="np-btn2" data-v2close><span>Close</span></button></div></div>`; };
// from: the row or tile that opened it (focus goes back there on Close or Escape, even where a tap doesn't focus a button)
V2.muOpen = (n, from) => { V2.muSel = n || null; V2.sheet(V2.muSheetHtml(), {label: 'Scouting report: top 30 threats', focus: '.mu-st[aria-pressed="true"]'}); if (from && V2._sheet) V2._sheet.back = from; };
// redraw the open sheet in place (a tile picked, or the suggestions finished), keeping the focus on the same control
V2.muSheetRedraw = () => { const w = V2._sheet && V2._sheet.wrap, s = w && w.querySelector('.np-sheet'); if (!s || !s.querySelector('.mu-sh')) return;
  const a = document.activeElement, key = a && a.closest && s.contains(a) ? (a.dataset.muthr ? `[data-muthr="${CSS.escape(a.dataset.muthr)}"]` : a.matches('[data-mufix]') ? '[data-mufix]' : null) : null;
  const old = s.querySelector('.mu-sh'); old.outerHTML = V2.muSheetHtml(); const f = key && s.querySelector('.mu-sh ' + key); if (f) f.focus({preventScroll: true}); };
document.addEventListener('click', e => { const t = e.target.closest && e.target; if (!t) return;
  const th = t.closest('[data-muthr]');
  if (th && th.closest('.mu-sh')) { V2.muSel = V2.muSel === th.dataset.muthr ? null : th.dataset.muthr; V2.muSheetRedraw(); const d = document.querySelector('.mu-sh .mu-det'); if (d) d.scrollIntoView({block: 'nearest'}); return; }
  if (th && th.closest('#main')) { V2.muOpen(th.dataset.muthr, th); return; }
  if (t.closest('[data-mumore]')) { ui.tlMore = !ui.tlMore; V2.redraw(); const b = document.querySelector('[data-mumore]'); if (b && e.detail === 0) b.focus({preventScroll: true}); return; } // keyboard: focus stays on the button
  if (t.closest('[data-muall]')) { ui.threatsAll = true; V2.redraw(); return; }
  if (t.closest('[data-mufull]')) { V2.closeSheet(true); LS.set('np2.seg.thr', 'all'); V2.redraw(); const m = document.getElementById('tm-mu'); if (m) m.scrollIntoView({block: 'start'}); return; }
  if (t.closest('[data-mufix]')) { const pl = (ui.planList || [])[0]; if (!pl) return; V2.closeSheet(true); applyPlan(pl); persist(); V2.redraw(); V2.appliedSay(`Applied: ${pl.ch.map(x => x.c.p.d).join(' and ')}`); } });
// the view switch (the shared slider) and the remembered open threats in All 30 (today's ui.thrOpen)
document.addEventListener('v2slide', e => { if (e.detail.key !== 'thr') return; LS.set('np2.seg.thr', e.detail.value); V2.redraw(); });
// "See all 30" from the stand-outs
document.addEventListener('click', e => { if (!e.target.closest || !e.target.closest('[data-muall30]')) return; LS.set('np2.seg.thr', 'all'); V2.redraw(); const m = document.getElementById('tm-mu'); if (m) m.scrollIntoView({block: 'start'}); });
document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.muopen) { ui.thrOpen = ui.thrOpen || {}; ui.thrOpen[d.dataset.muopen] = d.open; } }, true);
// after My Team redraws: the open sheet follows the new numbers, and Close / Escape still return to the row that opened it
V2.muAfter = () => { const S = V2._sheet; if (!S || !S.wrap.querySelector('.mu-sh')) return; V2.muSheetRedraw();
  if (S.back && !S.back.isConnected && S.back.dataset && S.back.dataset.muthr) { const n = S.back.dataset.muthr; S.back = [...document.querySelectorAll('#main [data-muthr]')].find(x => x.dataset.muthr === n && x.getClientRects().length) || S.back; } };
