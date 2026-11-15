// ---------- The Pokémon page, "The Answer Page" (Sim's pick Nov 15; docs/rebuild/mocks/pokemon-answer-page/BRIEF.md) ----------
// Sim, Nov 15 (recommended A): one full page per Pokémon at its own address, #pokemon=<name>; the info sheet retires once every part
// is here (until then taps still open the sheet, so nothing is lost). Every number comes from the same shared helpers the sheet uses
// (rating, lairHead, rankTxt, rRange, SHT.speeds, SHT.baseForm...). Built part by part; this file holds the top ("Is it good?") and
// Base Stats so far.
V2.monSlug = n => encodeURIComponent(String(n).toLowerCase());
V2.monFromHash = () => { let k = ''; try { k = decodeURIComponent((location.hash.split('=')[1] || '')).toLowerCase(); } catch (e) {} return k && typeof ROSTER === 'object' ? ROSTER.find(q => q.n.toLowerCase() === k) || null : null; };
V2.STATS = [['HP', 'hp'], ['Attack', 'atk'], ['Defense', 'def'], ['Sp. Atk', 'spa'], ['Sp. Def', 'spd'], ['Speed', 'spe']];
// the top: the Card; the rank tag; the name; the rating with its tier and likely range; the 0-100 gauge; the three numbers; the actions
V2.pkTop = p => { const E = V2.esc, n = p.n, r = rating(p), rs = RS(r.total), T = lTier(r.total), H = lairHead(p), rank = rankTxt(p, 'cap');
  const lo = +RS(Math.max(1, r.total - (r.band || 0))), hi = +RS(Math.min(99, r.total + (r.band || 0))), sp = SHT.speeds(p), run = sp.find(x => x.main) || sp.find(x => x.k === 'max');
  const num = (b, l, s, few) => `<div class="pk-n${few ? ' few' : ''}"><b class="u">${b}</b><span>${l}${s ? `<small>${s}</small>` : ''}</span></div>`;
  const nums = (H.hU != null ? num(E(V2.shareTxt(H)), 'of teams', H.tot ? 'of ' + E(basisNum(H.tot, true)) : '') : num('None yet', 'of teams', 'no tournament games yet', true))
    + (H.hW != null ? (H.hG >= 30 ? num(E(pctFmt(H.hW)), 'win rate', Math.round(H.hG).toLocaleString('en-US') + ' games') : num('Too few', 'win rate', H.hG ? Math.round(H.hG) + ' games' : 'no tournament games yet', true)) : '')
    + (run ? num(run.v, 'Speed', 'at level 50') : '');
  const card = V2.msCard(p, n, `<p class="mc-nm u">${V2.nameHtml(V2.disp(n))}</p>`, `<div class="ms-ty">${(p.t || []).map(V2.typeChip).join('')}</div>`);
  const gauge = `<div class="pk-gauge" aria-hidden="true"><i class="pk-rg" style="--lo:${lo};--hi:${hi}"></i><i class="pk-mk" style="--v:${+rs}"></i><span style="--v:0">0</span><span style="--v:50">50</span><span style="--v:100">100</span></div>`;
  return `<section class="pk-top" aria-labelledby="pk-name"><div class="pk-card">${card}</div><div class="pk-is">
    <p class="pk-kick">${rank ? `<span class="pk-rank u">${E(rank)}</span>` : ''}<span>Pokémon Champions · VGC doubles</span></p>
    <h1 class="u" id="pk-name">${V2.nameHtml(V2.disp(n))}</h1>
    <div class="pk-rate"><b class="u">${rs}</b><span><em class="u">${E(T.k)} tier</em><small>Rating · ${E(rRange(r))}${H.thinR ? ' · early read' : ''}</small></span></div>
    ${gauge}<div class="pk-nums">${nums}</div>
    <div class="pk-acts"><button type="button" class="np-btn" data-hmaround="${E(n)}"><span>Build Around It</span></button><button type="button" class="np-btn2" data-mssets="${E(n)}"><span>Popular Sets</span></button>${V2.addBtn ? V2.addBtn(n) : ''}</div></div></section>`; };
// Base Stats: one panel, six lanes (a plate in the stat's colour, a streak growing to a point where the stat lands, the number past it),
// a scale under the lanes, then one bar split by each stat's share of the total. A Mega shows the change from its base form (today's note).
V2.pkStats = p => { const E = V2.esc, bf = SHT.baseForm(p), tot = p.st.reduce((a, b) => a + b, 0), btot = bf ? bf.st.reduce((a, b) => a + b, 0) : 0;
  const top = Math.max(160, Math.ceil(Math.max(...p.st) / 40) * 40), ticks = []; for (let v = 0; v <= top; v += 40) ticks.push(v);
  const dif = (a, b) => { const d = a - b; return d ? `<em class="${d < 0 ? 'dn' : 'up'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</em>` : ''; };
  const lanes = V2.STATS.map(([l, k], i) => `<div class="pk-lane" style="--c:var(--st-${k});--on:var(--on-st${k === 'def' ? '-def' : ''});--w:${(100 * p.st[i] / top).toFixed(2)}%;--f:${(p.st[i] / top).toFixed(4)}"><dt class="pk-sl">${l}</dt><dd><i class="pk-streak" aria-hidden="true"></i><span class="pk-v"><b class="u">${p.st[i]}</b>${bf ? dif(p.st[i], bf.st[i]) : ''}</span></dd></div>`).join('');
  const share = V2.STATS.map(([l, k], i) => `<i style="--c:var(--st-${k});--on:var(--on-st${k === 'def' ? '-def' : ''});flex:${p.st[i]}"><span>${l}</span></i>`).join('');
  return `<section class="pk-stats" aria-labelledby="pk-bs"><div class="pk-sh"><h2 class="u" id="pk-bs">Base Stats</h2><p class="pk-tot"><small>Total</small> <b class="u">${tot}</b>${bf ? dif(tot, btot) : ''}</p></div>
    <dl class="pk-lanes" style="--n:${ticks.length - 1}">${lanes}</dl><div class="pk-scale" aria-hidden="true">${ticks.map(v => `<span style="--v:${(100 * v / top).toFixed(2)}%">${v}</span>`).join('')}</div>
    <div class="pk-share" aria-hidden="true">${share}</div>${bf ? `<p class="fine">Mega Evolved stats; the small numbers are the change from ${E(bf.d)}.</p>` : ''}</section>`; };

// each part's head (brief 4): a blue slanted square with its number, the question, today's section name small under it, a thick rule
V2.pkHead = (no, q, sub, id) => `<header class="pk-h"><i class="pk-no u" aria-hidden="true">${no}</i><div><h2 class="u" id="${id}">${q}</h2><p>${sub}</p></div></header>`;
// the jump links (brief 3): only to the parts already on the page (the rest are added as they are built)
V2.pkJumps = list => `<nav class="pk-jumps" aria-label="On this page">${list.map(([id, t]) => `<button type="button" data-pkjump="${id}">${t}</button>`).join('')}</nav>`;
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-pkjump]'); if (!b) return; const t = document.getElementById(b.dataset.pkjump); if (t) t.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); });
// 1. How to build it (today's Usually, Typical set, Moves, Items; the same helpers and words as the sheet)
V2.pkBuild = p => { const E = V2.esc, n = p.n, st = (() => { try { return setFor(p) || {}; } catch (e) { return {}; } })();
  const ti = (() => { try { return topItems(p); } catch (e) { return null; } })(), SB = lairSetBits(p), pm = (() => { try { return (popularMoves(p) || []).slice(0, 4).map(m => m.name); } catch (e) { return []; } })();
  const usual = [ti && ti.it && ti.it[0] ? ti.it[0][0] : null, SB.na ? SB.na[0] : null, SB.w || null].filter(Boolean);
  const mvShare = new Map((st.mv || []).map(([nm, v]) => [nm, v]));
  // the typical set: each value large; a second option sits under it as "or ..."
  const two = arr => arr && arr.length ? `<b>${E(arr[0])}</b>${arr.length > 1 ? `<small>or ${arr.slice(1).map(E).join(' or ')}</small>` : ''}` : '';
  const ab = metaAbility(p) || bestAbility(p); let abv = null; try { abv = ab && abilityPct(p, ab); } catch (e) {}
  const set = `<div class="pk-set"><h3 class="pk-k u">Typical set</h3><dl>
    <div><dt>Ability</dt><dd><b>${E(ab || '–')}</b>${abv != null ? `<small>${E(pctFmt(+abv))}</small>` : ''}</dd></div>
    ${ti && ti.it && ti.it.length ? `<div><dt>Item</dt><dd>${two(ti.it.map(x => x[0]))}</dd></div>` : ''}${SB.na ? `<div><dt>Nature</dt><dd>${two(SB.na)}</dd></div>` : ''}${SB.w ? `<div><dt>Stat points</dt><dd><b>${E(SB.w)}</b></dd></div>` : ''}</dl>
    <button type="button" class="np-btn2" data-mssets="${E(n)}"><span>Popular Sets</span></button></div>`;
  // Usually: the four usual moves as big slots in their type colour, each with its share of sets when the Moves list has it
  const slots = pm.length ? `<div class="pk-usual"><h3 class="pk-k u">Usually</h3><ul class="pk-slots">${pm.map(m => { const mv = mvByName.get(m), t = mv && V2.TYPES.includes(mv.type) ? mv.type : 'Normal', v = mvShare.get(m);
      return `<li style="--tc:var(--ty-${t})"><b class="u">${E(m)}</b>${v != null ? `<small>${E(pctFmt(+v))} of sets</small>` : ''}</li>`; }).join('')}</ul>${usual.length ? `<p class="pk-ub">${E(usual.join(' · '))}</p>` : ''}</div>` : '';
  // Moves and Items: today's lists with their bars, shares and notes
  const bars = (arr, k) => (arr || []).slice(0, k).map(([nm, v]) => `<div class="ms-br"><span>${E(nm)}</span><i style="--v:${Math.max(2, Math.min(100, +v || 0))}" aria-hidden="true"></i><b>${v == null ? '' : E(pctFmt(+v))}</b></div>`).join('');
  const sbM = (() => { try { return setBasis(p, st, 'mv'); } catch (e) { return null; } })(), stn = lairStones(p, st);
  const mvs = st.mv && st.mv.length ? `<div class="pk-list"><h3 class="pk-k u">Moves</h3>${bars(st.mv, 5)}${sbM ? `<p class="fine">${E(V2.txt(sbM.html))}</p>` : ''}</div>` : '';
  const items = stn.mg && stn.stn >= 50 ? `<div class="pk-list"><h3 class="pk-k u">Items</h3><p>${Math.round(stn.stn)}% hold ${stn.megas.length > 1 ? 'a Mega Stone' : E(stoneFor(stn.mg) || 'its Mega Stone')} to Mega Evolve${stn.megas.length > 1 && stn.top ? `, most often ${E(stn.top[0])}` : ''}.${stn.rest >= 5 && st.it && st.it[0] ? ' The rest mostly run ' + E(st.it[0][0]) + '.' : ''}</p><a class="np-link" href="#pokemon=${V2.monSlug(stn.mg.n)}">See ${E(stn.mg.d)}</a></div>`
    : p.m ? `<div class="pk-list"><h3 class="pk-k u">Items</h3><p>Always holds ${E(stoneFor(p) || 'its Mega Stone')}.</p></div>` : st.it && st.it.length ? `<div class="pk-list"><h3 class="pk-k u">Items</h3>${bars(st.it, 3)}</div>` : '';
  const noSets = !(st.mv && st.mv.length) && !(st.it && st.it.length);
  const body = noSets ? `<p class="pk-empty"><b>No tournament or ladder sets yet.</b> Nobody has brought ${E(V2.disp(n))} to the events and ladders we read, so there are no popular moves or items to show.</p><div class="pk-build">${set}</div>`
    : `<div class="pk-build">${slots}${set}<div class="pk-lists">${mvs}${items}</div></div>`;
  return `<section class="pk-sec" aria-labelledby="pk-s1">${V2.pkHead(1, 'How to build it', 'Usually · Typical set · Moves · Items', 'pk-s1')}${body}</section>`; };
V2.pages.pokemon = {place: 'meta', after() { V2.fitMsName('.pk-card .mc-id>.mc-nm'); }, draw() { const p = V2.monFromHash(), E = V2.esc;
  if (!p) return `<div class="ra gsp"><section class="ra-h"><p class="np-eyebrow"><span>Pokémon</span></p><h1 class="u">No Pokémon here.</h1><p class="ra-lede">This address doesn't match a Pokémon in Reg M-C. <a class="np-link pk-404" href="#meta">Every Pokémon, by tier</a></p></section></div>`;
  try { document.title = `${V2.disp(p.n)}: rating, sets and partners · NastyPlot`; } catch (e) {} /* a real page title per Pokémon (brief section 10: being found from a search) */
  return `<div class="ra pk"><nav class="pk-trail" aria-label="You are here"><a href="#meta">Meta</a><span aria-hidden="true">›</span><a href="#meta">Ratings</a><span aria-hidden="true">›</span><span aria-current="page">${E(V2.disp(p.n))}</span></nav>
    ${V2.pkTop(p)}${V2.pkStats(p)}${V2.pkJumps([['pk-name', 'Is it good?'], ['pk-s1', 'How to build it']])}${V2.pkBuild(p)}
    <p class="pk-more fine">The rest of ${E(V2.disp(p.n))}'s page is being rebuilt part by part. Until then: <button type="button" class="np-link" data-v2mon="${E(p.n)}">Open today's info sheet</button></p></div>`; }};
// the tab title goes back to the site's own when you leave a Pokémon page
V2.title0 = document.title; addEventListener('hashchange', () => { if (V2.route() !== 'pokemon') try { document.title = V2.title0; } catch (e) {} });
addEventListener('resize', () => requestAnimationFrame(() => { if (V2.route() === 'pokemon') V2.fitMsName('.pk-card .mc-id>.mc-nm'); }));
