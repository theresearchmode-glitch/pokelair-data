// ---------- Home: "The Stampede" (Sim, Nov 18: replaces today's Home, incl. Tonight's main event) ----------
// Brief, adaptations and contract: docs/rebuild/stampede/BRIEF.md. Mock-ups: docs/rebuild/stampede/mockups/ (pictures, not specs:
// our rules win where they differ). Four slanted full-width bands: hero (blue), your six (ink), tools (beige), post (red).
// Each band is its own file (stampede-hero / -six / -tools / -post.js, css/sd-*.css) so they can be built side by side; this file
// holds the shared data (live: every number and name comes from the site's own data) and puts the page together.
V2.STAMPEDE = true;
V2._sd = {R: null, D: null};
V2.sdData = () => { let R = null; try { R = ratings(); } catch (e) {} if (V2._sd.D && V2._sd.R === R) return V2._sd.D;
  let rows = []; try { rows = lairRows().filter(x => x.r && x.r.tc).map(x => ({p: x.p, n: x.p.n, d: x.p.d, r: RS(x.r.total), types: x.p.t || [], spe: x.p.st ? x.p.st[5] : null, mega: !!x.p.m})); } catch (e) {}
  // herd (hero builder, Nov 18, lead's decision): every Pokémon the Ratings page lists (lairRows, no results filter: 345), the ones with
  // tournament results first in rating order, then the rest (placeholder ratings) at the back; rank = the Ratings page's shared rank
  let herd = []; try { const all = lairRows().map(x => ({p: x.p, n: x.p.n, d: x.p.d, r: RS(x.r.total), types: x.p.t || [], spe: x.p.st ? x.p.st[5] : null, mega: !!x.p.m, tc: !!x.r.tc}));
    herd = all.filter(x => x.tc).concat(all.filter(x => !x.tc && !V2.unrated(x.p))); /* Not rated yet (Nov 25): an unrated Pokémon is not in the herd, its plates or ticker */ herd.forEach(x => { try { x.rank = x.tc ? (lairRank(x.p) || {}).rank || null : null; /* lairRank gives {rank, of}: the number only (the hero said 'rated number [object Object]', polish Nov 18) */ } catch (e) { x.rank = null; } }); } catch (e) {}
  let champ = null; try { champ = homeChamp(); } catch (e) {}
  const ev = META && META.events && Array.isArray(META.events.events) ? META.events.events.length : 0;
  const D = {rows, rated: rows.length, herd, ratedAll: herd.length, teams: (typeof RES === 'object' && RES && RES.teams) || 0, events: ev, champ};
  V2._sd = {R, D}; return D; };
// a band that isn't built yet says so (Preview only); each band file replaces its own function
V2.sdHero = V2.sdHero || (() => `<section class="sd-band sd-hero" aria-label="Sharply raise your win rate"><h1 class="u">Sharply raise <span>your win rate.</span></h1></section>`);
V2.sdSix = V2.sdSix || (() => `<section class="sd-band sd-six"><h2 class="u">Call six out of the herd.</h2></section>`);
V2.sdTools = V2.sdTools || (() => `<section class="sd-band sd-tools"><h2 class="u">Same herd. Twelve tools.</h2></section>`);
V2.sdPost = V2.sdPost || (() => `<section class="sd-band sd-post"><h2 class="u">The post is in.</h2></section>`);
// the top 10 right now (Sim approved Nov 22, 12:26 PM, with the Ratings stairs): under the hero, the ten best by rating, each a tap to its page,
// and SEE ALL RATINGS to the Ratings page, so the rankings players look for are on the front page
V2.sdTop = () => { const E = V2.esc; let top = []; try { top = V2.ratedRows().slice(0, 10); /* Not rated yet (Nov 25) */ } catch (e) {} if (!top.length) return '';
  return `<section class="sd-top" aria-labelledby="sd-top-h"><h2 class="u" id="sd-top-h">The top 10 <em>right now.</em></h2><ol>${top.map((x, i) => { const k = lairRank(x.p), rk = k ? k.rank : i + 1;
    return `<li><button type="button" data-v2mon="${E(x.p.n)}" aria-label="Number ${rk}: ${E(x.p.d)}, rated ${RS(x.r.total)}: open its page"><b class="r u" aria-hidden="true">${rk}</b>${V2.mon(x.p.n, {bare: true, iw: 40})}<span class="n" aria-hidden="true">${E(x.p.d).replace(/ (\S)$/, '\u00a0$1')}</span><b class="s u" aria-hidden="true">${RS(x.r.total)}</b></button></li>`; }).join('')}</ol>${V2.kGo('SEE ALL RATINGS ›', {href: '#meta'})}</section>`; };
V2.sdPage = () => `<div class="sd">${V2.sdHero()}${V2.sdTop()}${V2.sdSix()}${V2.sdTools()}${V2.sdPost()}</div>`;
V2.sdAfter = () => { for (const f of [V2.sdHeroAfter, V2.sdSixAfter, V2.sdToolsAfter, V2.sdPostAfter]) if (typeof f === 'function') try { f(); } catch (e) {} };
