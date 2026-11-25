# S22: eight pages on phones, one shortening each (look-only prototype)
Helper write-up, Nov 20; clock readings in this job (now.sh): 2:47 PM (mid-run) and 3:12 PM (all runs done), on t1rules dc92cba9 with out/ from 0c992f69.
Sim's rule (Nov 19): "make sure our pages are not running super long on mobile." Target: 3.5 screens at 390 x 844.
Nothing in the site code was changed and nothing was committed. Each option is CSS/JS put into the built page with Playwright.

## How measured (checked: every number below is a real run, not an estimate)
- Build: `node build.mjs --v2 --preview-data --art=../src/v2/art/` in a worktree; app/dist served over http (port 8151) so fonts load.
- 390 x 844, isMobile + hasTouch, light, `window.__PL_TEST = 1`; open `v2.html#<page>`, wait for loading, inject, scroll through once,
  read `document.documentElement.scrollHeight`. Screens = height / 844. The "now" numbers match the brief's list exactly (5.56, 4.59 ...).
- Desktop: the same at 1440 x 900, with and without the injection.
- Pictures: viewport shots after scrolling the changed part to the top (not full-page), 2x, light. Labelled with label-picture.cjs.
- The preview banner ("This Preview uses a saved copy...", ~70 px) and the footer (~420 px) are in every number; together they are
  about 0.6 of a screen on every page.

## Results
| page | now | after | what changed (phones only) | what is folded, and how to reach it | 1440 |
|---|---|---|---|---|---|
| weekly | 5.56 | **4.11** | Pokémon on the Move: each side shows its biggest mover; Most Used, The Weather, New in Top Cut become swipe rows (same tiles/sprites); New Tech shows its top 1 | Rows 2-4 of Rising and of Falling: "Show 3 more ›" under each (button, aria-expanded). New Tech rows 2-4: the existing "Show all 4 ›". Tiles past the screen edge: swipe | 3149 = 3149 |
| news | 4.59 | **3.82** | The Back Page's three boxes become tabs (Latest Result / Top Ratings / Next Events, np-tabs); Classifieds a swipe row | Top Ratings and Next Events: one tap on their tab. Ads 3-4: swipe. (With the other tabs open: 3.65 / 3.66) | 2185 = 2185 |
| events | 4.39 | **3.88** | The latest winner's five sit three to a row (2 rows, were 3); the wall opens on the big ticket + 4 (was + 6) | Tickets 5-6: the existing "Show More · N left ›" (count +2) | 2541 = 2541 |
| gifts | 4.35 | **3.29** | The live parcels sit in one swipe row (soonest-ending first, the next peeking in), with "3 live gifts · swipe for the next ›" under it | Parcels 2-3: swipe (row is a labelled region, keyboard-scrollable) | 2075 = 2075 |
| usage | 4.21 | **3.66** | Places 4-10 one swipe row (were two shelves); How X is played: Moves beside Items (as Abilities beside Natures), Moves shows 3 like Items | Places 8-10: swipe. Moves 4-8: its "N more ›" (now "5 more ›") | 2326 = 2326 |
| method | 4.06 | **3.41** | The plate's two numbers side by side; the legend's 4 notes fold; Ten Parts keep Sim's Q44 layout but the group word sits under the big number (one line less per tile), tiles 8 px apart | The notes (Bars, #20 of 321, %, Strength Score): "What the bars, ranks and % mean ›" (details, the wk-fold look). The two band keys stay open | 1624 = 1624 |
| track | 4.05 | **3.31** | The Calls: Biggest Hits and Biggest Misses each a swipe row of slips; How We Check's 3 steps in one row | Slips 2-3 of each: swipe | 1724 = 1724 |
| tournaments | 4.01 | **3.32** | The Winning Hands: the Champion's hand unchanged; 2nd and 3rd place hands in one swipe row (cards 100 x 140, were 120 x 168) | The 3rd-place hand: swipe | 1922 = 1922 |

At or under 3.5: gifts 3.29, track 3.31, tournaments 3.32, method 3.41. Over 3.5: usage 3.66, news 3.82, events 3.88, weekly 4.11.

### Where 3.5 isn't reached, and why
- **weekly (4.11)**: seven sections with their own headline each, plus the masthead (391 px). After the cuts the sections are
  Move 657, Ratings on the Move 248, Most Used 230, New Tech + Winners 598, Weather 228, New in Top Cut 299. Reaching 3.5 needs
  ~520 px more, which means hiding a whole section (for example tabs over Weather / New in Top Cut / Ratings on the Move, or
  Rising / Falling tabs, ~150 px). My guess, not tested: tabs over sections would get there, but it hides whole topics.
- **news (3.82)**: the paper's stories above the Back Page (masthead 321, lead story with the gift series 871, second row 613)
  are the content. Shrinking them is a design change to the approved paper. I did not try it.
- **events (3.88)**: big + 3 tickets would be about 3.67 (one small ticket is ~180 px; arithmetic from the measured wall, not a run).
  Folding "Recent:" in Next Events (159 px) would be about 3.7. Not tried.
- **usage (3.66)**: the remaining length is the approved podium (347) and the spotlight (237, repeats #1). Not touched.

## Unsure / to check before building (not checked)
- weekly: Most Used at 390 now uses the 430-699 tile look in a swipe row. Under 430 the site chose rows on purpose (names broke
  mid-word in a 5-up strip). In the swipe row each tile is 104 wide, so "Mega Charizard Y" fits on two lines (seen in the picture),
  but 320 and 375 were not checked.
- news: the tabs' text is plain Instrument Sans (np-tabs), not slanted; the swipe row inside the paper is clipped by the paper's edge
  (not full-bleed). Tab state is not remembered across redraws in this prototype.
- events: the wall cut is CSS-only here; the real change is the phone cap 7 -> 5 in events.js (CSS-hiding would lose tickets 5-6 from
  "Show More"). The big ticket's five needed `column-gap:0` to fit three a row.
- usage: places 4-7 and 8-10 are two shelves, so the shelf line has a break at #7/#8 in the swipe row. The Moves cut needs the phone
  cut in usage.js changed from 5 to 3 (here CSS + a text fix on the button).
- method: "YOUR TEAM" wraps to two lines under its number (still one line less than before). Under 360 wide not changed.
- tournaments: in the narrower swipe hand the header wraps (number on its own line) and the two buttons stack; looks fine in the
  picture but is a new state for Sim to see. The full-page screenshot was 402 wide on today's page (decorative card glow
  spilling past the edge); `scrollWidth` is 390, so the page does not scroll sideways (checked).
- Light and dark gave the same heights for gifts and weekly (checked: 2777 and 3473 in both). Other pages' dark mode not run.
- 320, 375 and 430 not measured for any page.

## Pictures (390, light; NOW = today, RECOMMENDED = after; green band = recommended)
docs/rebuild/pics/nov20/S22/: weekly-1-now, weekly-2-after, weekly-3-now, weekly-4-after, news-1-now, news-2-after,
events-1-now, events-2-after, gifts-1-now, gifts-2-after, usage-1-now, usage-2-after, method-1-now, method-2-after,
track-1-now, track-2-after, tournaments-1-now, tournaments-2-after (all .jpg, 134-206 KB).

## The exact CSS/JS injected
Each file was added after the page loaded (CSS with addStyleTag, JS with evaluate). Everything sits under a phone media query, or
the JS returns early at 700 wide and up (600 for method), so desktop does not change (checked at 1440, table above).

```
=== wk.css
/* S22 weekly prototype: phones only (under 700 wide); 700 and up unchanged */
.wk-mmore{display:none} /* the new button shows only on phones, as .wk-tmore does */
@media (max-width:699.98px){
  /* 1 Pokémon on the Move: each side leads with its biggest mover; rows 2-4 open with "Show 3 more ›" (as New Tech's "Show all N ›") */
  .wk-side .wk-ml:not(.on){display:none}
  .wk-mmore{display:inline-flex;align-items:center;min-height:var(--tap);justify-self:start}
  /* 2 New Tech: the top row shows, "Show all 4 ›" opens the rest (was the top 2) */
  .wk-tech ul:not(.on)>li:nth-child(n+2){display:none}
  /* 3 The Weather and 4 New in Top Cut: one swipe row each (same tiles and sprites), as the site's other phone swipe rows */
  .wk-tiles,.wk-new ul{display:flex;gap:var(--s2);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;margin-inline:calc(var(--s4) * -1);padding:0 var(--s4) var(--s2);scroll-padding-inline:var(--s4)}
  .wk-tile{flex:0 0 112px;scroll-snap-align:start}
  .wk-new li{flex:0 0 156px;scroll-snap-align:start}
  .wk-fr .np-mon{--iw:96px}
}
@media (max-width:429.98px){
  /* 5 Most Used: the five tiles of the 430-699 strip, as a swipe row (rank badge kept; no mid-word breaks: tiles are 104 wide) */
  .wk-top ul{display:flex;gap:var(--s2);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;margin-inline:calc(var(--s4) * -1);padding:0 var(--s4) var(--s2);scroll-padding-inline:var(--s4)}
  .wk-top li{flex:0 0 104px;scroll-snap-align:start}.wk-top li+li{border-top:0}
  .wk-tm{grid-template-columns:minmax(0,1fr);grid-template-areas:none;justify-items:center;align-items:start;row-gap:0;padding:0 0 var(--s2);text-align:center}
  .wk-tm::before{display:block}.wk-tm .np-mon{grid-area:auto;--iw:56px}
  .wk-rk{position:absolute;top:0;left:0;grid-area:auto;font-size:var(--t17)}
  .wk-tm b{grid-area:auto;justify-self:center;font-size:var(--t20)}
  .wk-tm span{grid-area:auto;display:block;font:600 var(--t13)/1.3 var(--b);text-align:center}
  .wk-tm small{display:none}
}
=== wk.js
// S22 weekly prototype: a "Show 3 more ›" button under each side's biggest mover (real button, aria-expanded/aria-controls)
document.querySelectorAll('.wk-side').forEach((s, i) => { const l = s.querySelector('.wk-ml'); if (!l) return; l.id = 'wk-ml' + i;
  const n = l.children.length, b = document.createElement('button'); b.type = 'button'; b.className = 'np-link wk-mmore';
  b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', l.id); b.textContent = `Show ${n} more ›`;
  b.onclick = () => { const o = l.classList.toggle('on'); b.setAttribute('aria-expanded', o); b.textContent = o ? 'Show Fewer' : `Show ${n} more ›`; };
  l.after(b); });
=== nw.css
/* S22 news prototype: phones only (under 700 wide); 700 and up unchanged */
@media (max-width:699.98px){
  /* 1 The Back Page: Latest Result / Top Ratings / Next Events as three tabs (np-tabs), one box showing at a time */
  .dp-bt{margin-top:var(--s3)}
  .dp-bk.tabbed > .dp-bc[hidden]{display:none}
  .dp-bk.tabbed > * + *{padding-top:0;border-top:0}
  .dp-bk.tabbed .dp-ch{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)} /* the tab names the box; heading kept for screen readers */
  /* 2 Classifieds: one swipe row of the four ads */
  .dp-al{display:flex;gap:var(--s2);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;padding-bottom:var(--s2)}
  .dp-al>li{flex:0 0 220px;scroll-snap-align:start}
}
=== nw.js
// S22 news prototype: tabs over the Back Page's three boxes (role=tablist, aria-selected, arrow keys left/right)
(() => { const bk = document.querySelector('.dp-bk'); if (!bk || innerWidth >= 700) return; const boxes = [...bk.querySelectorAll(':scope > .dp-bc')];
  const nav = document.createElement('div'); nav.className = 'np-tabs dp-bt'; nav.setAttribute('role', 'tablist'); nav.setAttribute('aria-label', 'The Back Page');
  boxes.forEach((b, i) => { const t = document.createElement('button'); t.type = 'button'; t.setAttribute('role', 'tab'); t.id = 'dpt' + i; b.id = b.id || 'dpp' + i;
    b.setAttribute('role', 'tabpanel'); b.setAttribute('aria-labelledby', t.id); t.setAttribute('aria-controls', b.id);
    t.textContent = (b.querySelector('.dp-ch') || {}).textContent || 'Box ' + (i + 1); nav.appendChild(t); });
  const pick = i => { [...nav.children].forEach((t, j) => { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; boxes[j].hidden = i !== j; }); };
  nav.onclick = e => { const t = e.target.closest('[role=tab]'); if (t) pick([...nav.children].indexOf(t)); };
  nav.onkeydown = e => { const k = {ArrowRight: 1, ArrowLeft: -1}[e.key]; if (!k) return; const i = ([...nav.children].findIndex(t => t.getAttribute('aria-selected') === 'true') + k + boxes.length) % boxes.length; pick(i); nav.children[i].focus(); };
  bk.classList.add('tabbed'); bk.before(nav); pick(0); })();
=== ev.css
/* S22 events prototype: phones only (under 700 wide); 700 and up unchanged */
@media (max-width:699.98px){
  /* 1 The Ticket Wall opens on the big ticket plus 4 (was 6); "Show More" still adds 12. (Real change: the phone cap 7 -> 5 in events.js; CSS here only simulates it) */
  .tk-wall:not(.more)>:nth-child(n+5){display:none}
  /* 2 The latest winner's five: three to a row (two rows instead of three) */
  .tk.big .tk-five{column-gap:0}.tk.big .tk-five li{flex:0 0 33.333%}
  .tk.big .tk-hero .np-mon{--iw:160px}
}
=== ev.js
// S22 events prototype: the Show More count follows the shorter wall (2 more tickets left)
(() => { const b = document.querySelector('.ev-more'); if (!b || innerWidth >= 700) return; b.textContent = b.textContent.replace(/(\d+) left/, (m, n) => (+n + 2) + ' left'); })();
=== gf.css
/* S22 gifts prototype: phones only (under 700 wide); 700 and up unchanged */
@media (max-width:699.98px){
  /* Waiting at the Counter: the live parcels in one swipe row (the soonest-ending first, the next one peeking in), How to collect under it */
  .pr-swipe{display:flex;gap:var(--s4);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;margin-inline:calc(var(--s4) * -1);padding:var(--s4) var(--s4) var(--s4);scroll-padding-inline:var(--s4)}
  .pr-swipe>.pr-parcel{flex:0 0 calc(100% - var(--s12));scroll-snap-align:start}
  .pr-sw-n{margin:calc(var(--s6) * -1) 0 0;font:600 var(--t13)/1.5 var(--b);color:var(--ink-2)}
}
=== gf.js
// S22 gifts prototype: wrap the live parcels in a swipe row (a labelled region the keyboard can scroll) and say how many there are
(() => { const box = document.querySelector('.pr-parcels'); if (!box || innerWidth >= 700) return; const ps = [...box.querySelectorAll(':scope > .pr-parcel')]; if (ps.length < 2) return;
  const w = document.createElement('div'); w.className = 'pr-swipe'; w.setAttribute('role', 'region'); w.setAttribute('aria-label', `${ps.length} live gifts, swipe for more`); w.tabIndex = 0;
  ps[0].before(w); ps.forEach(p => w.appendChild(p));
  const n = document.createElement('p'); n.className = 'pr-sw-n'; n.textContent = `${ps.length} live gifts · swipe for the next ›`; w.after(n); })();
=== us.css
/* S22 usage prototype: phones only (under 700 wide); 700 and up unchanged */
@media (max-width:699.98px){
  /* 1 How X is played: Moves and Items side by side, as Abilities and Natures already are (each keeps its "N more ›") */
  .us-groups>.us-bars:nth-child(-n+2){grid-column:auto}
  /* 2 Moves shows its top 3 like Items, so the two columns end on the same line ("5 more ›" opens the rest) */
  .us-groups>.us-bars:first-child:not(.on)>:nth-child(n+5):not(.us-x):not(button){display:none}
  /* 3 Places 4-10: one swipe row of seven instead of two shelves (same cards, same shelf line) */
  .us-benches{display:grid;grid-auto-flow:column;grid-auto-columns:max-content;gap:0;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;margin-inline:calc(var(--s4) * -1);padding:0 var(--s4) var(--s2);scroll-padding-inline:var(--s4)}
  .us-benches>.us-bench{justify-content:flex-start}
  .us-benches .us-fig{flex:0 0 96px;width:96px;scroll-snap-align:start}
}
=== us.js
// S22 usage prototype: Moves' "N more ›" counts the two rows the phone now folds too (the real change: the phone cut moves from 5 to 3 in usage.js)
(() => { if (innerWidth >= 700) return; const btn = [...document.querySelectorAll('.us-groups button')].find(x => /more/.test(x.textContent)); if (!btn) return;
  const w = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) if (/\d+ more/.test(t.data)) { t.data = t.data.replace(/(\d+) more/, (m, n) => (+n + 2) + ' more'); break; } })();
=== mt.css
/* S22 method prototype: phones only (under 600, where the tiles are one column); 600 and up unchanged */
@media (max-width:599.98px){
  /* 1 The plate's two big numbers side by side (were stacked) */
  .infp .ev-ns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s4)}
  /* 2 How to read our numbers: the two band keys stay; the four notes (Bars, #20 of 321, %, Strength Score) fold behind one line (the wk-fold look) */
  .mt-fold{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
  .mt-fold summary{min-height:var(--tap);display:flex;align-items:center;cursor:pointer;font:700 var(--t15)/1.5 var(--b);list-style:none}
  .mt-fold summary::-webkit-details-marker{display:none}
  .mt-fold summary::after{content:"›";margin-left:auto;font:700 var(--t20)/1 var(--b);color:var(--ink-3);transition:rotate .2s}
  .mt-fold[open] summary::after{rotate:90deg}
  /* 3 Ten Parts: same tiles and Q44 layout, 12 px top and bottom (was 16) and 8 px between tiles (was 12) */
  .inf-tiles{gap:var(--s2)}
  .inf-tiles>.inf-tile>summary{padding-block:var(--s3)}
}
@media (min-width:360px) and (max-width:599.98px){
  /* 4 Ten Parts (Q44 layout kept): the group word (Your Team, Pokémon, Tools, The Data) moves under the big number, so each tile loses a line */
  .inf-tiles>.inf-tile>summary{grid-template-rows:auto auto;row-gap:var(--s1)}
  .inf-tiles>.inf-tile>summary>.inf-no{grid-column:1;grid-row:1;align-self:end}
  .inf-tiles>.inf-tile>summary>.inf-gk{grid-column:1;grid-row:2;align-self:start;font-size:var(--t13);letter-spacing:.02em}
  .inf-tiles>.inf-tile>summary>b{grid-column:2;grid-row:1;align-self:end}
  .inf-tiles>.inf-tile>summary>span{grid-column:2;grid-row:2}
}
=== mt.js
// S22 method prototype: the legend's four notes go into a <details> on phones (closed), summary "What the bars, ranks and % mean"
(() => { if (innerWidth >= 600) return; const ul = document.querySelector('.inf-legend .npdots'); if (!ul) return;
  const d = document.createElement('details'); d.className = 'mt-fold'; d.innerHTML = '<summary>What the bars, ranks and % mean</summary>'; ul.before(d); d.appendChild(ul); })();
=== tk.css
/* S22 track prototype: phones only (under 700 wide); 700 and up unchanged */
@media (max-width:699.98px){
  /* 1 The Calls: Biggest Hits and Biggest Misses each one swipe row of slips (the biggest one first, the next peeking in) */
  .trk-slips{display:flex;grid-auto-rows:auto;gap:var(--s3);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;margin-inline:calc(var(--s4) * -1);padding:var(--s1) var(--s4) var(--s3);scroll-padding-inline:var(--s4)}
  .trk-slips>li{flex:0 0 calc(100% - var(--s12));scroll-snap-align:start}
  /* 2 How We Check: the three steps in one row (number over the words) */
  .trk-flow{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s2)}
  .trk-flow li{flex-direction:column;align-items:flex-start;gap:var(--s2);padding:var(--s3);font-size:var(--t13)}
}
=== wt.css
/* S22 tournaments prototype: phones only (under 700 wide); 700 and up unchanged */
@media (max-width:699.98px){
  /* The Winning Hands: the Champion's hand stays as it is; the 2nd and 3rd place hands sit in one swipe row (2nd first, 3rd peeking in) */
  .wt-two{display:flex;gap:var(--s4);overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;margin-inline:calc(var(--s4) * -1);padding:0 var(--s4) var(--s3);scroll-padding-inline:var(--s4)}
  .wt-two>.wt-hand{flex:0 0 calc(100% - var(--s10));scroll-snap-align:start;margin-top:var(--s4)}
  .wt .wt-two .wt-card{--cw:100px;--ch:140px}
  .wt .wt-two .wt-card .mc-mon .np-mon,.wt .wt-two .wt-card .mc-mon .np-mon .st{--iw:72px}
}
```
