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
V2.sdtPctTxt = (lo, hi) => String(lo) === String(hi) ? `${hi}%` : `${lo}–${hi}%`;
V2.sdtPctCls = t => t.length >= 7 ? ' sdt-pct3' : t.length === 6 ? ' sdt-pct2' : '';
V2.SDT_TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
V2.SDT_WXTY = {tw: 'Flying', sun: 'Fire', rain: 'Water', sand: 'Ground', snow: 'Ice', grassy: 'Grass', psy: 'Psychic', tr: 'Ghost', elec: 'Electric'}; // as the Archetypes page's scenes
// the twelve tools: name, page (the same hashes as today's Home list V2.HOME_TOOLS and the menu)
V2.SDT_GO = {'Speed Tiers': 'speed', 'Type Chart': 'types', Ratings: 'meta', 'Winning Teams': 'tournaments', Battle: 'battle', 'Damage Calculator': 'calc',
  'Winning Cores': 'build', Archetypes: 'archetypes', 'Team Preview Practice': 'practice', 'Popular Sets': 'sets', Events: 'events', 'How We Calculate': 'method'};
// Sim, Nov 18: "team preview practice should get one of the big tabs. its such a fun and interesting concept." Practice takes Test Run's
// plate; Test Run joins More tools (every tool stays one tap away)
// cached per ratings map, as V2.sdData (review, Nov 18): the same sdData object (it changes when ratings() does) and the same day (the
// next event) give the same plates, so a redraw doesn't run coreRows, bestHitOn, setFor and arData again
V2._sdt = V2._sdt || {};
/* pl-2c (Nov 19): when today's numbers arrive, these plates are worked out as their own step before Home is drawn (V2.warmDraw, shell.js);
   the draw then reads them from this cache, so Home's draw is two shorter tasks, not one */
V2.pages.home.warm = [() => { if (V2.STAMPEDE) V2.sdtData(); }];
V2.sdtData = () => { const D = V2.sdData(), day = typeof CAL !== 'undefined' ? CAL.today() : '', ver = typeof metaVersion !== 'undefined' ? metaVersion : '', K = V2._sdt;
  if (K.out && K.D === D && K.day === day && K.ver === ver && K.cal === META.calendar) return K.out;
  const rows = D.rows || [], top = rows.slice(0, 9), out = {D, rows}; V2._sdt = {D, day, ver, cal: META.calendar, out};
  out.race = top.map((x, i) => ({...x, k: i + 1})).filter(x => x.spe != null).sort((a, b) => a.spe - b.spe || a.k - b.k);
  out.types = V2.SDT_TYPES.map(t => ({t, x: rows.find(y => y.types.includes(t)) || null})); // the true highest rated: a two-type Pokémon stands under both flags (lead, Nov 18)
  try { out.all = V2.ratedRows().length; /* Not rated yet (Nov 25): only the rated count */ } catch (e) { out.all = D.rated; }
  try { const keep = Object.assign({}, coreUi); Object.assign(coreUi, {kind: 'pairs', sort: 'win', mon: null}); try { out.core = coreRows()[0] || null; } finally { Object.assign(coreUi, keep); } } catch (e) { out.core = null; }
  try { const A = V2.arData(); out.arch = A ? A.rows.filter(x => x.c > 0).slice(0, 2).map(x => ({...x, ty: V2.SDT_WXTY[x.k] || 'Normal', mon: (guideKeyMons(x.k) || [])[0] || null})) : []; } catch (e) { out.arch = []; }
  try { const x = rows.find(y => !y.mega), st = x && setFor(x.p, 'doubles', 'ingame'); out.set = x && st && st.it && st.it[0] ? {x, item: st.it[0][0]} : null; } catch (e) { out.set = null; }
  try { const a = rows[0] && rows[0].p, d = rows[1] && rows[1].p, h = a && d ? bestHitOn(a, popularMoves(a), d, null, null) : null;
    out.hit = h && h.r && h.r.hp && h.r.max > 0 ? {a, d, mv: h.mv.name, lo: Math.min(100, 100 * h.r.min / h.r.hp), hi: Math.min(100, 100 * h.r.max / h.r.hp)} : null; } catch (e) { out.hit = null; }
  try { const n = V2.dpNext()[0]; /* the Events page's upcoming list and the shared short name (V2.evShort), as the Dispatch */
    if (n) out.next = {short: V2.evShort(n), place: n.t === 'online' ? '' : (n.city && n.city !== n.n ? n.city : ''), when: CAL.range(n)}; } catch (e) {}
  return out; };
// a named Pokémon: its own button over the plate's link (opens its info, as everywhere); o.iw <= 80 asks for the small sprite file
// the rank, as the Ratings page counts it (Sim, Nov 25: one rank each, ties broken by the full rating, so the podium reads 2, 1, 3);
// the shown-rating count is only the fallback when the rank can't be read
V2.sdtRank = (rows, i) => { try { const k = lairRank(byName.get(rows[i].n)); if (k) return k.rank; } catch (e) {} return 1 + rows.filter(y => y.r > rows[i].r).length; };
V2.sdtMon = (n, o = {}) => { const E = V2.esc, d = V2.disp(n);
  return `<button type="button" class="sdt-m${o.cls ? ' ' + o.cls : ''}" data-v2mon="${E(n)}" aria-label="${E(d)}${o.say ? ', ' + E(o.say) : ''}: open its info">${o.pre || ''}${V2.mon(n, {bare: true, iw: o.iw})}${o.name === false ? '' : `<b class="sdt-mn">${V2.keepForm(E(d))}</b>`}${o.sub || ''}</button>`; };
// a picture only (Archetypes, Test Run): no name, no figure, hidden from screen readers
V2.sdtArt = (n, cls) => `<span class="sdt-art${cls ? ' ' + cls : ''}" aria-hidden="true">${V2.mon(n, {bare: true})}</span>`;
// one plate: the title is the link that covers the plate; long words on wider screens, short ones on phones (brief)
V2.sdtPlate = (name, cls, long, short, body, more) => { const E = V2.esc;
  return `<article class="sdt-p ${cls}"><div class="sdt-tx"><h3 class="u sdt-t"><a class="sdt-go" href="#${V2.SDT_GO[name]}" data-sdtool="${E(name)}"${name === 'Winning Cores' ? ' data-hmcores' : ''}>${E(name)}</a></h3>
    <p class="sdt-d"><span class="sdt-l">${long}</span><span class="sdt-s">${short}</span></p>${more || ''}</div>${body}</article>`; };
// Home tools redesign (helper proposal, Nov 28; Sim: the tools section "is very rough", "our button designs are terrible").
// One model for the twelve tools (V2.sdtModel), drawn by one look (V2.SDT_LOOK). Every tile is one link (its title, stretched over the
// tile); a named Pokémon is its own button on top (data-v2mon). Every number is live data and carries its own plain label.
V2.sdtModel = () => { const E = V2.esc, X = V2.sdtData(), R = X.rows, num = n => homeNum(n), nm = n => V2.keepForm(E(V2.disp(n))), C = X.D.champ, T = {};
  const mon = (n, say, iw) => V2.sdtMon(n, {name: false, say, iw}), art = n => V2.sdtArt(n);
  // Damage Calculator: the site's calc of the #1 rated's best hit on the #2 rated (as before)
  const H = X.hit; if (H) { const t = V2.sdtPctTxt(dmgP(H.lo), dmgP(H.hi));
    T.calc = {name: 'Damage Calculator', fam: 'nasty', line: 'Run the damage first.', art: `${mon(H.a.n, 'attacking')}<i class="sdt-arrow" aria-hidden="true"></i>${mon(H.d.n, 'taking the hit')}`,
      num: t, numCls: V2.sdtPctCls(t), unit: `of ${nm(H.d.n)}'s HP`, key: `${nm(H.a.n)}'s ${E(H.mv)}`, bar: {lo: H.lo, hi: H.hi}, say: `${E(V2.disp(H.a.n))}'s ${E(H.mv)} takes ${dmgP(H.lo)} to ${dmgP(H.hi)}% of ${E(V2.disp(H.d.n))}'s HP`}; }
  else T.calc = {name: 'Damage Calculator', fam: 'nasty', line: 'Run the damage first.', art: ''};
  // Ratings: the top three (#2, #1, #3 as a podium), the rated count as the Ratings page says it
  const r0 = !X.all && V2.noRatings && V2.noRatings();
  T.ratings = {name: 'Ratings', fam: 'plot', line: r0 ? 'Ratings start with the first tournament results.' : `Top today: ${nm(R[0].n)}, ${R[0].r}.`, num: r0 ? '' : num(X.all), unit: 'Pokémon rated out of 100',
    art: R.length >= 3 ? [[R[1], V2.sdtRank(R, 1)], [R[0], 1], [R[2], V2.sdtRank(R, 2)]].map(([x, k]) => `<span class="sdt-pod s${k}">${mon(x.n, `rated ${x.r}, number ${k}`)}<b class="u" aria-hidden="true">${x.r}</b></span>`).join('') : ''};
  // Battle: your first two (or the top two rated) across a VS from the latest winner's first two: a picture only
  const ms = typeof members === 'function' ? members() : [], mine = ms.length >= 2 ? ms.slice(0, 2).map(m => m.p.n) : R.slice(0, 2).map(x => x.n), theirs = C ? C.six.slice(0, 2).map(x => x.p.n) : R.slice(2, 4).map(x => x.n);
  T.battle = {name: 'Battle', fam: 'nasty', line: 'Scout their six, get a turn 1 plan.', art: `<span class="sdt-side you">${mine.map(art).join('')}</span><b class="u sdt-vs" aria-hidden="true">VS</b><span class="sdt-side them">${theirs.map(art).join('')}</span>`};
  // Team Preview Practice: the latest winner's six as a team preview
  const pv = (C ? C.six.map(x => x.p.n) : R.slice(0, 6).map(x => x.n)).slice(0, 6);
  T.prac = {name: 'Team Preview Practice', fam: 'nasty', line: 'Practice picking your four.', art: pv.length === 6 ? `<span class="sdt-six6">${pv.map(art).join('')}</span>` : '', tag: 'Pick 4'};
  // Speed Tiers: the fastest of the top nine rated, by base Speed
  const f = X.race.length ? X.race[X.race.length - 1] : null;
  T.speed = {name: 'Speed Tiers', fam: 'nasty', line: f ? 'The fastest of the top 9 rated.' : 'See who moves first.', num: f ? String(f.spe) : '', unit: f ? `base Speed: ${nm(f.n)}` : '', art: f ? mon(f.n, 'base Speed ' + f.spe) : ''};
  // Type Chart: 18 types; three labelled type tags (a type colour always carries its name)
  T.types = {name: 'Type Chart', fam: 'nasty', line: 'What your six resists, and what hits it.', num: String(V2.SDT_TYPES.length), unit: 'types', art: `<span class="sdt-tys" aria-hidden="true">${['Fire', 'Water', 'Grass'].map(t => `<i style="--ty:var(--ty-${t})">${t}</i>`).join('')}</span>`};
  // Winning Teams: the latest winner's six, its event, players and record (Load Team / Copy for Showdown live on Winning Teams)
  if (C) { const ev = C.ev, t = C.t, wl = (String(t.record || '').match(/\b(\d+-\d+(?:-\d+)?)\b/) || [])[1] || '';
    T.wins = {name: 'Winning Teams', fam: 'nasty', line: `Latest: won ${E(V2.evTitle(ev.name))}${wl ? ', ' + E(wl) : ''}.`, num: ev.players ? num(ev.players) : '', unit: 'players at the latest win', art: `<span class="sdt-six6 sm">${C.six.map(x => art(x.p.n)).join('')}</span>`}; }
  else T.wins = {name: 'Winning Teams', fam: 'nasty', line: 'Every top-cut team, ready to load.', art: ''};
  // Winning Cores: the first pair on Winning Cores as it opens (Top rated); its number is the one that list shows ("% wins")
  const K = X.core; T.cores = {name: 'Winning Cores', fam: 'plot', line: K ? `${nm(K.ns[0])} + ${nm(K.ns[1])}` : 'Pairs that keep winning together.', num: K && typeof winFmt === 'function' ? winFmt(100 * K.score) : '', unit: 'wins as a pair',
    art: K ? `${mon(K.ns[0], 'in the top pair')}<b class="u sdt-plus" aria-hidden="true">+</b>${mon(K.ns[1], 'in the top pair')}` : ''};
  // Archetypes: the two biggest styles, each with its first key Pokémon
  const A = X.arch; T.arch = {name: 'Archetypes', fam: 'plot', line: A.length >= 2 ? `${E(A[0].name)}, ${E(A[1].name)} and more.` : 'The ways teams win right now.',
    art: A.map(a => `<span class="sdt-wxi">${a.mon ? art(a.mon.n) : ''}<span class="sdt-chip" style="--ty:var(--ty-${a.ty})">${E(a.name)}</span></span>`).join('')};
  // Popular Sets: the top rated without a Mega stone and its most held item
  const S2 = X.set; T.sets = {name: 'Popular Sets', fam: 'plot', line: S2 ? `${nm(S2.x.n)}'s most held item: ${E(S2.item)}.` : 'The items and moves top players run.', art: S2 ? mon(S2.x.n, 'most held item ' + S2.item) : ''};
  // Events and How We Calculate: their counts, as those pages say them
  const nx = X.next; T.events = {name: 'Events', fam: 'plot', line: nx ? `Next: ${E(nx.short)}, ${E(nx.when)}.` : 'Recent tournaments and who won them.', num: X.D.events ? num(X.D.events) : '', unit: 'events tracked', next: nx ? {short: E(nx.short), when: E(nx.when)} : null};
  T.method = {name: 'How We Calculate', fam: 'plot', line: 'Every number here is built from them.', num: X.D.teams ? num(X.D.teams) : '', unit: 'tournament teams'};
  // option D: How We Calculate prints the counts it builds on as receipt lines (live, as their pages say them); Events prints its next event
  T.method.rows = [X.all ? ['Pokémon rated', num(X.all)] : null, X.D.events ? ['events tracked', num(X.D.events)] : null].filter(Boolean);
  const more = (V2.HOME_TOOLS || []).filter(([n]) => !V2.SDT_GO[n]);
  return {T, X, more}; };
// one tile: the title is the link over the whole tile; "Open" is its visible button (the same link, drawn as the kit's go shape)
V2.sdtTile = (t, cls = '', o = {}) => { const E = V2.esc;
  const fig = t.num ? `<p class="sdt-fig"><b class="u${t.numCls || ''}">${t.num}</b><small>${t.unit}</small></p>` : '';
  const bar = t.bar ? `<p class="sdt-bar" role="img" aria-label="${t.say}"><i class="left" style="width:${(100 - t.bar.hi).toFixed(1)}%"></i><i class="roll" style="width:${(t.bar.hi - t.bar.lo).toFixed(1)}%"></i></p>` : '';
  return `<article class="sdt-tile ${cls}" data-fam="${t.fam}">${t.art ? `<div class="sdt-pic">${t.art}${t.tag ? `<span class="u sdt-tag" aria-hidden="true">${t.tag}</span>` : ''}</div>` : ''}
    <div class="sdt-tx"><h${o.h || 3} class="u sdt-t"><a class="sdt-go" href="#${V2.SDT_GO[t.name]}" data-sdtool="${E(t.name)}"${t.name === 'Winning Cores' ? ' data-hmcores' : ''}>${E(t.name)}</a></h${o.h || 3}>
    ${t.key ? `<p class="sdt-key">${t.key}</p>` : ''}${fig}${bar}<p class="sdt-d">${t.line}</p>${o.open === false ? '' : `<span class="sdt-open" aria-hidden="true"><b>Open</b><i></i></span>`}</div></article>`; };
V2.sdtMoreList = (more, cls) => { const E = V2.esc; return `<ul class="${cls}">${more.map(([n, d, to]) => `<li><a href="#${to}" data-sdtool="${E(n)}" title="${E(d)}"><span>${E(n)}</span><i aria-hidden="true"></i></a></li>`).join('')}</ul>`; };
// Option D, "Receipts that play and read": C's two jobs (Nasty pink = tools you play with, Plot blue = the meta you read; six and six)
// printed as A's receipts. Each tool is a paper slip with its name printed in the family's solid colour across the top, the picture,
// a dashed rule, the big slanted number in the family colour with its plain label, a torn bottom edge and the family's Open tab.
// Events prints its next event and How We Calculate its counts as receipt lines, where the others have Pokémon.
V2.SDT_LOOK = 'D';
V2.sdtSlip = (t, cls) => { const E = V2.esc;
  const rl = t.rows && t.rows.length ? `<ul class="sdt-rl">${t.rows.map(([a, b]) => `<li><span>${a}</span><b class="u">${b}</b></li>`).join('')}</ul><span class="sdt-stub" aria-hidden="true"><i></i><i></i><i></i></span>` : '';
  const nx = t.next ? `<p class="sdt-nx"><small>Next event</small><b class="u">${t.next.when}</b><span>${t.next.short}</span></p><span class="sdt-stub" aria-hidden="true"><b class="u">${t.next.when.replace(' ', '<br>')}</b></span>` : '';
  const pic = t.art || rl || nx ? `<div class="sdt-pic">${t.art || rl || nx}</div>` : '';
  const fig = t.num ? `<p class="sdt-fig"><b class="u${t.numCls || ''}">${t.num}</b><small>${t.unit}</small></p>` : '';
  const bar = t.bar ? `<p class="sdt-bar" role="img" aria-label="${t.say}"><i class="left" style="width:${(100 - t.bar.hi).toFixed(1)}%"></i><i class="roll" style="width:${(t.bar.hi - t.bar.lo).toFixed(1)}%"></i></p>` : '';
  return `<article class="sdt-tile ${cls}" data-fam="${t.fam}"><h4 class="u sdt-t"><a class="sdt-go" href="#${V2.SDT_GO[t.name]}" data-sdtool="${E(t.name)}"${t.name === 'Winning Cores' ? ' data-hmcores' : ''}>${E(t.name)}</a></h4>
    ${pic}<div class="sdt-tx">${fig}${bar}<p class="sdt-d">${t.line}</p></div><span class="sdt-open" aria-hidden="true"><b>Open</b><i></i></span></article>`; };
V2.sdTools = () => { const {T, X, more} = V2.sdtModel(), num = n => homeNum(n);
  const fam = (id, h, sub, keys) => `<div class="sdt-fam" data-fam="${id}"><h3 class="u sdt-fh"><span>${h}</span><small>${sub}</small></h3><div class="sdt-six">${keys.map(k => V2.sdtSlip(T[k], 'sdt-' + k)).join('')}</div></div>`;
  return `<section class="sd-band sd-tools sdt sdt-D" aria-labelledby="sdt-h"><h2 class="u sdt-h" id="sdt-h">Same herd. <span>Twelve tools.</span></h2>
    <p class="sdt-desc">Every tool uses the same ${X.all ? num(X.all) + ' ' : ''}rated Pokémon: speed, types, damage, top teams and more.</p>
    <div class="sdt-fams">${fam('nasty', 'Play', 'Plan your games', ['calc', 'battle', 'prac', 'speed', 'types', 'wins'])}${fam('plot', 'Read', 'Know the meta', ['ratings', 'arch', 'cores', 'sets', 'events', 'method'])}</div>
    <nav class="sdt-more" aria-label="More tools"><h3 class="sdt-mh">More tools</h3>${V2.sdtMoreList(more, 'sdt-ml')}</nav></section>`; };
// names in tight spots (Type Chart, the six, Battle, the race): a name's longest word never spills out of its spot or breaks
// mid-word; it steps to the approved narrower letters (88%, then 75%, as Home's most-used names do), then breaks with a hyphen
V2.sdtFit = () => { document.querySelectorAll('.sdt .sdt-mn').forEach(b => { b.style.fontStretch = ''; b.style.hyphens = ''; if (!b.getClientRects().length) return;
  const box = b.parentElement.getBoundingClientRect(), over = () => { const rg = document.createRange(); rg.selectNodeContents(b); return [...rg.getClientRects()].some(r => r.width && (r.left < box.left - 0.5 || r.right > box.right + 0.5)); };
  for (const st of ['88%', '75%']) { if (!over()) return; b.style.fontStretch = st; } if (over()) b.style.hyphens = 'auto'; }); };
V2.sdToolsAfter = () => { V2.sdtFit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (V2.route() === 'home') V2.sdtFit(); }); };
addEventListener('resize', () => { if (V2.route && V2.route() === 'home') requestAnimationFrame(V2.sdtFit); });
