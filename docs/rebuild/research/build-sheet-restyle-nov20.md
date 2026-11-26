# Build sheet, restyled as NastyPlot (Q81 A and B), Nov 20 (written 11:17 AM, clock)

Prototype only (helper). Nothing committed, no site code changed. Each option is CSS injected with Playwright `addStyleTag`
(B also 3 lines of JS) into the real Preview build: worktree of t1rules at 3bf5f0c6, data from 0c992f69, `--preview-data`,
served over http (fonts load), real data. Pictures: docs/rebuild/pics/nov20/Q81/Q81-{now,A,B}-*.png
(390 light before Build; 390 light sheet top; 390 light six + Load Team; 1440 light result top; 1440 dark result top).
Q81 C and D (completely new concepts) are another helper's, in the same folder.

Sim's brief: keep the Blueprint (its idea, content, structure, handy controls); lose the drawing-paper style (grid paper, thin blue
lines, crosses, rings, outlined numbers, uppercase blue labels, double-ruled stamp); lift the page before Build a little.
Judged on his four points: polish, creativity, fun, daily usability.

## What stays identical in both
Every piece of content and every control, in the same order: sheet line (Sheet 1 of 4, kind, source), Team + name + chips, score +
band word + rank line + breakdown + Why This Score, the dimension line "Team of six · 2 Megas", the six numbered figures (sprite,
type bar, Mega, name, item, tier), Spec (Build from, Megas, Build around, Megas tip), Revisions A-D, Build Me a Team, Notes 1-4,
proven-team note, Load Team / Save / Copy for Showdown, catch lines. Load Team stays right under the six on phones (S16), one
Load Team on the page. Same hooks (data-bdgo, data-bdshow, data-bduse...). The lower Reference sheets / Parts list get the same
plate and soft rules. The page before Build keeps its layout; only the options get a plate and the winners' sprites grow.

## The options
**A. NastyPlot build sheet (RECOMMENDED).** The sheet is Home's slanted white tool plate with its beige shade (night: the dark plate
with a rim), no grid. Crosses become two slanted logo-colour tabs (blue top-left, pink bottom-right). Labels become the site's
eyebrow (blue slash + plain words). Figure numbers are solid slanted blue 01-06; each sprite stands on a slanted wash plate instead
of the dashed ring, sprites larger (156 px desktop, 112 phone). The score is the one bold colour field: a slanted hero-blue plate,
giant white 93, the band word as a solid white sticker (band-colour edge, still tilted). The title block keeps its two halves,
split by soft rules, no box. Before Build: the options sit on the same white slanted plate.
*Why: it keeps the Blueprint's layout and every annotation, so the character Sim liked stays, and it is the only one that
does not lengthen the phone result (shorter than now by 28 px).*

**B. Blue-top build sheet.** Same plate, bolder: the plate's top is a full-width hero-blue field carrying the sheet line (white
"Sheet 1 of 4" plate at 24 px), the team in white and a giant 168 px white score with the sticker. Below it, giant ghost numbers
01-06 (96 px, the cards' --card-giant tone) sit behind larger sprites (176 px desktop, 128 phone). Spec, Revisions and Notes are
headed in slanted Unbounded (22 px) like sheet sections; Notes numbers blue, counters pink. Before Build: the options on a blue
slanted plate (the sheet's blue field, waiting).
*Strongest WOW, but the phone result grows by 154 px and on desktop the six ghost numbers read as one busy strip.*

## The four points (my judgement from the pictures, not measured)
| | A | B |
|---|---|---|
| Polish | type on the scale (checked), 4px spacing, even six, one colour field; light and dark both fine | same checks pass; the ghost numbers overlap neighbours' sprites (01 02 03... run together at 1440) |
| Creativity (Blueprint personality) | every annotation kept: numbered figures, dimension line with end ticks, corner tabs, tilted sticker | kept too, but the blue field takes over the top half; closer to the rejected S28 "blue band" look |
| Fun | blue score plate + tilted sticker + sprite plates | most fun: giant score on blue, giant ghost numbers |
| Daily usability | score readable at once on its own plate; Load Team at 1531 px on phones (now 1490) | Load Team at 1573 px on phones; more scrolling past the blue field |

## Phone and desktop heights (measured: scrollHeight, same run as the pictures, day; night identical)
| | before Build, 390 | after Build, 390 | Load Team top, 390 | before / after, 1440 |
|---|---|---|---|---|
| NOW | 1412 | 4102 | 1490 | 926 / 2160 |
| A | 1422 (+10) | 4074 (-28) | 1531 | 932 / 2232 |
| B | 1422 (+10) | 4256 (+154) | 1573 | 932 / 2329 |
Before Build is inside the +30 px limit for both. After Build, A is shorter than now; B is 0.18 screens longer.

## Checked / not checked
- Checked (scratchpad q81/pol.mjs, real-data build, 320 360 390 820 1100 1280 1440 1920, day and night, before and after Build):
  sideways scroll 0 in every run; page errors 0; every font size of visible text in .bd2 on the scale; no text past the screen edge.
  Result line, same for NOW, A and B: `findings [ 'clipped vh', 'clipped np-eyebrow vh' ]` = only the screen-reader-only labels
  (.vh), which are meant to be clipped; no new finding from A or B.
- Checked (q81/shot.mjs): one Load Team on the page (useN 1) in all runs; heights above.
- Not checked: text-over-text overlap (the check does not measure it; I looked at the pictures: none seen except B's ghost
  numbers behind sprites, which is on purpose); tap targets; keyboard; odd widths beyond the 8 listed; the other team kinds
  (fresh take, build-around, "Tournament ready" band word on the blue plate at 320: the CSS lets it wrap under the score, not pictured).
- In the real build B's blue field height would be set by build-sheet.js (here a JS line measures .bp-top).

## Exact CSS injected

### A (opt-A.css)
```css
/* Q81 option A, "NastyPlot build sheet": the Blueprint's layout and every annotation kept; the drawing paper becomes Home's slanted
   white plate (with its shade), the blue hairlines become soft rules, outlined numbers become solid slanted numbers, uppercase blue
   labels become the site's eyebrow (blue slash + plain words), and the score sits on one bold blue field with a solid sticker. */
/* the sheet: a slanted plate, no grid, no frame */
.bp2 .bp{--k:24px;isolation:isolate;background:none;border:0;clip-path:none;padding:var(--s8) calc(var(--s8) + var(--k)) var(--s10)}
.bp2 .bp::before,.bp2 .bp::after{content:"";position:absolute;inset:0;clip-path:polygon(var(--k) 0,100% 0,calc(100% - var(--k)) 100%,0 100%);pointer-events:none}
.bp2 .bp::before{z-index:-1;background:var(--sd-card)}
.bp2 .bp::after{z-index:-2;background:var(--sd-card-shade);translate:var(--s2) var(--s2)}
:root[data-theme="night"] .bp2 .bp::before{background:var(--surface)}
:root[data-theme="night"] .bp2 .bp::after{background:var(--sd-feat-rim);inset:-1px;translate:none}
/* corner marks: the crosses become two slanted logo-colour tabs */
.bp2 .bp .bp-x::before,.bp2 .bp .bp-x::after{content:none}.bp2 .bp .bp-x.xtr,.bp2 .bp .bp-x.xbl{display:none}
.bp2 .bp .bp-x.xtl,.bp2 .bp .bp-x.xbr{width:var(--s10);height:var(--s2);transform:skewX(var(--slant))}
.bp2 .bp .bp-x.xtl{left:calc(var(--k) + var(--s6));top:var(--s3);background:var(--plot)}
.bp2 .bp .bp-x.xbr{right:calc(var(--k) + var(--s6));bottom:var(--s3);background:var(--pick)}
/* sheet line and labels: the eyebrow, not drafting caps */
.bp2 .bp-line{border-bottom:1px solid var(--rule);font:600 var(--t15)/1.4 var(--b);letter-spacing:0;text-transform:none;color:var(--ink-2)}
.bp2 .bp-line .bp-kind{font:900 var(--t17)/1.2 var(--u);font-style:italic;color:var(--ink)}
.bp2 .bp-plate{padding:var(--s1) var(--s4);font-size:var(--t17)}
.bp2 .bp-k,.bp2 .bp-champ{display:flex;align-items:center;gap:var(--s3);font:600 var(--t13)/1.4 var(--b);letter-spacing:.04em;text-transform:none;color:var(--ink-2)}
.bp2 .bp-k::before{content:"";flex:none;width:20px;height:7px;background:var(--plot);transform:skewX(var(--slant))}
.bp2 .bp-champ::before,.bp2 .bp-champ::after{background:var(--rule);opacity:1}
/* team chips: the site's chips */
.bp2 .bp-chips .np-chip{border:0;background:var(--wash);color:var(--ink)}
/* the score: one bold colour field (Home's hero blue), a giant solid number and a solid band sticker */
.bp2 .bp-meas{--k:16px;position:relative;isolation:isolate;padding:var(--s4) calc(var(--s4) + var(--k));color:var(--sd-on-band)}
.bp2 .bp-meas::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--sd-hero);clip-path:polygon(var(--k) 0,100% 0,calc(100% - var(--k)) 100%,0 100%)}
.bp2 .bp .bp-meas .bp-score>b{color:var(--sd-on-band)}
.bp2 .bp .bp-meas .bp-score small,.bp2 .bp .bp-meas .bd-brk{color:var(--sd-on-band)}
.bp2 .bp .bp-meas .np-link,.bp2 .bp .bp-meas a{color:var(--sd-on-band);text-decoration:underline;text-underline-offset:var(--s1)}
.bp2 .bp-stamp{border:0;padding:var(--s1) var(--s5);background:var(--sd-card);color:var(--sd-card-ink);box-shadow:inset var(--s2) 0 0 var(--band);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);rotate:-4deg}
.bp2 .bp-meas .bd-brk{margin-top:var(--s2)}
/* the dimension line stays, as a soft rule with slanted end ticks and a slanted label */
.bp2 .bp-dim{font:900 var(--t15)/1.4 var(--u);font-style:italic;letter-spacing:0;text-transform:none;color:var(--ink)}
.bp2 .bp-dim::before{background:var(--rule);border:0}
.bp2 .bp-dim::after{content:"";position:absolute;inset:calc(50% - var(--s2)) 0 auto;height:var(--s4);border-inline:3px solid var(--plot);transform:skewX(var(--slant))}
.bp2 .bp-dim span,:root:not([data-theme="night"]) .bp2 .bp-dim span{background:var(--sd-card)}
:root[data-theme="night"] .bp2 .bp-dim span{background:var(--surface)}
/* the six figures: solid slanted numbers, a slanted wash plate behind each sprite instead of the dashed ring, sprites larger */
.bp2 .bp-no{color:var(--plot-text);-webkit-text-stroke:0;font-size:var(--t34)}
.bp2 .bp-ring{inset:var(--s5) var(--s3) var(--s2);left:var(--s3);top:var(--s5);width:auto;height:auto;translate:none;border:0;border-radius:0;opacity:1;background:var(--wash);clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}
.bp2 .bp-ring::before,.bp2 .bp-ring::after{content:none}
.bp2 .bp-fig .np-mon{--iw:min(156px,100cqw)}.bp2 .bp-art{height:164px}
/* the title block: no box in the box; a soft rule on top and between its two halves */
.bp2 .bp-tb{border:0;border-top:1px solid var(--rule)}
.bp2 .bp-right{border-left:1px solid var(--rule)}
.bp2 .bp-left{padding-left:0}.bp2 .bp-right{padding-right:0}
.bp2 .bp .bp-spec .bd-opt{border-bottom:1px solid var(--rule)}
.bp2 .bp-rev{border:0;border-bottom:1px solid var(--rule);clip-path:none}
.bp2 .bp-rev.on{border-bottom-color:transparent;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.bp2 .bp-rl{color:var(--plot-text)}.bp2 .bp-rev.on .bp-rl{color:inherit}
.bp2 .bp-notes li::before{font:900 var(--t15)/1 var(--u);font-style:italic;color:var(--plot-text)}
.bp2 .bp-notes .n{font-size:var(--t28)}
/* the lower sheets (Reference sheets, Parts list) get the same plate and soft rules */
.bp2 .bp-ref .bd-win{border-top:1px solid var(--rule)}.bp2 .bp-ref .bd-win[open]{border:1px solid var(--rule)}
.bp2 .bp-wplace{border:0;background:var(--plot);color:var(--on-mark);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.bp2 .bp-parts .bd-cn{color:var(--plot-text);-webkit-text-stroke:0}.bp2 .bp-parts .bd-core{border-bottom-color:var(--rule)}
.bp2 .bd-jump button{border-color:var(--rule)}
.bp2 .bp-ref .bd-wsix>*{width:56px}
/* phones */
@media (max-width:1099.98px){.bp2 .bp-right{border-left:0;border-top:1px solid var(--rule)}.bp2 .bp-left,.bp2 .bp-right{padding-inline:0}}
@media (max-width:699.98px){.bp2 .bp{--k:10px;padding:var(--s6) calc(var(--s3) + var(--k)) var(--s8)}
  .bp2 .bp .bp-x.xtl,.bp2 .bp .bp-x.xbr{width:var(--s6);height:6px}
  .bp2 .bp-meas{--k:10px;padding:var(--s4) calc(var(--s2) + var(--k))}
  .bp2 .bp .bp-meas .bp-score>b{font-size:var(--d64)}.bp2 .bp .bp-meas .bp-score{gap:var(--s3)}.bp2 .bp .bp-meas .bp-score .w{padding-bottom:0}
  .bp2 .bp-stamp{font-size:var(--t17);padding:var(--s1) var(--s3);white-space:nowrap}.bp2 .bp-line .bp-kind{font-size:var(--t15)}.bp2 .bp-line{font-size:var(--t13)}
  .bp2 .bp-no{font-size:var(--t24)}.bp2 .bp-fig .np-mon{--iw:min(112px,100cqw)}.bp2 .bp-art{height:116px}
  .bp2 .bp-ring{top:var(--s4);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
  .bp2 .bp-notes .n{font-size:var(--t22)}.bp2 .bp-ref .bd-wsix>*{width:44px}}

/* the page before a build: the options on Home's slanted white plate, Recent Winners with larger sprites */
.bd2:not(.bp2)>.bd-opts{--k:16px;position:relative;isolation:isolate;border:0;padding:var(--s5) calc(var(--s6) + var(--k))}
.bd2:not(.bp2)>.bd-opts::before,.bd2:not(.bp2)>.bd-opts::after{content:"";position:absolute;inset:0;clip-path:polygon(var(--k) 0,100% 0,calc(100% - var(--k)) 100%,0 100%);pointer-events:none}
.bd2:not(.bp2)>.bd-opts::before{z-index:-1;background:var(--sd-card)}
.bd2:not(.bp2)>.bd-opts::after{z-index:-2;background:var(--sd-card-shade);translate:var(--s2) var(--s2)}
:root[data-theme="night"] .bd2:not(.bp2)>.bd-opts::before{background:var(--surface)}
:root[data-theme="night"] .bd2:not(.bp2)>.bd-opts::after{background:var(--sd-feat-rim);inset:-1px;translate:none}
.bd2:not(.bp2) .bd-wins .bd-wsix>*{width:72px}
@media (max-width:699.98px){.bd2:not(.bp2)>.bd-opts{--k:8px;margin-inline:var(--s1);padding:var(--s4) calc(var(--s2) + var(--k))}}
@media (max-width:519.98px){.bd2:not(.bp2) .bd-wsix>*{width:44px}}
/* phones: the band word sits beside the score when it fits (it wraps under it only when it doesn't) */
@media (max-width:459.98px){.bd-result .bp .bp-score .w{flex:1 1 140px;min-width:min-content}}
```

### B (opt-B.css)
```css
/* Q81 option B, "Blue-top build sheet": the same sheet, bolder. The plate's top is a full-width blue colour field (Home's hero blue)
   carrying the sheet number, the team, a giant white score and the band sticker; below it the six with giant ghost numbers behind
   larger sprites; Spec, Revisions and Notes stay as the sheet's sections, headed in slanted Unbounded. */
.bp2 .bp{--k:24px;--hdr:0px;isolation:isolate;background:none;border:0;clip-path:none;padding:var(--s6) calc(var(--s8) + var(--k)) var(--s10)}
.bp2 .bp::before,.bp2 .bp::after{content:"";position:absolute;inset:0;clip-path:polygon(var(--k) 0,100% 0,calc(100% - var(--k)) 100%,0 100%);pointer-events:none}
.bp2 .bp::before{z-index:-1;background:linear-gradient(var(--sd-card) 0 0)}
.bd-result .bp::before{background:linear-gradient(var(--sd-hero) 0 var(--hdr),var(--sd-card) var(--hdr))}
.bp2 .bp::after{z-index:-2;background:var(--sd-card-shade);translate:var(--s2) var(--s2)}
:root[data-theme="night"] .bp2 .bp::before{background:linear-gradient(var(--surface) 0 0)}
:root[data-theme="night"] .bd-result .bp::before{background:linear-gradient(var(--sd-hero) 0 var(--hdr),var(--surface) var(--hdr))}
:root[data-theme="night"] .bp2 .bp::after{background:var(--sd-feat-rim);inset:-1px;translate:none}
.bp2 .bp .bp-x::before,.bp2 .bp .bp-x::after{content:none}.bp2 .bp .bp-x.xtl,.bp2 .bp .bp-x.xtr,.bp2 .bp .bp-x.xbl{display:none}
.bp2 .bp .bp-x.xbr{right:calc(var(--k) + var(--s6));bottom:var(--s3);width:var(--s16);height:var(--s2);background:var(--pick);transform:skewX(var(--slant))}
/* the blue field: sheet line, team, score */
.bp2 .bp-line{border-bottom:1px solid var(--rule);font:600 var(--t15)/1.4 var(--b);letter-spacing:0;text-transform:none;color:var(--ink-2)}
.bd-result .bp-line{border-bottom-color:var(--sd-post-line);color:var(--sd-line2)}
.bd-result .bp-line .bp-kind{font:900 var(--t20)/1.2 var(--u);font-style:italic;color:var(--sd-on-band)}
.bd-result .bp-plate{padding:var(--s1) var(--s5);background:var(--sd-card);color:var(--plot-text);font-size:var(--t24)}
:root[data-theme="night"] .bd-result .bp-plate{color:var(--sd-card-ink)}
.bd-result .bp-top{padding-bottom:var(--s2)}
.bd-result .bp-top .bp-k{color:var(--sd-line2)}
.bd-result .bp-team h2{color:var(--sd-on-band)}
.bd-result .bp-chips .np-chip{background:none;border:1.5px solid var(--sd-on-band);color:var(--sd-on-band)}
.bd-result .bp .bp-score>b{font-size:var(--d168);color:var(--sd-on-band)}
.bd-result .bp .bp-score small,.bd-result .bp .bd-brk{color:var(--sd-on-band)}
.bd-result .bp .bp-meas a,.bd-result .bp .bp-meas .np-link{color:var(--sd-on-band);text-decoration:underline;text-underline-offset:var(--s1)}
.bp2 .bp-stamp{border:0;padding:var(--s1) var(--s5);background:var(--sd-card);color:var(--sd-card-ink);box-shadow:inset var(--s2) 0 0 var(--band);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);rotate:-4deg}
/* labels: the site's eyebrow; the title block's three sections get slanted Unbounded heads */
.bp2 .bp-k,.bp2 .bp-champ{display:flex;align-items:center;gap:var(--s3);font:600 var(--t13)/1.4 var(--b);letter-spacing:.04em;text-transform:none;color:var(--ink-2)}
.bp2 .bp-k::before{content:"";flex:none;width:20px;height:7px;background:var(--pick);transform:skewX(var(--slant))}
.bp2 .bp-tb .bp-k{font:900 var(--t22)/1.2 var(--u);font-style:italic;letter-spacing:0;color:var(--ink);margin-top:var(--s2)}
.bp2 .bp-tb .bp-k::before{width:28px;height:10px;background:var(--plot)}
.bp2 .bp-champ::before,.bp2 .bp-champ::after{background:var(--rule);opacity:1}
/* the dimension line, slanted and solid, just under the blue field */
.bp2 .bp-dim{margin-top:var(--s4);font:900 var(--t20)/1.4 var(--u);font-style:italic;letter-spacing:0;text-transform:none;color:var(--ink)}
.bp2 .bp-dim::before{background:var(--rule);border:0}
.bp2 .bp-dim::after{content:"";position:absolute;inset:calc(50% - var(--s2)) 0 auto;height:var(--s4);border-inline:3px solid var(--pick);transform:skewX(var(--slant))}
.bp2 .bp-dim span,:root:not([data-theme="night"]) .bp2 .bp-dim span{background:var(--sd-card)}
:root[data-theme="night"] .bp2 .bp-dim span{background:var(--surface)}
/* the six: giant ghost numbers behind larger sprites */
.bp2 .bp-no{left:0;top:var(--s1);z-index:0;font:900 var(--d96)/1 var(--u);font-style:italic;color:var(--card-giant);-webkit-text-stroke:0}
.bp2 .bp-ring{display:none}
.bp2 .bp-art{height:184px;z-index:1}.bp2 .bp-fig .np-mon{--iw:min(176px,100cqw)}
.bp2 .bp-fig b{font-size:var(--t20)}
.bp2 .bp-base{height:var(--s3);width:92%}
/* the title block: sections split by soft rules, no box */
.bp2 .bp-tb{border:0;border-top:1px solid var(--rule);gap:0 var(--s10)}
.bp2 .bp-right{border-left:1px solid var(--rule)}
.bp2 .bp-left{padding-left:0}.bp2 .bp-right{padding-right:0;padding-left:var(--s10)}
.bp2 .bp .bp-spec .bd-opt{border-bottom:1px solid var(--rule)}
.bp2 .bp-rev{border:0;border-bottom:1px solid var(--rule);clip-path:none}
.bp2 .bp-rev.on{border-bottom-color:transparent;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.bp2 .bp-rl{font-size:var(--t28);color:var(--plot-text)}.bp2 .bp-rev.on .bp-rl{color:inherit}.bp2 .bp-rs{font-size:var(--t28)}
.bp2 .bp-notes li::before{font:900 var(--t15)/1 var(--u);font-style:italic;color:var(--pick-text)}
.bp2 .bp-notes .n{font-size:var(--t28);color:var(--plot-text)}
/* the lower sheets: same plate, soft rules */
.bp2 .bp-ref .bd-win{border-top:1px solid var(--rule)}.bp2 .bp-ref .bd-win[open]{border:1px solid var(--rule)}
.bp2 .bp-wplace{border:0;background:var(--plot);color:var(--on-mark);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.bp2 .bp-parts .bd-cn{color:var(--plot-text);-webkit-text-stroke:0}.bp2 .bp-parts .bd-core{border-bottom-color:var(--rule)}
.bp2 .bd-jump button{border-color:var(--rule)}
.bp2 .bp-ref .bd-wsix>*{width:56px}
@media (max-width:1099.98px){.bp2 .bp-right{border-left:0;border-top:1px solid var(--rule);padding-left:0}.bp2 .bp-left,.bp2 .bp-right{padding-inline:0}}
@media (max-width:699.98px){.bp2 .bp{--k:10px;padding:var(--s4) calc(var(--s3) + var(--k)) var(--s8)}
  .bd-result .bp-line .bp-kind{font-size:var(--t15)}.bd-result .bp-line{font-size:var(--t13)}.bd-result .bp-plate{font-size:var(--t20)}
  .bd-result .bp .bp-score>b{font-size:var(--d96)}.bp2 .bp-stamp{font-size:var(--t20);padding:var(--s1) var(--s3);white-space:nowrap}
  .bp2 .bp-no{font-size:var(--d64)}.bp2 .bp-art{height:128px}.bp2 .bp-fig .np-mon{--iw:min(128px,100cqw)}.bp2 .bp-fig b{font-size:var(--t17)}
  .bp2 .bp-tb .bp-k{font-size:var(--t17)}.bp2 .bp-notes .n{font-size:var(--t22)}.bp2 .bp-dim{font-size:var(--t17)}.bp2 .bp-ref .bd-wsix>*{width:44px}}
@media (max-width:459.98px){.bd-result .bp .bp-score>b{font-size:var(--d64)}}

/* the page before a build: the options on a blue slanted plate (the sheet's blue field, waiting), larger Recent Winner sprites */
.bd2:not(.bp2)>.bd-opts{--k:16px;position:relative;isolation:isolate;border:0;padding:var(--s5) calc(var(--s6) + var(--k))}
.bd2:not(.bp2)>.bd-opts::before,.bd2:not(.bp2)>.bd-opts::after{content:"";position:absolute;inset:0;clip-path:polygon(var(--k) 0,100% 0,calc(100% - var(--k)) 100%,0 100%);pointer-events:none}
.bd2:not(.bp2)>.bd-opts::before{z-index:-1;background:var(--sd-hero)}
.bd2:not(.bp2)>.bd-opts::after{z-index:-2;background:var(--sd-card-shade);translate:var(--s2) var(--s2)}
:root[data-theme="night"] .bd2:not(.bp2)>.bd-opts::after{background:var(--sd-feat-rim);inset:-1px;translate:none}
.bd2:not(.bp2)>.bd-opts .bd-lab,.bd2:not(.bp2)>.bd-opts .bd-lab span{color:var(--sd-on-band)}
.bd2:not(.bp2)>.bd-opts .np-field{background:var(--sd-card);color:var(--sd-card-ink)}
.bd2:not(.bp2) .bd-wins .bd-wsix>*{width:72px}
@media (max-width:699.98px){.bd2:not(.bp2)>.bd-opts{--k:8px;margin-inline:var(--s1);padding:var(--s4) calc(var(--s2) + var(--k))}}
@media (max-width:519.98px){.bd2:not(.bp2) .bd-wsix>*{width:44px}}
/* phones: the band word sits beside the score when it fits (it wraps under it only when it doesn't) */
@media (max-width:459.98px){.bd-result .bp .bp-score .w{flex:1 1 140px;min-width:min-content}}
```
JS (B only):
```js
(() => { /* B: the blue field runs to just under the score block (in the real build: a CSS variable set by build-sheet.js, or a wrapper) */
  const bp = document.querySelector('.bd-result .bp'), t = bp && bp.querySelector('.bp-top'); if (!t) return;
  const set = () => bp.style.setProperty('--hdr', (t.offsetTop + t.offsetHeight + 24) + 'px'); set();
  if (!window.__q81r) { window.__q81r = 1; addEventListener('resize', () => { const b = document.querySelector('.bd-result .bp'), u = b && b.querySelector('.bp-top'); if (u) b.style.setProperty('--hdr', (u.offsetTop + u.offsetHeight + 24) + 'px'); }); } })();
```
