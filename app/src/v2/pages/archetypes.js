// ---------- Meta > Tournaments > Archetypes: "The Playbooks" on the shared kit (reskin Nov 22; Sim's PC mock-up, call "Keep as drawn") ----------
// Mock-up: docs/rebuild/mocks/cohesion-nov21/pages/archetypes.html (branch claude/cohesion-mocks); plan-name "THE PLAYBOOKS" (PAGES.md).
// Everything the Weather Map page did (Nov 15), from the same shared helpers: guideCounts (how many of the latest top teams play each
// style), guideKeyMons, guideYours, GUIDE (what it is, How to beat it). All eight styles, most played first, each with its share and count;
// the styles your team plays and how many top teams play them too; each style's guide (what it is, its key Pokémon as a mini roster of kit
// cards, How to beat it, What your team has, Other styles); the note that a team can count twice.
// The page: the kit head; step 1 "Your team's style" (the facts + the page's one pink move, OPEN YOUR PLAYBOOK.); step 2 "The playbooks",
// one book per style in its type colour (V2.SDT_WXTY, as the Weather Map's scenes), the two most played as the big books, each with its
// lead key Pokémon. A book opens its guide in place (V2.arUi.open), as the map's regions did; the tests' hooks are kept (.ar-reg, .ar-nm,
// data-argo with the same label, .ar-guide, .ar-gh, data-arback, .ar-none .np-link).
V2.arUi = V2.arUi || {open: null};
V2.WX = {tw: 'tw', sun: 'sun', rain: 'rain', sand: 'sand', snow: 'snow', grassy: 'grassy', psy: 'psy', tr: 'tr', elec: 'elec'};
V2.arData = () => { if (typeof guideCounts !== 'function') return null; const {counts, n} = guideCounts();
  const rows = GUIDE_ORDER.slice().sort((x, y) => (counts[y] || 0) - (counts[x] || 0)).map((k, i) => ({k, i, c: counts[k] || 0, pct: n ? Math.round(100 * (counts[k] || 0) / n) : 0, name: ARCH[k].name}));
  return {rows, n}; };
// the styles your own team plays, read with the team's game-plan labels (teamPlanLabel), matched to the guide styles
V2.arMine = () => { const ms = members(); if (!ms.length) return []; let lab = ''; try { lab = teamPlanLabel(ms.map(m => m.p.n)) || ''; } catch (e) {}
  const L = lab.split(' · ').map(x => x.trim().toLowerCase()); return GUIDE_ORDER.filter(k => L.includes(ARCH[k].name.toLowerCase())); };
V2.arScene = k => `wx wx-${V2.WX[k] || 'tw'}`; /* This Week's tiles still use the scenes */
// a style's colour: its type colour (a token), as the Weather Map's scenes; white words on it
V2.arTy = k => `--wc:var(--ty-${(V2.SDT_WXTY || {})[k] || 'Flying'})`;
V2.arArt = (n, cls) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null; return id ? `<img class="${cls}" src="${V2.art(id, true)}" alt="" loading="lazy" decoding="async">` : ''; };
// one playbook: the whole book is the button; big = the two most played
V2.arBook = (x, n, mine) => { const E = V2.esc, lead = (guideKeyMons(x.k) || [])[0], you = mine.includes(x.k), big = x.i < 2;
  return `<li class="${big ? 'big' : x.i < 5 ? 'mid' : 'sm'}"><button type="button" class="ar-reg ar-bk" style="${V2.arTy(x.k)}" data-argo="${x.k}" aria-label="${E(x.name)}, ${x.pct}% of top teams, ${x.c} of ${n}.${you ? ' Your style.' : ''} Open guide.">
    ${lead ? V2.arArt(lead.n, 'ar-bkart') : ''}<span class="ar-rk" aria-hidden="true"><b>No. ${x.i + 1}</b>${you ? V2.kMine('Your style') : ''}</span>
    <span class="ar-nm u" aria-hidden="true">${E(x.name)}</span>
    <span class="ar-pc" aria-hidden="true"><b class="u">${x.pct}%</b> <span class="ar-of">of top teams</span> <span class="ar-ct">${x.c} of ${n}</span></span>
    <span class="ar-open" aria-hidden="true">Open the guide ›</span></button></li>`; };
V2.arBooks = (D, mine) => `<section class="ar-map" aria-label="The playbooks: the eight team styles, most played first"><ul class="ar-books">${D.rows.map(x => V2.arBook(x, D.n, mine)).join('')}</ul></section>
    <p class="k-hint ar-note">A team can count for more than one style, so the books add up to more than ${D.n} teams.</p>`;
// step 1: the styles your team plays and how many top teams play them too; the one pink move opens your (first) playbook
V2.arYours = (D, mine) => { const L = mine.map(k => D.rows.find(r => r.k === k)).filter(Boolean);
  if (!L.length) return members().length ? `<p class="k-lead ar-none">Your team doesn't play one of these eight styles: it's read as a balanced team.</p>`
    : `<div class="ar-yb"><p class="k-lead ar-none">Add your team on My Team to see which styles it plays.</p>${V2.kGo('GO TO MY TEAM.', {href: '#team'})}</div>`;
  return `<div class="ar-yb">${V2.kFacts(L.map(x => [x.pct + '%', `of top teams also play ${x.name}, ${x.c} of ${D.n}`, true]))}${V2.kGo('OPEN YOUR PLAYBOOK.', {'data-argo': L[0].k})}</div>`; };
V2.arGuide = (x, D, mine) => { const E = V2.esc, g = GUIDE[x.k], km = guideKeyMons(x.k) || [], ms = members(), y = ms.length ? guideYours(x.k, ms) : null, you = mine.includes(x.k);
  const banner = `<section class="ar-ban" style="${V2.arTy(x.k)}" aria-label="${E(x.name)}"><div class="ar-bt"><p class="ar-rk"><b>No. ${x.i + 1}</b>${you ? V2.kMine('Your style') : ''}</p><h2 class="u">${E(x.name)}</h2>
      <p class="ar-pc"><b class="u">${x.pct}%</b> <span class="ar-of">of top teams</span> <span class="ar-ct">${x.c} of ${D.n}</span></p></div><p class="ar-what">${E(g.what)}</p></section>`;
  const keys = km.length ? V2.kRoster(km.map(p => V2.kCard(p.n, {size: 'small', attrs: {'data-v2mon': p.n, 'aria-label': `${p.d}: open its page`}}))) : '<p class="k-lead">No key Pokémon in the latest top teams.</p>';
  const beat = `<ol class="ar-beat">${g.beat.map((b, i) => `<li><i class="ar-no u" style="${V2.arTy(x.k)}" aria-hidden="true">${i + 1}</i><span>${E(b)}</span></li>`).join('')}</ol>`;
  const has = y ? (y.length ? `<ul class="ar-has">${y.map(({m, why}) => `<li>${V2.mon(m.p.n, {iw: 48, bare: true})}<div><b>${E(m.d)}</b><small>${why.map(E).join(' · ')}</small></div><i class="ar-ok" aria-label="has an answer">✓</i></li>`).join('')}</ul>` : '<p class="ar-none"><b>Nothing on your team directly answers it.</b> One of the ideas in How to beat it would help.</p>')
    : `<p class="ar-none">Add your team on My Team to see which of your Pokémon answer it. <a class="np-link" href="#team">Go to My Team ›</a></p>`;
  const others = `<nav class="ar-oth" aria-label="Other styles"><h3 class="u">Other styles</h3><ul>${D.rows.map(o => `<li><button type="button" class="ar-mini${o.k === x.k ? ' on' : ''}" style="${V2.arTy(o.k)}" data-argo="${o.k}" aria-current="${o.k === x.k}" aria-label="${E(o.name)}, ${o.pct}% of top teams${mine.includes(o.k) ? ', your style' : ''}"><span class="u">${E(o.name)}</span><small>${o.pct}%${mine.includes(o.k) ? ' · yours' : ''}</small></button></li>`).join('')}</ul></nav>`;
  return `<section class="ar-guide"><header class="ar-gh"><h2 class="k-h2 u">${E(x.name)} Guide</h2><button type="button" class="np-link" data-arback>‹ Back to the playbooks</button></header>${banner}${V2.kPlan(
    V2.kStep(1, 'Who runs it.', 'Key Pokémon · tap one for its page', keys) + V2.kStep(2, 'How to beat it.', `${g.beat.length} ways in`, beat) + V2.kStep(3, 'What your team has.', y ? `${y.length} of your ${ms.length} answer it` : '', has))}${others}</section>`; };
V2.pages.archetypes = {place: 'meta', draw() { const D = V2.arData(), U = V2.arUi;
  const tabs = `${V2.tourTabs('archetypes')}`;
  const head = `<section class="ra-h ar-h"><p class="k-kicker np-eyebrow">META · THE PLAYBOOKS</p><h1 class="k-h1 u">What you'll face, <em>style by style.</em></h1>
    <p class="k-lead ra-lede">The team styles you'll face most, how they win, and how to play into them.${D && D.n ? ` From the latest <b>${D.n}</b> top tournament teams` : ''}</p>${tabs}</section>`;
  if (!D || !D.n) return `<div class="ra gsp ar"><div class="gs-top">${head}${tabs}</div><div class="gs-body"><p class="k-lead">Usage numbers appear once top teams load.</p></div></div>`;
  const mine = V2.arMine(), x = U.open && D.rows.find(r => r.k === U.open), L = mine.map(k => D.rows.find(r => r.k === k)).filter(Boolean);
  const body = x ? V2.arGuide(x, D, mine) : V2.kPlan(V2.kStep(1, "Your team's style", L.length ? L.map(r => r.name).join(' + ') : '', V2.arYours(D, mine))
    + V2.kStep(2, 'The playbooks', `Most played first. Tap a playbook for its guide.`, V2.arBooks(D, mine)));
  return `<div class="ra gsp ar"><div class="gs-top">${head}${tabs}</div><div class="gs-body">${body}</div></div>`; }};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-argo],[data-arback]'); if (!b) return;
  V2.arUi.open = b.dataset.argo || null; if (location.hash !== '#archetypes') location.hash = '#archetypes'; else V2.redraw();
  const t = document.querySelector(V2.arUi.open ? '.ar-guide' : '.ar-map'); if (t) t.scrollIntoView({block: 'start'}); });
