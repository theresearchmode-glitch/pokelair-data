// ---------- Meta > Pokémon > Rating (Nov 14): "Who wins right now." ----------
// The approved mock-up (Preview gallery ratings.html; source docs/rebuild/mocks/ratings.tpl.html). Every feature of today's Ratings page
// (D-meta-shell RATE-01..09; inventory docs/rebuild/meta-features.md) is here: the kicker with teams and the data date, How ratings
// work, Track Record, search by name or type with a match count, filters (two types at most, Megas / No Megas, hidden gems, in my box,
// Clear), the top of the ratings, every Pokémon by tier with "+N more" / "Show fewer" (remembered), About the ratings (track record,
// the four numbers, sources). The numbers are today's shared logic: lairRows, lairRank, lairHead, lTier, isGem, ratingTrack.
V2.raUi = {q: '', ty: [], f: {}, types: false, all: null, open: null, spot: null};
V2.raLoad = () => { const U = V2.raUi; if (U.all == null) { let o = {}; try { o = JSON.parse(localStorage.getItem('np2.ra.board') || '{}') || {}; } catch (e) {} U.all = !!o.all; U.open = o.open || {}; } };
V2.raSave = () => { try { localStorage.setItem('np2.ra.board', JSON.stringify({all: V2.raUi.all, open: V2.raUi.open})); } catch (e) {} };
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
// the spotlight: #1 by default; on a mouse screen the row under the pointer steps up here (the mock-up's "Point at any row")
V2.raSpot = n => { const E = V2.esc, all = lairRows(), x = all.find(y => y.p.n === n) || all[0]; if (!x) return ''; const p = x.p, r = x.r, T = lTier(r.total), k = lairRank(p), N = V2.raNums(p), mine = V2.raOnTeam(p);
  return `<div class="ra-spot" style="--ta:var(--ty-${p.t[0]})"><div class="ra-plate">${V2.mon(p.n, {bare: true})}<p class="ra-cap u">${k ? '#' + k.rank + ' · ' : ''}Rated ${RS(r.total)} · ${T.k} tier</p></div>
    <div class="ra-sinfo"><p class="ra-cap2 u">${k ? '#' + k.rank + ' · ' : ''}Rated ${RS(r.total)} · ${T.k} tier</p><h2 class="u">${V2.nameHtml(p.d)}</h2><div class="ra-ty">${p.t.map(V2.typeChip).join('')}</div></div>
    <div class="ra-stats"><p><span>Base Speed</span><b class="u">${p.st[5]}</b></p><p><span>On teams</span><b class="u">${N.u != null ? E(V2.raPct(N.u)) : '–'}</b>${N.tot ? `<small>of ${E(basisNum(N.tot))} teams</small>` : ''}</p><p><span>Win rate</span><b class="u">${N.w != null ? E(winFmt(N.w)) : '–'}</b>${N.g ? `<small>${E(Math.round(N.g).toLocaleString('en-US'))} games</small>` : ''}</p></div>
    <div class="ra-acts"><button type="button" class="np-btn" data-v2mon="${E(p.n)}"><span>Open info sheet</span></button><button type="button" class="np-btn2" data-hmaround="${E(p.n)}"><span>Build around it</span></button></div>
    ${mine ? '<p class="ra-mine"><i aria-hidden="true"></i>On your team</p>' : ''}<p class="fine ra-hint"><span class="ra-mouse">Point at any row and it steps up here.</span><span class="ra-touch">Tap any row for its info sheet.</span> Rated ${E(rRange(r))}.</p></div>`; };

V2.pages.meta = {place: 'meta', draw() { const E = V2.esc, U = V2.raUi; V2.raLoad();
  const all = lairRows(), rows = V2.raFilter(all), filtered = V2.raFiltered(), pf = activePerf(), reg = ((typeof regInfo === 'function' && regInfo()) || {id: 'M-C'}).id.replace('-', '‑');
  let d = pf && pf.updated ? String(pf.updated).slice(0, 10) : ''; try { if (d) d = new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) {}
  const teams = RES && +RES.teams > 0 ? +RES.teams : 0;
  const tabs = `<div class="ra-sub"><nav class="ra-tabs" aria-label="Meta"><a href="#meta" class="on" aria-current="page">Pokémon</a><a href="#tournaments">Tournaments</a></nav>
    <nav class="ra-seg" aria-label="Pokémon views"><a href="#meta" class="on" aria-current="page"><span aria-hidden="true">★</span>Rating</a><a href="#usage">Usage</a><a href="#sets">Sets</a></nav>
    <p class="ra-links"><a class="np-link" href="#method">How ratings work →</a><a class="np-link" href="#track">Track Record →</a></p></div>`;
  const head = `<section class="ra-h"><p class="np-eyebrow"><span>Meta · Ratings</span></p><h1 class="u"><span>Who wins</span> <span class="pl">right now.</span></h1>
    <p class="ra-lede">Every Pokémon rated 0–100 from real tournament results, not opinion.</p>
    <p class="ra-kick">Rated 0–100 from real results: Reg ${E(reg)} doubles${teams ? `, ${E(basisNum(teams))} teams` : ''}${d ? `, <span class="ra-nw">data as of ${E(d)}${typeof V2.tip === 'function' ? V2.tip('numbers') : ''}</span>` : ''}</p></section>`;
  const gems = all.filter(x => isGem(x.p)).length, f = U.f, chip = (k, l) => `<button type="button" class="ra-chip" data-raflag="${k}" aria-pressed="${!!f[k]}">${l}</button>`;
  const filt = `<div class="ra-find"><label class="np-field ra-q">${V2.ICON.search}<input type="search" data-raq value="${E(U.q)}" placeholder="Find a Pokémon or type" aria-label="Find a Pokémon or type" autocomplete="off"></label><p class="ra-count"><b class="u">${filtered ? rows.length : all.length}</b> ${filtered ? `of ${all.length} match` : 'rated'}</p></div>
    <div class="ra-filt" role="group" aria-label="Filter"><span class="ra-fl">Filter</span><button type="button" class="ra-chip" data-raflag="all" aria-pressed="${!filtered}">All</button>${chip('mega', 'Megas')}${chip('nomega', 'No Megas')}${gems ? chip('gem', `◆ Hidden gems <small>${gems}</small>`) : ''}${chip('box', 'In my box')}
      <button type="button" class="ra-chip" data-ratypes aria-expanded="${U.types}" aria-pressed="${U.ty.length > 0}">Types <small>${U.ty.length || TYPES.length}</small></button>${filtered ? '<button type="button" class="np-link ra-clear" data-raflag="clear">Clear</button>' : ''}</div>
    ${U.types ? `<div class="ra-types" role="group" aria-label="Types, two at most">${TYPES.map(t => `<button type="button" class="tc-tp${U.ty.includes(t) ? ' on' : ''}" data-raty="${t}" aria-pressed="${U.ty.includes(t)}" style="--tc:var(--ty-${t})">${t}</button>`).join('')}</div>` : ''}`;
  const colh = `<div class="ra-colh" aria-hidden="true"><span>Pokémon</span><span>Rating</span><span>On teams</span><span>Win rate</span></div>`;
  const grouped = list => { let out = '', prev = null; for (const x of list) { const T = lTier(x.r.total); if (!prev || prev.k !== T.k) out += V2.raTierHead(T, filtered ? list : all); prev = T; out += V2.raRow(x); } return out; };
  let body;
  if (filtered) body = rows.length ? `<div class="ra-list">${colh}${grouped(rows)}</div>` : `<p class="tm-sub ra-none">${f.box && !(S.box || []).length ? 'Your box is empty. Add the Pokémon you own on My box.' : 'No Pokémon match. Try clearing a filter.'}</p>`;
  else if (U.all) body = `<div class="ra-list ra-board"><h2 class="ra-bh u">Every Pokémon, by tier</h2>${colh}${LTIERS.map(T => { const inT = all.filter(x => lTier(x.r.total).k === T.k); if (!inT.length) return '';
      const cap = 12, open = U.open[T.k] || inT.length <= cap + 1, shown = open ? inT : inT.slice(0, cap);
      return `<section class="ra-tg" id="ra-t-${T.k}">${V2.raTierHead(T, all)}${shown.map(V2.raRow).join('')}${inT.length > cap + 1 ? `<button type="button" class="ra-more" data-ratier="${T.k}" aria-expanded="${!!U.open[T.k]}">${U.open[T.k] ? 'Show fewer' : `+${inT.length - cap} more`}</button>` : ''}</section>`; }).join('')}
      <button type="button" class="np-btn2 ra-seeall" data-raall><span>Show the top 12 only</span></button></div>`;
  else body = `<div class="ra-list">${colh}${grouped(all.slice(0, 12))}<button type="button" class="np-btn ra-seeall" data-raall><span>See all ${all.length} Pokémon</span></button></div>`;
  const byTier = filtered ? '' : `<div class="ra-bytier" role="group" aria-label="By tier"><span class="ra-fl">By tier</span>${LTIERS.map(T => { const n = all.filter(x => lTier(x.r.total).k === T.k).length; return n ? `<button type="button" class="ra-chip" data-rajump="${T.k}"><b>${T.k}</b> <small>${n}</small></button>` : ''; }).join('')}</div>`;
  const legend = `<p class="fine ra-legend">${filtered ? `${rows.length} of ${all.length} shown` : U.all ? `All ${all.length} shown` : `Top 12 of ${all.length} shown`}, ranked among ${(lairRank(all[0] && all[0].p) || {}).of || 0} with tournament results · ◆ hidden gem: rarely used, wins more than its use predicts · ? few games, an estimate</p>`;
  const tr = ratingTrack(), src = pf && pf.sources ? Object.entries(pf.sources).filter(([k, v]) => v && !(k === 'adj' && pf.sources.tour)).map(([, v]) => String(v)) : [];
  const about = `<details class="ra-about" data-raabout><summary><span><b>About the ratings</b><small>How they are made, the ${src.length} data sources and their track record</small></span><i aria-hidden="true">+</i></summary>
    ${tr ? `<p class="ra-track">Track record: in ${tr.events} recent events, the team with the higher average rating finished higher in ${E(pctFmt(tr.acc * 100))} of ${tr.pairs.toLocaleString('en-US')} head-to-head pairs (50% would be a coin flip). Ratings rank single Pokémon: use them to find candidates, and the scouting report to check a team.</p>` : ''}
    <div class="ra-cells"><p><b class="u">${all.length}</b><span>Pokémon rated</span></p><p><b class="u">${src.length}</b><span>data source${src.length === 1 ? '' : 's'}</span></p><p><b class="u">${all.filter(x => x.r.total >= 80).length}</b><span>in S tier</span></p><p><b class="u">${gems}</b><span>hidden gems</span></p></div>
    <p class="ra-lbl">Doubles sources${d ? ' · data from ' + E(d) : ''}</p><ul class="ra-src">${src.map(v => `<li>${E(v)}</li>`).join('')}</ul>
    <p class="ra-how">A rating says how strong a Pokémon is in the current format, proven by results. Four ingredients, each shown on every Pokémon's sheet: how often it's on teams that reach top cut at tournaments (counts most; recent and bigger events weigh more), how often strong players pick it (usage weighted by each player's skill), whether it makes top cut more or less often than its usage predicts, and its win rate. The last two are pulled toward average until there are enough games. Ratings read like school grades: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50, and the best Pokémon shows as ${RS(RATE_V3.top)}. Halving a Pokémon's presence costs about 10 points (about 5 inside S, where the top is squeezed). This mix was chosen on Oct 27 by testing ten candidate measures on later events and against five outside tier lists; only the ones that helped are in. Rarely used Pokémon that overperform get the ◆ hidden gem tag instead of jumping the tier list. Ratings are saved every day and checked later against the tournaments that came after.</p></details>`;
  return `<div class="ra">${tabs}<div class="ra-grid"><aside class="ra-left">${head}<div class="ra-spotw" data-raspotw>${V2.raSpot(U.spot)}</div></aside>
    <div class="ra-right">${filt}${body}${byTier}${legend}${about}</div></div></div>`; }};

// search, filters, see all, tiers
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-raq]'); if (!i) return; V2.raUi.q = i.value; const at = i.selectionStart; V2.redraw();
  const n = document.querySelector('[data-raq]'); if (n) { n.focus(); try { n.setSelectionRange(at, at); } catch (x) {} } });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-raflag],[data-ratypes],[data-raty],[data-raall],[data-ratier],[data-rajump]'); if (!b) return; const U = V2.raUi, d = b.dataset;
  if (d.raflag === 'all' || d.raflag === 'clear') { U.q = ''; U.ty = []; U.f = {}; U.types = false; }
  else if (d.raflag) { const k = d.raflag; U.f = {...U.f, [k]: !U.f[k]}; if (k === 'mega' && U.f.mega) U.f.nomega = false; if (k === 'nomega' && U.f.nomega) U.f.mega = false; }
  else if (d.ratypes != null) U.types = !U.types;
  else if (d.raty) { const t = d.raty; U.ty = U.ty.includes(t) ? U.ty.filter(x => x !== t) : U.ty.length >= 2 ? [U.ty[1], t] : [...U.ty, t]; }
  else if (d.raall != null) { U.all = !U.all; V2.raSave(); if (!U.all) { V2.redraw(); const l = document.querySelector('.ra-list'); if (l) l.scrollIntoView({block: 'start'}); return; } }
  else if (d.ratier) { U.open = {...U.open, [d.ratier]: !U.open[d.ratier]}; V2.raSave(); }
  else if (d.rajump) { U.all = true; U.open = {...U.open, [d.rajump]: true}; V2.raSave(); V2.redraw(); const t = document.getElementById('ra-t-' + d.rajump); if (t) t.scrollIntoView({behavior: 'smooth', block: 'start'}); return; }
  V2.redraw(); });
// the spotlight follows the pointer on mouse screens only (touch taps open the sheet)
document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-raspot]'); if (!r) return; const n = r.dataset.raspot; if (V2.raUi.spot === n) return;
  V2.raUi.spot = n; const w = document.querySelector('[data-raspotw]'); if (w) w.innerHTML = V2.raSpot(n); });
