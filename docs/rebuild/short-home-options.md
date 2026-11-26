# A shorter Home on phones: options (Nov 18)

Sim, Nov 18 morning: "I also want to find a way to make the homepage shorter on mobile. maybe finding a way to shorten the page
that has the tools. that alone is 3 pages scrolls long. and if we can maybe make the news section a little bit smaller or shorter
too. its ALOT of scrolling tbh."

Look-only work. No site code changed. Every option was built by injecting CSS (and for B, C and Y a few lines of JS that move or
rebuild existing pieces) into the built page `app/dist/v2.html` (branch claude/design6, commit 79127153, built with
`--v2 --preview-data`), phone widths only (`max-width:699.98px`). Desktop is untouched by all of them.

How measured: Playwright Chromium, phone mode, window 390 x 844 (also 360 and 430); a band's height is its box height
(`getBoundingClientRect`). Each band box includes the 36px slanted edge it shares with the band above, so band heights add up to a
little more than the page. 1 screen = 844 px. All numbers below are **measured** unless marked otherwise.

## 1. Where the phone Home's height goes today

| Part | 360 | 390 | 430 |
|---|---|---|---|
| Hero (blue) | 755 px (0.89) | 778 px (0.92) | 778 px (0.92) |
| Your six (ink) | 2172 px (2.57) | 2107 px (2.50) | 2002 px (2.37) |
| **Tools (beige)** | **3134 px (3.71)** | **2541 px (3.01)** | **2542 px (3.01)** |
| **Post: gifts + news (red)** | **1866 px (2.21)** | **1845 px (2.19)** | **1782 px (2.11)** |
| Footer | 370 px | 347 px | 347 px |
| **Whole Home page** | **8355 px (9.90)** | **7655 px (9.07)** | **7488 px (8.87)** |
| Gifts page (#gifts), whole | 4299 px (5.09) | 3818 px (4.52) | 3735 px (4.43) |
| News page (#news), whole | 4467 px (5.29) | 4269 px (5.06) | 4192 px (4.97) |

Sim's "3 pages" for the tools is right: 3.01 screens at 390, 3.71 at 360 (under 380 wide, Ratings, Damage Calc and the four small
plates go one to a row).

Not asked, but found: **the "Your six" band is the second-tallest part (2.5 screens at 390)**. Shortening tools and post alone still
leaves a Home of about 6 to 7 screens. Worth a look next (not measured in detail here; another helper owns the hero and new features).

Inside the tools band at 390: heading 68, the ten plates 1857, Events / How We Calculate 160, More tools 169, plus 100 px of band
padding top and bottom. Inside the post band: heading row 120, gifts 819 (parcel 427 + past-gift stamps 225 overlapping it, then the
second gift's code slip 131), news 662.

## 2. Tools band: three options

All three keep all 12 tools reachable as links to their pages, keep the six "More tools" links, and keep Load Team / Copy for
Showdown on Winning Teams. Pictures stay live data (same plates, same Pokémon).

| Option | 360 | 390 | 430 | vs today at 390 |
|---|---|---|---|---|
| Today | 3134 (3.71) | 2541 (3.01) | 2542 (3.01) | |
| A: tile grid | 1676 (1.99) | 1596 (1.89) | 1560 (1.85) | -37% |
| B: six plates + picture chips | 1337 (1.58) | 1310 (1.55) | 1292 (1.53) | -48% |
| C: swipe row | 923 (1.09) | 865 (1.02) | 842 (1.00) | -66% |

Target was under 1.5 screens. **Only C meets it. B misses by 0.05 screen (about 44 px). A misses clearly.**

### Tools A: tile grid
Picture: `pics/nov18/short-home-tools-A-390-light.png` (today: `pics/nov18/short-home-tools-today-390-light.png`)

What changes: the Speed Tiers race stays a full-width blue strip (4 runners, smaller: 60 px). The other plates become even half-width
tiles, each a 64 px picture, the name, one short line: Type Chart | Ratings, Damage Calc | Battle, Winning Cores | Archetypes,
Test Run | Popular Sets. Winning Teams is one full-width strip (the six in one row, Load Team and Copy for Showdown on one line).
Events and How We Calculate stay a matching pair with their big numbers. The band's top padding is 24 px less.

What's lost or harder: the Type Chart picture becomes 18 colour chips only: the 18 top Pokémon and their own info buttons go from
Home (still on Type Chart). Damage Calc loses its "Dire Claw 81-96%" line and the names under the duel; Popular Sets loses the
Pokémon's name (item kept). Pictures are much smaller everywhere (the brief's "plates of different sizes" becomes mostly even tiles).
Tile titles drop to 15 px. Every tool still has its picture and a line.

### Tools B: six plates + picture chips
Pictures: `pics/nov18/short-home-tools-B-390-light.png`, `pics/nov18/short-home-tools-B-390-dark.png`

What changes: the six feature plates of the brief stay as A's tiles (Speed Tiers, Type Chart, Ratings, Damage Calc, Battle,
Winning Teams). The other six (Winning Cores, Archetypes, Test Run, Popular Sets, Events, How We Calculate) become slanted chips in
two columns, each with a small picture (its plate's Pokémon, or the big number for Events and How We Calculate) and its name.
More tools stays below.

What's lost or harder: the six chips have no one-line description (name and picture only), and Events loses "Next: LAIC, Nov
20-22". Which six get plates is **my choice, not measured**: they are the brief's feature plates. Real use counts exist (the
usage/<id> documents behind #owner), but this session can't read them; Sim could check #owner and swap any chip for a plate.
Plus everything A loses on the six plates.

### Tools C: swipe row
Pictures: `pics/nov18/short-home-tools-C-390-light.png`, and what each swipe shows:
`pics/nov18/short-home-tools-C-plates-390-light.png` (plates 1, 2, 5, 9 and 12)

What changes: all twelve plates in one horizontal row with scroll-snap, each 80% of the width with the next one peeking at the right
edge; every plate keeps a large picture, its name and line (closest to today's look). Under the row: twelve dots and "1 of 12 ·
swipe for more ›". Events and How We Calculate become plates with their big number as the picture. More tools stays below.

What's lost or harder, said plainly: **a swipe row hides 11 of the 12 tools until you swipe.** Many people never swipe sideways,
so the later plates (Popular Sets, Events, How We Calculate) will be seen much less. The peek and the dots help but don't fix that.
The row is as tall as its tallest plate (Winning Teams), so shorter plates have spare room. Not built in this mock-up: the dots
don't follow the swipe yet; no arrow buttons for mouse users (the desktop app on Windows with a mouse wheel can't swipe sideways
easily, so a real build needs arrows or a keyboard path, and C would stay phone-only). The look-only pictures can't show how the
swipe feels; it needs a try on Sim's iPhone.

**Recommendation for tools: B.** It nearly halves the band (3.01 to 1.55 screens) and every tool stays visible on the page with a
picture, so nothing hides behind a swipe. If Sim wants it under 1.5, the next cut is the Type Chart tile's height or the More tools
spacing (my guess, not tested). C is the shortest, but hiding 11 tools sideways works against discovery, which is the band's job.

## 3. Post band (gifts + news): two options

| Option | 360 | 390 | 430 | vs today at 390 |
|---|---|---|---|---|
| Today | 1866 (2.21) | 1845 (2.19) | 1782 (2.11) | |
| X: one parcel, one front page | 1236 (1.46) | 1225 (1.45) | 1169 (1.39) | -34% |
| Y: two cards side by side | 814 (0.96) | 780 (0.92) | 710 (0.84) | -58% |

Both meet "a third or more" (X only just: 1230 px would be exactly a third).

### Post X: one parcel, one front page
Pictures: `pics/nov18/short-home-post-X-390-light.png`, `pics/nov18/short-home-post-X-390-dark.png`
(today: `pics/nov18/short-home-post-today-390-light.png`)

What changes: Mystery Gifts shows only the kraft parcel for the soonest-ending gift (contents, collect by, code, Copy Code, the "4
days left" stamp); its label drops "Sent". The past-gift stamps and the second gift's code slip go. Champions News shows the Dispatch
with masthead, the lead story and the Next event bar; the list of more stories goes. "All 10 Gifts ›" and "All 67 Stories ›" stay.

What's lost or harder: **the second live gift's code (100 Quick Coupons, 43 days left) and its Copy Code button leave Home**; it is
still one tap away on the Gifts page. The four past-gift stamps leave Home (on Gifts). Two more headlines leave Home (on News).

### Post Y: two cards side by side
Picture: `pics/nov18/short-home-post-Y-390-light.png`

What changes: gifts and news become two columns. Left: both live gifts as code slips (name, days left, code, Copy Code), no parcel.
Right: the Dispatch cut to its masthead, the lead story and Next event. Both columns end at the same height.

What's lost or harder: the kraft parcel, its rubber stamp and the past-gift stamps (the brief's signature object) leave Home; the
look is plainer. Everything is squeezed into 171 px columns: codes drop to 13 px (the 14-letter code just fits at 360; a longer code
would not, **unsure** how long future codes get), section titles wrap to two lines, the lead headline runs to 6 lines, and the gift
slips get empty space so the columns end level. Both codes stay on Home.

**Recommendation for the post band: X.** It keeps the parcel and the Dispatch, which are the band's WOW, and cuts it by a third with
nothing lost that the Gifts and News pages don't show one tap away. Y is shorter and keeps both codes, but it trades the bold objects
for two cramped cards, and the column squeeze breaks long codes and headlines.

## 4. Whole Home with the options combined (390 x 844, measured)

| Tools + post | Home page height |
|---|---|
| Today | 7655 px (9.07 screens) |
| A + X | 6089 px (7.21) |
| **B + X (recommended)** | **5804 px (6.88)** |
| B + Y | 5359 px (6.35) |
| C + X | 5359 px (6.35) |
| C + Y | 4914 px (5.82) |

## 5. Unsure / not checked
- Pictures are 390 light (plus dark for B and X); 360 and 430 were measured, not photographed. B was looked at 360 by eye: fits.
- The CSS is a sketch, not a build: no polish check (type scale and 4 px grid were followed, but `experiments/polish-check.mjs` was
  not run), no tablet widths, no keyboard pass. A real build needs all of that.
- Option B and C move existing elements with JS; a real build would change `stampede-tools.js` / `stampede-post.js` instead.
- The Pelipper at the top of the post band sits close to the last row of More tools ("My Box ›") at 390. Tap check (measured,
  elementFromPoint at the left, middle and right of each of the six links): no link covered, today and in A, B and C.
- The hero and six bands were measured on today's branch; another helper is changing the hero, so its height may change.

## Appendix: the option CSS (phone only, as injected)
Scratch copies only; nothing here is in the site's code.

### toolsA.css
```css
/* Tools A: "Tile grid" (phone only). The race stays as a short full-width strip, Winning Teams stays a full-width strip (its Load
   Team / Copy for Showdown buttons), the other eight are even half tiles: a picture 72px tall, the name, one short line. */
@media (max-width:699.98px){
  .sd-tools.sd-band{padding-top:calc(var(--s10) + var(--sd-cut));}
  .sdt-h{margin-bottom:var(--s3)}
  .sdt-grid{gap:var(--s3)}
  .sdt-p{padding:var(--s3) calc(var(--s3) + var(--k))}
  .sdt-t,.sdt-sm .sdt-t{font-size:var(--t17);line-height:1.2;white-space:nowrap}
  .sdt-d{font-size:var(--t13);line-height:1.4}
  /* the race: four runners, shorter, still breaking out of the blue band */
  .sdt-speed{margin-top:var(--s8);padding-block:var(--s2) var(--s3)}
  .sdt-speed .sdt-t{font-size:var(--t20)}
  .sdt-race{margin-top:calc(var(--s8) * -1)}
  .sdt-run .np-mon .st{--iw:60px}.sdt-spe{font-size:var(--t22);margin-top:0}.sdt-run .sdt-mn{min-height:0;margin-top:0}
  .sdt-speed .sdt-tx{padding-bottom:0}
  /* the tiles */
  .sdt-tc,.sdt-ra,.sdt-dc,.sdt-bt,.sdt-sm{grid-column:span 6;margin-top:0;display:flex;flex-direction:column;row-gap:var(--s2)}
  .sdt-tc>:last-child,.sdt-ra>:last-child,.sdt-dc>:last-child,.sdt-bt>:last-child,.sdt-sm>:last-child{order:-1;flex:0 0 72px;height:72px;margin:0;padding:0;align-self:stretch}
  .sdt-sm .sdt-tx{margin-top:0}
  /* Type Chart: the 18 type flags as colour chips, 6 by 3 */
  .sdt-types{grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--s1);align-content:center;margin-top:0}
  .sdt-types .sdt-m,.sdt-types .sdt-none{display:none}.sdt-flag>span{font-size:0;height:20px;padding:0}
  /* Ratings: the podium, small */
  .sdt-ra{color:var(--sd-on-feat)}.sdt-pod{margin:0;align-items:end}.sdt-step .np-mon .st,.sdt-step.s1 .np-mon .st{--iw:40px}
  .sdt-blk{min-height:var(--s4);padding:0}.sdt-step.s1 .sdt-blk{min-height:var(--s6)}.sdt-step.s2 .sdt-blk,.sdt-step.s3 .sdt-blk{min-height:var(--s4)}.sdt-blk b{font-size:var(--t13)}
  /* Damage Calc: the health bar over the duel */
  .sdt-hit{margin:0;gap:var(--s1);align-content:end}.sdt-hpw,.sdt-hit .sdt-cc{display:none}.sdt-hp{height:var(--s2);width:70%}.sdt-duel .np-mon .st{--iw:52px}.sdt-duel .sdt-m{min-height:0}
  /* Battle: two against two, overlapping */
  .sdt-bt .sdt-vs{grid-template-columns:minmax(0,1fr) 28px minmax(0,1fr);gap:0;align-items:end}
  .sdt-side{--bw:44px;padding-top:0;display:flex;justify-content:center}.sdt-side .sdt-m{width:auto;min-width:0}.sdt-side .sdt-m+.sdt-m{margin-left:-16px}
  .sdt-side.you .sdt-m:first-child .st,.sdt-side.them .sdt-m:last-child .st{translate:0 -10px}
  .sdt-vsw{font-size:var(--t20);line-height:1}
  /* the small four */
  .sdt-sm .sdt-pic{display:flex;flex-direction:column;justify-content:flex-end}
  .sdt-core .np-mon .st,.sdt-set .np-mon .st{--iw:56px}.sdt-core~.sdt-cc,.sdt-core .sdt-mn{display:none}.sdt-plus{font-size:var(--t20)}
  .sdt-wx{align-items:end;height:100%}.sdt-wxi .np-mon .st{--iw:44px}.sdt-wxi{gap:2px}.sdt-chip{padding:0 var(--s2);font-size:var(--t13)}
  .sdt-sm .sdt-tr{min-height:0}
  .sdt-set{height:100%;display:flex;align-items:flex-end}.sdt-set .sdt-m{flex-direction:row;align-items:flex-end;gap:var(--s2);text-align:left}.sdt-si{align-items:flex-start;padding:0 0 var(--s1)}.sdt-set .sdt-mn{display:none}.sdt-item{font-size:var(--t13)}
  /* Winning Teams: a full-width strip, the six in one row, the two buttons on one line */
  .sdt-wt{grid-column:1/-1;margin-top:0}
  .sdt-wt .sdt-pic{order:-1;padding:0 0 var(--s2)}.sdt-six{grid-template-columns:repeat(6,minmax(0,1fr))}.sdt-six .np-mon .st{--iw:52px}.sdt-cap{display:none}
  .sdt-wt{display:flex;flex-direction:column}.sdt-wt .sdt-tx{order:1}.sdt-acts{order:2;flex-direction:row;gap:0 var(--s5)}
  /* Events and How We Calculate: two matching halves */
  .sdt-ends{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s3);margin-top:var(--s5)}
  .sdt-end,.sdt-end.hw{flex-direction:column;align-items:flex-start;gap:0}
  .sdt-big{width:auto}.sdt-big b{font-size:var(--t26)}.sdt-big small{font-size:var(--t13)}.sdt-end .sdt-t{font-size:var(--t17)}
  .sdt-end .sdt-d{font-size:var(--t13)}
  .sdt-more{margin-top:var(--s4);padding-top:var(--s1)}.sdt-mh{font-size:var(--t15)}
  .sdt-more ul{grid-template-columns:repeat(2,minmax(0,1fr));gap:0 var(--s3)}.sdt-more .np-link{font-size:var(--t15);padding-top:var(--s3)}
  .sdt-wt{order:9}
  .sdt-tc .sdt-t,.sdt-ra .sdt-t,.sdt-dc .sdt-t,.sdt-bt .sdt-t,.sdt-sm .sdt-t{font-size:var(--t15)}
  .sdt-end .sdt-t{white-space:normal;font-size:var(--t15)}
  .sdt-tc>:last-child,.sdt-ra>:last-child,.sdt-dc>:last-child,.sdt-bt>:last-child,.sdt-sm>:last-child{flex-basis:64px;height:64px}
  .sdt-hp{justify-self:stretch;width:100%}
  .sdt-set .np-mon .st{--iw:48px}.sdt-si{min-width:0}.sdt-item{white-space:normal;padding-inline:var(--s1)}
  .sdt-bt .sdt-vs{grid-template-columns:minmax(0,1fr) 36px minmax(0,1fr)}.sdt-side{--bw:40px}
}
```

### toolsB.css
```css
/* Tools B: six plates (the brief's feature plates) as A's tiles; the other six become picture chips in two columns (name only), then
   More tools as today (phone only). Loaded after toolsA.css. */
@media (max-width:699.98px){
  .optB-hide,.sdt-ends{display:none}
  .optB-chips{margin-top:var(--s5)}
  .optB-chips ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s2) var(--s3)}
  .optB-chip{display:flex;align-items:center;gap:var(--s2);min-height:52px;height:100%;padding:var(--s1) var(--s2) var(--s1) calc(var(--s2) + 8px);background:var(--sd-card);color:var(--sd-card-ink);text-decoration:none;
    clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
  .optB-pic{flex:0 0 auto;min-width:40px;display:flex;align-items:center;justify-content:center}
  .optB-pic img{width:40px;height:40px;object-fit:contain}
  .optB-pic b{font-size:var(--t13);color:var(--plot-text);white-space:nowrap}
  .optB-tx{display:flex;flex-direction:column;min-width:0}
  .optB-tx b{font:700 var(--t15)/1.25 var(--b)}
  .optB-tx small{display:none}
}
```

### toolsB.js
```js
(() => { if (document.querySelector('.optB-chips')) return;
  const more = document.querySelector('.sdt-more'), grid = document.querySelector('.sdt-grid');
  const pick = [...document.querySelectorAll('.sdt-sm'), ...document.querySelectorAll('.sdt-end')];
  const chips = pick.map(p => { const a = p.querySelector('.sdt-go'), img = p.querySelector('img'), big = p.querySelector('.sdt-big b');
    const pic = img ? `<img src="${img.getAttribute('src')}" alt="">` : big ? `<b class="u">${big.textContent}</b>` : '';
    const line = (p.querySelector('.sdt-s') || {}).textContent || '';
    return `<li><a class="optB-chip" href="${a.getAttribute('href')}"><span class="optB-pic" aria-hidden="true">${pic}</span><span class="optB-tx"><b class="u">${a.textContent}</b><small>${line}</small></span></a></li>`; }).join('');
  pick.forEach(p => p.classList.add('optB-hide'));
  const box = document.createElement('div'); box.className = 'optB-chips';
  box.innerHTML = `<ul>${chips}</ul>`;
  more.parentNode.insertBefore(box, more);
})();
```

### toolsC.css
```css
/* Tools C: all twelve plates in one swipe row (scroll-snap), the next plate peeking at the right edge; a dots + "1 of 12" line under it;
   More tools below as today (phone only). Plates keep today's phone design, at one even height. */
@media (max-width:699.98px){
  .sd-tools.sd-band{padding-top:calc(var(--s10) + var(--sd-cut))}
  .sdt-h{margin-bottom:0}
  .sdt-grid{display:flex;gap:var(--s3);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-inline:var(--gut);
    margin-inline:calc(var(--gut) * -1);padding:var(--s12) var(--gut) var(--s3);scrollbar-width:none;align-items:stretch}
  .sdt-grid::-webkit-scrollbar{display:none}
  .sdt-grid>.sdt-p{flex:0 0 80%;scroll-snap-align:start;margin-top:0;display:flex;flex-direction:column;min-height:300px}
  .sdt-grid>.sdt-p>.sdt-tx{order:1;margin-top:auto}
  .sdt-grid>.sdt-p>:not(.sdt-tx):not(.sdt-acts){order:0;flex:1 1 auto;align-content:end;margin-top:0;padding-top:0}
  .sdt-acts{order:2}
  .sdt-t,.sdt-sm .sdt-t{font-size:var(--t24)}
  /* the race: four runners standing on the blue plate */
  .sdt-speed{display:flex;color:var(--sd-on-race)}.sdt-race{margin-top:0}.sdt-run .np-mon .st{--iw:64px}.sdt-spe{font-size:var(--t24)}
  .sdt-speed .sdt-tx{display:block;text-align:left}
  .sdt-types{margin-top:0}.sdt-types .np-mon .st{--iw:36px}.sdt-types .sdt-m{min-height:var(--tap)}
  .sdt-step .np-mon .st,.sdt-step.s1 .np-mon .st{--iw:80px}.sdt-blk b{font-size:var(--t28)}
  .sdt-six{grid-template-columns:repeat(3,minmax(0,1fr))}.sdt-six .np-mon .st{--iw:60px}
  .sdt-side{--cap:72px}
  .sdt-core .np-mon .st,.sdt-set .np-mon .st{--iw:96px}.sdt-wxi .np-mon .st{--iw:80px}
  .sdt-sm .sdt-tr{min-height:140px}
  /* Events and How We Calculate as plates of their own, the big number as the picture */
  .sdt-end{flex:0 0 80%;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;padding:var(--s4) calc(var(--s3) + 12px)}
  .sdt-end::before,.sdt-end::after{display:block}
  .sdt-end.hw{flex-direction:column;text-align:left;border-left:0}.sdt-end.hw .sdt-big{align-items:flex-start}
  .sdt-big{width:auto;margin-bottom:auto;padding-top:var(--s10)}.sdt-big b{font-size:var(--t34)}.sdt-big small{font-size:var(--t15)}
  .sdt-end .sdt-t{font-size:var(--t24)}
  .optC-hint{display:flex;align-items:center;justify-content:space-between;gap:var(--s3);margin-top:var(--s2);font:700 var(--t13)/1.3 var(--b);color:var(--ink-2)}
  .optC-hint b{color:var(--plot-text);font-size:var(--t17)}
  .optC-dots{display:flex;gap:var(--s1)}.optC-dots i{display:block;width:var(--s2);height:var(--s2);border-radius:50%;background:var(--rule)}
  .optC-dots i:first-child{width:var(--s5);border-radius:var(--s1);background:var(--plot-text)}
  .sdt-more{margin-top:var(--s5)}
}
```

### toolsC.js
```js
(() => { if (document.querySelector('.optC-hint')) return;
  const grid = document.querySelector('.sdt-grid'), ends = document.querySelector('.sdt-ends');
  [...ends.children].forEach(e => grid.appendChild(e)); ends.remove();
  const n = grid.children.length;
  const hint = document.createElement('p'); hint.className = 'optC-hint';
  hint.innerHTML = `<span class="optC-dots" aria-hidden="true">${'<i></i>'.repeat(n)}</span><span>1 of ${n} · swipe for more <b aria-hidden="true">›</b></span>`;
  grid.parentNode.insertBefore(hint, grid.nextSibling);
})();
```

### postX.css
```css
/* Post X: "One parcel, one front page" (phone only). Gifts: the parcel for the soonest-ending gift only (no stamps, no second slip; the
   label drops Sent). News: the Dispatch with its lead story and Next event only (no more-stories list). */
@media (max-width:699.98px){
  .sdp .sdp-stamps,.sdp .sdp-other,.sdp .pr-sent{display:none}
  .sdp .dp-more{display:none}
  .sdp-cols{gap:var(--s8)}
  .sdp .pr-parcel.pr-cpt{padding-bottom:var(--s5)}
  .sdp-top{margin-bottom:var(--s5)}
}
```

### postY.css
```css
/* Post Y: "Two cards side by side" (phone only). Left: both live gifts as code slips (name, days left, code, Copy Code), no parcel
   and no stamps. Right: the Dispatch cut to masthead, lead story and Next event. */
@media (max-width:699.98px){
  .sdp-top{margin-bottom:var(--s5)}
  .sdp-cols.sdp-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s3);align-items:stretch}
  .sdp-col{display:flex;flex-direction:column;min-width:0}
  .sdp-ch{display:flex;flex-direction:column;align-items:flex-start;gap:0;margin-bottom:var(--s2)}
  .sdp-ch h3.u{font-size:var(--t20)}
  .sdp-all{font-size:var(--t13)}
  .sdp-gb{display:flex;flex-direction:column;gap:var(--s3);flex:1}
  .sdp-slip{grid-template-columns:minmax(0,1fr);padding:var(--s3);gap:var(--s1);rotate:none}
  .sdp-sw{font-size:var(--t13);line-height:1.35}.sdp-sw span{display:flex;flex-direction:column}.sdp-sw b{white-space:normal}
  .sdp-sc .pr-cv{font-size:var(--t13);letter-spacing:0;white-space:nowrap}
  .sdp-slip{flex:1;display:flex;flex-direction:column;padding-inline:var(--s2)}.sdp-slip .sdp-sc{margin-top:auto;padding-top:var(--s2);border-top:1px dashed var(--pr-ink2)}
  .sdp-sc .pr-cv{letter-spacing:-.03em}
  .sdp .dp-k{letter-spacing:0;line-height:1.3}
  .sdp-slip .np-btn.pr-copy{width:100%;font-size:var(--t13)}
  .sdp-tilt{flex:1;display:flex;rotate:none}.sdp-tilt>.dp-paper{flex:1;rotate:-1deg}
  .sdp .dp-more,.sdp .dp-top{display:none}
  .sdp .dp-paper{padding:var(--s3)}
  .sdp .dp-name{font-size:var(--t15);line-height:1.1}
  .sdp .dp-lh{font-size:var(--t15);line-height:1.2}
  .sdp .dp-k{font-size:var(--t13)}
  .sdp .dp-nbar{padding:var(--s2);font-size:var(--t13)}.sdp .dp-nbar b{font-size:var(--t15)}
}
```

### postY.js
```js
(() => { const gb = document.querySelector('.sdp-gb'); if (!gb || gb.dataset.optY) return; gb.dataset.optY = 1;
  const D = V2.sdpData(); gb.innerHTML = D.live.filter(g => g.code).slice(0, 2).map(V2.sdpSlip).join(''); })();
```
