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
  const nums = (H.hU != null ? num(E(V2.shareTxt(H)), 'of teams', H.tot ? 'of ' + E(basisNum(H.tot, true)) : '') : num('None yet', 'of teams', 'no games yet', true))
    + (H.hW != null ? (H.hG >= 30 ? num(E(pctFmt(H.hW)), 'win rate', Math.round(H.hG).toLocaleString('en-US') + ' games') : num('Too few', 'win rate', H.hG ? Math.round(H.hG) + ' games' : 'no tournament games yet', true)) : num('None yet', 'win rate', 'no games yet', true)) /* always three numbers (audit Nov 15: a half-empty row) */
    + (run ? num(run.v, 'Speed', 'at level 50') : '');
  const card = V2.msCard(p, n, `<p class="mc-nm u">${V2.nameHtml(V2.disp(n))}</p>`, `<div class="ms-ty">${(p.t || []).map(V2.typeChip).join('')}</div>`);
  const gauge = `<div class="pk-gauge" aria-hidden="true"><i class="pk-rg" style="--lo:${lo};--hi:${hi}"></i><i class="pk-mk" style="--v:${+rs}"></i><span style="--v:0">0</span><span style="--v:50">50</span><span style="--v:100">100</span></div>`;
  return `<section class="pk-top" aria-labelledby="pk-name"><div class="pk-card">${card}</div><div class="pk-is">
    <p class="pk-kick"><span class="pk-rank u">${rank ? E(rank) : 'No results yet'}</span><span>Pokémon Champions · VGC doubles</span></p>
    <h1 class="u" id="pk-name">${V2.nameHtml(V2.disp(n))}</h1>
    <div class="pk-rate"><b class="u">${rs}</b><span><em class="u">${E(T.k)} tier</em><small>Rating · ${E(rRange(r))}${H.thinR ? ' · early read' : ''}</small></span></div>
    ${gauge}<div class="pk-nums">${nums}</div>
    <div class="pk-acts"><button type="button" class="np-btn" data-hmaround="${E(n)}"><span>Build Around It</span></button><button type="button" class="np-btn2" data-mssets="${E(n)}"><span>Popular Sets</span></button>${V2.addBtn ? V2.addBtn(n) : ''}</div></div></section>`; };
// Base Stats: one panel, six lanes (a plate in the stat's colour, a streak growing to a point where the stat lands, the number past it),
// a scale under the lanes, then one bar split by each stat's share of the total. A Mega shows the change from its base form (today's note).
// Base Stats (Sim, Nov 15 night: B 'clean bars', 'add more pop and depth'): six rows, a coloured label, the number in Unbounded with a soft
// shadow in the stat's colour, and one raised bar (gradient, glow, darker lower edge) in a recessed track; physical stats left, special right
// on wide screens. Replaces the lanes + scale + share bar (609 -> ~390px on a phone). A Mega shows the change from its base form.
V2.pkStats = p => { const E = V2.esc, bf = SHT.baseForm(p), tot = p.st.reduce((a, b) => a + b, 0), btot = bf ? bf.st.reduce((a, b) => a + b, 0) : 0, top = Math.max(160, ...p.st);
  const dif = (a, b) => { const d = a - b; return d ? `<em class="${d < 0 ? 'dn' : 'up'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</em>` : ''; };
  const rows = V2.STATS.map(([l, k], i) => `<div class="pk-bsr" style="--c:var(--st-${k});--w:${(100 * p.st[i] / top).toFixed(2)}%"><dt>${l}</dt><dd><b class="u">${p.st[i]}</b>${bf ? dif(p.st[i], bf.st[i]) : ''}<span class="pk-bt" aria-hidden="true"><i></i></span></dd></div>`).join('');
  return `<section class="pk-stats" aria-labelledby="pk-bs"><div class="pk-sh"><h2 class="u" id="pk-bs">Base Stats</h2><p class="pk-tot"><small>Total</small> <b class="u">${tot}</b>${bf ? dif(tot, btot) : ''}</p></div>
    <dl class="pk-bs${bf ? ' pk-bsd' : ''}">${rows}</dl>${bf ? `<p class="fine">Mega Evolved stats; the small numbers are the change from ${E(bf.d)}.</p>` : ''}</section>`; };

// each part's head (brief 4): a blue slanted square with its number, the question, today's section name small under it, a thick rule
V2.pkHead = (no, q, sub, id) => `<header class="pk-h"><i class="pk-no u" aria-hidden="true">${no}</i><div><h2 class="u" id="${id}">${q}</h2>${sub ? `<p>${sub}</p>` : ''}</div></header>`;
// the jump links (brief 3): only to the parts already on the page (the rest are added as they are built)
V2.pkJumps = list => `<nav class="pk-jumps" aria-label="On this page">${list.map(([id, t]) => `<button type="button" data-pkjump="${id}">${t}</button>`).join('')}</nav>`;
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-pkjump]'); if (!b) return; const t = document.getElementById(b.dataset.pkjump); if (t && document.getElementById(b.dataset.pkjump + '-sec')) V2.pkSetOpen(b.dataset.pkjump, true); if (t) { t.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); const h = t.matches('h1,h2') ? t : t.querySelector('h1,h2') || t; if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({preventScroll: true}); } }); /* keyboard focus moves with the jump, so the next Tab goes into that part (audit Nov 15) */
// 1. How to build it (today's Usually, Typical set, Moves, Items; the same helpers and words as the sheet)
V2.pkBuild = p => { const E = V2.esc, n = p.n, st = (() => { try { return setFor(p) || {}; } catch (e) { return {}; } })();
  const ti = (() => { try { return topItems(p); } catch (e) { return null; } })(), SB = lairSetBits(p), pm = (() => { try { return (popularMoves(p) || []).slice(0, 4).map(m => m.name); } catch (e) { return []; } })();
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
      return `<li style="--tc:var(--ty-${t})"><b class="u">${E(m)}</b>${v != null ? `<small>${E(pctFmt(+v))} of sets</small>` : ''}</li>`; }).join('')}</ul></div>` : ''; /* say it once (Nov 16): the 'Life Orb · Adamant · points' line under the tiles repeated the Typical set beside it */
  // Moves and Items: today's lists with their bars, shares and notes
  const bars = (arr, k) => (arr || []).slice(0, k).map(([nm, v]) => `<div class="ms-br"><span>${E(nm)}</span><i style="--v:${Math.max(2, Math.min(100, +v || 0))}" aria-hidden="true"></i><b>${v == null ? '' : E(pctFmt(+v))}</b></div>`).join('');
  const sbM = (() => { try { return setBasis(p, st, 'mv'); } catch (e) { return null; } })(), stn = lairStones(p, st);
  const mvs = st.mv && st.mv.length ? `<div class="pk-list"><h3 class="pk-k u">Moves</h3>${bars(st.mv, 5)}${sbM ? `<p class="fine">${E(V2.txt(sbM.html))}</p>` : ''}</div>` : '';
  const items = stn.mg && stn.stn >= 50 ? `<div class="pk-list"><h3 class="pk-k u">Items</h3><p>${Math.round(stn.stn)}% hold ${stn.megas.length > 1 ? 'a Mega Stone' : E(stoneFor(stn.mg) || 'its Mega Stone')} to Mega Evolve${stn.megas.length > 1 && stn.top ? `, most often ${E(stn.top[0])}` : ''}.${stn.rest >= 5 && st.it && st.it[0] ? ' The rest mostly run ' + E(st.it[0][0]) + '.' : ''}</p><a class="np-link pk-tap" href="#pokemon=${V2.monSlug(stn.mg.n)}">See ${E(stn.mg.d)}</a></div>`
    : p.m ? `<div class="pk-list"><h3 class="pk-k u">Items</h3><p>Always holds ${E(stoneFor(p) || 'its Mega Stone')}.</p></div>` : st.it && st.it.length ? `<div class="pk-list"><h3 class="pk-k u">Items</h3>${bars(st.it, 3)}</div>` : '';
  const noSets = !(st.mv && st.mv.length) && !(st.it && st.it.length);
  const body = noSets ? `<p class="pk-empty"><b>No tournament or ladder sets yet.</b> Nobody has brought ${E(V2.disp(n))} to the events and ladders we read, so there are no popular moves or items to show.</p><div class="pk-build">${set}</div>`
    : `<div class="pk-build">${slots}${set}<div class="pk-sum pk-lsum"><p>Every move and item, with how often each is run</p><button type="button" class="np-link" data-pklists aria-expanded="${V2.pkOpen('pk-lists')}" aria-controls="pk-lists">${V2.pkOpen('pk-lists') ? 'Hide' : 'All Moves and Items ›'}</button></div><div class="pk-lists${V2.pkOpen('pk-lists') ? ' open' : ''}" id="pk-lists">${mvs}${items}</div></div>`;
  return `<section class="pk-sec" aria-labelledby="pk-s1">${V2.pkHead(1, 'How to build it', 'Usually · Typical set · Moves · Items', 'pk-s1')}${body}</section>`; };

// 2. Who it teams with (today's Brought with: the four partners, share brought together, games; the same data and note)
V2.pkPartners = p => { const E = V2.esc, bw = RES && RES.tc && RES.tc.bw ? (RES.tc.bw[brKeyOf(p)] || []).filter(x => byName.get(x[0])).slice(0, 4) : [];
  if (!bw.length) return '';
  const cards = bw.map((x, i) => { const q = byName.get(x[0]); return `<li style="--i:${i};--k:${bw.length}"><a class="pk-pc" href="#pokemon=${V2.monSlug(q.n)}" aria-label="${E(V2.disp(q.n))}: brought together ${E(pctFmt(x[1]))}, ${(+x[2]).toLocaleString('en-US')} games">${V2.msCard(q, q.n, `<p class="mc-nm u">${V2.nameHtml(V2.disp(q.n))}</p>`, '', 150)}</a><p class="pk-pn"><b class="u">${E(pctFmt(x[1]))}</b><small>${(+x[2]).toLocaleString('en-US')} games</small></p></li>`; }).join('');
  return `<section class="pk-sec" aria-labelledby="pk-s2">${V2.pkHead(2, 'Who it teams with', 'Brought with', 'pk-s2')}<ul class="pk-fan">${cards}</ul>
    <div class="pk-fnote"><p class="fine">% = brought together when both are on the team, from Showdown replays.</p><button type="button" class="np-btn" data-hmaround="${E(p.n)}"><span>Build Around It</span></button></div></section>`; };

// 3. What beats it (today's Type Matchups: the same groups, the Ability lines and the note). One scale from danger to safe; Resists keeps
// today's ¼ row inside it; an empty group says "None" (it still answers the question: no 4x weakness is worth knowing)
V2.pkTypes = p => { const E = V2.esc, M = SHT.matchups(p), chips = arr => arr.length ? `<div class="pk-chips">${arr.map(V2.typeChip).join('')}</div>` : '<p class="pk-none">None</p>';
  const box = (cls, head, body) => `<div class="pk-tb ${cls}"><h3>${head}</h3>${body}</div>`;
  const res = M.g.h.length || M.g.qr.length ? `${M.g.h.length ? chips(M.g.h) : ''}${M.g.qr.length ? `<p class="pk-qr">Resists ¼</p>${chips(M.g.qr)}` : ''}` : '<p class="pk-none">None</p>';
  return `<section class="pk-sec" aria-labelledby="pk-s3">${V2.pkHead(3, 'What beats it', 'Type Matchups', 'pk-s3')}
    <div class="pk-scale5">${box('q', '4× weak', chips(M.g.q))}${box('d', '2× weak', chips(M.g.d))}${box('n', 'Normal damage', '<p class="pk-none">Every other type</p>')}${box('h', 'Resists ½', res)}${box('z', 'Immune', chips(M.g.z))}</div>
    ${M.ab.map(o => `<p class="fine">With ${E(o.a)}${M.only ? ' (its only Ability, already counted)' : ''}: ${o.ch.map(c => `${E(c.t)} ${E(SHT.word(c.raw))} → ${E(SHT.word(c.x))}`).join(', ')}.</p>`).join('')}
    <p class="fine">${M.only ? `Its typing${p.t.length > 1 ? ` (${p.t.join(' / ')})` : ''} with ${E(M.only)}` : `For its typing${p.t.length > 1 ? ` (${p.t.join(' / ')})` : ''} alone`}. Every other type hits it for normal damage.</p></section>`; };

// 4. How fast it is (today's Speed at Level 50: every build, its Speed, its line and how much of the top 30 it outspeeds; the same note).
// Desktop: one line from "outspeeds none" to "outspeeds all" of the top 30, each build a flag at its share. Flags go in the first free
// row (above, below, then a second row each way) so two close builds never overlap. The Trick Room build is measured the other way
// round, so it has its own strip. Under 1100 px the line would crowd: the builds are a list with a bar each.
V2.pkSpeed = p => { const E = V2.esc, sp = SHT.speeds(p), id = typeof SPRITE_ID === 'object' ? SPRITE_ID[p.n] : null;
  const onLine = sp.filter(x => !x.tr && x.os), tr = sp.filter(x => x.tr), W = 17 /* a flag's width as % of the line, at 1100 px+ */;
  const rows = [[], [], [], []], place = onLine.slice().sort((a, b) => a.os.pct - b.os.pct).map(x => { const L = Math.min(Math.max(x.os.pct - W / 2, 0), 100 - W);
    let r = rows.findIndex(R => !R.length || R[R.length - 1] + 1 <= L); if (r < 0) r = 0; rows[r].push(L + W); return {x, L, r}; });
  const used = rows.map(R => R.length > 0), up = (used[0] ? 1 : 0) + (used[2] ? 1 : 0), dn = (used[1] ? 1 : 0) + (used[3] ? 1 : 0);
  const flag = ({x, L, r}) => `<div class="pk-flag r${r}${x.main ? ' main' : ''}" style="--l:${L.toFixed(2)};--p:${x.os.pct}"><b class="u">${x.main && id ? `<span class="pk-fm" aria-hidden="true">${V2.mon(p.n, {iw: 40, bare: true})}</span>` : ''}${x.v}</b><span>${E(x.l)}</span><small>${E(x.note)}</small><em>outspeeds ${x.os.pct}% of the top 30</em></div><i class="pk-stem r${r}" style="--p:${x.os.pct}" aria-hidden="true"></i>`;
  const mon = ''; /* the Pokémon stands in its own dark flag, beside its Speed (on the line it hid behind the flag) */
  const line = `<div class="pk-speed" style="--up:${up};--dn:${dn}"><div class="pk-line">${[0, 25, 50, 75, 100].map(v => `<i class="tick" style="--p:${v}" aria-hidden="true"></i>`).join('')}${mon}</div><div class="pk-tls" aria-hidden="true">${[0, 25, 50, 75, 100].map(v => `<span style="--p:${v}">${v === 0 ? '0% · outspeeds none' : v === 100 ? 'outspeeds all · 100%' : v + '%'}</span>`).join('')}</div>${place.map(flag).join('')}</div>`; /* the ends' words sit under the line's ends (audit Nov 15: at the bottom of the area they were ~220 px away) */
  const strip = tr.map(x => `<div class="pk-tr"><b class="u">${x.v}</b><span>${E(x.l)}<small>${E(x.note)}</small></span><em>${x.os ? `moves before ${x.os.pct}% of the top 30 under Trick Room` : ''}</em></div>`).join('');
  const list = `<div class="pk-splist">${sp.map(x => `<div class="${x.main ? 'main' : ''}"><span>${E(x.l)}<small>${E(x.note)}</small></span><b class="u">${x.v}</b><i style="--p:${x.os ? x.os.pct : 0}" aria-hidden="true"></i><em>${x.os ? (x.tr ? `moves before ${x.os.pct}% of the top 30 under Trick Room` : `outspeeds ${x.os.pct}% of the top 30`) : ''}</em></div>`).join('')}</div>`;
  return `<section class="pk-sec" aria-labelledby="pk-s4">${V2.pkHead(4, 'How fast it is', 'Speed at Level 50', 'pk-s4')}${line}${strip}${list}
    <p class="fine">Level 50, as in Pokémon Champions: base Speed ${p.st[5]}, Speed points 0–32 add 1 each, a Speed nature adds 10%. "Top 30" = the 30 biggest threats at their usual Speed.</p><p class="ra-links"><a class="np-link" href="#speed">Speed Tiers ›</a></p></section>`; }; /* the sheet's Speed Tiers link */
V2.pkFlags = () => { const w = document.querySelector('.pk-speed'); if (!w) return; const h = Math.max(0, ...[...w.querySelectorAll('.pk-flag')].map(f => f.offsetHeight)); w.style.setProperty('--rh', (h + 16) + 'px'); }; /* rows as tall as the tallest flag */

// 5. Abilities (today's: each Ability, its share of players' sets, its text, the same note): one bar split by share, then the Abilities
V2.pkAbilities = p => { const E = V2.esc, st = (() => { try { return setFor(p) || {}; } catch (e) { return {}; } })(), bf = SHT.baseForm(p);
  const abSh = new Map((st.ab || []).map(([a, v]) => [a, v])), abTop = (st.ab || [])[0];
  const list = [...new Set(p.a)].sort((x, y) => (+(abSh.get(y) ?? -1)) - (+(abSh.get(x) ?? -1)));
  const note = p.m && bf ? `Its Mega's Ability. Before Mega Evolving, ${E(bf.d)} has ${[...new Set(bf.a)].map(E).join(' or ')}.` : p.a.length === 1 ? 'Its only Ability.' : abTop ? "Share of players' sets with each Ability." : '';
  const shared = list.filter(a => abSh.get(a) != null), bar = shared.length > 1 ? `<div class="pk-abbar" aria-hidden="true">${shared.map((a, i) => `<i class="a${i}" style="flex:${Math.max(.6, +abSh.get(a))}"></i>`).join('')}</div>` : '';
  const items = list.map((a, i) => { const v = abSh.get(a), top = abTop && abTop[0] === a && p.a.length > 1;
    return `<div class="pk-ab"><p class="pk-abh"><i class="a${shared.indexOf(a) < 0 ? 'x' : shared.indexOf(a)}" aria-hidden="true"></i><b class="u">${E(a)}</b>${top ? `<span>most used${v != null ? ', ' + E(pctFmt(+v)) : ''}</span>` : v != null && p.a.length > 1 ? `<span>${E(pctFmt(+v))}</span>` : ''}</p><p>${E(SHT.abDesc(a))}</p></div>`; }).join('');
  return `<section class="pk-sec" aria-labelledby="pk-s5">${V2.pkHead(5, p.a.length > 1 ? 'Abilities' : 'Ability', '', 'pk-s5')}${bar}<div class="pk-abs" style="--n:${Math.min(3, list.length)}">${items}</div>${note ? `<p class="fine">${note}</p>` : ''}</section>`; };
// 6. Why it rates N (today's: the note and the four reasons, What the data says, Other tier lists): the reasons as a till receipt (Track
// Record's paper), the evidence as paper slips
V2.pkWhy = p => { const E = V2.esc, r = rating(p), rs = RS(r.total), T = lTier(r.total), B = lairBars(p), of = (lairRank(p) || {of: lairRows().length}).of;
  const lines = B.map(([l, v, note]) => `<li><p class="trk-ln"><span>${E(l)}</span><i aria-hidden="true"></i><b class="u">${v == null ? '–' : v}</b></p><small>${v == null ? '' : `Top ${Math.max(1, 100 - v)}% of Pokémon`}${note ? (v == null ? '' : ' · ') + E(V2.txt(note)) : ''}</small></li>`).join('');
  const receipt = `<section class="trk-rc pk-rc" aria-labelledby="pk-s6r"><i class="trk-tape" aria-hidden="true"></i><p class="trk-rn u" aria-hidden="true">NastyPlot</p><p class="trk-rk" aria-hidden="true">* * * ${E(V2.disp(p.n))} * * *</p>
    <h3 class="pk-rt" id="pk-s6r">Why it rates ${rs}</h3>${B.length ? `<p class="trk-rs">Each bar ranks it against the ${of} Pokémon with tournament results: 94 means better than 94% of them. Its rating is ${E(rRange(r))}${r.band >= 10 ? '; few games so far, so treat it as an estimate' : ''}.</p><ul class="trk-lines">${lines}</ul>`
      : `<p class="trk-rs">No tournament results yet, so this is a rough placeholder from its stats, typing and tools (never above ${RS(30)}). It moves up once it shows up at events.</p>`}
    <p class="trk-tot"><span>Rating</span><b>${rs}</b></p><div class="trk-bar" aria-hidden="true"><i></i><span class="trk-stamp hit">${E(T.k)} tier</span></div></section>`;
  const ev = lairEvidence(p), slips = ev.length ? `<ul class="pk-slips">${ev.map(e => `<li class="pk-slip"><span>${E(e[0])}</span><b>${E(V2.txt(e[1]))}</b><small>${E(V2.txt(e[2]))}</small></li>`).join('')}</ul>` : '<p>No tournament or ladder games yet: this rating comes from stats, typing and tools.</p>';
  const O = (() => { const pf = activePerf(); return pf && pf.outside && pf.outside.lists && pf.outside.lists.length ? pf.outside : null; })();
  const outs = O ? `<h3 class="pk-k u">Other tier lists</h3><div class="ms-out">${O.lists.map(L => { const v = O.data[L.k] && O.data[L.k][p.n]; return `<a href="${E(L.url)}" target="_blank" rel="noopener"><b>${v ? E(L.tiers[v]) : '–'}</b><span>${E(L.name)}<small>${v ? E(L.how) : 'not listed · ' + E(L.note)} · ${E(perfDateText(L.date))}</small></span></a>`; }).join('')}</div><p class="fine">Shown for comparison, not counted in the score.</p>` : '';
  return `<section class="pk-sec" aria-labelledby="pk-s6">${V2.pkHead(6, `Why it rates ${rs}`, 'Rating · What the data says · Other tier lists', 'pk-s6')}<div class="pk-why">${receipt}<div class="pk-data"><h3 class="pk-k u">What the data says</h3>${slips}${outs}</div></div><p class="ra-links"><a class="np-link" href="#method=rating">How Ratings Work ›</a><a class="np-link" href="#track">Track Record ›</a>${V2.FB && V2.FB.ok ? '<a class="np-link" href="#feedback" data-fbmistake="pokemon">Report a Mistake</a>' : ''}</p></section>`; }; /* the sheet's links, as on the Meta page; Report a Mistake as on Damage Calc (the feedback note records this Pokémon) */
// Forms (Sim, Nov 15: A): a strip to jump between forms, and today's "Forms side by side" as a Team Sheet-style table
V2.pkForms = p => { const E = V2.esc, forms = ROSTER.filter(q => q.b === p.b); if (forms.length < 2) return {strip: '', table: ''};
  const strip = `<nav class="pk-forms" style="--n:${forms.length}" aria-label="Forms of ${E(V2.disp(p.b))}">${forms.map(q => { const rq = rating(q); return `<a href="#pokemon=${V2.monSlug(q.n)}"${q.n === p.n ? ' aria-current="page"' : ''}>${V2.mon(q.n, {iw: 56, bare: true})}<span><b>${V2.nameHtml(V2.disp(q.n))}</b><small>${RS(rq.total)} · ${E(lTier(rq.total).k)} tier</small></span></a>`; }).join('')}</nav>`;
  const D = forms.map(q => { const rq = rating(q), hq = lairHead(q); return {q, rs: RS(rq.total), tk: lTier(rq.total).k, u: hq.hU, w: hq.hW, tot: q.st.reduce((a, b) => a + b, 0)}; });
  const best = vals => { const ok = vals.filter(v => v != null); if (ok.length < 2) return () => false; const mx = Math.max(...ok); return ok.filter(x => x === mx).length === 1 ? v => v === mx : () => false; }; /* marked only when one form alone is best */
  const row = (lab, f, txt) => { const vs = D.map(f), b = best(vs); return `<tr><th scope="row" class="u">${lab}</th>${D.map((d, i) => `<td${b(vs[i]) ? ' class="best"' : ''}>${txt ? txt(d, vs[i]) : vs[i] == null ? '–' : vs[i]}</td>`).join('')}</tr>`; };
  const table = `<section class="pk-sec" aria-labelledby="pk-s7">${V2.pkHead(7, 'Forms side by side', 'Rating · Usage · Base stats', 'pk-s7')}<p class="fine">When one form is best in a row, it is marked. Mega forms need their Mega Stone held; a team runs one Mega.</p>
    <div class="pk-ftw"><table class="pk-ft"><thead><tr><td></td>${D.map(d => `<th scope="col">${V2.mon(d.q.n, {iw: 72, bare: true})}<b class="u">${V2.nameHtml(V2.disp(d.q.n))}</b></th>`).join('')}</tr></thead><tbody>
    ${row('Rating', d => +d.rs, d => `${d.rs} · ${E(d.tk)} tier`)}${row('On teams', d => d.u, (d, v) => v == null ? '–' : E(pctFmt(v)))}${row('Win rate', d => d.w, (d, v) => v == null ? '–' : E(pctFmt(v)))}
    <tr><th scope="row" class="u">Type</th>${D.map(d => `<td>${E(d.q.t.join(' / '))}</td>`).join('')}</tr><tr><th scope="row" class="u">Ability</th>${D.map(d => `<td>${[...new Set(d.q.a)].map(E).join(' or ')}</td>`).join('')}</tr>
    ${['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'].map((l, j) => row(l, d => d.q.st[j])).join('')}${row('Total', d => d.tot)}</tbody></table></div>
    <p class="fine">On teams, win rate and rating: tournament teams. Base stats: game data.</p></section>`;
  return {strip, table}; };

// Sim, Nov 15 (Q1 A): on phones parts 3-6 fold to their heading and one line, so the page is about half as long; "Show ›" opens a part
// (remembered per part), a jump link to it opens it too. Desktop shows every part as before. The line uses the same data as the part.
V2.pkSums = p => { const E = V2.esc, o = {};
  try { const M = SHT.matchups(p), q = M.g.q || [], d = M.g.d || []; o['pk-s3'] = [q.length ? `4× weak: ${q.join(', ')}` : '', d.length ? `2× weak: ${d.join(', ')}` : ''].filter(Boolean).join(' · ') || 'No weaknesses'; } catch (e) {}
  try { const sp = SHT.speeds(p), run = sp.find(x => x.main) || sp.find(x => x.k === 'max'); if (run) o['pk-s4'] = `${run.v} Speed${run.main ? ' (what players run)' : ''}${run.os ? ` · outspeeds ${run.os.pct}% of the top 30` : ''}`; } catch (e) {}
  try { const st = setFor(p) || {}, sh = new Map((st.ab || []).map(([a, v]) => [a, v])); o['pk-s5'] = [...new Set(p.a)].sort((x, y) => (+(sh.get(y) ?? -1)) - (+(sh.get(x) ?? -1))).map(a => sh.get(a) != null && p.a.length > 1 && +sh.get(a) >= 1 ? `${a} (${Math.round(+sh.get(a))}%)` : a).join(' or '); } catch (e) {}
  try { o['pk-s6'] = lairBars(p).filter(([, v]) => v != null).map(([l, v]) => `${l} ${v}`).join(' · '); } catch (e) {}
  try { const f = ROSTER.filter(q => q.b === p.b); if (f.length > 1) o['pk-s7'] = `${f.length} forms: ${f.map(q => V2.disp(q.n)).join(', ')}`; } catch (e) {}
  for (const k in o) o[k] = E(o[k]); return o; };
// wide screens pair folded parts two across; a folded part left without a partner takes the full width (no lone tile beside an empty half)
V2.pkPair = () => { const kids = [...document.querySelectorAll('#main .pk > *')]; let run = [];
  const flush = () => { run.forEach((el, i) => el.classList.toggle('pk-solo', run.length % 2 === 1 && i === run.length - 1)); run = []; };
  kids.forEach(el => { if (el.classList.contains('pk-fold') && !el.classList.contains('open')) run.push(el); else { el.classList.remove('pk-solo'); flush(); } }); flush(); };
V2.pkOpen = id => { try { return localStorage.getItem('np2.pkopen.' + id) === '1'; } catch (e) { return false; } };
V2.pkFoldAll = (html, p) => { const S = V2.pkSums(p);
  return ['pk-s3', 'pk-s4', 'pk-s5', 'pk-s6', 'pk-s7'].reduce((h, id) => { const tag = `<section class="pk-sec" aria-labelledby="${id}">`; const i = h.indexOf(tag); if (i < 0 || !S[id]) return h;
    const j = h.indexOf('</header>', i) + '</header>'.length, open = V2.pkOpen(id);
    const sum = `<div class="pk-sum"><p>${S[id]}</p><button type="button" class="np-link" data-pkopen="${id}" aria-expanded="${open}" aria-controls="${id}-sec">${open ? 'Hide' : 'Show ›'}</button></div>`;
    return h.slice(0, i) + `<section class="pk-sec pk-fold${open ? ' open' : ''}" id="${id}-sec" aria-labelledby="${id}">` + h.slice(i + tag.length, j) + sum + h.slice(j); }, html); };
V2.pkSetOpen = (id, open) => { const s = document.getElementById(id + '-sec'), b = s && s.querySelector('[data-pkopen]'); if (!s) return; s.classList.toggle('open', open);
  if (b) { b.setAttribute('aria-expanded', open); b.textContent = open ? 'Hide' : 'Show ›'; } try { localStorage.setItem('np2.pkopen.' + id, open ? '1' : '0'); } catch (e) {} V2.pkPair(); if (open) V2.pkFlags(); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-pkopen]'); if (!b) return; const s = document.getElementById(b.dataset.pkopen + '-sec'); V2.pkSetOpen(b.dataset.pkopen, !(s && s.classList.contains('open'))); });
V2.pkFocusName = () => { if (!V2.pkFocus) return; V2.pkFocus = 0; const h = document.querySelector(innerWidth < 900 ? '.pk-card .mc-nm' : '.pk-is h1') || document.querySelector('.pk-is h1'); if (h) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-pgfocus', ''); h.focus({preventScroll: true}); h.addEventListener('blur', () => { h.removeAttribute('tabindex'); h.removeAttribute('data-pgfocus'); }, {once: true}); } }; /* tabindex only while focused (a lasting one reads as a control) */
V2.pages.pokemon = {place: 'meta', after() { V2.fitMsName('.pk-card .mc-id>.mc-nm'); V2.pkPair(); V2.pkFlags(); V2.pkFocusName(); }, draw() { const p = V2.monFromHash(), E = V2.esc;
  if (!p) return `<div class="ra gsp"><section class="ra-h"><p class="np-eyebrow"><span>Pokémon</span></p><h1 class="u">No Pokémon here.</h1><p class="ra-lede">This address doesn't match a Pokémon in Reg M-C. <a class="np-link pk-404" href="#meta">Every Pokémon, by tier</a></p></section></div>`;
  try { document.title = `${V2.disp(p.n)}: rating, sets and partners · NastyPlot`; } catch (e) {} /* a real page title per Pokémon (brief section 10: being found from a search) */
  let k = 0; /* section numbers follow the page order, so a part that isn't shown (no partners) leaves no gap (audit Nov 15) */
  return `<div class="ra pk"><nav class="pk-trail" aria-label="You are here"><a href="#meta">Meta</a><span aria-hidden="true">›</span><a href="#meta">Ratings</a><span aria-hidden="true">›</span><span aria-current="page">${E(V2.disp(p.n))}</span></nav>
    ${V2.pkTop(p)}${V2.pkForms(p).strip}${V2.pkStats(p)}${(() => { const pr = V2.pkPartners(p); return V2.pkJumps([['pk-name', 'Is it good?'], ['pk-s1', 'How to build it'], ...(pr ? [['pk-s2', 'Who it teams with']] : []), ['pk-s3', 'What beats it'], ['pk-s4', 'How fast it is'], ['pk-s6', `Why it rates ${RS(rating(p).total)}`], ...(ROSTER.filter(q => q.b === p.b).length > 1 ? [['pk-s7', 'Forms side by side']] : [])]) + V2.pkBuild(p) + pr + V2.pkTypes(p) + V2.pkSpeed(p) + V2.pkAbilities(p) + V2.pkWhy(p); })()}
    ${V2.pkForms(p).table}</div>`.replace(/(<i class="pk-no u" aria-hidden="true">)\d+(<\/i>)/g, (m, a, b) => a + (++k) + b).replace(/^/, '').replace(/[\s\S]*/, h => V2.pkFoldAll(h, p)); }};
// the tab title goes back to the site's own when you leave a Pokémon page
V2.title0 = document.title; addEventListener('hashchange', () => { if (V2.route() !== 'pokemon') try { document.title = V2.title0; } catch (e) {} });
addEventListener('resize', () => requestAnimationFrame(() => { if (V2.route() === 'pokemon') { V2.fitMsName('.pk-card .mc-id>.mc-nm'); V2.pkFlags(); } }));

// phones: part 1's full Moves and Items lists fold behind "All Moves and Items ›" (Usually and the typical set already sum them up)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-pklists]'); if (!b) return; const l = document.getElementById('pk-lists'); if (!l) return; const open = !l.classList.contains('open');
  l.classList.toggle('open', open); b.setAttribute('aria-expanded', open); b.textContent = open ? 'Hide' : 'All Moves and Items ›'; try { localStorage.setItem('np2.pkopen.pk-lists', open ? '1' : '0'); } catch (x) {} });
