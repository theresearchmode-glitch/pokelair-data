// ---------- Meta > Pokémon > Sets (Nov 14): "How it's built right now." (Sim's Grandstand brief, section 5) ----------
// Look up a Pokémon (remembered, cc2.setMon), the source switch Best data / Online tournaments / Showdown ladder (remembered, cc2.setSrc), "Your team"
// on a bench (the one viewed lit blue), "How <Pokémon> is built" (Your line, moves bars beside item / ability / nature), "Usually alongside",
// the source note. Every feature of today's Popular Sets (meta-features.md SETS-01..05) from today's shared logic: setFor, findIn, SET_SRC,
// setSources, rankLine, rankTxt (src/app/21-sets.js, 02-set-data.js, 24-sheet-data.js).
V2.stUi = {q: ''};
V2.stMon = () => { const team = members(); let p = byName.get(ui.setMon);
  if (!p && team.length) { p = team[0].p; ui.setMon = p.n; }
  if (!p) { try { const r = lairRows(); p = r && r[0] ? r[0].p : null; } catch (e) {} if (p) ui.setMon = p.n; }
  if (!ui.setSrcLoaded) { ui.setSrcLoaded = true; try { const v = LS.get('cc2.setSrc', null); if (SET_SRC[v]) ui.setSrc = v; } catch (e) {} }
  return p; };
// audit v199 #9 (Nov 17): the word list's source names, the same as Usage's chips (today's shared SET_SRC keeps 'Tournaments' / 'Showdown')
V2.setSrcName = {ingame: 'Best data', tour: 'Online tournaments', ladder: 'Showdown ladder'};
V2.stSet = p => { const src = SET_SRC[ui.setSrc] ? ui.setSrc : 'ingame';
  if (src === 'ingame') { const st = setFor(p, 'doubles', 'ingame'), d = META[SRC.ingame], row = findIn(d, p); return {src, t: st, line: rankLine(d, row) || mainSource(st), note: setSources(st, 'doubles', p)}; }
  const d = META[SRC[src]], row = findIn(d, p); return {src, t: row, line: rankLine(d, row) || (d ? V2.esc(d.source || '') : 'No data loaded yet'), note: ''}; };
V2.stBench = (list, cls) => `<div class="gs-row us-bench ${cls}" style="--c:${innerWidth < 700 ? 3 : list.length}">${list.join('')}</div>`;
V2.stFig = (q, sub, on, mega) => { const E = V2.esc; return `<button type="button" class="gs-mon${on ? ' on' : ''}" data-v2setmon="${E(q.n)}" aria-pressed="${!!on}" style="--b1:var(--ty-${q.t[0]});--b2:var(--ty-${q.t[1] || q.t[0]})" aria-label="${E(q.d)}${sub ? ', ' + E(sub) : ''}: show its sets">
    <span class="gs-fig" aria-hidden="true"><i class="gs-base"></i>${V2.mon(q.n, {bare: true})}</span><span class="gs-tx" aria-hidden="true">${q.m ? '<span class="gs-mg u">Mega</span>' : '<span class="gs-mg">&nbsp;</span>'}<b>${E(q.m ? q.d.slice(5) : q.d)}</b>${sub ? `<small>${E(sub)}</small>` : ''}</span></button>`; };
/* (V2.stSpot, the Grandstand spotlight, was replaced by step 1's panel, THE LOADOUT, Nov 22) */

// pr-4c (Nov 17): the 3 most used stat-point spreads with their share. Only the Showdown ladder (Smogon's 1630+ file, already in
// META.doubles .sp) has them: tournament team lists carry no stat points (data-inventory-nov17.md), so the line says where they're from.
// THE LOADOUT (Nov 22): step 2 "The fine-tuning." draws them as slanted plot bars (label, bar, share), one shared scale (the top spread's next 5%).
V2.stSpreads = p => { const d = META.doubles, row = d && p ? findIn(d, p) : null, nm = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
  const sp = (row && row.sp || []).filter(([k]) => { const v = String(k).split(':')[1]; const a = v ? v.split('/').map(Number) : []; return a.length === 6 && a.every(x => x >= 0 && x <= 32); }).slice(0, 3);
  if (!sp.length) return '';
  const lab = k => { const [nat, pts] = String(k).split(':'), v = pts.split('/').map(Number); return `${nat}: ${v.map((x, i) => x ? `${x} ${nm[i]}` : '').filter(Boolean).join(' / ') || 'no stat points'}`; };
  let mo = ''; try { mo = d.month ? new Date(d.month + '-01T12:00:00Z').toLocaleString('en-US', {month: 'long', timeZone: 'UTC'}) : ''; } catch (e) {}
  const top = Math.max(1, ...sp.map(([, v]) => +v || 0)), sc = Math.ceil((top + 0.5) / 5) * 5;
  return `<div class="st-sp lo-sp"><ul class="lo-rows">${sp.map(([k, v]) => `<li class="lo-r"><span>${V2.esc(lab(k))}</span><i class="lo-b" aria-hidden="true"><i style="width:${Math.max(1, Math.min(100, 100 * (+v || 0) / sc)).toFixed(1)}%"></i></i><b class="u">${V2.loPct(v)}</b></li>`).join('')}</ul><p class="fine st-nonum">Stat points from the Showdown ladder 1630+${mo ? `, ${mo}` : ''}: tournament team lists don't include them.</p></div>`; };
/* ---------- THE LOADOUT (Sim approved the direction, Nov 22, ~9:57 AM; docs/rebuild/pics/nov22/sets/loadout-*.png) ----------
   The kit head (META · THE LOADOUT) in the Meta frame (tabs as Usage and Ratings), the plot sentence "Show me [Pokémon ▾] from [Best data]
   [Online tournaments] [Showdown ladder]" (the Pokémon word takes you to the look-up box), the look-up and "Your team" picker, then the
   plan: 1 "The loadout." on Battle's night panel (--btg-panel, the war room's --wr-* words): the kit card, its tier, rating and facts on
   the left; Item / Ability / Nature as labelled values (the runners-up under each), the top four moves as kit move tickets, "Also run:"
   the rest, your own set, and the page's one pink move; 2 "The fine-tuning." the stat-point spreads as slanted plot bars; 3 "Usually
   alongside." the teammates as kit cards (tap one: its loadout). Every hook, state and word of today's page is kept. */
V2.loPct = v => v == null || v === '' ? '' : ((+v) < 1 ? (+v).toFixed(1) : Math.round(+v)) + '%';
// one labelled value: the top choice (its share when the source gives one), the runners-up in quiet words under it
V2.loVal = (label, arr, n, lead) => { const E = V2.esc, L = (arr || []).slice(0, n); if (!L.length && !lead) return '';
  const kw = {Item: V2.kItem, Ability: V2.kAbil}[label], nm = k => kw ? kw(k) : E(k); /* info sheets (Nov 22): item and Ability names open their sheets */
  const one = ([k, v]) => `${nm(k)}${v != null ? ` <small>${V2.loPct(v)}</small>` : ''}`;
  const main = lead || one(L[0]), rest = lead ? '' : L.slice(1).map(one).join(' · ');
  return `<div class="lo-v"><small class="lo-vl">${label}</small><b class="u">${main}</b>${rest ? `<span class="lo-vr">${rest}</span>` : ''}</div>`; };
V2.pages.sets = {place: 'meta', draw() { const E = V2.esc, U = V2.stUi, team = members(), p = V2.stMon();
  const tabs = `<div class="ra-sub"><nav class="ra-tabs" aria-label="Meta"><a href="#meta" class="on" aria-current="page">Pokémon</a><a href="#tournaments">Tournaments</a></nav>
    <nav class="ra-seg" aria-label="Pokémon views"><a href="#meta">Ratings</a><a href="#usage">Usage</a><a href="#sets" class="on" aria-current="page">Popular Sets</a></nav></div>`;
  const head = `<section class="ra-h lo-h"><p class="k-kicker np-eyebrow">META · THE LOADOUT</p><h1 class="k-h1 u">How it's built <em>right now.</em></h1>
    <p class="k-lead ra-lede">The moves, items, Abilities and natures real players run, and who they pair it with.</p>${tabs}<p class="ra-links"><a class="np-link" href="#meta">Ratings ›</a><a class="np-link" href="#usage">Usage ›</a></p></section>`;
  const q = U.q.trim().toLowerCase(), hits = q ? ROSTER.filter(x => x.d.toLowerCase().includes(q)).slice(0, 8) : [];
  const S2 = p ? V2.stSet(p) : null, src = S2 ? S2.src : 'ingame';
  // the plot sentence: the Pokémon word (▾: more than fit, the look-up box below holds them all) and the three sources, today's names
  const sent = `<div class="k-sent u lo-sent"><span>Show me</span> ${p ? `<button type="button" class="k-w k-menu" data-stfind aria-controls="st-q" aria-label="${E(p.d)}: look up another Pokémon"><span>${E(p.d)}${V2.K_CHEV}</span></button> ` : ''}<span>from</span> <span class="us-srcs lo-srcs" role="group" aria-label="Doubles data source">${Object.keys(SET_SRC).map(k => `<button type="button" class="k-w" data-v2setsrc="${k}" aria-pressed="${src === k}"><span>${V2.setSrcName[k] || SET_SRC[k]}</span></button>`).join('')}</span></div>
    ${S2 ? `<p class="fine us-src">${S2.line}</p>` : ''}`;
  const find = `<div class="ra-find st-find"><label class="np-field ra-q">${V2.ICON.search}<input type="search" id="st-q" data-stq value="${E(U.q)}" placeholder="Look up a Pokémon" aria-label="Look up a Pokémon" autocomplete="off">${V2.CLR}</label>
      ${q ? `<div class="st-hits" role="listbox" aria-label="Matches">${hits.length ? hits.map(x => V2.kChip(x.d, {attrs: {'data-v2setmon': x.n}}) /* Wave 2 part 2: the kit chip (was the grey ra-chip) */).join('') : '<p class="k-none">No Pokémon matches that.</p>'}</div>` : ''}</div>`;
  const yours = p && team.length ? `<section class="st-team"><h2 class="lo-lab"><span class="u">Your team</span> <small>tap one to see its loadout</small></h2>${(innerWidth < 700 && team.length > 3 ? [team.slice(0, 3), team.slice(3)] : [team]).map(r => V2.stBench(r.map(m => V2.stFig(m.p, '', m.p.n === p.n)), 'st-six')).join('')}</section>` : '';
  const ctl = `<div class="lo-ctl">${sent}<div class="lo-pick">${find}${yours}</div></div>`;
  const top = `<div class="gs-top">${head}${tabs}</div>`;
  if (!p) return `<div class="ra gsp us st lo">${top}<div class="gs-body">${ctl}<p class="tm-sub">Look up a Pokémon to see its popular sets.</p></div></div>`;
  const mine = team.find(m => m.p.n === p.n), t = S2.t, set = hasSet(t);
  // the left of the panel: the card (its tag on the ink chip), the types (symbol + word), the tier and rating, the three facts
  const x = lairRows().find(y => y.p.n === p.n), N = V2.raNums(p), k = lairRank(p), stA = V2.addState(p.n), T = x ? lTier(x.r.total) : null;
  const tag = mine ? 'On your team' : k ? `#${k.rank} rated` : 'Looked up';
  const id = `<div class="lo-id"><div class="lo-card">${V2.kCard(p.n, {mine: tag})}</div><div class="lo-idt"><div class="ra-ty">${p.t.map(V2.typeChip).join('')}</div>
      ${T ? `<p class="gs-big"><b class="u">${RS(x.r.total)}</b><span><i class="u tier-tag" style="--tc:var(--tier-${T.k.toLowerCase()})">${T.k} tier</i><small class="st-pill">Rated ${RS(x.r.total)}${k ? `, #${k.rank} of ${k.of}` : ''}</small></span></p>` : ''}</div>
      <div class="gs-facts">${V2.gsShare(N.u != null ? V2.raPct(N.u) : null, 'tournament')}<p><span>Win rate</span><b class="u">${N.w != null ? E(winFmt(N.w)) : '–'}</b></p><p><span>Base Speed</span><b class="u">${p.st[5]}</b></p></div></div>`;
  // the right of the panel: Item / Ability / Nature, the moves, your own set, the one pink move
  const stone = p.m && t && t.it && t.it.length ? t.it[0][0] : null, mAb = p.m && p.a && p.a[0];
  const nums = (t && t.na || []).length && (t.na || []).every(y => y[1] == null);
  const kv = set ? `<div class="st-side lo-kv">${V2.loVal('Item', t.it, 4, stone ? `<small>Always</small> ${E(stone)}` : '')}${V2.loVal('Ability', t.ab, 3, mAb ? `<small>Always</small> ${E(p.a[0])}` : '') /* player review 4c (Nov 17): tournament sheets list the base form's Ability for Megas (Blaze 84% on Mega Charizard Y) */}${V2.loVal('Nature', t.na, 3, '')}${nums ? `<p class="fine st-nonum">No usage numbers in this source for natures and teammates: Online tournaments and Showdown ladder have them.</p>` : ''}</div>` : '';
  const mv = set ? (t.mv || []).slice(0, 8) : [], four = set ? mv.slice(0, 4) : [], also = set ? mv.slice(4) : [];
  const moves = set && four.length ? `<div class="lo-mv"><p class="lo-vl">Moves</p>${V2.kMoves(four.map(([n, v]) => [n, V2.loPct(v)]))}${also.length ? `<p class="lo-also">Also run: ${also.map(([n, v]) => `<b>${E(n)}</b>${v != null ? ' ' + V2.loPct(v) : ''}`).join(' · ')}</p>` : ''}</div>` : '';
  const your = mine ? `<p class="st-mine">Your ${E(mine.d)}: ${E(mine.ability)}${mine.item ? ` @ <b>${E(mine.item)}</b>${mine.heldItem ? ' (your pick)' : ''}` : ''} · ${mine.moves.filter(Boolean).map(y => E(y.name)).join(', ')}${mine.custom ? ' (your moves)' : ''}</p>` : '';
  const go = `<div class="lo-acts">${stA === 'ok' ? V2.kGo('ADD TO MY TEAM.', {'data-v2add': p.n, 'aria-label': `Add ${p.d} to My Team`}) : V2.kGo('BUILD AROUND IT.', {'data-hmaround': p.n, 'aria-label': `Build around ${p.d}`})}</div>`;
  const side = `<div class="lo-set">${set ? kv + moves : `<p class="lo-none">Not among the top Pokémon in this list. "Best data" covers every Pokémon.</p>`}${your}${go}</div>`;
  const hero = `<div class="gs-spot ra-spot lo-hero">${id}${side}</div>`;
  const tune = V2.stSpreads(p);
  const tm = (t && t.tm || []).slice(0, 6).filter(([n]) => byName.get(n));
  const mates = tm.length ? `<div class="us-mates lo-mates">${V2.kRoster(tm.map(([n, v]) => { const qq = byName.get(n); return V2.kCard(n, {size: 'small', fact: v != null ? `${Math.round(+v)}% of its teams` : '', attrs: {'data-v2setmon': n, 'aria-label': `${qq.d}${v != null ? `, on ${Math.round(+v)}% of its teams` : ''}: show its loadout`}}); }))}</div>` : '';
  const plan = V2.kPlan(`<section class="k-step st-how"><span class="k-n" aria-hidden="true">1</span><div class="k-sec"><h2 class="k-h2 u">The loadout.</h2><span class="k-note">what strong players run on it</span><button type="button" class="k-link lo-pg" data-v2mon="${E(p.n)}">Pokémon Page&nbsp;›</button></div>${hero}</section>`
    + (tune ? V2.kStep(2, 'The fine-tuning.', 'stat points, most used first', tune) : '')
    + (mates ? V2.kStep(tune ? 3 : 2, 'Usually alongside.', 'tap one for its loadout', mates) : '')
    + (S2.note ? `<p class="fine st-note">${S2.note}</p>` : ''));
  return `<div class="ra gsp us st lo">${top}<div class="gs-body">${ctl}${plan}</div></div>`; }};

document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-stq]'); if (!i) return; V2.stUi.q = i.value; const at = i.selectionStart; V2.redraw();
  const n = document.querySelector('[data-stq]'); if (n) { n.focus(); try { n.setSelectionRange(at, at); } catch (x) {} } });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-stfind]'); if (!b) return; const i = document.querySelector('[data-stq]'); if (!i) return; i.scrollIntoView({behavior: V2.smooth(), block: 'center'}); i.focus({preventScroll: true}); });
document.addEventListener('keydown', e => { const i = e.target.closest && e.target.closest('[data-stq]'); if (!i || e.key !== 'Enter') return; const b = document.querySelector('.st-hits [data-v2setmon]'); if (b) b.click(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2setmon],[data-v2setsrc]'); if (!b) return; const d = b.dataset;
  if (d.v2setmon && byName.get(d.v2setmon)) { ui.setMon = d.v2setmon; try { LS.set('cc2.setMon', d.v2setmon); } catch (x) {} V2.stUi.q = ''; }
  else if (d.v2setsrc && SET_SRC[d.v2setsrc]) { ui.setSrc = d.v2setsrc; try { LS.set('cc2.setSrc', d.v2setsrc); } catch (x) {} }
  V2.redraw(); if (d.v2setmon) { const h = document.querySelector('.st-how'); if (h && b.closest('.us-mates, .st-hits')) h.scrollIntoView({behavior: V2.smooth(), block: 'start'}); } });
(() => { const band = () => innerWidth >= 700 ? 1 : 0; let b = band(), tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { if (band() === b) return; b = band(); if (document.querySelector('.st')) V2.redraw(); }, 150); }); })();
