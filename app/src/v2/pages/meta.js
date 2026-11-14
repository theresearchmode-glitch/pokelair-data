// ---------- Meta > Pokémon > Rating (Nov 14): "Who wins right now." ----------
// The approved mock-up (Preview gallery ratings.html; source docs/rebuild/mocks/ratings.tpl.html). Every feature of today's Ratings page
// (D-meta-shell RATE-01..09; inventory docs/rebuild/meta-features.md) is here: the kicker with teams and the data date, How ratings
// work, Track Record, search by name or type with a match count, filters (two types at most, Megas / No Megas, hidden gems, in my box,
// Clear), the top of the ratings, every Pokémon by tier with "+N more" / "Show fewer" (remembered), About the ratings (track record,
// the four numbers, sources). The numbers are today's shared logic: lairRows, lairRank, lairHead, lTier, isGem, ratingTrack.
V2.raUi = {q: '', ty: [], f: {}, types: false, all: null, open: null, spot: null};
V2.raLoad = () => { const U = V2.raUi; if (U.all == null) { let o = {}; try { o = JSON.parse(localStorage.getItem('np2.ra.board') || '{}') || {}; } catch (e) {} U.all = !!o.all; U.open = o.open || {}; U.view = o.view === 'list' ? 'list' : 'stand'; } };
V2.raSave = () => { try { localStorage.setItem('np2.ra.board', JSON.stringify({all: V2.raUi.all, open: V2.raUi.open, view: V2.raUi.view})); } catch (e) {} };
V2.raFilter = rows => { const U = V2.raUi, q = U.q.trim().toLowerCase(), f = U.f;
  return rows.filter(({p}) => (!q || p.d.toLowerCase().includes(q) || p.t.some(t => t.toLowerCase() === q)) && (!U.ty.length || U.ty.every(t => p.t.includes(t)))
    && (!f.mega || p.m) && (!f.nomega || !p.m) && (!f.gem || isGem(p)) && (!f.box || inBox(p))); };
V2.raFiltered = () => { const U = V2.raUi; return !!(U.q.trim() || U.ty.length || Object.values(U.f).some(Boolean)); };
V2.raOnTeam = p => members().some(m => m.p.n === p.n);
V2.raNums = p => { const H = lairHead(p); return {u: H.hU, w: H.hG != null && H.hG >= 30 ? H.hW : null, g: H.hG, tot: H.tot}; };
V2.raGames = g => g == null ? '' : (g >= 1000 ? (g / 1000).toFixed(1) + 'k' : String(Math.round(g))) + ' games';
const E2 = s => V2.esc(String(s));
V2.raTierHead = (T, rows) => { const n = rows.filter(y => lTier(y.r.total).k === T.k).length, of = lairRankCache.of || (lairRank(lairRows()[0] && lairRows()[0].p) || {}).of;
  return `<div class="ra-tier" data-tier="${T.k}"><b class="ra-tk" style="--tc:${T.c}">${T.k} tier</b><span>${E2(tierBand(T))} · ${E2(T.d)} · ${n} Pokémon${T.k === 'S' && of ? `, ranked among ${of} with results` : ''}</span></div>`; };
V2.raRow = x => { const E = V2.esc, p = x.p, r = x.r, k = lairRank(p), N = V2.raNums(p), unsure = r.band >= 10, gem = isGem(p), mine = V2.raOnTeam(p);
  const tag = mine ? '<span class="ra-mine"><i aria-hidden="true"></i>On your team</span>' : '';
  return `<button type="button" class="ra-row" data-v2mon="${E(p.n)}" data-raspot="${E(p.n)}" aria-label="${E(p.d)}, rated ${RS(r.total)}${k ? ', number ' + k.rank : ''}${N.u != null ? ', on ' + E(V2.raPct(N.u)) + ' of teams' : ''}${N.w != null ? ', ' + E(winFmt(N.w)) + ' wins in ' + Math.round(N.g).toLocaleString('en-US') + ' games' : ''}${mine ? ', on your team' : ''}: open its info sheet">
    <span class="ra-rk u">${k ? k.rank : '–'}</span>${V2.mon(p.n, {bare: true})}
    <span class="ra-nm"><span class="ra-nl"><b>${gem ? '<span class="ra-gem" title="Hidden gem">◆</span> ' : ''}${V2.nameHtml(p.d)}</b>${tag}</span><span class="ra-ty">${p.t.map(V2.typeChip).join('')}</span>
      <span class="ra-ph">${N.u != null ? `<b>${E(V2.raPct(N.u))}</b> on teams` : ''}${N.w != null ? ` · <b>${E(winFmt(N.w))}</b> win rate` : ''}</span></span>
    <span class="ra-bar" aria-hidden="true"><i style="width:${RS(r.total)}%"></i></span><span class="ra-sc u"${bandAt(r.total)}>${RS(r.total)}${unsure ? '<small title="Few games: an estimate">?</small>' : ''}</span>
    <span class="ra-ut">${N.u != null ? `${E(V2.raPct(N.u))}` : '–'}</span><span class="ra-wr">${N.w != null ? `<b>${E(winFmt(N.w))}</b><small>${E(V2.raGames(N.g))}</small>` : '<b>–</b><small>too few games</small>'}</span></button>`; };
V2.raPct = v => (+v).toFixed(1) + '%';
// The Grandstand (Sim's pick, Nov 14; brief docs/rebuild/mocks/meta-grandstand/BRIEF.md): every Pokémon stands on a bench in its tier,
// bigger in higher tiers. Rows per width (brief section 2): desktop up to 12 across (two rows at most, F one), iPad 6 (three rows at most), phone 4 (5 when that
// leaves no lone slot), two rows at most (Sim, Nov 14, Q1 B; D two, F one); a shorter last row is centred; more than fits = "See all N ›" (remembered).
V2.gsWeek = () => { const M = META.track && META.track.mv, o = new Map(); if (M && M.list) for (const m of M.list) { const d = RS(m.r) - RS(m.r - m.d); if (d) o.set(m.n, d); } return o; };
V2.gsLay = (n, k, open) => { const W = innerWidth, desk = W >= 1100, tab = W >= 700; let C = desk ? 12 : tab ? 6 : 4; if (!tab && [5, 9, 10].includes(n)) C = 5;
  const R = k === 'F' ? 1 : k === 'D' || !tab ? 2 : desk ? 2 : 3, /* Sim, Nov 14 (Q1 B): phones show 2 rows per tier + See all */ shown = open ? n : Math.min(n, C * R), rows = Math.max(1, Math.ceil(shown / C)); return {shown, c: Math.ceil(shown / rows)}; };
V2.gsMon = (x, wk, mrank) => { const E = V2.esc, p = x.p, r = x.r, k = lairRank(p), N = V2.raNums(p), gem = isGem(p), mine = V2.raOnTeam(p), mv = wk.get(p.n) || 0, sc = RS(r.total), T = lTier(r.total);
  const one = k && k.rank === 1 && !mrank, d = p.d.startsWith('Mega ') ? p.d.slice(5) : p.d;
  const top = mrank ? `<span class="gs-mg u">#${mrank}</span>` : p.m ? '<span class="gs-mg u">Mega</span>' : '<span class="gs-mg" aria-hidden="true">&nbsp;</span>';
  return `<button type="button" class="gs-mon${one ? ' one' : ''}" data-v2mon="${E(p.n)}" data-raspot="${E(p.n)}" style="--b1:var(--ty-${p.t[0]});--b2:var(--ty-${p.t[1] || p.t[0]})" aria-label="${E(p.d)}, rated ${sc}${k ? ', number ' + k.rank : ''}, ${T.k} tier${mrank ? ', Mega number ' + mrank : ''}${N.u != null ? ', on ' + E(V2.raPct(N.u)) + ' of teams' : ''}${N.w != null ? ', ' + E(winFmt(N.w)) + ' win rate' : ''}${mv ? (mv > 0 ? ', up ' : ', down ') + Math.abs(mv) + ' points this week' : ''}${gem ? ', hidden gem' : ''}${mine ? ', on your team' : ''}: open its info sheet">
    <span class="gs-fig" aria-hidden="true">${one ? '<span class="gs-one u" aria-hidden="true"></span>' : ''}<i class="gs-base" aria-hidden="true"></i>${V2.mon(p.n, {bare: true})}</span>
    <span class="gs-tx" aria-hidden="true">${top}<b>${gem ? '<span class="ra-gem">◆</span> ' : ''}${E(d)}</b><span class="gs-sc"><span class="u">${sc}</span>${mv ? `<small class="${mv > 0 ? 'up' : 'dn'}">${mv > 0 ? '▲' : '▼'}${Math.abs(mv)}</small>` : ''}</span>${mine ? '<i class="gs-mine"></i>' : ''}</span></button>`; };
V2.gsStand = (rows, megas) => { const U = V2.raUi, wk = V2.gsWeek(), mr = new Map(); if (megas) rows.forEach((x, i) => mr.set(x.p.n, i + 1));
  return `<div class="gs">${LTIERS.map(T => { const inT = rows.filter(x => lTier(x.r.total).k === T.k); if (!inT.length) return ''; const open = !!U.open[T.k], L = V2.gsLay(inT.length, T.k, open), shown = inT.slice(0, L.shown), out = [];
    for (let i = 0; i < shown.length; i += L.c) out.push(`<div class="gs-row" style="--c:${L.c}">${shown.slice(i, i + L.c).map(x => V2.gsMon(x, wk, megas ? mr.get(x.p.n) : 0)).join('')}</div>`);
    const more = inT.length > L.shown || open && inT.length > V2.gsLay(inT.length, T.k, false).shown;
    return `<section class="gs-step ra-tg" id="ra-t-${T.k}" data-tier="${T.k}" style="--tc:var(--tier-${T.k.toLowerCase()})"><div class="gs-blk ra-tier" data-tier="${T.k}"><span class="vh">${T.k} tier, ${E2(tierBand(T))} · ${E2(T.d)} · ${inT.length} Pokémon${T.k === 'S' ? `, ranked among ${(lairRank(lairRows()[0] && lairRows()[0].p) || {}).of || 0} with results` : ''}</span><b class="u" aria-hidden="true">${T.k}</b><span aria-hidden="true">${E2(tierBand(T))}</span><small aria-hidden="true">${inT.length} Pokémon</small></div>
      <div class="gs-main"><p class="gs-wd"><span aria-hidden="true">${E2(T.d)}</span>${more ? `<button type="button" class="np-link" data-ratier="${T.k}" aria-expanded="${open}">${open ? 'Show fewer' : `See all ${inT.length} ›`}</button>` : ''}</p>${out.join('')}</div></section>`; }).join('')}</div>`; };
// the spotlight: #1 (or the top Mega in the Megas view) by default; on a mouse screen the Pokémon under the pointer steps up here
V2.raSpot = n => { const E = V2.esc, U = V2.raUi, megas = !!U.f.mega && !V2.raFiltered2(), all = lairRows(), pool = megas ? all.filter(y => y.p.m) : all, x = pool.find(y => y.p.n === n) || all.find(y => y.p.n === n) || pool[0]; if (!x) return '';
  const p = x.p, r = x.r, T = lTier(r.total), k = lairRank(p), N = V2.raNums(p), mine = V2.raOnTeam(p), top = x === pool[0];
  const tag = top ? (megas ? 'The top Mega right now' : '#1 right now') : k ? `#${k.rank} of ${k.of}` : 'Rated';
  return `<div class="gs-spot ra-spot" style="--ta:var(--ty-${p.t[0]});--tb:var(--ty-${p.t[1] || p.t[0]})"><div class="gs-plate">${V2.mon(p.n, {bare: true})}</div>
    <div class="gs-sinfo"><p class="gs-tag u">${E(tag)}</p><h2 class="u">${V2.nameHtml(p.d)}</h2><div class="ra-ty">${p.t.map(V2.typeChip).join('')}</div>
      <p class="gs-big"><b class="u">${RS(r.total)}</b><span><i class="u">${T.k} tier</i><small>${E2(T.d)}</small></span></p>
      <div class="gs-facts"><p><span>On teams</span><b class="u">${N.u != null ? E(V2.raPct(N.u)) : '–'}</b></p><p><span>Win rate</span><b class="u">${N.w != null ? E(winFmt(N.w)) : '–'}</b></p><p><span>Base Speed</span><b class="u">${p.st[5]}</b></p></div>
      <div class="ra-acts"><button type="button" class="np-btn" data-v2mon="${E(p.n)}"><span>Open info sheet</span></button><button type="button" class="np-btn2" data-hmaround="${E(p.n)}"><span>Build around it</span></button></div>
      ${mine ? '<p class="ra-mine"><i aria-hidden="true"></i>On your team</p>' : ''}</div></div>`; };
// the stand shows everyone, the Megas view and No Megas; search, types, hidden gems and the box keep the list until Sim has seen them (brief section 7)
V2.raFiltered2 = () => { const U = V2.raUi; return !!(U.q.trim() || U.ty.length || U.f.gem || U.f.box); };

V2.pages.meta = {place: 'meta', draw() { const E = V2.esc, U = V2.raUi; V2.raLoad();
  const all = lairRows(), rows = V2.raFilter(all), filtered = V2.raFiltered(), listy = V2.raFiltered2() || U.view === 'list', pf = activePerf(), reg = ((typeof regInfo === 'function' && regInfo()) || {id: 'M-C'}).id.replace('-', '‑');
  let d = pf && pf.updated ? String(pf.updated).slice(0, 10) : ''; try { if (d) d = new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) {}
  const teams = RES && +RES.teams > 0 ? +RES.teams : 0;
  const tabs = `<div class="ra-sub"><nav class="ra-tabs" aria-label="Meta"><a href="#meta" class="on" aria-current="page">Pokémon</a><a href="#tournaments">Tournaments</a></nav>
    <nav class="ra-seg" aria-label="Pokémon views"><a href="#meta" class="on" aria-current="page">Rating</a><a href="#usage">Usage</a><a href="#sets">Sets</a></nav></div>`;
  const head = `<section class="ra-h"><p class="np-eyebrow"><span>Meta · Ratings</span></p><h1 class="u"><span>Who wins</span> <span class="pl">right now.</span></h1>
    <p class="ra-lede">Every Pokémon rated 0–100 from real tournament results, not opinion.</p>
    <p class="ra-kick">Rated 0–100 from real results: Reg ${E(reg)} doubles${teams ? `, ${E(basisNum(teams))} teams` : ''}${d ? `, <span class="ra-nw">data as of ${E(d)}${typeof V2.tip === 'function' ? V2.tip('numbers') : ''}</span>` : ''}</p>
    <p class="ra-links"><a class="np-link" href="#method">How ratings work →</a><a class="np-link" href="#track">Track Record →</a></p></section>`;
  const gems = all.filter(x => isGem(x.p)).length, f = U.f, chip = (k, l) => `<button type="button" class="ra-chip" data-raflag="${k}" aria-pressed="${!!f[k]}">${l}</button>`;
  const filt = `<div class="ra-find"><label class="np-field ra-q">${V2.ICON.search}<input type="search" data-raq value="${E(U.q)}" placeholder="Find a Pokémon or type" aria-label="Find a Pokémon or type" autocomplete="off"></label><p class="ra-count"><b class="u">${filtered ? rows.length : all.length}</b> ${filtered ? `of ${all.length} match` : 'rated'}</p></div>
    <div class="ra-filt" role="group" aria-label="Filter"><button type="button" class="ra-chip" data-raflag="all" aria-pressed="${!filtered}">All</button>${chip('mega', 'Megas')}${chip('nomega', 'No Megas')}${gems ? chip('gem', `◆ Hidden gems <small>${gems}</small>`) : ''}${chip('box', 'In my box')}
      <button type="button" class="ra-chip" data-ratypes aria-expanded="${U.types}" aria-pressed="${U.ty.length > 0}">Types <small>${U.ty.length || TYPES.length}</small></button>${filtered ? '<button type="button" class="ra-chip ra-clear" data-raflag="clear">Clear</button>' : ''}</div>
    ${U.types ? `<div class="ra-types" role="group" aria-label="Types, two at most">${TYPES.map(t => `<button type="button" class="tc-tp${U.ty.includes(t) ? ' on' : ''}" data-raty="${t}" aria-pressed="${U.ty.includes(t)}" style="--tc:var(--ty-${t})">${t}</button>`).join('')}</div>` : ''}`;
  const colh = `<div class="ra-colh" aria-hidden="true"><span>Pokémon</span><span>Rating</span><span>On teams</span><span>Win rate</span></div>`;
  const grouped = list => { let out = '', prev = null; for (const x of list) { const T = lTier(x.r.total); if (!prev || prev.k !== T.k) out += V2.raTierHead(T, filtered ? list : all); prev = T; out += V2.raRow(x); } return out; };
  const viewSw = V2.raFiltered2() ? '' : `<nav class="gs-view" aria-label="View"><button type="button" class="ra-chip" data-raview="stand" aria-pressed="${!listy}">Grandstand</button><button type="button" class="ra-chip" data-raview="list" aria-pressed="${listy}" aria-label="List with win rates"><span>List<span class="gs-vx"> with win rates</span></span></button></nav>`;
  const key = `<p class="gs-key fine" aria-hidden="true"><span><b>Big number</b> = rating</span><span><b class="gs-mg u">Mega</b> = a Mega</span><span><b class="up">▲</b><b class="dn">▼</b> moved this week</span><span><b class="ra-gem">◆</b> hidden gem</span><span><i class="gs-mine"></i> on your team</span></p>`;
  let body;
  if (!listy) body = `<div class="gs-title"><h2 class="u">${f.mega ? 'The Megas' : 'The Grandstand'}</h2>${viewSw}${key}</div>${rows.length ? V2.gsStand(rows, !!f.mega) : '<p class="tm-sub ra-none">No Pokémon match. Try clearing a filter.</p>'}`;
  else if (filtered) body = (viewSw ? `<div class="gs-title"><h2 class="u">Every match</h2>${viewSw}</div>` : '') + (rows.length ? `<div class="ra-list">${colh}${grouped(rows)}</div>` : `<p class="tm-sub ra-none">${f.box && !(S.box || []).length ? 'Your box is empty. Add the Pokémon you own on My box.' : 'No Pokémon match. Try clearing a filter.'}</p>`);
  else body = `<div class="gs-title"><h2 class="u">Every Pokémon, by tier</h2>${viewSw}</div><div class="ra-list ra-board">${colh}${LTIERS.map(T => { const inT = all.filter(x => lTier(x.r.total).k === T.k); if (!inT.length) return '';
      const cap = 12, open = U.open[T.k] || inT.length <= cap + 1, shown = open ? inT : inT.slice(0, cap);
      return `<section class="ra-tg" id="ra-t-${T.k}">${V2.raTierHead(T, all)}${shown.map(V2.raRow).join('')}${inT.length > cap + 1 ? `<button type="button" class="ra-more" data-ratier="${T.k}" aria-expanded="${!!U.open[T.k]}">${U.open[T.k] ? 'Show fewer' : `+${inT.length - cap} more`}</button>` : ''}</section>`; }).join('')}</div>`;
  const legend = `<p class="fine ra-legend">${!listy ? `${rows.length} rated` : filtered ? `${rows.length} of ${all.length} shown` : `All ${all.length} shown`}, ranked among ${(lairRank(all[0] && all[0].p) || {}).of || 0} with tournament results · ◆ hidden gem: rarely used, wins more than its use predicts${listy ? ' · ? few games, an estimate' : ''}</p>`;
  const tr = ratingTrack(), src = pf && pf.sources ? Object.entries(pf.sources).filter(([k, v]) => v && !(k === 'adj' && pf.sources.tour)).map(([, v]) => String(v)) : [];
  const about = `<details class="ra-about" data-raabout><summary><span><b>About the ratings</b><small>How they are made, the ${src.length} data sources and their track record</small></span><i aria-hidden="true">+</i></summary>
    ${tr ? `<p class="ra-track">Track record: in ${tr.events} recent events, the team with the higher average rating finished higher in ${E(pctFmt(tr.acc * 100))} of ${tr.pairs.toLocaleString('en-US')} head-to-head pairs (50% would be a coin flip). Ratings rank single Pokémon: use them to find candidates, and the scouting report to check a team.</p>` : ''}
    <div class="ra-cells"><p><b class="u">${all.length}</b><span>Pokémon rated</span></p><p><b class="u">${src.length}</b><span>data source${src.length === 1 ? '' : 's'}</span></p><p><b class="u">${all.filter(x => x.r.total >= 80).length}</b><span>in S tier</span></p><p><b class="u">${gems}</b><span>hidden gems</span></p></div>
    <p class="ra-lbl">Doubles sources${d ? ' · data from ' + E(d) : ''}</p><ul class="ra-src">${src.map(v => `<li>${E(v)}</li>`).join('')}</ul>
    <p class="ra-how">A rating says how strong a Pokémon is in the current format, proven by results. Four ingredients, each shown on every Pokémon's sheet: how often it's on teams that reach top cut at tournaments (counts most; recent and bigger events weigh more), how often strong players pick it (usage weighted by each player's skill), whether it makes top cut more or less often than its usage predicts, and its win rate. The last two are pulled toward average until there are enough games. Ratings read like school grades: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50, and the best Pokémon shows as ${RS(RATE_V3.top)}. Halving a Pokémon's presence costs about 10 points (about 5 inside S, where the top is squeezed). This mix was chosen on Oct 27 by testing ten candidate measures on later events and against five outside tier lists; only the ones that helped are in. Rarely used Pokémon that overperform get the ◆ hidden gem tag instead of jumping the tier list. Ratings are saved every day and checked later against the tournaments that came after.</p></details>`;
  return `<div class="ra gsp"><div class="gs-top">${head}<div class="ra-spotw" data-raspotw>${V2.raSpot(U.spot)}</div></div>${tabs}<div class="gs-body"><div class="gs-ctl">${filt}</div>${body}${legend}${about}</div></div>`; }};

// search, filters, see all, tiers
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-raq]'); if (!i) return; V2.raUi.q = i.value; const at = i.selectionStart; V2.redraw();
  const n = document.querySelector('[data-raq]'); if (n) { n.focus(); try { n.setSelectionRange(at, at); } catch (x) {} } });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-raflag],[data-ratypes],[data-raty],[data-raall],[data-ratier],[data-rajump],[data-raview]'); if (!b) return; const U = V2.raUi, d = b.dataset;
  if (d.raflag === 'all' || d.raflag === 'clear') { U.q = ''; U.ty = []; U.f = {}; U.types = false; }
  else if (d.raflag) { const k = d.raflag; U.f = {...U.f, [k]: !U.f[k]}; if (k === 'mega' && U.f.mega) U.f.nomega = false; if (k === 'nomega' && U.f.nomega) U.f.mega = false; }
  else if (d.raview) { U.view = d.raview; V2.raSave(); }
  else if (d.ratypes != null) U.types = !U.types;
  else if (d.raty) { const t = d.raty; U.ty = U.ty.includes(t) ? U.ty.filter(x => x !== t) : U.ty.length >= 2 ? [U.ty[1], t] : [...U.ty, t]; }
  else if (d.raall != null) { U.all = !U.all; V2.raSave(); if (!U.all) { V2.redraw(); const l = document.querySelector('.ra-list'); if (l) l.scrollIntoView({block: 'start'}); return; } }
  else if (d.ratier) { U.open = {...U.open, [d.ratier]: !U.open[d.ratier]}; V2.raSave(); }
  else if (d.rajump) { U.all = true; U.open = {...U.open, [d.rajump]: true}; V2.raSave(); V2.redraw(); const t = document.getElementById('ra-t-' + d.rajump); if (t) t.scrollIntoView({behavior: 'smooth', block: 'start'}); return; }
  V2.redraw(); });
// the spotlight follows the pointer on mouse screens only (touch taps open the sheet)
document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-raspot]'); if (!r) return; const n = r.dataset.raspot; if (V2.raUi.spot === n) return;
  V2.raUi.spot = n; const w = document.querySelector('[data-raspotw]'); if (w) w.innerHTML = V2.raSpot(n); });
// the stand's rows follow the window width (desktop / iPad / phone counts): redraw when the width crosses one of them
(() => { const band = () => innerWidth >= 1100 ? 2 : innerWidth >= 700 ? 1 : 0; let b = band(), tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { if (band() === b) return; b = band(); if (document.querySelector('.gs')) V2.redraw(); }, 150); }); })();
