# Remaining site-scan findings: re-check + one recommended fix each (Nov 20)

Written Fri Nov 20, 2026, 1:03 PM Eastern (time from `docs/rebuild/now.sh`). Look + prototype only: no site code changed, nothing committed.
Findings from `docs/rebuild/audits/site-scan-nov20.md`. Pictures: `docs/rebuild/pics/nov20/scan2/` (WebP, all under 300 KB).

Built page: t1rules `4ffaccf8`, frozen data `out/` from `0c992f69`, Preview build (`node build.mjs --v2 --preview-data --art=../src/v2/art/`,
Chromium 1148): "v2 guard: clean", dist/v2.html 3739 KB. Served over local http (fonts load). Viewport screenshots after scrolling.
Each fix was injected into the real page with Playwright (CSS via addStyleTag, HTML via page.evaluate); heights measured before and after.
Filled team where needed: Garchomp, Kingambit, Sneasler, Basculegion, Archaludon, Azumarill (same as the scan).
Not checked: real iPhone/iPad, Safari, keyboard and screen-reader behaviour of the new pieces, the full polish check.

## Status at a glance (most useful to the player first)

| # | ID | Still happens? | Fix (one line) | Visual? | Phone height |
|---|----|----------------|----------------|---------|--------------|
| 1 | S30 | Yes | Six slanted "?" slots under Their Six | Visual | 0 (desktop/tablet 900+ only) |
| 2 | S31 | Partly (A fixed by S13; B still empty) | Latest winners inside Team B, one tap | Visual | +75 px (1.48 -> 1.57 screens) |
| 3 | S34 | Yes | Today's top six under the miss line | Visual | 0 (inside the search sheet) |
| 4 | S19 | Partly (S24 words gone; still two sources) | Name the source in Team Checks + point to Matchups | Non-visual copy | +23 px on My Team phone (one line) |
| 5 | S6 | Yes | Two tickets per row from 800 wide | Visual | 0 (tablet/odd widths only; up to -1 screen) |
| 6 | S29 | Yes | Home's blue band behind your six, top 20 at 60 px | Visual | 0 (desktop track 1024+ only) |
| 7 | S35 | Yes (about 2.5 s here) | Slanted moving bar, villain line, two ghost rows | Visual | 0 final length |
| 8 | S21 | Yes | "A sample six" / "Its Strength Score" until there's a team | Non-visual copy | 0 |
| 9 | S5 | Yes | "6 of 6 · Grassy Terrain · Legal ✓" | Visual (small) | -14 px |
| 10 | S4 | Yes | "Lead 1 / Lead 2 / Back 1…" under Add | Visual (small) | 0 (option B -35 px) |
| 11 | S7 | Yes | Grey hint text | Visual (small) | 0 |
| 12 | S3 | Partly (underdog added by S33; link still breaks) | The way out as a slanted button on its own line | Visual (small) | 0 |
| - | S27 | **No: already fixed** | Nothing to ask | - | - |

---

## 1. S30 Battle on desktop: "Their Six" is a lone button
- **Still happens: yes.** Checked: screenshot `#battle` at 1440 day; Their Six = headline + one black button + a text line.
- **Recommended (A):** six slanted "?" slots in the opponents' magenta (`--them`), each opening the same Their Six sheet; the button stays under them.
  Reason: it shows at a glance what to fill and mirrors "Your Six" right below, like the game's team preview.
- Visual. Phone: unchanged (shown from 900 wide only; phones keep today's layout). Desktop 1440: +120 px (1164 -> 1284); 1024: +193 px.
- Checked: tapping a slot opened the sheet (`sheet open: true`). Day and night.
- Pictures: `s30-battle-1440-day-now.webp`, `s30-battle-1440-day-A.webp` (RECOMMENDED), `s30-battle-1440-night-A.webp`.
- Injected:
```css
.bt-q6{display:none}
@media (min-width:900px){.bt-q6{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--s3);margin:var(--s2) 0 var(--s5)}
.bt-q6 button{display:grid;place-items:center;aspect-ratio:4/5;padding:0;border:2px dashed color-mix(in srgb,var(--them) 55%,transparent);border-radius:var(--r-s);background:color-mix(in srgb,var(--them) 7%,transparent);transform:skewX(-8deg);cursor:pointer;transition:background .15s}
.bt-q6 button:hover{background:color-mix(in srgb,var(--them) 16%,transparent);border-style:solid}
.bt-q6 i{font:900 var(--t34)/1 var(--u);font-style:italic;font-synthesis:style;color:var(--them-text);transform:skewX(8deg)}}
```
```js
const r=document.querySelector('.bt-acts'),d=document.createElement('div');d.className='bt-q6';
d.innerHTML=Array.from({length:6},(_,i)=>`<button type="button" data-btopp aria-label="Enter their Pokémon ${i+1}"><i aria-hidden="true">?</i></button>`).join('');r.before(d);
```
- Note for the build: the first slot's skewed edge sits ~6 px left of the text edge (skew); a 4 px left margin on the grid would square it.

## 2. S31 Compare Teams: Team B is an empty dashed box
- **Still happens: partly.** Team A now starts as My Team (S13 fix is in). Team B is still a dashed box with "Pick Team B" and nothing to choose
  until you tap it. Checked: screenshot `#compare` 1440 with a filled team.
- **Recommended (A):** inside Team B, "Take on a latest winner" with the 3 newest event winners (the picker's own rows: style, event, date, six
  sprites), one tap compares; a link "Saved, more winners or paste a team ›" opens today's picker. Phones show the newest winner only.
  Reason: comparing your team with a winner is the most likely use; one tap instead of tap, scroll, tap.
- Visual. Phone 390: +75 px (1252 -> 1327, 1.48 -> 1.57 screens); 320: 1349 -> 1463. Desktop 1440: +35 px.
  Showing all 3 on phones measured +350 px (1.90 screens), so phones get one.
- Checked: tapping a winner row set Team B and drew the comparison (`Team B:` rows appeared). Day and night.
- Pictures: `s31-compare-1440-day-now.webp`, `s31-compare-1440-day-A.webp` (RECOMMENDED), `s31-compare-390-day-A.webp`.
- Injected:
```css
.cx2-qp{display:flex;flex-direction:column;gap:var(--s2);padding:var(--s5) var(--s6) var(--s4);border:2px dashed var(--rule);border-radius:var(--r-l);background:transparent}
.cx2-qp .top{display:flex;align-items:center;gap:var(--s3)}.cx2-qp .top .nm{font:800 var(--t24)/1.2 var(--u);font-style:italic;font-synthesis:style}
.cx2-qp .k{margin:var(--s2) 0 0;font:700 var(--t13)/1.5 var(--b);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3)}
.cx2-qp .cx2-opt{border-bottom:1px solid var(--rule);padding-inline:0}.cx2-qp .cx2-opt .s img{width:40px;height:40px}
.cx2-qp .more{align-self:flex-start;margin-top:var(--s1)}
@media (max-width:699.98px){.cx2-qp .cx2-opt~.cx2-opt{display:none}.cx2-qp{padding:var(--s4)}.cx2-qp .top .nm{font-size:var(--t22)}}
```
```js
const b=document.querySelector('[data-cxp=B]'),d=document.createElement('div');d.innerHTML=V2.cxPickHtml('B');
const opts=[...d.querySelectorAll('[data-cxset2^="B|e:"]')].slice(0,3).map(x=>x.outerHTML).join('');
const box=document.createElement('div');box.className='cx2-qp';
box.innerHTML=`<div class="top">${b.querySelector('.cx2-b').outerHTML}<span class="nm">Pick Team B</span></div><p class="k">Take on a latest winner</p>${opts}<button type="button" class="np-link more" data-cxp="B">Saved, more winners or paste a team ›</button>`;
b.replaceWith(box);
```
- Note: the uppercase label is my guess at a style; the site's eyebrow style (`np-eyebrow`) may be the better match in the build.

## 3. S34 Search miss shows one grey line
- **Still happens: yes.** Checked: Search, typed "qwxyz" at 390: only "Nothing called "qwxyz". Try part of the name."
- **Recommended (A):** keep that line, then "Or meet today's top six" (Unbounded slanted) and the six highest-rated Pokémon as normal search
  rows (sprite, name, rating and tier, type chips); tapping one opens it as any search hit.
  Reason: a miss becomes a next step instead of a dead end; same six as empty My Team's "Start from a Winner".
- Visual. Page length: none (inside the search sheet).
- Checked: rows are the search's own markup (built by typing each name into the real search); 6 rows at 390 day, 390 night, 1440.
- Pictures: `s34-search-miss-390-day-now.webp`, `s34-search-miss-390-day-A.webp` (RECOMMENDED), `s34-search-miss-390-night-A.webp`.
- Injected:
```css
[data-v2hits] .miss-k{margin:var(--s4) 0 var(--s1);font:800 var(--t17)/1.3 var(--u);font-style:italic;font-synthesis:style;color:var(--ink)}
```
```js
// names = today's top six from empty My Team (data-hmaround: Sneasler, Rillaboom, Kingambit, Incineroar, Charizard-Mega-Y, Raichu-Mega-Y)
(names)=>{const out=document.querySelector('[data-v2hits]'),inp=document.querySelector('[data-v2q]'),q=inp.value.trim(),rows=[];
 for(const n of names){inp.value=n;inp.dispatchEvent(new Event('input'));const hit=[...out.querySelectorAll('.np-hit[data-v2mon]')].find(b=>b.dataset.v2mon===n)||out.querySelector('.np-hit[data-v2mon]');if(hit)rows.push(hit.outerHTML);}
 inp.value=q;inp.dispatchEvent(new Event('input'));
 out.innerHTML=`<p class="fine">Nothing called “${V2.esc(q)}”. Try part of the name.</p><p class="miss-k">Or meet today's top six</p>`+rows.join('');}
```
  (In the build: `lairRows().slice(0,6)` in shell.js's miss branch, as team.js does.)

## 4. S19 Three ways of counting the same thing on My Team
- **Still happens: partly.** The retired words are gone (S24 fix in). Still: Matchups says "5 Favoured · 23 Even match · 2 Unfavoured" (real
  games) and lists Rillaboom "Favoured · Calc: no answer", while Team Checks says "Beats or handles only 15 of the top 30; no answer to
  Rillaboom, Mega Staraptor, Sylveon." with no hint it is the damage calc. Checked: page text at 1440, filled team.
- **Recommended (A):** Team Checks line starts "Damage calc: beats or handles only 15 of the top 30; no answer to …" and ends
  "Real games: see Matchups ›". Reason: the two numbers stop looking like a contradiction; the reader knows which one they're reading.
- Non-visual (copy). Height: 1440 none; 390 +23 px (the link adds one line). Without the link it is 0 px.
- Pictures: `s19-team-checks-1440-now.webp`, `s19-team-checks-1440-A.webp` (RECOMMENDED).
- Injected (the link went to `#team` in the prototype; in the build it should open the Matchups tab/section):
```js
const e=[...document.querySelectorAll('#main *')].find(e=>e.children.length===0&&/^Beats or handles only/.test(e.textContent.trim()));
e.innerHTML=e.textContent.replace(/^Beats or handles only/,'Damage calc: beats or handles only')+' <a class="np-link" href="#team">Real games: see Matchups ›</a>';
```

## 5. S6 Events at 700-1099: one ticket per row
- **Still happens: yes.** Checked: `.tk-wall` is one column below 1100 (pages.css 2531-2532); Events 5.20 screens at 1024, 5.46 at 870.
- **Recommended (A):** two tickets per row from **800** wide, with each small ticket using its phone layout (the one that fits 358 px today).
  Reason: halves the scroll on iPad landscape and odd widths, and fills the empty right side.
- Visual. Phones: unchanged. Measured screens: 1024 5.20 -> 4.16; 870 5.46 -> 4.52; 800 5.48 -> 4.62; 1099 5.16 -> 4.10.
- **Why 800, not 700 (measured, "overrun into the date stub" = how far a name or sprite runs into the stub):**
  two per row with today's ticket inside: 900 = 65 px over, 1024 = 2 px over (fails everywhere under 1100).
  With the phone ticket inside: 700 = 44 px over, 768 = 10 px over, 800 = 6 px clear, 870 = 9 clear, 1024 = 15 clear, 1099 = 15 clear.
  So 700-799 (including iPad portrait 768) keeps one per row. 0 sideways scroll at every width tried.
- Pictures: `s6-events-1024-day-now.webp`, `s6-events-1024-day-A.webp` (RECOMMENDED), `s6-events-870-night-A.webp`.
- Injected (shown with 700 in the prototype media query; the recommendation is 800):
```css
@media (min-width:800px) and (max-width:1099.98px){.tk-wall{grid-template-columns:repeat(2,minmax(0,1fr))}.tk-wall.odd>.tk:last-child{grid-column:1/-1}
.tk-wall>.tk .tk-hero{width:72px}.tk-wall>.tk .tk-hero .np-mon{--iw:72px}.tk-wall>.tk .tk-seal{width:var(--s8);height:var(--s8)}
.tk-wall>.tk .tk-stub{min-width:76px;padding:var(--s2) var(--s3) var(--s2) var(--s2)}.tk-wall>.tk .tk-stub b{font-size:var(--t28)}.tk-wall>.tk .tk-bar{width:48px}
.tk-wall>.tk{grid-template-areas:"h m s" "f f s"}.tk-wall>.tk .tk-mid{padding-right:var(--s2)}.tk-wall>.tk .tk-five{padding-left:var(--s3);justify-content:space-between}.tk-wall>.tk .tk-five .np-mon{--iw:40px}.tk-wall>.tk .tk-name{font-size:var(--t15)}}
```

## 6. S29 Speed Tiers: tiny sprites on a pale band
- **Still happens: yes.** Checked: DOM at 1440, 20 of 26 sprites are 36 px (your six 64 px); the band behind your six is an 8% blue tint.
- **Recommended (A):** your six on Home's solid blue band (`--sd-hero`, white numbers and names, slightly slanted), the top 20 at 60 px with
  20 px numbers. Reason: the page gets Home's punch, and the field's Pokémon are recognisable at a glance.
- Visual. Phones: unchanged (phones and tablets under 1024 use the split list, not this track). Desktop page: 1440 +120 px (1749 -> 1869);
  1024 +148 px. Checked: 0 overlapping Pokémon at 1024, 1440, 1920 (first try with 96 px name boxes overlapped at 1024/1920; 84 px is clear).
- Pictures: `s29-speed-1440-day-now.webp`, `s29-speed-1440-day-A.webp` (RECOMMENDED), `s29-speed-1440-night-A.webp`.
- Injected (CSS; plus the track builder's output rewritten: field `--iw:36px` -> 60px, lane height 104 -> 132 px, top offset 16 -> 24,
  name box 80 -> 84 px, track height recomputed):
```css
.sp2-track.mine::before{background:var(--sd-hero);transform:skewX(-4deg);border-radius:var(--r-s)}
.sp2-track.mine::after{color:var(--sd-on-band);font-size:var(--t22)}
.sp2-m.me .v,.sp2-m.me .nm{color:var(--sd-on-band)}.sp2-m.me .nm .mg,.sp2-m.me .nm b{color:var(--sd-line2)}
.sp2-m:not(.me) .v{font-size:var(--t20)}
```
```js
const o=V2.spTrack;V2.spTrack=D=>{let s=o(D);const AY=+s.match(/--ay:(\d+)px/)[1];let mx=0;
 s=s.replace(/class="sp2-m" ([^>]*?)style="left:(\d+)px;top:(\d+)px;--mw:80px"/g,(m,a,l,t)=>{const k=Math.round((t-AY-16)/104);mx=Math.max(mx,k);return `class="sp2-m" ${a}style="left:${l}px;top:${AY+24+132*k}px;--mw:84px"`});
 return s.replace(/--iw:36px/g,'--iw:60px').replace(/--h:\d+px/,'--h:'+(AY+24+(mx+1)*132)+'px')};
// then redraw (toggled "Your Tailwind" twice)
```
  (In the build: speed.js line 36, `mon(r, 60, AY + 24 + 132 * r.k, 84)` and `H = AY + 24 + tk * 132`.)
- Contrast: white on #0078BF is about 4.6:1 (my estimate from the hex values, not measured with a tool).

## 7. S35 My Team "Working out the best changes for your team…"
- **Still happens: yes.** Checked: new visitor, `#team` at 1440 and 768, polled every 250 ms: the line is there from about 0.25 s to 2.5 s
  (1440) / 2 s (768) on this machine, as a plain grey line; then the suggestions arrive and the section grows to 563 px (it jumps).
- **Recommended (A):** a slanted PLOT-blue stripe bar that moves, the line "Plotting your best changes…" in Unbounded slanted, and two pale ghost
  rows that hold the space. Reason: it looks alive and on-brand (the site is called NastyPlot) and the page jumps less.
  No underdog here: the scan's alternative, but this section sits beside the score, and underdogs are never beside grades.
- Visual. Final page length: unchanged (the loader is 347 px tall, less than the 563 px of loaded suggestions). Motion stops with reduced motion.
- Pictures: `s35-loading-1440-day-now.webp` (real loading markup, held on screen), `s35-loading-1440-day-A.webp` (RECOMMENDED), `s35-loading-1440-night-A.webp`.
- Injected:
```css
@keyframes sgplot{to{background-position:48px 0}}
.sg2-wait.plot{display:grid;gap:var(--s3);margin:var(--s3) 0 var(--s2);font:800 var(--t17)/1.3 var(--u);font-style:italic;font-synthesis:style;color:var(--ink)}
.sg2-wait.plot::before{content:"";display:block;height:12px;width:calc(100% - var(--s3));margin-left:var(--s2);border-radius:var(--r-s);transform:skewX(-24deg);background:repeating-linear-gradient(90deg,var(--plot) 0 24px,color-mix(in srgb,var(--plot) 30%,transparent) 24px 48px);animation:sgplot .8s linear infinite}
.sg-ghost{display:grid;grid-template-columns:72px minmax(0,1fr) 96px;gap:var(--s4);align-items:center;padding:var(--s4) 0;border-top:1px solid var(--rule)}
.sg-ghost i{display:block;height:var(--s10);border-radius:var(--r-s);background:var(--wash);transform:skewX(-8deg)}.sg-ghost i:nth-child(2){height:var(--s5)}
@media (prefers-reduced-motion:reduce){.sg2-wait.plot::before{animation:none}}
```
```js
const w=document.querySelector('.sg2-wait');w.classList.add('plot');w.textContent='Plotting your best changes…';
const g=document.createElement('div');g.setAttribute('aria-hidden','true');g.innerHTML='<div class="sg-ghost"><i></i><i></i><i></i></div>'.repeat(2);w.after(g);
```
- Not checked: the phone tab view while loading (the 390 hold-and-restyle run didn't land on the Suggestions tab; no phone picture).
  Ghost rows are faint in night mode (by design, but Sim may want them a step stronger).

## 8. S21 Home calls the sample team "Your"
- **Still happens: yes.** Checked: Home 390 and 1440, new visitor: eyebrow "Your six · Sun Tailwind (sample) · Sun team", report title
  "Your Strength Score", turn-1 label "Your leads".
- **Recommended (A):** while the sample is shown: "A sample six · Sun Tailwind · Sun team", "Its Strength Score", "Sample leads".
  Reason: a new visitor isn't told the sample is theirs; the receipt's corner already says "Sample team".
- Non-visual (copy). Height: 0 at 320/390/1440 (measured: title stays 1 line at 390; "The sample's Strength Score" and "Sample Strength
  Score" both wrapped to 2 lines at 390, +23 px, so they were dropped).
- Pictures: `s21-home-sample-390-eye-now.webp` / `-eye-A.webp` (RECOMMENDED), `s21-home-sample-390-score-now.webp` / `-score-A.webp` (RECOMMENDED).
- Injected:
```js
const k=document.querySelector('.sds-k');k.innerHTML=k.innerHTML.replace(/^Your six · /,'A sample six · ').replace(/ \(sample\)/,'');
document.querySelector('.sds-rt').textContent='Its Strength Score';
document.querySelectorAll('#main *').forEach(e=>{if(e.children.length===0&&e.textContent.trim()==='Your leads')e.textContent='Sample leads'});
```
  (Sources: stampede-six.js lines 59, 86, 91.)

## 9. S5 My Team top line wraps after an import
- **Still happens: yes.** Checked: Import (Showdown paste of 6) then Replace My Team at 390: band "6 OF 6 · GRASSY TERRAIN TEAM · LEGAL FOR REG M-C"
  on 2 lines (52 px).
- **Recommended (A):** "6 of 6 · Grassy Terrain · Legal ✓" (drop "team" and "for Reg M-C" in the band only; "Not legal yet" stays in full).
  Reason: one line; the full "Legal for Reg M-C" is still in the header row and Team Checks.
- Visual (small). Height: 390 -14 px (52 -> 38), 360 one line too. **320 still wraps** (52 px both ways).
- Pictures: `s5-band-390-now.webp`, `s5-band-390-A.webp` (RECOMMENDED).
- Injected: `.mt-band .tm-eb` text: `replace(/ team\b/i,'')`, `replace(/Legal for Reg M-C/,'Legal ✓')` (source team.js line 455).

## 10. S4 Empty My Team reads "Spot 1, Spot 3, Spot 5"
- **Still happens: yes.** Checked: `#team-empty` 390: columns Lead / Back / Bench, top row "Spot 1 · Spot 3 · Spot 5".
- **Careful:** Sim chose "Add" with "Spot N" under it on Nov 13 (decisions.md 7:22 PM, "Empty My Team Q1 B"; team.js line 283 comment).
  So two options:
  - **A (RECOMMENDED):** "Lead 1 / Lead 2 / Back 1 / Back 2 / Bench 1 / Bench 2". Reason: keeps Sim's sub-line and reads right in any direction.
  - **B:** "Add" only. 35 px shorter on phones (2613 -> 2578), but undoes Sim's Nov 13 choice.
- Visual (small). A: 0 px. Pictures: `s4-empty-team-390-now.webp`, `s4-empty-team-390-A.webp` (RECOMMENDED), `s4-empty-team-390-B.webp`.
- Injected A: `document.querySelectorAll('.sx-grp').forEach(g=>{const l=g.querySelector('.sx-gl').textContent.trim();g.querySelectorAll('.sx-add small').forEach((s,i)=>s.textContent=l+' '+(i+1))})`.
  B: `.sx-add small{display:none}`. (The same label is used in six.js lines 26, 29, 50 for a part-filled team.)

## 11. S7 "Tap a Card to edit, replace or remove it" coloured like a link
- **Still happens: yes.** Checked: DOM, `p.mt-hint`, colour rgb(0,104,173) = `--plot-text` (six.css line 107).
- **Recommended (A):** `color:var(--ink-3)` and weight 500. Reason: blue means "tap me" everywhere else.
- Visual (small). 0 px. Pictures: `s7-hint-390-now.webp`, `s7-hint-390-A.webp` (RECOMMENDED).
- Injected: `.mt-hint{color:var(--ink-3);font-weight:500}`.
- Side note (not asked): on this build My Team phone already opens on Suggestions for this 67 team (S18 looks done).

## 12. S3 "No Pokémon here." link breaks inside its name at 1440
- **Still happens: partly.** The underdog is there now (S33 fix: "Lost? Dragapult's been here all along."), but at 1440 "Every / Pokémon, by tier ›"
  still wraps inside a 484 px paragraph. Checked: screenshot + DOM (`a.np-link.pk-404` inside `p.ra-lede`).
- **Recommended (A):** the link becomes the site's slanted outline button (`np-btn2`) on its own line under the sentence.
  Reason: on a dead-end page the only way out should look tappable and never break.
- Visual (small). Height: 0 at 1440 (900) and 390 (943). Day and night.
- Pictures: `s3-no-pokemon-1440-now.webp`, `s3-no-pokemon-1440-A.webp` (RECOMMENDED), `s3-no-pokemon-390-A.webp`.
- Injected:
```css
.pk-404{display:flex;width:max-content;margin-top:var(--s4)}
```
```js
const a=document.querySelector('.pk-404');a.className='np-btn2 pk-404';a.innerHTML='<span>Every Pokémon, by tier ›</span>';a.parentElement.after(a);
```

## S27 Home "Winning Cores" opens Build's top — no longer happens
- Checked: on Home (390 and 1440) clicked the Winning Cores tile (`a.sdt-go[data-hmcores]`): landed on `#build` with the **Cores** tab selected and
  "Build Around a Core" in view (scrollY 462 at 390, 315 at 1440). The handler is build.js line 194 (`toCores`, `jtab = 'cores'`).
- Picture: `s27-check-390-fixed.webp`. Nothing to ask Sim.

## Setup used (removed at the end)
Worktree `$S/remwt` (detached t1rules 4ffaccf8) + `out/` from 0c992f69, node_modules linked, `art` and `art-s` linked into dist, `python3 -m http.server 8141`.
Prototype scripts were in the scratchpad (`s2/b*.cjs`), not in the repo.
