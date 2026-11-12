// ---------- Home (R4 Home, Nov 12): built piece by piece from the approved mock-up (docs/rebuild/mocks/home.tpl.html) ----------
// Every Home feature of today's site is kept (behaviour tests HOME-01..16). Numbers come from shared logic (05-home-data.js,
// CH.metaSix, RES), so both sites say the same thing. Piece 1: the hero (tagline, start buttons, Import, Most used right now).
V2.homeHero = () => { const E = V2.esc, ms = members(), has = ms.length > 0, six = CH.metaSix(), n = (typeof RES === 'object' && RES && RES.teams) || 0;
  // start buttons (today's order: Score my team first with a team, Build me a team first with none; then Plan a match)
  const go = has ? `<a class="np-btn" href="#team">Score My Team</a><a class="np-btn2" href="#build"><span>Build a Team</span></a>`
    : `<a class="np-btn" href="#build">Build Me a Team</a><a class="np-btn2" href="#team"><span>Score My Team</span></a>`;
  const used = (p, rank) => p ? `<button type="button" class="hm-used${rank === 1 ? ' one' : ''}" data-v2mon="${E(p.n)}" aria-label="${E(V2.disp(p.n))}, most used #${rank}, ${homePct(p)}% of teams: open its info">${V2.mon(p.n, {iw: rank === 1 ? 200 : 150})}<small><span class="num">${homePct(p)}%</span> of teams${rank === 1 ? ' · #1' : ''}</small></button>` : '';
  return `<section class="hm-hero"><div class="hm-lead"><div class="np-eyebrow"><span>Pokémon Champions · Reg M-C · VGC doubles</span></div>
    <h1 class="u hm-tag"><span>Sharply raise</span> <span class="pl">your win rate.</span></h1>
    <p class="hm-intro">Score your team, see what beats it, and plan every match, from ${n ? homeNum(n) + ' real tournament teams' : 'real tournament results'}.</p>
    <div class="row hm-go">${go}<a class="np-btn2" href="#battle"><span>Plan a Match</span></a></div>
    <p class="hm-imp">Already have a team? <button type="button" class="np-link" data-v2homeimport>Import from Showdown</button></p></div>
    <div class="hm-usedw"><div class="np-eyebrow"><span>Most used right now</span></div><div class="hm-three">${used(six[1], 2)}${used(six[0], 1)}${used(six[2], 3)}</div><p class="fine hm-src">${E(homeSrcLine())}</p></div></section>`; };
V2.pages.home = {place: 'home', draw() { return `<div class="hm2">${V2.homeHero()}</div>`; }};
// "Import from Showdown" (HOME-07): My Team with the Import box open, as today
document.addEventListener('click', e => { if (!e.target.closest('[data-v2homeimport]')) return; location.hash = '#team'; setTimeout(() => V2.openImport(), 120); });
