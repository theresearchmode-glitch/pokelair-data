// ---------- Meta > Pokémon > Usage (Nov 14): "Who gets picked right now." (Sim's Grandstand brief, section 4) ----------
// The Podium (1, 2, 3 on blocks; 4 to 10 on benches), "How <Pokémon> is played" (bars), "Usually alongside", Add to team, Ranks 11–60.
// Every feature of today's Usage (meta-features.md META-01..07) is here, from today's shared logic: metaDoc / SRC / ui.metaSrc (the source,
// back to Ranked ladder on a reload), setFor + setBasis + basis (the bars and "Of N teams"), trendFor (badges), V2.addToTeam.
V2.usUi = {q: '', pick: null, all: false};
V2.usSrcs = [['ingame', 'Ranked ladder'], ['ladder', 'Showdown ladder'], ['tour', 'Online tournaments']];
V2.usLine = d => { const per = d.period && !String(d.source).includes(d.period) ? ' · ' + (/^\d{4}-\d{2}$/.test(d.period) ? new Date(d.period + '-15T12:00:00').toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : d.period) : '';
  return `${d.source || ''}${per}${d.battles ? ` · ${(+d.battles).toLocaleString('en-US')} battles` : ''}`; };
// one rank of the list, filled in as today: a ranked-ladder row with no sets borrows the tournament set (and says how many teams it is from)
V2.usRow = (t0, kind) => { const p = byName.get(t0.n); let t = t0, sb = null;
  if (p && !(t0.mv && t0.mv.length)) { const st = setFor(p, 'doubles', 'tour'); t = {...t0, mv: st.mv, it: st.it, ab: st.ab, na: st.na, tm: st.tm}; sb = f => { const b = setBasis(p, st, f); return b ? b.html : ''; }; }
  else if (t0.teams) { const h = basis(t0.teams, 'team', 'sets', {pre: 'of'}); sb = () => h; }
  return {t, p, sb, u: t.teams ? (t.u != null ? +t.u : null) : kind === 'ladder' && t.u != null ? +t.u : null, tr: trendFor(t.n, t.r)}; };
V2.usName = R => R.p ? R.p.d : R.t.n;
V2.usNums = R => { const E = V2.esc; return `${R.u != null ? `<b class="u">${(+R.u).toFixed(1)}<small>%</small></b>` : ''}${R.t.teams ? `<small>${basis(R.t.teams, 'team', 'teams', {})}</small>` : ''}${R.tr ? `<i class="us-tr ${E(R.tr.cls)}">${E(R.tr.txt)}</i>` : ''}`; };
V2.usLabel = R => `${V2.usName(R)}, rank ${R.t.r}${R.u != null ? `, ${(+R.u).toFixed(1)}% of teams` : ''}${R.t.teams ? `, ${(+R.t.teams).toLocaleString('en-US')} teams` : ''}${R.tr ? ', ' + R.tr.txt : ''}`;
V2.usFig = (R, cls, blk) => { const E = V2.esc, p = R.p; return `<button type="button" class="us-fig ${cls}" data-uspick="${E(R.t.n)}" aria-pressed="${V2.usUi.pick === R.t.n}" aria-label="${E(V2.usLabel(R))}: show how it is played"${p ? ` style="--b1:var(--ty-${p.t[0]});--b2:var(--ty-${p.t[1] || p.t[0]})"` : ''}>
    <span class="us-art" aria-hidden="true"><i class="gs-base"></i>${p ? V2.mon(p.n, {bare: true}) : ''}</span>${blk || ''}<span class="us-tx"><span class="us-rk u">#${R.t.r}</span><b>${E(V2.usName(R))}</b><span class="us-nums">${V2.usNums(R)}</span></span></button>`; };
V2.usBars = (title, arr, n, bas, tc) => arr && arr.length ? `<div class="us-bars"><p class="us-bh">${title}${bas ? ` <small>${bas}</small>` : ''}</p>${arr.slice(0, n).map(([nm, v]) => { const q = byName.get(nm);
  return `<p class="us-bar"><span>${V2.esc(q ? q.d : nm)}</span>${v != null ? `<b class="u">${(+v) < 1 ? (+v).toFixed(1) : Math.round(+v)}%</b><i aria-hidden="true"><i style="width:${Math.max(1, Math.min(100, +v))}%"></i></i>` : ''}</p>`; }).join('')}</div>` : '';
V2.usHow = (R, d) => { const E = V2.esc, t = R.t, p = R.p, nm = V2.usName(R), sb = R.sb, st = p ? V2.addState(p.n) : 'none';
  const groups = [V2.usBars('Moves', t.mv, 8, sb && sb('mv')), V2.usBars('Items', t.it, 5, sb && sb('it')), V2.usBars('Abilities', t.ab, 3, sb && sb('ab')), V2.usBars('Natures', t.na, 3, sb && sb('na'))].filter(Boolean);
  const tm = (t.tm || []).slice(0, 6).filter(([n]) => byName.get(n));
  const mates = tm.length ? `<div class="us-mates"><p class="np-eyebrow"><span>Teammates</span></p><h3 class="u">Usually alongside</h3>${(innerWidth < 700 && tm.length > 3 ? [tm.slice(0, 3), tm.slice(3)] : [tm]).map(row => `<div class="gs-row us-bench" style="--c:${innerWidth < 700 ? 3 : row.length}">${row.map(([n, v]) => { const q = byName.get(n);
      return `<button type="button" class="gs-mon" data-v2mon="${E(n)}" style="--b1:var(--ty-${q.t[0]});--b2:var(--ty-${q.t[1] || q.t[0]})" aria-label="${E(q.d)}${v != null ? `, on ${Math.round(+v)}% of its teams` : ''}: open its info sheet"><span class="gs-fig" aria-hidden="true"><i class="gs-base"></i>${V2.mon(q.n, {bare: true})}</span><span class="gs-tx" aria-hidden="true">${q.m ? '<span class="gs-mg u">Mega</span>' : '<span class="gs-mg">&nbsp;</span>'}<b>${E(q.m ? q.d.slice(5) : q.d)}</b>${v != null ? `<small>${Math.round(+v)}% of its teams</small>` : ''}</span></button>`; }).join('')}</div>`).join('')}</div>` : '';
  const cc = t.cc && t.cc.length ? `<p class="fine us-cc"><b>Checks and counters:</b> ${t.cc.slice(0, 5).map(([n, v]) => { const q = byName.get(n); return E(q ? q.d : n) + ` <small>${(+v).toFixed(0)}</small>`; }).join(', ')}</p>` : '';
  const add = st === 'ok' ? `<button type="button" class="np-btn" data-v2add="${E(p.n)}" aria-label="Add ${E(nm)} to team"><span>Add to team</span></button>` : st === 'have' ? '<p class="ra-mine"><i aria-hidden="true"></i>On your team</p>' : '';
  return `<section class="us-how" data-ushow="${E(t.n)}"${p ? ` style="--ty-a:var(--ty-${p.t[0]});--ty-b:var(--ty-${p.t[1] || p.t[0]})"` : ''}><div class="us-hh"><h2 class="u">How ${E(nm)} is played</h2><p class="fine">Point at or tap any Pokémon above to see it here instead.</p></div>
    ${t.w ? `<p class="us-w">Win rate · ${E(d.source || 'this list')}: <b class="u">${(+t.w).toFixed(1)}%</b>${t.teams ? ' ' + basis(t.teams, 'team', 'teams', {pre: 'from its'}) : ''}</p>` : ''}
    ${groups.length ? `<div class="us-groups">${groups.join('')}</div>` : '<p class="tm-sub">No set details for this one yet.</p>'}${cc}${mates}
    <div class="us-add">${add}<p class="fine">% = share of its sets${t0src(R)}.</p></div></section>`; };
const t0src = R => R.p && !(META[SRC[ui.metaSrc]] && (META[SRC[ui.metaSrc]].top || []).find(x => x.n === R.t.n && x.mv && x.mv.length)) ? '. Sets come from tournament teams where this list gives none' : '';
// the spotlight: the most used Pokémon of this list (tag "Most used right now")
V2.usSpot = (R, d) => { if (!R || !R.p) return ''; const E = V2.esc, p = R.p, x = lairRows().find(y => y.p.n === p.n), N = V2.raNums(p), st = V2.addState(p.n);
  return `<div class="gs-spot ra-spot" style="--ta:var(--ty-${p.t[0]});--tb:var(--ty-${p.t[1] || p.t[0]})"><div class="gs-plate">${V2.mon(p.n, {bare: true})}</div>
    <div class="gs-sinfo"><p class="gs-tag u">Most used right now</p><h2 class="u">${V2.nameHtml(p.d)}</h2><div class="ra-ty">${p.t.map(V2.typeChip).join('')}</div>
      <div class="gs-facts"><p><span>Usage rank</span><b class="u">#${R.t.r}</b></p><p><span>On teams</span><b class="u">${R.u != null ? (+R.u).toFixed(1) + '%' : N.u != null ? E(V2.raPct(N.u)) : '–'}</b></p><p><span>Win rate</span><b class="u">${R.t.w ? (+R.t.w).toFixed(1) + '%' : N.w != null ? E(winFmt(N.w)) : '–'}</b></p></div>
      <div class="ra-acts"><button type="button" class="np-btn" data-v2mon="${E(p.n)}"><span>Open info sheet</span></button>${st === 'ok' ? `<button type="button" class="np-btn2" data-v2add="${E(p.n)}"><span>Add to team</span></button>` : ''}</div>
      ${st === 'have' ? '<p class="ra-mine"><i aria-hidden="true"></i>On your team</p>' : ''}${x ? `<p class="fine">Rated ${RS(x.r.total)} · ${lTier(x.r.total).k} tier</p>` : ''}</div></div>`; };

V2.pages.usage = {place: 'meta', draw() { const E = V2.esc, U = V2.usUi;
  if (!META[SRC[ui.metaSrc]]) { const alt = ['ingame', 'tour', 'ladder'].find(k => META[SRC[k]]); if (alt) ui.metaSrc = alt; }
  const d = metaDoc(), kind = d && (d.kind || 'ladder');
  const tabs = `<div class="ra-sub"><nav class="ra-tabs" aria-label="Meta"><a href="#meta" class="on" aria-current="page">Pokémon</a><a href="#tournaments">Tournaments</a></nav>
    <nav class="ra-seg" aria-label="Pokémon views"><a href="#meta">Rating</a><a href="#usage" class="on" aria-current="page">Usage</a><a href="#sets">Sets</a></nav></div>`;
  const rows = d ? (d.top || []).map(t => V2.usRow(t, kind)) : [];
  const head = `<section class="ra-h"><p class="np-eyebrow"><span>Meta · Usage</span></p><h1 class="u"><span>Who gets picked</span> <span class="pl">right now.</span></h1>
    <p class="ra-lede">The most used Pokémon, from the ranked ladder, the Showdown ladder or online tournaments.</p><p class="ra-links"><a class="np-link" href="#meta">Ratings →</a><a class="np-link" href="#sets">Popular Sets →</a></p></section>`;
  const srcs = `<div class="gs-ctl"><div class="ra-find"><label class="np-field ra-q">${V2.ICON.search}<input type="search" data-usq value="${E(U.q)}" placeholder="Find a Pokémon in the ranks" aria-label="Find a Pokémon in the ranks" autocomplete="off"></label></div>
    <div class="ra-filt us-srcs" role="group" aria-label="Source">${V2.usSrcs.map(([k, l]) => `<button type="button" class="ra-chip" data-ussrc="${k}" aria-pressed="${ui.metaSrc === k}"${META[SRC[k]] ? '' : ' disabled title="No data from this source yet"'}><span>${l.replace(' ', '<span class="us-sp"> </span>')}</span></button>`).join('')}</div>
    ${d ? `<p class="fine us-src">${E(V2.usLine(d))}</p>` : ''}</div>`;
  if (!d) return `<div class="ra gsp us">${`<div class="gs-top">${head}</div>`}${tabs}<div class="gs-body">${srcs}<p class="tm-sub">No meta data loaded yet. Usage appears after the next data refresh.</p></div></div>`;
  const q = U.q.trim().toLowerCase(), byQ = R => V2.usName(R).toLowerCase().includes(q);
  let body;
  if (q) { const hit = rows.filter(byQ); body = `<p class="us-count"><b class="u">${hit.length}</b> ${hit.length ? `match${hit.length === 1 ? '' : 'es'}` : ''}</p>${hit.length ? `<div class="us-list">${hit.map(R => V2.usFig(R, 'row')).join('')}</div>` : '<p class="tm-sub">No Pokémon in this list matches that.</p>'}`; }
  else { const pick = rows.find(R => R.t.n === U.pick) || rows[0], top = rows.slice(0, 3), ben = rows.slice(3, 10), rest = rows.slice(10);
    const pod = [top[1], top[0], top[2]].map((R, i) => R ? `<div class="us-step us-p${[2, 1, 3][i]}">${V2.usFig(R, 'pod', `<span class="us-blk u" aria-hidden="true">${[2, 1, 3][i]}</span>`)}</div>` : '').join('');
    const halves = ben.length > 4 ? [ben.slice(0, 4), ben.slice(4)] : [ben];
    body = `<div class="gs-title"><h2 class="u">The Podium</h2><p class="gs-key fine">${rows.some(R => R.u != null) ? 'The ten most used, in order. Tap one to see how it is played.' : 'The ten most used, in order. This list ranks them; it gives no percentages.'}</p></div>
      <div class="us-podium"><div class="us-steps">${pod}</div><div class="us-benches">${halves.map(h => `<div class="gs-row us-bench" style="--c:4">${h.map(R => V2.usFig(R, 'bench')).join('')}</div>`).join('')}</div></div>
      ${pick ? V2.usHow(pick, d) : ''}
      ${rest.length ? `${U.all ? `<div class="us-list">${rest.map(R => V2.usFig(R, 'row')).join('')}</div>` : ''}<button type="button" class="np-btn2 us-rest" data-usrest aria-expanded="${U.all}"><span>${U.all ? 'Show the top 10' : `Ranks 11–${rows[rows.length - 1].t.r} · the rest of the list`}</span></button>` : ''}
      ${d.more && d.more.length ? `<p class="fine">Also ranked ${d.more[0].r}–${d.more[d.more.length - 1].r}: ${d.more.slice(0, 40).map(m => { const p = byName.get(m.n); return E(p ? p.d : m.n); }).join(', ')}${d.more.length > 40 ? ` and ${d.more.length - 40} more` : ''}</p>` : ''}${d.note ? `<p class="fine">${E(d.note)}</p>` : ''}`; }
  return `<div class="ra gsp us"><div class="gs-top">${head}<div class="ra-spotw">${V2.usSpot(rows[0], d)}</div></div>${tabs}<div class="gs-body">${srcs}${body}</div></div>`; }};

document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-usq]'); if (!i) return; V2.usUi.q = i.value; const at = i.selectionStart; V2.redraw();
  const n = document.querySelector('[data-usq]'); if (n) { n.focus(); try { n.setSelectionRange(at, at); } catch (x) {} } });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ussrc],[data-uspick],[data-usrest]'); if (!b) return; const U = V2.usUi, d = b.dataset;
  if (d.ussrc) { ui.metaSrc = d.ussrc; U.pick = null; }
  else if (d.uspick) { U.pick = d.uspick; V2.redraw(); const h = document.querySelector('[data-ushow]'); if (h && !V2.usUi._hover) h.scrollIntoView({behavior: 'smooth', block: 'nearest'}); return; }
  else if (d.usrest != null) U.all = !U.all;
  V2.redraw(); });
// mouse screens: pointing at a Pokémon on the podium swaps "How it is played" (the brief's "Point at or tap")
document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const b = e.target.closest && e.target.closest('.us-podium [data-uspick]'); if (!b || V2.usUi.pick === b.dataset.uspick) return;
  V2.usUi.pick = b.dataset.uspick; const R = (metaDoc() && metaDoc().top || []).find(t => t.n === b.dataset.uspick); const h = document.querySelector('[data-ushow]');
  if (R && h) { h.outerHTML = V2.usHow(V2.usRow(R, metaDoc().kind || 'ladder'), metaDoc()); document.querySelectorAll('.us-podium [data-uspick]').forEach(x => x.setAttribute('aria-pressed', x.dataset.uspick === V2.usUi.pick)); } });
(() => { const band = () => innerWidth >= 1100 ? 2 : innerWidth >= 700 ? 1 : 0; let b = band(), tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { if (band() === b) return; b = band(); if (document.querySelector('.us')) V2.redraw(); }, 150); }); })();
