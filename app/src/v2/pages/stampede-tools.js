// ---------- Home, The Stampede: the tools band (see stampede.js and docs/rebuild/stampede/BRIEF.md) ----------
// V2.sdTools = () => html; optional V2.sdToolsAfter = () => {} runs after the page is drawn.
// "Same herd. Twelve tools." (brief section 3): twelve plates of different sizes, every row full, each a link to its tool. The
// whole plate opens the tool (its title is the link, stretched over the plate); a Pokémon that is named is its own button
// (data-v2mon), on top of the link. Every number and name is live data:
//   Speed Tiers   the highest rated (V2.sdData's order = Ratings' order), slowest to fastest by base Speed (9 / 7 / 4 by width)
//   Type Chart    each type's highest-rated Pokémon (a Pokémon with two types can stand under both flags: it is the top of both)
//   Ratings       the top three with their shown ratings (RS), the count as the Ratings page says it (lairRows: "N Pokémon rated")
//   Winning Teams homeChamp(): the latest winner's six, event, date, players, record; Load Team (Replace / Cancel) and Copy for
//                 Showdown are today's Home buttons (data-hmload / data-hmcopy, HOME-09)
//   Damage Calc   the site's calc (bestHitOn with the most used moves and spreads) of the #1 rated into the #2 rated
//   Winning Cores the first pair on Winning Cores as it opens (pairs, Top Rated: coreRows)
//   Archetypes    the two biggest styles on the Archetypes page (V2.arData), each with its first key Pokémon (guideKeyMons)
//   Popular Sets  the top-rated Pokémon without a Mega stone and its most held item, Best data (setFor, as Popular Sets opens)
//   Events        the count the Events page shows ("events", META.events) and the next event from its calendar
//   How We Calc.  the count the How We Calculate page shows ("tournament teams", RES.teams)
// Illustrations with no figure: Battle (your first two, or the top two rated, vs the latest winner's first two). Team Preview Practice
// shows the latest winner's six as a team preview (live), with "Pick 4". Words new to the site wait on Sim (brief: "Wording that is new").
V2.SDT_TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
V2.SDT_WXTY = {tw: 'Flying', sun: 'Fire', rain: 'Water', sand: 'Ground', snow: 'Ice', grassy: 'Grass', psy: 'Psychic', tr: 'Ghost', elec: 'Electric'}; // as the Archetypes page's scenes
// the twelve tools: name, page (the same hashes as today's Home list V2.HOME_TOOLS and the menu)
V2.SDT_GO = {'Speed Tiers': 'speed', 'Type Chart': 'types', Ratings: 'meta', 'Winning Teams': 'tournaments', Battle: 'battle', 'Damage Calc': 'calc',
  'Winning Cores': 'build', Archetypes: 'archetypes', 'Team Preview Practice': 'practice', 'Popular Sets': 'sets', Events: 'events', 'How We Calculate': 'method'};
// Sim, Nov 18: "team preview practice should get one of the big tabs. its such a fun and interesting concept." Practice takes Test Run's
// plate; Test Run joins More tools (every tool stays one tap away)
// cached per ratings map, as V2.sdData (review, Nov 18): the same sdData object (it changes when ratings() does) and the same day (the
// next event) give the same plates, so a redraw doesn't run coreRows, bestHitOn, setFor and arData again
V2._sdt = V2._sdt || {};
V2.sdtData = () => { const D = V2.sdData(), day = typeof CAL !== 'undefined' ? CAL.today() : '', ver = typeof metaVersion !== 'undefined' ? metaVersion : '', K = V2._sdt;
  if (K.out && K.D === D && K.day === day && K.ver === ver && K.cal === META.calendar) return K.out;
  const rows = D.rows || [], top = rows.slice(0, 9), out = {D, rows}; V2._sdt = {D, day, ver, cal: META.calendar, out};
  out.race = top.map((x, i) => ({...x, k: i + 1})).filter(x => x.spe != null).sort((a, b) => a.spe - b.spe || a.k - b.k);
  out.types = V2.SDT_TYPES.map(t => ({t, x: rows.find(y => y.types.includes(t)) || null})); // the true highest rated: a two-type Pokémon stands under both flags (lead, Nov 18)
  try { out.all = lairRows().length; } catch (e) { out.all = D.rated; }
  try { const keep = Object.assign({}, coreUi); Object.assign(coreUi, {kind: 'pairs', sort: 'win', mon: null}); try { out.core = coreRows()[0] || null; } finally { Object.assign(coreUi, keep); } } catch (e) { out.core = null; }
  try { const A = V2.arData(); out.arch = A ? A.rows.filter(x => x.c > 0).slice(0, 2).map(x => ({...x, ty: V2.SDT_WXTY[x.k] || 'Normal', mon: (guideKeyMons(x.k) || [])[0] || null})) : []; } catch (e) { out.arch = []; }
  try { const x = rows.find(y => !y.mega), st = x && setFor(x.p, 'doubles', 'ingame'); out.set = x && st && st.it && st.it[0] ? {x, item: st.it[0][0]} : null; } catch (e) { out.set = null; }
  try { const a = rows[0] && rows[0].p, d = rows[1] && rows[1].p, h = a && d ? bestHitOn(a, popularMoves(a), d, null, null) : null;
    out.hit = h && h.r && h.r.hp && h.r.max > 0 ? {a, d, mv: h.mv.name, lo: Math.min(100, 100 * h.r.min / h.r.hp), hi: Math.min(100, 100 * h.r.max / h.r.hp)} : null; } catch (e) { out.hit = null; }
  try { const n = V2.dpNext()[0]; /* the Events page's upcoming list and the shared short name (V2.evShort), as the Dispatch */
    if (n) out.next = {short: V2.evShort(n), place: n.t === 'online' ? '' : (n.city && n.city !== n.n ? n.city : ''), when: CAL.range(n)}; } catch (e) {}
  return out; };
// a named Pokémon: its own button over the plate's link (opens its info, as everywhere); o.iw <= 80 asks for the small sprite file
// a shared rank, as the Ratings page counts it (ties on the shown rating share a rank: 1, 1, 3, 3)
V2.sdtRank = (rows, i) => 1 + rows.filter(y => y.r > rows[i].r).length;
V2.sdtMon = (n, o = {}) => { const E = V2.esc, d = V2.disp(n);
  return `<button type="button" class="sdt-m${o.cls ? ' ' + o.cls : ''}" data-v2mon="${E(n)}" aria-label="${E(d)}${o.say ? ', ' + E(o.say) : ''}: open its info">${o.pre || ''}${V2.mon(n, {bare: true, iw: o.iw})}${o.name === false ? '' : `<b class="sdt-mn">${V2.keepForm(E(d))}</b>`}${o.sub || ''}</button>`; };
// a picture only (Archetypes, Test Run): no name, no figure, hidden from screen readers
V2.sdtArt = (n, cls) => `<span class="sdt-art${cls ? ' ' + cls : ''}" aria-hidden="true">${V2.mon(n, {bare: true})}</span>`;
// one plate: the title is the link that covers the plate; long words on wider screens, short ones on phones (brief)
V2.sdtPlate = (name, cls, long, short, body, more) => { const E = V2.esc;
  return `<article class="sdt-p ${cls}"><div class="sdt-tx"><h3 class="u sdt-t"><a class="sdt-go" href="#${V2.SDT_GO[name]}" data-sdtool="${E(name)}"${name === 'Winning Cores' ? ' data-hmcores' : ''}>${E(name)}</a></h3>
    <p class="sdt-d"><span class="sdt-l">${long}</span><span class="sdt-s">${short}</span></p>${more || ''}</div>${body}</article>`; };
V2.sdTools = () => { const E = V2.esc, X = V2.sdtData(), R = X.rows, num = n => homeNum(n), nm = n => V2.keepForm(E(V2.disp(n)));
  // Speed Tiers: the race, slowest to fastest; data-k is the rating rank, so narrower screens keep the top 7 or 4 (CSS)
  const race = `<div class="sdt-race">${X.race.map(x => `<button type="button" class="sdt-m sdt-run" data-k="${x.k}" data-v2mon="${E(x.n)}" aria-label="${E(V2.disp(x.n))}, base Speed ${x.spe}: open its info">${V2.mon(x.n, {bare: true})}<b class="u sdt-spe">${x.spe}</b><b class="sdt-mn">${nm(x.n)}</b></button>`).join('')}</div>`;
  const speed = V2.sdtPlate('Speed Tiers', 'sdt-speed', 'See who moves first: the highest rated, slowest to fastest by base Speed.', 'See who moves first.', race);
  // Type Chart: the 18 flags in their type colours, three across, on a plate as small as Ratings (Sim, Nov 18: A; the Pokémon under
  // each flag made it the biggest plate on Home). Phones and iPads show it as a chip instead
  const tc = `<ul class="sdt-types">${X.types.map(({t}) => `<li style="--ty:var(--ty-${t})"><span class="sdt-flag"><span>${t}</span></span></li>`).join('')}</ul>`;
  const types = V2.sdtPlate('Type Chart', 'sdt-tc', 'What your six resists, and what hits it.', 'What your six resists.', tc);
  // Ratings: the podium (#2, #1, #3)
  const pod = R.length >= 3 ? `<div class="sdt-pod">${[[R[1], V2.sdtRank(R, 1)], [R[0], 1], [R[2], V2.sdtRank(R, 2)]].map(([x, k]) => `<button type="button" class="sdt-m sdt-step s${k}" data-v2mon="${E(x.n)}" aria-label="${E(V2.disp(x.n))}, rated ${x.r}, number ${k}: open its info">${V2.mon(x.n, {bare: true})}<span class="sdt-blk"><b class="u">${x.r}</b><span>${nm(x.n)}</span></span></button>`).join('')}</div>` : '';
  const ratings = V2.sdtPlate('Ratings', 'sdt-ra sdt-ink', `All ${num(X.all)} Pokémon, rated out of 100.`, `All ${num(X.all)}, out of 100.`, pod);
  // Winning Teams: the latest winner's six, with today's Load Team (asks first when you have a team) and Copy for Showdown
  const C = X.D.champ; let wins = '';
  if (C) { const ev = C.ev, t = C.t, key = ev.id + '#' + ev.top.indexOf(t), wl = (String(t.record || '').match(/\b(\d+-\d+(?:-\d+)?)\b/) || [])[1] || '', title = V2.evTitle(ev.name), sure = V2.hmUi && V2.hmUi.sure === key;
    const say = `This six won ${E(title)} on ${E(evDate(ev.date))}${ev.players ? `: ${num(ev.players)} players` : ''}${wl ? `, ${E(wl)}` : ''}.`;
    const six = `<div class="sdt-six">${C.six.map(x => V2.sdtMon(x.p.n, {iw: 80, say: x.it ? 'holds ' + x.it : ''})).join('')}</div><p class="sdt-cap">Won ${E(title)}${wl ? ', ' + E(wl) : ''}</p>`;
    const acts = sure ? V2.hmSure(key) : `<p class="sdt-acts"><button type="button" class="np-link" data-hmload="${E(key)}">Load Team ›</button><button type="button" class="np-link" data-hmcopy="${E(key)}">Copy for Showdown</button></p>`;
    wins = V2.sdtPlate('Winning Teams', 'sdt-wt', `Every top-cut team, ready to load. ${say}`, 'Every top-cut team, ready to load.', `<div class="sdt-pic">${six}</div>`, acts); }
  else wins = V2.sdtPlate('Winning Teams', 'sdt-wt', 'Every top-cut team, ready to load.', 'Every top-cut team, ready to load.', '');
  // Battle: an illustration (your first two, or the top two rated, across a VS from the latest winner's first two)
  const ms = typeof members === 'function' ? members() : [], mine = (ms.length >= 2 ? ms.slice(0, 2).map(m => m.p.n) : R.slice(0, 2).map(x => x.n)), theirs = C ? C.six.slice(0, 2).map(x => x.p.n) : R.slice(2, 4).map(x => x.n);
  const vs = `<div class="sdt-vs"><div class="sdt-side you">${mine.map(n => V2.sdtMon(n, {say: ms.length >= 2 ? 'on your team' : ''})).join('')}</div><b class="u sdt-vsw" aria-hidden="true">VS</b><div class="sdt-side them">${theirs.map(n => V2.sdtMon(n, {say: C ? "on the latest winner's team" : ''})).join('')}</div></div>`;
  const battle = V2.sdtPlate('Battle', 'sdt-bt sdt-ink', 'Scout their six and get a turn 1 plan.', 'Scout their six, get a turn 1 plan.', vs);
  // Damage Calc: the site's own calc of the #1 rated's best hit on the #2 rated, as a health bar (HP left / could be lost / lost)
  const H = X.hit, hp = H ? `<div class="sdt-hit"><p class="sdt-hp" role="img" aria-label="${E(H.mv)} takes ${dmgP(H.lo)} to ${dmgP(H.hi)}% of ${E(V2.disp(H.d.n))}'s HP"><i class="left" style="width:${(100 - H.hi).toFixed(1)}%"></i><i class="roll" style="width:${(H.hi - H.lo).toFixed(1)}%"></i></p>
    <p class="sdt-hpw" aria-hidden="true"><b>${E(H.mv)}</b> ${dmgP(H.lo)}–${dmgP(H.hi)}%</p><div class="sdt-duel">${V2.sdtMon(H.a.n, {cls: 'atk'})}<i class="sdt-strike" aria-hidden="true"></i>${V2.sdtMon(H.d.n, {cls: 'def'})}</div><p class="sdt-cc" aria-hidden="true">${nm(H.a.n)} into ${nm(H.d.n)}</p></div>` : '';
  const calc = V2.sdtPlate('Damage Calc', 'sdt-dc', 'Run the damage first.', 'Run the damage first.', hp);
  // the four small plates, each picture breaking out of the top
  const K = X.core, core = K ? `<div class="sdt-pic"><div class="sdt-core">${V2.sdtMon(K.ns[0], {})}<b class="u sdt-plus" aria-hidden="true">+</b>${V2.sdtMon(K.ns[1], {})}</div><p class="sdt-cc" aria-hidden="true">${nm(K.ns[0])} + ${nm(K.ns[1])}</p></div>` : '';
  const cores = V2.sdtPlate('Winning Cores', 'sdt-sm', 'Pairs that keep winning together.', 'Pairs that win.', core);
  const A = X.arch, arch = V2.sdtPlate('Archetypes', 'sdt-sm', A.length >= 2 ? `${E(A[0].name)}, ${E(A[1].name)} and the other ways teams win.` : 'The ways teams win right now.', A.length >= 2 ? `${E(A[0].name)}, ${E(A[1].name)} and more.` : 'How teams win.',
    A.length ? `<div class="sdt-wx">${A.map(a => `<span class="sdt-wxi">${a.mon ? V2.sdtArt(a.mon.n) : ''}<span class="sdt-chip" style="--ty:var(--ty-${a.ty})">${E(a.name)}</span></span>`).join('')}</div>` : '');
  // Team Preview Practice: a team preview, two rows of three (the latest winner's six, live; the top six rated without one), "Pick 4"
  const pv = (C ? C.six.map(x => x.p.n) : R.slice(0, 6).map(x => x.n)).slice(0, 6);
  const pp = pv.length === 6 ? `<div class="sdt-pp" aria-hidden="true"><span class="sdt-pp6">${pv.map(n => V2.sdtArt(n)).join('')}</span><span class="u sdt-pick">Pick 4</span></div>` : '';
  const prac = V2.sdtPlate('Team Preview Practice', 'sdt-sm sdt-ink sdt-pr', 'Practice picking your four at team preview.', 'Practice picking your four.', pp);
  const S2 = X.set, set = S2 ? `<div class="sdt-set">${V2.sdtMon(S2.x.n, {name: false, say: 'most held item ' + S2.item, sub: `<span class="sdt-si"><b class="sdt-mn">${nm(S2.x.n)}</b><span class="sdt-item">${E(S2.item)}</span></span>`})}</div>` : '';
  const sets = V2.sdtPlate('Popular Sets', 'sdt-sm', 'The items and moves top players run.', 'Items and moves.', set);
  // Events and How We Calculate: two mirrored blocks with the big numbers at the outer edges
  const evN = X.D.events, nx = X.next, nxt = nx ? `Next: ${E(nx.short)}${nx.place ? ', ' + E(nx.place) : ''}, ${E(nx.when)}.` : '';
  const tail = (name, cls, n, unit, long, short) => `<article class="sdt-p sdt-end ${cls}">${n ? `<p class="sdt-big"><b class="u">${num(n)}</b><small>${unit}</small></p>` : ''}<div class="sdt-tx"><h3 class="u sdt-t"><a class="sdt-go" href="#${V2.SDT_GO[name]}" data-sdtool="${E(name)}">${E(name)}</a></h3><p class="sdt-d"><span class="sdt-l">${long}</span><span class="sdt-s">${short}</span></p></div></article>`;
  const ends = `<div class="sdt-ends">${tail('Events', 'ev', evN, 'events', `Recent tournaments and who won them.${nxt ? ' ' + nxt : ''}`, nx ? `Next: ${E(nx.short)}, ${E(nx.when)}.` : 'Recent tournaments.')}${tail('How We Calculate', 'hw', X.D.teams, 'tournament teams', 'Every number on NastyPlot is built from them. See how each one is worked out.', 'Where every number comes from.')}</div>`;
  // Shorter phone Home, Tools B (Sim, Nov 18; docs/rebuild/short-home-options.md): under 700 six big plates stay (Speed Tiers, Ratings,
  // Damage Calc, Battle, Team Preview Practice, Winning Teams) and the other six become picture chips, two by three, each a link to its
  // page with its name and a small live picture (CSS shows these only on phones; the plates they stand for are hidden there)
  const art = n => n ? `<span class="sdt-cpic" aria-hidden="true">${V2.mon(n, {bare: true, iw: 40})}</span>` : '';
  const flags = `<span class="sdt-cpic sdt-cty" aria-hidden="true">${['Fire', 'Water', 'Grass', 'Electric', 'Dragon', 'Fairy'].map(t => `<i style="--ty:var(--ty-${t})"></i>`).join('')}</span>`;
  const chip = (name, pic) => `<li><a class="sdt-chp" href="#${V2.SDT_GO[name]}" data-sdtool="${E(name)}">${pic}<b>${E(name)}</b></a></li>`;
  const bigN = n => n ? `<span class="sdt-cpic" aria-hidden="true"><b class="u">${num(n)}</b></span>` : '';
  const chips = `<nav class="sdt-chips" aria-label="More of the twelve tools"><ul>${chip('Type Chart', flags)}${chip('Winning Cores', K ? art(K.ns[0]) : '')}${chip('Archetypes', A.length && A[0].mon ? art(A[0].mon.n) : '')}${chip('Popular Sets', S2 ? art(S2.x.n) : '')}${chip('Events', bigN(evN))}${chip('How We Calculate', bigN(X.D.teams))}</ul></nav>`;
  // More tools (lead, Nov 18): today's Home links 18 tools; the six without a plate stay one tap away as quiet text links
  const more = (V2.HOME_TOOLS || []).filter(([n]) => !V2.SDT_GO[n]), moreH = more.length ? `<nav class="sdt-more" aria-label="More tools"><h3 class="sdt-mh">More tools</h3><ul>${more.map(([n, d, to]) => `<li><a class="np-link" href="#${to}" data-sdtool="${E(n)}" title="${E(d)}">${E(n).replace(/ (\S+)$/, '\u00a0$1')}\u00a0<span aria-hidden="true">›</span></a></li>`).join('')}</ul></nav>` : '';
  return `<section class="sd-band sd-tools sdt" aria-labelledby="sdt-h"><h2 class="u sdt-h" id="sdt-h">Same herd. <span>Twelve tools.</span></h2>
    <div class="sdt-grid">${speed}${types}${ratings}${calc}${wins}${battle}${cores}${arch}${prac}${sets}</div>${ends}${chips}${moreH}</section>`; };
// names in tight spots (Type Chart, the six, Battle, the race): a name's longest word never spills out of its spot or breaks
// mid-word; it steps to the approved narrower letters (88%, then 75%, as Home's most-used names do), then breaks with a hyphen
V2.sdtFit = () => { document.querySelectorAll('.sdt .sdt-mn').forEach(b => { b.style.fontStretch = ''; b.style.hyphens = ''; if (!b.getClientRects().length) return;
  const box = b.parentElement.getBoundingClientRect(), over = () => { const rg = document.createRange(); rg.selectNodeContents(b); return [...rg.getClientRects()].some(r => r.width && (r.left < box.left - 0.5 || r.right > box.right + 0.5)); };
  for (const st of ['88%', '75%']) { if (!over()) return; b.style.fontStretch = st; } if (over()) b.style.hyphens = 'auto'; }); };
V2.sdToolsAfter = () => { V2.sdtFit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (V2.route() === 'home') V2.sdtFit(); }); };
addEventListener('resize', () => { if (V2.route && V2.route() === 'home') requestAnimationFrame(V2.sdtFit); });
