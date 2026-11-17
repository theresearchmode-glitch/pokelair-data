// ---------- Meta > Pokémon > Sets (Nov 14): "How it's built right now." (Sim's Grandstand brief, section 5) ----------
// Look up a Pokémon (remembered, cc2.setMon), the source switch Best data / Tournaments / Showdown (remembered, cc2.setSrc), "Your team"
// on a bench (the one viewed lit blue), "How <Pokémon> is built" (Your line, moves bars beside item / ability / nature), "Usually alongside",
// the source note. Every feature of today's Popular Sets (meta-features.md SETS-01..05) from today's shared logic: setFor, findIn, SET_SRC,
// setSources, rankLine, rankTxt (src/app/21-sets.js, 02-set-data.js, 24-sheet-data.js).
V2.stUi = {q: ''};
V2.stMon = () => { const team = members(); let p = byName.get(ui.setMon);
  if (!p && team.length) { p = team[0].p; ui.setMon = p.n; }
  if (!p) { try { const r = lairRows(); p = r && r[0] ? r[0].p : null; } catch (e) {} if (p) ui.setMon = p.n; }
  if (!ui.setSrcLoaded) { ui.setSrcLoaded = true; try { const v = LS.get('cc2.setSrc', null); if (SET_SRC[v]) ui.setSrc = v; } catch (e) {} }
  return p; };
V2.stSet = p => { const src = SET_SRC[ui.setSrc] ? ui.setSrc : 'ingame';
  if (src === 'ingame') { const st = setFor(p, 'doubles', 'ingame'), d = META[SRC.ingame], row = findIn(d, p); return {src, t: st, line: rankLine(d, row) || mainSource(st), note: setSources(st, 'doubles', p)}; }
  const d = META[SRC[src]], row = findIn(d, p); return {src, t: row, line: rankLine(d, row) || (d ? V2.esc(d.source || '') : 'No data loaded yet'), note: ''}; };
V2.stBench = (list, cls) => `<div class="gs-row us-bench ${cls}" style="--c:${innerWidth < 700 ? 3 : list.length}">${list.join('')}</div>`;
V2.stFig = (q, sub, on, mega) => { const E = V2.esc; return `<button type="button" class="gs-mon${on ? ' on' : ''}" data-v2setmon="${E(q.n)}" aria-pressed="${!!on}" style="--b1:var(--ty-${q.t[0]});--b2:var(--ty-${q.t[1] || q.t[0]})" aria-label="${E(q.d)}${sub ? ', ' + E(sub) : ''}: show its sets">
    <span class="gs-fig" aria-hidden="true"><i class="gs-base"></i>${V2.mon(q.n, {bare: true})}</span><span class="gs-tx" aria-hidden="true">${q.m ? '<span class="gs-mg u">Mega</span>' : '<span class="gs-mg">&nbsp;</span>'}<b>${E(q.m ? q.d.slice(5) : q.d)}</b>${sub ? `<small>${E(sub)}</small>` : ''}</span></button>`; };
V2.stSpot = (p, mine) => { const E = V2.esc, x = lairRows().find(y => y.p.n === p.n), N = V2.raNums(p), k = lairRank(p), st = V2.addState(p.n), T = x ? lTier(x.r.total) : null;
  return `<div class="gs-spot ra-spot" style="--ta:var(--ty-${p.t[0]});--tb:var(--ty-${p.t[1] || p.t[0]})"><div class="gs-plate">${V2.mon(p.n, {bare: true})}</div>
    <div class="gs-sinfo"><p class="gs-tag u">${mine ? 'On your team' : k ? `#${k.rank} rated` : 'Looked up'}</p><h2 class="u">${V2.nameHtml(p.d)}</h2><div class="ra-ty">${p.t.map(V2.typeChip).join('')}</div>
      ${T ? `<p class="gs-big"><b class="u">${RS(x.r.total)}</b><span><i class="u tier-tag" style="--tc:var(--tier-${T.k.toLowerCase()})">${T.k} tier</i><small class="st-pill">Rated ${RS(x.r.total)}${k ? `, #${k.rank} of ${k.of}` : ''}</small></span></p>` : ''}
      <div class="gs-facts"><p><span>On tournament teams</span><b class="u">${N.u != null ? E(V2.raPct(N.u)) : '–'}</b></p><p><span>Win rate</span><b class="u">${N.w != null ? E(winFmt(N.w)) : '–'}</b></p><p><span>Base Speed</span><b class="u">${p.st[5]}</b></p></div>
      <div class="ra-acts"><button type="button" class="np-btn" data-v2mon="${E(p.n)}"><span>Pokémon Page</span></button>${st === 'ok' ? `<button type="button" class="np-btn2" data-v2add="${E(p.n)}" aria-label="Add ${E(p.d)} to My Team"><span>Add to My Team</span></button>` : `<button type="button" class="np-btn2" data-hmaround="${E(p.n)}"><span>Build Around It</span></button>`}</div></div></div>`; };

V2.pages.sets = {place: 'meta', draw() { const E = V2.esc, U = V2.stUi, team = members(), p = V2.stMon();
  const tabs = `<div class="ra-sub"><nav class="ra-tabs" aria-label="Meta"><a href="#meta" class="on" aria-current="page">Pokémon</a><a href="#tournaments">Tournaments</a></nav>
    <nav class="ra-seg" aria-label="Pokémon views"><a href="#meta">Ratings</a><a href="#usage">Usage</a><a href="#sets" class="on" aria-current="page">Popular Sets</a></nav></div>`;
  const head = `<section class="ra-h"><p class="np-eyebrow"><span>Meta · Sets</span></p><h1 class="u"><span>How it's built</span> <span class="pl">right now.</span></h1>
    <p class="ra-lede">The moves, items, Abilities and natures real players run, and who they pair it with.</p><p class="ra-links"><a class="np-link" href="#meta">Ratings ›</a><a class="np-link" href="#usage">Usage ›</a></p></section>`;
  const q = U.q.trim().toLowerCase(), hits = q ? ROSTER.filter(x => x.d.toLowerCase().includes(q)).slice(0, 8) : [];
  const S2 = p ? V2.stSet(p) : null;
  const ctl = `<div class="gs-ctl"><div class="ra-find st-find"><label class="np-field ra-q">${V2.ICON.search}<input type="search" data-stq value="${E(U.q)}" placeholder="Look up a Pokémon" aria-label="Look up a Pokémon" autocomplete="off"></label>
      ${q ? `<div class="st-hits" role="listbox" aria-label="Matches">${hits.length ? hits.map(x => `<button type="button" class="ra-chip" data-v2setmon="${E(x.n)}">${E(x.d)}</button>`).join('') : '<p class="tm-sub">No Pokémon matches that.</p>'}</div>` : ''}</div>
    <div class="ra-filt us-srcs" role="group" aria-label="Doubles data source">${Object.entries(SET_SRC).map(([k, v]) => `<button type="button" class="ra-chip" data-v2setsrc="${k}" aria-pressed="${S2 ? S2.src === k : k === 'ingame'}">${v}</button>`).join('')}</div>
    ${S2 ? `<p class="fine us-src">${S2.line}</p>` : ''}</div>`;
  if (!p) return `<div class="ra gsp us st"><div class="gs-top">${head}</div>${tabs}<div class="gs-body">${ctl}<p class="tm-sub">Look up a Pokémon to see its popular sets.</p></div></div>`;
  const mine = team.find(m => m.p.n === p.n), t = S2.t;
  const yours = team.length ? `<section class="st-team"><h2 class="u st-h2">Your Team</h2>${(innerWidth < 700 && team.length > 3 ? [team.slice(0, 3), team.slice(3)] : [team]).map(r => V2.stBench(r.map(m => V2.stFig(m.p, '', m.p.n === p.n)), 'st-six')).join('')}</section>` : '';
  const your = mine ? `<p class="st-mine">Your ${E(mine.d)}: ${E(mine.ability)}${mine.item ? ` @ <b>${E(mine.item)}</b>${mine.heldItem ? ' (your pick)' : ''}` : ''} · ${mine.moves.filter(Boolean).map(x => E(x.name)).join(', ')}${mine.custom ? ' (your moves)' : ''}</p>` : '';
  const stone = p.m && t && t.it && t.it.length ? t.it[0][0] : null;
  const build = hasSet(t) ? `<div class="st-cols"><div class="st-mv">${V2.usBars('Moves', t.mv, 8, '')}</div><div class="st-side">${stone ? `<div class="us-bars"><p class="us-bh">Item</p><p class="st-stone">Always holds <b>${E(stone)}</b>.</p></div>` : V2.usBars('Item', t.it, 4, '')}${p.m && p.a && p.a[0] ? `<div class="us-bars"><p class="us-bh">Ability</p><p class="st-stone">Always <b>${E(p.a[0])}</b> (a Mega's Ability is fixed).</p></div>` /* player review 4c (Nov 17): tournament sheets list the base form's Ability for Megas (Blaze 84% on Mega Charizard Y) */ : V2.usBars('Ability', t.ab, 3, '')}${V2.usBars('Nature', t.na, 3, '')}${(t.na || []).length && (t.na || []).every(x => x[1] == null) ? `<p class="fine st-nonum">No usage numbers in this source: Tournaments or Showdown show how often each nature and teammate is used.</p>` : ''}</div></div>`
    : `<p class="tm-sub">Not among the top Pokémon in this list. "Best data" covers every Pokémon.</p>`;
  const tm = (t && t.tm || []).slice(0, 6).filter(([n]) => byName.get(n)), rows = innerWidth < 700 && tm.length > 3 ? [tm.slice(0, 3), tm.slice(3)] : [tm];
  const mates = tm.length ? `<section class="us-mates"><p class="np-eyebrow"><span>Teammates</span></p><h3 class="u">Usually alongside</h3>${rows.map(r => `<div class="gs-row us-bench" style="--c:${innerWidth < 700 ? 3 : r.length}">${r.map(([n, v]) => V2.stFig(byName.get(n), v != null ? `${Math.round(+v)}% of its teams` : '', false)).join('')}</div>`).join('')}</section>` : '';
  return `<div class="ra gsp us st"><div class="gs-top">${head}<div class="ra-spotw">${V2.stSpot(p, !!mine)}</div></div>${tabs}<div class="gs-body">${ctl}${yours}
    <section class="us-how st-how"${` style="--ty-a:var(--ty-${p.t[0]});--ty-b:var(--ty-${p.t[1] || p.t[0]})"`}><div class="us-hh"><h2 class="u">How ${E(p.d)} is built</h2></div>${your}${build}${mates}${S2.note ? `<p class="fine st-note">${S2.note}</p>` : ''}</section></div></div>`; }};

document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-stq]'); if (!i) return; V2.stUi.q = i.value; const at = i.selectionStart; V2.redraw();
  const n = document.querySelector('[data-stq]'); if (n) { n.focus(); try { n.setSelectionRange(at, at); } catch (x) {} } });
document.addEventListener('keydown', e => { const i = e.target.closest && e.target.closest('[data-stq]'); if (!i || e.key !== 'Enter') return; const b = document.querySelector('.st-hits [data-v2setmon]'); if (b) b.click(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2setmon],[data-v2setsrc]'); if (!b) return; const d = b.dataset;
  if (d.v2setmon && byName.get(d.v2setmon)) { ui.setMon = d.v2setmon; try { LS.set('cc2.setMon', d.v2setmon); } catch (x) {} V2.stUi.q = ''; }
  else if (d.v2setsrc && SET_SRC[d.v2setsrc]) { ui.setSrc = d.v2setsrc; try { LS.set('cc2.setSrc', d.v2setsrc); } catch (x) {} }
  V2.redraw(); if (d.v2setmon) { const h = document.querySelector('.st-how'); if (h && b.closest('.us-mates, .st-hits')) h.scrollIntoView({behavior: V2.smooth(), block: 'start'}); } });
(() => { const band = () => innerWidth >= 700 ? 1 : 0; let b = band(), tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { if (band() === b) return; b = band(); if (document.querySelector('.st')) V2.redraw(); }, 150); }); })();
