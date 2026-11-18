// ---------- Home, The Stampede: the post band (see stampede.js and docs/rebuild/stampede/BRIEF.md) ----------
// V2.sdPost = () => html; optional V2.sdPostAfter = () => {} runs after the page is drawn.
// "The post is in." (brief section 4): a Pelipper flies the post in over the band's top edge (a sprite, decorative). Two columns, gifts
// then news (stacked under 1360: two columns only where the small paper keeps its two story columns), built ONLY from the Post Room
// and Dispatch pieces (one family, no second copy):
//   Mystery Gifts   V2.prParcel(the soonest-ending live gift with a code, else the first live gift, {compact}) with its days-left rubber stamp; a row of past-gift stamps (V2.prStamp)
//                   overlapping the parcel's foot (4, or 3 in a narrow column); a code slip for the next live gift that has a code
//                   (V2.prCode + the Post Room's Copy Code button, data-prcopy). "All N Gifts" = live + past (V2.postNow()).
//   Champions News  V2.dpFront(V2.postNow(), {compact}) tilted. "All N Stories" = every story in POST (the #news page lists them all).
// Empty states: no live gift = one line and a link (the stamps still show); no news = the news column goes and the gifts take the
// width as two parcels side by side (the second live gift, or How to collect from the Post Room), so no lone column.
// Every word on the band's red is white (--sd-on-band, 4.88:1 by token); the paper objects keep their own Dim Paper / Lamplight tokens.
V2.sdpData = () => { const P = V2.postNow(), live = P.live.map(V2.prG), past = P.past.map(V2.prG);
  const first = live.find(g => g.code) || live[0] || null, next = live.find(g => g !== first && g.code) || null;
  return {P, live, past, first, next, second: live.find(g => g !== first) || null, gifts: live.length + past.length, news: P.news.length}; };
V2.sdpSlip = g => { const E = V2.esc, d = V2.prDaysLeft(g), left = d == null || d < 0 ? '' : d === 0 ? 'last day' : `${d} ${d === 1 ? 'day' : 'days'} left`;
  return `<div class="sdp-slip"><p class="sdp-sw"><span><b>${E(g.name)}${left ? ',' : ''}</b>${left ? ` <i>${left}</i>` : ''}</span></p><div class="sdp-sc">${V2.prCode(g.code)}</div><button type="button" class="np-btn pr-copy" data-prcopy="${E(g.code)}"><span>Copy Code</span></button></div>`; };
// What's New (HOME-13; Sim Q4d A, Nov 18): a paper slip in the post band, after an update only, never for a first visit; × hides it for
// good. Today's rules and keys (home.js V2.homeNew: cc2.seenNew + this visit's np.wnew, the [data-hmnewx] handler). The items are
// WHATS_NEW's, reworded to the word list (Sim: "after rewording"; "scouting report", "meta threats" and "win odds" are gone); same id,
// so a player who dismissed it doesn't get it again. Open on wide screens, a closed fold on phones.
// What's New for the new site (Sim approved the words, Nov 18): its own id, so every returning player sees it once after the switch
V2.SD_NEW = {id: '2026-11-redesign', items: [
  ['A new look', 'NastyPlot has a new design, easier to read on every screen.'],
  ['Mystery Gifts', 'Every live Mystery Gift code in one place, with the last day to claim it.'],
  ['Champions News', 'The official Pokémon Champions news as a front page, each headline linking to the full story.'],
  ['All Suggestions', 'Every kind of change for your team in one list, best first.'],
  ['Day, Night or Auto', 'The theme button can now follow your device.']]};
V2.sdpNew = () => { const W = V2.SD_NEW; if (!W.id) return ''; let seen = '', welcomed = ''; try { seen = LS.get('cc2.seenNew', ''); welcomed = LS.get('cc2.welcomed', ''); } catch (e) {}
  if (!welcomed) { try { LS.set('cc2.seenNew', W.id); } catch (e) {} return ''; }
  let sess = ''; try { sess = sessionStorage.getItem('np.wnew') || ''; } catch (e) {}
  if (seen === W.id && sess !== W.id) return '';
  try { LS.set('cc2.seenNew', W.id); sessionStorage.setItem('np.wnew', W.id); } catch (e) {}
  const E = V2.esc, wide = innerWidth >= 700;
  return `<section class="sdp-nw hm-newsec" aria-labelledby="sdpNwH"><details class="sdp-nf"${wide ? ' open' : ''}><summary><span class="u sdp-nt" id="sdpNwH">What's New</span><span class="sdp-ns">${W.items.length} updates${wide ? ' to NastyPlot' : ': ' + W.items.slice(0, 2).map(([a]) => E(a)).join(', ') + '…'}</span></summary>
    <ul>${W.items.map(([a, b]) => `<li><b>${E(a)}</b> <span>${E(b)}</span></li>`).join('')}</ul></details><button type="button" class="sdp-nx" data-hmnewx aria-label="Dismiss What's New"><span aria-hidden="true">×</span></button></section>`; };
V2.sdPost = () => { const E = V2.esc, D = V2.sdpData(), n = (k, w) => `All ${homeNum(k)} ${w}${k === 1 ? '' : 's'}`, solo = !D.news;
  const bird = `<div class="sdp-bird" aria-hidden="true"><i class="sdp-ln l1"></i><i class="sdp-ln l2"></i><i class="sdp-ln l3"></i>${V2.mon('Pelipper', {bare: true, iw: 320, big: true})}</div>`;
  const stamps = D.past.length ? `<ul class="sdp-stamps${D.first ? '' : ' sdp-free'}" aria-label="Past gifts">${D.past.slice(0, 4).map(V2.prStamp).join('')}</ul>` : '';
  const parcel = D.first ? `<div class="sdp-stack">${V2.prParcel(D.first, {compact: true})}${stamps}</div>`
    : `<p class="sdp-none">Nothing at the counter right now. The next gift will wait here. <a href="#gifts">Every gift so far ›</a></p>${stamps}`;
  const other = solo ? (D.second ? V2.prParcel(D.second, {compact: true}) : D.first ? V2.prHow() : '') : D.next ? V2.sdpSlip(D.next) : '';
  const gifts = `<section class="sdp-col sdp-gifts" aria-labelledby="sdpGH"><header class="sdp-ch"><h3 class="u" id="sdpGH">Mystery Gifts</h3>${D.gifts ? `<a class="sdp-all" href="#gifts">${n(D.gifts, 'Gift')} ›</a>` : ''}</header>
    <div class="sdp-gb${solo && other ? ' sdp-two' : ''}">${parcel}${other ? `<div class="sdp-other">${other}</div>` : ''}</div></section>`;
  const news = solo ? '' : `<section class="sdp-col sdp-news" aria-labelledby="sdpNH"><header class="sdp-ch"><h3 class="u" id="sdpNH">Champions News</h3><a class="sdp-all" href="#news">${n(D.news, 'Story').replace(/ys$/, 'ies')} ›</a></header>
    <div class="sdp-tilt">${V2.dpFront(D.P, {compact: true})}</div></section>`;
  return `<section class="sd-band sd-post sdp" aria-labelledby="sdpH"><div class="sdp-top"><h2 class="u sdp-h" id="sdpH">The post <span>is in.</span></h2>${bird}
    <p class="sdp-lede">Gift codes before they run out, and the news from Pokémon Champions, carried in by one of the herd.</p></div>${V2.sdpNew()}
    <div class="sdp-cols${solo ? ' sdp-solo' : ''}">${gifts}${news}</div></section>`; };
