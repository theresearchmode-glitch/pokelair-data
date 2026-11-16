// ---------- Meta > Tournaments > Archetypes (Nov 15): Sim's pick "The Weather Map" (docs/rebuild/mocks/tournaments-tickets-weather/BRIEF.md) ----------
// Everything today's Archetypes tab does (42-archetype-guides.js renderGuides), from the same shared helpers: guideCounts (how many of the
// latest top teams play each style), guideKeyMons, guideYours, GUIDE (what it is, How to beat it). All eight styles, biggest first, each
// with its share and count, description, Key Pokémon, How to beat it and What your team has; the note that a team can count twice.
// Each style is drawn as what it is, a flat scene in its own type colour (--ty-*, white text 4.6:1 or better): Tailwind Flying, Sun Fire,
// Rain Water, Sand Ground, Snow Ice, Grassy Terrain Grass, Psychic Terrain Psychic, Trick Room Ghost; Electric Terrain Electric (This Week).
// The scenes are still (no motion). New to the page and waiting on Sim's yes (brief section 9): the "Your team's style" plate, the
// "Your style" tags, the ranks "No. 1" to "No. 8", and the names "The Weather Map", "Other styles", "‹ Back to the Weather Map".
V2.arUi = V2.arUi || {open: null};
V2.WX = {tw: 'tw', sun: 'sun', rain: 'rain', sand: 'sand', snow: 'snow', grassy: 'grassy', psy: 'psy', tr: 'tr', elec: 'elec'};
V2.arData = () => { if (typeof guideCounts !== 'function') return null; const {counts, n} = guideCounts();
  const rows = GUIDE_ORDER.slice().sort((x, y) => (counts[y] || 0) - (counts[x] || 0)).map((k, i) => ({k, i, c: counts[k] || 0, pct: n ? Math.round(100 * (counts[k] || 0) / n) : 0, name: ARCH[k].name}));
  return {rows, n}; };
// the styles your own team plays, read with the team's game-plan labels (teamPlanLabel), matched to the guide styles
V2.arMine = () => { const ms = members(); if (!ms.length) return []; let lab = ''; try { lab = teamPlanLabel(ms.map(m => m.p.n)) || ''; } catch (e) {}
  const L = lab.split(' · ').map(x => x.trim().toLowerCase()); return GUIDE_ORDER.filter(k => L.includes(ARCH[k].name.toLowerCase())); };
V2.arScene = k => `wx wx-${V2.WX[k] || 'tw'}`;
V2.arRegion = (x, n, mine, row) => { const E = V2.esc, km = guideKeyMons(x.k), show = row === 0 ? 5 : row === 1 ? 3 : 2, you = mine.includes(x.k);
  return `<button type="button" class="ar-reg ${V2.arScene(x.k)} r${row}" style="--g:${Math.max(1, x.c)}" data-argo="${x.k}" aria-label="${E(x.name)}, ${x.pct}% of top teams, ${x.c} of ${n}.${you ? ' Your style.' : ''} Open guide.">
    <span class="ar-rk" aria-hidden="true"><b class="u">No. ${x.i + 1}</b>${you ? '<i class="ar-you">Your style</i>' : ''}</span>
    <span class="ar-nm u" aria-hidden="true">${E(x.name)}</span>
    <span class="ar-sh" aria-hidden="true"><b class="u">${x.pct}%</b><small><span class="c1">of top teams</span> <span class="c2">${x.c} of ${n}</span><span class="c3">${x.c} of ${n} teams</span></small></span>
    <span class="ar-km" aria-hidden="true">${km.slice(0, show).map((p, j) => `<span class="${j ? '' : 'lead'}">${V2.mon(p.n, {bare: true})}</span>`).join('')}</span></button>`; };
// row heights from the counts (audit, Nov 15): every region in a row is bigger than any region in the row under it, so a bigger region
// always means more teams; widths in a row follow the counts. Phones use their own full-width rows (CSS), where the same holds.
V2.arHeights = rows => { const sh = L => { const t = L.reduce((a, x) => a + Math.max(1, x.c), 0); return {mn: Math.min(...L.map(x => Math.max(1, x.c))) / t, mx: Math.max(...L.map(x => Math.max(1, x.c))) / t}; };
  const [a, b, c] = rows.map(sh), h2 = 152, h1 = Math.min(360, Math.max(216, Math.ceil(1.08 * h2 * c.mx / b.mn / 4) * 4)), h0 = Math.min(440, Math.max(264, Math.ceil(1.08 * h1 * b.mx / a.mn / 4) * 4)); return [h0, h1, h2]; };
V2.arMap = (D, mine) => { const R = D.rows, rows = [R.slice(0, 2), R.slice(2, 5), R.slice(5)], H = V2.arHeights(rows);
  return `<section class="ar-map" aria-label="The Weather Map: the eight team styles, biggest first">${rows.map((L, r) => `<div class="ar-row r${r}" style="--h:${H[r]}px">${L.map(x => V2.arRegion(x, D.n, mine, r)).join('')}</div>`).join('')}</section>
    <p class="fine ar-note">A team can count for more than one style, so the regions add up to more than ${D.n} teams.</p>`; };
V2.arGuide = (x, D, mine) => { const E = V2.esc, g = GUIDE[x.k], km = guideKeyMons(x.k), ms = members(), y = ms.length ? guideYours(x.k, ms) : null, you = mine.includes(x.k);
  const banner = `<section class="ar-ban ${V2.arScene(x.k)}" aria-label="${E(x.name)}"><div class="ar-bt">${you ? '<i class="ar-you">Your style</i>' : ''}<h2 class="u">${E(x.name)}</h2>
      <p class="ar-sh"><b class="u">${x.pct}%</b><small><span>of top teams</span> <span>${x.c} of ${D.n}</span></small></p><p class="ar-what">${E(g.what)}</p></div>
    ${km.length ? `<div class="ar-keys"><p class="ar-kk">Key Pokémon</p><ul>${km.map((p, j) => `<li class="${j ? '' : 'lead'}"><button type="button" class="ar-key" data-v2mon="${E(p.n)}" aria-label="${E(p.d)}: open its page">${V2.mon(p.n, {bare: true})}<span>${E(p.d)}</span></button></li>`).join('')}</ul></div>` : ''}</section>`;
  const beat = `<section class="ar-beat"><h3 class="u">How to beat it</h3><ol>${g.beat.map((b, i) => `<li><i class="ar-no u ${V2.arScene(x.k)}" aria-hidden="true">${i + 1}</i><span>${E(b)}</span></li>`).join('')}</ol></section>`;
  const has = y ? `<section class="ar-has"><h3 class="u">What your team has</h3>${y.length ? `<ul>${y.map(({m, why}) => `<li>${V2.mon(m.p.n, {iw: 48, bare: true})}<div><b>${E(m.d)}</b><small>${why.map(E).join(' · ')}</small></div><i class="ar-ok" aria-label="has an answer">✓</i></li>`).join('')}</ul>` : '<p class="ar-none"><b>Nothing on your team directly answers it.</b> One of the ideas in How to beat it would help.</p>'}</section>`
    : `<section class="ar-has"><h3 class="u">What your team has</h3><p class="ar-none">Add your team on My Team to see which of your Pokémon answer it. <a class="np-link" href="#team">Go to My Team ›</a></p></section>`;
  const others = `<nav class="ar-oth" aria-label="Other styles"><h3 class="u">Other styles</h3><ul>${D.rows.map(o => `<li><button type="button" class="ar-mini ${V2.arScene(o.k)}${o.k === x.k ? ' on' : ''}" data-argo="${o.k}" aria-current="${o.k === x.k}" aria-label="${E(o.name)}, ${o.pct}% of top teams${mine.includes(o.k) ? ', your style' : ''}"><span class="u">${E(o.name)}</span><small>${o.pct}%</small>${mine.includes(o.k) ? '<i class="ar-you">You</i>' : ''}</button></li>`).join('')}</ul></nav>`;
  return `<section class="ar-guide"><header class="ar-gh"><h2 class="u">${E(x.name)} Guide</h2><button type="button" class="np-link" data-arback>‹ Back to the Weather Map</button></header>${banner}<div class="ar-cols">${beat}${has}</div>${others}</section>`; };
// the plate at the top right: the styles your team plays and how many top teams play them too
V2.arPlate = (D, mine) => { const E = V2.esc, L = mine.map(k => D.rows.find(r => r.k === k)).filter(Boolean);
  return `<aside class="ev-plate ar-plate" aria-label="Your team's style"><p class="ev-pk u">Your team's style</p>${L.length ? `<p class="ar-pn u">${L.map(x => E(x.name)).join(' + ')}</p>
    <ul class="ar-pl">${L.map(x => `<li><b class="u">${x.pct}%</b><span>of top teams also play <b>${E(x.name)}</b>, ${x.c}\u00a0of\u00a0${D.n}</span></li>`).join('')}</ul>` : `<p class="ar-none">${members().length ? "Your team doesn't play one of these eight styles: it's read as a balanced team." : 'Add your team on My Team to see which styles it plays.'}</p>`}</aside>`; };
V2.pages.archetypes = {place: 'meta', draw() { const D = V2.arData(), U = V2.arUi;
  const tabs = `${V2.tourTabs('archetypes')}`;
  const head = `<section class="ra-h"><p class="np-eyebrow"><span>Meta · Tournaments · Archetypes</span></p><h1 class="u"><span>What you'll face,</span> <span class="pl">style by style.</span></h1>
    <p class="ra-lede">The team styles you'll face most, how they win, and how to play into them.</p>${D && D.n ? `<p class="wt-facts">From the latest <b>${D.n}</b> top tournament teams</p>` : ''}</section>`;
  if (!D || !D.n) return `<div class="ra gsp ar"><div class="gs-top wt-top ev-top">${head}</div>${tabs}<div class="gs-body"><p class="tm-sub">Usage numbers appear once top teams load.</p></div></div>`;
  const mine = V2.arMine(), x = U.open && D.rows.find(r => r.k === U.open);
  const body = x ? V2.arGuide(x, D, mine) : `<header class="ev-wh"><h2 class="u">The Weather Map</h2><p>The bigger the region, the more of the ${D.n} top teams play that style. Tap a region for its guide.</p></header>${V2.arMap(D, mine)}`;
  return `<div class="ra gsp ar"><div class="gs-top wt-top ev-top">${head}<div class="ra-spotw">${V2.arPlate(D, mine)}</div></div>${tabs}<div class="gs-body">${body}</div></div>`; }};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-argo],[data-arback]'); if (!b) return;
  V2.arUi.open = b.dataset.argo || null; if (location.hash !== '#archetypes') location.hash = '#archetypes'; else V2.redraw();
  const t = document.querySelector(V2.arUi.open ? '.ar-guide' : '.ar-map'); if (t) t.scrollIntoView({block: 'start'}); });
