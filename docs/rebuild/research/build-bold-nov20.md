# Build page, bolder (scan S28 + Sim's note on the Blueprint), Nov 20

Look-and-prototype only (helper). Nothing committed or built. Each option was injected with Playwright (addStyleTag + a few lines of JS)
into the real Preview build (worktree of t1rules at 8b89ad90, data from 0c992f69, `--preview-data`), served over http, real data.
Pictures: docs/rebuild/pics/nov20/S28/ (NOW, A, B, C; 390 day before/after, 1440 day before/after, 1440 night after).

Sim's input (via coordinator): the Blueprint result "sticks out like a sore thumb". So every option covers both states:
before pressing Build Me a Team, and the result after it, moved off the blueprint look (grid paper, crosses, rings, outlined numbers,
uppercase blue labels, the double-ruled stamp) to NastyPlot's look. The result keeps all its content (sheet line, team, chips, score,
score breakdown, six, Spec, Revisions, Notes, actions). On phones Load Team sits right under the six (I moved .bd-acts after .bp-six
with JS to stand in for the other helper's S16 change; it changes order only, not height).

## The options
**A. Blue band (RECOMMENDED).** Home's blue hero band (--sd-hero, light-blue second colour --sd-line2, as Home's hero) runs from the
menu through the headline. Before: the options sit on a white slanted plate (Home's tool plate) that overlaps the band's foot.
After: the band carries the sheet line, team name and a giant white 168 px score; the six sit on the white plate overlapping the band.
Winners' sprites 72 px on desktop (were 56).
*Why: the same move as Home's first screen, so Build reads as NastyPlot at once, and it is the only option that barely lengthens the phone page.*

**B. Black plate with six "?" panels.** Home's black feature plate (the Ratings tile). Before: six blue slanted "?" panels on it,
which the build fills (the scan's S28 fix idea). After: sheet line, team, giant score and the six, large, on the black plate.
Options and winners stay on the page background.

**C. Beige plates.** The whole page on Home's beige tools band. Before: the options on a white slanted plate; each Recent Winner is
its own slanted plate (the first one black), Unbounded event name, 80 px sprites. After: team and blue 168 px score on one plate,
each of the six on its own plate with the sprite breaking out of its top (Home's podium).

## Phone length at 390 (page height / 844 screen heights; measured, scrollHeight, day; night identical)
| | before Build | after Build |
|---|---|---|
| NOW | 1412 px, 1.67 | 4098 px, 4.86 |
| A | 1439 px, 1.70 (+27) | 3497 px, 4.14 (-601) |
| B | 1589 px, 1.88 (+177) | 3604 px, 4.27 (-494) |
| C | 1531 px, 1.81 (+119) | 3616 px, 4.28 (-482) |

Honest note: before a build all three are a little longer on phones (A by 27 px; B and C by 0.14-0.21 screens: the "?" plate and the
plate padding). After a build all three are shorter, mostly from the shared change of the six to 3 across on phones (was 2 across).
1440 before / after: NOW 926 / 2160; A 1051 / 2183; B 1272 / 2203; C 1184 / 2495. No sideways scroll and no page errors in any run.

## Checked / not checked
- Checked (screenshots + DOM measurement): the heights above, no sideways scroll at 390 and 1440, zero page errors, both themes render.
- Not checked: polish-check / qcheck sweep (odd widths 320-2560), tap sizes, a11y contrast numbers, the open state of a Recent Winner
  plate in C, Cores tab, the in-between widths 700-1179 (the CSS has phone and desktop rules only).
- Seen and not fixed yet: at 390 the "Type a Pokémon" placeholder is cut by the plate's extra padding in A and C (shorten the plate
  gutter or the hint); in B night the black plate on the night background relies on Home's rim token (--sd-feat-rim), weaker than day;
  team names wrap to two lines at 1440 in B and C (one line in NOW and A); the Strength Score's small line wraps to 3 lines at 390.
- The "?" panels' line "Your six · built from real winning teams" (B) is new copy: needs Sim's OK.

## CSS injected (for building later)
Shared by all options (base.css):
```css
/* S28 shared base (all options): take the blueprint paper off Build's result; the content stays, the lines go soft */
.bd2{--bp-ink:var(--rule)}
.bd2 .bp{background:none;border:0;clip-path:none;padding:0;gap:var(--s5)}
.bd2 .bp-x,.bd2 .bp-ring,.bd2 .bp-no{display:none}
.bd2 .bp-line{padding-bottom:0;border-bottom:0;font:600 var(--t13)/1.4 var(--b);letter-spacing:.04em;text-transform:none;color:var(--ink-2)}
.bd2 .bp-k,.bd2 .bp-dim,.bd2 .bp-champ{letter-spacing:.04em;text-transform:none;color:var(--ink-2)}
.bd2 .bp-dim{justify-content:flex-start}.bd2 .bp-dim::before{display:none}.bd2 .bp-dim span{padding:0;background:none}
.bd2 .bp-chips .np-chip{border:0;background:var(--wash);color:var(--ink)}
.bd2 .bp-stamp{border:0;padding:var(--s1) var(--s4);background:var(--band);color:var(--on-mark);rotate:none;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.bd2 .bp-role,.bd2 .bp-rl{color:var(--plot-text)}
.bd2 .bp-tb{border:0;gap:var(--s10)}.bd2 .bp-right{border:0}.bd2 .bp-left,.bd2 .bp-right{padding:0}
.bd2 .bp-rev{border-color:var(--rule)}.bd2 .bp-wplace{border-color:var(--rule)}
.bd2 .bp2 .bd-jump button,.bp2 .bd-jump button{border-color:var(--rule)}
@media (max-width:699.98px){.bd2 .bp{margin:var(--s2) var(--gut) 0}.bd2 .bp-six{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s4) var(--s2)}
  .bd2 .bp-art{height:auto}.bd2 .bp-tb{gap:var(--s6)}}
@media (max-width:699.98px){.bd2 .bp-art{height:96px}.bd2 .bp-fig .np-mon{--iw:min(96px,100cqw)}
  .bd2 .bp-fig b{font:700 var(--t15)/1.25 var(--b);font-style:normal}
  .bd2 .bp-src{display:none} /* the same words as the page's eyebrow just above (C3: nothing shown twice) */
  .bd2 .bp-score{flex-wrap:nowrap}.bd2 .bp-score .w{padding-bottom:0}}
```

Shared JS stand-in for S16 (phones): `.bd-result .bd-acts` moved right after `.bd-result .bp-six`.

### Option A
```css
/* S28 option A, "Blue band": Home's blue hero band runs from the menu down through the headline and, after a build, the team's
   name and its giant Strength Score; the options (before) and the six (after) sit on a white slanted plate that overlaps the band */
.bd2>.bd-head{border-image:conic-gradient(var(--sd-hero) 0 0) fill 0/0/0 100vmax;padding:var(--s8) 0 var(--s6);color:var(--sd-on-band)}
.bd2>.bd-head h1{color:var(--sd-on-band);font-size:var(--d96);line-height:1}.bd2>.bd-head h1 .pl{color:var(--sd-line2)}
.bd2>.bd-head .np-eyebrow{color:var(--sd-on-band)}.bd2>.bd-head .np-eyebrow::before{background:var(--sd-line2)}
.bd2>.bd-head .bd-side p{color:var(--sd-on-band)}.bd2>.bd-head .np-link{color:var(--sd-on-band);text-decoration:underline;text-underline-offset:var(--s1)}
/* the plate: options before a build, the six after */
.bd2>.bd-opts,.bd2 .bp-six{--k:16px;position:relative;isolation:isolate;border:0;padding:var(--s6) calc(var(--s6) + var(--k))}
.bd2>.bd-opts{margin-top:0;border-image:linear-gradient(var(--sd-hero) 0 50%,transparent 50%) fill 0/0/0 100vmax}
.bd2>.bd-opts::before,.bd2>.bd-opts::after,.bd2 .bp-six::before,.bd2 .bp-six::after{content:"";position:absolute;inset:0;clip-path:polygon(var(--k) 0,100% 0,calc(100% - var(--k)) 100%,0 100%)}
.bd2>.bd-opts::before,.bd2 .bp-six::before{z-index:-1;background:var(--sd-card)}
.bd2>.bd-opts::after,.bd2 .bp-six::after{z-index:-2;background:var(--sd-card-shade);translate:var(--s2) var(--s2)}
:root[data-theme="night"] .bd2>.bd-opts::after,:root[data-theme="night"] .bd2 .bp-six::after{background:var(--sd-feat-rim);inset:-1px;translate:none}
.bd2>.bd-opts .bd-lab{color:var(--sd-card-ink2)}
.bd2>.bd-jump{margin-top:var(--s6)}
/* after a build: the band carries the sheet line, the team and the score */
.bd2 .bd-result .bp{margin-top:0;gap:0}
.bd2 .bp-line,.bd2 .bp-top,.bd2 .bp-dim{border-image:conic-gradient(var(--sd-hero) 0 0) fill 0/0/0 100vmax;color:var(--sd-on-band)}
.bd2 .bp-line{padding-top:var(--s2)}.bd2 .bp-line .bp-plate{background:var(--sd-card);color:var(--plot-text)}
.bd2 .bp-top{padding:var(--s4) 0 var(--s6)}
.bd2 .bp-top .bp-k,.bd2 .bp-top small,.bd2 .bp-top .bd-brk{color:var(--sd-on-band)}.bd2 .bp-top .np-link{color:var(--sd-on-band);text-decoration:underline}
.bd2 .bp-team h2{color:var(--sd-on-band)}
.bd2 .bp-chips .np-chip{background:none;border:1.5px solid var(--sd-on-band);color:var(--sd-on-band)}
.bd2 .bp .bp-score>b{font-size:var(--d168);color:var(--sd-on-band)}
.bd2 .bp-stamp{background:var(--sd-card);color:var(--sd-card-ink);box-shadow:inset var(--s2) 0 0 var(--band)}
.bd2 .bp-dim{margin:0;padding-bottom:var(--s8);border-image:linear-gradient(var(--sd-hero) 0 0) fill 0/0/0 100vmax;color:var(--sd-line2)}
.bd2 .bp-six{margin-top:calc(var(--s8) * -1);border-image:linear-gradient(var(--sd-hero) 0 var(--s8),transparent var(--s8)) fill 0/0/0 100vmax}
.bd2 .bp-tb,.bd2 .bp .bd-acts{margin-top:var(--s8)}
/* the winners' six: Home-size sprites */
.bd-wsix .np-mon .st{width:64px}.bd-wsix>*{width:72px}
@media (max-width:699.98px){.bd2>.bd-head h1{font-size:var(--t34)}.bd2>.bd-head{padding:var(--s6) 0 var(--s5)}
  .bd2>.bd-opts,.bd2 .bp-six{--k:8px;padding:var(--s4) calc(var(--s3) + var(--k))}
  .bd2 .bp .bp-score>b{font-size:var(--d96)}.bd2 .bp-top{padding:var(--s2) 0 var(--s5)}
  .bd2 .bp .bd-acts{margin-top:var(--s5)}.bd-wsix .np-mon .st{width:44px}.bd-wsix>*{width:48px}}
```

### Option B
```css
/* S28 option B, "Black plate": Home's black feature plate (the Ratings tile). Before a build it holds six "?" panels that the
   build fills; after, it holds the sheet line, the team, a giant score and the six, large. Options and winners stay on the page. */
.bd2>.bd-head h1{font-size:var(--d96);line-height:1}
.s28q,.s28p{--k:24px;position:relative;isolation:isolate;margin-top:var(--s6);padding:var(--s6) calc(var(--s8) + var(--k)) var(--s8);color:var(--sd-on-feat)}
.s28q::before,.s28q::after,.s28p::before,.s28p::after{content:"";position:absolute;inset:0;clip-path:polygon(var(--k) 0,100% 0,calc(100% - var(--k)) 100%,0 100%)}
.s28q::before,.s28p::before{z-index:-1;background:var(--sd-feat)}
.s28q::after,.s28p::after{z-index:-2;background:var(--sd-card-shade);translate:var(--s2) var(--s2)}
:root[data-theme="night"] .s28q::after,:root[data-theme="night"] .s28p::after{background:var(--sd-feat-rim);inset:-1px;translate:none}
.s28q-k{margin:0 0 var(--s4);font:600 var(--t15)/1.5 var(--b);color:var(--sd-feat-ink2)}
.s28q-six{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--s3)}
.s28q-six span{display:grid;place-items:center;height:128px;background:var(--sd-race);color:var(--sd-on-race);clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}
.s28q-six b{font:900 var(--d96)/1 var(--u);font-style:italic;opacity:.9}
/* after a build */
.bd2 .bd-result .bp{gap:var(--s6)}
.s28p{display:grid;gap:var(--s5);margin-top:var(--s2)}
.s28p .bp-line,.s28p .bp-k,.s28p .bp-dim,.s28p small,.s28p .bd-brk,.s28p .bp-fig small,.s28p .bp-fig small.r{color:var(--sd-feat-ink2)}
.s28p .bp-team h2,.s28p .bp-fig b{color:var(--sd-on-feat)}.s28p .bp-mg{color:var(--sd-you)}
.s28p .np-link{color:var(--sd-you)}
.s28p .bp-chips .np-chip{background:none;border:1.5px solid var(--sd-feat-ink2);color:var(--sd-on-feat)}
.s28p .bp-score>b{font-size:var(--d168);color:var(--sd-on-feat)}
.s28p .bp-line .bp-plate{background:var(--sd-race);color:var(--sd-on-race)}
.s28p .bp-six{margin-top:var(--s2)}
.bd-wsix .np-mon .st{width:64px}.bd-wsix>*{width:72px}
@media (max-width:699.98px){.bd2>.bd-head h1{font-size:var(--t34)}
  .s28q,.s28p{--k:12px;margin-left:var(--s4);margin-right:var(--s4);padding:var(--s4) calc(var(--s3) + var(--k)) var(--s5)}
  .s28q-k{margin-bottom:var(--s3);font-size:var(--t13)}.s28q-six{gap:var(--s1)}.s28q-six span{height:64px;clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}.s28q-six b{font-size:var(--t28)}
  .s28p .bp-score>b{font-size:var(--d96)}.s28p .bp-six{gap:var(--s4) var(--s1)}
  .bd-wsix .np-mon .st{width:44px}.bd-wsix>*{width:48px}}
```
JS (in the real build this is an HTML change in build.js / build-sheet.js):
```js
(() => { /* B: before a build, six "?" panels on the black plate; after, the sheet line, team, score and six move onto that plate */
  const r = document.querySelector('.bd-result'); if (!r) return;
  if (!r.querySelector('.bp') && !r.querySelector('.s28q') && !r.textContent.trim()) {
    r.innerHTML = '<div class="s28q"><p class="s28q-k">Your six · built from real winning teams</p><div class="s28q-six">' + '<span><b class="u">?</b></span>'.repeat(6) + '</div></div>'; }
  const bp = r.querySelector('.bp'); if (bp && !bp.querySelector('.s28p')) { const w = document.createElement('div'); w.className = 's28p';
    const parts = ['.bp-line', '.bp-top', '.bp-dim', '.bp-six'].map(s => bp.querySelector(':scope>' + s)).filter(Boolean); parts[0].before(w); parts.forEach(p => w.append(p)); } })();
```

### Option C
```css
/* S28 option C, "Beige plates": the whole page on Home's beige tools band; every block is a white slanted plate with its shade
   (Home's tool plates). After a build: the team and giant score on one plate, each of the six on its own plate with the sprite
   breaking out of its top (Home's podium); before: the options plate and the Recent Winners as three plates with large sprites. */
.bd2{background:var(--sd-beige);padding-bottom:var(--s12)}
.bd2>.bd-head h1{font-size:var(--d96);line-height:1;color:var(--sd-card-ink)}.bd2>.bd-head .bd-side p{color:var(--sd-card-ink)}
:root[data-theme="night"] .bd2>.bd-head h1{color:var(--ink)}
.bd2>.bd-opts,.bd2 .bp-top,.bd2 .bp-fig,.bd-win{--k:16px;position:relative;isolation:isolate;border:0}
.bd2>.bd-opts::before,.bd2>.bd-opts::after,.bd2 .bp-top::before,.bd2 .bp-top::after,.bd2 .bp-fig::before,.bd2 .bp-fig::after,.bd-win::before,.bd-win::after{content:"";position:absolute;inset:0;clip-path:polygon(var(--k) 0,100% 0,calc(100% - var(--k)) 100%,0 100%);pointer-events:none}
.bd2>.bd-opts::before,.bd2 .bp-top::before,.bd2 .bp-fig::before,.bd-win::before{z-index:-1;background:var(--sd-card)}
.bd2>.bd-opts::after,.bd2 .bp-top::after,.bd2 .bp-fig::after,.bd-win::after{z-index:-2;background:var(--sd-card-shade);translate:var(--s2) var(--s2)}
:root[data-theme="night"] :is(.bd2>.bd-opts,.bd2 .bp-top,.bd2 .bp-fig,.bd-win)::after{background:var(--sd-feat-rim);inset:-1px;translate:none}
.bd2>.bd-opts{margin-top:var(--s6);padding:var(--s6) calc(var(--s6) + var(--k))}
.bd2 .bp-top{padding:var(--s6) calc(var(--s8) + var(--k))}
.bd2 .bp-top .bp-team h2{font-size:var(--d64)}.bd2 .bp .bp-score>b{font-size:var(--d168);color:var(--plot-text)}
.bd2 .bp-six{gap:var(--s4);margin-top:var(--s10)}
.bd2 .bp-fig{--k:10px;padding:0 var(--s2) var(--s4)}
.bd2 .bp-fig .bp-art{height:auto;margin-top:calc(var(--s10) * -1)}
.bd2 .bp-fig .np-mon{--iw:min(152px,100cqw)}
.bd-lower{border-top:0}
.bd-win,.bd-win+.bd-win{margin-top:var(--s6);border-top:0}
.sg2-fold.bd-win>summary{grid-template-columns:minmax(0,1fr) auto;padding:var(--s4) calc(var(--s4) + var(--k)) var(--s4)}
.sg2-fold.bd-win>summary .bd-wsix{grid-column:1/-1;grid-row:2;justify-content:space-between}
.sg2-fold.bd-win>summary::after{grid-column:2;grid-row:1}
.bd-wsix .np-mon .st{width:80px}.bd-wsix>*{width:88px}
@media (min-width:700px){.sg2-fold.bd-win>summary{grid-template-columns:minmax(0,1fr) auto auto}.sg2-fold.bd-win>summary .bd-wsix{grid-column:2;grid-row:1}.sg2-fold.bd-win>summary::after{grid-column:3}}
.bd-win .bd-wev{font:900 var(--t20)/1.25 var(--u);font-style:italic}
.bd-win[open]{padding:0 calc(var(--s4) + var(--k)) var(--s4)}.bd-win[open]>summary{padding-left:0;padding-right:0}
.bd-win:first-of-type{color:var(--sd-on-feat)}.bd-win:first-of-type::before{background:var(--sd-feat)}
.bd-win:first-of-type .bd-wk,.bd-win:first-of-type .bd-wk b,.bd-win:first-of-type .bd-wev,.bd-win:first-of-type small,.bd-win:first-of-type .bd-wwho,.bd-win:first-of-type .bd-at{color:var(--sd-on-feat)}
.bd-win:first-of-type>summary::after{color:var(--sd-you)}
@media (max-width:1179.98px){.bd2 .bp-fig .np-mon{--iw:min(120px,100cqw)}}
@media (max-width:699.98px){.bd2>.bd-head h1{font-size:var(--t34)}
  .bd2>.bd-opts{--k:8px;padding:var(--s4) calc(var(--s3) + var(--k));margin-left:calc(var(--gut) - var(--s1));margin-right:calc(var(--gut) - var(--s1))}
  .bd2 .bp-top{--k:8px;padding:var(--s4) calc(var(--s3) + var(--k))}.bd2 .bp-top .bp-team h2{font-size:var(--t34)}.bd2 .bp .bp-score>b{font-size:var(--d96)}
  .bd2 .bp-six{margin-top:var(--s8);gap:var(--s8) var(--s2)}.bd2 .bp-fig{--k:6px;padding:0 var(--s1) var(--s3)}.bd2 .bp-fig .bp-art{height:auto;margin-top:calc(var(--s6) * -1)}
  .bd2 .bp-fig .np-mon{--iw:min(96px,100cqw)}
  .bd-win{--k:8px}.sg2-fold.bd-win>summary{padding:var(--s3) calc(var(--s3) + var(--k))}.bd-wsix .np-mon .st{width:44px}.bd-wsix>*{width:48px}.bd-win .bd-wev{font-size:var(--t17)}}
.bd2>.bd-jump{background:var(--sd-beige)}
```

